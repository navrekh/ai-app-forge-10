const functions = require('@google-cloud/functions-framework');
const { Firestore } = require('@google-cloud/firestore');
const admin = require('firebase-admin');

// Initialize Firebase Admin (do this once)
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = new Firestore();

functions.http('buildApk', async (req, res) => {
  // Enable CORS
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    // Verify Firebase Auth token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await admin.auth().verifyIdToken(token);
    const userId = decodedToken.uid;

    const { appHistoryId, appData } = req.body;

    if (!appHistoryId) {
      res.status(400).json({ error: 'appHistoryId is required' });
      return;
    }

    // Create build record in Firestore
    const buildRef = db.collection('builds').doc();
    const buildId = buildRef.id;

    await buildRef.set({
      buildId,
      userId,
      appHistoryId,
      platform: 'android',
      status: 'pending',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Trigger async build process
    triggerBuildProcess(buildId, appData).catch(async (error) => {
      console.error('Build process error:', error);
      await buildRef.update({
        status: 'failed',
        errorMessage: error.message,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    });

    res.status(200).json({
      success: true,
      buildId,
      status: 'pending',
    });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

async function triggerBuildProcess(buildId, appData) {
  const buildRef = db.collection('builds').doc(buildId);

  try {
    // Update status to building
    await buildRef.update({
      status: 'building',
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Here you would integrate with your actual build service
    // Options:
    // 1. Expo EAS Build API
    // 2. Firebase App Distribution
    // 3. Custom Android build pipeline
    
    // Example: Call Expo EAS Build
    // const response = await fetch('https://api.expo.dev/v2/builds', {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${process.env.EXPO_ACCESS_TOKEN}`,
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({
    //     appId: appData.packageName,
    //     platform: 'android',
    //     // ... build configuration
    //   }),
    // });

    // For demo: simulate build process
    await new Promise(resolve => setTimeout(resolve, 120000)); // 2 minutes

    // Update with completion
    await buildRef.update({
      status: 'completed',
      downloadUrl: `https://storage.googleapis.com/your-bucket/builds/${buildId}.apk`,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

  } catch (error) {
    console.error('Build error:', error);
    throw error;
  }
}
