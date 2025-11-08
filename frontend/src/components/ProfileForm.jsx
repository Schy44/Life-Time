import React, { useState, useEffect } from 'react';
import { FaPlus, FaTrash } from 'react-icons/fa';
import Select from 'react-select'; // Import react-select
import GlassCard from './GlassCard';
import { getCountries } from '../services/api.js'; // Import getCountries

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





const ProfileForm = ({ initialData, onSubmit }) => {
  const [formData, setFormData] = useState({
    ...initialData,
    preference: initialData.preference || {},
  });
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [additionalImageFiles, setAdditionalImageFiles] = useState([]);
  const [additionalImagesToKeep, setAdditionalImagesToKeep] = useState(initialData.additional_images ? initialData.additional_images.map(img => img.id) : []);
  const [errors, setErrors] = useState({});
  const [countries, setCountries] = useState([]); // Add countries state

  useEffect(() => {
    setFormData({
      ...initialData,
      preference: initialData.preference || {},
    });
    setAdditionalImagesToKeep(initialData.additional_images ? initialData.additional_images.map(img => img.id) : []);
  }, [initialData]);

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const data = await getCountries();
        setCountries(data);
      } catch (error) {
        console.error('Error fetching countries:', error);
      }
    };
    fetchCountries();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    setProfileImageFile(e.target.files[0]);
  };

  const handleAdditionalImageChange = (e) => {
    setAdditionalImageFiles(prev => [...prev, ...Array.from(e.target.files)]);
  };

  const handleRemoveAdditionalImage = (idToRemove) => {
    setAdditionalImagesToKeep(prev => prev.filter(id => id !== idToRemove));
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

  const handlePreferenceArrayChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      preference: {
        ...(prev.preference || {}),
        [name]: value.split(',').map(item => item.trim()).filter(item => item !== ''),
      },
    }));
  };

  const handlePreferenceMultiSelectChange = (e) => {
    const { name, selectedOptions } = e.target;
    const value = Array.from(selectedOptions, option => option.value);
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
    if (!validateForm()) {
      alert('Please fill out all required fields.');
      return;
    }

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
    if (profileImageFile) {
      data.append('profile_image', profileImageFile);
    } else if (formData.profile_image === null) {
      data.append('profile_image', '');
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

    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 text-gray-700">
      {/* Basic Info */}
      <GlassCard className="p-6">
        <h3 className="text-xl font-semibold mb-4">Basic Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Profile For <span className="text-red-500">*</span></label>
            <select name="profile_for" value={formData.profile_for || ''} onChange={handleChange} className="form-input">
              {PROFILE_FOR_CHOICES.map(choice => (
                <option key={choice.value} value={choice.value}>{choice.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Name <span className="text-red-500">*</span></label>
            <input type="text" name="name" value={formData.name || ''} onChange={handleChange} className="form-input" />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Date of Birth <span className="text-red-500">*</span></label>
            <input type="date" name="date_of_birth" value={formData.date_of_birth || ''} onChange={handleChange} className="form-input" />
            {errors.date_of_birth && <p className="text-red-500 text-xs mt-1">{errors.date_of_birth}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Gender <span className="text-red-500">*</span></label>
            <select name="gender" value={formData.gender || ''} onChange={handleChange} className="form-input">
              {GENDER_CHOICES.map(choice => (
                <option key={choice.value} value={choice.value}>{choice.label}</option>
              ))}
            </select>
            {errors.gender && <p className="text-red-500 text-xs mt-1">{errors.gender}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Height (cm)</label>
            <input type="number" name="height_cm" value={formData.height_cm || ''} onChange={handleChange} className="form-input" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Blood Group</label>
            <select name="blood_group" value={formData.blood_group || ''} onChange={handleChange} className="form-input">
              <option value="">Select Blood Group</option>
              {BLOOD_GROUP_CHOICES.map(choice => (
                <option key={choice.value} value={choice.value}>{choice.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Religion <span className="text-red-500">*</span></label>
            <select name="religion" value={formData.religion || ''} onChange={handleChange} className="form-input">
              <option value="">Select Religion</option>
              {RELIGION_CHOICES.map(choice => (
                <option key={choice.value} value={choice.value}>{choice.label}</option>
              ))}
            </select>
            {errors.religion && <p className="text-red-500 text-xs mt-1">{errors.religion}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Alcohol</label>
            <select name="alcohol" value={formData.alcohol || ''} onChange={handleChange} className="form-input">
              <option value="">Select Alcohol Preference</option>
              {ALCOHOL_CHOICES.map(choice => (
                <option key={choice.value} value={choice.value}>{choice.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Smoking</label>
            <select name="smoking" value={formData.smoking || ''} onChange={handleChange} className="form-input">
              <option value="">Select Smoking Preference</option>
              {SMOKING_CHOICES.map(choice => (
                <option key={choice.value} value={choice.value}>{choice.label}</option>
              ))}
            </select>
          </div>
        </div>
      </GlassCard>

      {/* Location */}
      <GlassCard className="p-6">
        <h3 className="text-xl font-semibold mb-4">Location</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Current City <span className="text-red-500">*</span></label>
            <input type="text" name="current_city" value={formData.current_city || ''} onChange={handleChange} className="form-input" />
            {errors.current_city && <p className="text-red-500 text-xs mt-1">{errors.current_city}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Current Country <span className="text-red-500">*</span></label>
            <select name="current_country" value={formData.current_country || ''} onChange={handleChange} className="form-input">
                <option value="">Select Country</option>
                {countries.map(country => (
                    <option key={country.code} value={country.code}>{country.name}</option>
                ))}
            </select>
            {errors.current_country && <p className="text-red-500 text-xs mt-1">{errors.current_country}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Origin City</label>
            <input type="text" name="origin_city" value={formData.origin_city || ''} onChange={handleChange} className="form-input" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Origin Country</label>
            <select name="origin_country" value={formData.origin_country || ''} onChange={handleChange} className="form-input">
                <option value="">Select Country</option>
                {countries.map(country => (
                    <option key={country.code} value={country.code}>{country.name}</option>
                ))}
            </select>
          </div>
        </div>
      </GlassCard>

      {/* Immigration */}
      <GlassCard className="p-6">
        <h3 className="text-xl font-semibold mb-4">Immigration</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Visa Status</label>
            <input type="text" name="visa_status" value={formData.visa_status || ''} onChange={handleChange} className="form-input" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Citizenship</label>
            <input type="text" name="citizenship" value={formData.citizenship || ''} onChange={handleChange} className="form-input" />
          </div>
        </div>
      </GlassCard>

      {/* Family */}
      <GlassCard className="p-6">
        <h3 className="text-xl font-semibold mb-4">Family Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Father's Occupation</label>
            <input type="text" name="father_occupation" value={formData.father_occupation || ''} onChange={handleChange} className="form-input" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Mother's Occupation</label>
            <input type="text" name="mother_occupation" value={formData.mother_occupation || ''} onChange={handleChange} className="form-input" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Siblings</label>
            <input type="text" name="siblings" value={formData.siblings || ''} onChange={handleChange} className="form-input" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Family Type</label>
            <select name="family_type" value={formData.family_type || ''} onChange={handleChange} className="form-input">
              <option value="">Select Family Type</option>
              {FAMILY_TYPE_CHOICES.map(choice => (
                <option key={choice.value} value={choice.value}>{choice.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Marital Status <span className="text-red-500">*</span></label>
            <select name="marital_status" value={formData.marital_status || ''} onChange={handleChange} className="form-input">
              <option value="">Select Marital Status</option>
              {MARITAL_STATUS_CHOICES.map(choice => (
                <option key={choice.value} value={choice.value}>{choice.label}</option>
              ))}
            </select>
            {errors.marital_status && <p className="text-red-500 text-xs mt-1">{errors.marital_status}</p>}
          </div>
        </div>
      </GlassCard>

      {/* About & Contact */}
      <GlassCard className="p-6">
        <h3 className="text-xl font-semibold mb-4">About & Contact</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">About Me <span className="text-red-500">*</span></label>
            <textarea name="about" value={formData.about || ''} onChange={handleChange} className="form-input"></textarea>
            {errors.about && <p className="text-red-500 text-xs mt-1">{errors.about}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Looking For</label>
            <textarea name="looking_for" value={formData.looking_for || ''} onChange={handleChange} className="form-input"></textarea>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email <span className="text-red-500">*</span></label>
            <input type="email" name="email" value={formData.email || ''} onChange={handleChange} className="form-input" />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Phone</label>
            <input type="text" name="phone" value={formData.phone || ''} onChange={handleChange} className="form-input" />
          </div>
        </div>
      </GlassCard>



      {/* Social Media */}
      <GlassCard className="p-6">
        <h3 className="text-xl font-semibold mb-4">Social Media</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Facebook Profile</label>
            <input type="url" name="facebook_profile" value={formData.facebook_profile || ''} onChange={handleChange} className="form-input" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Instagram Profile</label>
            <input type="url" name="instagram_profile" value={formData.instagram_profile || ''} onChange={handleChange} className="form-input" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">LinkedIn Profile</label>
            <input type="url" name="linkedin_profile" value={formData.linkedin_profile || ''} onChange={handleChange} className="form-input" />
          </div>
        </div>
      </GlassCard>

      {/* Education */}
      <GlassCard className="p-6">
        <h3 className="text-xl font-semibold mb-4">Education</h3>
        {formData.education && formData.education.map((edu, index) => (
          <div key={index} className="border border-white/30 rounded-lg p-4 mb-4 relative">
            <button type="button" onClick={() => handleRemoveNested('education', index)} className="absolute top-2 right-2 text-red-500"><FaTrash /></button>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Degree</label>
                <input type="text" value={edu.degree || ''} onChange={(e) => handleNestedChange('education', index, 'degree', e.target.value)} className="form-input" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">School</label>
                <input type="text" value={edu.school || ''} onChange={(e) => handleNestedChange('education', index, 'school', e.target.value)} className="form-input" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Field of Study</label>
                <input type="text" value={edu.field_of_study || ''} onChange={(e) => handleNestedChange('education', index, 'field_of_study', e.target.value)} className="form-input" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Graduation Year</label>
                <input type="number" value={edu.graduation_year || ''} onChange={(e) => handleNestedChange('education', index, 'graduation_year', e.target.value)} className="form-input" />
              </div>
            </div>
          </div>
        ))}
        <button type="button" onClick={() => handleAddNested('education', { degree: '', school: '', field_of_study: '', graduation_year: '' })} className="btn-add"><FaPlus className="mr-2" />Add Education</button>
      </GlassCard>

      {/* Work Experience */}
      <GlassCard className="p-6">
        <h3 className="text-xl font-semibold mb-4">Work Experience</h3>
        {formData.work_experience && formData.work_experience.map((work, index) => (
          <div key={index} className="border border-white/30 rounded-lg p-4 mb-4 relative">
            <button type="button" onClick={() => handleRemoveNested('work_experience', index)} className="absolute top-2 right-2 text-red-500"><FaTrash /></button>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input type="text" value={work.title || ''} onChange={(e) => handleNestedChange('work_experience', index, 'title', e.target.value)} className="form-input" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Company</label>
                <input type="text" value={work.company || ''} onChange={(e) => handleNestedChange('work_experience', index, 'company', e.target.value)} className="form-input" />
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



      {/* Preferences */}
      <GlassCard className="p-6">
        <h3 className="text-xl font-semibold mb-4">Partner Preferences</h3>
        <p className="text-gray-600 dark:text-gray-300 mb-4">(Please fill them properly to see compatibility rate with other profiles)</p>
        {formData.preference && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Min Age</label>
              <input type="number" name="min_age" value={formData.preference.min_age || ''} onChange={handlePreferenceChange} className="form-input" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Max Age</label>
              <input type="number" name="max_age" value={formData.preference.max_age || ''} onChange={handlePreferenceChange} className="form-input" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Min Height (cm)</label>
              <input type="number" name="min_height_cm" value={formData.preference.min_height_cm || ''} onChange={handlePreferenceChange} className="form-input" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Religion</label>
              <select name="religion" value={formData.preference.religion || ''} onChange={handlePreferenceChange} className="form-input">
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
                className="basic-multi-select"
                classNamePrefix="select"
                value={MARITAL_STATUS_CHOICES.filter(option => formData.preference.marital_statuses?.includes(option.value))}
                onChange={handlePreferenceReactSelectChange}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Profession</label>
              <input type="text" name="profession" value={formData.preference.profession || ''} onChange={handlePreferenceChange} className="form-input" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Country</label>
              <select name="country" value={formData.preference.country || ''} onChange={handlePreferenceChange} className="form-input">
                <option value="">Select Country</option>
                {countries.map(country => (
                  <option key={country.code} value={country.code}>{country.name}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center">
              <input type="checkbox" name="require_non_alcoholic" checked={formData.preference.require_non_alcoholic || false} onChange={handlePreferenceChange} className="mr-2" />
              <label className="block text-sm font-medium">Require Non-Alcoholic</label>
            </div>
            <div className="flex items-center">
              <input type="checkbox" name="require_non_smoker" checked={formData.preference.require_non_smoker || false} onChange={handlePreferenceChange} className="mr-2" />
              <label className="block text-sm font-medium">Non-Smoker</label>
            </div>
          </div>
        )}
      </GlassCard>

      {/* Privacy Settings */}
      <GlassCard className="p-6">
        <h3 className="text-xl font-semibold mb-4">Privacy Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Profile Image Privacy</label>
            <select name="profile_image_privacy" value={formData.profile_image_privacy || ''} onChange={handleChange} className="form-input">
              {PRIVACY_CHOICES.map(choice => (
                <option key={choice.value} value={choice.value}>{choice.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Additional Images Privacy</label>
            <select name="additional_images_privacy" value={formData.additional_images_privacy || ''} onChange={handleChange} className="form-input">
              {PRIVACY_CHOICES.map(choice => (
                <option key={choice.value} value={choice.value}>{choice.label}</option>
              ))}
            </select>
          </div>
        </div>
      </GlassCard>

      {/* Profile Image */}
      <GlassCard className="p-6">
        <h3 className="text-xl font-semibold mb-4">Profile Image</h3>
        {formData.profile_image && (
          <div className="mb-4">
            <img src={formData.profile_image} alt="Current Profile" className="w-32 h-32 object-cover rounded-full mx-auto" />
            <button type="button" onClick={() => setFormData(prev => ({ ...prev, profile_image: null }))} className="text-red-500 text-sm mt-2 block mx-auto">Remove Current Image</button>
          </div>
        )}
        <input type="file" accept="image/*" onChange={handleProfileImageChange} className="form-input" />
      </GlassCard>

      {/* Additional Images */}
      <GlassCard className="p-6">
        <h3 className="text-xl font-semibold mb-4">Additional Images</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
          {formData.additional_images && formData.additional_images.map((img) => (
            additionalImagesToKeep.includes(img.id) && (
              <div key={img.id} className="relative">
                <img src={img.image} alt="Additional" className="w-full h-24 object-cover rounded-lg" />
                <button type="button" onClick={() => handleRemoveAdditionalImage(img.id)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 text-xs"><FaTrash /></button>
              </div>
            )
          ))}
        </div>
        <input type="file" accept="image/*" multiple onChange={handleAdditionalImageChange} className="form-input" />
      </GlassCard>

      <button type="submit" className="w-full p-3 rounded-lg bg-gradient-to-r from-purple-600 to-pink-500 text-white font-bold text-lg hover:from-purple-700 hover:to-pink-600 transition duration-300">
        Save Profile
      </button>
    </form>
  );
};

export default ProfileForm;
