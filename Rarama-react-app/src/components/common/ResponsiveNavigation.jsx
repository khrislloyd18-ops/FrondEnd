import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaHome, 
  FaChartBar, 
  FaUsers, 
  FaBookOpen, 
  FaFileAlt, 
  FaCloudSun,
  FaCalendarAlt,
  FaBars,
  FaTimes,
  FaChevronDown,
  FaChevronUp,
  FaUserCircle,
  FaCog,
  FaSignOutAlt
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import LogoutConfirmationModal from './LogoutConfirmationModal';

const ResponsiveNavigation = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // Handle scroll effect for navbar styling
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsDropdownOpen(false);
  }, [location]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.dropdown-container')) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navigationItems = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: FaHome,
      description: 'Overview and analytics'
    },
    {
      name: 'Students',
      path: '/students',
      icon: FaUsers,
      description: 'Student management'
    },
    {
      name: 'Courses',
      path: '/courses',
      icon: FaBookOpen,
      description: 'Course catalog'
    },
    {
      name: 'Reports',
      path: '/reports',
      icon: FaFileAlt,
      description: 'Reports and analytics'
    },
    {
      name: 'Weather',
      path: '/weather',
      icon: FaCloudSun,
      description: 'Weather information'
    },
    {
      name: 'School Days',
      path: '/school-days',
      icon: FaCalendarAlt,
      description: 'Academic calendar'
    }
  ];

  const requestLogout = () => {
    setIsDropdownOpen(false);
    setIsMobileMenuOpen(false);
    setShowLogoutConfirm(true);
  };

  const handleLogout = () => {
    logout();
    setShowLogoutConfirm(false);
    navigate('/login');
  };

  const isActiveRoute = (path) => {
    return location.pathname === path || location.pathname.startsWith(path);
  };

  return (
    <>
      {/* Desktop Navigation */}
      <nav className={`hidden lg:block fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white/95 backdrop-blur-xl shadow-xl border-b border-gray-200' : 'bg-transparent'
      }`}>
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/dashboard" className="flex items-center space-x-3">
              <img 
                src="/umtc.png" 
                alt="UMTC Logo" 
                className="w-10 h-10 object-contain"
              />
              <span className="text-xl font-bold text-gray-800">UMTC</span>
            </Link>

            {/* Navigation Items */}
            <div className="hidden md:flex items-center space-x-1">
              {navigationItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-200 ${
                    isActiveRoute(item.path)
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                  title={item.description}
                >
                  <item.icon className="w-4 h-4" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              ))}
            </div>

            {/* User Menu */}
            <div className="relative dropdown-container">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center space-x-3 px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-all duration-200"
              >
                <FaUserCircle className="w-5 h-5 text-gray-600" />
                <span className="font-medium text-gray-700">{user?.name || 'User'}</span>
                {isDropdownOpen ? (
                  <FaChevronUp className="w-4 h-4 text-gray-500" />
                ) : (
                  <FaChevronDown className="w-4 h-4 text-gray-500" />
                )}
              </button>

              {/* Dropdown Menu */}
              <AnimatePresence>
                {isDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden"
                  >
                    <div className="py-2">
                      <Link
                        to="/profile"
                        className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        <FaUserCircle className="w-4 h-4" />
                        <span>Profile</span>
                      </Link>
                      <Link
                        to="/settings"
                        className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        <FaCog className="w-4 h-4" />
                        <span>Settings</span>
                      </Link>
                      <div className="border-t border-gray-200 my-2"></div>
                      <button
                        onClick={requestLogout}
                        className="flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 transition-colors w-full text-left"
                      >
                        <FaSignOutAlt className="w-4 h-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <nav className={`lg:hidden fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white/95 backdrop-blur-xl shadow-xl border-b border-gray-200' : 'bg-white'
      }`}>
        <div className="flex items-center justify-between h-16 px-4">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center space-x-3">
            <img 
              src="/umtc.png" 
              alt="UMTC Logo" 
              className="w-10 h-10 object-contain"
            />
            <span className="text-xl font-bold text-gray-800">UMTC</span>
          </Link>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-all duration-200"
          >
            {isMobileMenuOpen ? (
              <FaTimes className="w-6 h-6 text-gray-600" />
            ) : (
              <FaBars className="w-6 h-6 text-gray-600" />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />

            {/* Mobile Menu Panel */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-16 left-0 bottom-0 w-80 bg-white shadow-2xl z-50 lg:hidden overflow-y-auto"
            >
              <div className="p-4">
                {/* User Info */}
                <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl mb-6">
                  <FaUserCircle className="w-8 h-8 text-blue-600" />
                  <div>
                    <div className="font-semibold text-gray-800">{user?.name || 'User'}</div>
                    <div className="text-sm text-gray-500">{user?.email || 'user@example.com'}</div>
                  </div>
                </div>

                {/* Navigation Items */}
                <div className="space-y-2">
                  {navigationItems.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                        isActiveRoute(item.path)
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                      }`}
                    >
                      <item.icon className="w-5 h-5" />
                      <div>
                        <div className="font-medium">{item.name}</div>
                        <div className="text-xs text-gray-500">{item.description}</div>
                      </div>
                    </Link>
                  ))}
                </div>

                {/* Mobile Actions */}
                <div className="border-t border-gray-200 mt-6 pt-4 space-y-2">
                  <Link
                    to="/profile"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
                  >
                    <FaUserCircle className="w-4 h-4" />
                    <span>Profile</span>
                  </Link>
                  <Link
                    to="/settings"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
                  >
                    <FaCog className="w-4 h-4" />
                    <span>Settings</span>
                  </Link>
                  <button
                    onClick={() => {
                      requestLogout();
                    }}
                    className="flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors w-full text-left"
                  >
                    <FaSignOutAlt className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <LogoutConfirmationModal
        isOpen={showLogoutConfirm}
        onCancel={() => setShowLogoutConfirm(false)}
        onConfirm={handleLogout}
      />

      {/* Spacer for fixed navbar */}
      <div className="h-16 lg:h-16"></div>
    </>
  );
};

export default ResponsiveNavigation;
