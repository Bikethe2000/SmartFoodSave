# 🌿 SmartFoodSave — AI‑Powered Food Waste Management for School Cafeterias

SmartFoodSave is a full‑stack, AI‑powered platform designed to help school cafeterias **visualize**, **predict**, and **reduce** food waste.  
Built for the **USAII Global AI Hackathon 2026**, it combines a modern React dashboard, a mobile app, and a shared backend powered by Firebase and Python/Flask.

The goal:  
👉 Turn food waste from an *invisible* problem into a *visible, predictable, and manageable* one.

---

## 📁 Project Structure

```
FoodWasteAI/
├── backend/                 # Python Flask API (port 5000)
│   ├── app.py
│   ├── requirements.txt
│   ├── .env.example
│   └── README.md
│
├── site/                    # React web dashboard (port 5173)
│   ├── src/
│   ├── vite.config.js
│   ├── package.json
│   └── README.md
│
├── mobile_app/              # Flutter mobile app (shared backend)
│   └── lib/
│
├── serviceAccountKey.json   # Firebase Admin credentials (ignored in git)
└── FIREBASE_SETUP.md        # Firebase configuration guide
```

---

## 🚀 Quick Start

### 1️⃣ Backend Setup (Flask API)

```bash
cd backend
cp .env.example .env
pip install -r requirements.txt
python app.py
```

Backend runs at:  
**http://localhost:5000**

---

### 2️⃣ Web Dashboard (React + Vite)

```bash
cd site
cp .env.example .env
npm install
npm run dev
```

Frontend runs at:  
**http://localhost:5173**

---

### 3️⃣ Mobile App (Flutter)

```bash
cd mobile_app
flutter pub get
flutter run
```

Make sure the app points to:  
**http://localhost:5000**

---

## 🏗️ Architecture Overview

```
Web Dashboard        Mobile App
     ↓                   ↓
   React              Flutter
     ↓                   ↓
  Vite Proxy ↴       Direct HTTP
           ↓           ↓
     Flask Backend (port 5000)
              ↓
     Firebase Admin SDK
              ↓
  Firestore Database + Auth
```

---

## 🔧 Firebase Configuration

Both web and mobile require Firebase credentials.  
See **FIREBASE_SETUP.md** for full instructions.

### Required Firebase Services
- Firestore Database  
- Firebase Authentication  
- Service Account (backend)  
- Web API Key (frontend/mobile)  

### Firestore Collections
- `predictions`
- `recommendations`
- `dailyLogs`
- `school_schedules`

---

## 🔐 Environment Variables

### Backend (`backend/.env`)
```
PORT=5000
FIREBASE_PROJECT_ID=
FIREBASE_PRIVATE_KEY=
FIREBASE_CLIENT_EMAIL=
FIREBASE_API_KEY=
```

### Web (`site/.env`)
```
VITE_API_BASE=http://localhost:5000
```

### Mobile (`mobile_app/.env`)
```
API_BASE_URL=http://localhost:5000
```

---

## 📡 API Endpoints

All endpoints require:

```
Authorization: Bearer <Firebase ID Token>
```

### 📊 Dashboard
- `GET /api/stats/weekly-waste`
- `GET /api/predictions/upcoming`
- `GET /api/recommendations/today`

### 🔮 Predictions
- `GET /api/predictions`
- `GET /api/predictions/:id`
- `POST /api/predictions`

### 🧠 Recommendations
- `GET /api/recommendations`
- `POST /api/recommendations/:id/accept`
- `POST /api/recommendations/:id/ignore`
- `POST /api/recommendations`

### 📘 Daily Logs
- `GET /api/data/daily-logs`
- `POST /api/data/daily-logs`

---

## ✨ Key Features

- **AI‑powered waste forecasting**
- **High‑risk day detection**
- **Actionable recommendations**
- **Weekly meal plan editor**
- **Daily logging system**
- **Real‑time Firestore updates**
- **Firebase Authentication**
- **Shared backend for web + mobile**
- **Responsive UI (TailwindCSS)**

---

## 🛠️ Tech Stack

### Backend
- Python Flask  
- Firebase Admin SDK  
- Firestore  
- JWT Auth (Firebase tokens)

### Web
- React + Vite  
- TailwindCSS  
- Recharts  
- Firebase Auth  

### Mobile
- Flutter  
- Firebase Auth  
- REST API client  

---

## 🧪 Development Workflow

### Run Backend
```bash
cd backend
python app.py
```

### Run Web
```bash
cd site
npm run dev
```

### Run Mobile
```bash
cd mobile_app
flutter run
```

---

## 🧰 Testing the API

### 1. Login to get token
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}'
```

### 2. Use token
```bash
curl -X GET http://localhost:5000/api/stats/weekly-waste \
  -H "Authorization: Bearer <TOKEN>"
```

---

## 🚀 Deployment

### Backend
- Deploy to Render, Railway, Heroku, AWS, or GCP  
- Set environment variables  

### Web
- Deploy to Vercel, Netlify, Firebase Hosting  

### Mobile
- Build APK/IPA  
- Configure production API URL  

### Firebase
- Switch to Blaze plan for production  

---

## 🔒 Security

- Firebase ID token verification on every request  
- Firestore security rules  
- No private keys in Git  
- HTTPS recommended for production  

---

## 🏁 License
MIT License — free to use, modify, and distribute.
