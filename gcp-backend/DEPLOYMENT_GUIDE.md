# MobileDev Backend - Complete Deployment Guide

This guide will walk you through deploying all three backend services to Google Cloud Run.

## Prerequisites Checklist

Before starting, ensure you have:

- [ ] Google Cloud Project created
- [ ] Firebase project created and linked
- [ ] Gemini API key from Google AI Studio
- [ ] Expo account with EAS Build access
- [ ] `gcloud` CLI installed and authenticated
- [ ] Node.js 18+ installed locally

## Step 1: Get Firebase Service Account Key

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Click **Project Settings** (gear icon)
4. Navigate to **Service Accounts** tab
5. Click **Generate new private key**
6. Save the JSON file securely (you'll need it later)

## Step 2: Get Gemini API Key

Since you mentioned you already have Gemini from Google:

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create or copy your existing API key
3. Save it for the deployment step

## Step 3: Set Up Google Cloud Storage

```bash
# Set your project ID
export PROJECT_ID="your-project-id"
gcloud config set project $PROJECT_ID

# Create storage bucket
gsutil mb -p $PROJECT_ID -c STANDARD -l asia-south1 gs://mobiledev-marketplace-ai-apps

# Make bucket publicly readable
gsutil iam ch allUsers:objectViewer gs://mobiledev-marketplace-ai-apps

# Enable CORS (optional but recommended)
echo '[{"origin":["*"],"method":["GET"],"maxAgeSeconds":3600}]' > cors.json
gsutil cors set cors.json gs://mobiledev-marketplace-ai-apps
rm cors.json
```

## Step 4: Set Up Expo EAS Build

```bash
# Install Expo CLI globally
npm install -g expo-cli eas-cli

# Login to Expo
npx expo login

# Get your access token
npx expo whoami --token
# Copy the token that appears

# Create a new Expo project or use existing one
npx create-expo-app my-template-app
cd my-template-app

# Initialize EAS
eas build:configure

# Get your project ID from app.json or run:
eas project:info
# Copy the Project ID
```

## Step 5: Enable Required Google Cloud APIs

```bash
# Enable Cloud Run API
gcloud services enable run.googleapis.com

# Enable Cloud Build API
gcloud services enable cloudbuild.googleapis.com

# Enable Firestore API
gcloud services enable firestore.googleapis.com

# Enable Storage API
gcloud services enable storage-api.googleapis.com
```

## Step 6: Deploy generate-app Service

```bash
cd gcp-backend/generate-app

# Deploy with environment variables
gcloud run deploy generate-app \
  --source . \
  --region asia-south1 \
  --allow-unauthenticated \
  --memory 2Gi \
  --cpu 2 \
  --timeout 540 \
  --set-env-vars GEMINI_API_KEY="YOUR_GEMINI_API_KEY_HERE" \
  --set-env-vars GCS_BUCKET_NAME="mobiledev-marketplace-ai-apps"

# Save the service URL that appears (you'll need it for frontend)
# Example: https://generate-app-xxxxx-uc.a.run.app
```

## Step 7: Deploy build-apk Service

```bash
cd ../build-apk

# Deploy with environment variables
gcloud run deploy build-apk \
  --source . \
  --region asia-south1 \
  --allow-unauthenticated \
  --memory 2Gi \
  --cpu 2 \
  --timeout 3600 \
  --set-env-vars EXPO_ACCESS_TOKEN="YOUR_EXPO_TOKEN_HERE" \
  --set-env-vars EXPO_PROJECT_ID="YOUR_EXPO_PROJECT_ID_HERE" \
  --set-env-vars GCS_BUCKET_NAME="mobiledev-marketplace-ai-apps"

# Save the service URL
# Example: https://build-apk-xxxxx-uc.a.run.app
```

## Step 8: Deploy build-status Service

```bash
cd ../build-status

# Deploy (this service needs fewer resources)
gcloud run deploy build-status \
  --source . \
  --region asia-south1 \
  --allow-unauthenticated \
  --memory 512Mi \
  --cpu 1 \
  --timeout 60

# Save the service URL
# Example: https://build-status-xxxxx-uc.a.run.app
```

## Step 9: Update Frontend Configuration

Update your frontend environment variables with the deployed service URLs:

```bash
# In your frontend project, create or update .env file
VITE_GENERATE_APP_URL=https://generate-app-xxxxx-uc.a.run.app
VITE_BUILD_APK_URL=https://build-apk-xxxxx-uc.a.run.app
VITE_BUILD_STATUS_URL=https://build-status-xxxxx-uc.a.run.app
```

Then update your frontend code to use these URLs instead of hardcoded ones.

## Step 10: Test the Deployment

### Test generate-app:
```bash
# Get a Firebase auth token first (from your frontend after logging in)
curl -X POST https://generate-app-xxxxx-uc.a.run.app/generate-app \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Create a simple hello world app"}'
```

### Test build-apk:
```bash
curl -X POST https://build-apk-xxxxx-uc.a.run.app/build-apk \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"appHistoryId": "YOUR_APP_ID_FROM_GENERATE"}'
```

### Test build-status:
```bash
curl -X GET https://build-status-xxxxx-uc.a.run.app/build-status/YOUR_BUILD_ID \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN"
```

## Monitoring and Logs

### View logs for a service:
```bash
# generate-app logs
gcloud run logs read generate-app --region asia-south1 --limit 50

# build-apk logs
gcloud run logs read build-apk --region asia-south1 --limit 50

# build-status logs
gcloud run logs read build-status --region asia-south1 --limit 50
```

### Stream logs in real-time:
```bash
gcloud run logs tail generate-app --region asia-south1
```

### View service details:
```bash
gcloud run services describe generate-app --region asia-south1
```

## Cost Optimization

1. **Set minimum instances to 0** (default):
   ```bash
   gcloud run services update generate-app --region asia-south1 --min-instances 0
   ```

2. **Monitor usage**:
   - Go to [Cloud Console](https://console.cloud.google.com)
   - Navigate to **Cloud Run** → Your service → **Metrics**
   - Check request count, CPU usage, memory usage

3. **Set budget alerts**:
   - Go to **Billing** → **Budgets & alerts**
   - Create budget with email notifications

## Troubleshooting

### Issue: "Service account does not have permission"
**Solution**: Ensure your Cloud Run service account has these roles:
```bash
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member=serviceAccount:PROJECT_NUMBER-compute@developer.gserviceaccount.com \
  --role=roles/storage.admin

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member=serviceAccount:PROJECT_NUMBER-compute@developer.gserviceaccount.com \
  --role=roles/datastore.user
```

### Issue: "Function deployment had errors"
**Solution**: Check the build logs:
```bash
gcloud run logs read generate-app --region asia-south1 --limit 10
```

### Issue: "Gemini API quota exceeded"
**Solution**: 
1. Check your quota at [Google Cloud Console](https://console.cloud.google.com/apis/api/generativelanguage.googleapis.com/quotas)
2. Request quota increase if needed
3. Implement rate limiting in your frontend

### Issue: "Expo build fails"
**Solution**:
1. Verify Expo credentials are correct
2. Check EAS build limits on your Expo account
3. Review Expo build logs at expo.dev

## Security Best Practices

1. **Never commit secrets to Git**
2. **Rotate API keys periodically**
3. **Use Secret Manager for production** (optional):
   ```bash
   # Store secrets in Secret Manager
   echo -n "your-secret" | gcloud secrets create gemini-api-key --data-file=-
   
   # Grant Cloud Run access
   gcloud secrets add-iam-policy-binding gemini-api-key \
     --member=serviceAccount:PROJECT_NUMBER-compute@developer.gserviceaccount.com \
     --role=roles/secretmanager.secretAccessor
   ```

4. **Enable audit logs**:
   ```bash
   gcloud projects get-iam-policy $PROJECT_ID > policy.yaml
   # Edit policy.yaml to enable audit logs
   gcloud projects set-iam-policy $PROJECT_ID policy.yaml
   ```

## Updating Services

To update a service after code changes:

```bash
cd gcp-backend/generate-app

# Redeploy (keeps existing env vars)
gcloud run deploy generate-app \
  --source . \
  --region asia-south1

# Or update specific env var
gcloud run services update generate-app \
  --region asia-south1 \
  --set-env-vars GEMINI_API_KEY="new-key"
```

## Next Steps

- [ ] Set up CI/CD pipeline (GitHub Actions, Cloud Build)
- [ ] Implement rate limiting
- [ ] Add API key authentication for additional security
- [ ] Set up monitoring and alerting
- [ ] Create staging and production environments
- [ ] Implement caching for frequently generated apps

## Support

For issues:
1. Check Cloud Run logs
2. Review Firestore data
3. Test API endpoints with curl
4. Contact support with logs and error messages
