import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft,
    Clock,
    CreditCard,
    ArrowUpRight,
    ArrowDownLeft,
    Filter,
    Search,
    RefreshCcw,
    Receipt,
    Wallet,
    Calendar,
    ChevronRight,
    History
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { useTheme } from '../context/ThemeContext';

const CreditHistoryPage = () => {
    const navigate = useNavigate();
    const { theme } = useTheme();
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    const { data, isLoading, refetch, isFetching } = useQuery({
        queryKey: ['transactions'],
        queryFn: async () => {
            const response = await api.get('/transactions/');
            return response.data;
        },
    });

    const transactions = data?.transactions || [];
    const currentBalance = data?.current_balance ?? '--';

    const filteredTransactions = transactions?.filter(tx => {
        const matchesSearch = tx.purpose.toLowerCase().includes(searchTerm.toLowerCase()) ||
            tx.gateway.toLowerCase().includes(searchTerm.toLowerCase()) ||
            tx.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (tx.metadata?.receiver_name && tx.metadata.receiver_name.toLowerCase().includes(searchTerm.toLowerCase()));

        if (filter === 'all') return matchesSearch;
        const isTxCredit = tx.purpose === 'credit_topup' || (tx.metadata?.action === 'interest_refund');
        if (filter === 'credit') return matchesSearch && isTxCredit;
        if (filter === 'debit') return matchesSearch && !isTxCredit;
        return matchesSearch;
    });

    const getRelativeTime = (dateString) => {
        const now = new Date();
        const past = new Date(dateString);
        const diffInMs = now - past;
        const diffInMins = Math.floor(diffInMs / (1000 * 60));
        const diffInHours = Math.floor(diffInMins / 60);
        const diffInDays = Math.floor(diffInHours / 24);

        if (diffInMins < 1) return 'Just now';
        if (diffInMins < 60) return `${diffInMins}m ago`;
        if (diffInHours < 24) return `${diffInHours}h ago`;
        if (diffInDays < 7) return `${diffInDays}d ago`;

        return past.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const getPurposeLabel = (tx) => {
        if (tx.metadata?.action === 'interest_refund') return 'Refund Received';

        const labels = {
            'subscription': 'Subscription Plan',
            'profile_activation': 'Account Activation',
            'credit_topup': 'Credits Purchased',
            'chat_unlock': 'Interest Sent'
        };
        return labels[tx.purpose] || tx.purpose.replace('_', ' ');
    };

    const getStatusInfo = (status) => {
        const s = status.toLowerCase();
        switch (s) {
            case 'completed': return { label: 'Settled', color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' };
            case 'pending': return { label: 'Processing', color: 'text-amber-500 bg-amber-500/10 border-amber-500/20' };
            case 'failed': return { label: 'Failed', color: 'text-rose-500 bg-rose-500/10 border-rose-500/20' };
            default: return { label: status, color: 'text-gray-500 bg-gray-500/10 border-gray-500/20' };
        }
    };

    const isCredit = (tx) => tx.purpose === 'credit_topup' || (tx.metadata?.action === 'interest_refund');

    if (isLoading) return <LoadingSpinner size="fullscreen" message="Accessing secure ledger..." />;

    const isDark = theme === 'dark';

    return (
        <div className={`min-h-screen pt-20 pb-20 px-4 sm:px-6 lg:px-8 transition-colors duration-500 ${isDark ? 'bg-[#030712] text-white' : 'bg-[#f8fafc] text-slate-900'}`}>

            {/* Ambient Background Elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className={`absolute top-0 right-0 w-1/2 h-1/2 blur-[140px] rounded-full transition-opacity duration-1000 ${isDark ? 'bg-blue-600/5 opacity-40' : 'bg-blue-400/10 opacity-60'}`} />
                <div className={`absolute bottom-0 left-0 w-1/2 h-1/2 blur-[140px] rounded-full transition-opacity duration-1000 ${isDark ? 'bg-purple-600/5 opacity-40' : 'bg-purple-400/10 opacity-60'}`} />
            </div>

            <div className="max-w-6xl mx-auto relative z-10">

                {/* Header Section */}
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-12">
                    <div className="flex-1">
                        <motion.button
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            onClick={() => navigate('/upgrade')}
                            className={`flex items-center text-sm font-semibold transition-all mb-6 group ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`}
                        >
                            <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform" />
                            Back to Store
                        </motion.button>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <h1 className="text-4xl sm:text-5xl font-black tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
                                Credit Ledger
                            </h1>
                            <p className={`text-lg max-w-2xl font-medium leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                                Detailed audit trail of your credit movements, purchases, and system refunds.
                            </p>
                        </motion.div>
                    </div>

                    {/* Balance Card - Ultra Clean */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={`relative group overflow-hidden p-6 sm:p-8 rounded-[2.5rem] border transition-all duration-500 ${isDark
                                ? 'bg-slate-900/40 border-slate-800 hover:border-blue-500/30'
                                : 'bg-white border-slate-200 shadow-xl shadow-slate-200/50 hover:border-blue-200'
                            }`}
                    >
                        {/* Interactive Spark Gradient */}
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />

                        <div className="relative flex items-center gap-6">
                            <div className={`p-4 rounded-3xl ${isDark ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-50 text-blue-600 shadow-inner'}`}>
                                <Wallet size={32} strokeWidth={2.5} />
                            </div>
                            <div>
                                <p className={`text-[11px] font-black uppercase tracking-[0.2em] mb-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Available Portfolio</p>
                                <div className="flex items-baseline gap-2">
                                    <span className={`text-4xl font-black tracking-tighter ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                        {currentBalance}
                                    </span>
                                    <span className="text-sm font-bold uppercase tracking-widest text-blue-500 opacity-80">Credits</span>
                                </div>
                            </div>
                            <button
                                onClick={() => refetch()}
                                className={`ml-4 p-3 rounded-2xl transition-all ${isDark ? 'hover:bg-white/5' : 'hover:bg-slate-50'}`}
                            >
                                <RefreshCcw size={20} className={`${isFetching ? 'animate-spin text-blue-500' : 'text-slate-400'}`} />
                            </button>
                        </div>
                    </motion.div>
                </div>

                {/* Controls Bar */}
                <div className="flex flex-col md:flex-row gap-4 mb-10 items-center">
                    <div className="relative flex-1 group w-full">
                        <Search className={`absolute left-5 top-1/2 -translate-y-1/2 transition-colors ${isDark ? 'text-slate-500 group-focus-within:text-blue-400' : 'text-slate-400 group-focus-within:text-blue-600'}`} size={20} />
                        <input
                            type="text"
                            placeholder="Filter by recipient, status, or transaction type..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className={`w-full border rounded-[1.5rem] py-4 pl-14 pr-6 focus:outline-none focus:ring-4 transition-all text-sm font-semibold ${isDark
                                    ? 'bg-slate-900/50 border-slate-800 focus:ring-blue-500/10 focus:border-blue-500/50 text-white placeholder:text-slate-600'
                                    : 'bg-white border-slate-200 focus:ring-blue-50 focus:border-blue-400 text-slate-900 placeholder:text-slate-400 shadow-sm'
                                }`}
                        />
                    </div>

                    <div className={`p-1.5 flex gap-1 border rounded-[1.5rem] ${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
                        {[
                            { id: 'all', label: 'Overview', icon: History },
                            { id: 'credit', label: 'Credits Added', icon: ArrowDownLeft },
                            { id: 'debit', label: 'Usage', icon: ArrowUpRight }
                        ].map((f) => (
                            <button
                                key={f.id}
                                onClick={() => setFilter(f.id)}
                                className={`flex items-center gap-2 py-2.5 px-6 rounded-[1rem] transition-all text-xs font-black uppercase tracking-widest ${filter === f.id
                                        ? (isDark ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' : 'bg-slate-900 text-white shadow-lg shadow-slate-900/20')
                                        : (isDark ? 'text-slate-500 hover:text-slate-300 hover:bg-white/5' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50')
                                    }`}
                            >
                                <f.icon size={14} />
                                <span className="hidden sm:inline">{f.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Ledger Content */}
                <div className="space-y-4">
                    <AnimatePresence mode="popLayout" initial={false}>
                        {filteredTransactions?.length > 0 ? (
                            filteredTransactions.map((tx, index) => (
                                <motion.div
                                    key={tx.id}
                                    layout
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.98 }}
                                    transition={{
                                        type: "spring",
                                        stiffness: 400,
                                        damping: 30,
                                        delay: Math.min(index * 0.05, 0.5)
                                    }}
                                    className={`relative group overflow-hidden p-5 sm:p-7 rounded-[2rem] border transition-all duration-300 ${isDark
                                            ? 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
                                            : 'bg-white border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300'
                                        }`}
                                >
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                                        <div className="flex items-center gap-5">
                                            {/* Icon Indicator */}
                                            <div className={`flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center border transition-transform group-hover:scale-110 ${isCredit(tx)
                                                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
                                                    : 'bg-blue-500/10 border-blue-500/20 text-blue-500'
                                                }`}>
                                                {isCredit(tx) ? <ArrowDownLeft size={24} strokeWidth={2.5} /> : <ArrowUpRight size={24} strokeWidth={2.5} />}
                                            </div>

                                            <div>
                                                <div className="flex items-center gap-3 mb-1">
                                                    <h3 className={`font-black text-xl tracking-tight transition-colors ${isDark ? 'text-white group-hover:text-blue-400' : 'text-slate-900 group-hover:text-blue-600'}`}>
                                                        {getPurposeLabel(tx)}
                                                    </h3>
                                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusInfo(tx.status).color}`}>
                                                        {getStatusInfo(tx.status).label}
                                                    </span>
                                                </div>

                                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                                                    {tx.metadata?.receiver_name && (
                                                        <p className="text-sm font-bold text-blue-500 uppercase tracking-wide flex items-center gap-1.5">
                                                            <Receipt size={14} className="opacity-50" />
                                                            {tx.metadata.receiver_name}
                                                        </p>
                                                    )}
                                                    <p className={`text-xs font-semibold flex items-center gap-1.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                                        <Calendar size={14} className="opacity-50" />
                                                        {formatDate(tx.created_at)}
                                                    </p>
                                                    {tx.transaction_id && (
                                                        <p className={`text-[10px] font-mono opacity-40 hidden md:block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                                            ID: {tx.transaction_id.slice(0, 8)}...
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between sm:justify-end sm:gap-8 border-t sm:border-t-0 pt-4 sm:pt-0 border-slate-100 dark:border-slate-800">
                                            <div className="flex flex-col items-start sm:items-end">
                                                <span className={`text-[10px] font-black uppercase tracking-widest mb-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                                    Timestamp
                                                </span>
                                                <span className={`text-sm font-bold flex items-center gap-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                                                    <Clock size={14} className="text-blue-500/50" />
                                                    {getRelativeTime(tx.created_at)}
                                                </span>
                                            </div>

                                            <div className="text-right min-w-[120px]">
                                                <p className={`text-3xl font-black tracking-tighter ${isCredit(tx)
                                                        ? 'text-emerald-500'
                                                        : (isDark ? 'text-white' : 'text-slate-900')
                                                    }`}>
                                                    {isCredit(tx) ? '+' : '-'}{(() => {
                                                        const amount = parseFloat(tx.amount);
                                                        return tx.currency === 'BDT' ? (amount / 1500).toFixed(0) : amount.toFixed(0);
                                                    })()}
                                                    <span className="ml-1 text-[11px] font-bold uppercase tracking-widest opacity-40">CR</span>
                                                </p>
                                                {tx.metadata?.reason && (
                                                    <p className="text-[10px] text-slate-500 mt-1 font-bold italic tracking-tighter">
                                                        {tx.metadata.reason}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Hover Detail Indicator */}
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-slate-400 hidden lg:block">
                                        <ChevronRight size={24} />
                                    </div>
                                </motion.div>
                            ))
                        ) : (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className={`p-20 text-center rounded-[3rem] border-2 border-dashed ${isDark ? 'border-slate-800 bg-white/[0.02]' : 'border-slate-200 bg-white'}`}
                            >
                                <div className="max-w-xs mx-auto flex flex-col items-center gap-6">
                                    <div className={`w-24 h-24 rounded-full flex items-center justify-center ${isDark ? 'bg-slate-900 text-slate-700' : 'bg-slate-50 text-slate-300'}`}>
                                        <Receipt size={48} strokeWidth={1} />
                                    </div>
                                    <div>
                                        <h3 className={`text-xl font-black mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>No Data Tracks</h3>
                                        <p className={`text-sm font-medium ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                            Your financial footprint on the system is currently clean. Purchase credits to begin.
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => { setFilter('all'); setSearchTerm(''); }}
                                        className={`px-8 py-3 rounded-full text-xs font-black uppercase tracking-[0.2em] transition-all ${isDark ? 'bg-white text-slate-900 hover:bg-slate-200' : 'bg-slate-900 text-white hover:bg-slate-800'
                                            }`}
                                    >
                                        Clear Investigation
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Secure Footer */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-6 px-4"
                >
                    <div className="flex items-center gap-3 text-xs font-bold text-slate-500">
                        <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" />
                        Live Synchronized Ledger • <span className="text-blue-500">{filteredTransactions?.length ?? 0}</span> audit points
                    </div>

                    <div className={`flex items-center gap-6 text-[10px] font-black uppercase tracking-[0.2em] ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>
                        <div className="flex items-center gap-2">
                            <ArrowDownLeft size={12} className="text-emerald-500" />
                            <span>Inbound Credits</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <ArrowUpRight size={12} className="text-blue-500" />
                            <span>Outbound Usage</span>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default CreditHistoryPage;
