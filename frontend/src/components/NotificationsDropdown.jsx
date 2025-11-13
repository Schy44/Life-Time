// frontend/src/components/NotificationsDropdown.jsx
import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Bell, Check, EyeOff, ThumbsUp, Mail, Bookmark, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getUnreadNotificationCount
} from '../services/api';
import './NotificationsDropdown.css';

const timeAgo = (date) => {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + " years ago";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " months ago";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " days ago";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " hours ago";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " minutes ago";
  return Math.floor(seconds) + " seconds ago";
};

const NotificationIcon = ({ verb }) => {
  const iconMap = {
    'liked': <ThumbsUp size={20} className="text-blue-500" />,
    'messaged': <Mail size={20} className="text-green-500" />,
    'favorited': <Bookmark size={20} className="text-yellow-500" />,
    'viewed your profile': <User size={20} className="text-gray-500" />,
  };
  return iconMap[verb] || <Bell size={20} className="text-gray-500" />;
};

const NotificationsDropdown = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });

  const buttonRef = useRef(null);
  const dropdownRef = useRef(null); // <<--- added for portal dropdown

  const fetchNotificationData = async () => {
    try {
      const [notifs, count] = await Promise.all([
        getNotifications(),
        getUnreadNotificationCount()
      ]);
      setNotifications(Array.isArray(notifs) ? notifs : []);
      setUnreadCount(count.unread_count);
    } catch (error) {
      console.error("Failed to fetch notification data:", error);
    }
  };

  useEffect(() => {
    fetchNotificationData();
    const intervalId = setInterval(fetchNotificationData, 30000);
    return () => clearInterval(intervalId);
  }, []);

  // Outside click handler — now checks both the bell AND the portal dropdown
  useEffect(() => {
    function handleClickOutside(e) {
      const target = e.target;
      const clickedInsideButton = buttonRef.current && buttonRef.current.contains(target);
      const clickedInsideDropdown = dropdownRef.current && dropdownRef.current.contains(target);

      // if click is inside either bell OR dropdown, do nothing
      if (clickedInsideButton || clickedInsideDropdown) {
        return;
      }

      // otherwise close
      setIsOpen(false);
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await markNotificationAsRead(id);
      // Either refetch or optimistically update
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
      setCoords({
        top: rect.bottom + 8,
        left: rect.right - 384,
        width: 384
      });
    }
  }, [isOpen]);

  // create portal root if not present
  useEffect(() => {
    if (!document.getElementById('notifications-root')) {
      const el = document.createElement('div');
      el.id = 'notifications-root';
      document.body.appendChild(el);
    }
  }, []);

  const dropdown = (
    <div
      ref={dropdownRef} /* <-- attach ref so outside-click checks work */
      className="dropdown-menu-portal"
      style={{
        position: 'fixed',
        top: coords.top,
        left: coords.left,
        width: coords.width,
        zIndex: 9999999
      }}
    >
      <div className="dropdown-header">
        <h4 className="dropdown-title">Notifications</h4>
        {unreadCount > 0 && (
          <button onClick={handleMarkAllAsRead} className="mark-all-read">
            <EyeOff size={16} className="mr-1" /> Mark all as read
          </button>
        )}
      </div>

      <div className="notifications-list">
        {notifications.length === 0 ? (
          <p className="no-notifications">No notifications yet.</p>
        ) : (
          notifications.map(n => (
            <div key={n.id} className={`notification-item ${n.unread ? 'unread' : ''}`}>
              <Link to={n.actor_profile_url || '#'} className="notification-link">
                <div className="notification-avatar">
                  {n.actor_profile_image ? (
                    <img src={n.actor_profile_image} alt={`${n.actor_name}'s avatar`} />
                  ) : (
                    <span>{getInitials(n.actor_name)}</span>
                  )}
                  <div className="notification-type-badge">
                    <NotificationIcon verb={n.verb} />
                  </div>
                </div>

                <div className="notification-content">
                  <p className="notification-text"><strong>{n.actor_name}</strong> {n.verb}</p>
                  <p className="notification-time">{timeAgo(n.created_at)}</p>
                </div>
              </Link>

              {n.unread && (
                <button onClick={() => handleMarkAsRead(n.id)} className="mark-as-read">
                  <Check size={14} className="mr-1" /> Mark as read
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );

  return (
    <div className="notifications-dropdown">
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(prev => !prev)}
        className={`notifications-bell ${isOpen ? 'open' : ''}`}
      >
        <Bell className="bell-icon" size={24} />
        {unreadCount > 0 && <span className="unread-count">{unreadCount}</span>}
      </button>

      {isOpen && createPortal(dropdown, document.getElementById('notifications-root'))}
    </div>
  );
};

export default NotificationsDropdown;
