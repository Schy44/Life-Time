import React, { useEffect, useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { CheckCircle, ArrowRight, Loader2 } from 'lucide-react';
import GlassCard from '../components/GlassCard';
import apiClient from '../lib/api';

const PaymentSuccessPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [verifying, setVerifying] = useState(true);
    const [verified, setVerified] = useState(false);
    const [error, setError] = useState(null);

    const txnId = searchParams.get('txn_id');
    const sessionId = searchParams.get('session_id');

    useEffect(() => {
        const verifyPayment = async () => {
            if (!txnId && !sessionId) {
                // If missing params, it might be a direct visit or premature access
                if (txnId) {
                    // Backwards compat or partial redirect? 
                    // Wait, if no session_id, we can't verify with backend logic we just wrote
                }
            }

            // Allow testing UI if no params
            if (!txnId && !sessionId) {
                setVerifying(false); // Stop loading to show "Success" default state for dev? No, error is better.
                return;
            }

            try {
                const payload = {
                    session_id: sessionId,
                    txn_id: txnId
                };

                // Assuming gateway is stripe based on presence of session_id
                const gatewayParam = sessionId ? 'stripe' : 'sslcommerz';

                const response = await apiClient.post(`/subscription/payment-callback/?gateway=${gatewayParam}`, payload);

                if (response.data.status === 'Payment Successful' || response.data.message === 'Already processed') {
                    setVerified(true);
                } else {
                    setError("Payment verification failed. Please contact support.");
                }
            } catch (err) {
                console.error(err);
                setError(err.response?.data?.error || "Verification failed.");
            } finally {
                setVerifying(false);
            }
        };

        verifyPayment();
    }, [txnId, sessionId]);

    return (
        <div className="min-h-screen pt-20 px-4 flex items-center justify-center">
            <GlassCard className="max-w-md w-full p-8 rounded-2xl border border-green-500/30 bg-green-50/50 dark:bg-green-900/10 text-center">
                {verifying ? (
                    <div className="flex flex-col items-center">
                        <Loader2 className="w-16 h-16 text-green-500 animate-spin mb-4" />
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Verifying Payment...</h2>
                        <p className="text-gray-600 dark:text-gray-300">Please wait while we confirm your transaction with the bank.</p>
                        <p className="text-xs text-gray-400 mt-2">Ref: {txnId}</p>
                    </div>
                ) : verified ? (
                    <>
                        <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
                        </div>

                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Payment Successful!</h2>

                        <p className="text-gray-600 dark:text-gray-300 mb-8">
                            Your account has been updated! You can now access your new features.
                        </p>

                        <div className="flex flex-col gap-3">
                            <button
                                onClick={() => { window.location.href = '/profiles'; }}
                                className="w-full py-3 bg-black dark:bg-white text-white dark:text-black rounded-xl font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                            >
                                Start Exploring <ArrowRight size={18} />
                            </button>
                            <Link to="/profile" className="text-sm text-gray-500 hover:underline">
                                View My Profile
                            </Link>
                        </div>
                    </>
                ) : (
                    <div className="text-red-500">
                        <h2 className="text-2xl font-bold mb-2">Verification Failed</h2>
                        <p>{error || "Invalid or missing payment details."}</p>
                        <p className="text-xs text-gray-400 mt-4">Ref: {txnId}</p>
                        <button onClick={() => navigate('/upgrade')} className="mt-4 text-blue-500 underline">Try Again</button>
                    </div>
                )}
            </GlassCard>
        </div>
    );
};

export default PaymentSuccessPage;
