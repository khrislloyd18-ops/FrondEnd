import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import './App.css';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Students from './components/Students';
import Courses from './components/Courses';
import Enrollment from './components/Enrollment';
import Reports from './components/Reports';
import Settings from './components/Settings';
import PrivateRoute from './components/PrivateRoute';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="App">
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#1e293b',
                color: '#fff',
                borderRadius: '10px',
                border: '1px solid rgba(255,255,255,0.1)',
              },
            }}
          />
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/dashboard" element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              } />
              <Route path="/students" element={
                <PrivateRoute>
                  <Students />
                </PrivateRoute>
              } />
              <Route path="/courses" element={
                <PrivateRoute>
                  <Courses />
                </PrivateRoute>
              } />
              <Route path="/enrollment" element={
                <PrivateRoute>
                  <Enrollment />
                </PrivateRoute>
              } />
              <Route path="/reports" element={
                <PrivateRoute>
                  <Reports />
                </PrivateRoute>
              } />
              <Route path="/settings" element={
                <PrivateRoute>
                  <Settings />
                </PrivateRoute>
              } />
              <Route path="/" element={<Navigate to="/dashboard" />} />
            </Routes>
          </AnimatePresence>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;