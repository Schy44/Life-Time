import React from 'react';
import GlassCard from './GlassCard';
import './ProfileHeader.css';
import { GoVerified } from 'react-icons/go';
import { User } from 'lucide-react'; // Import User icon

const ProfileHeader = ({ name, age, profileImage, isVerified, isOnline, compatibility, profileImagePrivacy, hasAcceptedInterest }) => {

  let imageToDisplay = null;

  // Logic to determine which image to display
  if (profileImage) { // Only consider if a profileImage URL is actually provided
    if (profileImagePrivacy === 'public') {
      imageToDisplay = profileImage;
    } else if (profileImagePrivacy === 'matches') {
      if (hasAcceptedInterest) {
        imageToDisplay = profileImage;
      }
    }
    // If profileImagePrivacy is 'private' or doesn't meet 'matches' criteria, imageToDisplay remains null
  }

  return (
    <GlassCard className="p-6 flex flex-col items-center text-center relative">
      {isVerified && (
        <div className="absolute top-4 right-4 text-2xl text-blue-500 bg-white rounded-full p-1">
          <GoVerified />
        </div>
      )}
      <div className="relative w-40 h-40 mb-4">
        <div className="profile-ring"></div>
        {imageToDisplay ? (
          <img
            src={imageToDisplay}
            alt={name}
            className="w-full h-full rounded-full object-cover border-4 border-white shadow-md"
          />
        ) : (
          <div className="w-full h-full rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center border-4 border-white dark:border-gray-800 shadow-md">
            <User size={80} className="text-gray-600 dark:text-gray-400" />
          </div>
        )}
        {isOnline && (
          <div className="absolute bottom-2 right-2 w-5 h-5 bg-green-500 border-2 border-white rounded-full"></div>
        )}
      </div>
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white">{name}</h1>
      <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">Compatibility: {compatibility}%</div>
    </GlassCard>
  );
};

export default ProfileHeader;