import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Load user data from localStorage on initial mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Failed to parse stored user:', error);
      }
    }
    setLoading(false);
  }, []);

  // Add this useEffect to check token expiration
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      
      if (!token || !storedUser) {
        setUser(null);
        return;
      }

      try {
        // Parse the JWT to check expiration
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.exp * 1000 < Date.now()) {
          // Token has expired
          logout();
          return;
        }

        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Auth state error:', error);
        logout();
      }
    };

    checkAuth();
    setLoading(false);
  }, []);

  const login = (userData, token) => {
    setUser(userData);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (loading) {
    return <div>Loading...</div>; // Or your loading component
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
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
