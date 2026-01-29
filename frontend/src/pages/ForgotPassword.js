import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import Logo from '../assets/images/Logo.png';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            await authService.requestPasswordReset(email);
            setSubmitted(true);
            // Redirect to reset password page after 2 seconds
            setTimeout(() => {
                navigate('/reset-password', { state: { email } });
            }, 2000);
        } catch (err) {
            console.error('Password reset error:', err);
            setError(err.response?.data?.error || 'Failed to send reset code. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
                <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center space-y-6 border border-gray-100">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mb-2">
                        <CheckCircle2 size={32} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Check your email</h2>
                        <p className="mt-2 text-gray-600">
                            We've sent a 6-digit verification code to <span className="font-semibold">{email}</span>.
                        </p>
                        <p className="mt-2 text-sm text-gray-500">
                            Redirecting to password reset page...
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex w-full bg-white">
            {/* Left Side - Consistent with Login */}
            <div className="hidden md:block md:w-1/2 relative">
                <img
                    src={Logo}
                    alt="Life Time Logo"
                    className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-20"></div>
            </div>

            {/* Right Side - Form */}
            <div className="w-full md:w-1/2 flex items-center justify-center p-8 md:p-12 lg:p-16">
                <div className="w-full max-w-md">
                    <Link
                        to="/login"
                        className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-700 mb-8 transition-colors"
                    >
                        <ArrowLeft size={16} />
                        Back to Login
                    </Link>

                    <h2 className="text-3xl font-bold text-gray-800 mb-2">
                        Reset Password
                    </h2>
                    <p className="text-gray-600 mb-8">
                        Enter your email address and we'll send you a verification code to reset your password.
                    </p>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
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

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full p-3 rounded-xl bg-lavender-600 text-white font-bold text-lg 
                            transition duration-300 shadow-md flex items-center justify-center ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-lavender-700'
                                }`}
                        >
                            {loading ? (
                                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                'Send Verification Code'
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
