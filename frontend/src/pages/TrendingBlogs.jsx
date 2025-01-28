import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Library } from 'lucide-react';
import axios from 'axios';
import BlogCard from '../components/BlogCard';
import SEO from '../components/SEO';

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
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTrendingBlogs();
  }, [currentPage]);

  const fetchTrendingBlogs = async () => {
    try {
      const response = await api.get('/blogs/trending', {
        params: {
          page: currentPage
        }
      });
      if (response.data.success) {
        setTrendingBlogs(response.data.trendingBlogs);
        setTotalPages(response.data.totalPages);
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

  const handleLike = async (blogId, e) => {
    e.stopPropagation();
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

  const handleBookmark = async (blogId, e) => {
    e.stopPropagation();
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

  const handleBlogClick = (blogId) => {
    navigate(`/blog/${blogId}`);
  };

  return (
    <>
      <SEO 
        title="Trending Blogs"
        description="Discover the most popular and engaging tech articles from the GDG community. Stay updated with trending topics in software development, cloud computing, and more."
        keywords="trending tech blogs, popular programming articles, top developer stories, GDG trending posts"
        image={`${import.meta.env.VITE_APP_URL}/images/trending-blogs-og.jpg`}
      />

      <div className="min-h-screen bg-gray-50">
        <div className="px-4 sm:px-6 lg:px-8 py-6 mb-8 md:mb-0">
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6 sm:mb-8">
            <Library className="text-blue-600" size={28} />
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Trending Blogs</h1>
              <p className="text-sm sm:text-base text-gray-600 mt-1">
                Discover what's popular in the community
              </p>
            </div>
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-600">{error}</p>
            </div>
          ) : (
            <>
              {/* Blogs Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                {trendingBlogs.map(blog => (
                  <BlogCard
                    key={blog.id}
                    blog={blog}
                    onClick={() => handleBlogClick(blog.id)}
                    onLike={(e) => handleLike(blog.id, e)}
                    onBookmark={(e) => handleBookmark(blog.id, e)}
                    isLiked={likeStatuses[blog.id]}
                    isBookmarked={bookmarkStatuses[blog.id]}
                  />
                ))}
              </div>

              {/* Empty State */}
              {trendingBlogs.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-base sm:text-lg">
                    No trending blogs found
                  </p>
                </div>
              )}
            </>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 sm:gap-4 mt-8">
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg text-sm sm:text-base transition-colors
                    ${currentPage === i + 1 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-white text-gray-600 hover:bg-gray-100'
                    }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default TrendingBlogs;
