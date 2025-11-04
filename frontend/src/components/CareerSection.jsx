import React from 'react';
import GlassCard from './GlassCard';
import './Components.css';

const CareerSection = ({ careerData }) => {
  const currentJob = careerData?.find(job => job.currently_working);
  const previousJobs = careerData?.filter(job => !job.currently_working);

  return (
    <GlassCard className="p-6">
      <h2 className="section-title dark:text-white">Career</h2>
      <div className="space-y-4">
        {currentJob && (
          <div>
            <h3 className="subsection-title dark:text-white">Currently Working At</h3>
            <div className="p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg">
              <h4 className="font-bold text-lg text-gray-800 dark:text-white">{currentJob.title}</h4>
              <p className="text-gray-600 dark:text-gray-300">{currentJob.company}</p>
            </div>
          </div>
        )}
        {previousJobs && previousJobs.length > 0 && (
          <div>
            <h3 className="subsection-title dark:text-white">Previous Experience</h3>
            {previousJobs.map((job, index) => (
              <div key={index} className="p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg mt-4">
                <h4 className="font-bold text-lg text-gray-800 dark:text-white">{job.title}</h4>
                <p className="text-gray-600 dark:text-gray-300">{job.company}</p>
              </div>
            ))}
          </div>
        )}
        {!currentJob && (!previousJobs || previousJobs.length === 0) && (
          <p className="text-gray-600 dark:text-gray-300">No career information available.</p>
        )}
      </div>
    </GlassCard>
  );
};

export default CareerSection;