import os
import threading
from flask import Blueprint, request, jsonify, current_app, send_from_directory
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
from bson import ObjectId

from database.connection import get_db
from utils.helpers import save_uploaded_image, get_image_path, serialize_doc, serialize_docs, paginate_query
from ml_model.image_matching import extract_features

items_bp = Blueprint('items', __name__)


def _run_matching_async(app, item_id, item_type):
    """Run ML matching in background thread."""
    with app.app_context():
        from routes.matches import run_matching_for_item
        run_matching_for_item(item_id, item_type)


@items_bp.route('/lost', methods=['POST'])
@jwt_required()
def report_lost_item():
    db = get_db()
    user_id = get_jwt_identity()
    
    # Get form data
    item_name = request.form.get('itemName', '').strip()
    description = request.form.get('description', '').strip()
    category = request.form.get('category', '').strip()
    location = request.form.get('location', '').strip()
    date_lost = request.form.get('dateLost', '')
    contact = request.form.get('contact', '').strip()
    
    if not item_name or not category:
        return jsonify({'error': 'Item name and category are required'}), 400
    
    # Handle image upload
    image_filename = None
    feature_vector = None
    
    if 'image' in request.files:
        file = request.files['image']
        if file and file.filename:
            image_filename = save_uploaded_image(file)
            # Extract features
            image_path = get_image_path(image_filename)
            try:
                feature_vector = extract_features(image_path)
            except Exception as e:
                print(f"Feature extraction warning: {e}")
    
    item = {
        'userId': user_id,
        'itemName': item_name,
        'description': description,
        'category': category,
        'location': location,
        'dateLost': date_lost,
        'contact': contact,
        'image': image_filename,
        'featureVector': feature_vector,
        'status': 'active',
        'createdAt': datetime.utcnow()
    }
    
    result = db.lost_items.insert_one(item)
    item['_id'] = result.inserted_id
    
    # Run matching async (find matching found items)
    app = current_app._get_current_object()
    t = threading.Thread(target=_run_matching_async, args=(app, str(result.inserted_id), 'lost'))
    t.daemon = True
    t.start()
    
    return jsonify({
        'message': 'Lost item reported successfully',
        'item': serialize_doc(item)
    }), 201


@items_bp.route('/found', methods=['POST'])
@jwt_required()
def report_found_item():
    db = get_db()
    user_id = get_jwt_identity()
    
    item_name = request.form.get('itemName', '').strip()
    description = request.form.get('description', '').strip()
    category = request.form.get('category', '').strip()
    location = request.form.get('location', '').strip()
    date_found = request.form.get('dateFound', '')
    contact = request.form.get('contact', '').strip()
    
    if not item_name or not category:
        return jsonify({'error': 'Item name and category are required'}), 400
    
    image_filename = None
    feature_vector = None
    
    if 'image' in request.files:
        file = request.files['image']
        if file and file.filename:
            image_filename = save_uploaded_image(file)
            image_path = get_image_path(image_filename)
            try:
                feature_vector = extract_features(image_path)
            except Exception as e:
                print(f"Feature extraction warning: {e}")
    
    item = {
        'userId': user_id,
        'itemName': item_name,
        'description': description,
        'category': category,
        'location': location,
        'dateFound': date_found,
        'contact': contact,
        'image': image_filename,
        'featureVector': feature_vector,
        'status': 'active',
        'createdAt': datetime.utcnow()
    }
    
    result = db.found_items.insert_one(item)
    item['_id'] = result.inserted_id
    
    # Run matching async
    app = current_app._get_current_object()
    t = threading.Thread(target=_run_matching_async, args=(app, str(result.inserted_id), 'found'))
    t.daemon = True
    t.start()
    
    return jsonify({
        'message': 'Found item reported successfully',
        'item': serialize_doc(item)
    }), 201


