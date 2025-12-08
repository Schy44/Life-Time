import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Star, Users, Heart } from 'lucide-react';

const Testimonials = () => {
    const [currentIndex, setCurrentIndex] = useState(0);

    const testimonials = [
        {
            id: 1,
            name: "Sarah & Michael",
            role: "Married 2023",
            rating: 5,
            text: "We connected over our shared love for hiking and haven't stopped exploring since. Life-Time helped us find exactly what we were looking for - genuine connection based on real compatibility.",
            avatar: "https://randomuser.me/api/portraits/women/44.jpg"
        },
        {
            id: 2,
            name: "Priya Sharma",
            role: "Found Love in 2024",
            rating: 5,
            text: "The transparency and authenticity of Life-Time made all the difference. No fake profiles, no hidden agendas - just real people looking for real connections. I found my perfect match!",
            avatar: "https://randomuser.me/api/portraits/women/68.jpg"
        },
        {
            id: 3,
            name: "Alex Johnson",
            role: "Engaged 2024",
            rating: 5,
            text: "I was skeptical about online matchmaking, but Life-Time proved me wrong. The platform's focus on honesty and verified profiles gave me confidence. Met my soulmate within 3 months!",
            avatar: "https://randomuser.me/api/portraits/men/32.jpg"
        },
        {
            id: 4,
            name: "David & Emma",
            role: "Together Since 2023",
            rating: 5,
            text: "It started with a message about a book and turned into a life-long conversation. Life-Time's matching algorithm really works - we share so many interests and values!",
            avatar: "https://randomuser.me/api/portraits/men/46.jpg"
        }
    ];

    const nextTestimonial = () => {
        setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    };

    const prevTestimonial = () => {
        setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
    };

    const averageRating = 4.9;
    const totalReviews = 40;

    return (
        <section className="py-20 px-4 bg-white/5 relative overflow-hidden">
            <div className="max-w-6xl mx-auto relative z-10">
                {/* Header */}
                <div className="text-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="flex items-center justify-center gap-2 mb-4"
                    >
                        <Heart className="w-6 h-6 text-purple-600" />
                        <span className="text-sm uppercase tracking-wider text-purple-600 font-semibold">
                            Success Stories
                        </span>
                    </motion.div>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-3xl md:text-4xl font-bold mb-4 text-gray-800 dark:text-white"
                    >
                        Stories from <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">Life-Time</span>
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-gray-600 dark:text-gray-300 text-lg max-w-2xl mx-auto"
                    >
                        Real people, real connections, real love stories
                    </motion.p>
                </div>

                <div className="grid lg:grid-cols-[320px_1fr] gap-8 items-start">
                    {/* Rating Card - Bigger */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="bg-white dark:bg-white/10 backdrop-blur-lg rounded-3xl p-10 text-center shadow-2xl border border-purple-100 dark:border-white/10">
                            <div className="text-7xl font-bold text-purple-600 mb-6">
                                {averageRating}
                            </div>
                            <div className="flex justify-center gap-1 mb-4">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} className="w-6 h-6 text-purple-500" fill="currentColor" />
                                ))}
                            </div>
                            <p className="text-gray-500 dark:text-gray-400 text-sm mb-8">
                                Based on {totalReviews}+ reviews
                            </p>
                            <div className="flex items-center justify-center gap-2 mb-6">
                                <Users className="w-5 h-5 text-purple-600" />
                                <h3 className="text-gray-700 dark:text-white font-semibold text-base">
                                    Join thousands of happy couples
                                </h3>
                            </div>
                            <div className="flex justify-center -space-x-3">
                                {testimonials.slice(0, 4).map((testimonial, i) => (
                                    <img
                                        key={i}
                                        src={testimonial.avatar}
                                        alt={testimonial.name}
                                        className="w-12 h-12 rounded-full border-2 border-white dark:border-purple-500/50"
                                    />
                                ))}
                            </div>
                        </div>
                    </motion.div>

                    {/* Testimonial Slider - Faded/Disappeared Effect */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="relative"
                    >
                        <div className="bg-white/70 dark:bg-white/5 backdrop-blur-lg rounded-2xl p-8 md:p-12 min-h-[400px] flex flex-col justify-between shadow-xl border border-purple-100/50 dark:border-white/5 opacity-70 hover:opacity-100 transition-opacity duration-300">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={currentIndex}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.3 }}
                                    className="flex-1"
                                >
                                    {/* Rating Stars */}
                                    <div className="flex gap-1 mb-6">
                                        {[...Array(testimonials[currentIndex].rating)].map((_, i) => (
                                            <Star key={i} className="w-5 h-5 text-purple-500" fill="currentColor" />
                                        ))}
                                    </div>

                                    {/* Testimonial Text */}
                                    <p className="text-gray-700 dark:text-white text-xl md:text-2xl leading-relaxed mb-8">
                                        {testimonials[currentIndex].text}
                                    </p>

                                    {/* Author */}
                                    <div className="flex items-center gap-4 mt-auto">
                                        <img
                                            src={testimonials[currentIndex].avatar}
                                            alt={testimonials[currentIndex].name}
                                            className="w-16 h-16 rounded-full border-2 border-purple-400"
                                        />
                                        <div>
                                            <h4 className="text-gray-800 dark:text-white font-semibold text-lg">
                                                {testimonials[currentIndex].name}
                                            </h4>
                                            <p className="text-purple-600 dark:text-purple-400 text-sm">
                                                {testimonials[currentIndex].role}
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>
                            </AnimatePresence>
                        </div>

                        {/* Navigation Buttons */}
                        <div className="flex gap-4 mt-6 justify-end">
                            <button
                                onClick={prevTestimonial}
                                className="w-12 h-12 bg-white dark:bg-white/10 hover:bg-gray-100 dark:hover:bg-white/20 backdrop-blur-sm border border-purple-200 dark:border-white/20 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 hover:border-purple-400 shadow-lg"
                                aria-label="Previous testimonial"
                            >
                                <ChevronLeft className="w-5 h-5 text-gray-700 dark:text-white" />
                            </button>
                            <button
                                onClick={nextTestimonial}
                                className="w-12 h-12 bg-purple-600 hover:bg-purple-700 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-lg"
                                aria-label="Next testimonial"
                            >
                                <ChevronRight className="w-5 h-5 text-white" />
                            </button>
                        </div>

                        {/* Pagination Dots */}
                        <div className="flex justify-center gap-2 mt-6">
                            {testimonials.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => setCurrentIndex(index)}
                                    className={`h-2 rounded-full transition-all duration-300 ${index === currentIndex
                                        ? 'w-8 bg-purple-600'
                                        : 'w-2 bg-purple-300 dark:bg-white/20 hover:bg-purple-400 dark:hover:bg-white/40'
                                        }`}
                                    aria-label={`Go to testimonial ${index + 1}`}
                                />
                            ))}
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default Testimonials;
