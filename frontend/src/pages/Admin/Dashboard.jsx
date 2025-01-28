import React, { useState, useEffect, useCallback } from 'react';
import { Users, FileText, Eye, TrendingUp, UserCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';


const Dashboard = () => {
  const [posts, setPosts] = useState([]);
  const [users, setUsers] = useState([]);
  const [dashboardStats, setDashboardStats] = useState({
    totalPosts: 0,
    totalViews: 0,
    totalUsers: 0,
    engagementRate: 0
  });

  const navigate = useNavigate();

  // Function to view user profile
  const handleViewProfile = (userId) => {
    navigate(`/profile/${userId}`);
  };

  // Add function to handle post click
  const handlePostClick = (postId) => {
    navigate(`/blog/${postId}`);
  };

  // Single fetch function for dashboard data
  const fetchDashboardData = useCallback(async () => {
    try {
      const adminToken = localStorage.getItem('adminToken');
      if (!adminToken) {
        throw new Error('No admin token found');
      }

      // Update limit to 4 for both blogs and users
      const [blogsRes, analyticsRes, usersRes] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_URL}/blogs/admin/blogs?limit=4`, {
          headers: { 
            'Authorization': `Bearer ${adminToken}`
          }
        }),
        fetch(`${import.meta.env.VITE_API_URL}/blogs/analytics/views`, {
          headers: { 
            'Authorization': `Bearer ${adminToken}`
          }
        }),
        fetch(`${import.meta.env.VITE_API_URL}/users?limit=4`, {
          headers: { 
            'Authorization': `Bearer ${adminToken}`
          }
        })
      ]);

      const [blogsData, analyticsData, usersData] = await Promise.all([
        blogsRes.json(),
        analyticsRes.json(),
        usersRes.json()
      ]);

      if (blogsData.success) {
        setPosts(blogsData.blogs || []);
      }

      if (analyticsData.success && analyticsData.stats) {
        const { total, engagementRate } = analyticsData.stats;
        setDashboardStats({
          totalPosts: total?.totalPosts || 0,
          totalViews: total?.totalViews || 0,
          totalUsers: usersData.success ? usersData.totalUsers : 0,
          engagementRate: `${engagementRate || 0}%`
        });
      }

      if (usersData.success) {
        // Take exactly 4 users
        setUsers(usersData.users?.slice(0, 4) || []);
      }

    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setPosts([]);
      setUsers([]);
    }
  }, []);

  // Initial data fetch
  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  // Stats cards data
  const statsCards = [
    { 
      title: 'Total Posts', 
      value: dashboardStats.totalPosts.toLocaleString(), 
      icon: FileText, 
      change: '+12%' 
    },
    { 
      title: 'Total Views', 
      value: dashboardStats.totalViews.toLocaleString(), 
      icon: Eye, 
      change: '+8%' 
    },
    { 
      title: 'Total Users', 
      value: dashboardStats.totalUsers.toLocaleString(),
      icon: Users, 
      change: '+15%' 
    },
    { 
      title: 'Engagement Rate', 
      value: dashboardStats.engagementRate, 
      icon: TrendingUp, 
      change: '+3%' 
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8 mb-8 lg:mb-0">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Section */}
        <div className="bg-white rounded-xl p-4 sm:p-6 mb-6 sm:mb-8 border">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Welcome back, Admin!</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">Here's what's happening with your blog today.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {statsCards.map((stat, index) => (
            <div
              key={index}
              className="bg-white p-4 sm:p-6 rounded-xl border"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-500 text-sm mb-1">{stat.title}</p>
                  <h3 className="text-xl sm:text-2xl font-bold">{stat.value}</h3>
                </div>
                <div className="p-2 bg-blue-50 rounded-lg">
                  <stat.icon size={20} className="text-blue-600" />
                </div>
              </div>
              </div>
          ))}
        </div>

        {/* Recent Activity Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          {/* Recent Posts Overview */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 sm:p-6 border-b flex justify-between items-center">
              <h2 className="text-lg sm:text-xl font-bold">Recent Posts</h2>
              <p className="text-xs sm:text-sm text-gray-500">Last 4 posts</p>
            </div>
            <div className="divide-y divide-gray-200">
              {posts.map((post) => (
                <div 
                  key={post._id} 
                  className="p-3 sm:p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => handlePostClick(post._id)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-sm sm:text-base text-gray-900">{post.title}</h3>
                      <p className="text-xs sm:text-sm text-gray-500">
                        by {post.author?.username || 'Unknown'} • {new Date(post.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Users Overview - Updated */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 sm:p-6 border-b flex justify-between items-center">
              <h2 className="text-lg sm:text-xl font-bold">Recent Users</h2>
              <p className="text-xs sm:text-sm text-gray-500">Last 4 signups</p>
            </div>
            <div className="divide-y divide-gray-200">
              {users.map((user) => (
                <div key={user._id} className="p-3 sm:p-4">
                  <div className="flex items-center justify-between flex-wrap sm:flex-nowrap gap-2">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <img 
                        src={user.profileImage?.url || 'https://placehold.co/40x40'} 
                        alt={user.name} 
                        className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover"
                      />
                      <div>
                        <h3 className="font-medium text-sm sm:text-base text-gray-900">{user.name || user.username}</h3>
                        <p className="text-xs sm:text-sm text-gray-500">
                          Joined {new Date(user.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleViewProfile(user._id)}
                      className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <UserCircle size={16} className="sm:w-[18px] sm:h-[18px]" />
                      <span>View Profile</span>
                    </button>
                  </div>
                </div>
              ))}
              
              {users.length === 0 && (
                <div className="p-4 text-center text-sm text-gray-500">
                  No recent users found
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
