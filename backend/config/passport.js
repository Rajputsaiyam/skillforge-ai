/**
 * Passport configuration — Google OAuth 2.0 strategy.
 *
 * This runs in STATELESS mode (session: false everywhere it's used), so it plugs
 * directly into the existing JWT-based auth system: after Google verifies the user,
 * we find-or-create a User document and hand it to the callback route, which then
 * issues our own JWT exactly like normal email/password login does.
 *
 * Requires GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET and GOOGLE_CALLBACK_URL in .env.
 */
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

const hasGoogleCredentials = Boolean(
  process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
);

if (hasGoogleCredentials) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback',
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value?.toLowerCase();
          if (!email) return done(new Error('Google account has no email'), null);

          // 1. Already signed up via Google before -> log them in
          let user = await User.findOne({ authProvider: 'google', providerId: profile.id });

          // 2. Account exists with this email (e.g. registered via email/password) -> link it
          if (!user) {
            user = await User.findOne({ email });
            if (user) {
              user.authProvider = user.authProvider === 'local' ? 'local' : 'google';
              user.providerId = user.providerId || profile.id;
              user.avatarUrl = user.avatarUrl || profile.photos?.[0]?.value || '';
              await user.save();
            }
          }

          // 3. Brand new user -> create account (this is the "Sign up with Google" case)
          if (!user) {
            user = await User.create({
              fullName: profile.displayName || 'Google User',
              email,
              authProvider: 'google',
              providerId: profile.id,
              avatarUrl: profile.photos?.[0]?.value || '',
              // no password field -> matchPassword() safely returns false for this account
            });
          }

          return done(null, user);
        } catch (err) {
          return done(err, null);
        }
      }
    )
  );
} else {
  console.warn(
    '[Google OAuth] GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET not set — /api/auth/google will return a clear error until configured.'
  );
}

module.exports = { passport, hasGoogleCredentials };
