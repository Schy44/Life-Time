import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    User,
    Edit,
    Save,
    XCircle,
    PlusCircle,
    Camera,
    MapPin,
    Briefcase,
    Globe,
    Upload,
    CheckCircle,
    Shield,
    FileText,
    AlertTriangle,
    Clock,
    Facebook,
    Instagram,
    Linkedin,
} from 'lucide-react';
import ProfileForm from '../components/profile_form';

// ---- Completion calculator + dev assertions (light tests) ----
const computeCompletion = (p) => {
    if (!p) return 0;
    const required = ['name', 'age', 'location', 'profession', 'about'];
    const optional = ['marital_status', 'languages_spoken', 'hobbies', 'blood_group'];
    const social = ['facebook_profile', 'instagram_profile', 'linkedin_profile'];
    let completed = 0;
    const total = required.length + optional.length + social.length; // 12
    required.forEach((k) => { if (p[k]) completed += 1; });
    optional.forEach((k) => {
        const v = p[k];
        if (Array.isArray(v)) { if (v.length > 0) completed += 1; }
        else if (v) { completed += 1; }
    });
    social.forEach((k) => { if (p[k]) completed += 1; });
    return Math.round((completed / total) * 100);
};

if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'production') {
    try {
        console.assert(computeCompletion({}) === 0, 'Empty should be 0%');
        console.assert(
            computeCompletion({ name: 'A', age: 20, location: 'X', profession: 'Y', about: 'Z' }) === 42,
            'Required-only should be 42%'
        );
        console.assert(
            computeCompletion({
                name: 'A', age: 20, location: 'X', profession: 'Y', about: 'Z',
                marital_status: 'never_married', languages_spoken: ['en'], hobbies: ['hiking'], blood_group: 'O+',
                facebook_profile: 'fb', instagram_profile: 'ig', linkedin_profile: 'ln',
            }) === 100,
            'Full should be 100%'
        );
        console.assert(
            computeCompletion({ name: 'A', age: 20, location: 'X', profession: 'Y', about: 'Z', languages_spoken: [] }) === 42,
            'Empty arrays should not count'
        );
    } catch (e) { console.warn('Dev assertions failed:', e); }
}

// Enhanced Verification Badge Component
const VerificationBadge = ({ profile, size = 'normal' }) => {
    if (!profile?.is_verified) return null;

    const sizeClasses = {
        small: 'w-4 h-4',
        normal: 'w-5 h-5',
        large: 'w-6 h-6'
    };

    const textSizeClasses = {
        small: 'text-xs',
        normal: 'text-sm',
        large: 'text-base'
    };

    return (
        <div className="relative group inline-block">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-semibold bg-gradient-to-r from-blue-500 via-purple-500 to-blue-600 text-white shadow-lg transform hover:scale-105 transition-all duration-200 border border-white/60">
                <div className="relative mr-1.5">
                    <CheckCircle className={`${sizeClasses[size]} drop-shadow-sm`} />
                    <div className="absolute inset-0 bg-white/30 rounded-full animate-ping opacity-60" aria-hidden="true"></div>
                </div>
                <span className={`${textSizeClasses[size]} font-bold tracking-wide`}>VERIFIED</span>
            </span>

            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2.5 py-1.5 bg-gray-900 text-white text-[10px] sm:text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                ✓ Identity Verified by Admin
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
            </div>
        </div>
    );
};

