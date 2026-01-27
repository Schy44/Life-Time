import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CreditCard, Globe, AlertCircle, Loader2, CheckCircle, Zap, ShieldCheck, ArrowLeft } from 'lucide-react';
import apiClient from '../lib/api';
import GlassCard from './GlassCard';

/**
 * UnifiedActivationModal
 * A side-by-side modal for profile activation.
 * Left: Activation Plan details.
 * Right: Payment method selection and initiation.
 */
const UnifiedActivationModal = ({ plan, onClose }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [currency, setCurrency] = useState('BDT');

    if (!plan) return null;

    const getAmountDisplay = () => {
        const amountBdt = plan.price_bdt;
        if (currency === 'BDT') return `৳${amountBdt}`;
        const rate = 0.0085;
        const amountUsd = (amountBdt * rate).toFixed(2);
        return `$${amountUsd}`;
    };

    const handlePayment = async (gateway) => {
        setLoading(true);
        setError(null);
        try {
            const payload = {
                gateway: gateway,
                currency: currency,
                plan_slug: plan.slug,
            };

            const response = await apiClient.post('/subscription/initiate-payment/', payload);

            if (response.data.payment_url) {
                window.location.href = response.data.payment_url;
            } else {
                setError("Failed to get payment URL from gateway.");
            }
        } catch (err) {
            console.error("Payment Error:", err);
            setError(err.response?.data?.error || "Payment initiation failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const features = [
        { text: 'Profile Visibility to All Users', included: true },
        { text: 'Send Connection Requests', included: true },
        { text: 'Basic Search Access', included: true },
        { text: 'Verified Badge (after ID check)', included: true },
        { text: 'Unlimited Profile Views', included: true },
    ];

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="w-full max-w-4xl relative"
                >
                    <button
                        onClick={onClose}
                        className="absolute -top-12 right-0 p-2 text-white/70 hover:text-white transition-colors"
                    >
                        <X size={28} />
                    </button>

                    <div className="overflow-hidden rounded-[2.5rem] border border-slate-100 relative shadow-2xl">

                        {/* Harmonious Light Modal Container */}
                        <div className="bg-white text-slate-900 overflow-hidden flex flex-col md:flex-row shadow-2xl">

                            {/* Left Section: Context & Plan */}
                            <div className="flex-1 p-8 md:p-12 bg-slate-50 border-r border-slate-100 relative">
                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white rounded-full text-[10px] font-black uppercase tracking-widest mb-8 border border-slate-200 text-slate-500 shadow-sm">
                                    <Zap size={12} className="fill-current text-indigo-500" />
                                    Account Activation
                                </div>

                                <h2 className="text-4xl font-black mb-4 leading-tight tracking-tight text-slate-900">Lifetime<br />Access</h2>
                                <p className="text-slate-500 text-sm mb-12 font-medium leading-relaxed max-w-xs">
                                    Secure your place in our community and enjoy full access to all premium features forever.
                                </p>

                                <div className="space-y-4 mb-12">
                                    {features.map((f, i) => (
                                        <div key={i} className="flex items-center gap-4">
                                            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center">
                                                <CheckCircle size={14} className="text-emerald-600" />
                                            </div>
                                            <span className="text-sm font-semibold text-slate-700">{f.text}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-auto border-t border-slate-200 pt-8">
                                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Total Amount</div>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-5xl font-black text-slate-900">৳{plan.price_bdt}</span>
                                        <span className="text-slate-400 font-bold text-xs uppercase">BDT</span>
                                    </div>
                                    <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-widest">One-time payment</p>
                                </div>
                            </div>

                            {/* Right Section: Checkout */}
                            <div className="flex-1 p-8 md:p-12 flex flex-col bg-white relative">
                                <div className="flex justify-between items-center mb-10">
                                    <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Checkout</h3>
                                    <div className="flex bg-slate-50 rounded-2xl p-1 border border-slate-100 shadow-inner">
                                        <button
                                            onClick={() => setCurrency('BDT')}
                                            className={`px-5 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all duration-300 ${currency === 'BDT' ? 'bg-white text-slate-900 shadow-sm border border-slate-100' : 'text-slate-400 hover:text-slate-600'}`}
                                        >
                                            BDT
                                        </button>
                                        <button
                                            onClick={() => setCurrency('USD')}
                                            className={`px-5 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all duration-300 ${currency === 'USD' ? 'bg-white text-slate-900 shadow-sm border border-slate-100' : 'text-slate-400 hover:text-slate-600'}`}
                                        >
                                            USD
                                        </button>
                                    </div>
                                </div>

                                <div className="mb-10 p-8 bg-slate-900 rounded-[2rem] flex justify-between items-center shadow-xl shadow-slate-900/20 relative overflow-hidden group/pay">
                                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-transparent opacity-0 group-hover/pay:opacity-100 transition-opacity duration-700" />
                                    <div className="relative z-10 text-left">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Total Due</p>
                                        <p className="text-4xl font-black text-white leading-none tracking-tight">{getAmountDisplay()}</p>
                                    </div>
                                    <div className="relative z-10 p-4 bg-white/10 rounded-2xl border border-white/20 group-hover/pay:border-emerald-500/30 transition-all duration-500">
                                        <ShieldCheck size={32} className="text-white/40 group-hover/pay:text-emerald-400 transition-colors" />
                                    </div>
                                </div>

                                {error && (
                                    <div className="mb-6 p-4 bg-rose-50 text-rose-600 text-xs font-bold rounded-xl flex items-start gap-3 border border-rose-100">
                                        <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                                        {error}
                                    </div>
                                )}

                                <div className="space-y-4">
                                    <button
                                        onClick={() => handlePayment('stripe')}
                                        disabled={loading}
                                        className="w-full flex items-center justify-between p-5 rounded-[1.5rem] border border-slate-100 hover:border-indigo-600 hover:bg-slate-50 transition-all group disabled:opacity-50"
                                    >
                                        <div className="flex items-center gap-5">
                                            <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500 shadow-sm">
                                                <CreditCard size={24} />
                                            </div>
                                            <div className="text-left">
                                                <p className="font-extrabold text-slate-900 text-base">Debit / Credit Card</p>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Powered by Stripe</p>
                                            </div>
                                        </div>
                                        <div className="w-8 h-8 rounded-full border border-slate-100 flex items-center justify-center group-hover:border-indigo-600 transition-all duration-500">
                                            <div className="w-2.5 h-2.5 rounded-full bg-indigo-600 opacity-0 group-hover:opacity-100 scale-0 group-hover:scale-100 transition-all duration-500" />
                                        </div>
                                    </button>

                                    <button
                                        onClick={() => handlePayment('sslcommerz')}
                                        disabled={loading}
                                        className="w-full flex items-center justify-between p-5 rounded-[1.5rem] border border-slate-100 hover:border-indigo-600 hover:bg-slate-50 transition-all group disabled:opacity-50"
                                    >
                                        <div className="flex items-center gap-5">
                                            <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500 shadow-sm">
                                                <Globe size={24} />
                                            </div>
                                            <div className="text-left">
                                                <p className="font-extrabold text-slate-900 text-base">Local Payments</p>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">BKash / Nagad / Local bank</p>
                                            </div>
                                        </div>
                                        <div className="w-8 h-8 rounded-full border border-slate-100 flex items-center justify-center group-hover:border-indigo-600 transition-all duration-500">
                                            <div className="w-2.5 h-2.5 rounded-full bg-indigo-600 opacity-0 group-hover:opacity-100 scale-0 group-hover:scale-100 transition-all duration-500" />
                                        </div>
                                    </button>
                                </div>

                                <div className="mt-auto pt-10 flex flex-col items-center">
                                    <button
                                        onClick={() => onClose()}
                                        className="px-8 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-all flex items-center gap-2 group/back"
                                    >
                                        <ArrowLeft size={14} className="group-hover/back:-translate-x-1 transition-transform" />
                                        Return to Onboarding
                                    </button>
                                    <p className="mt-4 text-[9px] text-center text-slate-400 font-bold uppercase tracking-widest">
                                        Secure 256-bit encrypted checkout
                                    </p>
                                </div>
                            </div>

                            {loading && (
                                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center rounded-[2.5rem]">
                                    <div className="flex flex-col items-center">
                                        <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
                                        <span className="text-[11px] font-black uppercase tracking-widest text-slate-900">Finalizing...</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default UnifiedActivationModal;
