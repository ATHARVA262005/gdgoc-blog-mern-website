import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import BlogCard from '../components/BlogCard';
import { useAuth } from '../contexts/AuthContext';

const BookmarkBlogs = () => {
  const [bookmarkedBlogs, setBookmarkedBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    // Redirect if not logged in
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchBookmarks = async () => {
      try {
        setLoading(true);
        setError(null); // Reset error state
        
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found');
        }

        const response = await axios.get('http://localhost:5000/api/blogs/bookmarks', {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.data.success) {
          setBookmarkedBlogs(response.data.bookmarks || []);
        } else {
          throw new Error(response.data.message || 'Failed to fetch bookmarks');
        }
      } catch (err) {
        console.error('Error fetching bookmarks:', err);
        setError(
          err.response?.data?.message || 
          err.message || 
          'Failed to fetch bookmarked blogs'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchBookmarks();
  }, [user, navigate]);

  const handleBlogClick = (blogId) => {
    navigate(`/blog/${blogId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="text-red-600 text-center">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-8 py-12">
        <h1 className="text-3xl font-bold mb-8">Your Bookmarks</h1>
        
        {bookmarkedBlogs.length === 0 ? (
          <div className="text-center text-gray-500 py-12">
            <p>No bookmarked blogs yet.</p>
            <button 
              onClick={() => navigate('/')}
              className="mt-4 text-blue-600 hover:underline"
            >
              Explore blogs
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {bookmarkedBlogs.map(blog => (
              <BlogCard
                key={blog._id}
                blog={blog}
                onClick={() => handleBlogClick(blog._id)}
                isBookmarked={true}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BookmarkBlogs;
