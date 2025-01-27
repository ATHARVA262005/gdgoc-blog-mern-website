import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Mail, Calendar, Globe, Github, Linkedin, ThumbsUp } from 'lucide-react';
import { FaXTwitter } from "react-icons/fa6";
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import Toast from '../components/Toast';

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

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        // Fetch both profile and comments
        const [profileResponse, commentsResponse] = await Promise.all([
          axios.get(`http://localhost:5000/api/users/profile/${userId}`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`http://localhost:5000/api/users/${userId}/comments`, {
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
    <div className="min-h-screen bg-gray-50">
      <div className="px-8 py-12">
        {/* Profile Header */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <div className="flex flex-col md:flex-row items-start gap-8">
            <img 
              src={profile?.profileImage?.url || DEFAULT_PROFILE_IMAGE} 
              alt={profile?.name} 
              className="w-32 h-32 rounded-full object-cover"
            />
            
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">{profile?.name}</h1>
              <p className="text-gray-600 mb-4">{profile?.bio || 'No bio provided'}</p>
              <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <Mail size={16} />
                  <span>{profile?.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={16} />
                  <span>Joined {formatJoinDate(profile?.createdAt)}</span>
                </div>
                {renderSocialLinks()}
              </div>
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Comments</h2>
          {userComments.length > 0 ? (
            <div className="space-y-6">
              {userComments.map(comment => (
                <div key={comment._id} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                  <Link 
                    to={`/blog/${comment.blogId}`} 
                    className="block mb-4"
                  >
                    <h3 className="text-lg font-semibold text-blue-600 hover:text-blue-700 mb-2">
                      {comment.blogTitle}
                    </h3>
                    <div className="prose prose-sm max-w-none text-gray-600">
                      {comment.content}
                    </div>
                  </Link>
                  <div className="flex items-center justify-between text-sm text-gray-500 mt-4 pt-4 border-t">
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
            <div className="text-center py-12 bg-white rounded-xl shadow-sm">
              <p className="text-gray-500">No comments yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
