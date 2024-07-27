import json
import boto3
from decimal import Decimal
from botocore.exceptions import ClientError

# Initialize the DynamoDB client
dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('Reservations')

class DecimalEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, Decimal):
            return float(obj)  # or str(obj) if you prefer to serialize as strings
        return super(DecimalEncoder, self).default(obj)
        
def lambda_handler(event, context):
    # Extract BookingID from the event
    booking_id = event.get('BookingID')
    if not booking_id:
        return {
            'statusCode': 400,
            'body': json.dumps('BookingID is required')
        }

    try:
        # Fetch the item from DynamoDB
        response = table.get_item(Key={'BookingID': booking_id})
        item = response.get('Item')

        if not item:
            return {
                'statusCode': 404,
                'body': json.dumps('Reservation not found')
            }

        # Extract the required fields
        reservation_info = {
            'CheckInDate': item.get('CheckInDate'),
            'CheckOutDate': item.get('CheckOutDate'),
            'FirstName': item.get('FirstName'),
            'LastName': item.get('LastName'),
            'RoomNumber': item.get('RoomNumber'),
            'Currency': item.get('Currency'),
            'RoomPricePerDay': item.get('RoomPricePerDay'),
            'RoomType': item.get('RoomType'),
            'TotalGuests': item.get('TotalGuests'),
            'TotalNights': item.get('TotalNights'),
            'TotalPrice': item.get('TotalPrice')
        }

        return {
            'statusCode': 200,
            'reservation': reservation_info  # Include the reservation_info directly
        }

    except ClientError as e:
        return {
            'statusCode': 500,
            'body': json.dumps(f"Error fetching reservation: {e.response['Error']['Message']}")
        }