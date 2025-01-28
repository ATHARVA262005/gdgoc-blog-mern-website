import React, { useEffect, useState } from 'react';
import { useAdmin } from '../../contexts/AdminContext';
import { Trash2, AlertCircle, User } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const AllComments = () => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { adminAxios, adminToken } = useAdmin();

  const fetchComments = async () => {
    try {
      setError(null);
      if (!adminToken) {
        throw new Error('No admin token available');
      }
      
      const response = await adminAxios.get('/admin/comments');
      if (response.data.success) {
        setComments(response.data.comments || []);
      } else {
        throw new Error(response.data.message || 'Failed to fetch comments');
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
      setError(error.response?.data?.message || 'Failed to load comments. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (commentId, blogId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) {
      return;
    }

    try {
      const response = await adminAxios.delete(`/admin/comments/${commentId}`, {
        data: { blogId }
      });
      
      if (response.data.success) {
        setComments(prevComments => 
          prevComments.filter(comment => comment._id !== commentId)
        );
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
      alert('Failed to delete comment. Please try again.');
    }
  };

  useEffect(() => {
    if (adminToken) {
      fetchComments();
    }
  }, [adminToken]);

  if (loading) {
    return (
      <div className="p-4 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-500 flex items-center gap-2">
        <AlertCircle size={20} />
        <span>{error}</span>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">All Comments</h1>
      
      {comments.length === 0 ? (
        <div className="flex items-center gap-2 text-gray-500">
          <AlertCircle size={20} />
          <span>No comments found</span>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment._id} className="bg-white p-4 rounded-lg shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    {comment.user.profileImage ? (
                      <img 
                        src={comment.user.profileImage} 
                        alt={comment.user.name} 
                        className="w-8 h-8 rounded-full"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                        <User size={16} />
                      </div>
                    )}
                    <div>
                      <div className="font-medium">{comment.user.name}</div>
                      <div className="text-sm text-gray-500">
                        {formatDistanceToNow(new Date(comment.createdAt))} ago
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 text-sm text-gray-700">
                    <p>{comment.content}</p>
                  </div>
                  <div className="mt-1 text-xs text-gray-500">
                    On blog: {comment.blog.title}
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(comment._id, comment.blog._id)}
                  className="text-red-500 hover:text-red-700 p-1"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AllComments;

