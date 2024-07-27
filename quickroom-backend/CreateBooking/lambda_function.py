import json
import boto3

sqs_client = boto3.client('sqs')
queue_url = 'https://sqs.us-east-1.amazonaws.com/761577439658/Booking'

def send_booking_request(user_id, booking_id, first_name, last_name, room_number, room_type, amenities, total_guest, total_night, currency, room_price, discount, total_price, check_in_date, check_out_date):
    booking_request = {
        'user_id': user_id,  # Added user_id
        'booking_id': booking_id,
        'first_name': first_name,
        'last_name': last_name,
        'room_number': room_number,
        'room_type': room_type,
        'amenities': amenities,
        'total_guest': total_guest,
        'total_night': total_night,
        'currency': currency,
        'room_price': room_price,
        'discount': discount,
        'total_price': total_price,
        'check_in_date': check_in_date,
        'check_out_date': check_out_date
    }

    response = sqs_client.send_message(
        QueueUrl=queue_url,
        MessageBody=json.dumps(booking_request)
    )

    return response

def lambda_handler(event, context):
    try:
        print(f"Received event: {json.dumps(event)}")
        
        # Extract all fields from the event
        user_id = event['user_id']  # Added user_id
        booking_id = event['booking_id']
        first_name = event['first_name']
        last_name = event['last_name']
        room_number = event['room_number']
        room_type = event['room_type']
        amenities = event['amenities']
        total_guest = event['total_guest']
        total_night = event['total_night']
        currency = event['currency']
        room_price = event['room_price']
        discount = event['discount']
        total_price = event['total_price']
        check_in_date = event['check_in_date']
        check_out_date = event['check_out_date']
        
        response = send_booking_request(
            user_id, booking_id, first_name, last_name, room_number, room_type, amenities, total_guest, total_night, currency, room_price, discount, total_price, check_in_date, check_out_date
        )
        
        return {
            'statusCode': 200,
            'body': json.dumps({'message': 'Booking request sent to SQS', 'response': response})
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }
