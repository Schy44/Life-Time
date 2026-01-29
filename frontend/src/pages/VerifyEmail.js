import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import authService from '../services/authService';
import Logo from '../assets/images/Logo.png';
import { Mail, Check } from 'lucide-react';

const VerifyEmail = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { updateUser } = useAuth();

    const { email, name, password } = location.state || {};

    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [resending, setResending] = useState(false);
    const [resendSuccess, setResendSuccess] = useState(false);

    useEffect(() => {
        // Redirect if no email in state
        if (!email) {
            navigate('/register');
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
        setError('');

        const otpCode = otp.join('');
        if (otpCode.length !== 6) {
            setError('Please enter the complete 6-digit code');
            return;
        }

        setLoading(true);

        try {
            const response = await authService.verifyEmail(email, otpCode, name, password);
            updateUser(response.user);
            navigate('/onboarding');
        } catch (error) {
            console.error('Verification failed', error);
            setError(error.response?.data?.error || 'Invalid or expired code. Please try again.');
            setOtp(['', '', '', '', '', '']);
            document.getElementById('otp-0')?.focus();
        } finally {
            setLoading(false);
        }
    };

    const handleResendOTP = async () => {
        setResending(true);
        setResendSuccess(false);
        setError('');

        try {
            await authService.resendOTP(email);
            setResendSuccess(true);
            setTimeout(() => setResendSuccess(false), 3000);
        } catch (error) {
            console.error('Resend failed', error);
            setError('Failed to resend code. Please try again.');
        } finally {
            setResending(false);
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

            {/* Right Side - Verification Form (50%) */}
            <div className="w-full md:w-1/2 flex items-center justify-center p-8 md:p-12 lg:p-16">
                <div className="w-full max-w-md">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-lavender-100 rounded-full mb-4">
                            <Mail className="h-8 w-8 text-lavender-600" />
                        </div>
                        <h2 className="text-3xl font-bold text-gray-800 mb-2">
                            Verify Your Email
                        </h2>
                        <p className="text-gray-600">
                            We've sent a 6-digit code to
                        </p>
                        <p className="text-lavender-600 font-semibold">
                            {email}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* OTP Input */}
                        <div>
                            <label className="text-sm font-medium text-gray-700 block mb-3 text-center">
                                Enter Verification Code
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

                        {/* Error Message */}
                        {error && (
                            <div className="p-3 rounded-xl bg-red-50 border border-red-200">
                                <p className="text-sm text-red-600 text-center">{error}</p>
                            </div>
                        )}

                        {/* Success Message */}
                        {resendSuccess && (
                            <div className="p-3 rounded-xl bg-green-50 border border-green-200">
                                <p className="text-sm text-green-600 text-center flex items-center justify-center gap-2">
                                    <Check className="h-4 w-4" />
                                    New code sent successfully!
                                </p>
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading || otp.join('').length !== 6}
                            className="w-full p-3 rounded-xl bg-lavender-600 text-white font-bold text-lg 
                            hover:bg-lavender-700 transition duration-300 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Verifying...' : 'Verify Email'}
                        </button>
                    </form>

                    {/* Resend Code */}
                    <div className="mt-6 text-center">
                        <p className="text-gray-600 text-sm mb-2">
                            Didn't receive the code?
                        </p>
                        <button
                            type="button"
                            onClick={handleResendOTP}
                            disabled={resending}
                            className="text-lavender-600 font-semibold hover:text-lavender-700 hover:underline disabled:opacity-50"
                        >
                            {resending ? 'Sending...' : 'Resend Code'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VerifyEmail;
