import React, { Suspense, lazy } from 'react';

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import LoadingSpinner from './components/LoadingSpinner';
import { useQuery } from '@tanstack/react-query';
import api from './lib/api';

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
const OnboardingPage = lazy(() => import('./pages/OnboardingPage'));
const CreditHistoryPage = lazy(() => import('./pages/CreditHistoryPage'));
const InterestsPage = lazy(() => import('./pages/InterestsPage'));
const InterestConfirmedPage = lazy(() => import('./pages/InterestConfirmedPage'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const VerifyEmail = lazy(() => import('./pages/VerifyEmail'));

const PrivateRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
};

// New component to protect routes that require activation
const ActivationRoute = ({ children }) => {
  const { user } = useAuth();
  const { data: profile, isLoading } = useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      const response = await api.get('/profile/');
      return response.data;
    },
    enabled: !!user,
    staleTime: 1000 * 30, // 30 seconds cache
    refetchOnWindowFocus: true, // Refetch when user returns to tab
  });

  console.log("DEBUG: ActivationRoute Check", { user: !!user, isLoading, profile });

  if (!user) return <Navigate to="/login" />;
  if (isLoading) return <LoadingSpinner size="fullscreen" message="Checking activation status..." />;

  // If user is logged in but not activated, redirect to onboarding
  // We allow access to 'profile' for editing, but hide Discover/Analytics
  if (profile) {
    console.log("DEBUG: Profile Loaded. onboarding_completed =", profile.onboarding_completed);
    if (!profile.onboarding_completed) {
      console.warn("DEBUG: Redirecting to /onboarding because onboarding_completed is false");
      return <Navigate to="/onboarding" />;
    }
  }

  return children;
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
              <Route path="/verify-email" element={<VerifyEmail />} />
              <Route
                path="/profile"
                element={
                  <PrivateRoute>
                    <ProfilePage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/onboarding"
                element={
                  <PrivateRoute>
                    <OnboardingPage />
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
                  <ActivationRoute>
                    <ProfilesListPage />
                  </ActivationRoute>
                }
              />

              <Route
                path="/profiles/:id"
                element={
                  <ActivationRoute>
                    <PublicProfilePage />
                  </ActivationRoute>
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
                  <ActivationRoute>
                    <SurveyPage />
                  </ActivationRoute>
                }
              />

              <Route
                path="/match-preview"
                element={
                  <ActivationRoute>
                    <MatchPreviewPage />
                  </ActivationRoute>
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
              <Route
                path="/credit-history"
                element={
                  <ActivationRoute>
                    <CreditHistoryPage />
                  </ActivationRoute>
                }
              />
              <Route
                path="/interests"
                element={
                  <ActivationRoute>
                    <InterestsPage />
                  </ActivationRoute>
                }
              />
              <Route path="/interest-confirmed" element={<InterestConfirmedPage />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />

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
