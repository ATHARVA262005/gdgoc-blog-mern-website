import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

const profileOptions = [
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

const ProfilePictureModal = ({ isOpen, onClose, onSelect, currentImage }) => {
  const [currentIndex, setCurrentIndex] = useState(
    profileOptions.findIndex(option => option.url === currentImage) || 0
  );

  if (!isOpen) return null;

  const handlePrevious = () => {
    setCurrentIndex(prev => prev === 0 ? profileOptions.length - 1 : prev - 1);
  };

  const handleNext = () => {
    setCurrentIndex(prev => prev === profileOptions.length - 1 ? 0 : prev + 1);
  };

  const handleSelect = () => {
    onSelect(profileOptions[currentIndex]);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-[90%] max-w-lg">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Choose Profile Picture</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="relative px-12">
          {/* Navigation Arrows */}
          <button
            onClick={handlePrevious}
            className="absolute left-0 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 shadow-lg hover:bg-white transition-colors"
          >
            <ChevronLeft size={24} className="text-gray-700" />
          </button>

          {/* Current Profile Option */}
          <div className="text-center">
            <img
              src={profileOptions[currentIndex].url}
              alt={profileOptions[currentIndex].name}
              className="w-40 h-40 rounded-xl object-cover mx-auto shadow-xl"
            />
            <div className="mt-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {profileOptions[currentIndex].name}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                {profileOptions[currentIndex].description}
              </p>
            </div>
          </div>

          <button
            onClick={handleNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 shadow-lg hover:bg-white transition-colors"
          >
            <ChevronRight size={24} className="text-gray-700" />
          </button>
        </div>

        <div className="mt-8 flex justify-center">
          <button
            onClick={handleSelect}
            className="px-8 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Select Profile Picture
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePictureModal;
