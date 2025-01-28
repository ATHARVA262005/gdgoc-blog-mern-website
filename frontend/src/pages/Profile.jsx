import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Mail, Calendar, Globe, Github, Linkedin, ThumbsUp } from 'lucide-react';
import { FaXTwitter } from "react-icons/fa6";
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import Toast from '../components/Toast';
import SEO from '../components/SEO';

const DEFAULT_PROFILE_IMAGE = "/images/profile_administrator.webp";

const Profile = () => {
  const { userId } = useParams();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [userComments, setUserComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const isAuthorized = currentUser || localStorage.getItem('adminToken');

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
        
        // Fetch both profile and comments
        const [profileResponse, commentsResponse] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_URL}/users/profile/${userId}`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`${import.meta.env.VITE_API_URL}/users/${userId}/comments`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        setProfile(profileResponse.data);
        setUserComments(commentsResponse.data);
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError(err.response?.data?.message || 'Failed to fetch profile');
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchProfileData();
    }
  }, [userId]);

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
    if (!profile?.socialLinks) return null;

    const socialIcons = {
      website: { icon: Globe, label: 'Website' },
      github: { icon: Github, label: 'GitHub' },
      x: { icon: FaXTwitter, label: 'X' },
      twitter: { icon: FaXTwitter, label: 'X' },
      linkedin: { icon: Linkedin, label: 'LinkedIn' }
    };

    return Object.entries(profile.socialLinks)
      .filter(([platform, url]) => {
        if (!url || !url.trim()) return false;
        if (platform === 'twitter' && profile.socialLinks.x) return false;
        return true;
      })
      .map(([platform, url]) => {
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
      .filter(Boolean);
  };

  if (!isAuthorized) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg p-6 max-w-md w-full">
          <h2 className="text-2xl font-bold mb-4">Login Required</h2>
          <p className="text-gray-600 mb-6">
            Please login first to view user profiles.
          </p>
          <div className="flex gap-4">
            <button
              onClick={() => navigate('/login')}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
            >
              Login
            </button>
            <button
              onClick={() => navigate('/')}
              className="flex-1 border border-gray-300 py-2 px-4 rounded hover:bg-gray-50 transition-colors"
            >
              Go Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <>
      <SEO 
        title={`${profile?.name || 'User'}'s Profile`}
        description={`View ${profile?.name || 'this user'}'s profile, contributions, and activities in the GDG PDEA community. Connect and engage with fellow developers.`}
        keywords={`${profile?.name} profile, GDG PDEA member, developer profile, tech community member`}
      />
      
      <div className="min-h-screen bg-gray-50">
        <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12 mb-8 md:mb-0">
          {/* Profile Header - Made Responsive */}
          <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-8">
              <div className="relative mx-auto sm:mx-0">
                <img 
                  src={profile?.profileImage?.url || DEFAULT_PROFILE_IMAGE} 
                  alt={profile?.name} 
                  className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover"
                />
              </div>
              
              <div className="flex-1 text-center sm:text-left">
                <h1 className="text-2xl sm:text-3xl font-bold mb-2">{profile?.name}</h1>
                <p className="text-gray-600 mb-4 text-sm sm:text-base">{profile?.bio || 'No bio provided'}</p>
                <div className="flex flex-wrap justify-center sm:justify-start gap-3 sm:gap-4 text-xs sm:text-sm text-gray-500">
                  <div className="flex items-center gap-1 sm:gap-2">
                    <Mail size={14} className="sm:w-4 sm:h-4" />
                    <span>{profile?.email}</span>
                  </div>
                  <div className="flex items-center gap-1 sm:gap-2">
                    <Calendar size={14} className="sm:w-4 sm:h-4" />
                    <span>Joined {formatJoinDate(profile?.createdAt)}</span>
                  </div>
                  <div className="flex flex-wrap justify-center sm:justify-start gap-3">
                    {renderSocialLinks()}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Comments Section - Made Responsive */}
          <div className="px-0 sm:px-6 lg:px-8">
            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Comments</h2>
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
                <p className="text-gray-500 text-sm sm:text-base">No comments yet</p>
              </div>
            )}
          </div>

          {/* Toast Notification */}
          {toast.show && (
            <Toast
              message={toast.message}
              type={toast.type}
              onClose={() => setToast({ show: false, message: '', type: 'success' })}
            />
          )}
        </div>
      </div>
    </>
  );
};

export default Profile;
