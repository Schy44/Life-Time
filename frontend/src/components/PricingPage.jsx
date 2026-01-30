import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import GlassCard from './GlassCard';
import { CheckCircle, XCircle, Star, Zap, Loader2, Clock } from 'lucide-react';
import apiClient from '../lib/api';
import { getProfile } from '../services/api';
import { useQuery } from '@tanstack/react-query';
import PaymentMethodModal from './PaymentMethodModal';
import { useNavigate } from 'react-router-dom';

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

const PricingCard = ({ plan, selectedPlan, onSelect, isFeatured: isFeaturedProp }) => {
  const isSelected = selectedPlan === plan.slug;
  const isFeatured = isFeaturedProp || plan.slug === 'bundle_10'; // Updated logic

  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" }
    },
    hover: { scale: 1.03, boxShadow: "0 10px 20px rgba(0,0,0,0.2)" },
    tap: { scale: 0.98 },
  };

  // Parse features if JSON string or object
  // Parse features using FEATURE_MAPPING
  let featuresList = [];
  if (plan.features) {
    if (typeof plan.features === 'object') {
      featuresList = Object.entries(plan.features)
        .map(([key, value]) => {
          // Skip internal feature flags if we want, or map all
          const mapping = FEATURE_MAPPING[key];
          if (mapping) {
            // If boolean false, skip? Or show as "Not Included" (X)?
            // Feature component handles `included`.
            const text = mapping.format ? `${mapping.label}: ${mapping.format(value)}` : `${mapping.label}`;
            // Special case for Booleans where we want simple "Verified Badge" vs "No Verified Badge"
            // Actually `Feature` component takes `text` and `included`.
            // If value is boolean false, we might want to say "Verified Badge" but set included=false

            let displayText = mapping.label;
            let isIncluded = true;

            if (typeof value === 'boolean') {
              isIncluded = value;
            } else if (value === 0 || value === 'Standard') {
              // Maybe mark 'Standard' visibility as not 'included' in the 'premium' sense?
              // Or just show it.
              displayText = `${mapping.label}: ${value}`;
            } else {
              displayText = `${mapping.label}: ${value}`;
            }

            // Override for specific clean display in card vs table
            if (key === 'verified_badge') displayText = 'Verified Badge';
            if (key === 'connection_requests') displayText = `${value === 'Unlimited' ? 'Unlimited' : value} Connection Requests`;
            if (key === 'profile_visibility') displayText = `${value} Visibility`;
            if (key === 'see_who_viewed_me') displayText = 'See Who Viewed Me';
            if (key === 'ad_free') displayText = 'Ad-Free';

            return { text: displayText, included: isIncluded };
          }
          // Fallback for unmapped
          return { text: key.replace(/_/g, ' '), included: !!value };
        })
        // Sort by importance?
        .sort((a, b) => b.included - a.included); // Show checked items first
    }
  }

  // Enhanced Manual Features for new plan types
  if (featuresList.length === 0 || plan.features?.type) {
    if (plan.slug === 'activation') {
      featuresList = [
        { text: 'Profile Visibility to All Users', included: true },
        { text: 'Send Connection Requests', included: true },
        { text: 'Basic Search Access', included: true },
        { text: 'Verified Badge (after ID check)', included: true },
      ];
    } else if (plan.features?.type === 'bundle') {
      featuresList = [
        { text: `Includes ${plan.credit_amount} Profile Unlocks`, included: true },
        { text: 'View Full Bio & Family Details', included: true },
        { text: 'Access to Biodata PDF Download', included: true },
        { text: 'Permanent Credits (No Expiry)', included: true },
      ];
      if (plan.features?.discount) {
        featuresList.push({ text: `Save ${plan.features.discount} vs Single`, included: true });
      }
    }
  }

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
      {isFeatured && (
        <motion.div
          className="absolute -top-4 -right-4 p-2 bg-purple-600 rounded-full shadow-lg"
          animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 3 }}
        >
          <Star className="text-white w-6 h-6" />
        </motion.div>
      )}
      <GlassCard className={`flex flex-col h-full p-6 rounded-2xl border-2 
        ${isFeatured ? 'border-purple-500' : 'border-gray-300 dark:border-white/20'}
        ${isSelected ? 'ring-4 ring-purple-500' : ''}
      `}>
        <div className="mb-4 text-center">
          <h3 className="text-2xl font-bold mb-2 text-gray-800 dark:text-white">
            {plan.name}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 h-10">{plan.description}</p>
        </div>

        <div className="mb-8 text-center">
          <span className="text-5xl font-extrabold text-gray-800 dark:text-white">
            {plan.price_bdt === 0 ? 'Free' : `৳${plan.price_bdt}`}
          </span>
          <p className="text-sm text-gray-500 mt-2">
            approx. ${(plan.price_bdt * 0.0085).toFixed(2)} USD
          </p>
        </div>

        {plan.credit_amount > 0 && (
          <div className="mb-6 bg-purple-100 dark:bg-purple-900/30 rounded-lg p-3 text-center">
            <p className="text-purple-700 dark:text-purple-300 font-bold flex items-center justify-center gap-2">
              <Zap size={16} /> +{plan.credit_amount} Credits Included
            </p>
          </div>
        )}

        <ul className="space-y-3 mb-10 text-left flex-grow">
          {featuresList.map((feature, i) => (
            <Feature key={i} {...feature} />
          ))}
        </ul>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onSelect(plan)}
          className={`w-full mt-auto font-bold py-3 px-6 rounded-lg transition-colors duration-300 ease-in-out
            ${isFeatured
              ? 'bg-purple-600 text-white hover:bg-purple-700 shadow-lg'
              : 'bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-white/20 dark:text-white dark:hover:bg-white/30'
            }`}
        >
          {plan.slug === 'activation' ? 'Activate Now' : 'Get Credits'}
        </motion.button>
      </GlassCard>
    </motion.div>
  );
};

