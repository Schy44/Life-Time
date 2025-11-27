import React from 'react';

/**
 * Skeleton loading component for profile cards
 * Shows placeholder content while data loads
 */
const SkeletonLoader = ({ type = 'card' }) => {
    const baseClass = "animate-pulse bg-gray-300 dark:bg-gray-700 rounded";

    if (type === 'card') {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 space-y-4">
                {/* Profile image skeleton */}
                <div className={`${baseClass} w-full h-48`} />

                {/* Name skeleton */}
                <div className={`${baseClass} h-6 w-3/4`} />

                {/* Details skeleton */}
                <div className="space-y-2">
                    <div className={`${baseClass} h-4 w-full`} />
                    <div className={`${baseClass} h-4 w-5/6`} />
                </div>

                {/* Buttons skeleton */}
                <div className="flex gap-2">
                    <div className={`${baseClass} h-10 w-1/2`} />
                    <div className={`${baseClass} h-10 w-1/2`} />
                </div>
            </div>
        );
    }

    if (type === 'list') {
        return (
            <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex items-center space-x-4 bg-white dark:bg-gray-800 rounded-lg p-4">
                        <div className={`${baseClass} w-16 h-16 rounded-full`} />
                        <div className="flex-1 space-y-2">
                            <div className={`${baseClass} h-4 w-1/3`} />
                            <div className={`${baseClass} h-3 w-1/2`} />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (type === 'profile') {
        return (
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header skeleton */}
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 space-y-4">
                    <div className="flex items-center space-x-4">
                        <div className={`${baseClass} w-24 h-24 rounded-full`} />
                        <div className="flex-1 space-y-2">
                            <div className={`${baseClass} h-6 w-1/4`} />
                            <div className={`${baseClass} h-4 w-1/3`} />
                        </div>
                    </div>
                </div>

                {/* Content skeleton */}
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 space-y-3">
                    <div className={`${baseClass} h-5 w-1/4`} />
                    <div className={`${baseClass} h-4 w-full`} />
                    <div className={`${baseClass} h-4 w-full`} />
                    <div className={`${baseClass} h-4 w-3/4`} />
                </div>
            </div>
        );
    }

    // Default skeleton
    return <div className={`${baseClass} h-32 w-full`} />;
};

export default SkeletonLoader;
