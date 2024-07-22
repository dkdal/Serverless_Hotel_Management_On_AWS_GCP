import base64
import json

# Sample message
message = {
    "user_id": "123456",
    "message": "Message content"
}

# Convert the message to JSON and encode it
message_str = json.dumps(message)
encoded_message = base64.b64encode(message_str.encode('utf-8')).decode('utf-8')

print(encoded_message)
