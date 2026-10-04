import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import authService from '../../services/authService';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';

// Google (and later LinkedIn) redirect the browser here with ?token=<jwt> after
// backend/controllers/authController.js -> googleCallback issues the token.
// This page just stores the token, fetches the user, and hands off to the app —
// no manual redirect wiring needed anywhere else.
const OAuthSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const { showToast } = useApp();
  const [error, setError] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setError('No authentication token received.');
      return;
    }
    localStorage.setItem('sg_token', token);
    authService
      .getMe()
      .then(({ user }) => {
        localStorage.setItem('sg_user', JSON.stringify(user));
        setUser(user);
        showToast(`Welcome, ${user.fullName}!`);
        navigate(user.role === 'admin' ? '/admin/dashboard' : '/dashboard', { replace: true });
      })
      .catch(() => {
        localStorage.removeItem('sg_token');
        setError('Could not verify your Google account. Please try again.');
      });
  }, [searchParams]); // eslint-disable-line

  return (
    <div className="min-h-screen bg-hero-gradient flex items-center justify-center px-4">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card text-center max-w-sm">
        {error ? (
          <>
            <p className="text-danger font-semibold mb-3">{error}</p>
            <button onClick={() => navigate('/login')} className="btn-primary mx-auto">Back to Sign In</button>
          </>
        ) : (
          <>
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-navy font-medium">Signing you in with Google...</p>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default OAuthSuccess;
