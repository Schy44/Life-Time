import React from 'react';
import GlassCard from './GlassCard';
import { motion } from 'framer-motion';
import { GoVerified } from 'react-icons/go';
import { User } from 'lucide-react'; // Import User icon

const ProfileHeader = ({ name, age, profileImage, isVerified, isOnline, profileImagePrivacy, hasAcceptedInterest }) => {

  let imageToDisplay = null;

  // Logic to determine which image to display
  // If backend returns the URL, it means the user has permission (public OR matched)
  if (profileImage || hasAcceptedInterest) {
    imageToDisplay = profileImage || '/placeholder-profile.png';
  }

  return (
    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full">

      {/* Name Section - Placed above the box */}
      <div className="flex items-center justify-between mb-4 px-2">
        <motion.h1
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-4xl font-bold text-gray-900 dark:text-white tracking-tight"
        >
          {name}
        </motion.h1>

        {isVerified && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: 'spring' }}
            className="flex items-center gap-2 px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-sm font-semibold"
          >
            <GoVerified size={16} />
            <span>Verified</span>
          </motion.div>
        )}
      </div>

      {/* The Box - Image fills the entire container */}
      <motion.div
        className="relative w-full h-[500px] rounded-3xl overflow-hidden shadow-2xl bg-gray-100 dark:bg-gray-800 group"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.5 }}
      >
        {imageToDisplay ? (
          <img
            src={imageToDisplay}
            alt={name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
            <User size={120} className="text-gray-300 dark:text-gray-600 mb-4" />
            <p className="text-gray-400 dark:text-gray-500 font-medium">No profile photo</p>
          </div>
        )}

        {/* Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60"></div>

        {/* Online Status Indicator - Bottom Right */}
        {isOnline && (
          <div className="absolute bottom-6 right-6 flex items-center gap-2 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-bold text-gray-800 dark:text-white">Online Now</span>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default ProfileHeader;