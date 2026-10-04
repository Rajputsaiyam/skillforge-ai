import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import AuthLayout from './AuthLayout';
import Button from '../../components/ui/Button';

const ForgotPassword = () => {
  const [sent, setSent] = useState(false);
  return (
    <AuthLayout title="Reset your password" subtitle="We'll send you a reset link">
      {sent ? (
        <p className="text-center text-sm text-slate">If an account exists for that email, a reset link has been sent.</p>
      ) : (
        <form onSubmit={(e) => { e.preventDefault(); setSent(true); }} className="space-y-4">
          <input type="email" required placeholder="Email" className="input-field" />
          <Button type="submit" className="w-full">Send Reset Link</Button>
        </form>
      )}
      <p className="text-center text-sm text-slate mt-6">
        <Link to="/login" className="text-primary font-semibold hover:underline">Back to Sign In</Link>
      </p>
    </AuthLayout>
  );
};

export default ForgotPassword;
