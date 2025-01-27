import React from 'react';
import { ThumbsUp, MessageCircle, Bookmark, BookmarkCheck, Clock } from 'lucide-react';
import gdgLogo from '/images/profile_administrator.webp';

const BlogCard = ({ 
  blog: {
    title,
    content,
    featuredImage,
    category,
    author,  // Now this is an object with id and username
    createdAt,
    stats = { likeCount: 0, commentCount: 0 }
  },
  isLiked = false,
  isBookmarked = false,
  onLike,
  onBookmark,
  onClick
}) => {
  // Destructure with defaults for better error handling
  const { likeCount = 0, commentCount = 0 } = stats;

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
        <div className="absolute top-4 left-4">
          <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-600 text-white">
            {category}
          </span>
        </div>
      </div>

      <div className="p-5">
        {/* Title */}
        <h3 className="font-bold text-xl mb-3 text-gray-900 line-clamp-2">
          {title}
        </h3>

        {/* Content Preview */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {content}
        </p>

        {/* Author & Stats */}
        <div className="flex items-center justify-between">
          {/* Author Info */}
          <div className="flex items-center gap-3">
            <img 
              src={gdgLogo}
              alt={author?.username || 'GDG Admin'} 
              className="w-10 h-10 rounded-full border-2 border-gray-100" 
            />
            <div>
              <p className="font-semibold text-sm text-gray-900">
                {author?.username || 'GDG Admin'}
              </p>
              <div className="flex items-center text-xs text-gray-500 gap-2">
                <Clock className="w-3 h-3" />
                <span>{new Date(createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Interaction Stats */}
          <div className="flex items-center gap-4 text-gray-500">
            <button
              onClick={onLike}
              className={`flex items-center gap-1 transition-colors
                ${isLiked ? 'text-blue-600' : 'hover:text-blue-600'}`}
            >
              <ThumbsUp className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
              <span className="text-sm">{likeCount}</span>
            </button>

            <button
              onClick={onBookmark}
              className={`transition-colors
                ${isBookmarked ? 'text-blue-600' : 'hover:text-blue-600'}`}
            >
              {isBookmarked ? (
                <BookmarkCheck className="w-4 h-4" />
              ) : (
                <Bookmark className="w-4 h-4" />
              )}
            </button>

            <div className="flex items-center gap-1">
              <MessageCircle className="w-4 h-4" />

              <span className="text-sm">{commentCount}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogCard;

