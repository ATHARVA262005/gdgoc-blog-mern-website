import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, ThumbsUp, MessageCircle, Bookmark, Search, ChevronLeft, ChevronRight } from 'lucide-react';

const blogs = [
  {
    id: 1,
    title: "Getting Started with React Hooks",
    excerpt: "Learn how to use React Hooks to manage state and side effects in your functional components...",
    author: "Sarah Johnson",
    authorImage: "https://placehold.co/100x100",
    date: "Jan 15, 2025",
    likes: 234,
    comments: 45,
    category: "Development",
    image: "https://placehold.co/600x400"
  },
  {
    id: 2,
    title: "The Future of AI in 2025",
    excerpt: "Exploring the latest trends and predictions in artificial intelligence and machine learning...",
    author: "Michael Chen",
    authorImage: "https://placehold.co/100x100",
    date: "Jan 14, 2025",
    likes: 189,
    comments: 32,
    category: "Technology",
    image: "https://placehold.co/600x400"
  },
  // Additional blog entries with similar structure
].concat(Array.from({ length: 8 }, (_, i) => ({
  id: i + 3,
  title: `Sample Blog Post ${i + 3}`,
  excerpt: "This is a sample blog post excerpt that demonstrates the layout and design of our blog cards...",
  author: "John Doe",
  authorImage: "https://placehold.co/100x100",
  date: "Jan 13, 2025",
  likes: Math.floor(Math.random() * 200) + 50,
  comments: Math.floor(Math.random() * 50) + 10,
  category: "General",
  image: "https://placehold.co/600x400"
})));

const recommendedBlogs = blogs.slice(0, 3);
const latestBlogs = blogs.slice(3, 9);
const featuredPosts = blogs.slice(0, 3); // Get first 3 posts as featured

const FeaturedPost = ({ post }) => (
  <div className="relative h-[500px] group cursor-pointer overflow-hidden rounded-xl">
    <img 
      src={post.image} 
      alt={post.title} 
      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
    />
    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/50 to-black/80">
      <div className="absolute bottom-0 p-8">
        <span className="text-sm font-medium px-3 py-1 rounded-full bg-blue-600 text-white">{post.category}</span>
        <h2 className="text-3xl font-bold text-white mt-4 mb-2">{post.title}</h2>
        <div className="flex items-center gap-4 text-white/80">
          <img src={post.authorImage} alt={post.author} className="w-10 h-10 rounded-full" />
          <div>
            <p className="font-medium">{post.author}</p>
            <p className="text-sm">{post.date}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const BlogCard = ({ blog }) => (
  <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300">
    <div className="relative h-48 overflow-hidden">
      <img src={blog.image} alt={blog.title} className="w-full h-full object-cover transition-transform duration-500 hover:scale-110" />
      <button className="absolute top-4 right-4 p-2 bg-white/30 backdrop-blur-sm rounded-full hover:bg-white/50 transition-colors">
        <Bookmark size={20} className="text-white" />
      </button>
    </div>
    <div className="p-6">
      <div className="flex items-center gap-4 mb-4">
        <img src={blog.authorImage} alt={blog.author} className="w-8 h-8 rounded-full" />
        <div>
          <p className="font-medium text-sm">{blog.author}</p>
          <p className="text-xs text-gray-500">{blog.date}</p>
        </div>
      </div>
      <h3 className="font-bold text-xl mb-2 line-clamp-2">{blog.title}</h3>
      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{blog.excerpt}</p>
      <div className="flex items-center justify-between text-sm text-gray-500">
        <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-600">{blog.category}</span>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <ThumbsUp size={16} />
            <span>{blog.likes}</span>
          </div>
          <div className="flex items-center gap-1">
            <MessageCircle size={16} />
            <span>{blog.comments}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const SidebarCard = ({ blog }) => (
  <div className="flex gap-4 mb-4">
    <img src={blog.image} alt={blog.title} className="w-20 h-20 object-cover rounded" />
    <div>
      <h3 className="font-semibold text-sm">{blog.title}</h3>
      <p className="text-gray-500 text-xs mt-1">{blog.date}</p>
    </div>
  </div>
);

const SectionTitle = ({ title }) => (
  <div className="flex items-center justify-between mb-8">
    <h2 className="text-2xl font-bold">{title}</h2>
    <button className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700">
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

const FeaturedCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === featuredPosts.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative group">
      <FeaturedPost post={featuredPosts[currentIndex]} />
      
      {/* Carousel Indicators */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
        {featuredPosts.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-2 h-2 rounded-full transition-all ${
              currentIndex === index ? 'bg-white w-4' : 'bg-white/50'
            }`}
          />
        ))}
      </div>

      {/* Enhanced Previous/Next Buttons */}
      <button
        onClick={() => setCurrentIndex(prev => prev === 0 ? featuredPosts.length - 1 : prev - 1)}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 p-3 rounded-full bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-all opacity-0 group-hover:opacity-100 border border-white/20"
        aria-label="Previous slide"
      >
        <ChevronLeft size={24} strokeWidth={2.5} />
      </button>
      <button
        onClick={() => setCurrentIndex(prev => prev === featuredPosts.length - 1 ? 0 : prev + 1)}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 p-3 rounded-full bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-all opacity-0 group-hover:opacity-100 border border-white/20"
        aria-label="Next slide"
      >
        <ChevronRight size={24} strokeWidth={2.5} />
      </button>
    </div>
  );
};

const Home = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-8 py-12">
        <SearchBar />
        
        {/* Replace FeaturedPost with FeaturedCarousel */}
        <div className="mb-16">
          <FeaturedCarousel />
        </div>

        {/* Recommended Posts Section */}
        <section className="mb-16">
          <SectionTitle title="Recommended Posts" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {recommendedBlogs.map(blog => (
              <BlogCard key={blog.id} blog={blog} />
            ))}
          </div>
        </section>

        {/* Latest Posts Section */}
        <section className="mb-16">
          <SectionTitle title="Latest Posts" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {latestBlogs.map(blog => (
              <BlogCard key={blog.id} blog={blog} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Home;