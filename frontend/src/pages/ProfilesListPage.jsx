import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getProfiles } from '../services/api';
import GlassCard from '../components/GlassCard';
import AnimatedBackground from '../components/AnimatedBackground';

const ProfilesListPage = () => {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const data = await getProfiles();
        setProfiles(data);
      } catch (err) {
        setError('Failed to fetch profiles.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfiles();
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center h-screen text-white text-xl">Loading profiles...</div>;
  }

  if (error) {
    return <div className="flex justify-center items-center h-screen text-red-500 text-xl">Error: {error}</div>;
  }

  return (
    <>
      <AnimatedBackground />
      <main className="relative min-h-screen p-4 sm:p-6 md:p-8 font-sans">
        <div className="max-w-4xl mx-auto">
          <GlassCard className="p-6">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">All Profiles</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {profiles.map(profile => (
                <Link to={`/profiles/${profile.id}`} key={profile.id} className="group">
                  <GlassCard className="p-4 hover:bg-white/20 transition-colors duration-300">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-white group-hover:text-purple-600">{profile.name}</h2>
                    <p className="text-gray-600 dark:text-gray-300">{profile.current_city}, {profile.current_country}</p>
                  </GlassCard>
                </Link>
              ))}
            </div>
          </GlassCard>
        </div>
      </main>
    </>
  );
};

export default ProfilesListPage;
