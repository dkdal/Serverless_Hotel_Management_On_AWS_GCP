import functions_framework
import firebase_admin
from firebase_admin import credentials, firestore
from flask import jsonify, request

# Initialize the Firebase Admin SDK
cred = credentials.ApplicationDefault()
firebase_admin.initialize_app(cred)
db = firestore.client()

@functions_framework.http
def hello_http(request):
    """HTTP Cloud Function to fetch all entries from feedbackResponse collection.
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

    if request.method != 'GET':
        return response, 405

    try:
        # Fetch all entries from the feedbackResponse collection
        feedback_ref = db.collection('feedbackresponse')
        feedback_entries = feedback_ref.stream()

        feedback_list = []
        for entry in feedback_entries:
            feedback_list.append(entry.to_dict())

        response = jsonify(feedback_list)
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
