import React from 'react';
import { Link } from 'react-router-dom';
import GlassCard from './GlassCard';
import { acceptInterest, rejectInterest, sendInterest } from '../services/api';

const InterestsSection = ({ interests, currentUserProfile, onUpdate }) => {

  const handleAccept = async (interestId) => {
    try {
      await acceptInterest(interestId);
      onUpdate();
    } catch (error) {
      alert('Failed to accept interest.');
    }
  };

  const handleReject = async (interestId) => {
    try {
      await rejectInterest(interestId);
      onUpdate();
    } catch (error) {
      alert('Failed to reject interest.');
    }
  };

  const handleSendAgain = async (receiverId) => {
    try {
      await sendInterest(receiverId);
      onUpdate();
      alert('Interest re-sent successfully!');
    } catch (error) {
      alert('Failed to re-send interest. You may have already sent one to this user.');
    }
  };

  const receivedInterests = interests.filter(i => i.receiver.id === currentUserProfile?.id);
  const sentInterests = interests.filter(i => i.sender.id === currentUserProfile?.id);

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">Interests Received</h2>
        {receivedInterests.length > 0 ? (
          <div className="space-y-4">
            {receivedInterests.map(interest => (
              <GlassCard key={interest.id} className="p-4 flex justify-between items-center">
                <div>
                  <Link to={`/profiles/${interest.sender.id}`} className="text-xl font-semibold text-purple-600 hover:underline">
                    {interest.sender.name}
                  </Link>
                  <p className="text-gray-600 dark:text-gray-300">Status: {interest.status}</p>
                </div>
                {interest.status === 'sent' && (
                  <div className="flex space-x-2">
                    <button onClick={() => handleAccept(interest.id)} className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700">Accept</button>
                    <button onClick={() => handleReject(interest.id)} className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700">Reject</button>
                  </div>
                )}
                {interest.status === 'accepted' && (
                  <div className="flex space-x-2">
                    <button onClick={() => handleReject(interest.id)} className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700">Remove</button>
                  </div>
                )}
              </GlassCard>
            ))}
          </div>
        ) : (
          <p className="text-gray-600 dark:text-gray-300">You have not received any interests yet.</p>
        )}
      </div>

      <div>
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">Interests Sent</h2>
        {sentInterests.length > 0 ? (
          <div className="space-y-4">
            {sentInterests.map(interest => (
              <GlassCard key={interest.id} className="p-4 flex justify-between items-center">
                <div>
                  <Link to={`/profiles/${interest.receiver.id}`} className="text-xl font-semibold text-purple-600 hover:underline">
                    {interest.receiver.name}
                  </Link>
                  <p className="text-gray-600 dark:text-gray-300">Status: {interest.status}</p>
                </div>
                {interest.status === 'rejected' && (
                  <div className="flex space-x-2">
                    <button onClick={() => handleSendAgain(interest.receiver.id)} className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700">Send Again</button>
                  </div>
                )}
              </GlassCard>
            ))}
          </div>
        ) : (
          <p className="text-gray-600 dark:text-gray-300">You have not sent any interests yet.</p>
        )}
      </div>
    </div>
  );
};

export default InterestsSection;