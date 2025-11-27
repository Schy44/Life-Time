import React from 'react';
import { motion } from 'framer-motion';
import { FaTimes } from 'react-icons/fa';
import PublicProfileView from './PublicProfileView';

const PreviewModal = ({ profileData, onClose }) => {
    if (!profileData) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 p-4 pt-20 overflow-y-auto">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative w-full max-w-6xl bg-gray-50 rounded-2xl shadow-2xl my-8"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 bg-white rounded-full p-3 shadow-lg hover:bg-gray-100 transition"
                    aria-label="Close preview"
                >
                    <FaTimes className="text-gray-700" />
                </button>

                {/* Header */}
                <div className="bg-gradient-to-r from-purple-600 to-pink-500 text-white p-6 rounded-t-2xl">
                    <h2 className="text-2xl font-bold">Public Profile Preview</h2>
                    <p className="text-sm opacity-90 mt-1">This is how others will see your profile</p>
                </div>

                {/* Content - using actual PublicProfileView component */}
                <div className="p-6 max-h-[80vh] overflow-y-auto">
                    <PublicProfileView
                        profileData={profileData}
                        isPreview={true}
                        showInterestControls={false}
                    />
                </div>
            </motion.div>
        </div>
    );
};

export default PreviewModal;
