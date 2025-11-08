import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import AnimatedBackground from '../components/AnimatedBackground';
import ProfileHeader from '../components/ProfileHeader';
import InfoTabs from '../components/InfoTabs';
import Socials from '../components/Socials';
import GlassCard from '../components/GlassCard';
import { supabase } from '../lib/supabaseClient';
import apiClient from '../lib/api'; // Add this import
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const PublicProfilePage = () => {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id } = useParams();
  const { user } = useAuth();
  const [currentUserProfile, setCurrentUserProfile] = useState(null);
  const [interestStatus, setInterestStatus] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch public profile from Django backend
        const profileResponse = await apiClient.get(`/profiles/${id}/`);
        const profile = profileResponse.data;
        setProfileData(profile);

        if (user) {
          // Fetch current user's profile
          const { data: userProfile, error: userProfileError } = await supabase
            .from('profiles')
            .select('id') // Only need the ID for interest checks
            .eq('user_id', user.id)
            .single();
          if (userProfileError) throw userProfileError;
          setCurrentUserProfile(userProfile);

          // Fetch interest status between current user and public profile from Django backend
          try {
            const response = await apiClient.get('/interests/');
            const allInterests = response.data;
            
            // Find the specific interest between the current user and the public profile
            const foundInterest = allInterests.find(
              (int) =>
                (int.sender === userProfile.id && int.receiver === profile.id) ||
                (int.sender === profile.id && int.receiver === userProfile.id)
            );
            setInterestStatus(foundInterest || null); // Set to null if no interest found
          } catch (interestFetchError) {
            // If there's an error (e.g., 404 if no interests exist), treat it as no interest
            console.warn("Failed to fetch interests from Django backend:", interestFetchError);
            setInterestStatus(null);
          }
        }
      } catch (err) {
        setError('Failed to fetch data.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, user]);

  const handleSendInterest = async () => {
    if (!currentUserProfile || !profileData) return;
    try {
      const response = await apiClient.post('/interests/', { receiver: profileData.id });
      setInterestStatus(response.data);
      alert('Interest sent successfully!');
    } catch (error) {
      alert(`Failed to send interest: ${error.response?.data?.error || error.message}`);
    }
  };

  const handleAccept = async () => {
    if (!interestStatus) return;
    try {
      const response = await apiClient.post(`/interests/${interestStatus.id}/accept/`);
      // The backend returns a simple status message, not the updated object.
      // We need to manually update the status in the frontend state.
      setInterestStatus(prev => ({ ...prev, status: 'accepted' }));
      alert('Interest accepted successfully!');
    } catch (error) {
      alert(`Failed to accept interest: ${error.response?.data?.error || error.message}`);
    }
  };

  const handleReject = async () => {
    if (!interestStatus) return;
    try {
      const response = await apiClient.post(`/interests/${interestStatus.id}/reject/`);
      // The backend returns a simple status message, not the updated object.
      // We need to manually update the status in the frontend state.
      setInterestStatus(prev => ({ ...prev, status: 'rejected' }));
      alert('Interest rejected successfully!');
    } catch (error) {
      alert(`Failed to reject interest: ${error.response?.data?.error || error.message}`);
    }
  };

  const handleCancelInterest = async () => {
    if (!interestStatus) return;
    try {
      await apiClient.delete(`/interests/${interestStatus.id}/`);
      setInterestStatus(null);
      alert('Interest cancelled successfully!');
    } catch (error) {
      alert(`Failed to cancel interest: ${error.response?.data?.error || error.message}`);
    }
  };

  const renderInterestButton = () => {
    if (!user || !currentUserProfile || !profileData) {
      return null; // Not logged in or profiles not loaded
    }

    if (currentUserProfile.id === profileData.id) {
      return null; // Cannot send interest to self
    }

    if (!interestStatus) {
      return (
        <button onClick={handleSendInterest} className="bg-purple-600 text-white px-6 py-2 rounded-md hover:bg-purple-700">
          Send Interest
        </button>
      );
    }

    if (interestStatus.sender_id === currentUserProfile.id) {
      if (interestStatus.status === 'sent') {
        return (
          <button onClick={handleCancelInterest} className="bg-purple-400 text-white px-6 py-2 rounded-md hover:bg-purple-500">
            Cancel Interest
          </button>
        );
      }
      if (interestStatus.status === 'accepted') {
        return <button className="bg-purple-500 text-white px-6 py-2 rounded-md cursor-not-allowed">Interest Accepted</button>;
      }
      if (interestStatus.status === 'rejected') {
        return <button className="bg-gray-700 text-white px-6 py-2 rounded-md cursor-not-allowed">Interest Rejected</button>;
      }
    }

    if (interestStatus.receiver_id === currentUserProfile.id) {
      if (interestStatus.status === 'sent') {
        return (
          <div className="flex space-x-2">
            <button onClick={handleAccept} className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700">Accept</button>
            <button onClick={handleReject} className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700">Reject</button>
          </div>
        );
      }
      if (interestStatus.status === 'accepted') {
        return <button className="bg-purple-500 text-white px-6 py-2 rounded-md cursor-not-allowed">Interest Accepted</button>;
      }
      if (interestStatus.status === 'rejected') {
        return (
          <button onClick={handleSendInterest} className="bg-purple-600 text-white px-6 py-2 rounded-md hover:bg-purple-700">
            Send Interest
          </button>
        );
      }
    }

    return null;
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen text-white text-xl">Loading profile...</div>;
  }

  if (error) {
    return <div className="flex justify-center items-center h-screen text-red-500 text-xl">Error: {error}</div>;
  }

  if (!profileData) {
    return <div className="flex justify-center items-center h-screen text-white text-xl">Profile not found.</div>;
  }

  // Determine if preferences should be shown
  const showPreferences = profileData.id === currentUserProfile?.id || interestStatus?.status === 'accepted';

  // Destructure data for components
  const { name, date_of_birth, profile_image, facebook_profile, instagram_profile, linkedin_profile, education, work_experiences, preferences, is_verified, height_cm, religion, alcohol, smoking, current_city, origin_city, citizenship, marital_status, about, additional_images, profile_image_privacy } = profileData;

  // Calculate age from date_of_birth
  const age = date_of_birth ? new Date().getFullYear() - new Date(date_of_birth).getFullYear() : null;

  // Reconstruct data for components that expect a specific format
  const headerData = {
    name: name,
    age: age,
    isVerified: is_verified,
    profileImage: profile_image,
    isOnline: true, // Placeholder, as this is not in the model
    compatibility: profileData.compatibility_score, // Use actual compatibility score
    profileImagePrivacy: profile_image_privacy, // Pass privacy setting
    hasAcceptedInterest: interestStatus?.status === 'accepted', // Pass accepted interest status
  };

  const aboutData = {
    about: about,
    basicInfo: {
      height: height_cm ? `${height_cm}cm` : 'N/A',
      marital_status: marital_status,
      religion: religion,
      city: current_city,
      origin: origin_city,
      citizenship: citizenship,
    },
    lifestyle: {
      alcohol: alcohol,
      smoking: smoking,
    },
  };

  const socialData = [
    { icon: 'FaFacebook', url: facebook_profile },
    { icon: 'FaInstagram', url: instagram_profile },
    { icon: 'FaLinkedin', url: linkedin_profile },
  ].filter(s => s.url);

  return (
    <>
      <AnimatedBackground />
      <main className="relative min-h-screen p-4 sm:p-6 md:p-8 font-sans">
        <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-1 space-y-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <ProfileHeader {...headerData} />
              <div className="mt-4 text-center">
                {renderInterestButton()}
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
              <GlassCard className="p-6">
                <h2 className="section-title dark:text-white">Gallery</h2>
                <div className="grid grid-cols-2 gap-2">
                  {additional_images && additional_images.map((img, index) => (
                    <motion.img
                      key={index}
                      src={img.image_url}
                      alt={`gallery-${index}`}
                      className="rounded-lg object-cover w-full h-24 cursor-pointer"
                      whileHover={{ scale: 1.05 }}
                    />
                  ))}
                </div>
              </GlassCard>
            </motion.div>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-2 space-y-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
              <InfoTabs 
                aboutData={aboutData} 
                educationData={education} 
                careerData={work_experiences} 
                preferencesData={preferences ? preferences[0] : {}}
                showPreferences={showPreferences}
              />
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }}>
              <Socials socials={socialData} />
            </motion.div>
          </div>
        </div>
      </main>
    </>
  );
};

export default PublicProfilePage;
