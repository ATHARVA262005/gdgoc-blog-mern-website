import React from 'react';
import { ThumbsUp, MessageCircle, Bookmark } from 'lucide-react';

// This would typically come from a context or state management system
const bookmarkedBlogs = [
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
    excerpt: "Exploring the latest advancements in artificial intelligence and what they mean for developers...",
    author: "Michael Chen",
    authorImage: "https://placehold.co/100x100",
    date: "Jan 14, 2025",
    likes: 189,
    comments: 32,
    category: "Technology",
    image: "https://placehold.co/600x400"
  },
  {
    id: 3,
    title: "Building Responsive Layouts with Tailwind CSS",
    excerpt: "A comprehensive guide to creating beautiful, responsive layouts using Tailwind CSS utilities...",
    author: "Emma Wilson",
    authorImage: "https://placehold.co/100x100",
    date: "Jan 13, 2025",
    likes: 156,
    comments: 28,
    category: "Design",
    image: "https://placehold.co/600x400"
  }
];

const BookmarkBlogs = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-8 py-12">
        <h1 className="text-3xl font-bold mb-8">Your Bookmarks</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {bookmarkedBlogs.map(blog => (
            <div key={blog.id} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300">
              <div className="relative h-48 overflow-hidden">
                <img src={blog.image} alt={blog.title} className="w-full h-full object-cover transition-transform duration-500 hover:scale-110" />
                <button className="absolute top-4 right-4 p-2 bg-blue-500 backdrop-blur-sm rounded-full hover:bg-blue-600 transition-colors">
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
      </div>
    </div>
  );
};

export default BookmarkBlogs;
