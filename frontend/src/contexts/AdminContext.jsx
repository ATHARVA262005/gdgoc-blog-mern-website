import React, { createContext, useContext, useState } from 'react';
import axios from 'axios';

const AdminContext = createContext();

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};

export const AdminProvider = ({ children }) => {
  const [admin, setAdmin] = useState(JSON.parse(localStorage.getItem('admin')));
  const [adminToken, setAdminToken] = useState(localStorage.getItem('adminToken'));

  // Create new axios instance when token changes
  const adminAxios = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: {
      'Authorization': `Bearer ${adminToken}`
    }
  });

  const handleLogin = async (token) => {
    try {
      // First set the token
      localStorage.setItem('adminToken', token);
      setAdminToken(token);

      // Create a new axios instance with the new token
      const tempAxios = axios.create({
        baseURL: import.meta.env.VITE_API_URL,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      // Fetch admin profile with the temporary axios instance
      const response = await tempAxios.get('/admin/profile');
      const adminData = response.data;
      
      localStorage.setItem('admin', JSON.stringify(adminData));
      setAdmin(adminData);
      
      return { success: true };
    } catch (error) {
      // If there's an error, clean up
      localStorage.removeItem('adminToken');
      setAdminToken(null);
      throw error.response?.data || error.message;
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin');
    localStorage.removeItem('adminToken');
    setAdmin(null);
    setAdminToken(null);
  };

  const value = {
    admin,
    adminToken,
    adminAxios,
    handleLogin,
    handleLogout
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
};
