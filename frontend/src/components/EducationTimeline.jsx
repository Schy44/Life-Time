import React from 'react';
import GlassCard from './GlassCard';
import './Components.css';

const EducationTimeline = ({ educationData, onEdit }) => {
  return (
    <GlassCard className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="section-title dark:text-white">Education</h2>
        {onEdit && (
          <button
            onClick={onEdit}
            className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
          >
            Edit
          </button>
        )}
      </div>
      <div className="timeline-container">
        {educationData && educationData.map((item, index) => (
          <div key={index} className="timeline-item">
            <div className="timeline-dot"></div>
            <div className="timeline-content">
              <h4 className="font-bold text-lg text-gray-800 dark:text-white">{item.degree}</h4>
              <p className="text-gray-600 dark:text-gray-300">{item.school} - {item.graduation_year}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{item.field_of_study}</p>
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
};

export default EducationTimeline;