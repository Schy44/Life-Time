import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import AnimatedBackground from '../components/AnimatedBackground';
import ProfileHeader from '../components/ProfileHeader';
import InfoTabs from '../components/InfoTabs';
import LanguageProficiency from '../components/LanguageProficiency';
import Socials from '../components/Socials';
import GlassCard from '../components/GlassCard';
import { getProfileById, sendInterest, getProfile, getInterests, acceptInterest, rejectInterest } from '../services/api';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const PublicProfilePage = () => {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id } = useParams();
  const { token } = useAuth();
  const [currentUserProfile, setCurrentUserProfile] = useState(null);
  const [interestStatus, setInterestStatus] = useState(null);
  const [interests, setInterests] = useState([]); // Added this line

  useEffect(() => {
    const fetchData = async () => {
      try {
        const profile = await getProfileById(id);
        setProfileData(profile);

        if (token) {
          const userProfile = await getProfile();
          setCurrentUserProfile(userProfile);

          const allInterests = await getInterests();
          setInterests(allInterests);

          const relevantInterest = allInterests.find(
            (i) =>
              (i.sender.id === userProfile.id && i.receiver.id === profile.id) ||
              (i.sender.id === profile.id && i.receiver.id === userProfile.id)
          );
          if (relevantInterest) {
            setInterestStatus(relevantInterest);
          }
        } // Closing brace for if (token) block
      } catch (err) {
        setError('Failed to fetch data.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, token]);

  const handleSendInterest = async () => {
    try {
      const newInterest = await sendInterest(profileData.id);
      setInterestStatus(newInterest);
      alert('Interest sent successfully!');
    } catch (error) {
      alert('Failed to send interest. You may have already sent one to this user.');
    }
  };

  const handleAccept = async () => {
    try {
      await acceptInterest(interestStatus.id);
      setInterestStatus({ ...interestStatus, status: 'accepted' });
    } catch (error) {
      alert('Failed to accept interest.');
    }
  };

  const handleReject = async () => {
    try {
      await rejectInterest(interestStatus.id);
      setInterestStatus({ ...interestStatus, status: 'rejected' });
    } catch (error) {
      alert('Failed to reject interest.');
    }
  };

  const renderInterestButton = () => {
    if (!interestStatus) {
      return (
        <button onClick={handleSendInterest} className="bg-purple-600 text-white px-6 py-2 rounded-md hover:bg-purple-700">
          Send Interest
        </button>
      );
    }

    if (interestStatus.sender.id === currentUserProfile?.id) {
      if (interestStatus.status === 'sent') {
        return <button className="bg-gray-500 text-white px-6 py-2 rounded-md cursor-not-allowed">Interest Sent</button>;
      }
      if (interestStatus.status === 'accepted') {
        return <button className="bg-purple-500 text-white px-6 py-2 rounded-md cursor-not-allowed">Interest Accepted</button>;
      }
      if (interestStatus.status === 'rejected') {
        return <button className="bg-gray-700 text-white px-6 py-2 rounded-md cursor-not-allowed">Interest Rejected</button>;
      }
    }

    if (interestStatus.receiver.id === currentUserProfile?.id) {
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
  const { name, date_of_birth, profile_image, hobbies, facebook_profile, instagram_profile, linkedin_profile, education, work_experience, languages, preference, is_verified, height_cm, religion, alcohol, smoking, current_city, origin_city, citizenship, marital_status, about, additional_images, profile_image_privacy, additional_images_privacy } = profileData;

  // Calculate age from date_of_birth
  const age = date_of_birth ? new Date().getFullYear() - new Date(date_of_birth).getFullYear() : null;

  // Reconstruct data for components that expect a specific format
  const headerData = {
    name: name,
    age: age,
    isVerified: is_verified,
    profileImage: profile_image,
    isOnline: true, // Placeholder, as this is not in the model
    compatibility: 85, // Placeholder, as this is not in the model
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
      hobbies: hobbies,
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
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
              <LanguageProficiency languages={languages} />
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
              <GlassCard className="p-6">
                <h2 className="section-title dark:text-white">Gallery</h2>
                <div className="grid grid-cols-2 gap-2">
                  {additional_images && additional_images.map((img, index) => (
                    <motion.img
                      key={index}
                      src={img.image}
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
                careerData={work_experience} 
                preferencesData={preference}
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
