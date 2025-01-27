import React, { useState } from 'react';
import { X, Loader } from 'lucide-react';

const EditProfileModal = ({ isOpen, onClose, onSave, userData }) => {
  const [formData, setFormData] = useState({
    name: userData?.name || '',
    email: userData?.email || '',
    bio: userData?.bio || '',
    socialLinks: {
      website: userData?.socialLinks?.website || '',
      github: userData?.socialLinks?.github || '',
      x: userData?.socialLinks?.x || '', // Updated from twitter to x
      linkedin: userData?.socialLinks?.linkedin || ''
    }
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    
    // Basic validations remain required
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (formData.bio && formData.bio.length > 500) {
      newErrors.bio = 'Bio must be less than 500 characters';
    }

    // URL validations - only if URL is provided
    const urlRegex = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
    Object.entries(formData.socialLinks).forEach(([key, value]) => {
      if (value && !urlRegex.test(value)) {
        newErrors[`socialLinks.${key}`] = 'Invalid URL format';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: value }
      }));
      if (errors[`${parent}.${child}`]) {
        setErrors(prev => ({ ...prev, [`${parent}.${child}`]: null }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
      if (errors[name]) {
        setErrors(prev => ({ ...prev, [name]: null }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setIsSubmitting(true);
      await onSave(formData);
      onClose();
    } catch (error) {
      setErrors(prev => ({
        ...prev,
        submit: 'Failed to update profile. Please try again.'
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Edit Profile</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Basic Information</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md border ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                } px-3 py-2 focus:border-blue-500 focus:ring-blue-500`}
              />
              {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md border ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                } px-3 py-2 focus:border-blue-500 focus:ring-blue-500`}
              />
              {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Bio</label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows={3}
                className={`mt-1 block w-full rounded-md border ${
                  errors.bio ? 'border-red-500' : 'border-gray-300'
                } px-3 py-2 focus:border-blue-500 focus:ring-blue-500`}
                placeholder="Tell us about yourself..."
              />
              <p className="mt-1 text-sm text-gray-500">
                {formData.bio.length}/500 characters
              </p>
              {errors.bio && <p className="mt-1 text-sm text-red-500">{errors.bio}</p>}
            </div>
          </div>

          {/* Social Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Social Links (Optional)</h3>
            {Object.entries(formData.socialLinks).map(([platform, value]) => (
              <div key={platform}>
                <label className="block text-sm font-medium text-gray-700 capitalize">
                  {platform === 'x' ? 'X (formerly Twitter)' : platform}
                </label>
                <input
                  type="url"
                  name={`socialLinks.${platform}`}
                  value={value}
                  onChange={handleChange}
                  placeholder={`https://${platform === 'x' ? 'x.com' : platform + '.com'}/username (optional)`}
                  className={`mt-1 block w-full rounded-md border ${
                    errors[`socialLinks.${platform}`] ? 'border-red-500' : 'border-gray-300'
                  } px-3 py-2 focus:border-blue-500 focus:ring-blue-500`}
                />
                {errors[`socialLinks.${platform}`] && (
                  <p className="mt-1 text-sm text-red-500">{errors[`socialLinks.${platform}`]}</p>
                )}
              </div>
            ))}
          </div>

          {/* Error Message */}
          {errors.submit && (
            <p className="text-sm text-red-500 text-center">{errors.submit}</p>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-4 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300 flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader className="animate-spin" size={16} />
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save Changes</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfileModal;
