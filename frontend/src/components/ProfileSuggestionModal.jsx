import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes } from 'react-icons/fa';

/**
 * Instagram-style profile suggestion modal
 * Displays a user's profile with photos in a grid and action buttons
 */
const ProfileSuggestionModal = ({
    isOpen,
    onClose,
    profileData,
    onAction,
    actionLabel = "Follow",
    actionIcon = null
}) => {
    const [activePhotoIndex, setActivePhotoIndex] = useState(0);

    if (!isOpen || !profileData) return null;

    const {
        name = 'Unnamed',
        profile_image,
        additional_images = [],
        date_of_birth,
        current_city
    } = profileData;

    // Calculate age
    const age = date_of_birth
        ? new Date().getFullYear() - new Date(date_of_birth).getFullYear()
        : null;

    // Gather all images
    const allImages = [
        profile_image,
        ...additional_images.map(img => img.image_url || img.url)
    ].filter(Boolean);

    // Get first 3 images for grid
    const displayImages = allImages.slice(0, 3);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="relative bg-gradient-to-b from-gray-900 to-black rounded-3xl overflow-hidden shadow-2xl max-w-sm w-full"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Close button */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 z-20 bg-black/50 backdrop-blur-sm text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                            aria-label="Close"
                        >
                            <FaTimes size={16} />
                        </button>

                        {/* Header text */}
                        <div className="text-center pt-8 pb-4 px-6">
                            <h2 className="text-white text-sm font-medium">
                                Welcome to Life-Time
                            </h2>
                            <p className="text-gray-400 text-xs mt-1">
                                When you connect, you'll see the photos and updates they share here.
                            </p>
                        </div>

                        {/* Profile card */}
                        <div className="px-4 pb-6">
                            <div className="bg-gray-800/60 backdrop-blur-md rounded-2xl p-6 border border-gray-700/50">
                                {/* Profile Image */}
                                <div className="flex justify-center mb-4">
                                    <div className="relative">
                                        <div className="w-20 h-20 rounded-full overflow-hidden ring-4 ring-purple-500/30">
                                            <img
                                                src={profile_image || '/placeholder-profile.png'}
                                                alt={name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Name and location */}
                                <div className="text-center mb-1">
                                    <h3 className="text-white font-semibold text-base">
                                        {name}
                                    </h3>
                                    {(age || current_city) && (
                                        <p className="text-gray-400 text-sm mt-0.5">
                                            {age && current_city ? `${age} • ${current_city}` : age || current_city}
                                        </p>
                                    )}
                                </div>

                                {/* Photo grid */}
                                {displayImages.length > 0 && (
                                    <div className="mt-4 mb-4">
                                        <div className="grid grid-cols-3 gap-1 rounded-lg overflow-hidden">
                                            {displayImages.map((image, idx) => (
                                                <div
                                                    key={idx}
                                                    className="aspect-square relative cursor-pointer overflow-hidden hover:opacity-90 transition-opacity"
                                                    onClick={() => setActivePhotoIndex(idx)}
                                                >
                                                    <img
                                                        src={image}
                                                        alt={`Photo ${idx + 1}`}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                            ))}
                                        </div>

                                        {/* "Suggested for you" label */}
                                        <div className="text-center mt-3">
                                            <span className="text-gray-500 text-xs">
                                                Suggested for you
                                            </span>
                                        </div>
                                    </div>
                                )}

                                {/* Action button */}
                                <button
                                    onClick={onAction}
                                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-purple-500/30"
                                >
                                    {actionIcon && <span>{actionIcon}</span>}
                                    {actionLabel}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default ProfileSuggestionModal;
