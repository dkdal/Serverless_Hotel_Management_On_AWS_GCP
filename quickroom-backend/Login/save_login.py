import boto3

def lambda_handler(event, context):
    client = boto3.client('cognito-idp')
    user_pool_id_1 = 'us-east-1_ws9SY6BSb'  
    user_pool_id_2 = 'us-east-1_X9xaDUA59'  

    # Function to get the number of confirmed users
    def get_confirmed_user_count(user_pool_id):
        paginator = client.get_paginator('list_users')
        page_iterator = paginator.paginate(
            UserPoolId=user_pool_id
        )
        
        user_count = 0
        for page in page_iterator:
            for user in page['Users']:
                # Check if the user is confirmed and has an email attribute
                if user['UserStatus'] == 'CONFIRMED' and any(attr['Name'] == 'email' for attr in user['Attributes']):
                    user_count += 1
        
        return user_count

    try:
        confirmed_user_count_1 = get_confirmed_user_count(user_pool_id_1)
        confirmed_user_count_2 = get_confirmed_user_count(user_pool_id_2)
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',  # Allow all origins
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',  # Allowed methods
                'Access-Control-Allow-Headers': 'Content-Type',  # Allowed headers
            },
            'body': {
                'Customers': confirmed_user_count_1,
                'Agents': confirmed_user_count_2
            }
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
            },
            'body': str(e)
        }
