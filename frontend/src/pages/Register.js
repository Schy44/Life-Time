import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import authService from '../services/authService';
import Logo from '../assets/images/Logo.png';
import { Eye, EyeOff, Mail, Lock, User, AlertCircle } from 'lucide-react';

const Register = () => {
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [password2, setPassword2] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [fieldErrors, setFieldErrors] = useState({});
    const [generalError, setGeneralError] = useState('');

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFieldErrors({});
        setGeneralError('');

        if (password !== password2) {
            setFieldErrors({ confirmPassword: 'Passwords do not match!' });
            return;
        }

        if (password.length < 8) {
            setFieldErrors({ password: 'Password must be at least 8 characters long' });
            return;
        }

        setLoading(true);

        try {
            await authService.register(name, email, password);
            navigate('/verify-email', {
                state: { email, name, password }
            });
        } catch (error) {
            console.error('Registration failed', error);
            const data = error.response?.data;

            if (data && typeof data === 'object') {
                // Map backend errors to fields or general error
                const errors = {};
                let hasMapped = false;

                if (data.email) { errors.email = Array.isArray(data.email) ? data.email[0] : data.email; hasMapped = true; }
                if (data.username) { errors.name = Array.isArray(data.username) ? data.username[0] : data.username; hasMapped = true; }
                if (data.password) { errors.password = Array.isArray(data.password) ? data.password[0] : data.password; hasMapped = true; }
                if (data.error) { setGeneralError(data.error); hasMapped = true; }

                if (!hasMapped) {
                    setGeneralError('Registration failed. Please check your details.');
                }
                setFieldErrors(errors);
            } else {
                setGeneralError('Connection error. Please try again later.');
            }
        }
    };

    return (
        <div className="min-h-screen flex w-full bg-slate-50">
            {/* Left Side - Hero (60%) */}
            <div className="hidden lg:block lg:w-[60%] relative overflow-hidden">
                <img src={Logo} alt="Life Time Hero"
                    className="absolute inset-0 w-full h-full object-cover scale-105 hover:scale-100 transition-transform duration-10000" />
                <div className="absolute inset-0 bg-gradient-to-tr from-black/60 via-black/20 to-transparent"></div>
                <div className="absolute bottom-20 left-20 text-white max-w-lg">
                    <h1 className="text-6xl font-black leading-tight mb-6">Find your eternal partner.</h1>
                    <p className="text-xl text-gray-200 font-medium">Join thousands of others searching for a meaningful and lasting connection.</p>
                </div>
            </div>

            {/* Right Side - Form (40%) */}
            <div className="w-full lg:w-[40%] flex items-center justify-center p-6 md:p-12 bg-white shadow-2xl z-10">
                <div className="w-full max-w-md space-y-8">
                    <div className="text-center md:text-left">
                        <Link to="/" className="lg:hidden inline-block mb-8">
                            <img src={Logo} alt="Logo" className="h-8" />
                        </Link>
                        <h2 className="text-4xl font-black text-gray-900 tracking-tight mb-2">
                            Create Account
                        </h2>
                        <p className="text-gray-500 font-medium">
                            Join the community and find your soulmate.
                        </p>
                    </div>

                    <AnimatePresence>
                        {generalError && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="p-4 rounded-2xl bg-red-50 border border-red-100 flex items-center gap-3 text-red-600 shadow-sm"
                            >
                                <AlertCircle className="shrink-0" size={20} />
                                <p className="text-sm font-bold">{generalError}</p>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <InputField
                            label="Full Name"
                            icon={User}
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Your name"
                            error={fieldErrors.name}
                        />

                        <InputField
                            label="Email Address"
                            icon={Mail}
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="hello@example.com"
                            error={fieldErrors.email}
                        />

                        <InputField
                            label="Password"
                            icon={Lock}
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Min 8 characters"
                            error={fieldErrors.password}
                        >
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-lavender-600 transition-colors"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </InputField>

                        <InputField
                            label="Confirm Password"
                            icon={Lock}
                            type={showConfirmPassword ? "text" : "password"}
                            value={password2}
                            onChange={(e) => setPassword2(e.target.value)}
                            placeholder="Repeat password"
                            error={fieldErrors.confirmPassword}
                        >
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-lavender-600 transition-colors"
                            >
                                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </InputField>

                        <div className="pt-4">
                            <motion.button
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.98 }}
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 px-6 bg-lavender-600 hover:bg-lavender-700 text-white font-black 
                                rounded-2xl shadow-xl shadow-lavender-200 hover:shadow-lavender-300 transition-all duration-300 
                                flex items-center justify-center gap-3 disabled:opacity-70 disabled:grayscale"
                            >
                                {loading ? (
                                    <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    "Create Account"
                                )}
                            </motion.button>
                        </div>
                    </form>

                    <div className="text-center pt-4">
                        <p className="text-gray-500 font-medium">
                            Already have an account?{' '}
                            <Link
                                to="/login"
                                className="font-black text-lavender-600 hover:text-lavender-700 transition-colors"
                            >
                                Login here
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;

const InputField = ({ label, icon: Icon, type, value, onChange, placeholder, name, error, children, className }) => (
    <div className="space-y-1">
        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">
            {label}
        </label>
        <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Icon className={`h-5 w-5 transition-colors ${error ? 'text-red-400' : 'text-gray-400 group-focus-within:text-lavender-500'}`} />
            </div>
            <input
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className={`w-full pl-11 pr-4 py-3.5 rounded-2xl border bg-gray-50 focus:bg-white focus:ring-4 outline-none transition-all duration-300 ${error
                    ? 'border-red-200 focus:border-red-500 focus:ring-red-100'
                    : 'border-gray-100 focus:border-lavender-500 focus:ring-lavender-100'
                    } ${className}`}
                required
            />
            {children}
        </div>
        <AnimatePresence>
            {error && (
                <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-xs font-semibold text-red-500 ml-1 flex items-center gap-1"
                >
                    <AlertCircle size={12} /> {error}
                </motion.p>
            )}
        </AnimatePresence>
    </div>
);
