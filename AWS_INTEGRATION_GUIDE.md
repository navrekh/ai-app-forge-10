# AWS Integration Guide

## ✅ Completed Setup

Your Lovable frontend is now integrated with your AWS Amplify backend:

### 1. **AWS Cognito Authentication**
- User Pool ID: `ap-south-1_SrobAUGpi`
- Client ID: `3nh0t8seo7onn2do52s10ql6vo`
- Email-based authentication

**Features:**
- Sign up with email confirmation
- Sign in/Sign out
- Automatic JWT token management
- Protected routes with Cognito session checks

**Routes:**
- `/auth-cognito` - New authentication page using AWS Cognito
- `/auth` - Original Supabase auth (still available)

### 2. **AWS S3 Storage**
- Bucket: `appdevbackend`
- Region: `ap-south-1`
- Authenticated users only
- Full CRUD permissions

**Features:**
- File upload with automatic key generation
- File download with signed URLs (1-hour expiry)
- File deletion
- File listing by prefix

### 3. **API Client with JWT**
- Automatic JWT token attachment to all API requests
- Token refresh handling
- 401 redirect to login

## Usage Examples

### Authentication

```typescript
import { cognitoAuth } from "@/utils/cognitoAuth";

// Sign up
const result = await cognitoAuth.signUp(email, password, fullName);

// Confirm email
await cognitoAuth.confirmSignUp(email, code);

// Sign in
await cognitoAuth.signIn(email, password);

// Get current user
const user = await cognitoAuth.getCurrentUser();

// Get tokens
const idToken = await cognitoAuth.getIdToken();
const accessToken = await cognitoAuth.getAccessToken();

// Sign out
await cognitoAuth.signOut();
```

### S3 Storage

```typescript
import { s3Storage } from "@/utils/s3Storage";

// Upload file
const result = await s3Storage.uploadFile(file);
console.log(result.key); // "uploads/1234567890-filename.jpg"

// Get download URL
const urlResult = await s3Storage.getFileUrl(key);
console.log(urlResult.url);

// Delete file
await s3Storage.deleteFile(key);

// List files
const files = await s3Storage.listFiles("uploads/");
```

### API Calls with JWT

```typescript
import { apiClient } from "@/utils/apiClient";

// All requests automatically include JWT token
const response = await apiClient.post("/api/build/start", {
  projectName: "My App",
  prompt: "Create a todo app",
  screens: []
});
```

## Backend Setup Required

### 1. JWT Verification Middleware

Your backend needs to verify Cognito JWT tokens. Here's example middleware:

```javascript
const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');

const client = jwksClient({
  jwksUri: `https://cognito-idp.ap-south-1.amazonaws.com/${process.env.COGNITO_USER_POOL_ID}/.well-known/jwks.json`
});

function getKey(header, callback) {
  client.getSigningKey(header.kid, (err, key) => {
    if (err) callback(err);
    else callback(null, key.publicKey || key.rsaPublicKey);
  });
}

async function verifyToken(req, res, next) {
  const token = req.headers.authorization?.split('Bearer ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  jwt.verify(token, getKey, {
    issuer: `https://cognito-idp.ap-south-1.amazonaws.com/${process.env.COGNITO_USER_POOL_ID}`,
    audience: process.env.COGNITO_CLIENT_ID
  }, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    req.user = decoded;
    next();
  });
}

// Use in routes
app.post('/api/build/start', verifyToken, async (req, res) => {
  // req.user contains decoded JWT
  // req.user.sub = user ID
  // req.user.email = user email
});
```

### 2. Install Required Packages

```bash
npm install jsonwebtoken jwks-rsa
```

### 3. Environment Variables

Add to your backend `.env`:

```bash
COGNITO_USER_POOL_ID=ap-south-1_SrobAUGpi
COGNITO_CLIENT_ID=3nh0t8seo7onn2do52s10ql6vo
```

### 4. CORS Configuration

Ensure your backend allows requests from your frontend:

```javascript
const cors = require('cors');

app.use(cors({
  origin: ['http://localhost:5173', 'https://your-production-domain.com'],
  credentials: true
}));
```

## Environment Variables

Create `.env.local` file (already created):

```bash
VITE_COGNITO_USER_POOL_ID=ap-south-1_SrobAUGpi
VITE_COGNITO_CLIENT_ID=3nh0t8seo7onn2do52s10ql6vo
VITE_AWS_REGION=ap-south-1
VITE_S3_BUCKET=appdevbackend
VITE_API_URL=https://api.appdev.co.in
```

## Next Steps

1. ✅ Frontend integrated with Cognito & S3
2. ⏳ Add JWT verification middleware to backend routes
3. ⏳ Test authentication flow end-to-end
4. ⏳ Test file uploads to S3
5. ⏳ (Optional) Extend S3 Lambda trigger for workflows

## Testing

1. Navigate to `/auth-cognito`
2. Sign up with a new email
3. Check email for confirmation code
4. Confirm email and sign in
5. Navigate to protected routes (e.g., `/dashboard`)
6. Test file uploads using S3 storage utilities

## Migration Notes

- Original Supabase auth still available at `/auth`
- You can run both auth systems in parallel
- Update protected routes to use Cognito by default
- Update Header component to use cognitoAuth for user status
