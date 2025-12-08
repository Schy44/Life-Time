import React, { useState, useEffect } from 'react';
import {
    Eye, Users, Heart, TrendingUp, Award, Target,
    Calendar, MapPin, User, Loader
} from 'lucide-react';
import { getBasicStats, whoViewedMe, getAdvancedAnalytics } from '../services/analyticsService';

const AnalyticsDashboard = () => {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);
    const [viewers, setViewers] = useState(null);
    const [advanced, setAdvanced] = useState(null);
    const [timeRange, setTimeRange] = useState(30);

    useEffect(() => {
        loadAnalytics();
    }, [timeRange]);

    const loadAnalytics = async () => {
        setLoading(true);
        try {
            const [basicStats, viewersData, advancedData] = await Promise.all([
                getBasicStats(),
                whoViewedMe(timeRange),
                getAdvancedAnalytics(timeRange)
            ]);

            setStats(basicStats);
            setViewers(viewersData);
            setAdvanced(advancedData);
        } catch (error) {
            console.error('Error loading analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader className="w-8 h-8 animate-spin text-purple-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics Dashboard</h1>
                    <p className="text-gray-600">Track your profile performance and engagement</p>
                </div>

                {/* Time Range Selector */}
                <div className="mb-6 flex gap-2">
                    {[7, 30, 90].map((days) => (
                        <button
                            key={days}
                            onClick={() => setTimeRange(days)}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${timeRange === days
                                ? 'bg-purple-600 text-white'
                                : 'bg-white text-gray-700 hover:bg-gray-100'
                                }`}
                        >
                            {days} Days
                        </button>
                    ))}
                </div>

                {/* Stats Cards */}
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatCard
                        icon={<Eye className="w-6 h-6" />}
                        title="Profile Views"
                        value={timeRange === 7 ? stats?.profile_views_7d : stats?.profile_views_30d}
                        subtitle={`Last ${timeRange} days`}
                        color="purple"
                    />
                    <StatCard
                        icon={<Heart className="w-6 h-6" />}
                        title="Interests Received"
                        value={stats?.interests_received}
                        subtitle="Total interests"
                        color="pink"
                    />
                    <StatCard
                        icon={<TrendingUp className="w-6 h-6" />}
                        title="Acceptance Rate"
                        value={`${stats?.acceptance_rate}%`}
                        subtitle="Interest success"
                        color="green"
                    />
                    <StatCard
                        icon={<Award className="w-6 h-6" />}
                        title="Profile Strength"
                        value={`${stats?.profile_strength}%`}
                        subtitle="Completion score"
                        color="blue"
                    />
                </div>

                {/* Main Content Grid */}
                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Left Column - Profile Strength */}
                    <div className="lg:col-span-1">
                        <ProfileStrengthCard
                            strength={stats?.profile_strength}
                            suggestions={stats?.profile_strength_suggestions}
                        />
                    </div>

                    {/* Right Column - Charts and Lists */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Daily Views Chart */}
                        <DailyViewsChart data={advanced?.daily_views} />

                        {/* Who Viewed Me */}
                        <WhoViewedMeCard viewers={viewers?.viewers} />

                        {/* Demographics */}
                        <DemographicsCard demographics={advanced?.demographics} />
                    </div>
                </div>
            </div>
        </div>
    );
};

// Stat Card Component
const StatCard = ({ icon, title, value, subtitle, color }) => {
    const colorClasses = {
        purple: 'bg-purple-100 text-purple-600',
        pink: 'bg-pink-100 text-pink-600',
        green: 'bg-green-100 text-green-600',
        blue: 'bg-blue-100 text-blue-600',
    };

    return (
        <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className={`w-12 h-12 rounded-lg ${colorClasses[color]} flex items-center justify-center mb-4`}>
                {icon}
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{value || 0}</div>
            <div className="text-sm font-medium text-gray-900 mb-1">{title}</div>
            <div className="text-xs text-gray-500">{subtitle}</div>
        </div>
    );
};

// Profile Strength Card
const ProfileStrengthCard = ({ strength, suggestions }) => {
    return (
        <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Profile Strength</h3>

            {/* Circular Progress */}
            <div className="flex justify-center mb-6">
                <div className="relative w-32 h-32">
                    <svg className="w-32 h-32 transform -rotate-90">
                        <circle
                            cx="64"
                            cy="64"
                            r="56"
                            stroke="#e5e7eb"
                            strokeWidth="8"
                            fill="none"
                        />
                        <circle
                            cx="64"
                            cy="64"
                            r="56"
                            stroke="#9333ea"
                            strokeWidth="8"
                            fill="none"
                            strokeDasharray={`${2 * Math.PI * 56}`}
                            strokeDashoffset={`${2 * Math.PI * 56 * (1 - (strength || 0) / 100)}`}
                            strokeLinecap="round"
                        />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-3xl font-bold text-gray-900">{strength || 0}%</span>
                    </div>
                </div>
            </div>

            {/* Suggestions */}
            <div className="space-y-3">
                <h4 className="text-sm font-semibold text-gray-700">Suggestions to Improve:</h4>
                {suggestions && suggestions.length > 0 ? (
                    suggestions.map((suggestion, index) => (
                        <div key={index} className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg">
                            <Target className={`w-4 h-4 mt-0.5 flex-shrink-0 ${suggestion.type === 'critical' ? 'text-red-500' :
                                suggestion.type === 'important' ? 'text-orange-500' :
                                    'text-blue-500'
                                }`} />
                            <div className="flex-1">
                                <p className="text-sm text-gray-900">{suggestion.message}</p>
                                <span className="text-xs text-gray-500">+{suggestion.points} points</span>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-sm text-gray-500">Your profile is complete! 🎉</p>
                )}
            </div>
        </div>
    );
};

// Daily Views Chart
const DailyViewsChart = ({ data }) => {
    if (!data || data.length === 0) {
        return (
            <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Daily Profile Views</h3>
                <p className="text-gray-500 text-center py-8">No view data available yet</p>
            </div>
        );
    }

    const maxViews = Math.max(...data.map(d => d.count), 1);

    return (
        <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Daily Profile Views</h3>

            <div className="flex items-end justify-between gap-2 h-48">
                {data.map((item, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center">
                        <div
                            className="w-full bg-gradient-to-t from-purple-600 to-purple-400 rounded-t-lg transition-all hover:opacity-80"
                            style={{ height: `${(item.count / maxViews) * 100}%` }}
                            title={`${item.count} views`}
                        />
                        <span className="text-xs text-gray-500 mt-2">
                            {new Date(item.date).getDate()}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

// Who Viewed Me Card
const WhoViewedMeCard = ({ viewers }) => {
    return (
        <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Who Viewed Your Profile</h3>

            {viewers && viewers.length > 0 ? (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                    {viewers.slice(0, 10).map((viewer, index) => (
                        <div key={index} className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                            <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                                {viewer.profile_picture ? (
                                    <img
                                        src={viewer.profile_picture}
                                        alt={viewer.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-purple-100">
                                        <User className="w-6 h-6 text-purple-600" />
                                    </div>
                                )}
                            </div>

                            <div className="flex-1 min-w-0">
                                <p className="font-medium text-gray-900 truncate">{viewer.name}</p>
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <span>{viewer.age} years</span>
                                    {viewer.city && (
                                        <>
                                            <span>•</span>
                                            <span className="flex items-center gap-1">
                                                <MapPin className="w-3 h-3" />
                                                {viewer.city}
                                            </span>
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className="text-right">
                                <p className="text-xs text-gray-500">
                                    {new Date(viewer.viewed_at).toLocaleDateString()}
                                </p>
                                <p className="text-xs text-gray-400">
                                    {new Date(viewer.viewed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-gray-500 text-center py-8">No profile views yet</p>
            )}
        </div>
    );
};

// Demographics Card
const DemographicsCard = ({ demographics }) => {
    if (!demographics) {
        return null;
    }

    const { age_distribution, religion_distribution, location_distribution } = demographics;

    return (
        <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Viewer Demographics</h3>

            <div className="grid md:grid-cols-3 gap-6">
                {/* Age Distribution */}
                <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Age Groups</h4>
                    <div className="space-y-2">
                        {Object.entries(age_distribution || {}).map(([range, count]) => (
                            <div key={range} className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">{range}</span>
                                <span className="text-sm font-medium text-gray-900">{count}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Religion Distribution */}
                <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Religion</h4>
                    <div className="space-y-2">
                        {Object.entries(religion_distribution || {}).slice(0, 5).map(([religion, count]) => (
                            <div key={religion} className="flex items-center justify-between">
                                <span className="text-sm text-gray-600 capitalize">{religion}</span>
                                <span className="text-sm font-medium text-gray-900">{count}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Location Distribution */}
                <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Top Locations</h4>
                    <div className="space-y-2">
                        {Object.entries(location_distribution || {}).slice(0, 5).map(([city, count]) => (
                            <div key={city} className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">{city}</span>
                                <span className="text-sm font-medium text-gray-900">{count}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AnalyticsDashboard;
