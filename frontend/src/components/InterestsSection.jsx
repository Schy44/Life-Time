// src/components/InterestsSection.jsx
import React, { useMemo, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckCircle,
  Clock,
  XCircle,
  Check,
  X,
  RotateCcw,
  User as UserIcon,
} from 'lucide-react';
import GlassCard from './GlassCard';
import apiClient from '../lib/api';

const PAGE_SIZE = 6;

/* ----------------------------- Helpers ---------------------------------- */

const getUserSubtitle = (user = {}) => {
  if (!user || typeof user !== 'object') return 'No public details yet';

  const candidates = [];

  ['location', 'city', 'town', 'state', 'region', 'province', 'profession', 'occupation', 'title', 'about'].forEach(k => {
    if (user[k]) candidates.push(user[k]);
  });

  if (user.profile && typeof user.profile === 'object') {
    ['location', 'city', 'profession', 'occupation', 'about'].forEach(k => {
      if (user.profile[k]) candidates.push(user.profile[k]);
    });
    if (user.profile.age) candidates.push(`${user.profile.age} yrs`);
  }

  if (user.age) candidates.push(`${user.age} yrs`);
  if (user.education) candidates.push(user.education);
  if (user.country) candidates.push(user.country);

  for (let val of candidates) {
    if (!val) continue;
    if (typeof val === 'object') {
      if (val.name) return String(val.name).trim();
      continue;
    }
    const s = String(val).trim();
    if (s.length > 0) return s;
  }

  return 'No public details yet';
};

const StatusPill = ({ status = 'sent', isSender = false }) => {
  let key = status;
  if (status === 'sent') key = isSender ? 'pending' : 'requested';

  const map = {
    accepted: { label: 'Connected', color: 'bg-green-500', Icon: CheckCircle },
    requested: { label: 'Requested', color: 'bg-blue-500', Icon: Clock },
    pending: { label: 'Pending', color: 'bg-yellow-500', Icon: Clock },
    rejected: { label: 'Declined', color: 'bg-red-500', Icon: XCircle },
  };

  const { label, color, Icon } = map[key] || map.requested;

  return (
    <span
      className={`inline-flex items-center gap-2 text-xs font-semibold px-2 py-1 rounded-full text-white ${color}`}
      role="status"
      aria-label={`Status: ${label}`}
      title={label}
    >
      <Icon size={14} />
      <span>{label}</span>
    </span>
  );
};

/* ---------- Avatar: prefers profile image fields, fallback to initials ------- */

/**
 * Avatar props:
 * - user: object containing name and possible image fields
 * - size: pixel size (number), default 56
 */
const Avatar = ({ user = {}, size = 56 }) => {
  // try common image fields
  const src =
    user?.avatar ||
    user?.profile_image ||
    user?.actor_profile_image ||
    user?.image ||
    (user.profile && (user.profile.avatar || user.profile.image)) ||
    null;

  const initials = (user?.name || '')
    .split(' ')
    .filter(Boolean)
    .map(s => s[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const isOnline = !!(user?.is_online || user?.online || (user.profile && user.profile.is_online));

  if (src) {
    return (
      <div style={{ position: 'relative', width: size, height: size }}>
        <img
          src={src}
          alt={user.name || 'avatar'}
          style={{
            width: size,
            height: size,
            objectFit: 'cover',
            borderRadius: '9999px',
            display: 'block',
            border: '3px solid rgba(255,255,255,0.8)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
          }}
        />
        {isOnline && (
          <span
            style={{
              position: 'absolute',
              bottom: -2,
              right: -2,
              width: Math.max(10, Math.round(size * 0.22)),
              height: Math.max(10, Math.round(size * 0.22)),
              background: '#10b981',
              borderRadius: '9999px',
              border: '2px solid white',
              boxShadow: '0 2px 6px rgba(16,185,129,0.18)',
            }}
            aria-hidden
          />
        )}
      </div>
    );
  }

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '9999px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg,#a78bfa,#f472b6)',
        color: 'white',
        fontWeight: 600,
        fontSize: Math.max(12, Math.round(size * 0.33)),
        boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
      }}
      aria-hidden
    >
      {initials || <UserIcon size={Math.max(16, Math.round(size * 0.4))} />}
    </div>
  );
};

/* ----------------------------- Component -------------------------------- */

