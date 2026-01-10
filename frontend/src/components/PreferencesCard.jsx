import React from 'react';
import GlassCard from './GlassCard';
import '../styles/Components.css';

const PreferencesCard = ({ preferencesData }) => {
  if (!preferencesData) {
    return (
      <GlassCard className="p-6">
        <h2 className="section-title dark:text-white">Partner Preferences</h2>
        <p className="text-gray-600 dark:text-gray-300">No preferences set yet.</p>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="p-6">
      <h2 className="section-title dark:text-white">Partner Preferences</h2>
      <ul className="info-list">
        {preferencesData.min_age && preferencesData.max_age && (
          <li><span className="font-semibold text-gray-700 dark:text-gray-200">Age Range</span><span className="text-gray-700 dark:text-gray-300">{preferencesData.min_age} - {preferencesData.max_age}</span></li>
        )}
        {preferencesData.min_height_inches && (
          <li><span className="font-semibold text-gray-700 dark:text-gray-200">Min Height</span><span className="text-gray-700 dark:text-gray-300">{Math.floor(preferencesData.min_height_inches / 12)}'{preferencesData.min_height_inches % 12}"</span></li>
        )}
        {preferencesData.religion && (
          <li><span className="font-semibold text-gray-700 dark:text-gray-200">Religion</span><span className="text-gray-700 dark:text-gray-300">{preferencesData.religion}</span></li>
        )}
        {preferencesData.marital_statuses && preferencesData.marital_statuses.length > 0 && (
          <li><span className="font-semibold text-gray-700 dark:text-gray-200">Marital Status</span><span className="text-gray-700 dark:text-gray-300">{preferencesData.marital_statuses.join(', ')}</span></li>
        )}
        {preferencesData.country && (
          <li><span className="font-semibold text-gray-700 dark:text-gray-200">Country</span><span className="text-gray-700 dark:text-gray-300">{preferencesData.country}</span></li>
        )}
        {preferencesData.profession && (
          <li><span className="font-semibold text-gray-700 dark:text-gray-200">Profession</span><span className="text-gray-700 dark:text-gray-300">{preferencesData.profession}</span></li>
        )}
      </ul>
    </GlassCard>
  );
};
export default PreferencesCard;