import base64
import json
from google.cloud import firestore

def pubsub_to_user(event, context):
    # Decode the Pub/Sub message
    pubsub_message = base64.b64decode(event['data']).decode('utf-8')
    message_data = json.loads(pubsub_message)
    
    # Extract user ID from the message
    user_id = message_data.get('user_id')
    
    if not user_id:
        print("No user_id found in the message")
        return

    # Initialize Firestore client
    db = firestore.Client()
    
    # Reference the user document
    user_ref = db.collection('users').document(user_id)
    user_doc = user_ref.get()

    if user_doc.exists:
        user_data = user_doc.to_dict()
        user_ref.update({
            'messages': firestore.ArrayUnion([message_data])
        })
        print(f"Delivered message to user {user_id}: {message_data}")
    else:
        print(f"User with ID {user_id} does not exist.")
