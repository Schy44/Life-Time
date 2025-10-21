import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const faqs = [
  {
    q: 'WHAT MAKES LIFE TIME DIFFERENT?',
    a: 'Transparent pricing with no hidden fees. Admin-controlled verification prevents fraud. Inclusive platform welcoming all communities. User-controlled privacy with permission-based access.',
  },
  {
    q: 'HOW SECURE IS MY DATA?',
    a: 'End-to-end encrypted data communication. Profiles remain completely hidden until you approve access requests. Verification process protects against fake profiles.',
  },
  {
    q: 'WHO CAN SEE MY PROFILE?',
    a: 'Only users whose profile requests you approve. Each profile view requires admin verification and a small fee, ensuring genuine interest.',
  },
  {
    q: 'WHAT ARE THE COSTS?',
    a: 'One-time verification fee for blue verified badge. Small fixed fee per profile access request. Optional premium subscription available. No hidden charges.',
  },
  {
    q: 'WHAT IF REQUEST IS REJECTED?',
    a: 'Full refund of fees/points to your wallet. Credits can be used for future profile requests. No loss of money for rejected requests.',
  },
  {
    q: 'HOW DO I COMMUNICATE?',
    a: 'Direct messaging available only after mutual profile access approval. All conversations are encrypted for privacy. Built-in reporting system.',
  },
  {
    q: 'CAN I PAUSE OR DELETE?',
    a: 'Temporary pause maintains your data while hiding your profile. Permanent deletion removes all data within 30 days. Reactivation possible during pause.',
  },
  {
    q: 'WHO USES LIFE TIME?',
    a: 'Educated professionals seeking serious relationships. Diaspora communities maintaining cultural connections. Privacy-conscious individuals.',
  },
];

const FaqsPage = () => {
  const [selectedFaq, setSelectedFaq] = useState(0);

  return (
    <div className="min-h-screen bg-transparent relative overflow-hidden py-12 px-6 md:py-20 md:px-12">
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Top Section */}
        <div className="mb-16 md:mb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-8"
          >
            <div className="flex-1">
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-none">
                FAQs —<br />
                MOST ASKED<br />
                QUESTIONS.
              </h1>
            </div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="md:text-right"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-purple-600 text-white px-6 py-3 rounded-full font-bold text-sm tracking-wide hover:bg-purple-700 transition-colors"
              >
                JOIN NOW
              </motion.button>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="h-1 bg-black origin-left"
          />
        </div>

        {/* Main FAQ Section */}
        <div className="grid lg:grid-cols-[1fr,1.2fr] gap-8 md:gap-12">
          {/* Questions List */}
          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <motion.button
                key={idx}
                onClick={() => setSelectedFaq(idx)}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                whileHover={{ scale: 1.02, x: 5 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full text-left px-6 py-4 rounded-full font-bold text-sm md:text-base tracking-wide transition-all ${selectedFaq === idx
                  ? 'bg-purple-600 text-white shadow-xl'
                  : 'bg-gray-100 text-black hover:bg-gray-200'
                  }`}
              >
                <span className="opacity-50 mr-3 text-xs">
                  {String(idx + 1).padStart(2, '0')}
                </span>
                {faq.q}
              </motion.button>
            ))}
          </div>

          {/* Answer Display */}
          <div className="lg:sticky lg:top-8 h-fit">
            <>
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedFaq}
                  initial={{ opacity: 0, y: 20, x: 20 }}
                  animate={{ opacity: 1, y: 0, x: 0 }}
                  exit={{ opacity: 0, y: -20, x: -20 }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                  className="bg-black/50 text-white p-8 md:p-12 rounded-3xl"
                >
                  <div className="mb-6">
                    <span className="text-purple-400 font-bold text-sm tracking-widest">
                      ANSWER {String(selectedFaq + 1).padStart(2, '0')}
                    </span>
                  </div>

                  <motion.h3
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="text-2xl md:text-3xl font-bold mb-6 leading-tight"
                  >
                    {faqs[selectedFaq].q}
                  </motion.h3>

                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-gray-300 leading-relaxed text-base md:text-lg"
                  >
                    {faqs[selectedFaq].a}
                  </motion.p>

                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    className="h-1 bg-purple-500 mt-8 origin-left"
                  />
                </motion.div>
              </AnimatePresence>

              {/* Mobile Helper Text */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-center text-xs text-gray-400 mt-4 font-bold tracking-wide"
              >
                TAP ANY QUESTION TO VIEW ANSWER
              </motion.p>
            </>
          </div>
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-20 text-center"
        >
          <h3 className="text-2xl md:text-3xl font-bold mb-4">
            STILL HAVE QUESTIONS?
          </h3>
          <p className="text-gray-600 mb-6 font-semibold">
            Our support team is ready to help you 24/7
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-purple-600 text-white px-10 py-4 rounded-full font-bold text-base tracking-wide hover:bg-purple-700 transition-colors shadow-lg"
          >
            CONTACT SUPPORT
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
};

export default FaqsPage;
