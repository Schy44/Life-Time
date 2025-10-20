import React from 'react';
import GlassCard from './GlassCard';
import './Components.css';

const CareerSection = ({ careerData }) => {
  return (
    <GlassCard className="p-6">
      <h2 className="section-title dark:text-white">Career</h2>
      <div className="space-y-4">
        {careerData && careerData.map((job, index) => (
          <div key={index} className="p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg">
            <h4 className="font-bold text-lg text-gray-800 dark:text-white">{job.title}</h4>
            <p className="text-gray-600 dark:text-gray-300">{job.company}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{job.duration}</p>
          </div>
        ))}
      </div>
    </GlassCard>
  );
};

export default CareerSection;