const ProfilePage = () => {
    const [profile, setProfile] = useState(null);
    const [hasProfile, setHasProfile] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({});
    const [activeTab, setActiveTab] = useState('overview');
    const [profileCompletion, setProfileCompletion] = useState(0);

    // ------- API -------
    const fetchProfile = async () => {
        const token = localStorage.getItem('token');
        if (!token) { setError('You are not logged in.'); setIsLoading(false); return; }
        try {
            setIsLoading(true);
            const res = await axios.get('/api/profiles/', { headers: { Authorization: `Token ${token}` } });
            if (res.data && res.data.length > 0) {
                const p = res.data[0];
                setProfile(p); setFormData(p); setHasProfile(true); setError(null); calculateProfileCompletion(p);
            } else { setHasProfile(false); }
        } catch (err) { setError('Failed to fetch profile data.'); console.error(err); }
        finally { setIsLoading(false); }
    };

    useEffect(() => { fetchProfile(); /* eslint-disable-next-line */ }, []);

    const handleProfileCreationSuccess = () => { fetchProfile(); };

    const handleEducationChange = (e) => {
        const { name, value } = e.target;
        const field = name.split('.')[1];
        setFormData((prev) => ({
            ...prev,
            education: [{
                ...prev.education?.[0],
                [field]: value,
            }],
        }));
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name === 'hobbies' || name === 'languages_spoken' || name === 'lifestyle_habits') {
            setFormData((prev) => ({ ...prev, [name]: value.split(',').map((i) => i.trim()).filter(Boolean) }));
        } else { setFormData((prev) => ({ ...prev, [name]: value })); }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        const formDataToSend = new FormData();

        // Append all non-file fields
        for (const key in formData) {
            if (key !== 'profile_image' && key !== 'additional_images' && key !== 'verification_document') {
                let valueToAppend = formData[key];
                if (key === 'profile_image_privacy') {
                    valueToAppend = valueToAppend === 'everyone' ? 'public' : 'matches';
                } else if (key === 'additional_images_privacy') {
                    valueToAppend = valueToAppend === 'everyone' ? 'public' : 'matches';
                }

                if (Array.isArray(valueToAppend)) {
                    formDataToSend.append(key, JSON.stringify(valueToAppend));
                } else if (valueToAppend !== null && valueToAppend !== undefined) {
                    formDataToSend.append(key, valueToAppend);
                }
            }
        }

        // Handle additional images (new uploads and existing IDs to keep)
        const existingAdditionalImages = profile?.additional_images?.map(img => img.id) || [];
        const currentAdditionalImages = (formData.additional_images || []).filter(item => typeof item === 'string');
        const imagesToKeep = currentAdditionalImages
            .map(url => {
                const parts = url.split('/');
                return parseInt(parts[parts.length - 2]); // Assuming ID is second to last part of URL
            })
            .filter(id => existingAdditionalImages.includes(id));

        formDataToSend.append('additional_images_to_keep', JSON.stringify(imagesToKeep));

        (formData.additional_images || []).forEach((image) => {
            if (typeof window !== 'undefined' && image instanceof File) {
                formDataToSend.append('uploaded_images', image);
            }
        });

        if (typeof window !== 'undefined' && formData.verification_document instanceof File) {
            formDataToSend.append('verification_document', formData.verification_document);
        }

        try {
            const res = await axios.patch(`/api/profiles/${profile.id}/`, formDataToSend, {
                headers: { Authorization: `Token ${token}`, 'Content-Type': 'multipart/form-data' },
            });
            setProfile(res.data); setFormData(res.data); setIsEditing(false); calculateProfileCompletion(res.data);
        } catch (err) { console.error('Failed to update profile:', err?.response ? err.response.data : err.message); alert('Failed to update profile.'); }
    };

    const patchPartial = async (partial) => {
        const token = localStorage.getItem('token'); if (!profile) return;
        try {
            const res = await axios.patch(`/api/profiles/${profile.id}/`, partial, {
                headers: { Authorization: `Token ${token}`, 'Content-Type': 'application/json' },
            });
            setProfile(res.data); setFormData(res.data); calculateProfileCompletion(res.data); return { ok: true };
        } catch (err) { console.error('Failed to PATCH:', err?.response ? err.response.data : err.message); alert('Update failed.'); return { ok: false }; }
    };

    const handleSaveOptionalInfo = async (e) => {
        e.preventDefault();
        const optionalData = {
            marital_status: formData.marital_status ?? null,
            languages_spoken: formData.languages_spoken ?? [],
            hobbies: formData.hobbies ?? [],
            blood_group: formData.blood_group ?? null,
            facebook_profile: formData.facebook_profile ?? null,
            instagram_profile: formData.instagram_profile ?? null,
            linkedin_profile: formData.linkedin_profile ?? null,
        };
        await patchPartial(optionalData);
        alert('Additional details saved successfully!');
    };

    // Document verification handler
    const handleDocumentUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const token = localStorage.getItem('token');
        const fd = new FormData();
        fd.append('verification_document', file);

        try {
            const res = await axios.patch(`/api/profiles/${profile.id}/`, fd, {
                headers: {
                    Authorization: `Token ${token}`,
                    'Content-Type': 'multipart/form-data'
                },
            });
            setProfile(res.data);
            setFormData(res.data);
            alert('Verification document uploaded successfully! It will be reviewed within 24-48 hours.');
        } catch (err) {
            console.error('Failed to upload document:', err);
            alert('Failed to upload document. Please try again.');
        }
    };

    // ------- Helpers -------
    const renderValue = (val, placeholder = 'N/A') => (val === undefined || val === null || val === '' ? placeholder : val);
    const calculateProfileCompletion = (p) => { setProfileCompletion(computeCompletion(p)); };

    const handleImageUpload = (e) => {
        const file = e.target.files?.[0]; if (!file) return;
        setFormData((prev) => ({ ...prev, profile_image: file }));
    };

    // UPDATED: support multiple file selection
    const handleAdditionalImageUpload = (e) => {
        const files = Array.from(e.target.files || []);
        if (!files.length) return;
        setFormData((prev) => ({ ...prev, additional_images: [...(prev.additional_images || []), ...files] }));
    };

    const handleDeleteAdditionalImage = (indexToDelete) => {
        setFormData((prev) => ({
            ...prev,
            additional_images: (prev.additional_images || []).filter((_, index) => index !== indexToDelete),
        }));
    };

    const Chips = ({ items = [], onRemove }) => (
        <div className="flex flex-wrap gap-1.5 xs:gap-2 w-full">
            {items.length ? (
                items.map((t, i) => (
                    <span key={`${t}-${i}`} className="bg-blue-100 text-blue-800 px-2 xs:px-2.5 py-0.5 xs:py-1 rounded-full text-xs xs:text-sm flex items-center gap-1 xs:gap-2">
                        <span className="break-words max-w-[10rem] xs:max-w-[12rem] sm:max-w-none">{t}</span>
                        {onRemove && (<button type="button" onClick={() => onRemove(i)} className="hover:text-blue-900 text-sm">×</button>)}
                    </span>
                ))
            ) : (<span className="text-gray-500 text-xs xs:text-sm">Not specified</span>)}
        </div>
    );

    // Verification Status Component
    const VerificationStatus = ({ profile }) => {
        const getStatusInfo = () => {
            if (profile?.is_verified) {
                return {
                    icon: Shield,
                    color: 'text-green-600',
                    bg: 'bg-green-50',
                    border: 'border-green-200',
                    status: 'Verified',
                    message: 'Your identity has been verified by our team.',
                    actionButton: null
                };
            } else if (profile?.verification_document) {
                return {
                    icon: Clock,
                    color: 'text-yellow-600',
                    bg: 'bg-yellow-50',
                    border: 'border-yellow-200',
                    status: 'Under Review',
                    message: 'Your document is being reviewed. This usually takes 24-48 hours.',
                    actionButton: null
                };
            } else {
                return {
                    icon: AlertTriangle,
                    color: 'text-orange-600',
                    bg: 'bg-orange-50',
                    border: 'border-orange-200',
                    status: 'Not Verified',
                    message: "Upload a government ID to verify your identity and gain trust.",
                    actionButton: (
                        <label className="cursor-pointer inline-flex items-center px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-md hover:bg-blue-700 transition-colors">
                            <Upload className="w-3 h-3 mr-1" />
                            Upload Document
                            <input
                                type="file"
                                className="hidden"
                                accept=".pdf,.jpg,.jpeg,.png"
                                onChange={handleDocumentUpload}
                            />
                        </label>
                    )
                };
            }
        };

        const statusInfo = getStatusInfo();
        const Icon = statusInfo.icon;

        return (
            <div className={`${statusInfo.bg} ${statusInfo.border} border rounded-lg p-3 sm:p-4 mb-4`}>
                <div className="flex flex-col sm:flex-row sm:items-start sm:space-x-3 gap-2 sm:gap-3">
                    <Icon className={`${statusInfo.color} w-5 h-5 mt-0.5 flex-shrink-0`} />
                    <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                            <h4 className={`${statusInfo.color} font-semibold text-sm`}>{statusInfo.status}</h4>
                            {statusInfo.actionButton}
                        </div>
                        <p className="text-gray-600 text-xs mt-1">{statusInfo.message}</p>
                        {profile?.verification_document && (
                            <div className="mt-2">
                                <a
                                    href={profile.verification_document}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-800 text-xs font-medium inline-flex items-center"
                                >
                                    <FileText className="w-3 h-3 mr-1" />
                                    View Uploaded Document
                                </a>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    // ------- UI Pieces -------
    const ProfileHeader = () => (
        <div className="relative p-1 sm:p-2 md:p-3 lg:p-4 xl:p-6">
            {/* Profile */}
            <div className="relative px-0 pb-1 sm:pb-2 md:pb-3 lg:pb-4 xl:pb-6 pt-1 sm:pt-2 md:pt-3 lg:pt-4 xl:pt-6">
                <div className="flex flex-col gap-2 sm:gap-3 md:gap-4 lg:gap-6 xl:flex-row xl:items-end xl:space-x-6">
                    {/* Avatar (BIGGER) */}
                    <div className="relative mb-1 sm:mb-2 md:mb-0 flex-shrink-0 mx-auto xl:mx-0">
                        <div className="relative">
                            <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 lg:w-40 lg:h-40 xl:w-48 xl:h-48 2xl:w-56 2xl:h-56 rounded-full overflow-hidden border-2 sm:border-3 md:border-4 border-white shadow-lg sm:shadow-xl bg-gray-100">
                                <img
                                    src={profile?.profile_image || (profile?.name ? `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&background=random&size=256` : '')}
                                    alt="Profile"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            {isEditing && (
                                <label className="absolute inset-0 bg-black/30 rounded-full flex items-center justify-center cursor-pointer opacity-0 hover:opacity-100 transition-opacity">
                                    <Camera className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 text-white" />
                                    <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                                </label>
                            )}
                        </div>
                    </div>

                    {/* Basic */}
                    <div className="flex-1 min-w-0 text-center xl:text-left">
                        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-2 sm:gap-3">
                            <div className="min-w-0 flex-1">
                                <h1 className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl 2xl:text-4xl font-bold text-gray-900 flex items-center justify-center xl:justify-start gap-2">
                                    <span className="truncate max-w-[14ch] sm:max-w-[16ch] md:max-w-[18ch] lg:max-w-none">{renderValue(profile?.name)}</span>
                                    {profile?.is_verified && (
                                        <VerificationBadge profile={profile} size="large" />
                                    )}
                                </h1>
                                <p className="text-gray-600 flex items-center justify-center xl:justify-start mt-1 text-xs sm:text-sm md:text-base break-words">
                                    <Briefcase className="w-3 h-3 sm:w-4 sm:h-4 mr-1 flex-shrink-0" />{renderValue(profile?.profession)}
                                </p>
                                <p className="text-gray-500 flex items-center justify-center xl:justify-start mt-1 text-xs sm:text-sm md:text-base break-words">
                                    <MapPin className="w-3 h-3 sm:w-4 sm:h-4 mr-1 flex-shrink-0" />{renderValue(profile?.location)}
                                </p>
                                {profile?.last_active && <p className="text-xs text-gray-400 mt-1 sm:mt-2">Last active: {profile.last_active}</p>}
                            </div>

                            {/* Actions */}
                            <div className="hidden xl:flex flex-wrap items-center justify-center gap-2 sm:gap-3 xl:flex-nowrap xl:justify-end">
                                {!isEditing ? (
                                    <button onClick={() => setIsEditing(true)} className="flex items-center bg-blue-600 text-white hover:bg-blue-700 font-medium py-1.5 sm:py-2 px-3 sm:px-4 rounded-lg transition-colors text-sm sm:text-base">
                                        <Edit className="mr-1 sm:mr-2 w-3 h-3 sm:w-4 sm:h-4" />Edit
                                    </button>
                                ) : (
                                    <>
                                        <button onClick={() => { setIsEditing(false); setFormData(profile); }} className="flex items-center text-gray-600 hover:text-red-600 font-medium py-1.5 sm:py-2 px-3 sm:px-4 rounded-lg transition-colors text-sm sm:text-base">
                                            <XCircle className="mr-1 sm:mr-2 w-3 h-3 sm:w-4 sm:h-4" />Cancel
                                        </button>
                                        <button onClick={handleSave} className="flex items-center bg-green-600 text-white hover:bg-green-700 font-medium py-1.5 sm:py-2 px-3 sm:px-4 rounded-lg transition-colors text-sm sm:text-base">
                                            <Save className="mr-1 sm:mr-2 w-3 h-3 sm:w-4 sm:h-4" />Save
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile sticky actions when editing */}
            {isEditing && (
                <div className="fixed bottom-[env(safe-area-inset-bottom)] inset-x-0 z-40 xl:hidden">
                    <div className="mx-1 sm:mx-2 md:mx-3 mb-1 sm:mb-2 md:mb-3 rounded-xl shadow-lg border border-gray-200 bg-white p-2 flex items-center justify-between gap-2">
                        <button onClick={() => { setIsEditing(false); setFormData(profile); }} className="flex-1 text-gray-700 border border-gray-300 rounded-lg py-2 font-medium text-sm">Cancel</button>
                        <button onClick={handleSave} className="flex-1 bg-green-600 text-white rounded-lg py-2 font-semibold text-sm">Save</button>
                    </div>
                </div>
            )}
        </div>
    );

    const ProfileCompletionCard = () => (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg sm:rounded-xl p-2 sm:p-3 md:p-4 lg:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2 sm:mb-3">
                <h3 className="font-semibold text-gray-800 text-sm sm:text-base lg:text-lg">Profile Completion</h3>
                <span className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-blue-600">{profileCompletion}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 sm:h-2.5 md:h-3 mb-2 sm:mb-3">
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 sm:h-2.5 md:h-3 rounded-full transition-all duration-500" style={{ width: `${profileCompletion}%` }} />
            </div>
            <p className="text-xs sm:text-sm md:text-base text-gray-600">
                {profileCompletion < 70 ? 'Complete your profile to get better matches!' : profileCompletion < 90 ? 'Great! Just a few more details to go.' : 'Perfect! Your profile is complete.'}
            </p>
        </div>
    );

    const TabNavigation = () => (
        <div className="w-full border-b border-gray-200 mb-2 sm:mb-3 md:mb-4 lg:mb-6">
            <nav className="-mb-px grid grid-cols-5">
                {[
                    { id: 'overview', label: 'Overview', icon: User },
                    { id: 'details', label: 'Details', icon: Clock },
                    { id: 'verification', label: 'Verification', icon: Shield },
                    { id: 'gallery', label: 'Gallery', icon: Camera },
                    { id: 'social', label: 'Social', icon: Globe },
                ].map((tab) => {
                    const Icon = tab.icon;
                    const active = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center justify-center py-1.5 sm:py-2 md:py-3 px-1.5 sm:px-2 md:px-3 border-b-2 font-medium text-xs sm:text-sm transition-colors whitespace-nowrap rounded-t-md w-full ${active ? 'border-blue-500 text-blue-600 bg-blue-50' : 'border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300'}`}>
                            <Icon className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 mr-1 sm:mr-1.5" />{tab.label}
                        </button>
                    );
                })}
            </nav>
        </div>
    );

    const MARITAL_OPTIONS = [
        { value: 'single', label: 'Never married' },
        { value: 'divorced', label: 'Divorced' },
        { value: 'widowed', label: 'Widowed' },
    ];

    const FAMILY_TYPE_OPTIONS = [
        { value: 'nuclear', label: 'Nuclear Family' },
        { value: 'joint', label: 'Joint Family' },
    ];

    const PROFILE_FOR_OPTIONS = [
        { value: 'self', label: 'Myself' },
        { value: 'son', label: 'My Son' },
        { value: 'daughter', label: 'My Daughter' },
        { value: 'brother', label: 'My Brother' },
        { value: 'sister', label: 'My Sister' },
        { value: 'relative', label: 'Relative/Friend' },
    ];

    const PRIVACY_OPTIONS = [
        { value: 'public', label: 'Public' },
        { value: 'matches', label: 'Matches Only' },
    ];

    const DetailsTab = () => (
        <div>
            <div className="mb-2 sm:mb-3 md:mb-4 lg:mb-6">
                <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-800 mb-2">Personal Details</h3>
                <p className="text-gray-600 text-xs sm:text-sm md:text-base">Add additional information about yourself to help others get to know you better.</p>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <div className="space-y-6">
                    <div className="bg-gray-50 p-2 sm:p-3 md:p-4 lg:p-6 rounded-lg sm:rounded-xl">
                        <h4 className="font-semibold mb-2 sm:mb-3 md:mb-4 text-gray-800 flex items-center">
                            <User className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-blue-600" />
                            Personal Information
                        </h4>
                        <div className="space-y-2 sm:space-y-3 md:space-y-4">
                            <div>
                                <label className="block text-xs sm:text-sm font-medium text-gray-600 mb-1">Blood Group</label>
                                {isEditing ? (
                                    <select name="blood_group" value={formData.blood_group || ''} onChange={handleInputChange} className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm">
                                        <option value="">Select...</option>
                                        {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (<option key={bg} value={bg}>{bg}</option>))}
                                    </select>
                                ) : (
                                    <p className="text-gray-800 text-sm sm:text-base">{renderValue(profile?.blood_group, 'Not specified')}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-xs sm:text-sm font-medium text-gray-600 mb-1">Marital Status</label>
                                {isEditing ? (
                                    <select name="marital_status" value={formData.marital_status || ''} onChange={handleInputChange} className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm">
                                        <option value="">Select...</option>
                                        {MARITAL_OPTIONS.map((opt) => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
                                    </select>
                                ) : (
                                    <p className="text-gray-800 capitalize text-sm sm:text-base">{renderValue(profile?.marital_status ? profile.marital_status.replace('_', ' ') : '', 'Not specified')}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-xs sm:text-sm font-medium text-gray-600 mb-1">Religion</label>
                                {isEditing ? (
                                    <input type="text" name="religion" value={formData.religion || ''} onChange={handleInputChange} placeholder="e.g., Islam, Christianity" className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm" />
                                ) : (
                                    <p className="text-gray-800 text-sm sm:text-base">{renderValue(profile?.religion, 'Not specified')}</p>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-50 p-2 sm:p-3 md:p-4 lg:p-6 rounded-lg sm:rounded-xl">
                        <h4 className="font-semibold mb-2 sm:mb-3 md:mb-4 text-gray-800 flex items-center">
                            <User className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-blue-600" />
                            Education & Career
                        </h4>
                        <div className="space-y-2 sm:space-y-3 md:space-y-4">
                            <div>
                                <label className="block text-xs sm:text-sm font-medium text-gray-600 mb-1">Education</label>
                                {isEditing ? (
                                    <div>
                                        <input type="text" name="education.degree" value={formData.education?.[0]?.degree || ''} onChange={handleEducationChange} placeholder="Degree" className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm mb-2" />
                                        <input type="text" name="education.school" value={formData.education?.[0]?.school || ''} onChange={handleEducationChange} placeholder="School/University" className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm mb-2" />
                                        <input type="text" name="education.field_of_study" value={formData.education?.[0]?.field_of_study || ''} onChange={handleEducationChange} placeholder="Field of Study" className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm" />
                                    </div>
                                ) : (
                                    <p className="text-gray-800 text-sm sm:text-base">{renderValue(profile?.education?.[0]?.degree, 'Not specified')}</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="space-y-6">
                    <div className="bg-gray-50 p-2 sm:p-3 md:p-4 lg:p-6 rounded-lg sm:rounded-xl">
                        <h4 className="font-semibold mb-2 sm:mb-3 md:mb-4 text-gray-800 flex items-center">
                            <Globe className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-blue-600" />
                            Languages & Interests
                        </h4>
                        <div className="space-y-3 sm:space-y-4 md:space-y-5 lg:space-y-6">
                            <div>
                                <label className="block text-xs sm:text-sm font-medium text-gray-600 mb-2">Languages Spoken</label>
                                {isEditing ? (
                                    <input type="text" name="languages_spoken" value={Array.isArray(formData.languages_spoken) ? formData.languages_spoken.join(', ') : ''} onChange={handleInputChange} placeholder="e.g., English, Spanish, French" className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm" />
                                ) : (
                                    <Chips items={profile?.languages_spoken || []} />
                                )}
                            </div>
                            <div>
                                <label className="block text-xs sm:text-sm font-medium text-gray-600 mb-2">Interests & Hobbies</label>
                                {isEditing ? (
                                    <input type="text" name="hobbies" value={Array.isArray(formData.hobbies) ? formData.hobbies.join(', ') : ''} onChange={handleInputChange} placeholder="e.g., Photography, Hiking, Reading" className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm" />
                                ) : (
                                    <Chips items={profile?.hobbies || []} />
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-50 p-2 sm:p-3 md:p-4 lg:p-6 rounded-lg sm:rounded-xl">
                        <h4 className="font-semibold mb-2 sm:mb-3 md:mb-4 text-gray-800 flex items-center">
                            <Briefcase className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-blue-600" />
                            Lifestyle & Preferences
                        </h4>
                        <div className="space-y-2 sm:space-y-3 md:space-y-4">
                            <div>
                                <label className="block text-xs sm:text-sm font-medium text-gray-600 mb-1">Dietary Preference</label>
                                {isEditing ? (
                                    <select name="dietary_preference" value={formData.dietary_preference || ''} onChange={handleInputChange} className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm">
                                        <option value="">Select...</option>
                                        <option value="vegetarian">Vegetarian</option>
                                        <option value="non-vegetarian">Non-Vegetarian</option>
                                        <option value="vegan">Vegan</option>
                                        <option value="halal">Halal</option>
                                    </select>
                                ) : (
                                    <p className="text-gray-800 text-sm sm:text-base">{renderValue(profile?.dietary_preference, 'Not specified')}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-xs sm:text-sm font-medium text-gray-600 mb-1">Living Situation</label>
                                {isEditing ? (
                                    <select name="living_situation" value={formData.living_situation || ''} onChange={handleInputChange} className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm">
                                        <option value="">Select...</option>
                                        <option value="with-parents">With Parents</option>
                                        <option value="independent">Independent</option>
                                        <option value="with-roommates">With Roommates</option>
                                    </select>
                                ) : (
                                    <p className="text-gray-800 text-sm sm:text-base">{renderValue(profile?.living_situation, 'Not specified')}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-xs sm:text-sm font-medium text-gray-600 mb-2">Lifestyle Habits</label>
                                {isEditing ? (
                                    <input type="text" name="lifestyle_habits" value={Array.isArray(formData.lifestyle_habits) ? formData.lifestyle_habits.join(', ') : ''} onChange={handleInputChange} placeholder="e.g., Smoker, Early Bird, Fitness" className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm" />
                                ) : (
                                    <Chips items={profile?.lifestyle_habits || []} />
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
    const OverviewTab = () => (
        <div>
            <div className="mb-2 sm:mb-3 md:mb-4 lg:mb-6">
                <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-800 mb-2">Profile Overview</h3>
                <p className="text-gray-600 text-xs sm:text-sm md:text-base">Complete your profile information to get better matches and build trust with potential partners.</p>
            </div>

            <div className="mb-6">
                <ProfileCompletionCard />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <div className="space-y-6">
                    {/* Left Column - Basic Info & Contact */}
                    <div className="bg-gray-50 p-2 sm:p-3 md:p-4 lg:p-6 rounded-lg sm:rounded-xl">
                        <h4 className="font-semibold mb-2 sm:mb-3 md:mb-4 text-gray-800 flex items-center">
                            <User className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-blue-600" />
                            Basic Info
                        </h4>
                        <div className="space-y-2 sm:space-y-3 md:space-y-4">
                            <div>
                                <label className="block text-xs sm:text-sm font-medium text-gray-600 mb-1">Name</label>
                                {isEditing ? (
                                    <input type="text" name="name" value={formData.name || ''} onChange={handleInputChange} className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm" />
                                ) : (
                                    <p className="text-gray-800 break-words text-sm sm:text-base">{renderValue(profile?.name)}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-xs sm:text-sm font-medium text-gray-600 mb-1">Profile For</label>
                                {isEditing ? (
                                    <select name="profile_for" value={formData.profile_for || ''} onChange={handleInputChange} className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm">
                                        <option value="">Select...</option>
                                        {PROFILE_FOR_OPTIONS.map((opt) => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
                                    </select>
                                ) : (
                                    <p className="text-gray-800 capitalize text-sm sm:text-base">{renderValue(profile?.profile_for)}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-xs sm:text-sm font-medium text-gray-600 mb-1">Age</label>
                                {isEditing ? (
                                    <input type="number" name="age" value={formData.age || ''} onChange={handleInputChange} className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm" />
                                ) : (
                                    <p className="text-gray-800 text-sm sm:text-base">{renderValue(profile?.age)}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-xs sm:text-sm font-medium text-gray-600 mb-1">Gender</label>
                                {isEditing ? (
                                    <select name="gender" value={formData.gender || ''} onChange={handleInputChange} className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm">
                                        <option value="">Select...</option>
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                    </select>
                                ) : (
                                    <p className="text-gray-800 capitalize text-sm sm:text-base">{renderValue(profile?.gender)}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-xs sm:text-sm font-medium text-gray-600 mb-1">Location</label>
                                {isEditing ? (
                                    <input type="text" name="location" value={formData.location || ''} onChange={handleInputChange} className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm" />
                                ) : (
                                    <p className="text-gray-800 break-words text-sm sm:text-base">{renderValue(profile?.location)}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-xs sm:text-sm font-medium text-gray-600 mb-1">Profession</label>
                                {isEditing ? (
                                    <input type="text" name="profession" value={formData.profession || ''} onChange={handleInputChange} className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm" />
                                ) : (
                                    <p className="text-gray-800 break-words text-sm sm:text-base">{renderValue(profile?.profession)}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-50 p-2 sm:p-3 md:p-4 lg:p-6 rounded-lg sm:rounded-xl">
                        <h4 className="font-semibold mb-2 sm:mb-3 md:mb-4 text-gray-800 flex items-center">
                            <Briefcase className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-blue-600" />
                            Contact Info
                        </h4>
                        <div className="space-y-2 sm:space-y-3 md:space-y-4">
                            <div>
                                <label className="block text-xs sm:text-sm font-medium text-gray-600 mb-1">Email</label>
                                {isEditing ? (
                                    <input type="email" name="email" value={formData.email || ''} onChange={handleInputChange} className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm" />
                                ) : (
                                    <p className="text-gray-800 break-words text-sm sm:text-base">{renderValue(profile?.email)}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-xs sm:text-sm font-medium text-gray-600 mb-1">Phone</label>
                                {isEditing ? (
                                    <input type="tel" name="phone" value={formData.phone || ''} onChange={handleInputChange} className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm" />
                                ) : (
                                    <p className="text-gray-800 break-words text-sm sm:text-base">{renderValue(profile?.phone)}</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                {/* Right Column - About & Family */}
                <div className="space-y-6">
                    <div className="bg-gray-50 p-2 sm:p-3 md:p-4 lg:p-6 rounded-lg sm:rounded-xl">
                        <h4 className="font-semibold mb-2 sm:mb-3 md:mb-4 text-gray-800 flex items-center">
                            <FileText className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-blue-600" />
                            About Me
                        </h4>
                        <div className="space-y-2 sm:space-y-3 md:space-y-4">
                            <div>
                                <label className="block text-xs sm:text-sm font-medium text-gray-600 mb-1">About</label>
                                {isEditing ? (
                                    <textarea name="about" value={formData.about || ''} onChange={handleInputChange} rows="4" className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"></textarea>
                                ) : (
                                    <p className="text-gray-800 whitespace-pre-wrap break-words text-sm sm:text-base">{renderValue(profile?.about, 'No description provided yet.')}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-xs sm:text-sm font-medium text-gray-600 mb-1">Looking For</label>
                                {isEditing ? (
                                    <textarea name="looking_for" value={formData.looking_for || ''} onChange={handleInputChange} rows="4" className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"></textarea>
                                ) : (
                                    <p className="text-gray-800 whitespace-pre-wrap break-words text-sm sm:text-base">{renderValue(profile?.looking_for, 'Not specified')}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-50 p-2 sm:p-3 md:p-4 lg:p-6 rounded-lg sm:rounded-xl">
                        <h4 className="font-semibold mb-2 sm:mb-3 md:mb-4 text-gray-800 flex items-center">
                            <User className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-blue-600" />
                            Family Background
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 md:gap-4">
                            <div>
                                <label className="block text-xs sm:text-sm font-medium text-gray-600 mb-1">Father's Occupation</label>
                                {isEditing ? (
                                    <input type="text" name="father_occupation" value={formData.father_occupation || ''} onChange={handleInputChange} className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm" />
                                ) : (
                                    <p className="text-gray-800 break-words text-sm sm:text-base">{renderValue(profile?.father_occupation, 'Not specified')}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-xs sm:text-sm font-medium text-gray-600 mb-1">Mother's Occupation</label>
                                {isEditing ? (
                                    <input type="text" name="mother_occupation" value={formData.mother_occupation || ''} onChange={handleInputChange} className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm" />
                                ) : (
                                    <p className="text-gray-800 break-words text-sm sm:text-base">{renderValue(profile?.mother_occupation, 'Not specified')}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-xs sm:text-sm font-medium text-gray-600 mb-1">Siblings</label>
                                {isEditing ? (
                                    <input type="text" name="siblings" value={formData.siblings || ''} onChange={handleInputChange} className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm" />
                                ) : (
                                    <p className="text-gray-800 break-words text-sm sm:text-base">{renderValue(profile?.siblings, 'Not specified')}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-xs sm:text-sm font-medium text-gray-600 mb-1">Family Type</label>
                                {isEditing ? (
                                    <select name="family_type" value={formData.family_type || ''} onChange={handleInputChange} className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm">
                                        <option value="">Select...</option>
                                        {FAMILY_TYPE_OPTIONS.map((opt) => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
                                    </select>
                                ) : (
                                    <p className="text-gray-800 text-sm sm:text-base">{renderValue(profile?.family_type, 'Not specified')}</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    // Verification Tab
    const VerificationTab = () => (
        <div>
            <div className="mb-2 sm:mb-3 md:mb-4 lg:mb-6">
                <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-800 mb-2">Identity Verification</h3>
                <p className="text-gray-600 text-xs sm:text-sm md:text-base">Verify your identity to build trust and get better matches. Your verification documents are kept secure and private.</p>
            </div>

            <VerificationStatus profile={profile} />

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-2 sm:gap-3 md:gap-4 lg:gap-6">
                {/* Verification Upload Section */}
                <div className="bg-gray-50 p-2 sm:p-3 md:p-4 lg:p-6 rounded-lg sm:rounded-xl">
                    <h4 className="font-semibold mb-2 sm:mb-3 md:mb-4 text-gray-800 flex items-center">
                        <FileText className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-blue-600" />
                        Document Verification
                    </h4>

                    <div className="space-y-3 sm:space-y-4">
                        <div>
                            <label className="block text-xs sm:text-sm font-medium text-gray-600 mb-2">
                                Upload Government ID
                            </label>
                            <p className="text-xs text-gray-500 mb-2 sm:mb-3">
                                Accepted formats: PDF, JPG, PNG (Max 5MB)
                            </p>

                            {!profile?.verification_document ? (
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-3 sm:p-4 md:p-6 text-center hover:border-blue-400 transition-colors">
                                    <label className="cursor-pointer block">
                                        <div className="space-y-2">
                                            <Upload className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400 mx-auto" />
                                            <div className="text-xs sm:text-sm text-gray-600">
                                                <span className="font-medium text-blue-600 hover:text-blue-500">
                                                    Choose a file
                                                </span>
                                                {' '}or drag and drop
                                            </div>
                                            <p className="text-xs text-gray-500">
                                                National ID, Passport, or Driver's License
                                            </p>
                                        </div>
                                        <input
                                            type="file"
                                            className="hidden"
                                            accept=".pdf,.jpg,.jpeg,.png"
                                            onChange={handleDocumentUpload}
                                        />
                                    </label>
                                </div>
                            ) : (
                                <div className="border border-gray-200 rounded-lg p-3 sm:p-4 bg-white">
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                        <div className="flex items-center space-x-3">
                                            <div className="p-2 bg-blue-100 rounded-lg">
                                                <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                                            </div>
                                            <div>
                                                <p className="text-xs sm:text-sm font-medium text-gray-800">
                                                    Verification Document
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    Uploaded and under review
                                                </p>
                                            </div>
                                        </div>
                                        <a
                                            href={profile.verification_document}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 hover:text-blue-800 text-xs sm:text-sm font-medium"
                                        >
                                            View
                                        </a>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="block text-xs sm:text-sm font-medium text-gray-600 mb-1">
                                Document Type
                            </label>
                            {isEditing ? (
                                <select
                                    name="document_type"
                                    value={formData.document_type || ''}
                                    onChange={handleInputChange}
                                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                                >
                                    <option value="">Select document type...</option>
                                    <option value="national_id">National ID</option>
                                    <option value="passport">Passport</option>
                                    <option value="drivers_license">Driver's License</option>
                                    <option value="other">Other Government ID</option>
                                </select>
                            ) : (
                                <p className="text-gray-800 capitalize text-sm">
                                    {renderValue(profile?.document_type?.replace('_', ' '), 'Not specified')}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-xs sm:text-sm font-medium text-gray-600 mb-1">
                                Document Number
                            </label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    name="document_number"
                                    value={formData.document_number || ''}
                                    onChange={handleInputChange}
                                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                                    placeholder="Enter document number"
                                />
                            ) : (
                                <p className="text-gray-800 text-sm">
                                    {profile?.document_number ?
                                        `****${String(profile.document_number).slice(-4)}` :
                                        'Not specified'
                                    }
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Verification Benefits */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-2 sm:p-3 md:p-4 lg:p-6 rounded-lg sm:rounded-xl border border-blue-200">
                    <h4 className="font-semibold mb-2 sm:mb-3 md:mb-4 text-gray-800 flex items-center">
                        <Shield className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-blue-600" />
                        Why Verify?
                    </h4>

                    <div className="space-y-2 sm:space-y-3 md:space-y-4">
                        {[
                            { title: 'Build Trust', desc: 'Verified profiles get 3x more responses' },
                            { title: 'Priority Matching', desc: 'Get matched with other verified users first' },
                            { title: 'Enhanced Security', desc: 'Protects against fake profiles' },
                            { title: 'Premium Features', desc: 'Access to exclusive verified-only features' },
                        ].map((it, idx) => (
                            <div key={idx} className="flex flex-col sm:flex-row sm:items-start sm:space-x-3 gap-2 sm:gap-3">
                                <div className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                                    <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
                                </div>
                                <div>
                                    <p className="font-medium text-gray-800 text-sm sm:text-base">{it.title}</p>
                                    <p className="text-xs sm:text-sm text-gray-600">{it.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-3 sm:mt-4 md:mt-6 p-2 sm:p-3 md:p-4 bg-white/60 rounded-lg">
                        <div className="flex items-center space-x-2 mb-1 sm:mb-1.5">
                            <Shield className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />
                            <span className="font-medium text-gray-800 text-sm sm:text-base">Privacy Protected</span>
                        </div>
                        <p className="text-xs text-gray-600">
                            Your documents are encrypted and only viewed by our verification team.
                            We never share your personal information with other users.
                        </p>
                    </div>
                </div>
            </div>

            {/* Verification Timeline */}
            <div className="mt-4 sm:mt-6 md:mt-8 bg-white border border-gray-200 rounded-lg sm:rounded-xl p-2 sm:p-3 md:p-4 lg:p-6">
                <h4 className="font-semibold mb-2 sm:mb-3 md:mb-4 text-gray-800 text-sm sm:text-base">Verification Process</h4>
                <div className="space-y-2 sm:space-y-3 md:space-y-4">
                    {[
                        { n: 1, t: 'Upload Document', d: 'Submit a clear photo of your government ID' },
                        { n: 2, t: 'Review Process', d: 'Our team reviews your document (24-48 hours)' },
                        { n: 3, t: 'Get Verified', d: 'Receive your verification badge and enjoy premium benefits' },
                    ].map(step => (
                        <div key={step.n} className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 gap-2 sm:gap-3">
                            <div className="flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                <span className="text-xs sm:text-sm font-bold text-blue-600">{step.n}</span>
                            </div>
                            <div>
                                <p className="font-medium text-gray-800 text-sm sm:text-base">{step.t}</p>
                                <p className="text-xs sm:text-sm text-gray-600">{step.d}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    const GalleryTab = () => (
        <div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-2 sm:mb-3 md:mb-4 lg:mb-6 gap-2 sm:gap-3 md:gap-4">
                <h3 className="font-semibold text-gray-800 text-sm sm:text-base lg:text-lg">Photo Gallery</h3>
                {isEditing && (
                    <label className="w-full sm:w-auto inline-flex items-center justify-center bg-blue-600 text-white hover:bg-blue-700 font-medium py-1.5 sm:py-2 px-3 sm:px-4 rounded-lg transition-colors cursor-pointer text-sm">
                        <Upload className="mr-1 sm:mr-2 w-3 h-3 sm:w-4 sm:h-4" />Upload Photos
                        <input type="file" className="hidden" accept="image/*" onChange={handleAdditionalImageUpload} multiple />
                    </label>
                )}
            </div>

            <div className="bg-gray-50 p-2 sm:p-3 md:p-4 rounded-lg sm:rounded-xl mb-2 sm:mb-3 md:mb-4 lg:mb-6">
                <h4 className="font-semibold mb-2 sm:mb-3 text-gray-800 text-sm sm:text-base">Privacy Settings</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 md:gap-4">
                    <div>
                        <label className="block text-xs sm:text-sm font-medium text-gray-600 mb-1">Profile Image Privacy</label>
                        {isEditing ? (
                            <select name="profile_image_privacy" value={formData.profile_image_privacy || ''} onChange={handleInputChange} className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm">
                                <option value="">Select...</option>
                                {PRIVACY_OPTIONS.map((opt) => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
                            </select>
                        ) : (
                            <p className="text-gray-800 capitalize text-sm sm:text-base">{renderValue(profile?.profile_image_privacy)}</p>
                        )}
                    </div>
                    <div>
                        <label className="block text-xs sm:text-sm font-medium text-gray-600 mb-1">Additional Images Privacy</label>
                        {isEditing ? (
                            <select name="additional_images_privacy" value={formData.additional_images_privacy || ''} onChange={handleInputChange} className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm">
                                <option value="">Select...</option>
                                {PRIVACY_OPTIONS.map((opt) => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
                            </select>
                        ) : (
                            <p className="text-gray-800 capitalize text-sm sm:text-base">{renderValue(profile?.additional_images_privacy)}</p>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-1.5 sm:gap-2 md:gap-3 lg:gap-4">
                {profile?.profile_image && (
                    <div className="relative aspect-square group overflow-hidden rounded-lg sm:rounded-xl">
                        <img src={profile.profile_image} alt="Profile" className="w-full h-full object-cover" />
                        <div className="absolute top-1 sm:top-2 left-1 sm:left-2 bg-blue-600 text-white px-1.5 sm:px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] md:text-xs">Main</div>
                        {isEditing && (
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg sm:rounded-xl flex items-center justify-center">
                                <button onClick={() => setFormData(prev => ({ ...prev, profile_image: null }))} className="text-white hover:text-red-400 transition-colors">
                                    <XCircle className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {(profile?.additional_images || []).map((img, index) => (
                    <div key={index} className="relative aspect-square group overflow-hidden rounded-lg sm:rounded-xl">
                        <img src={img.image || img} alt={`Gallery ${index + 1}`} className="w-full h-full object-cover" />
                        {isEditing && (
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg sm:rounded-xl flex items-center justify-center">
                                <button onClick={() => handleDeleteAdditionalImage(index)} className="text-white hover:text-red-400 transition-colors">
                                    <XCircle className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
                                </button>
                            </div>
                        )}
                    </div>
                ))}

                {isEditing && (
                    <div className="aspect-square border-2 border-dashed border-gray-300 rounded-lg sm:rounded-xl flex items-center justify-center hover:border-blue-400 transition-colors cursor-pointer">
                        <label className="text-center cursor-pointer w-full h-full flex flex-col items-center justify-center">
                            <PlusCircle className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-gray-400 mb-1 sm:mb-2" />
                            <p className="text-xs sm:text-sm text-gray-500">Add Photo</p>
                            <input type="file" className="hidden" accept="image/*" onChange={handleAdditionalImageUpload} multiple />
                        </label>
                    </div>
                )}
            </div>
        </div>
    );

    const SocialTab = () => (
        <div>
            <div className="mb-2 sm:mb-3 md:mb-4 lg:mb-6">
                <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-800 mb-2">Social Media Profiles</h3>
                <p className="text-gray-600 text-xs sm:text-sm md:text-base">Connect your social media profiles to showcase more about yourself and build trust with potential matches.</p>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-2 sm:gap-3 md:gap-4 lg:gap-6">
                {[
                    { name: 'facebook_profile', label: 'Facebook', icon: Facebook, bg: 'bg-blue-100', fg: 'text-blue-600' },
                    { name: 'instagram_profile', label: 'Instagram', icon: Instagram, bg: 'bg-pink-100', fg: 'text-pink-600' },
                    { name: 'linkedin_profile', label: 'LinkedIn', icon: Linkedin, bg: 'bg-blue-100', fg: 'text-blue-600' },
                    { name: 'twitter_profile', label: 'Twitter', icon: Globe, bg: 'bg-sky-100', fg: 'text-sky-600' },
                ].map((s) => {
                    const Icon = s.icon;
                    return (
                        <div key={s.name} className="flex flex-col gap-2 sm:gap-3 p-2 sm:p-3 md:p-4 lg:p-6 bg-gray-50 rounded-lg sm:rounded-xl">
                            <div className="flex items-center gap-2 sm:gap-3">
                                <div className={`p-1.5 sm:p-2 ${s.bg} rounded-lg w-max`}><Icon className={`w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 ${s.fg}`} /></div>
                                <label className="text-xs sm:text-sm font-medium text-gray-700">{s.label}</label>
                            </div>
                            <div className="flex-1 min-w-0">
                                {isEditing ? (
                                    <input type="url" name={s.name} value={formData[s.name] || ''} onChange={handleInputChange} placeholder={`Your ${s.label} profile URL`} className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm" />
                                ) : (
                                    <div className="flex items-center justify-between gap-2">
                                        <p className="text-gray-600 break-words text-sm sm:text-base flex-1 min-w-0">{profile?.[s.name] || 'Not connected'}</p>
                                        {profile?.[s.name] && !isEditing && (
                                            <a href={profile[s.name]} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 flex-shrink-0">
                                                <Globe className="w-4 h-4 sm:w-5 sm:h-5" />
                                            </a>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );

    // ------- Render -------
    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-blue-600 mx-auto" />
                    <p className="mt-4 text-gray-600 text-sm sm:text-base">Loading your profile...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
                <div className="text-center p-6 sm:p-8 bg-white rounded-2xl shadow-lg max-w-md w-full">
                    <div className="text-red-500 mb-3 sm:mb-4"><XCircle className="w-10 h-10 sm:w-12 sm:h-12 mx-auto" /></div>
                    <p className="text-red-600 font-medium">{error}</p>
                </div>
            </div>
        );
    }

    if (hasProfile && profile) {
        return (
            <div className="min-h-screen bg-gray-50 pb-16 lg:pb-0">{/* extra pb for mobile sticky actions */}
                <div className="w-full px-1 sm:px-2 md:px-3 lg:px-4 xl:px-6 2xl:px-8">
                    <div className="bg-white rounded-lg sm:rounded-xl lg:rounded-2xl shadow-lg sm:shadow-xl overflow-hidden mb-2 sm:mb-3 lg:mb-4">
                        <ProfileHeader />
                    </div>

                    {/* Content Card */}
                    <div className="bg-white rounded-lg sm:rounded-xl lg:rounded-2xl shadow-lg sm:shadow-xl p-1 sm:p-2 md:p-3 lg:p-4 xl:p-6">
                        <TabNavigation />
                        {activeTab === 'overview' && <OverviewTab />}
                        {activeTab === 'details' && <DetailsTab />}
                        {activeTab === 'verification' && <VerificationTab />}
                        {activeTab === 'gallery' && <GalleryTab />}
                        {activeTab === 'social' && <SocialTab />}
                    </div>
                </div>
            </div>
        );
    } else if (!hasProfile && !isLoading) {
        return <ProfileForm onProfileCreateSuccess={handleProfileCreationSuccess} />;
    }

    return null; // Should not reach here
};

export default ProfilePage;
