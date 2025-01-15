import React from 'react';
import { ThumbsUp, MessageCircle, Bookmark, Clock } from 'lucide-react';

const recentBlogs = [
  {
    id: 1,
    title: "Getting Started with React Hooks",
    excerpt: "Learn how to use React Hooks to manage state and side effects in your functional components...",
    author: "Sarah Johnson",
    authorImage: "https://placehold.co/100x100",
    date: "Jan 15, 2025",
    visitedAt: "2 minutes ago",
    likes: 234,
    comments: 45,
    category: "Development",
    image: "https://placehold.co/600x400"
  },
  {
    id: 2,
    title: "The Future of AI in 2025",
    excerpt: "Exploring the latest breakthroughs in AI and machine learning technologies...",
    author: "Maria Garcia",
    authorImage: "https://placehold.co/100x100",
    date: "Jan 14, 2025",
    visitedAt: "1 hour ago",
    likes: 189,
    comments: 32,
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
    visitedAt: "3 hours ago",
    likes: 156,
    comments: 28,
    category: "JavaScript",
    image: "https://placehold.co/600x400"
  }
];

const RecentBlogs = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-8 py-12">
        <div className="flex items-center gap-3 mb-8">
          <Clock className="text-blue-600" size={32} />
          <h1 className="text-3xl font-bold">Recently Visited</h1>
        </div>
        
        <div className="space-y-6">
          {recentBlogs.map(blog => (
            <div key={blog.id} 
              className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300">
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
      </div>
    </div>
  );
};

export default RecentBlogs;
