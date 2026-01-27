import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import Logo from '../assets/images/Logo.png';
import { Eye, EyeOff, Mail, Lock, Check, X } from 'lucide-react';

const Register = () => {
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [password2, setPassword2] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const [passwordsMatch, setPasswordsMatch] = useState(true);
    const [passwordLengthValid, setPasswordLengthValid] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        setPasswordsMatch(password === password2 || password2 === '');
        setPasswordLengthValid(password.length >= 6);
    }, [password, password2]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password !== password2) {
            alert('Passwords do not match!');
            return;
        }

        if (password.length < 6) {
            alert('Password must be at least 6 characters long');
            return;
        }

        setLoading(true);

        try {
            const { error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        name: name,
                    },
                    emailRedirectTo: `${window.location.origin}/onboarding`,
                }
            });

            if (error) throw error;

            alert('Registration successful! Let\'s build your profile.');
            navigate('/onboarding');
        } catch (error) {
            console.error('Registration failed', error);
            alert(`Registration failed: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex w-full bg-white">
            {/* Left Side - Logo (50%) */}
            <div className="hidden md:block md:w-1/2 relative">
                <img src={Logo} alt="Life Time Logo"
                    className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black bg-opacity-20"></div>
            </div>

            {/* Right Side - Register Form (50%) */}
            <div className="w-full md:w-1/2 flex items-center justify-center p-8 md:p-12 lg:p-16">
                <div className="w-full max-w-md">
                    <h2 className="text-3xl font-bold text-gray-800 mb-4 text-center">
                        Create Account
                    </h2>
                    <p className="text-gray-600 mb-8 text-center">
                        Begin your journey to find your eternal partner
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-4">

                        {/* Full Name */}
                        <div>
                            <label className="block text-gray-700 text-sm font-medium mb-1">
                                Full Name
                            </label>
                            <input
                                type="text"
                                placeholder="Full Name"
                                className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-gray-700 text-sm font-medium mb-1">
                                Email Address
                            </label>
                            <input
                                type="email"
                                placeholder="Email Address"
                                className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-gray-700 text-sm font-medium mb-1">
                                Password
                            </label>

                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                </div>

                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Password (min 6 characters)"
                                    className={`w-full pl-10 pr-12 py-3 rounded-xl border bg-gray-50 focus:bg-white focus:ring-2 outline-none transition-all duration-200 ${password.length > 0 && !passwordLengthValid
                                        ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                                        : 'border-gray-200 focus:border-lavender-500 focus:ring-lavender-200'
                                        }`}
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

                            {password.length > 0 && (
                                <div className="flex items-center gap-1 text-xs mt-1">
                                    {passwordLengthValid
                                        ? <Check className="h-3 w-3 text-green-500" />
                                        : <X className="h-3 w-3 text-red-500" />
                                    }
                                    <span className={passwordLengthValid ? "text-green-600" : "text-red-500"}>
                                        At least 6 characters
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label className="block text-gray-700 text-sm font-medium mb-1">
                                Confirm Password
                            </label>

                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                </div>

                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    placeholder="Confirm Password"
                                    className={`w-full pl-10 pr-12 py-3 rounded-xl border bg-gray-50 focus:bg-white focus:ring-2 outline-none transition-all duration-200 ${password2.length > 0 && !passwordsMatch
                                        ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                                        : 'border-gray-200 focus:border-lavender-500 focus:ring-lavender-200'
                                        }`}
                                    value={password2}
                                    onChange={(e) => setPassword2(e.target.value)}
                                    required
                                />

                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                                >
                                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>

                            {password2.length > 0 && (
                                <div className="flex items-center gap-1 text-xs mt-1">
                                    {passwordsMatch
                                        ? <Check className="h-3 w-3 text-green-500" />
                                        : <X className="h-3 w-3 text-red-500" />
                                    }
                                    <span className={passwordsMatch ? "text-green-600" : "text-red-500"}>
                                        Passwords match
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3.5 px-4 bg-lavender-600 hover:bg-lavender-700 text-white font-bold 
                            rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 
                            flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? "Creating Account..." : "Create Account"}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-gray-600">
                            Already have an account?{' '}
                            <Link
                                to="/login"
                                className="font-bold text-lavender-600 hover:text-lavender-700 hover:underline"
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
