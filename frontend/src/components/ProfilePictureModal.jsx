import React from 'react';
import { X, Check } from 'lucide-react';
import { profilePictures } from '../data/profilePictures';

const ProfilePictureModal = ({ isOpen, onClose, onSelect, currentImage }) => {
  if (!isOpen) return null;

  const handleImageError = (e) => {
    e.target.src = '/default-avatar.png';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-4 sm:p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-semibold">Choose Your Profile Picture</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-1"
          >
            <X size={20} className="sm:w-6 sm:h-6" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {profilePictures.map((picture) => (
            <div
              key={picture.name}
              className={`relative group cursor-pointer rounded-lg p-2 sm:p-4 ${
                currentImage === picture.url ? 'bg-blue-50' : 'hover:bg-gray-50'
              }`}
              onClick={() => {
                onSelect(picture);
                onClose();
              }}
            >
              <div className="aspect-square relative">
                <img
                  src={picture.url || '/default-avatar.png'}
                  alt={picture.name}
                  onError={handleImageError}
                  className="w-full h-full object-cover rounded-lg"
                />
                {currentImage === picture.url && (
                  <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full p-1">
                    <Check size={14} className="sm:w-4 sm:h-4" />
                  </div>
                )}
              </div>
              <div className="mt-2">
                <h3 className="font-medium text-gray-900 text-sm sm:text-base">{picture.name}</h3>
                <p className="text-xs sm:text-sm text-gray-500">{picture.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProfilePictureModal;
