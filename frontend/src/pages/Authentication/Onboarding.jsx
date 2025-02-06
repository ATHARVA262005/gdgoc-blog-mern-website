import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Mail, Globe, Github, Linkedin, Twitter, ChevronLeft, ChevronRight } from 'lucide-react';
import { completeOnboarding } from '../../services/authService';
import { useAuth } from '../../contexts/AuthContext';
import { profileImages } from '../../data/profilePictures.js';



const Onboarding = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, login } = useAuth(); // Add auth context
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // Get user data from location state first, then localStorage
  const userDataFromLocation = location.state?.userData;
  const userDataFromStorage = localStorage.getItem('user');
  
  // Use either location state, localStorage, or default empty object
  const userData = userDataFromLocation || (userDataFromStorage ? JSON.parse(userDataFromStorage) : {});

  // Initialize form data with user data if available
  const [formData, setFormData] = useState({
    name: userData.name || '',
    email: userData.email || '',
    bio: userData.bio || '',
    website: userData.socialLinks?.website || '',
    github: userData.socialLinks?.github || '',
    linkedin: userData.socialLinks?.linkedin || '',
    twitter: userData.socialLinks?.twitter || ''
  });

  // Update the useEffect for redirection logic
  useEffect(() => {
    // Redirect to login if no user
    if (!user?.id) {
      navigate('/login', { replace: true });
      return;
    }

    // Redirect to profile if already onboarded
    if (user.onboarded) {
      navigate('/profile', { replace: true });
      return;
    }
  }, [navigate, user]);

  // Form validation
  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Name is required');
      return false;
    }
    if (formData.name.trim().length < 2) {
      setError('Name must be at least 2 characters long');
      return false;
    }
    if (!formData.bio.trim()) {
      setError('Please add a short bio');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!validateForm()) return;
    
    setLoading(true);

    try {
      const updatedUser = await completeOnboarding({
        name: formData.name.trim(),
        bio: formData.bio.trim(),
        profileImage: profileImages[currentImageIndex],
        socialLinks: {
          website: formData.website.trim(),
          github: formData.github.trim(),
          linkedin: formData.linkedin.trim(),
          twitter: formData.twitter.trim()
        }
      });

      // Update both localStorage and AuthContext
      const token = localStorage.getItem('token');
      login(updatedUser, token);
      
      navigate('/', { replace: true });
    } catch (err) {
      console.error('Onboarding error:', err);
      setError(err.message || 'Failed to complete onboarding. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? profileImages.length - 1 : prev - 1
    );
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === profileImages.length - 1 ? 0 : prev + 1
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6 sm:py-8 lg:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-6 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Complete Your Profile</h2>
          <p className="mt-2 text-base sm:text-lg text-gray-600">Let's get to know you better</p>
        </div>

        <div className="bg-white p-4 sm:p-6 lg:p-8 rounded-xl shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
            {/* Profile Picture Selection */}
            <div>
              <div className="text-center mb-6 sm:mb-8">
                <label className="block text-base sm:text-lg font-medium text-gray-900 mb-2">
                  Choose your profile picture
                </label>
                <p className="text-xs sm:text-sm text-gray-500">
                  Select a personality that best represents you
                </p>
              </div>
              <div className="relative flex justify-center items-center px-4 sm:px-12">
                {/* Navigation Arrows */}
                <button
                  type="button"
                  onClick={handlePrevImage}
                  className="absolute left-0 z-10 p-1.5 sm:p-2 rounded-full bg-white/80 shadow-lg hover:bg-white transition-colors"
                >
                  <ChevronLeft size={20} className="sm:w-6 sm:h-6 text-gray-700" />
                </button>

                {/* Selected Image */}
                <div className="relative text-center px-8 sm:px-0">
                  <img
                    src={profileImages[currentImageIndex].url}
                    alt={profileImages[currentImageIndex].name}
                    className="w-32 h-32 sm:w-40 sm:h-40 rounded-xl object-cover ring-4 ring-blue-600 shadow-xl mx-auto"
                  />
                  <div className="mt-3 sm:mt-4">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                      {profileImages[currentImageIndex].name}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1">
                      {profileImages[currentImageIndex].description}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleNextImage}
                  className="absolute right-0 z-10 p-1.5 sm:p-2 rounded-full bg-white/80 shadow-lg hover:bg-white transition-colors"
                >
                  <ChevronRight size={20} className="sm:w-6 sm:h-6 text-gray-700" />
                </button>
              </div>
            </div>

            {/* Basic Information */}
            <div className="grid grid-cols-1 gap-4 sm:gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                  placeholder="Your full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email (Non-editable)
                </label>
                <input
                  type="email"
                  disabled
                  value={formData.email}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg border bg-gray-50 text-gray-500 text-sm sm:text-base"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bio
                </label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                  placeholder="Tell us about yourself"
                  rows="3"
                />
              </div>
            </div>

            {/* Social Links */}
            <div className="space-y-4">
              <h3 className="text-base sm:text-lg font-medium text-gray-900">Social Links</h3>
              <div className="grid grid-cols-1 gap-3 sm:gap-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                    <Globe className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                  </div>
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    className="pl-9 sm:pl-10 w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                    placeholder="Your website"
                  />
                </div>

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                    <Github className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                  </div>
                  <input
                    type="url"
                    value={formData.github}
                    onChange={(e) => setFormData({ ...formData, github: e.target.value })}
                    className="pl-9 sm:pl-10 w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                    placeholder="GitHub profile"
                  />
                </div>

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                    <Linkedin className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                  </div>
                  <input
                    type="url"
                    value={formData.linkedin}
                    onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                    className="pl-9 sm:pl-10 w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                    placeholder="LinkedIn profile"
                  />
                </div>

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                    <Twitter className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                  </div>
                  <input
                    type="url"
                    value={formData.twitter}
                    onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
                    className="pl-9 sm:pl-10 w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                    placeholder="X (Twitter) profile"
                  />
                </div>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2.5 sm:py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm sm:text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Completing Profile...' : 'Complete Profile'}
              </button>
              {error && (
                <p className="mt-2 text-center text-xs sm:text-sm text-red-600">
                  {error}
                </p>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
