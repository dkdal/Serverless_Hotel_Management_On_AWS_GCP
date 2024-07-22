import json
import boto3
from botocore.exceptions import ClientError

# Initialize the DynamoDB resource
dynamodb = boto3.resource('dynamodb')

# Table names
CUSTOMERS_TABLE = 'customers'
AGENTS_TABLE = 'agents'

def lambda_handler(event, context):
    try:
        # Parse the input
        body = json.loads(event['body'])
        email = body['email']
        first_name = body['firstName']
        last_name = body['lastName']
        role = body['role']  # 'customer' or 'agent'
        question = body['question']
        answer = body['answer']
        cipher_key = body['cipher_key']
        
        # Determine the table based on the role
        table_name = CUSTOMERS_TABLE if role == 'customer' else AGENTS_TABLE
        table = dynamodb.Table(table_name)
        
        # Construct the item to be stored
        item = {
            'email': email,
            'firstName': first_name,
            'lastName': last_name,
            'question': question,
            'answer': answer,
            'cipher_key': cipher_key
        }
        
        # Store the item in the DynamoDB table
        table.put_item(Item=item)
        
        return {
            'statusCode': 200,
            'body': json.dumps({'message': 'User details stored successfully'})
        }
        
    except ClientError as e:
        print(e.response['Error']['Message'])
        return {
            'statusCode': 500,
            'body': json.dumps({'message': 'Error storing user details', 'error': e.response['Error']['Message']})
        }
    except Exception as e:
        print(e)
        return {
            'statusCode': 500,
            'body': json.dumps({'message': 'Error processing request', 'error': str(e)})
        }

