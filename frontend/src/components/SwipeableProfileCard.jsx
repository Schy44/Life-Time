import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { Heart, X, MapPin, Star } from 'lucide-react';

/**
 * Swipeable Tinder-style profile card component
 * Supports drag gestures for like (right) and pass (left)
 */
const SwipeableProfileCard = ({
    profileData,
    onSwipeLeft,
    onSwipeRight,
    style = {},
    isTop = false
}) => {
    const [exitX, setExitX] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const navigate = useNavigate();

    const x = useMotionValue(0);
    const rotate = useTransform(x, [-200, 200], [-25, 25]);
    const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);

    // Color overlays based on swipe direction
    const likeOpacity = useTransform(x, [0, 100], [0, 1]);
    const nopeOpacity = useTransform(x, [-100, 0], [1, 0]);

    const {
        name = 'Unnamed',
        profile_image,
        additional_images = [],
        date_of_birth,
        current_city,
        bio,
        compatibility_score
    } = profileData || {};

    // Calculate age
    const age = date_of_birth
        ? new Date().getFullYear() - new Date(date_of_birth).getFullYear()
        : null;

    // Get all images
    const allImages = [
        profile_image,
        ...additional_images.map(img => img.image_url || img.url)
    ].filter(Boolean);

    // Use first 3 images for display
    const displayImages = allImages.slice(0, 3);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const handleDragStart = () => {
        setIsDragging(true);
    };

    const handleDragEnd = (event, info) => {
        // Small timeout to ensure drag state is set before click fires
        setTimeout(() => setIsDragging(false), 50);

        if (Math.abs(info.offset.x) > 100) {
            // Swipe threshold reached
            setExitX(info.offset.x > 0 ? 200 : -200);

            setTimeout(() => {
                if (info.offset.x > 0) {
                    onSwipeRight && onSwipeRight(profileData);
                } else {
                    onSwipeLeft && onSwipeLeft(profileData);
                }
            }, 200);
        }
    };

    const handleLikeClick = () => {
        setExitX(200);
        setTimeout(() => {
            onSwipeRight && onSwipeRight(profileData);
        }, 200);
    };

    const handlePassClick = () => {
        setExitX(-200);
        setTimeout(() => {
            onSwipeLeft && onSwipeLeft(profileData);
        }, 200);
    };

    const handleCardClick = (e) => {
        // Don't navigate if user was dragging
        if (isDragging) return;

        // Only navigate if clicking on the center area (not buttons or image nav zones)
        if (!isTop) return;

        const target = e.target;
        const isButton = target.closest('button');

        // Don't navigate if clicking buttons
        if (isButton) return;

        // Navigate to profile detail page
        if (profileData?.id) {
            navigate(`/profiles/${profileData.id}`);
        }
    };

    return (
        <motion.div
            style={{
                x,
                rotate,
                opacity,
                position: 'absolute',
                width: '100%',
                height: '100%',
                cursor: isTop ? 'grab' : 'default',
                ...style
            }}
            drag={isTop ? "x" : false}
            dragConstraints={{ left: 0, right: 0 }}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            animate={exitX !== 0 ? { x: exitX * 2 } : {}}
            transition={{ duration: 0.2 }}
            whileDrag={{ cursor: 'grabbing' }}
            className="select-none"
        >
            <div className="relative h-full w-full bg-white dark:bg-gray-800 rounded-3xl overflow-hidden shadow-2xl">
                {/* Like Overlay */}
                <motion.div
                    style={{ opacity: likeOpacity }}
                    className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none"
                >
                    <div className="bg-green-500 text-white text-4xl font-bold px-8 py-4 rounded-2xl border-4 border-white rotate-12 shadow-xl">
                        LIKE
                    </div>
                </motion.div>

                {/* Nope Overlay */}
                <motion.div
                    style={{ opacity: nopeOpacity }}
                    className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none"
                >
                    <div className="bg-red-500 text-white text-4xl font-bold px-8 py-4 rounded-2xl border-4 border-white -rotate-12 shadow-xl">
                        NOPE
                    </div>
                </motion.div>

                {/* Main Image */}
                <div
                    className="relative h-full w-full cursor-pointer"
                    onClick={handleCardClick}
                >
                    <img
                        src={displayImages[currentImageIndex] || profile_image || '/placeholder-profile.png'}
                        alt={name}
                        className="w-full h-full object-cover"
                        draggable="false"
                        onError={(e) => {
                            if (e.target.src !== window.location.origin + '/placeholder-profile.png') {
                                e.target.src = '/placeholder-profile.png';
                            }
                        }}
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                    {/* Image Indicators */}
                    {displayImages.length > 1 && (
                        <div className="absolute top-4 left-4 right-4 flex gap-1 z-20">
                            {displayImages.map((_, idx) => (
                                <div
                                    key={idx}
                                    className={`flex-1 h-1 rounded-full transition-all ${idx === currentImageIndex
                                        ? 'bg-white'
                                        : 'bg-white/30'
                                        }`}
                                />
                            ))}
                        </div>
                    )}

                    {/* Compatibility Badge */}
                    {compatibility_score && (
                        <div className="absolute top-6 right-4 z-20">
                            <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 py-1.5 rounded-full flex items-center gap-1 shadow-lg">
                                <Star size={14} fill="currentColor" />
                                <span className="text-xs font-bold">{compatibility_score}%</span>
                            </div>
                        </div>
                    )}

                    {/* Profile Info */}
                    <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
                        <div className="text-white">
                            <h2 className="text-3xl font-bold mb-1 drop-shadow-lg">
                                {name}
                                {age && <span className="text-2xl font-medium ml-2">{age}</span>}
                            </h2>

                            {current_city && (
                                <div className="flex items-center text-base mb-3 drop-shadow-md">
                                    <MapPin size={16} className="mr-1.5" />
                                    <span>{current_city}</span>
                                </div>
                            )}

                            {bio && (
                                <p className="text-sm leading-relaxed line-clamp-2 opacity-90 drop-shadow-md">
                                    {bio}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Click zones for changing images */}
                    {displayImages.length > 1 && isTop && (
                        <>
                            <button
                                onClick={() => setCurrentImageIndex(i => Math.max(0, i - 1))}
                                className="absolute left-0 top-0 bottom-0 w-1/3 z-10 cursor-pointer"
                                aria-label="Previous image"
                            />
                            <button
                                onClick={() => setCurrentImageIndex(i => Math.min(displayImages.length - 1, i + 1))}
                                className="absolute right-0 top-0 bottom-0 w-1/3 z-10 cursor-pointer"
                                aria-label="Next image"
                            />
                        </>
                    )}
                </div>

                {/* Action Buttons - Only show on top card */}
                {isTop && (
                    <div className="absolute bottom-8 left-0 right-0 flex justify-center items-center gap-6 z-30">
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={handlePassClick}
                            className="bg-white dark:bg-gray-700 w-16 h-16 rounded-full flex items-center justify-center shadow-xl hover:shadow-2xl transition-shadow"
                        >
                            <X size={32} className="text-red-500" />
                        </motion.button>

                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={handleLikeClick}
                            className="bg-white dark:bg-gray-700 w-16 h-16 rounded-full flex items-center justify-center shadow-xl hover:shadow-2xl transition-shadow"
                        >
                            <Heart size={32} className="text-green-500" fill="currentColor" />
                        </motion.button>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default SwipeableProfileCard;
