import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext'; // Import useTheme
import ProfileForm from '../components/ProfileForm';
import AnimatedBackground from '../components/AnimatedBackground';
import GlassCard from '../components/GlassCard';

const EditProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme } = useTheme(); // Use the theme hook
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const isDarkMode = theme === 'dark';

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        setError('You must be logged in to edit a profile.');
        setLoading(false);
        return;
      }

      try {
        const { data } = await apiClient.get(`/profiles/${id}/`);

        if (data.user.username !== user.id) {
          setError('You are not authorized to edit this profile.');
          setProfileData(null);
        } else {
          setProfileData(data);
        }
      } catch (err) {
        setError('Failed to fetch profile data for editing.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id, user]);

  const handleSubmit = async (formData) => {
    if (!user) {
      alert('You must be logged in to update a profile.');
      return;
    }

    try {
      const response = await apiClient.put(`/profiles/${id}/`, formData);

      // Update the state with the new data from the server
      setProfileData(response.data);

      alert('Profile updated successfully!');
      navigate('/profile', { state: { updatedProfile: response.data } });
    } catch (err) {
      console.error('Error updating profile:', err);
      alert('Failed to update profile. Please try again.');
    }
  };


  if (loading) {
    return <div className={`flex justify-center items-center h-screen text-xl ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Loading profile for editing...</div>;
  }

  if (error) {
    return <div className={`flex justify-center items-center h-screen text-xl ${isDarkMode ? 'text-red-300' : 'text-red-500'}`}>Error: {error}</div>;
  }

  if (!profileData) {
    return <div className={`flex justify-center items-center h-screen text-xl ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>No profile data available for editing.</div>;
  }

  return (
    <>
      <AnimatedBackground />
      <main className="relative min-h-screen p-4 sm:p-6 md:p-8 font-sans">
        <div className="max-w-4xl mx-auto">
          <GlassCard className="p-8">
            <h1 className={`text-3xl font-bold mb-6 text-center ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Edit Your Profile</h1>
            <ProfileForm initialData={profileData} onSubmit={handleSubmit} />
          </GlassCard>
        </div>
      </main>
    </>
  );
};

export default EditProfilePage;
