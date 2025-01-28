import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  const verifyToken = async () => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (!token || !storedUser) {
      setLoading(false);
      return;
    }

    try {
      const response = await api.get('/auth/verify-token');
      if (response.data.success) {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        setIsAdmin(response.data.isAdmin || false);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Token verification failed:', error);
      // Don't clear user data on verification failure
      // This prevents logout on network issues
    } finally {
      setLoading(false);
    }
  };

  const refreshSession = async () => {
    try {
      const response = await api.post('/auth/refresh-token');
      if (response.data.success) {
        const { token, expiresIn } = response.data;
        const expiresAt = Date.now() + expiresIn;
        localStorage.setItem('token', token);
        localStorage.setItem('expiresAt', expiresAt.toString());
      }
    } catch (error) {
      console.error('Failed to refresh session:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('expiresAt');
    setUser(null);
    setIsAuthenticated(false);
    setIsAdmin(false);
  };

  useEffect(() => {
    verifyToken();
  }, []);

  useEffect(() => {
    console.log("AuthContext: Current user state:", user);
  }, [user]);

  const checkTokenExpiration = () => {
    const token = localStorage.getItem('adminToken');
    if (!token) return;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiryTime = payload.exp * 1000; // Convert to milliseconds
      const currentTime = Date.now();

      if (currentTime >= expiryTime) {
        // Token has expired
        adminLogout();
        navigate('/admin/login');
      } else {
        // Set timeout to logout when token expires
        const timeUntilExpiry = expiryTime - currentTime;
        setTimeout(() => {
          adminLogout();
          navigate('/admin/login');
          alert('Your session has expired. Please login again.');
        }, timeUntilExpiry);
      }
    } catch (error) {
      console.error('Error checking token expiration:', error);
    }
  };

  useEffect(() => {
    checkTokenExpiration();
  }, []);

  useEffect(() => {
    const adminToken = localStorage.getItem('adminToken');
    if (adminToken) {
      setIsAdmin(true);
    }
  }, []);

  const adminLogin = useCallback(async (token) => {
    localStorage.setItem('adminToken', token);
    setIsAdmin(true);
    checkTokenExpiration(); // Set up expiration timer after login
  }, [navigate]);

  const adminLogout = () => {
    setIsAdmin(false);
    localStorage.removeItem('adminToken');
    navigate('/admin/login');
  };

  const login = (userData, token) => {
    if (!userData || !userData.id) {
      console.error('Invalid user data provided to login');
      return;
    }
    
    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    setIsAdmin(false);
    setIsAuthenticated(false);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('expiresAt');
    navigate('/login');
  };

  const value = {
    user,
    isAdmin,
    isAuthenticated,
    loading,
    login,
    logout,
    adminLogin,
    adminLogout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
