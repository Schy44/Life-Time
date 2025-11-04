import React from 'react';
import GlassCard from './GlassCard';
import './Components.css';

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
          <li><span className="font-semibold text-gray-700 dark:text-white">Age Range</span><span className="text-gray-700 dark:text-gray-300">{preferencesData.min_age} - {preferencesData.max_age}</span></li>
        )}
        {preferencesData.min_height_cm && (
          <li><span className="font-semibold text-gray-700 dark:text-white">Min Height</span><span className="text-gray-700 dark:text-gray-300">{preferencesData.min_height_cm}cm</span></li>
        )}
        {preferencesData.religion && (
          <li><span className="font-semibold text-gray-700 dark:text-white">Religion</span><span className="text-gray-700 dark:text-gray-300">{preferencesData.religion}</span></li>
        )}
        {preferencesData.marital_statuses && preferencesData.marital_statuses.length > 0 && (
          <li><span className="font-semibold text-gray-700 dark:text-white">Marital Status</span><span className="text-gray-700 dark:text-gray-300">{preferencesData.marital_statuses.join(', ')}</span></li>
        )}
        {preferencesData.country && (
          <li><span className="font-semibold text-gray-700 dark:text-white">Country</span><span className="text-gray-700 dark:text-gray-300">{preferencesData.country}</span></li>
        )}
        {preferencesData.profession && (
          <li><span className="font-semibold text-gray-700 dark:text-white">Profession</span><span className="text-gray-700 dark:text-gray-300">{preferencesData.profession}</span></li>
        )}
        {preferencesData.require_non_alcoholic && (
          <li><span className="font-semibold text-gray-700 dark:text-white">Require Non-Alcoholic</span><span className="text-gray-700 dark:text-gray-300">Yes</span></li>
        )}
        {preferencesData.require_non_smoker && (
          <li><span className="font-semibold text-gray-700 dark:text-white">Non-Smoker</span><span className="text-gray-700 dark:text-gray-300">Yes</span></li>
        )}
      </ul>
    </GlassCard>
  );
};
export default PreferencesCard;