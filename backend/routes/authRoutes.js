const express = require('express');
const router = express.Router();
const {
  registerUser, loginUser, getMe, googleNotConfigured, googleCallback, linkedinAuthPlaceholder,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { passport, hasGoogleCredentials } = require('../config/passport');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);

// --- Google OAuth (stateless — no server session, JWT issued in googleCallback) ---
if (hasGoogleCredentials) {
  router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], session: false }));
  router.get(
    '/google/callback',
    passport.authenticate('google', { session: false, failureRedirect: `${process.env.CLIENT_URL}/login?error=google_auth_failed` }),
    googleCallback
  );
} else {
  router.get('/google', googleNotConfigured);
  router.get('/google/callback', googleNotConfigured);
}

router.get('/linkedin', linkedinAuthPlaceholder);

module.exports = router;
