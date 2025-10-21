import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

const Footer = () => {
  return (
    <motion.footer
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-white relative pt-12 px-4 overflow-hidden"
    >
      {/* Curved Line Separator */}
      <svg
        className="absolute top-0 left-0 w-full h-24 text-gray-100 dark:text-gray-800 transform -translate-y-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <path d="M0,100 C30,50 70,50 100,100 L100,0 L0,0 Z" fill="currentColor" />
      </svg>

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
        {/* About Section */}
        <div className="text-center md:text-left">
          <h3 className="text-2xl font-bold mb-4 text-purple-600 dark:text-purple-400">Life-Time</h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
            Connecting souls, not just profiles. A private, secure, and authentic space for educated professionals to build meaningful relationships.
          </p>
        </div>

        {/* Quick Links */}
        <div className="text-center md:text-left">
          <h3 className="text-xl font-semibold mb-4">Quick Links</h3>
          <ul className="space-y-2">
            <li><Link to="/" className="text-gray-600 hover:text-purple-800 dark:text-gray-400 dark:hover:text-purple-300 transition-colors duration-200">Home</Link></li>
            <li><Link to="/about" className="text-gray-600 hover:text-purple-800 dark:text-gray-400 dark:hover:text-purple-300 transition-colors duration-200">About Us</Link></li>
            <li><Link to="/pricing" className="text-gray-600 hover:text-purple-800 dark:text-gray-400 dark:hover:text-purple-300 transition-colors duration-200">Pricing</Link></li>
            <li><Link to="/faq" className="text-gray-600 hover:text-purple-800 dark:text-gray-400 dark:hover:text-purple-300 transition-colors duration-200">FAQ</Link></li>
            <li><Link to="/contact" className="text-gray-600 hover:text-purple-800 dark:text-gray-400 dark:hover:text-purple-300 transition-colors duration-200">Contact</Link></li>
          </ul>
        </div>

        {/* Contact & Social */}
        <div className="text-center md:text-left">
          <h3 className="text-xl font-semibold mb-4">Connect With Us</h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
            Email: support@life-time.com<br />
            Phone: +1 (555) 123-4567
          </p>
          <div className="flex justify-center md:justify-start space-x-4">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-purple-800 dark:text-gray-400 dark:hover:text-purple-300 transition-colors duration-200">
              <Facebook size={20} />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-purple-800 dark:text-gray-400 dark:hover:text-purple-300 transition-colors duration-200">
              <Twitter size={20} />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-purple-800 dark:text-gray-400 dark:hover:text-purple-300 transition-colors duration-200">
              <Instagram size={20} />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-purple-800 dark:text-gray-400 dark:hover:text-purple-300 transition-colors duration-200">
              <Linkedin size={20} />
            </a>
          </div>
        </div>
      </div>

      <div className="mt-10 pt-8 border-t border-gray-300 dark:border-gray-700 text-center text-gray-500 dark:text-gray-500 text-xs">
        &copy; {new Date().getFullYear()} Life-Time. All rights reserved.
      </div>
    </motion.footer>
  );
};

export default Footer;
