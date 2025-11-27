import React from 'react';

const SectionCard = ({ title, icon, children, className = '' }) => (
    <section className={`bg-white rounded-xl shadow-sm border p-4 ${className}`}>
        <div className="flex items-center space-x-3 mb-3">
            {icon}
            <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
        </div>

        <div>{children}</div>
    </section>
);

export default SectionCard;
