const functions = require('@google-cloud/functions-framework');
const { Firestore } = require('@google-cloud/firestore');
const admin = require('firebase-admin');

// Initialize Firebase Admin (do this once)
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = new Firestore();

functions.http('buildStatus', async (req, res) => {
  // Enable CORS
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  if (req.method !== 'GET') {
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

    // Extract buildId from URL path
    const buildId = req.path.split('/').pop();

    if (!buildId) {
      res.status(400).json({ error: 'buildId is required' });
      return;
    }

    // Get build from Firestore
    const buildDoc = await db.collection('builds').doc(buildId).get();

    if (!buildDoc.exists) {
      res.status(404).json({ error: 'Build not found' });
      return;
    }

    const buildData = buildDoc.data();

    // Verify user owns this build
    if (buildData.userId !== userId) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    // Return build status
    res.status(200).json({
      buildId: buildDoc.id,
      status: buildData.status,
      downloadUrl: buildData.downloadUrl || null,
      errorMessage: buildData.errorMessage || null,
      createdAt: buildData.createdAt,
      updatedAt: buildData.updatedAt,
    });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});
