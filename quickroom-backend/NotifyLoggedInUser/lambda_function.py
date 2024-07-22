import json
import boto3
import os

sns_client = boto3.client('sns')

def lambda_handler(event, context):
    '''
    Sends an email after a user logs in
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
            'body': json.dumps('Email not found')
        }
        
    # Get the SNS topic
    try:
        tokens = email.split('@')
        user_name = tokens[0]
        
        remaining_tokens = tokens[1].split('.')
        mail_server, domain = remaining_tokens[0], remaining_tokens[1]
        
        topic_name = f'user_{user_name}_at_{mail_server}_dot_{domain}'
        
        response = sns_client.list_topics()
        topics = response['Topics']
        
        topic_arn = None
        for topic in topics:
            if topic_name in topic['TopicArn']:
                topic_arn = topic['TopicArn']
                break
        
        if not topic_arn:
            raise Exception(f'Topic {topic_name} not found')
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps(f'Error getting SNS topic: {str(e)}')
        }

    
    # Send email using SNS
    try:
        response = sns_client.publish(
            TopicArn=topic_arn,
            Subject='Login successful - DALVacationHome',
            Message= 'You have successfully logged in to DALVacationHome.',
            MessageAttributes={
                'email': {
                    'DataType': 'String',
                    'StringValue': email
                }
            }
        )
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps(f'Error sending login email: {str(e)}')
        }
    
    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps('Login email sent successfully')
    }