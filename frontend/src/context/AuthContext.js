import React, { createContext, useState, useEffect, useContext } from 'react';
import { setAuthToken, getUser } from '../services/api'; // Import getUser

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setTokenState] = useState(localStorage.getItem('authToken'));
  const [user, setUser] = useState(null); // Add user state

  useEffect(() => {
    const fetchUser = async () => {
      if (token) {
        setAuthToken(token);
        try {
          const userData = await getUser();
          setUser(userData);
        } catch (error)
        {
          console.error('Failed to fetch user', error);
          // Handle error, e.g., by logging out the user
          setToken(null);
          setUser(null);
          localStorage.removeItem('authToken');
        }
      } else {
        setAuthToken(null);
        setUser(null);
      }
    };
    fetchUser();
  }, [token]);

  const setToken = (newToken) => {
    setTokenState(newToken);
    if (newToken) {
      localStorage.setItem('authToken', newToken);
    } else {
      localStorage.removeItem('authToken');
    }
  };

  const logout = () => {
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ token, user, setToken, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
