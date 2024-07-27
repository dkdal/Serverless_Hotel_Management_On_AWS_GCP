import json
import boto3
from botocore.exceptions import ClientError

# Initialize a DynamoDB client
dynamodb = boto3.client('dynamodb')

def lambda_handler(event, context):
    # Table name
    table_name = 'RoomManagement'
    
    # Extract details from the event
    room = {
        "RoomNo": {
            "N": event["RoomNo"]
        },
        "RoomType": {
            "S": event["RoomType"]
        },
        "Status": {
            "S": event["Status"]
        },
        "MaxGuests": {
            "N": event["MaxGuests"]
        },
        "PricePerNight": {
            "N": event["PricePerNight"]
        },
        "Discount": {
            "N": event["Discount"]
        },
        "PriceAfterDiscount": {
            "N": event["PriceAfterDiscount"]
        },
        "Amenities": {
            "S": event["Amenities"]
        }
    }
    
    try:
        # Put the reservation item into the DynamoDB table
        response = dynamodb.put_item(
            TableName=table_name,
            Item=room
        )
        return {
            'statusCode': 200,
            'body': json.dumps('Room added successfully')
        }
    except ClientError as e:
        return {
            'statusCode': 500,
            'body': json.dumps(f"Error creating reservation: {e.response['Error']['Message']}")
        }