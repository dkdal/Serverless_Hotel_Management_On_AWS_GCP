import json
from google.cloud import pubsub_v1

# Initialize Pub/Sub client
publisher = pubsub_v1.PublisherClient()
project_id = 'dalvacation-430004'
topic_id = 'live-chat'
topic_path = publisher.topic_path(project_id, topic_id)

def publish_message(request):
    try:
        # Handle CORS preflight requests
        if request.method == 'OPTIONS':
            return '', 204, {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            }

        # Get JSON payload from the request
        request_json = request.get_json()

        if not request_json or 'message' not in request_json:
            return json.dumps({'error': 'Invalid request payload. Message missing!'}), 400, {
                'Access-Control-Allow-Origin': '*'
            }
        
        if not request_json or 'timestamp' not in request_json:
            return json.dumps({'error': 'Invalid request payload. Message timestamp missing!'}), 400, {
                'Access-Control-Allow-Origin': '*'
            }

        # Prepare the message to be sent to Pub/Sub
        message_data = {
            'user_id': request_json.get('user_id', 'unknown'),
            'agent_id': request_json['agent_id'],
            'role': request_json['role'],
            'message': request_json['message'],
            'timestamp': request_json['timestamp']
        }

        # Publish the message to the Pub/Sub topic
        future = publisher.publish(topic_path, json.dumps(message_data).encode('utf-8'))
        message_id = future.result()

        return json.dumps({'status': 'Message published', 'message_data': message_data}), 200, {
            'Access-Control-Allow-Origin': '*'
        }
    except Exception as e:
        print(f'Error publishing message: {e}')
        return json.dumps({'error': 'Internal server error. Could not trigger pub/sub service'}), 500, {
            'Access-Control-Allow-Origin': '*'
        }
