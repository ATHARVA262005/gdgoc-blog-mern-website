import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ThumbsUp, MessageCircle, Bookmark, Share2, Clock, Send, ArrowLeft, Check } from 'lucide-react';

// This would typically come from an API call using the ID
const blog = {
  id: 1,
  title: "Getting Started with React Hooks",
  content: `
    <p class="mb-4">React Hooks have revolutionized how we write React components. In this comprehensive guide, we'll explore the most important hooks and their use cases.</p>
    
    <h2 class="text-2xl font-bold mt-8 mb-4">Understanding useState</h2>
    <p class="mb-4">The useState hook is the foundation of state management in functional components. It provides a simple way to declare state variables and their updating functions.</p>
    
    <h2 class="text-2xl font-bold mt-8 mb-4">useEffect and Side Effects</h2>
    <p class="mb-4">useEffect is crucial for handling side effects in your components. It replaces lifecycle methods like componentDidMount and componentDidUpdate from class components.</p>
    
    <h2 class="text-2xl font-bold mt-8 mb-4">Custom Hooks</h2>
    <p class="mb-4">Creating custom hooks allows you to extract component logic into reusable functions. This promotes code reuse and keeps your components clean.</p>
  `,
  author: "Sarah Johnson",
  authorImage: "https://placehold.co/100x100",
  date: "Jan 15, 2025",
  readTime: "8 min read",
  likes: 234,
  comments: 45,
  category: "Development",
  image: "https://placehold.co/1200x600",
  tags: ["React", "JavaScript", "Web Development", "Programming"]
};

// Add mock comments data
const mockComments = [
  {
    id: 1,
    user: "Alex Thompson",
    userImage: "https://placehold.co/100x100",
    content: "Great article! I especially liked the section about useEffect dependencies.",
    date: "2 days ago",
    likes: 12,
    isLiked: false
  },
  {
    id: 2,
    user: "Emma Wilson",
    userImage: "https://placehold.co/100x100",
    content: "This helped me understand hooks much better. Thanks for sharing!",
    date: "1 day ago",
    likes: 8,
    isLiked: true
  }
];

const SingleBlog = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [comments, setComments] = useState(mockComments);
  const [newComment, setNewComment] = useState('');
  const [showCopyTooltip, setShowCopyTooltip] = useState(false);

  useEffect(() => {
    let timer;
    if (showCopyTooltip) {
      timer = setTimeout(() => {
        setShowCopyTooltip(false);
      }, 2000); // Hide tooltip after 2 seconds
    }
    return () => clearTimeout(timer);
  }, [showCopyTooltip]);

  const handleAddComment = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const comment = {
      id: comments.length + 1,
      user: "Current User", // This would come from auth context
      userImage: "https://placehold.co/100x100",
      content: newComment,
      date: "Just now",
      likes: 0,
      isLiked: false
    };

    setComments([comment, ...comments]);
    setNewComment('');
  };

  const handleLikeComment = (commentId) => {
    setComments(comments.map(comment => {
      if (comment.id === commentId) {
        return {
          ...comment,
          likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1,
          isLiked: !comment.isLiked
        };
      }
      return comment;
    }));
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setShowCopyTooltip(true);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <article className="max-w-4xl mx-auto px-4">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-blue-600 mb-8 group transition-colors"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span>Back</span>
        </button>

        {/* Header */}
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-4">{blog.title}</h1>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <img 
                src={blog.authorImage} 
                alt={blog.author} 
                className="w-12 h-12 rounded-full"
              />
              <div>
                <p className="font-medium">{blog.author}</p>
                <div className="flex items-center gap-3 text-sm text-gray-500">
                  <span>{blog.date}</span>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <Clock size={14} />
                    <span>{blog.readTime}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <button 
                  onClick={handleShare}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  {showCopyTooltip ? (
                    <Check size={20} className="text-green-600" />
                  ) : (
                    <Share2 size={20} />
                  )}
                </button>
                {showCopyTooltip && (
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-gray-900 text-white text-sm rounded-lg whitespace-nowrap">
                    Link copied to clipboard!
                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
                  </div>
                )}
              </div>
              <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <Bookmark size={20} />
              </button>
            </div>
          </div>
        </header>

        {/* Featured Image */}
        <img 
          src={blog.image} 
          alt={blog.title}
          className="w-full h-[400px] object-cover rounded-xl mb-8"
        />

        {/* Content */}
        <div 
          className="prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: blog.content }}
        />

        {/* Footer */}
        <footer className="mt-12 pt-6 border-t">
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              {blog.tags.map(tag => (
                <span 
                  key={tag} 
                  className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
            <div className="flex items-center gap-6">
              <button className="flex items-center gap-2 text-gray-600">
                <ThumbsUp size={20} />
                <span>{blog.likes}</span>
              </button>
              <button className="flex items-center gap-2 text-gray-600">
                <MessageCircle size={20} />
                <span>{blog.comments}</span>
              </button>
            </div>
          </div>
        </footer>

        {/* Comments Section */}
        <section className="mt-16">
          <h2 className="text-2xl font-bold mb-8">Comments ({comments.length})</h2>
          
          {/* Add Comment Form */}
          <form onSubmit={handleAddComment} className="mb-8">
            <div className="flex gap-4">
              <img 
                src="https://placehold.co/100x100" 
                alt="Current user" 
                className="w-10 h-10 rounded-full"
              />
              <div className="flex-1">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  rows="3"
                />
                <div className="flex justify-end mt-2">
                  <button
                    type="submit"
                    disabled={!newComment.trim()}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Send size={16} />
                    Post Comment
                  </button>
                </div>
              </div>
            </div>
          </form>

          {/* Comments List */}
          <div className="space-y-6">
            {comments.map(comment => (
              <div key={comment.id} className="flex gap-4 p-4 bg-white rounded-xl shadow-sm">
                <img 
                  src={comment.userImage} 
                  alt={comment.user} 
                  className="w-10 h-10 rounded-full"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h3 className="font-medium">{comment.user}</h3>
                      <p className="text-sm text-gray-500">{comment.date}</p>
                    </div>
                    <button 
                      onClick={() => handleLikeComment(comment.id)}
                      className={`flex items-center gap-1 ${
                        comment.isLiked ? 'text-blue-600' : 'text-gray-500'
                      } hover:text-blue-600 transition-colors`}
                    >
                      <ThumbsUp size={16} className={comment.isLiked ? 'fill-current' : ''} />
                      <span>{comment.likes}</span>
                    </button>
                  </div>
                  <p className="text-gray-600">{comment.content}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </article>
    </div>
  );
};

export default SingleBlog;
