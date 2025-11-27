import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AboutSection from './AboutSection';
import EducationTimeline from './EducationTimeline';
import CareerSection from './CareerSection';
import PreferencesCard from './PreferencesCard';
import InterestsSection from './InterestsSection';

const InfoTabs = ({ aboutData, educationData, careerData, preferencesData, interestsData, currentUserProfile, onUpdateInterests, onUpdateProfile, showPreferences, onEditSection }) => {
  const [availableTabs, setAvailableTabs] = useState([]);
  const [selectedTab, setSelectedTab] = useState('');

  console.log("careerData in InfoTabs:", careerData);

  useEffect(() => {
    const newTabs = ['About', 'Education', 'Career'];
    if (showPreferences) {
      newTabs.push('Preferences');
    }
    if (currentUserProfile && interestsData) {
      newTabs.push('Interests');
    }
    setAvailableTabs(newTabs);

    setSelectedTab(prevSelectedTab => {
      if (!prevSelectedTab || !newTabs.includes(prevSelectedTab)) {
        return newTabs[0] || 'About';
      }
      return prevSelectedTab;
    });
  }, [showPreferences, currentUserProfile, interestsData]);


  const renderContent = () => {
    switch (selectedTab) {
      case 'About':
        return <AboutSection aboutData={aboutData} onEdit={() => onEditSection?.('about')} />;
      case 'Education':
        return <EducationTimeline educationData={educationData} onUpdateProfile={onUpdateProfile} onEdit={() => onEditSection?.('education')} />;
      case 'Career':
        return <CareerSection careerData={careerData} onUpdateProfile={onUpdateProfile} onEdit={() => onEditSection?.('career')} />; case 'Preferences':
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
        <ul className="flex bg-white rounded-full p-1 shadow-md border border-gray-200">
          {availableTabs.map((item) => (
            <li
              key={item}
              className="relative"
            >
              {selectedTab === item && (
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full"
                  layoutId="bubble"
                />
              )}
              <button
                className={`relative px-4 py-2 rounded-full text-sm font-medium transition ${selectedTab === item ? 'text-white' : 'text-gray-700'
                  }`}
                onClick={() => setSelectedTab(item)}
              >
                {item}
              </button>
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