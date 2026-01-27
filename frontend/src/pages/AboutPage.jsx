import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import AnimatedBackground from '../components/AnimatedBackground';
import Footer from '../components/Footer';
import { Shield, Eye, Zap, Users, AlertCircle, Search, Target, Heart, Sparkles } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const AboutPage = () => {
    const storyRef = useRef(null);

    useEffect(() => {
        if (storyRef.current) {
            gsap.to(storyRef.current, {
                y: -20,
                scrollTrigger: {
                    trigger: storyRef.current,
                    start: 'top bottom',
                    end: 'bottom top',
                    scrub: 2,
                },
            });
        }
    }, []);

    return (
        <>
            <AnimatedBackground />
            <main className="relative w-full min-h-screen">

                {/* Hero Section */}
                <section className="relative min-h-[70vh] flex flex-col justify-center items-center px-6 md:px-12 pt-32 pb-20 bg-gradient-to-b from-purple-50/50 to-white dark:from-gray-900 dark:to-gray-900">
                    <div className="container mx-auto max-w-6xl text-center">
                        <motion.h3
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                            className="text-sm uppercase tracking-wider text-purple-600 dark:text-purple-400 font-semibold mb-4 wow fadeInUp"
                        >
                            about us
                        </motion.h3>

                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="text-5xl md:text-7xl font-bold mb-8 text-gray-900 dark:text-white leading-tight wow fadeInUp"
                            data-wow-delay="0.2s"
                        >
                            Be Real. Be Seen. <br />
                            <span className="text-purple-600 dark:text-purple-400">Be Chosen for Who You Are.</span>
                        </motion.h1>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.4 }}
                            className="flex flex-wrap justify-center gap-6 mt-12 wow fadeInUp"
                            data-wow-delay="0.4s"
                        >
                            <div className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 rounded-full shadow-sm border border-gray-200 dark:border-gray-700 hover:scale-110 hover:shadow-md transition-all duration-300 cursor-pointer">
                                <Shield className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                <span className="font-medium text-gray-700 dark:text-gray-300">Trust</span>
                            </div>
                            <div className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 rounded-full shadow-sm border border-gray-200 dark:border-gray-700 hover:scale-110 hover:shadow-md transition-all duration-300 cursor-pointer">
                                <Eye className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                <span className="font-medium text-gray-700 dark:text-gray-300">Transparency</span>
                            </div>
                            <div className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 rounded-full shadow-sm border border-gray-200 dark:border-gray-700 hover:scale-110 hover:shadow-md transition-all duration-300 cursor-pointer">
                                <Zap className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                <span className="font-medium text-gray-700 dark:text-gray-300">No Fakeness</span>
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* Our Story Section - Condensed */}
                <section className="py-24 px-6 md:px-12 bg-white dark:bg-gray-900">
                    <div className="container mx-auto max-w-6xl">
                        <div className="text-center mb-16">
                            <motion.h3
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                className="text-sm uppercase tracking-wider text-purple-600 dark:text-purple-400 font-semibold mb-4"
                            >
                                our story
                            </motion.h3>
                            <motion.h2
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.1 }}
                                className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white"
                            >
                                Building a <span className="text-purple-600 dark:text-purple-400">trustworthy</span> path to love
                            </motion.h2>
                        </div>

                        <motion.div
                            ref={storyRef}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                            className="max-w-4xl mx-auto"
                        >
                            <div className="space-y-8 text-center">
                                <p className="text-xl text-gray-700 dark:text-gray-300 leading-relaxed">
                                    As we stepped into adulthood, we all started searching for something real — someone who feels like home. But the path to love quickly became a maze of half-truths, inflated fees, and hidden intentions.
                                </p>

                                {/* Highlighted Quote */}
                                <div className="relative my-12 p-8 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-2xl border-l-4 border-purple-600 dark:border-purple-400 shadow-lg hover:shadow-xl transition-shadow duration-300">
                                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-purple-600 dark:bg-purple-400 rounded-full flex items-center justify-center shadow-lg">
                                        <span className="text-white dark:text-gray-900 text-2xl font-bold">"</span>
                                    </div>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white italic">
                                        People weren't struggling to find love… They were struggling to find a trustworthy way to look for it.
                                    </p>
                                </div>

                                <p className="text-xl text-gray-700 dark:text-gray-300 leading-relaxed">
                                    So we built the platform we wished existed — where every profile is real, every process is transparent, and every connection is honest.
                                </p>
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* Mission, Vision, Values Section */}
                <section className="py-24 px-6 md:px-12 bg-gray-50 dark:bg-gray-800/50">
                    <div className="container mx-auto max-w-7xl">
                        <div className="text-center mb-16">
                            <motion.h3
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                className="text-sm uppercase tracking-wider text-purple-600 dark:text-purple-400 font-semibold mb-4"
                            >
                                our approach
                            </motion.h3>
                            <motion.h2
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.1 }}
                                className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white"
                            >
                                Guided by <span className="text-purple-600 dark:text-purple-400">purpose</span> and <span className="text-purple-600 dark:text-purple-400">values</span>
                            </motion.h2>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8">
                            {/* Mission Card */}
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6 }}
                                className="group text-center"
                            >
                                <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:shadow-xl hover:scale-105 transition-all duration-300 p-8">
                                    {/* Circular Icon Badge - Black */}
                                    <div className="mx-auto mb-6 w-24 h-24 rounded-full border-4 border-gray-900 dark:border-white flex items-center justify-center">
                                        <Heart className="w-12 h-12 text-gray-900 dark:text-white" strokeWidth={2} />
                                    </div>

                                    {/* Content */}
                                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                                        OUR MISSION
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                                        To create a transparent platform where authentic connections flourish through trust and honesty.
                                    </p>
                                </div>
                            </motion.div>

                            {/* Vision Card */}
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: 0.2 }}
                                className="group text-center"
                            >
                                <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:shadow-xl hover:scale-105 transition-all duration-300 p-8">
                                    {/* Circular Icon Badge - Black */}
                                    <div className="mx-auto mb-6 w-24 h-24 rounded-full border-4 border-gray-900 dark:border-white flex items-center justify-center">
                                        <Eye className="w-12 h-12 text-gray-900 dark:text-white" strokeWidth={2} />
                                    </div>

                                    {/* Content */}
                                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                                        OUR VISION
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                                        A world where finding love is built on clarity, not confusion — where truth is the foundation of every relationship.
                                    </p>
                                </div>
                            </motion.div>

                            {/* Values Card */}
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: 0.4 }}
                                className="group text-center"
                            >
                                <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:shadow-xl hover:scale-105 transition-all duration-300 p-8">
                                    {/* Circular Icon Badge - Black */}
                                    <div className="mx-auto mb-6 w-24 h-24 rounded-full border-4 border-gray-900 dark:border-white flex items-center justify-center">
                                        <Shield className="w-12 h-12 text-gray-900 dark:text-white" strokeWidth={2} />
                                    </div>

                                    {/* Content */}
                                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                                        OUR VALUES
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                                        Integrity, transparency, authenticity, and respect — the pillars that guide every decision we make.
                                    </p>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </section>

                {/* Problem vs Solution Section - Editorial Style */}
                <section className="py-20 px-6 md:px-12 bg-white dark:bg-gray-900">
                    <div className="container mx-auto max-w-7xl">
                        {/* Header */}
                        <div className="text-center mb-20">
                            <motion.h3
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                className="text-xs uppercase tracking-[0.3em] text-gray-500 dark:text-gray-400 font-light mb-6"
                            >
                                The Challenge & Our Answer
                            </motion.h3>
                            <motion.h2
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.2 }}
                                className="text-5xl md:text-7xl font-bold text-gray-900 dark:text-white mb-8 leading-tight"
                            >
                                Understanding the problem<br />helped us build the<br />right solution
                            </motion.h2>
                        </div>

                        {/* Problem-Solution Pairs */}
                        <div className="space-y-24">
                            {/* Section Labels - Show once at top */}
                            <div className="grid lg:grid-cols-2 gap-12 mb-8">
                                <div className="flex items-center gap-4">
                                    <div className="inline-block px-4 py-2 bg-red-100 dark:bg-red-900/20 rounded-full">
                                        <span className="text-xs uppercase tracking-widest text-red-600 dark:text-red-400 font-medium">Problem</span>
                                    </div>
                                    <div className="flex-1 h-px bg-gray-300 dark:bg-gray-700" />
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="inline-block px-4 py-2 bg-purple-100 dark:bg-purple-900/20 rounded-full">
                                        <span className="text-xs uppercase tracking-widest text-purple-600 dark:text-purple-400 font-medium">Solution</span>
                                    </div>
                                    <div className="flex-1 h-px bg-gray-300 dark:bg-gray-700" />
                                </div>
                            </div>

                            {/* Pair 1: The Void → Real People */}
                            <div className="grid lg:grid-cols-2 gap-12 items-center">
                                {/* Problem */}
                                <motion.div
                                    initial={{ opacity: 0, x: -50 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true, margin: "-100px" }}
                                    transition={{ duration: 0.8 }}
                                    className="space-y-6"
                                >
                                    <h3 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white leading-tight">
                                        The Void
                                    </h3>
                                    <div className="w-20 h-px bg-gray-300 dark:bg-gray-700" />
                                    <p className="text-xl text-gray-600 dark:text-gray-400 leading-relaxed">
                                        A shortage of meaningful, compatible matches — leaving people unsure where to look.
                                    </p>
                                </motion.div>

                                {/* Solution */}
                                <motion.div
                                    initial={{ opacity: 0, x: 50 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true, margin: "-100px" }}
                                    transition={{ duration: 0.8, delay: 0.2 }}
                                    className="space-y-6 solution-text"
                                >
                                    <h3 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white leading-tight">
                                        Real People,<br />Real Intentions
                                    </h3>
                                    <div className="w-20 h-px bg-gray-300 dark:bg-gray-700" />
                                    <p className="text-xl text-gray-600 dark:text-gray-400 leading-relaxed">
                                        Authentic profiles, honest expression — a community built on being true, not perfect.
                                    </p>
                                </motion.div>
                            </div>

                            {/* Divider */}
                            <motion.div
                                initial={{ scaleX: 0 }}
                                whileInView={{ scaleX: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 1 }}
                                className="w-full h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-700 to-transparent"
                            />

                            {/* Pair 2: The Fog → Transparent */}
                            <div className="grid lg:grid-cols-2 gap-12 items-center">
                                {/* Problem */}
                                <motion.div
                                    initial={{ opacity: 0, x: -50 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true, margin: "-100px" }}
                                    transition={{ duration: 0.8 }}
                                    className="space-y-6 problem-text"
                                >
                                    <h3 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white leading-tight">
                                        The Fog
                                    </h3>
                                    <div className="w-20 h-px bg-gray-300 dark:bg-gray-700" />
                                    <p className="text-xl text-gray-600 dark:text-gray-400 leading-relaxed">
                                        No clarity, no transparency, and too many unanswered questions.
                                    </p>
                                </motion.div>

                                {/* Solution */}
                                <motion.div
                                    initial={{ opacity: 0, x: 50 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true, margin: "-100px" }}
                                    transition={{ duration: 0.8, delay: 0.2 }}
                                    className="space-y-6 solution-text"
                                >
                                    <h3 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white leading-tight">
                                        Transparent<br />From Day One
                                    </h3>
                                    <div className="w-20 h-px bg-gray-300 dark:bg-gray-700" />
                                    <p className="text-xl text-gray-600 dark:text-gray-400 leading-relaxed">
                                        No mystery, no hidden details. Clarity is the default, not a feature.
                                    </p>
                                </motion.div>
                            </div>

                            {/* Divider */}
                            <motion.div
                                initial={{ scaleX: 0 }}
                                whileInView={{ scaleX: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 1 }}
                                className="w-full h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-700 to-transparent"
                            />

                            {/* Pair 3: The Drain → Precision Discovery */}
                            <div className="grid lg:grid-cols-2 gap-12 items-center">
                                {/* Problem */}
                                <motion.div
                                    initial={{ opacity: 0, x: -50 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true, margin: "-100px" }}
                                    transition={{ duration: 0.8 }}
                                    className="space-y-6 problem-text"
                                >
                                    <h3 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white leading-tight">
                                        The Drain
                                    </h3>
                                    <div className="w-20 h-px bg-gray-300 dark:bg-gray-700" />
                                    <p className="text-xl text-gray-600 dark:text-gray-400 leading-relaxed">
                                        Wasted time, wasted money, and energy spent on connections that were never genuine.
                                    </p>
                                </motion.div>

                                {/* Solution */}
                                <motion.div
                                    initial={{ opacity: 0, x: 50 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true, margin: "-100px" }}
                                    transition={{ duration: 0.8, delay: 0.2 }}
                                    className="space-y-6"
                                >
                                    <h3 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white leading-tight">
                                        Precision<br />Discovery
                                    </h3>
                                    <div className="w-20 h-px bg-gray-300 dark:bg-gray-700" />
                                    <p className="text-xl text-gray-600 dark:text-gray-400 leading-relaxed">
                                        Powerful filters and thoughtful matching help you explore people who genuinely align with what you want — and who you are.
                                    </p>
                                </motion.div>
                            </div>
                        </div>

                        {/* Closing Statement */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                            className="text-center mt-24"
                        >
                            <p className="text-2xl md:text-3xl font-bold text-gray-600 dark:text-gray-400 italic max-w-3xl mx-auto leading-relaxed">
                                "Every challenge we identified became a blueprint for the solution we built."
                            </p>
                        </motion.div>
                    </div>
                </section>

                {/* Founders Section */}
                <section className="py-24 px-6 md:px-12 bg-gray-50 dark:bg-gray-800/50">
                    <div className="container mx-auto max-w-6xl">
                        <div className="text-center mb-16">
                            <motion.h3
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                className="text-sm uppercase tracking-wider text-purple-600 dark:text-purple-400 font-semibold mb-4"
                            >
                                our team
                            </motion.h3>
                            <motion.h2
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.1 }}
                                className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white"
                            >
                                Meet the <span className="text-purple-600 dark:text-purple-400">Founders</span>
                            </motion.h2>
                        </div>

                        <div className="grid md:grid-cols-2 gap-10 max-w-4xl mx-auto">
                            {[
                                { name: "Alex Johnson", role: "Co-Founder & CEO", desc: "Passionate about building authentic connections and creating transparent platforms that prioritize user trust above all else." },
                                { name: "Sarah Mitchell", role: "Co-Founder & CTO", desc: "Dedicated to leveraging technology to solve real-world problems and ensure every user has a genuine, secure experience." }
                            ].map((founder, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.15 }}
                                    className="group"
                                >
                                    <div className="p-8 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700/50 hover:shadow-xl hover:scale-105 transition-all duration-300">
                                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                            {founder.name}
                                        </h3>
                                        <p className="text-sm font-semibold text-purple-600 dark:text-purple-400 mb-4 uppercase tracking-wide">
                                            {founder.role}
                                        </p>
                                        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                                            {founder.desc}
                                        </p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section >

                <Footer />
            </main >
        </>
    );
};

export default AboutPage;
