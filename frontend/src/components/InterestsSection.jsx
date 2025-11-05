import React from 'react';
import { Link } from 'react-router-dom';
import GlassCard from './GlassCard';
import { supabase } from '../lib/supabaseClient'; // Import supabase

const InterestsSection = ({ interests, currentUserProfile, onUpdate }) => {

  const handleAccept = async (interestId) => {
    try {
      const { error } = await supabase
        .from('interests')
        .update({ status: 'accepted' })
        .eq('id', interestId);
      if (error) throw error;
      onUpdate();
    } catch (error) {
      alert(`Failed to accept interest: ${error.message}`);
    }
  };

  const handleReject = async (interestId) => {
    try {
      const { error } = await supabase
        .from('interests')
        .update({ status: 'rejected' })
        .eq('id', interestId);
      if (error) throw error;
      onUpdate();
    } catch (error) {
      alert(`Failed to reject interest: ${error.message}`);
    }
  };

  const handleSendAgain = async (receiverId) => {
    if (!currentUserProfile) return;
    try {
      const { error } = await supabase
        .from('interests')
        .insert({ sender_id: currentUserProfile.id, receiver_id: receiverId, status: 'sent' });
      if (error) throw error;
      onUpdate();
      alert('Interest re-sent successfully!');
    } catch (error) {
      alert(`Failed to re-send interest: ${error.message}`);
    }
  };

  // Assuming interests prop now contains Supabase interest objects directly
  // and that sender/receiver profile data is either pre-fetched or can be fetched here if needed.
  // For simplicity, I'll assume the 'interests' prop already contains the necessary sender/receiver profile data
  // or that we can display just the ID for now.
  // If the 'interests' prop only contains sender_id and receiver_id, we'd need to fetch profile names.
  // For now, I'll assume the 'interests' prop has nested sender/receiver objects with 'id' and 'name'.
  // If not, this part will need further refinement.

  const receivedInterests = interests.filter(i => i.receiver_id === currentUserProfile?.id);
  const sentInterests = interests.filter(i => i.sender_id === currentUserProfile?.id);

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">Interests Received</h2>
        {receivedInterests.length > 0 ? (
          <div className="space-y-4">
            {receivedInterests.map(interest => (
              <GlassCard key={interest.id} className="p-4 flex justify-between items-center">
                <div>
                  {/* Assuming interest.sender.id and interest.sender.name are available */}
                  <Link to={`/profiles/${interest.sender_id}`} className="text-xl font-semibold text-purple-600 hover:underline">
                    {interest.sender_id} {/* Placeholder, ideally display sender's name */}
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
                  {/* Assuming interest.receiver.id and interest.receiver.name are available */}
                  <Link to={`/profiles/${interest.receiver_id}`} className="text-xl font-semibold text-purple-600 hover:underline">
                    {interest.receiver_id} {/* Placeholder, ideally display receiver's name */}
                  </Link>
                  <p className="text-gray-600 dark:text-gray-300">Status: {interest.status}</p>
                </div>
                {interest.status === 'rejected' && (
                  <div className="flex space-x-2">
                    <button onClick={() => handleSendAgain(interest.receiver_id)} className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700">Send Again</button>
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