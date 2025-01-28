import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getBookmarkedBlogs } from '../services/blogService';
import BlogCard from '../components/BlogCard';
import { toast } from 'react-hot-toast';
import { Bookmark } from 'lucide-react';
import SEO from '../components/SEO';

const BookmarkBlogs = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBookmarks = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login', { 
            state: { from: '/bookmarks' },
            replace: true
          });
          return;
        }

        const response = await getBookmarkedBlogs();
        
        if (response.requiresAuth) {
          navigate('/login', { 
            state: { from: '/bookmarks' },
            replace: true
          });
          return;
        }

        setBlogs(response.bookmarks || []);
      } catch (error) {
        console.error('Error fetching bookmarks:', error);
        toast.error('Failed to load bookmarks');
      } finally {
        setLoading(false);
      }
    };

    fetchBookmarks();
  }, [navigate]);

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

  return (
    <>
      <SEO 
        title="My Bookmarks"
        description="Access your saved articles and bookmarked content from the GDG PDEA blog. Organize and revisit your favorite technical resources and tutorials."
        keywords="saved articles, bookmarked posts, favorite tech content, reading list"
        robots={!localStorage.getItem('token') ? 'noindex, nofollow' : undefined}
      />
      
      <div className="min-h-screen bg-gray-50">
        <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12 mb-8 md:mb-0">
          <div className="flex items-center gap-2 sm:gap-3 mb-6 sm:mb-8">
            <Bookmark className="text-blue-600" size={24} sm={28} lg={32} />
            <h1 className="text-2xl sm:text-3xl font-bold">Your Bookmarks</h1>
          </div>
          
          {blogs.length === 0 ? (
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
              {blogs.map(blog => (
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
    </>
  );
};

export default BookmarkBlogs;
