import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Calendar, Mail, Github, XIcon, Linkedin, Globe, ThumbsUp, Loader, Edit2, LogOut, Bookmark } from 'lucide-react';
import { FaXTwitter } from "react-icons/fa6";
import { useAuth } from '../contexts/AuthContext';
import { getUserProfile, getUserComments, updateProfilePicture, updateUserProfile } from '../services/userService';
import ProfilePictureModal from '../components/ProfilePictureModal';
import EditProfileModal from '../components/EditProfileModal';
import Toast from '../components/Toast';
import axios from 'axios';

const UserProfile = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const [userComments, setUserComments] = useState([]);
  const { user, logout } = useAuth();
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const handleProfilePictureChange = async (imageData) => {
    try {
      setIsLoading(true);
      
      // Ensure we have the user ID
      if (!user?.id) {
        throw new Error('User ID not found');
      }
  
      const response = await updateProfilePicture(user.id, {
        url: imageData.url,
        name: imageData.name,
        description: imageData.description
      });
      
      if (response.success) {
        setUserData(prev => ({
          ...prev,
          profileImage: response.profileImage
        }));
        
        // Update Auth context user data if needed
        const updatedUser = JSON.parse(localStorage.getItem('user'));
        if (updatedUser) {
          // If you have a method to update user in auth context, call it here
          // updateAuthUser(updatedUser);
        }
        
        setToastMessage('Profile picture updated successfully!');
        setShowToast(true);
        setIsModalOpen(false);
      }
    } catch (error) {
      console.error('Profile picture update error:', error);
      setToastMessage(error.response?.data?.message || 'Failed to update profile picture');
      setShowToast(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileEdit = async (updatedData) => {
    try {
      setIsLoading(true);
      
      // Ensure we have the user ID
      if (!user?.id) {
        throw new Error('User ID not found');
      }
  
      const response = await updateUserProfile(user.id, {
        name: updatedData.name,
        email: updatedData.email,
        bio: updatedData.bio,
        socialLinks: updatedData.socialLinks
      });
      
      if (response.success) {
        setUserData(response.user);
        setToastMessage('Profile updated successfully!');
        setShowToast(true);
        setIsEditModalOpen(false);
      }
    } catch (error) {
      console.error('Profile update error:', error);
      setToastMessage(error.response?.data?.message || 'Failed to update profile');
      setShowToast(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleBookmarksClick = () => {
    navigate('/bookmarks');
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Get the user ID from auth context
        if (!user?.id) {
          throw new Error('User ID not found');
        }

        const [profileData, commentsData] = await Promise.all([
          getUserProfile(user.id),
          getUserComments(user.id)
        ]);

        // Update local storage with latest user data
        if (profileData) {
          localStorage.setItem('user', JSON.stringify({
            ...user,
            ...profileData
          }));
        }
        
        setUserData(profileData);
        setUserComments(commentsData);
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError(err.message || 'Failed to fetch user data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [user?.id]);

  // Update the onboarding check logic
  useEffect(() => {
    // Get the stored user data
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    
    // Only redirect if:
    // 1. User data exists AND
    // 2. User is explicitly not onboarded (false) AND
    // 3. Stored user is also not onboarded
    if (userData && 
        userData.onboarded === false && 
        storedUser.onboarded !== true) {
      navigate('/onboarding', { state: { userData } });
    }
  }, [userData, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="animate-spin" size={40} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600">
        {error}
      </div>
    );
  }

  if (!userData) {
    return null;
  }

  const formatJoinDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric'
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderSocialLinks = () => {
    if (!userData.socialLinks) return null;

    const socialIcons = {
      website: { icon: Globe, label: 'Website' },
      github: { icon: Github, label: 'GitHub' },
      x: { icon: FaXTwitter, label: 'X' },
      twitter: { icon: FaXTwitter, label: 'X' }, // Support legacy twitter field
      linkedin: { icon: Linkedin, label: 'LinkedIn' }
    };

    return Object.entries(userData.socialLinks)
      .filter(([platform, url]) => {
        // Skip if no URL or if it's twitter and we already have 'x'
        if (!url || !url.trim()) return false;
        if (platform === 'twitter' && userData.socialLinks.x) return false;
        return true;
      })
      .map(([platform, url]) => {
        // Handle both 'twitter' and 'x' cases
        const socialInfo = socialIcons[platform === 'twitter' ? 'x' : platform];
        if (!socialInfo) return null;

        const { icon: Icon, label } = socialInfo;
        return (
          <a
            key={platform}
            href={url.startsWith('http') ? url : `https://${url}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
          >
            <Icon size={16} />
            <span>{label}</span>
          </a>
        );
      })
      .filter(Boolean); // Remove any null entries
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-4 sm:px-6 lg:px-8 mb-8 md:mb-0 py-6 sm:py-8 lg:py-12">
        {/* Profile Header - Made Responsive */}
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 sm:gap-6 mb-4 sm:mb-6">
            <div className="flex-1 w-full">
              <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-8">
                {/* Profile Image */}
                <div className="relative group mx-auto sm:mx-0">
                  <img 
                    src={userData.profileImage?.url || '/default-avatar.png'} 
                    alt={userData.name} 
                    className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover cursor-pointer"
                    onClick={() => setIsModalOpen(true)}
                  />
                </div>

                {/* User Info */}
                <div className="flex-1 text-center sm:text-left">
                  <h1 className="text-2xl sm:text-3xl font-bold mb-2">{userData.name}</h1>
                  <p className="text-gray-600 mb-4 text-sm sm:text-base">{userData.bio || 'No bio added yet'}</p>
                  <div className="flex flex-wrap justify-center sm:justify-start gap-3 sm:gap-4 text-xs sm:text-sm text-gray-500">
                    <div className="flex items-center gap-1 sm:gap-2">
                      <Mail size={14} className="sm:w-4 sm:h-4" />
                      <span>{userData.email}</span>
                    </div>
                    <div className="flex items-center gap-1 sm:gap-2">
                      <Calendar size={14} className="sm:w-4 sm:h-4" />
                      <span>Joined {formatJoinDate(userData.createdAt)}</span>
                    </div>
                    <div className="flex flex-wrap justify-center sm:justify-start gap-3">
                      {renderSocialLinks()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg text-sm"
            >
              <Edit2 size={16} />
              <span>Edit Profile</span>
            </button>
          </div>
        </div>

        {/* Mobile-only Buttons - Updated with handler */}
        <div className="block sm:hidden mb-6">
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={handleBookmarksClick}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-white rounded-lg shadow-sm text-gray-700"
            >
              <Bookmark size={16} />
              <span>Bookmarks</span>
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-white rounded-lg shadow-sm text-red-600"
            >
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Comments Section - Made Responsive */}
        <div className="px-0 sm:px-6 lg:px-8">
          <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">My Comments</h2>
          {userComments.length > 0 ? (
            <div className="space-y-4 sm:space-y-6">
              {userComments.map(comment => (
                <div key={comment._id} className="bg-white rounded-xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow">
                  <Link 
                    to={`/blog/${comment.blogId}`} 
                    className="block mb-3 sm:mb-4"
                  >
                    <h3 className="text-base sm:text-lg font-semibold text-blue-600 hover:text-blue-700 mb-2">
                      {comment.blogTitle}
                    </h3>
                    <div className="prose prose-sm max-w-none text-gray-600 text-sm sm:text-base">
                      {comment.content}
                    </div>
                  </Link>
                  <div className="flex items-center justify-between text-xs sm:text-sm text-gray-500 mt-3 sm:mt-4 pt-3 sm:pt-4 border-t">
                    <span>{formatDate(comment.createdAt)}</span>
                    <Link 
                      to={`/blog/${comment.blogId}#comment-${comment._id}`}
                      className="text-blue-600 hover:text-blue-700 flex items-center gap-1"
                    >
                      View Discussion
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 sm:py-12 bg-white rounded-xl shadow-sm">
              <p className="text-gray-500 mb-4 text-sm sm:text-base">No comments yet</p>
              <Link 
                to="/treasure" 
                className="text-blue-600 hover:text-blue-700 font-medium text-sm sm:text-base"
              >
                Browse blogs to start commenting
              </Link>
            </div>
          )}
        </div>
      </div>

      {showToast && (
        <Toast
          message={toastMessage}
          type="success"
          onClose={() => setShowToast(false)}
        />
      )}

      {isModalOpen && (
        <ProfilePictureModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSelect={handleProfilePictureChange}
          currentImage={userData.profileImage?.url}
        />
      )}

      {isEditModalOpen && (
        <EditProfileModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSave={handleProfileEdit}
          userData={userData}
        />
      )}
    </div>
  );
};

export default UserProfile;