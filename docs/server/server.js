import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Documentation endpoints
app.get('/api/docs/index', (req, res) => {
  res.json([
    { id: 'overview', title: 'Overview', section: 'docs' },
    { id: 'features', title: 'Features', section: 'docs' },
    { id: 'architecture', title: 'Architecture', section: 'docs' },
  ]);
});

app.get('/api/docs/:docId', (req, res) => {
  const { docId } = req.params;
  
  const docs = {
    overview: { id: 'overview', title: 'Overview', content: 'Documentation overview content' },
    features: { id: 'features', title: 'Features', content: 'Features documentation' },
    architecture: { id: 'architecture', title: 'Architecture', content: 'Architecture documentation' },
  };
  
  const doc = docs[docId];
  if (doc) {
    res.json(doc);
  } else {
    res.status(404).json({ error: 'Document not found' });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`📚 Documentation server running on port ${PORT}`);
  console.log(`📖 Access at http://localhost:${PORT}`);
});
