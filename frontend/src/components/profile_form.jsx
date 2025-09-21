import React, { useState } from 'react';
import axios from 'axios';
import { ChevronRight, Heart, User, MapPin, Briefcase, MessageCircle, Check, Camera, Shield, Users, Eye, EyeOff, Edit, Upload } from 'lucide-react';

const ProfileForm = ({ onProfileCreateSuccess }) => {
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState({
        profileFor: 'self',
        name: '',
        age: '',
        gender: '',
        location: '',
        profileImage: null,
        additionalImages: [],
        height: '',
        education: '',
        profession: '',
        religion: '',
        fatherOccupation: '',
        motherOccupation: '',
        siblings: '',
        familyType: '',
        about: '',
        lookingFor: '',
        email: '',
        phone: '',
        maritalStatus: '',
        languagesSpoken: [],
        hobbies: [],
        bloodGroup: '',
        documentType: '',
        documentNumber: '',
        privacySettings: {
            profileImage: 'public',
            additionalImages: 'matches'
        },
        verificationDocument: null
    });

    const totalSteps = 7;

    const handleInputChange = (field, value) => {
        if (field.startsWith('privacySettings.')) {
            const setting = field.split('.')[1];
            setFormData(prev => ({
                ...prev,
                privacySettings: { ...prev.privacySettings, [setting]: value }
            }));
        } else if (field === 'languagesSpoken' || field === 'hobbies') {
            setFormData(prev => ({ ...prev, [field]: value.split(',').map(item => item.trim()).filter(Boolean) }));
        } else {
            setFormData(prev => ({ ...prev, [field]: value }));
        }
    };

    const handleImageUpload = (type, file, index) => {
        if (type === 'profile') {
            setFormData(prev => ({ ...prev, profileImage: file }));
        } else if (type === 'additional') {
            setFormData(prev => {
                const newImages = [...prev.additionalImages];
                newImages[index] = file;
                return { ...prev, additionalImages: newImages };
            });
        }
    };

    const handleDocumentUpload = (file) => {
        setFormData(prev => ({ ...prev, verificationDocument: file }));
    };

    const nextStep = () => {
        if (currentStep < totalSteps) setCurrentStep(currentStep + 1);
    };

    const prevStep = () => {
        if (currentStep > 1) setCurrentStep(currentStep - 1);
    };

    const goToStep = (step) => {
        setCurrentStep(step);
    };

    const handleSubmit = async () => {
        const url = '/api/profiles/';
        const token = localStorage.getItem('token');

        if (!token) {
            alert('You must be logged in to create a profile.');
            return;
        }

        const data = new FormData();
        data.append('profile_for', formData.profileFor);
        data.append('name', formData.name);
        data.append('age', formData.age);
        data.append('gender', formData.gender);
        data.append('location', formData.location);
        data.append('height', formData.height);
        data.append('education', formData.education);
        data.append('profession', formData.profession);
        data.append('religion', formData.religion);
        data.append('father_occupation', formData.fatherOccupation);
        data.append('mother_occupation', formData.motherOccupation);
        data.append('siblings', formData.siblings);
        data.append('family_type', formData.familyType);
        data.append('about', formData.about);
        data.append('looking_for', formData.lookingFor);
        data.append('email', formData.email);
        data.append('phone', formData.phone);
        data.append('marital_status', formData.maritalStatus);
        data.append('languages_spoken', JSON.stringify(formData.languagesSpoken));
        data.append('hobbies', JSON.stringify(formData.hobbies));
        data.append('blood_group', formData.bloodGroup);
        data.append('document_type', formData.documentType);
        data.append('document_number', formData.documentNumber);

        if (formData.profileImage) {
            data.append('profile_image', formData.profileImage);
        }
        formData.additionalImages.forEach((image) => {
            if (image) data.append('uploaded_images', image);
        });
        data.append('profile_image_privacy', formData.privacySettings.profileImage === 'everyone' ? 'public' : 'matches');
        data.append('additional_images_privacy', formData.privacySettings.additionalImages === 'everyone' ? 'public' : 'matches');
        if (formData.verificationDocument) {
            data.append('verification_document', formData.verificationDocument);
        }

        try {
            const response = await axios.post(url, data, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Token ${token}`
                }
            });
            console.log('Profile created:', response.data);
            if (onProfileCreateSuccess) {
                onProfileCreateSuccess();
            }
        } catch (error) {
            console.error('Error creating profile:', error.response ? error.response.data : error.message);
            alert('There was an error creating your profile. Please check the console for details.');
        }
    };

    const isStepValid = () => {
        switch (currentStep) {
            case 1: return formData.profileFor && (formData.profileFor !== 'relative' || formData.relationToProfile);
            case 2: return true;
            case 3: return formData.name && formData.age && formData.gender && formData.location;
            case 4: return true;
            case 5: return formData.email;
            case 6: return true;
            case 7: return true; // Verification document is optional for now
            default: return false;
        }
    };

    const renderStep1 = () => (
        <div className="space-y-4">
            <div className="text-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <User className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Who are you creating this profile for?</h2>
                <p className="text-gray-600 mt-2">Let us know the relationship</p>
            </div>

            <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                        { value: 'self', label: 'Myself', desc: 'Creating my own profile' },
                        { value: 'son', label: 'My Son', desc: 'Creating for my son' },
                        { value: 'daughter', label: 'My Daughter', desc: 'Creating for my daughter' },
                        { value: 'brother', label: 'My Brother', desc: 'Creating for my brother' },
                        { value: 'sister', label: 'My Sister', desc: 'Creating for my sister' },
                        { value: 'relative', label: 'Relative/Friend', desc: 'Creating for someone else' }
                    ].map((option) => (
                        <div
                            key={option.value}
                            className={`p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${formData.profileFor === option.value
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-blue-300'
                                }`}
                            onClick={() => handleInputChange('profileFor', option.value)}
                        >
                            <div className="flex items-center">
                                <div className={`w-4 h-4 rounded-full border-2 mr-3 ${formData.profileFor === option.value
                                    ? 'border-blue-500 bg-blue-500'
                                    : 'border-gray-300'
                                    }`}>
                                    {formData.profileFor === option.value && (
                                        <div className="w-2 h-2 bg-white rounded-full m-0.5"></div>
                                    )}
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-800">{option.label}</p>
                                    <p className="text-sm text-gray-600">{option.desc}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {formData.profileFor === 'relative' && (
                    <div>
                        <input
                            type="text"
                            className="w-full p-3 text-base border-2 border-gray-200 rounded-xl focus:border-blue-400 focus:outline-none transition-colors"
                            value={formData.relationToProfile}
                            onChange={(e) => handleInputChange('relationToProfile', e.target.value)}
                            placeholder="Please specify your relationship (e.g., Cousin, Friend)"
                        />
                    </div>
                )}
            </div>
        </div>
    );

    const renderStep2 = () => (
        <div className="space-y-4">
            <div className="text-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Camera className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Add some photos</h2>
                <p className="text-gray-600 mt-2">Photos help create a great first impression</p>
            </div>

            <div className="space-y-4">
                {/* Profile Picture */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Profile Picture</label>
                    <div className="flex items-center space-x-4">
                        <div className={`w-24 h-24 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center ${formData.profileImage ? 'bg-green-50 border-green-300' : 'bg-gray-50'
                            }`}>
                            {formData.profileImage ? (
                                <Check className="w-8 h-8 text-green-500" />
                            ) : (
                                <Camera className="w-8 h-8 text-gray-400" />
                            )}
                        </div>
                        <div className="flex-1">
                            <input
                                type="file"
                                id="profileImage"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => handleImageUpload('profile', e.target.files[0])}
                            />
                            <label
                                htmlFor="profileImage"
                                className="px-4 py-2 bg-blue-500 text-white rounded-lg cursor-pointer hover:bg-blue-600 transition-colors inline-block"
                            >
                                Choose Photo
                            </label>
                            <p className="text-sm text-gray-500 mt-1">JPG, PNG up to 5MB</p>

                            {/* Privacy setting for profile image */}
                            <div className="mt-3">
                                <label className="block text-xs font-medium text-gray-600 mb-1">Who can see this?</label>
                                <select
                                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded-lg focus:border-blue-400 focus:outline-none"
                                    value={formData.privacySettings.profileImage}
                                    onChange={(e) => handleInputChange('privacySettings.profileImage', e.target.value)}
                                >
                                    <option value="everyone">Everyone</option>
                                    <option value="private">Private</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Additional Photos */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Additional Photos (Optional)</label>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {[0, 1, 2].map((index) => (
                            <div key={index} className="space-y-2">
                                <div className={`aspect-square border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center ${formData.additionalImages[index] ? 'bg-green-50 border-green-300' : 'bg-gray-50'
                                    }`}>
                                    {formData.additionalImages[index] ? (
                                        <Check className="w-6 h-6 text-green-500" />
                                    ) : (
                                        <Camera className="w-6 h-6 text-gray-400" />
                                    )}
                                </div>
                                <input
                                    type="file"
                                    id={`additionalImage${index}`}
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => handleImageUpload('additional', e.target.files[0], index)}
                                />
                                <label
                                    htmlFor={`additionalImage${index}`}
                                    className="block text-center text-sm text-blue-500 cursor-pointer hover:text-blue-600"
                                >
                                    Add Photo
                                </label>
                            </div>
                        ))}
                    </div>

                    {/* Privacy setting for additional images */}
                    <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Privacy for additional photos:</label>
                        <select
                            className="w-full px-2 py-1 border border-gray-300 rounded-lg focus:border-blue-400 focus:outline-none"
                            value={formData.privacySettings.additionalImages}
                            onChange={(e) => handleInputChange('privacySettings.additionalImages', e.target.value)}
                        >
                            <option value="everyone">Everyone</option>
                            <option value="private">Private</option>                      </select>
                        <p className="text-xs text-blue-600 mt-1">This applies to all additional photos you upload</p>
                    </div>                </div>
            </div>
        </div>
    );

    const renderStep3 = () => (
        <div className="space-y-4">
            <div className="text-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <User className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Basic Information</h2>
                <p className="text-gray-600 mt-2">Tell us the essential details</p>
            </div>

            <div className="space-y-4">
                <div>
                    <input
                        type="text"
                        className="w-full p-3 text-base border-2 border-gray-200 rounded-xl focus:border-blue-400 focus:outline-none transition-colors"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        placeholder="Full name"
                    />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input
                        type="number"
                        className="w-full p-3 text-base border-2 border-gray-200 rounded-xl focus:border-blue-400 focus:outline-none transition-colors"
                        value={formData.age}
                        onChange={(e) => handleInputChange('age', e.target.value)}
                        placeholder="Age"
                        min="18"
                        max="80"
                    />

                    <select
                        className="w-full p-3 text-base border-2 border-gray-200 rounded-xl focus:border-blue-400 focus:outline-none transition-colors"
                        value={formData.gender}
                        onChange={(e) => handleInputChange('gender', e.target.value)}
                    >
                        <option value="">Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                    </select>
                </div>

                <div>
                    <input
                        type="text"
                        className="w-full p-3 text-base border-2 border-gray-200 rounded-xl focus:border-blue-400 focus:outline-none transition-colors"
                        value={formData.location}
                        onChange={(e) => handleInputChange('location', e.target.value)}
                        placeholder="City, Country"
                    />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <select
                        className="w-full p-3 text-base border-2 border-gray-200 rounded-xl focus:border-blue-400 focus:outline-none transition-colors"
                        value={formData.height}
                        onChange={(e) => handleInputChange('height', e.target.value)}
                    >
                        <option value="">Height</option>
                        {Array.from({ length: 20 }, (_, i) => {
                            const totalInches = 54 + i;
                            const feet = Math.floor(totalInches / 12);
                            const inches = totalInches % 12;
                            const heightStr = `${feet}'${inches}"`;
                            return (
                                <option key={i} value={heightStr}>
                                    {heightStr}
                                </option>
                            );
                        })}
                    </select>

                    <select
                        className="w-full p-3 text-base border-2 border-gray-200 rounded-xl focus:border-blue-400 focus:outline-none transition-colors"
                        value={formData.religion}
                        onChange={(e) => handleInputChange('religion', e.target.value)}
                    >
                        <option value="">Religion</option>
                        <option value="islam">Islam</option>
                        <option value="hinduism">Hinduism</option>
                        <option value="christianity">Christianity</option>
                        <option value="buddhism">Buddhism</option>
                        <option value="sikhism">Sikhism</option>
                        <option value="other">Other</option>
                    </select>
                </div>

                <div>
                    <select
                        className="w-full p-3 text-base border-2 border-gray-200 rounded-xl focus:border-blue-400 focus:outline-none transition-colors"
                        value={formData.education}
                        onChange={(e) => handleInputChange('education', e.target.value)}
                    >
                        <option value="">Select Education</option>
                        <option value="High School">High School</option>
                        <option value="Diploma">Diploma</option>
                        <option value="Bachelor's Degree">Bachelor's Degree</option>
                        <option value="Master's Degree">Master's Degree</option>
                        <option value="PhD">PhD</option>
                        <option value="Professional Degree">Professional Degree</option>
                        <option value="Other">Other</option>
                    </select>
                </div>

                <div>
                    <select
                        className="w-full p-3 text-base border-2 border-gray-200 rounded-xl focus:border-blue-400 focus:outline-none transition-colors"
                        value={formData.profession}
                        onChange={(e) => handleInputChange('profession', e.target.value)}
                    >
                        <option value="">Select Profession</option>
                        <option value="Software Engineer">Software Engineer</option>
                        <option value="Doctor">Doctor</option>
                        <option value="Teacher">Teacher</option>
                        <option value="Business Owner">Business Owner</option>
                        <option value="Lawyer">Lawyer</option>
                        <option value="Engineer">Engineer</option>
                        <option value="Accountant">Accountant</option>
                        <option value="Nurse">Nurse</option>
                        <option value="Designer">Designer</option>
                        <option value="Marketing Professional">Marketing Professional</option>
                        <option value="Sales Professional">Sales Professional</option>
                        <option value="Government Employee">Government Employee</option>
                        <option value="Banker">Banker</option>
                        <option value="Consultant">Consultant</option>
                        <option value="Architect">Architect</option>
                        <option value="Chef">Chef</option>
                        <option value="Pharmacist">Pharmacist</option>
                        <option value="Police Officer">Police Officer</option>
                        <option value="Pilot">Pilot</option>
                        <option value="Artist">Artist</option>
                        <option value="Writer">Writer</option>
                        <option value="Student">Student</option>
                        <option value="Homemaker">Homemaker</option>
                        <option value="Retired">Retired</option>
                        <option value="Other">Other</option>
                    </select>
                </div>
            </div>
        </div>
    );

    const renderStep4 = () => (
        <div className="space-y-4">
            <div className="text-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Family Background</h2>
                <p className="text-gray-600 mt-2">Tell us about the family</p>
            </div>

            <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <select
                        className="w-full p-3 text-base border-2 border-gray-200 rounded-xl focus:border-blue-400 focus:outline-none transition-colors"
                        value={formData.fatherOccupation}
                        onChange={(e) => handleInputChange('fatherOccupation', e.target.value)}
                    >
                        <option value="">Father's occupation</option>
                        <option value="Software Engineer">Software Engineer</option>
                        <option value="Doctor">Doctor</option>
                        <option value="Teacher">Teacher</option>
                        <option value="Business Owner">Business Owner</option>
                        <option value="Lawyer">Lawyer</option>
                        <option value="Engineer">Engineer</option>
                        <option value="Accountant">Accountant</option>
                        <option value="Government Employee">Government Employee</option>
                        <option value="Banker">Banker</option>
                        <option value="Farmer">Farmer</option>
                        <option value="Contractor">Contractor</option>
                        <option value="Shop Owner">Shop Owner</option>
                        <option value="Driver">Driver</option>
                        <option value="Retired">Retired</option>
                        <option value="Other">Other</option>
                    </select>

                    <select
                        className="w-full p-3 text-base border-2 border-gray-200 rounded-xl focus:border-blue-400 focus:outline-none transition-colors"
                        value={formData.motherOccupation}
                        onChange={(e) => handleInputChange('motherOccupation', e.target.value)}
                    >
                        <option value="">Mother's occupation</option>
                        <option value="Homemaker">Homemaker</option>
                        <option value="Teacher">Teacher</option>
                        <option value="Doctor">Doctor</option>
                        <option value="Nurse">Nurse</option>
                        <option value="Government Employee">Government Employee</option>
                        <option value="Business Owner">Business Owner</option>
                        <option value="Banker">Banker</option>
                        <option value="Software Engineer">Software Engineer</option>
                        <option value="Accountant">Accountant</option>
                        <option value="Designer">Designer</option>
                        <option value="Lawyer">Lawyer</option>
                        <option value="Retired">Retired</option>
                        <option value="Other">Other</option>
                    </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <select
                        className="w-full p-3 text-base border-2 border-gray-200 rounded-xl focus:border-blue-400 focus:outline-none transition-colors"
                        value={formData.siblings}
                        onChange={(e) => handleInputChange('siblings', e.target.value)}
                    >
                        <option value="">Number of siblings</option>
                        <option value="0">No siblings</option>
                        <option value="1">1 sibling</option>
                        <option value="2">2 siblings</option>
                        <option value="3">3 siblings</option>
                        <option value="4+">4+ siblings</option>
                    </select>

                    <select
                        className="w-full p-3 text-base border-2 border-gray-200 rounded-xl focus:border-blue-400 focus:outline-none transition-colors"
                        value={formData.familyType}
                        onChange={(e) => handleInputChange('familyType', e.target.value)}
                    >
                        <option value="">Family type</option>
                        <option value="nuclear">Nuclear Family</option>
                        <option value="joint">Joint Family</option>
                    </select>
                </div>
            </div>
        </div>
    );

    const renderStep5 = () => (
        <div className="space-y-4">
            <div className="text-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageCircle className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Share your story</h2>
                <p className="text-gray-600 mt-2">Tell potential matches about yourself</p>
            </div>

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">About me</label>
                    <textarea
                        className="w-full p-3 text-base border-2 border-gray-200 rounded-xl focus:border-blue-400 focus:outline-none transition-colors resize-none"
                        rows="4"
                        value={formData.about}
                        onChange={(e) => handleInputChange('about', e.target.value)}
                        placeholder="Tell us about personality, interests, values, and what makes you unique..."
                    ></textarea>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">What I'm looking for</label>
                    <textarea
                        className="w-full p-3 text-base border-2 border-gray-200 rounded-xl focus:border-blue-400 focus:outline-none transition-colors resize-none"
                        rows="4"
                        value={formData.lookingFor}
                        onChange={(e) => handleInputChange('lookingFor', e.target.value)}
                        placeholder="Describe the kind of person you'd like to meet and what you're hoping for in a relationship..."
                    ></textarea>
                </div>

                <div className="space-y-4">
                    <div>
                        <input
                            type="email"
                            className="w-full p-3 text-base border-2 border-gray-200 rounded-xl focus:border-blue-400 focus:outline-none transition-colors"
                            value={formData.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            placeholder="Email address"
                        />
                    </div>

                    <div>
                        <input
                            type="tel"
                            className="w-full p-3 text-base border-2 border-gray-200 rounded-xl focus:border-blue-400 focus:outline-none transition-colors"
                            value={formData.phone}
                            onChange={(e) => handleInputChange('phone', e.target.value)}
                            placeholder="Phone number"
                        />
                    </div>
                </div>
            </div>
        </div>
    );

    const renderStep6 = () => (
        <div className="space-y-4">
            <div className="text-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Shield className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Identity Verification</h2>
                <p className="text-gray-600 mt-2">Verify your identity to build trust (Optional)</p>
            </div>

            <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <div className="flex items-start space-x-3">
                        <Shield className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
                        <div>
                            <h3 className="font-semibold text-blue-800 mb-2">Why verify your identity?</h3>
                            <ul className="text-sm text-blue-700 space-y-1">
                                <li>• Get 3x more responses from potential matches</li>
                                <li>• Build trust and credibility</li>
                                <li>• Access to verified-only features</li>
                                <li>• Your documents are encrypted and secure</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Upload Government ID (Optional)</label>
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-400 transition-colors">
                        <input
                            type="file"
                            id="verificationDocument"
                            accept=".pdf,.jpg,.jpeg,.png"
                            className="hidden"
                            onChange={(e) => handleDocumentUpload(e.target.files[0])}
                        />
                        <label htmlFor="verificationDocument" className="cursor-pointer">
                            <div className="space-y-2">
                                <Upload className="w-8 h-8 text-gray-400 mx-auto" />
                                <div className="text-sm text-gray-600">
                                    <span className="font-medium text-blue-600 hover:text-blue-500">
                                        Choose a file
                                    </span>
                                    {' '}or drag and drop
                                </div>
                                <p className="text-xs text-gray-500">
                                    National ID, Passport, or Driver's License (Max 5MB)
                                </p>
                            </div>
                        </label>
                    </div>
                    {formData.verificationDocument && (
                        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                            <div className="flex items-center space-x-2">
                                <Check className="w-5 h-5 text-green-600" />
                                <span className="text-sm text-green-800">Document uploaded successfully</span>
                            </div>
                        </div>
                    )}
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                    <h4 className="font-semibold text-gray-800 mb-2">Verification Process</h4>
                    <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-center space-x-2">
                            <span className="w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">1</span>
                            <span>Upload your government ID</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <span className="w-5 h-5 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center text-xs font-bold">2</span>
                            <span>Our team reviews your document (24-48 hours)</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <span className="w-5 h-5 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs font-bold">3</span>
                            <span>Get verified and enjoy premium benefits</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderStep7 = () => (
        <div className="space-y-4">
            <div className="text-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Review & Complete</h2>
                <p className="text-gray-600 mt-2">Review your information before creating your profile</p>
            </div>

            <div className="space-y-4">
                <div className="bg-gray-50 rounded-xl p-4">
                    <h3 className="font-semibold text-gray-800 mb-3">Profile Summary</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                        <div>
                            <span className="font-medium text-gray-600">Name:</span>
                            <span className="ml-2 text-gray-800">{formData.name || 'Not provided'}</span>
                        </div>
                        <div>
                            <span className="font-medium text-gray-600">Age:</span>
                            <span className="ml-2 text-gray-800">{formData.age || 'Not provided'}</span>
                        </div>
                        <div>
                            <span className="font-medium text-gray-600">Gender:</span>
                            <span className="ml-2 text-gray-800 capitalize">{formData.gender || 'Not provided'}</span>
                        </div>
                        <div>
                            <span className="font-medium text-gray-600">Location:</span>
                            <span className="ml-2 text-gray-800">{formData.location || 'Not provided'}</span>
                        </div>
                        <div>
                            <span className="font-medium text-gray-600">Profession:</span>
                            <span className="ml-2 text-gray-800">{formData.profession || 'Not provided'}</span>
                        </div>
                        <div>
                            <span className="font-medium text-gray-600">Education:</span>
                            <span className="ml-2 text-gray-800">{formData.education || 'Not provided'}</span>
                        </div>
                        <div className="md:col-span-2">
                            <span className="font-medium text-gray-600">Email:</span>
                            <span className="ml-2 text-gray-800">{formData.email || 'Not provided'}</span>
                        </div>
                    </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <div className="flex items-start space-x-3">
                        <Heart className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
                        <div>
                            <h3 className="font-semibold text-blue-800 mb-2">You're almost done!</h3>
                            <p className="text-sm text-blue-700">
                                Your profile will be created and you can start connecting with potential matches.
                                You can always edit your profile later to add more details.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                    <div className="flex items-start space-x-3">
                        <Shield className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                        <div>
                            <h3 className="font-semibold text-green-800 mb-2">Privacy & Security</h3>
                            <p className="text-sm text-green-700">
                                Your information is encrypted and secure. We never share your personal details
                                with other users without your permission.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );



    const renderCurrentStep = () => {
        switch (currentStep) {
            case 1: return renderStep1();
            case 2: return renderStep2();
            case 3: return renderStep3();
            case 4: return renderStep4();
            case 5: return renderStep5();
            case 6: return renderStep6();
            case 7: return renderStep7();
            default: return renderStep1();
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-8 sm:py-12">
            <div className="px-4 sm:px-6 lg:px-8">
                <div>
                    <div className="text-center mb-8">
                        <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-3">
                            Find Your Perfect Match
                        </h1>
                        <p className="text-lg sm:text-xl text-gray-600">Join thousands of happy couples</p>

                        {/* Progress Bar */}
                        <div className="flex justify-center mt-6">
                            <div className="flex items-center space-x-2">
                                {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
                                    <div
                                        key={step}
                                        onClick={() => goToStep(step)}
                                        className={`w-8 h-2 rounded-full cursor-pointer transition-all duration-300 ${step <= currentStep
                                            ? 'bg-blue-500'
                                            : 'bg-gray-300 hover:bg-gray-400'
                                            }`}
                                    ></div>
                                ))}
                            </div>
                        </div>
                        <p className="text-sm text-gray-500 mt-3">Step {currentStep} of {totalSteps}</p>
                    </div>

                    <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
                        <div className="min-h-[500px]">
                            {renderCurrentStep()}
                        </div>


                        <div className="flex justify-between items-center mt-8">
                            {currentStep > 1 ? (
                                <button
                                    onClick={prevStep}
                                    className="px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors"
                                >
                                    ← Back
                                </button>
                            ) : (
                                <div></div>
                            )}

                            {currentStep === totalSteps ? (
                                <button
                                    onClick={handleSubmit}
                                    disabled={!isStepValid()}
                                    className={`flex items-center space-x-2 px-8 py-4 rounded-xl text-white font-semibold transition-all duration-300 ${isStepValid()
                                        ? 'bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 transform hover:scale-105 shadow-lg'
                                        : 'bg-gray-300 cursor-not-allowed'
                                        }`}
                                >
                                    <Heart className="w-5 h-5" />
                                    <span>Create Profile</span>
                                </button>
                            ) : (
                                <button
                                    onClick={nextStep}
                                    disabled={!isStepValid()}
                                    className={`flex items-center space-x-2 px-8 py-4 rounded-xl text-white font-semibold transition-all duration-300 ${isStepValid()
                                        ? 'bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 transform hover:scale-105 shadow-lg'
                                        : 'bg-gray-300 cursor-not-allowed'
                                        }`}
                                >
                                    <span>Continue</span>
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Trust indicators */}
                    <div className="text-center mt-6">
                        <p className="text-sm text-gray-500">
                            🔒 Your information is secure • ✓ 100% confidential • 💝 Trusted by 10,000+ members
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileForm;