import json
import boto3
from decimal import Decimal
from botocore.exceptions import ClientError

# Initialize the DynamoDB client
dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('AvailableRooms')

class DecimalEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, Decimal):
            return float(obj)  # or str(obj) if you prefer to serialize as strings
        return super(DecimalEncoder, self).default(obj)

def clean_room_type(room_type):
    clean_values = ['King', 'Double', 'Corporate', 'Single', 'Presidential', 'VIP', 'Penthouse', 'Queen']
    
    # Iterate over clean values and check if any of them are in the room_type input
    for clean_value in clean_values:
        if clean_value.lower() in room_type.lower():
            return clean_value
    return None

def lambda_handler(event, context):
    # Extract room_type from the event
    room_type = event.get('RoomType')
    
    if not room_type:
        return {
            'statusCode': 400,
            'body': json.dumps('RoomType is required')
        }

    # Clean the room_type input
    clean_room_type_value = clean_room_type(room_type)
    
    if not clean_room_type_value:
        return {
            'statusCode': 400,
            'body': json.dumps('Invalid RoomType. Please enter one of the following available Rooms: \n Single Room \n Double Room \n Queen Room \n King Room \n Corporate Suite \n VIP Suite \n Presidential Suite \n Penthouse')
        }

    try:
        # Fetch the item from DynamoDB
        response = table.get_item(Key={'RoomType': clean_room_type_value})
        item = response.get('Item')

        if not item:
            return {
                'statusCode': 404,
                'body': json.dumps('RoomType not found. Please enter one of the following available Rooms: \n Single Room \n Double Room \n Queen Room \n King Room \n Corporate Suite \n VIP Suite \n Presidential Suite \n Penthouse')
            }

        # Extract the required fields
        available_rooms = {
            'RoomType': item.get('RoomType'),
            'Available': item.get('Available'),
            'MaxGuests': item.get('MaxGuests'),
            'PricePerNight': item.get('PricePerNight')
        }

        return {
            'statusCode': 200,
            'available_rooms': available_rooms  # Include the available_rooms directly
        }

    except ClientError as e:
        return {
            'statusCode': 500,
            'body': json.dumps(f"Error fetching reservation: {e.response['Error']['Message']}")
        }