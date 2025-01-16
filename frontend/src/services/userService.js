import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const getUserProfile = async (userId) => {
  const response = await axios.get(`${API_URL}/users/profile/${userId}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  });
  return response.data;
};

export const getUserComments = async (userId) => {
  const response = await axios.get(`${API_URL}/users/${userId}/comments`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  });
  return response.data;
};

export const updateProfilePicture = async (userId, imageData) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await axios.patch(
      `${API_URL}/users/${userId}/profile-picture`,
      { profileImage: imageData },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Update profile picture error:', error.response?.data || error.message);
    throw error;
  }
};

export const updateUserProfile = async (userId, profileData) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await axios.patch(
      `${API_URL}/users/${userId}/profile`,
      profileData,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Update profile error:', error.response?.data || error.message);
    throw error;
  }
};
