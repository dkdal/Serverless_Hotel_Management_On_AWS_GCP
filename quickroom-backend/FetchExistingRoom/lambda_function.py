import json
import boto3
from decimal import Decimal
from botocore.exceptions import ClientError

# Initialize the DynamoDB client
dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('RoomManagement')

class DecimalEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, Decimal):
            return float(obj)  # or str(obj) if you prefer to serialize as strings
        return super(DecimalEncoder, self).default(obj)
        
def lambda_handler(event, context):
    RoomNo = event.get('RoomNo')
    if not RoomNo:
        return {
            'statusCode': 400,
            'body': json.dumps('Room Number is required')
        }

    try:
        # Fetch the item from DynamoDB
        response = table.get_item(Key={'RoomNo': RoomNo})
        item = response.get('Item')

        if not item:
            return {
                'statusCode': 404,
                'body': json.dumps('Room Number does not exist. Feel free to create one!')
            }

        # Extract the required fields
        room_info = {
            'RoomNo': item.get('RoomNo'),
            'RoomType': item.get('RoomType'),
            'Status': item.get('Status'),
            'MaxGuests': item.get('MaxGuests'),
            'PricePerNight': item.get('PricePerNight'),
            'Discount': item.get('Discount'),
            'PriceAfterDiscount': item.get('PriceAfterDiscount'),
            'Amenities': item.get('Amenities')
        }

        return {
            'statusCode': 200,
            'room_info': room_info  # Include the room_info directly
        }

    except ClientError as e:
        return {
            'statusCode': 500,
            'body': json.dumps(f"Error fetching room details: {e.response['Error']['Message']}")
        }