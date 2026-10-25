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

// Helper to validate and clean a frontend origin URL (protocol + host only)
const cleanOrigin = (rawUrl) => {
  if (!rawUrl || typeof rawUrl !== 'string') return null;
  try {
    const parsed = new URL(rawUrl);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return null;
    return `${parsed.protocol}//${parsed.host}`;
  } catch (_) {
    return null;
  }
};

const decodeOAuthState = (rawState) => {
  if (!rawState || typeof rawState !== 'string') return null;
  try {
    const normalized = rawState.trim().replace(/ /g, '+');
    const jsonStr = Buffer.from(normalized, 'base64').toString('utf8');
    const parsed = JSON.parse(jsonStr);
    if (parsed && parsed.returnTo) return cleanOrigin(parsed.returnTo);
  } catch (_) {}

  try {
    const uriDecoded = decodeURIComponent(rawState);
    if (uriDecoded.startsWith('http://') || uriDecoded.startsWith('https://')) {
      return cleanOrigin(uriDecoded);
    }
    const parsed = JSON.parse(uriDecoded);
    if (parsed && parsed.returnTo) return cleanOrigin(parsed.returnTo);
  } catch (_) {}

  return null;
};

// --- Google OAuth (stateless — no server session, JWT issued in googleCallback) ---
if (hasGoogleCredentials) {
  router.get('/google', (req, res, next) => {
    // 1. Resolve frontend origin from query, referer, origin, or CLIENT_URL
    let returnTo =
      cleanOrigin(req.query.returnTo) ||
      cleanOrigin(req.headers.referer) ||
      cleanOrigin(req.headers.origin);

    if (!returnTo && process.env.CLIENT_URL) {
      returnTo = cleanOrigin(process.env.CLIENT_URL);
    }

    if (!returnTo) {
      returnTo = 'http://localhost:5173';
    }

    // 2. Encode returnTo into URL-safe base64 state parameter
    const state = Buffer.from(JSON.stringify({ returnTo })).toString('base64url');

    // 3. Set a short-lived fallback cookie (10 min) for same-site cross-redirect resilience
    const isHttps = req.secure || req.headers['x-forwarded-proto'] === 'https';
    res.setHeader(
      'Set-Cookie',
      `sf_oauth_origin=${encodeURIComponent(returnTo)}; Path=/; Max-Age=600; SameSite=Lax; ${isHttps ? 'Secure; ' : ''}HttpOnly`
    );

    passport.authenticate('google', {
      scope: ['profile', 'email'],
      session: false,
      state,
    })(req, res, next);
  });

  router.get(
    '/google/callback',
    (req, res, next) => {
      // 1. Try decoding client origin from OAuth state
      let clientBase = decodeOAuthState(req.query.state);

      // 2. Try reading fallback cookie
      if (!clientBase && req.headers.cookie) {
        const match = req.headers.cookie.match(/sf_oauth_origin=([^;]+)/);
        if (match) {
          clientBase = cleanOrigin(decodeURIComponent(match[1]));
        }
      }

      // 3. Try CLIENT_URL env var
      if (!clientBase && process.env.CLIENT_URL) {
        clientBase = cleanOrigin(process.env.CLIENT_URL);
      }

      // 4. Default fallback
      if (!clientBase) {
        clientBase = 'http://localhost:5173';
      }

      // Attach clientBase to req so googleCallback controller receives it directly
      req.clientBase = clientBase;

      passport.authenticate('google', {
        session: false,
        failureRedirect: `${clientBase}/login?error=google_auth_failed`,
      })(req, res, next);
    },
    googleCallback
  );
} else {
  router.get('/google', googleNotConfigured);
  router.get('/google/callback', googleNotConfigured);
}

router.get('/linkedin', linkedinAuthPlaceholder);

module.exports = router;
