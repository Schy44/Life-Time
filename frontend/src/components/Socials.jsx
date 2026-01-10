import React from 'react';
import { motion } from 'framer-motion';
import { FaFacebook, FaInstagram, FaLinkedin } from 'react-icons/fa';

const Socials = ({ socials }) => {
  const IconComponents = {
    FaFacebook,
    FaInstagram,
    FaLinkedin,
  };

  return (
    <div className="flex justify-center space-x-3 my-4">
      {socials && socials.map((social, index) => {
        const Icon = IconComponents[social.icon];
        const isLocked = social.url === 'LOCKED';

        if (!Icon) return null;

        if (isLocked) {
          return (
            <div
              key={index}
              className="relative text-2xl text-gray-300 dark:text-gray-600 transition-colors tooltip"
              title="Unlock profile to view social links"
            >
              <Icon />
              <div className="absolute -top-1 -right-1 bg-gray-200 dark:bg-gray-800 rounded-full p-0.5 border border-white dark:border-gray-900 shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
              </div>
            </div>
          );
        }

        return (
          <motion.a
            key={index}
            href={social.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-2xl text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
            whileHover={{ scale: 1.2, rotate: 5 }}
            whileTap={{ scale: 0.9 }}
          >
            <Icon />
          </motion.a>
        );
      })}
    </div>
  );
};

export default React.memo(Socials);