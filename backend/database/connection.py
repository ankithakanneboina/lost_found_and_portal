import os
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure

_client = None
_db = None

def init_db():
    global _client, _db
    mongo_uri = os.getenv('MONGO_URI', 'mongodb://localhost:27017/')
    db_name = os.getenv('DB_NAME', 'lost_found_portal')
    try:
        _client = MongoClient(mongo_uri, serverSelectionTimeoutMS=5000)
        _client.admin.command('ping')
        _db = _client[db_name]
        _create_indexes()
        print(f"✅ MongoDB connected: {db_name}")
    except ConnectionFailure as e:
        print(f"❌ MongoDB connection failed: {e}")
        raise

def get_db():
    global _db
    if _db is None:
        init_db()
    return _db

def _create_indexes():
    db = _db
    # Users
    db.users.create_index('email', unique=True)
    # Lost items
    db.lost_items.create_index('userId')
    db.lost_items.create_index('category')
    db.lost_items.create_index('status')
    # Found items
    db.found_items.create_index('userId')
    db.found_items.create_index('category')
    db.found_items.create_index('status')
    # Matches
    db.matches.create_index([('lostItemId', 1), ('foundItemId', 1)], unique=True)
    print("✅ Database indexes created")
