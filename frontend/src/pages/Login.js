import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import Logo from '../assets/images/Logo.png';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;

            navigate('/onboarding');
        } catch (error) {
            console.error('Login failed', error);
            alert(`Login failed: ${error.message}`);
        }
    };

    return (
        <div className="min-h-screen flex w-full bg-white">
            {/* Left Side - Logo/Image (50%) */}
            <div className="hidden md:block md:w-1/2 relative">
                <img
                    src={Logo}
                    alt="Life Time Logo"
                    className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-20"></div>
            </div>

            {/* Right Side - Login Form (50%) */}
            <div className="w-full md:w-1/2 flex items-center justify-center p-8 md:p-12 lg:p-16">
                <div className="w-full max-w-md">
                    <h2 className="text-3xl font-bold text-gray-800 mb-4 text-center">
                        Login to Your Account
                    </h2>
                    <p className="text-gray-600 mb-8 text-center">
                        Enter your details below
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Email */}
                        <div>
                            <label className="text-sm font-medium text-gray-700 block mb-1">
                                Email Address
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-lavender-500 transition-colors" />
                                </div>
                                <input
                                    type="email"
                                    placeholder="name@example.com"
                                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 
                                    focus:bg-white focus:border-lavender-500 focus:ring-2 focus:ring-lavender-200 
                                    outline-none transition-all duration-200"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <div className="flex justify-between items-center">
                                <label className="text-sm font-medium text-gray-700 block mb-1">
                                    Password
                                </label>
                                <Link
                                    to="/forgot-password"
                                    className="text-xs font-medium text-lavender-600 hover:text-lavender-700 hover:underline"
                                >
                                    Forgot password?
                                </Link>
                            </div>

                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-lavender-500 transition-colors" />
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Password"
                                    className="w-full pl-10 pr-12 py-3 rounded-xl border border-gray-200 bg-gray-50 
                                    focus:bg-white focus:border-lavender-500 focus:ring-2 focus:ring-lavender-200 
                                    outline-none transition-all duration-200"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            className="w-full p-3 rounded-xl bg-lavender-600 text-white font-bold text-lg 
                            hover:bg-lavender-700 transition duration-300 shadow-md"
                        >
                            Login
                        </button>
                    </form>

                    {/* Footer */}
                    <div className="mt-8 text-center">
                        <p className="text-gray-600">
                            Don't have an account?{' '}
                            <Link
                                to="/register"
                                className="font-bold text-lavender-600 hover:text-lavender-700 hover:underline"
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
