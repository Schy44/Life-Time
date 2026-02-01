import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Logo from '../assets/images/Logo.png';
import { Eye, EyeOff, Mail, Lock, AlertCircle, Sun, Moon } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();
    const { theme, toggleTheme } = useTheme();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await login(email, password);
            if (response.user?.onboarding_completed) {
                navigate('/match-preview');
            } else {
                navigate('/onboarding');
            }
        } catch (error) {
            console.error('Login failed', error);
            const data = error.response?.data;
            setError(data?.error || data?.detail || 'Invalid email or password. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex w-full bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
            {/* Left Side - Hero (60%) */}
            <div className="hidden lg:block lg:w-[60%] relative overflow-hidden">
                <img src={Logo} alt="Life Time Hero"
                    className="absolute inset-0 w-full h-full object-cover scale-105" />
                <div className="absolute inset-0 bg-gradient-to-tr from-black/60 via-black/20 to-transparent"></div>
                <div className="absolute bottom-20 left-20 text-white max-w-lg">
                    <h1 className="text-6xl font-black leading-tight mb-6">Welcome Back.</h1>
                    <p className="text-xl text-gray-200 font-medium">Continue your journey and connect with your perfect match today.</p>
                </div>
            </div>

            {/* Right Side - Form (40%) */}
            <div className="w-full lg:w-[40%] flex items-center justify-center p-6 md:p-12 bg-white dark:bg-slate-800 shadow-2xl z-10 transition-colors duration-300 relative">
                {/* Theme Toggle */}
                <button
                    onClick={toggleTheme}
                    className="absolute top-6 right-6 p-2 rounded-full bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
                >
                    {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                </button>

                <div className="w-full max-w-md space-y-8">
                    <div className="text-center md:text-left">
                        <Link to="/" className="lg:hidden inline-block mb-8">
                            <img src={Logo} alt="Logo" className="h-8" />
                        </Link>
                        <h2 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight mb-2">
                            Login
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400 font-medium">
                            Enter your credentials to access your account.
                        </p>
                    </div>

                    <AnimatePresence>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="p-4 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/50 flex items-center gap-3 text-red-600 dark:text-red-400 shadow-sm"
                            >
                                <AlertCircle className="shrink-0" size={20} />
                                <p className="text-sm font-bold">{error}</p>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <InputField
                            label="Email Address"
                            icon={Mail}
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="hello@example.com"
                            error={error && !email.includes('@')}
                        />

                        <InputField
                            label="Password"
                            icon={Lock}
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            error={error}
                        >
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 dark:text-gray-500 hover:text-lavender-600 dark:hover:text-lavender-400 transition-colors"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </InputField>

                        <div className="flex justify-end">
                            <Link
                                to="/forgot-password"
                                className="text-xs font-black text-lavender-600 dark:text-lavender-400 hover:text-lavender-700 dark:hover:text-lavender-300 uppercase tracking-wider"
                            >
                                Forgot password?
                            </Link>
                        </div>

                        <div className="pt-2">
                            <motion.button
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.98 }}
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 px-6 bg-lavender-600 hover:bg-lavender-700 text-white font-black 
                                rounded-2xl shadow-xl shadow-lavender-200 dark:shadow-none hover:shadow-lavender-300 transition-all duration-300 
                                flex items-center justify-center gap-3 disabled:opacity-70 disabled:grayscale"
                            >
                                {loading ? (
                                    <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    "Log In"
                                )}
                            </motion.button>
                        </div>
                    </form>

                    <div className="text-center pt-4">
                        <p className="text-gray-500 dark:text-gray-400 font-medium">
                            Don't have an account?{' '}
                            <Link
                                to="/register"
                                className="font-black text-lavender-600 dark:text-lavender-400 hover:text-lavender-700 dark:hover:text-lavender-300 transition-colors"
                            >
                                Create Account
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;

const InputField = ({ label, icon: Icon, type, value, onChange, placeholder, error, children }) => (
    <div className="space-y-1">
        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">
            {label}
        </label>
        <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Icon className={`h-5 w-5 transition-colors ${error ? 'text-red-400' : 'text-gray-400 dark:text-gray-500 group-focus-within:text-lavender-500 dark:group-focus-within:text-lavender-400'}`} />
            </div>
            <input
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className={`w-full pl-11 pr-4 py-3.5 rounded-2xl border bg-gray-50 dark:bg-slate-700 dark:text-white dark:border-slate-600 focus:bg-white dark:focus:bg-slate-700 focus:ring-4 outline-none transition-all duration-300 ${error
                    ? 'border-red-200 dark:border-red-800 focus:border-red-500 focus:ring-red-100 dark:focus:ring-red-900/30'
                    : 'border-gray-100 dark:border-slate-700 focus:border-lavender-500 dark:focus:border-lavender-500 focus:ring-lavender-100 dark:focus:ring-lavender-500/20'
                    }`}
                required
            />
            {children}
        </div>
    </div>
);
