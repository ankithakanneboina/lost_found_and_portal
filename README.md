# 🔍 Real-Time Lost & Found Portal — ML Powered

A full-stack web application that uses **Machine Learning** to automatically match lost and found items, with **real-time Socket.IO notifications**.

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (React.js)                   │
│  Home │ Login │ Register │ Report │ Browse │ Dashboard  │
│               Tailwind CSS + Socket.IO Client           │
└───────────────────────┬─────────────────────────────────┘
                        │ HTTP / WebSocket
┌───────────────────────▼─────────────────────────────────┐
│               BACKEND (Flask + Socket.IO)               │
│  /api/auth  │  /api/items  │  /api/matches  │ /api/admin│
│           JWT Auth  │  File Upload  │  CORS            │
└──────────┬────────────────────────┬────────────────────┘
           │                        │
┌──────────▼──────────┐  ┌──────────▼──────────────────┐
│   MongoDB Database  │  │     ML Pipeline              │
│  users              │  │  ┌─────────────────────────┐ │
│  lost_items         │  │  │ MobileNetV2 (PyTorch)   │ │
│  found_items        │  │  │ → 1280-dim feature vec  │ │
│  matches            │  │  │ → Cosine similarity     │ │
└─────────────────────┘  │  ├─────────────────────────┤ │
                         │  │ TF-IDF + Sentence Trans │ │
                         │  │ → Text similarity score │ │
                         │  ├─────────────────────────┤ │
                         │  │ Final Score             │ │
                         │  │ = 55% image + 45% text  │ │
                         │  └─────────────────────────┘ │
                         └─────────────────────────────┘
```

---

## 📁 Project Structure

```
lost-found-ml-portal/
├── backend/
│   ├── app.py                    # Flask app + Socket.IO setup
│   ├── seed_data.py              # DB seed script
│   ├── .env                      # Environment variables
│   ├── requirements.txt
│   ├── database/
│   │   ├── __init__.py
│   │   └── connection.py         # MongoDB connection + indexes
│   ├── routes/
│   │   ├── __init__.py
│   │   ├── auth.py               # Register / Login / JWT
│   │   ├── items.py              # Lost & Found item CRUD
│   │   ├── matches.py            # ML matching + notifications
│   │   └── admin.py              # Admin CRUD
│   ├── ml_model/
│   │   ├── __init__.py
│   │   ├── image_matching.py     # MobileNetV2 CNN feature extraction
│   │   ├── text_similarity.py    # TF-IDF + Sentence Transformers
│   │   ├── matcher.py            # Combined scoring engine
│   │   └── test_ml.py            # ML pipeline test script
│   └── utils/
│       └── helpers.py            # File save, serialization, pagination
│
└── frontend/
    ├── package.json
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── .env
    └── src/
        ├── App.js                # Router + providers
        ├── index.js
        ├── index.css             # Tailwind + custom styles
        ├── context/
        │   ├── AuthContext.js    # JWT auth state
        │   └── NotifContext.js   # Real-time notifications state
        ├── services/
        │   ├── api.js            # Axios API client
        │   └── socket.js         # Socket.IO client
        ├── hooks/
        │   └── useItemForm.js    # Shared form logic
        ├── components/
        │   ├── Navbar.js         # Navigation + notification bell
        │   ├── ItemCard.js       # Item display card
        │   ├── MatchCard.js      # ML match with score bars
        │   ├── ImageDropzone.js  # Drag-and-drop image upload
        │   └── StatsBar.js       # Live stats counters
        └── pages/
            ├── Home.js           # Landing page
            ├── Login.js
            ├── Register.js
            ├── ReportLost.js
            ├── ReportFound.js
            ├── Browse.js         # Search + filter items
            ├── Dashboard.js      # User's items
            ├── Matches.js        # ML matches view
            └── AdminPanel.js     # Admin dashboard
```

---

## ⚙️ Prerequisites

| Tool        | Version   | Install                          |
|-------------|-----------|----------------------------------|
| Python      | 3.10+     | https://python.org               |
| Node.js     | 18+       | https://nodejs.org               |
| MongoDB     | 6+        | https://mongodb.com/try/download |
| pip         | latest    | `python -m pip install --upgrade pip` |

---

## 🚀 Setup Instructions

### Step 1 — Clone / Extract Project

```bash
cd lost-found-ml-portal
```

### Step 2 — Start MongoDB

```bash
# macOS/Linux (Homebrew)
brew services start mongodb-community

# Ubuntu/Debian
sudo systemctl start mongod

# Windows — run as a service or:
"C:\Program Files\MongoDB\Server\6.0\bin\mongod.exe"

