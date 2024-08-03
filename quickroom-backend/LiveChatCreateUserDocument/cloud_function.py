import json
from google.cloud import firestore

def create_user_document(request):
    # Handle the CORS preflight request
    if request.method == 'OPTIONS':
        headers = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
        }
        return ('', 204, headers)

    headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
    }

    try:
        # Initialize Firestore client
        db = firestore.Client()

        # Parse the request payload
        request_json = request.get_json(silent=True)

        if request_json and 'user_id' in request_json and 'agent_id' in request_json:
            user_id = request_json['user_id']
            agent_id = request_json['agent_id']
        else:
            return (json.dumps('Missing user_id or agent_id in request'), 400, headers)

        # Reference to the document in the collection
        doc_ref = db.collection('messages').document(user_id)
        doc = doc_ref.get()

        if not doc.exists:
            # Document does not exist, create it and add agent_id field
            doc_ref.set({
                'agent_id': agent_id
            })
            response_body = f'Document for user_id {user_id} created and agent_id {agent_id} added.'
        else:
            response_body = f'Document for user_id {user_id} already exists.'

        return (json.dumps(response_body), 200, headers)

    except Exception as e:
        error_message = f"An error occurred: {str(e)}"
        return (json.dumps(error_message), 500, headers)

