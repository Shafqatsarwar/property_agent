// middleware/auth.js
const jwt = require('jsonwebtoken');

// Authenticate agent using JWT token
const authenticateAgent = async (req, res, next) => {
  try {
    // Check for token in header
    const authHeader = req.header('Authorization');
    const token = authHeader && authHeader.startsWith('Bearer ')
      ? authHeader.substring(7)
      : null;

    if (!token) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.agentId = decoded.id;

    next();
  } catch (error) {
    res.status(401).json({ error: 'Token is not valid.' });
  }
};

// Optional authentication - doesn't block the request if no token is provided
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    const token = authHeader && authHeader.startsWith('Bearer ')
      ? authHeader.substring(7)
      : null;

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.agentId = decoded.id;
    }

    next();
  } catch (error) {
    // If token is invalid, continue without authentication
    next();
  }
};

module.exports = {
  authenticateAgent,
  optionalAuth
};