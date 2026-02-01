import React, { useState, useEffect } from 'react';
import {
    Eye, Heart, ShieldCheck, Sparkles, MapPin,
    Briefcase, ChevronRight, TrendingUp, Search,
    Lock, Star, Zap, User, Loader, Sun, Moon
} from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend
} from 'recharts';
import { motion } from 'framer-motion';
import { getDashboardAnalytics } from '../services/analyticsService';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useQuery } from '@tanstack/react-query';
import { getProfile } from '../services/api';

// --- 1. PRE-DEFINED SUB-COMPONENTS (Hoisting Safety) ---

const BentoGrid = ({ children, className = "" }) => (
    <div className={`grid grid-cols-1 md:grid-cols-12 gap-6 max-w-7xl mx-auto ${className}`}>
        {children}
    </div>
);

const BentoCard = ({ children, className = "", colSpan = "md:col-span-4" }) => (
    <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className={`bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] dark:shadow-none overflow-hidden relative flex flex-col transition-colors duration-300 ${colSpan} ${className}`}
    >
        {children}
    </motion.div>
);

const MetricBadge = ({ label, value, trend, trendUp }) => (
    <div className="flex flex-col">
        <span className="text-slate-400 dark:text-slate-500 text-xs font-semibold uppercase tracking-wider">{label}</span>
        <div className="flex items-end gap-2 mt-1">
            <span className="text-2xl font-bold text-slate-800 dark:text-white">{value}</span>
            {trend !== null && trend !== undefined && (
                <span className={`text-xs font-bold mb-1 px-1.5 py-0.5 rounded ${trendUp ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' : 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400'}`}>
                    {trendUp ? '+' : ''}{trend}%
                </span>
            )}
        </div>
    </div>
);

// --- 2. MAIN COMPONENT ---

