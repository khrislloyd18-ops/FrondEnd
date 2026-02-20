import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  FaTachometerAlt, 
  FaUsers, 
  FaBook, 
  FaUserGraduate, 
  FaChartBar, 
  FaCog,
  FaSignOutAlt 
} from 'react-icons/fa';

const Sidebar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>EduSys</h2>
        <p>Enrollment System</p>
      </div>
      <nav className="sidebar-nav">
        <ul>
          <li>
            <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'active' : ''}>
              <span className="icon"><FaTachometerAlt /></span>
              Dashboard
            </NavLink>
          </li>
          <li>
            <NavLink to="/students" className={({ isActive }) => isActive ? 'active' : ''}>
              <span className="icon"><FaUsers /></span>
              Students
            </NavLink>
          </li>
          <li>
            <NavLink to="/courses" className={({ isActive }) => isActive ? 'active' : ''}>
              <span className="icon"><FaBook /></span>
              Courses
            </NavLink>
          </li>
          <li>
            <NavLink to="/enrollment" className={({ isActive }) => isActive ? 'active' : ''}>
              <span className="icon"><FaUserGraduate /></span>
              Enrollment
            </NavLink>
          </li>
          <li>
            <NavLink to="/reports" className={({ isActive }) => isActive ? 'active' : ''}>
              <span className="icon"><FaChartBar /></span>
              Reports
            </NavLink>
          </li>
          <li>
            <NavLink to="/settings" className={({ isActive }) => isActive ? 'active' : ''}>
              <span className="icon"><FaCog /></span>
              Settings
            </NavLink>
          </li>
          <li>
            <a href="#" onClick={handleLogout}>
              <span className="icon"><FaSignOutAlt /></span>
              Logout
            </a>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;