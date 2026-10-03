"""
Seed script — populates MongoDB with sample users and items for testing.
Run from backend/:  python seed_data.py
"""

import sys, os
sys.path.insert(0, os.path.dirname(__file__))

from dotenv import load_dotenv
load_dotenv()

from datetime import datetime, timedelta
import bcrypt
import random
from bson import ObjectId

from database.connection import init_db, get_db
from ml_model.text_similarity import compute_text_similarity

init_db()
db = get_db()

# ── Clear existing data ────────────────────────────────────
print("Clearing existing sample data…")
db.users.delete_many({'email': {'$regex': '@example.com'}})
db.lost_items.delete_many({'_isSeed': True})
db.found_items.delete_many({'_isSeed': True})

# ── Create sample users ────────────────────────────────────
print("Creating sample users…")

users_data = [
    {'name': 'Alice Chen', 'email': 'alice@example.com', 'phone': '555-0101'},
    {'name': 'Bob Smith', 'email': 'bob@example.com', 'phone': '555-0102'},
    {'name': 'Carol Davis', 'email': 'carol@example.com', 'phone': '555-0103'},
    {'name': 'David Kim', 'email': 'david@example.com', 'phone': '555-0104'},
]

user_ids = []
for u in users_data:
    hashed = bcrypt.hashpw(b'password123', bcrypt.gensalt())
    result = db.users.insert_one({**u, 'email': u['email'].lower(), 'password': hashed, 'role': 'user', 'createdAt': datetime.utcnow()})
    user_ids.append(str(result.inserted_id))
    print(f"  Created user: {u['name']} ({u['email']})")

# ── Sample lost items ──────────────────────────────────────
print("\nCreating sample lost items…")

lost_items_data = [
    {
        'itemName': 'Black Leather Wallet',
        'description': 'Black bifold leather wallet containing credit cards, driver\'s license, and $60 cash. Has a small scratch on the front.',
        'category': 'Wallet/Purse',
        'location': 'Central Park, near the fountain',
        'dateLost': '2024-01-15',
        'contact': 'alice@example.com',
    },
    {
        'itemName': 'iPhone 14 Pro Blue',
        'description': 'Blue iPhone 14 Pro with a black MagSafe case. Screen has a small crack in the top right corner. Has stickers on the back.',
        'category': 'Phone',
        'location': 'Times Square subway station',
        'dateLost': '2024-01-16',
        'contact': '555-0102',
    },
    {
        'itemName': 'Toyota Car Keys',
        'description': 'Toyota Camry car keys with a red keychain and a small flashlight attached. Has a house key on the ring too.',
        'category': 'Keys',
        'location': 'Westfield Shopping Mall parking lot',
        'dateLost': '2024-01-17',
        'contact': 'carol@example.com',
    },
    {
        'itemName': 'Ray-Ban Aviator Sunglasses',
        'description': 'Gold-frame Ray-Ban Aviator sunglasses in a brown leather case. One lens has a tiny scratch.',
        'category': 'Glasses',
        'location': 'Riverside Park jogging trail',
        'dateLost': '2024-01-18',
        'contact': '555-0104',
    },
    {
        'itemName': 'MacBook Pro 14"',
        'description': 'Space Gray MacBook Pro 14-inch with stickers on lid. Has a dent on the bottom-left corner. Apple logo sticker on back.',
        'category': 'Electronics',
        'location': 'Coffee Beanery Cafe, downtown',
        'dateLost': '2024-01-19',
        'contact': 'alice@example.com',
    },
    {
        'itemName': 'Blue North Face Backpack',
        'description': 'Large blue North Face backpack with a broken zipper on the front pocket. Contains textbooks and a water bottle.',
        'category': 'Bags/Backpacks',
        'location': 'City University Library',
        'dateLost': '2024-01-20',
        'contact': '555-0102',
    },
]

