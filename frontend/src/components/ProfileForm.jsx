import React, { useState, useEffect } from 'react';
import { FaPlus, FaTrash } from 'react-icons/fa';
import Select from 'react-select'; // Import react-select
import CreatableSelect from 'react-select/creatable';
import GlassCard from './GlassCard';
import FaithTagsSection from './FaithTagsSection';
import { getCountries, getProfessions, getEducationDegrees } from '../services/api.js'; // Import getCountries and getProfessions
import { useQuery } from '@tanstack/react-query';
import { useTheme } from '../context/ThemeContext'; // Import useTheme
import DragDropUpload from './DragDropUpload'; // Import DragDropUpload

// Choices from models.py
const PROFILE_FOR_CHOICES = [
  { value: 'self', label: 'Myself' },
  { value: 'son', label: 'My Son' },
  { value: 'daughter', label: 'My Daughter' },
  { value: 'brother', label: 'My Brother' },
  { value: 'sister', label: 'My Sister' },
  { value: 'relative', label: 'Relative/Friend' },
];

const GENDER_CHOICES = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
];

const BLOOD_GROUP_CHOICES = [
  { value: 'A+', label: 'A+' }, { value: 'A-', label: 'A-' },
  { value: 'B+', label: 'B+' }, { value: 'B-', label: 'B-' },
  { value: 'AB+', label: 'AB+' }, { value: 'AB-', label: 'AB-' },
  { value: 'O+', label: 'O+' }, { value: 'O-', label: 'O-' },
];

const RELIGION_CHOICES = [
  { value: 'muslim', label: 'Muslim' },
  { value: 'hindu', label: 'Hindu' },
  { value: 'christian', label: 'Christian' },
];

const ALCOHOL_CHOICES = [
  { value: 'never', label: 'Never' },
  { value: 'occasionally', label: 'Occasionally' },
  { value: 'socially', label: 'Socially' },
];

const SMOKING_CHOICES = [
  { value: 'never', label: 'Never' },
  { value: 'occasionally', label: 'Occasionally' },
  { value: 'yes', label: 'Yes' },
];

const FAMILY_TYPE_CHOICES = [
  { value: 'nuclear', label: 'Nuclear Family' },
  { value: 'joint', label: 'Joint Family' },
];

const MARITAL_STATUS_CHOICES = [
  { value: 'never_married', label: 'Never Married' },
  { value: 'divorced', label: 'Divorced' },
  { value: 'widowed', label: 'Widowed' },
];

const PRIVACY_CHOICES = [
  { value: 'public', label: 'Public' },
  { value: 'matches', label: 'Matches Only' },
];

const SKIN_COMPLEXION_CHOICES = [
  { value: 'fair', label: 'Fair' },
  { value: 'light', label: 'Light' },
  { value: 'medium', label: 'Medium' },
  { value: 'olive', label: 'Olive' },
  { value: 'brown', label: 'Brown' },
  { value: 'dark', label: 'Dark' },
];





