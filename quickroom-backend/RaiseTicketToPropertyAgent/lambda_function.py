import json
import random
import boto3
import urllib.request
from datetime import datetime

# Initialize DynamoDB client
dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('Tickets')

def lambda_handler(event, context):
    user_id = event['userID']
    message = event['message']

    # Step 1: Generate a random 5-digit ticketID
    ticket_id = random.randint(11111, 99999)
    
    # Step 2: Randomly select an agent email from the list
    agent_emails = [
        "instagramtathya@gmail.com",
        "kapadiatathya@gmail.com",
        "kapadiatav@gmail.com"
    ]
    agent_id = random.choice(agent_emails)

    # Step 3: Push data to DynamoDB table
    try:
        table.put_item(Item={
            'ticketID': str(ticket_id),
            'agentID': agent_id,
            'message': message,
            'userID': user_id
        })
    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps(f"Failed to write to DynamoDB: {str(e)}")
        }
        

    # Step 4: Make an API call with the ticket data
    url = "https://us-central1-dalvacation-430004.cloudfunctions.net/trigger-pubsub-with-customer-message"
    payload = {
        'user_id': user_id,
        "role": "user",
        'message': "New Ticket: "+ str(ticket_id) + ". User query: " + message,
        'timestamp': datetime.now().isoformat(timespec='seconds'),
        'agent_id': agent_id
    }
    
    headers = {
        'Content-Type': 'application/json'
    }

    try:
        data = json.dumps(payload).encode('utf-8')
        req = urllib.request.Request(url, data=data, headers=headers, method='POST')
        with urllib.request.urlopen(req) as response:
            response_data = response.read()
    except urllib.error.URLError as e:
        return {
            'statusCode': 500,
            'body': json.dumps(f"Failed to call external API: {e.reason}")
        }
    
    # Step 5: Return the response message
    return {
        'statusCode': 200,
        'body': json.dumps(f"Your ticket with ticketID {ticket_id} is raised and agent {agent_id} will be reaching out to you shortly!")
    }