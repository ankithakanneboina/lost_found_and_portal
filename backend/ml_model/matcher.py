"""
ML Matching Engine
Combines image similarity and text similarity to find best matches.
"""

from .image_matching import compute_image_similarity, batch_compare
from .text_similarity import compute_text_similarity, batch_text_compare

# Match threshold - items with final score above this are considered matches
MATCH_THRESHOLD = 0.60  # 60% combined similarity

# Weights for combining scores
IMAGE_WEIGHT = 0.55
TEXT_WEIGHT = 0.45


def compute_final_score(image_sim, text_sim):
    """
    Combine image and text similarity into a final score.
    """
    return (image_sim * IMAGE_WEIGHT) + (text_sim * TEXT_WEIGHT)


def find_matches(new_item, candidate_items, item_type='found'):
    """
    Find matches for a new item against a list of candidates.
    
    new_item: dict with itemName, description, category, location, featureVector
    candidate_items: list of item dicts
    item_type: 'found' (new found item matching against lost items) or 'lost'
    
    Returns: list of match dicts sorted by finalScore, only above threshold
    """
    if not candidate_items:
        return []
    
    matches = []
    new_features = new_item.get('featureVector')
    
    # Get text similarities for all candidates
    text_results = {r['id']: r['textSimilarity'] 
                    for r in batch_text_compare(new_item, candidate_items)}
    
    for candidate in candidate_items:
        cand_id = str(candidate['_id'])
        
        # Image similarity
        cand_features = candidate.get('featureVector')
        image_sim = compute_image_similarity(new_features, cand_features) if (new_features and cand_features) else 0.3
        
        # Text similarity
        text_sim = text_results.get(cand_id, 0.0)
        
        # Final combined score
        final_score = compute_final_score(image_sim, text_sim)
        
        if final_score >= MATCH_THRESHOLD:
            matches.append({
                'candidateId': cand_id,
                'imageSimilarity': round(image_sim, 4),
                'textSimilarity': round(text_sim, 4),
                'finalScore': round(final_score, 4),
                'candidate': candidate
            })
    
    # Sort by final score
    matches.sort(key=lambda x: x['finalScore'], reverse=True)
    return matches
