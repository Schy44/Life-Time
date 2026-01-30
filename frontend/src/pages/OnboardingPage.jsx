import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User,
    Users,
    MapPin,
    Globe,
    Briefcase,
    GraduationCap,
    Heart,
    CheckCircle2,
    Zap,
    ChevronRight,
    ArrowRight,
    Sparkles,
    Calendar,
    Ruler,
    ShieldCheck,
    Shield,
    CreditCard,
    FileUp,
    Clock,
    AlertCircle,
    CheckCircle
} from 'lucide-react';
import api from '../lib/api';
import CreatableSelect from 'react-select/creatable';
import UnifiedActivationModal from '../components/UnifiedActivationModal';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import '../styles/datepicker-custom.css'; // We will create this for custom overrides if needed

const OnboardingPage = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [direction, setDirection] = useState(0);
    const [loading, setLoading] = useState(false);
    const [countries, setCountries] = useState([]);
    const [professions, setProfessions] = useState([]);
    const [degrees, setDegrees] = useState([]);
    const [verificationStatus, setVerificationStatus] = useState(null); // 'pending', 'approved', 'rejected'
    const [activationStatus, setActivationStatus] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [activationPlan, setActivationPlan] = useState(null);

    // Calculate Date Limits (18+ years old)
    const today = new Date();
    const maxDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
    const minDate = new Date(today.getFullYear() - 100, today.getMonth(), today.getDate());

    // Helper to format Date object to YYYY-MM-DD string
    const formatDateObj = (date) => {
        if (!date) return '';
        // Adjust for timezone to preventing switching to previous day
        const offset = date.getTimezoneOffset();
        const localDate = new Date(date.getTime() - (offset * 60 * 1000));
        return localDate.toISOString().split('T')[0];
    };

    const [formData, setFormData] = useState({
        // Identity
        profile_for: 'self',
        name: '',
        gender: '',
        date_of_birth: '',
        phone: '',

        // Religious & Social
        religion: '',
        marital_status: '',
        height_inches: '',

        // Location & Career
        current_city: '',
        current_country: '',
        education: '',
        profession: '',
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [countriesRes, professionsRes, degreesRes, verifRes, plansRes] = await Promise.all([
                    api.get('/countries/'),
                    api.get('/professions/'),
                    api.get('/education-degrees/'),
                    api.get('/verification-documents/').catch(e => { console.warn("Verification fetch failed:", e); return { data: [] }; }),
                    api.get('/subscription/plans/').catch(e => { console.error("Plans fetch failed:", e); return { data: [] }; })
                ]);

                setCountries((countriesRes.data || []).map(c => ({ label: c.name, value: c.code })));
                setProfessions((professionsRes.data || []).map(p => ({ label: p, value: p })));
                setDegrees((degreesRes.data || []).map(d => ({ label: d, value: d })));

                const allPlans = plansRes.data || [];
                const actPlan = allPlans.find(p => p.slug === 'activation');
                console.log("DEBUG: Activation Plan found:", actPlan);
                setActivationPlan(actPlan);

                if (verifRes.data && verifRes.data.length > 0) {
                    setVerificationStatus(verifRes.data[0].status);
                }

                // Fetch profile separately so it doesn't block plans if it 404s
                try {
                    const profileRes = await api.get('/profile/');
                    if (profileRes.data) {
                        setFormData(prev => ({
                            ...prev,
                            name: profileRes.data.name || '',
                            gender: profileRes.data.gender || '',
                            date_of_birth: profileRes.data.date_of_birth || '',
                            profile_for: profileRes.data.profile_for || 'self',
                            religion: profileRes.data.religion || '',
                            marital_status: profileRes.data.marital_status || '',
                            height_inches: profileRes.data.height_inches || '',
                            current_city: profileRes.data.current_city || '',
                            current_country: profileRes.data.current_country || '',
                            education: profileRes.data.education?.[0]?.degree || '',
                            profession: profileRes.data.work_experience?.[0]?.title || '',
                            phone: profileRes.data.phone || '',
                        }));
                        setActivationStatus(profileRes.data.is_activated);
                        if (profileRes.data.onboarding_completed && !profileRes.data.is_activated) {
                            setStep(4);
                        }
                    }
                } catch (profErr) {
                    console.error("Profile fetch error:", profErr);
                }
            } catch (error) {
                console.error("Critical error in Onboarding fetchData:", error);
            }
        };
        fetchData();
    }, []);

    const handleOptionSelect = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const validateStep = (currentStep) => {
        if (currentStep === 1) {
            if (!formData.name) return "Name is required";
            if (!formData.gender) return "Gender is required";
            if (!formData.date_of_birth) return "Date of birth is required";
            if (!formData.phone) return "Phone number is required";

            // Check DOB Range
            if (formData.date_of_birth > maxDate) return "You must be at least 18 years old";
            if (formData.date_of_birth < minDate) return "Date of birth is invalid";
        }
        if (currentStep === 2) {
            if (!formData.religion) return "Religion is required";
            if (!formData.marital_status) return "Marital status is required";
            if (!formData.height_inches) return "Height is required";

            // Reasonable Height Check (e.g. 30 inches to 100 inches)
            const h = parseInt(formData.height_inches, 10);
            if (isNaN(h) || h < 30 || h > 100) return "Please enter a valid height (30-100 inches)";
        }
        if (currentStep === 3) {
            if (!formData.current_country) return "Current country is required";
            if (!formData.current_city) return "Current city is required";
            if (!formData.education) return "Education is required";
            if (!formData.profession) return "Profession is required";
        }
        return null;
    };

    const nextStep = () => {
        const error = validateStep(step);
        if (error) {
            alert(error);
            return;
        }
        setDirection(1);
        setStep(prev => Math.min(prev + 1, 4));
    };

    const prevStep = () => {
        setDirection(-1);
        setStep(prev => Math.max(prev - 1, 1));
    };

    const handleSubmit = async () => {
        if (step < 4) {
            setLoading(true);
            try {
                const payload = {
                    name: formData.name,
                    gender: formData.gender,
                    date_of_birth: formData.date_of_birth,
                    profile_for: formData.profile_for,
                    religion: formData.religion,
                    marital_status: formData.marital_status,
                    height_inches: parseInt(formData.height_inches, 10), // Ensure integer
                    current_city: formData.current_city,
                    current_country: formData.current_country,
                    education_simple: formData.education,
                    profession_simple: formData.profession,
                    phone: formData.phone,
                    onboarding_completed: true,
                };
                await api.patch('/profile/', payload);
                nextStep();
            } catch (error) {
                console.error("Error saving onboarding data:", error);
                const serverError = error.response?.data || {};
                const errorMessage = typeof serverError === 'object'
                    ? Object.entries(serverError).map(([k, v]) => `${k}: ${v}`).join('\n')
                    : serverError.toString();

                alert(`Could not save profile details:\n${errorMessage || "Please check your connection."}`);
            } finally {
                setLoading(true); // Keep loading state for transition effect? Actually set it false.
                setTimeout(() => setLoading(false), 500);
            }
        } else {
            // If already on Step 4 and activated, go to profiles
            if (activationStatus) {
                navigate('/match-preview');
            } else {
                navigate('/upgrade');
            }
        }
    };

    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setLoading(true);
        const formDataUpload = new FormData();
        formDataUpload.append('document_image', file);
        // formDataUpload.append('document_type', 'nid'); // Removed as not in model/serializer

        try {
            await api.post('/verification-documents/', formDataUpload, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setVerificationStatus('pending');
        } catch (error) {
            console.error("Error uploading document:", error);
            const serverError = error.response?.data || {};
            const errorMessage = typeof serverError === 'object'
                ? Object.entries(serverError).map(([k, v]) => `${k}: ${v}`).join('\n')
                : serverError.toString();
            alert(`Upload failed:\n${errorMessage || "Please try again."}`);
        } finally {
            setLoading(false);
        }
    };

    const getStepBadge = () => {
        switch (step) {
            case 1: return { icon: <User className="w-4 h-4" />, text: "Basic Identity", color: "bg-blue-100 text-blue-700" };
            case 2: return { icon: <Heart className="w-4 h-4" />, text: "Social & Status", color: "bg-rose-100 text-rose-700" };
            case 3: return { icon: <Briefcase className="w-4 h-4" />, text: "Career & Location", color: "bg-emerald-100 text-emerald-700" };
            case 4: return { icon: <ShieldCheck className="w-4 h-4" />, text: "Final Verification", color: "bg-amber-100 text-amber-700" };
            default: return { icon: <Sparkles className="w-4 h-4" />, text: "Onboarding", color: "bg-gray-100 text-gray-700" };
        }
    };

    const variants = {
        enter: (direction) => ({ x: direction > 0 ? 50 : -50, opacity: 0 }),
        center: { zIndex: 1, x: 0, opacity: 1 },
        exit: (direction) => ({ zIndex: 0, x: direction < 0 ? 50 : -50, opacity: 0 })
    };

    const selectStyles = {
        control: (base, state) => ({
            ...base,
            padding: '8px',
            borderRadius: '12px',
            border: state.isFocused ? '2px solid #60a5fa' : '2px solid #f3f4f6',
            boxShadow: 'none',
            '&:hover': {
                border: '2px solid #60a5fa',
            },
            fontSize: '14px',
            backgroundColor: 'white',
        }),
        option: (base, state) => ({
            ...base,
            backgroundColor: state.isSelected ? '#2563eb' : state.isFocused ? '#eff6ff' : 'white',
            color: state.isSelected ? 'white' : '#1f2937',
            padding: '12px',
            fontSize: '14px',
            cursor: 'pointer',
        }),
        menu: (base) => ({
            ...base,
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
            zIndex: 999999,
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
        }),
        menuPortal: (base) => ({ ...base, zIndex: 999999 }),
    };

    const renderStepContent = () => {
        switch (step) {
            case 1:
                return (
                    <motion.div
                        key="step1" custom={direction} variants={variants}
                        initial="enter" animate="center" exit="exit"
                        transition={{ duration: 0.3, ease: 'easeOut' }}
                        className="space-y-8 max-w-xl mx-auto text-left"
                    >
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-4 text-center italic">I am creating this profile for...</label>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {['self', 'son', 'daughter', 'brother', 'sister', 'friend'].map((option) => (
                                    <button
                                        key={option}
                                        onClick={() => handleOptionSelect('profile_for', option)}
                                        className={`p-4 rounded-xl border-2 transition-all text-sm font-semibold capitalize
                                            ${formData.profile_for === option
                                                ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-md'
                                                : 'border-gray-100 bg-white text-gray-500 hover:border-blue-100'}`}
                                    >
                                        {option}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Full Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => handleOptionSelect('name', e.target.value)}
                                    placeholder="Enter your full name"
                                    maxLength={100}
                                    className="w-full p-4 rounded-xl border-2 border-gray-100 focus:border-blue-400 outline-none transition-all"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Gender</label>
                                    <select
                                        value={formData.gender}
                                        onChange={(e) => handleOptionSelect('gender', e.target.value)}
                                        className="w-full p-4 rounded-xl border-2 border-gray-100 focus:border-blue-400 outline-none transition-all bg-white"
                                    >
                                        <option value="">Select Gender</option>
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Date of Birth</label>
                                    <DatePicker
                                        selected={formData.date_of_birth ? new Date(formData.date_of_birth) : null}
                                        onChange={(date) => handleOptionSelect('date_of_birth', formatDateObj(date))}
                                        dateFormat="dd/MM/yyyy"
                                        maxDate={maxDate}
                                        minDate={minDate}
                                        showMonthDropdown
                                        showYearDropdown
                                        dropdownMode="select"
                                        placeholderText="Select Date of Birth"
                                        className="w-full p-4 rounded-xl border-2 border-gray-100 focus:border-blue-400 outline-none transition-all bg-white"
                                        wrapperClassName="w-full"
                                        onKeyDown={(e) => e.preventDefault()}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Contact Number</label>
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => {
                                        const val = e.target.value.replace(/[^0-9+]/g, '');
                                        if (val.length <= 15) handleOptionSelect('phone', val);
                                    }}
                                    placeholder="+880 1XXX XXXXXX"
                                    className="w-full p-4 rounded-xl border-2 border-gray-100 focus:border-blue-400 outline-none transition-all"
                                />
                                <p className="text-[10px] text-gray-400 mt-1 ml-1">Required so others can connect with you.</p>
                            </div>
                        </div>
                    </motion.div>
                );
            case 2:
                return (
                    <motion.div
                        key="step2" custom={direction} variants={variants}
                        initial="enter" animate="center" exit="exit"
                        transition={{ duration: 0.3, ease: 'easeOut' }}
                        className="space-y-8 max-w-xl mx-auto text-left"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Religion</label>
                                <div className="grid grid-cols-1 gap-2">
                                    {['muslim', 'hindu', 'christian', 'buddhist', 'other'].map((rel) => (
                                        <button
                                            key={rel}
                                            onClick={() => handleOptionSelect('religion', rel)}
                                            className={`p-3 rounded-xl border-2 transition-all text-sm font-semibold capitalize
                                                ${formData.religion === rel
                                                    ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-sm'
                                                    : 'border-gray-100 bg-white text-gray-500 hover:border-blue-100'}`}
                                        >
                                            {rel}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Marital Status</label>
                                    <div className="grid grid-cols-1 gap-2">
                                        {['never_married', 'divorced', 'widowed', 'awaiting_divorce'].map((status) => (
                                            <button
                                                key={status}
                                                onClick={() => handleOptionSelect('marital_status', status)}
                                                className={`p-3 rounded-xl border-2 transition-all text-sm font-semibold capitalize
                                                    ${formData.marital_status === status
                                                        ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-sm'
                                                        : 'border-gray-100 bg-white text-gray-500 hover:border-blue-100'}`}
                                            >
                                                {status.replace('_', ' ')}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1 flex items-center gap-2">
                                        <Ruler size={14} /> Height (Inches)
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.height_inches}
                                        onChange={(e) => handleOptionSelect('height_inches', e.target.value)}
                                        placeholder="e.g. 68"
                                        min="30"
                                        max="100"
                                        className="w-full p-4 rounded-xl border-2 border-gray-100 focus:border-blue-400 outline-none transition-all"
                                    />
                                    <p className="text-[10px] text-gray-400 mt-1 ml-1">5'0" = 60, 5'6" = 66, 6'0" = 72</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                );
            case 3:
                return (
                    <motion.div
                        key="step3" custom={direction} variants={variants}
                        initial="enter" animate="center" exit="exit"
                        transition={{ duration: 0.3, ease: 'easeOut' }}
                        className="space-y-6 max-w-xl mx-auto text-left"
                    >
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Current Country</label>
                                <CreatableSelect
                                    isClearable
                                    options={countries}
                                    styles={selectStyles}
                                    menuPortalTarget={document.body}
                                    menuPosition="fixed"
                                    placeholder="Select or type country"
                                    value={countries.find(c => c.value === formData.current_country) || (formData.current_country ? { label: formData.current_country, value: formData.current_country } : null)}
                                    onChange={(val) => handleOptionSelect('current_country', val ? val.value : '')}
                                    onCreateOption={(val) => handleOptionSelect('current_country', val)}
                                    formatCreateLabel={(inputValue) => `Add "${inputValue}"`}
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Current City</label>
                                <input
                                    type="text"
                                    value={formData.current_city}
                                    onChange={(e) => handleOptionSelect('current_city', e.target.value)}
                                    placeholder="Dhaka, London, etc."
                                    maxLength={100}
                                    className="w-full p-4 rounded-xl border-2 border-gray-100 focus:border-blue-400 outline-none transition-all text-sm"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Highest Education</label>
                            <CreatableSelect
                                isClearable
                                options={degrees}
                                styles={selectStyles}
                                menuPortalTarget={document.body}
                                menuPosition="fixed"
                                placeholder="Select or type your degree"
                                value={degrees.find(d => d.value === formData.education) || { label: formData.education, value: formData.education }}
                                onChange={(val) => handleOptionSelect('education', val ? val.value : '')}
                                onCreateOption={(val) => handleOptionSelect('education', val)}
                                formatCreateLabel={(inputValue) => `Add "${inputValue}"`}
                            />
                        </div>

                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Current Profession</label>
                            <CreatableSelect
                                isClearable
                                options={professions}
                                styles={selectStyles}
                                menuPortalTarget={document.body}
                                menuPosition="fixed"
                                placeholder="Select or type your profession"
                                value={professions.find(p => p.value === formData.profession) || { label: formData.profession, value: formData.profession }}
                                onChange={(val) => handleOptionSelect('profession', val ? val.value : '')}
                                onCreateOption={(val) => handleOptionSelect('profession', val)}
                                formatCreateLabel={(inputValue) => `Add "${inputValue}"`}
                            />
                        </div>

                        <div className="p-5 bg-white rounded-2xl border border-slate-100 flex items-start gap-4 shadow-sm">
                            <Sparkles className="text-slate-300 flex-shrink-0 mt-1" size={20} />
                            <p className="text-xs text-slate-500 font-medium leading-relaxed">
                                Great! Once you complete this step, you'll be one step away from finding your perfect match.
                            </p>
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
                    >
                        <div className="text-center space-y-2 mb-8">
                            <h2 className="text-4xl font-black text-slate-900 tracking-tight">Complete your journey</h2>
                            <p className="text-slate-500 text-base font-medium max-w-2xl mx-auto">
                                You're moments away from unlocking your profile.
                            </p>
                        </div>

                        {/* Harmonious Bento Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch max-w-6xl mx-auto">
                            {/* Verification Card */}
                            <div
                                className={`flex flex-col p-8 sm:p-10 rounded-[2.5rem] border-2 transition-all duration-700 relative overflow-hidden group/card
                                    ${verificationStatus === 'approved'
                                        ? 'bg-slate-50 border-slate-200'
                                        : 'bg-white border-slate-100 shadow-xl shadow-slate-200/50 hover:border-indigo-200 hover:shadow-2xl hover:shadow-slate-300/60'}`}
                            >
                                <div className="flex items-start justify-between mb-10">
                                    <div className={`p-5 rounded-2xl transition-all duration-500 ${verificationStatus === 'approved' ? 'bg-indigo-100 text-indigo-600' :
                                        verificationStatus === 'pending' ? 'bg-slate-200 text-slate-500 shadow-sm' :
                                            'bg-slate-100 text-slate-500 group-hover/card:bg-indigo-600 group-hover/card:text-white group-hover/card:shadow-lg transition-colors'
                                        }`}>
                                        {verificationStatus === 'approved' ? <ShieldCheck size={32} /> : <Shield size={32} />}
                                    </div>
                                    <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${verificationStatus === 'approved' ? 'bg-indigo-50 border-indigo-100 text-indigo-700' :
                                        'bg-slate-100 border-slate-200 text-slate-500'
                                        }`}>
                                        {verificationStatus === 'approved' ? 'Verified' :
                                            verificationStatus === 'pending' ? 'In Review' : 'Required'}
                                    </div>
                                </div>

                                <div className="flex-grow text-left">
                                    <h3 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">Verify Identity</h3>
                                    <p className="text-slate-500 font-medium leading-relaxed mb-8">
                                        Submit a government ID to earn your <span className="text-indigo-600 font-bold">Verified Badge</span> and build trust with members.
                                    </p>
                                </div>

                                <div className="mt-auto">
                                    {verificationStatus === 'approved' ? (
                                        <div className="flex items-center gap-3 py-3 px-5 bg-indigo-50 rounded-2xl border border-indigo-100">
                                            <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                                            <span className="text-sm font-bold text-indigo-700 uppercase tracking-tight"> Verified</span>
                                        </div>
                                    ) : verificationStatus === 'pending' ? (
                                        <div className="flex items-center gap-3 py-3 px-5 bg-slate-100 rounded-2xl border border-slate-200">
                                            <div className="w-2 h-2 rounded-full bg-slate-400 animate-pulse" />
                                            <span className="text-sm font-bold text-slate-600 uppercase tracking-tight">Reviewing Stats</span>
                                        </div>
                                    ) : (
                                        <label className="cursor-pointer">
                                            <div className="w-full py-4 bg-slate-100 hover:bg-slate-200 text-slate-900 rounded-2xl font-black text-sm uppercase tracking-widest transition-all hover:shadow-lg text-center">
                                                {loading ? "Processing..." : "Submit Identity"}
                                            </div>
                                            <input type="file" className="hidden" onChange={handleFileUpload} disabled={loading} accept="image/*,.pdf" />
                                        </label>
                                    )}
                                </div>
                            </div>

                            {/* Activation Card */}
                            <div
                                className={`flex flex-col p-8 sm:p-10 rounded-[2.5rem] border-2 transition-all duration-700 relative overflow-hidden group/card
                                    ${activationStatus ? 'bg-slate-50 border-slate-200' : 'bg-white border-slate-100 shadow-xl shadow-slate-200/50 hover:border-indigo-200 hover:shadow-2xl hover:shadow-indigo-500/10'}`}
                            >
                                <div className="flex items-start justify-between mb-10">
                                    <div className={`p-5 rounded-2xl transition-all duration-500 ${activationStatus ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' :
                                        'bg-slate-100 text-slate-500 group-hover/card:bg-indigo-600 group-hover/card:text-white group-hover/card:shadow-lg transition-colors'
                                        }`}>
                                        <Zap size={32} className={activationStatus ? "fill-current" : ""} />
                                    </div>
                                    <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${activationStatus ? 'bg-indigo-50 border-indigo-100 text-indigo-700' :
                                        'bg-slate-100 border-slate-200 text-slate-500'
                                        }`}>
                                        {activationStatus ? 'Active' : 'Account'}
                                    </div>
                                </div>

                                <div className="flex-grow text-left">
                                    <h3 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">Profile Activation</h3>
                                    <p className="text-slate-500 font-medium leading-relaxed mb-8">
                                        Unlock full communication features and appear in platform-wide searches forever.
                                    </p>
                                </div>

                                <div className="mt-auto">
                                    {activationStatus ? (
                                        <div className="flex items-center gap-3 py-3 px-5 bg-indigo-50 rounded-2xl border border-indigo-100">
                                            <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                                            <span className="text-sm font-bold text-indigo-700 uppercase tracking-tight">Lifetime Access Active</span>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => setShowPaymentModal(true)}
                                            className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-sm uppercase tracking-widest transition-all hover:scale-[1.02] shadow-xl shadow-indigo-500/20"
                                        >
                                            Activate Profile
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {!activationStatus && (
                            <div className="mt-12 p-6 bg-rose-50 rounded-2xl border border-rose-100 flex items-start gap-4 mx-auto max-w-2xl">
                                <AlertCircle className="text-rose-500 flex-shrink-0 mt-1" size={20} />
                                <p className="text-xs text-rose-800 font-bold leading-relaxed text-left">
                                    **Profile Activation** is required to see and connected with other users.
                                </p>
                            </div>
                        )}

                        {showPaymentModal && activationPlan && (
                            <UnifiedActivationModal
                                plan={activationPlan}
                                onClose={() => setShowPaymentModal(false)}
                            />
                        )}
                    </motion.div>
                );
            default:
                return null;
        }
    };

    const badge = getStepBadge();

    return (
        <div className="min-h-screen bg-white font-sans text-gray-900 selection:bg-blue-100 selection:text-blue-900">
            <div className="flex flex-col items-center justify-center min-h-screen px-6 py-12 text-center">
                {/* Status Bar */}
                <div className="w-full max-w-lg mb-8 flex gap-2">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${step >= i ? 'bg-blue-600' : 'bg-gray-100'}`} />
                    ))}
                </div>

                {/* Category Badge */}
                <motion.div
                    key={step + "badge"}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className={`inline-flex items-center gap-2 px-4 py-1.5 mb-6 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm transition-colors duration-500 ${badge.color}`}
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
                    className={step === 4 ? "hidden" : "mb-8"}
                >
                    <h1 className="text-4xl font-black tracking-tight mb-3 text-gray-900 max-w-xl leading-tight">
                        {step === 1 ? "Start your journey here" : step === 2 ? "Tell us who you are" : step === 3 ? "Career & Home" : ""}
                    </h1>
                    <p className="text-gray-400 text-base font-medium max-w-sm mx-auto">
                        {"These details help us introduce you to the right people."}
                    </p>
                </motion.div>

                {/* Content Area */}
                <div className="w-full max-w-4xl min-h-[450px] relative">
                    <AnimatePresence mode="wait" custom={direction}>
                        {renderStepContent()}
                    </AnimatePresence>
                </div>

                {/* Navigation */}
                <div className="mt-8 flex items-center justify-center gap-6">
                    {step > 1 && step !== 4 && (
                        <button
                            onClick={prevStep}
                            className="px-8 py-4 rounded-xl text-sm font-bold text-gray-400 hover:text-gray-600 transition-all border-2 border-gray-50 hover:border-gray-100"
                        >
                            Back
                        </button>
                    )}

                    {step < 3 ? (
                        <button
                            onClick={nextStep}
                            className="px-12 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-black shadow-xl shadow-blue-200 transition-all flex items-center gap-2 group"
                        >
                            Continue
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </button>
                    ) : step === 3 ? (
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="px-16 py-4 bg-gray-900 hover:bg-black text-white rounded-xl text-sm font-black shadow-xl shadow-gray-200 transition-all disabled:opacity-50 flex items-center gap-2 group"
                        >
                            {loading ? "Saving..." : "Verify & Activate"}
                            {!loading && <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />}
                        </button>
                    ) : (
                        activationStatus && (
                            <button
                                onClick={handleSubmit}
                                className="px-16 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-black shadow-xl shadow-blue-200 transition-all flex items-center gap-2 group"
                            >
                                View Your Top Matches
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </button>
                        )
                    )}
                </div>
            </div>
        </div>
    );
};

export default OnboardingPage;
