# MobileDev Backend - GCP Cloud Run Services

Backend services for MobileDev with Firebase Authentication integration, Gemini AI, and Expo EAS Build.

## Services

1. **generate-app** - Generates Expo/React Native apps using Gemini AI
2. **build-apk** - Builds Android APK and iOS IPA files via Expo EAS Build
3. **build-status** - Checks build status and provides download URLs

## Setup

### Prerequisites
- Google Cloud Project with Cloud Run and Cloud Storage enabled
- Firebase project with Admin SDK credentials
- Gemini API key from Google AI Studio
- Expo account with EAS Build access
- Node.js 18+

### 1. Firebase Admin Setup

1. Go to Firebase Console → Project Settings → Service Accounts
2. Click "Generate new private key"
3. Save the JSON file securely

### 2. Google Cloud Storage Setup

1. Create a bucket for storing generated apps and builds:
   ```bash
   gsutil mb -p YOUR_PROJECT_ID -c STANDARD -l asia-south1 gs://mobiledev-marketplace-ai-apps
   ```
2. Make bucket publicly accessible:
   ```bash
   gsutil iam ch allUsers:objectViewer gs://mobiledev-marketplace-ai-apps
   ```

### 3. Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Save it securely for deployment

### 4. Expo EAS Build Setup

1. Create an Expo account at [expo.dev](https://expo.dev)
2. Create a new project or use existing
3. Get your Expo Access Token:
   ```bash
   npx expo login
   npx expo whoami --token
   ```
4. Get your Expo Project ID from `app.json` or Expo dashboard

### 5. Local Development

```bash
# Install dependencies for each service
cd generate-app && npm install && cd ..
cd build-apk && npm install && cd ..
cd build-status && npm install && cd ..

# Set up environment variables
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/serviceAccountKey.json"
export GEMINI_API_KEY="your-gemini-api-key"
export GCS_BUCKET_NAME="mobiledev-marketplace-ai-apps"
export EXPO_ACCESS_TOKEN="your-expo-token"
export EXPO_PROJECT_ID="your-expo-project-id"

# Run service locally
cd generate-app
npm start
```

### 6. Deploy to Cloud Run

Deploy each service with all required environment variables:

```bash
# Deploy generate-app service
gcloud run deploy generate-app \
  --source ./generate-app \
  --region asia-south1 \
  --allow-unauthenticated \
  --memory 2Gi \
  --cpu 2 \
  --timeout 540 \
  --set-env-vars GEMINI_API_KEY="YOUR_GEMINI_KEY" \
  --set-env-vars GCS_BUCKET_NAME="mobiledev-marketplace-ai-apps"

# Deploy build-apk service  
gcloud run deploy build-apk \
  --source ./build-apk \
  --region asia-south1 \
  --allow-unauthenticated \
  --memory 2Gi \
  --cpu 2 \
  --timeout 3600 \
  --set-env-vars EXPO_ACCESS_TOKEN="YOUR_EXPO_TOKEN" \
  --set-env-vars EXPO_PROJECT_ID="YOUR_EXPO_PROJECT_ID" \
  --set-env-vars GCS_BUCKET_NAME="mobiledev-marketplace-ai-apps"

# Deploy build-status service
gcloud run deploy build-status \
  --source ./build-status \
  --region asia-south1 \
  --allow-unauthenticated

# Note: Firebase credentials are automatically handled by Cloud Run when deployed
```

### 7. Update Frontend URLs

After deployment, update your frontend to use the Cloud Run URLs:

```javascript
// In your frontend .env or config
VITE_GENERATE_APP_URL=https://generate-app-xxx-uc.a.run.app
VITE_BUILD_APK_URL=https://build-apk-xxx-uc.a.run.app  
VITE_BUILD_STATUS_URL=https://build-status-xxx-uc.a.run.app
```

## Environment Variables

### generate-app
- `GEMINI_API_KEY` - Google Gemini API key (required)
- `GCS_BUCKET_NAME` - Cloud Storage bucket name (default: mobiledev-marketplace-ai-apps)
- `PORT` - Port to run the service (default: 8080)

### build-apk
- `EXPO_ACCESS_TOKEN` - Expo access token (required)
- `EXPO_PROJECT_ID` - Expo project ID (required)
- `GCS_BUCKET_NAME` - Cloud Storage bucket name (default: mobiledev-marketplace-ai-apps)
- `PORT` - Port to run the service (default: 8080)

### build-status
- `PORT` - Port to run the service (default: 8080)

**Note:** Firebase credentials are automatically provided by Cloud Run when services are deployed.

## API Endpoints

### Generate App
```bash
POST /generate-app
Authorization: Bearer <firebase-token>
Content-Type: application/json

{
  "prompt": "Create a todo app with dark mode"
}
```

### Build APK
```bash
POST /build-apk
Authorization: Bearer <firebase-token>
Content-Type: application/json

{
  "appHistoryId": "app_123456",
  "platform": "android"  // optional, defaults to "android"
}

Response:
{
  "success": true,
  "buildId": "xyz123",
  "status": "pending"
}
```

### Build IPA
```bash
POST /build-ipa
Authorization: Bearer <firebase-token>
Content-Type: application/json

{
  "appHistoryId": "app_123456"
}

Response:
{
  "success": true,
  "buildId": "xyz123",
  "status": "pending"
}
```

### Check Build Status
```bash
GET /build-status/{buildId}
Authorization: Bearer <firebase-token>

Response:
{
  "buildId": "xyz123",
  "status": "completed",  // pending, building, completed, failed
  "platform": "android",
  "downloadUrl": "https://storage.googleapis.com/.../build.apk",
  "expoArtifactUrl": "https://expo.dev/artifacts/...",
  "expoBuildId": "abc-def-ghi",
  "errorMessage": null,
  "createdAt": "2025-01-07T12:00:00Z",
  "updatedAt": "2025-01-07T12:15:00Z"
}
```

## Firestore Collections

### `builds`
```javascript
{
  buildId: string,
  userId: string,
  userEmail: string,
  appHistoryId: string,
  platform: 'android' | 'ios',
  status: 'pending' | 'building' | 'completed' | 'failed',
  zipUrl: string,
  downloadUrl: string?,           // GCS public URL
  expoArtifactUrl: string?,       // Original Expo URL
  expoBuildId: string?,           // Expo build ID
  errorMessage: string?,
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### `app_history`
```javascript
{
  userId: string,
  userEmail: string,
  prompt: string,
  appData: {
    success: boolean,
    appId: string,
    download_url: string,
    file: string,
    stored: boolean,
    appName: string,
    generationTime: number
  },
  createdAt: Timestamp
}
```

## Security

- All endpoints require Firebase Authentication tokens
- Tokens are verified using Firebase Admin SDK
- User ID is extracted from token and used for authorization
- CORS is enabled for browser access

## Monitoring

View logs:
```bash
gcloud run logs read generate-app --region asia-south1
gcloud run logs read build-apk --region asia-south1
gcloud run logs read build-status --region asia-south1
```

## Architecture

```
┌─────────────┐     ┌──────────────────┐     ┌──────────────┐
│   Frontend  │────▶│  generate-app    │────▶│  Gemini API  │
│   (React)   │     │  Cloud Run       │     └──────────────┘
└─────────────┘     └──────────────────┘            │
       │                     │                       ▼
       │                     │              ┌──────────────┐
       │                     └─────────────▶│ Cloud Storage│
       │                                    │   (ZIP files)│
       │                                    └──────────────┘
       │
       │            ┌──────────────────┐
       └───────────▶│   build-apk      │
                    │   Cloud Run      │
                    └──────────────────┘
                            │
                            ▼
                   ┌──────────────────┐
                   │  Expo EAS Build  │
                   └──────────────────┘
                            │
                            ▼
                   ┌──────────────────┐
                   │ Cloud Storage    │
                   │ (APK/IPA files)  │
                   └──────────────────┘
                            │
                            ▼
                   ┌──────────────────┐
                   │  build-status    │
                   │  Cloud Run       │
                   └──────────────────┘
```

## Troubleshooting

### CORS Errors
- All services have CORS enabled for `*` origin
- OPTIONS requests are handled automatically
- Check that Authorization header is included in requests

### Authentication Errors
- Ensure Firebase token is valid and not expired
- Token must be sent as `Authorization: Bearer {token}`
- Check Cloud Run logs for token verification errors

### Gemini API Errors
- Verify GEMINI_API_KEY is set correctly
- Check API quota and billing in Google Cloud Console
- Review logs for JSON parsing errors

### Expo Build Errors  
- Ensure EXPO_ACCESS_TOKEN and EXPO_PROJECT_ID are set
- Check Expo account has EAS Build enabled
- Verify app.json and eas.json configuration
- Review Expo build logs at expo.dev

### Storage Errors
- Verify bucket exists and is accessible
- Check IAM permissions for Cloud Run service account
- Ensure bucket is publicly readable for downloads

### Build Timeouts
- Expo builds can take 10-30 minutes
- Cloud Run timeout is set to 3600s (1 hour) for build-apk
- Check build status endpoint regularly for updates
