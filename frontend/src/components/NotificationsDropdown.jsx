// frontend/src/components/NotificationsDropdown.jsx
import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Bell, Check, ThumbsUp, Mail, Bookmark, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getUnreadNotificationCount
} from '../services/api';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';

const timeAgo = (date) => {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + "y";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + "mo";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + "d";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + "h";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + "m";
  return "Just now";
};

const NotificationIcon = ({ verb }) => {
  const iconMap = {
    'liked': <ThumbsUp size={14} className="text-white fill-current" />,
    'favorited': <Bookmark size={14} className="text-white fill-current" />,
    'viewed your profile': <User size={14} className="text-white" />,
  };

  const bgMap = {
    'liked': 'bg-blue-500',
    'favorited': 'bg-yellow-500',
    'viewed your profile': 'bg-purple-500',
  }

  return (
    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${bgMap[verb] || 'bg-gray-500'} ring-2 ring-white dark:ring-black`}>
      {iconMap[verb] || <Bell size={14} className="text-white" />}
    </div>
  );
};

const NotificationsDropdown = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });

  const buttonRef = useRef(null);
  const dropdownRef = useRef(null);

  const fetchNotificationData = async () => {
    try {
      const [notifs, count] = await Promise.all([
        getNotifications(),
        getUnreadNotificationCount()
      ]);
      setNotifications(notifs);
      setUnreadCount(count.unread_count);
    } catch (error) {
      console.error("Failed to fetch notification data:", error);
    }
  };

  useEffect(() => {
    if (!user) return;

    fetchNotificationData();

    // Subscribe to real-time notifications
    const channel = supabase
      .channel('api_notification_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'api_notification',
          filter: `recipient_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Real-time notification received:', payload);
          fetchNotificationData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  useEffect(() => {
    function handleClickOutside(e) {
      const target = e.target;
      const clickedInsideButton = buttonRef.current && buttonRef.current.contains(target);
      const clickedInsideDropdown = dropdownRef.current && dropdownRef.current.contains(target);

      if (clickedInsideButton || clickedInsideDropdown) {
        return;
      }
      setIsOpen(false);
    }
    const handleEsc = (e) => { if (e.key === 'Escape') setIsOpen(false); };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEsc);
    };
  }, []);

  const handleMarkAsRead = async (id, e) => {
    e.stopPropagation();
    e.preventDefault();
    try {
      await markNotificationAsRead(id);
      await fetchNotificationData();
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      await fetchNotificationData();
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
    }
  };

  const getInitials = (name) => {
    if (!name) return '';
    const names = name.split(' ');
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  };

  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      // Align right edge of dropdown with right edge of button, but shift left slightly
      // Fixed width of dropdown is w-80 (20rem/320px) or w-96 (24rem/384px)
      setCoords({
        top: rect.bottom + 14, // slightly lower
        left: rect.right - 384 // align right, width 384px (w-96)
      });
    }
  }, [isOpen]);

  // Create portal root if not present
  useEffect(() => {
    if (!document.getElementById('notifications-root')) {
      const el = document.createElement('div');
      el.id = 'notifications-root';
      document.body.appendChild(el);
    }
  }, []);

  const dropdown = (
    <div
      ref={dropdownRef}
      role="dialog"
      aria-label="Notifications"
      className="fixed z-[9999] w-96 bg-white dark:bg-black rounded-lg shadow-2xl border border-black/5 dark:border-white/10 overflow-hidden animate-fade-in-scale"
      style={{
        top: coords.top,
        left: coords.left,
      }}
    >
      <div className="p-4 border-b border-black/5 dark:border-white/5 flex items-center justify-between">
        <h4 className="text-sm font-semibold text-black dark:text-white">Notifications</h4>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="text-xs font-medium text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white transition-colors flex items-center"
          >
            <Check size={14} className="mr-1" /> Mark all read
          </button>
        )}
      </div>

      <div className="max-h-[70vh] overflow-y-auto custom-scrollbar">
        {notifications.length === 0 ? (
          <div className="p-8 text-center">
            <Bell size={24} className="mx-auto text-black/20 dark:text-white/20 mb-2" />
            <p className="text-sm text-black/40 dark:text-white/40">No notifications yet.</p>
          </div>
        ) : (
          notifications.map(n => (
            <Link
              to={n.actor_profile_url || '#'}
              key={n.id}
              className={`block px-4 py-3 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors relative group ${n.unread ? 'bg-black/[0.02] dark:bg-white/[0.02]' : ''}`}
            >
              <div className="flex items-start space-x-3">
                <div className="relative flex-shrink-0">
                  <div className="w-10 h-10 rounded-full overflow-hidden ring-1 ring-black/5 dark:ring-white/10">
                    {n.actor_profile_image ? (
                      <img src={n.actor_profile_image} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-black dark:bg-white flex items-center justify-center text-white dark:text-black text-xs font-bold">
                        {getInitials(n.actor_name)}
                      </div>
                    )}
                  </div>
                  <div className="absolute -bottom-1 -right-1">
                    <NotificationIcon verb={n.verb} />
                  </div>
                </div>

                <div className="flex-1 min-w-0 pr-6">
                  <p className="text-sm text-black dark:text-white">
                    <span className="font-semibold">{n.actor_name}</span>{' '}
                    <span className="text-black/70 dark:text-white/70">{n.verb}</span>
                  </p>
                  <p className="text-xs text-black/40 dark:text-white/40 mt-0.5">{timeAgo(n.created_at)}</p>
                </div>

                {n.unread && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col items-center">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mb-2"></div>
                    <button
                      onClick={(e) => handleMarkAsRead(n.id, e)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-black/40 hover:text-black dark:text-white/40 dark:hover:text-white transition-all"
                      title="Mark as read"
                    >
                      <Check size={14} />
                    </button>
                  </div>
                )}
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );

  return (
    <>
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(prev => !prev)}
        className={`relative p-2 rounded-lg transition-all focus:outline-none ${isOpen
          ? 'bg-black/5 dark:bg-white/10 text-black dark:text-white'
          : 'text-black/50 hover:text-black dark:text-white/50 dark:hover:text-white hover:bg-black/[0.02] dark:hover:bg-white/[0.02]'
          }`}
        aria-label="Notifications"
      >
        <Bell size={16} /> {/* Matched size with other icons (16px) specifically requested 20->16 */}
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-black"></span>
        )}
      </button>

      {isOpen && createPortal(dropdown, document.getElementById('notifications-root'))}
    </>
  );
};

export default NotificationsDropdown;
