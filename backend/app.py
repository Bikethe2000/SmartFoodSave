import os
import json
from pathlib import Path
from functools import wraps
from datetime import datetime

import requests
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

# Firebase Admin SDK
import firebase_admin
from firebase_admin import credentials, firestore, auth

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

PORT = int(os.getenv('PORT', 5000))
FIREBASE_API_KEY = os.getenv('FIREBASE_API_KEY')

db = None


def initialize_firebase():
    """Initialize Firebase Admin SDK"""
    global db
    
    try:
        # Try loading from service account file
        service_account_path = os.getenv('FIREBASE_SERVICE_ACCOUNT_PATH')
        
        if service_account_path:
            # Handle both absolute and relative paths
            if not os.path.isabs(service_account_path):
                service_account_path = os.path.join(os.path.dirname(__file__), '..', service_account_path)
            
            with open(service_account_path, 'r') as f:
                service_account = json.load(f)
            
            cred = credentials.Certificate(service_account)
            firebase_admin.initialize_app(cred)
        
        # Try loading from environment variables
        elif (os.getenv('FIREBASE_PROJECT_ID') and 
              os.getenv('FIREBASE_PRIVATE_KEY') and 
              os.getenv('FIREBASE_CLIENT_EMAIL')):
            
            service_account = {
                'type': 'service_account',
                'project_id': os.getenv('FIREBASE_PROJECT_ID'),
                'private_key_id': os.getenv('FIREBASE_PRIVATE_KEY_ID', ''),
                'private_key': os.getenv('FIREBASE_PRIVATE_KEY').replace('\\n', '\n'),
                'client_email': os.getenv('FIREBASE_CLIENT_EMAIL'),
                'client_id': os.getenv('FIREBASE_CLIENT_ID', ''),
                'auth_uri': 'https://accounts.google.com/o/oauth2/auth',
                'token_uri': 'https://oauth2.googleapis.com/token',
            }
            
            cred = credentials.Certificate(service_account)
            firebase_admin.initialize_app(cred)
        
        # Try loading from default serviceAccountKey.json
        else:
            key_path = os.path.join(os.path.dirname(__file__), '..', 'serviceAccountKey.json')
            if os.path.exists(key_path):
                cred = credentials.Certificate(key_path)
                firebase_admin.initialize_app(cred)
            else:
                raise FileNotFoundError('Firebase service account key not found')
        
        db = firestore.client()
        print('✓ Firebase Admin SDK initialized successfully')
        
    except Exception as e:
        print(f'✗ Firebase initialization failed: {str(e)}')
        print('The backend server requires Firebase Admin credentials.')
        print('See ../FIREBASE_SETUP.md for configuration instructions.')
        exit(1)


