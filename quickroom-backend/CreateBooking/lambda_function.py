import json
import boto3

sqs_client = boto3.client('sqs')
queue_url = 'https://sqs.us-east-1.amazonaws.com/761577439658/Booking'

def send_booking_request(room_id, user_id, start_date, end_date):
    booking_request = {
        'room_id': room_id,
        'user_id': user_id,
        'start_date': start_date,
        'end_date': end_date
    }

    response = sqs_client.send_message(
        QueueUrl=queue_url,
        MessageBody=json.dumps(booking_request)
    )

    return response

def lambda_handler(event, context):
    try:
        print(f"Received event: {json.dumps(event)}")
        room_id = event['room_id']
        user_id = event['user_id']
        start_date = event['start_date']
        end_date = event['end_date']
        
        response = send_booking_request(room_id, user_id, start_date, end_date)
        
        return {
            'statusCode': 200,
            'body': json.dumps({'message': 'Booking request sent to SQS', 'response': response})
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }

