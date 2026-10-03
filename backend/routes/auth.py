from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from datetime import datetime, timedelta
import bcrypt
from bson import ObjectId

from database.connection import get_db
from utils.helpers import serialize_doc

auth_bp = Blueprint('auth', __name__)


@auth_bp.route('/register', methods=['POST'])
def register():
    db = get_db()
    data = request.get_json()
    
    required = ['name', 'email', 'password']
    for field in required:
        if not data.get(field):
            return jsonify({'error': f'{field} is required'}), 400
    
    # Check existing user
    if db.users.find_one({'email': data['email'].lower()}):
        return jsonify({'error': 'Email already registered'}), 409
    
    # Hash password
    hashed = bcrypt.hashpw(data['password'].encode('utf-8'), bcrypt.gensalt())
    
    user = {
        'name': data['name'].strip(),
        'email': data['email'].lower().strip(),
        'password': hashed,
        'phone': data.get('phone', ''),
        'role': 'user',
        'createdAt': datetime.utcnow()
    }
    
    result = db.users.insert_one(user)
    user_id = str(result.inserted_id)
    
    token = create_access_token(
        identity=user_id,
        additional_claims={'role': 'user'},
        expires_delta=timedelta(days=7)
    )
    
    return jsonify({
        'token': token,
        'user': {
            '_id': user_id,
            'name': user['name'],
            'email': user['email'],
            'phone': user['phone'],
            'role': 'user'
        }
    }), 201


@auth_bp.route('/login', methods=['POST'])
def login():
    db = get_db()
    data = request.get_json()
    
    if not data.get('email') or not data.get('password'):
        return jsonify({'error': 'Email and password required'}), 400
    
    user = db.users.find_one({'email': data['email'].lower()})
    
    if not user or not bcrypt.checkpw(data['password'].encode('utf-8'), user['password']):
        return jsonify({'error': 'Invalid email or password'}), 401
    
    user_id = str(user['_id'])
    token = create_access_token(
        identity=user_id,
        additional_claims={'role': user.get('role', 'user')},
        expires_delta=timedelta(days=7)
    )
    
    return jsonify({
        'token': token,
        'user': {
            '_id': user_id,
            'name': user['name'],
            'email': user['email'],
            'phone': user.get('phone', ''),
            'role': user.get('role', 'user')
        }
    })


@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_me():
    db = get_db()
    user_id = get_jwt_identity()
    
    user = db.users.find_one({'_id': ObjectId(user_id)})
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    return jsonify({
        '_id': str(user['_id']),
        'name': user['name'],
        'email': user['email'],
        'phone': user.get('phone', ''),
        'role': user.get('role', 'user')
    })


@auth_bp.route('/update-profile', methods=['PUT'])
@jwt_required()
def update_profile():
    db = get_db()
    user_id = get_jwt_identity()
    data = request.get_json()
    
    update = {}
    if data.get('name'):
        update['name'] = data['name'].strip()
    if data.get('phone'):
        update['phone'] = data['phone'].strip()
    
    db.users.update_one({'_id': ObjectId(user_id)}, {'$set': update})
    return jsonify({'message': 'Profile updated'})
