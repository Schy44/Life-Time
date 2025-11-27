import React from 'react';

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Login from './pages/Login';
import Register from './pages/Register';
import ProfilePage from './pages/profile_page';
import CreateProfilePage from './pages/CreateProfilePage';
import PublicProfilePage from './pages/PublicProfilePage';
import ProfilesListPage from './pages/ProfilesListPage';
import Navbar from './components/Navbar';
import Home from './pages/Home';

const PrivateRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/profile"
              element={
                <PrivateRoute>
                  <ProfilePage />
                </PrivateRoute>
              }
            />
            {/* Redirect old edit route to profile page (now has inline editing) */}
            <Route
              path="/profile/edit/:id"
              element={<Navigate to="/profile" replace />}
            />
            <Route
              path="/profile/create"
              element={
                <PrivateRoute>
                  <CreateProfilePage />
                </PrivateRoute>
              }
            />
            <Route
              path="/profiles"
              element={
                <PrivateRoute>
                  <ProfilesListPage />
                </PrivateRoute>
              }
            />

            <Route
              path="/profiles/:id"
              element={
                <PrivateRoute>
                  <PublicProfilePage />
                </PrivateRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
