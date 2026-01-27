import React, { useState, useEffect } from 'react';
import AnimatedBackground from '../components/AnimatedBackground';
import ProfileHeader from '../components/ProfileHeader';
import InfoTabs from '../components/InfoTabs';
import Socials from '../components/Socials';
import PhotoGallery from '../components/PhotoGallery';
import LoadingSpinner from '../components/LoadingSpinner';
import ProfileForm from '../components/ProfileForm';
import PreviewModal from '../components/PreviewModal';
import FaithTagsSection from '../components/FaithTagsSection';
import SubscriptionTransfer from '../components/SubscriptionTransfer';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaEdit, FaEye, FaTimes } from 'react-icons/fa';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getProfile, getCountries } from '../services/api'; // Import getCountries
import apiClient from '../lib/api';

const ProfilePage = () => {
  const [profileData, setProfileData] = useState(null);
  const [interests, setInterests] = useState([]);
  const [, setLoading] = useState(false); // only used for explicit manual refreshes
  const [error, setError] = useState(null);
  const [editSection, setEditSection] = useState(null); // null, 'about', 'education', 'career', 'all'
  const [showPreview, setShowPreview] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const addCacheBust = (url, token) => (url ? `${url}${url.includes('?') ? '&' : '?'}v=${encodeURIComponent(token)}` : url);

  const normalizeProfile = (profile) => {
    if (!profile) return profile;
    // The 'updated_at' field from the backend will change after a successful profile update
    const token = profile.updated_at || Date.now();
    return {
      ...profile,
      // Use the 'updated_at' timestamp as the cache bust token for the main profile image
      profile_image: addCacheBust(profile.profile_image, token),
      additional_images: (profile.additional_images || []).map(img => ({
        ...img,
        image_url: addCacheBust(img.image_url || img.url || img.path, token),
      })),
    };
  };

  const queryClient = useQueryClient();

  // React Query: cache current user profile under a shared key
  const {
    data: queryProfile,
    isLoading,
    isError,
    error: queryError,
  } = useQuery({
    queryKey: ['me'],
    queryFn: getProfile,
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // 5 minutes: treat data as fresh
    refetchOnWindowFocus: false, // we'll handle focus manually
  });

  // Fetch countries for mapping
  const { data: countries = [] } = useQuery({
    queryKey: ['countries'],
    queryFn: getCountries,
    staleTime: Infinity,
  });

  // Helper to get country name
  const getCountryName = (code) => {
    if (!code) return '—';
    const country = countries.find(c => c.code === code || c.value === code);
    return country ? country.name : code;
  };

  // Normalize and sync query data into local state for existing logic
  useEffect(() => {
    if (queryProfile) {
      const normalized = normalizeProfile(queryProfile);
      setProfileData(normalized);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryProfile]);

  const fetchAllData = async (isBackground = false) => {
    if (!user) {
      setError('You must be logged in to view this page.');
      return;
    }

    try {
      if (!isBackground) {
        setLoading(true);
      }

      // Refetch profile via React Query to keep cache in sync
      const fresh = await queryClient.fetchQuery({
        queryKey: ['me'],
        queryFn: getProfile,
      });

      const normalized = normalizeProfile(fresh);
      setProfileData(normalized);

      if (normalized) {
        const { data: interestsData } = await apiClient.get(`/interests/?profile_id=${normalized.id}`);
        setInterests(interestsData || []);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch data from the backend.');
    } finally {
      if (!isBackground) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    // Check for fresh data from navigation state first
    if (location.state && location.state.updatedProfile) {
      const normalized = normalizeProfile(location.state.updatedProfile);
      setProfileData(normalized);
      // Clean up the state to prevent re-using stale data on refresh
      navigate(location.pathname, { replace: true, state: {} });
    } else if (user && !profileData && !isLoading) {
      // Initial interests fetch in background without showing a full-screen loader.
      // Profile data itself comes from React Query cache.
      fetchAllData(true);
    }

    // Keep the window focus handler for background tab updates
    const handleFocus = () => {
      // Only fetch if user is logged in AND NOT currently editing
      // Fetching while editing would reset the form and lose unsaved changes!
      if (user && !editSection) {
        console.log('Window focused, refreshing data (background)...');
        fetchAllData(true); // Pass true for isBackground
      }
    };

    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('focus', handleFocus);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, location.state, editSection]); // Added editSection to dependencies

  const handleUpdateInterests = async () => {
    if (!profileData) return;
    try {
      const { data: interestsData } = await apiClient.get(`/interests/?profile_id=${profileData.id}`, {
        headers: {
          'Cache-Control': 'no-cache',
        },
        params: { t: Date.now() },
      });
      setInterests(interestsData || []);
    } catch (error) {
      console.error('Failed to refetch interests', error);
    }
  };

  if (isLoading && !profileData) {
    return <LoadingSpinner size="fullscreen" message="Loading your profile..." />;
  }

  if (error || isError) {
    const message = error || queryError?.message || 'Failed to fetch data from the backend.';
    return <div className="flex justify-center items-center h-screen text-red-500 text-xl">Error: {message}</div>;
  }

  if (!profileData) {
    return (
      <>
        <AnimatedBackground />
        <div className="min-h-screen p-0 bg-gray-50">
          <div className="w-full flex justify-center items-center min-h-screen">
            <div className="bg-white rounded-2xl shadow-md p-8 max-w-md mx-4">
              <h1 className="text-3xl font-bold text-gray-800 mb-4">Welcome!</h1>
              <p className="text-gray-600 mb-6">You haven't created a profile yet. Let's get started!</p>
              <button
                onClick={() => navigate('/profile/create')}
                className="w-full p-3 rounded-lg bg-gradient-to-r from-purple-600 to-pink-500 text-white font-bold text-lg hover:from-purple-700 hover:to-pink-600 transition duration-300"
              >
                Create Your Profile
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Destructure data for components (including all fields)
  const {
    id, name, date_of_birth, profile_image, facebook_profile, instagram_profile, linkedin_profile,
    education, work_experience, preference, is_verified, height_inches, skin_complexion, religion,
    current_city, origin_city, citizenship, marital_status, about, additional_images, profile_image_privacy,
    blood_group, current_country, origin_country, visa_status,
    father_occupation, mother_occupation, siblings, family_type,
    siblings_details, paternal_family_details, maternal_family_details,
    profile_for, gender, looking_for
  } = profileData;

  // Calculate age from date_of_birth
  const age = date_of_birth ? new Date().getFullYear() - new Date(date_of_birth).getFullYear() : null;

  // Reconstruct data for components that expect a specific format
  const headerData = {
    name: name,
    age: age,
    isVerified: is_verified,
    profileImage: profile_image, // This now includes the cache-bust parameter
    isOnline: true, // Placeholder, as this is not in the model
    profileImagePrivacy: profile_image_privacy, // Pass privacy setting
    hasAcceptedInterest: true, // Always true for own profile,
  };

  const aboutData = {
    about: about,
    looking_for: looking_for,
    basicInfo: {
      profile_for: profile_for,
      gender: gender,
      height: height_inches ? `${Math.floor(height_inches / 12)}'${height_inches % 12}"` : 'N/A',
      skin_complexion: skin_complexion,
      marital_status: marital_status,
      religion: religion,
      citizenship: citizenship,
    },
    basics: {
      blood_group: blood_group,
    },
    locationResidency: {
      current_city: current_city,
      current_country: getCountryName(current_country),
      origin_city: origin_city,
      origin_country: getCountryName(origin_country),
      visa_status: visa_status,
    },
    family: {
      father_occupation: father_occupation,
      mother_occupation: mother_occupation,
      siblings: siblings,
      family_type: family_type,
      siblings_details: siblings_details,
      paternal_family_details: paternal_family_details,
      maternal_family_details: maternal_family_details,
    },
    faith_tags: profileData.faith_tags || [],
  };

  const socialData = [
    { icon: 'FaFacebook', url: facebook_profile },
    { icon: 'FaInstagram', url: instagram_profile },
    { icon: 'FaLinkedin', url: linkedin_profile },
  ].filter(s => s.url); // Filter out empty social links

  const handleEditSection = (section) => {
    setEditSection(section);
  };

  const handleCancelEdit = () => {
    setEditSection(null);
  };

  const handleSaveProfile = async (formData) => {
    console.log('=== ProfilePage handleSaveProfile called ===');
    console.log('FormData entries:');
    for (let pair of formData.entries()) {
      console.log(pair[0], ':', pair[1]);
    }

    if (!user) {
      alert('You must be logged in to update a profile.');
      return;
    }

    try {
      console.log('Sending PUT request to:', `/profiles/${id}/`);
      const response = await apiClient.put(`/profiles/${id}/`, formData);
      console.log('Response received:', response);

      // Update the state with the new data from the server
      const normalized = normalizeProfile(response.data);
      setProfileData(normalized);

      // Keep React Query cache in sync so all consumers of ['me'] get fresh data
      queryClient.setQueryData(['me'], response.data);

      setEditSection(null);

      alert('Profile updated successfully!');
    } catch (err) {
      console.error('Error updating profile:', err);
      console.error('Error response:', err.response);
      alert('Failed to update profile. Please try again.');
    }
  };

  return (
    <>
      <AnimatedBackground />
      <main className="min-h-screen p-0 bg-transparent">
        <div className="w-full flex justify-center">
          <div className="w-full max-w-screen-xl px-6 py-8">
            <div className="bg-transparent overflow-visible p-0">
              {/* Action Buttons - Always visible */}
              <div className="flex justify-end gap-3 mb-6">
                {!editSection ? (
                  <>
                    <button
                      onClick={() => setShowPreview(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition duration-200"
                    >
                      <FaEye /> Preview Public Profile
                    </button>
                    <button
                      onClick={() => handleEditSection('all')}
                      className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition duration-200"
                    >
                      <FaEdit /> Edit All
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleCancelEdit}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition duration-200"
                  >
                    <FaTimes /> Cancel
                  </button>
                )}
              </div>

              {/* Conditional Content - View Mode vs Edit Mode */}
              {!editSection ? (
                // VIEW MODE - Original layout
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Left Column */}
                  <div className="lg:col-span-1 space-y-6">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                      <ProfileHeader {...headerData} />
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
                      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-4">
                        <h2 className="text-sm font-semibold text-gray-800 dark:text-white mb-4">Photo Gallery</h2>
                        <PhotoGallery images={additional_images || []} />
                      </div>
                    </motion.div>

                    {/* Faith Tags - Display under photo gallery */}
                    {profileData.faith_tags && profileData.faith_tags.length > 0 && (
                      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.25 }}>
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-4">
                          <h2 className="text-sm font-semibold text-gray-800 dark:text-white mb-3">My Faith</h2>
                          <FaithTagsSection selectedTags={profileData.faith_tags} isEditing={false} />
                        </div>
                      </motion.div>
                    )}

                    {/* Subscription Transfer - Only visible if has paid plan */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
                      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-4">
                        <SubscriptionTransfer />
                      </div>
                    </motion.div>

                  </div>

                  {/* Right Column */}
                  <div className="lg:col-span-2 space-y-6">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
                      <InfoTabs
                        aboutData={aboutData}
                        educationData={education}
                        careerData={work_experience}
                        preferencesData={preference || {}}
                        interestsData={interests}
                        currentUserProfile={profileData}
                        onUpdateInterests={handleUpdateInterests}
                        onUpdateProfile={fetchAllData}
                        onEditSection={handleEditSection}
                      />
                    </motion.div>
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }}>
                      <Socials socials={socialData} />
                    </motion.div>
                  </div>
                </div>
              ) : (
                // EDIT MODE - Profile Form
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="max-w-4xl mx-auto"
                >
                  <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">
                    {editSection === 'about' && 'Edit About'}
                    {editSection === 'education' && 'Edit Education'}
                    {editSection === 'career' && 'Edit Career'}
                    {editSection === 'all' && 'Edit Your Profile'}
                  </h1>
                  <ProfileForm
                    initialData={profileData}
                    onSubmit={handleSaveProfile}
                    section={editSection}
                  />
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Preview Modal */}
      {showPreview && (
        <PreviewModal
          profileData={profileData}
          onClose={() => setShowPreview(false)}
        />
      )}
    </>
  );
};

export default ProfilePage;