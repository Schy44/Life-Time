import React from 'react';
import { Link } from 'react-router-dom';
import { XCircle, RefreshCw } from 'lucide-react';
import GlassCard from '../components/GlassCard';

const PaymentFailPage = () => {
    return (
        <div className="min-h-screen pt-20 px-4 flex items-center justify-center">
            <GlassCard className="max-w-md w-full p-8 rounded-2xl border border-red-500/30 bg-red-50/50 dark:bg-red-900/10 text-center">
                <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                    <XCircle className="w-10 h-10 text-red-600 dark:text-red-400" />
                </div>

                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Payment Failed</h2>

                <p className="text-gray-600 dark:text-gray-300 mb-8">
                    We couldn't process your payment. Please try again or contact support if the issue persists.
                </p>

                <div className="flex flex-col gap-3">
                    <Link
                        to="/upgrade"
                        className="w-full py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                    >
                        <RefreshCw size={18} /> Try Again
                    </Link>
                    <Link to="/" className="text-sm text-gray-500 hover:underline">
                        Return Home
                    </Link>
                </div>
            </GlassCard>
        </div>
    );
};

export default PaymentFailPage;
