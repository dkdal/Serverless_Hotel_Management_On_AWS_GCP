import json
import boto3
from botocore.exceptions import ClientError

# Initialize a DynamoDB client
dynamodb = boto3.client('dynamodb')

def lambda_handler(event, context):
    # Table name
    table_name = 'Reservations'
    
    # Extract details from the event
    booking_id = event["BookingID"]
    
    update_expression = "SET "
    expression_attribute_values = {}
    expression_attribute_names = {}

    if "CheckInDate" in event:
        update_expression += "#CID = :cid, "
        expression_attribute_values[":cid"] = {"S": event["CheckInDate"]}
        expression_attribute_names["#CID"] = "CheckInDate"
        
    if "CheckOutDate" in event:
        update_expression += "#COD = :cod, "
        expression_attribute_values[":cod"] = {"S": event["CheckOutDate"]}
        expression_attribute_names["#COD"] = "CheckOutDate"
    
    if "Currency" in event:
        update_expression += "#CUR = :cur, "
        expression_attribute_values[":cur"] = {"S": event["Currency"]}
        expression_attribute_names["#CUR"] = "Currency"
    
    if "FirstName" in event:
        update_expression += "#FN = :fn, "
        expression_attribute_values[":fn"] = {"S": event["FirstName"]}
        expression_attribute_names["#FN"] = "FirstName"
    
    if "LastName" in event:
        update_expression += "#LN = :ln, "
        expression_attribute_values[":ln"] = {"S": event["LastName"]}
        expression_attribute_names["#LN"] = "LastName"
    
    if "RoomNumber" in event:
        update_expression += "#RN = :rn, "
        expression_attribute_values[":rn"] = {"N": event["RoomNumber"]}
        expression_attribute_names["#RN"] = "RoomNumber"
    
    if "RoomPricePerDay" in event:
        update_expression += "#RPPD = :rppd, "
        expression_attribute_values[":rppd"] = {"N": event["RoomPricePerDay"]}
        expression_attribute_names["#RPPD"] = "RoomPricePerDay"
    
    if "RoomType" in event:
        update_expression += "#RT = :rt, "
        expression_attribute_values[":rt"] = {"S": event["RoomType"]}
        expression_attribute_names["#RT"] = "RoomType"
    
    if "TotalGuests" in event:
        update_expression += "#TG = :tg, "
        expression_attribute_values[":tg"] = {"N": event["TotalGuests"]}
        expression_attribute_names["#TG"] = "TotalGuests"
    
    if "TotalNights" in event:
        update_expression += "#TN = :tn, "
        expression_attribute_values[":tn"] = {"N": event["TotalNights"]}
        expression_attribute_names["#TN"] = "TotalNights"
    
    if "TotalPrice" in event:
        update_expression += "#TP = :tp, "
        expression_attribute_values[":tp"] = {"S": event["TotalPrice"]}
        expression_attribute_names["#TP"] = "TotalPrice"
    
    # Remove trailing comma and space
    update_expression = update_expression.rstrip(", ")

    try:
        # Update the reservation item in the DynamoDB table
        response = dynamodb.update_item(
            TableName=table_name,
            Key={
                'BookingID': {'S': booking_id}
            },
            UpdateExpression=update_expression,
            ExpressionAttributeValues=expression_attribute_values,
            ExpressionAttributeNames=expression_attribute_names,
            ReturnValues="UPDATED_NEW"
        )
        return {
            'statusCode': 200,
            'body': json.dumps('Reservation successfully updated')
        }
    except ClientError as e:
        return {
            'statusCode': 500,
            'body': json.dumps(f"Error updating reservation: {e.response['Error']['Message']}")
        }