const ProfileForm = ({ initialData, onSubmit, section = 'all' }) => {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';

  const [formData, setFormData] = useState(() => {
    const prefs = { ...(initialData.preference || {}) };
    ['country', 'profession', 'marital_statuses'].forEach(field => {
      if (prefs[field] && !Array.isArray(prefs[field])) {
        prefs[field] = [prefs[field]];
      } else if (!prefs[field]) {
        prefs[field] = [];
      }
    });
    return {
      ...initialData,
      preference: prefs,
    };
  });
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState(null);
  const profileImageInputRef = React.useRef(null);
  const [additionalImageFiles, setAdditionalImageFiles] = useState([]);
  const [additionalImagesToKeep, setAdditionalImagesToKeep] = useState(initialData.additional_images ? initialData.additional_images.map(img => img.id) : []);
  const [errors, setErrors] = useState({});
  const [countries, setCountries] = useState([]); // Local state, sourced from cached query
  const [professions, setProfessions] = useState([]); // Local state, sourced from cached query
  const [degrees, setDegrees] = useState([]);
  const [showDraftToast, setShowDraftToast] = useState(false);
  const [portalTarget, setPortalTarget] = useState(null);

  useEffect(() => {
    setPortalTarget(document.body);
  }, []);

  // Autosave Draft to LocalStorage
  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData && Object.keys(formData).length > 0) {
        // We don't save initial state if it's the first render
        localStorage.setItem(`profile_draft_${initialData.id || 'new'}`, JSON.stringify(formData));
      }
    }, 1000); // 1s debounce
    return () => clearTimeout(timer);
  }, [formData, initialData.id]);

  // Check for existing draft on mount
  useEffect(() => {
    const savedDraft = localStorage.getItem(`profile_draft_${initialData.id || 'new'}`);
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft);
        // Only show toast if the draft is actually different from initialData
        const isDifferent = JSON.stringify(parsed) !== JSON.stringify(initialData);
        if (isDifferent) {
          setShowDraftToast(true);
        }
      } catch (e) {
        console.error("Error parsing draft", e);
      }
    }
  }, [initialData]);

  const restoreDraft = () => {
    const savedDraft = localStorage.getItem(`profile_draft_${initialData.id || 'new'}`);
    if (savedDraft) {
      setFormData(JSON.parse(savedDraft));
      setShowDraftToast(false);
    }
  };

  const discardDraft = () => {
    localStorage.removeItem(`profile_draft_${initialData.id || 'new'}`);
    setShowDraftToast(false);
  };

  const { data: countriesData } = useQuery({
    queryKey: ['countries'],
    queryFn: getCountries,
    staleTime: 1000 * 60 * 60, // 1 hour
  });

  const { data: professionsData } = useQuery({
    queryKey: ['professions'],
    queryFn: getProfessions,
    staleTime: 1000 * 60 * 60, // 1 hour
  });

  const { data: degreesData } = useQuery({
    queryKey: ['degrees'],
    queryFn: getEducationDegrees,
    staleTime: 1000 * 60 * 60, // 1 hour
  });

  useEffect(() => {
    const prefs = { ...(initialData.preference || {}) };
    ['country', 'profession', 'marital_statuses'].forEach(field => {
      if (prefs[field] && !Array.isArray(prefs[field])) {
        prefs[field] = [prefs[field]];
      } else if (!prefs[field]) {
        prefs[field] = [];
      }
    });

    setFormData({
      ...initialData,
      preference: prefs,
    });
    setAdditionalImagesToKeep(initialData.additional_images ? initialData.additional_images.map(img => img.id) : []);
  }, [initialData]);

  useEffect(() => {
    if (countriesData) setCountries(countriesData);
    if (professionsData) setProfessions(professionsData.map(p => ({ value: p, label: p })));
    if (degreesData) setDegrees(degreesData.map(d => ({ value: d, label: d })));
  }, [countriesData, professionsData, degreesData]);

  useEffect(() => {
    if (formData.religion && !RELIGION_CHOICES.some(choice => choice.value === formData.religion)) {
      setFormData(prev => ({
        ...prev,
        religion: '', // Or a default value
      }));
    }
  }, [formData.religion]);

  useEffect(() => {
    if (formData.preference?.religion && !RELIGION_CHOICES.some(choice => choice.value === formData.preference.religion)) {
      setFormData(prev => ({
        ...prev,
        preference: {
          ...prev.preference,
          religion: '', // Or a default value
        },
      }));
    }
  }, [formData.preference?.religion]);

  // Cleanup preview URL ONLY when component unmounts (not on every change!)
  useEffect(() => {
    return () => {
      if (profileImagePreview) {
        URL.revokeObjectURL(profileImagePreview);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array - only run on unmount

  const handleChange = (e) => {
    const name = e.target.name;
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleNestedChange = (section, index, field, value) => {
    const updatedSection = [...formData[section]];
    updatedSection[index] = {
      ...updatedSection[index],
      [field]: value,
    };
    setFormData(prev => ({
      ...prev,
      [section]: updatedSection,
    }));
  };

  const handleAddNested = (section, newItem) => {
    setFormData(prev => ({
      ...prev,
      [section]: [...(prev[section] || []), newItem],
    }));
  };

  const handleRemoveNested = (section, index) => {
    const updatedSection = formData[section].filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      [section]: updatedSection,
    }));
  };

  const handleProfileImageChange = (e) => {
    // No preventDefault or stopPropagation needed for file input onChange
    if (!e || !e.target || !e.target.files || e.target.files.length === 0) {
      console.log('No file selected');
      return;
    }

    const file = e.target.files[0];

    // Validate file type
    if (!file.type.startsWith('image/')) {
      console.error('Invalid file type. Please select an image.');
      alert('Please select a valid image file.');
      // Clear the input
      if (e.target) e.target.value = '';
      return;
    }

    // Revoke previous preview URL to prevent memory leak
    if (profileImagePreview) {
      URL.revokeObjectURL(profileImagePreview);
    }

    setProfileImageFile(file);

    // Create new preview URL
    const previewUrl = URL.createObjectURL(file);
    setProfileImagePreview(previewUrl);

    console.log('Profile image selected:', file.name);
  };

  const triggerFileInput = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (profileImageInputRef.current) {
      profileImageInputRef.current.click();
    }
    return false;
  };

  const handleAdditionalImageChange = (files) => {
    setAdditionalImageFiles(prev => [...prev, ...files]);
  };

  const handleRemoveAdditionalImage = (idToRemove) => {
    setAdditionalImagesToKeep(prev => prev.filter(id => id !== idToRemove));
  };

  const handleSelectChange = (selectedOption, actionMeta) => {
    const { name } = actionMeta;
    setFormData(prev => ({
      ...prev,
      [name]: selectedOption ? selectedOption.value : '',
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handlePreferenceChange = (e) => {
    const name = e.target.name;
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData(prev => ({
      ...prev,
      preference: {
        ...(prev.preference || {}),
        [name]: value,
      },
    }));
  };

  const handlePreferenceReactSelectChange = (selectedOptions, actionMeta) => {
    const { name } = actionMeta;
    const value = selectedOptions ? selectedOptions.map(option => option.value) : [];
    setFormData(prev => ({
      ...prev,
      preference: {
        ...(prev.preference || {}),
        [name]: value,
      },
    }));
  };

  const handleFaithTagsChange = (newTags) => {
    setFormData(prev => ({
      ...prev,
      faith_tags: newTags,
    }));
  };

  const cleanNestedObjects = (items) => {
    if (!items) return [];
    return items.map(item => {
      const cleanedItem = {};
      for (const key in item) {
        if (item[key] !== null && item[key] !== '') {
          cleanedItem[key] = item[key];
        }
      }
      return cleanedItem;
    });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = 'Name is required.';
    if (!formData.date_of_birth) newErrors.date_of_birth = 'Date of birth is required.';
    if (!formData.gender) newErrors.gender = 'Gender is required.';
    if (!formData.marital_status) newErrors.marital_status = 'Marital status is required.';
    if (!formData.religion) newErrors.religion = 'Religion is required.';
    if (!formData.current_city) newErrors.current_city = 'Current city is required.';
    if (!formData.current_country) newErrors.current_country = 'Current country is required.';
    if (!formData.about) newErrors.about = 'About section is required.';
    if (!formData.email) newErrors.email = 'Email is required.';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('=== ProfileForm handleSubmit called ===');

    if (!validateForm()) {
      console.error('Form validation failed:', errors);
      alert('Please fill out all required fields.');
      return;
    }

    console.log('Form validation passed');
    const data = new FormData();

    // Append all simple fields
    for (const key in formData) {
      if (formData[key] !== null && typeof formData[key] !== 'object' &&
        !['id', 'user', 'is_verified', 'birth_year', 'created_at', 'updated_at', 'profile_image'].includes(key)) {
        if (formData[key] !== null && formData[key] !== '') {
          data.append(key, formData[key]);
        } else if (typeof formData[key] === 'boolean') {
          data.append(key, formData[key]);
        }
      }
    }

    // Clean and append nested JSON fields
    data.append('education', JSON.stringify(cleanNestedObjects(formData.education)));
    data.append('work_experience', JSON.stringify(cleanNestedObjects(formData.work_experience)));

    // Handle faith_tags
    if (formData.faith_tags && Array.isArray(formData.faith_tags)) {
      data.append('faith_tags', JSON.stringify(formData.faith_tags));
    } else {
      data.append('faith_tags', JSON.stringify([]));
    }


    // Handle preference separately, filtering out empty values
    if (formData.preference) {
      const cleanedPreference = {};
      for (const key in formData.preference) {
        if (formData.preference[key] !== null && formData.preference[key] !== '') {
          cleanedPreference[key] = formData.preference[key];
        }
      }
      data.append('preference', JSON.stringify(cleanedPreference));
    } else {
      data.append('preference', JSON.stringify({}));
    }

    // Handle profile image
    console.log('profileImageFile:', profileImageFile);
    if (profileImageFile) {
      console.log('Appending profile_image:', profileImageFile.name, profileImageFile.size, 'bytes');
      data.append('profile_image', profileImageFile);
    } else if (formData.profile_image === null) {
      console.log('Setting clear_profile_image flag');
      data.append('clear_profile_image', 'true');
    } else {
      console.log('No profile_image change');
    }

    // Handle additional images
    additionalImageFiles.forEach(file => {
      data.append('uploaded_images', file);
    });

    // Only send additional_images_to_keep on update
    if (initialData && initialData.id) {
      additionalImagesToKeep.forEach(id => {
        data.append('additional_images_to_keep', id);
      });
    }

    console.log('FormData prepared, calling onSubmit');
    // Clear draft on successful submit (assuming onSubmit succeeds or handles it)
    localStorage.removeItem(`profile_draft_${initialData.id || 'new'}`);
    onSubmit(data);
  };

  const selectStyles = {
    control: (provided) => ({
      ...provided,
      backgroundColor: isDarkMode ? '#374151' : 'white',
      borderColor: isDarkMode ? '#4b5563' : '#d1d5db',
    }),
    singleValue: (provided) => ({
      ...provided,
      color: isDarkMode ? 'white' : '#111827',
    }),
    menu: (provided) => ({
      ...provided,
      backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
      zIndex: 999999,
      border: isDarkMode ? '1px solid #374151' : '1px solid #e5e7eb',
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)',
    }),
    menuPortal: (base) => ({ ...base, zIndex: 999999 }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected ? (isDarkMode ? '#4f46e5' : '#6366f1') : (state.isFocused ? (isDarkMode ? '#374151' : '#f3f4f6') : 'transparent'),
      color: isDarkMode ? 'white' : '#111827',
    }),
    multiValue: (provided) => ({
      ...provided,
      backgroundColor: isDarkMode ? '#4f46e5' : '#e0e7ff',
    }),
    multiValueLabel: (provided) => ({
      ...provided,
      color: isDarkMode ? 'white' : '#1e3a8a',
    }),
  };

  return (
    <form onSubmit={handleSubmit} className={`space-y-6 ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>
      {/* Basic Info */}
      {(section === 'all' || section === 'about') && (
        <>
          <GlassCard className="p-6">
            <h3 className="text-xl font-semibold mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Profile For <span className="text-red-500">*</span></label>
                <select name="profile_for" value={formData.profile_for || ''} onChange={handleChange} className="w-full rounded-md border border-gray-300 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500">
                  {PROFILE_FOR_CHOICES.map(choice => (
                    <option key={choice.value} value={choice.value}>{choice.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Name <span className="text-red-500">*</span></label>
                <input type="text" name="name" value={formData.name || ''} onChange={handleChange} className="w-full rounded-md border border-gray-300 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500" />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Date of Birth <span className="text-red-500">*</span></label>
                <div className="grid grid-cols-3 gap-2">
                  {/* Day Dropdown */}
                  <select
                    name="dob_day"
                    value={formData.date_of_birth ? new Date(formData.date_of_birth).getDate() : ''}
                    onChange={(e) => {
                      const day = parseInt(e.target.value);
                      const currentDate = formData.date_of_birth ? new Date(formData.date_of_birth) : new Date();
                      const month = currentDate.getMonth() + 1;
                      const year = currentDate.getFullYear();
                      if (day && month && year) {
                        const newDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                        handleChange({ target: { name: 'date_of_birth', value: newDate } });
                      } else {
                        handleChange({ target: { name: 'date_of_birth', value: '' } });
                      }
                    }}
                    className="w-full rounded-md border border-gray-300 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Day</option>
                    {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                      <option key={day} value={day}>{day}</option>
                    ))}
                  </select>

                  {/* Month Dropdown */}
                  <select
                    name="dob_month"
                    value={formData.date_of_birth ? new Date(formData.date_of_birth).getMonth() + 1 : ''}
                    onChange={(e) => {
                      const month = parseInt(e.target.value);
                      const currentDate = formData.date_of_birth ? new Date(formData.date_of_birth) : new Date();
                      const day = currentDate.getDate();
                      const year = currentDate.getFullYear();
                      if (day && month && year) {
                        const newDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                        handleChange({ target: { name: 'date_of_birth', value: newDate } });
                      } else {
                        handleChange({ target: { name: 'date_of_birth', value: '' } });
                      }
                    }}
                    className="w-full rounded-md border border-gray-300 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Month</option>
                    <option value="1">January</option>
                    <option value="2">February</option>
                    <option value="3">March</option>
                    <option value="4">April</option>
                    <option value="5">May</option>
                    <option value="6">June</option>
                    <option value="7">July</option>
                    <option value="8">August</option>
                    <option value="9">September</option>
                    <option value="10">October</option>
                    <option value="11">November</option>
                    <option value="12">December</option>
                  </select>

                  {/* Year Dropdown */}
                  <select
                    name="dob_year"
                    value={formData.date_of_birth ? new Date(formData.date_of_birth).getFullYear() : ''}
                    onChange={(e) => {
                      const year = parseInt(e.target.value);
                      const currentDate = formData.date_of_birth ? new Date(formData.date_of_birth) : new Date();
                      const day = currentDate.getDate();
                      const month = currentDate.getMonth() + 1;
                      if (day && month && year) {
                        const newDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                        handleChange({ target: { name: 'date_of_birth', value: newDate } });
                      } else {
                        handleChange({ target: { name: 'date_of_birth', value: '' } });
                      }
                    }}
                    className="w-full rounded-md border border-gray-300 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Year</option>
                    {Array.from({ length: 70 }, (_, i) => new Date().getFullYear() - 18 - i).map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
                {errors.date_of_birth && <p className="text-red-500 text-xs mt-1">{errors.date_of_birth}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Gender <span className="text-red-500">*</span></label>
                <select name="gender" value={formData.gender || ''} onChange={handleChange} className="w-full rounded-md border border-gray-300 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500">
                  <option value="">Select Gender</option>
                  {GENDER_CHOICES.map(choice => (
                    <option key={choice.value} value={choice.value}>{choice.label}</option>
                  ))}
                </select>
                {errors.gender && <p className="text-red-500 text-xs mt-1">{errors.gender}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Height</label>
                <div className="grid grid-cols-2 gap-2">
                  {/* Feet Dropdown */}
                  <select
                    name="height_feet"
                    value={formData.height_inches ? Math.floor(formData.height_inches / 12) : ''}
                    onChange={(e) => {
                      const feet = parseInt(e.target.value) || 0;
                      const inches = formData.height_inches ? formData.height_inches % 12 : 0;
                      const totalInches = (feet * 12) + inches;
                      handleChange({ target: { name: 'height_inches', value: totalInches || '' } });
                    }}
                    className="w-full rounded-md border border-gray-300 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Feet</option>
                    {Array.from({ length: 5 }, (_, i) => i + 4).map(ft => (
                      <option key={ft} value={ft}>{ft} ft</option>
                    ))}
                  </select>

                  {/* Inches Dropdown */}
                  <select
                    name="height_inches_part"
                    value={formData.height_inches ? formData.height_inches % 12 : ''}
                    onChange={(e) => {
                      const inches = parseInt(e.target.value) || 0;
                      const feet = formData.height_inches ? Math.floor(formData.height_inches / 12) : 0;
                      const totalInches = (feet * 12) + inches;
                      handleChange({ target: { name: 'height_inches', value: totalInches || '' } });
                    }}
                    className="w-full rounded-md border border-gray-300 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Inches</option>
                    {Array.from({ length: 12 }, (_, i) => i).map(inch => (
                      <option key={inch} value={inch}>{inch} in</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Skin Complexion</label>
                <select name="skin_complexion" value={formData.skin_complexion || ''} onChange={handleChange} className="w-full rounded-md border border-gray-300 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500">
                  <option value="">Select Complexion</option>
                  {SKIN_COMPLEXION_CHOICES.map(choice => (
                    <option key={choice.value} value={choice.value}>{choice.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Blood Group</label>
                <select name="blood_group" value={formData.blood_group || ''} onChange={handleChange} className="w-full rounded-md border border-gray-300 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500">
                  <option value="">Select Blood Group</option>
                  {BLOOD_GROUP_CHOICES.map(choice => (
                    <option key={choice.value} value={choice.value}>{choice.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Religion <span className="text-red-500">*</span></label>
                <select name="religion" value={formData.religion || ''} onChange={handleChange} className="w-full rounded-md border border-gray-300 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500">
                  <option value="">Select Religion</option>
                  {RELIGION_CHOICES.map(choice => (
                    <option key={choice.value} value={choice.value}>{choice.label}</option>
                  ))}
                </select>
                {errors.religion && <p className="text-red-500 text-xs mt-1">{errors.religion}</p>}
              </div>
            </div>
          </GlassCard>

          {/* Location */}
          <GlassCard className="p-6">
            <h3 className="text-xl font-semibold mb-4">Location</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Current City <span className="text-red-500">*</span></label>
                <input type="text" name="current_city" value={formData.current_city || ''} onChange={handleChange} className="w-full rounded-md border border-gray-300 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500" />
                {errors.current_city && <p className="text-red-500 text-xs mt-1">{errors.current_city}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Current Country <span className="text-red-500">*</span></label>
                <CreatableSelect
                  isClearable
                  name="current_country"
                  options={countries}
                  styles={selectStyles}
                  menuPortalTarget={portalTarget}
                  menuPosition="fixed"
                  placeholder="Select or type country"
                  value={countries.find(c => c.value === formData.current_country || c.label === formData.current_country) || (formData.current_country ? { label: formData.current_country, value: formData.current_country } : null)}
                  onChange={handleSelectChange}
                />
                {errors.current_country && <p className="text-red-500 text-xs mt-1">{errors.current_country}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Origin City</label>
                <input type="text" name="origin_city" value={formData.origin_city || ''} onChange={handleChange} className="w-full rounded-md border border-gray-300 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Origin Country</label>
                <CreatableSelect
                  isClearable
                  name="origin_country"
                  options={countries}
                  styles={selectStyles}
                  menuPortalTarget={portalTarget}
                  menuPosition="fixed"
                  placeholder="Select or type country"
                  value={countries.find(c => c.value === formData.origin_country || c.label === formData.origin_country) || (formData.origin_country ? { label: formData.origin_country, value: formData.origin_country } : null)}
                  onChange={handleSelectChange}
                />
              </div>
            </div>
          </GlassCard>

          {/* Immigration */}
          <GlassCard className="p-6">
            <h3 className="text-xl font-semibold mb-4">Immigration</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Visa Status</label>
                <input type="text" name="visa_status" value={formData.visa_status || ''} onChange={handleChange} className="w-full rounded-md border border-gray-300 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Citizenship</label>
                <input type="text" name="citizenship" value={formData.citizenship || ''} onChange={handleChange} className="w-full rounded-md border border-gray-300 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500" />
              </div>
            </div>
          </GlassCard>

          {/* Family */}
          <GlassCard className="p-6">
            <h3 className="text-xl font-semibold mb-4">Family Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Father's Occupation</label>
                <input type="text" name="father_occupation" value={formData.father_occupation || ''} onChange={handleChange} className="w-full rounded-md border border-gray-300 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Mother's Occupation</label>
                <input type="text" name="mother_occupation" value={formData.mother_occupation || ''} onChange={handleChange} className="w-full rounded-md border border-gray-300 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Siblings</label>
                <input type="text" name="siblings" value={formData.siblings || ''} onChange={handleChange} className="w-full rounded-md border border-gray-300 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Family Type</label>
                <select name="family_type" value={formData.family_type || ''} onChange={handleChange} className="w-full rounded-md border border-gray-300 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500">
                  <option value="">Select Family Type</option>
                  {FAMILY_TYPE_CHOICES.map(choice => (
                    <option key={choice.value} value={choice.value}>{choice.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Marital Status <span className="text-red-500">*</span></label>
                <select name="marital_status" value={formData.marital_status || ''} onChange={handleChange} className="w-full rounded-md border border-gray-300 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500">
                  <option value="">Select Marital Status</option>
                  {MARITAL_STATUS_CHOICES.map(choice => (
                    <option key={choice.value} value={choice.value}>{choice.label}</option>
                  ))}
                </select>
                {errors.marital_status && <p className="text-red-500 text-xs mt-1">{errors.marital_status}</p>}
              </div>

              {/* Extended Family Details */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Siblings Details</label>
                <textarea
                  name="siblings_details"
                  value={formData.siblings_details || ''}
                  onChange={handleChange}
                  rows={2}
                  placeholder="e.g. 1 Brother (Engineer), 1 Sister (Student)"
                  className="w-full rounded-md border border-gray-300 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500"
                ></textarea>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Paternal Family Details (Father's Side)</label>
                <textarea
                  name="paternal_family_details"
                  value={formData.paternal_family_details || ''}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Details about Uncles, Aunts, Grandparents..."
                  className="w-full rounded-md border border-gray-300 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500"
                ></textarea>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Maternal Family Details (Mother's Side)</label>
                <textarea
                  name="maternal_family_details"
                  value={formData.maternal_family_details || ''}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Details about Uncles, Aunts, Grandparents..."
                  className="w-full rounded-md border border-gray-300 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500"
                ></textarea>
              </div>
            </div>
          </GlassCard>

          {/* About & Contact */}
          <GlassCard className="p-6">
            <h3 className="text-xl font-semibold mb-4">About & Contact</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">About Me <span className="text-red-500">*</span></label>
                <textarea name="about" value={formData.about || ''} onChange={handleChange} className="w-full rounded-md border border-gray-300 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500"></textarea>
                {errors.about && <p className="text-red-500 text-xs mt-1">{errors.about}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Looking For</label>
                <textarea name="looking_for" value={formData.looking_for || ''} onChange={handleChange} className="w-full rounded-md border border-gray-300 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500"></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email <span className="text-red-500">*</span></label>
                <input type="email" name="email" value={formData.email || ''} onChange={handleChange} className="w-full rounded-md border border-gray-300 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500" />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Phone</label>
                <input type="text" name="phone" value={formData.phone || ''} onChange={handleChange} className="w-full rounded-md border border-gray-300 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500" />
              </div>
            </div>
          </GlassCard>



          {/* Social Media */}
          <GlassCard className="p-6">
            <h3 className="text-xl font-semibold mb-4">Social Media</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Facebook Profile</label>
                <input type="url" name="facebook_profile" value={formData.facebook_profile || ''} onChange={handleChange} className="w-full rounded-md border border-gray-300 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Instagram Profile</label>
                <input type="url" name="instagram_profile" value={formData.instagram_profile || ''} onChange={handleChange} className="w-full rounded-md border border-gray-300 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">LinkedIn Profile</label>
                <input type="url" name="linkedin_profile" value={formData.linkedin_profile || ''} onChange={handleChange} className="w-full rounded-md border border-gray-300 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500" />
              </div>
            </div>
          </GlassCard>

          {/* My Faith Tags */}
          <GlassCard className="p-6">
            <h3 className="text-xl font-semibold mb-4">My Faith</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Select tags that represent your values, lifestyle, and preferences. These help others understand you better.
            </p>
            <FaithTagsSection
              selectedTags={formData.faith_tags || []}
              onTagsChange={handleFaithTagsChange}
              isEditing={true}
            />
          </GlassCard>
        </>
      )}

      {/* Education */}
      {(section === 'all' || section === 'education') && (
        <GlassCard className="p-6">
          <h3 className="text-xl font-semibold mb-4">Education</h3>
          {formData.education && formData.education.map((edu, index) => (
            <div key={index} className="border border-white/30 rounded-lg p-4 mb-4 relative">
              <button type="button" onClick={() => handleRemoveNested('education', index)} className="absolute top-2 right-2 text-red-500"><FaTrash /></button>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Degree</label>
                  <CreatableSelect
                    isClearable
                    options={degrees}
                    styles={selectStyles}
                    menuPortalTarget={portalTarget}
                    menuPosition="fixed"
                    placeholder="Select or type degree"
                    value={degrees.find(d => d.value === edu.degree) || (edu.degree ? { label: edu.degree, value: edu.degree } : null)}
                    onChange={(val) => handleNestedChange('education', index, 'degree', val ? val.value : '')}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">School</label>
                  <input type="text" value={edu.school || ''} onChange={(e) => handleNestedChange('education', index, 'school', e.target.value)} className="w-full rounded-md border border-gray-300 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Field of Study</label>
                  <input type="text" value={edu.field_of_study || ''} onChange={(e) => handleNestedChange('education', index, 'field_of_study', e.target.value)} className="w-full rounded-md border border-gray-300 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Graduation Year</label>
                  <input type="number" value={edu.graduation_year || ''} onChange={(e) => handleNestedChange('education', index, 'graduation_year', e.target.value)} className="w-full rounded-md border border-gray-300 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500" />
                </div>
              </div>
            </div>
          ))}
          <button type="button" onClick={() => handleAddNested('education', { degree: '', school: '', field_of_study: '', graduation_year: '' })} className="btn-add"><FaPlus className="mr-2" />Add Education</button>
        </GlassCard>
      )}

      {/* Work Experience */}
      {(section === 'all' || section === 'career') && (
        <GlassCard className="p-6">
          <h3 className="text-xl font-semibold mb-4">Work Experience</h3>
          {formData.work_experience && formData.work_experience.map((work, index) => (
            <div key={index} className="border border-white/30 rounded-lg p-4 mb-4 relative">
              <button type="button" onClick={() => handleRemoveNested('work_experience', index)} className="absolute top-2 right-2 text-red-500"><FaTrash /></button>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Title</label>
                  <CreatableSelect
                    isClearable
                    options={professions}
                    styles={selectStyles}
                    menuPortalTarget={portalTarget}
                    menuPosition="fixed"
                    placeholder="Select or type title"
                    value={professions.find(p => p.value === work.title || p.label === work.title) || (work.title ? { label: work.title, value: work.title } : null)}
                    onChange={(val) => handleNestedChange('work_experience', index, 'title', val ? val.value : '')}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Company</label>
                  <input type="text" value={work.company || ''} onChange={(e) => handleNestedChange('work_experience', index, 'company', e.target.value)} className="w-full rounded-md border border-gray-300 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div className="flex items-center">
                  <input type="checkbox" checked={work.currently_working || false} onChange={(e) => handleNestedChange('work_experience', index, 'currently_working', e.target.checked)} className="mr-2" />
                  <label className="block text-sm font-medium">Currently working here</label>
                </div>
              </div>
            </div>
          ))}
          <button type="button" onClick={() => handleAddNested('work_experience', { title: '', company: '', currently_working: false })} className="btn-add"><FaPlus className="mr-2" />Add Work Experience</button>
        </GlassCard>
      )}




      {/* Preferences */}
      <GlassCard className="p-6">
        <h3 className="text-xl font-semibold mb-4">Partner Preferences</h3>
        <p className="text-yellow-500 dark:text-yellow-400 font-bold mb-4">(Please fill them properly to see compatibility rate with other profiles)</p>
        {formData.preference && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Min Age</label>
              <input type="number" name="min_age" value={formData.preference.min_age || ''} onChange={handlePreferenceChange} className="w-full rounded-md border border-gray-300 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Max Age</label>
              <input type="number" name="max_age" value={formData.preference.max_age || ''} onChange={handlePreferenceChange} className="w-full rounded-md border border-gray-300 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Min Height (inches)</label>
              <input type="number" name="min_height_inches" value={formData.preference.min_height_inches || ''} onChange={handlePreferenceChange} className="w-full rounded-md border border-gray-300 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Religion</label>
              <select name="religion" value={formData.preference.religion || ''} onChange={handlePreferenceChange} className="w-full rounded-md border border-gray-300 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500">
                <option value="">Select Religion</option>
                <option value="muslim">Muslim</option>
                <option value="hindu">Hindu</option>
                <option value="christian">Christian</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Marital Status</label>
              <Select
                isMulti
                name="marital_statuses"
                options={MARITAL_STATUS_CHOICES}
                styles={selectStyles}
                menuPortalTarget={document.body}
                menuPosition="fixed"
                className="basic-multi-select"
                classNamePrefix="select"
                value={MARITAL_STATUS_CHOICES.filter(option => formData.preference.marital_statuses?.includes(option.value))}
                onChange={handlePreferenceReactSelectChange}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Profession</label>
              <CreatableSelect
                isMulti
                name="profession"
                options={professions}
                styles={selectStyles}
                menuPortalTarget={document.body}
                menuPosition="fixed"
                className="basic-multi-select"
                classNamePrefix="select"
                value={(formData.preference.profession || []).map(val => professions.find(p => p.value === val || p.label === val) || { label: val, value: val })}
                onChange={handlePreferenceReactSelectChange}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Country</label>
              <CreatableSelect
                isMulti
                name="country"
                options={countries}
                styles={selectStyles}
                menuPortalTarget={document.body}
                menuPosition="fixed"
                className="basic-multi-select"
                classNamePrefix="select"
                value={(formData.preference.country || []).map(val => countries.find(c => c.value === val || c.label === val) || { label: val, value: val })}
                onChange={handlePreferenceReactSelectChange}
              />
            </div>

          </div>
        )}
      </GlassCard>



      {/* Profile Image */}
      <GlassCard className="p-6">
        <h3 className="text-xl font-semibold mb-4">Profile Image</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">Profile Image Privacy</label>
            <select name="profile_image_privacy" value={formData.profile_image_privacy || ''} onChange={handleChange} className="w-full rounded-md border border-gray-300 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500">
              {PRIVACY_CHOICES.map(choice => (
                <option key={choice.value} value={choice.value}>{choice.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Global Map Visibility</label>
            <div className="flex items-center h-full pt-2">
              <input
                type="checkbox"
                name="show_on_map"
                checked={formData.show_on_map !== false}
                onChange={handleChange}
                className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500 mr-2"
              />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Show my profile on the global map
              </span>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">Upload New Image</label>
            {/* Hidden file input */}
            <input
              ref={profileImageInputRef}
              id="profile-image-input"
              type="file"
              accept="image/*"
              onChange={handleProfileImageChange}
              style={{ display: 'none' }}
            />
            {/* Button to trigger file input */}
            <button
              type="button"
              onClick={triggerFileInput}
              className="w-full px-4 py-2 rounded-md border border-gray-300 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700 focus:ring-2 focus:ring-indigo-500 transition-colors"
            >
              {profileImageFile ? `Selected: ${profileImageFile.name}` : 'Choose Image File'}
            </button>
          </div>
        </div>

        {/* Show preview of newly selected image or current profile image */}
        {(profileImagePreview || formData.profile_image) && (
          <div className="relative w-32 h-32 mx-auto">
            <img
              src={profileImagePreview || formData.profile_image}
              alt={profileImagePreview ? "New Profile Preview" : "Current Profile"}
              className="w-32 h-32 object-cover rounded-full border-4 border-indigo-200"
            />
            {profileImagePreview && (
              <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                New
              </div>
            )}
            <button
              type="button"
              onClick={() => {
                setFormData(prev => ({ ...prev, profile_image: null }));
                setProfileImageFile(null);
                setProfileImagePreview(null);
              }}
              className="absolute bottom-0 right-0 bg-red-500 text-white rounded-full p-1 text-xs hover:bg-red-600"
            >
              <FaTrash />
            </button>
          </div>
        )}
      </GlassCard>

      {/* Additional Images */}
      <GlassCard className="p-6">
        <h3 className="text-xl font-semibold mb-4">Photo Gallery</h3>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Gallery Privacy</label>
          <select name="additional_images_privacy" value={formData.additional_images_privacy || ''} onChange={handleChange} className="w-full rounded-md border border-gray-300 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500">
            {PRIVACY_CHOICES.map(choice => (
              <option key={choice.value} value={choice.value}>{choice.label}</option>
            ))}
          </select>
        </div>
        <DragDropUpload
          onFilesAdded={handleAdditionalImageChange}
          existingImages={initialData.additional_images || []}
          onRemoveExisting={handleRemoveAdditionalImage}
        />
      </GlassCard>

      {/* Sticky Save Bar */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] w-auto pointer-events-none">
        <div className="flex items-center gap-3 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md px-4 py-2 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-2xl pointer-events-auto">
          {showDraftToast && (
            <div className="flex items-center gap-4 bg-indigo-50 dark:bg-indigo-900/20 px-4 py-2 rounded-xl border border-indigo-100 dark:border-indigo-800 animate-in slide-in-from-bottom-2">
              <p className="text-[10px] font-bold text-indigo-700 dark:text-indigo-300">Draft found</p>
              <div className="flex gap-2">
                <button type="button" onClick={restoreDraft} className="text-[10px] font-black uppercase text-indigo-600 hover:underline">Restore</button>
                <button type="button" onClick={discardDraft} className="text-[10px] font-black uppercase text-gray-400 hover:text-red-500">Discard</button>
              </div>
            </div>
          )}
          <button
            type="submit"
            className="px-8 py-3 bg-indigo-600 dark:bg-indigo-500 text-white rounded-xl font-bold text-[10px] uppercase tracking-[0.1em] shadow-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-all active:scale-95 whitespace-nowrap"
          >
            Save Changes
          </button>
        </div>
      </div>

      <div className="h-24"></div> {/* Spacer for sticky footer */}
    </form >
  );
};

export default ProfileForm;
