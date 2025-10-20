import React from 'react';
import { Link } from 'react-router-dom';
import AnimatedBackground from '../components/AnimatedBackground';
import GlassCard from '../components/GlassCard';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { token } = useAuth();

  return (
    <>
      <AnimatedBackground />
      <main className="relative min-h-screen flex flex-col items-center justify-center p-4 text-gray-800 dark:text-white text-center">
        <GlassCard className="p-8 md:p-12">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 text-gray-800 dark:text-white">Find Your Lifetime Partner</h1>
          <p className="text-lg md:text-xl mb-8 text-gray-600 dark:text-gray-300 dark:text-gray-300">Join our community to connect with people who share your values and interests.</p>
          <div className="flex justify-center space-x-4">
            {token ? (
              <Link to="/profiles" className="bg-purple-600 text-white px-6 py-3 rounded-md hover:bg-purple-700 text-lg">
                Browse Profiles
              </Link>
            ) : (
              <>
                <Link to="/register" className="bg-purple-600 text-white px-6 py-3 rounded-md hover:bg-purple-700 text-lg">
                  Get Started
                </Link>
                <Link to="/login" className="bg-white/20 text-white px-6 py-3 rounded-md hover:bg-white/30 text-lg">
                  Login
                </Link>
              </>
            )}
          </div>
        </GlassCard>

        <div className="mt-16 max-w-4xl w-full">
            <h2 className="text-3xl font-bold mb-8 text-gray-800 dark:text-white">How It Works</h2>
            <div className="grid md:grid-cols-3 gap-8">
                <GlassCard className="p-6">
                    <h3 className="text-2xl font-semibold mb-2 text-gray-800 dark:text-white">1. Create Your Profile</h3>
                    <p>Build a detailed profile that showcases your personality, lifestyle, and what you're looking for.</p>
                </GlassCard>
                <GlassCard className="p-6">
                    <h3 className="text-2xl font-semibold mb-2">2. Browse & Connect</h3>
                    <p>Explore profiles of other members and connect with those who catch your eye.</p>
                </GlassCard>
                <GlassCard className="p-6">
                    <h3 className="text-2xl font-semibold mb-2">3. Find Your Match</h3>
                    <p>Our platform helps you find compatible matches based on your preferences.</p>
                </GlassCard>
            </div>
        </div>
      </main>
    </>
  );
};

export default Home;