import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { motion } from 'framer-motion';

// Fix imports - make sure each component exists and is properly exported
import Login from './components/auth/Login';
import SignUp from './components/auth/SignUp';
import Dashboard from './components/dashboard/Dashboard';
import MainLayout from './components/layout/MainLayout';
import ErrorBoundary from './components/common/ErrorBoundary';
import StudentsPage from './components/students/StudentsPage';
import CourseList from './pages/CourseList';
import ReportsPage from './components/reports/ReportsPage';
import WeatherPage from './components/weather/WeatherPage';
import SchoolDays from './components/school/SchoolDays';
import ProfilePage from './components/profile/ProfilePage';
import { AuthProvider, useAuth } from './context/AuthContext';

const GlobalErrorOverlay = () => {
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleError = (event) => {
      setError({
        message: event.message || 'Unknown error',
        stack: event.error?.stack || null,
        source: 'window.onerror',
      });
    };

    const handleRejection = (event) => {
      setError({
        message: event.reason?.message || String(event.reason),
        stack: event.reason?.stack || null,
        source: 'unhandledrejection',
      });
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleRejection);
    };
  }, []);

  if (!error) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 overflow-auto">
        <h2 className="text-xl font-semibold text-red-600 mb-3">Runtime Error Detected</h2>
        <p className="text-sm text-gray-700 mb-2">{error.message}</p>
        {error.stack && (
          <pre className="text-xs bg-gray-100 p-3 rounded-lg overflow-auto">{error.stack}</pre>
        )}
        <p className="text-xs text-gray-500 mt-4">Source: {error.source}</p>
        <button
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg"
          onClick={() => setError(null)}
        >
          Dismiss
        </button>
      </div>
    </div>
  );
};

// Simple Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function AppContent() {
  const { isAuthenticated, user, loading } = useAuth();

  // Show loading screen while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500">
        <div className="text-center">
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ 
              duration: 0.8, 
              type: "spring", 
              stiffness: 100, 
              damping: 15,
              ease: "easeOut"
            }}
            className="mb-8"
          >
            <img 
              src="/umtc.png" 
              alt="UMTC Logo" 
              className="w-48 h-48 object-contain mx-auto"
            />
          </motion.div>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              delay: 0.4, 
              duration: 0.6,
              ease: "easeOut"
            }}
            className="text-white text-2xl font-light"
          >
            please wait
          </motion.p>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
        }}
      />

      
      <Routes>
        <Route
          path="/login"
          element={
            isAuthenticated ?
            <Navigate to="/dashboard" replace /> :
            <Login />
          }
        />

        <Route
          path="/signup"
          element={
            isAuthenticated ?
            <Navigate to="/dashboard" replace /> :
            <SignUp />
          }
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Dashboard />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/students"
          element={
            <ProtectedRoute>
              <MainLayout>
                <StudentsPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/courses"
          element={
            <ProtectedRoute>
              <MainLayout>
                <CourseList />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/reports"
          element={
            <ProtectedRoute>
              <MainLayout>
                <ReportsPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/weather"
          element={
            <ProtectedRoute>
              <MainLayout>
                <WeatherPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/school-days"
          element={
            <ProtectedRoute>
              <MainLayout>
                <SchoolDays />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <MainLayout>
                <ProfilePage />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <MainLayout>
                <ProfilePage />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/"
          element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />}
        />

        <Route
          path="*"
          element={
            <div className="min-h-screen flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-4xl font-bold text-gray-800 mb-4">404</h1>
                <p className="text-gray-600 mb-4">Page not found</p>
                <button
                  onClick={() => window.location.href = '/'}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg"
                >
                  Go Home
                </button>
              </div>
            </div>
          }
        />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;