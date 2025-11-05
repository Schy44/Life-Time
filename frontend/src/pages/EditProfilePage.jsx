import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';
import ProfileForm from '../components/ProfileForm';
import AnimatedBackground from '../components/AnimatedBackground';
import GlassCard from '../components/GlassCard';

const EditProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        setError('You must be logged in to edit a profile.');
        setLoading(false);
        return;
      }

      try {
        const { data, error: fetchError } = await supabase
          .from('profiles')
          .select('*, education(*), work_experiences(*), user_languages(*), preferences(*), additional_images(*)')
          .eq('id', id)
          .single();

        if (fetchError) throw fetchError;

        if (data.user_id !== user.id) {
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
      const { education, work_experience, languages, additional_images, preference, ...profileData } = formData;

      const { error: profileError } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('id', id);
      if (profileError) throw profileError;

      const profileId = id;

      if (education && education.length > 0) {
        const educationWithProfileId = education.map(item => ({ ...item, profile_id: profileId }));
        const { error } = await supabase.from('education').upsert(educationWithProfileId);
        if (error) throw error;
      }

      if (work_experience && work_experience.length > 0) {
        const workWithProfileId = work_experience.map(item => ({ ...item, profile_id: profileId }));
        const { error } = await supabase.from('work_experiences').upsert(workWithProfileId);
        if (error) throw error;
      }

      if (languages && languages.length > 0) {
        const langWithProfileId = languages.map(item => ({ ...item, profile_id: profileId }));
        const { error } = await supabase.from('user_languages').upsert(langWithProfileId);
        if (error) throw error;
      }

      if (additional_images && additional_images.length > 0) {
        const imagesWithProfileId = additional_images.map(item => ({ ...item, profile_id: profileId, image_url: item.image }));
        const { error } = await supabase.from('additional_images').upsert(imagesWithProfileId);
        if (error) throw error;
      }

      if (preference) {
        const { error } = await supabase.from('preferences').upsert({ ...preference, profile_id: profileId });
        if (error) throw error;
      }

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
