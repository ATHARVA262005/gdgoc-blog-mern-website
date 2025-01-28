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
  try {
    const response = await axiosInstance.get(`/users/${userId}/comments`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user comments:', error);
    throw error;
  }
};

export const updateProfilePicture = async (userId, imageData) => {
  try {
    // Get current user from localStorage to verify ownership
    const currentUser = JSON.parse(localStorage.getItem('user'));
    if (!currentUser || currentUser.id !== userId) {
      throw new Error('Not authorized to update this profile');
    }

    const token = localStorage.getItem('token');
    const response = await axiosInstance.patch(
      `/users/${userId}/profile-picture`,
      { profileImage: imageData },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    // Update local storage with new profile image
    if (response.data.success) {
      localStorage.setItem('user', JSON.stringify({
        ...currentUser,
        profileImage: response.data.profileImage
      }));
    }

    return response.data;
  } catch (error) {
    console.error('Update profile picture error:', error.response?.data?.message || error.message);
    throw error;
  }
};

export const updateUserProfile = async (userId, profileData) => {
  try {
    // Get current user from localStorage to verify ownership
    const currentUser = JSON.parse(localStorage.getItem('user'));
    if (!currentUser || currentUser.id !== userId) {
      throw new Error('Not authorized to update this profile');
    }

    const response = await axiosInstance.patch(
      `/users/${userId}/profile`,
      profileData,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      }
    );

    // Update user data in localStorage
    if (response.data.success) {
      localStorage.setItem('user', JSON.stringify({
        ...currentUser,
        ...response.data.user
      }));
    }

    return response.data;
  } catch (error) {
    console.error('Update profile error:', error.response?.data?.message || error.message);
    throw error;
  }
};
