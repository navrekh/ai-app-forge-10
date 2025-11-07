# MobileDev Backend - GCP Cloud Run Services

Backend services for MobileDev with Firebase Authentication integration.

## Services

1. **generate-app** - Generates React Native app from text prompts
2. **build-apk** - Builds Android APK files
3. **build-status** - Checks build status

## Setup

### Prerequisites
- Google Cloud Project with Cloud Run enabled
- Firebase project with Admin SDK credentials
- Node.js 18+

### Firebase Admin Setup

1. Go to Firebase Console → Project Settings → Service Accounts
2. Click "Generate new private key"
3. Save the JSON file securely
4. Set the path as environment variable when deploying:
   ```bash
   export GOOGLE_APPLICATION_CREDENTIALS="/path/to/serviceAccountKey.json"
   ```

### Local Development

```bash
# Install dependencies
npm install

# Set up Firebase credentials
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/serviceAccountKey.json"

# Run service locally (e.g., generate-app)
cd generate-app
npm start
```

### Deploy to Cloud Run

Deploy each service separately:

```bash
# Deploy generate-app service
gcloud run deploy generate-app \
  --source ./generate-app \
  --region asia-south1 \
  --allow-unauthenticated \
  --set-env-vars GOOGLE_APPLICATION_CREDENTIALS=/app/serviceAccountKey.json

# Deploy build-apk service
gcloud run deploy build-apk \
  --source ./build-apk \
  --region asia-south1 \
  --allow-unauthenticated \
  --set-env-vars GOOGLE_APPLICATION_CREDENTIALS=/app/serviceAccountKey.json

# Deploy build-status service
gcloud run deploy build-status \
  --source ./build-status \
  --region asia-south1 \
  --allow-unauthenticated \
  --set-env-vars GOOGLE_APPLICATION_CREDENTIALS=/app/serviceAccountKey.json
```

### Alternative: Deploy with Dockerfile

```bash
# Build and deploy
gcloud run deploy generate-app \
  --region asia-south1 \
  --allow-unauthenticated \
  --set-env-vars GOOGLE_APPLICATION_CREDENTIALS=/app/serviceAccountKey.json
```

## Environment Variables

- `GOOGLE_APPLICATION_CREDENTIALS` - Path to Firebase service account key
- `PORT` - Port to run the service (default: 8080)
- `EXPO_ACCESS_TOKEN` - (Optional) For Expo EAS Build integration

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
  "appHistoryId": "app_123456"
}
```

### Check Build Status
```bash
GET /build-status/{buildId}
Authorization: Bearer <firebase-token>
```

## Firestore Collections

### `builds`
```javascript
{
  buildId: string,
  userId: string,
  appHistoryId: string,
  platform: 'android',
  status: 'pending' | 'building' | 'completed' | 'failed',
  downloadUrl: string?,
  errorMessage: string?,
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### `app_history`
```javascript
{
  userId: string,
  prompt: string,
  appData: object,
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

## Troubleshooting

### CORS Errors
- Ensure CORS middleware is properly configured
- Check that OPTIONS requests are handled
- Verify allowed origins in CORS configuration

### Authentication Errors
- Verify Firebase service account key is properly set
- Check token expiration
- Ensure token is sent in Authorization header as "Bearer {token}"

### Build Issues
- Check Firestore permissions
- Verify storage bucket access
- Review build logs for specific errors
