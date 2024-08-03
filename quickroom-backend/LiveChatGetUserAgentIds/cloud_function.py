import json
from google.cloud import firestore

def get_user_agent_ids(request):
    # Handle CORS preflight requests
    if request.method == 'OPTIONS':
        return '', 204, {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
        }

    try:
        # Parse JSON payload from the request
        request_json = request.get_json()
        role = request_json.get('role')
        
        if role == 'agent':
            agent_id = request_json.get('role_id')
            if not agent_id:
                return json.dumps({'error': 'agent_id is required for role "agent"!'}), 400, {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'POST, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type'
                }
        elif role == 'user':
            user_id = request_json.get('role_id')
            if not user_id:
                return json.dumps({'error': 'user_id is required for role "user"!'}), 400, {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'POST, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type'
                }
        else:
            return json.dumps({'error': 'Invalid role provided'}), 400, {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            }

        # Initialize Firestore client
        db = firestore.Client()

        # Initialize result
        ids = {}

        if role == 'agent':
            # Query documents to find one with the matching agent_id
            messages_ref = db.collection('messages')
            query = messages_ref.where('agent_id', '==', agent_id).limit(1)
            results = query.stream()

            user_document = None
            for doc in results:
                user_document = doc
                break

            if user_document:
                user_id = user_document.id
                ids['user_id'] = user_id,
                ids['agent_id'] = agent_id
            else:
                return json.dumps({'error': 'No user found for the given agent_id'}), 404, {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'POST, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type'
                }

        elif role == 'user':
            # Fetch the document by user_id
            user_ref = db.collection('messages').document(user_id)
            user_doc = user_ref.get()

            if user_doc.exists:
                user_data = user_doc.to_dict()
                ids['user_id'] = user_id,
                ids['agent_id'] = user_data.get('agent_id', 'unknown')
            else:
                return json.dumps({'error': 'User with the provided ID does not exist'}), 404, {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'POST, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type'
                }

        return json.dumps(ids), 200, {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
        }

    except Exception as e:
        print(f'Error fetching related IDs: {e}')
        return json.dumps({'error': 'Internal server error. Could not fetch related IDs'}), 500, {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
        }

