import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ThumbsUp, MessageCircle, Bookmark, Share2, Clock, Send, ArrowLeft, Check, BookmarkCheck, Copy } from 'lucide-react';  // Add Copy to imports
import axios from 'axios';
import { toggleBookmark, getBookmarkStatus, toggleLike, addComment } from '../services/blogService';
import Toast from '../components/Toast';
import { addToRecentlyViewed } from '../utils/recentlyViewed';
import { useAuth } from '../contexts/AuthContext';  // Add this import

const DEFAULT_PROFILE_IMAGE = "/images/profile_administrator.webp";

const SingleBlog = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth(); // Add currentUser from auth context
  const [blog, setBlog] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [showCopyTooltip, setShowCopyTooltip] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [isLiked, setIsLiked] = useState(false);
  const [commentInput, setCommentInput] = useState('');
  const [copiedCode, setCopiedCode] = useState(null);

  // Fetch blog data
  useEffect(() => {
    const fetchBlog = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/blogs/${id}`,
          {
            headers: token ? { Authorization: `Bearer ${token}` } : {}
          }
        );
        if (response.data.success) {
          setBlog(response.data.blog);
          setIsLiked(response.data.blog.isLiked);
          if (response.data.blog.comments) {
            setComments(response.data.blog.comments);
          }
        }
      } catch (err) {
        setError('Failed to fetch blog. Please try again later.');
        console.error('Error fetching blog:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [id]);

  useEffect(() => {
    if (blog?._id) {
      addToRecentlyViewed(blog._id);
    }
  }, [blog]);

  // Track view
  useEffect(() => {
    const trackView = async () => {
      if (blog && blog._id) {
        try {
          await axios.post(`${import.meta.env.VITE_API_URL}/blogs/${blog._id}/view`, {
            sessionId: localStorage.getItem('sessionId') || Date.now().toString(),
            deviceType: window.innerWidth < 768 ? 'mobile' : 'desktop',
            // Add more tracking data as needed
          });
        } catch (err) {
          console.error('Error tracking view:', err);
        }
      }
    };

    trackView();
  }, [blog]);

  useEffect(() => {
    let timer;
    if (showCopyTooltip) {
      timer = setTimeout(() => {
        setShowCopyTooltip(false);
      }, 2000); // Hide tooltip after 2 seconds
    }
    return () => clearTimeout(timer);
  }, [showCopyTooltip]);

  // Add effect to check bookmark status on load
  useEffect(() => {
    const checkBookmarkStatus = async () => {
      if (blog?._id && localStorage.getItem('token')) {
        try {
          const response = await getBookmarkStatus(blog._id);
          if (response.success) {
            setIsBookmarked(response.isBookmarked);
          }
        } catch (err) {
          console.error('Error checking bookmark status:', err);
          // Optionally show toast for error
          showToast('Failed to check bookmark status', 'error');
        }
      }
    };

    checkBookmarkStatus();
  }, [blog?._id]);

  // Add effect to process code blocks after content load
  useEffect(() => {
    if (blog) {
      const processCodeBlocks = () => {
        const content = document.querySelector('.blog-content');
        if (!content) return;

        const codeBlocks = content.querySelectorAll('pre');
        codeBlocks.forEach((block) => {
          // Add wrapper div if not already wrapped
          if (!block.parentElement.classList.contains('relative')) {
            const wrapper = document.createElement('div');
            wrapper.className = 'relative group';
            block.parentNode.insertBefore(wrapper, block);
            wrapper.appendChild(block);

            // Style the pre block
            block.className = 'bg-gray-900 rounded-lg text-gray-300 p-4 my-4 overflow-x-auto';

            // Add copy button if it doesn't exist
            if (!wrapper.querySelector('.copy-button')) {
              const copyButton = document.createElement('button');
              copyButton.className = 
                'copy-button absolute top-2 right-2 p-2 rounded-lg bg-gray-700 text-gray-300 opacity-0 group-hover:opacity-100 hover:bg-gray-600 transition-all duration-200';
              copyButton.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
              `;

              // Add click handler
              copyButton.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const code = block.querySelector('code')?.textContent || block.textContent;
                handleCopyCode(code);
              });

              wrapper.appendChild(copyButton);
            }

            // Style code element if it exists
            const codeElement = block.querySelector('code');
            if (codeElement) {
              codeElement.className = 'text-white text-sm font-mono';
            }
          }
        });
      };

      // Process code blocks after a short delay to ensure content is rendered
      setTimeout(processCodeBlocks, 100);
    }
  }, [blog]);

  // Only add auth header for protected operations
  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentInput.trim()) return;

    const token = localStorage.getItem('token');
    if (!token) {
      showToast('Please login to comment', 'error');
      navigate('/login');
      return;
    }

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/blogs/${id}/comments`,
        { content: commentInput },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        setComments(prev => [response.data.comment, ...prev]);
        setCommentInput('');
        showToast('Comment added successfully');
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      showToast('Failed to add comment', 'error');
    }
  };

  // Update the handleLikeComment function
  const handleLikeComment = async (commentId) => {
    const token = localStorage.getItem('token');
    if (!token) {
      showToast('Please login to like comments', 'error');
      navigate('/login');
      return;
    }

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/blogs/comments/${commentId}/like`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        setComments(prev => prev.map(comment => {
          if (comment._id === commentId) {
            return {
              ...comment,
              isLiked: response.data.isLiked,
              likeCount: response.data.likeCount
            };
          }
          return comment;
        }));
      }
    } catch (error) {
      console.error('Error liking comment:', error);
      showToast('Failed to like comment', 'error');
    }
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setShowCopyTooltip(true);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  // Update handleBookmark function
  const handleBookmark = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      showToast('Please login to bookmark posts', 'error');
      navigate('/login');
      return;
    }
    try {
      const response = await toggleBookmark(blog._id);
      if (response.success) {
        setIsBookmarked(response.isBookmarked);
        showToast(response.message);
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to update bookmark';
      console.error('Error toggling bookmark:', err);
      showToast(errorMessage, 'error');
    }
  };

  // Add handleLike function
  const handleLike = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      showToast('Please login to like posts', 'error');
      navigate('/login');
      return;
    }
    try {
      const response = await toggleLike(blog._id);
      if (response.success) {
        setIsLiked(response.isLiked);
        setBlog(prev => ({
          ...prev,
          stats: {
            ...prev.stats,
            likeCount: response.likeCount
          }
        }));
        showToast(response.message);
      }
    } catch (err) {
      console.error('Error toggling like:', err);
      showToast('Failed to update like', 'error');
    }
  };

  // Add function to handle username click
  const handleUserClick = (userId) => {
    navigate(`/profile/${userId}`);
  };

  // Add copy code function
  const handleCopyCode = async (code) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      showToast('Code copied to clipboard!', 'success');
      setTimeout(() => setCopiedCode(null), 3000);
    } catch (err) {
      console.error('Failed to copy:', err);
      showToast('Failed to copy code', 'error');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading blog...</p>
        </div>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center text-red-600">
          <p>{error || 'Blog not found'}</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 text-blue-600 hover:underline"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-gray-50 py-12">
      {/* Add Toast component */}
      {toast.show && (
        <Toast 
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ show: false, message: '', type: 'success' })}
        />
      )}

      <article className="max-w-4xl mx-auto px-4">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-blue-600 mb-8 group transition-colors"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span>Back</span>
        </button>

        {/* Blog Content */}
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-4">{blog.title}</h1>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <img 
                src={blog.author?.avatar || DEFAULT_PROFILE_IMAGE} 
                alt={blog.author?.username} 
                className="w-12 h-12 rounded-full object-cover"
              />
              <div>
                <p className="font-medium">{blog.author?.username}</p>
                <div className="flex items-center gap-3 text-sm text-gray-500">
                  <span>{new Date(blog.createdAt).toLocaleDateString()}</span>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <Clock size={14} />
                    <span>{Math.ceil(blog.content.length / 1000)} min read</span>
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
              <div className="relative">
                <button 
                  onClick={handleBookmark} 
                  className={`p-2 hover:bg-gray-100 rounded-full transition-colors ${
                    isBookmarked ? 'text-blue-600' : 'text-gray-600'
                  }`}
                >
                  {isBookmarked ? (
                    <BookmarkCheck
                      size={20}
                      className="transition-all duration-300 transform scale-110"
                    />
                  ) : (
                    <Bookmark
                      size={20}
                      className="transition-all duration-300 transform scale-100"
                    />
                  )}
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Featured Image */}
        <img 
          src={blog.featuredImage} 
          alt={blog.title}
          className="w-full h-[400px] object-cover rounded-xl mb-8"
        />

        {/* Content */}
        <div 
          className="prose prose-lg max-w-none blog-content 
            prose-pre:p-0 prose-pre:m-0 prose-pre:bg-transparent"
          dangerouslySetInnerHTML={{ __html: blog.content }}
        />

        {/* Footer */}
        <footer className="mt-12 pt-6 border-t">
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              {blog.tags && blog.tags.map(tag => (
                <span 
                  key={tag} 
                  className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
            <div className="flex items-center gap-6">
              <div className="relative">
                <button 
                  onClick={handleLike}
                  className={`flex items-center gap-2 ${
                    isLiked ? 'text-blue-600' : 'text-gray-600'
                  } hover:text-blue-600 transition-colors`}
                >
                  <ThumbsUp 
                    size={20} 
                    className={isLiked ? 'fill-current' : ''}
                  />
                  <span>{blog.stats?.likeCount || 0}</span>
                </button>
              </div>
              <button className="flex items-center gap-2 text-gray-600">
                <MessageCircle size={20} />
                <span>{blog.stats?.commentCount || 0}</span>
              </button>
            </div>
          </div>
        </footer>

        {/* Comments Section */}
        <section className="mt-16">
          <h2 className="text-2xl font-bold mb-8">Comments ({comments.length})</h2>
          
          {/* Add Comment Form */}
          <form onSubmit={handleAddComment} className="mb-8">
            <div className="flex-1">
              <textarea
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                placeholder={currentUser ? "Add a comment..." : "Please login to comment"}
                disabled={!currentUser}
                className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                rows="3"
              />
              <div className="flex justify-end mt-2">
                <button
                  type="submit"
                  disabled={!commentInput.trim() || !currentUser}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send size={16} />
                  {currentUser ? 'Post Comment' : 'Login to Comment'}
                </button>
              </div>
            </div>
          </form>

          {/* Comments List */}
          <div className="space-y-6">
            {[...comments].reverse().map(comment => (
              <div key={comment._id} className="flex gap-4 p-4 bg-white rounded-xl shadow-sm">
                <div 
                  className="cursor-pointer"
                  onClick={() => comment.user?._id && handleUserClick(comment.user._id)}
                >
                  <img 
                    src={comment.user?.profileImage || DEFAULT_PROFILE_IMAGE}
                    alt={comment.user?.username || 'User'} 
                    className="w-10 h-10 rounded-full object-cover hover:ring-2 hover:ring-blue-500 transition-all"
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      {comment.user?._id ? (
                        <button
                          onClick={() => handleUserClick(comment.user._id)}
                          className="font-medium hover:text-blue-600 transition-colors"
                        >
                          {comment.user.username}
                        </button>
                      ) : (
                        <span className="font-medium text-gray-500">Deleted User</span>
                      )}
                      <p className="text-xs text-gray-400">
                        {new Date(comment.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <button 
                      onClick={() => handleLikeComment(comment._id)}
                      className={`flex items-center gap-1 ${
                        comment.isLiked ? 'text-blue-600' : 'text-gray-500'
                      } hover:text-blue-600 transition-colors`}
                    >
                      <ThumbsUp 
                        size={16} 
                        className={comment.isLiked ? 'fill-current' : ''} 
                      />
                      <span>{comment.likeCount}</span>
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
