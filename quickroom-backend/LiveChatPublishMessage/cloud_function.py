import json
from google.cloud import pubsub_v1

# Initialize Pub/Sub client
publisher = pubsub_v1.PublisherClient()
project_id = 'dalvacation-430004'
topic_id = 'live-chat'
topic_path = publisher.topic_path(project_id, topic_id)

def publish_message(request):
    try:
        # Get JSON payload from the request
        request_json = request.get_json()
        
        if not request_json or 'message' not in request_json:
            return json.dumps({'error': 'Invalid request payload'}), 400

        # Prepare the message to be sent to Pub/Sub
        user_message = request_json['message']
        message_data = {
            'user_id': request_json.get('user_id', 'unknown'),
            'message': user_message
        }

        # Publish the message to the Pub/Sub topic
        future = publisher.publish(topic_path, json.dumps(message_data).encode('utf-8'))
        message_id = future.result()

        return json.dumps({'status': 'Message published', 'message_id': message_id}), 200
    except Exception as e:
        print(f'Error publishing message: {e}')
        return json.dumps({'error': 'Internal server error'}), 500
