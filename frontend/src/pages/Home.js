import React, { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motion } from 'framer-motion';
import AnimatedBackground from '../components/AnimatedBackground';
import GlassCard from '../components/GlassCard';
import { useAuth } from '../context/AuthContext';
import { Users, Zap, Heart, Rocket } from 'lucide-react';
import FaqsPage from '../components/FaqsPage';
import PricingPage from '../components/PricingPage';
import Footer from '../components/Footer';
import { FlipWords } from '../components/FlipWords';
import GlobalMap from '../components/GlobalMap';
import Testimonials from '../components/Testimonials';
gsap.registerPlugin(ScrollTrigger);


const RoadmapSection = () => {
  const steps = [
    {
      id: 1,
      title: '1. Tell Your Story',
      copy:
        'Create a rich, detailed profile that goes beyond the surface. Share your passions, your dreams, and what makes you, you.',
      icon: <Users size={24} />,
    },
    {
      id: 2,
      title: '2. Discover & Connect',
      copy:
        'Explore profiles of people who share your values. Our smart matching helps you find compatibility.',
      icon: <Zap size={24} />,
    },
    {
      id: 3,
      title: '3. Build Something Real',
      copy:
        'Move beyond the swipe. Have meaningful conversations and build connections that have the potential to last a lifetime.',
      icon: <Heart size={24} />,
    },
  ];

  const stepVariants = {
    hidden: { opacity: 0, x: -100 },
    visible: (i) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: i * 0.3,
        duration: 0.6,
        ease: "easeOut",
      },
    }),
  };

  return (
    <section className="py-20 px-4 relative overflow-hidden">
      <div className="max-w-6xl mx-auto text-center relative z-10">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4 text-gray-800 dark:text-white"
        >
          Your Journey to Connection
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ delay: 0.1 }}
          className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-16"
        >
          Discover how Life-Time empowers you to find meaningful relationships through a simple, guided process.
        </motion.p>

        <div className="relative flex flex-col items-center w-full max-w-3xl mx-auto mt-12">
          {/* Vertical Line */}
          <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-purple-300 z-0"></div>

          {steps.map((step, index) => (
            <motion.div
              key={step.id}
              className={`relative flex items-center w-full mb-12 ${index % 2 === 0 ? 'justify-start pr-10' : 'justify-end pl-10'}`}
              custom={index}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={stepVariants}
            >
              {/* Timeline Dot */}
              <div className="absolute left-1/2 transform -translate-x-1/2 w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white shadow-lg z-10 border-4 border-white dark:border-gray-800"></div>

              {/* Step Content */}
              <div className={`w-1/2 ${index % 2 === 0 ? 'text-right pr-8' : 'text-left pl-8'}`}>
                <h3 className="text-xl font-bold mb-2 text-gray-800 dark:text-white">{step.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">{step.copy}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Home = () => {
  useAuth();
  const words = ["Securely.", "Effortlessly."];
  const [profileCount, setProfileCount] = React.useState(0);

  return (
    <>
      <AnimatedBackground />
      <main className="relative w-full text-gray-800 dark:text-white">

        {/* Hero Section - Modular Glassmorphism Design */}
        <section className="relative min-h-screen flex flex-col justify-center items-center text-center px-6 md:px-12 overflow-hidden">
          {/* Subtle Animated Shapes (complementing AnimatedBackground) */}
          <motion.div
            animate={{
              scale: [1, 1.05, 1, 0.95, 1],
              rotate: [0, 10, 0, -10, 0],
              x: [0, 20, 0, -20, 0],
              y: [0, -15, 0, 15, 0]
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-300/10 rounded-full mix-blend-screen filter blur-2xl opacity-50"
          ></motion.div>
          <motion.div
            animate={{
              scale: [1, 0.9, 1, 1.1, 1],
              rotate: [0, -15, 0, 15, 0],
              x: [0, -30, 0, 30, 0],
              y: [0, 20, 0, -20, 0]
            }}
            transition={{ duration: 25, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-indigo-300/10 rounded-full mix-blend-screen filter blur-2xl opacity-50"
          ></motion.div>

          <div className="max-w-5xl z-10 relative grid grid-cols-1 lg:grid-cols-2 gap-8 items-center py-12">
            {/* Left Part: Heading & Subtitle */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="lg:text-left text-center lg:pr-8"
            >
              <h1
                className="hero-title text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-tight mb-4 text-gray-800 dark:text-white"
              >
                Find Your Perfect Match <br />
                <FlipWords words={words} />
              </h1>

              <p
                className="hero-subtitle text-lg md:text-xl max-w-xl lg:max-w-none mx-auto lg:mx-0 mb-8 text-gray-600 dark:text-gray-300"
              >
                Our platform connects brides and grooms, offering secure profile management, permission-based viewing, and a commitment-ensuring admin fee for access.
              </p>
            </motion.div>

            {/* Right Part: CTA, Statistics, and New Content Blocks */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
              className="lg:text-left text-center space-y-6"
            >
              {/* CTA Buttons */}
              <GlassCard className="p-6 bg-white/10 dark:bg-gray-800/10 backdrop-blur-md border border-white/20 dark:border-gray-700/20 shadow-lg rounded-3xl">
                <div className="hero-cta flex flex-col sm:flex-row justify-center lg:justify-start items-center space-y-4 sm:space-y-0 sm:space-x-4">
                  <Link to="/profiles">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-purple-600 text-white px-8 py-4 rounded-full font-bold text-base tracking-wide hover:bg-purple-700 transition-colors shadow-lg flex items-center space-x-2"
                    >
                      <Rocket size={20} />
                      <span>GET STARTED</span>
                    </motion.button>
                  </Link>
                </div>
              </GlassCard>

              {/* New Small Parts */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <GlassCard className="p-5 bg-white/10 dark:bg-gray-800/10 backdrop-blur-md border border-white/20 dark:border-gray-700/20 shadow-lg rounded-3xl text-gray-800 dark:text-white">
                  <h4 className="font-bold mb-2">Secure Profile Creation</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Create and manage personal profiles with robust verification processes.</p>
                </GlassCard>
                <GlassCard className="p-5 bg-white/10 dark:bg-gray-800/10 backdrop-blur-md border border-white/20 dark:border-gray-700/20 shadow-lg rounded-3xl text-gray-800 dark:text-white">
                  <h4 className="font-bold mb-2">Permission-Based Access</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Control who views your profile with our advanced permission system.</p>
                </GlassCard>
                <GlassCard className="p-5 bg-white/10 dark:bg-gray-800/10 backdrop-blur-md border border-white/20 dark:border-gray-700/20 shadow-lg rounded-3xl text-gray-800 dark:text-white sm:col-span-2">
                  <h4 className="font-bold mb-2">Transparent Admin Fees</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Access profiles after a small, transparent admin fee, ensuring commitment and security.</p>
                </GlassCard>
              </div>

              {/* Statistics Section */}
              <GlassCard className="p-6 bg-white/10 dark:bg-gray-800/10 backdrop-blur-md border border-white/20 dark:border-gray-700/20 shadow-lg rounded-3xl">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                    className="flex flex-col items-center"
                  >
                    <h3 className="text-3xl md:text-4xl font-extrabold text-gray-800 dark:text-white">10M+</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Verified Profiles</p>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.6 }}
                    className="flex flex-col items-center"
                  >
                    <h3 className="text-3xl md:text-4xl font-extrabold text-gray-800 dark:text-white">500K+</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Successful Matches</p>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.6 }}
                    className="flex flex-col items-center"
                  >
                    <h3 className="text-3xl md:text-4xl font-extrabold text-gray-800 dark:text-white">100%</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Privacy Control</p>
                  </motion.div>
                </div>
              </GlassCard>
            </motion.div>
          </div>
        </section>

        {/* Roadmap Section */}
        <RoadmapSection />


        {/* Testimonials Section */}
        <Testimonials />


        <PricingPage id="choose-your-journey" />

        <FaqsPage />

        {/* Global Map Section */}
        <section className="relative py-16 px-6 md:px-12 bg-gray-50 dark:bg-gray-900/50">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-8"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3">
                Discover {profileCount > 0 ? `${profileCount.toLocaleString()}+` : ''} Members Worldwide
              </h2>
              <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Connect with people from around the globe. Click on any profile to learn more.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <GlobalMap onProfilesLoaded={setProfileCount} />
            </motion.div>
          </div>
        </section>

        <Footer />
      </main>
    </>
  );
};

export default Home;