import functions_framework
import requests
import os
from flask import jsonify, make_response, request

API_KEY = ""

def categorize_sentiment(score):
    """Categorize sentiment score."""
    if score >= 0.8:
        return "very positive"
    elif score >= 0.4:
        return "positive"
    elif score >= -0.4:
        return "neutral"
    elif score >= -0.8:
        return "negative"
    else:
        return "very negative"


@functions_framework.http
def hello_http(request):
    """HTTP Cloud Function.
    Args:
        request (flask.Request): The request object.
        <https://flask.palletsprojects.com/en/1.1.x/api/#incoming-request-data>
    Returns:
        The response text, or any set of values that can be turned into a
        Response object using `make_response`
        <https://flask.palletsprojects.com/en/1.1.x/api/#flask.make_response>.
    """
    request_json = request.get_json(silent=True)
    request_args = request.args

    if request_json and 'text' in request_json and 'rating' in request_json:
        text = request_json['text']
        user_rating = request_json['rating']
    elif request_args and 'text' in request_args and 'rating' in request_args:
        text = request_args['text']
        user_rating = request_args['rating']
    else:
        response = make_response(jsonify({'error': 'Please provide text and rating in the request body or as query parameters'}), 400)
        response.headers.set('Access-Control-Allow-Origin', '*')
        response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        response.headers.set('Access-Control-Allow-Headers', 'Content-Type')
        return response

    try:
        user_rating = float(user_rating)
        if not 0 <= user_rating <= 5:
            raise ValueError("User rating must be between 0 and 5")
    except ValueError as e:
        response = make_response(jsonify({'error': str(e)}), 400)
        response.headers.set('Access-Control-Allow-Origin', '*')
        response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        response.headers.set('Access-Control-Allow-Headers', 'Content-Type')
        return response

    payload = {
        "document": {
            "type": "PLAIN_TEXT",
            "content": text
        },
        "encodingType": "UTF8"
    }

    url = f"https://language.googleapis.com/v1/documents:analyzeSentiment?key={API_KEY}"
    headers = {'Content-Type': 'application/json'}
    response = requests.post(url, headers=headers, json=payload)
    
    if response.status_code != 200:
        response = make_response(jsonify({'error': 'Failed to analyze sentiment', 'details': response.text}), 500)
        response.headers.set('Access-Control-Allow-Origin', '*')
        response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        response.headers.set('Access-Control-Allow-Headers', 'Content-Type')
        return response

    sentiment_data = response.json()
    document_sentiment = sentiment_data.get('documentSentiment', {})
    sentiment_score = document_sentiment.get('score', 0)
    sentiment_category = categorize_sentiment(sentiment_score)

    sentiment_score_out_of_5 = sentiment_score * 5
    total_review_score = 0.6 * user_rating + 0.4 * sentiment_score_out_of_5

    result = {
        'user_rating': user_rating,
        'sentiment_score': sentiment_score_out_of_5,
        'total_review_score': total_review_score,
        'sentiment_category': sentiment_category,
        'document_sentiment': document_sentiment,
        'language': sentiment_data.get('language', 'unknown'),
        'sentences': sentiment_data.get('sentences', [])
    }

    response = make_response(jsonify(result))
    response.headers.set('Access-Control-Allow-Origin', '*')
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type')
    return response