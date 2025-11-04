import React from 'react';
import { useNavigate } from 'react-router-dom';
import { createProfile } from '../services/api';
import ProfileForm from '../components/ProfileForm';
import AnimatedBackground from '../components/AnimatedBackground';
import GlassCard from '../components/GlassCard';
import { useAuth } from '../context/AuthContext'; // Import useAuth

const CreateProfilePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth(); // Get user from AuthContext

  // Define the initial empty structure for the form
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
    try {
      await createProfile(formData);
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
