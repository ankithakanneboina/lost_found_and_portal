"""
Text Similarity Module
Uses TF-IDF + cosine similarity for fast text matching.
Optionally uses Sentence Transformers for semantic similarity.
"""

import re
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# Try to import sentence transformers (optional, heavier)
try:
    from sentence_transformers import SentenceTransformer
    _st_model = None
    ST_AVAILABLE = True
except ImportError:
    ST_AVAILABLE = False
    print("Sentence Transformers not available, using TF-IDF only")

_tfidf_vectorizer = None


def _preprocess_text(text):
    """Clean and normalize text."""
    if not text:
        return ""
    text = text.lower()
    text = re.sub(r'[^a-z0-9\s]', ' ', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text


def _load_st_model():
    global _st_model
    if ST_AVAILABLE and _st_model is None:
        try:
            print("Loading Sentence Transformer model...")
            _st_model = SentenceTransformer('all-MiniLM-L6-v2')
            print("✅ Sentence Transformer loaded")
        except Exception as e:
            print(f"Failed to load Sentence Transformer: {e}")
    return _st_model


def compute_tfidf_similarity(text1, text2):
    """
    Compute TF-IDF cosine similarity between two texts.
    Returns: float between 0 and 1
    """
    t1 = _preprocess_text(text1)
    t2 = _preprocess_text(text2)
    
    if not t1 or not t2:
        return 0.0
    
    try:
        vectorizer = TfidfVectorizer(
            ngram_range=(1, 2),
            min_df=1,
            sublinear_tf=True
        )
        tfidf_matrix = vectorizer.fit_transform([t1, t2])
        sim = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0]
        return float(sim)
    except Exception as e:
        print(f"TF-IDF error: {e}")
        return 0.0


def compute_semantic_similarity(text1, text2):
    """
    Compute semantic similarity using Sentence Transformers.
    Falls back to TF-IDF if not available.
    Returns: float between 0 and 1
    """
    if not ST_AVAILABLE:
        return compute_tfidf_similarity(text1, text2)
    
    model = _load_st_model()
    if model is None:
        return compute_tfidf_similarity(text1, text2)
    
    try:
        t1 = _preprocess_text(text1)
        t2 = _preprocess_text(text2)
        
        if not t1 or not t2:
            return 0.0
        
        embeddings = model.encode([t1, t2])
        sim = cosine_similarity(
            embeddings[0].reshape(1, -1),
            embeddings[1].reshape(1, -1)
        )[0][0]
        return float(max(0, sim))
    except Exception as e:
        print(f"Semantic similarity error: {e}")
        return compute_tfidf_similarity(text1, text2)


def compute_text_similarity(item1, item2):
    """
    Compute combined text similarity between two items.
    item1, item2: dicts with 'itemName', 'description', 'category' fields
    Returns: float between 0 and 1
    """
    # Build combined text with field weighting
    def build_text(item):
        parts = []
        # Name is most important - repeat for weight
        name = item.get('itemName', '') or ''
        parts.extend([name] * 3)
        # Category
        cat = item.get('category', '') or ''
        parts.extend([cat] * 2)
        # Description
        desc = item.get('description', '') or ''
        parts.append(desc)
        # Location
        loc = item.get('location', '') or ''
        parts.append(loc)
        return ' '.join(parts)
    
    text1 = build_text(item1)
    text2 = build_text(item2)
    
    # TF-IDF similarity
    tfidf_sim = compute_tfidf_similarity(text1, text2)
    
    # Semantic similarity (if available)
    semantic_sim = compute_semantic_similarity(text1, text2)
    
    # Category bonus: exact category match boosts score
    cat1 = (item1.get('category', '') or '').lower().strip()
    cat2 = (item2.get('category', '') or '').lower().strip()
    category_bonus = 0.1 if cat1 and cat2 and cat1 == cat2 else 0.0
    
    # Weighted combination
    combined = (tfidf_sim * 0.4) + (semantic_sim * 0.5) + category_bonus
    return float(min(1.0, combined))


def batch_text_compare(query_item, candidate_items):
    """
    Compare one query item against a list of candidate items.
    Returns: list of dicts with 'id' and 'textSimilarity'
    """
    results = []
    for candidate in candidate_items:
        sim = compute_text_similarity(query_item, candidate)
        results.append({
            'id': str(candidate['_id']),
            'textSimilarity': sim
        })
    results.sort(key=lambda x: x['textSimilarity'], reverse=True)
    return results
