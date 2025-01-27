import axios from 'axios';

// Update API_URL to use the correct port
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

export const toggleBookmark = async (blogId) => {
  try {
    const response = await axios.post(`${import.meta.env.VITE_API_URL}/blogs/${blogId}/bookmark`, {}, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Toggle bookmark error:', error.response?.data || error.message);
    throw error;
  }
};

export const getBookmarkedBlogs = async () => {
  try {
    const response = await axiosInstance.get('/blogs/bookmarks');
    return response.data;
  } catch (error) {
    console.error('Get bookmarked blogs error:', error.response?.data || error.message);
    throw error;
  }
};

export const getBookmarkStatus = async (blogId) => {
  try {
    const response = await axios.get(`${API_URL}/blogs/${blogId}/bookmark-status`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Get bookmark status error:', error.response?.data || error.message);
    throw error;
  }
};

export const getBookmarksStatus = async (blogIds) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return {};

    const response = await axios.post(
      `${API_URL}/blogs/bookmarks-status`,
      { blogIds },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    return response.data.bookmarkStatuses;
  } catch (error) {
    console.error('Error fetching bookmark statuses:', error);
    return {};
  }
};

export const toggleLike = async (blogId) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.post(
      `${API_URL}/blogs/${blogId}/like`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getLikesStatus = async (blogIds) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return {};

    const response = await axios.post(
      `${API_URL}/blogs/likes-status`,
      { blogIds },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    return response.data.likeStatuses;
  } catch (error) {
    console.error('Error fetching like statuses:', error);
    return {};
  }
};

export const addComment = async (blogId, content) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.post(
      `${API_URL}/blogs/${blogId}/comments`,
      { content },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
