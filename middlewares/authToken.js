const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config/secret");

exports.authToken = (req, res, next) => {
  console.log('Auth Token Middleware - Request received');
  console.log('Auth Token Middleware - Headers:', {
    ...req.headers,
    authorization: req.headers.authorization ? 'Bearer [REDACTED]' : undefined
  });
  console.log('Auth Token Middleware - JWT_SECRET exists:', !!JWT_SECRET);
  
  const authHeader = req.header("Authorization");
  if (!authHeader) {
    console.log('Auth Token Middleware - No Authorization header found');
    return res.status(401).json({ message: "Missing token. Access denied." });
  }

  const token = authHeader.replace("Bearer ", "");
  if (!token) {
    console.log('Auth Token Middleware - Invalid token format');
    return res.status(401).json({ message: "Invalid token format." });
  }

  try {
    console.log('Auth Token Middleware - Attempting to verify token');
    console.log('Auth Token Middleware - Token:', token.substring(0, 10) + '...');
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('Auth Token Middleware - Token verified successfully');
    console.log('Auth Token Middleware - Decoded token:', decoded);
    req.tokenData = decoded;
    next();
  } catch (err) {
    console.error('Auth Token Middleware - Token verification error:', {
      name: err.name,
      message: err.message,
      stack: err.stack
    });
    return res.status(401).json({ message: "Invalid or expired token." });
  }
};