@items_bp.route('/lost', methods=['GET'])
def get_lost_items():
    db = get_db()
    page = int(request.args.get('page', 1))
    per_page = int(request.args.get('per_page', 12))
    category = request.args.get('category', '')
    search = request.args.get('search', '')
    
    query = {'status': 'active'}
    if category:
        query['category'] = category
    if search:
        query['$or'] = [
            {'itemName': {'$regex': search, '$options': 'i'}},
            {'description': {'$regex': search, '$options': 'i'}},
            {'location': {'$regex': search, '$options': 'i'}}
        ]
    
    return jsonify(paginate_query(db.lost_items, query, page, per_page))


@items_bp.route('/found', methods=['GET'])
def get_found_items():
    db = get_db()
    page = int(request.args.get('page', 1))
    per_page = int(request.args.get('per_page', 12))
    category = request.args.get('category', '')
    search = request.args.get('search', '')
    
    query = {'status': 'active'}
    if category:
        query['category'] = category
    if search:
        query['$or'] = [
            {'itemName': {'$regex': search, '$options': 'i'}},
            {'description': {'$regex': search, '$options': 'i'}},
            {'location': {'$regex': search, '$options': 'i'}}
        ]
    
    return jsonify(paginate_query(db.found_items, query, page, per_page))


@items_bp.route('/lost/<item_id>', methods=['GET'])
def get_lost_item(item_id):
    db = get_db()
    item = db.lost_items.find_one({'_id': ObjectId(item_id)})
    if not item:
        return jsonify({'error': 'Item not found'}), 404
    return jsonify(serialize_doc(item))


@items_bp.route('/found/<item_id>', methods=['GET'])
def get_found_item(item_id):
    db = get_db()
    item = db.found_items.find_one({'_id': ObjectId(item_id)})
    if not item:
        return jsonify({'error': 'Item not found'}), 404
    return jsonify(serialize_doc(item))


@items_bp.route('/my-items', methods=['GET'])
@jwt_required()
def get_my_items():
    db = get_db()
    user_id = get_jwt_identity()
    
    lost = serialize_docs(list(db.lost_items.find({'userId': user_id}).sort('createdAt', -1)))
    found = serialize_docs(list(db.found_items.find({'userId': user_id}).sort('createdAt', -1)))
    
    return jsonify({'lost': lost, 'found': found})


@items_bp.route('/lost/<item_id>/resolve', methods=['PUT'])
@jwt_required()
def resolve_lost_item(item_id):
    db = get_db()
    user_id = get_jwt_identity()
    
    item = db.lost_items.find_one({'_id': ObjectId(item_id), 'userId': user_id})
    if not item:
        return jsonify({'error': 'Item not found or unauthorized'}), 404
    
    db.lost_items.update_one({'_id': ObjectId(item_id)}, {'$set': {'status': 'resolved'}})
    return jsonify({'message': 'Item marked as resolved'})


@items_bp.route('/found/<item_id>/resolve', methods=['PUT'])
@jwt_required()
def resolve_found_item(item_id):
    db = get_db()
    user_id = get_jwt_identity()
    
    item = db.found_items.find_one({'_id': ObjectId(item_id), 'userId': user_id})
    if not item:
        return jsonify({'error': 'Item not found or unauthorized'}), 404
    
    db.found_items.update_one({'_id': ObjectId(item_id)}, {'$set': {'status': 'resolved'}})
    return jsonify({'message': 'Item marked as resolved'})


@items_bp.route('/images/<filename>')
def serve_image(filename):
    upload_folder = current_app.config['UPLOAD_FOLDER']
    return send_from_directory(upload_folder, filename)


@items_bp.route('/categories', methods=['GET'])
def get_categories():
    return jsonify([
        'Electronics', 'Wallet/Purse', 'Keys', 'Documents',
        'Jewelry', 'Clothing', 'Bags/Backpacks', 'Pets',
        'Glasses', 'Phone', 'Toys', 'Books', 'Other'
    ])
