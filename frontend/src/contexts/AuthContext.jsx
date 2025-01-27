import React, { createContext, useContext, useState, useEffect } from 'react';
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
        // Parse the stored user data
        const userData = JSON.parse(storedUser);
        setUser(userData); // Set the complete user object
        setIsAdmin(response.data.isAdmin || false);
        setIsAuthenticated(true);
      } else {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('expiresAt');
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Token verification failed:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('expiresAt');
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    verifyToken();
  }, []);

  useEffect(() => {
    console.log("AuthContext: Current user state:", user);
  }, [user]);

  const adminLogin = () => {
    console.log('Setting admin status...');
    setIsAdmin(true);
  };

  const adminLogout = () => {
    setIsAdmin(false);
    localStorage.removeItem('adminToken');
    navigate('/admin/login');
  };

  const login = (userData, token) => {
    // Ensure userData has all required fields
    if (!userData || !userData.id) {
      console.error('Invalid user data provided to login');
      return;
    }
    
    const expiresAt = Date.now() + (24 * 60 * 60 * 1000); // 24 hours from now
    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('expiresAt', expiresAt.toString());
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
