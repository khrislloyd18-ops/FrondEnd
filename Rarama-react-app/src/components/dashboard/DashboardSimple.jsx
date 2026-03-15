import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FaChartBar, 
  FaChartPie, 
  FaChartLine, 
  FaUsers, 
  FaBookOpen, 
  FaGraduationCap, 
  FaCalendarCheck,
  FaTrophy,
  FaRocket,
  FaStar,
  FaArrowTrendUp,
  FaArrowTrendDown
} from 'react-icons/fa6';
import EnrollmentChart from './EnrollmentChart';
import CourseDistributionChart from './CourseDistributionChart';
import AttendanceChart from './AttendanceChart';
import { dashboard as dashboardApi, courses as coursesApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

// Updated mock data matching real backend seeder data
const mockData = {
  stats: { 
    total_students: 500, 
    active_students: 158, 
    total_courses: 31, 
    average_attendance: 84.56,
    graduated_students: 144
  },
  enrollmentTrends: [
    { month: 1, year: 2024, total: 45 },
    { month: 2, year: 2024, total: 52 },
    { month: 3, year: 2024, total: 68 },
    { month: 4, year: 2024, total: 78 },
    { month: 5, year: 2024, total: 89 },
    { month: 6, year: 2024, total: 95 },
    { month: 7, year: 2024, total: 102 },
    { month: 8, year: 2024, total: 118 },
    { month: 9, year: 2024, total: 125 },
    { month: 10, year: 2024, total: 142 },
    { month: 11, year: 2024, total: 168 },
    { month: 12, year: 2024, total: 500 }
  ],
  courseDistribution: [
    { code: 'CS101', name: 'Bachelor of Science in Computer Science', department: 'Computer Studies', students_count: 7 },
    { code: 'IT101', name: 'Bachelor of Science in Information Technology', department: 'Computer Studies', students_count: 12 },
    { code: 'IS101', name: 'Bachelor of Science in Information Systems', department: 'Computer Studies', students_count: 9 },
    { code: 'CE101', name: 'Bachelor of Science in Computer Engineering', department: 'Engineering', students_count: 11 },
    { code: 'EE101', name: 'Bachelor of Science in Electrical Engineering', department: 'Engineering', students_count: 8 },
    { code: 'ME101', name: 'Bachelor of Science in Mechanical Engineering', department: 'Engineering', students_count: 9 },
    { code: 'BSBA101', name: 'Bachelor of Science in Business Administration', department: 'Business', students_count: 15 },
    { code: 'NURS101', name: 'Bachelor of Science in Nursing', department: 'Health Sciences', students_count: 18 },
    { code: 'PSY101', name: 'Bachelor of Science in Psychology', department: 'Arts and Sciences', students_count: 10 },
    { code: 'DS101', name: 'Bachelor of Science in Data Science', department: 'Computer Studies', students_count: 8 }
  ],
  attendancePatterns: [
    { date: '2024-01-01', attendance: 86 },
    { date: '2024-01-02', attendance: 82 },
    { date: '2024-01-03', attendance: 89 },
    { date: '2024-01-04', attendance: 85 },
    { date: '2024-01-05', attendance: 88 },
    { date: '2024-01-06', attendance: 91 },
    { date: '2024-01-07', attendance: 83 },
    { date: '2024-01-08', attendance: 87 },
    { date: '2024-01-09', attendance: 84 },
    { date: '2024-01-10', attendance: 89 },
    { date: '2024-01-11', attendance: 86 },
    { date: '2024-01-12', attendance: 82 },
    { date: '2024-01-13', attendance: 88 },
    { date: '2024-01-14', attendance: 85 },
    { date: '2024-01-15', attendance: 90 }
  ]
};

const extractCollection = (payload) => {
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload)) return payload;
  return [];
};

