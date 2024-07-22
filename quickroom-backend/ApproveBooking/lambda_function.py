import json
import boto3
import logging
import urllib3
import uuid
from datetime import datetime

logger = logging.getLogger()
logger.setLevel(logging.INFO)

# Initialize the DynamoDB client
dynamodb_client = boto3.client('dynamodb')

# Initialize HTTP client
http = urllib3.PoolManager()

# Define the SNS endpoint and DynamoDB Table
sns_endpoint = 'https://8hzds97iz5.execute-api.us-east-1.amazonaws.com/prod/notifications/booking'
table_name = 'Bookings'

def check_booking_availability(room_id, start_date, end_date):
    try:
        response = dynamodb_client.scan(
            TableName=table_name,
            FilterExpression="(#room_id = :room_id AND end_date >= :start_date AND start_date <= :end_date) AND #status = :status",
            ExpressionAttributeNames={
                "#room_id": "room_id",
                "#status": "status"
            },
            ExpressionAttributeValues={
                ":room_id": {"S": room_id},
                ":start_date": {"S": start_date},
                ":end_date": {"S": end_date},
                ":status": {"S": "approved"}
            }
        )
        return response['Items']
    except Exception as e:
        logger.error(f"Error checking booking availability: {e}")
        raise e

def send_notification(email, success, reference_code):
    payload = {
        "email": email,
        "success": success,
        "reference_code": reference_code
    }
    encoded_payload = json.dumps(payload).encode('utf-8')
    try:
        response = http.request(
            'POST',
            sns_endpoint,
            body=encoded_payload,
            headers={'Content-Type': 'application/json'}
        )
        logger.info(f"Notification sent successfully: {response.data.decode('utf-8')}")
    except urllib3.exceptions.HTTPError as e:
        logger.error(f"Error sending notification: {e}")

def lambda_handler(event, context):
    logger.info(f"Received event: {json.dumps(event)}")
    
    for record in event['Records']:
        # Parse the message body
        booking_request = json.loads(record['body'])
        logger.info(f"Parsed booking request: {json.dumps(booking_request)}")

        # Extract booking details
        room_id = booking_request['room_id']
        user_id = booking_request['user_id']
        start_date = booking_request['start_date']
        end_date = booking_request['end_date']

        # Generate a unique reference code for the booking
        reference_code = str(uuid.uuid4())

        # Convert dates to datetime objects for comparison
        start_date_obj = datetime.strptime(start_date, '%Y-%m-%d')
        end_date_obj = datetime.strptime(end_date, '%Y-%m-%d')

        # Perform approval checks
        approved = True

        # Check room availability using the new function
        try:
            overlapping_bookings = check_booking_availability(room_id, start_date, end_date)
            if overlapping_bookings:
                approved = False
                logger.info(f"Room {room_id} is not available from {start_date} to {end_date}. Overlapping bookings: {overlapping_bookings}")
            else:
                logger.info(f"Room {room_id} is available from {start_date} to {end_date}.")
        except Exception as e:
            logger.error(f"Error checking room availability: {e}")
            return {
                'statusCode': 500,
                'body': json.dumps(f"Error: {str(e)}")
            }

        # To-Do
        # Check for user existence and access permissions, if applicable

        if approved:
            try:
                # Save the booking to DynamoDB
                response = dynamodb_client.put_item(
                    TableName=table_name,
                    Item={
                        'room_id': {'S': room_id},
                        'user_id': {'S': user_id},
                        'start_date': {'S': start_date},
                        'end_date': {'S': end_date},
                        'status': {'S': 'approved'},
                        'reference_code': {'S': reference_code}
                    }
                )
                logger.info(f"Successfully inserted item: {response}")
                send_notification(email=user_id, success=True, reference_code=reference_code)  # Notify success
            except dynamodb_client.exceptions.ResourceNotFoundException as e:
                logger.error(f"DynamoDB table not found: {e}")
                send_notification(email=user_id, success=False, reference_code=reference_code)  # Notify failure
                return {
                    'statusCode': 500,
                    'body': json.dumps(f"Error: {str(e)}")
                }
            except Exception as e:
                logger.error(f"Unexpected error: {e}")
                send_notification(email=user_id, success=False, reference_code=reference_code)  # Notify failure
                return {
                    'statusCode': 500,
                    'body': json.dumps(f"Error: {str(e)}")
                }
        else:
            try:
                send_notification(email=user_id, success=False, reference_code=reference_code)  # Notify rejection
            except Exception as e:
                logger.error(f"Error sending notification: {e}")

    return {
        'statusCode': 200,
        'body': json.dumps('Booking processed successfully')
    }
