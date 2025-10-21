import React, { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motion } from 'framer-motion';
import AnimatedBackground from '../components/AnimatedBackground';
import GlassCard from '../components/GlassCard';
import { useAuth } from '../context/AuthContext';
import { Users, Zap, Heart } from 'lucide-react';
import FaqsPage from '../components/FaqsPage';
import PricingPage from '../components/PricingPage';
gsap.registerPlugin(ScrollTrigger);

// --- Reusable Components ---
const FeatureCard = ({ icon, title, children, index }) => {
  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0 },
  };
  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.5 }}
      transition={{ delay: index * 0.2 }}
    >
      <GlassCard className="p-6 text-center h-full hover:shadow-purple-400/50 transition-shadow duration-300">
        <div className="flex justify-center mb-4 text-purple-400">{icon}</div>
        <h3 className="text-2xl font-semibold mb-2">{title}</h3>
        <p className="text-gray-600 dark:text-gray-300">{children}</p>
      </GlassCard>
    </motion.div>
  );
};

const StoryCard = ({ image, quote, author, index }) => {
  const imageRef = useRef(null);

  useEffect(() => {
    let ctx = gsap.context(() => {
      gsap.to(imageRef.current, {
        y: '-20%',
        ease: 'none',
        scrollTrigger: {
          trigger: imageRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      });
    }, imageRef);
    return () => ctx.revert();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, amount: 0.5 }}
      transition={{ delay: index * 0.2 }}
      className="w-full"
    >
      <GlassCard className="flex flex-col h-full overflow-hidden transform hover:scale-105 transition-transform duration-300">
        <div className="h-48 overflow-hidden">
          <img ref={imageRef} src={image} alt={author} className="w-full h-full object-cover" />
        </div>
        <div className="p-6">
          <p className="text-lg italic mb-4">"{quote}"</p>
          <p className="text-right font-semibold text-purple-400">- {author}</p>
        </div>
      </GlassCard>
    </motion.div>
  );
};

const Home = () => {
  const { token } = useAuth();
  return (
    <>
      <AnimatedBackground />
      <main className="relative w-full text-gray-800 dark:text-white overflow-x-hidden">

        {/* Hero Section */}
        <section className="relative min-h-screen flex flex-col justify-center items-start text-left px-6 md:px-12 overflow-hidden">
          {/* Decorative Blobs */}
          <motion.div 
            animate={{ 
              scale: [1, 1.1, 1, 1.2, 1],
              rotate: [0, 90, 180, 270, 360],
              x: [0, 50, 0, -50, 0]
            }}
            transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
            className="absolute top-1/4 right-0 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20"
          ></motion.div>
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1, 1.1, 1],
              rotate: [0, -90, -180, -270, -360],
              y: [0, -50, 0, 50, 0]
            }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            className="absolute top-1/2 right-1/4 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20"
          ></motion.div>

          <div className="max-w-4xl z-10">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="hero-title text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight leading-none mb-8"
            >
              CONNECTING<br />
              SOULS, NOT<br />
              JUST PROFILES.
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8, ease: 'easeOut' }}
              className="hero-subtitle text-lg md:text-xl max-w-2xl mb-10 text-gray-600 dark:text-gray-300"
            >
              A private, secure, and authentic space for educated professionals to build meaningful relationships. Your journey to a lifetime of companionship starts here.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8, ease: 'easeOut' }}
              className="hero-cta flex items-center space-x-4"
            >
              {token ? (
                <Link to="/profiles">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-purple-600 text-white px-8 py-4 rounded-full font-bold text-base tracking-wide hover:bg-purple-700 transition-colors shadow-lg"
                  >
                    Browse Profiles
                  </motion.button>
                </Link>
              ) : (
                <>
                  <Link to="/register">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-purple-600 text-white px-8 py-4 rounded-full font-bold text-base tracking-wide hover:bg-purple-700 transition-colors shadow-lg"
                    >
                      GET STARTED
                    </motion.button>
                  </Link>
                  <Link to="/login">
                    <motion.button
                      whileHover={{ scale: 1.05, backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-transparent text-white px-8 py-4 rounded-full font-bold text-base tracking-wide border border-white/50 transition-colors"
                    >
                      LOGIN
                    </motion.button>
                  </Link>
                </>
              )}
            </motion.div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-20 px-4">
          <div className="max-w-5xl mx-auto text-center">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              className="text-3xl font-bold mb-12"
            >
              Your Journey to Connection
            </motion.h2>
            <div className="grid md:grid-cols-3 gap-8">
              <FeatureCard icon={<Users size={40} />} title="1. Tell Your Story" index={0}>
                Create a rich, detailed profile that goes beyond the surface. Share your passions, your dreams, and what makes you, you.
              </FeatureCard>
              <FeatureCard icon={<Zap size={40} />} title="2. Discover & Connect" index={1}>
                Explore profiles of people who share your values. Our smart matching helps you find compatibility.
              </FeatureCard>
              <FeatureCard icon={<Heart size={40} />} title="3. Build Something Real" index={2}>
                Move beyond the swipe. Have meaningful conversations and build connections that have the potential to last a lifetime.
              </FeatureCard>
            </div>
          </div>
        </section>

        {/* Success Stories Section */}
        <section className="py-20 px-4 bg-white/5">
          <div className="max-w-6xl mx-auto text-center">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              className="text-3xl font-bold mb-12"
            >
              Stories from Life-Time
            </motion.h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <StoryCard
                image="https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
                quote="We connected over our shared love for hiking and haven't stopped exploring since."
                author="Alex & Sam"
                index={0}
              />
              <StoryCard
                image="https://images.pexels.com/photos/1499327/pexels-photo-1499327.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
                quote="I never thought I'd find someone who loved old movies as much as I do. Thank you, Life-Time!"
                author="Maria"
                index={1}
              />
              <StoryCard
                image="https://images.pexels.com/photos/1559486/pexels-photo-1559486.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
                quote="It started with a message about a book and turned into a life-long conversation."
                author="David"
                index={2}
              />
            </div>
          </div>
        </section>

        <PricingPage />

        <FaqsPage />

        {/* Final CTA Section */}
        <section className="py-20 px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              className="text-4xl font-bold mb-4"
            >
              Ready to Write Your Next Chapter?
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ delay: 0.2 }}
              className="text-lg mb-8 text-gray-600 dark:text-gray-300"
            >
              Your story is waiting to be shared. Your connection is waiting to be found.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ delay: 0.4 }}
            >
              <Link to="/register" className="inline-block">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  animate={{
                    scale: [1, 1.02, 1],
                    transition: {
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    },
                  }}
                  className="bg-purple-600 text-white px-10 py-5 rounded-full hover:bg-purple-700 text-xl font-bold"
                >
                  Start Your Story Today
                </motion.button>
              </Link>
            </motion.div>
          </div>
        </section>
      </main>
    </>
  );
};

export default Home;