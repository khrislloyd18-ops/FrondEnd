import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaHome,
  FaChartBar,
  FaUsers,
  FaBookOpen,
  FaCloudSun,
  FaCalendarAlt,
  FaUserCircle,
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaBell,
  FaCog,
  FaQuestionCircle,
} from 'react-icons/fa';
import { auth } from '../../services/api';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import LogoutConfirmationModal from './LogoutConfirmationModal';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const navLinks = [
    { path: '/dashboard', name: 'Dashboard', icon: FaHome },
    { path: '/students', name: 'Students', icon: FaUsers },
    { path: '/courses', name: 'Courses', icon: FaBookOpen },
    { path: '/reports', name: 'Reports', icon: FaChartBar },
    { path: '/weather', name: 'Weather', icon: FaCloudSun },
    { path: '/school-days', name: 'School Days', icon: FaCalendarAlt },
  ];

  const requestLogout = () => {
    setShowProfileMenu(false);
    setShowLogoutConfirm(true);
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);

    try {
      await auth.logout();
      logout();
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Still logout locally even if API call fails
      logout();
      navigate('/login');
    } finally {
      setIsLoggingOut(false);
      setShowLogoutConfirm(false);
    }
  };

  const isActivePath = (path) => {
    return location.pathname === path;
  };

  const profileImage = user?.avatar_url || user?.profile_picture || user?.avatar;

  return (
    <>
      <nav className="bg-white/90 backdrop-blur-xl border-b border-gray-200/50 fixed w-full z-50 shadow-lg">
        <div className="container mx-auto px-6">
          <div className="flex justify-between items-center h-20">
            {/* Logo Section */}
            <Link to="/dashboard" className="flex items-center space-x-4 group">
              <motion.div
                whileHover={{ scale: 1.05, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
                className="relative"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                  <span className="text-white font-bold text-2xl">RK</span>
                </div>
                {/* Logo Glow Effect */}
                <div className="absolute inset-0 w-12 h-12 bg-gradient-to-br from-blue-400/20 via-purple-400/20 to-pink-400/20 rounded-2xl blur-xl -z-10"></div>
              </motion.div>
              <div className="hidden sm:block">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  RaramaKhris
                </h1>
                <p className="text-xs text-gray-500 font-medium">Education Management System</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-2">
              {navLinks.map((link, index) => (
                <motion.div
                  key={link.path}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Link
                    to={link.path}
                    className={`group relative px-6 py-3 rounded-2xl text-sm font-semibold transition-all duration-300 ${
                      isActivePath(link.path)
                        ? 'text-white bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 shadow-lg'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <motion.div
                        className={`w-5 h-5 ${
                          isActivePath(link.path) ? 'text-white' : 'text-gray-400 group-hover:text-gray-600'
                        }`}
                        whileHover={{ scale: 1.2 }}
                      >
                        <link.icon />
                      </motion.div>
                      <span>{link.name}</span>
                    </div>
                    
                    {/* Active Indicator */}
                    {isActivePath(link.path) && (
                      <motion.div
                        layoutId="activeNav"
                        className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-white rounded-full"
                        initial={false}
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                    
                    {/* Hover Effect */}
                    {!isActivePath(link.path) && (
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    )}
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* Right Section */}
            <div className="flex items-center space-x-4">
              {/* Notification Bell */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="relative p-3 rounded-2xl hover:bg-gray-100 transition-colors hidden sm:block"
              >
                <FaBell className="w-5 h-5 text-gray-600" />
                <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></div>
              </motion.button>

              {/* Settings */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-3 rounded-2xl hover:bg-gray-100 transition-colors hidden sm:block"
              >
                <FaCog className="w-5 h-5 text-gray-600" />
              </motion.button>

              {/* User Profile */}
              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center space-x-3 p-2 rounded-2xl hover:bg-gray-100 transition-all"
                >
                  <div className="hidden sm:block text-right">
                    <p className="text-sm font-semibold text-gray-800">{user?.name || 'User'}</p>
                    <p className="text-xs text-gray-500 capitalize">{user?.role || 'Student'}</p>
                  </div>
                  <div className="relative">
                    {profileImage ? (
                      <img
                        src={profileImage}
                        alt="Profile"
                        className="w-12 h-12 rounded-2xl object-cover shadow-lg"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                        {user?.name?.charAt(0) || 'U'}
                      </div>
                    )}
                    {/* Online Status Indicator */}
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                  </div>
                </motion.button>

                <AnimatePresence>
                  {showProfileMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-3 w-56 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/50 py-2 overflow-hidden"
                    >
                      <div className="px-4 py-3 border-b border-gray-200/50">
                        <p className="text-sm font-semibold text-gray-800">{user?.name || 'User'}</p>
                        <p className="text-xs text-gray-500 capitalize">{user?.role || 'Student'}</p>
                      </div>
                      
                      <Link
                        to="/profile"
                        onClick={() => setShowProfileMenu(false)}
                        className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-3 transition-colors"
                      >
                        <FaUserCircle className="w-4 h-4 text-gray-400" />
                        <span>Profile</span>
                      </Link>
                      
                      <Link
                        to="/settings"
                        onClick={() => setShowProfileMenu(false)}
                        className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-3 transition-colors"
                      >
                        <FaCog className="w-4 h-4 text-gray-400" />
                        <span>Settings</span>
                      </Link>
                      
                      <button className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-3 transition-colors">
                        <FaQuestionCircle className="w-4 h-4 text-gray-400" />
                        <span>Help</span>
                      </button>
                      
                      <div className="border-t border-gray-200/50 mt-2 pt-2">
                        <button
                          onClick={requestLogout}
                          className="w-full px-4 py-3 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-3 transition-colors"
                        >
                          <FaSignOutAlt className="w-4 h-4" />
                          <span>Logout</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Mobile Menu Button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(!isOpen)}
                className="lg:hidden p-3 rounded-2xl hover:bg-gray-100 transition-colors"
              >
                {isOpen ? (
                  <FaTimes className="w-6 h-6 text-gray-700" />
                ) : (
                  <FaBars className="w-6 h-6 text-gray-700" />
                )}
              </motion.button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="lg:hidden bg-white/95 backdrop-blur-xl border-t border-gray-200/50"
            >
              <div className="container mx-auto px-6 py-4">
                {navLinks.map((link, index) => (
                  <motion.div
                    key={link.path}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <Link
                      to={link.path}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center space-x-4 px-4 py-4 rounded-2xl mb-2 transition-all ${
                        isActivePath(link.path)
                          ? 'bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white shadow-lg'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <motion.div
                        className={`w-6 h-6 ${
                          isActivePath(link.path) ? 'text-white' : 'text-gray-400'
                        }`}
                        whileHover={{ scale: 1.2 }}
                      >
                        <link.icon />
                      </motion.div>
                      <span className="font-semibold">{link.name}</span>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <LogoutConfirmationModal
        isOpen={showLogoutConfirm}
        isLoading={isLoggingOut}
        onCancel={() => setShowLogoutConfirm(false)}
        onConfirm={handleLogout}
      />

      {/* Spacer for fixed navbar */}
      <div className="h-20"></div>
    </>
  );
};

export default Navbar;