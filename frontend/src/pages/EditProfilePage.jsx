import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProfile, updateProfile } from '../services/api';
import ProfileForm from '../components/ProfileForm';
import AnimatedBackground from '../components/AnimatedBackground';
import GlassCard from '../components/GlassCard';

const EditProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getProfile();
        if (data) {
          setProfileData(data);
        } else {
          setError('Profile not found.');
        }
      } catch (err) {
        setError('Failed to fetch profile data for editing.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id]);

  const handleSubmit = async (formData) => {
    try {
      await updateProfile(id, formData);
      alert('Profile updated successfully!');
      navigate('/profile');
    } catch (err) {
      console.error('Error updating profile:', err);
      alert('Failed to update profile. Please try again.');
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen text-white text-xl">Loading profile for editing...</div>;
  }

  if (error) {
    return <div className="flex justify-center items-center h-screen text-red-500 text-xl">Error: {error}</div>;
  }

  if (!profileData) {
    return <div className="flex justify-center items-center h-screen text-gray-500 text-xl">No profile data available for editing.</div>;
  }

  return (
    <>
      <AnimatedBackground />
      <main className="relative min-h-screen p-4 sm:p-6 md:p-8 font-sans">
        <div className="max-w-4xl mx-auto">
          <GlassCard className="p-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">Edit Your Profile</h1>
            <ProfileForm initialData={profileData} onSubmit={handleSubmit} />
          </GlassCard>
        </div>
      </main>
    </>
  );
};

export default EditProfilePage;