# Verify it's running:
mongosh --eval "db.runCommand({ connectionStatus: 1 })"
```

### Step 3 — Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate
# macOS/Linux:
source venv/bin/activate
# Windows:
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# This downloads ~800MB (PyTorch + MobileNetV2 weights)
# Go get a coffee ☕ — this is a one-time download
```

### Step 4 — Configure Environment

Edit `backend/.env` if needed (defaults work for local dev):
```env
MONGO_URI=mongodb://localhost:27017/
DB_NAME=lost_found_portal
JWT_SECRET_KEY=change-this-in-production
PORT=5000
```

### Step 5 — Seed Sample Data (Optional but recommended)

```bash
# From backend/ with venv active:
python seed_data.py
```

This creates:
- 4 test users (login: `alice@example.com` / `password123`)
- 6 lost items + 4 found items with descriptions
- Pre-computed ML matches

### Step 6 — Test the ML Pipeline

```bash
python ml_model/test_ml.py
```

Expected output:
```
✅ Text similarity PASSED
✅ Image features PASSED
✅ Matcher PASSED
```

### Step 7 — Start Backend Server

```bash
python app.py
# → Running on http://localhost:3000
# → Socket.IO ready
```

### Step 8 — Frontend Setup

```bash
# New terminal window:
cd frontend
npm install
npm start
# → Opens http://localhost:3000
```

---

## 🎯 How to Use

### Register & Login
1. Visit `http://localhost:3000`
2. Click **Sign Up** → create account
3. Or use seed credentials: `alice@example.com` / `password123`

### Report a Lost Item
1. Click **Report Lost** in nav
2. Fill in item name, category, description, location, date
3. Upload a photo (enables CNN image matching)
4. Submit → ML matching runs automatically in background

### Report a Found Item
1. Click **Report Found**
2. Fill in details + upload photo
3. Submit → system immediately compares against all lost items
4. If score ≥ 60%, a match is created and the lost item owner gets a **real-time notification**

### View Matches
1. Click **Matches** in nav
2. See all ML-matched pairs with score breakdown:
   - 📸 Image Similarity (MobileNetV2 cosine similarity)
   - 📝 Text Similarity (TF-IDF + Sentence Transformers)
   - ⚡ Final Score (55% image + 45% text)
3. Click **Submit Claim Request** to connect with the other party

### Notifications
- The 🔔 bell in the navbar shows real-time Socket.IO notifications
- You'll see alerts like: *"🎯 Potential match found! 82.5% similarity"*

### Admin Panel
1. Create admin account via API:
```bash
curl -X POST http://localhost:5000/api/admin/create-admin \
  -H "Content-Type: application/json" \
  -d '{"name":"Admin","email":"admin@portal.com","password":"admin123"}'
```
2. Login with admin credentials
3. Visit `/admin` to manage all items, view matches, moderate content

---

## 🤖 ML Pipeline Explained

### Image Matching (55% weight)

```
Input Image
    ↓
OpenCV preprocessing
(denoise, color convert)
    ↓
PIL Image → Tensor (224×224, normalized)
    ↓
MobileNetV2 (pretrained ImageNet weights)
    ↓
Remove classification head
    ↓
1280-dimensional feature vector
    ↓
Stored in MongoDB as featureVector[]
    ↓
Cosine Similarity between two vectors
= dot(v1, v2) / (|v1| × |v2|)
    ↓
Normalized to [0, 1]
```

### Text Matching (45% weight)

```
Item fields: name × 3, category × 2, description, location
    ↓
Preprocessing: lowercase, remove punctuation, normalize whitespace
    ↓
TF-IDF Vectorizer (bigrams, sublinear_tf=True)
    ↓
Cosine Similarity between TF-IDF vectors (40%)
    +
Sentence Transformers: all-MiniLM-L6-v2 (50%)
    +
Category exact match bonus (+10%)
    ↓
Combined text similarity score [0, 1]
```

### Scoring

```
finalScore = (imageSim × 0.55) + (textSim × 0.45)

If finalScore ≥ 0.60 (60%):
  → Create match record in MongoDB
  → Emit Socket.IO event to lost item owner's room
  → Owner sees real-time notification
```

---

## 🌐 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Login → JWT token |
| GET | `/api/auth/me` | Get current user |
| PUT | `/api/auth/update-profile` | Update profile |

### Items
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/items/lost` | Report lost item (multipart) |
| POST | `/api/items/found` | Report found item (multipart) |
| GET | `/api/items/lost` | List lost items (pagination, search) |
| GET | `/api/items/found` | List found items |
| GET | `/api/items/my-items` | Current user's items |
| PUT | `/api/items/lost/:id/resolve` | Mark as resolved |
| GET | `/api/items/images/:filename` | Serve uploaded image |

### Matches
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/matches/` | Get my matches |
| GET | `/api/matches/all` | All matches (paginated) |
| GET | `/api/matches/stats` | Platform statistics |
| POST | `/api/matches/:id/claim` | Submit claim |

