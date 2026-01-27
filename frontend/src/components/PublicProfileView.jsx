import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCheckCircle, FaMapMarkerAlt, FaGraduationCap, FaBriefcase, FaHeart, FaTimes, FaChevronLeft, FaChevronRight, FaPhone } from 'react-icons/fa';
import SectionCard from './SectionCard';
import InfoRow from './InfoRow';
import Socials from './Socials';
import FaithTagsSection from './FaithTagsSection';
import { getCountries } from '../services/api'; // Import getCountries
import { useQuery } from '@tanstack/react-query';

// Helper for formatting strings
const formatString = (str) => {
    if (typeof str !== 'string') return str;
    return str.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
};

// Image viewer modal component
function ImageViewer({ images, startIndex = 0, onClose }) {
    const [index, setIndex] = useState(startIndex || 0);

    if (!images || !images.length) return null;

    return (
        <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
            onClick={onClose}
        >
            <div
                className="relative max-w-5xl w-full h-full flex items-center justify-center"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    aria-label="Close"
                    onClick={onClose}
                    className="absolute top-4 right-4 text-white bg-black/40 p-2 rounded-full"
                >
                    <FaTimes />
                </button>

                {images.length > 1 && (
                    <button
                        aria-label="Previous"
                        onClick={() => setIndex((i) => Math.max(i - 1, 0))}
                        className="absolute left-4 text-white bg-black/40 p-3 rounded-full"
                    >
                        <FaChevronLeft />
                    </button>
                )}

                <div className="max-h-full max-w-full flex items-center justify-center">
                    <img
                        src={images[index]}
                        alt={`Large ${index + 1}`}
                        className="max-h-[90vh] max-w-full object-contain rounded-md shadow-lg"
                    />
                </div>

                {images.length > 1 && (
                    <button
                        aria-label="Next"
                        onClick={() => setIndex((i) => Math.min(i + 1, images.length - 1))}
                        className="absolute right-4 text-white bg-black/40 p-3 rounded-full"
                    >
                        <FaChevronRight />
                    </button>
                )}

                <div className="absolute bottom-6 text-white text-sm">
                    {index + 1} / {images.length}
                </div>
            </div>
        </div>
    );
}