const FEATURE_MAPPING = {
  verified_badge: { label: 'Verified Badge', format: (val) => val ? 'Included' : 'No' },
  connection_requests: { label: 'Connection Requests', format: (val) => val === 'Unlimited' ? 'Unlimited' : `${val}/mo` },
  profile_visibility: { label: 'Profile Visibility', format: (val) => val },
  see_who_viewed_me: { label: 'See Who Viewed Me', format: (val) => val ? 'Included' : 'No' },
  support: { label: 'Support', format: (val) => val },
  ad_free: { label: 'Ad-Free Experience', format: (val) => val ? 'Yes' : 'No' },
  profile_spotlight: { label: 'Profile Spotlight', format: (val) => val }
};

const ComparisonTable = ({ plans }) => {
  // Define features to compare order
  const featuresOrder = [
    'connection_requests', 'profile_visibility', 'verified_badge',
    'see_who_viewed_me', 'ad_free', 'support'
  ];

  return (
    <div className="mt-20 overflow-x-auto">
      <h3 className="text-3xl font-bold text-gray-800 dark:text-white mb-8 text-center">Compare Features</h3>
      <table className="w-full min-w-[600px] text-left border-collapse">
        <thead>
          <tr>
            <th className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 rounded-tl-xl text-gray-500 font-medium">Feature</th>
            {plans.map(plan => (
              <th key={plan.slug} className="p-4 border-b border-gray-200 dark:border-gray-700 text-center font-bold text-gray-900 dark:text-white">
                {plan.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {featuresOrder.map(key => (
            <tr key={key} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
              <td className="p-4 border-b border-gray-200 dark:border-gray-700 font-medium text-gray-700 dark:text-gray-300">
                {FEATURE_MAPPING[key]?.label || key.replace(/_/g, ' ')}
              </td>
              {plans.map(plan => {
                const val = plan.features[key];
                return (
                  <td key={`${plan.slug}-${key}`} className="p-4 border-b border-gray-200 dark:border-gray-700 text-center text-gray-600 dark:text-gray-400">
                    {FEATURE_MAPPING[key]?.format ? FEATURE_MAPPING[key].format(val) : (val ? 'Yes' : '-')}
                  </td>
                );
              })}
            </tr>
          ))}
          {/* Credit Amount Row */}
          <tr className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
            <td className="p-4 border-b border-gray-200 dark:border-gray-700 font-medium text-gray-700 dark:text-gray-300">
              Monthly Credits
            </td>
            {plans.map(plan => (
              <td key={`${plan.slug}-credits`} className="p-4 border-b border-gray-200 dark:border-gray-700 text-center text-gray-600 dark:text-gray-400">
                {plan.credit_amount > 0 ? plan.credit_amount : '-'}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
};

const CreditBundleCard = ({ title, credits, price, benefit, popular, onSelect }) => (
  <motion.div
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={() => onSelect(credits)}
    className={`cursor-pointer relative flex flex-col h-full`}
  >
    {popular && (
      <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm z-10">
        BEST VALUE
      </span>
    )}
    <GlassCard className={`p-6 rounded-xl border-2 transition-all h-full flex flex-col items-center text-center
        ${popular ? 'border-amber-500 dark:border-amber-400 bg-amber-50/10' : 'border-gray-200 dark:border-white/10 hover:border-purple-500'}
    `}>
      <div className="mb-4 p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-full text-yellow-600 dark:text-yellow-400">
        <Zap size={28} fill="currentColor" />
      </div>
      <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{title}</h4>
      <p className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">${price}</p>

      <div className="py-3 px-4 bg-black/5 dark:bg-white/5 rounded-lg w-full mb-4">
        <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">{credits}</span>
        <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">Credits</span>
      </div>

      <p className="text-sm text-gray-600 dark:text-gray-300 mt-auto">{benefit}</p>
    </GlassCard>
  </motion.div>
);

const PricingPage = () => {
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [planToBuy, setPlanToBuy] = useState(null);
  const [creditToBuy, setCreditToBuy] = useState(null);

  const { data: profile } = useQuery({
    queryKey: ['me'],
    queryFn: getProfile,
    staleTime: 1000 * 30,
    refetchOnWindowFocus: true,
  });

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await apiClient.get('/subscription/plans/');
        // Sort: Free -> Monthly -> Yearly
        // Sort: Free -> Packages by price
        const sorted = response.data.sort((a, b) => a.price_bdt - b.price_bdt);
        setPlans(sorted);
      } catch (error) {
        console.error("Failed to fetch plans", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, []);

  const handlePlanSelect = (plan) => {
    setSelectedPlan(plan.slug);
    setPlanToBuy(plan);
    setCreditToBuy(null);
    setModalType('plan');
    setShowModal(true);
  };

  const handleCreditSelect = (amount) => {
    setCreditToBuy(amount);
    setPlanToBuy(null);
    setModalType('credit');
    setShowModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-10 h-10 text-purple-600 animate-spin" />
      </div>
    );
  }

  return (
    <section className="py-20 px-4 bg-transparent">
      {showModal && (
        <PaymentMethodModal
          plan={planToBuy}
          creditAmount={creditToBuy}
          onClose={() => setShowModal(false)}
        />
      )}

      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-800 dark:text-white mb-4"
          >
            Pricing & Credits
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto"
          >
            Activate your profile to start connecting, then use credits to unlock full profile details.
          </motion.p>
        </div>

        {/* Main Plans (Activation or Subscriptions) */}
        {profile && !profile.is_activated && plans.find(p => p.slug === 'activation') && (
          <div className="max-w-md mx-auto mb-20">
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Required Activation</h3>
              <p className="text-gray-600 dark:text-gray-400">One-time payment for lifetime platform access</p>
            </div>
            <PricingCard
              plan={plans.find(p => p.slug === 'activation')}
              onSelect={handlePlanSelect}
              isFeatured={true}
            />
          </div>
        )}

        {/* Credit Bundles */}
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Choose Your Credit Bundle</h3>
            <p className="text-gray-600 dark:text-gray-400">Unlock profiles to see details of your potential matches</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.filter(p => p.slug.startsWith('bundle_')).map(plan => (
              <PricingCard
                key={plan.slug}
                plan={plan}
                selectedPlan={selectedPlan}
                onSelect={handlePlanSelect}
                isFeatured={plan.slug === 'bundle_10'}
              />
            ))}
          </div>
        </div>

        {/* Credit History Link */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="mt-16 text-center"
        >
          <button
            onClick={() => navigate('/credit-history')}
            className="inline-flex items-center gap-2 text-gray-500 hover:text-purple-500 transition-colors font-medium border-b border-gray-500/20 hover:border-purple-500/50 pb-1 group"
          >
            <Clock size={16} className="group-hover:rotate-12 transition-transform" />
            View My Credit & Transaction History
          </button>
        </motion.div>

      </div>
    </section>
  );
};



export default PricingPage;
