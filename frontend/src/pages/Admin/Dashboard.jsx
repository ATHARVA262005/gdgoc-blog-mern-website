import React, { useState, useEffect, useCallback } from 'react';
import { Users, FileText, Eye, TrendingUp, Edit, Trash2, Plus, Star, Search, Mail, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ViewAnalytics from './ViewAnalytics';

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

  const [posts, setPosts] = useState([]);
  const [users, setUsers] = useState([]);

  // Add state for analytics
  const [analytics, setAnalytics] = useState({
    totalViews: 0,
    viewsByPost: [],
    last30Days: []
  });

  // Add new state for dashboard stats
  const [dashboardStats, setDashboardStats] = useState({
    totalPosts: 0,
    totalViews: 0,
    totalUsers: 0,
    engagementRate: 0
  });

  // Add state for showing analytics
  const [showAnalytics, setShowAnalytics] = useState(false);

  // Add function to fetch dashboard stats
  const fetchDashboardStats = useCallback(async () => {
    try {
      // Fetch analytics data, posts, and total users
      const [analyticsRes, postsRes, usersRes] = await Promise.all([
        fetch('/api/blogs/analytics/views', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` }
        }),
        fetch('/api/blogs/admin', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` }
        }),
        fetch('/api/users', { // Fetch total users
          headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` }
        })
      ]);

      const [analyticsData, postsData, usersData] = await Promise.all([
        analyticsRes.json(),
        postsRes.json(),
        usersRes.json()
      ]);

      // Calculate engagement rate (views per post)
      const totalPosts = postsData.blogs.length;
      const totalViews = analyticsData.stats?.total?.totalViews || 0;
      const engagementRate = totalPosts > 0 
        ? ((totalViews / totalPosts) * 100).toFixed(1) + '%'
        : '0%';

      setDashboardStats({
        totalPosts,
        totalViews,
        totalUsers: usersData.totalUsers || 0, // Update totalUsers
        engagementRate
      });

    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
    }
  }, []);

  // Call fetchDashboardStats when component mounts and periodically
  useEffect(() => {
    fetchDashboardStats();
    const interval = setInterval(fetchDashboardStats, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [fetchDashboardStats]);

  useEffect(() => {
    if (activeSection === 'overview') {
      // Fetch the recent 3 blogs (use your preferred back-end approach for limiting)
      fetch('/api/blogs?limit=3')
        .then(response => response.json())
        .then(data => {
          if (data.success) {
            setPosts(data.blogs);
          }
        })
        .catch(err => console.error('Error fetching limited posts:', err));
    } else if (activeSection === 'posts') {
      // Use admin endpoint to get all posts including drafts
      fetch('/api/blogs/admin', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      })
        .then(response => response.json())
        .then(data => {
          if (data.success) {
            setPosts(data.blogs);
          }
        })
        .catch(err => console.error('Error fetching all posts:', err));
    } else if (activeSection === 'users') {
      fetch('/api/users')
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setUsers(data.users);
          }
        })
        .catch((err) => console.error('Error fetching all users:', err));
    }
  }, [activeSection]);

  // Add useEffect to fetch analytics
  useEffect(() => {
    fetch('/api/blogs/analytics/views', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
      }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setAnalytics({
            totalViews: data.stats?.total?.totalViews || 0,
            viewsByPost: data.stats?.viewsByPost || [],
            last30Days: data.stats?.timeRange || []
          });
          // Update stats array with real total views
          stats[1].value = (data.stats?.total?.totalViews || 0).toLocaleString();
        }
      })
      .catch(err => console.error('Error fetching analytics:', err));
  }, []);

  const handleSearch = (e) => {
    setSearch(e.target.value);
  };

  const handleFeaturePost = async (postId) => {
    try {
      const response = await fetch(`/api/blogs/${postId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({
          isFeatured: !posts.find(p => p._id === postId)?.isFeatured
        })
      });

      const data = await response.json();
      if (data.success) {
        setPosts(posts.map(post =>
          post._id === postId ? { ...post, isFeatured: !post.isFeatured } : post
        ));
      }
    } catch (err) {
      console.error('Error toggling featured status:', err);
    }
  };

  const handleDeletePost = async (postId) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        const response = await fetch(`/api/blogs/${postId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
          }
        });

        const data = await response.json();
        if (data.success) {
          setPosts(posts.filter(post => post._id !== postId));
        }
      } catch (err) {
        console.error('Error deleting post:', err);
      }
    }
  };

  const handleCardClick = (section) => {
    setShowAnalytics(false); // Reset analytics view when changing sections
    setActiveSection(section);
    setSearch('');
    setFilter('all');
  };

  const handleStatClick = (statTitle) => {
    setShowAnalytics(false); // Reset analytics view first
    if (statTitle === 'Total Views') {
      setShowAnalytics(true);
      setActiveSection('overview'); // Reset active section when showing analytics
    } else {
      handleCardClick(statTitle === 'Total Posts' ? 'posts' : statTitle === 'Total Users' ? 'users' : 'overview');
    }
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
                <tr key={post._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 max-w-[150px] whitespace-nowrap overflow-hidden text-ellipsis">
                    <div className="font-medium text-gray-900">{post.title}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                    {post.author?.username || 'Unknown'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                    {post.category}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      post.status === 'published'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {post.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                    {/* If you track views, display them here */}
                    {post.views ? post.views.toLocaleString() : 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                    {new Date(post.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => handleFeaturePost(post._id)}
                        className={`p-1 rounded hover:bg-gray-100 ${
                          post.isFeatured ? 'text-yellow-500' : 'text-gray-400'
                        }`}
                        title={post.isFeatured ? "Remove from featured" : "Mark as featured"}
                      >
                        <Star size={18} className={post.isFeatured ? "fill-current" : ""} />
                      </button>
                      <button 
                        onClick={() => navigate(`/admin/edit-blog/${post._id}`)}
                        className="p-1 hover:bg-gray-100 rounded"
                        title="Edit post"
                      >
                        <Edit size={18} className="text-gray-600" />
                      </button>
                      <button 
                        onClick={() => handleDeletePost(post._id)}
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
            {users.map(user => (
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

  // Update stats array to use real data
  const statsCards = [
    { 
      title: 'Total Posts', 
      value: dashboardStats.totalPosts?.toString() || '0', 
      icon: FileText, 
      change: '+12%' 
    },
    { 
      title: 'Total Views', 
      value: (dashboardStats.totalViews || 0).toLocaleString(), 
      icon: Eye, 
      change: '+8%' 
    },
    { 
      title: 'Total Users', 
      value: (dashboardStats.totalUsers || 0).toString(), // Use totalUsers
      icon: Users, 
      change: '+15%' 
    },
    { 
      title: 'Engagement Rate', 
      value: dashboardStats.engagementRate || '0%', 
      icon: TrendingUp, 
      change: '+3%' 
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">Dashboard</h1>
            {(activeSection !== 'overview' || showAnalytics) && (
              <button
                onClick={() => {
                  setActiveSection('overview');
                  setShowAnalytics(false); // Reset analytics view when going back
                }}
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
          {statsCards.map((stat, index) => (
            <div
              key={index}
              onClick={() => handleStatClick(stat.title)}
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
        {showAnalytics ? (
          <ViewAnalytics analytics={analytics} />
        ) : (
          <>
            {activeSection === 'overview' && renderOverview()}
            {activeSection === 'posts' && <PostsTable posts={posts} onFeature={handleFeaturePost} onDelete={handleDeletePost} navigate={navigate} />}
            {activeSection === 'users' && renderUsersList()}
          </>
        )}
      </div>
    </div>
  );
};

// Extract PostsTable component from existing posts table code
const PostsTable = ({ posts, onFeature, onDelete, navigate }) => (
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
            <tr key={post._id} className="hover:bg-gray-50">
              <td className="px-6 py-4 max-w-[150px] whitespace-nowrap overflow-hidden text-ellipsis">
                <div className="font-medium text-gray-900">{post.title}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                {post.author?.username || 'Unknown'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                {post.category}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 py-1 text-xs rounded-full ${
                  post.status === 'published' 
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {post.status}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                {(post.views?.total || 0).toLocaleString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                {new Date(post.createdAt).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right">
                <div className="flex justify-end gap-2">
                  <button 
                    onClick={() => onFeature(post._id)}
                    className={`p-1 rounded hover:bg-gray-100 ${
                      post.isFeatured ? 'text-yellow-500' : 'text-gray-400'
                    }`}
                    title={post.isFeatured ? "Remove from featured" : "Mark as featured"}
                  >
                    <Star size={18} className={post.isFeatured ? "fill-current" : ""} />
                  </button>
                  <button 
                    onClick={() => navigate(`/admin/edit-blog/${post._id}`)}
                    className="p-1 hover:bg-gray-100 rounded"
                    title="Edit post"
                  >
                    <Edit size={18} className="text-gray-600" />
                  </button>
                  <button 
                    onClick={() => onDelete(post._id)}
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
