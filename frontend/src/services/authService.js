import axios from 'axios';

const API_URL = 'http://localhost:5000/api/auth';

// Enhanced session management with 24h expiration
const setSession = (token, user) => {
  if (token && user) {
    // Set token expiration to 24 hours from now
    const expiresAt = Date.now() + (24 * 60 * 60 * 1000); // 24 hours in milliseconds
    
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('expiresAt', expiresAt.toString());
    
    axios.defaults.headers.common.Authorization = `Bearer ${token}`;
    
    // Set auto logout after 24 hours
    setTimeout(() => {
      logout();
      window.location.reload();
    }, 24 * 60 * 60 * 1000);
  } else {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('expiresAt');
    delete axios.defaults.headers.common.Authorization;
  }
};

const getSession = () => {
  try {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));
    return { token, user };
  } catch (error) {
    return { token: null, user: null };
  }
};

// Modified login function
export const login = async (email, password) => {
  try {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    
    const data = await response.json();
    if (!response.ok) throw new Error(data.message);
    
    // Store session data with token and complete user object
    if (data.token && data.user) {
      setSession(data.token, data.user);
    }
    
    return data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const register = async (name, email, password) => {
  const response = await fetch(`${API_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  });
  
  const data = await response.json();
  if (!response.ok) throw new Error(data.message);
  
  return data;
};

export const forgotPassword = async (email) => {
  const response = await fetch(`${API_URL}/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  
  const data = await response.json();
  if (!response.ok) throw new Error(data.message);
  return data;
};

// Update resetPassword to use email instead of token
export const resetPassword = async (email, otp, newPassword) => {
  const response = await fetch(`${API_URL}/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, otp, newPassword }),
  });
  
  const data = await response.json();
  if (!response.ok) throw new Error(data.message);
  return data;
};

export const verifyEmail = async (token) => {
  const response = await fetch(`${API_URL}/verify-email/${token}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  
  const data = await response.json();
  if (!response.ok) throw new Error(data.message);
  
  return data;
};

export const resendVerification = async (email) => {
  const response = await fetch(`${API_URL}/resend-verification`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  
  const data = await response.json();
  if (!response.ok) throw new Error(data.message);
  return data;
};

export const verifyOTP = async (email, otp) => {
  const response = await fetch(`${API_URL}/verify-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, otp }),
  });
  
  const data = await response.json();
  if (!response.ok) throw new Error(data.message);
  return data;
};

export const resendOTP = async (email) => {
  const response = await fetch(`${API_URL}/resend-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  
  const data = await response.json();
  if (!response.ok) throw new Error(data.message);
  return data;
};

// Modified logout function
export const logout = () => {
  setSession(null, null);
};

// Modified isAuthenticated function to check token expiration
export const isAuthenticated = () => {
  try {
    const token = localStorage.getItem('token');
    const expiresAt = localStorage.getItem('expiresAt');
    
    if (!token || !expiresAt) return false;
    
    // Check if token has expired
    if (Date.now() >= parseInt(expiresAt)) {
      setSession(null, null);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Auth check error:', error);
    setSession(null, null);
    return false;
  }
};

// Modified getCurrentUser function
export const getCurrentUser = () => {
  const { user } = getSession();
  return user;
};

// Initialize auth state on app load
export const initializeAuth = () => {
  const { token } = getSession();
  if (token) {
    // Set default auth header
    axios.defaults.headers.common.Authorization = `Bearer ${token}`;
  }
};

// Update requiresOnboarding to use getCurrentUser
export const requiresOnboarding = () => {
  const user = getCurrentUser();
  return user && !user.onboarded;
};

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No authentication token found');
  }
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

export const completeOnboarding = async (userData) => {
  try {
    const response = await fetch(`${API_URL}/complete-onboarding`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify({
        ...userData,
        userId: getCurrentUser().id // Add userId from current user
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to complete onboarding');
    }
    
    // Update local storage with new user data
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    localStorage.setItem('user', JSON.stringify({ ...currentUser, ...data.user, onboarded: true }));
    
    return data.user;
  } catch (error) {
    console.error('Onboarding error:', error);
    throw error;
  }
};
