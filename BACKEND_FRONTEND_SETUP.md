# Backend + Frontend Integration Guide

All website data now saves to Firestore through the backend server. Follow these steps to run both together.

## Prerequisites

1. ✅ Firebase project created and configured
2. ✅ Firestore database set up (Test mode)
3. ✅ Firebase Admin SDK credentials (serviceAccountKey.json or environment variables)
4. ✅ Backend .env file configured
5. ✅ Frontend updated to use backend (VITE_API_BASE configured)

## Directory Structure

```
site/
├── .env              ✓ Frontend config (VITE_API_BASE)
├── .env.example      ✓ Template for frontend
├── server/
│   ├── server.js     ✓ Backend with Firestore
│   ├── .env          ✓ Backend config (FIREBASE_*)
│   └── serviceAccountKey.json ✓ Firebase credentials
└── src/
    ├── api.js        ✓ Frontend API client
    └── firebase.js   ✓ Firebase config
```

## Backend Setup

### Step 1: Create Backend Environment File

Create `site/server/.env`:

```
# Server port
PORT=5000

# Firebase Admin Credentials (Choose ONE method)

# Method 1: Environment Variables
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\nyour-key-content\n-----END PRIVATE KEY-----\n
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxx@your-project.iam.gserviceaccount.com

# Method 2: Service Account File Path
# FIREBASE_SERVICE_ACCOUNT_PATH=./serviceAccountKey.json

# Frontend API authentication
FIREBASE_API_KEY=your-web-api-key
```

### Step 2: Place Firebase Credentials

**Option A: Service Account File**
1. Go to Firebase Console → Project Settings → Service Accounts
2. Generate new private key → Save as `site/server/serviceAccountKey.json`
3. Update `server/.env`: `FIREBASE_SERVICE_ACCOUNT_PATH=./serviceAccountKey.json`

**Option B: Environment Variables**
1. Copy credentials from service account JSON
2. Set in `server/.env` as shown above

### Step 3: Install Dependencies

```bash
cd site
npm install
```

## Frontend Setup

### Step 1: Update Firebase Config

Edit `site/src/firebase.js`:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123def456"
};
```

### Step 2: Verify Backend URL

File `site/.env` should contain:

```
VITE_API_BASE=http://localhost:5000
```

For production, change to: `VITE_API_BASE=https://your-backend-domain.com`

## Running Everything

### Terminal 1: Backend Server

```bash
cd site
npm run server
```

Output should show:
```
✓ SmartFoodSave Backend running on port 5000
✓ Connected to Firestore
```

### Terminal 2: Frontend Dev Server

```bash
cd site
npm run dev
```

Output should show:
```
  ➜  Local:   http://localhost:5173/
```

## Data Flow

```
React Component
    ↓
api.js (with auth token)
    ↓
HTTP Request to Backend (VITE_API_BASE)
    ↓
Backend server.js (verify token)
    ↓
Firebase Admin SDK
    ↓
Firestore Database
    ↓ (response)
React Component Updates
```

## API Endpoints

All endpoints require Firebase auth token in `Authorization: Bearer <token>` header.

### Authentication
- **POST** `/api/auth/login` - Login with email/password

### Data Operations
- **GET** `/api/stats/weekly-waste` - Get weekly waste stats
- **GET** `/api/predictions` - Get predictions (with date range)
- **GET** `/api/predictions/:id` - Get prediction details
- **GET** `/api/predictions/upcoming` - Get high/medium risk
- **POST** `/api/predictions` - Create prediction
- **GET** `/api/recommendations` - Get recommendations
- **GET** `/api/recommendations/today` - Get pending recommendations
- **POST** `/api/recommendations` - Create recommendation
- **POST** `/api/recommendations/:id/accept` - Accept recommendation
- **POST** `/api/recommendations/:id/ignore` - Ignore recommendation
- **GET** `/api/data/daily-logs` - Get daily logs
- **POST** `/api/data/daily-logs` - Add daily log

## Testing the Integration

### Test 1: Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}'
```

### Test 2: Get Data (with token)
```bash
curl http://localhost:5000/api/predictions \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Test 3: Add Data
```bash
curl -X POST http://localhost:5000/api/data/daily-logs \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "date":"2026-06-14",
    "menuItems":["Pizza","Salad"],
    "prepared":100,
    "served":85,
    "leftovers":15
  }'
```

## Frontend Component Usage

### Example: Add Daily Log

```javascript
import { api } from './api';

async function logWaste() {
  try {
    const log = await api.addDailyLog({
      date: '2026-06-14',
      menuItems: ['Pizza', 'Salad'],
      prepared: 100,
      served: 85,
      leftovers: 15
    });
    console.log('Log saved to Firestore:', log);
  } catch (error) {
    console.error('Failed to save log:', error.message);
  }
}
```

### Example: Get Predictions

```javascript
import { useEffect, useState } from 'react';
import { api } from './api';

function PredictionsList() {
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPredictions() {
      try {
        const data = await api.getPredictions();
        setPredictions(data);
      } catch (error) {
        console.error('Failed to load predictions:', error.message);
      } finally {
        setLoading(false);
      }
    }
    loadPredictions();
  }, []);

  if (loading) return <div>Loading...</div>;
  return (
    <div>
      {predictions.map(pred => (
        <div key={pred.id}>{pred.title}</div>
      ))}
    </div>
  );
}
```

## Troubleshooting

### Backend won't start
- Check if port 5000 is already in use
- Verify Firebase credentials in `.env` or `serviceAccountKey.json`
- Check backend logs for authentication errors

### Frontend shows "Server request failed"
- Check `VITE_API_BASE` in `.env`
- Ensure backend is running on port 5000
- Check browser console for network errors

### "Invalid authentication token"
- Ensure user is logged in (Firebase Auth)
- Token might have expired - try logging out and back in
- Check backend's `authenticate` middleware logs

### "Permission denied" on Firestore
- Check Firestore security rules
- Ensure `userId` matches authenticated user's UID
- Verify collections exist in Firestore

### CORS errors
- Backend has CORS enabled for all origins
- If still getting errors, check browser console for details

## Production Deployment

### Backend (Node.js/Express)
1. Deploy to: Heroku, Railway, Render, or Cloud Run
2. Set production environment variables
3. Update `VITE_API_BASE` in frontend to production URL

### Frontend (React/Vite)
1. Build: `npm run build`
2. Deploy to: Vercel, Netlify, Firebase Hosting, or AWS S3
3. Update `VITE_API_BASE` to production backend URL

### Firestore
- Already cloud-based
- Monitor usage in Firebase Console
- Set up automated backups

## Security Checklist

✅ Backend validates Firebase tokens  
✅ Frontend uses HTTPS in production  
✅ Service account key is in .gitignore  
✅ Environment variables contain sensitive data  
✅ Firestore security rules restrict data access  
✅ Each user sees only their own data  
✅ CORS configured appropriately  

## Next Steps

1. ✅ Run backend: `npm run server`
2. ✅ Run frontend: `npm run dev`
3. ✅ Test login and data operations
4. ✅ Check Firestore console for saved data
5. ✅ Deploy when ready

---

**All website data is now saved to Firestore through the backend!** 🎉
