import React from 'react';
import { ThumbsUp, MessageCircle, Bookmark, BookmarkCheck, Clock } from 'lucide-react';
import gdgLogo from '/images/profile_administrator.webp';
import useAdmin from '../hooks/useAdmin';

const stripHtmlTags = (html) => {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, '');
};

const BlogCard = ({ 
  blog: {
    title,
    content,
    featuredImage,
    category,
    author,
    createdAt,
    stats = { likeCount: 0, commentCount: 0 }
  },
  isLiked = false,
  isBookmarked = false,
  onLike,
  onBookmark,
  onClick
}) => {
  const { likeCount = 0, commentCount = 0 } = stats;
  const cleanContent = stripHtmlTags(content);
  
  // Fetch admin details using the author._id
  const { admin, loading } = useAdmin(author?._id);
  const authorName = loading ? 'Loading...' : admin?.username || 'GDG Admin';
  
  return (
    
    <div 
      onClick={onClick}
      className="bg-white border border-gray-100 rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer"
    >
      

      {/* Featured Image */}
      <div className="relative aspect-[16/9] overflow-hidden">
        <img 
          src={featuredImage} 
          alt={title} 
          className="w-full h-full object-cover" 
        />
        {/* Category Badge */}
        <div className="absolute top-2 sm:top-4 left-2 sm:left-4">
          <span className="px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-blue-600 text-white">
            {category}
          </span>
        </div>
      </div>

      <div className="p-3 sm:p-5">
        {/* Title */}
        <h3 className="font-bold text-lg sm:text-xl mb-2 sm:mb-3 text-gray-900 line-clamp-2">
          {title}
        </h3>

        {/* Content Preview */}
        <p className="text-gray-600 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2">
          {cleanContent}
        </p>

        {/* Author & Stats */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          {/* Author Info */}
          <div className="flex items-center gap-2 sm:gap-3">
            <img 
              src={gdgLogo}
              alt={authorName || 'GDG Admin'} 
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-gray-100" 
            />
            <div>
              <p className="font-semibold text-xs sm:text-sm text-gray-900">
              {authorName}
              </p>
              <div className="flex items-center text-[10px] sm:text-xs text-gray-500 gap-1 sm:gap-2">
                <Clock className="w-3 h-3" />
                <span>{new Date(createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Interaction Stats */}
          <div className="flex items-center gap-2 sm:gap-4 text-gray-500">
            <button
              onClick={(e) => onLike(e)}
              className={`flex items-center gap-1 transition-colors
                ${isLiked ? 'text-blue-600' : 'hover:text-blue-600'}`}
            >
              <ThumbsUp className={`w-3 h-3 sm:w-4 sm:h-4 ${isLiked ? 'fill-current' : ''}`} />
              <span className="text-xs sm:text-sm">{likeCount}</span>
            </button>

            <button
              onClick={(e) => onBookmark(e)}
              className={`transition-colors
                ${isBookmarked ? 'text-blue-600' : 'hover:text-blue-600'}`}
            >
              {isBookmarked ? (
                <BookmarkCheck className="w-3 h-3 sm:w-4 sm:h-4" />
              ) : (
                <Bookmark className="w-3 h-3 sm:w-4 sm:h-4" />
              )}
            </button>

            <div className="flex items-center gap-1">
              <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="text-xs sm:text-sm">{commentCount}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogCard;

