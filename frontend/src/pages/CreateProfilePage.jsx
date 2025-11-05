import React from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';
import ProfileForm from '../components/ProfileForm';
import AnimatedBackground from '../components/AnimatedBackground';
import GlassCard from '../components/GlassCard';

const CreateProfilePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const initialData = {
    profile_for: 'self',
    name: user?.name || '',
    date_of_birth: null,
    gender: 'male',
    profile_image: null,
    height_cm: '',
    blood_group: '',
    religion: '',
    alcohol: 'never',
    smoking: 'never',
    current_city: '',
    current_country: '',
    origin_city: '',
    origin_country: '',
    visa_status: '',
    citizenship: '',
    father_occupation: '',
    mother_occupation: '',
    siblings: '',
    family_type: 'nuclear',
    marital_status: 'never_married',
    about: '',
    looking_for: '',
    email: user?.email || '',
    phone: '',
    hobbies: [],
    facebook_profile: '',
    instagram_profile: '',
    linkedin_profile: '',
    profile_image_privacy: 'public',
    additional_images_privacy: 'matches',
    education: [],
    work_experience: [],
    languages: [],
    preference: {},
    additional_images: [],
  };

  const handleSubmit = async (formData) => {
    if (!user) {
      alert('You must be logged in to create a profile.');
      return;
    }

    try {
      const { education, work_experience, languages, additional_images, preference, ...profileData } = formData;

      // 1. Update main profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('user_id', user.id);
      if (profileError) throw profileError;

      // 2. Get profile ID
      const { data: updatedProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();
      if (fetchError) throw fetchError;
      const profileId = updatedProfile.id;

      // 3. Upsert related data
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
        const imagesWithProfileId = additional_images.map(item => ({ ...item, profile_id: profileId, image_url: item.image })); // Assuming form gives 'image' but table wants 'image_url'
        const { error } = await supabase.from('additional_images').upsert(imagesWithProfileId);
        if (error) throw error;
      }

      if (preference) {
        const { error } = await supabase.from('preferences').upsert({ ...preference, profile_id: profileId });
        if (error) throw error;
      }

      alert('Profile created successfully!');
      navigate('/profile');
    } catch (err) {
      console.error('Error creating profile:', err);
      alert('Failed to create profile. Please check the console for errors.');
    }
  };

  return (
    <>
      <AnimatedBackground />
      <main className="relative min-h-screen p-4 sm:p-6 md:p-8 font-sans">
        <div className="max-w-4xl mx-auto">
          <GlassCard className="p-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">Create Your Profile</h1>
            <ProfileForm initialData={initialData} onSubmit={handleSubmit} />
          </GlassCard>
        </div>
      </main>
    </>
  );
};

export default CreateProfilePage;
