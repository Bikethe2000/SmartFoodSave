# 🚀 Getting Started - SmartFoodSave with Firestore Backend

Your website is now fully integrated with Firebase and Firestore. All data saves through the backend server. Follow this guide to get up and running in minutes!

## ⏱️ Quick Start (5 minutes)

### Prerequisites
You need:
- Node.js (v16 or higher)
- Firebase project with Firestore
- Service Account credentials from Firebase

### Step 1: Configure Backend (2 min)

1. **Get Firebase Credentials**
   - Go to [Firebase Console](https://console.firebase.google.com)
   - Project Settings → Service Accounts → Generate New Key
   - Save as `site/server/serviceAccountKey.json`

2. **Create Backend Config**
   - Copy `site/server/.env.example` to `site/server/.env`
   - For local development, leave defaults as-is (will use serviceAccountKey.json)

### Step 2: Configure Frontend (1 min)

1. **Update Firebase Config**
   - Open `site/src/firebase.js`
   - Replace placeholder values with your Firebase config from Console
   - (You can get these from Project Settings → Your apps)

2. **Frontend will use:** `site/.env` (already created with correct backend URL)

### Step 3: Start Everything (1 min)

**Option A: Quick Start (Windows)**
```bash
cd site
start.bat
```

**Option B: Quick Start (Mac/Linux)**
```bash
cd site
bash start.sh
```

**Option C: Manual Startup**

Terminal 1 (Backend):
```bash
cd site
npm run server
```

Terminal 2 (Frontend):
```bash
cd site
npm run dev
```

### Step 4: Test It! (1 min)

- Open http://localhost:5173
- Sign up or log in
- Add a daily log or create a prediction
- Check Firestore Console to see data saved! ✨

## 📋 What's Connected

✅ **Frontend** (React + Vite)
- Port: 5173
- Saves data via: `/api` endpoints

✅ **Backend** (Express + Node.js)
- Port: 5000
- Uses: Firebase Admin SDK
- Stores to: Firestore

✅ **Database** (Firebase Firestore)
- Collections: predictions, recommendations, dailyLogs
- Auth: Firebase Authentication
- Sync: Real-time to backend

## 🔧 Configuration Files

| File | Purpose | Status |
|------|---------|--------|
| `site/.env` | Frontend backend URL | ✅ Ready |
| `site/src/firebase.js` | Firebase config | ⚠️ Needs credentials |
| `site/server/.env` | Backend config | ⚠️ Optional (auto-detects) |
| `site/server/serviceAccountKey.json` | Firebase credentials | ⚠️ Needs to be added |

## 📚 Documentation

**Quick Reference**
- [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) - Code examples and API reference

**Setup & Integration**
- [BACKEND_FRONTEND_SETUP.md](./BACKEND_FRONTEND_SETUP.md) - Detailed setup guide
- [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) - Firebase configuration
- [INTEGRATION_SUMMARY.md](./INTEGRATION_SUMMARY.md) - Architecture details

## 🐛 Common Issues

### "Can't connect to backend"
**Solution:**
- Ensure backend is running: `npm run server`
- Check port 5000 is available
- Verify `VITE_API_BASE=http://localhost:5000` in `site/.env`

### "Firebase config not found"
**Solution:**
- Update `site/src/firebase.js` with actual Firebase credentials
- Get credentials from Firebase Console > Project Settings > Your apps

### "Permission denied" on Firestore
**Solution:**
- Check Firestore security rules in Firebase Console
- Ensure user is logged in
- Wait a moment and try again (might be a timing issue)

### Backend won't start
**Solution:**
- Check if `serviceAccountKey.json` exists or `.env` is configured
- Verify Firebase credentials are correct
- Check if port 5000 is in use: `lsof -i :5000` (Mac/Linux)

## 🌟 Key Features

**✨ All Data Saves to Firestore**
- Daily logs
- Predictions
- Recommendations
- Automatically saves with backend

**🔐 Authentication**
- Firebase Auth
- Email/Password login
- User data isolation

**⚡ Real-time Backend**
- Express API
- All requests verified
- Automatic error handling

**📊 Data Management**
- Create, read, update operations
- Organized collections
- Ready for scale

## 📖 API Usage

### Add Daily Log
```javascript
import { api } from './api';

const log = await api.addDailyLog({
  date: '2026-06-14',
  menuItems: ['Pizza', 'Salad'],
  prepared: 100,
  served: 85,
  leftovers: 15
});
```

### Get Predictions
```javascript
const predictions = await api.getPredictions('2026-06-01', '2026-06-30');
```

### Create Recommendation
```javascript
const rec = await api.addRecommendation({
  title: 'Reduce portion size',
  description: 'Pasta shows high waste',
  impactKg: 2.5
});
```

### Accept/Ignore Recommendation
```javascript
await api.acceptRecommendation(recId);
// or
await api.ignoreRecommendation(recId);
```

## 🎯 Next Steps

1. ✅ Configure Firebase (add credentials)
2. ✅ Start backend and frontend
3. ✅ Test adding data
4. ✅ Verify in Firestore Console
5. ⏳ Deploy when ready!

## 🚀 Deployment

When ready for production:

1. **Backend**: Deploy to Heroku, Railway, Cloud Run, etc.
2. **Frontend**: Deploy to Vercel, Netlify, Firebase Hosting
3. **Update** `VITE_API_BASE` to production URL
4. **Firestore** is already cloud-based (no changes needed)

See [BACKEND_FRONTEND_SETUP.md](./BACKEND_FRONTEND_SETUP.md) for deployment details.

## 💡 Development Tips

**Hot Reload**
- Frontend auto-refreshes with changes
- Backend auto-restarts with nodemon

**Debugging**
- Check browser console (Ctrl+Shift+I)
- Check terminal output for errors
- Check Firestore Console for data

**Testing**
- Try adding data through UI
- Refresh page to see real-time sync
- Check Firestore Collections tab

## 📞 Need Help?

1. Check the relevant guide above
2. Review [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) for Firebase issues
3. Check [BACKEND_FRONTEND_SETUP.md](./BACKEND_FRONTEND_SETUP.md) for integration issues
4. Review error messages in browser console and terminal

---

## ✅ Checklist

Before running:
- [ ] Node.js installed
- [ ] Firebase project created
- [ ] Firestore database enabled
- [ ] Service Account key downloaded
- [ ] `site/server/serviceAccountKey.json` in place
- [ ] `site/src/firebase.js` updated with credentials
- [ ] Dependencies installed: `npm install`

All set! 🎉

```bash
cd site
npm run server   # Terminal 1
npm run dev      # Terminal 2
```

**That's it! Your app is now running with full Firestore integration.** 🚀
