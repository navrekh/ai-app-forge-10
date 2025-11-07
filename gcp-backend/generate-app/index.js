const express = require('express');
const admin = require('firebase-admin');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { Storage } = require('@google-cloud/storage');
const archiver = require('archiver');
const { Readable } = require('stream');

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp();
}

// Initialize Google AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

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

app.use(express.json({ limit: '50mb' }));

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

// Generate Expo project structure with Gemini
async function generateExpoApp(prompt) {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

  const systemPrompt = `You are an expert React Native developer. Generate a complete Expo app based on the user's prompt.
Return ONLY valid JSON with this exact structure:
{
  "appName": "string",
  "components": {
    "App.js": "string (full code)",
    "components/Component1.js": "string (full code)",
    ...
  },
  "package.json": "string (full package.json content)"
}

Requirements:
- Use Expo SDK 50+
- Include all necessary imports
- Use modern React hooks
- Include basic styling
- Keep it simple and functional
- No explanations, ONLY JSON`;

  try {
    const result = await model.generateContent([
      systemPrompt,
      `User request: ${prompt}`
    ]);
    
    const response = result.response;
    let text = response.text();
    
    // Clean markdown code blocks if present
    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    return JSON.parse(text);
  } catch (error) {
    console.error('Gemini generation error:', error);
    throw new Error('Failed to generate app structure');
  }
}

// Create ZIP from app structure
async function createZipBuffer(appStructure) {
  return new Promise((resolve, reject) => {
    const archive = archiver('zip', { zlib: { level: 9 } });
    const chunks = [];

    archive.on('data', (chunk) => chunks.push(chunk));
    archive.on('end', () => resolve(Buffer.concat(chunks)));
    archive.on('error', reject);

    // Add components
    for (const [path, content] of Object.entries(appStructure.components)) {
      archive.append(content, { name: path });
    }

    // Add package.json
    archive.append(appStructure.package.json, { name: 'package.json' });

    // Add basic config files
    archive.append(JSON.stringify({
      "expo": {
        "name": appStructure.appName,
        "slug": appStructure.appName.toLowerCase().replace(/\s+/g, '-'),
        "version": "1.0.0",
        "platforms": ["ios", "android"],
        "android": {
          "package": `com.mobiledev.${appStructure.appName.toLowerCase().replace(/\s+/g, '')}`
        },
        "ios": {
          "bundleIdentifier": `com.mobiledev.${appStructure.appName.toLowerCase().replace(/\s+/g, '')}`
        }
      }
    }, null, 2), { name: 'app.json' });

    archive.finalize();
  });
}

// Upload to GCS
async function uploadToGCS(buffer, userId, appId) {
  const bucket = storage.bucket(bucketName);
  const fileName = `apps/${userId}/${appId}.zip`;
  const file = bucket.file(fileName);

  await file.save(buffer, {
    contentType: 'application/zip',
    metadata: {
      cacheControl: 'public, max-age=31536000',
    }
  });

  await file.makePublic();
  
  return `https://storage.googleapis.com/${bucketName}/${fileName}`;
}

// Generate app endpoint
app.post('/generate-app', verifyToken, async (req, res) => {
  const startTime = Date.now();
  
  try {
    const { prompt } = req.body;
    const userId = req.user.uid;
    const userEmail = req.user.email || 'unknown';

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    console.log(`[${new Date().toISOString()}] Generating app for user ${userId} (${userEmail}): ${prompt}`);

    // Generate app structure with Gemini
    const appStructure = await generateExpoApp(prompt);
    console.log(`App structure generated: ${appStructure.appName}`);

    // Create ZIP
    const zipBuffer = await createZipBuffer(appStructure);
    console.log(`ZIP created: ${zipBuffer.length} bytes`);

    // Upload to GCS
    const appId = `app_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const downloadUrl = await uploadToGCS(zipBuffer, userId, appId);
    console.log(`Uploaded to GCS: ${downloadUrl}`);

    const responseData = {
      success: true,
      appId,
      download_url: downloadUrl,
      file: `${appId}.zip`,
      stored: true,
      appName: appStructure.appName,
      generationTime: Date.now() - startTime
    };

    // Save to Firestore
    const db = admin.firestore();
    await db.collection('app_history').add({
      userId,
      userEmail,
      prompt,
      appData: responseData,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    console.log(`[${new Date().toISOString()}] Generation complete for ${appId} in ${responseData.generationTime}ms`);

    res.json(responseData);

  } catch (error) {
    console.error('[Generation error]', error);
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
