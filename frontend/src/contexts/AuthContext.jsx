import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { jwtDecode } from 'jwt-decode';
import api from '../lib/api';

export const AuthContext = createContext();

export function AuthProvider({ children, queryClient }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Set auth token in axios headers and load full user profile
  useEffect(() => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      let cancelled = false;
      (async () => {
        try {
          jwtDecode(token);
          const { data } = await api.get('/auth/me');
          if (!cancelled && data?.user) {
            const u = data.user;
            setUser({ ...u, id: u.id || u._id });
          }
        } catch (error) {
          if (!cancelled) {
            console.error('Auth check failed:', error);
            localStorage.removeItem('token');
            setToken(null);
            setUser(null);
          }
        } finally {
          if (!cancelled) setIsLoading(false);
        }
      })();
      return () => { cancelled = true; };
    } else {
      delete api.defaults.headers.common['Authorization'];
      setUser(null);
      setIsLoading(false);
    }
  }, [token]);

  const login = useCallback(async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token: authToken, user: userData } = response.data;
      
      localStorage.setItem('token', authToken);
      setToken(authToken);
      setUser(userData);
      
      toast.success('Logged in successfully!');
      return userData;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Login failed. Please try again.';
      toast.error(errorMessage);
      throw error;
    }
  }, []);

  const register = useCallback(async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      toast.success('Registration successful! Please log in.');
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Registration failed. Please try again.';
      toast.error(errorMessage);
      throw error;
    }
  }, []);

  const forgotPassword = useCallback(async (email) => {
    try {
      const response = await api.post('/auth/forgot-password', { email });
      const message = response.data?.message || 'If that email exists, a reset link has been sent';
      toast.success(message);
      return response.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        (error.code === 'ERR_NETWORK' || !error.response
          ? 'Cannot reach the server. Start the backend (e.g. npm start in backend) and ensure CORS_ORIGIN matches this site.'
          : 'Failed to send reset email. Please try again.');
      toast.error(errorMessage);
    }
  }, []);

  const resetPassword = useCallback(async (token, password) => {
    try {
      const response = await api.post(`/auth/reset-password/${token}`, { password });
      toast.success(response.data?.message || 'Password reset successful');
      return response.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        (error.code === 'ERR_NETWORK' || !error.response
          ? 'Cannot reach the server. Start the backend and check CORS / API URL.'
          : 'Failed to reset password. Please try again.');
      toast.error(errorMessage);
      return null;
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    if (queryClient) {
      queryClient.clear();
    }
    toast('Logged out successfully', { icon: '👋' });
    navigate('/login');
  }, [navigate, queryClient]);

  const updateUser = useCallback((userData) => {
    setUser(prev => ({ ...prev, ...userData }));
  }, []);

  const value = {
    user,
    token,
    isAuthenticated: !!token,
    isLoading,
    login,
    register,
    forgotPassword,
    resetPassword,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
