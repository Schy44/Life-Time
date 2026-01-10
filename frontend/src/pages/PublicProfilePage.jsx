import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import api from '../lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import AnimatedBackground from '../components/AnimatedBackground';
import Socials from '../components/Socials';
import LoadingSpinner from '../components/LoadingSpinner';
import SectionCard from '../components/SectionCard';
import InfoRow from '../components/InfoRow';
import FaithTagsSection from '../components/FaithTagsSection';
import { Lock } from 'lucide-react';
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
import { useQuery } from '@tanstack/react-query';
import { jsPDF } from 'jspdf';

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

  // interest state (separate so we can update without refetch)
  const [interestStatus, setInterestStatus] = useState(null);
  // --- React Query: cache profile data per ID ---
  const {
    data: profileData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['publicProfile', id],
    queryFn: () => getProfileById(id),
  });

  const {
    data: currentUserProfile,
  } = useQuery({
    queryKey: ['currentUserProfile'],
    queryFn: () => getProfile(),
    enabled: !!user,
  });

  // UI states
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [viewerOpen, setViewerOpen] = useState(false);

  // Initialize interest status from loaded profile
  useEffect(() => {
    if (profileData?.interest) {
      setInterestStatus(profileData.interest);
    } else {
      setInterestStatus(null);
    }
  }, [profileData]);

  // interest handlers (same as before)
  const safeAlert = msg => alert(msg);
  const handleSendInterest = async () => { if (!profileData || !currentUserProfile) return; try { const res = await sendInterest(profileData.id); setInterestStatus(res); safeAlert('Interest sent'); } catch (err) { console.error(err); safeAlert('Failed to send interest'); } };
  const handleAccept = async () => { try { await acceptInterest(interestStatus.id); setInterestStatus(prev => ({ ...prev, status: 'accepted' })); safeAlert('Interest accepted'); } catch (err) { console.error(err); safeAlert('Failed to accept'); } };
  const handleReject = async () => { try { await rejectInterest(interestStatus.id); setInterestStatus(prev => ({ ...prev, status: 'rejected' })); safeAlert('Interest rejected'); } catch (err) { console.error(err); safeAlert('Failed to reject'); } };
  const handleCancelInterest = async () => { try { await cancelInterest(interestStatus.id); setInterestStatus(null); safeAlert('Interest cancelled'); } catch (err) { console.error(err); safeAlert('Failed to cancel'); } };
  const handleUnlockProfile = async () => {
    if (!profileData) return;
    try {
      const res = await api.post('/profiles/unlock/', { profile_id: profileData.id });
      if (res.data.unlocked) {
        safeAlert('Profile unlocked successfully!');
        window.location.reload(); // Refresh to get full data
      }
    } catch (err) {
      console.error(err);
      safeAlert(err.response?.data?.error || 'Failed to unlock profile');
    }
  };

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

  if (isLoading) {
    return <LoadingSpinner size="fullscreen" message="Loading profile..." />;
  }

  if (isError) return <div className="min-h-screen flex items-center justify-center text-red-500">{error?.message || 'Unable to load profile.'}</div>;
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
    looking_for = '',
    profile_for,
    gender,
    height_cm,
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
    is_unlocked = false,
  } = profileData;

  const age = date_of_birth ? new Date().getFullYear() - new Date(date_of_birth).getFullYear() : '—';
  const images = [profile_image, ...additional_images.map(a => a.image_url)].filter(Boolean);

  const formattedUpdated = updated_at ? new Date(updated_at).toLocaleDateString() : '—';
  const formattedCreated = created_at ? new Date(created_at).toLocaleDateString() : '—';

  const handleDownloadBiodata = () => {
    if (!profileData) return;

    const doc = new jsPDF({
      unit: 'pt',
      format: 'a4',
      orientation: 'portrait',
    });

    const safeName = (name || 'profile').replace(/[^\w\-]+/g, '_');

    // --- NEW MODERN DESIGN ---

    // 1. THEME & COLORS
    const colors = {
      primary: '#2C3E50', // Dark Slate Blue
      secondary: '#3498DB', // Bright Blue for accents
      text: '#34495E', // Dark Grey for body
      subtle: '#BDC3C7', // Light Grey for lines/borders
      background: '#F8F9F9',
    };

    // 2. DIMENSIONS & LAYOUT
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 40;
    const footerHeight = 40;
    const contentWidth = pageWidth - margin * 2;

    let y = margin;

    // 3. HELPERS
    const checkPageBreak = (requiredHeight) => {
      if (y + requiredHeight > pageHeight - footerHeight) {
        doc.addPage();
        y = margin;
        return true;
      }
      return false;
    };

    const drawSection = (title, contentCallback) => {
      checkPageBreak(40); // Min space for a section header

      // Draw title
      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(colors.primary);
      doc.text(title, margin, y);

      // Draw underline accent
      doc.setDrawColor(colors.secondary);
      doc.setLineWidth(2);
      doc.line(margin, y + 4, margin + 40, y + 4);

      y += 25; // Space after header

      contentCallback();

      y += 20; // Space after section
    };

    const addText = (text, x, startY, options = {}) => {
      const {
        fontSize = 11,
        isBold = false,
        color = colors.text,
        maxWidth = contentWidth,
        lineHeight = 1.3,
      } = options;

      doc.setFontSize(fontSize);
      doc.setFont(undefined, isBold ? 'bold' : 'normal');
      doc.setTextColor(color);

      const lines = doc.splitTextToSize(String(text), maxWidth);
      lines.forEach((line, idx) => {
        checkPageBreak(fontSize);
        doc.text(line, x, y);
        y += fontSize * lineHeight;
      });
      return lines.length * fontSize * lineHeight;
    };

    // --- PDF CONTENT ---

    // HEADER
    doc.setFontSize(30);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(colors.primary);
    doc.text(name, margin, y);
    y += 20;

    doc.setFontSize(12);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(colors.text);
    doc.text(`Biodata Generated by Life-Time on ${new Date().toLocaleDateString()}`, margin, y);
    y += 40;

    // --- TWO-COLUMN LAYOUT FOR KEY INFO ---
    const colWidth = (contentWidth - 20) / 2;
    const col2_X = margin + colWidth + 20;
    const initialY = y;

    let yLeft = initialY;
    let yRight = initialY;

    const drawInfoRow = (label, value, column) => {
      let currentY = column === 'left' ? yLeft : yRight;
      const currentX = column === 'left' ? margin : col2_X;
      doc.setFontSize(10);
      doc.setTextColor(colors.text);
      doc.setFont(undefined, 'normal');
      doc.text(`${label}:`, currentX, currentY);

      doc.setFont(undefined, 'bold');
      doc.text(String(value), currentX + 60, currentY);

      if (column === 'left') yLeft += 20;
      else yRight += 20;
    };

    // BASIC INFO
    y = initialY;
    checkPageBreak(30);
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(colors.primary);
    doc.text("Key Information", margin, y);
    y += 20;
    yLeft = y;
    drawInfoRow("Age", age || '—', 'left');
    if (marital_status) drawInfoRow("Status", marital_status, 'left');
    if (height_cm) drawInfoRow("Height", `${height_cm} cm`, 'left');
    if (religion) drawInfoRow("Religion", religion, 'left');

    // LOCATION INFO
    y = initialY;
    checkPageBreak(30);
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(colors.primary);
    doc.text("Location & Citizenship", col2_X, y);
    y += 20;
    yRight = y;

    if (current_city && current_country) drawInfoRow("Current", `${current_city}, ${current_country}`, 'right');
    else if (current_city) drawInfoRow("Current", current_city, 'right');

    if (origin_city && origin_country) drawInfoRow("Origin", `${origin_city}, ${origin_country}`, 'right');
    else if (origin_city) drawInfoRow("Origin", origin_city, 'right');

    if (citizenship) drawInfoRow("Citizenship", citizenship, 'right');
    if (visa_status) drawInfoRow("Visa Status", visa_status, 'right');

    y = Math.max(yLeft, yRight) + 20;

    // --- FULL-WIDTH SECTIONS ---

    if (about) {
      drawSection("About Me", () => {
        addText(about, margin, y, { maxWidth: contentWidth });
      });
    }

    if (looking_for) {
      drawSection("My Ideal Partner", () => {
        addText(looking_for, margin, y, { maxWidth: contentWidth });
      });
    }

    // Education
    if (education.length) {
      drawSection("Education", () => {
        education.forEach(edu => {
          const title = edu.degree || edu.institution || "N/A";
          const subtitle = `${edu.field_of_study || ''}${edu.year_from ? ` (${edu.year_from} - ${edu.year_to || 'Present'})` : ''}`;

          addText(title, margin, y, { isBold: true, color: colors.primary });
          addText(subtitle, margin, y, { fontSize: 10 });
          y += 10; // Add consistent space after each entry
        });
      });
    }

    // Work Experience
    if (work_experience.length) {
      drawSection("Work Experience", () => {
        work_experience.forEach(work => {
          const title = work.title || work.company || "N/A";
          const subtitle = `${work.company ? `${work.company} | ` : ''}${work.start_date ? `${work.start_date} - ${work.end_date || 'Present'}` : ''}`;

          addText(title, margin, y, { isBold: true, color: colors.primary });
          addText(subtitle, margin, y, { fontSize: 10 });
          y += 10; // Add consistent space after each entry
        });
      });
    }

    // Family
    const familyDetails = [
      { label: "Father's Occupation", value: father_occupation },
      { label: "Mother's Occupation", value: mother_occupation },
      { label: "Siblings", value: siblings },
      { label: "Family Type", value: family_type },
    ].filter(detail => detail.value);

    if (familyDetails.length > 0) {
      drawSection("Family Details", () => {
        const col1X = margin;
        const col2X = margin + contentWidth / 2;
        const itemWidth = contentWidth / 2 - 10;
        let yCol1 = y;
        let yCol2 = y;

        familyDetails.forEach((detail, index) => {
          // Alternate between columns
          if (index % 2 === 0) { // Left column
            y = yCol1; // Use left column's Y
            addText(`${detail.label}:`, col1X, y, { fontSize: 10, maxWidth: itemWidth });
            addText(detail.value, col1X, y, { isBold: true, maxWidth: itemWidth });
            yCol1 = y; // Update this column's Y
          } else { // Right column
            y = yCol2; // Use right column's Y
            addText(`${detail.label}:`, col2X, y, { fontSize: 9, maxWidth: itemWidth });
            addText(detail.value, col2X, y, { isBold: true, maxWidth: itemWidth });
            yCol2 = y; // Update this column's Y
          }
        });

        // Set the main Y to the bottom of the taller column
        y = Math.max(yCol1, yCol2);
      });
    }

    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(9);
      doc.setTextColor(colors.subtle);
      doc.text(`Page ${i} of ${pageCount}`, pageWidth - margin - 35, pageHeight - 20);
      doc.text(`Life-Time Profile | ${name}`, margin, pageHeight - 20);
    }

    doc.save(`${safeName}_biodata.pdf`);
  };

  return (
    <>
      <AnimatedBackground />

      <main className="min-h-screen p-0 bg-gray-50 dark:bg-gray-900">
        <div className="w-full flex justify-center">
          <div className="w-full max-w-screen-xl px-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md overflow-hidden" style={{ transformStyle: 'preserve-3d', ...noBlurStyle }}>
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
                    {compatibility_score != null && (
                      <div className="text-sm font-semibold bg-gray-50 dark:bg-gray-700 border dark:border-gray-600 px-3 py-1 rounded-full dark:text-gray-200">{Math.round(compatibility_score)}%</div>
                    )}

                    {is_verified && (
                      <div className="flex items-center gap-2 bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full">
                        <FaCheckCircle /> Verified
                      </div>
                    )}

                    <button
                      onClick={handleDownloadBiodata}
                      disabled={!is_unlocked}
                      className={`ml-2 px-3 py-1 rounded-full text-xs font-semibold border ${!is_unlocked
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-600 border-gray-200 dark:border-gray-600'
                        }`}
                    >
                      Download Biodata
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* left: image + gallery */}
                  <div className="lg:col-span-1 space-y-4">
                    <div className="relative rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 border dark:border-gray-600">
                      {/* Image count badge */}
                      {images.length > 0 && (
                        <div className="absolute top-3 right-3 bg-white/90 dark:bg-gray-800/90 px-3 py-1 rounded-full text-xs font-semibold text-gray-800 dark:text-white z-10 shadow">{images.length} Photos</div>
                      )}

                      <img
                        role="button"
                        onClick={() => is_unlocked && setViewerOpen(true)}
                        key={activeImageIndex}
                        src={images[activeImageIndex] || '/placeholder-profile.png'}
                        alt={`Profile image ${activeImageIndex + 1}`}
                        className={`w-full h-72 object-cover rounded-xl transition-all duration-500 ${!is_unlocked ? 'profile-image-blurred scale-105' : ''}`}
                        loading="lazy"
                        style={is_unlocked ? noBlurStyle : {}}
                      />

                      {!is_unlocked && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center bg-black/10 backdrop-blur-[2px]">
                          <div className="bg-white/90 dark:bg-gray-800/90 p-4 rounded-2xl shadow-xl max-w-[200px]">
                            <FaHeart className="mx-auto text-red-500 mb-2" size={24} />
                            <p className="text-[10px] font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wider mb-2">Private Profile</p>
                            <p className="text-[9px] text-gray-500 dark:text-gray-400 leading-tight">Connect and unlock to see full photos</p>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-4 gap-2">
                      {images.length ? (
                        images.map((src, idx) => (
                          <button
                            key={idx}
                            onClick={() => is_unlocked && setActiveImageIndex(idx)}
                            aria-label={`Thumbnail ${idx + 1}`}
                            className={`h-20 rounded-md overflow-hidden border relative group/thumb ${idx === activeImageIndex ? 'ring-2 ring-indigo-400' : 'border-gray-200 dark:border-gray-600'} focus:outline-none ${!is_unlocked ? 'cursor-not-allowed' : ''}`}
                          >
                            <img
                              src={src}
                              alt={`Thumb ${idx + 1}`}
                              className={`w-full h-full object-cover transition-all duration-300 ${!is_unlocked ? 'profile-image-blurred scale-125' : ''}`}
                              loading="lazy"
                              style={is_unlocked ? noBlurStyle : {}}
                            />
                            {!is_unlocked && (
                              <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover/thumb:bg-black/10 transition-colors">
                                <Lock size={12} className="text-white/80" />
                              </div>
                            )}
                          </button>
                        ))
                      ) : (
                        <div className="col-span-4 text-center text-gray-500">No photos</div>
                      )}
                    </div>

                    <div className="flex flex-col gap-2">


                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Socials socials={[
                            facebook_profile && { icon: 'FaFacebook', url: facebook_profile },
                            instagram_profile && { icon: 'FaInstagram', url: instagram_profile },
                            linkedin_profile && { icon: 'FaLinkedin', url: linkedin_profile },
                          ].filter(Boolean)} />
                        </div>

                        <div>
                          {!is_unlocked && interestStatus?.status === 'accepted' ? (
                            <button
                              onClick={handleUnlockProfile}
                              className="px-6 py-2.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-xs shadow-lg hover:shadow-orange-200 transition-all flex items-center gap-2"
                            >
                              Unlock Full Access (10 Credits)
                            </button>
                          ) : renderInterestControls()}
                        </div>
                      </div>

                      {/* Faith Tags - Display under photo section */}
                      {faith_tags && faith_tags.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                          <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">My Faith</h3>
                          <FaithTagsSection selectedTags={faith_tags} isEditing={false} />
                        </div>
                      )}

                      {/* Partner Expectations - Display under Faith Tags */}
                      {looking_for && (
                        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                          <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Partner Expectations</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                            {looking_for}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* right: details */}
                  <div className="lg:col-span-2 space-y-4">
                    <SectionCard title="About" icon={<div className="text-indigo-600">•</div>}>
                      <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed">{about || 'No description provided.'}</p>
                      <InfoRow label="Full name" value={name} />
                      {profile_for && <InfoRow label="Profile for" value={profile_for.replace('_', ' ')} />}
                      <InfoRow label="Gender" value={gender || '—'} />
                      <InfoRow label="Relationship" value={marital_status || '—'} />
                      <InfoRow label="Religion" value={religion || '—'} />
                      <InfoRow label="Height" value={height_cm ? `${height_cm} cm` : '—'} />
                      {skin_complexion && <InfoRow label="Skin complexion" value={skin_complexion} />}
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
                    <SectionCard title="Family" icon={<div className="text-indigo-600">•</div>} isLocked={!is_unlocked}>
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <SectionCard title="Lifestyle" icon={<div className="text-indigo-600">•</div>} isLocked={!is_unlocked}>
                        <InfoRow label="Alcohol" value={alcohol || '—'} />
                        <InfoRow label="Smoking" value={smoking || '—'} />
                      </SectionCard>

                      <SectionCard title="Preferences" icon={<FaHeart className="text-red-500" />} isLocked={!is_unlocked}>
                        {preferences && preferences[0] ? (
                          <div className="flex flex-wrap gap-2">
                            {Object.entries(preferences[0]).slice(0, 12).map(([k, v]) => (
                              <span key={k} className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm text-gray-800 dark:text-gray-200">{k.replace(/_/g, ' ')}: {String(v)}</span>
                            ))}
                          </div>
                        ) : (
                          <div className="text-sm text-gray-700 dark:text-gray-400">Not provided</div>
                        )}
                      </SectionCard>
                    </div>

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

                    <div className="text-xs text-gray-600 dark:text-gray-400 text-right space-y-1">
                      <div>Member since: <strong>{formattedCreated}</strong></div>
                      <div>Last updated: <strong>{formattedUpdated}</strong></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div >

        {/* Image viewer modal */}
        < AnimatePresence >
          {viewerOpen && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <ImageViewer images={images} startIndex={activeImageIndex} onClose={() => setViewerOpen(false)} />
            </motion.div>
          )
          }
        </AnimatePresence >
      </main >
    </>
  );
}
