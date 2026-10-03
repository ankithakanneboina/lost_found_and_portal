import os


from flask import Flask
from flask_cors import CORS
from flask_socketio import SocketIO
from flask_jwt_extended import JWTManager
from dotenv import load_dotenv

from database.connection import init_db
from routes.auth import auth_bp
from routes.items import items_bp
from routes.matches import matches_bp
from routes.admin import admin_bp

load_dotenv()

app = Flask(__name__)

# Config
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'lost-found-super-secret-key-2024')
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB upload limit
app.config['UPLOAD_FOLDER'] = os.path.join(os.path.dirname(__file__), 'uploads')

os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Extensions
CORS(app, resources={r"/*": {"origins": "*"}})
jwt = JWTManager(app)
socketio = SocketIO(app, cors_allowed_origins="*", async_mode='threading')
# Database
init_db()

# Register blueprints
app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(items_bp, url_prefix='/api/items')
app.register_blueprint(matches_bp, url_prefix='/api/matches')
app.register_blueprint(admin_bp, url_prefix='/api/admin')

# Store socketio in app for access in routes
app.socketio = socketio

# Socket.IO events
@socketio.on('connect')
def handle_connect():
    print(f"Client connected")

@socketio.on('disconnect')
def handle_disconnect():
    print(f"Client disconnected")

@socketio.on('join')
def handle_join(data):
    from flask_socketio import join_room
    user_id = data.get('userId')
    if user_id:
        join_room(f"user_{user_id}")
        print(f"User {user_id} joined their room")

@app.route('/api/health')
def health():
    return {'status': 'ok', 'message': 'Lost & Found Portal API Running'}

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    print(f"Starting server on port {port}")
    socketio.run(app, host='0.0.0.0', port=port, debug=True)
