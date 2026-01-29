import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import authService from '../services/authService';
import Logo from '../assets/images/Logo.png';
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle } from 'lucide-react';

const ResetPassword = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { email } = location.state || {};

    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Redirect if no email in state
        if (!email) {
            navigate('/forgot-password');
        }
    }, [email, navigate]);

    const handleOtpChange = (index, value) => {
        if (value.length > 1) {
            value = value[0];
        }

        if (!/^\d*$/.test(value)) {
            return;
        }

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Auto-focus next input
        if (value && index < 5) {
            document.getElementById(`otp-${index + 1}`)?.focus();
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            document.getElementById(`otp-${index - 1}`)?.focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').slice(0, 6);
        if (!/^\d+$/.test(pastedData)) {
            return;
        }

        const newOtp = pastedData.split('');
        while (newOtp.length < 6) {
            newOtp.push('');
        }
        setOtp(newOtp);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            return setError("Passwords do not match.");
        }

        if (password.length < 6) {
            return setError("Password must be at least 6 characters.");
        }

        const otpCode = otp.join('');
        if (otpCode.length !== 6) {
            return setError("Please enter the complete 6-digit code.");
        }

        setLoading(true);
        setError(null);

        try {
            await authService.confirmPasswordReset(email, otpCode, password);
            setSubmitted(true);

            // Redirect to login after 3 seconds
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (err) {
            console.error('Password reset error:', err);
            setError(err.response?.data?.error || 'Invalid or expired code. Please try again.');
            setOtp(['', '', '', '', '', '']);
            document.getElementById('otp-0')?.focus();
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
                        <h2 className="text-2xl font-bold text-gray-900">Password updated</h2>
                        <p className="mt-2 text-gray-600">
                            Your password has been changed successfully. You will be redirected to the login page shortly.
                        </p>
                    </div>
                    <Link
                        to="/login"
                        className="w-full inline-block p-3 rounded-xl bg-lavender-600 text-white font-bold text-center hover:bg-lavender-700 transition"
                    >
                        Login Now
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex w-full bg-white">
            {/* Left Side - Consistent */}
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
                    <h2 className="text-3xl font-bold text-gray-800 mb-2">
                        Set New Password
                    </h2>
                    <p className="text-gray-600 mb-8">
                        Enter the verification code sent to <span className="font-semibold text-lavender-600">{email}</span> and your new password.
                    </p>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100 flex items-start gap-3">
                            <AlertCircle className="shrink-0" size={18} />
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* OTP Input */}
                        <div>
                            <label className="text-sm font-medium text-gray-700 block mb-3">
                                Verification Code
                            </label>
                            <div className="flex justify-center gap-2">
                                {otp.map((digit, index) => (
                                    <input
                                        key={index}
                                        id={`otp-${index}`}
                                        type="text"
                                        maxLength="1"
                                        className="w-12 h-14 text-center text-2xl font-bold rounded-xl border-2 border-gray-200 
                                        focus:border-lavender-500 focus:ring-2 focus:ring-lavender-200 outline-none transition-all"
                                        value={digit}
                                        onChange={(e) => handleOtpChange(index, e.target.value)}
                                        onKeyDown={(e) => handleKeyDown(index, e)}
                                        onPaste={handlePaste}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* New Password */}
                        <div>
                            <label className="text-sm font-medium text-gray-700 block mb-1">
                                New Password
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-lavender-500 transition-colors" />
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
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
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label className="text-sm font-medium text-gray-700 block mb-1">
                                Confirm New Password
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-lavender-500 transition-colors" />
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    className="w-full pl-10 pr-12 py-3 rounded-xl border border-gray-200 bg-gray-50 
                                    focus:bg-white focus:border-lavender-500 focus:ring-2 focus:ring-lavender-200 
                                    outline-none transition-all duration-200"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
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
                                'Update Password'
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <Link
                            to="/forgot-password"
                            className="text-sm text-lavender-600 hover:text-lavender-700 hover:underline"
                        >
                            Didn't receive a code? Request a new one
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
