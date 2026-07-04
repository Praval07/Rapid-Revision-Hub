const jwt = require('jsonwebtoken');
const User = require('../models/User');
const memoryDb = require('../utils/memoryDb');

const protect = async (req, res, next) => {
  if (!process.env.JWT_SECRET) {
    return res.status(500).json({ success: false, message: 'Server configuration error.' });
  }

  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!memoryDb.isDbConnected()) {
      const user = memoryDb.mockUsers.find(u => u._id === decoded.id);
      if (!user) {
        return res.status(401).json({ success: false, message: 'User not found.' });
      }
      req.user = user;
      return next();
    }

    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      return res.status(401).json({ success: false, message: 'User not found.' });
    }

    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Token is invalid or expired.' });
  }
};

const optionalProtect = async (req, res, next) => {
  if (!process.env.JWT_SECRET) {
    return res.status(500).json({ success: false, message: 'Server configuration error.' });
  }

  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    req.user = null; // Proceed as guest
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!memoryDb.isDbConnected()) {
      const user = memoryDb.mockUsers.find(u => u._id === decoded.id);
      req.user = user || null;
      return next();
    }

    req.user = await User.findById(decoded.id).select('-password');
    next();
  } catch (error) {
    req.user = null; // Fallback as guest on invalid/expired token
    next();
  }
};

const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ success: false, message: 'Access denied. Admin role required.' });
  }
};

module.exports = { protect, optionalProtect, admin };
