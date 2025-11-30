import React, { useState } from 'react';
import ProfileSuggestionModal from './ProfileSuggestionModal';
import { FaHeart } from 'react-icons/fa';

/**
 * Example usage of ProfileSuggestionModal
 * This demonstrates how to integrate the Instagram-style modal
 */
const ProfileSuggestionExample = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Sample profile data - replace with real data from your API
    const sampleProfile = {
        name: "Mehedi Hasan",
        date_of_birth: "1996-01-01", // Would calculate to ~28 years old
        current_city: "Dhaka",
        profile_image: "https://randomuser.me/api/portraits/men/44.jpg",
        additional_images: [
            { image_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400" },
            { image_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400" },
            { image_url: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400" }
        ]
    };

    const handleConnect = () => {
        console.log("Connecting with user...");
        // Add your connect logic here (e.g., send connection request)
        setIsModalOpen(false);
    };

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-4">
            <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
                    Profile Suggestion Modal Demo
                </h1>

                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-200 shadow-lg shadow-purple-500/30"
                >
                    Show Profile Suggestion
                </button>

                <div className="mt-12 p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg max-w-md mx-auto">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Usage Example
                    </h2>
                    <pre className="text-left text-xs bg-gray-100 dark:bg-gray-900 p-4 rounded-lg overflow-auto">
                        {`<ProfileSuggestionModal
  isOpen={isModalOpen}
  onClose={() => setIsModalOpen(false)}
  profileData={profileData}
  onAction={handleConnect}
  actionLabel="Connect"
  actionIcon={<FaHeart />}
/>`}
                    </pre>
                </div>
            </div>

            {/* Profile Suggestion Modal */}
            <ProfileSuggestionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                profileData={sampleProfile}
                onAction={handleConnect}
                actionLabel="Connect"
                actionIcon={<FaHeart />}
            />
        </div>
    );
};

export default ProfileSuggestionExample;
