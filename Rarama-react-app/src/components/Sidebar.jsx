import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FaTachometerAlt, 
  FaUsers, 
  FaBook, 
  FaUserGraduate, 
  FaChartBar, 
  FaCog,
  FaSignOutAlt,
  FaBell,
  FaSearch,
  FaMoon,
  FaSun
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Sidebar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [darkMode, setDarkMode] = useState(true);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const menuItems = [
    { path: '/dashboard', icon: <FaTachometerAlt />, label: 'Dashboard' },
    { path: '/students', icon: <FaUsers />, label: 'Students' },
    { path: '/courses', icon: <FaBook />, label: 'Courses' },
    { path: '/enrollment', icon: <FaUserGraduate />, label: 'Enrollment' },
    { path: '/reports', icon: <FaChartBar />, label: 'Reports' },
    { path: '/settings', icon: <FaCog />, label: 'Settings' },
  ];

  return (
    <motion.div 
      className="sidebar"
      initial={{ x: -300 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
    >
      <div className="sidebar-header">
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          EduSys
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Enrollment System
        </motion.p>
      </div>

      {user && (
        <motion.div 
          className="user-profile"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          style={{
            padding: '20px',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
            marginBottom: '20px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <img 
              src={user.avatar || `https://ui-avatars.com/api/?name=${user.username}&background=6366f1&color=fff`}
              alt="Profile"
              style={{
                width: '50px',
                height: '50px',
                borderRadius: '15px',
                objectFit: 'cover'
              }}
            />
            <div>
              <h4 style={{ color: 'white', marginBottom: '5px' }}>{user.username}</h4>
              <p style={{ color: 'var(--gray)', fontSize: '0.8rem' }}>{user.role || 'Administrator'}</p>
            </div>
          </div>
        </motion.div>
      )}

      <nav className="sidebar-nav">
        <ul>
          {menuItems.map((item, index) => (
            <motion.li
              key={item.path}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
            >
              <NavLink to={item.path} className={({ isActive }) => isActive ? 'active' : ''}>
                <span className="icon">{item.icon}</span>
                {item.label}
              </NavLink>
            </motion.li>
          ))}
          <motion.li
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 }}
          >
            <a href="#" onClick={handleLogout}>
              <span className="icon"><FaSignOutAlt /></span>
              Logout
            </a>
          </motion.li>
        </ul>
      </nav>

      <motion.div 
        className="sidebar-footer"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
        style={{
          padding: '20px',
          borderTop: '1px solid rgba(255,255,255,0.1)',
          marginTop: 'auto'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-around' }}>
          <button 
            onClick={() => setDarkMode(!darkMode)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--gray)',
              cursor: 'pointer',
              fontSize: '1.2rem'
            }}
          >
            {darkMode ? <FaSun /> : <FaMoon />}
          </button>
          <button style={{ background: 'none', border: 'none', color: 'var(--gray)', cursor: 'pointer' }}>
            <FaBell />
          </button>
          <button style={{ background: 'none', border: 'none', color: 'var(--gray)', cursor: 'pointer' }}>
            <FaSearch />
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Sidebar;