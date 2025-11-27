import React from 'react';
import { motion } from 'framer-motion';

// Comprehensive faith tags organized by category
const FAITH_TAGS = {
  'Faith & Values': [
    'Practicing Muslim',
    'Spiritual',
    'Agnostic / Atheist',
    'Open-Minded',
    'Honest & Direct',
    'Multicultural Background',
  ],
  'Lifestyle': [
    'Family-Oriented',
    'Introvert',
    'Extrovert',
    'Non-Smoker',
    'Non-Drinker',
    'Gym Regular',
    'Enjoys Cooking',
    'Social Media Minimalist',
  ],
  'Dietary': [
    'Vegetarian',
    'Non-Vegetarian',
    'Halal Diet',
  ],
  'Social Preferences': [
    'Socially Active',
    'Small Circle Type',
    'Community-Oriented',
    'Loves to Travel',
    'Enjoys Reading Fiction',
  ],
  'Career & Ambition': [
    'Career-Focused',
    'Ambitious',
    'Balanced Life Seeker',
    'Prioritizes Work-Life Balance',
    'Tech Enthusiast',
  ],
  'Family & Living': [
    'Ready for Marriage',
    'Getting to Know First',
    'Wants to Live Near Family',
    'Open to Joint Family',
    'Prefers Independence',
    'Prefers Remote Work Lifestyle',
  ],
  'Language': [
    'Must Speak Bengali',
    'Must Speak English',
  ],
};

const FaithTagsSection = ({ selectedTags = [], onTagsChange, isEditing = false }) => {
  const handleTagClick = (tag) => {
    if (!isEditing) return;

    const newTags = selectedTags.includes(tag)
      ? selectedTags.filter(t => t !== tag)
      : [...selectedTags, tag];

    onTagsChange(newTags);
  };

  const isSelected = (tag) => selectedTags.includes(tag);

  // View mode: Show only selected tags as compact badges
  if (!isEditing) {
    if (selectedTags.length === 0) return null;

    return (
      <div className="flex flex-wrap gap-2">
        {selectedTags.map((tag) => (
          <motion.div
            key={tag}
            whileHover={{ scale: 1.05 }}
            className="px-3 py-1.5 rounded-full text-xs font-medium bg-white text-gray-900 border-2 border-gray-900"
          >
            {tag}
          </motion.div>
        ))}
      </div>
    );
  }

  // Edit mode: Show all tags organized by category
  return (
    <div className="space-y-6">
      {Object.entries(FAITH_TAGS).map(([category, tags]) => (
        <div key={category}>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">{category}</h3>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => {
              const selected = isSelected(tag);
              return (
                <motion.button
                  key={tag}
                  type="button"
                  onClick={() => handleTagClick(tag)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`
                    px-4 py-2 rounded-full text-sm font-medium transition-all duration-200
                    ${selected
                      ? 'bg-white text-gray-900 border-2 border-gray-900'
                      : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-gray-400'
                    }
                    cursor-pointer
                  `}
                >
                  {tag}
                </motion.button>
              );
            })}
          </div>
        </div>
      ))}

      <p className="text-xs text-gray-500 italic mt-4">
        Click on tags to select or deselect them. You can choose multiple tags that represent you.
      </p>
    </div>
  );
};

export default FaithTagsSection;
