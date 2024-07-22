import boto3
from botocore.exceptions import ClientError
import json
import decimal

class DecimalEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, decimal.Decimal):
            return float(obj)
        return super(DecimalEncoder, self).default(obj)

dynamodb = boto3.resource('dynamodb')
agent_table = dynamodb.Table('agents')
user_table = dynamodb.Table('customers')

def lambda_handler(event, context):
    # Parse request parameters
    body = json.loads(event['body'])
    email = body['email']
    role = body['role']

    try:
        if role == 'agent':
            response = agent_table.get_item(Key={'email': email})
        elif role == 'customer':
            response = user_table.get_item(Key={'email': email})
        else:
            return {
                'statusCode': 400,
                'body': json.dumps('Invalid role specified')
            }

        if 'Item' in response:
            item = response['Item']
            return {
                'statusCode': 200,
                'body': json.dumps(item, cls=DecimalEncoder)
            }
        else:
            return {
                'statusCode': 404,
                'body': json.dumps('Item not found')
            }

    except ClientError as e:
        return {
            'statusCode': 500,
            'body': json.dumps(str(e))
        }
