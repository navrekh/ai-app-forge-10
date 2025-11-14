# Backend Deployment Guide

This Express backend must be deployed **separately** from your Lovable frontend.

## 📦 Installation

```bash
# Install dependencies
npm install express cors morgan

# For development
npm install -D nodemon
```

## 🚀 Running Locally

```bash
# Production mode
node server.js

# Development mode (with auto-reload)
npx nodemon server.js
```

Server will start on `http://localhost:8080` by default.

## 🌐 Deployment Options

### Option 1: Railway (Recommended)
1. Push your code to GitHub
2. Connect to Railway: https://railway.app
3. Deploy from GitHub repo
4. Railway will auto-detect Node.js and run `node server.js`
5. Copy your Railway URL and update `.env` in Lovable:
   ```
   VITE_API_URL=https://your-app.railway.app
   ```

### Option 2: Render
1. Push to GitHub
2. Create new Web Service on Render
3. Build Command: `npm install`
4. Start Command: `node server.js`
5. Update VITE_API_URL with your Render URL

### Option 3: Your VPS (api.appdev.co.in)
```bash
# SSH into your server
ssh user@api.appdev.co.in

# Clone or upload server.js
# Install dependencies
npm install

# Use PM2 for process management
npm install -g pm2
pm2 start server.js --name mobiledev-backend
pm2 save
pm2 startup
```

### Option 4: Vercel/Netlify Functions
Convert routes to serverless functions (requires restructuring).

## 🔧 Environment Variables

Set these in your deployment platform:

```bash
PORT=8080  # Optional, defaults to 8080
NODE_ENV=production
```

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| POST | `/api/build/start` | Start new build |
| GET | `/api/build-status/:buildId` | Check build status |
| POST | `/api/build-apk` | Build APK (placeholder) |

## 🔗 Frontend Configuration

Update your Lovable project's `.env` file:

```
VITE_API_URL=https://your-backend-url.com
```

**Important**: Replace with your actual backend URL (no trailing slash).

## ✅ Testing

```bash
# Health check
curl https://your-backend-url.com/health

# Start build
curl -X POST https://your-backend-url.com/api/build/start \
  -H "Content-Type: application/json" \
  -d '{"projectName":"Test","prompt":"Test app","screens":[]}'

# Check status
curl https://your-backend-url.com/api/build-status/YOUR_BUILD_ID
```

## 🛡️ Security Recommendations

1. **Add rate limiting**:
```bash
npm install express-rate-limit
```

2. **Add authentication** for production:
```bash
npm install jsonwebtoken
```

3. **Use environment variables** for sensitive data
4. **Enable HTTPS** on your deployment platform
5. **Add request validation** (zod, joi, etc.)

## 📊 Monitoring

- Check logs: `pm2 logs` (if using PM2)
- Railway/Render: Check deployment logs in dashboard
- Set up error tracking (Sentry, LogRocket, etc.)

## 🔄 Updates

To update your backend:

1. Make changes to `server.js`
2. Push to GitHub
3. Railway/Render will auto-deploy
4. For VPS: `pm2 restart mobiledev-backend`

## ❓ Troubleshooting

**Build fails to start:**
- Check CORS settings in `server.js`
- Verify VITE_API_URL in frontend `.env`
- Check backend logs for errors

**404 on endpoints:**
- Ensure backend is running
- Check URL matches exactly (no trailing slashes)
- Verify CORS is properly configured

**Connection refused:**
- Confirm PORT environment variable
- Check firewall rules on VPS
- Verify deployment is active
