import React from 'react';

const InfoRow = ({ label, value, className = '' }) => (
    <div className={`flex justify-start items-center gap-2 py-1 border-b border-gray-100 dark:border-gray-700 last:border-b-0 ${className}`}>
        <div className="text-sm text-gray-900 dark:text-gray-400 w-32">{label}</div>
        <div className="text-sm font-medium text-black dark:text-gray-200">{value || '—'}</div>
    </div>
);

export default React.memo(InfoRow);

