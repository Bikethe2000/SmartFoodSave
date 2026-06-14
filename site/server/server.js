import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.join(__dirname, 'data.json');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Helper functions for reading/writing persistent data
const loadData = () => {
  if (!fs.existsSync(DATA_FILE)) {
    const initialData = {
      predictions: [
        {
          id: "pred-1",
          date: "2026-06-15",
          menuItems: ["Pasta Carbonara", "Caesar Salad"],
          predictedWasteKg: 12.5,
          riskLevel: "High",
          confidence: 0.85,
          explanation: "Historically high leftovers on pasta days + forecasted low attendance due to warm weather."
        },
        {
          id: "pred-2",
          date: "2026-06-16",
          menuItems: ["Chicken Wraps", "Fruit Salad"],
          predictedWasteKg: 3.2,
          riskLevel: "Low",
          confidence: 0.92,
          explanation: "Highly popular menu item. Historical logs show student participation is at 95% on wrap days."
        },
        {
          id: "pred-3",
          date: "2026-06-17",
          menuItems: ["Beef Tacos", "Refried Beans"],
          predictedWasteKg: 7.8,
          riskLevel: "Medium",
          confidence: 0.78,
          explanation: "Moderate leftovers expected. Tacos are popular but side portions are often over-prepared."
        },
        {
          id: "pred-4",
          date: "2026-06-18",
          menuItems: ["Vegetable Soup", "Garlic Bread"],
          predictedWasteKg: 10.4,
          riskLevel: "High",
          confidence: 0.80,
          explanation: "Soup days historically have higher plate waste from younger grade levels."
        },
        {
          id: "pred-5",
          date: "2026-06-19",
          menuItems: ["Fish Nuggets", "French Fries"],
          predictedWasteKg: 5.1,
          riskLevel: "Low",
          confidence: 0.89,
          explanation: "High attendance expected as it is the final day before the weekend."
        }
      ],
      recommendations: [
        {
          id: "rec-1",
          title: "Reduce pasta portion size by 15%",
          description: "Pasta Carbonara shows consistently high plate leftovers. Adjusting the portion size slightly reduces waste without affecting student satisfaction.",
          suggestedChange: "Reduce portions by 15%",
          impactKg: 3.2,
          confidence: 0.88,
          status: "pending" // pending, accepted, ignored
        },
        {
          id: "rec-2",
          title: "Prepare 10% fewer soup bowls",
          description: "Our AI model predicts a drop in attendance on Thursday. Pre-serving fewer bowls saves soup for next-day repurposing.",
          suggestedChange: "Prepare 10% fewer portions",
          impactKg: 2.5,
          confidence: 0.78,
          status: "pending"
        },
        {
          id: "rec-3",
          title: "Switch garlic bread to self-serve basket",
          description: "Pre-plating bread leads to untouched slices being discarded. Let students take garlic bread as they pass the counter.",
          suggestedChange: "Change from pre-plated to self-serve basket",
          impactKg: 1.8,
          confidence: 0.92,
          status: "pending"
        }
      ],
      dailyLogs: [
        {
          id: "log-1",
          date: "2026-06-12",
          menuItems: ["Pizza Slice", "Green Salad"],
          prepared: 150,
          served: 142,
          leftovers: 8
        },
        {
          id: "log-2",
          date: "2026-06-13",
          menuItems: ["Turkey Burger", "Carrot Sticks"],
          prepared: 130,
          served: 110,
          leftovers: 20
        },
        {
          id: "log-3",
          date: "2026-06-14",
          menuItems: ["Chicken Wrap", "Apple Slices"],
          prepared: 120,
          served: 95,
          leftovers: 25
        }
      ]
    };
    fs.writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
    return initialData;
  }
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
};

const saveData = (data) => {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
};

// --- API ROUTES ---

// Auth
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (email && password) {
    res.json({ token: "mock-jwt-token-smartfoodsave" });
  } else {
    res.status(400).json({ error: "Email and password are required" });
  }
});

