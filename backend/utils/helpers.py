import os
import uuid
from datetime import datetime
from werkzeug.utils import secure_filename
from flask import current_app

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}


def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


def save_uploaded_image(file):
    """
    Save uploaded image file and return the saved filename.
    """
    if not file or not file.filename:
        return None
    
    if not allowed_file(file.filename):
        raise ValueError(f"File type not allowed. Use: {', '.join(ALLOWED_EXTENSIONS)}")
    
    ext = file.filename.rsplit('.', 1)[1].lower()
    filename = f"{uuid.uuid4().hex}.{ext}"
    
    upload_folder = current_app.config['UPLOAD_FOLDER']
    filepath = os.path.join(upload_folder, filename)
    file.save(filepath)
    
    return filename


def get_image_path(filename):
    """Get full path for an image filename."""
    if not filename:
        return None
    upload_folder = current_app.config.get('UPLOAD_FOLDER', 'uploads')
    return os.path.join(upload_folder, filename)


def serialize_doc(doc):
    """Convert MongoDB document to JSON-serializable dict."""
    if doc is None:
        return None
    result = {}
    for key, value in doc.items():
        if key == '_id':
            result['_id'] = str(value)
        elif isinstance(value, datetime):
            result[key] = value.isoformat()
        elif isinstance(value, list):
            result[key] = [serialize_doc(v) if isinstance(v, dict) else v for v in value]
        elif isinstance(value, dict):
            result[key] = serialize_doc(value)
        else:
            result[key] = value
    return result


def serialize_docs(docs):
    """Serialize a list of MongoDB documents."""
    return [serialize_doc(doc) for doc in docs]


def paginate_query(collection, query, page=1, per_page=10, sort_field='createdAt', sort_order=-1):
    """Helper for paginated MongoDB queries."""
    skip = (page - 1) * per_page
    total = collection.count_documents(query)
    docs = list(collection.find(query)
                .sort(sort_field, sort_order)
                .skip(skip)
                .limit(per_page))
    return {
        'items': serialize_docs(docs),
        'total': total,
        'page': page,
        'per_page': per_page,
        'pages': (total + per_page - 1) // per_page
    }
