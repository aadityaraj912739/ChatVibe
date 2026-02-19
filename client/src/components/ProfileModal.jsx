import React, { useState, useRef } from 'react';
import { XMarkIcon, CameraIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';
import { userAPI } from '../services/api';
import Avatar from './Avatar';

const ProfileModal = ({ isOpen, onClose }) => {
  const { user, setUser } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedImage) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('profilePicture', selectedImage);

      const response = await userAPI.uploadProfilePicture(formData);
      
      // Update user in context
      const updatedUser = { ...user, avatar: response.data.avatar };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));

      // Clear selection
      setSelectedImage(null);
      setImagePreview(null);
      
      alert('Profile picture updated successfully!');
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload profile picture. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Profile Settings
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <XMarkIcon className="h-6 w-6 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <div className="flex flex-col items-center space-y-4">
            {/* Current Avatar */}
            <div className="relative">
              {imagePreview ? (
                <img 
                  src={imagePreview} 
                  alt="Preview" 
                  className="w-32 h-32 rounded-full object-cover border-4 border-primary-500"
                />
              ) : (
                <Avatar user={user} size="xl" />
              )}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 p-2 bg-primary-600 text-white rounded-full hover:bg-primary-700 shadow-lg"
                title="Change profile picture"
              >
                <CameraIcon className="h-5 w-5" />
              </button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />

            {/* User Info */}
            <div className="text-center">
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {user?.username}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {user?.email}
              </p>
            </div>

            {/* Upload Button */}
            {selectedImage && (
              <div className="flex space-x-2 w-full">
                <button
                  onClick={handleUpload}
                  disabled={uploading}
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {uploading ? 'Uploading...' : 'Upload Photo'}
                </button>
                <button
                  onClick={() => {
                    setSelectedImage(null);
                    setImagePreview(null);
                    if (fileInputRef.current) {
                      fileInputRef.current.value = '';
                    }
                  }}
                  disabled={uploading}
                  className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
