import React from 'react';
import GlassCard from './GlassCard';
import './ProfileHeader.css';
import { GoVerified } from 'react-icons/go';

const ProfileHeader = ({ name, age, profileImage, isVerified, isOnline, compatibility, profileImagePrivacy, hasAcceptedInterest }) => {
  const defaultAvatar = `data:image/svg+xml;charset=UTF-8,%3csvg width='150' height='150' viewBox='0 0 150 150' fill='none' xmlns='http://www.w3.org/2000/svg'%3e%3ccircle cx='75' cy='75' r='75' fill='%23E0E0E0'/%3e%3cpath d='M100 80C100 66.1929 88.8071 55 75 55C61.1929 55 50 66.1929 50 80' stroke='%239E9E9E' stroke-width='5' stroke-linecap='round'/%3e%3cpath d='M60 100C60 94.4772 64.4772 90 70 90H80C85.5228 90 90 94.4772 90 100' stroke='%239E9E9E' stroke-width='5' stroke-linecap='round'/%3e%3c/svg%3e`; // Default avatar SVG

  let imageToDisplay = null;

  // If privacy is public, show actual image if available, otherwise nothing.
  if (profileImagePrivacy === 'public') {
    imageToDisplay = profileImage;
  } 
  // If privacy is matches-only
  else if (profileImagePrivacy === 'matches') {
    if (hasAcceptedInterest) {
      // If accepted interest, show actual image if available, otherwise default avatar.
      imageToDisplay = profileImage || defaultAvatar;
    } else {
      // If no accepted interest, show default avatar.
      imageToDisplay = defaultAvatar;
    }
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
          null
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