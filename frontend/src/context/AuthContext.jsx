import React, { createContext, useContext, useEffect, useState } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('sg_user');
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('sg_token');
    if (!token) {
      setLoading(false);
      return;
    }
    authService
      .getMe()
      .then(({ user }) => {
        setUser(user);
        localStorage.setItem('sg_user', JSON.stringify(user));
      })
      .catch(() => {
        localStorage.removeItem('sg_token');
        localStorage.removeItem('sg_user');
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (payload) => {
    const { user, token } = await authService.login(payload);
    localStorage.setItem('sg_token', token);
    localStorage.setItem('sg_user', JSON.stringify(user));
    setUser(user);
    return user;
  };

  const register = async (payload) => {
    const { user, token } = await authService.register(payload);
    localStorage.setItem('sg_token', token);
    localStorage.setItem('sg_user', JSON.stringify(user));
    setUser(user);
    return user;
  };

  const logout = () => {
    localStorage.removeItem('sg_token');
    localStorage.removeItem('sg_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, register, logout, loading, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
