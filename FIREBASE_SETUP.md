# Firebase Setup Guide

This guide will help you set up Firebase for authentication and database (Firestore) for the Food Waste AI application.

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter a project name (e.g., "food-waste-ai")
4. Accept the terms and create the project

## Step 2: Create a Web App

1. In the Firebase console, click the Web icon (`</>`) to create a web app
2. Register the app with a name (e.g., "Food Waste AI Web")
3. You'll get a Firebase config object that looks like this:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

## Step 3: Update Firebase Configuration

1. Open `site/src/firebase.js`
2. Replace the placeholder values with your Firebase config from Step 2

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

## Step 4: Enable Authentication

1. In Firebase Console, go to **Authentication** > **Sign-in method**
2. Enable **Email/Password** authentication
3. Optional: Enable other providers (Google, GitHub, etc.)

## Step 5: Create Firestore Database

1. In Firebase Console, go to **Firestore Database**
2. Click **Create database**
3. Start in **Test mode** (for development)
4. Choose your region (closest to your users)
5. Click **Create**

## Step 6: Set Up Firestore Security Rules

Once your database is created, update the security rules to protect your data:

1. Go to **Firestore Database** > **Rules** tab
2. Replace the rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own data
    match /{document=**} {
      allow read, write: if request.auth != null && 
        (resource.data.userId == request.auth.uid || 
         request.resource.data.userId == request.auth.uid);
    }
    
    // Allow unauthenticated reads to public documents
    match /public/{document=**} {
      allow read: if true;
    }
  }
}
```

3. Click **Publish**

## Step 7: Create Firestore Collections

Create the following collections in Firestore:

### Collection: `predictions`
**Document fields:**
```
{
  userId: string (user's UID)
  date: string (YYYY-MM-DD)
  menuItems: array[string]
  predictedWasteKg: number
  riskLevel: string (Low, Medium, High)
  confidence: number (0-1)
  explanation: string
  createdAt: timestamp
}
```

### Collection: `recommendations`
**Document fields:**
```
{
  userId: string
  title: string
  description: string
  suggestedChange: string
  impactKg: number
  confidence: number
  status: string (pending, accepted, ignored)
  createdAt: timestamp
}
```

### Collection: `dailyLogs`
**Document fields:**
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

## Step 8: (Optional) Backend Server with Admin SDK

If you want to use the backend server with Firebase Admin SDK:

1. Go to Firebase Console > **Project Settings** > **Service Accounts** tab
2. Click **Generate New Private Key**
3. Save the JSON file as `site/server/serviceAccountKey.json`

**Important:** Add `serviceAccountKey.json` to `.gitignore`:
```
# In site/.gitignore
server/serviceAccountKey.json
```

4. Set environment variables (create `site/.env` file):
```
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxx@your-project.iam.gserviceaccount.com
```

Or use the service account file:
1. Uncomment the line in `server/server.js`:
   ```javascript
   import serviceAccount from './serviceAccountKey.json' assert { type: 'json' };
   admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
   ```

## Step 9: Test Your Setup

1. Start the development server:
```bash
cd site
npm run dev
```

2. Try signing up and logging in with your email
3. Check Firestore to see if user data is being stored

## Step 10: Migrate Existing Data (if applicable)

If you have existing data in `server/data.json`, migrate it to Firestore:

1. Create a migration script (optional) or manually add documents to Firestore
2. Update the documents to include `userId` field
3. Delete the local `data.json` once migration is complete

## Environment Variables

Create a `.env` file in the `site/` directory (for backend):

```
PORT=5000
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY=your-private-key
FIREBASE_CLIENT_EMAIL=your-service-account-email
```

For frontend config, edit `site/src/firebase.js` directly (Firebase config is typically safe to expose as it's designed for client-side use).

## Troubleshooting

### "Firebase config not found"
- Make sure you've updated `site/src/firebase.js` with your actual Firebase credentials

### "Permission denied" errors
- Check your Firestore security rules
- Make sure the user is authenticated (logged in)
- Verify the `userId` field matches the authenticated user's UID

### "Too many requests" errors
- You may have exceeded Firebase's free tier limits
- Check your Firebase Console for usage stats
- Consider upgrading to Blaze plan for production

## Next Steps

1. Implement user profile collection to store additional user info
2. Add Firestore indexes for better query performance
3. Set up Firebase Cloud Functions for server-side operations
4. Enable real-time synchronization with `onSnapshot()` (already implemented in api.js)

## Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Guide](https://firebase.google.com/docs/firestore)
- [Firebase Authentication](https://firebase.google.com/docs/auth)
- [Security Rules](https://firebase.google.com/docs/rules)
