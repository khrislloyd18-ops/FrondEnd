import React, { useEffect, useState } from 'react';
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
  FaChevronDown,
} from 'react-icons/fa';
import { auth } from '../../services/api';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import LogoutConfirmationModal from './LogoutConfirmationModal';

const Sidebar = ({ isCollapsed = false, onCollapseChange = () => {} }) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [expandedSections, setExpandedSections] = useState({});
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isMobileViewport, setIsMobileViewport] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth < 1024;
  });
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  useEffect(() => {
    const handleResize = () => {
      setIsMobileViewport(window.innerWidth < 1024);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    setShowProfileMenu(false);
  }, [isCollapsed, isMobileViewport, location.pathname]);

  const navSections = [
    {
      title: 'Main',
      items: [
        { path: '/dashboard', name: 'Dashboard', icon: FaHome },
        { path: '/students', name: 'Students', icon: FaUsers },
        { path: '/courses', name: 'Courses', icon: FaBookOpen },
      ]
    },
    {
      title: 'Analytics',
      items: [
        { path: '/reports', name: 'Reports', icon: FaChartBar },
        { path: '/weather', name: 'Weather', icon: FaCloudSun },
        { path: '/school-days', name: 'School Days', icon: FaCalendarAlt },
      ]
    }
  ];

  const requestLogout = () => {
    handleMobileNavigate();
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

  const activeNavItem = navSections
    .flatMap((section) => section.items)
    .find((item) => isActivePath(item.path));

  const mobilePageTitle = activeNavItem?.name || 'Dashboard';

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const profileImage = user?.avatar_url || user?.profile_picture || user?.avatar;

  const handleMobileNavigate = () => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      onCollapseChange(true);
    }
    setShowProfileMenu(false);
  };

  const openProfilePage = () => {
    handleMobileNavigate();
    navigate('/profile');
  };

  const collapsedWidth = 80;
  const expandedWidth = 280;
  const sidebarWidth = isCollapsed ? collapsedWidth : expandedWidth;
  const sidebarX = isMobileViewport && isCollapsed ? -(collapsedWidth + 24) : 0;
  const isDesktopCollapsed = isCollapsed && !isMobileViewport;
  const profileMenuPositionClassName = isDesktopCollapsed
    ? 'absolute bottom-0 left-full ml-3 w-56'
    : 'absolute bottom-full left-0 right-0 mb-2';

  return (
    <>
      {/* Mobile Top Navbar */}
      <div className="fixed top-0 left-0 right-0 z-30 lg:hidden px-3 pt-3">
        <div className="h-14 rounded-2xl bg-white/95 backdrop-blur-xl border border-gray-200/60 shadow-lg px-3 flex items-center justify-between">
          <button
            onClick={() => onCollapseChange(!isCollapsed)}
            aria-label="Open navigation"
            className="h-10 w-10 rounded-xl bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white border border-white/40 shadow-md transition-all flex items-center justify-center"
          >
            <FaBars className="w-4 h-4" />
          </button>

          <Link to="/dashboard" onClick={handleMobileNavigate} className="flex min-w-0 items-center gap-2 px-2">
            <img
              src="/umtc.png"
              alt="UMTC Logo"
              className="w-8 h-8 object-contain flex-shrink-0"
            />
            <div className="min-w-0">
              <p className="text-[11px] uppercase tracking-wider text-gray-500 leading-none">University of Mindanao</p>
              <p className="text-sm font-semibold text-gray-800 truncate leading-tight">{mobilePageTitle}</p>
            </div>
          </Link>

          <button
            onClick={openProfilePage}
            aria-label="Open profile"
            className="h-10 w-10 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors flex items-center justify-center overflow-hidden"
          >
            {profileImage ? (
              <img
                src={profileImage}
                alt="Profile"
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-sm font-bold text-gray-700">{user?.name?.charAt(0) || 'U'}</span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => onCollapseChange(true)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          width: `${sidebarWidth}px`,
          x: sidebarX,
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className={`fixed left-0 top-0 flex h-screen flex-col bg-white/95 backdrop-blur-xl border-r border-gray-200/50 shadow-2xl z-50 ${
          isMobileViewport && isCollapsed ? 'pointer-events-none' : 'pointer-events-auto'
        }`}
      >
        {/* Sidebar Header */}
        <div className="h-20 border-b border-gray-200/50 flex items-center justify-between px-4">
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-3"
            >
              <motion.div
                whileHover={{ scale: 1.05, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
                className="relative"
              >
                <img 
                  src="/umtc.png" 
                  alt="UMTC Logo" 
                  className="w-10 h-10 object-contain"
                />
                <div className="absolute inset-0 w-10 h-10 bg-gradient-to-br from-blue-400/20 via-purple-400/20 to-pink-400/20 rounded-xl blur-lg -z-10"></div>
              </motion.div>
              <div className="flex items-center">
                <div className="w-px h-8 bg-gradient-to-b from-blue-600 via-purple-600 to-pink-600 mr-3"></div>
                <div>
                  <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                    University of Mindanao
                  </h1>
                  <p className="text-xs text-gray-500">Education System</p>
                </div>
              </div>
            </motion.div>
          )}
          
          {/* Toggle Button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onCollapseChange(!isCollapsed)}
            aria-label={isCollapsed ? 'Expand navigation' : 'Collapse navigation'}
            title={isCollapsed ? 'Expand navigation' : 'Collapse navigation'}
            className="h-10 w-10 rounded-md bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 border border-white/40 shadow-lg transition-all flex items-center justify-center"
          >
            <FaBars className="w-4 h-4 text-white" />
          </motion.button>
        </div>

        {/* Navigation Items */}
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-6">
          {navSections.map((section, sectionIndex) => (
            <div key={section.title} className="mb-6">
              {/* Section Header */}
              {!isCollapsed && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: sectionIndex * 0.1 }}
                  className="px-3 mb-3"
                >
                  <button
                    onClick={() => toggleSection(section.title)}
                    className="flex items-center justify-between w-full text-xs font-semibold text-gray-500 uppercase tracking-wider hover:text-gray-700 transition-colors"
                  >
                    <span>{section.title}</span>
                    <motion.div
                      animate={{ rotate: expandedSections[section.title] ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <FaChevronDown className="w-3 h-3" />
                    </motion.div>
                  </button>
                </motion.div>
              )}

              {/* Section Items */}
              <div className="space-y-1">
                {section.items.map((item, itemIndex) => (
                  <motion.div
                    key={item.path}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: (sectionIndex * 0.1) + (itemIndex * 0.05) }}
                  >
                    <Link
                      to={item.path}
                      onClick={handleMobileNavigate}
                      title={isCollapsed ? item.name : undefined}
                      className={`group relative flex items-center ${
                        isCollapsed ? 'justify-center' : 'justify-start'
                      } px-3 py-3 rounded-xl transition-all duration-300 ${
                        isActivePath(item.path)
                          ? 'text-white bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 shadow-lg'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                      }`}
                    >
                      <motion.div
                        className={`w-5 h-5 flex-shrink-0 ${
                          isActivePath(item.path) ? 'text-white' : 'text-gray-400 group-hover:text-gray-600'
                        }`}
                        whileHover={{ scale: 1.2 }}
                      >
                        <item.icon />
                      </motion.div>
                      
                      {!isCollapsed && (
                        <motion.span
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 }}
                          className="ml-3 font-medium"
                        >
                          {item.name}
                        </motion.span>
                      )}

                      {/* Active Indicator */}
                      {isActivePath(item.path) && (
                        <motion.div
                          layoutId="activeNav"
                          className="absolute right-2 w-2 h-2 bg-white rounded-full"
                          initial={false}
                          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                        />
                      )}
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Section */}
        <div className="relative shrink-0 border-t border-gray-200/50 p-4">
          {/* User Profile */}
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              aria-label={showProfileMenu ? 'Close profile menu' : 'Open profile menu'}
              title={isCollapsed ? 'Open profile menu' : undefined}
              className={`w-full flex items-center ${
                isCollapsed ? 'justify-center' : 'justify-between'
              } p-3 rounded-xl hover:bg-gray-100 transition-all`}
            >
              {!isCollapsed && (
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    {profileImage ? (
                      <img
                        src={profileImage}
                        alt="Profile"
                        className="w-10 h-10 rounded-xl object-cover shadow"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg shadow">
                        {user?.name?.charAt(0) || 'U'}
                      </div>
                    )}
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-gray-800 truncate">
                      {user?.name || 'User'}
                    </p>
                    <p className="text-xs text-gray-500 capitalize truncate">
                      {user?.role || 'Student'}
                    </p>
                  </div>
                </div>
              )}
              
              {isCollapsed && (
                <div className="relative">
                  {profileImage ? (
                    <img
                      src={profileImage}
                      alt="Profile"
                      className="w-10 h-10 rounded-xl object-cover shadow"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg shadow">
                      {user?.name?.charAt(0) || 'U'}
                    </div>
                  )}
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                </div>
              )}
            </motion.button>

            <AnimatePresence>
              {showProfileMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className={`${profileMenuPositionClassName} z-20 bg-white/95 backdrop-blur-xl rounded-xl shadow-2xl border border-gray-200/50 py-2 overflow-hidden`}
                >
                  <button
                    onClick={openProfilePage}
                    className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-3 transition-colors"
                  >
                    <FaUserCircle className="w-4 h-4 text-gray-400" />
                    <span>Profile</span>
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
        </div>
      </motion.aside>

      <LogoutConfirmationModal
        isOpen={showLogoutConfirm}
        isLoading={isLoggingOut}
        onCancel={() => setShowLogoutConfirm(false)}
        onConfirm={handleLogout}
      />
    </>
  );
};

export default Sidebar;
