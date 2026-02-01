import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, User, ShieldCheck, Heart } from 'lucide-react';
import AnimatedBackground from '../components/AnimatedBackground';

const InterestConfirmedPage = () => {
    const [searchParams] = useSearchParams();
    const status = searchParams.get('status');
    const type = searchParams.get('type');

    const isAccepted = status === 'accepted';
    const isFull = type === 'full';

    return (
        <>
            <AnimatedBackground />
            <div className="min-h-screen flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-md w-full bg-white/80 backdrop-blur-xl border border-white/50 rounded-[2.5rem] p-8 text-center shadow-2xl"
                >
                    <div className="flex justify-center mb-6">
                        {isAccepted ? (
                            <div className="relative">
                                <CheckCircle className="w-20 h-20 text-emerald-500" />
                                <motion.div
                                    animate={{ scale: [1, 1.2, 1] }}
                                    transition={{ repeat: Infinity, duration: 2 }}
                                    className="absolute -top-2 -right-2 bg-pink-500 rounded-full p-2 shadow-lg"
                                >
                                    <Heart className="w-6 h-6 text-white" fill="currentColor" />
                                </motion.div>
                            </div>
                        ) : (
                            <XCircle className="w-20 h-20 text-rose-500" />
                        )}
                    </div>

                    <h1 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">
                        {isAccepted ? "Interest Confirmed!" : "Request Declined"}
                    </h1>

                    <p className="text-gray-600 mb-8 font-medium leading-relaxed">
                        {isAccepted ? (
                            isFull
                                ? "You have shared your full bio-data and profile images with the sender. They can now see your complete profile."
                                : "You have successfully shared your full bio-data (excluding images) with the sender. They can view your background and contact info."
                        ) : (
                            "You have declined the interest request. No information has been shared, and your privacy remains protected."
                        )}
                    </p>

                    <div className="space-y-4">
                        <Link
                            to="/interests"
                            className="block w-full py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-blue-700 transition-all shadow-xl"
                        >
                            Open Interests Dashboard
                        </Link>

                        <Link
                            to="/"
                            className="block w-full py-4 bg-gray-100 text-gray-600 border border-gray-200 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-gray-200 transition-all"
                        >
                            Return Home
                        </Link>
                    </div>

                    <div className="mt-8 flex items-center justify-center gap-2 text-gray-400 text-[10px] uppercase font-black tracking-widest">
                        <ShieldCheck className="w-3 h-3" />
                        Secure Privacy System Active
                    </div>
                </motion.div>
            </div>
        </>
    );
};

export default InterestConfirmedPage;
