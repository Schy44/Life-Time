import React from 'react';
import { motion } from 'framer-motion';
import GlassCard from './GlassCard';

const SkeletonLoader = ({ count = 6 }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      {Array.from({ length: count }).map((_, index) => (
        <GlassCard key={index} className="p-6 flex flex-col items-center text-center animate-pulse">
          <div className="w-28 h-28 rounded-full bg-gray-300 dark:bg-gray-700 mb-4"></div>
          <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
          <div className="h-16 bg-gray-300 dark:bg-gray-700 rounded w-full"></div>
          <div className="flex flex-wrap justify-center gap-2 mt-4 w-full">
            <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded-full w-1/4"></div>
            <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded-full w-1/4"></div>
            <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded-full w-1/4"></div>
          </div>
        </GlassCard>
      ))}
    </motion.div>
  );
};

export default SkeletonLoader;
