import axios from 'axios';

const API_URL = 'http://localhost:5000/api/auth';

// Enhanced session management
const setSession = (token, user) => {
  if (token && user) {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    axios.defaults.headers.common.Authorization = `Bearer ${token}`;
    
    // Set auto logout after token expiry
    const tokenData = JSON.parse(atob(token.split('.')[1]));
    const expiresIn = (tokenData.exp * 1000) - Date.now();
    setTimeout(() => {
      logout();
      window.location.reload();
    }, expiresIn);
  } else {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
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

// Modified isAuthenticated function
export const isAuthenticated = () => {
  try {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    if (!token || !userStr) return false;
    
    const tokenData = JSON.parse(atob(token.split('.')[1]));
    if (tokenData.exp * 1000 < Date.now()) {
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

export const completeOnboarding = async (userData) => {
  try {
    const response = await fetch(`${API_URL}/complete-onboarding`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify(userData),
    });
    
    const data = await response.json();
    if (!response.ok) throw new Error(data.message);
    
    return data;
  } catch (error) {
    console.error('Onboarding error:', error);
    throw error;
  }
};
