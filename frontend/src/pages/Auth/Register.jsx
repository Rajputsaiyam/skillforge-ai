import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from './AuthLayout';
import OAuthButtons from './OAuthButtons';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import Button from '../../components/ui/Button';

const Register = () => {
  const [form, setForm] = useState({ fullName: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const { showToast } = useApp();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await register(form);
      showToast('Account created successfully');
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Create your account" subtitle="Start mapping your career today">
      <form onSubmit={handleSubmit} className="space-y-4">
        <input required placeholder="Full Name" className="input-field" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
        <input type="email" required placeholder="Email" className="input-field" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <input type="password" required placeholder="Password" className="input-field" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        <input type="password" required placeholder="Confirm Password" className="input-field" value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} />
        {error && <p className="text-danger text-sm">{error}</p>}
        <Button type="submit" className="w-full" disabled={loading}>{loading ? 'Creating account...' : 'Create Account'}</Button>
      </form>
      <div className="flex items-center gap-3 my-5">
        <div className="h-px bg-slate/15 flex-1" /><span className="text-xs text-slate">OR</span><div className="h-px bg-slate/15 flex-1" />
      </div>
      <OAuthButtons />
      <p className="text-center text-sm text-slate mt-6">
        Already have an account? <Link to="/login" className="text-primary font-semibold hover:underline">Sign In</Link>
      </p>
    </AuthLayout>
  );
};

export default Register;
