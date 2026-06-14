import express from 'express';
import cors from 'cors';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { readFile } from 'fs/promises';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;
const FIREBASE_API_KEY = process.env.FIREBASE_API_KEY;

app.use(cors());
app.use(express.json());

// Initialize Firebase Admin SDK
let db = null;

try {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
    const serviceAccountPath = path.isAbsolute(process.env.FIREBASE_SERVICE_ACCOUNT_PATH)
      ? process.env.FIREBASE_SERVICE_ACCOUNT_PATH
      : path.resolve(__dirname, '..', process.env.FIREBASE_SERVICE_ACCOUNT_PATH);

    const serviceAccountRaw = await readFile(serviceAccountPath, 'utf8');
    const serviceAccount = JSON.parse(serviceAccountRaw);

    initializeApp({
      credential: cert(serviceAccount),
    });
  } else if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      }),
    });
  } else {
    try {
      const keyPath = path.resolve(__dirname, '..', 'serviceAccountKey.json');
      const serviceAccountRaw = await readFile(keyPath, 'utf8');
      const serviceAccount = JSON.parse(serviceAccountRaw);

      initializeApp({
        credential: cert(serviceAccount),
      });
    } catch (innerError) {
      throw new Error('Firebase credentials not found. Please set up environment variables or provide serviceAccountKey.json');
    }
  }

  db = getFirestore();
  console.log('✓ Firebase Admin SDK initialized successfully');
} catch (error) {
  console.error('✗ Firebase initialization failed:', error.message);
  console.error('The backend server requires Firebase Admin credentials.');
  console.error('See ../FIREBASE_SETUP.md for configuration instructions.');
  process.exit(1);
}

const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = await getAuth().verifyIdToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Token verification failed:', error.message);
    return res.status(401).json({ error: 'Invalid authentication token' });
  }
};

const toItem = (doc) => ({ id: doc.id, ...doc.data() });

const getPredictions = async (userId) => {
  try {
    const query = db.collection('predictions').where('userId', '==', userId);
    const snapshot = await query.get();
    return snapshot.docs.map(toItem);
  } catch (error) {
    console.error('Error fetching predictions:', error);
    return [];
  }
};

const getRecommendations = async (userId) => {
  try {
    const query = db.collection('recommendations').where('userId', '==', userId);
    const snapshot = await query.get();
    return snapshot.docs.map(toItem);
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    return [];
  }
};

const getDailyLogs = async (userId) => {
  try {
    const query = db.collection('dailyLogs').where('userId', '==', userId);
    const snapshot = await query.get();
    const logs = snapshot.docs.map(toItem);
    return logs.sort((a, b) => a.date.localeCompare(b.date));
  } catch (error) {
    console.error('Error fetching daily logs:', error);
    return [];
  }
};

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'SmartFoodSave backend is running' });
});

// Backend login proxy using Firebase Auth REST API
app.post('/api/auth/login', async (req, res) => {
  if (!FIREBASE_API_KEY) {
    return res.status(500).json({ error: 'FIREBASE_API_KEY is not configured on the backend.' });
  }

  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  try {
    const authResponse = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, returnSecureToken: true }),
      }
    );

    const authData = await authResponse.json();
    if (!authResponse.ok) {
      return res.status(authResponse.status).json({ error: authData.error?.message || 'Authentication failed' });
    }

    return res.json({
      token: authData.idToken,
      refreshToken: authData.refreshToken,
      expiresIn: authData.expiresIn,
      email: authData.email,
      userId: authData.localId,
    });
  } catch (error) {
    console.error('Login failed:', error);
    return res.status(500).json({ error: 'Unable to authenticate via Firebase.' });
  }
});

