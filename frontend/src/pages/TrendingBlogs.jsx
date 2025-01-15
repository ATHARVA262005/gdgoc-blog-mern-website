import React from 'react';
import { ThumbsUp, MessageCircle, Bookmark, TrendingUp } from 'lucide-react';

// Simulating most engaged posts sorted by total engagement (likes + comments)
const trendingBlogs = [
  {
    id: 1,
    title: "The Complete Guide to Web3 Development",
    excerpt: "Deep dive into blockchain, smart contracts, and decentralized applications...",
    author: "Alex Thompson",
    authorImage: "https://placehold.co/100x100",
    date: "Jan 15, 2025",
    likes: 2892,
    comments: 456,
    category: "Blockchain",
    image: "https://placehold.co/600x400"
  },
  {
    id: 2,
    title: "Machine Learning: 2025 Trends",
    excerpt: "Exploring the latest breakthroughs in AI and machine learning technologies...",
    author: "Maria Garcia",
    authorImage: "https://placehold.co/100x100",
    date: "Jan 14, 2025",
    likes: 2154,
    comments: 398,
    category: "AI",
    image: "https://placehold.co/600x400"
  },
  {
    id: 3,
    title: "10 Must-Know JavaScript Features",
    excerpt: "Latest JavaScript features that every developer should master in 2025...",
    author: "David Kim",
    authorImage: "https://placehold.co/100x100",
    date: "Jan 13, 2025",
    likes: 1823,
    comments: 287,
    category: "JavaScript",
    image: "https://placehold.co/600x400"
  },
  {
    id: 4,
    title: "Understanding Docker and Kubernetes",
    excerpt: "A comprehensive guide to containerization and orchestration...",
    author: "Emily Chen",
    authorImage: "https://placehold.co/100x100",
    date: "Jan 12, 2025",
    likes: 1654,
    comments: 234,
    category: "DevOps",
    image: "https://placehold.co/600x400"
  },
  {
    id: 5,
    title: "The Future of Frontend Development",
    excerpt: "Exploring upcoming trends and technologies in frontend development...",
    author: "James Wilson",
    authorImage: "https://placehold.co/100x100",
    date: "Jan 11, 2025",
    likes: 1432,
    comments: 198,
    category: "Frontend",
    image: "https://placehold.co/600x400"
  },
  {
    id: 6,
    title: "Mastering System Design",
    excerpt: "Learn how to design scalable systems for enterprise applications...",
    author: "Sarah Lee",
    authorImage: "https://placehold.co/100x100",
    date: "Jan 10, 2025",
    likes: 1298,
    comments: 167,
    category: "Architecture",
    image: "https://placehold.co/600x400"
  }
];

const TrendingBlogs = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-8 py-12">
        <div className="flex items-center gap-3 mb-8">
          <TrendingUp className="text-blue-600" size={32} />
          <h1 className="text-3xl font-bold">Most Popular Posts</h1>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {trendingBlogs.map(blog => (
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
                      <span>{blog.likes.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageCircle size={16} />
                      <span>{blog.comments.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TrendingBlogs;
