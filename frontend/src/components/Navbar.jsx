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

  const handleLogout = async () => {
    await logout();
    navigate('/login');
    setIsMobileMenuOpen(false);
  };

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">Life-Time</Link>

        <div className="hidden md:flex navbar-links">
          {user ? (
            <>
              <NavLink to="/profile" className="navbar-link" activeClassName="active">My Profile</NavLink>
              <NavLink to="/profiles" className="navbar-link" activeClassName="active">All Profiles</NavLink>
            </>
          ) : (
            <NavLink to="/login" className="navbar-link" activeClassName="active">Login</NavLink>
          )}
        </div>

        <div className="hidden md:flex navbar-actions">
          {user ? (
            <>
              <NotificationsDropdown />
              <button onClick={handleLogout} className="navbar-button logout-button">Logout</button>
            </>
          ) : (
            <Link to="/register" className="navbar-button register-button">Register</Link>
          )}
          <button onClick={toggleTheme} className="theme-toggle">
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>
        </div>

        <div className="hamburger-menu md:hidden">
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="mobile-menu md:hidden">
          {user ? (
            <>
              <NavLink to="/profile" className="navbar-link" onClick={closeMobileMenu}>My Profile</NavLink>
              <NavLink to="/profiles" className="navbar-link" onClick={closeMobileMenu}>All Profiles</NavLink>
              <div className="mt-4">
                <NotificationsDropdown />
              </div>
              <button onClick={handleLogout} className="navbar-button logout-button mt-4">Logout</button>
            </>
          ) : (
            <>
              <NavLink to="/login" className="navbar-link" onClick={closeMobileMenu}>Login</NavLink>
              <Link to="/register" className="navbar-button register-button mt-4" onClick={closeMobileMenu}>Register</Link>
            </>
          )}
          <button onClick={toggleTheme} className="theme-toggle mt-4">
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
