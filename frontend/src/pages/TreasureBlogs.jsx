import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ThumbsUp, MessageCircle, Bookmark, Library, ChevronLeft, ChevronRight, Search, ArrowUpDown } from 'lucide-react';

// Generate more sample blogs for pagination
const allBlogs = Array.from({ length: 24 }, (_, i) => ({
  id: i + 1,
  title: `Blog Post ${i + 1}`,
  excerpt: "This is a sample blog post excerpt that demonstrates the layout and design of our blog cards...",
  author: "John Doe",
  authorImage: "https://placehold.co/100x100",
  date: "Jan 15, 2025",
  likes: Math.floor(Math.random() * 1000) + 100,
  comments: Math.floor(Math.random() * 100) + 10,
  category: ["Development", "AI", "Design", "DevOps"][Math.floor(Math.random() * 4)],
  image: "https://placehold.co/600x400"
}));

const ITEMS_PER_PAGE = 9;

// Add categories array
const categories = ["All", "Development", "AI", "Design", "DevOps"];

// Add sorting options
const sortOptions = [
  { label: 'Newest First', value: 'newest' },
  { label: 'Oldest First', value: 'oldest' },
  { label: 'Most Liked', value: 'likes' },
  { label: 'Most Commented', value: 'comments' }
];

const TreasureBlogs = () => {
  const [searchParams] = useSearchParams();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('newest');

  // Set initial search query from URL params
  useEffect(() => {
    const searchFromUrl = searchParams.get('search');
    if (searchFromUrl) {
      setSearchQuery(searchFromUrl);
    }
  }, [searchParams]);

  // Filter and sort blogs
  const filteredBlogs = allBlogs.filter(blog => {
    const matchesSearch = blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         blog.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || blog.category === selectedCategory;
    return matchesSearch && matchesCategory;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'oldest':
        return new Date(a.date) - new Date(b.date);
      case 'likes':
        return b.likes - a.likes;
      case 'comments':
        return b.comments - a.comments;
      default: // newest
        return new Date(b.date) - new Date(a.date);
    }
  });

  const totalPages = Math.ceil(filteredBlogs.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentBlogs = filteredBlogs.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-8 py-12">
        <div className="flex items-center gap-3 mb-8">
          <Library className="text-blue-600" size={32} />
          <h1 className="text-3xl font-bold">Blog Treasure</h1>
        </div>
        
        {/* Search and Filter Section */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Bar */}
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search blogs..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1); // Reset to first page on search
                }}
                className="w-full px-4 py-2 pl-10 pr-4 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            </div>

            {/* Sort Dropdown */}
            <div className="relative min-w-[200px]">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-2 pr-10 appearance-none rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none cursor-pointer"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <ArrowUpDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex gap-2 flex-wrap">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => {
                  setSelectedCategory(category);
                  setCurrentPage(1); // Reset to first page on filter change
                }}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Blog Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
          {currentBlogs.map(blog => (
            <div key={blog.id} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300">
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
          ))}
        </div>

        {/* Show message if no results */}
        {currentBlogs.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No blogs found matching your criteria</p>
          </div>
        )}

        {/* Pagination */}
        {filteredBlogs.length > ITEMS_PER_PAGE && (
          <div className="flex items-center justify-center gap-4">
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:hover:bg-transparent"
            >
              <ChevronLeft size={20} />
            </button>
            
            <div className="flex items-center gap-2">
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-8 h-8 rounded-lg transition-colors ${
                    currentPage === i + 1 
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
              className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:hover:bg-transparent"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TreasureBlogs;
