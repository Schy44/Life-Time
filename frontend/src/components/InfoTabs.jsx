import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AboutSection from './AboutSection';
import EducationTimeline from './EducationTimeline';
import CareerSection from './CareerSection';
import PreferencesCard from './PreferencesCard';
import InterestsSection from './InterestsSection';

const InfoTabs = ({ aboutData, educationData, careerData, preferencesData, interestsData, currentUserProfile, onUpdateInterests, onUpdateProfile, showPreferences }) => {
  const [availableTabs, setAvailableTabs] = useState([]);
  const [selectedTab, setSelectedTab] = useState('');

  useEffect(() => {
    const initialTabs = ['About', 'Education', 'Career'];
    if (showPreferences) {
      initialTabs.push('Preferences');
    }
    // Only add Interests tab if it's the current user's profile
    if (currentUserProfile && interestsData) { // Assuming interestsData is only passed for current user's profile
        initialTabs.push('Interests');
    }
    setAvailableTabs(initialTabs);
    setSelectedTab(initialTabs[0] || 'About'); // Set default selected tab
  }, [showPreferences, currentUserProfile, interestsData]);


  const renderContent = () => {
    switch (selectedTab) {
      case 'About':
        return <AboutSection aboutData={aboutData} />;
      case 'Education':
        return <EducationTimeline educationData={educationData} onUpdateProfile={onUpdateProfile} />;
      case 'Career':
        return <CareerSection careerData={careerData} onUpdateProfile={onUpdateProfile} />;      case 'Preferences':
        return <PreferencesCard preferencesData={preferencesData} />;
      case 'Interests':
        return <InterestsSection interests={interestsData} currentUserProfile={currentUserProfile} onUpdate={onUpdateInterests} />;
      default:
        return null;
    }
  };

  return (
    <div>
      <nav className="flex justify-center mb-6">
        <ul className="flex bg-white/50 rounded-full p-1 shadow-inner">
          {availableTabs.map((item) => (
            <li
              key={item}
              className={`px-4 py-2 rounded-full cursor-pointer relative text-sm font-medium transition ${selectedTab === item ? 'text-white' : 'text-gray-600 dark:text-gray-300'}`}
              onClick={() => setSelectedTab(item)}
            >
              {item}
              {selectedTab === item && (
                <motion.div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-500 rounded-full -z-10" layoutId="bubble" />
              )}
            </li>
          ))}
        </ul>
      </nav>
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedTab}
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -10, opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {renderContent()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default InfoTabs;