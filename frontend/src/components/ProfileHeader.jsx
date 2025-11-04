import React from 'react';
import GlassCard from './GlassCard';
import { motion } from 'framer-motion';
import { GoVerified } from 'react-icons/go';
import { User } from 'lucide-react'; // Import User icon

const ProfileHeader = ({ name, age, profileImage, isVerified, isOnline, profileImagePrivacy, hasAcceptedInterest }) => {

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
    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <GlassCard className="p-8 flex flex-col items-center text-center relative bg-gradient-to-br from-purple-600/10 to-pink-500/10 shadow-2xl">
        {isVerified && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5, type: 'spring' }} className="absolute top-4 right-4 text-2xl text-blue-500 bg-white rounded-full p-1">
            <GoVerified />
          </motion.div>
        )}
        <div className="relative w-48 h-48 mb-4">
          {imageToDisplay ? (
            <motion.img
              src={imageToDisplay}
              alt={name}
              className="w-full h-full rounded-full object-cover border-4 border-white shadow-md"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.4 }}
            />
          ) : (
            <div className="w-full h-full rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center mb-4 border-4 border-white dark:border-gray-800 shadow-md">
              <User size={96} className="text-gray-600 dark:text-gray-400" />
            </div>
          )}
          {isOnline && (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.6 }} className="absolute bottom-2 right-2 w-5 h-5 bg-green-500 border-2 border-white rounded-full"></motion.div>
          )}
        </div>
        <motion.h1 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="text-4xl font-bold text-gray-800 dark:text-white">{name}</motion.h1>
      </GlassCard>
    </motion.div>
  );
};

export default ProfileHeader;