const InterestsSection = ({ interests = [], currentUserProfile, onUpdate = () => { } }) => {
  const normalized = Array.isArray(interests) ? interests : Array.isArray(Object.values(interests || {})) ? Object.values(interests || {}) : [];

  const [localInterests, setLocalInterests] = useState(normalized);
  const [activeTab, setActiveTab] = useState('connections');
  const [isProcessing, setIsProcessing] = useState(false);
  const [page, setPage] = useState(1);

  useEffect(() => {
    setLocalInterests(Array.isArray(interests) ? interests : Object.values(interests || {}));
  }, [interests]);

  const grouped = useMemo(() => {
    const connections = [];
    const received = [];
    const sent = [];

    (localInterests || []).forEach((i) => {
      const senderId = i.sender?.id;
      const receiverId = i.receiver?.id;
      const isReceived = receiverId === currentUserProfile?.id;
      const isSent = senderId === currentUserProfile?.id;

      if (i.status === 'accepted') {
        connections.push(i);
      } else if (i.status === 'sent') {
        if (isReceived) {
          received.push(i);
        } else if (isSent) {
          sent.push(i);
        }
      } else if (i.status === 'rejected') {
        if (isSent) {
          sent.push(i);
        }
      }
    });

    return { connections, received, sent };
  }, [localInterests, currentUserProfile]);

  const paginate = (list) => {
    const end = PAGE_SIZE * page;
    return list.slice(0, end);
  };

  const activeList = activeTab === 'connections' ? grouped.connections : activeTab === 'received' ? grouped.received : grouped.sent;
  const visibleList = paginate(activeList);

  const handleAccept = async (interestId) => {
    setIsProcessing(true);
    setLocalInterests(prev => prev.map(it => (it.id === interestId ? { ...it, status: 'accepted' } : it)));
    try {
      await apiClient.post(`/interests/${interestId}/accept/`);
      await onUpdate();
    } catch (err) {
      setLocalInterests(prev => prev.map(it => (it.id === interestId ? { ...it, status: 'sent' } : it)));
      console.error('Accept failed', err);
      alert('Failed to accept interest. Try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async (interestId) => {
    setIsProcessing(true);
    setLocalInterests(prev => prev.map(it => (it.id === interestId ? { ...it, status: 'rejected' } : it)));
    try {
      await apiClient.post(`/interests/${interestId}/reject/`);
      await onUpdate();
    } catch (err) {
      setLocalInterests(prev => prev.map(it => (it.id === interestId ? { ...it, status: 'sent' } : it)));
      console.error('Reject failed', err);
      alert('Failed to reject interest. Try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSendAgain = async (receiverId) => {
    if (!currentUserProfile) return alert('Please sign in to send interests.');
    setIsProcessing(true);
    try {
      const res = await apiClient.post('/interests/', { receiver: receiverId });
      if (res?.data) {
        setLocalInterests(prev => [res.data, ...prev]);
      }
      await onUpdate();
      const creditsInfo = res.data.credits_deducted ? ` (${res.data.credits_deducted} credit used, ${res.data.new_balance} remaining)` : '';
      alert(`Interest re-sent successfully!${creditsInfo}`);
    } catch (err) {
      console.error('Send again failed', err);
      // Handle insufficient credits error (HTTP 402)
      if (err.response?.status === 402) {
        const errorData = err.response.data;
        const message = errorData.message || 'Insufficient credits to send interest request.';
        if (window.confirm(`${message}\n\nWould you like to buy more credits?`)) {
          window.location.href = '/upgrade';
        }
      } else {
        alert(err.response?.data?.error || 'Failed to re-send interest. Try again.');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancelRequest = async (interestId) => {
    setIsProcessing(true);
    // Optimistically remove the interest from the local state
    setLocalInterests(prev => prev.filter(it => it.id !== interestId));
    try {
      await apiClient.delete(`/interests/${interestId}/`);
      await onUpdate(); // Re-fetch to ensure state is fully synchronized
    } catch (err) {
      console.error('Cancel request failed', err);
      alert('Failed to cancel interest. Try again.');
      // On error, re-fetch to restore the original state
      await onUpdate();
    } finally {
      setIsProcessing(false);
    }
  };

  const tabs = [
    { key: 'connections', label: 'Connections', count: grouped.connections.length },
    { key: 'received', label: 'Received', count: grouped.received.length },
    { key: 'sent', label: 'Sent', count: grouped.sent.length },
  ];

  return (
    <section className="max-w-4xl mx-auto space-y-6 px-4 sm:px-0">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">My Interests</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage incoming and outgoing interests — accept matches, remove connections, and re-send declined interests.
          </p>
        </div>

        <div className="flex gap-2 items-center">
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => { setActiveTab(t.key); setPage(1); }}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${activeTab === t.key
                ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900 shadow-sm'
                : 'bg-white/60 dark:bg-gray-800/60 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              aria-pressed={activeTab === t.key}
            >
              {t.label} <span className="ml-1.5 text-xs opacity-80">({t.count})</span>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {visibleList.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              {activeTab === 'connections' ? 'No connections yet.' : activeTab === 'received' ? 'No incoming interests.' : 'You have not sent any interests yet.'}
            </p>
            <div className="mt-4">
              <Link to="/discover" className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-full shadow">
                Browse profiles
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid gap-3">
            {visibleList.map(interest => {
              const isSender = interest.sender?.id === currentUserProfile?.id;
              const otherUser = isSender ? interest.receiver : interest.sender;
              const status = interest.status;

              return (
                <GlassCard key={interest.id} className="p-4 hover:shadow-xl transition-shadow duration-200">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-4 min-w-0 flex-1">
                      {/* Use Avatar directly with pixel size */}
                      <Avatar user={otherUser} size={56} />

                      <div className="min-w-0 ml-3">
                        <Link to={`/profiles/${otherUser?.id}`} className="block text-lg font-semibold text-gray-900 dark:text-white truncate hover:text-purple-600 dark:hover:text-purple-400">
                          {otherUser?.name || 'Unknown'}
                        </Link>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">
                          {getUserSubtitle(otherUser)}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-3">
                      <div>
                        <StatusPill status={status} isSender={isSender} />
                      </div>

                      <div className="flex items-center gap-2">
                        {activeTab === 'received' && status === 'sent' && (
                          <>
                            <button
                              onClick={() => handleAccept(interest.id)}
                              disabled={isProcessing}
                              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-600 text-white text-sm hover:bg-green-700 transition"
                              aria-label="Accept interest"
                            >
                              <Check size={14} /> Accept
                            </button>

                            <button
                              onClick={() => handleReject(interest.id)}
                              disabled={isProcessing}
                              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white dark:bg-gray-700 border dark:border-gray-600 text-sm hover:bg-gray-50 dark:hover:bg-gray-600 transition text-gray-700 dark:text-gray-200"
                              aria-label="Decline interest"
                            >
                              <X size={14} /> Decline
                            </button>
                          </>
                        )}

                        {activeTab === 'connections' && (
                          <button
                            onClick={() => {
                              if (window.confirm('Remove this connection?')) {
                                handleReject(interest.id);
                              }
                            }}
                            disabled={isProcessing}
                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white dark:bg-gray-700 border dark:border-gray-600 text-sm hover:bg-gray-50 dark:hover:bg-gray-600 transition text-gray-700 dark:text-gray-200"
                            aria-label="Remove connection"
                          >
                            Remove
                          </button>
                        )}

                        {activeTab === 'sent' && status === 'rejected' && (
                          <button
                            onClick={() => handleSendAgain(interest.receiver?.id)}
                            disabled={isProcessing}
                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-600 text-white text-sm hover:bg-purple-700 transition"
                            aria-label="Send interest again"
                          >
                            <RotateCcw size={14} /> Send Again
                          </button>
                        )}
                        {activeTab === 'sent' && status === 'sent' && (
                          <button
                            onClick={() => {
                              if (window.confirm('Are you sure you want to cancel this interest request?')) {
                                handleCancelRequest(interest.id);
                              }
                            }}
                            disabled={isProcessing}
                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500 text-white text-sm hover:bg-red-600 transition"
                            aria-label="Cancel interest request"
                          >
                            <X size={14} /> Cancel Request
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </GlassCard>
              );
            })}
          </div>
        )}
      </div>

      {PAGE_SIZE * page < activeList.length && (
        <div className="text-center mt-4">
          <button
            onClick={() => setPage(p => p + 1)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-full shadow hover:shadow-md text-gray-700 dark:text-gray-200"
          >
            Load more
          </button>
        </div>
      )}

      {isProcessing && (
        <div className="fixed bottom-6 right-6 bg-white/90 dark:bg-gray-800/90 px-4 py-2 rounded-full shadow">
          <span className="text-sm text-gray-700 dark:text-gray-200">Processing…</span>
        </div>
      )}
    </section>
  );
};

export default InterestsSection;
