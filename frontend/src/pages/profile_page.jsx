import React, { useState, useEffect } from 'react';
import AnimatedBackground from '../components/AnimatedBackground';
import ProfileHeader from '../components/ProfileHeader';
import InfoTabs from '../components/InfoTabs';
import LanguageProficiency from '../components/LanguageProficiency';
import Socials from '../components/Socials';
import FloatingActionButton from '../components/FloatingActionButton';
import GlassCard from '../components/GlassCard';
import { getProfile, getInterests } from '../services/api';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const ProfilePage = () => {
  const [profileData, setProfileData] = useState(null);
  const [interests, setInterests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchAllData = async () => {
    try {
      const profile = await getProfile();
      const interestsData = await getInterests();
      setProfileData(profile);
      setInterests(interestsData);
    } catch (err) {
      if (err.response && err.response.status === 404) {
        setProfileData(null);
      } else {
        setError('Failed to fetch data. Please ensure you have a valid token in api.js and the backend is running.');
        console.error(err);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const handleUpdateInterests = () => {
    // Refetch interests after an update
    getInterests().then(setInterests);
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen text-gray-800 dark:text-white text-xl">Loading profile...</div>;
  }

  if (error) {
    return <div className="flex justify-center items-center h-screen text-red-500 text-xl">Error: {error}</div>;
  }

  if (!profileData) {
    return (
      <>
        <AnimatedBackground />
        <div className="flex flex-col justify-center items-center h-screen text-gray-800 dark:text-white text-center">
          <GlassCard className="p-8">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">Welcome!</h1>
            <p className="text-gray-600 dark:text-gray-300 mb-6">You haven't created a profile yet. Let's get started!</p>
            <button 
              onClick={() => navigate('/profile/create')}
              className="w-full p-3 rounded-lg bg-gradient-to-r from-purple-600 to-pink-500 text-white font-bold text-lg hover:from-purple-700 hover:to-pink-600 transition duration-300"
            >
              Create Your Profile
            </button>
          </GlassCard>
        </div>
      </>
    );
  }

  // Destructure data for components
  const { id, name, date_of_birth, gender, profile_image, hobbies, facebook_profile, instagram_profile, linkedin_profile, education, work_experience, languages, preference, is_verified, height_cm, blood_group, religion, alcohol, smoking, current_city, current_country, origin_city, origin_country, visa_status, citizenship, father_occupation, mother_occupation, siblings, family_type, marital_status, about, looking_for, email, phone, additional_images, profile_image_privacy, additional_images_privacy } = profileData;

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
    hasAcceptedInterest: true, // Always true for own profile
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
      hobbies: hobbies, // hobbies is already JSONField
    },
  };

  const socialData = [
    { icon: 'FaFacebook', url: facebook_profile },
    { icon: 'FaInstagram', url: instagram_profile },
    { icon: 'FaLinkedin', url: linkedin_profile },
  ].filter(s => s.url); // Filter out empty social links

  const handleEditProfile = () => {
    navigate(`/profile/edit/${id}`);
  };

  return (
    <>
      <AnimatedBackground />
      <main className="relative min-h-screen p-4 sm:p-6 md:p-8 font-sans">
        <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-1 space-y-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <ProfileHeader {...headerData} />
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
                      src={img.image} // Assuming image is a field in additional_images object
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
                interestsData={interests}
                currentUserProfile={profileData}
                onUpdateInterests={handleUpdateInterests}
              />
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }}>
              <Socials socials={socialData} />
            </motion.div>
          </div>
        </div>
      </main>
      <FloatingActionButton onClick={handleEditProfile} />
    </>
  );
};

export default ProfilePage;