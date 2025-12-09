import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getProfiles, getProfile, sendInterest } from '../services/api';
import GlassCard from '../components/GlassCard';
import AnimatedBackground from '../components/AnimatedBackground';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Filter, XCircle, Zap, User, Grid, List, Heart, Clock, Activity, Layers } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import ProfileCardStack from '../components/ProfileCardStack';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useDebounce } from 'use-debounce';

const ProfilesListPage = () => {
  const [profiles, setProfiles] = useState([]);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  // Debounce search term to avoid triggering API calls on every keystroke
  const [debouncedSearchTerm] = useDebounce(searchTerm, 500);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [ageFilter, setAgeFilter] = useState('');
  const [genderFilter, setGenderFilter] = useState('');
  const [interestFilter, setInterestFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('default');

  // View Mode
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  const [currentUserProfile, setCurrentUserProfile] = useState(null);
  const [sendingInterest, setSendingInterest] = useState({}); // Track loading state per profile
  const [currentCardIndex, setCurrentCardIndex] = useState(0); // Track current card in Quick Match

  // Helper to check if profile is new (created within last 7 days)
  const isNewProfile = (createdAt) => {
    if (!createdAt) return false;
    const created = new Date(createdAt);
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    return created > sevenDaysAgo;
  };

  // Helper to check if profile is active (updated within last 24 hours)
  const isActiveProfile = (updatedAt) => {
    if (!updatedAt) return false;
    const updated = new Date(updatedAt);
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    return updated > oneDayAgo;
  };

  // Server-side data with React Query (cached per filter set)
  const {
    data,
    isLoading,
    isFetching,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['profiles', { searchTerm: debouncedSearchTerm, ageFilter, genderFilter, interestFilter }],
    queryFn: async ({ pageParam = 1 }) => {
      const params = {
        page: pageParam,
        search: debouncedSearchTerm,
        age: ageFilter,
        gender: genderFilter,
        interest: interestFilter,
      };
      return getProfiles(params);
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage && lastPage.next) {
        // DRF-style pagination: use next page number incrementally
        return allPages.length + 1;
      }
      return undefined;
    },
    placeholderData: (previousData) => previousData, // Keep previous data while fetching new data
    staleTime: 30000, // Consider data fresh for 30 seconds
  });

  // Flatten all pages into a single list
  const serverProfiles = React.useMemo(() => {
    if (!data || !data.pages) return [];
    const pages = data.pages;
    let all = [];
    pages.forEach((page) => {
      if (page?.results) {
        all = all.concat(page.results);
      } else if (Array.isArray(page)) {
        all = all.concat(page);
      }
    });
    return all;
  }, [data]);

  // Client-side filtering for instant results
  useEffect(() => {
    let filtered = [...serverProfiles];

    // Apply search term
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (profile) =>
          profile.name?.toLowerCase().includes(lowerSearch) ||
          profile.current_city?.toLowerCase().includes(lowerSearch) ||
          profile.current_country?.toLowerCase().includes(lowerSearch) ||
          profile.bio?.toLowerCase().includes(lowerSearch)
      );

      // Generate suggestions
      const nameSuggestions = serverProfiles
        .filter(p => p.name?.toLowerCase().includes(lowerSearch))
        .slice(0, 3)
        .map(p => ({ type: 'name', value: p.name, id: p.id }));

      const citySuggestions = [...new Set(
        serverProfiles
          .filter(p => p.current_city?.toLowerCase().includes(lowerSearch))
          .map(p => p.current_city)
      )]
        .slice(0, 2)
        .map(city => ({ type: 'city', value: city }));

      setSuggestions([...nameSuggestions, ...citySuggestions]);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }

    // Apply age filter
    if (ageFilter) {
      const [minAge, maxAge] = ageFilter.split('-').map(Number);
      filtered = filtered.filter(
        (profile) => profile.age >= minAge && profile.age <= maxAge
      );
    }

    // Apply gender filter
    if (genderFilter) {
      filtered = filtered.filter(
        (profile) => profile.gender?.toLowerCase() === genderFilter.toLowerCase()
      );
    }

    // Apply interest filter
    if (interestFilter) {
      filtered = filtered.filter(
        (profile) =>
          profile.interests &&
          profile.interests.some((interest) =>
            interest.toLowerCase().includes(interestFilter.toLowerCase())
          )
      );
    }

    setProfiles(filtered);
  }, [searchTerm, ageFilter, genderFilter, interestFilter, serverProfiles]);

  // Fetch current user profile once
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userProfile = await getProfile();
        setCurrentUserProfile(userProfile);
      } catch (err) {
        console.error("Failed to fetch user profile", err);
      }
    };
    fetchUser();
  }, []);

  const handleLoadMore = () => {
    if (hasNextPage) {
      fetchNextPage();
    }
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setAgeFilter('');
    setGenderFilter('');
    setInterestFilter('');
  };

  const handleSendInterest = async (e, profileId) => {
    e.preventDefault(); // Prevent navigation
    e.stopPropagation();

    if (sendingInterest[profileId]) return;

    setSendingInterest(prev => ({ ...prev, [profileId]: true }));
    try {
      await sendInterest(profileId);
      alert("Interest sent successfully!");
      // Optionally update local state to show "Sent" status
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "Failed to send interest.");
    } finally {
      setSendingInterest(prev => ({ ...prev, [profileId]: false }));
    }
  };

  // Client-side sorting for the *currently loaded* profiles
  const sortedProfiles = [...profiles].sort((a, b) => {
    if (sortBy === 'compatibility') {
      return (b.compatibility_score || 0) - (a.compatibility_score || 0);
    }
    return 0; // Default order (usually ID or created_at from backend)
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  // Only show fullscreen loader on initial load (when there's no data yet)
  if (isLoading && !data) {
    return <LoadingSpinner size="fullscreen" message="Discovering perfect matches..." />;
  }

  if (isError) {
    return (
      <div className="flex justify-center items-center h-screen text-red-500 text-xl">
        Error: {error?.message || 'Failed to fetch profiles.'}
      </div>
    );
  }

  return (
    <>
      <AnimatedBackground />
      {/* Subtle loading bar when fetching new data */}
      {isFetching && (
        <div className="fixed top-0 left-0 right-0 z-50">
          <div className="h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 animate-pulse"></div>
        </div>
      )}
      <main className="relative min-h-screen p-4 sm:p-6 md:p-8 font-sans bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto">
          {/* Featured Swipeable Cards Section */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Quick Match</h2>
              <span className="text-sm text-gray-600 dark:text-gray-400">Swipe to connect</span>
            </div>

            {/* Card Container with Side Preview */}
            <div className="flex justify-center items-center gap-6 lg:gap-8">
              {/* Main Card Stack */}
              <div className="w-full max-w-md mx-auto" style={{ height: '550px' }}>
                <ProfileCardStack
                  profiles={sortedProfiles.slice(0, 10)}
                  onIndexChange={(index) => setCurrentCardIndex(index)}
                  onLike={async (profile) => {
                    try {
                      await sendInterest(profile.id);
                      console.log('Liked:', profile.name);
                    } catch (err) {
                      console.error('Failed to send interest:', err);
                    }
                  }}
                  onPass={(profile) => {
                    console.log('Passed:', profile.name);
                  }}
                  onUndo={(action) => {
                    console.log('Undid action:', action);
                  }}
                />
              </div>

              {/* Right Preview Card - Hidden on mobile, shown on lg+ */}
              <div className="hidden lg:block w-72 h-96 relative">
                {sortedProfiles[currentCardIndex + 1] && (
                  <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-lg blur-sm opacity-40 hover:blur-none hover:opacity-60 transition-all duration-300">
                    <img
                      src={sortedProfiles[currentCardIndex + 1].profile_image || '/placeholder-profile.png'}
                      alt="Next profile"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-4 left-4 text-white">
                      <p className="font-semibold">{sortedProfiles[currentCardIndex + 1].name}</p>
                      <p className="text-sm opacity-80">Up next</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Page Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4"
          >
            <h1 className="text-4xl font-extrabold text-gray-800 dark:text-white">
              Discover Connections
            </h1>

            {/* View Toggle */}
            <div className="flex bg-white/20 dark:bg-gray-800/20 backdrop-blur-md rounded-lg p-1 border border-white/30 dark:border-gray-700/30">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-gray-700 text-purple-600 dark:text-purple-400 shadow-sm' : 'text-gray-600 dark:text-gray-300 hover:bg-white/10 dark:hover:bg-gray-700/30'}`}
                title="Grid View"
              >
                <Grid size={20} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-white dark:bg-gray-700 text-purple-600 dark:text-purple-400 shadow-sm' : 'text-gray-600 dark:text-gray-300 hover:bg-white/10 dark:hover:bg-gray-700/30'}`}
                title="List View"
              >
                <List size={20} />
              </button>
            </div>
          </motion.div>

          {currentUserProfile && currentUserProfile.compatibility_score === null && (
            <div className="p-3 mt-4 mb-6 bg-purple-800/30 border border-purple-600 rounded-lg flex items-center justify-center shadow-lg">
              <User size={20} className="mr-3 text-purple-300" />
              <p className="text-sm font-medium text-white text-center">
                For seeing compatibility with other users, please <Link to="/profile" className="text-purple-200 underline hover:text-purple-100 transition-colors">complete your profile properly</Link>.
              </p>
            </div>
          )}

          {/* Filter and Search Section */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6 mb-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
              {/* Enhanced Search Bar */}
              <div className="relative w-full md:w-1/2 group">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-purple-500 transition-colors" size={20} />
                <input
                  type="text"
                  placeholder="Search by name, city, or interests..."
                  className="w-full pl-12 pr-12 py-3 rounded-xl bg-gray-50 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 focus:border-purple-500 focus:bg-white dark:focus:bg-gray-600 focus:outline-none transition-all text-gray-800 dark:text-white placeholder-gray-400 shadow-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {/* Loading indicator when debouncing */}
                {searchTerm && searchTerm !== debouncedSearchTerm && (
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-purple-500 border-t-transparent"></div>
                  </div>
                )}
                {/* Clear Button - only show when not loading */}
                {searchTerm && searchTerm === debouncedSearchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    aria-label="Clear search"
                  >
                    <XCircle size={18} />
                  </button>
                )}
                {/* Search Results Count */}
                {searchTerm && (
                  <div className="absolute -bottom-6 left-0 text-xs text-gray-500 dark:text-gray-400">
                    {sortedProfiles.length} {sortedProfiles.length === 1 ? 'result' : 'results'} found
                  </div>
                )}

                {/* Live Suggestions Dropdown */}
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute top-full mt-2 w-full bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
                    {suggestions.map((suggestion, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          if (suggestion.type === 'name') {
                            setSearchTerm(suggestion.value);
                            setShowSuggestions(false);
                          } else {
                            setSearchTerm(suggestion.value);
                          }
                        }}
                        className="w-full px-4 py-3 text-left hover:bg-purple-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-3 border-b border-gray-100 dark:border-gray-700 last:border-0"
                      >
                        {suggestion.type === 'name' ? (
                          <>
                            <User size={16} className="text-purple-500 flex-shrink-0" />
                            <span className="text-gray-800 dark:text-white font-medium">{suggestion.value}</span>
                          </>
                        ) : (
                          <>
                            <MapPin size={16} className="text-blue-500 flex-shrink-0" />
                            <span className="text-gray-800 dark:text-white">{suggestion.value}</span>
                          </>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-2 w-full md:w-auto">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex-1 md:flex-none flex items-center justify-center px-6 py-2 bg-purple-600 text-white rounded-full shadow-lg hover:bg-purple-700 transition-colors"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter size={20} className="mr-2" />
                  {showFilters ? 'Hide' : 'Filters'}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`flex-1 md:flex-none flex items-center justify-center px-6 py-2 rounded-full shadow-lg transition-colors ${sortBy === 'compatibility' ? 'bg-blue-700 text-white ring-2 ring-blue-400' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                  onClick={() => setSortBy(sortBy === 'compatibility' ? 'default' : 'compatibility')}
                >
                  <Zap size={20} className="mr-2" />
                  {sortBy === 'compatibility' ? 'Best Match' : 'Sort: Default'}
                </motion.button>
              </div>
            </div>

            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 overflow-hidden"
                >
                  {/* Age Filter */}
                  <select
                    className="w-full px-4 py-2 rounded-full bg-white/20 dark:bg-gray-700/50 border border-purple-500/30 focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-800 dark:text-white"
                    value={ageFilter}
                    onChange={(e) => setAgeFilter(e.target.value)}
                  >
                    <option value="">All Ages</option>
                    <option value="18-25">18-25</option>
                    <option value="26-35">26-35</option>
                    <option value="36-45">36-45</option>
                    <option value="46-99">46+</option>
                  </select>

                  {/* Gender Filter */}
                  <select
                    className="w-full px-4 py-2 rounded-full bg-white/20 dark:bg-gray-700/50 border border-purple-500/30 focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-800 dark:text-white"
                    value={genderFilter}
                    onChange={(e) => setGenderFilter(e.target.value)}
                  >
                    <option value="">All Genders</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>

                  {/* Interests Filter */}
                  <input
                    type="text"
                    placeholder="Filter by Interest (e.g., hiking)"
                    className="w-full px-4 py-2 rounded-full bg-white/20 dark:bg-gray-700/50 border border-purple-500/30 focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-800 dark:text-white placeholder-gray-400"
                    value={interestFilter}
                    onChange={(e) => setInterestFilter(e.target.value)}
                  />

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center justify-center px-6 py-2 bg-red-600 text-white rounded-full shadow-lg hover:bg-red-700 transition-colors md:col-span-3"
                    onClick={handleClearFilters}
                  >
                    <XCircle size={20} className="mr-2" />
                    Clear Filters
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Profile Grid/List */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className={`grid gap-6 transition-opacity duration-300 ${isFetching && !isLoading ? 'opacity-60' : 'opacity-100'} ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}
          >
            {sortedProfiles.length > 0 ? (
              sortedProfiles.map((profile) => (
                <motion.div key={profile.id} variants={itemVariants}>
                  <Link to={`/profiles/${profile.id}`} className="group block h-full">
                    <div className={`relative bg-white dark:bg-gray-800 rounded-2xl overflow-hidden h-full transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 border border-transparent dark:border-gray-700 ${viewMode === 'list' ? 'flex flex-row items-stretch' : 'flex flex-col'}`}>

                      {/* Badges */}
                      <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
                        {isNewProfile(profile.created_at) && (
                          <span className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-lg flex items-center gap-1 backdrop-blur-sm">
                            <Clock size={10} /> NEW
                          </span>
                        )}
                        {isActiveProfile(profile.updated_at) && (
                          <span className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-lg flex items-center gap-1 backdrop-blur-sm">
                            <Activity size={10} /> ACTIVE
                          </span>
                        )}
                      </div>

                      {/* Quick Action Button (Top Right) */}
                      <button
                        onClick={(e) => handleSendInterest(e, profile.id)}
                        disabled={sendingInterest[profile.id]}
                        className={`absolute top-3 right-3 z-20 w-9 h-9 rounded-full shadow-md transition-all transform hover:scale-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center ${sendingInterest[profile.id] ? 'bg-gray-100 dark:bg-gray-700' : 'bg-white dark:bg-gray-700 hover:bg-pink-50 dark:hover:bg-gray-600 text-gray-400 hover:text-pink-500 dark:hover:text-pink-400'
                          }`}
                        title="Send Interest"
                      >
                        {sendingInterest[profile.id] ? (
                          <LoadingSpinner size="small" color="purple" />
                        ) : (
                          <Heart size={18} className="fill-current" />
                        )}
                      </button>

                      {/* Image Section with Overlay Content */}
                      <div className={`relative ${viewMode === 'list' ? 'w-64 h-64 flex-shrink-0' : 'w-full'}`}>
                        {/* Compatibility Score Badge on Image */}
                        {profile.compatibility_score !== null && (
                          <div className="absolute top-3 right-14 z-10">
                            <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-full px-2.5 py-1 shadow-lg border border-transparent">
                              <span className="text-xs font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                                {profile.compatibility_score}% Match
                              </span>
                            </div>
                          </div>
                        )}

                        <div className={`relative ${viewMode === 'list' ? 'h-full' : 'h-80'} bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-700 dark:to-gray-600`}>
                          {profile.profile_image ? (
                            <img
                              src={profile.profile_image}
                              alt={profile.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <User size={64} className="text-gray-300 dark:text-gray-500" />
                            </div>
                          )}

                          {/* Gradient Overlay for Text Readability */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>

                          {/* Content Overlay */}
                          <div className={`absolute bottom-0 left-0 right-0 p-5 flex flex-col text-white`}>
                            {/* Name and Age */}
                            <h2 className="text-xl font-bold mb-1 drop-shadow-lg flex items-center gap-2">
                              <span>
                                {profile.name}
                                {profile.age && <span className="font-medium text-base ml-1 opacity-90">{profile.age}</span>}
                              </span>
                              {profile.is_verified && (
                                <svg className="w-5 h-5 text-blue-400 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                                  <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                                </svg>
                              )}
                            </h2>

                            {/* Location */}
                            <div className="flex items-center text-sm mb-3 drop-shadow-md">
                              <MapPin size={14} className="mr-1.5 flex-shrink-0" />
                              <span className="truncate">{profile.current_city || 'Unknown City'}, {profile.current_country || 'Unknown'}</span>
                            </div>

                            {/* Bio */}
                            {profile.bio && (
                              <p className="text-sm leading-relaxed mb-3 line-clamp-2 drop-shadow-md opacity-90">
                                {profile.bio}
                              </p>
                            )}

                            {/* Interests Tags */}
                            {profile.interests && profile.interests.length > 0 && (
                              <div className="flex flex-wrap gap-1.5">
                                {profile.interests.slice(0, 3).map((interest, idx) => (
                                  <span
                                    key={idx}
                                    className="bg-white/20 backdrop-blur-sm text-white text-xs font-medium px-2.5 py-1 rounded-lg border border-white/30"
                                  >
                                    {interest}
                                  </span>
                                ))}
                                {profile.interests.length > 3 && (
                                  <span className="bg-white/20 backdrop-blur-sm text-white text-xs font-medium px-2.5 py-1 rounded-lg border border-white/30">
                                    +{profile.interests.length - 3}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                    </div>
                  </Link>
                </motion.div>
              ))
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="col-span-full text-center text-gray-600 dark:text-gray-300 text-lg py-10"
              >
                <XCircle size={48} className="mx-auto mb-4 text-gray-400" />
                No profiles found matching your criteria.
              </motion.div>
            )}
          </motion.div>

          {/* Load More Button */}
          {hasNextPage && sortedProfiles.length > 0 && (
            <div className="flex justify-center mt-12">
              <button
                onClick={handleLoadMore}
                disabled={isFetchingNextPage}
                className="px-8 py-3 bg-white dark:bg-gray-800 text-purple-600 dark:text-purple-400 font-bold rounded-full shadow-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isFetchingNextPage ? <LoadingSpinner size="small" /> : 'Load More Profiles'}
              </button>
            </div>
          )}

          {/* Enhanced Disclaimer Banner */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mt-16 mb-8 px-4"
          >
            <motion.div
              animate={{
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
              }}
              transition={{
                duration: 5,
                ease: "linear",
                repeat: Infinity,
              }}
              className="relative bg-gradient-to-r from-amber-400 via-orange-400 to-amber-400 bg-[length:200%_100%] rounded-2xl p-[3px] shadow-2xl max-w-5xl mx-auto overflow-hidden"
            >
              {/* Subtle glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-amber-400/20 via-orange-400/20 to-amber-400/20 blur-xl"></div>

              <div className="relative bg-gradient-to-br from-white to-amber-50/50 dark:from-gray-800 dark:to-gray-900 rounded-2xl backdrop-blur-sm">
                <div className="flex flex-col md:flex-row items-center justify-center gap-4 px-6 py-6 md:px-8 md:py-7">
                  {/* Enhanced Icon with gradient background */}
                  <motion.div
                    animate={{
                      scale: [1, 1.05, 1],
                      rotate: [0, 5, -5, 0]
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="flex-shrink-0"
                  >
                    <div className="relative">
                      {/* Icon glow */}
                      <div className="absolute inset-0 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full blur-md opacity-50"></div>
                      <div className="relative w-14 h-14 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white dark:border-gray-700">
                        <svg
                          className="w-7 h-7 text-white drop-shadow-md"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                  </motion.div>

                  {/* Enhanced Text Content */}
                  <div className="flex-1 text-center md:text-left">
                    <p className="text-sm md:text-base leading-relaxed text-gray-800 dark:text-gray-200">
                      <span className="font-semibold text-gray-900 dark:text-white">Our platform is here to help people meet and connect.</span>{' '}
                      Since we don't verify backgrounds, please make sure to do your own checks. We are not responsible for any consequences.
                    </p>
                  </div>

                  {/* Decorative pulsing dot */}
                  <motion.div
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.5, 1, 0.5],
                    }}
                    transition={{
                      duration: 2,
                      ease: "easeInOut",
                      repeat: Infinity,
                    }}
                    className="hidden lg:block flex-shrink-0"
                  >
                    <div className="w-3 h-3 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full shadow-lg"></div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </main>
    </>
  );
};

export default ProfilesListPage;
