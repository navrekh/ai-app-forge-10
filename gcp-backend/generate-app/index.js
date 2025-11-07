const express = require('express');
const admin = require('firebase-admin');
const cors = require('cors');

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp();
}

const app = express();

// Enable CORS for all routes
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'generate-app' });
});

// Middleware to verify Firebase token
const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized - Missing token' });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(401).json({ error: 'Unauthorized - Invalid token' });
  }
};

// Generate app endpoint
app.post('/generate-app', verifyToken, async (req, res) => {
  try {
    const { prompt } = req.body;
    const userId = req.user.uid;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    console.log(`Generating app for user ${userId}:`, prompt);

    // TODO: Implement your actual app generation logic here
    // This could involve:
    // 1. Calling an AI API to generate the app structure
    // 2. Creating React Native component files
    // 3. Zipping the generated files
    // 4. Uploading to Cloud Storage
    // 5. Saving metadata to Firestore

    // For now, return a mock response
    const mockAppData = {
      success: true,
      appId: `app_${Date.now()}`,
      download_url: `https://storage.googleapis.com/your-bucket/apps/${userId}/app_${Date.now()}.zip`,
      zip_base64: null,
      file: 'generated_app.zip',
      stored: true
    };

    // Save to Firestore
    const db = admin.firestore();
    await db.collection('app_history').add({
      userId,
      prompt,
      appData: mockAppData,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    res.json(mockAppData);

  } catch (error) {
    console.error('Generation error:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to generate app',
      success: false 
    });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Generate App service listening on port ${PORT}`);
});
