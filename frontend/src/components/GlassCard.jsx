import React from 'react';

const GlassCard = ({ children, className = '' }) => (
  <div className={`bg-white/10 backdrop-blur-md rounded-xl p-6 shadow-lg ${className}`}>
    {children}
  </div>
);

export default React.memo(GlassCard);