// Stats: Weekly Waste
app.get('/api/stats/weekly-waste', authenticate, async (req, res) => {
  try {
    const logs = await getDailyLogs(req.user.uid);
    const latestLogs = logs.slice(-5);
    const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

    const weeklyWaste = latestLogs.map((log, index) => ({
      day: weekdays[index % weekdays.length],
      waste: parseFloat((log.leftovers * 0.2).toFixed(1)),
      portions: log.leftovers,
    }));

    res.json(weeklyWaste);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Predictions: Upcoming alerts
app.get('/api/predictions/upcoming', authenticate, async (req, res) => {
  try {
    const predictions = await getPredictions(req.user.uid);
    const upcoming = predictions.filter((prediction) => prediction.riskLevel === 'High' || prediction.riskLevel === 'Medium');
    res.json(upcoming);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Recommendations: Today quick picks
app.get('/api/recommendations/today', authenticate, async (req, res) => {
  try {
    const recommendations = await getRecommendations(req.user.uid);
    const todayRecs = recommendations.filter((rec) => rec.status === 'pending').slice(0, 3);
    res.json(todayRecs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Predictions: Filtered by date range
app.get('/api/predictions', authenticate, async (req, res) => {
  try {
    const { from, to } = req.query;
    let predictions = await getPredictions(req.user.uid);

    if (from && to) {
      predictions = predictions.filter((prediction) => prediction.date >= from && prediction.date <= to);
    }

    res.json(predictions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Predictions: Details
app.get('/api/predictions/:id', authenticate, async (req, res) => {
  try {
    const doc = await db.collection('predictions').doc(req.params.id).get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'Prediction not found' });
    }
    res.json({ id: doc.id, ...doc.data() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Recommendations: Full list
app.get('/api/recommendations', authenticate, async (req, res) => {
  try {
    const recommendations = await getRecommendations(req.user.uid);
    res.json(recommendations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Recommendations: Accept action
app.post('/api/recommendations/:id/accept', authenticate, async (req, res) => {
  try {
    const recommendationRef = db.collection('recommendations').doc(req.params.id);
    await recommendationRef.update({ status: 'accepted' });
    const updatedDoc = await recommendationRef.get();
    res.json({ id: updatedDoc.id, ...updatedDoc.data() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Recommendations: Ignore action
app.post('/api/recommendations/:id/ignore', authenticate, async (req, res) => {
  try {
    const recommendationRef = db.collection('recommendations').doc(req.params.id);
    await recommendationRef.update({ status: 'ignored' });
    const updatedDoc = await recommendationRef.get();
    res.json({ id: updatedDoc.id, ...updatedDoc.data() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Data logs: list daily logs
app.get('/api/data/daily-logs', authenticate, async (req, res) => {
  try {
    const logs = await getDailyLogs(req.user.uid);
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Data logs: add daily log
app.post('/api/data/daily-logs', authenticate, async (req, res) => {
  try {
    const { date, menuItems, prepared, served, leftovers } = req.body;

    if (!date || !menuItems || prepared === undefined || served === undefined || leftovers === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const newLog = {
      userId: req.user.uid,
      date,
      menuItems: Array.isArray(menuItems) ? menuItems : [menuItems],
      prepared: Number(prepared),
      served: Number(served),
      leftovers: Number(leftovers),
      createdAt: new Date(),
    };

    const docRef = await db.collection('dailyLogs').add(newLog);
    res.status(201).json({ id: docRef.id, ...newLog });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin routes for seeding or adding predictions / recommendations
app.post('/api/predictions', authenticate, async (req, res) => {
  try {
    const { date, menuItems, predictedWasteKg, riskLevel, confidence, explanation } = req.body;

    if (!date || !menuItems || predictedWasteKg === undefined || !riskLevel) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const newPrediction = {
      userId: req.user.uid,
      date,
      menuItems: Array.isArray(menuItems) ? menuItems : [menuItems],
      predictedWasteKg: Number(predictedWasteKg),
      riskLevel,
      confidence: Number(confidence) || 0.5,
      explanation: explanation || '',
      createdAt: new Date(),
    };

    const docRef = await db.collection('predictions').add(newPrediction);
    res.status(201).json({ id: docRef.id, ...newPrediction });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/recommendations', authenticate, async (req, res) => {
  try {
    const { title, description, suggestedChange, impactKg, confidence } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Missing required field: title' });
    }

    const newRec = {
      userId: req.user.uid,
      title,
      description: description || '',
      suggestedChange: suggestedChange || '',
      impactKg: Number(impactKg) || 0,
      confidence: Number(confidence) || 0.5,
      status: 'pending',
      createdAt: new Date(),
    };

    const docRef = await db.collection('recommendations').add(newRec);
    res.status(201).json({ id: docRef.id, ...newRec });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`✓ SmartFoodSave Backend running on port ${PORT}`);
  console.log('✓ Connected to Firestore');
  console.log(`✓ Serving both web (site/) and mobile (mobile_app/) clients`);
  console.log(`✓ Base URL: http://localhost:${PORT}`);
});
