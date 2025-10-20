import React from 'react';
import { FaPen } from 'react-icons/fa';
import { motion } from 'framer-motion';

const FloatingActionButton = ({ onClick }) => {
  return (
    <motion.button 
      className="fixed bottom-8 right-8 w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-full shadow-lg flex items-center justify-center text-2xl"
      whileHover={{ scale: 1.1, rotate: 15 }}
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
    >
      <FaPen />
    </motion.button>
  );
};

export default FloatingActionButton;