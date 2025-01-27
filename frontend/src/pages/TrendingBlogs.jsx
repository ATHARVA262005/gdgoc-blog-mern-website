import React, { useState, useEffect } from 'react';
import { TrendingUp } from 'lucide-react';
import axios from 'axios';
import BlogCard from '../components/BlogCard';
import { useNavigate } from 'react-router-dom';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 5000
});

const TrendingBlogs = () => {
  const [trendingBlogs, setTrendingBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [likeStatuses, setLikeStatuses] = useState({});
  const [bookmarkStatuses, setBookmarkStatuses] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    fetchTrendingBlogs();
  }, []);

  const fetchTrendingBlogs = async () => {
    try {
      const response = await api.get('/blogs/trending');
      if (response.data.success) {
        setTrendingBlogs(response.data.trendingBlogs);
        // Fetch like and bookmark statuses for all blogs
        fetchBookmarkAndLikeStatuses(response.data.trendingBlogs);
      }
    } catch (err) {
      console.error('Error details:', err.response?.data || err.message);
      setError('Failed to fetch trending blogs');
    } finally {
      setLoading(false);
    }
  };

  const fetchBookmarkAndLikeStatuses = async (blogs) => {
    // Only fetch if user is logged in
    const token = localStorage.getItem('token');
    if (!token) return;

    const blogIds = blogs.map(blog => blog.id);
    
    try {
      const [bookmarkResponse, likeResponse] = await Promise.all([
        api.post('/blogs/bookmarks-status', { blogIds }, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        api.post('/blogs/likes-status', { blogIds }, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      if (bookmarkResponse.data.success) {
        setBookmarkStatuses(bookmarkResponse.data.bookmarkStatuses);
      }
      if (likeResponse.data.success) {
        setLikeStatuses(likeResponse.data.likeStatuses);
      }
    } catch (err) {
      // Don't show error for unauthorized requests
      if (err.response?.status !== 401) {
        console.error('Error fetching statuses:', err);
      }
    }
  };

  const handleLike = async (blogId) => {
    try {
      const response = await api.post(`/blogs/${blogId}/like`);
      if (response.data.success) {
        setLikeStatuses(prev => ({
          ...prev,
          [blogId]: response.data.isLiked
        }));
        // Update like count in trending blogs
        setTrendingBlogs(prev => 
          prev.map(blog => 
            blog.id === blogId 
              ? { ...blog, likes: response.data.likeCount }
              : blog
          )
        );
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleBookmark = async (blogId) => {
    try {
      const response = await api.post(`/blogs/${blogId}/bookmark`);
      if (response.data.success) {
        setBookmarkStatuses(prev => ({
          ...prev,
          [blogId]: response.data.isBookmarked
        }));
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-8 py-12">
        <div className="flex items-center gap-3 mb-8">
          <TrendingUp className="text-blue-600" size={32} />
          <h1 className="text-3xl font-bold">Most Popular Posts</h1>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {trendingBlogs.map(blog => (
            <BlogCard
              key={blog.id}
              blog={{
                ...blog,
                stats: {
                  likeCount: blog.stats?.likeCount || 0,
                  commentCount: blog.stats?.commentCount || 0
                }
              }}
              isLiked={likeStatuses[blog.id] || false}
              isBookmarked={bookmarkStatuses[blog.id] || false}
              onLike={(e) => {
                e.stopPropagation();
                handleLike(blog.id);
              }}
              onBookmark={(e) => {
                e.stopPropagation();
                handleBookmark(blog.id);
              }}
              onClick={() => navigate(`/blog/${blog.id}`)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default TrendingBlogs;
