import React, { useState, useEffect } from 'react';
import { ThumbsUp, MessageCircle, Bookmark, Clock } from 'lucide-react';
import axios from 'axios';
import { getVisitedTime } from '../utils/recentlyViewed';
import { useNavigate } from 'react-router-dom';
import SEO from '../components/SEO';

const stripHtmlTags = (html) => {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, '');
};

const RecentBlogs = () => {
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [likesStatus, setLikesStatus] = useState({});

  useEffect(() => {
    fetchRecentlyViewedBlogs();
  }, [page]);

  const getRecentlyViewedBlogIds = () => {
    try {
      const recentlyViewed = localStorage.getItem('recentlyViewedBlogs');
      console.log('Recently viewed from localStorage:', recentlyViewed);
      return recentlyViewed ? JSON.parse(recentlyViewed) : [];
    } catch (error) {
      console.error('Error parsing recently viewed blogs:', error);
      return [];
    }
  };

  const fetchLikesStatus = async (blogIds) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await axios.post('/api/blogs/likes-status', 
        { blogIds },
        { headers: { Authorization: `Bearer ${token}` }}
      );

      if (response.data.success) {
        setLikesStatus(prev => ({
          ...prev,
          ...response.data.likeStatuses
        }));
      }
    } catch (error) {
      console.error('Error fetching likes status:', error);
    }
  };

  const fetchRecentlyViewedBlogs = async () => {
    try {
      setLoading(true);
      const blogIds = getRecentlyViewedBlogIds();
      console.log('Fetching blogs with IDs:', blogIds);

      if (blogIds.length === 0) {
        setHasMore(false);
        setLoading(false);
        return;
      }

      const response = await axios.post('/api/blogs/recently-viewed', {
        blogIds,
        page,
        limit: 3
      });

      if (response.data.success) {
        const formattedBlogs = response.data.blogs.map(blog => ({
          id: blog._id,
          title: blog.title,
          excerpt: stripHtmlTags(blog.content)?.substring(0, 150) + '...',
          author: blog.author?.username || 'Unknown',
          authorImage: blog.author?.profileImage?.url || '/images/profile_administrator.webp',
          date: new Date(blog.createdAt).toLocaleDateString(),
          visitedAt: getVisitedTime(blog._id),
          likes: blog.stats?.likeCount || 0,
          comments: blog.stats?.commentCount || 0,
          category: blog.category,
          image: blog.featuredImage || 'https://placehold.co/600x400',
          isLiked: likesStatus[blog._id] || false,
        }));

        if (page === 1) {
          setBlogs(formattedBlogs);
        } else {
          setBlogs(prev => [...prev, ...formattedBlogs]);
        }
        setHasMore(response.data.hasMore);

        await fetchLikesStatus(response.data.blogs.map(blog => blog._id));
      }
    } catch (error) {
      console.error('Error fetching recently viewed blogs:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    setPage(prev => prev + 1);
  };

  const handleBlogClick = (blogId) => {
    navigate(`/blog/${blogId}`);
  };

  const handleLikeClick = async (e, blogId) => {
    e.stopPropagation();
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return;
      }

      const response = await axios.post(`/api/blogs/${blogId}/like`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setLikesStatus(prev => ({
          ...prev,
          [blogId]: response.data.isLiked
        }));
        
        setBlogs(prev => prev.map(blog => {
          if (blog.id === blogId) {
            return {
              ...blog,
              likes: response.data.likeCount
            };
          }
          return blog;
        }));
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  if (blogs.length === 0 && !loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Clock className="text-blue-600 mx-auto mb-4" size={48} />
          <h2 className="text-2xl font-bold mb-2">No Recent Blogs</h2>
          <p className="text-gray-600">Start exploring blogs to see your recent views here.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO 
        title="Recently Viewed Blogs"
        description="View your reading history and recently visited articles on GDG PDEA blog. Keep track of the technical content you've explored and easily revisit valuable resources."
        keywords="reading history, recent tech articles, viewed blogs, browsing history"
      />
      
      <div className="min-h-screen bg-gray-50">
        <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12 mb-8 md:mb-0">
          {/* Header - Made responsive */}
          <div className="flex items-center gap-2 sm:gap-3 mb-6 sm:mb-8">
            <Clock className="text-blue-600" size={24} sm={28} lg={32} />
            <h1 className="text-2xl sm:text-3xl font-bold">Recently Visited</h1>
          </div>
          
          <div className="space-y-4 sm:space-y-6">
            {blogs.map(blog => (
              <div 
                key={blog.id} 
                onClick={() => handleBlogClick(blog.id)}
                className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300 cursor-pointer"
              >
                <div className="flex flex-col sm:flex-row">
                  {/* Image Container */}
                  <div className="sm:w-1/3 relative">
                    <img 
                      src={blog.image} 
                      alt={blog.title} 
                      className="w-full h-48 sm:h-full object-cover"
                    />
                    <div className="absolute top-2 sm:top-4 right-2 sm:right-4 flex items-center gap-2">
                      <span className="px-2 sm:px-3 py-1 bg-black/50 text-white rounded-full text-xs sm:text-sm backdrop-blur-sm">
                        {blog.visitedAt}
                      </span>
                    </div>
                  </div>

                  {/* Content Container */}
                  <div className="p-4 sm:p-6 sm:w-2/3">
                    {/* Author Info */}
                    <div className="flex items-center gap-3 mb-3 sm:mb-4">
                      <img 
                        src={blog.authorImage} 
                        alt={blog.author} 
                        className="w-6 h-6 sm:w-8 sm:h-8 rounded-full" 
                      />
                      <div>
                        <p className="font-medium text-xs sm:text-sm">{blog.author}</p>
                        <p className="text-[10px] sm:text-xs text-gray-500">{blog.date}</p>
                      </div>
                    </div>

                    {/* Blog Title and Excerpt */}
                    <h3 className="font-bold text-lg sm:text-xl mb-2">{blog.title}</h3>
                    <p className="text-gray-600 text-xs sm:text-sm mb-4 line-clamp-2 sm:line-clamp-3">
                      {blog.excerpt}
                    </p>

                    {/* Footer: Category and Interactions */}
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs sm:text-sm text-gray-500">
                      <span className="px-2 sm:px-3 py-1 rounded-full bg-gray-100 text-gray-600">
                        {blog.category}
                      </span>
                      
                      <div className="flex items-center gap-3 sm:gap-4">
                        <button 
                          onClick={(e) => handleLikeClick(e, blog.id)}
                          className={`flex items-center gap-1 ${
                            likesStatus[blog.id] 
                              ? 'text-blue-600 font-medium' 
                              : 'text-gray-500 hover:text-blue-600'
                          }`}
                        >
                          <ThumbsUp 
                            size={14} 
                            className={`sm:w-4 sm:h-4 ${likesStatus[blog.id] ? 'fill-current' : ''}`} 
                          />
                          <span>{blog.likes}</span>
                        </button>

                        <div className="flex items-center gap-1">
                          <MessageCircle size={14} className="sm:w-4 sm:h-4" />
                          <span>{blog.comments}</span>
                        </div>

                        <button className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-full transition-colors">
                          <Bookmark size={14} className="sm:w-4 sm:h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Load More Button */}
          {hasMore && (
            <div className="mt-6 sm:mt-8 text-center">
              <button
                onClick={loadMore}
                disabled={loading}
                className="px-4 sm:px-6 py-2 bg-blue-600 text-white text-sm sm:text-base rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Loading...' : 'Load More'}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default RecentBlogs;
