import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import AnimatedBackground from '../components/AnimatedBackground';
import Socials from '../components/Socials';
import LoadingSpinner from '../components/LoadingSpinner';
import SectionCard from '../components/SectionCard';
import InfoRow from '../components/InfoRow';
import FaithTagsSection from '../components/FaithTagsSection';
import {
  getProfileById,
  getProfile,
  sendInterest,
  acceptInterest,
  rejectInterest,
  cancelInterest,
} from '../services/api';
import { useAuth } from '../context/AuthContext';
import { FaCheckCircle, FaMapMarkerAlt, FaGraduationCap, FaBriefcase, FaHeart, FaTimes, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

// InfoRow and SectionCard components now imported from separate files

const Skeleton = ({ className = '' }) => (
  <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
);

// --- Image viewer modal ---
function ImageViewer({ images, startIndex, onClose }) {
  const [index, setIndex] = useState(startIndex || 0);
  const viewerRef = useRef(null);

  useEffect(() => {
    const handleKey = e => {
      if (e.key === 'Escape') return onClose();
      if (e.key === 'ArrowRight') setIndex(i => Math.min(i + 1, images.length - 1));
      if (e.key === 'ArrowLeft') setIndex(i => Math.max(i - 1, 0));
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [images.length, onClose]);

  useEffect(() => {
    // trap focus if needed (basic)
    viewerRef.current?.focus();
  }, []);

  if (!images || !images.length) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
    >
      <div className="relative max-w-5xl w-full h-full flex items-center justify-center" onClick={e => e.stopPropagation()} ref={viewerRef} tabIndex={-1}>
        <button aria-label="Close" onClick={onClose} className="absolute top-4 right-4 text-white bg-black/40 p-2 rounded-full">
          <FaTimes />
        </button>

        {images.length > 1 && (
          <button aria-label="Previous" onClick={() => setIndex(i => Math.max(i - 1, 0))} className="absolute left-4 text-white bg-black/40 p-3 rounded-full">
            <FaChevronLeft />
          </button>
        )}

        <div className="max-h-full max-w-full flex items-center justify-center">
          <img src={images[index]} alt={`Large ${index + 1}`} className="max-h-[90vh] max-w-full object-contain rounded-md shadow-lg" />
        </div>

        {images.length > 1 && (
          <button aria-label="Next" onClick={() => setIndex(i => Math.min(i + 1, images.length - 1))} className="absolute right-4 text-white bg-black/40 p-3 rounded-full">
            <FaChevronRight />
          </button>
        )}

        <div className="absolute bottom-6 text-white text-sm">{index + 1} / {images.length}</div>
      </div>
    </div>
  );
}

// --- Main component ---
export default function PublicProfilePage() {
  const { id } = useParams();
  const { user } = useAuth();

  // Explicit no-blur style override: applied inline to elements that previously could be blurred
  const noBlurStyle = {
    WebkitFilter: 'none',
    filter: 'none',
    WebkitBackdropFilter: 'none',
    backdropFilter: 'none',
  };

  // data states
  const [profileData, setProfileData] = useState(null);
  const [currentUserProfile, setCurrentUserProfile] = useState(null);
  const [interestStatus, setInterestStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // UI states
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [viewerOpen, setViewerOpen] = useState(false);

  useEffect(() => {
    let mounted = true;
    const fetch = async () => {
      try {
        const prof = await getProfileById(id);
        if (!mounted) return;
        setProfileData(prof);
        if (prof?.interest) setInterestStatus(prof.interest);

        if (user) {
          const u = await getProfile();
          if (!mounted) return;
          setCurrentUserProfile(u);
        }
      } catch (err) {
        console.error(err);
        if (!mounted) return;
        setError('Unable to load profile.');
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    };
    fetch();
    return () => { mounted = false; };
  }, [id, user]);

  // interest handlers (same as before)
  const safeAlert = msg => alert(msg);
  const handleSendInterest = async () => { if (!profileData || !currentUserProfile) return; try { const res = await sendInterest(profileData.id); setInterestStatus(res); safeAlert('Interest sent'); } catch (err) { console.error(err); safeAlert('Failed to send interest'); } };
  const handleAccept = async () => { try { await acceptInterest(interestStatus.id); setInterestStatus(prev => ({ ...prev, status: 'accepted' })); safeAlert('Interest accepted'); } catch (err) { console.error(err); safeAlert('Failed to accept'); } };
  const handleReject = async () => { try { await rejectInterest(interestStatus.id); setInterestStatus(prev => ({ ...prev, status: 'rejected' })); safeAlert('Interest rejected'); } catch (err) { console.error(err); safeAlert('Failed to reject'); } };
  const handleCancelInterest = async () => { try { await cancelInterest(interestStatus.id); setInterestStatus(null); safeAlert('Interest cancelled'); } catch (err) { console.error(err); safeAlert('Failed to cancel'); } };

  const renderInterestControls = () => {
    if (!user || !currentUserProfile || !profileData) return null;
    if (currentUserProfile.id === profileData.id) return null;
    if (!interestStatus) return <button onClick={handleSendInterest} className="px-4 py-2 rounded-md bg-indigo-600 text-white font-medium focus:outline-none focus:ring-2 focus:ring-indigo-300">Get Connected </button>;
    const isSender = interestStatus.sender?.id === currentUserProfile.id;
    const isReceiver = interestStatus.receiver?.id === currentUserProfile.id;
    if (isSender) {
      if (interestStatus.status === 'sent') return <button onClick={handleCancelInterest} className="px-4 py-2 rounded-md bg-gray-200">Cancel</button>;
      if (interestStatus.status === 'accepted') return <button className="px-4 py-2 rounded-md bg-green-600 text-white">Accepted</button>;
      if (interestStatus.status === 'rejected') return <button onClick={handleSendInterest} className="px-4 py-2 rounded-md bg-indigo-600 text-white">Send Again</button>;
    }
    if (isReceiver) {
      if (interestStatus.status === 'sent') return (<div className="flex gap-2"><button onClick={handleAccept} className="px-3 py-2 rounded-md bg-green-600 text-white">Accept</button><button onClick={handleReject} className="px-3 py-2 rounded-md bg-gray-200">Reject</button></div>);
      if (interestStatus.status === 'accepted') return <button className="px-4 py-2 rounded-md bg-green-600 text-white">Accepted</button>;
      if (interestStatus.status === 'rejected') return <button onClick={handleSendInterest} className="px-4 py-2 rounded-md bg-indigo-600 text-white">Send Interest</button>;
    }
    return null;
  };

  if (loading) {
    return <LoadingSpinner size="fullscreen" message="Loading profile..." />;
  }

  if (error) return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;
  if (!profileData) return <div className="min-h-screen flex items-center justify-center">Profile not found</div>;

  // --- destructure with safe defaults ---
  const {
    name = 'Unnamed',
    date_of_birth,
    profile_image,
    additional_images = [],
    is_verified,
    compatibility_score,
    about = '',
    height_cm,
    religion,
    alcohol,
    smoking,
    education = [],
    work_experience = [],
    preferences = [],
    facebook_profile,
    instagram_profile,
    linkedin_profile,
    profile_image_privacy,
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

  const age = date_of_birth ? new Date().getFullYear() - new Date(date_of_birth).getFullYear() : '—';
  const images = [profile_image, ...additional_images.map(a => a.image_url)].filter(Boolean);

  const formattedUpdated = updated_at ? new Date(updated_at).toLocaleDateString() : '—';
  const formattedCreated = created_at ? new Date(created_at).toLocaleDateString() : '—';

  return (
    <>
      <AnimatedBackground />

      <main className="min-h-screen p-0 bg-gray-50">
        <div className="w-full flex justify-center">
          <div className="w-full max-w-screen-xl px-6">
            <div className="bg-white rounded-2xl shadow-md overflow-hidden" style={{ transformStyle: 'preserve-3d', ...noBlurStyle }}>
              <div className="p-6">
                {/* header */}
                <div className="flex flex-col md:flex-row items-start justify-between gap-4 md:gap-0 mb-6">
                  <div>
                    <h1 className="text-2xl font-semibold text-gray-900">{name}</h1>
                    <div className="text-sm text-gray-700 mt-1">{age} • {current_city || '—'}</div>
                  </div>

                  <div className="flex items-center gap-3">
                    {compatibility_score != null && (
                      <div className="text-sm font-semibold bg-gray-50 border px-3 py-1 rounded-full">{Math.round(compatibility_score)}%</div>
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
                    <div className="relative rounded-lg overflow-hidden bg-gray-100 border">
                      {/* Image count badge */}
                      {images.length > 0 && (
                        <div className="absolute top-3 right-3 bg-white/90 px-3 py-1 rounded-full text-xs font-semibold text-gray-800 z-10 shadow">{images.length} Photos</div>
                      )}

                      <img
                        role="button"
                        onClick={() => setViewerOpen(true)}
                        key={activeImageIndex}
                        src={images[activeImageIndex] || '/placeholder-profile.png'}
                        alt={`Profile image ${activeImageIndex + 1}`}
                        className="w-full h-72 object-cover rounded-xl"
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
                            className={`h-20 rounded-md overflow-hidden border ${idx === activeImageIndex ? 'ring-2 ring-indigo-400' : 'border-gray-200'} focus:outline-none`}
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
                        <div className="flex items-center gap-2 text-gray-700">
                          <FaMapMarkerAlt />
                          <span className="text-sm">{current_city || '—'}</span>
                        </div>

                        <div className="text-sm text-gray-700">Age: <strong className="ml-1">{age}</strong></div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Socials socials={[
                            facebook_profile && { icon: 'FaFacebook', url: facebook_profile },
                            instagram_profile && { icon: 'FaInstagram', url: instagram_profile },
                            linkedin_profile && { icon: 'FaLinkedin', url: linkedin_profile },
                          ].filter(Boolean)} />
                        </div>

                        <div>{renderInterestControls()}</div>
                      </div>

                      {/* Faith Tags - Display under photo section */}
                      {faith_tags && faith_tags.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <h3 className="text-xs font-semibold text-gray-700 mb-2">My Faith</h3>
                          <FaithTagsSection selectedTags={faith_tags} isEditing={false} />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* right: details */}
                  <div className="lg:col-span-2 space-y-4">
                    <SectionCard title="About" icon={<div className="text-indigo-600">•</div>}>
                      <p className="text-sm text-gray-800 leading-relaxed">{about || 'No description provided.'}</p>

                      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                        <InfoRow label="Full name" value={name} />
                        <InfoRow label="Relationship" value={marital_status || '—'} />
                        <InfoRow label="Religion" value={religion || '—'} />
                        <InfoRow label="Height" value={height_cm ? `${height_cm} cm` : '—'} />

                      </div>
                    </SectionCard>

                    {/* NEW: Basics */}
                    <SectionCard title="Basics" icon={<div className="text-indigo-600">•</div>}>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <InfoRow label="Blood group" value={blood_group || '—'} />
                      </div>
                    </SectionCard>

                    {/* NEW: Location & Residency */}
                    <SectionCard title="Location & Residency" icon={<FaMapMarkerAlt className="text-gray-700" />}>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <InfoRow label="Current city" value={current_city || '—'} />
                        <InfoRow label="Current country" value={current_country || '—'} />
                        <InfoRow label="Origin city" value={origin_city || '—'} />
                        <InfoRow label="Origin country" value={origin_country || '—'} />
                        <InfoRow label="Visa status" value={visa_status || '—'} />
                      </div>
                    </SectionCard>

                    {/* NEW: Family */}
                    <SectionCard title="Family" icon={<div className="text-indigo-600">•</div>}>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <InfoRow label="Father's occupation" value={father_occupation || '—'} />
                        <InfoRow label="Mother's occupation" value={mother_occupation || '—'} />
                        <InfoRow label="Siblings" value={siblings || '—'} />
                        <InfoRow label="Family type" value={family_type || '—'} />
                      </div>
                    </SectionCard>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <SectionCard title="Lifestyle" icon={<div className="text-indigo-600">•</div>}>
                        <InfoRow label="Alcohol" value={alcohol || '—'} />
                        <InfoRow label="Smoking" value={smoking || '—'} />
                      </SectionCard>

                      <SectionCard title="Preferences" icon={<FaHeart className="text-red-500" />}>
                        {preferences && preferences[0] ? (
                          <div className="flex flex-wrap gap-2">
                            {Object.entries(preferences[0]).slice(0, 12).map(([k, v]) => (
                              <span key={k} className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-800">{k.replace(/_/g, ' ')}: {String(v)}</span>
                            ))}
                          </div>
                        ) : (
                          <div className="text-sm text-gray-700">Not provided</div>
                        )}
                      </SectionCard>
                    </div>

                    <SectionCard title="Education" icon={<FaGraduationCap className="text-gray-700" />}>
                      {education.length ? (
                        <div className="space-y-3">
                          {education.map((e, i) => (
                            <div key={i} className="p-3 border rounded-md bg-gray-50">
                              <div className="text-sm font-semibold text-gray-900">{e.institution || e.degree || 'Education'}</div>
                              <div className="text-xs text-gray-700">{e.field_of_study || ''}</div>
                              <div className="text-xs text-gray-600 mt-1">{e.year_from ? `${e.year_from} - ${e.year_to || 'Present'}` : ''}</div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-sm text-gray-700">No education listed.</div>
                      )}
                    </SectionCard>

                    <SectionCard title="Work" icon={<FaBriefcase className="text-gray-700" />}>
                      {work_experience.length ? (
                        <div className="space-y-3">
                          {work_experience.map((w, i) => (
                            <div key={i} className="p-3 border rounded-md bg-gray-50">
                              <div className="text-sm font-semibold text-gray-900">{w.title || w.company || 'Work'}</div>
                              <div className="text-xs text-gray-700">{w.company ? `${w.company} — ${w.location || ''}` : w.location}</div>
                              <div className="text-xs text-gray-600 mt-1">{w.start_date ? `${w.start_date} - ${w.end_date || 'Present'}` : ''}</div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-sm text-gray-700">No work experience listed.</div>
                      )}
                    </SectionCard>

                    <div className="text-xs text-gray-600 text-right space-y-1">
                      <div>Member since: <strong>{formattedCreated}</strong></div>
                      <div>Last updated: <strong>{formattedUpdated}</strong></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
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
      </main>
    </>
  );
}
