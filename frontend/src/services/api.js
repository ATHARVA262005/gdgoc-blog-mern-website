import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true
});

// Request interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

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
