import React, { Suspense, lazy } from 'react';

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import LoadingSpinner from './components/LoadingSpinner';

// Lazy load all page components for code splitting
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const ProfilePage = lazy(() => import('./pages/profile_page'));
const CreateProfilePage = lazy(() => import('./pages/CreateProfilePage'));
const PublicProfilePage = lazy(() => import('./pages/PublicProfilePage'));
const ProfilesListPage = lazy(() => import('./pages/ProfilesListPage'));
const Home = lazy(() => import('./pages/Home'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const ProfileSuggestionExample = lazy(() => import('./components/ProfileSuggestionExample'));
const PaymentSuccessPage = lazy(() => import('./pages/PaymentSuccessPage'));
const PaymentFailPage = lazy(() => import('./pages/PaymentFailPage'));
const PricingPage = lazy(() => import('./components/PricingPage')); // Assuming PricingPage is in components
const AnalyticsDashboard = lazy(() => import('./pages/AnalyticsDashboard'));
const SurveyPage = lazy(() => import('./pages/SurveyPage'));
const MatchPreviewPage = lazy(() => import('./pages/MatchPreviewPage'));

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
          <Suspense fallback={<LoadingSpinner size="fullscreen" message="Loading..." />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<AboutPage />} />
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

              <Route
                path="/analytics"
                element={
                  <PrivateRoute>
                    <AnalyticsDashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/survey"
                element={
                  <PrivateRoute>
                    <SurveyPage />
                  </PrivateRoute>
                }
              />

              <Route
                path="/match-preview"
                element={
                  <PrivateRoute>
                    <MatchPreviewPage />
                  </PrivateRoute>
                }
              />

              <Route
                path="/upgrade"
                element={
                  <PrivateRoute>
                    <PricingPage />
                  </PrivateRoute>
                }
              />

              <Route path="/payment/success" element={<PaymentSuccessPage />} />
              <Route path="/payment/fail" element={<PaymentFailPage />} />

              {/* Demo Route for Profile Suggestion Modal */}
              <Route path="/demo/profile-modal" element={<ProfileSuggestionExample />} />

              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </Suspense>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
