import React from 'react';
import authService from '../../services/authService';

const OAuthButtons = () => (
  <div className="space-y-3">
    <button onClick={authService.loginWithGoogle} className="btn-secondary w-full">
      <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#4285F4" d="M45.1 24.5c0-1.6-.1-3.1-.4-4.6H24v9.1h11.9c-.5 2.8-2.1 5.2-4.4 6.8v5.6h7.1c4.2-3.8 6.5-9.5 6.5-16.9z"/><path fill="#34A853" d="M24 46c6 0 11-2 14.6-5.4l-7.1-5.6c-2 1.3-4.5 2.1-7.5 2.1-5.8 0-10.7-3.9-12.4-9.1H4.3v5.7C7.9 41 15.3 46 24 46z"/><path fill="#FBBC05" d="M11.6 27.9c-.4-1.3-.7-2.7-.7-4.1s.3-2.8.7-4.1v-5.7H4.3C2.8 16.9 2 20.3 2 24s.8 7.1 2.3 10.1z"/><path fill="#EA4335" d="M24 10.9c3.3 0 6.2 1.1 8.5 3.3l6.3-6.3C34.9 4.3 30 2 24 2 15.3 2 7.9 7 4.3 13.9l7.3 5.7c1.7-5.2 6.6-9.1 12.4-9.1z"/></svg>
      Continue with Google
    </button>
    <button onClick={authService.loginWithLinkedIn} className="btn-secondary w-full">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="#0A66C2"><path d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.36V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.38-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.11 20.45H3.56V9h3.55v11.45z"/></svg>
      Continue with LinkedIn
    </button>
  </div>
);

export default OAuthButtons;