// Stats: Weekly Waste
app.get('/api/stats/weekly-waste', (req, res) => {
  const data = loadData();
  // Generate visual statistics from past logs
  // Default structure expected: x-axis Day, y-axis Waste (kg)
  // Let's calculate waste = leftovers * 0.25kg average portion weight for logs
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  const weeklyWaste = data.dailyLogs.slice(-5).map((log, index) => {
    const dayName = days[index % days.length];
    // Leftovers portion to Kg: assume 0.2kg per leftover portion
    const wasteKg = parseFloat((log.leftovers * 0.2).toFixed(1));
    return {
      day: dayName,
      waste: wasteKg,
      portions: log.leftovers
    };
  });
  
  res.json(weeklyWaste);
});

// Predictions: Upcoming (High Risk / Quick Alert)
app.get('/api/predictions/upcoming', (req, res) => {
  const data = loadData();
  // Filter for medium or high risk level predictions
  const upcoming = data.predictions.filter(p => p.riskLevel === 'High' || p.riskLevel === 'Medium');
  res.json(upcoming);
});

// Recommendations: Today (Quick Suggestions)
app.get('/api/recommendations/today', (req, res) => {
  const data = loadData();
  // Return pending recommendations
  const todayRecs = data.recommendations.filter(r => r.status === 'pending').slice(0, 3);
  res.json(todayRecs);
});

// Predictions: Filtered by Date Range
app.get('/api/predictions', (req, res) => {
  const { from, to } = req.query;
  const data = loadData();
  let filtered = data.predictions;

  if (from && to) {
    filtered = data.predictions.filter(p => p.date >= from && p.date <= to);
  }
  res.json(filtered);
});

// Predictions: Details
app.get('/api/predictions/:id', (req, res) => {
  const data = loadData();
  const prediction = data.predictions.find(p => p.id === req.params.id);
  if (prediction) {
    res.json(prediction);
  } else {
    res.status(404).json({ error: "Prediction not found" });
  }
});

// Recommendations: Full List
app.get('/api/recommendations', (req, res) => {
  const data = loadData();
  res.json(data.recommendations);
});

// Recommendations: Accept Action
app.post('/api/recommendations/:id/accept', (req, res) => {
  const data = loadData();
  const index = data.recommendations.findIndex(r => r.id === req.params.id);
  if (index !== -1) {
    data.recommendations[index].status = 'accepted';
    saveData(data);
    res.json(data.recommendations[index]);
  } else {
    res.status(404).json({ error: "Recommendation not found" });
  }
});

// Recommendations: Ignore Action
app.post('/api/recommendations/:id/ignore', (req, res) => {
  const data = loadData();
  const index = data.recommendations.findIndex(r => r.id === req.params.id);
  if (index !== -1) {
    data.recommendations[index].status = 'ignored';
    saveData(data);
    res.json(data.recommendations[index]);
  } else {
    res.status(404).json({ error: "Recommendation not found" });
  }
});

// Data Logs: Get Daily Logs
app.get('/api/data/daily-logs', (req, res) => {
  const data = loadData();
  res.json(data.dailyLogs);
});

// Data Logs: Add Daily Log
app.post('/api/data/daily-logs', (req, res) => {
  const { date, menuItems, prepared, served, leftovers } = req.body;
  if (!date || !menuItems || prepared === undefined || served === undefined || leftovers === undefined) {
    return res.status(400).json({ error: "All log fields are required" });
  }
  
  const data = loadData();
  const newLog = {
    id: `log-${Date.now()}`,
    date,
    menuItems: Array.isArray(menuItems) ? menuItems : [menuItems],
    prepared: Number(prepared),
    served: Number(served),
    leftovers: Number(leftovers)
  };

  data.dailyLogs.push(newLog);
  saveData(data);
  res.status(201).json(newLog);
});

app.listen(PORT, () => {
  console.log(`SmartFoodSave Mock Backend running on port ${PORT}`);
});
