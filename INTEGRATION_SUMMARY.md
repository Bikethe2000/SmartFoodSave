# Firebase Integration - Implementation Summary

## Overview
Your Food Waste AI application has been successfully migrated to use Firebase for authentication and database (Firestore). This replaces the previous file-based backend system with a cloud-based solution.

## What Changed

### Frontend (site/src/)
- **firebase.js**: Configured for Firebase initialization (needs your credentials)
- **api.js**: Already fully implemented with Firebase SDK
  - Authentication: `login()`, `signup()`, `logout()`
  - Real-time data: `subscribeToPredictions()`, `subscribeToRecommendations()`
  - CRUD operations for all data types

### Backend (site/server/)
- **server.js**: Completely refactored to use Firestore instead of file storage
  - Removed: File-based data storage (data.json)
  - Added: Firebase Admin SDK integration
  - All endpoints now read/write to Firestore
  - Supports both environment variables and service account files for credentials

### Configuration Files
- **.env.example**: Template for backend environment variables
- **.gitignore**: Updated to protect `.env` files and `serviceAccountKey.json`

## Quick Start

### 1. Get Your Firebase Credentials
1. Create a Firebase project at https://console.firebase.google.com
2. Create a web app in Firebase Console
3. Copy the Firebase config values

### 2. Configure the Frontend
Open **site/src/firebase.js** and replace the placeholder values:
```javascript
const firebaseConfig = {
  apiKey: "YOUR_ACTUAL_API_KEY",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123def456"
};
```

### 3. Set Up Firestore Database
1. Go to Firebase Console → Firestore Database
2. Create database (start in Test mode for development)
3. Create collections: `predictions`, `recommendations`, `dailyLogs`
4. Set security rules (see FIREBASE_SETUP.md for details)

### 4. (Optional) Configure Backend
If you want to use the backend server with Admin SDK:

Create **site/.env** file:
```
PORT=5000
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY=your-private-key
FIREBASE_CLIENT_EMAIL=your-service-account-email
```

Or place **serviceAccountKey.json** in the **site/server/** directory.

### 5. Run Your App
```bash
cd site

# Frontend
npm run dev

# Backend (in another terminal)
npm run server
```

## Architecture

### Data Flow

**Frontend (Client-Side)**
```
React Components → api.js → Firebase SDK → Firestore
    ↓
    └─→ Firebase Authentication
```

**Backend (Optional)**
```
Express Server → Firebase Admin SDK → Firestore
```

### Collections Structure

**predictions**
```
{
  userId: string (user's UID)
  date: string (YYYY-MM-DD)
  menuItems: array[string]
  predictedWasteKg: number
  riskLevel: string (Low/Medium/High)
  confidence: number (0-1)
  explanation: string
  createdAt: timestamp
}
```

**recommendations**
```
{
  userId: string
  title: string
  description: string
  suggestedChange: string
  impactKg: number
  confidence: number
  status: string (pending/accepted/ignored)
  createdAt: timestamp
}
```

**dailyLogs**
```
{
  userId: string
  date: string (YYYY-MM-DD)
  menuItems: array[string]
  prepared: number
  served: number
  leftovers: number
  createdAt: timestamp
}
```

## Key Features

✅ **Authentication**: Email/password with Firebase Auth (extensible to Google, GitHub, etc.)
✅ **Real-time Data**: Uses `onSnapshot()` for live updates
✅ **Multi-user**: Each user sees only their own data
✅ **Scalable**: Cloud-based infrastructure
✅ **Secure**: Built-in security rules and user isolation

## Migration from Old System

### Old System (File-based)
- Data stored in `server/data.json`
- Single mock user
- No authentication
- No multi-user support

### New System (Firebase)
- Data stored in Firestore
- Real user authentication
- Per-user data isolation
- Automatic real-time synchronization

### Migrating Old Data
If you have existing data in the old system, you can:

1. **Manual Migration**: Use Firebase Console to add documents manually
2. **Script Migration**: Create a Node.js script to import data
3. **Fresh Start**: Start with new user accounts and data

Example migration (Node.js):
```javascript
// site/scripts/migrate.js
import admin from 'firebase-admin';
import serviceAccount from '../server/serviceAccountKey.json' assert { type: 'json' };

admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

// Your migration logic here
```

## API Endpoints (Backend)

### Authentication
- `POST /api/auth/login` - Verify token (Firebase handles actual login)

### Stats
- `GET /api/stats/weekly-waste?userId=xxx` - Get weekly waste data

### Predictions
- `GET /api/predictions` - List all predictions
- `GET /api/predictions/:id` - Get prediction details
- `GET /api/predictions/upcoming` - Get high/medium risk predictions
- `POST /api/predictions` - Create prediction

### Recommendations
- `GET /api/recommendations` - List all recommendations
- `POST /api/recommendations/:id/accept` - Accept recommendation
- `POST /api/recommendations/:id/ignore` - Ignore recommendation
- `POST /api/recommendations` - Create recommendation

### Data Logs
- `GET /api/data/daily-logs` - Get all daily logs
- `POST /api/data/daily-logs` - Add new daily log

All endpoints require `userId` parameter/field.

## Security Considerations

1. **API Key Safety**: Firebase config includes your public API key (safe to expose)
2. **Service Account Key**: Keep `serviceAccountKey.json` private (add to .gitignore ✓)
3. **Environment Variables**: Use `.env` files for sensitive credentials
4. **Security Rules**: Configure Firestore rules to control data access (template provided)

## Troubleshooting

**Problem**: "Firebase config not found"
- **Solution**: Update `site/src/firebase.js` with your actual credentials

**Problem**: "Permission denied" when accessing Firestore
- **Solution**: Check your Firestore security rules and ensure user is authenticated

**Problem**: Backend won't start
- **Solution**: Set environment variables or provide `serviceAccountKey.json`

**Problem**: Real-time updates not working
- **Solution**: Check that user is authenticated with `onAuthStateChanged()`

## Next Steps

1. ✅ Enable multi-user authentication
2. ✅ Set up Firestore security rules (template provided)
3. ⏳ Add user profiles collection for additional user info
4. ⏳ Implement Firestore indexes for complex queries
5. ⏳ Set up Firebase Cloud Functions for AI predictions
6. ⏳ Add Firestore backup/restore automation

## Resources

- [Firebase Setup Guide](./FIREBASE_SETUP.md)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Guide](https://firebase.google.com/docs/firestore)
- [Firebase Security Rules](https://firebase.google.com/docs/rules)
- [Firebase Authentication](https://firebase.google.com/docs/auth)

## File Changes Summary

| File | Status | Changes |
|------|--------|---------|
| `src/firebase.js` | ✅ Ready | Needs credentials |
| `src/api.js` | ✅ Complete | Fully Firebase-enabled |
| `server/server.js` | ✅ Refactored | Now uses Firestore |
| `.env.example` | ✅ Added | Backend config template |
| `.gitignore` | ✅ Updated | Added .env and secrets |
| `server/data.json` | ⚠️ Legacy | No longer used |
| `FIREBASE_SETUP.md` | ✅ Added | Detailed setup guide |

---

**Status**: Firebase integration complete and ready for deployment! 🎉

Next: Follow the Quick Start guide above or refer to FIREBASE_SETUP.md for detailed instructions.
