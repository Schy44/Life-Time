import React from 'react';

const InfoRow = ({ label, value, className = '' }) => (
    <div className={`flex justify-start items-center gap-2 py-1 border-b border-gray-100 last:border-b-0 ${className}`}>
        <div className="text-sm text-gray-700 w-32">{label}</div>
        <div className="text-sm font-medium text-gray-900">{value || '—'}</div>
    </div>
);

export default InfoRow;
