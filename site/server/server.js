import express from 'express';
import cors from 'cors';
import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Initialize Firebase Admin SDK
let db = null;

try {
  // Try loading from service account file first
  if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
    const serviceAccount = await import(process.env.FIREBASE_SERVICE_ACCOUNT_PATH, { assert: { type: 'json' } });
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount.default),
    });
  } else if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY) {
    // Initialize with environment variables
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      }),
    });
  } else {
    // Try loading from serviceAccountKey.json
    try {
      const serviceAccount = await import('./serviceAccountKey.json', { assert: { type: 'json' } });
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount.default),
      });
    } catch (e) {
      throw new Error('Firebase credentials not found. Please set up environment variables or provide serviceAccountKey.json');
    }
  }
  
  db = admin.firestore();
  console.log('✓ Firebase Admin SDK initialized successfully');
} catch (error) {
  console.error('✗ Firebase initialization failed:', error.message);
  console.error('The backend server requires Firebase Admin credentials.');
  console.error('See FIREBASE_SETUP.md for configuration instructions.');
  process.exit(1);
}

// --- FIRESTORE HELPERS ---

// Fetch predictions from Firestore
const getPredictions = async (userId = null) => {
  try {
    let query = db.collection('predictions');
    if (userId) {
      query = query.where('userId', '==', userId);
    }
    const snapshot = await query.get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching predictions:', error);
    return [];
  }
};

// Fetch recommendations from Firestore
const getRecommendations = async (userId = null) => {
  try {
    let query = db.collection('recommendations');
    if (userId) {
      query = query.where('userId', '==', userId);
    }
    const snapshot = await query.get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    return [];
  }
};

// Fetch daily logs from Firestore
const getDailyLogs = async (userId = null) => {
  try {
    let query = db.collection('dailyLogs');
    if (userId) {
      query = query.where('userId', '==', userId);
    }
    const snapshot = await query.orderBy('date', 'desc').get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching daily logs:', error);
    return [];
  }
};

// --- API ROUTES ---

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Firebase backend is running' });
});

// Auth (Firebase handles this client-side, but you can verify tokens here if needed)
app.post('/api/auth/login', (req, res) => {
  // Firebase authentication is handled client-side
  // This endpoint can be used to verify tokens if needed
  res.json({ message: 'Use Firebase client SDK for authentication' });
});

// Stats: Weekly Waste
app.get('/api/stats/weekly-waste', async (req, res) => {
  try {
    const userId = req.query.userId;
    const logs = await getDailyLogs(userId);
    
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
    const weeklyWaste = logs.slice(-5).map((log, index) => ({
      day: days[index % days.length],
      waste: parseFloat((log.leftovers * 0.2).toFixed(1)),
      portions: log.leftovers
    }));
    
    res.json(weeklyWaste);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Predictions: Upcoming (High Risk / Quick Alert)
app.get('/api/predictions/upcoming', async (req, res) => {
  try {
    const userId = req.query.userId;
    const predictions = await getPredictions(userId);
    const upcoming = predictions.filter(p => p.riskLevel === 'High' || p.riskLevel === 'Medium');
    res.json(upcoming);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Recommendations: Today (Quick Suggestions)
app.get('/api/recommendations/today', async (req, res) => {
  try {
    const userId = req.query.userId;
    const recommendations = await getRecommendations(userId);
    const todayRecs = recommendations.filter(r => r.status === 'pending').slice(0, 3);
    res.json(todayRecs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Predictions: Filtered by Date Range
app.get('/api/predictions', async (req, res) => {
  try {
    const { from, to, userId } = req.query;
    let predictions = await getPredictions(userId);

    if (from && to) {
      predictions = predictions.filter(p => p.date >= from && p.date <= to);
    }
    res.json(predictions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Predictions: Details
app.get('/api/predictions/:id', async (req, res) => {
  try {
    const doc = await db.collection('predictions').doc(req.params.id).get();
    if (doc.exists) {
      res.json({ id: doc.id, ...doc.data() });
    } else {
      res.status(404).json({ error: 'Prediction not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Recommendations: Full List
app.get('/api/recommendations', async (req, res) => {
  try {
    const userId = req.query.userId;
    const recommendations = await getRecommendations(userId);
    res.json(recommendations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Recommendations: Accept Action
app.post('/api/recommendations/:id/accept', async (req, res) => {
  try {
    const docRef = db.collection('recommendations').doc(req.params.id);
    await docRef.update({ status: 'accepted' });
    const updatedDoc = await docRef.get();
    res.json({ id: updatedDoc.id, ...updatedDoc.data() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Recommendations: Ignore Action
app.post('/api/recommendations/:id/ignore', async (req, res) => {
  try {
    const docRef = db.collection('recommendations').doc(req.params.id);
    await docRef.update({ status: 'ignored' });
    const updatedDoc = await docRef.get();
    res.json({ id: updatedDoc.id, ...updatedDoc.data() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Data Logs: Get Daily Logs
app.get('/api/data/daily-logs', async (req, res) => {
  try {
    const userId = req.query.userId;
    const logs = await getDailyLogs(userId);
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Data Logs: Add Daily Log
app.post('/api/data/daily-logs', async (req, res) => {
  try {
    const { date, menuItems, prepared, served, leftovers, userId } = req.body;
    
    if (!date || !menuItems || prepared === undefined || served === undefined || leftovers === undefined || !userId) {
      return res.status(400).json({ error: 'All fields including userId are required' });
    }
    
    const newLog = {
      userId,
      date,
      menuItems: Array.isArray(menuItems) ? menuItems : [menuItems],
      prepared: Number(prepared),
      served: Number(served),
      leftovers: Number(leftovers),
      createdAt: new Date()
    };

    const docRef = await db.collection('dailyLogs').add(newLog);
    res.status(201).json({ id: docRef.id, ...newLog });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Data Logs: Add Prediction
app.post('/api/predictions', async (req, res) => {
  try {
    const { date, menuItems, predictedWasteKg, riskLevel, confidence, explanation, userId } = req.body;
    
    if (!userId || !date || !menuItems || predictedWasteKg === undefined || !riskLevel) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const newPrediction = {
      userId,
      date,
      menuItems: Array.isArray(menuItems) ? menuItems : [menuItems],
      predictedWasteKg: Number(predictedWasteKg),
      riskLevel,
      confidence: Number(confidence) || 0.5,
      explanation: explanation || '',
      createdAt: new Date()
    };

    const docRef = await db.collection('predictions').add(newPrediction);
    res.status(201).json({ id: docRef.id, ...newPrediction });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Recommendations: Add Recommendation
app.post('/api/recommendations', async (req, res) => {
  try {
    const { title, description, suggestedChange, impactKg, confidence, userId } = req.body;
    
    if (!userId || !title) {
      return res.status(400).json({ error: 'Missing required fields: userId, title' });
    }
    
    const newRec = {
      userId,
      title,
      description: description || '',
      suggestedChange: suggestedChange || '',
      impactKg: Number(impactKg) || 0,
      confidence: Number(confidence) || 0.5,
      status: 'pending',
      createdAt: new Date()
    };

    const docRef = await db.collection('recommendations').add(newRec);
    res.status(201).json({ id: docRef.id, ...newRec });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`✓ SmartFoodSave Backend running on port ${PORT}`);
  console.log(`✓ Connected to Firestore`);
  console.log(`✓ Base URL: http://localhost:${PORT}`);
});
