import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Heart,
    Globe,
    Briefcase,
    GraduationCap,
    MessageCircle,
    Shield,
    Monitor,
    ArrowRight,
    Sparkles,
    Ruler,
    Calendar,
    Users2
} from 'lucide-react';
import api from '../lib/api';

const SurveyPage = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [direction, setDirection] = useState(0);
    const [loading, setLoading] = useState(false);
    const [, setProfile] = useState(null);
    const [countries, setCountries] = useState([]);
    const [professions, setProfessions] = useState([]);

    const MARITAL_STATUS_CHOICES = [
        { value: 'never_married', label: 'Never Married' },
        { value: 'divorced', label: 'Divorced' },
        { value: 'widowed', label: 'Widowed' },
        { value: 'awaiting_divorce', label: 'Awaiting Divorce' },
    ];

    const [formData, setFormData] = useState({
        // Preference fields
        looking_for_gender: '',
        marital_statuses: [],
        location_preference: '',
        country: '',
        min_age: '',
        min_height_inches: '',
        min_education: '',
        profession: [],
        looking_for: '',
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const profileRes = await api.get('/profile/');
                if (profileRes.data) {
                    setProfile(profileRes.data);
                    setFormData(prev => ({
                        ...prev,
                        ...(profileRes.data.preference || {}),
                        profession: Array.isArray(profileRes.data.preference?.profession)
                            ? profileRes.data.preference.profession
                            : (profileRes.data.preference?.profession ? profileRes.data.preference.profession.split(', ') : []),
                    }));
                }

                const countriesRes = await api.get('/countries/?only_with_users=true');
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
            const preferenceUpdate = {
                looking_for_gender: formData.looking_for_gender,
                marital_statuses: Array.isArray(formData.marital_statuses) ? formData.marital_statuses : [],
                location_preference: formData.location_preference,
                country: formData.country || null,
                min_age: formData.min_age ? parseInt(formData.min_age) : null,
                min_height_inches: formData.min_height_inches ? parseInt(formData.min_height_inches) : null,
                min_education: formData.min_education,
                profession: Array.isArray(formData.profession) ? formData.profession : [],
            };

            await api.patch('/profile/', {
                looking_for: formData.looking_for,
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
            case 1: return { icon: <Users2 className="w-5 h-5" />, text: "Identity", color: "bg-blue-100/80 text-blue-700" };
            case 2: return { icon: <Heart className="w-5 h-5" />, text: "Selection", color: "bg-rose-100/80 text-rose-700" };
            case 3: return { icon: <Sparkles className="w-5 h-5" />, text: "Profile", color: "bg-indigo-100/80 text-indigo-700" };
            case 4: return { icon: <MessageCircle className="w-5 h-5" />, text: "Aspiration", color: "bg-amber-100/80 text-amber-700" };
            default: return { icon: <Monitor className="w-5 h-5" />, text: "Survey", color: "bg-slate-100/80 text-slate-700" };
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
                        className="space-y-12 max-w-xl mx-auto flex flex-col items-center justify-center h-full"
                    >
                        <div className="w-full">
                            <h4 className="text-gray-900 font-bold mb-10 text-center text-2xl italic">I am looking for a partner who is...</h4>
                            <div className="flex flex-col sm:flex-row justify-center gap-6">
                                {[
                                    { id: 'bride', label: 'A Woman / Bride' },
                                    { id: 'groom', label: 'A Man / Groom' }
                                ].map((option) => (
                                    <motion.button
                                        whileHover={{ scale: 1.05, y: -5 }}
                                        whileTap={{ scale: 0.95 }}
                                        key={option.id}
                                        onClick={() => handleOptionSelect('looking_for_gender', option.id)}
                                        className={`px-12 py-8 rounded-[2rem] border-4 transition-all text-lg font-black
                                            ${formData.looking_for_gender === option.id
                                                ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-2xl shadow-blue-200'
                                                : 'border-gray-50 bg-white text-gray-400 hover:border-blue-100 hover:bg-gray-50 shadow-sm'}`}
                                    >
                                        {option.label}
                                    </motion.button>
                                ))}
                            </div>
                            <p className="text-center text-sm text-gray-400 mt-10 font-medium">
                                This helps us filter the most relevant profiles for you.
                            </p>
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
                        className="space-y-12 max-w-3xl mx-auto w-full"
                    >
                        <div>
                            <h4 className="text-gray-900 font-bold mb-6 text-center text-lg flex items-center justify-center gap-2">
                                <Heart className="text-rose-500" size={20} />
                                Marital Status Preference
                            </h4>
                            <div className="grid grid-cols-2 gap-3">
                                {MARITAL_STATUS_CHOICES.map((option) => (
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        key={option.value}
                                        onClick={() => {
                                            const current = formData.marital_statuses || [];
                                            const next = current.includes(option.value)
                                                ? current.filter(v => v !== option.value)
                                                : [...current, option.value];
                                            handleOptionSelect('marital_statuses', next);
                                        }}
                                        className={`p-4 rounded-2xl border-2 transition-all text-sm font-bold
                                            ${(formData.marital_statuses || []).includes(option.value)
                                                ? 'border-rose-600 bg-rose-50 text-rose-700 shadow-md'
                                                : 'border-gray-50 bg-white text-gray-400 hover:border-rose-100'}`}
                                    >
                                        {option.label}
                                    </motion.button>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-gray-50">
                            <div>
                                <h4 className="text-gray-900 font-bold mb-4 flex items-center gap-2">
                                    <Calendar className="w-5 h-5 text-indigo-500" />
                                    Minimum Age
                                </h4>
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={formData.min_age}
                                        onChange={(e) => handleOptionSelect('min_age', e.target.value)}
                                        placeholder="e.g. 24"
                                        className="w-full p-4 pl-12 rounded-2xl border-2 border-gray-100 focus:border-indigo-400 outline-none transition-all font-bold text-lg"
                                    />
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 font-bold">Age</span>
                                </div>
                            </div>
                            <div>
                                <h4 className="text-gray-900 font-bold mb-4 flex items-center gap-2">
                                    <Ruler className="w-5 h-5 text-emerald-500" />
                                    Minimum Height
                                </h4>
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={formData.min_height_inches}
                                        onChange={(e) => handleOptionSelect('min_height_inches', e.target.value)}
                                        placeholder="e.g. 66"
                                        className="w-full p-4 pl-14 rounded-2xl border-2 border-gray-100 focus:border-emerald-400 outline-none transition-all font-bold text-lg"
                                    />
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 font-bold">Inch</span>
                                </div>
                                <p className="text-[10px] text-gray-400 mt-2 font-medium">5'0" = 60, 5'6" = 66, 6'0" = 72</p>
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
                        className="w-full max-w-6xl mx-auto px-1"
                    >
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                            {/* Left Column: Location & Education */}
                            <div className="flex flex-col gap-8">
                                {/* Location Section */}
                                <div className="bg-white/80 backdrop-blur-xl p-6 sm:p-10 rounded-[3rem] border border-slate-200/50 shadow-sm transition-all hover:shadow-md">
                                    <div className="flex items-center gap-4 mb-8">
                                        <div className="p-3 bg-emerald-100 rounded-2xl text-emerald-600">
                                            <Globe size={24} />
                                        </div>
                                        <div className="text-left">
                                            <h4 className="text-xl font-black text-slate-900 tracking-tight">Location Goal</h4>
                                            <p className="text-xs text-slate-500 font-medium">Where would you prefer them to be?</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                        {[
                                            { id: 'near_me', label: 'Near me' },
                                            { id: 'abroad', label: 'Abroad' },
                                            { id: 'any', label: 'Regardless' }
                                        ].map((option) => (
                                            <motion.button
                                                whileTap={{ scale: 0.98 }}
                                                key={option.id}
                                                onClick={() => handleOptionSelect('location_preference', option.id)}
                                                className={`p-5 rounded-2xl border-2 transition-all text-sm font-black tracking-tight
                                                    ${formData.location_preference === option.id
                                                        ? 'border-emerald-600 bg-emerald-50 text-emerald-700 shadow-sm'
                                                        : 'border-slate-100 bg-slate-50/50 text-slate-400 hover:border-emerald-100 hover:bg-white'}`}
                                            >
                                                {option.label}
                                            </motion.button>
                                        ))}
                                    </div>

                                    <AnimatePresence>
                                        {formData.location_preference === 'abroad' && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="mt-6 overflow-hidden"
                                            >
                                                <select
                                                    value={formData.country || ""}
                                                    onChange={(e) => handleOptionSelect('country', e.target.value)}
                                                    className="w-full p-5 rounded-2xl border-2 border-slate-100 bg-white text-sm font-black text-slate-900 focus:border-emerald-400 outline-none transition-all shadow-sm appearance-none"
                                                >
                                                    <option value="">Select Target Country...</option>
                                                    {countries.map(c => (
                                                        <option key={c.code} value={c.code}>{c.name}</option>
                                                    ))}
                                                </select>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                {/* Education Section */}
                                <div className="bg-white/80 backdrop-blur-xl p-6 sm:p-10 rounded-[3rem] border border-slate-200/50 shadow-sm transition-all hover:shadow-md">
                                    <div className="flex items-center gap-4 mb-8">
                                        <div className="p-3 bg-blue-100 rounded-2xl text-blue-600">
                                            <GraduationCap size={24} />
                                        </div>
                                        <div className="text-left">
                                            <h4 className="text-xl font-black text-slate-900 tracking-tight">Academic Level</h4>
                                            <p className="text-xs text-slate-500 font-medium">Minimum educational qualification</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-3">
                                        {[
                                            { id: 'bachelors', label: 'Bachelors' },
                                            { id: 'masters', label: 'Masters' },
                                            { id: 'phd', label: 'Doctorate' },
                                            { id: 'any', label: 'Any' }
                                        ].map((option) => (
                                            <motion.button
                                                whileTap={{ scale: 0.95 }}
                                                key={option.id}
                                                onClick={() => handleOptionSelect('min_education', option.id)}
                                                className={`p-4 rounded-2xl border-2 transition-all text-[10px] font-black uppercase tracking-widest
                                                    ${formData.min_education === option.id
                                                        ? 'border-blue-600 bg-blue-600 text-white shadow-lg shadow-blue-200'
                                                        : 'border-slate-100 bg-slate-50/50 text-slate-400 hover:border-blue-200 hover:bg-white'}`}
                                            >
                                                {option.label}
                                            </motion.button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Right Column: Career Fields */}
                            <div className="h-full">
                                <div className="bg-white/80 backdrop-blur-xl p-6 sm:p-10 rounded-[3rem] border border-slate-200/50 shadow-sm transition-all hover:shadow-md h-full flex flex-col">
                                    <div className="flex items-center gap-4 mb-8">
                                        <div className="p-3 bg-indigo-100 rounded-2xl text-indigo-600">
                                            <Briefcase size={24} />
                                        </div>
                                        <div className="text-left">
                                            <h4 className="text-xl font-black text-slate-900 tracking-tight">Career Fields</h4>
                                            <p className="text-xs text-slate-500 font-medium">Potential professional backgrounds</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-2 max-h-[500px] lg:max-h-none overflow-y-auto lg:overflow-visible no-scrollbar">
                                        {professions.map((option) => (
                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                key={option}
                                                onClick={() => {
                                                    const current = Array.isArray(formData.profession) ? formData.profession : [];
                                                    const next = current.includes(option)
                                                        ? current.filter(v => v !== option)
                                                        : [...current, option];
                                                    handleOptionSelect('profession', next);
                                                }}
                                                className={`px-6 py-3 rounded-full border-2 transition-all text-xs font-black
                                                    ${Array.isArray(formData.profession) && formData.profession.includes(option)
                                                        ? 'border-indigo-600 bg-indigo-600 text-white shadow-md shadow-indigo-100'
                                                        : 'border-slate-100 bg-slate-50/50 text-slate-500 hover:border-indigo-200 hover:bg-white'}`}
                                            >
                                                {option}
                                            </motion.button>
                                        ))}
                                    </div>
                                </div>
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
                        className="space-y-10 max-w-4xl mx-auto w-full"
                    >
                        <div className="bg-white/80 backdrop-blur-xl p-8 sm:p-12 rounded-[3.5rem] border border-slate-200/50 shadow-xl shadow-slate-200/20">
                            <label className="block text-slate-900 font-black mb-8 text-center text-2xl tracking-tight leading-tight">
                                Anything else on your mind? <br />
                                <span className="text-slate-400 font-medium text-lg italic">We listen to every detail.</span>
                            </label>
                            <textarea
                                value={formData.looking_for}
                                onChange={(e) => handleOptionSelect('looking_for', e.target.value)}
                                placeholder="Example: Character traits, family values, or lifestyle habits..."
                                className="w-full p-8 rounded-[2.5rem] border-2 border-slate-100 bg-slate-50/50 focus:bg-white focus:border-blue-400 focus:ring-8 focus:ring-blue-50/50 outline-none transition-all min-h-[220px] text-lg text-slate-700 placeholder-slate-300 shadow-inner scrollbar-none"
                            />
                        </div>

                        <div className="flex items-center gap-6 p-8 bg-blue-50/30 rounded-[2.5rem] border border-blue-100/50 backdrop-blur-sm">
                            <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-xl shadow-blue-200 rotate-3">
                                <Shield className="w-7 h-7 text-white" />
                            </div>
                            <p className="text-sm text-blue-900/70 font-bold leading-relaxed text-left">
                                These details are <span className="text-blue-600">strictly private</span>. They power our proprietary matching engine to find your perfect alignment.
                            </p>
                        </div>
                    </motion.div>
                );
            default: return null;
        }
    };
    const badge = getStepBadge();

    return (
        <div className="min-h-screen bg-[#FDFDFF] font-sans text-slate-900 selection:bg-blue-100 selection:text-blue-900 relative overflow-x-hidden">
            {/* Mesh Background Effects */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-100/30 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-100/30 blur-[120px] rounded-full" />
                <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-rose-50/40 blur-[100px] rounded-full" />
            </div>

            <div className="relative flex flex-col items-center justify-between min-h-screen px-4 sm:px-6 pt-12 sm:pt-20 pb-10 sm:pb-16 max-w-[1400px] mx-auto w-full">
                <div className="flex-shrink-0 flex flex-col items-center justify-center w-full z-10">
                    {/* Category Badge */}
                    <motion.div
                        key={step + "badge"}
                        initial={{ scale: 0.9, opacity: 0, y: -10 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        className={`inline-flex items-center gap-3 px-6 py-2 mb-6 rounded-full text-xs font-black uppercase tracking-[0.15em] shadow-sm backdrop-blur-md transition-all duration-700 ${badge.color}`}
                    >
                        {badge.icon}
                        {badge.text}
                    </motion.div>

                    {/* Heading Area */}
                    <motion.div
                        key={step + "header"}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1, duration: 0.6 }}
                        className="text-center"
                    >
                        <h1 className="text-3xl sm:text-5xl font-black tracking-tight mb-4 text-slate-900 max-w-3xl mx-auto leading-[1.1]">
                            Tell us your preferences
                        </h1>
                        <p className="text-slate-400 text-sm sm:text-lg mb-8 font-medium max-w-2xl mx-auto px-4">
                            Your selections help us find the perfect match for your lifetime journey.
                        </p>
                    </motion.div>
                </div>

                {/* Content Area - Natural Scrollable */}
                <div className="w-full relative flex flex-col items-center justify-start flex-grow my-4 sm:my-10 z-10">
                    <AnimatePresence mode="wait" custom={direction}>
                        {renderStepContent()}
                    </AnimatePresence>
                </div>

                {/* Sticky-ish Navigation Container */}
                <div className="flex-shrink-0 w-full max-w-2xl mx-auto z-20 mt-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="flex flex-col items-center gap-8"
                    >
                        <div className="flex items-center justify-center gap-4 sm:gap-8 w-full">
                            <button
                                onClick={prevStep}
                                disabled={loading}
                                className={`flex-1 sm:flex-none px-8 sm:px-12 py-4 sm:py-5 rounded-[1.5rem] text-sm font-black transition-all border-2
                                    ${step === 1
                                        ? 'border-transparent text-transparent pointer-events-none'
                                        : 'border-slate-100 text-slate-400 hover:border-slate-200 hover:text-slate-600 bg-white/50 backdrop-blur-sm'}`}
                            >
                                Back
                            </button>

                            {step < 4 ? (
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={nextStep}
                                    className="flex-1 sm:flex-none px-12 sm:px-20 py-4 sm:py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-[1.5rem] text-sm sm:text-lg font-black shadow-2xl shadow-blue-200/50 transition-all flex items-center justify-center gap-3 group"
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
                                    className="flex-1 sm:flex-none px-12 sm:px-20 py-4 sm:py-5 bg-slate-900 hover:bg-black text-white rounded-[1.5rem] text-sm sm:text-lg font-black shadow-2xl shadow-slate-300/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 group"
                                >
                                    {loading ? "Discovering..." : "Finalize Profile"}
                                    {!loading && <Sparkles className="w-6 h-6 group-hover:rotate-12 transition-all duration-500" />}
                                </motion.button>
                            )}
                        </div>

                        {/* Pagination Progress Dots */}
                        <div className="flex gap-4 p-2 bg-slate-100/30 backdrop-blur-sm rounded-full">
                            {[1, 2, 3, 4].map(i => (
                                <motion.div
                                    key={i}
                                    initial={false}
                                    animate={{
                                        width: step === i ? 40 : 10,
                                        backgroundColor: step === i ? '#2563eb' : '#cbd5e1'
                                    }}
                                    className="h-2.5 rounded-full transition-all duration-700 ease-out"
                                />
                            ))}
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default SurveyPage;
