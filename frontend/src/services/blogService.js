import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance with proper configuration
const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true
});

// Add error handling interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNREFUSED') {
      console.error('Cannot connect to backend server. Please ensure it is running.');
    }
    return Promise.reject(error);
  }
);

// Add auth interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Modified function to get blogs for both authenticated and public users
export const getBlogs = async () => {
  try {
    const token = localStorage.getItem('token');
    const config = token ? {
      headers: { Authorization: `Bearer ${token}` },
      params: { populate: 'author' }  // Add population parameter
    } : {
      params: { populate: 'author' }  // Add population for public route too
    };
    
    const response = await axios.get(`${API_URL}/blogs`, config);
    return response.data;
  } catch (error) {
    console.error('Get blogs error:', error.response?.data || error.message);
    // If unauthorized, try fetching public blogs
    if (error.response?.status === 401) {
      try {
        const response = await axios.get(`${API_URL}/blogs/public`, {
          params: { populate: 'author' }  // Add population for public route
        });
        return response.data;
      } catch (publicError) {
        console.error('Public blogs fetch error:', publicError);
        return { blogs: [] };
      }
    }
    return { blogs: [] };
  }
};

// Modified function to get featured blogs
export const getFeaturedBlogs = async () => {
  try {
    const token = localStorage.getItem('token');
    const config = token ? {
      headers: { Authorization: `Bearer ${token}` }
    } : {};
    
    const response = await axios.get(`${API_URL}/blogs/featured`, config);
    return response.data;
  } catch (error) {
    console.error('Get featured blogs error:', error.response?.data || error.message);
    // If unauthorized, try fetching public featured blogs
    if (error.response?.status === 401) {
      try {
        const response = await axios.get(`${API_URL}/blogs/featured/public`);
        return response.data;
      } catch (publicError) {
        console.error('Public featured blogs fetch error:', publicError);
        return { featuredBlogs: [] };
      }
    }
    return { featuredBlogs: [] };
  }
};

export const toggleBookmark = async (blogId) => {
  try {
    const response = await axiosInstance.post(`/blogs/${blogId}/bookmark`);
    return response.data;
  } catch (error) {
    console.error('Toggle bookmark error:', error.response?.data || error.message);
    throw error;
  }
};

export const getBookmarkedBlogs = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await axios.get(`${API_URL}/blogs/bookmarks`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Get bookmarked blogs error:', error.response?.data || error.message);
    if (error.response?.status === 401) {
      return { blogs: [], requiresAuth: true };
    }
    throw error;
  }
};

export const getBookmarkStatus = async (blogId) => {
  try {
    const response = await axiosInstance.get(`/blogs/${blogId}/bookmark-status`);
    return response.data;
  } catch (error) {
    console.error('Get bookmark status error:', error.response?.data || error.message);
    throw error;
  }
};

export const getBookmarksStatus = async (blogIds) => {
  try {
    const response = await axiosInstance.post('/blogs/bookmarks-status', { blogIds });
    return response.data.bookmarkStatuses;
  } catch (error) {
    console.error('Error fetching bookmark statuses:', error);
    return {};
  }
};

export const toggleLike = async (blogId) => {
  try {
    const response = await axiosInstance.post(`/blogs/${blogId}/like`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getLikesStatus = async (blogIds) => {
  try {
    const response = await axiosInstance.post('/blogs/likes-status', { blogIds });
    return response.data.likeStatuses;
  } catch (error) {
    console.error('Error fetching like statuses:', error);
    return {};
  }
};

export const addComment = async (blogId, content) => {
  try {
    const response = await axiosInstance.post(`/blogs/${blogId}/comments`, { content });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Add these new functions for user profile
export const getUserProfile = async (userId) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await axios.get(`${API_URL}/users/profile/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Get user profile error:', error.response?.data || error.message);
    throw error;
  }
};

export const updateUserProfile = async (userId, profileData) => {
  try {
    const response = await axiosInstance.patch(`/users/${userId}/profile`, profileData);
    return response.data;
  } catch (error) {
    console.error('Update profile error:', error.response?.data || error.message);
    throw error;
  }
};

export const getUserComments = async (userId) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await axios.get(`${API_URL}/users/${userId}/comments`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Get user comments error:', error.response?.data || error.message);
    return { comments: [] }; // Return empty array instead of throwing
  }
};

export const updateProfilePicture = async (userId, imageData) => {
  try {
    const response = await axiosInstance.patch(`/users/${userId}/profile-picture`, {
      profileImage: imageData
    });
    return response.data;
  } catch (error) {
    console.error('Update profile picture error:', error.response?.data || error.message);
    throw error;
  }
};
