import json
from google.cloud import firestore

def get_messages(request):
    try:
        # Define CORS headers
        headers = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        }

        # Handle preflight OPTIONS requests
        if request.method == 'OPTIONS':
            return ('', 204, headers)

        # Get user ID and role from query parameters
        user_id = request.args.get('user_id')
        role = request.args.get('role')

        if not user_id:
            return json.dumps({"error": "No user_id provided"}), 400, headers
        
        if not role:
            return json.dumps({"error": "No role provided"}), 400, headers

        # Initialize Firestore client
        db = firestore.Client()

        # Reference the user document
        user_ref = db.collection('messages').document(user_id)
        user_doc = user_ref.get()

        if user_doc.exists:
            user_data = user_doc.to_dict()
            if role == 'user':
                messages = user_data.get('user_messages', [])
            elif role == 'agent':
                messages = user_data.get('agent_messages', [])
            else:
                return json.dumps({"error": "Invalid role provided"}), 400, headers

            return json.dumps({"messages": messages}), 200, headers
        else:
            return json.dumps({"error": "User with ID does not exist"}), 404, headers

    except Exception as e:
        return json.dumps({"error": str(e)}), 500, headers
