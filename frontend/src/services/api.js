import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const blogApi = {
  getAll: () => api.get('/blogs'),
  getTrending: () => api.get('/blogs/trending'),
  getById: (id) => api.get(`/blogs/${id}`),
  toggleLike: (id) => api.post(`/blogs/${id}/like`),
  toggleBookmark: (id) => api.post(`/blogs/${id}/bookmark`),
  getBookmarkStatus: (id) => api.get(`/blogs/${id}/bookmark-status`),
  getFeatured: () => api.get('/blogs/featured'),
};

export default api;
