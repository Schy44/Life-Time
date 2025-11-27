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
    <div className="flex justify-center space-x-4 my-6">
      {socials && socials.map((social, index) => {
        const Icon = IconComponents[social.icon];
        return (
          Icon && (
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
          )
        );
      })}
    </div>
  );
};

export default Socials;