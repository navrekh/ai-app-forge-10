# Backend Configuration

## Current Setup

Your frontend is now configured to connect to the deployed Google Cloud Run backend services.

## Update Service URLs

After deploying your backend services, you need to update the URLs in one of two ways:

### Option 1: Using Environment Variables (Recommended for Production)

1. Add these variables to your `.env` file:
   ```bash
   VITE_GENERATE_APP_URL=https://your-generate-app-url.run.app
   VITE_BUILD_APK_URL=https://your-build-apk-url.run.app
   VITE_BUILD_STATUS_URL=https://your-build-status-url.run.app
   ```

2. Restart your development server

### Option 2: Direct Configuration (Quick Testing)

Edit `src/config/backend.ts` and replace the placeholder URLs with your actual Cloud Run URLs:

```typescript
export const BACKEND_CONFIG = {
  generateAppUrl: 'https://your-actual-generate-app-url.run.app',
  buildApkUrl: 'https://your-actual-build-apk-url.run.app',
  buildStatusUrl: 'https://your-actual-build-status-url.run.app',
} as const;
```

## Getting Your Service URLs

After deploying each service, Cloud Run displays the service URL. It looks like:
```
https://generate-app-xxxxx-uc.a.run.app
```

Copy these URLs and use them in your configuration.

## Testing the Integration

1. **Generate App**:
   - Go to the Dashboard
   - Enter a prompt (e.g., "Create a simple todo app")
   - Click "Generate App"
   - You should see "App generated successfully!" with a download link

2. **Build APK**:
   - After generating an app, click "Build APK"
   - The build will start (takes 10-30 minutes)
   - Status updates automatically every 30 seconds

3. **Download**:
   - When complete, the "Download APK" button appears
   - Click to download your APK file from Google Cloud Storage

## Architecture

```
Frontend (React) → Cloud Run Services → Gemini AI / Expo EAS Build
                                    ↓
                            Google Cloud Storage
                                    ↓
                        Firestore (logs/history)
```

## Troubleshooting

### "Failed to generate app"
- Check that GEMINI_API_KEY is set in generate-app service
- View logs: `gcloud run logs read generate-app --region asia-south1`

### "Failed to start build"
- Verify EXPO_ACCESS_TOKEN and EXPO_PROJECT_ID are set in build-apk service
- Check Expo account has EAS Build enabled

### "CORS error"
- All services have CORS enabled for `*` origin
- Ensure you're using `https://` URLs (not `http://`)

### Build stuck in "pending"
- Check build-apk logs: `gcloud run logs read build-apk --region asia-south1`
- Verify Expo credentials are valid

## Next Steps

- [ ] Update the service URLs in your config
- [ ] Test generating an app
- [ ] Test building an APK
- [ ] Monitor costs in Google Cloud Console
- [ ] Set up budget alerts
- [ ] Add rate limiting for production use
