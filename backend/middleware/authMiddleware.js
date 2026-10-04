const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');

const protect = asyncHandler(async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
      if (!req.user) {
        res.status(401);
        throw new Error('Not authorized, user not found');
      }
      if (req.user.status === 'suspended') {
        res.status(403);
        throw new Error('Account suspended. Contact support.');
      }
      req.user.lastActiveAt = new Date();
      await req.user.save();
      return next();
    } catch (err) {
      res.status(401);
      throw new Error('Not authorized, token invalid');
    }
  }
  res.status(401);
  throw new Error('Not authorized, no token');
});

const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') return next();
  res.status(403);
  throw new Error('Admin access required');
};

module.exports = { protect, adminOnly };
