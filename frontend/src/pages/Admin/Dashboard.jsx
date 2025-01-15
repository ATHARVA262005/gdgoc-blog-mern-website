import React, { useState } from 'react';
import { Users, FileText, Eye, TrendingUp, Edit, Trash2, Plus, Star, Search, Mail, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Mock data
const recentPosts = [
  {
    id: 1,
    title: 'Getting Started with React Hooks',
    status: 'Published',
    date: '2024-01-15',
    author: 'John Doe',
    category: 'Development'
  },
  // ... add 4-5 more recent posts
];

const recentUsers = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    joinDate: '2024-01-15',
    avatar: 'https://placehold.co/40x40',
    role: 'Author'
  },
  // ... add 4-5 more recent users
];

const allUsers = [
  // ... existing users plus more
].concat(Array.from({ length: 10 }, (_, i) => ({
  id: i + 3,
  name: `User ${i + 3}`,
  email: `user${i + 3}@example.com`,
  joinDate: '2024-01-13',
  avatar: 'https://placehold.co/40x40',
  role: 'Reader',
  posts: Math.floor(Math.random() * 10),
  lastActive: '2 days ago'
})));

const allPosts = [
  {
    id: 1,
    title: 'Getting Started with React Hooks',
    status: 'Published',
    date: '2024-01-15',
    views: 1234,
    comments: 45,
    isFeatured: true,
    author: 'John Doe',
    category: 'Development'
  },
  {
    id: 2,
    title: 'The Future of AI in 2025',
    status: 'Draft',
    date: '2024-01-14',
    views: 0,
    comments: 0,
    isFeatured: false,
    author: 'Jane Smith',
    category: 'AI'
  },
  // ...existing stats...
];

