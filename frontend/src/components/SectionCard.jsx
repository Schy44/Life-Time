import React from 'react';

const SectionCard = ({ title, icon, children, className = '' }) => (
    <section className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-4 ${className}`}>
        <div className="flex items-center space-x-3 mb-3">
            {icon}
            <h3 className="text-sm font-semibold text-gray-800 dark:text-white">{title}</h3>
        </div>

        <div>{children}</div>
    </section>
);

export default SectionCard;
