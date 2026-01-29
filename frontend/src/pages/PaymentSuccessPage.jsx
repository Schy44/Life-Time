import React, { useEffect, useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { CheckCircle, ArrowRight, Loader2, Receipt, User, Mail } from 'lucide-react';
import Confetti from 'react-confetti';
import apiClient from '../lib/api';
import Logo from '../assets/images/Logo.png';

const PaymentSuccessPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [verifying, setVerifying] = useState(true);
    const [verified, setVerified] = useState(false);
    const [paymentDetails, setPaymentDetails] = useState(null);
    const [matches, setMatches] = useState([]);
    const [loadingMatches, setLoadingMatches] = useState(false);
    const [error, setError] = useState(null);
    const queryClient = useQueryClient();

    const [windowSize, setWindowSize] = useState({
        width: window.innerWidth,
        height: window.innerHeight,
    });

    const txnId = searchParams.get('txn_id');
    const sessionId = searchParams.get('session_id');

    useEffect(() => {
        const handleResize = () => {
            setWindowSize({ width: window.innerWidth, height: window.innerHeight });
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const verifyPayment = async () => {
            if (!txnId && !sessionId) {
                setVerifying(false);
                return;
            }
            try {
                const gatewayParam = sessionId ? 'stripe' : 'sslcommerz';
                const response = await apiClient.post(`/subscription/payment-callback/?gateway=${gatewayParam}`, {
                    session_id: sessionId,
                    txn_id: txnId
                });

                if (response.data.status === 'Payment Successful' || response.data.message === 'Already processed') {
                    setVerified(true);
                    setPaymentDetails(response.data);
                    queryClient.invalidateQueries({ queryKey: ['me'] });
                    fetchMatches();
                } else {
                    setError("Payment verification failed.");
                }
            } catch (err) {
                console.error(err);
                setError(err.response?.data?.error || "Verification failed.");
            } finally {
                setVerifying(false);
            }
        };

        const fetchMatches = async () => {
            setLoadingMatches(true);
            try {
                const response = await apiClient.get('/profiles/recommendations/?limit=3');
                setMatches(response.data.matches || []);
            } catch (err) {
                console.error(err);
            } finally {
                setLoadingMatches(false);
            }
        };

        verifyPayment();
    }, [txnId, sessionId, queryClient]);

    return (
        <div className="min-h-screen bg-white dark:bg-[#050505] text-gray-900 dark:text-gray-100 selection:bg-indigo-100 dark:selection:bg-indigo-900/40">
            {verified && <Confetti width={windowSize.width} height={windowSize.height} recycle={false} numberOfPieces={300} gravity={0.1} />}

            <main className="max-w-6xl mx-auto px-6 pt-24 pb-20">
                {verifying ? (
                    <div className="flex flex-col items-center justify-center min-h-[40vh]">
                        <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mb-6" />
                        <h2 className="text-xl font-bold">Connecting to Bank...</h2>
                    </div>
                ) : verified ? (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                        {/* Hero Section */}
                        <div className="lg:col-span-7 space-y-12 print:hidden">
                            <div className="space-y-6">
                                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center shadow-xl shadow-green-500/20">
                                    <CheckCircle className="text-white w-8 h-8" />
                                </div>
                                <h1 className="text-6xl font-black tracking-tighter leading-none">
                                    Payment <br /> Confirmed.
                                </h1>
                                <p className="text-xl text-gray-500 dark:text-gray-400 font-medium max-w-md leading-relaxed">
                                    Your profile is now live! We've already calculated your most compatible partners based on your values & religion.
                                </p>
                            </div>

                            <div className="space-y-8">
                                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-indigo-500">Your curated matches</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                    {matches.map(match => (
                                        <div key={match.id} className="group cursor-pointer space-y-4" onClick={() => navigate(`/profiles/${match.id}`)}>
                                            <div className="aspect-[3/4] rounded-3xl overflow-hidden relative">
                                                {match.profile_image ? (
                                                    <img src={match.profile_image} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 scale-105 group-hover:scale-100" />
                                                ) : <div className="w-full h-full bg-gray-50 dark:bg-white/5 flex items-center justify-center text-gray-200"><User size={40} /></div>}
                                                <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 to-transparent aria-hidden='true'">
                                                    <p className="text-white text-[10px] font-bold uppercase tracking-widest">{match.compatibility_score}% Score</p>
                                                </div>
                                            </div>
                                            <div>
                                                <p className="font-black text-lg group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{match.name}</p>
                                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{match.current_city || 'Location Hidden'}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <button onClick={() => navigate('/match-preview')} className="group flex items-center gap-4 py-6 px-10 bg-black dark:bg-white text-white dark:text-black rounded-full font-black text-lg hover:scale-[1.02] transition-all active:scale-95 print:hidden">
                                VIEW YOUR TOP MATCHES <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>

                        {/* Details Section */}
                        <div className="lg:col-span-5 space-y-12">
                            <div className="space-y-8">
                                <h4 className="text-xs font-black uppercase tracking-[0.3em] text-gray-400">Transaction Details</h4>
                                <div className="space-y-6">
                                    <div className="flex justify-between items-end border-b border-gray-100 dark:border-white/5 pb-4">
                                        <p className="text-sm font-bold text-gray-400">Reference</p>
                                        <p className="font-mono font-bold">#{paymentDetails?.transaction?.substring(0, 12)}</p>
                                    </div>
                                    <div className="flex justify-between items-end border-b border-gray-100 dark:border-white/5 pb-4">
                                        <p className="text-sm font-bold text-gray-400">Amount</p>
                                        <p className="text-2xl font-black">{paymentDetails?.currency} {paymentDetails?.amount}</p>
                                    </div>
                                    <div className="flex justify-between items-end border-b border-gray-100 dark:border-white/5 pb-4">
                                        <p className="text-sm font-bold text-gray-400">Status</p>
                                        <p className="text-[10px] font-black uppercase text-green-500 tracking-widest">Verified</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col gap-4 print:hidden">
                                <button onClick={() => window.print()} className="flex items-center gap-3 py-4 px-6 border-2 border-gray-100 dark:border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                    <Receipt size={16} /> Receipt
                                </button>
                                <Link to="/profile" className="flex items-center gap-3 py-4 px-6 border-2 border-gray-100 dark:border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                    <User size={16} /> Your Profile
                                </Link>
                            </div>

                            <div className="py-10 border-t border-gray-100 dark:border-white/5 print:hidden">
                                <p className="text-base font-bold leading-relaxed mb-8 text-gray-600 dark:text-gray-400">Need help with your account or found a discrepancy? Our team is here to help.</p>
                                <a href="mailto:lifetimehere00@gmail.com" className="inline-flex items-center gap-3 py-5 px-12 bg-indigo-600 text-white rounded-full font-black text-xs uppercase tracking-[0.2em] hover:bg-indigo-700 hover:shadow-2xl hover:shadow-indigo-600/20 transition-all">
                                    <Mail size={16} /> Contact Support
                                </a>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-8">
                        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center text-red-500 shadow-xl shadow-red-500/20">
                            <span className="text-4xl font-black">!</span>
                        </div>
                        <h2 className="text-5xl font-black tracking-tighter leading-tight">Verification <br /> Failed</h2>
                        <p className="text-gray-500 max-w-sm mx-auto">{error || "The payment could not be verified."}</p>
                        <div className="flex gap-4">
                            <button onClick={() => navigate('/upgrade')} className="py-4 px-10 bg-red-500 text-white rounded-full font-black uppercase tracking-widest text-xs hover:bg-red-600 transition-colors">Retry</button>
                            <a href="mailto:lifetimehere00@gmail.com" className="py-4 px-10 border border-gray-200 dark:border-white/10 rounded-full font-black uppercase tracking-widest text-xs hover:bg-gray-50 transition-colors">Help</a>
                        </div>
                    </div>
                )}
            </main>

            {/* Print Only Receipt */}
            <div className="hidden print:block p-12 text-black bg-white min-h-screen">
                <div className="flex justify-between items-start mb-16">
                    <img src={Logo} alt="Life-Time" className="h-12" />
                    <div className="text-right">
                        <h1 className="text-3xl font-black uppercase tracking-tighter">Official Receipt</h1>
                        <p className="text-sm font-bold text-gray-500 mt-1">Life-Time Inc. Payment Confirmation</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-12 mb-16">
                    <div className="space-y-4">
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Billed To</p>
                        <p className="font-bold text-lg">{paymentDetails?.user_name || 'Valued Customer'}</p>
                        <p className="text-sm text-gray-600">{paymentDetails?.user_email}</p>
                    </div>
                    <div className="space-y-4 text-right">
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Receipt Info</p>
                        <p className="text-sm"><strong>Reference:</strong> #{paymentDetails?.transaction}</p>
                        <p className="text-sm text-gray-600"><strong>Date:</strong> {new Date().toLocaleDateString()}</p>
                    </div>
                </div>

                <div className="border-t-2 border-b-2 border-black py-8 mb-16">
                    <div className="flex justify-between items-center text-black">
                        <div className="space-y-1">
                            <p className="font-black text-xl uppercase tracking-tight">Service: {paymentDetails?.purpose || 'Subscription'}</p>
                            <p className="text-sm text-gray-500">Profile Activation & Lifetime Access</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Total Amount</p>
                            <p className="text-3xl font-black">{paymentDetails?.currency} {paymentDetails?.amount}</p>
                        </div>
                    </div>
                </div>

                <div className="space-y-8">
                    <div className="bg-gray-50 p-6 rounded-2xl">
                        <p className="text-xs font-bold leading-relaxed text-gray-600">
                            Thank you for your trust in Life-Time. This receipt confirms your contribution to our community.
                            If you have any questions regarding this transaction, please contact us at support@lifetimehere00@gmail.com
                        </p>
                    </div>

                    <div className="text-center pt-20">
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-300">Generated by Life-Time HQ</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentSuccessPage;
