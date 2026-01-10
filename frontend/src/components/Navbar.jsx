import React, { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useQuery } from '@tanstack/react-query';
import { getProfile } from '../services/api';
import {
  Sun, Moon, X, Menu, Zap, User,
  LogOut, Crown, ArrowUpRight, Heart
} from 'lucide-react';
import NotificationsDropdown from './NotificationsDropdown';
import '../styles/Navbar.css';

const UserDropdown = ({ user, logout, closeMenu }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    const handleEsc = (e) => { if (e.key === 'Escape') setIsOpen(false); };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEsc);
    };
  }, []);

  const handleLogout = async () => {
    await logout();
    setIsOpen(false);
    navigate('/login');
    if (closeMenu) closeMenu();
  };

  const menuItems = [
    { icon: User, label: 'Profile', path: '/profile' },
  ];

  // Logic to determine display name and image
  const displayImage = user?.profile_image || user?.user_metadata?.avatar_url;
  const displayName = user?.name || user?.first_name || user?.user_metadata?.full_name || user?.username || 'User';
  const displayCredits = user?.credits ?? 0;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        className="group flex items-center space-x-2 focus:outline-none transition-all"
      >
        <div className="w-8 h-8 rounded-full overflow-hidden ring-1 ring-black/5 dark:ring-white/10 group-hover:ring-black/10 dark:group-hover:ring-white/20 transition-all">
          {displayImage ? (
            <img
              src={displayImage}
              alt={displayName}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-black dark:bg-white">
              <User size={16} className="text-white dark:text-black" />
            </div>
          )}
        </div>
      </button>

      {isOpen && (
        <div
          role="menu"
          aria-label="User menu"
          className="absolute right-0 mt-2 w-64 bg-white dark:bg-black rounded-lg shadow-2xl border border-black/5 dark:border-white/10 overflow-hidden z-50 animate-fade-in-scale"
        >
          {/* Header */}
          <div className="p-4 border-b border-black/5 dark:border-white/5">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 rounded-full overflow-hidden ring-1 ring-black/5 dark:ring-white/10">
                {displayImage ? (
                  <img src={displayImage} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-black dark:bg-white flex items-center justify-center">
                    <User size={20} className="text-white dark:text-black" />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <Link
                  to="/profile"
                  onClick={() => setIsOpen(false)}
                  className="text-sm font-medium text-black dark:text-white truncate hover:text-black/70 dark:hover:text-white/70 transition-colors block"
                >
                  {displayName}
                </Link>
                {/* Email removed as requested */}
              </div>
            </div>

            {/* Credits */}
            <div className="flex items-center justify-between p-3 bg-black/[0.02] dark:bg-white/[0.02] rounded-lg">
              <span className="text-xs font-medium text-black/60 dark:text-white/60">Credits</span>
              <span className="text-sm font-semibold text-black dark:text-white">{displayCredits}</span>
            </div>
          </div>


          {/* Menu Items */}
          <div className="py-1">
            {menuItems.map((item, idx) => (
              <Link
                key={idx}
                to={item.path}
                className="flex items-center px-4 py-2.5 text-sm text-black/70 dark:text-white/70 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] hover:text-black dark:hover:text-white transition-colors group"
                onClick={() => setIsOpen(false)}
                role="menuitem"
              >
                <item.icon size={16} className="mr-3 text-black/40 dark:text-white/40 group-hover:text-black dark:group-hover:text-white transition-colors" />
                {item.label}
              </Link>
            ))}

            <button
              onClick={() => { navigate('/upgrade'); setIsOpen(false); }}
              className="w-full flex items-center justify-between px-4 py-2.5 text-sm font-medium text-black dark:text-white hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors group mt-1 border-t border-black/5 dark:border-white/5"
            >
              <span className="flex items-center">
                <Crown size={16} className="mr-3" />
                Upgrade
              </span>
              <ArrowUpRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>

            <div className="border-t border-black/5 dark:border-white/5 mt-1">
              <button
                onClick={handleLogout}
                className="w-full flex items-center px-4 py-2.5 text-sm text-black/70 dark:text-white/70 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] hover:text-black dark:hover:text-white transition-colors"
              >
                <LogOut size={16} className="mr-3" />
                Sign out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const Navbar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Fetch full profile data to get images/credits not in auth session
  const { data: profile } = useQuery({
    queryKey: ['me'],
    queryFn: getProfile,
    enabled: !!user,
    staleTime: 1000 * 60 * 5,
  });

  const displayUser = profile ? { ...user, ...profile } : user;
  const displayCredits = displayUser?.credits ?? 0;

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const navLinkClass = ({ isActive }) =>
    `relative px-3 py-1.5 text-[13px] font-medium transition-colors ${isActive
      ? 'text-black dark:text-white'
      : 'text-black/50 dark:text-white/50 hover:text-black/80 dark:hover:text-white/80'
    }`;

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled
      ? 'bg-white/80 dark:bg-black/80 backdrop-blur-2xl border-b border-black/5 dark:border-white/5'
      : 'bg-transparent'
      }`}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-center h-16">

          {/* Left Side: Logo & Links */}
          <div className="flex items-center gap-8">
            {/* Logo */}
            <Link
              to="/"
              className="flex items-center space-x-2 group"
              onClick={closeMobileMenu}
              aria-label="Home"
            >
              <div className="text-black dark:text-white transition-transform group-hover:scale-110 duration-300">
                <Heart size={24} fill="currentColor" />
              </div>
              <span className="text-lg font-bold text-black dark:text-white tracking-tight">
                Life-Time
              </span>
            </Link>

            {/* Desktop Links */}
            <div className="hidden md:flex items-center space-x-1">
              <NavLink to="/about" className={navLinkClass}>
                About
              </NavLink>
              {user ? (
                <>
                  <NavLink to="/profiles" className={navLinkClass}>
                    Discover
                  </NavLink>
                  <NavLink to="/analytics" className={navLinkClass}>
                    Analytics
                  </NavLink>
                </>
              ) : (
                <NavLink to="/login" className={navLinkClass}>
                  Login
                </NavLink>
              )}
            </div>
          </div>

          {/* Right Side: Actions */}
          <div className="hidden md:flex items-center space-x-3">
            <button
              onClick={toggleTheme}
              className="p-2.5 text-black/60 hover:text-black dark:text-white/60 dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.04] rounded-xl focus:outline-none transition-all"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>

            {user ? (
              <>
                <NotificationsDropdown />

                <div className="h-6 w-px bg-black/5 dark:bg-white/10 mx-1"></div>

                {/* Unified Upgrade & Credits Button */}
                <button
                  onClick={() => navigate('/upgrade')}
                  className="flex items-center space-x-3 px-3 py-1.5 bg-black/[0.02] dark:bg-white/[0.02] border border-black/5 dark:border-white/10 rounded-lg hover:bg-black/[0.04] dark:hover:bg-white/[0.04] transition-all group"
                >
                  <span className="text-xs font-semibold text-black dark:text-white group-hover:text-black/80 dark:group-hover:text-white/80 transition-colors">
                    Upgrade
                  </span>
                  <div className="w-px h-3 bg-black/10 dark:bg-white/10"></div>
                  <div className="flex items-center space-x-1.5">
                    <span className="text-xs font-bold text-black dark:text-white">
                      {displayCredits}
                    </span>
                    <Zap size={12} className="text-black/40 dark:text-white/40 group-hover:text-amber-500 transition-colors" />
                  </div>
                </button>

                <UserDropdown user={displayUser} logout={logout} />
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/register"
                  className="px-5 py-2 bg-black dark:bg-white text-white dark:text-black rounded-xl text-sm font-semibold hover:bg-black/90 dark:hover:bg-white/90 transition-all shadow-sm"
                  onClick={closeMobileMenu}
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center space-x-2 md:hidden">
            {user && (
              <button
                onClick={toggleTheme}
                className="p-2 text-black/50 hover:text-black dark:text-white/50 dark:hover:text-white rounded-lg"
                aria-label="Toggle theme"
              >
                {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
              </button>
            )}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
              className="p-2 text-black/50 hover:text-black dark:text-white/50 dark:hover:text-white hover:bg-black/[0.02] dark:hover:bg-white/[0.02] rounded-lg transition-all"
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-black border-t border-black/5 dark:border-white/5 animate-slide-down">
          <div className="px-6 py-4 space-y-1 max-w-6xl mx-auto">

            {user && (
              <div className="mb-4 p-4 bg-black/[0.02] dark:bg-white/[0.02] rounded-lg border border-black/5 dark:border-white/5">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden ring-1 ring-black/5 dark:ring-white/10">
                    {user?.profile_image ? (
                      <img src={user.profile_image} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-black dark:bg-white flex items-center justify-center">
                        <User size={18} className="text-white dark:text-black" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-black dark:text-white truncate">
                      {user?.first_name ? `${user.first_name} ${user.last_name || ''}` : user?.username}
                    </p>
                    <p className="text-xs text-black/40 dark:text-white/40 truncate">{user?.email}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-2.5 bg-white dark:bg-black rounded-lg">
                  <span className="text-xs font-medium text-black/60 dark:text-white/60">Credits</span>
                  <div className="flex items-center space-x-1">
                    <Zap size={12} className="text-black/60 dark:text-white/60" />
                    <span className="text-sm font-semibold text-black dark:text-white">
                      {user?.credits ?? 100}
                    </span>
                  </div>
                </div>

                <button className="w-full mt-3 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg text-sm font-medium flex items-center justify-center space-x-2 hover:bg-black/90 dark:hover:bg-white/90 transition-all">
                  <Crown size={16} />
                  <span>Upgrade</span>
                </button>
              </div>
            )}

            <NavLink
              to="/about"
              className="block px-4 py-2.5 text-sm font-medium text-black/70 dark:text-white/70 hover:text-black dark:hover:text-white hover:bg-black/[0.02] dark:hover:bg-white/[0.02] rounded-lg transition-colors"
              onClick={closeMobileMenu}
            >
              About
            </NavLink>

            {user ? (
              <>
                <NavLink to="/profiles" className="block px-4 py-2.5 text-sm font-medium text-black/70 dark:text-white/70 hover:text-black dark:hover:text-white hover:bg-black/[0.02] dark:hover:bg-white/[0.02] rounded-lg transition-colors" onClick={closeMobileMenu}>Discover</NavLink>
                <NavLink to="/analytics" className="block px-4 py-2.5 text-sm font-medium text-black/70 dark:text-white/70 hover:text-black dark:hover:text-white hover:bg-black/[0.02] dark:hover:bg-white/[0.02] rounded-lg transition-colors" onClick={closeMobileMenu}>Analytics</NavLink>
                <NavLink to="/profile" className="block px-4 py-2.5 text-sm font-medium text-black/70 dark:text-white/70 hover:text-black dark:hover:text-white hover:bg-black/[0.02] dark:hover:bg-white/[0.02] rounded-lg transition-colors" onClick={closeMobileMenu}>Profile</NavLink>
                <NavLink to="/settings" className="block px-4 py-2.5 text-sm font-medium text-black/70 dark:text-white/70 hover:text-black dark:hover:text-white hover:bg-black/[0.02] dark:hover:bg-white/[0.02] rounded-lg transition-colors" onClick={closeMobileMenu}>Settings</NavLink>

                <button
                  onClick={async () => { await logout(); closeMobileMenu(); }}
                  className="w-full text-left block px-4 py-2.5 text-sm font-medium text-black/70 dark:text-white/70 hover:text-black dark:hover:text-white hover:bg-black/[0.02] dark:hover:bg-white/[0.02] rounded-lg transition-colors"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <NavLink to="/login" className="block px-4 py-2.5 text-sm font-medium text-black/70 dark:text-white/70 hover:text-black dark:hover:text-white hover:bg-black/[0.02] dark:hover:bg-white/[0.02] rounded-lg transition-colors" onClick={closeMobileMenu}>Login</NavLink>
                <Link
                  to="/register"
                  className="block px-4 py-2.5 text-sm font-medium text-center bg-black dark:bg-white text-white dark:text-black rounded-lg hover:bg-black/90 dark:hover:bg-white/90 transition-all"
                  onClick={closeMobileMenu}
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;