// Main presentation component
const PublicProfileView = ({
    profileData,
    currentUserProfile = null,
    interestStatus = null,
    onInterestAction = null,
    showInterestControls = true,
    isPreview = false,
}) => {
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const [viewerOpen, setViewerOpen] = useState(false);

    // Fetch countries for mapping
    const { data: countries = [] } = useQuery({
        queryKey: ['countries'],
        queryFn: getCountries,
        staleTime: Infinity, // Countries rarely change
    });

    // Helper to get country name
    const getCountryName = (code) => {
        if (!code) return '—';
        const country = countries.find(c => c.code === code || c.value === code);
        return country ? country.name : code;
    };

    if (!profileData) return null;

    const {
        name = 'Unnamed',
        date_of_birth,
        profile_image,
        additional_images = [],
        is_verified,
        compatibility_score,
        about = '',
        looking_for = '',
        profile_for,
        gender,
        height_inches,
        skin_complexion,
        religion,
        alcohol,
        smoking,
        education = [],
        work_experience = [],
        preferences = [],
        facebook_profile,
        instagram_profile,
        linkedin_profile,
        current_city,
        origin_city,
        citizenship,
        current_country,
        origin_country,
        blood_group,
        visa_status,
        father_occupation,
        mother_occupation,
        siblings,
        family_type,
        marital_status,
        created_at,
        updated_at,
        faith_tags = [],
    } = profileData;

    const age =
        date_of_birth && !Number.isNaN(new Date(date_of_birth).getFullYear())
            ? new Date().getFullYear() - new Date(date_of_birth).getFullYear()
            : '—';

    // Normalize additional_images (they might be objects with image_url or url)
    const additionalUrls = Array.isArray(additional_images)
        ? additional_images.map((a) => (typeof a === 'string' ? a : a.image_url || a.url)).filter(Boolean)
        : [];
    const images = [profile_image, ...additionalUrls].filter(Boolean);

    const formattedUpdated = updated_at ? new Date(updated_at).toLocaleDateString() : '—';
    const formattedCreated = created_at ? new Date(created_at).toLocaleDateString() : '—';

    const noBlurStyle = {
        WebkitFilter: 'none',
        filter: 'none',
        WebkitBackdropFilter: 'none',
        backdropFilter: 'none',
    };

    return (
        <div
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-md overflow-hidden"
            style={{ transformStyle: 'preserve-3d', ...noBlurStyle }}
        >
            <div className="p-6">
                {/* header */}
                <div className="flex flex-col md:flex-row items-start justify-between gap-4 md:gap-0 mb-6">
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">{name}</h1>
                        <div className="flex items-center gap-2 text-gray-700 dark:text-gray-200 mt-1 font-medium text-base">
                            <span>{age}</span>
                            <span>•</span>
                            <div className="flex items-center gap-1">
                                <FaMapMarkerAlt className="text-gray-500 dark:text-gray-400" size={14} />
                                <span>{current_city || '—'}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {compatibility_score != null && !isPreview && (
                            <div className="text-sm font-semibold bg-gray-50 dark:bg-gray-700 border dark:border-gray-600 px-3 py-1 rounded-full dark:text-gray-200">
                                {Math.round(compatibility_score)}%
                            </div>
                        )}

                        {is_verified && (
                            <div className="flex items-center gap-2 bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full">
                                <FaCheckCircle /> Verified
                            </div>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* left: image + gallery */}
                    <div className="lg:col-span-1 space-y-4">
                        <div className="relative rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 border dark:border-gray-600">
                            {/* Image count badge */}
                            {images.length > 0 && (
                                <div className="absolute top-3 right-3 bg-white/90 dark:bg-gray-800/90 px-3 py-1 rounded-full text-xs font-semibold text-gray-800 dark:text-white z-10 shadow">
                                    {images.length} Photos
                                </div>
                            )}

                            <img
                                role="button"
                                onClick={() => setViewerOpen(true)}
                                key={activeImageIndex}
                                src={images[activeImageIndex] || '/placeholder-profile.png'}
                                alt={`Profile image ${activeImageIndex + 1}`}
                                className="w-full h-72 object-cover rounded-xl cursor-pointer"
                                loading="lazy"
                                style={noBlurStyle}
                            />
                        </div>

                        <div className="grid grid-cols-4 gap-2">
                            {images.length ? (
                                images.map((src, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setActiveImageIndex(idx)}
                                        aria-label={`Thumbnail ${idx + 1}`}
                                        className={`h-20 rounded-md overflow-hidden border ${idx === activeImageIndex ? 'ring-2 ring-indigo-400' : 'border-gray-200 dark:border-gray-600'} focus:outline-none`}
                                        style={noBlurStyle}
                                    >
                                        <img src={src} alt={`Thumb ${idx + 1}`} className="w-full h-full object-cover" loading="lazy" style={noBlurStyle} />
                                    </button>
                                ))
                            ) : (
                                <div className="col-span-4 text-center text-gray-500">No photos</div>
                            )}
                        </div>

                        <div className="flex flex-col gap-2">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Socials
                                        socials={[
                                            facebook_profile && { icon: 'FaFacebook', url: facebook_profile },
                                            instagram_profile && { icon: 'FaInstagram', url: instagram_profile },
                                            linkedin_profile && { icon: 'FaLinkedin', url: linkedin_profile },
                                        ].filter(Boolean)}
                                    />
                                </div>

                                {showInterestControls && onInterestAction && <div>{onInterestAction()}</div>}
                            </div>

                            {/* Faith Tags */}
                            {faith_tags && faith_tags.length > 0 && (
                                <div className="mt-4">
                                    <FaithTagsSection selectedTags={faith_tags} isEditing={false} />
                                </div>
                            )}

                            {/* Looking For Section */}
                            <div className="mt-4">
                                <SectionCard
                                    title="Looking For"
                                    icon={<FaHeart className="text-red-500" size={14} />}
                                    className="!bg-rose-50/30 !border-rose-100"
                                >
                                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed italic">
                                        {looking_for ? `"${looking_for}"` : "No special requirements specified yet."}
                                    </p>
                                </SectionCard>
                            </div>

                            {/* Contact Number Section */}
                            <div className="mt-4">
                                <SectionCard
                                    title="Contact Number"
                                    icon={<FaPhone className="text-emerald-500" size={14} />}
                                    className="!bg-emerald-50/30 !border-emerald-100"
                                    isLocked={!profileData.is_unlocked}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600">
                                            <FaPhone size={14} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-gray-900 dark:text-white">
                                                {profileData.is_unlocked ? (profileData.phone || 'Not provided') : 'XXXXXXXXXX'}
                                            </p>
                                            {!profileData.is_unlocked && (
                                                <p className="text-[10px] text-gray-400 font-medium">Connect to view contact</p>
                                            )}
                                        </div>
                                    </div>
                                </SectionCard>
                            </div>
                        </div>
                    </div>

                    {/* right: details */}
                    <div className="lg:col-span-2 space-y-4">
                        <SectionCard title="About" icon={<div className="text-indigo-600">•</div>}>
                            <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed">{about || 'No description provided.'}</p>
                        </SectionCard>

                        {/* Basic Information */}
                        <SectionCard title="Basic Information" icon={<FaHeart size={20} className="text-indigo-600" />}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {profile_for && <InfoRow label="Profile created by" value={profile_for === 'self' || profile_for === 'Self' ? 'Self' : `Parent/Relative (${profile_for})`} />}
                                {gender && <InfoRow label="Gender" value={formatString(gender)} />}
                                {height_inches && <InfoRow label="Height" value={`${Math.floor(height_inches / 12)}'${height_inches % 12}"`} />}
                                {skin_complexion && <InfoRow label="Skin Complexion" value={formatString(skin_complexion)} />}
                                {marital_status && <InfoRow label="Relationship" value={formatString(marital_status)} />}
                                {religion && <InfoRow label="Religion" value={formatString(religion)} />}
                                {blood_group && <InfoRow label="Blood group" value={blood_group} />}
                            </div>
                        </SectionCard>

                        {/* Location & Residency */}
                        <SectionCard title="Location & Residency" icon={<FaMapMarkerAlt className="text-gray-700" />}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {citizenship && <InfoRow label="Citizenship" value={formatString(citizenship)} />}
                                {(current_city || current_country) && (
                                    <InfoRow
                                        label="Current Location"
                                        value={[current_city, getCountryName(current_country)].filter(Boolean).join(', ')}
                                    />
                                )}
                                {(origin_city || origin_country) && (
                                    <InfoRow
                                        label="Origin"
                                        value={[origin_city, getCountryName(origin_country)].filter(Boolean).join(', ')}
                                    />
                                )}
                                {visa_status && <InfoRow label="Visa status" value={formatString(visa_status)} />}
                            </div>
                        </SectionCard>

                        {/* Family */}
                        <SectionCard title="Family" icon={<div className="text-indigo-600">•</div>}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <InfoRow label="Father's occupation" value={father_occupation || '—'} />
                                <InfoRow label="Mother's occupation" value={mother_occupation || '—'} />
                                <InfoRow label="Siblings" value={siblings || '—'} />
                                <InfoRow label="Family type" value={family_type || '—'} />
                            </div>

                            {/* Siblings Details */}
                            {profileData.siblings_details && (
                                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Siblings Details</h4>
                                    <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed">{profileData.siblings_details}</p>
                                </div>
                            )}

                            {/* Paternal Family Details */}
                            {profileData.paternal_family_details && (
                                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Paternal Family (Father's Side)</h4>
                                    <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed">{profileData.paternal_family_details}</p>
                                </div>
                            )}

                            {/* Maternal Family Details */}
                            {profileData.maternal_family_details && (
                                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Maternal Family (Mother's Side)</h4>
                                    <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed">{profileData.maternal_family_details}</p>
                                </div>
                            )}
                        </SectionCard>



                        <SectionCard title="Education" icon={<FaGraduationCap className="text-gray-700" />}>
                            {education.length ? (
                                <div className="space-y-3">
                                    {education.map((e, i) => (
                                        <div key={i} className="p-3 border dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-700/50">
                                            <div className="text-sm font-semibold text-gray-900 dark:text-white">{e.institution || e.degree || 'Education'}</div>
                                            <div className="text-xs text-gray-700 dark:text-gray-300">{e.field_of_study || ''}</div>
                                            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">{e.year_from ? `${e.year_from} - ${e.year_to || 'Present'}` : ''}</div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-sm text-gray-700 dark:text-gray-400">No education listed.</div>
                            )}
                        </SectionCard>

                        <SectionCard title="Work" icon={<FaBriefcase className="text-gray-700" />}>
                            {work_experience.length ? (
                                <div className="space-y-3">
                                    {work_experience.map((w, i) => (
                                        <div key={i} className="p-3 border dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-700/50">
                                            <div className="text-sm font-semibold text-gray-900 dark:text-white">{w.title || w.company || 'Work'}</div>
                                            <div className="text-xs text-gray-700 dark:text-gray-300">{w.company ? `${w.company} — ${w.location || ''}` : w.location}</div>
                                            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">{w.start_date ? `${w.start_date} - ${w.end_date || 'Present'}` : ''}</div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-sm text-gray-700 dark:text-gray-400">No work experience listed.</div>
                            )}
                        </SectionCard>

                        {!isPreview && (
                            <div className="text-xs text-gray-600 dark:text-gray-400 text-right space-y-1">
                                <div>
                                    Member since: <strong>{formattedCreated}</strong>
                                </div>
                                <div>
                                    Last updated: <strong>{formattedUpdated}</strong>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Image viewer modal */}
                <AnimatePresence>
                    {viewerOpen && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <ImageViewer images={images} startIndex={activeImageIndex} onClose={() => setViewerOpen(false)} />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default PublicProfileView;
