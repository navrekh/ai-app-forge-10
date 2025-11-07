const express = require('express');
const admin = require('firebase-admin');
const cors = require('cors');
const fetch = require('node-fetch');
const { Storage } = require('@google-cloud/storage');
const FormData = require('form-data');
const AdmZip = require('adm-zip');

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp();
}

// Initialize Cloud Storage
const storage = new Storage();
const bucketName = process.env.GCS_BUCKET_NAME || 'mobiledev-marketplace-ai-apps';

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

// Submit build to Expo EAS
async function submitExpoEASBuild(zipUrl, platform = 'android') {
  const expoToken = process.env.EXPO_ACCESS_TOKEN;
  const expoProjectId = process.env.EXPO_PROJECT_ID;

  if (!expoToken || !expoProjectId) {
    throw new Error('EXPO_ACCESS_TOKEN or EXPO_PROJECT_ID not configured');
  }

  // Download ZIP
  const zipResponse = await fetch(zipUrl);
  const zipBuffer = await zipResponse.buffer();

  // Submit build
  const response = await fetch(`https://api.expo.dev/v2/projects/${expoProjectId}/builds`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${expoToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      platform,
      buildProfile: 'production',
      sourceType: 'archive',
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Expo EAS Build failed: ${error}`);
  }

  const data = await response.json();
  return data.id; // Expo build ID
}

// Copy artifact from Expo to GCS
async function copyArtifactToGCS(expoArtifactUrl, userId, buildId, platform) {
  const bucket = storage.bucket(bucketName);
  const extension = platform === 'android' ? 'apk' : 'ipa';
  const fileName = `${platform}s/${userId}/${buildId}.${extension}`;
  const file = bucket.file(fileName);

  // Download from Expo
  const response = await fetch(expoArtifactUrl);
  const buffer = await response.buffer();

  // Upload to GCS
  await file.save(buffer, {
    contentType: platform === 'android' ? 'application/vnd.android.package-archive' : 'application/octet-stream',
    metadata: {
      cacheControl: 'public, max-age=31536000',
    }
  });

  await file.makePublic();
  
  return `https://storage.googleapis.com/${bucketName}/${fileName}`;
}

// Build APK endpoint
app.post('/build-apk', verifyToken, async (req, res) => {
  try {
    const { appHistoryId, platform = 'android' } = req.body;
    const userId = req.user.uid;
    const userEmail = req.user.email || 'unknown';

    if (!appHistoryId) {
      return res.status(400).json({ error: 'appHistoryId is required' });
    }

    console.log(`[${new Date().toISOString()}] Building ${platform} for user ${userId} (${userEmail}), app: ${appHistoryId}`);

    const db = admin.firestore();
    
    // Get app history
    const appHistoryQuery = await db.collection('app_history')
      .where('appData.appId', '==', appHistoryId)
      .limit(1)
      .get();

    if (appHistoryQuery.empty) {
      return res.status(404).json({ error: 'App not found' });
    }

    const appData = appHistoryQuery.docs[0].data();
    const zipUrl = appData.appData.download_url;

    // Create build record
    const buildRef = db.collection('builds').doc();
    const buildId = buildRef.id;

    await buildRef.set({
      buildId,
      userId,
      userEmail,
      appHistoryId,
      platform,
      status: 'pending',
      zipUrl,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    console.log('Build record created:', buildId);

    // Start async build process
    startBuildProcess(buildId, zipUrl, platform, userId).catch(error => {
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

// Build IPA endpoint
app.post('/build-ipa', verifyToken, async (req, res) => {
  try {
    const { appHistoryId } = req.body;
    req.body.platform = 'ios';
    
    // Reuse the APK endpoint logic
    return app._router.handle(req, res);
  } catch (error) {
    console.error('IPA build initiation error:', error);
    res.status(500).json({ error: error.message || 'Failed to start iOS build' });
  }
});

// Background build process
async function startBuildProcess(buildId, zipUrl, platform, userId) {
  const db = admin.firestore();
  const buildRef = db.collection('builds').doc(buildId);

  try {
    // Update to building status
    await buildRef.update({
      status: 'building',
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    console.log(`[${new Date().toISOString()}] Starting Expo EAS build:`, buildId);

    // Submit to Expo EAS
    const expoBuildId = await submitExpoEASBuild(zipUrl, platform);
    
    await buildRef.update({
      expoBuildId,
      status: 'building',
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    console.log(`Expo build submitted: ${expoBuildId}`);

    // Poll for build completion (check every 30 seconds)
    let completed = false;
    let attempts = 0;
    const maxAttempts = 60; // 30 minutes max

    while (!completed && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 30000));
      attempts++;

      const statusResponse = await fetch(
        `https://api.expo.dev/v2/builds/${expoBuildId}`,
        {
          headers: {
            'Authorization': `Bearer ${process.env.EXPO_ACCESS_TOKEN}`,
          }
        }
      );

      const buildStatus = await statusResponse.json();
      
      console.log(`Build ${expoBuildId} status: ${buildStatus.status}`);

      if (buildStatus.status === 'finished') {
        completed = true;
        
        // Copy artifact to GCS
        const gcsUrl = await copyArtifactToGCS(
          buildStatus.artifacts.buildUrl,
          userId,
          buildId,
          platform
        );

        await buildRef.update({
          status: 'completed',
          downloadUrl: gcsUrl,
          expoArtifactUrl: buildStatus.artifacts.buildUrl,
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });

        console.log(`[${new Date().toISOString()}] Build completed:`, buildId);
      } else if (buildStatus.status === 'errored') {
        throw new Error(buildStatus.error?.message || 'Build failed');
      }
    }

    if (!completed) {
      throw new Error('Build timeout');
    }

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
