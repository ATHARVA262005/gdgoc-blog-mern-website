import React, { useState, useEffect } from 'react';
import { Search, UserX, Mail, UserCheck } from 'lucide-react';

// Update BanModal for better mobile responsiveness
const BanModal = ({ isOpen, onClose, onConfirm, user }) => {
  const [banReason, setBanReason] = useState('');

  return isOpen ? (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-4 sm:p-6 max-w-md w-full mx-4 sm:mx-auto">
        <h3 className="text-base sm:text-lg font-medium mb-4">
          {user?.isBanned ? 'Unban User' : 'Ban User'}
        </h3>
        {!user?.isBanned && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason for ban
            </label>
            <textarea
              value={banReason}
              onChange={(e) => setBanReason(e.target.value)}
              className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500"
              rows="3"
              placeholder="Enter reason for banning user..."
            />
          </div>
        )}
        <div className="flex justify-end gap-2 sm:gap-3">
          <button
            onClick={onClose}
            className="px-3 sm:px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(banReason)}
            className={`px-3 sm:px-4 py-2 text-sm rounded-lg ${
              user?.isBanned
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-red-600 hover:bg-red-700 text-white'
            }`}
          >
            {user?.isBanned ? 'Unban User' : 'Ban User'}
          </button>
        </div>
      </div>
    </div>
  ) : null;
};

const AllUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all'); // all, active, banned
  const [error, setError] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showBanModal, setShowBanModal] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const adminToken = localStorage.getItem('adminToken');
      if (!adminToken) {
        throw new Error('No admin token found');
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/users`, {
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to fetch users');
      }

      const data = await response.json();
      if (data.success) {
        setUsers(data.users || []);
      } else {
        throw new Error(data.message || 'Failed to fetch users');
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBanUser = async (userId, isBanned) => {
    if (!isBanned) {
      setSelectedUser(users.find(u => u._id === userId));
      setShowBanModal(true);
      return;
    }
    
    // Handle unban directly
    await updateUserBanStatus(userId, false);
  };

  const updateUserBanStatus = async (userId, isBanned, banReason = '') => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/users/${userId}/ban`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isBanned, banReason })
      });

      if (!response.ok) throw new Error('Failed to update user status');

      const data = await response.json();
      if (data.success) {
        setUsers(users.map(user => 
          user._id === userId ? { ...user, isBanned, banReason } : user
        ));
        setShowBanModal(false);
        setSelectedUser(null);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const filteredUsers = users.filter(user => {
    if (!user) return false; // Guard against undefined users
    
    const matchesSearch = (user.username || '').toLowerCase().includes(search.toLowerCase()) ||
                         (user.email || '').toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || 
                         (filter === 'banned' && user.isBanned) ||
                         (filter === 'active' && !user.isBanned);
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8 mb-8 lg:mb-0">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">All Users</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">Manage your users and their permissions</p>
        </div>

        {/* Filters */}
        <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm mb-6">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search users..."
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
              <option value="all">All Users</option>
              <option value="active">Active</option>
              <option value="banned">Banned</option>
            </select>
          </div>
        </div>

        {/* Users List - Desktop and Mobile Views */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {/* Desktop Table View */}
          <div className="hidden sm:block">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredUsers.map(user => user && (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <img
                          src={user.profileImage?.url || 'https://via.placeholder.com/40'}
                          alt={user.name || 'User'}
                          className="h-10 w-10 rounded-full"
                        />
                        <div className="ml-4">
                          <div className="font-medium text-gray-900">{user.name || user.username || 'Unnamed User'}</div>
                          {/* Add email below name for better identification */}
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{user.email || 'No email'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        user.isBanned 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {user.isBanned ? 'Banned' : 'Active'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleBanUser(user._id, user.isBanned)}
                          className={`p-1 rounded hover:bg-gray-100 ${
                            user.isBanned ? 'text-green-600' : 'text-red-600'
                          }`}
                        >
                          {user.isBanned ? <UserCheck size={18} /> : <UserX size={18} />}
                        </button>
                        <button
                          onClick={() => window.location.href = `mailto:${user.email}`}
                          className="p-1 hover:bg-gray-100 rounded text-blue-600"
                        >
                          <Mail size={18} />
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
            {filteredUsers.map(user => user && (
              <div key={user._id} className="p-4 hover:bg-gray-50">
                <div className="flex items-start gap-3">
                  <img
                    src={user.profileImage?.url || 'https://via.placeholder.com/40'}
                    alt={user.name || 'User'}
                    className="h-10 w-10 rounded-full"
                  />
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium text-gray-900">{user.name || user.username || 'Unnamed User'}</div>
                        <div className="text-xs text-gray-500">{user.email}</div>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        user.isBanned 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {user.isBanned ? 'Banned' : 'Active'}
                      </span>
                    </div>
                    <div className="mt-2 text-xs text-gray-500">
                      Joined {new Date(user.createdAt).toLocaleDateString()}
                    </div>
                    <div className="mt-3 flex justify-end gap-2 border-t pt-3">
                      <button
                        onClick={() => handleBanUser(user._id, user.isBanned)}
                        className={`p-2 rounded-lg ${
                          user.isBanned ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {user.isBanned ? <UserCheck size={16} /> : <UserX size={16} />}
                      </button>
                      <button
                        onClick={() => window.location.href = `mailto:${user.email}`}
                        className="p-2 rounded-lg text-blue-600"
                      >
                        <Mail size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Empty and Loading States */}
          {filteredUsers.length === 0 && !loading && (
            <div className="text-center py-8 sm:py-12">
              <p className="text-sm text-gray-500">No users found</p>
            </div>
          )}

          {loading && (
            <div className="text-center py-8 sm:py-12">
              <p className="text-sm text-gray-500">Loading users...</p>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="fixed bottom-4 right-4 left-4 sm:left-auto bg-red-100 text-red-800 px-4 py-2 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Ban Modal */}
        <BanModal
          isOpen={showBanModal}
          onClose={() => {
            setShowBanModal(false);
            setSelectedUser(null);
          }}
          onConfirm={(reason) => updateUserBanStatus(selectedUser?._id, true, reason)}
          user={selectedUser}
        />
      </div>
    </div>
  );
};

export default AllUsers;
