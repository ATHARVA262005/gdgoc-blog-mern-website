import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import BlogCard from '../components/BlogCard';
import { useAuth } from '../contexts/AuthContext';
import { Bookmark } from 'lucide-react';

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
        <div className="animate-spin rounded-full h-10 sm:h-12 w-10 sm:w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
        <div className="text-red-600 text-center text-sm sm:text-base">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12 mb-8 md:mb-0">
        <div className="flex items-center gap-2 sm:gap-3 mb-6 sm:mb-8">
          <Bookmark className="text-blue-600" size={24} sm={28} lg={32} />
          <h1 className="text-2xl sm:text-3xl font-bold">Your Bookmarks</h1>
        </div>
        
        {bookmarkedBlogs.length === 0 ? (
          <div className="text-center text-gray-500 py-8 sm:py-12">
            <p className="text-sm sm:text-base">No bookmarked blogs yet.</p>
            <button 
              onClick={() => navigate('/')}
              className="mt-3 sm:mt-4 text-blue-600 hover:underline text-sm sm:text-base"
            >
              Explore blogs
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
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
