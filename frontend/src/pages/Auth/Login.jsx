import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from './AuthLayout';
import OAuthButtons from './OAuthButtons';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import Button from '../../components/ui/Button';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { showToast } = useApp();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(form);
      showToast('Welcome back!');
      navigate(user.role === 'admin' ? '/admin/dashboard' : '/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to continue your career journey">
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="email" required placeholder="Email" className="input-field" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <input type="password" required placeholder="Password" className="input-field" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        <div className="text-right">
          <Link to="/forgot-password" className="text-xs text-primary font-medium hover:underline">Forgot Password?</Link>
        </div>
        {error && <p className="text-danger text-sm">{error}</p>}
        <Button type="submit" className="w-full" disabled={loading}>{loading ? 'Signing in...' : 'Sign In'}</Button>
      </form>
      <div className="flex items-center gap-3 my-5">
        <div className="h-px bg-slate/15 flex-1" /><span className="text-xs text-slate">OR</span><div className="h-px bg-slate/15 flex-1" />
      </div>
      <OAuthButtons />
      <p className="text-center text-sm text-slate mt-6">
        Don't have an account? <Link to="/register" className="text-primary font-semibold hover:underline">Create Account</Link>
      </p>
      <p className="text-center text-xs text-slate/60 mt-3">Demo: demo@skillgraph.ai / Demo@12345</p>
    </AuthLayout>
  );
};

export default Login;
