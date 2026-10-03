from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from datetime import datetime
from bson import ObjectId

from database.connection import get_db
from utils.helpers import serialize_docs, serialize_doc

admin_bp = Blueprint('admin', __name__)


def require_admin():
    claims = get_jwt()
    if claims.get('role') != 'admin':
        return jsonify({'error': 'Admin access required'}), 403
    return None


@admin_bp.route('/dashboard', methods=['GET'])
@jwt_required()
def admin_dashboard():
    error = require_admin()
    if error:
        return error
    
    db = get_db()
    return jsonify({
        'users': db.users.count_documents({}),
        'lostItems': db.lost_items.count_documents({}),
        'foundItems': db.found_items.count_documents({}),
        'matches': db.matches.count_documents({}),
        'resolvedMatches': db.matches.count_documents({'status': 'claimed'}),
        'recentActivity': serialize_docs(list(db.lost_items.find().sort('createdAt', -1).limit(5)))
    })


@admin_bp.route('/items/lost', methods=['GET'])
@jwt_required()
def admin_lost_items():
    error = require_admin()
    if error:
        return error
    
    db = get_db()
    items = serialize_docs(list(db.lost_items.find().sort('createdAt', -1).limit(100)))
    return jsonify(items)


@admin_bp.route('/items/found', methods=['GET'])
@jwt_required()
def admin_found_items():
    error = require_admin()
    if error:
        return error
    
    db = get_db()
    items = serialize_docs(list(db.found_items.find().sort('createdAt', -1).limit(100)))
    return jsonify(items)


@admin_bp.route('/items/lost/<item_id>', methods=['DELETE'])
@jwt_required()
def delete_lost_item(item_id):
    error = require_admin()
    if error:
        return error
    
    db = get_db()
    db.lost_items.delete_one({'_id': ObjectId(item_id)})
    return jsonify({'message': 'Item deleted'})


@admin_bp.route('/items/found/<item_id>', methods=['DELETE'])
@jwt_required()
def delete_found_item(item_id):
    error = require_admin()
    if error:
        return error
    
    db = get_db()
    db.found_items.delete_one({'_id': ObjectId(item_id)})
    return jsonify({'message': 'Item deleted'})


@admin_bp.route('/users', methods=['GET'])
@jwt_required()
def admin_users():
    error = require_admin()
    if error:
        return error
    
    db = get_db()
    users = list(db.users.find({}, {'password': 0}))
    return jsonify(serialize_docs(users))


@admin_bp.route('/create-admin', methods=['POST'])
def create_first_admin():
    """One-time endpoint to create admin user. Disable in production."""
    db = get_db()
    import bcrypt
    data = request.get_json()
    
    if db.users.count_documents({'role': 'admin'}) > 0:
        return jsonify({'error': 'Admin already exists'}), 400
    
    hashed = bcrypt.hashpw(data['password'].encode('utf-8'), bcrypt.gensalt())
    db.users.insert_one({
        'name': data.get('name', 'Admin'),
        'email': data['email'].lower(),
        'password': hashed,
        'role': 'admin',
        'createdAt': datetime.utcnow()
    })
    return jsonify({'message': 'Admin created'})
