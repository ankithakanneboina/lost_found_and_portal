from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
from bson import ObjectId

from database.connection import get_db
from utils.helpers import serialize_doc, serialize_docs
from ml_model.matcher import find_matches, MATCH_THRESHOLD

matches_bp = Blueprint('matches', __name__)


def run_matching_for_item(item_id, item_type):
    """
    Core ML matching function. Called after new item is uploaded.
    item_type: 'lost' or 'found'
    """
    db = get_db()
    
    try:
        if item_type == 'found':
            # New found item: compare against all active lost items
            new_item = db.found_items.find_one({'_id': ObjectId(item_id)})
            if not new_item:
                return
            
            # Get candidates from same category first, then all
            candidates = list(db.lost_items.find({'status': 'active'}))
            
            if not candidates:
                return
            
            matches = find_matches(new_item, candidates, 'found')
            
            for match in matches:
                lost_item = match['candidate']
                lost_item_id = str(lost_item['_id'])
                
                # Store match
                match_doc = {
                    'lostItemId': lost_item_id,
                    'foundItemId': item_id,
                    'lostUserId': lost_item.get('userId'),
                    'foundUserId': str(new_item.get('userId', '')),
                    'imageSimilarity': match['imageSimilarity'],
                    'textSimilarity': match['textSimilarity'],
                    'finalScore': match['finalScore'],
                    'status': 'pending',
                    'createdAt': datetime.utcnow()
                }
                
                # Upsert match
                existing = db.matches.find_one({
                    'lostItemId': lost_item_id,
                    'foundItemId': item_id
                })
                
                if existing:
                    db.matches.update_one(
                        {'_id': existing['_id']},
                        {'$set': match_doc}
                    )
                    match_id = str(existing['_id'])
                else:
                    result = db.matches.insert_one(match_doc)
                    match_id = str(result.inserted_id)
                
                # Send real-time notification to lost item owner
                _send_match_notification(
                    user_id=lost_item.get('userId'),
                    match_id=match_id,
                    lost_item=lost_item,
                    found_item=new_item,
                    score=match['finalScore']
                )
        
        elif item_type == 'lost':
            # New lost item: compare against all active found items
            new_item = db.lost_items.find_one({'_id': ObjectId(item_id)})
            if not new_item:
                return
            
            candidates = list(db.found_items.find({'status': 'active'}))
            
            if not candidates:
                return
            
            matches = find_matches(new_item, candidates, 'lost')
            
            for match in matches:
                found_item = match['candidate']
                found_item_id = str(found_item['_id'])
                
                match_doc = {
                    'lostItemId': item_id,
                    'foundItemId': found_item_id,
                    'lostUserId': str(new_item.get('userId', '')),
                    'foundUserId': found_item.get('userId'),
                    'imageSimilarity': match['imageSimilarity'],
                    'textSimilarity': match['textSimilarity'],
                    'finalScore': match['finalScore'],
                    'status': 'pending',
                    'createdAt': datetime.utcnow()
                }
                
                existing = db.matches.find_one({
                    'lostItemId': item_id,
                    'foundItemId': found_item_id
                })
                
                if existing:
                    db.matches.update_one(
                        {'_id': existing['_id']},
                        {'$set': match_doc}
                    )
                    match_id = str(existing['_id'])
                else:
                    result = db.matches.insert_one(match_doc)
                    match_id = str(result.inserted_id)
                
                # Notify the person who reported the lost item (the new_item owner)
                _send_match_notification(
                    user_id=str(new_item.get('userId', '')),
                    match_id=match_id,
                    lost_item=new_item,
                    found_item=found_item,
                    score=match['finalScore']
                )
    
    except Exception as e:
        print(f"Matching error for {item_type} item {item_id}: {e}")
        import traceback
        traceback.print_exc()


