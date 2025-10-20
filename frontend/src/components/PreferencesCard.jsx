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
        <li><span className="font-semibold text-gray-700 dark:text-white">Age Range</span><span className="text-gray-700 dark:text-gray-300">{preferencesData.min_age || 'N/A'} - {preferencesData.max_age || 'N/A'}</span></li>
        <li><span className="font-semibold text-gray-700 dark:text-white">Min Height</span><span className="text-gray-700 dark:text-gray-300">{preferencesData.min_height_cm ? `${preferencesData.min_height_cm}cm` : 'N/A'}</span></li>
        <li><span className="font-semibold text-gray-700 dark:text-white">Religion</span><span className="text-gray-700 dark:text-gray-300">{preferencesData.religions && preferencesData.religions.length > 0 ? preferencesData.religions.join(', ') : 'N/A'}</span></li>
        <li><span className="font-semibold text-gray-700 dark:text-white">Marital Status</span><span className="text-gray-700 dark:text-gray-300">{preferencesData.marital_statuses && preferencesData.marital_statuses.length > 0 ? preferencesData.marital_statuses.join(', ') : 'N/A'}</span></li>
        <li><span className="font-semibold text-gray-700 dark:text-white">Countries</span><span className="text-gray-700 dark:text-gray-300">{preferencesData.countries_whitelist && preferencesData.countries_whitelist.length > 0 ? preferencesData.countries_whitelist.join(', ') : 'N/A'}</span></li>
      </ul>
    </GlassCard>
  );
};

export default PreferencesCard;