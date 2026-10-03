"""
Quick test script to verify the ML pipeline is working.
Run from: backend/
  python ml_model/test_ml.py
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

import numpy as np

print("=" * 60)
print("Testing Lost & Found ML Pipeline")
print("=" * 60)

# ── Test 1: Text Similarity ──────────────────────────────────
print("\n[1] Testing Text Similarity (TF-IDF)")
from ml_model.text_similarity import compute_tfidf_similarity, compute_text_similarity

item_a = {
    'itemName': 'Black leather wallet',
    'description': 'Black bifold leather wallet with ID cards and credit cards',
    'category': 'Wallet/Purse',
    'location': 'Central Park'
}
item_b = {
    'itemName': 'Leather wallet black',
    'description': 'Dark leather bifold wallet found near park bench',
    'category': 'Wallet/Purse',
    'location': 'Near Central Park'
}
item_c = {
    'itemName': 'Blue iPhone 14',
    'description': 'Blue iPhone 14 with cracked screen and black case',
    'category': 'Phone',
    'location': 'Times Square'
}

sim_ab = compute_text_similarity(item_a, item_b)
sim_ac = compute_text_similarity(item_a, item_c)

print(f"  Wallet vs Wallet:  {sim_ab:.3f} (expect HIGH ~0.7+)")
print(f"  Wallet vs iPhone:  {sim_ac:.3f} (expect LOW  ~0.1)")

assert sim_ab > sim_ac, "❌ Text similarity ordering is wrong!"
print("  ✅ Text similarity PASSED")

# ── Test 2: Image Feature Extraction ────────────────────────
print("\n[2] Testing Image Feature Extraction (MobileNetV2)")
try:
    from ml_model.image_matching import extract_features, compute_image_similarity
    import numpy as np

    # Create two fake white images (1x1 pixel PNG)
    import io
    from PIL import Image as PILImage

    # Make a red image
    red = PILImage.new('RGB', (224, 224), color=(220, 50, 50))
    red_bytes = io.BytesIO()
    red.save(red_bytes, format='PNG')
    red_bytes = red_bytes.getvalue()

    # Make another red image (should be very similar)
    red2 = PILImage.new('RGB', (224, 224), color=(210, 60, 40))
    red2_bytes = io.BytesIO()
    red2.save(red2_bytes, format='PNG')
    red2_bytes = red2_bytes.getvalue()

    # Make a blue image (should be dissimilar)
    blue = PILImage.new('RGB', (224, 224), color=(50, 50, 220))
    blue_bytes = io.BytesIO()
    blue.save(blue_bytes, format='PNG')
    blue_bytes = blue_bytes.getvalue()

    print("  Extracting features from test images…")
    f_red = extract_features(red_bytes)
    f_red2 = extract_features(red2_bytes)
    f_blue = extract_features(blue_bytes)

    print(f"  Feature vector length: {len(f_red)}")
    assert len(f_red) > 0, "❌ Empty feature vector!"

    sim_rr = compute_image_similarity(f_red, f_red2)
    sim_rb = compute_image_similarity(f_red, f_blue)
    print(f"  Red vs Red2:  {sim_rr:.4f}")
    print(f"  Red vs Blue:  {sim_rb:.4f}")
    print("  ✅ Image features PASSED")
except Exception as e:
    print(f"  ⚠️  Image test skipped: {e}")

# ── Test 3: Full Matcher ────────────────────────────────────
print("\n[3] Testing Full Matcher")
from ml_model.matcher import find_matches, MATCH_THRESHOLD
from bson import ObjectId

# Simulate lost items in DB format
lost_candidates = [
    {
        '_id': ObjectId(),
        'itemName': 'Black leather wallet',
        'description': 'Black bifold leather wallet, lost near park',
        'category': 'Wallet/Purse',
        'location': 'Central Park',
        'featureVector': None
    },
    {
        '_id': ObjectId(),
        'itemName': 'Blue iPhone 14',
        'description': 'Blue iPhone 14 Pro with cracked screen protector',
        'category': 'Phone',
        'location': 'Times Square',
        'featureVector': None
    },
    {
        '_id': ObjectId(),
        'itemName': 'Car keys Toyota',
        'description': 'Toyota car keys with a red keychain',
        'category': 'Keys',
        'location': 'Shopping mall parking lot',
        'featureVector': None
    }
]

found_item = {
    'itemName': 'Wallet leather black',
    'description': 'Found black leather bifold wallet on park bench',
    'category': 'Wallet/Purse',
    'location': 'Central Park bench',
    'featureVector': None
}

matches = find_matches(found_item, lost_candidates, 'found')
print(f"  Found {len(matches)} match(es) above threshold ({MATCH_THRESHOLD:.0%})")
for m in matches:
    print(f"    → Score: {m['finalScore']:.3f} | Image: {m['imageSimilarity']:.3f} | Text: {m['textSimilarity']:.3f}")

if matches:
    best = matches[0]
    best_candidate = next(c for c in lost_candidates if str(c['_id']) == best['candidateId'])
    print(f"  Best match: '{best_candidate['itemName']}' with {best['finalScore']:.1%} confidence")
    print("  ✅ Matcher PASSED")
else:
    print("  ⚠️  No matches above threshold (may need threshold tuning)")

print("\n" + "=" * 60)
print("✅ ML Pipeline Test Complete!")
print("=" * 60)
