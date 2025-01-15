import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Globe, Github, Linkedin, Twitter, ChevronLeft, ChevronRight } from 'lucide-react';

const profileImages = [
  {
    url: "https://placehold.co/400x400/3B82F6/FFFFFF",
    name: "The Explorer",
    description: "Curious and adventurous reader who loves discovering new topics"
  },
  {
    url: "https://placehold.co/400x400/EF4444/FFFFFF",
    name: "The Analyst",
    description: "Detail-oriented reader who dives deep into technical content"
  },
  {
    url: "https://placehold.co/400x400/10B981/FFFFFF",
    name: "The Innovator",
    description: "Creative thinker who seeks cutting-edge technology trends"
  },
  {
    url: "https://placehold.co/400x400/6366F1/FFFFFF",
    name: "The Mentor",
    description: "Experienced reader who enjoys sharing knowledge"
  },
  {
    url: "https://placehold.co/400x400/F59E0B/FFFFFF",
    name: "The Visionary",
    description: "Forward-thinking reader focused on future technologies"
  },
  {
    url: "https://placehold.co/400x400/8B5CF6/FFFFFF",
    name: "The Builder",
    description: "Practical reader who loves hands-on development content"
  }
];

const Onboarding = () => {
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    email: 'user@example.com', // This would come from signup data
    bio: '',
    github: '',
    linkedin: '',
    twitter: '',
    website: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Profile data:', { ...formData, profileImage: profileImages[currentImageIndex] });
    // Handle profile creation here
    navigate('/'); // Redirect to home after successful profile creation
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
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900">Complete Your Profile</h2>
          <p className="mt-2 text-lg text-gray-600">Let's get to know you better</p>
        </div>

        <div className="bg-white p-8 rounded-xl shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Profile Picture Selection */}
            <div>
              <div className="text-center mb-8">
                <label className="block text-lg font-medium text-gray-900 mb-2">
                  Choose your profile picture
                </label>
                <p className="text-sm text-gray-500">
                  Select a personality that best represents you
                </p>
              </div>
              <div className="relative flex justify-center items-center px-12">
                {/* Navigation Arrows */}
                <button
                  type="button"
                  onClick={handlePrevImage}
                  className="absolute left-0 z-10 p-2 rounded-full bg-white/80 shadow-lg hover:bg-white transition-colors"
                >
                  <ChevronLeft size={24} className="text-gray-700" />
                </button>

                {/* Selected Image */}
                <div className="relative text-center">
                  <img
                    src={profileImages[currentImageIndex].url}
                    alt={profileImages[currentImageIndex].name}
                    className="w-40 h-40 rounded-xl object-cover ring-4 ring-blue-600 shadow-xl mx-auto"
                  />
                  <div className="mt-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {profileImages[currentImageIndex].name}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {profileImages[currentImageIndex].description}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleNextImage}
                  className="absolute right-0 z-10 p-2 rounded-full bg-white/80 shadow-lg hover:bg-white transition-colors"
                >
                  <ChevronRight size={24} className="text-gray-700" />
                </button>
              </div>
            </div>

            {/* Basic Information */}
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                  className="w-full px-4 py-3 rounded-lg border bg-gray-50 text-gray-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bio
                </label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Tell us about yourself"
                  rows="4"
                />
              </div>
            </div>

            {/* Social Links */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Social Links</h3>
              <div className="grid grid-cols-1 gap-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                    <Globe className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    className="pl-10 w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Your website"
                  />
                </div>

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                    <Github className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="url"
                    value={formData.github}
                    onChange={(e) => setFormData({ ...formData, github: e.target.value })}
                    className="pl-10 w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="GitHub profile"
                  />
                </div>

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                    <Linkedin className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="url"
                    value={formData.linkedin}
                    onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                    className="pl-10 w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="LinkedIn profile"
                  />
                </div>

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                    <Twitter className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="url"
                    value={formData.twitter}
                    onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
                    className="pl-10 w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="X (Twitter) profile"
                  />
                </div>
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Complete Profile
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
