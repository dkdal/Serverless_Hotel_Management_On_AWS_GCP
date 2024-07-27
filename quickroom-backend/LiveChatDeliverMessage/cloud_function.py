import base64
import json
from google.cloud import firestore

def pubsub_to_user(event, context):
    # Decode the Pub/Sub message
    pubsub_message = base64.b64decode(event['data']).decode('utf-8')
    message_data = json.loads(pubsub_message)
    
    # Extract user ID from the message
    user_id = message_data.get('user_id')
    agent_id = message_data.get('agent_id')
    role = message_data.get('role')
    message = message_data.get('message')
    timestamp = message_data.get('timestamp')
    
    if not user_id:
        print("No user_id found in the message")
        return

    if not user_id:
        print("No user_id found in the message")
        return

    if not role:
        print("No role found in the message")
        return
    
    if not message:
        print("No message found in the message")
        return

    if not timestamp:
        print("No timestamp found in the message")
        return


    # Initialize Firestore client
    db = firestore.Client()
    
    # Reference the user document
    user_ref = db.collection('messages').document(user_id)
    user_doc = user_ref.get()

    if role == 'user':
        user_message_object = {
            'message': message,
            'timestamp': timestamp
        }
        if user_doc.exists:
            user_data = user_doc.to_dict()
            user_ref.update({
                'agent_id': agent_id,
                'user_messages': firestore.ArrayUnion([user_message_object])
            })
            print(f"Delivered message to user {user_id}: {message_data}")
        else:
            print(f"User with ID {user_id} does not exist.")
    elif role == 'agent':
        agent_message_object = {
            'message': message,
            'timestamp': timestamp
        }
        if user_doc.exists:
            user_data = user_doc.to_dict()
            user_ref.update({
                'agent_id': agent_id,
                'agent_messages': firestore.ArrayUnion([agent_message_object])
            })
            print(f"Delivered message: {message_data}")
        else:
            print(f"User with ID {user_id} does not exist.")
