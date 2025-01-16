const API_URL = 'http://localhost:5000/api/auth';

// Helper function to get auth header
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

export const login = async (email, password) => {
  try {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    
    const data = await response.json();
    if (!response.ok) throw new Error(data.message);
    
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

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
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

export const isAuthenticated = () => {
  try {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    if (!token || !userStr) return false;
    
    const user = JSON.parse(userStr);
    return !!token && user.onboarded;
  } catch (error) {
    return false;
  }
};

export const requiresOnboarding = () => {
  try {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    if (!token || !userStr) return false;
    
    const user = JSON.parse(userStr);
    return !!token && !user.onboarded;
  } catch (error) {
    return false;
  }
};
