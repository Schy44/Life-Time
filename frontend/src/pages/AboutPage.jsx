import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import AnimatedBackground from '../components/AnimatedBackground';
import { Shield, Users, Globe, Target, Award, Clock, ArrowRight } from 'lucide-react';

const AboutPage = () => {
    const fadeInUp = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <>
            <AnimatedBackground />
            <main className="relative min-h-screen bg-gray-50 dark:bg-gray-900">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">

                    {/* Hero Section */}
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={fadeInUp}
                        className="text-center mb-20"
                    >
                        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                            About Life-Time
                        </h1>

                        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                            Connecting hearts across the globe.
                        </p>
                    </motion.div>

                    {/* Mission Statement */}
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.3 }}
                        variants={fadeInUp}
                        className="mb-16"
                    >
                        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 md:p-10 shadow-sm border border-gray-200 dark:border-gray-700">
                            <div className="flex items-start gap-4 mb-4">
                                <div className="flex-shrink-0 w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                                    <Target className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Our Mission</h2>
                                </div>
                            </div>
                            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                                At Life-Time, we believe that everyone deserves to find genuine connections that can last a lifetime.
                                We've created a platform where educated professionals from around the world can meet, connect, and build
                                meaningful relationships in a safe, respectful, and authentic environment. Our mission is to bridge distances,
                                cultures, and hearts by providing a trusted space for people seeking serious, committed relationships.
                            </p>
                        </div>
                    </motion.div>

                    {/* Core Values */}
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.2 }}
                        transition={{ staggerChildren: 0.1 }}
                        className="mb-16"
                    >
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
                            What We Stand For
                        </h2>

                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[
                                {
                                    icon: <Shield className="w-6 h-6" />,
                                    title: "Privacy & Security",
                                    description: "Your data is protected with industry-leading security. You control who sees your profile."
                                },
                                {
                                    icon: <Users className="w-6 h-6" />,
                                    title: "Authentic Connections",
                                    description: "We foster genuine relationships built on shared values, interests, and mutual respect."
                                },
                                {
                                    icon: <Globe className="w-6 h-6" />,
                                    title: "Global Community",
                                    description: "Connect with educated professionals from diverse backgrounds across the world."
                                },
                                {
                                    icon: <Award className="w-6 h-6" />,
                                    title: "Quality First",
                                    description: "We prioritize meaningful matches over quantity, focusing on compatibility."
                                }
                            ].map((value, index) => (
                                <motion.div
                                    key={index}
                                    variants={fadeInUp}
                                    className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
                                >
                                    <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center mb-4">
                                        <div className="text-purple-600 dark:text-purple-400">
                                            {value.icon}
                                        </div>
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                        {value.title}
                                    </h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                                        {value.description}
                                    </p>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Our Story & Stats */}
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.3 }}
                        variants={fadeInUp}
                        className="mb-16"
                    >
                        <div className="grid md:grid-cols-5 gap-8">
                            {/* Story */}
                            <div className="md:col-span-3">
                                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Our Story</h2>
                                <div className="space-y-4 text-gray-600 dark:text-gray-300 leading-relaxed">
                                    <p>
                                        Life-Time was born from a simple observation: finding a genuine life partner in today's fast-paced,
                                        digital world can be overwhelming. Traditional matchmaking felt outdated, while typical dating apps
                                        focused on casual connections rather than lasting relationships.
                                    </p>
                                    <p>
                                        We envisioned something different — a platform that combines modern technology with traditional values
                                        of commitment and authenticity. A space where educated professionals could connect based on genuine
                                        compatibility, shared goals, and mutual respect.
                                    </p>
                                    <p>
                                        Today, Life-Time serves thousands of members worldwide, helping them find meaningful connections that
                                        transcend borders, backgrounds, and cultures.
                                    </p>
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="md:col-span-2">
                                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                                    <div className="space-y-6">
                                        {[
                                            { icon: <Users className="w-5 h-5" />, label: "10M+", text: "Verified Profiles" },
                                            { icon: <Users className="w-5 h-5" />, label: "500K+", text: "Successful Matches" },
                                            { icon: <Globe className="w-5 h-5" />, label: "150+", text: "Countries" },
                                            { icon: <Clock className="w-5 h-5" />, label: "24/7", text: "Support Available" }
                                        ].map((stat, idx) => (
                                            <motion.div
                                                key={idx}
                                                initial={{ opacity: 0, x: 20 }}
                                                whileInView={{ opacity: 1, x: 0 }}
                                                transition={{ delay: idx * 0.1 }}
                                                className="flex items-center gap-3"
                                            >
                                                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center text-purple-600 dark:text-purple-400">
                                                    {stat.icon}
                                                </div>
                                                <div>
                                                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{stat.label}</div>
                                                    <div className="text-xs text-gray-500 dark:text-gray-400">{stat.text}</div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* How It Works */}
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.2 }}
                        transition={{ staggerChildren: 0.1 }}
                        className="mb-16"
                    >
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
                            How It Works
                        </h2>

                        <div className="grid md:grid-cols-3 gap-6">
                            {[
                                {
                                    step: "1",
                                    title: "Create Your Profile",
                                    description: "Share your story, values, and what you're looking for in a partner."
                                },
                                {
                                    step: "2",
                                    title: "Discover Matches",
                                    description: "Browse profiles of compatible matches based on your preferences and values."
                                },
                                {
                                    step: "3",
                                    title: "Connect & Build",
                                    description: "Send connection requests and start conversations at your own pace."
                                }
                            ].map((item, index) => (
                                <motion.div
                                    key={index}
                                    variants={fadeInUp}
                                    className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
                                >
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-8 h-8 bg-purple-600 dark:bg-purple-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                                            {item.step}
                                        </div>
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                            {item.title}
                                        </h3>
                                    </div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                                        {item.description}
                                    </p>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>

                    {/* CTA Section */}
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.5 }}
                        variants={fadeInUp}
                        className="text-center"
                    >
                        <div className="bg-white dark:bg-gray-800 rounded-2xl p-10 shadow-sm border border-gray-200 dark:border-gray-700">
                            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                                Ready to Find Your Perfect Match?
                            </h2>
                            <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
                                Join thousands of people who have found meaningful connections on Life-Time.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Link to="/register">
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="bg-purple-600 text-white px-8 py-3 rounded-lg font-semibold shadow-sm hover:bg-purple-700 transition-colors flex items-center gap-2"
                                    >
                                        Get Started Free
                                        <ArrowRight className="w-4 h-4" />
                                    </motion.button>
                                </Link>
                                <Link to="/profiles">
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-8 py-3 rounded-lg font-semibold shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors border border-gray-300 dark:border-gray-600"
                                    >
                                        Browse Profiles
                                    </motion.button>
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </main>
        </>
    );
};

export default AboutPage;
