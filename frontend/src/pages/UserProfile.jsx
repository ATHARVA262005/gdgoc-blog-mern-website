import React, { useState, useEffect } from 'react';
import { User, Calendar, Mail, Github, XIcon, Linkedin, Globe, ThumbsUp, Loader, Edit2 } from 'lucide-react';
import { FaXTwitter } from "react-icons/fa6";
import { useAuth } from '../contexts/AuthContext';
import { getUserProfile, getUserComments, updateProfilePicture, updateUserProfile } from '../services/userService';
import ProfilePictureModal from '../components/ProfilePictureModal';
import EditProfileModal from '../components/EditProfileModal';

const UserProfile = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const [userComments, setUserComments] = useState([]);
  const { user } = useAuth();

  const handleProfilePictureChange = async (imageData) => {
    try {
      setIsLoading(true);
      const updatedProfile = await updateProfilePicture(user.id, imageData);
      setUserData(prev => ({
        ...prev,
        profileImage: updatedProfile.profileImage
      }));
      setError(null);
    } catch (error) {
      console.error('Profile picture update error:', error);
      setError('Failed to update profile picture');
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileEdit = async (updatedData) => {
    try {
      setIsLoading(true);
      const result = await updateUserProfile(user.id, updatedData);
      setUserData(result.user);
      setIsEditModalOpen(false);
      setError(null);
    } catch (error) {
      setError('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
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

  // Add a redirect if user is not onboarded
  useEffect(() => {
    if (userData && !userData.onboarded) {
      navigate('/onboarding', { state: { userData } });
    }
  }, [userData]);

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
      <div className="px-8 py-12">
        {/* Profile Header */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <div className="flex justify-between items-start mb-6">
            <div className="flex-1">
              <div className="flex flex-col md:flex-row items-start gap-8">
                <div className="relative group">
                  <img 
                    src={userData.profileImage?.url || '/default-avatar.png'} 
                    alt={userData.name} 
                    className="w-32 h-32 rounded-full object-cover cursor-pointer"
                    onClick={() => setIsModalOpen(true)}
                  />
                  {/* ...existing image overlay code... */}
                </div>
                <div className="flex-1">
                  <h1 className="text-3xl font-bold mb-2">{userData.name}</h1>
                  <p className="text-gray-600 mb-4">{userData.bio || 'No bio added yet'}</p>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <Mail size={16} />
                      <span>{userData.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar size={16} />
                      <span>Joined {formatJoinDate(userData.createdAt)}</span>
                    </div>
                    {renderSocialLinks()}
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              <Edit2 size={16} />
              <span>Edit Profile</span>
            </button>
          </div>
        </div>

        {/* Comments Section */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Recent Comments</h2>
          {userComments.length > 0 ? (
            <div className="space-y-4">
              {userComments.map(comment => (
                <div key={comment._id} className="bg-white rounded-xl p-6 shadow-sm">
                  <h3 className="font-semibold text-blue-600 mb-2">{comment.blogTitle}</h3>
                  <p className="text-gray-600 mb-4">{comment.content}</p>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>{formatJoinDate(comment.createdAt)}</span>
                    <div className="flex items-center gap-2">
                      <ThumbsUp size={16} />
                      <span>{comment.likes} likes</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No comments yet</p>
          )}
        </div>
      </div>

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
