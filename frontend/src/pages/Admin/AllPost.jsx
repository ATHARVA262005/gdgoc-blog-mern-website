import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Edit, Trash2, Search, Filter, Plus } from 'lucide-react';

const AllPost = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all'); // all, published, draft
  const [error, setError] = useState('');

  // Updated fetch function with proper error handling
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const adminToken = localStorage.getItem('adminToken');
        if (!adminToken) {
          setError('No admin token found');
          setLoading(false);
          return;
        }

        const response = await fetch(`${import.meta.env.VITE_API_URL}/blogs/admin/blogs`, {
          headers: {
            'Authorization': `Bearer ${adminToken}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch posts');
        }

        const data = await response.json();
        
        if (data.success) {
          setPosts(data.blogs || []);
        } else {
          throw new Error(data.message || 'Failed to fetch posts');
        }
      } catch (err) {
        console.error('Error fetching posts:', err);
        setError(err.message || 'Failed to fetch posts');
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  // Update handleFeaturePost function
  const handleFeaturePost = async (postId) => {
    try {
      const post = posts.find(p => p._id === postId);
      const adminToken = localStorage.getItem('adminToken');
      
      console.log('Attempting to toggle feature for post:', postId);
      console.log('Current feature status:', post.isFeatured);

      const response = await fetch(`${import.meta.env.VITE_API_URL}/blogs/${postId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({
          isFeatured: !post.isFeatured
        })
      });

      const data = await response.json();
      console.log('Server response:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update post');
      }

      if (data.success) {
        // Update local state
        setPosts(currentPosts => 
          currentPosts.map(p => 
            p._id === postId ? { ...p, isFeatured: !p.isFeatured } : p
          )
        );
      }
    } catch (err) {
      console.error('Error toggling feature status:', err);
      setError('Failed to update featured status');
    }
  };

  // Update handleDelete function
  const handleDelete = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    
    try {
      const adminToken = localStorage.getItem('adminToken');
      console.log('Deleting post:', postId);
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/blogs/${postId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      console.log('Delete response:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete post');
      }

      if (data.success) {
        setPosts(currentPosts => currentPosts.filter(post => post._id !== postId));
        // Show success message
        setError('Post deleted successfully');
        setTimeout(() => setError(''), 3000);
      }
    } catch (err) {
      console.error('Delete error:', err);
      setError(err.message || 'Failed to delete post');
    }
  };

  // Filter posts based on search and filter
  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || post.status === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8 mb-8 lg:mb-0">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">All Posts</h1>
          <button
            onClick={() => navigate('/admin/new-blog')}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus size={18} />
            New Post
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm mb-6">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search posts..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Drafts</option>
            </select>
          </div>
        </div>

        {/* Responsive Table/Card View */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {/* Desktop Table View */}
          <div className="hidden sm:block">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Views</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPosts.map(post => (
                  <tr key={post._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-gray-900">{post.title}</div>
                      <div className="text-xs text-gray-500">{post.category}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        post.status === 'published'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {post.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {post.views?.total || 0}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleFeaturePost(post._id)}
                          className={`p-1 rounded hover:bg-gray-100 transition-colors ${
                            post.isFeatured ? 'text-yellow-500' : 'text-gray-400'
                          }`}
                          title={post.isFeatured ? "Remove from featured" : "Mark as featured"}
                        >
                          <Star 
                            size={18} 
                            className={`transition-all ${post.isFeatured ? "fill-current" : ""}`}
                          />
                        </button>
                        <button
                          onClick={() => navigate(`/admin/edit-blog/${post._id}`)}
                          className="p-1 hover:bg-gray-100 rounded text-blue-600"
                          title="Edit post"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(post._id)}
                          className="p-1 hover:bg-gray-100 rounded text-red-600"
                          title="Delete post"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="sm:hidden divide-y divide-gray-200">
            {filteredPosts.map(post => (
              <div key={post._id} className="p-4 hover:bg-gray-50">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-gray-900">{post.title}</h3>
                    <p className="text-xs text-gray-500 mt-1">{post.category}</p>
                  </div>
                  <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                    post.status === 'published'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {post.status}
                  </span>
                </div>
                
                <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                  <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                  <span>{post.views?.total || 0} views</span>
                </div>

                <div className="flex justify-end gap-2 border-t pt-2">
                  <button
                    onClick={() => handleFeaturePost(post._id)}
                    className={`p-2 rounded hover:bg-gray-100 ${
                      post.isFeatured ? 'text-yellow-500' : 'text-gray-400'
                    }`}
                  >
                    <Star size={16} className={post.isFeatured ? "fill-current" : ""} />
                  </button>
                  <button
                    onClick={() => navigate(`/admin/edit-blog/${post._id}`)}
                    className="p-2 hover:bg-gray-100 rounded text-blue-600"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(post._id)}
                    className="p-2 hover:bg-gray-100 rounded text-red-600"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {filteredPosts.length === 0 && !loading && (
            <div className="text-center py-8 sm:py-12">
              <p className="text-sm text-gray-500">No posts found</p>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="text-center py-8 sm:py-12">
              <p className="text-sm text-gray-500">Loading posts...</p>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="fixed bottom-4 right-4 left-4 sm:left-auto bg-red-100 text-red-800 px-4 py-2 rounded-lg text-sm">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default AllPost;
