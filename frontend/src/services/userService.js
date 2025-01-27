import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to add token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Optionally redirect to login
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Use the axiosInstance for all requests
export const getUserProfile = async (userId) => {
  const response = await axiosInstance.get(`/users/profile/${userId}`);
  return response.data;
};

export const getUserComments = async (userId) => {
  const response = await axiosInstance.get(`/users/${userId}/comments`);
  return response.data;
};

export const updateProfilePicture = async (userId, imageData) => {
  try {
    const response = await axiosInstance.patch(
      `/users/${userId}/profile-picture`,
      { profileImage: imageData }
    );
    return response.data;
  } catch (error) {
    console.error('Update profile picture error:', error.response?.data || error.message);
    throw error;
  }
};

export const updateUserProfile = async (userId, profileData) => {
  try {
    const response = await axiosInstance.patch(
      `/users/${userId}/profile`,
      profileData
    );
    return response.data;
  } catch (error) {
    console.error('Update profile error:', error.response?.data || error.message);
    throw error;
  }
};
