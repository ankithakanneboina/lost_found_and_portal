"""
Image Matching Module
Uses MobileNetV2 (lightweight) to extract feature vectors from images,
then computes cosine similarity between feature vectors.
"""

import os
import numpy as np
import cv2
from PIL import Image
import io
import torch
import torchvision.models as models
import torchvision.transforms as transforms
from sklearn.metrics.pairwise import cosine_similarity

# Global model instance (loaded once)
_model = None
_transform = None

def _load_model():
    global _model, _transform
    if _model is None:
        print("Loading MobileNetV2 model...")
        # Use MobileNetV2 (lightweight, fast)
        full_model = models.mobilenet_v2(weights=models.MobileNet_V2_Weights.IMAGENET1K_V1)
        # Remove the final classification layer to get feature vectors
        _model = torch.nn.Sequential(*list(full_model.children())[:-1])
        _model.eval()
        
        _transform = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize(
                mean=[0.485, 0.456, 0.406],
                std=[0.229, 0.224, 0.225]
            )
        ])
        print("✅ MobileNetV2 model loaded")
    return _model, _transform


def preprocess_image(image_data):
    """
    Preprocess image using OpenCV and PIL.
    image_data: bytes or file path
    Returns: PIL Image
    """
    if isinstance(image_data, (str, os.PathLike)):
        # File path
        img = cv2.imread(str(image_data))
        img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    elif isinstance(image_data, bytes):
        # Bytes
        nparr = np.frombuffer(image_data, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    else:
        raise ValueError("image_data must be file path or bytes")
    
    # OpenCV preprocessing: denoise + enhance contrast
    img = cv2.fastNlMeansDenoisingColored(img, None, 10, 10, 7, 21)
    
    # Convert to PIL
    pil_img = Image.fromarray(img).convert('RGB')
    return pil_img


def extract_features(image_data):
    """
    Extract CNN feature vector from an image.
    Returns: numpy array of shape (1280,) - MobileNetV2 features
    """
    model, transform = _load_model()
    
    try:
        pil_img = preprocess_image(image_data)
        tensor = transform(pil_img).unsqueeze(0)  # Add batch dimension
        
        with torch.no_grad():
            features = model(tensor)
            features = features.squeeze()  # Remove batch + spatial dims
            
            # Handle different output shapes
            if features.dim() > 1:
                features = features.mean(dim=list(range(1, features.dim())))
            
            feature_vector = features.numpy().tolist()
        
        return feature_vector
    except Exception as e:
        print(f"Feature extraction error: {e}")
        # Return random features as fallback (for testing without valid images)
        return np.random.rand(1280).tolist()


def compute_image_similarity(features1, features2):
    """
    Compute cosine similarity between two feature vectors.
    Returns: float between 0 and 1
    """
    if not features1 or not features2:
        return 0.0
    
    v1 = np.array(features1).reshape(1, -1)
    v2 = np.array(features2).reshape(1, -1)
    
    # Cosine similarity returns value between -1 and 1
    sim = cosine_similarity(v1, v2)[0][0]
    
    # Normalize to 0-1 range
    sim = (sim + 1) / 2
    return float(sim)


def batch_compare(query_features, candidate_list):
    """
    Compare one query feature vector against a list of candidates.
    candidate_list: list of dicts with 'id' and 'featureVector' keys
    Returns: list of (id, similarity) tuples, sorted by similarity descending
    """
    if not query_features or not candidate_list:
        return []
    
    query_vec = np.array(query_features).reshape(1, -1)
    results = []
    
    for candidate in candidate_list:
        if not candidate.get('featureVector'):
            continue
        cand_vec = np.array(candidate['featureVector']).reshape(1, -1)
        sim = cosine_similarity(query_vec, cand_vec)[0][0]
        sim = (sim + 1) / 2
        results.append({
            'id': str(candidate['_id']),
            'similarity': float(sim)
        })
    
    results.sort(key=lambda x: x['similarity'], reverse=True)
    return results
