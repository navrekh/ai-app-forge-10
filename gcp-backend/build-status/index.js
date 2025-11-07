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
  methods: ['GET', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'build-status' });
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

// Get build status endpoint
app.get('/build-status/:buildId', verifyToken, async (req, res) => {
  try {
    const { buildId } = req.params;
    const userId = req.user.uid;

    if (!buildId) {
      return res.status(400).json({ error: 'buildId is required' });
    }

    const db = admin.firestore();
    const buildDoc = await db.collection('builds').doc(buildId).get();

    if (!buildDoc.exists) {
      return res.status(404).json({ error: 'Build not found' });
    }

    const buildData = buildDoc.data();

    // Verify user owns this build
    if (buildData.userId !== userId) {
      return res.status(403).json({ error: 'Forbidden - Not your build' });
    }

    res.json({
      buildId: buildDoc.id,
      status: buildData.status,
      downloadUrl: buildData.downloadUrl || null,
      errorMessage: buildData.errorMessage || null,
      createdAt: buildData.createdAt,
      updatedAt: buildData.updatedAt
    });

  } catch (error) {
    console.error('Status check error:', error);
    res.status(500).json({ error: error.message || 'Failed to check build status' });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Build Status service listening on port ${PORT}`);
});
