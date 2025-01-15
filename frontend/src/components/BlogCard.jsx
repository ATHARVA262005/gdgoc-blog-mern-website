import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ThumbsUp, MessageCircle, Bookmark } from 'lucide-react';

const BlogCard = ({ blog }) => {
  const navigate = useNavigate();

  return (
    <div 
      className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300 cursor-pointer"
      onClick={() => navigate(`/blog/${blog.id}`)}
    >
      {/* ...existing BlogCard content... */}
    </div>
  );
};

export default BlogCard;
