import json
import boto3
from botocore.exceptions import ClientError

# Initialize a DynamoDB client
dynamodb = boto3.client('dynamodb')

def lambda_handler(event, context):
    # Table name
    table_name = 'Reservations'
    
    # Extract BookingID from the event
    booking_id = event["BookingID"]
    
    try:
        # Delete the reservation item from the DynamoDB table
        response = dynamodb.delete_item(
            TableName=table_name,
            Key={
                'BookingID': {'S': booking_id}
            }
        )
        return {
            'statusCode': 200,
            'body': json.dumps('Reservation successfully deleted')
        }
    except ClientError as e:
        return {
            'statusCode': 500,
            'body': json.dumps(f"Error deleting reservation: {e.response['Error']['Message']}")
        }