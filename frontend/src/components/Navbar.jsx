import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

const Navbar = () => {
  const { token, setToken } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    setToken(null);
    navigate('/login');
  };

  return (
    <nav className="bg-white/10 backdrop-blur-md shadow-lg p-4 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-gray-800 dark:text-white">Life-Time</Link>
        <div className="flex items-center space-x-4">
          <Link to="/" className="text-gray-800 dark:text-white hover:text-purple-500 dark:hover:text-purple-300">Home</Link>
          {token ? (
            <>
              <Link to="/profile" className="text-gray-800 dark:text-white hover:text-purple-500 dark:hover:text-purple-300">My Profile</Link>
              <Link to="/profiles" className="text-gray-800 dark:text-white hover:text-purple-500 dark:hover:text-purple-300">All Profiles</Link>
              
              <button onClick={handleLogout} className="border border-purple-600 text-purple-600 px-4 py-2 rounded-md hover:bg-purple-600 hover:text-white transition-colors duration-200">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-gray-800 dark:text-white hover:text-purple-500 dark:hover:text-purple-300">Login</Link>
              <Link to="/register" className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700">Register</Link>
            </>
          )}
          {/* Theme Toggle Button */}
          <button onClick={toggleTheme} className="p-2 rounded-full text-gray-800 dark:text-white hover:bg-black/10 dark:hover:bg-white/20 transition-colors duration-300">
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;