import React from 'react';
import GlassCard from './GlassCard';
import './Components.css';
import { ArrowUpRight, Heart, Book, MapPin, Home, Flag, Martini, Cigarette, Brush, Globe } from 'lucide-react';
import LanguageProficiency from './LanguageProficiency';

const formatString = (str) => {
  if (typeof str !== 'string') return str;
  return str.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
};

const iconMapping = {
  height: <ArrowUpRight size={20} className="text-purple-400" />,
  marital_status: <Heart size={20} className="text-purple-400" />,
  religion: <Book size={20} className="text-purple-400" />,
  city: <MapPin size={20} className="text-purple-400" />,
  origin: <Home size={20} className="text-purple-400" />,
  citizenship: <Flag size={20} className="text-purple-400" />,
  alcohol: <Martini size={20} className="text-purple-400" />,
  smoking: <Cigarette size={20} className="text-purple-400" />,
};

const AboutSection = ({ aboutData, userLanguages }) => {
  const { about, basicInfo, lifestyle } = aboutData;

  return (
    <GlassCard className="p-6">
      <h2 className="section-title dark:text-white">About Me</h2>
      <p className="text-gray-700 dark:text-gray-300 mb-6">{about}</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="subsection-title dark:text-white">Basic Information</h3>
          <div className="space-y-4 mt-4">
            {Object.entries(basicInfo).map(([key, value]) => (
              <div key={key} className="flex items-center space-x-4">
                <div className="w-8 h-8 flex-shrink-0 bg-purple-600/10 rounded-full flex items-center justify-center">
                  {iconMapping[key] || <div className="w-5 h-5 bg-purple-400 rounded-full" />}
                </div>
                <div>
                  <p className="font-semibold text-gray-800 dark:text-white">{formatString(key)}</p>
                  <p className="text-gray-600 dark:text-gray-300">{formatString(value)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h3 className="subsection-title dark:text-white">Lifestyle & Hobbies</h3>
          <div className="space-y-4 mt-4">
            {Object.entries(lifestyle).map(([key, value]) => (
              <div key={key} className="flex items-center space-x-4">
                <div className="w-8 h-8 flex-shrink-0 bg-purple-600/10 rounded-full flex items-center justify-center">
                  {iconMapping[key] || <div className="w-5 h-5 bg-purple-400 rounded-full" />}
                </div>
                <div>
                  <p className="font-semibold text-gray-800 dark:text-white">{formatString(key)}</p>
                  <p className="text-gray-600 dark:text-gray-300">{Array.isArray(value) ? value.map(item => typeof item === 'object' ? `${item.language} (${item.level})` : item).join(', ') : formatString(value)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </GlassCard>
  );
};

export default AboutSection;
