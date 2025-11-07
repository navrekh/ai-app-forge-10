# GCP Cloud Functions for APK Build System

This folder contains example implementations for the GCP backend that handles APK builds using Firestore.

## Firestore Schema

### Collection: `builds`

```javascript
{
  buildId: string,          // Document ID
  userId: string,           // Firebase Auth UID
  appHistoryId: string,     // Reference to app data
  platform: 'android',      // Platform type
  status: string,           // 'pending' | 'building' | 'completed' | 'failed'
  downloadUrl: string?,     // Available when status is 'completed'
  errorMessage: string?,    // Available when status is 'failed'
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

## Setup Instructions

1. **Install Dependencies**
   ```bash
   cd gcp-backend-examples
   npm install
   ```

2. **Set up Firebase Admin SDK**
   - Download your service account key from Firebase Console
   - Set the environment variable:
     ```bash
     export GOOGLE_APPLICATION_CREDENTIALS="/path/to/serviceAccountKey.json"
     ```

3. **Deploy Cloud Functions**
   ```bash
   # Deploy build-apk function
   npm run deploy-build-apk
   
   # Deploy build-status function
   npm run deploy-build-status
   ```

4. **Set Environment Variables**
   ```bash
   # Set Expo access token (if using Expo EAS)
   gcloud functions deploy buildApk \
     --set-env-vars EXPO_ACCESS_TOKEN=your_token_here
   ```

## API Endpoints

After deployment, your functions will be available at:

- **Build APK**: `https://REGION-PROJECT_ID.cloudfunctions.net/buildApk`
- **Build Status**: `https://REGION-PROJECT_ID.cloudfunctions.net/buildStatus/{buildId}`

## Frontend Integration

Update your frontend's API_BASE constant:

```typescript
const API_BASE = 'https://us-central1-your-project.cloudfunctions.net';
```

The frontend code in `src/components/DownloadAPKButton.tsx` is already configured to work with these endpoints.

## Security Rules

Add Firestore security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /builds/{buildId} {
      // Users can read their own builds
      allow read: if request.auth != null && 
                    resource.data.userId == request.auth.uid;
      
      // Only cloud functions can create/update builds
      allow write: if false;
    }
  }
}
```

## Build Integration Options

### Option 1: Expo EAS Build
```javascript
const response = await fetch('https://api.expo.dev/v2/builds', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${process.env.EXPO_ACCESS_TOKEN}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    appId: 'your-app-id',
    platform: 'android',
    buildType: 'apk',
  }),
});
```

### Option 2: Firebase App Distribution
```javascript
const { getStorage } = require('firebase-admin/storage');
const bucket = getStorage().bucket();
// Upload APK and create distribution
```

### Option 3: Custom Android Build
Trigger your own Android build pipeline (Gradle, Docker, etc.)

## Testing

Test the endpoints locally:

```bash
# Start functions framework locally
npx @google-cloud/functions-framework --target=buildApk

# Test with curl
curl -X POST http://localhost:8080 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"appHistoryId": "test-123"}'
```
