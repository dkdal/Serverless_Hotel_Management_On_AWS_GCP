import json
import boto3
import os

sns_client = boto3.client('sns')

def lambda_handler(event, context):
    '''
    Sends an email with booking status
    '''
    
    # Get the email and status from the request body
    try:
        body = json.loads(event['body'])
        email = body['email']
        booking_success = body['success']
        
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
        subject, message = '', ''
        if booking_success:
            reference_code = body['reference_code']
            subject = 'Booking successful - DALVacationHome'
            message = ('Your room booking with DALVacationHome was successful!\n'
                        f'Booking reference code: {reference_code}')
        else:
            subject = 'Booking failed - DALVacationHome'
            message = 'Your room booking with DALVacationHome was not successful.'

        response = sns_client.publish(
            TopicArn=topic_arn,
            Subject=subject,
            Message=message,
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
            'body': json.dumps(f'Error sending booking status email: {str(e)}')
        }
    
    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps('Booking status email sent')
    }