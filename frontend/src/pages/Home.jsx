import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, ThumbsUp, MessageCircle, Bookmark, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import axios from 'axios';
import BlogCard from '../components/BlogCard';
import { blogApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const FeaturedPost = ({ post }) => (
  <div className="relative h-[500px] group cursor-pointer overflow-hidden rounded-xl">
    <img 
      src={post.featuredImage || 'https://placehold.co/600x400'} 
      alt={post.title} 
      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
    />
    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/50 to-black/80">
      <div className="absolute bottom-0 p-8">
        <span className="text-sm font-medium px-3 py-1 rounded-full bg-blue-600 text-white">
          {post.category}
        </span>
        <h2 className="text-3xl font-bold text-white mt-4 mb-2">{post.title}</h2>
        <div className="flex items-center gap-4 text-white/80">
          <img 
            src={post.author?.profileImage || '/images/profile_administrator.webp'} 
            alt={post.author?.username} 
            className="w-10 h-10 rounded-full" 
          />
          <div>
            <p className="font-medium">{post.author?.username || 'Anonymous'}</p>
            <p className="text-sm">
              {new Date(post.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Remove the old BlogCard component definition since we're now importing it

const SidebarCard = ({ blog }) => (
  <div className="flex gap-4 mb-4">
    <img src={blog.image} alt={blog.title} className="w-20 h-20 object-cover rounded" />
    <div>
      <h3 className="font-semibold text-sm">{blog.title}</h3>
      <p className="text-gray-500 text-xs mt-1">{blog.date}</p>
    </div>
  </div>
);

const SectionTitle = ({ title, onViewAll }) => (
  <div className="flex items-center justify-between mb-8">
    <h2 className="text-2xl font-bold">{title}</h2>
    <button 
      onClick={onViewAll}
      className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700"
    >
      View All
    </button>
  </div>
);

const SearchBar = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/treasure?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <form onSubmit={handleSearch} className="max-w-3xl mx-auto mb-12">
      <div className="relative">
        <input
          type="text"
          placeholder="Search blogs..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-3 pl-12 pr-4 rounded-xl border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
        />
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <button
          type="submit"
          className="absolute right-3 top-1/2 transform -translate-y-1/2 px-4 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Search
        </button>
      </div>
    </form>
  );
};

const FeaturedCarousel = ({ posts }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!posts || posts.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === posts.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [posts]);

  if (!posts || posts.length === 0) {
    return null;
  }

  return (
    <div className="relative group">
      <FeaturedPost post={posts[currentIndex]} />
      
      {/* Carousel Indicators */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
        {posts.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-2 h-2 rounded-full transition-all ${
              currentIndex === index ? 'bg-white w-4' : 'bg-white/50'
            }`}
          />
        ))}
      </div>

      {/* Navigation Buttons */}
      <button
        onClick={() => setCurrentIndex(prev => prev === 0 ? posts.length - 1 : prev - 1)}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 p-3 rounded-full bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-all opacity-0 group-hover:opacity-100 border border-white/20"
        aria-label="Previous slide"
      >
        <ChevronLeft size={24} strokeWidth={2.5} />
      </button>
      <button
        onClick={() => setCurrentIndex(prev => prev === posts.length - 1 ? 0 : prev + 1)}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 p-3 rounded-full bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-all opacity-0 group-hover:opacity-100 border border-white/20"
        aria-label="Next slide"
      >
        <ChevronRight size={24} strokeWidth={2.5} />
      </button>
    </div>
  );
};

const Home = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [blogs, setBlogs] = useState([]);
  const [featuredBlogs, setFeaturedBlogs] = useState([]);
  const [trendingBlogs, setTrendingBlogs] = useState([]);
  const [userPreferences, setUserPreferences] = useState(null);
  const navigate = useNavigate();
  const { user } = useAuth(); // Add this line to get auth status

  // Add handlers for blog interactions
  const handleBlogClick = (blogId) => {
    navigate(`/blog/${blogId}`);
  };

  const handleLike = async (blogId, e) => {
    e.stopPropagation(); // Prevent blog click event
    try {
      const response = await blogApi.toggleLike(blogId);
      if (response.data.success) {
        // Update the blogs state to reflect the new like status
        setBlogs(prev => prev.map(blog => {
          if (blog._id === blogId) {
            return {
              ...blog,
              isLiked: response.data.isLiked,
              stats: {
                ...blog.stats,
                likeCount: response.data.likeCount
              }
            };
          }
          return blog;
        }));
      }
    } catch (err) {
      console.error('Error toggling like:', err);
    }
  };

  const handleBookmark = async (blogId, e) => {
    e.stopPropagation(); // Prevent blog click event
    try {
      const response = await blogApi.toggleBookmark(blogId);
      if (response.data.success) {
        // Update the blogs state to reflect the new bookmark status
        setBlogs(prev => prev.map(blog => {
          if (blog._id === blogId) {
            return {
              ...blog,
              isBookmarked: response.data.isBookmarked
            };
          }
          return blog;
        }));
      }
    } catch (err) {
      console.error('Error toggling bookmark:', err);
    }
  };

  const getLatestBlogs = (allBlogs) => {
    // Simply get the 3 most recent blogs
    return [...allBlogs]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 3);
  };

  const getRecommendedBlogs = (allBlogs) => {
    // If user is not logged in, return trending posts
    if (!user || !userPreferences) {
      return [...allBlogs]
        .sort((a, b) => {
          const scoreA = (a.stats?.likeCount || 0) * 2 + (a.stats?.commentCount || 0) * 3;
          const scoreB = (b.stats?.likeCount || 0) * 2 + (b.stats?.commentCount || 0) * 3;
          return scoreB - scoreA;
        })
        .slice(0, 3);
    }

    // For logged in users, use personalized recommendations
    return [...allBlogs]
      .map(blog => {
        let score = 0;
        
        // User's liked posts get highest weight
        if (blog.isLiked) {
          score += 5;
        }

        // Matching user's preferred categories
        if (userPreferences?.preferredCategories?.includes(blog.category)) {
          score += 3;
        }

        // Bookmarked posts
        if (blog.isBookmarked) {
          score += 2;
        }

        // Add some weight to trending metrics as fallback
        score += (blog.stats?.likeCount || 0) * 0.1;
        score += (blog.stats?.commentCount || 0) * 0.2;

        return { ...blog, recommendationScore: score };
      })
      .sort((a, b) => b.recommendationScore - a.recommendationScore)
      .slice(0, 3);
  };

  // Navigate to treasure page
  const handleViewAll = () => {
    navigate('/treasure');
  };

  const getRecommendationTitle = () => {
    return user ? "Recommended For You" : "Trending Posts";
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const requests = [
          axios.get(`${import.meta.env.VITE_API_URL}/blogs`),
          axios.get(`${import.meta.env.VITE_API_URL}/blogs/featured`),
        ];

        // Add likes status request if user is logged in
        const token = localStorage.getItem('token');
        if (user && token) {
          const responses = await Promise.all(requests);
          const blogIds = responses[0].data.blogs.map(blog => blog._id);
          
          // Fetch like statuses for all blogs
          const likesResponse = await axios.post(
            'http://localhost:5000/api/blogs/likes-status',
            { blogIds },
            { headers: { Authorization: `Bearer ${token}` } }
          );

          // Merge like status with blog data
          const blogsWithLikes = responses[0].data.blogs.map(blog => ({
            ...blog,
            isLiked: likesResponse.data.likeStatuses[blog._id] || false
          }));

          setBlogs(blogsWithLikes);
          setFeaturedBlogs(responses[1].data.featuredBlogs);
        } else {
          const [blogsRes, featuredRes] = await Promise.all(requests);
          setBlogs(blogsRes.data.blogs);
          setFeaturedBlogs(featuredRes.data.featuredBlogs);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to fetch blogs. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Oops!</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  const recommendedBlogs = getRecommendedBlogs(blogs, userPreferences);
  const latestBlogs = getLatestBlogs(blogs);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-8 py-12">
        <SearchBar />
        
        <div className="mb-16">
          {featuredBlogs.length > 0 ? (
            <FeaturedCarousel posts={featuredBlogs} />
          ) : (
            <FeaturedCarousel posts={trendingBlogs.slice(0, 3)} />
          )}
        </div>

        {/* Recommended Posts Section */}
        <section className="mb-16">
          <SectionTitle 
            title={getRecommendationTitle()}
            onViewAll={handleViewAll}
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {recommendedBlogs.map(blog => (
              <BlogCard
                key={blog._id}
                blog={blog}
                onClick={() => handleBlogClick(blog._id)}
                onLike={(e) => handleLike(blog._id, e)}
                onBookmark={(e) => handleBookmark(blog._id, e)}
                isLiked={blog.isLiked}
                isBookmarked={blog.isBookmarked}
              />
            ))}
          </div>
        </section>

        {/* Latest Posts Section */}
        <section className="mb-16">
          <SectionTitle 
            title="Latest Posts" 
            onViewAll={handleViewAll}
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {latestBlogs.map(blog => (
              <BlogCard
                key={blog._id}
                blog={blog}
                onClick={() => handleBlogClick(blog._id)}
                onLike={(e) => handleLike(blog._id, e)}
                onBookmark={(e) => handleBookmark(blog._id, e)}
                isLiked={blog.isLiked}
                isBookmarked={blog.isBookmarked}
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Home;