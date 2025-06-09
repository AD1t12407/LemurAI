import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useThemeStore } from './stores/themeStore';
import { useToastStore } from './stores/toastStore';
import { useAuthStore } from './stores/authStore';

// Pages
import { LandingPage } from './pages/LandingPage';
import { Waitlist } from './pages/Waitlist';
import { Login } from './pages/Login';
import { SignUp } from './pages/SignUp';
import { Dashboard } from './pages/Dashboard';
import { Meetings } from './pages/Meetings';
import { MeetingDetails } from './pages/MeetingDetails';
import { Clients } from './pages/Clients';
import { Settings } from './pages/Settings';
import { ApiTest } from './pages/ApiTest';
import { Register } from './pages/Register';

// Components
import { ToastContainer } from './components/Toast';
import { ProtectedRoute } from './components/ProtectedRoute';

// Services
import { MeetingRecordingService } from './services/meetingRecording';

function App() {
  const { isDarkMode } = useThemeStore();
  const { toasts, removeToast } = useToastStore();
  const { initializeAuth } = useAuthStore();

  // Apply theme when component mounts
  useEffect(() => {
    const html = document.documentElement;

    if (isDarkMode) {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Initialize authentication on app start
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // Initialize and cleanup meeting recording service
  useEffect(() => {
    // Initialize service on app start
    MeetingRecordingService.initialize();

    // Expose service globally for debugging
    (window as any).MeetingRecordingService = MeetingRecordingService;

    // Cleanup on app unmount
    return () => {
      MeetingRecordingService.cleanup();
    };
  }, []);

  return (
    <Router future={{ v7_relativeSplatPath: true }}>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/waitlist" element={<Waitlist />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/meetings" element={
          <ProtectedRoute>
            <Meetings />
          </ProtectedRoute>
        } />
        <Route path="/meetings/:id" element={
          <ProtectedRoute>
            <MeetingDetails />
          </ProtectedRoute>
        } />
        <Route path="/clients" element={
          <ProtectedRoute>
            <Clients />
          </ProtectedRoute>
        } />
        <Route path="/settings" element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        } />
        <Route path="/api-test" element={
          <ProtectedRoute>
            <ApiTest />
          </ProtectedRoute>
        } />

        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>

      {/* Toast Container */}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </Router>
  );
}

export default App;