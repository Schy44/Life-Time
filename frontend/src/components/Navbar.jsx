import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon, X, Menu } from 'lucide-react';
import NotificationsDropdown from './NotificationsDropdown';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const handleLogout = async () => {
    try {
      await logout();
      closeMobileMenu();
      navigate('/login');
    } catch (err) {
      // handle logout error gracefully
      console.error('Logout failed', err);
      // Optionally show a toast or alert
      alert('Logout failed. Please try again.');
    }
  };

  // helper to compute active class for NavLink (keeps BEM-style)
  const navLinkClass = ({ isActive }) =>
    isActive ? 'navbar-link active' : 'navbar-link';

  return (
    <nav className="navbar" role="navigation" aria-label="Main navigation">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo" onClick={closeMobileMenu}>
          Life-Time
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex navbar-links" role="menubar" aria-hidden={isMobileMenuOpen}>
          {user ? (
            <>
              <NavLink to="/profile" className={navLinkClass} onClick={closeMobileMenu}>
                My Profile
              </NavLink>
              <NavLink to="/profiles" className={navLinkClass} onClick={closeMobileMenu}>
                All Profiles
              </NavLink>
            </>
          ) : (
            <NavLink to="/login" className={navLinkClass} onClick={closeMobileMenu}>
              Login
            </NavLink>
          )}
        </div>

        {/* Desktop actions */}
        <div className="hidden md:flex navbar-actions">
          {user ? (
            <>
              <NotificationsDropdown />
              <button
                onClick={handleLogout}
                className="navbar-button logout-button"
                aria-label="Logout"
                title="Logout"
              >
                Logout
              </button>
            </>
          ) : (
            <Link to="/register" className="navbar-button register-button" onClick={closeMobileMenu}>
              Register
            </Link>
          )}

          <button
            onClick={toggleTheme}
            className="theme-toggle"
            aria-label="Toggle theme"
            title={theme === 'light' ? 'Switch to dark' : 'Switch to light'}
          >
            {theme === 'light' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>

        {/* Hamburger */}
        <div className="hamburger-menu md:hidden">
          <button
            onClick={() => setIsMobileMenuOpen((s) => !s)}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-menu"
            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
            className="hamburger-button"
          >
            {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div id="mobile-menu" className="mobile-menu md:hidden" role="menu" aria-label="Mobile menu">
          {user ? (
            <>
              <NavLink to="/profile" className={navLinkClass} onClick={closeMobileMenu}>
                My Profile
              </NavLink>
              <NavLink to="/profiles" className={navLinkClass} onClick={closeMobileMenu}>
                All Profiles
              </NavLink>

              <div className="mobile-notifications mt-4">
                {/* If NotificationsDropdown is interactive, ensure it works well on mobile */}
                <NotificationsDropdown />
              </div>

              <button
                onClick={handleLogout}
                className="navbar-button logout-button mt-4"
                aria-label="Logout"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={navLinkClass} onClick={closeMobileMenu}>
                Login
              </NavLink>
              <Link to="/register" className="navbar-button register-button mt-4" onClick={closeMobileMenu}>
                Register
              </Link>
            </>
          )}

          <button
            onClick={() => {
              toggleTheme();
              // optionally keep mobile menu open so user can continue navigating
            }}
            className="theme-toggle mt-4"
            aria-label="Toggle theme"
          >
            {theme === 'light' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
