import React from 'react';

const GlassCard = ({ children, className }) => {
  return (
    <div
      className={`bg-white/30 dark:bg-white/10 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 ${className}`}>
      {children}
    </div>
  );
};

export default GlassCard;
