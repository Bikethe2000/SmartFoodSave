# Firebase Integration - Quick Reference

## 🚀 Getting Started (3 Steps)

### Step 1: Get Firebase Credentials
1. Go to https://console.firebase.google.com
2. Create new project (or use existing)
3. Create Web App and copy credentials
4. Create Firestore Database (Test mode)

### Step 2: Update Frontend Config
Edit `site/src/firebase.js`:
```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY_HERE",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "SENDER_ID",
  appId: "APP_ID"
};
```

### Step 3: Run Your App
```bash
cd site
npm run dev
```

## 📚 Using Firebase in Components

### Authentication

```javascript
import { api } from './api';

// Sign up
const handleSignup = async (email, password) => {
  try {
    const result = await api.signup(email, password);
    console.log('User created:', result.user);
  } catch (error) {
    console.error('Signup failed:', error.message);
  }
};

// Login
const handleLogin = async (email, password) => {
  try {
    const result = await api.login(email, password);
    console.log('Logged in:', result.user);
  } catch (error) {
    console.error('Login failed:', error.message);
  }
};

// Logout
const handleLogout = async () => {
  try {
    await api.logout();
    console.log('Logged out');
  } catch (error) {
    console.error('Logout failed:', error.message);
  }
};

// Check if logged in
const isLoggedIn = api.isAuthenticated();
const currentUser = api.getCurrentUser();
```

### Real-Time Data Subscriptions

```javascript
import { useEffect, useState } from 'react';
import { api } from './api';

function Dashboard() {
  const [predictions, setPredictions] = useState([]);

  useEffect(() => {
    // Subscribe to predictions
    const unsubscribe = api.subscribeToPredictions((data) => {
      setPredictions(data);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  return (
    <div>
      {predictions.map((pred) => (
        <div key={pred.id}>{pred.title}</div>
      ))}
    </div>
  );
}
```

### Fetching Data

```javascript
import { api } from './api';

// Get predictions for date range
const getPredictions = async () => {
  try {
    const predictions = await api.getPredictions('2026-06-01', '2026-06-30');
    console.log('Predictions:', predictions);
  } catch (error) {
    console.error('Error:', error.message);
  }
};

// Get weekly waste stats
const getWeeklyWaste = async () => {
  try {
    const stats = await api.getWeeklyWaste();
    console.log('Weekly waste:', stats);
  } catch (error) {
    console.error('Error:', error.message);
  }
};

// Get daily logs
const getLogs = async () => {
  try {
    const logs = await api.getDailyLogs();
    console.log('Daily logs:', logs);
  } catch (error) {
    console.error('Error:', error.message);
  }
};

// Get recommendations
const getRecommendations = async () => {
  try {
    const recs = await api.getRecommendations();
    console.log('Recommendations:', recs);
  } catch (error) {
    console.error('Error:', error.message);
  }
};
```

### Creating Data

```javascript
import { api } from './api';

// Add daily log
const addLog = async () => {
  try {
    const newLog = await api.addDailyLog({
      date: '2026-06-14',
      menuItems: ['Pizza', 'Salad'],
      prepared: 100,
      served: 85,
      leftovers: 15
    });
    console.log('Log created:', newLog);
  } catch (error) {
    console.error('Error:', error.message);
  }
};
```

### Updating Recommendations

```javascript
import { api } from './api';

// Accept recommendation
const acceptRec = async (recId) => {
  try {
    await api.acceptRecommendation(recId);
    console.log('Recommendation accepted');
  } catch (error) {
    console.error('Error:', error.message);
  }
};

// Ignore recommendation
const ignoreRec = async (recId) => {
  try {
    await api.ignoreRecommendation(recId);
    console.log('Recommendation ignored');
  } catch (error) {
    console.error('Error:', error.message);
  }
};
```

## 🔐 Security Rules

Your Firestore security rules allow:
- Users to read/write only their own data
- Authenticated users only
- Public collections for admin (configurable)

Current rules in Firebase Console > Firestore > Rules:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null && 
        (resource.data.userId == request.auth.uid || 
         request.resource.data.userId == request.auth.uid);
    }
  }
}
```

## 📦 API Methods Reference

### Authentication
- `api.login(email, password)` - Login with email
- `api.signup(email, password)` - Create new account
- `api.logout()` - Logout user
- `api.isAuthenticated()` - Check if logged in
- `api.getCurrentUser()` - Get current user info

### Reading Data
- `api.getWeeklyWaste()` - Get weekly waste statistics
- `api.getUpcomingPredictions()` - Get high/medium risk predictions
- `api.getPredictions(from, to)` - Get predictions for date range
- `api.getPredictionDetails(id)` - Get single prediction
- `api.getTodayRecommendations()` - Get pending recommendations
- `api.getRecommendations()` - Get all recommendations
- `api.getDailyLogs()` - Get all daily logs

### Writing Data
- `api.addDailyLog(data)` - Add new daily log
- `api.acceptRecommendation(id)` - Accept recommendation
- `api.ignoreRecommendation(id)` - Ignore recommendation

### Real-Time Updates
- `api.subscribeToPredictions(callback)` - Listen to predictions
- `api.subscribeToRecommendations(callback)` - Listen to recommendations

## ⚙️ Backend Setup (Optional)

Only needed if using backend server with Firestore Admin SDK.

Create `site/.env`:
```
PORT=5000
FIREBASE_PROJECT_ID=your-project
FIREBASE_PRIVATE_KEY=your-private-key
FIREBASE_CLIENT_EMAIL=your-email
```

Or place `serviceAccountKey.json` in `site/server/`

Start backend:
```bash
npm run server
```

## 🐛 Common Issues

| Issue | Solution |
|-------|----------|
| "Firebase config not found" | Update `src/firebase.js` with credentials |
| "Permission denied" | Check Firestore rules, ensure user is logged in |
| "Collection not found" | Create collections in Firestore console |
| Real-time updates not working | Check user authentication with `getCurrentUser()` |
| Backend won't start | Set `.env` variables or add `serviceAccountKey.json` |

## 📖 Learn More

- **Setup Guide**: See [FIREBASE_SETUP.md](./FIREBASE_SETUP.md)
- **Integration Summary**: See [INTEGRATION_SUMMARY.md](./INTEGRATION_SUMMARY.md)
- **Official Docs**: https://firebase.google.com/docs

## 💡 Tips

- Use `onAuthStateChanged()` to detect login state changes
- Subscribe to data in `useEffect()` and unsubscribe on cleanup
- Always include `userId` in queries to ensure user isolation
- Test Firestore rules in Firebase Console's Rules Simulator
- Monitor usage in Firebase Console to stay within free tier

---

**Ready to go?** Start with Step 1 above! 🎉
