import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getProfiles, getProfile, sendInterest } from '../services/api';
import AnimatedBackground from '../components/AnimatedBackground';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Filter, XCircle, Zap, User, Grid, List, Heart, Clock, Activity } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import ProfileCardStack from '../components/ProfileCardStack';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useDebounce } from 'use-debounce';

const ProfilesListPage = () => {
  // --- UI State (Controls only, no data duplication) ---
  const [searchTerm, setSearchTerm] = useState('');
  // Debounce search term for API calls
  const [debouncedSearchTerm] = useDebounce(searchTerm, 500);

  const [showSuggestions, setShowSuggestions] = useState(false);
  const [ageFilter, setAgeFilter] = useState('');
  const [genderFilter, setGenderFilter] = useState('');
  const [interestFilter, setInterestFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('default');
  const [viewMode, setViewMode] = useState('grid');

  const [currentUserProfile, setCurrentUserProfile] = useState(null);
  const [sendingInterest, setSendingInterest] = useState({});
  const [currentCardIndex, setCurrentCardIndex] = useState(0);

  // --- Helpers ---
  const isNewProfile = (createdAt) => {
    if (!createdAt) return false;
    const created = new Date(createdAt);
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    return created > sevenDaysAgo;
  };

  const isActiveProfile = (updatedAt) => {
    if (!updatedAt) return false;
    const updated = new Date(updatedAt);
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    return updated > oneDayAgo;
  };

  // --- 1. Server Data Fetching (Single Source of Truth) ---
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
        search: debouncedSearchTerm, // API handles filtering
        age: ageFilter,
        gender: genderFilter,
        interest: interestFilter,
      };
      return getProfiles(params);
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage && lastPage.next) {
        return allPages.length + 1;
      }
      return undefined;
    },
    placeholderData: (previousData) => previousData,
    staleTime: 60 * 1000, // 1 minute cache
  });

  // --- 2. Data Derivation (Fast & Memoized) ---

  // Flatten pages
  const serverProfiles = useMemo(() => {
    if (!data || !data.pages) return [];
    let all = [];
    data.pages.forEach((page) => {
      if (page?.results) all = all.concat(page.results);
      else if (Array.isArray(page)) all = all.concat(page);
    });
    return all;
  }, [data]);

  // Generate Suggestions (Instant, based on local loaded data)
  const suggestions = useMemo(() => {
    if (!searchTerm) return [];
    const lowerSearch = searchTerm.toLowerCase();

    const nameSuggestions = serverProfiles
      .filter(p => p.name?.toLowerCase().includes(lowerSearch))
      .slice(0, 3)
      .map(p => ({ type: 'name', value: p.name, id: p.id }));

    const citySuggestions = [...new Set(
      serverProfiles
        .filter(p => p.current_city?.toLowerCase().includes(lowerSearch))
        .map(p => p.current_city)
    )].slice(0, 2).map(city => ({ type: 'city', value: city }));

    return [...nameSuggestions, ...citySuggestions];
  }, [searchTerm, serverProfiles]); // Updates instantly on typing

  // Final Visible List (Handles client-side sorting)
  const visibleProfiles = useMemo(() => {
    // We rely on Server for filtering (via query params) to ensure pagination works.
    // We only handle Sorting here.
    const result = [...serverProfiles];

    if (sortBy === 'compatibility') {
      result.sort((a, b) => (b.compatibility_score || 0) - (a.compatibility_score || 0));
    }

    return result;
  }, [serverProfiles, sortBy]);


  // --- Effects & Handlers ---

  useEffect(() => {
    // Open suggestions if we have matches and user is typing
    if (searchTerm && suggestions.length > 0) setShowSuggestions(true);
    else if (!searchTerm) setShowSuggestions(false);
  }, [searchTerm, suggestions.length]);

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

  const handleClearFilters = () => {
    setSearchTerm('');
    setAgeFilter('');
    setGenderFilter('');
    setInterestFilter('');
  };

  const handleSendInterest = async (e, profileId) => {
    e.preventDefault();
    e.stopPropagation();
    if (sendingInterest[profileId]) return;

    setSendingInterest(prev => ({ ...prev, [profileId]: true }));
    try {
      await sendInterest(profileId);
      alert("Interest sent successfully!");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "Failed to send interest.");
    } finally {
      setSendingInterest(prev => ({ ...prev, [profileId]: false }));
    }
  };

  // Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } }, // Faster stagger
  };

  const itemVariants = {
    hidden: { y: 10, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  // --- Render ---

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
      {/* Loading Bar */}
      {isFetching && (
        <div className="fixed top-0 left-0 right-0 z-50">
          <div className="h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 animate-pulse"></div>
        </div>
      )}

      <main className="relative min-h-screen p-4 sm:p-6 md:p-8 font-sans bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto">

          {/* Featured / Quick Match Section */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Quick Match</h2>
              <span className="text-sm text-gray-600 dark:text-gray-400">Swipe to connect</span>
            </div>
            <div className="flex justify-center items-center gap-6 lg:gap-8">
              <div className="w-full max-w-md mx-auto" style={{ height: '550px' }}>
                <ProfileCardStack
                  profiles={visibleProfiles.slice(0, 10)}
                  onIndexChange={setCurrentCardIndex}
                  onLike={async (profile) => {
                    try { await sendInterest(profile.id); } catch (err) { console.error(err); }
                  }}
                  onPass={() => { }}
                />
              </div>
              {/* Preview Card */}
              <div className="hidden lg:block w-72 h-96 relative">
                {visibleProfiles[currentCardIndex + 1] && (
                  <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-lg blur-sm opacity-40 hover:blur-none hover:opacity-60 transition-all duration-300">
                    <img
                      src={visibleProfiles[currentCardIndex + 1].profile_image || '/placeholder-profile.png'}
                      alt="Next"
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Header & Controls */}
          <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
            <h1 className="text-4xl font-extrabold text-gray-800 dark:text-white">Discover Connections</h1>
            <div className="flex bg-white/20 dark:bg-gray-800/20 backdrop-blur-md rounded-lg p-1 border border-white/30 dark:border-gray-700/30">
              <button onClick={() => setViewMode('grid')} className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-gray-700 text-purple-600 shadow-sm' : 'text-gray-600 dark:text-gray-300'}`}>
                <Grid size={20} />
              </button>
              <button onClick={() => setViewMode('list')} className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-white dark:bg-gray-700 text-purple-600 shadow-sm' : 'text-gray-600 dark:text-gray-300'}`}>
                <List size={20} />
              </button>
            </div>
          </div>

          {/* Warning Banner */}
          {currentUserProfile && currentUserProfile.compatibility_score === null && (
            <div className="p-3 mt-4 mb-6 bg-purple-800/30 border border-purple-600 rounded-lg flex items-center justify-center shadow-lg">
              <User size={20} className="mr-3 text-purple-300" />
              <p className="text-sm font-medium text-white text-center">
                For seeing compatibility with other users, please <Link to="/profile" className="text-purple-200 underline">complete your profile properly</Link>.
              </p>
            </div>
          )}

          {/* Filters & Search */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6 mb-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
              {/* Search Bar */}
              <div className="relative w-full md:w-1/2 group">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-purple-500 transition-colors" size={20} />
                <input
                  type="text"
                  placeholder="Search by name, city, or interests..."
                  className="w-full pl-12 pr-12 py-3 rounded-xl bg-gray-50 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 focus:border-purple-500 focus:outline-none transition-all text-gray-800 dark:text-white"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />

                {/* Loading Spinner for Search */}
                {searchTerm !== debouncedSearchTerm && (
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-purple-500 border-t-transparent"></div>
                  </div>
                )}

                {/* Clear Button */}
                {searchTerm && searchTerm === debouncedSearchTerm && (
                  <button onClick={() => setSearchTerm('')} className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    <XCircle size={18} />
                  </button>
                )}

                {/* Suggestions Dropdown */}
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute top-full mt-2 w-full bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
                    {suggestions.map((suggestion, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setSearchTerm(suggestion.value);
                          setShowSuggestions(false);
                        }}
                        className="w-full px-4 py-3 text-left hover:bg-purple-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-3 border-b border-gray-100 dark:border-gray-700 last:border-0"
                      >
                        {suggestion.type === 'name' ? <User size={16} className="text-purple-500" /> : <MapPin size={16} className="text-blue-500" />}
                        <span className="text-gray-800 dark:text-white">{suggestion.value}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 w-full md:w-auto">
                <button
                  className="flex-1 md:flex-none flex items-center justify-center px-6 py-2 bg-purple-600 text-white rounded-full shadow-lg hover:bg-purple-700 transition-colors"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter size={20} className="mr-2" /> {showFilters ? 'Hide' : 'Filters'}
                </button>
                <button
                  className={`flex-1 md:flex-none flex items-center justify-center px-6 py-2 rounded-full shadow-lg transition-colors ${sortBy === 'compatibility' ? 'bg-blue-700 text-white ring-2 ring-blue-400' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                  onClick={() => setSortBy(sortBy === 'compatibility' ? 'default' : 'compatibility')}
                >
                  <Zap size={20} className="mr-2" /> {sortBy === 'compatibility' ? 'Best Match' : 'Sort: Default'}
                </button>
              </div>
            </div>

            {/* Expandable Filters */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 overflow-hidden"
                >
                  <select className="w-full px-4 py-2 rounded-full bg-white/20 dark:bg-gray-700/50 border border-purple-500/30 focus:outline-none dark:text-white" value={ageFilter} onChange={(e) => setAgeFilter(e.target.value)}>
                    <option value="">All Ages</option>
                    <option value="18-25">18-25</option>
                    <option value="26-35">26-35</option>
                    <option value="36-45">36-45</option>
                    <option value="46-99">46+</option>
                  </select>
                  <select className="w-full px-4 py-2 rounded-full bg-white/20 dark:bg-gray-700/50 border border-purple-500/30 focus:outline-none dark:text-white" value={genderFilter} onChange={(e) => setGenderFilter(e.target.value)}>
                    <option value="">All Genders</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                  <input type="text" placeholder="Filter by Interest..." className="w-full px-4 py-2 rounded-full bg-white/20 dark:bg-gray-700/50 border border-purple-500/30 focus:outline-none dark:text-white" value={interestFilter} onChange={(e) => setInterestFilter(e.target.value)} />
                  <button className="flex items-center justify-center px-6 py-2 bg-red-600 text-white rounded-full shadow-lg hover:bg-red-700 md:col-span-3" onClick={handleClearFilters}>
                    <XCircle size={20} className="mr-2" /> Clear Filters
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Profile Grid */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}
          >
            {visibleProfiles.length > 0 ? (
              visibleProfiles.map((profile, index) => (
                <motion.div
                  key={profile.id}
                  // Optimization: Only animate the first 9 items to reduce load on initial render
                  variants={index < 9 ? itemVariants : {}}
                  initial={index < 9 ? "hidden" : "visible"}
                  animate="visible"
                >
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

                      {/* Like Button */}
                      <button
                        onClick={(e) => handleSendInterest(e, profile.id)}
                        disabled={sendingInterest[profile.id]}
                        className={`absolute top-3 right-3 z-20 w-9 h-9 rounded-full shadow-md transition-all transform hover:scale-110 active:scale-95 flex items-center justify-center ${sendingInterest[profile.id] ? 'bg-gray-100 dark:bg-gray-700' : 'bg-white dark:bg-gray-700 hover:bg-pink-50 text-gray-400 hover:text-pink-500'}`}
                      >
                        {sendingInterest[profile.id] ? <LoadingSpinner size="small" color="purple" /> : <Heart size={18} className="fill-current" />}
                      </button>

                      {/* Image Area */}
                      <div className={`relative ${viewMode === 'list' ? 'w-64 h-64 flex-shrink-0' : 'w-full'}`}>
                        {/* Match Score */}
                        {profile.compatibility_score !== null && (
                          <div className="absolute top-3 right-14 z-10">
                            <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-full px-2.5 py-1 shadow-lg">
                              <span className="text-xs font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                                {profile.compatibility_score}% Match
                              </span>
                            </div>
                          </div>
                        )}

                        <div className={`relative ${viewMode === 'list' ? 'h-full' : 'h-80'} bg-gray-200 dark:bg-gray-700`}>
                          {profile.profile_image ? (
                            <img
                              src={profile.profile_image}
                              alt={profile.name}
                              loading="lazy"      // OPTIMIZATION: Lazy load
                              decoding="async"    // OPTIMIZATION: Async decode
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center"><User size={64} className="text-gray-400" /></div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>

                          {/* Info Overlay */}
                          <div className="absolute bottom-0 left-0 right-0 p-5 flex flex-col text-white">
                            <h2 className="text-xl font-bold mb-1 flex items-center gap-2">
                              {profile.name} {profile.age && <span className="font-medium text-base opacity-90">{profile.age}</span>}
                              {profile.is_verified && <svg className="w-5 h-5 text-blue-400" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" /></svg>}
                            </h2>
                            <div className="flex items-center text-sm mb-3">
                              <MapPin size={14} className="mr-1.5" />
                              <span className="truncate">{profile.current_city || 'Unknown'}, {profile.current_country}</span>
                            </div>
                            {profile.interests && (
                              <div className="flex flex-wrap gap-1.5">
                                {profile.interests.slice(0, 3).map((interest, idx) => (
                                  <span key={idx} className="bg-white/20 backdrop-blur-sm text-xs px-2.5 py-1 rounded-lg border border-white/30">{interest}</span>
                                ))}
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
              <div className="col-span-full text-center text-gray-500 py-10">
                <XCircle size={48} className="mx-auto mb-4 opacity-50" />
                No profiles found matching your criteria.
              </div>
            )}
          </motion.div>

          {/* Load More */}
          {hasNextPage && visibleProfiles.length > 0 && (
            <div className="flex justify-center mt-12">
              <button
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                className="px-8 py-3 bg-white dark:bg-gray-800 text-purple-600 font-bold rounded-full shadow-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                {isFetchingNextPage ? <LoadingSpinner size="small" /> : 'Load More Profiles'}
              </button>
            </div>
          )}

        </div>
      </main>
    </>
  );
};

export default ProfilesListPage;