const AnalyticsDashboard = () => {
    const { user } = useAuth();
    const { theme, toggleTheme } = useTheme();

    // Fetch profile data for personalization
    const { data: profile } = useQuery({
        queryKey: ['me'],
        queryFn: getProfile,
        enabled: !!user,
        staleTime: 1000 * 60 * 5,
    });

    const [timeRange, setTimeRange] = useState('30d');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [analyticsData, setAnalyticsData] = useState(null);

    // Convert time range to days
    const getDaysFromRange = (range) => {
        const rangeMap = { '7d': 7, '30d': 30, '90d': 90 };
        return rangeMap[range] || 30;
    };

    // Fetch analytics data
    useEffect(() => {
        const fetchAnalytics = async () => {
            setLoading(true);
            setError(null);
            try {
                const days = getDaysFromRange(timeRange);
                const data = await getDashboardAnalytics(days);
                setAnalyticsData(data);
            } catch (err) {
                console.error('Error fetching analytics:', err);
                setError('Failed to load analytics data. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchAnalytics();
    }, [timeRange]);

    // Format chart data for views
    const formatViewsData = () => {
        if (!analyticsData?.advancedAnalytics?.daily_views) return [];

        const dailyViews = analyticsData.advancedAnalytics.daily_views;
        const avgViews = analyticsData.advancedAnalytics.platform_avg_views || 0;

        return dailyViews.map(item => ({
            date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            views: item.count,
            avg: avgViews
        }));
    };

    // Format radar chart data for profile health
    const formatHealthData = () => {
        if (!analyticsData?.basicStats?.profile_strength_suggestions) return [];

        const suggestions = analyticsData.basicStats.profile_strength_suggestions;
        const strength = analyticsData.basicStats.profile_strength || 0;

        // Calculate scores for each category
        const categories = {
            'Photos': 100,
            'Bio': 100,
            'Family': 100,
            'Career': 100,
            'Partner Pref': 100
        };

        // Reduce scores based on suggestions
        suggestions.forEach(suggestion => {
            if (suggestion.message.toLowerCase().includes('photo')) {
                categories['Photos'] = Math.max(0, 100 - suggestion.points);
            }
            if (suggestion.message.toLowerCase().includes('bio')) {
                categories['Bio'] = Math.max(0, 100 - suggestion.points);
            }
            if (suggestion.message.toLowerCase().includes('family')) {
                categories['Family'] = Math.max(0, 100 - suggestion.points);
            }
            if (suggestion.message.toLowerCase().includes('work') || suggestion.message.toLowerCase().includes('education')) {
                categories['Career'] = Math.max(0, 100 - suggestion.points);
            }
        });

        return Object.entries(categories).map(([subject, score]) => ({
            subject,
            A: score,
            fullMark: 100
        }));
    };

    // Get weakest section
    const getWeakestSection = () => {
        if (!analyticsData?.basicStats?.profile_strength_suggestions) return null;

        const suggestions = analyticsData.basicStats.profile_strength_suggestions;
        if (suggestions.length === 0) return null;

        // Find the most critical suggestion
        const critical = suggestions.find(s => s.type === 'critical');
        if (critical) {
            if (critical.message.toLowerCase().includes('photo')) return 'Photos';
            if (critical.message.toLowerCase().includes('bio')) return 'Bio';
        }

        const important = suggestions.find(s => s.type === 'important');
        if (important) {
            if (important.message.toLowerCase().includes('photo')) return 'Photos';
            if (important.message.toLowerCase().includes('bio')) return 'Bio';
            if (important.message.toLowerCase().includes('family')) return 'Family';
        }

        return null;
    };

    // Format time ago
    const formatTimeAgo = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInMs = now - date;
        const diffInMinutes = Math.floor(diffInMs / 60000);
        const diffInHours = Math.floor(diffInMinutes / 60);
        const diffInDays = Math.floor(diffInHours / 24);

        if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
        if (diffInHours < 24) return `${diffInHours}h ago`;
        if (diffInDays < 7) return `${diffInDays}d ago`;
        return date.toLocaleDateString();
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 flex items-center justify-center transition-colors duration-300">
                <div className="text-center">
                    <Loader className="w-12 h-12 animate-spin text-purple-600 mx-auto mb-4" />
                    <p className="text-slate-600 dark:text-slate-400">Loading analytics...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 flex items-center justify-center transition-colors duration-300">
                <div className="text-center">
                    <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    const { basicStats, advancedAnalytics, viewers } = analyticsData;
    const viewsData = formatViewsData();
    const healthData = formatHealthData();
    const topKeywords = advancedAnalytics?.top_keywords || [];
    const weakestSection = getWeakestSection();

    // Chart Colors
    const chartGridColor = theme === 'dark' ? '#334155' : '#f1f5f9';
    const chartAxisColor = theme === 'dark' ? '#94a3b8' : '#94a3b8';
    const tooltipBg = theme === 'dark' ? '#1e293b' : '#fff';
    const tooltipColor = theme === 'dark' ? '#f8fafc' : '#0f172a';

    return (
        <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 py-10 px-4 md:px-8 font-sans text-slate-900 dark:text-white transition-colors duration-300">

            {/* Header Section */}
            <div className="max-w-7xl mx-auto mb-10 flex flex-col md:flex-row justify-between items-end">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
                        {profile?.subscription_plan && (
                            <span className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wide">
                                {profile.subscription_plan} Plan
                            </span>
                        )}
                    </div>
                    <p className="text-slate-500 dark:text-slate-400">
                        Welcome back, <strong>{profile?.name?.split(' ')[0] || user?.username || 'User'}</strong>.
                        {advancedAnalytics?.view_trend > 0 ? ' Your profile is trending up this week.' : ' Keep your profile updated for better visibility.'}
                    </p>
                </div>

                <div className="flex gap-4 mt-4 md:mt-0">
                    {/* Theme Toggle */}
                    <button
                        onClick={toggleTheme}
                        className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 transition-all shadow-sm"
                    >
                        {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                    </button>

                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1 rounded-xl flex gap-1 shadow-sm transition-colors duration-300">
                        {['7d', '30d', '90d'].map((t) => (
                            <button
                                key={t}
                                onClick={() => setTimeRange(t)}
                                className={`px-4 py-2 text-sm rounded-lg font-medium transition-all ${timeRange === t
                                    ? 'bg-slate-900 dark:bg-slate-800 text-white shadow-md'
                                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                                    }`}
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Activation Warning for unactivated users */}
            {profile && !profile.is_activated && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-7xl mx-auto mb-8 p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 rounded-2xl flex items-center justify-between shadow-sm"
                >
                    <div className="flex items-center gap-3 text-amber-800 dark:text-amber-400">
                        <Zap className="text-amber-500 w-5 h-5 flex-shrink-0" />
                        <div>
                            <p className="text-sm font-bold">Your profile is currently hidden</p>
                            <p className="text-xs opacity-80">Activate your profile to appear in searches and start receiving interests.</p>
                        </div>
                    </div>
                </motion.div>
            )}

            <BentoGrid>

                {/* --- ROW 1: High Level Metrics --- */}

                {/* 1. Main Stats Strip */}
                <BentoCard colSpan="md:col-span-8" className="justify-center">
                    <div className="flex flex-col md:flex-row justify-between divide-y md:divide-y-0 md:divide-x divide-slate-100 dark:divide-slate-800 gap-6 md:gap-0">
                        <div className="px-4 flex items-center gap-4">
                            <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-2xl text-purple-600 dark:text-purple-400">
                                <Search className="w-6 h-6" />
                            </div>
                            <MetricBadge
                                label="Search Appearances"
                                value={advancedAnalytics?.search_appearances?.toLocaleString() || '0'}
                                trend={null}
                                trendUp={true}
                            />
                        </div>
                        <div className="px-4 flex items-center gap-4">
                            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-2xl text-blue-600 dark:text-blue-400">
                                <Eye className="w-6 h-6" />
                            </div>
                            <MetricBadge
                                label="Profile Views"
                                value={basicStats?.profile_views_30d?.toLocaleString() || '0'}
                                trend={advancedAnalytics?.view_trend}
                                trendUp={advancedAnalytics?.view_trend >= 0}
                            />
                        </div>
                        <div className="px-4 flex items-center gap-4">
                            <div className="p-3 bg-pink-50 dark:bg-pink-900/20 rounded-2xl text-pink-600 dark:text-pink-400">
                                <Heart className="w-6 h-6" />
                            </div>
                            <MetricBadge
                                label="Interests Recvd"
                                value={basicStats?.interests_received?.toLocaleString() || '0'}
                                trend={advancedAnalytics?.interest_trend}
                                trendUp={advancedAnalytics?.interest_trend >= 0}
                            />
                        </div>
                    </div>
                </BentoCard>

                {/* 2. Trust Score (Gamified) */}
                <BentoCard colSpan="md:col-span-4" className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white border-none">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="font-bold text-lg opacity-90 text-white">Visibility Score</h3>
                            <p className="text-emerald-100 text-xs mt-1">
                                {profile?.is_verified ? 'Verified profile' : 'Get verified for 3x matches'}
                            </p>
                        </div>
                        <ShieldCheck className="w-6 h-6 text-emerald-100" />
                    </div>
                    <div className="mt-auto">
                        <div className="flex items-end gap-2 mb-2">
                            <span className="text-4xl font-bold text-white">{basicStats?.profile_strength || 0}</span>
                            <span className="text-lg opacity-80 mb-1 text-white">/ 100</span>
                        </div>
                        <div className="w-full bg-black/20 h-2 rounded-full overflow-hidden">
                            <div
                                className="bg-white h-full shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                                style={{ width: `${basicStats?.profile_strength || 0}%` }}
                            ></div>
                        </div>
                    </div>
                </BentoCard>


                {/* --- ROW 2: Deep Dive Analytics --- */}

                {/* 3. Activity Chart (Comparison) */}
                <BentoCard colSpan="md:col-span-8">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h3 className="font-bold text-lg text-slate-800 dark:text-white">Profile Engagement</h3>
                            <p className="text-sm text-slate-400 dark:text-slate-500">Your views vs. Average user</p>
                        </div>
                    </div>
                    <div className="h-64 w-full">
                        {viewsData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={viewsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2} />
                                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartGridColor} />
                                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: chartAxisColor, fontSize: 12 }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: chartAxisColor, fontSize: 12 }} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: tooltipBg, color: tooltipColor, borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.1)' }}
                                    />
                                    <Area type="monotone" dataKey="views" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorViews)" name="You" />
                                    <Area type="monotone" dataKey="avg" stroke="#cbd5e1" strokeWidth={2} strokeDasharray="5 5" fill="none" name="Avg. User" />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-full text-slate-400 dark:text-slate-500">
                                No data available for this period
                            </div>
                        )}
                    </div>
                </BentoCard>

                {/* 4. Profile Radar (Health Check) */}
                <BentoCard colSpan="md:col-span-4">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="font-bold text-lg text-slate-800 dark:text-white">Profile Strength</h3>
                        <div className="p-1.5 bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-lg">
                            <Zap className="w-4 h-4" />
                        </div>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Balance your profile to rank higher.</p>

                    <div className="h-48 w-full relative">
                        {healthData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={healthData}>
                                    <PolarGrid stroke={theme === 'dark' ? '#334155' : '#e2e8f0'} />
                                    <PolarAngleAxis dataKey="subject" tick={{ fill: chartAxisColor, fontSize: 10, fontWeight: 600 }} />
                                    <Radar
                                        name="Score"
                                        dataKey="A"
                                        stroke="#8b5cf6"
                                        strokeWidth={2}
                                        fill="#8b5cf6"
                                        fillOpacity={0.3}
                                    />
                                </RadarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-full text-slate-400 dark:text-slate-500">
                                Profile analysis unavailable
                            </div>
                        )}
                        {/* Overlay Insight */}
                        {weakestSection && (
                            <div className="absolute bottom-0 right-0 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-[10px] font-bold px-2 py-1 rounded-full border border-red-100 dark:border-red-800/50">
                                Fix "{weakestSection}" Section
                            </div>
                        )}
                    </div>
                </BentoCard>


                {/* --- ROW 3: Actionable Insights --- */}

                {/* 5. Search Keywords (SEO) */}
                <BentoCard colSpan="md:col-span-4" className="bg-slate-900 text-white">
                    <div className="flex items-center gap-2 mb-4">
                        <Sparkles className="w-5 h-5 text-purple-400" />
                        <h3 className="font-bold text-lg text-white">How they found you</h3>
                    </div>
                    <p className="text-slate-400 text-sm mb-6">These keywords in your profile triggered the most views.</p>

                    <div className="flex flex-wrap gap-2 content-start">
                        {topKeywords.length > 0 ? (
                            topKeywords.map((k, i) => (
                                <div key={i} className="flex items-center justify-between w-full group cursor-pointer hover:bg-white/5 p-2 rounded-lg transition-colors">
                                    <span className="text-sm font-medium text-slate-200 group-hover:text-white">{k.word}</span>
                                    <div className="flex items-center gap-2">
                                        <div className="h-1.5 w-16 bg-white/10 rounded-full overflow-hidden">
                                            <div className="h-full bg-purple-500" style={{ width: `${Math.min(100, (k.count / Math.max(...topKeywords.map(kw => kw.count))) * 100)}%` }}></div>
                                        </div>
                                        <span className="text-xs text-slate-400">{k.count}</span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-slate-400 text-sm">Complete your profile to see keywords</p>
                        )}
                    </div>
                </BentoCard>

                {/* 6. Recent Visitor Cards (Detailed) */}
                <BentoCard colSpan="md:col-span-8">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-lg text-slate-800 dark:text-white">Recent Visitors</h3>
                        <button className="text-sm text-purple-600 font-bold hover:underline">View All History</button>
                    </div>

                    <div className="space-y-4">
                        {viewers && viewers.length > 0 ? (
                            viewers.slice(0, 3).map((visitor, i) => (
                                <div key={i} className="group flex items-center gap-4 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 hover:shadow-md transition-all cursor-pointer">
                                    {/* Avatar with Match Score */}
                                    <div className="relative flex-shrink-0">
                                        <div className="w-14 h-14 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden border-2 border-white dark:border-slate-600 shadow-sm transition-transform group-hover:scale-105">
                                            {visitor.profile_picture ? (
                                                <img
                                                    src={visitor.profile_picture}
                                                    alt="User"
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        e.target.onerror = null;
                                                        e.target.style.display = 'none';
                                                        e.target.parentElement.classList.add('bg-gradient-to-br', 'from-purple-400', 'to-indigo-500');
                                                        e.target.parentElement.innerHTML = `<span class="text-white font-bold text-xl">${visitor.name?.[0] || 'U'}</span>`;
                                                    }}
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-400 to-indigo-500 text-white font-bold text-xl">
                                                    {visitor.name?.[0] || 'U'}
                                                </div>
                                            )}
                                        </div>
                                        <div className="absolute -bottom-1 -right-1 bg-slate-900 dark:bg-black text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow-sm border border-white dark:border-slate-700">
                                            {visitor.match_score || 0}%
                                        </div>
                                    </div>

                                    {/* Details */}
                                    <div className="flex-1 min-w-0 ml-1">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h4 className="font-bold text-slate-900 dark:text-white text-base group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors flex items-center gap-1.5">
                                                    {visitor.name || 'Anonymous'}
                                                    {visitor.is_verified && (
                                                        <span className="ml-2 inline-flex items-center text-[10px] bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded-full font-medium align-middle">
                                                            <ShieldCheck className="w-3 h-3 mr-0.5" /> Verified
                                                        </span>
                                                    )}
                                                </h4>
                                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                                                    {visitor.age ? `${visitor.age} yrs` : ''}
                                                    {visitor.age && visitor.height ? ' • ' : ''}
                                                    {visitor.height || ''}
                                                    {(visitor.age || visitor.height) && visitor.profession ? ' • ' : ''}
                                                    {visitor.profession || ''}
                                                </p>
                                            </div>
                                            <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">{formatTimeAgo(visitor.viewed_at)}</span>
                                        </div>

                                        {/* Quick Info Tags */}
                                        {visitor.city && (
                                            <div className="flex gap-2 mt-2">
                                                <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center bg-white dark:bg-slate-700 px-2 py-1 rounded-md border border-slate-100 dark:border-slate-600">
                                                    <MapPin className="w-3 h-3 mr-1" /> {visitor.city}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Action */}
                                    <div className="p-2 rounded-full text-slate-300 dark:text-slate-600 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-slate-700 transition-colors">
                                        <ChevronRight className="w-6 h-6" />
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8 text-slate-400 dark:text-slate-500">
                                <Eye className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                <p>No recent visitors yet</p>
                            </div>
                        )}
                    </div>
                </BentoCard>

            </BentoGrid>
        </div>
    );
};

export default AnalyticsDashboard;