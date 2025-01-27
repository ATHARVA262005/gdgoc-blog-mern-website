import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check for token in localStorage
    const token = localStorage.getItem('token');
    if (token) {
      // Verify token and fetch user data
      verifyToken(token);
    }
    setLoading(false);
  }, []);

  const verifyToken = async (token) => {
    try {
      // Make API call to verify token and get user data
      const response = await fetch('/api/verify-token', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        setIsAdmin(userData.isAdmin || false);
        setIsAuthenticated(true);
      } else {
        // If token is invalid, clear everything
        localStorage.removeItem('token');
        setUser(null);
        setIsAdmin(false);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Token verification failed:', error);
    }
  };

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
    setUser(userData);
    localStorage.setItem('token', token);
    setIsAuthenticated(true);
  };

  const logout = () => {
    setUser(null);
    setIsAdmin(false);
    setIsAuthenticated(false);
    localStorage.removeItem('token');
    localStorage.removeItem('adminToken');
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
