# SmartFoodSave - AI-Powered Food Waste Management

Full-stack application for school cafeterias to visualize, predict, and reduce food waste using Firebase and Python Flask backend.

## Project Structure

```
FoodWasteAI/
├── backend/              # Shared Python Flask API server (port 5000)
│   ├── app.py
│   ├── requirements.txt
│   ├── .env.example
│   └── README.md
├── site/                 # React web frontend (port 5173)
│   ├── src/
│   ├── vite.config.js
│   ├── package.json
│   └── README.md
├── mobile_app/           # Flutter mobile app
│   └── (uses same backend API)
├── serviceAccountKey.json # Firebase Admin credentials (shared)
└── FIREBASE_SETUP.md      # Firebase configuration guide
```

## Quick Start

### 1. Backend Setup (Shared for Web + Mobile)

```bash
cd backend
cp .env.example .env
# Edit .env with your Firebase credentials
npm install
npm run dev
```

Backend runs on `http://localhost:5000`

### 2. Web Frontend

```bash
cd site
cp .env.example .env
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`

### 3. Mobile App

```bash
cd mobile_app
# Configure to connect to backend at http://localhost:5000
npm install
npm start
```

## Architecture

```
Web Browser          Mobile App
     ↓                   ↓
   React              React Native
     ↓                   ↓
  Vite Proxy ↴       Direct HTTP
           ↓           ↓
    Shared Express Backend (port 5000)
              ↓
    Firebase Admin SDK
              ↓
    Firestore Database + Auth
```

## Firebase Configuration

Both the web and mobile apps require Firebase credentials. See [FIREBASE_SETUP.md](FIREBASE_SETUP.md) for detailed instructions.

Key requirements:
- Firebase project with Firestore database
- Service account key for backend (`serviceAccountKey.json`)
- Web API key for client-side auth
- Firestore collections: `predictions`, `recommendations`, `dailyLogs`

## Environment Variables

### Backend (`backend/.env`)
- `PORT` - Server port (default: 5000)
- `FIREBASE_PROJECT_ID` - Firebase project ID
- `FIREBASE_PRIVATE_KEY` - Private key from service account
- `FIREBASE_CLIENT_EMAIL` - Service account email
- `FIREBASE_API_KEY` - Web API key for login proxy

### Web Frontend (`site/.env`)
- `VITE_API_BASE` - Backend URL (default: http://localhost:5000)

### Mobile App (`mobile_app/.env`)
- `API_BASE_URL` - Backend URL
- Firebase web config

## API Endpoints

All endpoints require Firebase authentication token in `Authorization: Bearer <token>` header.

### Dashboard
- `GET /api/stats/weekly-waste` - Weekly waste trends
- `GET /api/predictions/upcoming` - High-risk predictions
- `GET /api/recommendations/today` - Top 3 recommendations

### Predictions
- `GET /api/predictions` - List predictions with date filtering
- `GET /api/predictions/:id` - Prediction details
- `POST /api/predictions` - Create prediction

### Recommendations
- `GET /api/recommendations` - All recommendations
- `POST /api/recommendations/:id/accept` - Accept recommendation
- `POST /api/recommendations/:id/ignore` - Ignore recommendation
- `POST /api/recommendations` - Create recommendation

### Data Logs
- `GET /api/data/daily-logs` - List logs
- `POST /api/data/daily-logs` - Add daily log

## Key Features

✅ **Firebase Authentication** - Email/password with ID tokens
✅ **Real-time Data** - Firestore for live updates
✅ **Responsive UI** - TailwindCSS for web, React Native for mobile
✅ **Charts & Analytics** - Recharts for web, React Native charts for mobile
✅ **Shared Backend** - Single API for web and mobile
✅ **Production Ready** - CORS, auth verification, error handling

## Technology Stack

- **Backend**: Express.js, Firebase Admin SDK, Node.js
- **Web**: React, Vite, TailwindCSS, Recharts
- **Mobile**: React Native (configured to use same backend)
- **Database**: Firebase Firestore
- **Auth**: Firebase Authentication

## Development

### Running All Services

Terminal 1 (Backend):
```bash
cd backend && npm run dev
```

Terminal 2 (Web):
```bash
cd site && npm run dev
```

Terminal 3 (Mobile):
```bash
cd mobile_app && npm start
```

### Testing the API

Use curl or Postman to test endpoints after getting a token:

```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password"}'

# Use returned token to call protected endpoints
curl -X GET http://localhost:5000/api/stats/weekly-waste \
  -H "Authorization: Bearer <TOKEN>"
```

## Deployment

For production deployment:

1. **Backend**: Deploy to Node.js hosting (Heroku, Render, AWS, etc.)
2. **Web**: Deploy to static hosting (Vercel, Netlify, AWS S3, etc.)
3. **Mobile**: Build for iOS/Android and deploy to app stores
4. **Firebase**: Use Firebase Blaze plan for production loads

Update `.env` variables in each deployment with production URLs.

## Security

- All endpoints require Firebase ID token verification
- Firestore security rules limit data to authenticated user
- Private keys stored in environment variables only
- Service account key not committed to git (in .gitignore)
