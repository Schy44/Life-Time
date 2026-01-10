import React from 'react';

const SectionCard = ({ title, icon, children, isLocked, className = '' }) => (
    <section className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-4 relative overflow-hidden ${className}`}>
        <div className="flex items-center space-x-3 mb-3">
            {icon}
            <h3 className="text-sm font-semibold text-gray-800 dark:text-white">{title}</h3>
        </div>

        <div className={isLocked ? 'blur-[4px] select-none pointer-events-none opacity-40 grayscale' : ''}>
            {children}
        </div>

        {isLocked && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/5 dark:bg-gray-900/5 z-10">
                <div className="bg-white/90 dark:bg-gray-800/90 py-1 px-3 rounded-full shadow-sm border border-gray-100 dark:border-gray-700">
                    <span className="text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Locked</span>
                </div>
            </div>
        )}
    </section>
);

export default React.memo(SectionCard);

