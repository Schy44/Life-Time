import React from 'react';
import GlassCard from './GlassCard';
import './Components.css';

const LanguageProficiency = ({ languages }) => {
  const levelToPercent = { 'A1': 20, 'A2': 40, 'B1': 60, 'B2': 80, 'C1': 90, 'C2': 95, 'Native': 100 };

  return (
    <GlassCard className="p-6">
      <h2 className="section-title dark:text-white">Languages</h2>
      <div className="space-y-4">
        {languages && languages.map((lang, index) => (
          <div key={index}>
            <div className="flex justify-between mb-1">
              <span className="font-medium text-gray-700 dark:text-white">{lang.language}</span>
              <span className="text-sm text-gray-500 dark:text-gray-300">{lang.level}</span>
            </div>
            <div className="w-full bg-gray-200/50 dark:bg-gray-700/50 rounded-full h-2.5">
              <div 
                className="bg-gradient-to-r from-purple-600 to-pink-500 h-2.5 rounded-full"
                style={{ width: `${levelToPercent[lang.level]}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
};

export default LanguageProficiency;