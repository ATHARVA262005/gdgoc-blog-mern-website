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

  const fetchLikeStatuses = async (blogs) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        '/api/blogs/likes-status',
        {
          blogIds: blogs.map(blog => blog._id)
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        return blogs.map(blog => ({
          ...blog,
          isLiked: response.data.likeStatuses[blog._id]
        }));
      }
      return blogs;
    } catch (error) {
      console.error('Error fetching like statuses:', error);
      return blogs;
    }
  };

  const handleLike = async (blogId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`/api/blogs/${blogId}/like`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setBookmarkedBlogs(blogs => 
          blogs.map(blog => 
            blog._id === blogId 
              ? { 
                  ...blog, 
                  isLiked: response.data.isLiked,
                  stats: { 
                    ...blog.stats, 
                    likeCount: response.data.likeCount 
                  }
                }
              : blog
          )
        );
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  useEffect(() => {

    console.log('BookmarkBlogs - User state:', user);
    
    if (!user || !user.id) {
      console.log("No valid user found in BookmarkBlogs");
      navigate('/login');
      return;
    }

    const fetchBookmarks = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login'); // Redirect to login if no token
          return;
        }
  
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/blogs/bookmarks`, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
  
        if (response.data.success) {
          // Fetch like statuses for bookmarked blogs
          const blogsWithLikeStatus = await fetchLikeStatuses(response.data.bookmarks);
          setBookmarkedBlogs(blogsWithLikeStatus);
        } else {
          setError(response.data.message || 'Failed to fetch bookmarks');
        }
      } catch (error) {
        setError(error.message || 'An error occurred while fetching bookmarks');
        if (error.response?.status === 401) {
          navigate('/login'); // Redirect to login on authentication error
        }
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
                isLiked={blog.isLiked}
                onLike={(e) => {
                  e.stopPropagation();
                  handleLike(blog._id);
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BookmarkBlogs;