lost_ids = []
for i, item in enumerate(lost_items_data):
    # Simulate a feature vector (random for seed data)
    feature_vector = [random.gauss(0, 1) for _ in range(1280)]
    result = db.lost_items.insert_one({
        **item,
        'userId': user_ids[i % len(user_ids)],
        'image': None,
        'featureVector': feature_vector,
        'status': 'active',
        '_isSeed': True,
        'createdAt': datetime.utcnow() - timedelta(days=random.randint(0, 7)),
    })
    lost_ids.append(str(result.inserted_id))
    print(f"  Lost item: {item['itemName']}")

# ── Sample found items ─────────────────────────────────────
print("\nCreating sample found items…")

found_items_data = [
    {
        'itemName': 'Leather Wallet Dark Brown',
        'description': 'Found a dark brown/black leather bifold wallet near the Central Park fountain area. Contains some cards.',
        'category': 'Wallet/Purse',
        'location': 'Central Park, Great Lawn',
        'dateFound': '2024-01-15',
        'contact': 'bob@example.com',
    },
    {
        'itemName': 'Smartphone with cracked screen',
        'description': 'Found a blue iPhone in a black case near the subway stairs at 42nd street. Screen has slight damage in corner.',
        'category': 'Phone',
        'location': '42nd St Times Square Station',
        'dateFound': '2024-01-16',
        'contact': '555-0103',
    },
    {
        'itemName': 'Car key bundle Toyota',
        'description': 'Found car keys with red keychain in parking lot. Looks like Toyota keys with extra keys on ring.',
        'category': 'Keys',
        'location': 'Westfield Mall, Level 2 parking',
        'dateFound': '2024-01-17',
        'contact': 'carol@example.com',
    },
    {
        'itemName': 'Sunglasses gold aviator style',
        'description': 'Found gold-frame aviator sunglasses along the jogging path. In a brown case.',
        'category': 'Glasses',
        'location': 'Riverside Park, main trail',
        'dateFound': '2024-01-18',
        'contact': '555-0101',
    },
]

found_ids = []
for i, item in enumerate(found_items_data):
    feature_vector = [random.gauss(0, 1) for _ in range(1280)]
    result = db.found_items.insert_one({
        **item,
        'userId': user_ids[(i + 2) % len(user_ids)],
        'image': None,
        'featureVector': feature_vector,
        'status': 'active',
        '_isSeed': True,
        'createdAt': datetime.utcnow() - timedelta(days=random.randint(0, 5)),
    })
    found_ids.append(str(result.inserted_id))
    print(f"  Found item: {item['itemName']}")

# ── Generate matches using text similarity ─────────────────
print("\nComputing ML matches for seed data…")

lost_docs = list(db.lost_items.find({'_isSeed': True}))
found_docs = list(db.found_items.find({'_isSeed': True}))

match_count = 0
for lost in lost_docs:
    for found in found_docs:
        text_sim = compute_text_similarity(lost, found)
        # Use random image sim as placeholder (no real images)
        image_sim = random.uniform(0.3, 0.8) if text_sim > 0.4 else random.uniform(0.1, 0.4)
        final_score = (image_sim * 0.55) + (text_sim * 0.45)

        if final_score >= 0.50:
            try:
                db.matches.update_one(
                    {'lostItemId': str(lost['_id']), 'foundItemId': str(found['_id'])},
                    {'$setOnInsert': {
                        'lostItemId': str(lost['_id']),
                        'foundItemId': str(found['_id']),
                        'lostUserId': lost['userId'],
                        'foundUserId': found['userId'],
                        'imageSimilarity': round(image_sim, 4),
                        'textSimilarity': round(text_sim, 4),
                        'finalScore': round(final_score, 4),
                        'status': 'pending',
                        'createdAt': datetime.utcnow(),
                    }},
                    upsert=True
                )
                match_count += 1
                print(f"  Match: '{lost['itemName']}' ↔ '{found['itemName']}' → {final_score:.1%}")
            except Exception as e:
                pass

print(f"\n✅ Seed complete!")
print(f"   Users:       {len(users_data)}")
print(f"   Lost items:  {len(lost_items_data)}")
print(f"   Found items: {len(found_items_data)}")
print(f"   Matches:     {match_count}")
print(f"\n🔑 Test login:  alice@example.com / password123")
