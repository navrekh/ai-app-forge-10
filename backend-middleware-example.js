/**
 * AWS Cognito JWT Verification Middleware
 * 
 * This middleware verifies JWT tokens from AWS Cognito
 * Add this to your Express backend at https://api.appdev.co.in
 */

const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');

// Configure JWKS client to fetch public keys from Cognito
const client = jwksClient({
  cache: true,
  rateLimit: true,
  jwksRequestsPerMinute: 10,
  jwksUri: `https://cognito-idp.ap-south-1.amazonaws.com/${process.env.COGNITO_USER_POOL_ID}/.well-known/jwks.json`
});

// Function to get signing key from JWKS
function getKey(header, callback) {
  client.getSigningKey(header.kid, (err, key) => {
    if (err) {
      callback(err);
    } else {
      const signingKey = key.publicKey || key.rsaPublicKey;
      callback(null, signingKey);
    }
  });
}

// Middleware to verify Cognito JWT token
function verifyCognitoToken(req, res, next) {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: 'Unauthorized',
        message: 'No token provided' 
      });
    }

    const token = authHeader.split('Bearer ')[1];

    // Verify the token
    jwt.verify(
      token, 
      getKey, 
      {
        issuer: `https://cognito-idp.ap-south-1.amazonaws.com/${process.env.COGNITO_USER_POOL_ID}`,
        audience: process.env.COGNITO_CLIENT_ID,
        algorithms: ['RS256']
      }, 
      (err, decoded) => {
        if (err) {
          console.error('JWT verification error:', err);
          return res.status(401).json({ 
            error: 'Unauthorized',
            message: 'Invalid or expired token' 
          });
        }

        // Attach user info to request
        req.user = {
          userId: decoded.sub,
          email: decoded.email,
          username: decoded['cognito:username'],
          groups: decoded['cognito:groups'] || [],
          tokenUse: decoded.token_use,
        };

        next();
      }
    );
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(500).json({ 
      error: 'Internal Server Error',
      message: 'Failed to verify token' 
    });
  }
}

// Optional: Middleware for checking if user is in a specific group
function requireGroup(groupName) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!req.user.groups.includes(groupName)) {
      return res.status(403).json({ 
        error: 'Forbidden',
        message: `Requires ${groupName} group membership` 
      });
    }

    next();
  };
}

// Usage Examples:

// Protect all routes
// app.use('/api', verifyCognitoToken);

// Protect specific routes
// app.post('/api/build/start', verifyCognitoToken, async (req, res) => {
//   console.log('User ID:', req.user.userId);
//   console.log('Email:', req.user.email);
//   // Your route logic here
// });

// Protect routes with group requirement
// app.post('/api/admin/users', verifyCognitoToken, requireGroup('Admins'), async (req, res) => {
//   // Only users in 'Admins' group can access
// });

module.exports = {
  verifyCognitoToken,
  requireGroup
};
