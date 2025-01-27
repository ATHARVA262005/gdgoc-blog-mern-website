import React from 'react';
import { X, Check } from 'lucide-react';
import { profilePictures } from '../data/profilePictures';

const ProfilePictureModal = ({ isOpen, onClose, onSelect, currentImage }) => {
  if (!isOpen) return null;

  const handleImageError = (e) => {
    e.target.src = '/default-avatar.png'; // Fallback image
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Choose Your Profile Picture</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {profilePictures.map((picture) => (
            <div
              key={picture.name}
              className={`relative group cursor-pointer rounded-lg p-4 ${
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
                    <Check size={16} />
                  </div>
                )}
              </div>
              <div className="mt-2">
                <h3 className="font-medium text-gray-900">{picture.name}</h3>
                <p className="text-sm text-gray-500">{picture.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProfilePictureModal;
