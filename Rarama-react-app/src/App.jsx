import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, NavLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FaHome, FaBook, FaGraduationCap, FaSignOutAlt } from "react-icons/fa";
import Dashboard from "./components/Dashboard";
import ProgramList from "./components/ProgramList";
import ProgramDetails from "./components/ProgramDetails";
import SubjectList from "./components/SubjectList";
import SubjectDetails from "./components/SubjectDetails";
import Login from "./components/login/login";
import { authService } from './services/authService';
import "./App.css";

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const auth = authService.isAuthenticated();
    const currentUser = authService.getCurrentUser();
    
    if (auth && currentUser) {
      setIsAuthenticated(true);
      setUser(currentUser);
    }
    
    setIsLoading(false);
  }, []);

  const handleLogin = (userData) => {
    setIsAuthenticated(true);
    setUser(userData);
  };

  const handleLogout = async () => {
    await authService.logout();
    setIsAuthenticated(false);
    setUser(null);
  };

  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner-large"></div>
        <p>Loading University of Mindanao Portal...</p>
      </div>
    );
  }

  return (
    <Router>
      <div className="app">
        <AnimatePresence mode="wait">
          {!isAuthenticated ? (
            <Login key="login" onLogin={handleLogin} />
          ) : (
            <motion.div
              key="main"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="main-app"
            >
              <nav className="navbar">
                <div className="nav-brand">
                  <motion.div 
                    className="logo"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <img src="/umtc.png" alt="UMTC Logo" className="logo-img" />
                    <span>University of Mindanao</span>
                  </motion.div>
                </div>
                
                <div className="nav-links">
                  <NavLink to="/" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                    <FaHome />
                    <span>Dashboard</span>
                  </NavLink>
                  <NavLink to="/programs" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                    <FaBook />
                    <span>Programs</span>
                  </NavLink>
                  <NavLink to="/subjects" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                    <FaGraduationCap />
                    <span>Subjects</span>
                  </NavLink>
                </div>

                <div className="nav-user">
                  <div className="user-info">
                    <span className="user-name">{user?.name}</span>
                    <span className="user-role">{user?.role}</span>
                  </div>
                  <motion.button 
                    className="logout-btn"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleLogout}
                  >
                    <FaSignOutAlt />
                  </motion.button>
                </div>
              </nav>

              <main className="main-content">
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/programs" element={<ProgramList />} />
                  <Route path="/programs/:programCode" element={<ProgramDetails />} />
                  <Route path="/subjects" element={<SubjectList />} />
                  <Route path="/subjects/:subjectCode" element={<SubjectDetails />} />
                  <Route path="*" element={<Navigate to="/" />} />
                </Routes>
              </main>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Router>
  );
};

export default App;