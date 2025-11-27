import React from 'react';
import './LoadingSpinner.css';

/**
 * Loading spinner for Life-Time platform
 * Features smooth liquid wave animation
 */
const LoadingSpinner = ({ size = 'medium', message = 'Loading...' }) => {
    const sizes = {
        small: { container: 'h-20', loader: 'loader-small', text: 'text-sm' },
        medium: { container: 'h-32', loader: 'loader-medium', text: 'text-base' },
        large: { container: 'h-40', loader: 'loader-large', text: 'text-lg' },
        fullscreen: { container: 'min-h-screen', loader: 'loader-fullscreen', text: 'text-xl' }
    };

    const config = sizes[size];

    return (
        <div className={`flex flex-col items-center justify-center ${config.container} space-y-6`}>
            {/* Liquid Wave Loader */}
            <div className={`loader ${config.loader}`} />

            {/* Loading message */}
            <div className="text-center space-y-2 animate-pulse">
                <h2 className={`font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent ${config.text}`}>
                    Life-Time
                </h2>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                    {message}
                </p>
            </div>
        </div>
    );
};

export default LoadingSpinner;
