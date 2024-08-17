import jwt from 'jsonwebtoken';
import UserModel from '../src/models/user.js';

export const auth = async (req, res, next) => {
  let token = req.cookies.token;

  // Check for token in the Authorization header if it's not in cookies
  if (!token && req.headers.authorization) {
    if (req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1]; // Extract Bearer token
    } else {
      token = req.headers.authorization; // Fallback to use the entire authorization header
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'No token provided. Please sign in.' });
  }

  try {
    // Verify the token
    const decodedData = jwt.verify(token, process.env.JWT_SECRET);
    
    // Fetch user data
    const userData = await UserModel.findById(decodedData.id).lean(); // Convert to plain JavaScript object

    if (!userData) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // Remove sensitive data
    delete userData.tampOtp;

    // Attach user data to the request
    req.user = userData;

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ success: false, message: 'Invalid token. Please sign in again.', error: error.message });
    } else if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token expired. Please sign in again.', error: error.message });
    }
    console.error('Token verification error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.', error: error.message });
  }
};

// Middleware to check user roles
export const authByUserRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'User not authenticated.' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: `Role: ${req.user.role} is not allowed to access this resource` });
    }
    next();
  };
};
