import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getProfiles, getProfile } from '../services/api';
import GlassCard from '../components/GlassCard';
import AnimatedBackground from '../components/AnimatedBackground';
import { motion } from 'framer-motion';
import { Search, MapPin, Filter, XCircle, Zap, User } from 'lucide-react';
import { useDebounce } from '../lib/utils'; // Import useDebounce

const ProfilesListPage = () => {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true); // For initial full page load
  const [isFetchingProfiles, setIsFetchingProfiles] = useState(false); // For subsequent fetches (filters, pagination)
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [ageFilter, setAgeFilter] = useState('');
  const [genderFilter, setGenderFilter] = useState('');
  const [interestFilter, setInterestFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('default');
  const [currentUserProfile, setCurrentUserProfile] = useState(null);

  // Pagination states
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10); // Matches backend PAGE_SIZE
  const [totalPages, setTotalPages] = useState(1);
  const [totalProfiles, setTotalProfiles] = useState(0);

  // Debounce search term
  const debouncedSearchTerm = useDebounce(searchTerm, 500); // 500ms debounce delay


  useEffect(() => {
    const fetchData = async () => {
      // Only show full page loader on initial mount
      if (page === 1 && !searchTerm && !ageFilter && !genderFilter && !interestFilter && sortBy === 'default') {
        setLoading(true);
      } else {
        setIsFetchingProfiles(true); // Show subtle loader for subsequent fetches
      }
      setError(null);
      try {
        const filters = {
          search: debouncedSearchTerm, // Use debounced search term
          age: ageFilter,
          gender: genderFilter,
          interest: interestFilter,
          sort_by: sortBy, // Pass sort_by to backend
        };
        const [profilesResponse, userProfileData] = await Promise.all([
          getProfiles(page, pageSize, filters),
          getProfile() // Fetch current user's profile
        ]);

        setProfiles(profilesResponse.results);
        setTotalProfiles(profilesResponse.count);
        setTotalPages(Math.ceil(profilesResponse.count / pageSize));
        setCurrentUserProfile(userProfileData);
      } catch (err) {
        setError('Failed to fetch data.');
        console.error(err);
      } finally {
        setLoading(false); // Always set loading to false after fetch
        setIsFetchingProfiles(false); // Always set isFetchingProfiles to false after fetch
      }
    };

    fetchData();
  }, [page, pageSize, debouncedSearchTerm, ageFilter, genderFilter, interestFilter, sortBy]); // Depend on debounced search term

  const handleClearFilters = () => {
    setSearchTerm('');
    setAgeFilter('');
    setGenderFilter('');
    setInterestFilter('');
    setPage(1); // Reset page to 1 when filters are cleared
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-purple-400 text-xl font-semibold">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          style={{ fontSize: '3rem' }}
        >
          <Zap />
        </motion.div>
        <span className="ml-4">Loading profiles...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen text-red-500 text-xl">
        Error: {error}
      </div>
    );
  }

  return (
    <>
      <AnimatedBackground />
      <main className="relative min-h-screen p-4 sm:p-6 md:p-8 font-sans">
        <div className="max-w-6xl mx-auto">
          {/* Page Header */}
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl md:text-5xl font-extrabold text-center text-gray-800 dark:text-white mb-8"
          >
            Discover Connections
          </motion.h1>

          {currentUserProfile && currentUserProfile.compatibility_score === null && (
            <div className="p-3 mt-4 mb-6 bg-purple-800/30 border border-purple-600 rounded-lg flex items-center justify-center shadow-lg">
              <User size={20} className="mr-3 text-purple-300" />
              <p className="text-sm font-medium text-white text-center">
                For seeing compatibility with other users, please <Link to="/profile" className="text-purple-200 underline hover:text-purple-100 transition-colors">complete your profile properly</Link>.
              </p>
            </div>
          )}

          {/* Filter and Search Section */}
          <GlassCard className="p-6 mb-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
              <div className="relative w-full md:w-1/2">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search by name, city, or interests..."
                  className="w-full pl-10 pr-4 py-2 rounded-full bg-white/20 dark:bg-gray-700/50 border border-purple-500/30 focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-800 dark:text-white placeholder-gray-400"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  disabled={isFetchingProfiles} // Disable input while fetching
                />
                {isFetchingProfiles && (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-purple-400"
                  >
                    <Zap size={20} />
                  </motion.div>
                )}
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center px-6 py-2 bg-purple-600 text-white rounded-full shadow-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => setShowFilters(!showFilters)}
                disabled={isFetchingProfiles} // Disable button while fetching
              >
                <Filter size={20} className="mr-2" />
                {showFilters ? 'Hide Filters' : 'Show Filters'}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => {
                  setSortBy(prevSortBy => (prevSortBy === 'compatibility' ? 'default' : 'compatibility'));
                  setPage(1); // Reset page to 1 when sorting changes
                }}
                disabled={isFetchingProfiles} // Disable button while fetching
              >
                <Zap size={20} className="mr-2" />
                {sortBy === 'compatibility' ? 'Default Order' : 'Sort by Compatibility'}
              </motion.button>
            </div>

            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4"
              >
                {/* Age Filter */}
                <select
                  className="w-full px-4 py-2 rounded-full bg-white/20 dark:bg-gray-700/50 border border-purple-500/30 focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-800 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  value={ageFilter}
                  onChange={(e) => setAgeFilter(e.target.value)}
                  disabled={isFetchingProfiles} // Disable select while fetching
                >
                  <option value="">All Ages</option>
                  <option value="18-25">18-25</option>
                  <option value="26-35">26-35</option>
                  <option value="36-45">36-45</option>
                  <option value="46-99">46+</option>
                </select>

                {/* Gender Filter */}
                <select
                  className="w-full px-4 py-2 rounded-full bg-white/20 dark:bg-gray-700/50 border border-purple-500/30 focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-800 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  value={genderFilter}
                  onChange={(e) => setGenderFilter(e.target.value)}
                  disabled={isFetchingProfiles} // Disable select while fetching
                >
                  <option value="">All Genders</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>

                {/* Interests Filter (simple text input for now) */}
                <input
                  type="text"
                  placeholder="Filter by Interest (e.g., hiking)"
                  className="w-full px-4 py-2 rounded-full bg-white/20 dark:bg-gray-700/50 border border-purple-500/30 focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-800 dark:text-white placeholder-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
                  value={interestFilter}
                  onChange={(e) => setInterestFilter(e.target.value)}
                  disabled={isFetchingProfiles} // Disable input while fetching
                />

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center justify-center px-6 py-2 bg-red-600 text-white rounded-full shadow-lg hover:bg-red-700 transition-colors md:col-span-3 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleClearFilters}
                  disabled={isFetchingProfiles} // Disable button while fetching
                >
                  <XCircle size={20} className="mr-2" />
                  Clear Filters
                </motion.button>
              </motion.div>
            )}
          </GlassCard>

          {/* Profile Grid */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {profiles.length > 0 ? (
              profiles.map((profile) => (
                <motion.div key={profile.id} variants={itemVariants}>
                  <Link to={`/profiles/${profile.id}`} className="group block h-full">
                    <GlassCard className="relative p-6 flex flex-col items-center text-center h-full hover:bg-white/20 transition-colors duration-300">
                      {profile.compatibility_score === null ? (
                        <div className="absolute top-4 right-4 text-sm text-gray-500 text-center">
                          Not applicable
                        </div>
                      ) : (
                        <div className="absolute top-4 right-4">
                          <div className="relative w-16 h-16">
                            <svg className="w-full h-full" viewBox="0 0 36 36">
                              <path
                                className="text-gray-200"
                                d="M18 2.0845
                                            a 15.9155 15.9155 0 0 1 0 31.831
                                            a 15.9155 15.9155 0 0 1 0 -31.831"
                                fill="none"
                                strokeWidth="3"
                              />
                              <path
                                className="text-purple-600"
                                strokeDasharray={`${profile.compatibility_score || 0}, 100`}
                                d="M18 2.0845
                                            a 15.9155 15.9155 0 0 1 0 31.831
                                            a 15.9155 15.9155 0 0 1 0 -31.831"
                                fill="none"
                                strokeWidth="3"
                                strokeLinecap="round"
                              />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-lg font-bold text-purple-600">{profile.compatibility_score || 0}%</span>
                            </div>
                          </div>
                        </div>
                      )}
                      {profile.profile_image ? (
                        <img
                          src={profile.profile_image}
                          alt={profile.name}
                          className="w-28 h-28 rounded-full object-cover mb-4 border-2 border-purple-400 shadow-md"
                        />
                      ) : (
                        <div className="w-28 h-28 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center mb-4 border-2 border-purple-400 shadow-md">
                          <User size={48} className="text-gray-600 dark:text-gray-400" />
                        </div>
                      )}
                      <h2 className="text-2xl font-bold text-gray-800 dark:text-white group-hover:text-purple-600 transition-colors">
                        {profile.name}
                        {profile.age && <span className="font-normal text-gray-600 dark:text-gray-300">, {profile.age}</span>}
                      </h2>
                      <p className="text-gray-600 dark:text-gray-300 text-sm mb-2 flex items-center">
                        <MapPin size={16} className="mr-1 text-purple-400" />
                        {profile.current_city || 'Unknown City'}, {profile.current_country || 'Unknown Country'}
                      </p>
                      {profile.bio && (
                        <p className="text-gray-500 dark:text-gray-400 text-xs italic mb-3 line-clamp-3">
                          "{profile.bio}"
                        </p>
                      )}
                      {profile.interests && profile.interests.length > 0 && (
                        <div className="flex flex-wrap justify-center gap-2 mt-auto pt-4 border-t border-purple-500/20 w-full">
                          {profile.interests.slice(0, 3).map((interest, idx) => (
                            <span
                              key={idx}
                              className="bg-purple-600/20 text-purple-400 text-xs px-3 py-1 rounded-full"
                            >
                              {interest}
                            </span>
                          ))}
                        </div>
                      )}

                    </GlassCard>
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

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center space-x-4 mt-8">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setPage(prev => Math.max(1, prev - 1))}
                disabled={page === 1}
                className="px-4 py-2 bg-purple-600 text-white rounded-full shadow-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </motion.button>
              <span className="text-gray-800 dark:text-white">
                Page {page} of {totalPages}
              </span>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 bg-purple-600 text-white rounded-full shadow-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </motion.button>
            </div>
          )}
        </div>
      </main>
    </>
  );
};

export default ProfilesListPage;
