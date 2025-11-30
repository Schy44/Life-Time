import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import SwipeableProfileCard from './SwipeableProfileCard';
import { RotateCcw } from 'lucide-react';

/**
 * Container for swipeable profile cards in a stack
 * Manages card state and swipe actions
 */
const ProfileCardStack = ({ profiles, onLike, onPass, onUndo, onIndexChange }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [history, setHistory] = useState([]);

    const handleSwipeLeft = (profile) => {
        setHistory([...history, { profile, action: 'pass' }]);
        const newIndex = currentIndex + 1;
        setCurrentIndex(newIndex);
        onIndexChange && onIndexChange(newIndex);
        onPass && onPass(profile);
    };

    const handleSwipeRight = (profile) => {
        setHistory([...history, { profile, action: 'like' }]);
        const newIndex = currentIndex + 1;
        setCurrentIndex(newIndex);
        onIndexChange && onIndexChange(newIndex);
        onLike && onLike(profile);
    };

    const handleUndo = () => {
        if (history.length > 0) {
            const lastAction = history[history.length - 1];
            setHistory(history.slice(0, -1));
            const newIndex = Math.max(0, currentIndex - 1);
            setCurrentIndex(newIndex);
            onIndexChange && onIndexChange(newIndex);
            onUndo && onUndo(lastAction);
        }
    };

    // Show only current card and next 2 cards in stack
    const visibleCards = profiles.slice(currentIndex, currentIndex + 3);

    if (currentIndex >= profiles.length) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <div className="text-6xl mb-4">🎉</div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                    No More Profiles
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                    You've reviewed all available profiles. Check back later for new matches!
                </p>
                {history.length > 0 && (
                    <button
                        onClick={handleUndo}
                        className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-full shadow-lg transition-colors"
                    >
                        <RotateCcw size={20} />
                        Undo Last Action
                    </button>
                )}
            </div>
        );
    }

    return (
        <div className="relative w-full h-full">
            {/* Card Stack */}
            <div className="relative w-full h-full">
                <AnimatePresence>
                    {visibleCards.map((profile, index) => (
                        <SwipeableProfileCard
                            key={profile.id}
                            profileData={profile}
                            onSwipeLeft={handleSwipeLeft}
                            onSwipeRight={handleSwipeRight}
                            isTop={index === 0}
                            style={{
                                zIndex: visibleCards.length - index,
                                scale: 1 - index * 0.05,
                                y: index * 10,
                            }}
                        />
                    ))}
                </AnimatePresence>
            </div>

            {/* Undo Button */}
            {history.length > 0 && (
                <button
                    onClick={handleUndo}
                    className="absolute -bottom-20 left-1/2 transform -translate-x-1/2 flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-full shadow-md transition-colors text-sm"
                >
                    <RotateCcw size={16} />
                    Undo
                </button>
            )}
        </div>
    );
};

export default ProfileCardStack;
