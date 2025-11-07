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
  res.json({ status: 'healthy', service: 'build-apk' });
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

// Build APK endpoint
app.post('/build-apk', verifyToken, async (req, res) => {
  try {
    const { appHistoryId } = req.body;
    const userId = req.user.uid;

    if (!appHistoryId) {
      return res.status(400).json({ error: 'appHistoryId is required' });
    }

    console.log(`Building APK for user ${userId}, app: ${appHistoryId}`);

    const db = admin.firestore();
    
    // Create build record
    const buildRef = db.collection('builds').doc();
    const buildId = buildRef.id;

    await buildRef.set({
      buildId,
      userId,
      appHistoryId,
      platform: 'android',
      status: 'pending',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    console.log('Build record created:', buildId);

    // Start async build process
    startBuildProcess(buildId, appHistoryId, userId).catch(error => {
      console.error('Background build error:', error);
    });

    res.json({
      success: true,
      buildId,
      status: 'pending'
    });

  } catch (error) {
    console.error('Build initiation error:', error);
    res.status(500).json({ error: error.message || 'Failed to start build' });
  }
});

// Background build process
async function startBuildProcess(buildId, appHistoryId, userId) {
  const db = admin.firestore();
  const buildRef = db.collection('builds').doc(buildId);

  try {
    // Update to building status
    await buildRef.update({
      status: 'building',
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    console.log('Building APK for:', buildId);

    // TODO: Implement actual build logic here
    // Options:
    // 1. Call Expo EAS Build API
    // 2. Use Firebase App Distribution
    // 3. Trigger custom Android build pipeline
    
    // Example: Call Expo EAS Build
    // const expoToken = process.env.EXPO_ACCESS_TOKEN;
    // const response = await fetch('https://api.expo.dev/v2/builds', {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${expoToken}`,
    //     'Content-Type': 'application/json'
    //   },
    //   body: JSON.stringify({
    //     appId: 'your-app-id',
    //     platform: 'android',
    //     buildType: 'apk'
    //   })
    // });

    // For demo: simulate build taking 2 minutes
    await new Promise(resolve => setTimeout(resolve, 120000));

    // Update with completion
    await buildRef.update({
      status: 'completed',
      downloadUrl: `https://storage.googleapis.com/your-bucket/builds/${buildId}.apk`,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    console.log('Build completed:', buildId);

  } catch (error) {
    console.error('Build process error:', error);
    await buildRef.update({
      status: 'failed',
      errorMessage: error.message || 'Build failed',
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
  }
}

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Build APK service listening on port ${PORT}`);
});