def _send_match_notification(user_id, match_id, lost_item, found_item, score):
    """Send real-time Socket.IO notification to user."""
    try:
        from flask import current_app
        socketio = current_app.socketio
        
        notification = {
            'type': 'MATCH_FOUND',
            'matchId': match_id,
            'score': round(score * 100, 1),
            'lostItem': {
                'id': str(lost_item['_id']),
                'name': lost_item.get('itemName', ''),
                'image': lost_item.get('image')
            },
            'foundItem': {
                'id': str(found_item['_id']),
                'name': found_item.get('itemName', ''),
                'image': found_item.get('image')
            },
            'message': f"🎯 Potential match found! {round(score * 100, 1)}% similarity",
            'timestamp': datetime.utcnow().isoformat()
        }
        
        room = f"user_{user_id}"
        socketio.emit('match_notification', notification, room=room)
        print(f"✅ Notification sent to user {user_id}, match score: {score:.2%}")
        
    except Exception as e:
        print(f"Notification error: {e}")


@matches_bp.route('/', methods=['GET'])
@jwt_required()
def get_my_matches():
    db = get_db()
    user_id = get_jwt_identity()
    
    # Find matches where user is involved
    matches = list(db.matches.find({
        '$or': [
            {'lostUserId': user_id},
            {'foundUserId': user_id}
        ]
    }).sort('createdAt', -1).limit(50))
    
    # Enrich with item details
    enriched = []
    for match in matches:
        m = serialize_doc(match)
        
        # Get lost item details
        lost = db.lost_items.find_one({'_id': ObjectId(match['lostItemId'])})
        found = db.found_items.find_one({'_id': ObjectId(match['foundItemId'])})
        
        m['lostItem'] = serialize_doc(lost) if lost else None
        m['foundItem'] = serialize_doc(found) if found else None
        enriched.append(m)
    
    return jsonify(enriched)


@matches_bp.route('/all', methods=['GET'])
def get_all_matches():
    db = get_db()
    page = int(request.args.get('page', 1))
    per_page = int(request.args.get('per_page', 20))
    skip = (page - 1) * per_page
    
    matches = list(db.matches.find().sort('createdAt', -1).skip(skip).limit(per_page))
    total = db.matches.count_documents({})
    
    enriched = []
    for match in matches:
        m = serialize_doc(match)
        lost = db.lost_items.find_one({'_id': ObjectId(match['lostItemId'])})
        found = db.found_items.find_one({'_id': ObjectId(match['foundItemId'])})
        m['lostItem'] = serialize_doc(lost) if lost else None
        m['foundItem'] = serialize_doc(found) if found else None
        enriched.append(m)
    
    return jsonify({
        'matches': enriched,
        'total': total,
        'page': page,
        'pages': (total + per_page - 1) // per_page
    })


@matches_bp.route('/<match_id>/claim', methods=['POST'])
@jwt_required()
def claim_match(match_id):
    db = get_db()
    user_id = get_jwt_identity()
    
    match = db.matches.find_one({'_id': ObjectId(match_id)})
    if not match:
        return jsonify({'error': 'Match not found'}), 404
    
    # Verify user is involved
    if match.get('lostUserId') != user_id and match.get('foundUserId') != user_id:
        return jsonify({'error': 'Unauthorized'}), 403
    
    db.matches.update_one(
        {'_id': ObjectId(match_id)},
        {'$set': {'status': 'claimed', 'claimedAt': datetime.utcnow(), 'claimedBy': user_id}}
    )
    
    return jsonify({'message': 'Claim submitted successfully'})


@matches_bp.route('/stats', methods=['GET'])
def get_stats():
    db = get_db()
    return jsonify({
        'totalLost': db.lost_items.count_documents({}),
        'totalFound': db.found_items.count_documents({}),
        'totalMatches': db.matches.count_documents({}),
        'resolvedMatches': db.matches.count_documents({'status': 'claimed'}),
        'activeLost': db.lost_items.count_documents({'status': 'active'}),
        'activeFound': db.found_items.count_documents({'status': 'active'})
    })
