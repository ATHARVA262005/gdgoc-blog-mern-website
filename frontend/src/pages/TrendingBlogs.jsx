import React, { useState, useEffect } from 'react';
import { TrendingUp } from 'lucide-react';
import axios from 'axios';
import BlogCard from '../components/BlogCard';
import { useNavigate } from 'react-router-dom';

const api = axios.create({
  baseURL: 'http://localhost:5000',
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
      const response = await api.get('/api/blogs/trending');
      if (response.data.success) {
        setTrendingBlogs(response.data.trendingBlogs);
        // Fetch like and bookmark statuses for all blogs
        fetchLikeStatuses(response.data.trendingBlogs.map(blog => blog.id));
        fetchBookmarkStatuses(response.data.trendingBlogs.map(blog => blog.id));
      }
    } catch (err) {
      console.error('Error details:', err.response?.data || err.message);
      setError('Failed to fetch trending blogs');
    } finally {
      setLoading(false);
    }
  };

  const fetchLikeStatuses = async (blogIds) => {
    try {
      const response = await api.post('/api/blogs/likes-status', { blogIds });
      if (response.data.success) {
        setLikeStatuses(response.data.likeStatuses);
      }
    } catch (error) {
      console.error('Error fetching like statuses:', error);
    }
  };

  const fetchBookmarkStatuses = async (blogIds) => {
    try {
      const response = await api.post('/api/blogs/bookmarks-status', { blogIds });
      if (response.data.success) {
        setBookmarkStatuses(response.data.bookmarkStatuses);
      }
    } catch (error) {
      console.error('Error fetching bookmark statuses:', error);
    }
  };

  const handleLike = async (blogId) => {
    try {
      const response = await api.post(`/api/blogs/${blogId}/like`);
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
      const response = await api.post(`/api/blogs/${blogId}/bookmark`);
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
