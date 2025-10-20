import React, { useState, useEffect } from 'react';
import { getInterests, acceptInterest, rejectInterest, getProfile } from '../services/api';
import GlassCard from '../components/GlassCard';
import AnimatedBackground from '../components/AnimatedBackground';
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
    return <div className="flex justify-center items-center h-screen text-white text-xl">Loading interests...</div>;
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
          <GlassCard className="p-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">Interests</h1>
            
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Interests Received</h2>
              {receivedInterests.length > 0 ? (
                <div className="space-y-4">
                  {receivedInterests.map(interest => (
                    <GlassCard key={interest.id} className="p-4 flex justify-between items-center">
                      <div>
                        <Link to={`/profiles/${interest.sender.id}`} className="text-xl font-semibold text-purple-600 hover:underline">
                          {interest.sender.name}
                        </Link>
                        <p className="text-gray-600">Status: {interest.status}</p>
                      </div>
                      {interest.status === 'sent' && (
                        <div className="flex space-x-2">
                          <button onClick={() => handleAccept(interest.id)} className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600">Accept</button>
                          <button onClick={() => handleReject(interest.id)} className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600">Reject</button>
                        </div>
                      )}
                    </GlassCard>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">You have not received any interests yet.</p>
              )}
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Interests Sent</h2>
              {sentInterests.length > 0 ? (
                <div className="space-y-4">
                  {sentInterests.map(interest => (
                    <GlassCard key={interest.id} className="p-4 flex justify-between items-center">
                      <div>
                        <Link to={`/profiles/${interest.receiver.id}`} className="text-xl font-semibold text-purple-600 hover:underline">
                          {interest.receiver.name}
                        </Link>
                        <p className="text-gray-600">Status: {interest.status}</p>
                      </div>
                    </GlassCard>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">You have not sent any interests yet.</p>
              )}
            </div>
          </GlassCard>
        </div>
      </main>
    </>
  );
};

export default InterestsPage;
