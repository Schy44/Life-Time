import React, { useState } from 'react';
import { motion } from 'framer-motion';
import GlassCard from './GlassCard';
import { CheckCircle, XCircle, Star } from 'lucide-react';

const plans = [
  {
    title: 'Free Plan',
    subtitle: 'No Membership Required',
    icon: '🆓',
    description: 'Perfect for beginners exploring the platform.',
    price: '$5',
    price_detail: 'per request',
    features: [
      { text: 'No membership fee', included: true },
      { text: 'Send connection requests', included: true },
      { text: 'Admin verification badge', included: false },
      { text: 'Basic profile visibility', included: true },
    ],
    cta: 'Start for Free',
    featured: false,
  },
  {
    title: 'Regular Plan',
    subtitle: 'Verified Member',
    icon: '💼',
    description: 'Ideal for users seeking verified, genuine connections.',
    price: '$35',
    price_detail: 'for 10 requests',
    features: [
      { text: 'Membership with Admin Verification Badge', included: true },
      { text: 'Send up to 10 connection requests', included: true },
      { text: 'Verified profile increases trust', included: true },
      { text: 'Priority support from the admin team', included: true },
    ],
    cta: 'Choose Regular',
    featured: false,
  },
  {
    title: 'Premium Plan',
    subtitle: 'Unlimited Access (3 Months)',
    icon: '👑',
    description: 'For serious members who want maximum exposure.',
    price: '$99',
    price_detail: 'for 3 months',
    features: [
      { text: 'Full membership with Admin Verification Badge', included: true },
      { text: 'Unlimited connection requests', included: true },
      { text: 'Premium profile visibility', included: true },
      { text: 'Dedicated support & faster approvals', included: true },
    ],
    cta: 'Go Premium',
    featured: true,
  },
];

const Feature = ({ included, text }) => (
  <li className="flex items-center space-x-3 text-gray-700 dark:text-gray-300">
    {included ? (
      <CheckCircle className="flex-shrink-0 w-5 h-5 text-green-500" />
    ) : (
      <XCircle className="flex-shrink-0 w-5 h-5 text-red-500" />
    )}
    <span>{text}</span>
  </li>
);

const PricingCard = ({ plan, index, selectedPlan, setSelectedPlan }) => {
  const isSelected = selectedPlan === index;

  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { delay: index * 0.1, duration: 0.5, ease: "easeOut" } 
    },
    hover: { scale: 1.03, boxShadow: "0 10px 20px rgba(0,0,0,0.2)" },
    tap: { scale: 0.98 },
  };

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      whileHover="hover"
      whileTap="tap"
      viewport={{ once: true, amount: 0.3 }}
      className={`h-full w-full relative`}
    >
      {plan.featured && (
        <motion.div 
          className="absolute -top-4 -right-4 p-2 bg-purple-600 rounded-full shadow-lg"
          animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1]}}
          transition={{ repeat: Infinity, duration: 3 }}
        >
          <Star className="text-white w-6 h-6" />
        </motion.div>
      )}
      <GlassCard className={`flex flex-col h-full p-6 rounded-2xl border-2 
        ${plan.featured ? 'border-purple-500' : 'border-gray-300 dark:border-white/20'}
        ${isSelected ? 'ring-4 ring-purple-500' : ''}
      `}>
        <div className="mb-4 text-center">
          <h3 className="text-3xl font-bold mb-2 text-gray-800 dark:text-white">
            {plan.title}
          </h3>
          <p className="text-md text-gray-600 dark:text-gray-300">{plan.subtitle}</p>
        </div>

        <p className="text-gray-700 dark:text-gray-300 text-center mb-6 h-20">{plan.description}</p>
        
        <div className="mb-8 text-center">
          <span className="text-5xl font-extrabold text-gray-800 dark:text-white">{plan.price}</span>
          <span className="text-lg font-medium text-gray-600 dark:text-gray-300">/{plan.price_detail}</span>
        </div>

        <ul className="space-y-3 mb-10 text-left flex-grow">
          {plan.features.map((feature, i) => (
            <Feature key={i} {...feature} />
          ))}
        </ul>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setSelectedPlan(index)}
          className={`w-full mt-auto font-bold py-3 px-6 rounded-lg transition-colors duration-300 ease-in-out
            ${isSelected
              ? 'bg-purple-700 text-white shadow-lg'
              : plan.featured
              ? 'bg-purple-600 text-white hover:bg-purple-700 shadow-lg'
              : 'bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-white/20 dark:text-white dark:hover:bg-white/30'
            }`}
        >
          {plan.cta}
        </motion.button>
      </GlassCard>
    </motion.div>
  );
};

const PricingPage = () => {
  const [selectedPlan, setSelectedPlan] = useState(null);

  return (
    <section className="py-20 px-4 bg-transparent">
      <div className="max-w-6xl mx-auto text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-800 dark:text-white mb-4"
        >
          Choose Your Journey
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ delay: 0.2 }}
          className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-12"
        >
          Select a plan that aligns with your aspirations and unlock a world of meaningful connections.
        </motion.p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
          {plans.map((plan, index) => (
            <PricingCard 
              key={index} 
              plan={plan} 
              index={index} 
              selectedPlan={selectedPlan}
              setSelectedPlan={setSelectedPlan}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingPage;