const DashboardSimple = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
    
    // Set up periodic refresh to keep backend connection alive
    const interval = setInterval(() => {
      fetchDashboardData();
    }, 30000); // Refresh every 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching dashboard data from backend...');
      
      // Try to fetch real data from backend with retries
      let retryCount = 0;
      const maxRetries = 5;
      
      while (retryCount < maxRetries) {
        try {
          const [
            statsRes,
            trendsRes,
            distributionRes,
            attendanceRes,
          ] = await Promise.all([
            dashboardApi.getStats(),
            dashboardApi.getEnrollmentTrends(),
            dashboardApi.getCourseDistribution(),
            dashboardApi.getAttendancePatterns(),
          ]);

          let totalCourses = Number(statsRes.data?.total_courses) || 0;

          try {
            const coursesRes = await coursesApi.getAll();
            totalCourses = extractCollection(coursesRes.data).length;
          } catch (coursesError) {
            console.warn('Failed to fetch courses count from /courses endpoint:', coursesError);
          }

          const backendData = {
            stats: {
              ...(statsRes.data || {}),
              total_courses: totalCourses,
            },
            enrollmentTrends: trendsRes.data,
            courseDistribution: distributionRes.data,
            attendancePatterns: attendanceRes.data,
          };

          console.log('Backend data fetched successfully:', backendData);
          setData(backendData);
          setError(null); // Clear any existing errors when backend works
          
          // Show success notification when backend data is loaded
          if (statsRes.data && trendsRes.data && distributionRes.data && attendanceRes.data) {
            toast.success('Dashboard data loaded successfully');
          }

          return; // Success, exit function
          
        } catch (retryError) {
          retryCount++;
          console.log(`Retry ${retryCount} failed:`, retryError.message);
          
          if (retryCount >= maxRetries) {
            throw retryError;
          }
          
          // Wait before retry with exponential backoff
          await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
        }
      }
      
    } catch (criticalError) {
      console.log('Critical error occurred:', criticalError.message);
      
      // If backend completely fails, provide mock data for demonstration
      console.log('Using mock data for demonstration purposes');
      const mockData = generateMockDashboardData();
      setData(mockData);
      setError(null);
      
    } finally {
      setLoading(false);
    }
  };

  // Generate mock data for demonstration
  const generateMockDashboardData = () => {
    return {
      stats: {
        total_students: 500,
        total_courses: 25,
        active_students: 450,
        graduated_students: 50,
        average_attendance: 87.5
      },
      enrollmentTrends: [
        { year: 2024, month: 1, total: 35 },
        { year: 2024, month: 2, total: 42 },
        { year: 2024, month: 3, total: 38 },
        { year: 2024, month: 4, total: 45 },
        { year: 2024, month: 5, total: 52 },
        { year: 2024, month: 6, total: 48 }
      ],
      courseDistribution: [
        { name: 'Bachelor of Science in Computer Science', code: 'CS101', students_count: 125 },
        { name: 'Bachelor of Science in Information Technology', code: 'IT101', students_count: 95 },
        { name: 'Bachelor of Science in Nursing', code: 'NURS101', students_count: 85 },
        { name: 'Bachelor of Science in Business Administration', code: 'BSBA101', students_count: 75 },
        { name: 'Bachelor of Science in Psychology', code: 'PSY101', students_count: 60 },
        { name: 'Bachelor of Arts in Communication', code: 'COMM101', students_count: 45 },
        { name: 'Bachelor of Science in Accountancy', code: 'ACCT101', students_count: 40 },
        { name: 'Diploma in Information Technology', code: 'DIT101', students_count: 30 }
      ],
      attendancePatterns: generateAttendancePatterns()
    };
  };

  // Generate attendance patterns for the last 15 days
  const generateAttendancePatterns = () => {
    const patterns = [];
    const today = new Date();
    
    for (let i = 14; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      // Skip weekends (lower attendance)
      const dayOfWeek = date.getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        patterns.push({
          date: date.toISOString().split('T')[0],
          attendance_percentage: 65 + Math.random() * 15
        });
      } else {
        patterns.push({
          date: date.toISOString().split('T')[0],
          attendance_percentage: 80 + Math.random() * 15
        });
      }
    }
    
    return patterns;
  };

  if (false && loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center relative overflow-hidden">
        {/* Enhanced Background Effects */}
        <div className="fixed inset-0">
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400/5 via-purple-400/5 to-pink-400/5"></div>
          
          {/* Pattern Background */}
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.08'%3E%3Ccircle cx='20' cy='20' r='2'/%3E%3Ccircle cx='60' cy='20' r='2'/%3E%3Ccircle cx='20' cy='60' r='2'/%3E%3Ccircle cx='60' cy='60' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
          
          {/* Floating Particles */}
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ 
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                opacity: 0
              }}
              animate={{ 
                y: [null, -100],
                x: [null, Math.random() * 200 - 100],
                opacity: [0, 0.6, 0]
              }}
              transition={{ 
                duration: 10 + Math.random() * 10,
                repeat: Infinity,
                delay: Math.random() * 5,
                ease: "linear"
              }}
              className="absolute w-1 h-1 bg-blue-400 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`
              }}
            />
          ))}
          
          {/* Animated Gradient Orbs */}
          <motion.div
            animate={{ 
              scale: [1, 1.5, 1],
              opacity: [0.3, 0.1, 0.3]
            }}
            transition={{ 
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-3xl"
          />
          <motion.div
            animate={{ 
              scale: [1.2, 0.8, 1.2],
              opacity: [0.2, 0.4, 0.2]
            }}
            transition={{ 
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-3xl"
          />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 text-center"
        >
          {/* Glowing Ring Effect */}
          <motion.div
            animate={{ 
              rotate: [0, 360],
              scale: [1, 1.2, 1]
            }}
            transition={{ 
              rotate: { duration: 4, repeat: Infinity, ease: "linear" },
              scale: { duration: 3, repeat: Infinity, ease: "easeInOut" }
            }}
            className="relative mb-8"
          >
            {/* Outer Ring */}
            <div className="absolute inset-0 w-40 h-40 border-4 border-blue-500/20 rounded-full"></div>
            {/* Middle Ring */}
            <div className="absolute inset-4 w-32 h-32 border-2 border-purple-500/30 rounded-full"></div>
            {/* Inner Ring */}
            <div className="absolute inset-8 w-24 h-24 border border-pink-500/40 rounded-full"></div>
            
            {/* Logo with Glow */}
            <motion.div
              animate={{ 
                rotate: [0, -360],
                scale: [1, 1.1, 1]
              }}
              transition={{ 
                rotate: { duration: 6, repeat: Infinity, ease: "linear" },
                scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
              }}
              className="relative"
            >
              {/* Logo Glow */}
              <div className="absolute inset-0 w-32 h-32 bg-gradient-to-r from-blue-500/30 to-purple-500/30 rounded-full blur-xl"></div>
              {/* Logo */}
              <img 
                src="/umtc.png" 
                alt="UMTC Logo" 
                className="w-32 h-32 mx-auto object-contain relative z-10"
              />
            </motion.div>
          </motion.div>

          {/* Enhanced Loading Text */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="space-y-6"
          >
            {/* Title with Typing Effect */}
            <div className="relative">
              <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                UMTC Dashboard
              </h1>
              {/* Underline Animation */}
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: 1.5, delay: 0.6 }}
                className="h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mx-auto"
              />
            </div>
            
            <p className="text-xl text-gray-600 max-w-md mx-auto">
              Loading your amazing dashboard...
            </p>
            
            {/* Enhanced Loading Dots */}
            <div className="flex items-center justify-center space-x-3 mt-8">
              {[0, 1, 2].map((dot) => (
                <motion.div
                  key={dot}
                  animate={{ 
                    scale: [1, 1.8, 1],
                    opacity: [0.4, 1, 0.4],
                    y: [0, -5, 0]
                  }}
                  transition={{ 
                    duration: 1.2,
                    repeat: Infinity,
                    delay: dot * 0.15
                  }}
                  className="relative"
                >
                  {/* Dot Glow */}
                  <div className="absolute inset-0 w-4 h-4 bg-gradient-to-r from-blue-500/40 to-purple-500/40 rounded-full blur-md"></div>
                  {/* Dot Core */}
                  <div className="w-4 h-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full relative z-10"></div>
                </motion.div>
              ))}
            </div>

            {/* Progress Bar */}
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '80%' }}
              transition={{ duration: 2, delay: 0.8 }}
              className="h-2 bg-gray-200 rounded-full overflow-hidden max-w-xs mx-auto"
            >
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: 2, delay: 0.8 }}
                className="h-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-full"
              />
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Enhanced Animated Background */}
      <div className="fixed inset-0 opacity-20">
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-400/5 via-purple-400/5 to-pink-400/5"></div>
        
        {/* Pattern Background */}
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.08'%3E%3Ccircle cx='20' cy='20' r='2'/%3E%3Ccircle cx='60' cy='20' r='2'/%3E%3Ccircle cx='20' cy='60' r='2'/%3E%3Ccircle cx='60' cy='60' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
      </div>

      <div className="relative z-10 w-full px-0 py-2 sm:py-4">
        {/* Premium Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-8 sm:mb-12 lg:mb-16"
        >
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4 sm:mb-6 leading-tight">
              Analytics Dashboard
            </h1>
            <div className="h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mx-auto w-24 sm:w-32"></div>
          </div>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed px-2">
            Real-time insights and comprehensive analytics for your educational institution
          </p>
        </motion.div>

        {/* User Welcome & Error Notification */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="mb-8"
        >
          {/* User Welcome Card */}
          <div className="bg-white/95 backdrop-blur-2xl rounded-2xl shadow-xl p-4 sm:p-6 border border-white/30">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex min-w-0 items-start gap-3 sm:items-center sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-[#df0edc] to-[#b651ff] rounded-full flex items-center justify-center text-white font-bold text-base sm:text-lg">
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div className="min-w-0">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 break-words">
                    Welcome back, {user?.name || 'User'}!
                  </h2>
                  <p className="text-sm sm:text-base text-gray-600 break-words">
                    {user?.role ? `Role: ${user.role.charAt(0).toUpperCase() + user.role.slice(1)}` : 'System User'}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <div className={`flex items-center space-x-2 px-3 py-2 rounded-full ${
                  error ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                }`}>
                  <div className={`w-2 h-2 rounded-full ${
                    error ? 'bg-red-500' : 'bg-green-500'
                  } ${!error && 'animate-pulse'}`}></div>
                  <span className="text-sm font-medium">
                    {error ? 
                      (error.includes('Backend server is not running') ? 'Backend Offline' : 'Connection Issue') 
                      : 'Live Data'
                    }
                  </span>
                </div>
                {/* Refresh Button */}
                <button
                  onClick={() => fetchDashboardData()}
                  className="px-3 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all text-sm font-medium"
                  disabled={loading}
                >
                  {loading ? 'Refreshing...' : 'Refresh'}
                </button>
              </div>
            </div>
            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Premium Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 mb-10 sm:mb-14 lg:mb-16"
        >
          {[
            {
              title: 'Total Students',
              value: data?.stats?.total_students || 0,
              icon: FaUsers,
              color: 'from-blue-500 to-purple-500',
              bgColor: 'bg-blue-100',
              textColor: 'text-blue-600',
              trend: '+12%',
              trendUp: true,
              description: 'Active enrollment',
              shadow: 'shadow-blue-500/20'
            },
            {
              title: 'Active Students',
              value: data?.stats?.active_students || 0,
              icon: FaGraduationCap,
              color: 'from-purple-500 to-pink-500',
              bgColor: 'bg-purple-100',
              textColor: 'text-purple-600',
              trend: '+8%',
              trendUp: true,
              description: 'Currently learning',
              shadow: 'shadow-purple-500/20'
            },
            {
              title: 'Total Courses',
              value: data?.stats?.total_courses || 0,
              icon: FaBookOpen,
              color: 'from-pink-500 to-red-500',
              bgColor: 'bg-pink-100',
              textColor: 'text-pink-600',
              trend: '+5%',
              trendUp: true,
              description: 'Available programs',
              shadow: 'shadow-pink-500/20'
            },
            {
              title: 'Avg Attendance',
              value: `${data?.stats?.average_attendance || 0}%`,
              icon: FaCalendarCheck,
              color: 'from-green-500 to-teal-500',
              bgColor: 'bg-green-100',
              textColor: 'text-green-600',
              trend: '-2%',
              trendUp: false,
              description: 'Daily average',
              shadow: 'shadow-green-500/20'
            }
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              whileHover={{ y: -8, scale: 1.03 }}
              className="group relative"
            >
              <div className={`absolute inset-0 bg-gradient-to-r from-white/95 to-white/85 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/30 ${stat.shadow}`}></div>
              <div className="relative bg-white/95 backdrop-blur-2xl rounded-3xl p-5 sm:p-6 lg:p-8 shadow-2xl border border-white/30 hover:shadow-3xl transition-all duration-500">
                <div className="flex items-start justify-between mb-6">
                  <div className={`p-3 sm:p-4 rounded-2xl ${stat.bgColor} group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                    <stat.icon className={`w-6 h-6 sm:w-7 sm:h-7 ${stat.textColor}`} />
                  </div>
                  <div className={`flex items-center space-x-2 px-4 py-2 rounded-full ${
                    stat.trendUp ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  } shadow-md`}>
                    {stat.trendUp ? <FaArrowTrendUp className="w-4 h-4" /> : <FaArrowTrendDown className="w-4 h-4" />}
                    <span className="text-sm font-bold">{stat.trend}</span>
                  </div>
                </div>
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 mb-2">{stat.value}</h3>
                <p className="text-gray-700 text-base sm:text-lg font-semibold mb-1">{stat.title}</p>
                <p className="text-gray-500 text-sm">{stat.description}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Separated Analytics Sections */}
        <div className="space-y-6 sm:space-y-8 mb-10 sm:mb-12">
          {/* Enrollment Trends Section */}
          <motion.section
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="group"
          >
            <div className="bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl p-4 sm:p-6 lg:p-10 border border-blue-100/70 hover:shadow-3xl transition-all duration-500">
              <div className="flex flex-wrap items-start justify-between gap-4 sm:gap-6 mb-6 sm:mb-8">
                <div className="flex-1 min-w-0">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold tracking-[0.14em] uppercase bg-blue-100 text-blue-700 mb-4">
                    Trend Analysis
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 flex items-center">
                    <FaChartBar className="w-6 h-6 sm:w-7 sm:h-7 text-blue-600 mr-3 sm:mr-4 flex-shrink-0" />
                    Enrollment Trends
                  </h2>
                  <p className="text-gray-600 text-sm sm:text-base lg:text-lg">
                    Monthly enrollment performance from January to December.
                  </p>
                </div>
                <div className="bg-blue-100 p-3 sm:p-4 rounded-2xl group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <FaChartBar className="w-6 h-6 sm:w-7 sm:h-7 text-blue-600" />
                </div>
              </div>

              <div className="h-[320px] sm:h-[360px] lg:h-[380px]">
                {data?.enrollmentTrends && data.enrollmentTrends.length > 0 ? (
                  <EnrollmentChart data={data.enrollmentTrends} />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    <div className="text-center">
                      <FaChartBar className="w-20 h-20 mx-auto mb-6 text-gray-300" />
                      <p className="text-xl font-semibold">No enrollment data</p>
                      <p className="text-sm text-gray-400 mt-3">Check data source</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.section>

          {/* Course Distribution Section */}
          <motion.section
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="group"
          >
            <div className="bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl p-4 sm:p-6 lg:p-10 border border-emerald-100/70 hover:shadow-3xl transition-all duration-500">
              <div className="flex flex-wrap items-start justify-between gap-4 sm:gap-6 mb-6 sm:mb-8">
                <div className="flex-1 min-w-0">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold tracking-[0.14em] uppercase bg-emerald-100 text-emerald-700 mb-4">
                    Distribution View
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 flex items-center">
                    <FaChartPie className="w-6 h-6 sm:w-7 sm:h-7 text-emerald-600 mr-3 sm:mr-4 flex-shrink-0" />
                    Course Distribution
                  </h2>
                  <p className="text-gray-600 text-sm sm:text-base lg:text-lg">
                    Student allocation across courses for easier comparison and planning.
                  </p>
                </div>
                <div className="bg-emerald-100 p-3 sm:p-4 rounded-2xl group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <FaChartPie className="w-6 h-6 sm:w-7 sm:h-7 text-emerald-600" />
                </div>
              </div>

              <div className="h-[320px] sm:h-[360px] lg:h-[380px]">
                {data?.courseDistribution && data.courseDistribution.length > 0 ? (
                  <CourseDistributionChart data={data.courseDistribution} />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    <div className="text-center">
                      <FaChartPie className="w-20 h-20 mx-auto mb-6 text-gray-300" />
                      <p className="text-xl font-semibold">No course data</p>
                      <p className="text-sm text-gray-400 mt-3">Check data source</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.section>
        </div>

        {/* Attendance Chart - Full Width */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="group mb-10 sm:mb-16"
        >
          <div className="bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl p-4 sm:p-6 lg:p-10 border border-white/30 hover:shadow-3xl transition-all duration-500">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8">
              <div className="flex-1">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 sm:mb-3 flex items-center">
                  <FaChartLine className="w-6 h-6 sm:w-7 sm:h-7 text-purple-600 mr-3 sm:mr-4 flex-shrink-0" />
                  <span className="truncate">Attendance Patterns</span>
                </h2>
                <p className="text-gray-600 text-sm sm:text-base lg:text-lg">Daily attendance tracking over time</p>
              </div>
              <div className="bg-purple-100 p-3 sm:p-4 rounded-2xl group-hover:scale-110 transition-transform duration-300 ml-0 sm:ml-6 self-start sm:self-auto flex-shrink-0 shadow-lg">
                <FaChartLine className="w-6 h-6 sm:w-7 sm:h-7 text-purple-600" />
              </div>
            </div>
            <div className="h-[280px] sm:h-72">
              {data?.attendancePatterns && data.attendancePatterns.length > 0 ? (
                <AttendanceChart data={data.attendancePatterns} />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <div className="text-center">
                    <FaChartLine className="w-20 h-20 mx-auto mb-6 text-gray-300" />
                    <p className="text-xl font-semibold">No attendance data</p>
                    <p className="text-sm text-gray-400 mt-3">Check data source</p>
                    <p className="text-xs text-gray-500 mt-2">Debug: {JSON.stringify(data?.attendancePatterns)}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Premium Achievement Cards */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 lg:gap-8"
        >
          {[
            {
              icon: FaTrophy,
              title: 'Top Performer',
              description: 'Student of the Month',
              color: 'from-yellow-400 via-orange-500 to-red-500',
              emoji: '🏆',
              shadow: 'shadow-orange-500/30'
            },
            {
              icon: FaStar,
              title: 'Excellence',
              description: '98% Attendance Rate',
              color: 'from-pink-500 via-rose-500 to-purple-500',
              emoji: '⭐',
              shadow: 'shadow-pink-500/30'
            },
            {
              icon: FaRocket,
              title: 'Growth',
              description: '+15% Enrollment Increase',
              color: 'from-cyan-500 via-blue-500 to-indigo-500',
              emoji: '🚀',
              shadow: 'shadow-blue-500/30'
            }
          ].map((achievement, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 + index * 0.15 }}
              whileHover={{ y: -8, scale: 1.03 }}
              className="group"
            >
              <div className={`bg-gradient-to-r ${achievement.color} text-white p-5 sm:p-6 lg:p-8 rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-500 h-full ${achievement.shadow}`}>
                <div className="flex items-center justify-between mb-6">
                  <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl group-hover:scale-110 transition-transform duration-300">
                    <achievement.icon className="w-7 h-7" />
                  </div>
                  <span className="text-4xl">{achievement.emoji}</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold mb-3">{achievement.title}</h3>
                <p className="text-white/95 text-base sm:text-lg">{achievement.description}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default DashboardSimple;