def authenticate(f):
    """Decorator to verify Firebase ID token"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        auth_header = request.headers.get('Authorization', '')
        
        if not auth_header.startswith('Bearer '):
            return jsonify({'error': 'Missing or invalid Authorization header'}), 401
        
        token = auth_header.split(' ')[1]
        
        try:
            decoded_token = auth.verify_id_token(token)
            request.user = decoded_token
            return f(*args, **kwargs)
        except Exception as e:
            print(f'Token verification failed: {str(e)}')
            return jsonify({'error': 'Invalid authentication token'}), 401
    
    return decorated_function


def to_item(doc):
    """Convert Firestore document to dictionary"""
    data = doc.to_dict()
    data['id'] = doc.id
    return data


def get_predictions(user_id):
    """Get all predictions for a user"""
    try:
        docs = db.collection('predictions').where('userId', '==', user_id).stream()
        return [to_item(doc) for doc in docs]
    except Exception as e:
        print(f'Error fetching predictions: {str(e)}')
        return []


def get_recommendations(user_id):
    """Get all recommendations for a user"""
    try:
        docs = db.collection('recommendations').where('userId', '==', user_id).stream()
        return [to_item(doc) for doc in docs]
    except Exception as e:
        print(f'Error fetching recommendations: {str(e)}')
        return []


def get_daily_logs(user_id):
    """Get all daily logs for a user"""
    try:
        docs = db.collection('dailyLogs').where('userId', '==', user_id).stream()
        logs = [to_item(doc) for doc in docs]
        logs.sort(key=lambda x: x.get('date', ''))
        return logs
    except Exception as e:
        print(f'Error fetching daily logs: {str(e)}')
        return []


# ============ ROUTES ============

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        'status': 'ok',
        'message': 'SmartFoodSave backend is running'
    })


@app.route('/api/auth/login', methods=['POST'])
def login():
    """Backend login proxy using Firebase Auth REST API"""
    if not FIREBASE_API_KEY:
        return jsonify({'error': 'FIREBASE_API_KEY is not configured on the backend.'}), 500
    
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    
    if not email or not password:
        return jsonify({'error': 'Email and password are required.'}), 400
    
    try:
        url = f'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key={FIREBASE_API_KEY}'
        response = requests.post(
            url,
            json={'email': email, 'password': password, 'returnSecureToken': True},
            headers={'Content-Type': 'application/json'}
        )
        
        auth_data = response.json()
        
        if not response.ok:
            error_msg = auth_data.get('error', {}).get('message', 'Authentication failed')
            return jsonify({'error': error_msg}), response.status_code
        
        return jsonify({
            'token': auth_data.get('idToken'),
            'refreshToken': auth_data.get('refreshToken'),
            'expiresIn': auth_data.get('expiresIn'),
            'email': auth_data.get('email'),
            'userId': auth_data.get('localId'),
        })
        
    except Exception as e:
        print(f'Login failed: {str(e)}')
        return jsonify({'error': 'Unable to authenticate via Firebase.'}), 500


@app.route('/api/stats/weekly-waste', methods=['GET'])
@authenticate
def weekly_waste():
    """Get weekly waste statistics"""
    try:
        logs = get_daily_logs(request.user['uid'])
        latest_logs = logs[-5:] if len(logs) > 5 else logs
        weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
        
        weekly_waste = []
        for index, log in enumerate(latest_logs):
            day = weekdays[index % len(weekdays)]
            leftovers = log.get('leftovers', 0)
            waste = round(leftovers * 0.2, 1)
            weekly_waste.append({
                'day': day,
                'waste': waste,
                'portions': leftovers
            })
        
        return jsonify(weekly_waste)
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/predictions/upcoming', methods=['GET'])
@authenticate
def upcoming_predictions():
    """Get high-risk upcoming predictions"""
    try:
        predictions = get_predictions(request.user['uid'])
        upcoming = [
            p for p in predictions 
            if p.get('riskLevel') in ['High', 'Medium']
        ]
        return jsonify(upcoming)
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/recommendations/today', methods=['GET'])
@authenticate
def today_recommendations():
    """Get today's top 3 recommendations"""
    try:
        recommendations = get_recommendations(request.user['uid'])
        today_recs = [
            r for r in recommendations 
            if r.get('status') == 'pending'
        ][:3]
        return jsonify(today_recs)
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/predictions', methods=['GET'])
@authenticate
def list_predictions():
    """Get predictions with optional date filtering"""
    try:
        from_date = request.args.get('from')
        to_date = request.args.get('to')
        
        predictions = get_predictions(request.user['uid'])
        
        if from_date and to_date:
            predictions = [
                p for p in predictions
                if p.get('date', '') >= from_date and p.get('date', '') <= to_date
            ]
        
        return jsonify(predictions)
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/predictions/<prediction_id>', methods=['GET'])
@authenticate
def get_prediction(prediction_id):
    """Get prediction details"""
    try:
        doc = db.collection('predictions').document(prediction_id).get()
        if not doc.exists:
            return jsonify({'error': 'Prediction not found'}), 404
        return jsonify(to_item(doc))
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/recommendations', methods=['GET'])
@authenticate
def list_recommendations():
    """Get all recommendations"""
    try:
        recommendations = get_recommendations(request.user['uid'])
        return jsonify(recommendations)
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/recommendations/<rec_id>/accept', methods=['POST'])
@authenticate
def accept_recommendation(rec_id):
    """Accept a recommendation"""
    try:
        rec_ref = db.collection('recommendations').document(rec_id)
        rec_ref.update({'status': 'accepted'})
        updated_doc = rec_ref.get()
        return jsonify(to_item(updated_doc))
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/recommendations/<rec_id>/ignore', methods=['POST'])
@authenticate
def ignore_recommendation(rec_id):
    """Ignore a recommendation"""
    try:
        rec_ref = db.collection('recommendations').document(rec_id)
        rec_ref.update({'status': 'ignored'})
        updated_doc = rec_ref.get()
        return jsonify(to_item(updated_doc))
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/data/daily-logs', methods=['GET'])
@authenticate
def list_daily_logs():
    """Get all daily logs"""
    try:
        logs = get_daily_logs(request.user['uid'])
        return jsonify(logs)
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/data/daily-logs', methods=['POST'])
@authenticate
def add_daily_log():
    """Add a new daily log"""
    try:
        data = request.get_json()
        
        required_fields = ['date', 'menuItems', 'prepared', 'served', 'leftovers']
        if not all(field in data for field in required_fields):
            return jsonify({'error': 'Missing required fields'}), 400
        
        new_log = {
            'userId': request.user['uid'],
            'date': data['date'],
            'menuItems': data['menuItems'] if isinstance(data['menuItems'], list) else [data['menuItems']],
            'prepared': int(data['prepared']),
            'served': int(data['served']),
            'leftovers': int(data['leftovers']),
            'createdAt': datetime.now(),
        }
        
        doc_ref = db.collection('dailyLogs').add(new_log)[1]
        new_log['id'] = doc_ref.id
        return jsonify(new_log), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/predictions', methods=['POST'])
