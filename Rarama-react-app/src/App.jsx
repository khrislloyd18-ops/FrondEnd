import React from "react";
import { BrowserRouter as Router, Routes, Route, NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import { FaHome, FaBook, FaGraduationCap } from "react-icons/fa";
import Dashboard from "./components/Dashboard";
import ProgramList from "./components/ProgramList";
import ProgramDetails from "./components/ProgramDetails";
import SubjectList from "./components/SubjectList";
import SubjectDetails from "./components/SubjectDetails";
import "./App.css";

const App = () => {
  return (
    <Router>
      <div className="app">
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
        </nav>

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/programs" element={<ProgramList />} />
            <Route path="/programs/:programCode" element={<ProgramDetails />} />
            <Route path="/subjects" element={<SubjectList />} />
            <Route path="/subjects/:subjectCode" element={<SubjectDetails />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;