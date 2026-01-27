import React, { useState, useEffect } from 'react';
import { getInterests, acceptInterest, rejectInterest, getProfile } from '../services/api';
import GlassCard from '../components/GlassCard';
import AnimatedBackground from '../components/AnimatedBackground';
import LoadingSpinner from '../components/LoadingSpinner';
import { Link } from 'react-router-dom';

const InterestsPage = () => {
  const [interests, setInterests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUserProfile, setCurrentUserProfile] = useState(null);

  useEffect(() => {
    const fetchInterests = async () => {
      try {
        const interestsData = await getInterests();
        const profileData = await getProfile();
        setInterests(interestsData);
        setCurrentUserProfile(profileData);
      } catch (err) {
        setError('Failed to fetch interests.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchInterests();
  }, []);

  const handleAccept = async (interestId) => {
    try {
      await acceptInterest(interestId);
      setInterests(interests.map(i => i.id === interestId ? { ...i, status: 'accepted' } : i));
    } catch (error) {
      alert('Failed to accept interest.');
    }
  };

  const handleReject = async (interestId) => {
    try {
      await rejectInterest(interestId);
      setInterests(interests.map(i => i.id === interestId ? { ...i, status: 'rejected' } : i));
    } catch (error) {
      alert('Failed to reject interest.');
    }
  };

  if (loading) {
    return <LoadingSpinner size="fullscreen" message="Loading your interests..." />;
  }

  if (error) {
    return <div className="flex justify-center items-center h-screen text-red-500 text-xl">Error: {error}</div>;
  }

  const receivedInterests = interests.filter(i => i.receiver.id === currentUserProfile?.id);
  const sentInterests = interests.filter(i => i.sender.id === currentUserProfile?.id);

  return (
    <>
      <AnimatedBackground />
      <main className="relative min-h-screen p-4 sm:p-6 md:p-8 font-sans">
        <div className="max-w-4xl mx-auto">
          <GlassCard className="p-8">
            <h1 className="text-4xl font-black text-gray-800 mb-8 border-b pb-4">Interest Ledger</h1>

            <div className="mb-12">
              <h2 className="text-2xl font-black text-blue-600 mb-6 flex items-center gap-2">
                <span className="w-2 h-8 bg-blue-600 rounded-full"></span>
                Interests Received
              </h2>
              {receivedInterests.length > 0 ? (
                <div className="space-y-4">
                  {receivedInterests.map(interest => (
                    <GlassCard key={interest.id} className="p-6 flex flex-col sm:flex-row justify-between sm:items-center gap-4 group hover:border-blue-500/30 transition-all">
                      <div>
                        <Link to={`/profiles/${interest.sender.id}`} className="text-xl font-black text-gray-900 hover:text-blue-600 transition-colors block mb-1">
                          {interest.sender.name}
                        </Link>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${interest.status === 'accepted' ? 'text-emerald-500 bg-emerald-50 border-emerald-100' :
                              interest.status === 'rejected' ? 'text-rose-500 bg-rose-50 border-rose-100' :
                                'text-blue-500 bg-blue-50 border-blue-100'
                            }`}>
                            {interest.status}
                          </span>
                          {interest.status === 'accepted' && (
                            <span className="text-xs font-bold text-gray-500 flex items-center gap-1">
                              • Shared: <span className="text-blue-600 uppercase tracking-tighter">{interest.share_type?.replace('_', ' ')}</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {interest.status === 'sent' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleAccept(interest.id)}
                            className="flex-1 sm:flex-none py-2 px-6 bg-emerald-500 text-white font-black rounded-xl hover:bg-emerald-600 transition-all shadow-md shadow-emerald-500/20"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => handleReject(interest.id)}
                            className="flex-1 sm:flex-none py-2 px-6 bg-rose-100 text-rose-600 font-black rounded-xl hover:bg-rose-200 transition-all"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </GlassCard>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-10 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                  No interests received yet. They will appear here when others want to connect.
                </p>
              )}
            </div>

            <div>
              <h2 className="text-2xl font-black text-purple-600 mb-6 flex items-center gap-2">
                <span className="w-2 h-8 bg-purple-600 rounded-full"></span>
                Interests Sent
              </h2>
              {sentInterests.length > 0 ? (
                <div className="space-y-4">
                  {sentInterests.map(interest => (
                    <GlassCard key={interest.id} className="p-6 flex justify-between items-center group hover:border-purple-500/30 transition-all">
                      <div>
                        <Link to={`/profiles/${interest.receiver.id}`} className="text-xl font-black text-gray-900 hover:text-purple-600 transition-colors block mb-1">
                          {interest.receiver.name}
                        </Link>
                        <div className="flex items-center gap-2">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${interest.status === 'accepted' ? 'text-emerald-500 bg-emerald-50 border-emerald-100' :
                              interest.status === 'rejected' ? 'text-rose-500 bg-rose-50 border-rose-100' :
                                'text-amber-500 bg-amber-50 border-amber-100'
                            }`}>
                            {interest.status}
                          </span>
                          {interest.status === 'accepted' && (
                            <span className="text-xs font-bold text-gray-500">
                              • They shared: <span className="text-purple-600 uppercase tracking-tighter">{interest.share_type?.replace('_', ' ')}</span>
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-xs text-gray-400 font-bold uppercase tracking-widest">
                        {new Date(interest.created_at).toLocaleDateString()}
                      </div>
                    </GlassCard>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-10 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                  You haven't sent any interests. Start exploring profiles to connect!
                </p>
              )}
            </div>
          </GlassCard>
        </div>
      </main>
    </>
  );
};

export default InterestsPage;
