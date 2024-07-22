import functions_framework
import firebase_admin
from firebase_admin import credentials, firestore
from flask import jsonify, request
import requests
from google.cloud import bigquery

# Initialize the Firebase Admin SDK
cred = credentials.ApplicationDefault()
firebase_admin.initialize_app(cred)
db = firestore.client()

# Initialize BigQuery client
bq_client = bigquery.Client()

@functions_framework.http
def hello_http(request):
    """HTTP Cloud Function to handle feedback form submissions.
    Args:
        request (flask.Request): The request object.
    Returns:
        The response text, or any set of values that can be turned into a
        Response object using `make_response`.
    """
    response = jsonify({'error': 'Method not allowed'})
    response.headers.set('Access-Control-Allow-Origin', '*')
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type')

    if request.method == 'OPTIONS':
        # Preflight request handling
        return response, 204

    request_json = request.get_json(silent=True)

    required_fields = [
        'bookingCode', 'fullName', 'roomType', 'numberOfGuests',
        'roomPrice', 'roomNumber', 'rating', 'comment', 'totalNights'
    ]

    if not all(field in request_json for field in required_fields):
        response = jsonify({'error': 'Missing required fields'})
        response.headers.set('Access-Control-Allow-Origin', '*')
        response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        response.headers.set('Access-Control-Allow-Headers', 'Content-Type')
        return response, 400

    try:
        # Extract the data from the request
        feedback_data = {field: request_json[field] for field in required_fields}

        # Make an API call to the sentiment analysis service
        sentiment_payload = {
            'text': feedback_data['comment'],
            'rating': feedback_data['rating']
        }
        sentiment_response = requests.post(
            'https://us-central1-sharp-avatar-428014-f8.cloudfunctions.net/sentiment-analysis',
            json=sentiment_payload
        )

        if sentiment_response.status_code != 200:
            raise Exception('Error in sentiment analysis API call')

        sentiment_data = sentiment_response.json()
        feedback_data['sentiment_category'] = sentiment_data['sentiment_category']
        feedback_data['sentiment_score'] = sentiment_data['sentiment_score']

        # Save the feedback data to Firestore
        db.collection('feedbackresponse').add(feedback_data)

        # Define the BigQuery table name
        bq_table_id = 'sharp-avatar-428014-f8.feedbackstore.allfeedbacks'

        # Prepare BigQuery data
        bq_row = {
            'bookingCode': feedback_data['bookingCode'],
            'comment': feedback_data['comment'],
            'fullName': feedback_data['fullName'],
            'numberOfGuests': feedback_data['numberOfGuests'],
            'rating': feedback_data['rating'],
            'roomNumber': feedback_data['roomNumber'],
            'roomPrice': feedback_data['roomPrice'],
            'roomType': feedback_data['roomType'],
            'sentiment_category': feedback_data['sentiment_category'],
            'sentiment_score': feedback_data['sentiment_score'],
            'totalNights': feedback_data['totalNights']
        }

        # Insert data into BigQuery
        errors = bq_client.insert_rows_json(bq_table_id, [bq_row])
        if errors:
            raise Exception(f'Error inserting data into BigQuery: {errors}')

        response = jsonify({'message': 'Feedback submitted successfully'})
        response.headers.set('Access-Control-Allow-Origin', '*')
        response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        response.headers.set('Access-Control-Allow-Headers', 'Content-Type')
        return response, 200

    except Exception as e:
        response = jsonify({'error': str(e)})
        response.headers.set('Access-Control-Allow-Origin', '*')
        response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        response.headers.set('Access-Control-Allow-Headers', 'Content-Type')
        return response, 500