### Admin (requires admin JWT)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/dashboard` | Admin stats |
| GET | `/api/admin/items/lost` | All lost items |
| GET | `/api/admin/items/found` | All found items |
| DELETE | `/api/admin/items/lost/:id` | Delete lost item |
| DELETE | `/api/admin/items/found/:id` | Delete found item |
| GET | `/api/admin/users` | All users |

---

## 🔌 Socket.IO Events

| Event | Direction | Payload |
|-------|-----------|---------|
| `connect` | Client → Server | — |
| `join` | Client → Server | `{ userId: string }` |
| `match_notification` | Server → Client | `{ type, matchId, score, lostItem, foundItem, message }` |

---

## 📊 Database Schema (MongoDB)

### users
```json
{
  "_id": "ObjectId",
  "name": "string",
  "email": "string (unique)",
  "password": "bcrypt hash",
  "phone": "string",
  "role": "user | admin",
  "createdAt": "ISODate"
}
```

### lost_items / found_items
```json
{
  "_id": "ObjectId",
  "userId": "string",
  "itemName": "string",
  "description": "string",
  "category": "string",
  "location": "string",
  "dateLost/dateFound": "string",
  "contact": "string",
  "image": "filename | null",
  "featureVector": "[float × 1280] | null",
  "status": "active | resolved",
  "createdAt": "ISODate"
}
```

### matches
```json
{
  "_id": "ObjectId",
  "lostItemId": "string",
  "foundItemId": "string",
  "lostUserId": "string",
  "foundUserId": "string",
  "imageSimilarity": "float [0-1]",
  "textSimilarity": "float [0-1]",
  "finalScore": "float [0-1]",
  "status": "pending | claimed",
  "createdAt": "ISODate"
}
```

---

## 🔧 Configuration

### Tuning the Match Threshold

In `backend/ml_model/matcher.py`:
```python
MATCH_THRESHOLD = 0.60  # Lower = more matches, Higher = more precise
IMAGE_WEIGHT = 0.55     # Weight for image similarity
TEXT_WEIGHT  = 0.45     # Weight for text similarity
```

### Changing the ML Model

In `backend/ml_model/image_matching.py`, swap MobileNetV2 for ResNet50:
```python
# Replace:
full_model = models.mobilenet_v2(weights=models.MobileNet_V2_Weights.IMAGENET1K_V1)
_model = torch.nn.Sequential(*list(full_model.children())[:-1])

# With:
full_model = models.resnet50(weights=models.ResNet50_Weights.IMAGENET1K_V1)
_model = torch.nn.Sequential(*list(full_model.children())[:-1])
# Note: ResNet50 outputs 2048-dim vectors instead of 1280
```

---

## 🐛 Troubleshooting

**MongoDB connection refused**
```bash
sudo systemctl start mongod  # Linux
brew services start mongodb-community  # macOS
```

**PyTorch install fails on M1 Mac**
```bash
pip install torch torchvision --index-url https://download.pytorch.org/whl/cpu
```

**Port 5000 in use (macOS AirPlay)**
```bash
# Edit backend/.env:
PORT=5001
# Edit frontend/.env:
REACT_APP_API_URL=http://localhost:5001/api
REACT_APP_SOCKET_URL=http://localhost:5001
```

**CORS errors**
Ensure `REACT_APP_API_URL` in `frontend/.env` matches the Flask server address exactly.

**Sentence Transformers slow on first run**
The `all-MiniLM-L6-v2` model (~90MB) is downloaded on first use and cached. Subsequent runs are instant.

---

## 🔐 Security Notes for Production

1. Change `JWT_SECRET_KEY` to a strong random string
2. Set `MONGO_URI` to a secured MongoDB Atlas connection string
3. Enable HTTPS / WSS
4. Remove `/api/admin/create-admin` endpoint (one-time use only)
5. Add rate limiting with `flask-limiter`
6. Store uploaded images in S3 instead of local filesystem

---

## 📦 Tech Stack Summary

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Tailwind CSS, React Router v6 |
| Real-time | Socket.IO (client + server) |
| HTTP Client | Axios |
| Backend | Python Flask 3, Flask-SocketIO |
| Auth | JWT (flask-jwt-extended), bcrypt |
| Database | MongoDB + PyMongo |
| ML – Images | PyTorch, MobileNetV2, OpenCV, Pillow |
| ML – Text | scikit-learn TF-IDF, Sentence Transformers |
| Similarity | Cosine similarity (sklearn) |

---

Built with ❤️  — Lost & Found Portal ML
