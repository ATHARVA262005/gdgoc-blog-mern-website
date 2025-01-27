import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ThumbsUp, MessageCircle, Bookmark, Library, ChevronLeft, ChevronRight, Search, ArrowUpDown, BookmarkCheck, Clock } from 'lucide-react';
import axios from 'axios';
import { getBookmarksStatus, toggleBookmark, getLikesStatus, toggleLike } from '../services/blogService';
import Toast from '../components/Toast';
import BlogCard from '../components/BlogCard';

const ITEMS_PER_PAGE = 9;

const categories = [
  "All",
  'Web Development',
  'Mobile Development',
  'DevOps & Cloud',
  'Data Science & AI',
  'Programming Languages',
  'Software Architecture',
  'Cybersecurity',
  'System Design',
  'Other'
];

const sortOptions = [
  { label: 'Newest First', value: 'newest' },
  { label: 'Oldest First', value: 'oldest' },
  { label: 'Most Liked', value: 'likes' },
  { label: 'Most Commented', value: 'comments' }
];

const TreasureBlogs = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('newest');
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bookmarks, setBookmarks] = useState({});
  const [likes, setLikes] = useState({});
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/blogs`);
        if (response.data.success) {
          setBlogs(response.data.blogs);
          const blogIds = response.data.blogs.map(blog => blog._id);
          const [bookmarkStatuses, likeStatuses] = await Promise.all([
            getBookmarksStatus(blogIds),
            getLikesStatus(blogIds)
          ]);
          setBookmarks(bookmarkStatuses);
          setLikes(likeStatuses);
          setError(null);
        }
      } catch (err) {
        setError('Failed to fetch blogs. Please try again later.');
        console.error('Error fetching blogs:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  useEffect(() => {
    const searchFromUrl = searchParams.get('search');
    if (searchFromUrl) {
      setSearchQuery(searchFromUrl);
    }
  }, [searchParams]);

  const filteredBlogs = blogs.filter(blog => {
    const matchesSearch = blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         blog.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || blog.category === selectedCategory;
    return matchesSearch && matchesCategory;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'oldest':
        return new Date(a.createdAt) - new Date(b.createdAt);
      case 'likes':
        return (b.views?.total || 0) - (a.views?.total || 0);
      case 'comments':
        return (b.views?.unique || 0) - (a.views?.unique || 0);
      default:
        return new Date(b.createdAt) - new Date(a.createdAt);
    }
  });

  const totalPages = Math.ceil(filteredBlogs.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentBlogs = filteredBlogs.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handleBlogClick = (blogId) => {
    navigate(`/blog/${blogId}`);
  };

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  const handleBookmarkToggle = async (blogId, e) => {
    e.preventDefault();
    e.stopPropagation(); // Stop event from bubbling to parent
    const token = localStorage.getItem('token');
    if (!token) {
      showToast('Please login to bookmark posts', 'error');
      navigate('/login');
      return;
    }
    try {
      const response = await toggleBookmark(blogId);
      if (response.success) {
        setBookmarks(prev => ({
          ...prev,
          [blogId]: response.isBookmarked
        }));
        showToast(response.message);
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      showToast('Failed to update bookmark', 'error');
    }
  };

  const handleLikeToggle = async (blogId, e) => {
    e.preventDefault();
    e.stopPropagation(); // Stop event from bubbling to parent
    const token = localStorage.getItem('token');
    if (!token) {
      showToast('Please login to like posts', 'error');
      navigate('/login');
      return;
    }
    try {
      const response = await toggleLike(blogId);
      if (response.success) {
        setLikes(prev => ({
          ...prev,
          [blogId]: response.isLiked
        }));
        setBlogs(prev => prev.map(blog => 
          blog._id === blogId 
            ? { ...blog, stats: { ...blog.stats, likeCount: response.likeCount } }
            : blog
        ));
        showToast(response.message);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      showToast('Failed to update like', 'error');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading blogs...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center text-red-600">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {toast.show && (
        <Toast 
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ show: false, message: '', type: 'success' })}
        />
      )}
      <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Header - Made more compact on mobile */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 mb-4 sm:mb-6 lg:mb-8">
          <Library className="text-blue-600" size={24} sm={28} lg={32} />
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">Blog Treasure</h1>
        </div>
        
        {/* Search and Filter Section - Improved mobile layout */}
        <div className="mb-4 sm:mb-6 lg:mb-8 space-y-3 sm:space-y-4">
          {/* Search and Sort Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="relative sm:col-span-3">
              <input
                type="text"
                placeholder="Search blogs..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-4 py-2 pl-10 pr-4 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm sm:text-base"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            </div>

            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 sm:px-4 py-2 pr-8 sm:pr-10 appearance-none rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none cursor-pointer text-sm sm:text-base"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <ArrowUpDown className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
            </div>
          </div>

          {/* Categories - Select on mobile, buttons on larger screens */}
          <div className="block sm:hidden">
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 pr-8 appearance-none rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none cursor-pointer text-sm"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'All' ? 'All Categories' : category}
                </option>
              ))}
            </select>
          </div>

          <div className="hidden sm:flex sm:flex-wrap gap-2">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => {
                  setSelectedCategory(category);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg transition-colors text-sm
                  ${selectedCategory === category
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-100'
                  }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Blog Grid - Adjusted gaps and padding */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
          {currentBlogs.map(blog => (
            <BlogCard
              key={blog._id}
              blog={blog}
              isLiked={likes[blog._id]}
              isBookmarked={bookmarks[blog._id]}
              onLike={(e) => handleLikeToggle(blog._id, e)}
              onBookmark={(e) => handleBookmarkToggle(blog._id, e)}
              onClick={() => handleBlogClick(blog._id)}
            />
          ))}
        </div>

        {/* Empty State - Adjusted padding */}
        {currentBlogs.length === 0 && (
          <div className="text-center py-6 sm:py-8 lg:py-12">
            <p className="text-gray-500 text-sm sm:text-base lg:text-lg">
              No blogs found matching your criteria
            </p>
          </div>
        )}

        {/* Pagination - More compact on mobile */}
        {filteredBlogs.length > ITEMS_PER_PAGE && (
          <div className="flex items-center justify-center gap-1 sm:gap-2">
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1 sm:p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:hover:bg-transparent"
            >
              <ChevronLeft size={16} className="sm:w-5 sm:h-5" />
            </button>
            
            <div className="flex items-center gap-1 sm:gap-2">
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-6 h-6 sm:w-8 sm:h-8 text-xs sm:text-sm rounded-lg transition-colors
                    ${currentPage === i + 1 
                      ? 'bg-blue-600 text-white' 
                      : 'hover:bg-gray-100'
                    }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            <button 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1 sm:p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:hover:bg-transparent"
            >
              <ChevronRight size={16} className="sm:w-5 sm:h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TreasureBlogs;
