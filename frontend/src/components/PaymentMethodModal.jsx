import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CreditCard, Globe, AlertCircle, Loader2 } from 'lucide-react';
import apiClient from '../lib/api'; // Use the configured apiClient
import GlassCard from './GlassCard';

/*
  PaymentMethodModal:
  Handles selection of payment gateway (Stripe/SSLCommerz) and initiates payment.
  Accepts:
   - plan: The selected plan object (if buying subscription)
   - creditAmount: The amount of credits (if buying credits)
   - onClose: Function to close modal
*/
const PaymentMethodModal = ({ plan, creditAmount, onClose }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [currency, setCurrency] = useState('BDT');

    const getAmountDisplay = () => {
        if (!plan && !creditAmount) return '';
        
        const amountBdt = plan ? plan.price_bdt : 0; // Assuming creditAmount mapping if needed
        const symbol = currency === 'BDT' ? '৳' : '$';
        
        if (currency === 'BDT') return `৳${amountBdt}`;
        
        // Simple client-side conversion for UI preview (should match backend CurrencyService)
        const rate = 0.0085; 
        const amountUsd = (amountBdt * rate).toFixed(2);
        return `$${amountUsd}`;
    };

    const getTitleDisplay = () => {
        if (plan) return `Upgrade to ${plan.name}`;
        if (creditAmount) return `Top-up ${creditAmount} Credits`;
        return 'Checkout';
    };

    const handlePayment = async (gateway) => {
        setLoading(true);
        setError(null);
        try {
            // Construct payload
            const payload = {
                gateway: gateway,
                currency: currency,
            };

            if (plan) {
                payload.plan_slug = plan.slug;
            }

            console.log("Initiating Payment:", payload);

            // Use apiClient which handles Auth headers automatically
            const response = await apiClient.post('/subscription/initiate-payment/', payload);

            console.log("Payment Response:", response.data);

            if (response.data.payment_url) {
                // Redirect to Gateway
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

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="w-full max-w-md relative"
                >
                    <GlassCard className="p-6 rounded-2xl border border-white/20 shadow-2xl bg-white/90 dark:bg-black/90">
                        {/* Header */}
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                Select Payment Method
                            </h3>
                            <button
                                onClick={onClose}
                                className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
                            >
                                <X size={20} className="text-gray-500 dark:text-gray-400" />
                            </button>
                        </div>

                        {/* Summary */}
                        <div className="mb-6 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-100 dark:border-purple-500/20">
                            <p className="text-sm text-purple-600 dark:text-purple-300 font-medium mb-1">
                                Purchasing
                            </p>
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-lg font-bold text-gray-900 dark:text-white">
                                    {getTitleDisplay()}
                                </span>
                                <div className="flex bg-white dark:bg-black/50 rounded-lg p-1 border border-purple-200 dark:border-purple-500/30">
                                    <button 
                                        onClick={() => setCurrency('BDT')}
                                        className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${currency === 'BDT' ? 'bg-purple-600 text-white' : 'text-gray-500 hover:text-purple-600'}`}
                                    >
                                        BDT
                                    </button>
                                    <button 
                                        onClick={() => setCurrency('USD')}
                                        className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${currency === 'USD' ? 'bg-purple-600 text-white' : 'text-gray-500 hover:text-purple-600'}`}
                                    >
                                        USD
                                    </button>
                                </div>
                            </div>
                            <div className="flex justify-end">
                                <span className="text-2xl font-black text-purple-600 dark:text-purple-400">
                                    {getAmountDisplay()}
                                </span>
                            </div>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-lg flex items-center gap-2">
                                <AlertCircle size={16} />
                                {error}
                            </div>
                        )}

                        {/* Gateways */}
                        <div className="space-y-3">
                            <button
                                onClick={() => handlePayment('stripe')}
                                disabled={loading}
                                className="w-full flex items-center justify-between p-4 rounded-xl border border-gray-200 dark:border-white/10 hover:border-purple-500 dark:hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/10 transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                        <CreditCard size={20} />
                                    </div>
                                    <div className="text-left">
                                        <p className="font-semibold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                                            Pay with Card (Stripe)
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            International Cards Supported
                                        </p>
                                    </div>
                                </div>
                            </button>

                            <button
                                onClick={() => handlePayment('sslcommerz')}
                                disabled={loading}
                                className="w-full flex items-center justify-between p-4 rounded-xl border border-gray-200 dark:border-white/10 hover:border-purple-500 dark:hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/10 transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-green-50 dark:bg-green-900/20 flex items-center justify-center text-green-600 dark:text-green-400">
                                        <Globe size={20} />
                                    </div>
                                    <div className="text-left">
                                        <p className="font-semibold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                                            Pay with SSLCommerz
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            Local Bangladesh Payment Methods
                                        </p>
                                    </div>
                                </div>
                            </button>
                        </div>

                        {loading && (
                            <div className="absolute inset-0 bg-white/50 dark:bg-black/50 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                                <div className="flex flex-col items-center">
                                    <Loader2 className="w-8 h-8 text-purple-600 animate-spin mb-2" />
                                    <span className="text-sm font-medium text-gray-900 dark:text-white">Processing...</span>
                                </div>
                            </div>
                        )}

                    </GlassCard>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default PaymentMethodModal;
