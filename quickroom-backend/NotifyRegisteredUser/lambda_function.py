import json
import boto3
import os

sns_client = boto3.client('sns')

def lambda_handler(event, context):
    '''
    Sends an email to a newly registered user
    '''
    
    # Get the email from the request body
    try:
        body = json.loads(event['body'])
        email = body['email']
    except (KeyError, json.JSONDecodeError) as e:
        return {
            'statusCode': 400,
             'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
              },
            'body': json.dumps(f'Email not found: {str(e)}')
        }
    
    # Create SNS topic
    try:
        tokens = email.split('@')

        # Remove special characters from email username
        # Code borrowed from 
        # https://stackoverflow.com/questions/5843518/remove-all-special-characters-punctuation-and-spaces-from-string
        user_name = ''.join(c for c in tokens[0] if c.isalnum())
        
        remaining_tokens = tokens[1].split('.')
        mail_server, domain = remaining_tokens[0], remaining_tokens[1]
        
        response = sns_client.create_topic(
            Name=f'user_{user_name}_at_{mail_server}_dot_{domain}')
        topic_arn = response['TopicArn']
    except Exception as e:
        return {
            'statusCode': 500,
             'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
              },
            'body': json.dumps(f'Error creating SNS topic: {str(e)}')
        }
    
    # Subscribe email to the SNS topic
    try:
        sns_client.subscribe(
            TopicArn=topic_arn,
            Protocol='email',
            Endpoint=email
        )
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
              },
            'body': json.dumps(f'Error subscribing email: {str(e)}')
        }
    
    return {
        'statusCode': 200,
        'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
              },
        'body': json.dumps('Registration email sent successfully')
    }
    