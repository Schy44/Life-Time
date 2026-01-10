import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users,
    Heart,
    MapPin,
    Globe,
    Briefcase,
    GraduationCap,
    MessageCircle,
    Shield,
    CheckCircle2,
    Monitor,
    Zap,
    ChevronRight,
    ArrowRight,
    Sparkles
} from 'lucide-react';
import api from '../lib/api';

const SurveyPage = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [direction, setDirection] = useState(0);
    const [loading, setLoading] = useState(false);
    const [profile, setProfile] = useState(null);
    const [countries, setCountries] = useState([]);
    const [professions, setProfessions] = useState([]);

    const [formData, setFormData] = useState({
        // Profile fields
        profile_for: 'self',
        willing_to_relocate: '',
        lifestyle_priority: '',
        looking_for: '',

        // Preference fields
        looking_for_gender: '',
        marital_statuses: [],
        location_preference: '',
        country: '',
        religion: '',
        min_education: '',
        profession: [],
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const profileRes = await api.get('/profile/');
                if (profileRes.data) {
                    setProfile(profileRes.data);
                    setFormData(prev => ({
                        ...prev,
                        profile_for: profileRes.data.profile_for || 'self',
                        willing_to_relocate: profileRes.data.willing_to_relocate || '',
                        lifestyle_priority: profileRes.data.lifestyle_priority || '',
                        ...(profileRes.data.preference || {}),
                        profession: Array.isArray(profileRes.data.preference?.profession)
                            ? profileRes.data.preference.profession
                            : (profileRes.data.preference?.profession ? profileRes.data.preference.profession.split(', ') : []),
                    }));
                }

                const countriesRes = await api.get('/countries/');
                setCountries(countriesRes.data);

                const professionsRes = await api.get('/professions/');
                // Only use professions from backend
                const backendProfessions = (professionsRes.data || []).filter(p => p && p.trim() !== "");
                setProfessions(backendProfessions);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };
        fetchData();
    }, []);

    const handleOptionSelect = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const nextStep = () => {
        setDirection(1);
        setStep(prev => Math.min(prev + 1, 4));
    };

    const prevStep = () => {
        setDirection(-1);
        setStep(prev => Math.max(prev - 1, 1));
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const profileUpdate = {
                profile_for: formData.profile_for,
                willing_to_relocate: formData.willing_to_relocate,
                lifestyle_priority: formData.lifestyle_priority,
                looking_for: formData.looking_for,
            };

            const preferenceUpdate = {
                looking_for_gender: formData.looking_for_gender,
                marital_statuses: formData.marital_statuses,
                location_preference: formData.location_preference,
                country: formData.country,
                religion: formData.religion,
                min_education: formData.min_education,
                profession: formData.profession,
            };

            await api.patch('/profile/', {
                ...profileUpdate,
                preference: preferenceUpdate
            });

            navigate('/match-preview');
        } catch (error) {
            console.error("Error submitting survey:", error);
            alert("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const getStepBadge = () => {
        switch (step) {
            case 1: return { icon: <Users className="w-4 h-4" />, text: "Profile Role", color: "bg-blue-100 text-blue-700" };
            case 2: return { icon: <Globe className="w-4 h-4" />, text: "Environment", color: "bg-emerald-100 text-emerald-700" };
            case 3: return { icon: <Zap className="w-4 h-4" />, text: "Ambition", color: "bg-amber-100 text-amber-700" };
            case 4: return { icon: <Heart className="w-4 h-4" />, text: "Ideal Partner", color: "bg-rose-100 text-rose-700" };
            default: return { icon: <Monitor className="w-4 h-4" />, text: "Survey", color: "bg-gray-100 text-gray-700" };
        }
    };

    const variants = {
        enter: (direction) => ({
            x: direction > 0 ? 50 : -50,
            opacity: 0
        }),
        center: {
            zIndex: 1,
            x: 0,
            opacity: 1
        },
        exit: (direction) => ({
            zIndex: 0,
            x: direction < 0 ? 50 : -50,
            opacity: 0
        })
    };

    const renderStepContent = () => {
        switch (step) {
            case 1:
                return (
                    <motion.div
                        key="step1"
                        custom={direction}
                        variants={variants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ duration: 0.3, ease: 'easeOut' }}
                        className="space-y-12 max-w-xl mx-auto"
                    >
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {['self', 'son', 'daughter', 'brother', 'sister', 'relative'].map((option) => (
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    key={option}
                                    onClick={() => handleOptionSelect('profile_for', option)}
                                    className={`p-5 rounded-xl border-2 transition-all text-sm font-semibold capitalize
                                        ${formData.profile_for === option
                                            ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-md'
                                            : 'border-gray-100 bg-white text-gray-500 hover:border-blue-100 hover:bg-gray-50'}`}
                                >
                                    {option === 'relative' ? 'Friend' : option}
                                </motion.button>
                            ))}
                        </div>

                        <div className="pt-20 border-t border-gray-100/50">
                            <h4 className="text-gray-900 font-bold mb-8 text-center text-lg italic">I am looking for a partner who is...</h4>
                            <div className="flex justify-center gap-8">
                                {[
                                    { id: 'bride', label: 'A Woman (Bride)' },
                                    { id: 'groom', label: 'A Man (Groom)' }
                                ].map((option) => (
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        key={option.id}
                                        onClick={() => handleOptionSelect('looking_for_gender', option.id)}
                                        className={`px-8 py-4 rounded-xl border-2 transition-all text-sm font-bold
                                            ${formData.looking_for_gender === option.id
                                                ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-md'
                                                : 'border-gray-100 bg-white text-gray-500 hover:border-blue-100 hover:bg-gray-50'}`}
                                    >
                                        {option.label}
                                    </motion.button>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                );
            case 2:
                return (
                    <motion.div
                        key="step2"
                        custom={direction}
                        variants={variants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ duration: 0.3, ease: 'easeOut' }}
                        className="space-y-12 max-w-xl mx-auto"
                    >
                        <div>
                            <h4 className="text-gray-900 font-bold mb-6 text-center text-lg">Location Preference</h4>
                            <div className="grid grid-cols-3 gap-4">
                                {[
                                    { id: 'near_me', label: 'Near me' },
                                    { id: 'abroad', label: 'Abroad' },
                                    { id: 'any', label: 'Any' }
                                ].map((option) => (
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        key={option.id}
                                        onClick={() => handleOptionSelect('location_preference', option.id)}
                                        className={`p-5 rounded-xl border-2 transition-all text-sm font-semibold
                                            ${formData.location_preference === option.id
                                                ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-md'
                                                : 'border-gray-100 bg-white text-gray-500 hover:border-blue-100'}`}
                                    >
                                        {option.label}
                                    </motion.button>
                                ))}
                            </div >
                            <AnimatePresence>
                                {formData.location_preference === 'abroad' && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="mt-6 overflow-hidden"
                                    >
                                        <select
                                            value={formData.country}
                                            onChange={(e) => handleOptionSelect('country', e.target.value)}
                                            className="w-full p-4 rounded-xl border-2 border-gray-100 bg-white text-sm focus:border-blue-400 focus:ring-4 focus:ring-blue-50 outline-none transition-all shadow-sm"
                                        >
                                            <option value="">Choose specific country...</option>
                                            {countries.map(c => (
                                                <option key={c.code} value={c.code}>{c.name}</option>
                                            ))}
                                        </select>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div >

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-6 border-t border-gray-50">
                            <div>
                                <h4 className="text-gray-900 font-bold mb-4 flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-gray-400" />
                                    Relocation
                                </h4>
                                <div className="flex gap-2">
                                    {['yes', 'no', 'it_depends'].map((o) => (
                                        <button
                                            key={o}
                                            onClick={() => handleOptionSelect('willing_to_relocate', o)}
                                            className={`flex-1 px-3 py-3 rounded-full border-2 transition-all capitalize text-[10px] font-bold tracking-wider
                                                ${formData.willing_to_relocate === o
                                                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                                                    : 'border-gray-100 bg-white text-gray-400 hover:bg-gray-50'}`}
                                        >
                                            {o.replace('_', ' ')}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <h4 className="text-gray-900 font-bold mb-4 flex items-center gap-2">
                                    <Shield className="w-4 h-4 text-gray-400" />
                                    Faith Preference
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    {['muslim', 'hindu', 'christian'].map((r) => (
                                        <button
                                            key={r}
                                            onClick={() => handleOptionSelect('religion', r)}
                                            className={`px-5 py-3 rounded-full border-2 transition-all capitalize text-[10px] font-bold tracking-wider
                                                ${formData.religion === r
                                                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                                                    : 'border-gray-100 bg-white text-gray-400 hover:bg-gray-50'}`}
                                        >
                                            {r}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                );
            case 3:
                return (
                    <motion.div
                        key="step3"
                        custom={direction}
                        variants={variants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ duration: 0.3, ease: 'easeOut' }}
                        className="space-y-12 max-w-2xl mx-auto"
                    >
                        <div>
                            <h4 className="text-gray-900 font-bold mb-6 text-center text-lg">Minimum Education</h4>
                            <div className="grid grid-cols-4 gap-4">
                                {[
                                    { id: 'bachelors', label: 'Bachelors' },
                                    { id: 'masters', label: 'Masters' },
                                    { id: 'phd', label: 'PhD' },
                                    { id: 'any', label: 'Any' }
                                ].map((option) => (
                                    <motion.button
                                        whileHover={{ y: -2 }}
                                        whileTap={{ scale: 0.95 }}
                                        key={option.id}
                                        onClick={() => handleOptionSelect('min_education', option.id)}
                                        className={`p-4 rounded-xl border-2 transition-all text-xs font-bold
                                            ${formData.min_education === option.id
                                                ? 'border-blue-600 bg-blue-100 text-blue-700 shadow-lg'
                                                : 'border-gray-100 bg-white text-gray-500 hover:border-blue-200'}`}
                                    >
                                        {option.label}
                                    </motion.button>
                                ))}
                            </div>
                        </div>

                        <div className="pt-6 border-t border-gray-50">
                            <h4 className="text-gray-900 font-bold mb-6 text-center text-lg">Preferred Career Fields</h4>
                            <div className="flex flex-wrap justify-center gap-3">
                                {professions.length > 0 ? (
                                    professions.map((option) => (
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            key={option}
                                            onClick={() => {
                                                const current = Array.isArray(formData.profession) ? formData.profession : [];
                                                let next;
                                                if (current.includes(option)) {
                                                    next = current.filter(v => v !== option);
                                                } else {
                                                    next = [...current, option];
                                                }
                                                handleOptionSelect('profession', next);
                                            }}
                                            className={`px-6 py-3 rounded-xl border-2 transition-all text-xs font-bold
                                                ${Array.isArray(formData.profession) && formData.profession.includes(option)
                                                    ? 'border-blue-600 bg-blue-600 text-white shadow-xl'
                                                    : 'border-gray-100 bg-white text-gray-500 hover:border-blue-100'}`}
                                        >
                                            {option}
                                        </motion.button>
                                    ))
                                ) : (
                                    <div className="text-center py-4">
                                        <p className="text-gray-400 text-sm italic">Showing any available profiles...</p>
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            onClick={() => handleOptionSelect('profession', ['Any'])}
                                            className={`mt-4 px-8 py-3 rounded-xl border-2 transition-all text-xs font-bold
                                                ${Array.isArray(formData.profession) && formData.profession.includes('Any')
                                                    ? 'border-blue-600 bg-blue-600 text-white'
                                                    : 'border-gray-100 bg-white text-gray-500 hover:border-blue-100'}`}
                                        >
                                            Any Profession
                                        </motion.button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                );
            case 4:
                return (
                    <motion.div
                        key="step4"
                        custom={direction}
                        variants={variants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ duration: 0.3, ease: 'easeOut' }}
                        className="space-y-12 max-w-xl mx-auto"
                    >
                        <div>
                            <label className="block text-gray-900 font-bold mb-6 text-center text-lg italic">
                                Tell us about your "Type" in one sentence.
                            </label>
                            <textarea
                                value={formData.looking_for}
                                onChange={(e) => handleOptionSelect('looking_for', e.target.value)}
                                placeholder="e.g. Someone who values tradition but has a modern outlook..."
                                className="w-full p-6 rounded-2xl border-2 border-gray-100 bg-white focus:border-blue-400 focus:ring-8 focus:ring-blue-50 outline-none transition-all min-h-[160px] text-base text-gray-700 placeholder-gray-300 shadow-sm"
                            />
                        </div>

                        <div className="flex items-center gap-4 p-6 bg-blue-50/50 rounded-2xl border border-blue-100/50">
                            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-200">
                                <Shield className="w-5 h-5 text-white" />
                            </div>
                            <p className="text-xs text-blue-800 font-medium leading-relaxed">
                                We prioritize your privacy. These preferences are used exclusively by our smart-matching algorithm to improve your experience.
                            </p>
                        </div>
                    </motion.div>
                );
            default: return null;
        }
    };

    const badge = getStepBadge();

    return (
        <div className="min-h-screen bg-white font-sans text-gray-900 selection:bg-blue-100 selection:text-blue-900">
            <div className="flex flex-col items-center justify-center min-h-screen px-6 py-24 text-center">
                {/* Category Badge */}
                <motion.div
                    key={step + "badge"}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className={`inline-flex items-center gap-2 px-4 py-1.5 mb-8 rounded-full text-xs font-black uppercase tracking-widest shadow-sm transition-colors duration-500 ${badge.color}`}
                >
                    {badge.icon}
                    {badge.text}
                </motion.div>

                {/* Heading Area */}
                <motion.div
                    key={step + "header"}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <h1 className="text-5xl font-black tracking-tight mb-4 text-gray-900 max-w-2xl leading-[1.1]">
                        {step === 4 ? "Describe your ideal partner" : "Tell us your preferences"}
                    </h1>
                    <p className="text-gray-400 text-lg mb-16 font-medium max-w-lg mx-auto">
                        {step === 4 ? "A few words go a long way in finding the right one." : "Your role helps us refine the matching logic for you."}
                    </p>
                </motion.div>

                {/* Content */}
                <div className="w-full max-w-2xl min-h-[400px] relative overflow-hidden">
                    <AnimatePresence mode="wait" custom={direction}>
                        {renderStepContent()}
                    </AnimatePresence>
                </div>

                {/* Navigation */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="mt-20 flex items-center justify-center gap-6"
                >
                    <button
                        onClick={prevStep}
                        disabled={loading}
                        className={`px-10 py-4 rounded-xl text-sm font-bold transition-all border-2
                            ${step === 1
                                ? 'border-transparent text-transparent pointer-events-none'
                                : 'border-gray-100 text-gray-400 hover:border-gray-200 hover:text-gray-600'}`}
                    >
                        {step === 4 ? "Back" : "Skip"}
                    </button>
                    {step < 4 ? (
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={nextStep}
                            className="px-16 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-md font-black shadow-2xl shadow-blue-200 transition-all flex items-center gap-2 group"
                        >
                            Continue
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </motion.button>
                    ) : (
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleSubmit}
                            disabled={loading}
                            className="px-16 py-4 bg-gray-900 hover:bg-black text-white rounded-xl text-md font-black shadow-2xl shadow-gray-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 group"
                        >
                            {loading ? "Discovering..." : "Get Started"}
                            {!loading && <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />}
                        </motion.button>
                    )}
                </motion.div>

                {/* Step Indicator Dot Progress */}
                <div className="mt-12 flex gap-4">
                    {[1, 2, 3, 4].map(i => (
                        <motion.div
                            key={i}
                            initial={false}
                            animate={{
                                width: step === i ? 32 : 8,
                                backgroundColor: step === i ? '#2563eb' : '#e5e7eb'
                            }}
                            className="h-2 rounded-full transition-colors duration-500"
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default SurveyPage;
