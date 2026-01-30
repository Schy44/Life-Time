import React, { useState, useMemo } from 'react';
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
    History,
    TrendingUp,
    PieChart,
    DollarSign,
    Lock,
    Users
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
    const isDark = theme === 'dark';

    const { data, isLoading, refetch, isFetching } = useQuery({
        queryKey: ['transactions'],
        queryFn: async () => {
            const response = await api.get('/transactions/');
            return response.data;
        },
    });

    const transactions = data?.transactions || [];
    const currentBalance = data?.current_balance ?? 0;

    // --- Analytics Calculations ---
    const stats = useMemo(() => {
        let totalSpentMoney = 0;
        let totalCreditsUsed = 0;
        let totalCreditsPurchased = 0;

        // Usage breakdown
        const usage = {
            connections: 0, // Interest fees
            unlocks: 0,     // Legacy profile unlocks
            refunds: 0      // Credits refunded
        };

        transactions.forEach(tx => {
            const amount = parseFloat(tx.amount);

            // 1. Total Money Spent (Real Currency)
            if (tx.currency !== 'CREDITS' && tx.status === 'completed') {
                totalSpentMoney += amount;
                // Note: Assuming amount is in BDT. If mixed, we might need normalization, 
                // but usually user pays in one currency. 
                // Plan prices are BDT.
            }

            // 2. Credit Usage (Outbound)
            if (tx.currency === 'CREDITS' && tx.status === 'completed') {
                // Check if it's spending (not refund/topup)
                if (tx.purpose === 'interest_fee' || tx.purpose === 'chat_unlock') {
                    totalCreditsUsed += amount;
                    usage.connections += amount;
                } else if (tx.purpose === 'profile_unlock' || tx.purpose === 'bundle_single') {
                    // Legacy purposes
                    totalCreditsUsed += amount;
                    usage.unlocks += amount;
                }
            }

            // 3. Credits Added (Inbound)
            if (tx.purpose === 'credit_topup' || tx.purpose === 'subscription') {
                // We need to parse credits added from metadata if available, 
                // or infer from plan. For now, we trust the wallet specific transactions 
                // or just track money spent as primary metric.
                if (tx.metadata?.credits_to_add) {
                    totalCreditsPurchased += parseInt(tx.metadata.credits_to_add);
                }
            }
        });

        // Calculate percentages
        const totalUsage = usage.connections + usage.unlocks; // Avoid div by zero
        const percentages = {
            connections: totalUsage ? Math.round((usage.connections / totalUsage) * 100) : 0,
            unlocks: totalUsage ? Math.round((usage.unlocks / totalUsage) * 100) : 0
        };

        return {
            totalSpentMoney,
            totalCreditsUsed,
            usage,
            percentages
        };
    }, [transactions]);


    const filteredTransactions = transactions?.filter(tx => {
        const matchesSearch = tx.purpose.toLowerCase().includes(searchTerm.toLowerCase()) ||
            tx.gateway.toLowerCase().includes(searchTerm.toLowerCase()) ||
            tx.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (tx.metadata?.receiver_name && tx.metadata.receiver_name.toLowerCase().includes(searchTerm.toLowerCase()));

        if (filter === 'all') return matchesSearch;
        const isTxCredit = tx.purpose === 'credit_topup' || (tx.metadata?.action === 'interest_refund') || tx.purpose === 'subscription';
        if (filter === 'credit') return matchesSearch && isTxCredit;
        if (filter === 'debit') return matchesSearch && !isTxCredit;
        return matchesSearch;
    });

    const getPurposeLabel = (tx) => {
        if (tx.metadata?.action === 'interest_refund') return 'Refund Received';
        if (tx.purpose === 'interest_fee') return 'Connection Fee';

        const labels = {
            'subscription': 'Subscription Plan',
            'profile_activation': 'Account Activation',
            'credit_topup': 'Credits Purchased',
            'chat_unlock': 'Connection Fee', // Legacy mapping
            'profile_unlock': 'Profile Unlock' // Legacy
        };
        return labels[tx.purpose] || tx.purpose.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    };

    const isCreditEntry = (tx) => {
        // Returns true if credits were ADDED to wallet
        return tx.purpose === 'credit_topup' ||
            tx.purpose === 'subscription' ||
            (tx.metadata?.action === 'interest_refund');
    };

    if (isLoading) return <LoadingSpinner size="fullscreen" message="Analyzing financial data..." />;

    return (
        <div className={`min-h-screen pt-20 pb-20 px-4 sm:px-6 lg:px-8 transition-colors duration-500 ${isDark ? 'bg-[#030712] text-white' : 'bg-[#f8fafc] text-slate-900'}`}>

            {/* Ambient Background Elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className={`absolute top-0 right-0 w-1/2 h-1/2 blur-[140px] rounded-full transition-opacity duration-1000 ${isDark ? 'bg-blue-600/5 opacity-40' : 'bg-blue-400/10 opacity-60'}`} />
                <div className={`absolute bottom-0 left-0 w-1/2 h-1/2 blur-[140px] rounded-full transition-opacity duration-1000 ${isDark ? 'bg-purple-600/5 opacity-40' : 'bg-purple-400/10 opacity-60'}`} />
            </div>

            <div className="max-w-6xl mx-auto relative z-10">

                {/* Header */}
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
                    <div>
                        <button
                            onClick={() => navigate('/upgrade')}
                            className={`flex items-center text-sm font-semibold mb-4 group ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`}
                        >
                            <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform" />
                            Back to Store
                        </button>
                        <h1 className="text-3xl sm:text-4xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-indigo-600">
                            Credit History
                        </h1>
                        <p className={`mt-2 font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                            Track your spending, usage, and balance.
                        </p>
                    </div>

                    <button
                        onClick={() => refetch()}
                        className={`p-3 rounded-full transition-all ${isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-white hover:bg-slate-50 text-slate-600 shadow-sm'}`}
                    >
                        <RefreshCcw size={20} className={`${isFetching ? 'animate-spin text-blue-500' : ''}`} />
                    </button>
                </div>

                {/* Dashboard Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    {/* Card 1: Balance */}
                    <div className={`p-6 rounded-[2rem] border relative overflow-hidden group ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-lg shadow-slate-100'}`}>
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Wallet size={80} className="text-blue-500" />
                        </div>
                        <p className={`text-xs font-black uppercase tracking-widest mb-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Current Balance</p>
                        <div className="flex items-baseline gap-2">
                            <span className={`text-4xl font-black tracking-tighter ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                {currentBalance}
                            </span>
                            <span className="text-sm font-bold text-blue-500">Credits</span>
                        </div>
                    </div>

                    {/* Card 2: Total Spent */}
                    <div className={`p-6 rounded-[2rem] border relative overflow-hidden group ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-lg shadow-slate-100'}`}>
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <DollarSign size={80} className="text-emerald-500" />
                        </div>
                        <p className={`text-xs font-black uppercase tracking-widest mb-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Total Money Spent</p>
                        <div className="flex items-baseline gap-2">
                            <span className={`text-4xl font-black tracking-tighter ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                ৳{stats.totalSpentMoney.toLocaleString()}
                            </span>
                            <span className="text-xs font-bold text-slate-500">BDT</span>
                        </div>
                    </div>

                    {/* Card 3: Usage Breakdown */}
                    <div className={`p-6 rounded-[2rem] border relative overflow-hidden group ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-lg shadow-slate-100'}`}>
                        <p className={`text-xs font-black uppercase tracking-widest mb-3 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Where Credits Went</p>

                        <div className="space-y-3">
                            {/* Connections Bar */}
                            <div>
                                <div className="flex justify-between text-xs font-bold mb-1">
                                    <span className="flex items-center gap-1.5"><Users size={12} className="text-indigo-500" /> Connections</span>
                                    <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>{stats.percentages.connections}% ({stats.usage.connections} Cr)</span>
                                </div>
                                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${stats.percentages.connections}%` }} />
                                </div>
                            </div>

                            {/* Unlocks Bar (if any legacy exists) */}
                            {stats.usage.unlocks > 0 && (
                                <div>
                                    <div className="flex justify-between text-xs font-bold mb-1">
                                        <span className="flex items-center gap-1.5"><Lock size={12} className="text-orange-500" /> Profile Unlocks</span>
                                        <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>{stats.percentages.unlocks}% ({stats.usage.unlocks} Cr)</span>
                                    </div>
                                    <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                        <div className="h-full bg-orange-500 rounded-full" style={{ width: `${stats.percentages.unlocks}%` }} />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Filters & Search */}
                <div className="flex flex-col md:flex-row gap-4 mb-6 items-center">
                    <div className="relative flex-1 group w-full">
                        <Search className={`absolute left-5 top-1/2 -translate-y-1/2 transition-colors ${isDark ? 'text-slate-500 group-focus-within:text-blue-400' : 'text-slate-400 group-focus-within:text-blue-600'}`} size={18} />
                        <input
                            type="text"
                            placeholder="Search transactions..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className={`w-full border rounded-[1.2rem] py-3 pl-12 pr-6 focus:outline-none focus:ring-2 transition-all text-sm font-semibold ${isDark
                                ? 'bg-slate-900/50 border-slate-800 focus:ring-blue-500/20 text-white placeholder:text-slate-600'
                                : 'bg-white border-slate-200 focus:ring-blue-400/20 text-slate-900 placeholder:text-slate-400'
                                }`}
                        />
                    </div>
                    <div className={`p-1 flex gap-1 border rounded-[1rem] ${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'}`}>
                        {['all', 'credit', 'debit'].map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-4 py-2 rounded-[0.8rem] text-xs font-bold uppercase tracking-wide transition-all ${filter === f
                                    ? (isDark ? 'bg-blue-600 text-white' : 'bg-slate-900 text-white')
                                    : (isDark ? 'text-slate-500 hover:text-slate-300' : 'text-slate-500 hover:text-slate-900')
                                    }`}
                            >
                                {f === 'all' ? 'All' : f === 'credit' ? 'In' : 'Out'}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Transaction List (Table Style) */}
                <div className={`rounded-[2rem] border overflow-hidden ${isDark ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
                    {filteredTransactions.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className={`last:border-b-0 ${isDark ? 'bg-white/5 text-slate-400' : 'bg-slate-50 text-slate-500'}`}>
                                    <tr>
                                        <th className="p-5 font-black uppercase tracking-wider text-[10px]">Description</th>
                                        <th className="p-5 font-black uppercase tracking-wider text-[10px]">Date</th>
                                        <th className="p-5 font-black uppercase tracking-wider text-[10px]">Status</th>
                                        <th className="p-5 font-black uppercase tracking-wider text-[10px] text-right">Amount</th>
                                    </tr>
                                </thead>
                                <tbody className={`divide-y ${isDark ? 'divide-slate-800' : 'divide-slate-100'}`}>
                                    {filteredTransactions.map((tx) => (
                                        <tr key={tx.id} className={`group transition-colors ${isDark ? 'hover:bg-white/5' : 'hover:bg-slate-50/50'}`}>
                                            <td className="p-5">
                                                <div className="font-bold text-base flex items-center gap-2">
                                                    {getPurposeLabel(tx)}
                                                    {tx.metadata?.receiver_name && <span className="text-xs font-normal opacity-60">• {tx.metadata.receiver_name}</span>}
                                                </div>
                                                <div className="text-[10px] font-mono opacity-40 mt-1">{(tx.transaction_id || String(tx.id)).slice(0, 12)}...</div>
                                            </td>
                                            <td className="p-5 font-medium opacity-80 whitespace-nowrap">
                                                <div className="flex flex-col">
                                                    <span>{new Date(tx.created_at).toLocaleDateString()}</span>
                                                    <span className="text-[10px] opacity-60">{new Date(tx.created_at).toLocaleTimeString()}</span>
                                                </div>
                                            </td>
                                            <td className="p-5">
                                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${tx.status === 'completed' ? 'text-emerald-500 border-emerald-500/20 bg-emerald-500/10' :
                                                    tx.status === 'pending' ? 'text-amber-500 border-amber-500/20 bg-amber-500/10' :
                                                        'text-rose-500 border-rose-500/20 bg-rose-500/10'
                                                    }`}>
                                                    {tx.status}
                                                </span>
                                            </td>
                                            <td className={`p-5 text-right font-black text-lg ${isCreditEntry(tx) ? 'text-emerald-500' : (isDark ? 'text-white' : 'text-slate-900')}`}>
                                                {isCreditEntry(tx) ? '+' : '-'}{
                                                    parseFloat(tx.amount).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })
                                                }
                                                <span className="text-[10px] opacity-50 ml-1">{tx.currency === 'CREDITS' ? 'CR' : tx.currency}</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="p-12 text-center opacity-40">
                            <History className="mx-auto mb-4" size={48} />
                            <p>No transactions found matching your filters.</p>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default CreditHistoryPage;
