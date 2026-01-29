import React from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motion } from 'framer-motion';
import AnimatedBackground from '../components/AnimatedBackground';
import { useAuth } from '../context/AuthContext';
import { Users, Zap, Heart, Sparkles, MapPin } from 'lucide-react';
import FaqsPage from '../components/FaqsPage';
import PricingPage from '../components/PricingPage';
import Footer from '../components/Footer';
import { FlipWords } from '../components/FlipWords';
import GlobalMap from '../components/GlobalMap';
import Testimonials from '../components/Testimonials';
import globalSearchImg from '../assets/images/global_search_hero.png';
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
        <section className="relative min-h-[60vh] flex flex-col items-center text-center px-6 md:px-12 overflow-hidden pt-12 pb-12">
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

          <div className="max-w-5xl z-10 relative grid grid-cols-1 lg:grid-cols-2 gap-8 items-center py-4">
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
                className="hero-subtitle text-lg md:text-xl max-w-xl lg:max-w-none mx-auto lg:mx-0 mb-8 text-gray-600 dark:text-gray-300 leading-relaxed"
              >
                Our platform connects brides and grooms, offering secure profile management and permission-based viewing.
              </p>

              {/* CTA Moved to Left Column */}
              <div className="flex flex-col sm:flex-row justify-center lg:justify-start items-center space-y-4 sm:space-y-0 sm:space-x-4 mb-12">
                <Link to="/survey">
                  <motion.button
                    whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(147, 51, 234, 0.4)" }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-purple-600 text-white px-10 py-4 rounded-full font-bold text-lg tracking-wide hover:bg-purple-700 transition-all shadow-xl flex items-center space-x-3"
                  >
                    <Sparkles size={22} />
                    <span>GET STARTED</span>
                  </motion.button>
                </Link>
              </div>
            </motion.div>

            {/* Right Part: Dynamic Illustration (No Boxes) */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, ease: 'easeOut', delay: 0.4 }}
              className="relative flex flex-col items-center justify-center pointer-events-none lg:pointer-events-auto"
            >
              {/* Background Glow */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-purple-500/10 dark:bg-purple-500/5 rounded-full blur-[80px] -z-10" />

              {/* Main Illustration */}
              <motion.div
                animate={{
                  y: [0, -20, 0],
                  rotate: [0, 1.5, 0, -1.5, 0]
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="relative z-20 w-full max-w-[480px] drop-shadow-[0_45px_45px_rgba(0,0,0,0.12)] px-4"
              >
                <img
                  src={globalSearchImg}
                  alt="Global Matching"
                  className="w-full h-auto rounded-[3rem] mix-blend-multiply dark:mix-blend-normal"
                />
              </motion.div>

              {/* Stylish Caption */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="text-center mt-12 space-y-4 max-w-sm"
              >
                <p className="text-xl md:text-2xl text-gray-800 dark:text-gray-100 font-bold italic leading-snug">
                  "we look for the right person for you in any location."
                </p>
              </motion.div>

              {/* Floating Decorative Elements - Repositioned further out to remove congestion */}
              <motion.div
                animate={{ y: [0, 40, 0], x: [0, -20, 0], rotate: [0, 15, 0] }}
                transition={{ duration: 7, repeat: Infinity }}
                className="absolute top-[-30px] right-[-40px] p-5 bg-white/40 dark:bg-gray-800/20 backdrop-blur-xl rounded-[2rem] shadow-2xl border border-white/40 hidden xl:block z-30"
              >
                <Heart className="text-pink-500 fill-pink-500" size={32} />
              </motion.div>

              <motion.div
                animate={{ y: [0, -60, 0], x: [0, 20, 0], rotate: [0, -20, 0] }}
                transition={{ duration: 9, repeat: Infinity, delay: 1 }}
                className="absolute bottom-[20%] left-[-60px] p-5 bg-white/40 dark:bg-gray-800/20 backdrop-blur-xl rounded-[2rem] shadow-2xl border border-white/40 hidden xl:block z-30"
              >
                <Users className="text-indigo-500" size={32} />
              </motion.div>

              <motion.div
                animate={{ scale: [1, 1.2, 1], rotate: [0, -10, 0] }}
                transition={{ duration: 5, repeat: Infinity, delay: 0.5 }}
                className="absolute top-1/2 right-[-80px] p-4 bg-white/40 dark:bg-gray-800/20 backdrop-blur-xl rounded-[1.5rem] shadow-xl border border-white/40 hidden xl:block z-30"
              >
                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                  <Heart className="text-white fill-white" size={16} />
                </div>
              </motion.div>

              <motion.div
                animate={{ y: [0, 40, 0], x: [0, 30, 0] }}
                transition={{ duration: 6, repeat: Infinity, delay: 2 }}
                className="absolute top-1/4 left-[-100px] p-4 bg-white/30 dark:bg-gray-800/20 backdrop-blur-xl rounded-full shadow-xl border border-white/40 hidden xl:block z-30"
              >
                <Sparkles className="text-indigo-600" size={28} />
              </motion.div>

              <motion.div
                animate={{ scale: [1, 1.1, 1], y: [0, -20, 0] }}
                transition={{ duration: 4, repeat: Infinity, delay: 1.5 }}
                className="absolute bottom-10 right-[-40px] p-4 bg-white/30 dark:bg-gray-800/20 backdrop-blur-xl rounded-3xl shadow-xl border border-white/40 hidden xl:block z-30"
              >
                <MapPin className="text-purple-600 fill-purple-100" size={32} />
              </motion.div>
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