@authenticate
def create_prediction():
    """Create a new prediction"""
    try:
        data = request.get_json()
        
        required_fields = ['date', 'menuItems', 'predictedWasteKg', 'riskLevel']
        if not all(field in data for field in required_fields):
            return jsonify({'error': 'Missing required fields'}), 400
        
        new_prediction = {
            'userId': request.user['uid'],
            'date': data['date'],
            'menuItems': data['menuItems'] if isinstance(data['menuItems'], list) else [data['menuItems']],
            'predictedWasteKg': float(data['predictedWasteKg']),
            'riskLevel': data['riskLevel'],
            'confidence': float(data.get('confidence', 0.5)),
            'explanation': data.get('explanation', ''),
            'createdAt': datetime.now(),
        }
        
        doc_ref = db.collection('predictions').add(new_prediction)[1]
        new_prediction['id'] = doc_ref.id
        return jsonify(new_prediction), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/recommendations', methods=['POST'])
@authenticate
def create_recommendation():
    """Create a new recommendation"""
    try:
        data = request.get_json()
        
        if 'title' not in data:
            return jsonify({'error': 'Missing required field: title'}), 400
        
        new_rec = {
            'userId': request.user['uid'],
            'title': data['title'],
            'description': data.get('description', ''),
            'suggestedChange': data.get('suggestedChange', ''),
            'impactKg': float(data.get('impactKg', 0)),
            'confidence': float(data.get('confidence', 0.5)),
            'status': 'pending',
            'createdAt': datetime.now(),
        }
        
        doc_ref = db.collection('recommendations').add(new_rec)[1]
        new_rec['id'] = doc_ref.id
        return jsonify(new_rec), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    initialize_firebase()
    app.run(host='0.0.0.0', port=PORT, debug=True)
