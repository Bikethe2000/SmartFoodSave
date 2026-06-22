# SmartFoodSave - AI-Powered Food Waste Management

SmartFoodSave is a full-stack platform for reducing food waste in school cafeterias.

The project currently includes:
- A FastAPI backend with Firebase Admin + Firestore
- A React + Vite dashboard web app
- An Expo React Native mobile app
- A separate React + Vite documentation site

## Project Structure

```text
FoodWasteAI/
|- backend/        # FastAPI API + ML logic
|- site/           # Main React dashboard
|- myApp/          # Expo mobile app (React Native + TypeScript)
|- docs/           # Documentation website
|- serviceAccountKey.json
|- README.md
```

## Tech Stack

### Backend
- FastAPI + Uvicorn
- Firebase Admin SDK
- Firestore
- scikit-learn + pandas + numpy
- sentence-transformers
- OpenAI API (selected AI features)

### Frontend (Dashboard)
- React
- Vite
- Tailwind CSS
- Firebase Web SDK

### Mobile
- Expo
- React Native + TypeScript
- Expo Router
- Firebase Web SDK

## Quick Start

## 1) Backend (FastAPI)

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python app.py
```

Backend runs on http://localhost:5000 by default.

## 2) Dashboard Web App

```bash
cd site
npm install
npm run dev
```

Dashboard runs on http://localhost:5173.

## 3) Mobile App (Expo)

```bash
cd myApp
npm install
npm run start
```

Then open with Expo Go or run platform-specific scripts:

```bash
npm run android
npm run ios
npm run web
```

## 4) Docs Site (Optional)

```bash
cd docs
npm install
npm run dev
```

## Environment Variables

## Backend (.env)

Create backend/.env manually (no template file is currently committed):

```env
PORT=5000
FIREBASE_SERVICE_ACCOUNT_PATH=/absolute/path/to/serviceAccountKey.json
FIREBASE_SERVICE_ACCOUNT={"type":"service_account",...}
FIREBASE_API_KEY=your_firebase_web_api_key
OPENAI_API_KEY=your_openai_key
GOOGLE_MAPS_API_KEY=your_google_maps_key
RESEND_API_KEY=your_resend_key
SMTP_USER=optional_legacy_value
SMTP_PASS=optional_legacy_value
```

Notes:
- backend/app.py currently requires FIREBASE_SERVICE_ACCOUNT JSON content when a service account path is provided.
- If serviceAccountKey.json exists at repo root, backend app startup can discover it automatically.

## Mobile (myApp/.env)

Use myApp/.env.example as reference:

```env
EXPO_PUBLIC_FIREBASE_API_KEY=
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=
EXPO_PUBLIC_FIREBASE_PROJECT_ID=
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
EXPO_PUBLIC_FIREBASE_APP_ID=
```

## Web and API Base URLs

- site/src/api.js currently points to production API by default:
  https://foodwasteai-production.up.railway.app/api
- myApp/src/api.ts currently points to production API by default:
  https://foodwasteai-production.up.railway.app/api

If you want both clients to use local backend, update those constants to:

```text
http://localhost:5000/api
```

## API Overview

Base URL (local):

```text
http://localhost:5000
```

Public endpoints:
- GET /health
- POST /api/contact
- POST /api/auth/send-otp
- POST /api/auth/verify-otp

Authenticated endpoints (Firebase ID token in Authorization header):

```text
Authorization: Bearer <Firebase ID Token>
```

- GET /api/settings
- POST /api/settings
- GET /api/data/daily-logs
- POST /api/data/daily-logs
- GET /api/schedule
- POST /api/schedule
- GET /api/meals/dictionary
- POST /api/meals/dictionary
- GET /api/meals/tags
- POST /api/meals/tags
- POST /api/meals/normalize
- POST /api/meals/combine
- GET /api/donations/nearby
- POST /api/predict

## Architecture

```text
Dashboard (site) ----->
                      |
Mobile (myApp) ------> FastAPI backend (backend/app.py) --> Firebase Admin --> Firestore/Auth
                      |
Docs (docs) ----------> Static/documentation frontend
```

## Development Notes

- Backend CORS is configured for selected production and local origins.
- Prediction logic lives in backend/engine/.
- Meal normalization and recommendation helpers are in backend/app.py and backend/engine/.

## Security

- Protect service account credentials and never commit private keys.
- Keep all API keys in environment variables.
- Use HTTPS in production.

## License

MIT
