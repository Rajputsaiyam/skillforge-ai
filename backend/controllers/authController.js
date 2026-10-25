const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const logActivity = require('../utils/activityLogger');

const sanitizeUser = (user) => ({
  _id: user._id,
  fullName: user.fullName,
  email: user.email,
  role: user.role,
  avatarUrl: user.avatarUrl,
  targetRole: user.targetRole,
  authProvider: user.authProvider,
});

// @desc Register with email/password
const registerUser = asyncHandler(async (req, res) => {
  const { fullName, email, password } = req.body;
  if (!fullName || !email || !password) {
    res.status(400);
    throw new Error('Please fill all required fields');
  }
  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    res.status(400);
    throw new Error('An account with this email already exists');
  }
  const user = await User.create({ fullName, email, password, authProvider: 'local' });
  await logActivity(user._id, 'account_created', `${user.fullName} created an account`);
  res.status(201).json({ user: sanitizeUser(user), token: generateToken(user._id, user.role) });
});

// @desc Login with email/password
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: email?.toLowerCase() }).select('+password');
  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error('Invalid email or password');
  }
  if (user.status === 'suspended') {
    res.status(403);
    throw new Error('Your account has been suspended. Contact support.');
  }
  await logActivity(user._id, 'login', `${user.fullName} logged in`);
  res.json({ user: sanitizeUser(user), token: generateToken(user._id, user.role) });
});

// @desc Get current logged-in user
const getMe = asyncHandler(async (req, res) => {
  res.json({ user: sanitizeUser(req.user) });
});

// @desc If Google credentials aren't configured yet, fail clearly instead of a confusing redirect
const googleNotConfigured = asyncHandler(async (req, res) => {
  res.status(501).json({
    message:
      'Google OAuth is not configured yet. Add GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET and GOOGLE_CALLBACK_URL to backend/.env and restart the server.',
  });
});

// @desc Called by Passport after Google verifies the user (req.user is already set + saved).
// Issues our own JWT (same as normal login) and redirects back to the frontend with it,
// since an OAuth redirect can't return JSON directly to a fetch/axios call.
const googleCallback = asyncHandler(async (req, res) => {
  const user = req.user;

  // 1. Prioritize clientBase attached directly by route middleware
  let clientBase = req.clientBase;

  // 2. Fallback to state parameter decode if needed
  if (!clientBase && req.query.state) {
    try {
      const normalized = String(req.query.state).trim().replace(/ /g, '+');
      const jsonStr = Buffer.from(normalized, 'base64').toString('utf8');
      const parsed = JSON.parse(jsonStr);
      if (parsed?.returnTo) {
        const u = new URL(parsed.returnTo);
        clientBase = `${u.protocol}//${u.host}`;
      }
    } catch (_) {}
  }

  // 3. Fallback to cookie
  if (!clientBase && req.headers.cookie) {
    const match = req.headers.cookie.match(/sf_oauth_origin=([^;]+)/);
    if (match) {
      try {
        const u = new URL(decodeURIComponent(match[1]));
        clientBase = `${u.protocol}//${u.host}`;
      } catch (_) {}
    }
  }

  // 4. Fallback to CLIENT_URL
  if (!clientBase && process.env.CLIENT_URL) {
    try {
      const u = new URL(process.env.CLIENT_URL);
      clientBase = `${u.protocol}//${u.host}`;
    } catch (_) {}
  }

  if (!clientBase) {
    clientBase = 'http://localhost:5173';
  }

  // Clear fallback cookie
  res.setHeader(
    'Set-Cookie',
    'sf_oauth_origin=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly'
  );

  if (user.status === 'suspended') {
    return res.redirect(`${clientBase}/login?error=account_suspended`);
  }
  const token = generateToken(user._id, user.role);
  const isNewAccount = Date.now() - new Date(user.createdAt).getTime() < 5000;
  await logActivity(user._id, isNewAccount ? 'account_created' : 'login', `${user.fullName} ${isNewAccount ? 'signed up' : 'logged in'} with Google`);
  res.redirect(`${clientBase}/oauth-success?token=${token}`);
});

// @desc LinkedIn OAuth placeholder — wire real OAuth (passport-linkedin-oauth2) here later
const linkedinAuthPlaceholder = asyncHandler(async (req, res) => {
  res.status(501).json({
    message:
      'LinkedIn OAuth is not connected yet. Configure LINKEDIN_CLIENT_ID / LINKEDIN_CLIENT_SECRET and implement the passport-linkedin-oauth2 strategy in authController.linkedinAuthPlaceholder.',
  });
});

module.exports = { registerUser, loginUser, getMe, googleNotConfigured, googleCallback, linkedinAuthPlaceholder };
