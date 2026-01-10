import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';
import GlassCard from './GlassCard';
import axios from 'axios';

const SubscriptionTransfer = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);

    const handleTransfer = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setMessage(null);

        if (!email) {
            setError("Please enter an email address.");
            setLoading(false);
            return;
        }

        if (!window.confirm(`Are you sure you want to transfer your subscription to ${email}? This action cannot be undone.`)) {
            setLoading(false);
            return;
        }

        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            const response = await axios.post(
                'http://127.0.0.1:8000/api/subscription/transfer-subscription/',
                { email },
                {
                    headers: { 'Authorization': `Bearer ${token}` }
                }
            );

            setMessage(response.data.message);
            setEmail('');
        } catch (err) {
            setError(err.response?.data?.error || "Transfer failed. Please check the email and try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <GlassCard className="p-6 rounded-2xl border border-gray-200 dark:border-white/10 bg-white/50 dark:bg-black/50">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                <Send size={20} className="text-purple-600" /> Transfer Subscription
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                Transfer your active subscription to another user. <span className="text-red-500 font-bold">This is irreversible.</span> You will lose your benefits immediately.
            </p>

            <form onSubmit={handleTransfer} className="flex flex-col gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Recipient Email
                    </label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="friend@example.com"
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                        disabled={loading}
                    />
                </div>

                {error && (
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-lg flex items-center gap-2">
                        <AlertTriangle size={16} /> {error}
                    </div>
                )}

                {message && (
                    <div className="p-3 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 text-sm rounded-lg flex items-center gap-2">
                        <CheckCircle size={16} /> {message}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="mt-2 w-full py-2 px-4 bg-gray-900 dark:bg-white text-white dark:text-black rounded-lg font-bold hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center justify-center gap-2"
                >
                    {loading ? <Loader2 size={18} className="animate-spin" /> : "Transfer Now"}
                </button>
            </form>
        </GlassCard>
    );
};

export default SubscriptionTransfer;
