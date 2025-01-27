import React, { useState, useEffect } from 'react';
import { ThumbsUp, MessageCircle, Bookmark, Clock } from 'lucide-react';
import axios from 'axios';
import { getVisitedTime } from '../utils/recentlyViewed';
import { useNavigate } from 'react-router-dom';

const RecentBlogs = () => {
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

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
          excerpt: blog.content?.substring(0, 150) + '...',
          author: blog.author?.username || 'Unknown',
          authorImage: blog.author?.profileImage?.url || '/images/profile_administrator.webp',
          date: new Date(blog.createdAt).toLocaleDateString(),
          visitedAt: getVisitedTime(blog._id),
          likes: blog.stats?.likeCount || 0,
          comments: blog.stats?.commentCount || 0,
          category: blog.category,
          image: blog.featuredImage || 'https://placehold.co/600x400'
        }));

        if (page === 1) {
          setBlogs(formattedBlogs);
        } else {
          setBlogs(prev => [...prev, ...formattedBlogs]);
        }
        setHasMore(response.data.hasMore);
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
    <div className="min-h-screen bg-gray-50">
      <div className="px-8 py-12">
        <div className="flex items-center gap-3 mb-8">
          <Clock className="text-blue-600" size={32} />
          <h1 className="text-3xl font-bold">Recently Visited</h1>
        </div>
        
        <div className="space-y-6">
          {blogs.map(blog => (
            <div 
              key={blog.id} 
              onClick={() => handleBlogClick(blog.id)}
              className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300 cursor-pointer"
            >
              <div className="flex flex-col md:flex-row">
                <div className="md:w-1/3 relative">
                  <img 
                    src={blog.image} 
                    alt={blog.title} 
                    className="w-full h-48 md:h-full object-cover"
                  />
                  <div className="absolute top-4 right-4 flex items-center gap-2">
                    <span className="px-3 py-1 bg-black/50 text-white rounded-full text-sm backdrop-blur-sm">
                      {blog.visitedAt}
                    </span>
                  </div>
                </div>
                <div className="p-6 md:w-2/3">
                  <div className="flex items-center gap-4 mb-4">
                    <img src={blog.authorImage} alt={blog.author} className="w-8 h-8 rounded-full" />
                    <div>
                      <p className="font-medium text-sm">{blog.author}</p>
                      <p className="text-xs text-gray-500">{blog.date}</p>
                    </div>
                  </div>
                  <h3 className="font-bold text-xl mb-2">{blog.title}</h3>
                  <p className="text-gray-600 text-sm mb-4">{blog.excerpt}</p>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-600">
                      {blog.category}
                    </span>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <ThumbsUp size={16} />
                        <span>{blog.likes}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageCircle size={16} />
                        <span>{blog.comments}</span>
                      </div>
                      <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <Bookmark size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {hasMore && (
          <div className="mt-8 text-center">
            <button
              onClick={loadMore}
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Load More'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentBlogs;