const stats = [
  { title: 'Total Posts', value: '124', icon: FileText, change: '+12%' },
  { title: 'Total Views', value: '45.2K', icon: Eye, change: '+8%' },
  { title: 'Total Users', value: '1.2K', icon: Users, change: '+15%' },
  { title: 'Engagement Rate', value: '24%', icon: TrendingUp, change: '+3%' },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('overview'); // 'overview', 'posts', 'users'
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const [posts, setPosts] = useState(allPosts);

  const handleSearch = (e) => {
    setSearch(e.target.value);
  };

  const handleFeaturePost = (postId) => {
    setPosts(posts.map(post => {
      if (post.id === postId) {
        return { ...post, isFeatured: !post.isFeatured };
      }
      return post;
    }));
  };

  const handleDeletePost = (postId) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      setPosts(posts.filter(post => post.id !== postId));
    }
  };

  const handleCardClick = (section) => {
    setActiveSection(section);
    setSearch('');
    setFilter('all');
  };

  const renderOverview = () => (
    <>
      {/* Recent Posts Section with Enhanced Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden mt-8">
        <div className="p-6 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold">Recent Posts</h2>
          <button
            onClick={() => handleCardClick('posts')}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            View All Posts
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Author</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Views</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {posts.slice(0, 3).map((post) => (
                <tr key={post.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{post.title}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                    {post.author}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                    {post.category}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      post.status === 'Published' 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {post.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                    {post.views.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                    {post.date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => handleFeaturePost(post.id)}
                        className={`p-1 rounded hover:bg-gray-100 ${
                          post.isFeatured ? 'text-yellow-500' : 'text-gray-400'
                        }`}
                        title={post.isFeatured ? "Remove from featured" : "Mark as featured"}
                      >
                        <Star size={18} className={post.isFeatured ? "fill-current" : ""} />
                      </button>
                      <button 
                        onClick={() => navigate(`/admin/edit-blog/${post.id}`)}
                        className="p-1 hover:bg-gray-100 rounded"
                        title="Edit post"
                      >
                        <Edit size={18} className="text-gray-600" />
                      </button>
                      <button 
                        onClick={() => handleDeletePost(post.id)}
                        className="p-1 hover:bg-gray-100 rounded"
                        title="Delete post"
                      >
                        <Trash2 size={18} className="text-red-600" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Users Section - Modified for single user */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden mt-8">
        <div className="p-6 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold">Recent User</h2>
          <button
            onClick={() => handleCardClick('users')}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            View All Users
          </button>
        </div>
        <div className="p-4">
          {recentUsers.slice(0, 1).map(user => (
            <div key={user.id} className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <img src={user.avatar} alt={user.name} className="w-12 h-12 rounded-full" />
                <div>
                  <h3 className="font-medium text-lg">{user.name}</h3>
                  <p className="text-sm text-gray-500">{user.role}</p>
                  <p className="text-xs text-gray-400">Joined {user.joinDate}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 hover:bg-gray-100 rounded-full" title="Send welcome message">
                  <Mail size={20} className="text-gray-600" />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-full" title="View profile">
                  <Users size={20} className="text-gray-600" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );

  const renderUsersList = () => (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden mt-8">
      <div className="p-6 border-b">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">All Users</h2>
        </div>
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Roles</option>
            <option value="author">Authors</option>
            <option value="reader">Readers</option>
          </select>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Join Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Posts</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Active</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {allUsers.map(user => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full" />
                    <div>
                      <div className="font-medium">{user.name}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{user.role}</td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-500">{user.joinDate}</td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-500">{user.posts}</td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-500">{user.lastActive}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <div className="flex justify-end gap-2">
                    <button className="p-1 hover:bg-gray-100 rounded" title="Send email">
                      <Mail size={18} className="text-gray-600" />
                    </button>
                    <button className="p-1 hover:bg-gray-100 rounded" title="View profile">
                      <Users size={18} className="text-gray-600" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">Dashboard</h1>
            {activeSection !== 'overview' && (
              <button
                onClick={() => setActiveSection('overview')}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                ← Back to Overview
              </button>
            )}
          </div>
          {activeSection === 'posts' && (
            <button 
              onClick={() => navigate('/admin/new-blog')}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus size={20} />
              New Post
            </button>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div
              key={index}
              onClick={() => handleCardClick(stat.title === 'Total Posts' ? 'posts' : stat.title === 'Total Users' ? 'users' : 'overview')}
              className={`bg-white p-6 rounded-xl shadow-sm cursor-pointer transition-all
                ${(stat.title === 'Total Posts' && activeSection === 'posts') ||
                  (stat.title === 'Total Users' && activeSection === 'users')
                  ? 'ring-2 ring-blue-500'
                  : 'hover:shadow-md'}`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-500 mb-1">{stat.title}</p>
                  <h3 className="text-2xl font-bold">{stat.value}</h3>
                </div>
                <div className="p-2 bg-blue-50 rounded-lg">
                  <stat.icon size={24} className="text-blue-600" />
                </div>
              </div>
              <p className="text-green-600 text-sm mt-2">{stat.change} from last month</p>
            </div>
          ))}
        </div>

        {/* Dynamic Content Section */}
        {activeSection === 'overview' && renderOverview()}
        {activeSection === 'posts' && <PostsTable posts={posts} onFeature={handleFeaturePost} onDelete={handleDeletePost} />}
        {activeSection === 'users' && renderUsersList()}
      </div>
    </div>
  );
};

// Extract PostsTable component from existing posts table code
const PostsTable = ({ posts, onFeature, onDelete }) => (
  <div className="bg-white rounded-xl shadow-sm overflow-hidden mt-8">
    <div className="p-6 border-b">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">All Posts</h2>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Search posts..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
        </div>
        <select
          className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Posts</option>
          <option value="published">Published</option>
          <option value="draft">Drafts</option>
        </select>
      </div>
    </div>

    {/* Posts Table */}
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Author</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Views</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {posts.map((post) => (
            <tr key={post.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="font-medium text-gray-900">{post.title}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                {post.author}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                {post.category}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 py-1 text-xs rounded-full ${
                  post.status === 'Published' 
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {post.status}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                {post.views.toLocaleString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                {post.date}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right">
                <div className="flex justify-end gap-2">
                  <button 
                    onClick={() => onFeature(post.id)}
                    className={`p-1 rounded hover:bg-gray-100 ${
                      post.isFeatured ? 'text-yellow-500' : 'text-gray-400'
                    }`}
                    title={post.isFeatured ? "Remove from featured" : "Mark as featured"}
                  >
                    <Star size={18} className={post.isFeatured ? "fill-current" : ""} />
                  </button>
                  <button 
                    onClick={() => navigate(`/admin/edit-blog/${post.id}`)}
                    className="p-1 hover:bg-gray-100 rounded"
                    title="Edit post"
                  >
                    <Edit size={18} className="text-gray-600" />
                  </button>
                  <button 
                    onClick={() => onDelete(post.id)}
                    className="p-1 hover:bg-gray-100 rounded"
                    title="Delete post"
                  >
                    <Trash2 size={18} className="text-red-600" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export default Dashboard;
