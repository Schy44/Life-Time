import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Search, Users, Sparkles, Lock, User, MapPin, ShieldCheck, ArrowRight, Zap } from 'lucide-react';
import api from '../lib/api';
import { getProfile } from '../services/api';

const MatchPreviewPage = () => {
    const navigate = useNavigate();
    const [status, setStatus] = useState('analyzing'); // analyzing, searching, filtering, finalized
    const [progress, setProgress] = useState(0);
    const [matches, setMatches] = useState([]);
    const [loadingMatches, setLoadingMatches] = useState(true);
    const [userProfile, setUserProfile] = useState(null);
    const [isFallback, setIsFallback] = useState(false);
    const [fallbackMessage, setFallbackMessage] = useState(null);

    useEffect(() => {
        const fetchMatches = async () => {
            try {
                const response = await api.get('/profiles/recommendations/');
                // Handle new response format
                if (response.data.matches) {
                    setMatches(response.data.matches);
                    setIsFallback(response.data.is_fallback || false);
                    setFallbackMessage(response.data.fallback_message || null);
                } else {
                    // Fallback for old format (if any)
                    setMatches(response.data);
                }
            } catch (error) {
                console.error("Error fetching match suggestions:", error);
            } finally {
                setLoadingMatches(false);
            }
        };

        const fetchUserProfile = async () => {
            try {
                const profile = await getProfile();
                setUserProfile(profile);
            } catch (error) {
                console.error("Error fetching user profile:", error);
            }
        };

        fetchMatches();
        fetchUserProfile();
    }, []);

    useEffect(() => {
        const timer = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    clearInterval(timer);
                    return 100;
                }
                const increment = prev < 85 ? 1.5 : 0.4;
                return prev + increment;
            });
        }, 40);

        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        if (progress < 30) setStatus('analyzing');
        else if (progress < 60) setStatus('searching');
        else if (progress < 90) setStatus('filtering');
        else setStatus('finalized');
    }, [progress]);

    const getStatusText = () => {
        switch (status) {
            case 'analyzing': return 'Analyzing your values & religion';
            case 'searching': return 'Searching for high-compatibility partners';
            case 'filtering': return 'Verifying location & preferences';
            case 'finalized': return 'Your top compatibility matches';
            default: return 'Processing';
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-start py-20 px-6 sm:px-8 overflow-x-hidden">
            {/* Header Content */}
            <div className="max-w-4xl w-full text-center z-10 mb-12">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-widest mb-2">
                        <Sparkles size={12} />
                        Curated for you
                    </div>
                    <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
                        {getStatusText()}
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base max-w-xl mx-auto font-medium">
                        Our algorithm identifies partners who align with your deep values, goals, and lifestyle.
                    </p>

                    {/* Minimal Progress Bar */}
                    <div className="w-full max-w-xs mx-auto h-[3px] bg-slate-200 dark:bg-slate-800 rounded-full relative mt-8 overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            className="absolute inset-y-0 left-0 bg-indigo-600 dark:bg-indigo-500 shadow-[0_0_12px_rgba(79,70,229,0.5)]"
                        />
                    </div>
                </motion.div>
            </div>

            {/* Fallback Message Banner */}
            {isFallback && fallbackMessage && progress >= 100 && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-4xl w-full mb-8"
                >
                    <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-2xl p-4 flex items-start gap-3">
                        <Sparkles size={20} className="text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-amber-800 dark:text-amber-200 font-medium">
                            {fallbackMessage}
                        </p>
                    </div>
                </motion.div>
            )}

            {/* Profile Suggestions Grid */}
            <div className="w-full max-w-6xl">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-12 justify-items-center">
                    <AnimatePresence>
                        {matches.map((match, index) => {
                            const threshold = 10 + (index * 20);
                            if (progress < threshold) return null;

                            return (
                                <motion.div
                                    key={match.id}
                                    initial={{ opacity: 0, scale: 0.9, y: 30 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    whileHover={{ y: -5 }}
                                    onClick={() => navigate(`/profiles/${match.id}`)}
                                    className="cursor-pointer group relative w-full max-w-[320px]"
                                >
                                    <div className="relative aspect-[4/5] rounded-[2rem] overflow-hidden mb-6 bg-white dark:bg-slate-900 shadow-xl dark:shadow-2xl border border-white dark:border-slate-800 ring-1 ring-slate-200 dark:ring-slate-800">

                                        {/* Image layer */}
                                        {(() => {
                                            const canSeeProfileImage = !!match.profile_image || match.is_unlocked;
                                            return (
                                                <>
                                                    <div className={`w-full h-full transition-all duration-1000 ${!canSeeProfileImage ? 'profile-image-blurred' : 'grayscale group-hover:grayscale-0'}`}>
                                                        {match.profile_image ? (
                                                            <img src={match.profile_image} alt={match.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full bg-slate-50 dark:bg-slate-950 flex items-center justify-center text-slate-300 dark:text-slate-800">
                                                                <User size={80} strokeWidth={1} />
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Locked Overlay */}
                                                    {!canSeeProfileImage && (
                                                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/5 backdrop-blur-[2px] z-10">
                                                            <div className="bg-white/90 dark:bg-slate-800/90 p-4 rounded-3xl shadow-2xl scale-90 group-hover:scale-100 transition-transform duration-500">
                                                                <Lock size={20} className="text-indigo-600 dark:text-indigo-400 mx-auto mb-2" />
                                                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-900 dark:text-slate-100">Private</span>
                                                            </div>
                                                        </div>
                                                    )}
                                                </>
                                            );
                                        })()}

                                        {/* Compatibility Tag - Bottom Left */}
                                        <div className="absolute bottom-4 left-4 z-20">
                                            <div className="bg-indigo-600 text-white px-3 py-1.5 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg flex items-center gap-1.5">
                                                <ShieldCheck size={12} />
                                                {match.compatibility_score}% Score
                                            </div>
                                        </div>
                                    </div>

                                    <div className="px-4 text-center">
                                        <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mb-2 leading-tight tracking-tight">
                                            {match.name}
                                        </h3>

                                        <div className="flex items-center justify-center gap-4 text-slate-500 dark:text-slate-400 mb-3">
                                            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider">
                                                <Users size={12} />
                                                {match.age || '--'} Yrs
                                            </div>
                                            <div className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                                            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider">
                                                <MapPin size={12} />
                                                {match.current_city || 'London'}
                                            </div>
                                        </div>

                                        {/* Match Reasons Pills */}
                                        {match.match_reasons && match.match_reasons.length > 0 && (
                                            <div className="flex flex-wrap items-center justify-center gap-1.5 mt-2">
                                                {match.match_reasons.map((reason, idx) => (
                                                    <span
                                                        key={idx}
                                                        className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold uppercase tracking-wide"
                                                    >
                                                        ✓ {reason}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>
            </div>

            {/* Final Activation CTA */}
            {progress >= 100 && userProfile && !userProfile.is_activated && (
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-2xl w-full mt-24 text-center p-10 rounded-[3rem] bg-gradient-to-br from-indigo-600 to-purple-700 text-white shadow-2xl relative overflow-hidden"
                >
                    {/* Decorative Elements */}
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
                    <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl" />

                    <div className="relative z-10 flex flex-col items-center">
                        <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6 shadow-xl ring-1 ring-white/30">
                            <Zap size={32} className="fill-white text-white" />
                        </div>

                        <h2 className="text-3xl sm:text-4xl font-black mb-4 tracking-tight">
                            Ready to make your move?
                        </h2>
                        <p className="text-indigo-100 text-lg mb-10 max-w-md font-medium leading-relaxed">
                            Activate your profile to become visible to these matches and start building a real connection for life.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
                            <Link
                                to="/upgrade"
                                className="flex items-center justify-center gap-3 px-10 py-5 bg-white text-indigo-600 rounded-full font-black text-lg shadow-[0_15px_30px_rgba(0,0,0,0.2)] hover:scale-105 active:scale-95 transition-all group"
                            >
                                <span>ACTIVATE PROFILE NOW</span>
                                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                            </Link>

                            <Link
                                to="/profiles"
                                className="flex items-center justify-center gap-2 px-8 py-5 bg-transparent border-2 border-white/30 text-white rounded-full font-bold text-base hover:bg-white/10 transition-all"
                            >
                                Skip for now
                            </Link>
                        </div>

                        <p className="mt-8 text-xs font-bold uppercase tracking-[0.2em] text-indigo-200">
                            One-time activation fee: 1000 BDT
                        </p>
                    </div>
                </motion.div>
            )}

            {/* Empty State / Loading */}
            {!loadingMatches && progress >= 100 && matches.length === 0 && (
                <div className="text-center mt-12 text-slate-400 font-medium">
                    No matches found that meet your current standards.
                </div>
            )}
        </div>
    );
};

export default MatchPreviewPage;
