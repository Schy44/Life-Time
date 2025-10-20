import React from 'react';
import GlassCard from './GlassCard';
import './Components.css';

const AboutSection = ({ aboutData }) => {
  const { about, basicInfo, lifestyle } = aboutData;

  return (
    <GlassCard className="p-6">
      <h2 className="section-title dark:text-white">About Me</h2>
      <p className="text-gray-700 dark:text-gray-300 mb-6">{about}</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="subsection-title dark:text-white">Basic Information</h3>
          <ul className="info-list">
            {Object.entries(basicInfo).map(([key, value]) => (
              <li key={key}>
                <span className="font-semibold text-gray-700 dark:text-white">{key.replace('_', ' ')}</span>
                <span className="text-gray-700 dark:text-gray-300">{value}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="subsection-title dark:text-white">Lifestyle & Hobbies</h3>
          <ul className="info-list">
            {Object.entries(lifestyle).map(([key, value]) => (
              <li key={key}>
                <span className="font-semibold text-gray-700 dark:text-white">{key}</span>
                <span className="text-gray-700 dark:text-gray-300">{Array.isArray(value) ? value.join(', ') : value}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </GlassCard>
  );
};

export default AboutSection;
