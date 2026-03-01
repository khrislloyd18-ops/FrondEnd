import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  PieChart, Pie, Cell, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area, ComposedChart
} from "recharts";
import { 
  FaGraduationCap, FaBook, FaCheckCircle, FaTimesCircle, 
  FaClock, FaLink, FaStar, FaFire, FaChartLine, FaRocket,
  FaArrowUp, FaArrowDown, FaEllipsisH, FaBell, FaSearch,
  FaCalendarAlt, FaUserGraduate, FaChalkboardTeacher, FaGlobe,
  FaAward, FaTrophy, FaMedal, FaCrown, FaBolt, FaGem,
  FaHeart, FaThumbsUp, FaSmile, FaChartBar, FaChartPie,
  FaUsers, FaUserPlus, FaUserCheck, FaUserClock,
  FaArrowRight
} from "react-icons/fa";
import { HiOutlineSparkles } from "react-icons/hi";
import { BsThreeDotsVertical } from "react-icons/bs";
import { IoMdTrendingUp, IoMdTrendingDown } from "react-icons/io";
import programsData from "../data/programs.json";
import subjectsData from "../data/subjects.json";
import "./Dashboard.css";

const Dashboard = () => {
  const [programs, setPrograms] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedChart, setSelectedChart] = useState("pie");
  const [timeRange, setTimeRange] = useState("week");
  const [showNotifications, setShowNotifications] = useState(false);
  const [animatedStats, setAnimatedStats] = useState({});

  useEffect(() => {
    setPrograms(programsData);
    setSubjects(subjectsData);
    
    // Animate stats counting
    const stats = {
      totalPrograms: programsData.length,
      totalSubjects: subjectsData.length,
      activePrograms: programsData.filter(p => p.status === "active").length,
      subjectsWithPrerequisites: subjectsData.filter(s => s.preRequisites && s.preRequisites.length > 0).length
    };
    
    setAnimatedStats(stats);
  }, []);

  // Calculations
  const totalPrograms = programs.length;
  const totalSubjects = subjects.length;
  const activePrograms = programs.filter(p => p.status === "active").length;
  const inactivePrograms = programs.filter(p => p.status !== "active").length;
  const programsUnderReview = programs.filter(p => p.status === "under review").length;
  const programsPhasedOut = programs.filter(p => p.status === "phased out").length;
  
  const subjectsPerSemester = subjects.filter(s => s.semesterTerm === "semester").length;
  const subjectsPerTerm = subjects.filter(s => s.semesterTerm === "term").length;
  const subjectsBoth = subjects.filter(s => s.semesterTerm === "both").length;
  const subjectsWithPrerequisites = subjects.filter(s => s.preRequisites && s.preRequisites.length > 0).length;
  const subjectsWithoutPrerequisites = subjects.filter(s => !s.preRequisites || s.preRequisites.length === 0).length;

  // Enhanced chart data
  const programStatusData = [
    { name: "Active", value: activePrograms, color: "#10b981", gradient: ["#10b981", "#059669"], icon: FaCheckCircle },
    { name: "Under Review", value: programsUnderReview, color: "#f59e0b", gradient: ["#f59e0b", "#d97706"], icon: FaClock },
    { name: "Phased Out", value: programsPhasedOut, color: "#ef4444", gradient: ["#ef4444", "#dc2626"], icon: FaTimesCircle }
  ];

  const semesterDistributionData = [
    { name: "Semester", value: subjectsPerSemester, color: "#6366f1", icon: FaCalendarAlt },
    { name: "Term", value: subjectsPerTerm, color: "#ec4899", icon: FaClock },
    { name: "Both", value: subjectsBoth, color: "#8b5cf6", icon: FaGlobe }
  ];

  const prerequisiteData = [
    { name: "With Prerequisites", value: subjectsWithPrerequisites, color: "#f59e0b" },
    { name: "Without Prerequisites", value: subjectsWithoutPrerequisites, color: "#10b981" }
  ];

  const weeklyActivityData = [
    { day: "Mon", programs: 2, subjects: 5, total: 7 },
    { day: "Tue", programs: 3, subjects: 7, total: 10 },
    { day: "Wed", programs: 1, subjects: 4, total: 5 },
    { day: "Thu", programs: 4, subjects: 8, total: 12 },
    { day: "Fri", programs: 2, subjects: 6, total: 8 },
    { day: "Sat", programs: 1, subjects: 3, total: 4 },
    { day: "Sun", programs: 0, subjects: 2, total: 2 }
  ];

  const recentActivities = [
    { 
      id: 1, 
      action: "New program added", 
      item: "BS Computer Science", 
      time: "2 hours ago", 
      icon: FaGraduationCap, 
      color: "var(--primary-500)",
      user: "Admin",
      avatar: "A"
    },
    { 
      id: 2, 
      action: "Subject updated", 
      item: "IT101 - Introduction to IT", 
      time: "5 hours ago", 
      icon: FaBook, 
      color: "var(--secondary-500)",
      user: "Faculty",
      avatar: "F"
    },
    { 
      id: 3, 
      action: "Program status changed", 
      item: "BSIT → Active", 
      time: "1 day ago", 
      icon: FaCheckCircle, 
      color: "var(--success-500)",
      user: "Admin",
      avatar: "A"
    },
    { 
      id: 4, 
      action: "New prerequisite added", 
      item: "Math101 → CS201", 
      time: "2 days ago", 
      icon: FaLink, 
      color: "var(--info-500)",
      user: "Faculty",
      avatar: "F"
    }
  ];

  const topPrograms = [
    { name: "BSIT", students: 245, trend: +12, icon: FaTrophy, color: "#FFD700" },
    { name: "BSCS", students: 189, trend: +8, icon: FaMedal, color: "#C0C0C0" },
    { name: "ACT", students: 156, trend: +15, icon: FaMedal, color: "#CD7F32" },
    { name: "MSCS", students: 45, trend: +5, icon: FaAward, color: "#6366f1" }
  ];

  const statsCards = [
    { 
      title: "Total Programs", 
      value: totalPrograms, 
      icon: FaGraduationCap, 
      gradient: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
      trend: "+12.5%",
      trendUp: true,
      delay: 0.1,
      secondaryIcon: FaTrophy,
      bgPattern: "dots"
    },
    { 
      title: "Total Subjects", 
      value: totalSubjects, 
      icon: FaBook, 
      gradient: "linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)",
      trend: "+8.3%",
      trendUp: true,
      delay: 0.2,
      secondaryIcon: FaStar,
      bgPattern: "lines"
    },
    { 
      title: "Active Programs", 
      value: activePrograms, 
      icon: FaCheckCircle, 
      gradient: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
      trend: "+5.2%",
      trendUp: true,
      delay: 0.3,
      secondaryIcon: FaBolt,
      bgPattern: "circles"
    },
    { 
      title: "With Prerequisites", 
      value: subjectsWithPrerequisites, 
      icon: FaLink, 
      gradient: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
      trend: "+15.7%",
      trendUp: true,
      delay: 0.4,
      secondaryIcon: FaGem,
      bgPattern: "triangles"
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    }
  };

  const chartVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
        delay: 0.3
      }
    }
  };

  // Close notification when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showNotifications && !event.target.closest('.notification-icon')) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showNotifications]);

  return (
    <motion.div 
      className="dashboard light-theme"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header Section */}
      <motion.div className="dashboard-header" variants={itemVariants}>
        <div className="header-left">
          <motion.h1 
            className="dashboard-title"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <HiOutlineSparkles className="title-sparkle" />
            University of Mindanao Dashboard
          </motion.h1>
          <div className="welcome-message">
            <p className="dashboard-subtitle">Welcome back, Administrator!</p>
            <div className="quick-stats-header">
              <span className="quick-stat-header-item">
                <FaUsers /> 1,234 Students
              </span>
              <span className="quick-stat-header-item">
                <FaUserCheck /> 89 Faculty
              </span>
              <span className="quick-stat-header-item">
                <FaBook /> 45 Courses
              </span>
            </div>
          </div>
        </div>
        
        <div className="header-right">
          <motion.div 
            className="time-range-selector"
            whileHover={{ scale: 1.02 }}
          >
            <button 
              className={`time-btn ${timeRange === 'week' ? 'active' : ''}`}
              onClick={() => setTimeRange('week')}
            >
              Week
            </button>
            <button 
              className={`time-btn ${timeRange === 'month' ? 'active' : ''}`}
              onClick={() => setTimeRange('month')}
            >
              Month
            </button>
            <button 
              className={`time-btn ${timeRange === 'year' ? 'active' : ''}`}
              onClick={() => setTimeRange('year')}
            >
              Year
            </button>
          </motion.div>
          
          <div className="notification-wrapper">
            <motion.div 
              className="notification-icon"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <FaBell />
              <span className="notification-badge">4</span>
              
              <AnimatePresence>
                {showNotifications && (
                  <motion.div 
                    className="notification-dropdown"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="notification-header">
                      <h4>Notifications</h4>
                      <span>4 new</span>
                    </div>
                    <div className="notification-list">
                      {recentActivities.map(activity => (
                        <div key={activity.id} className="notification-item">
                          <div className="notification-avatar" style={{ background: activity.color }}>
                            {activity.avatar}
                          </div>
                          <div className="notification-content">
                            <p>{activity.action}</p>
                            <small>{activity.item}</small>
                            <span className="notification-time">{activity.time}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="notification-footer">
                      <button className="view-all-notifications">View All</button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
          
          <motion.div 
            className="profile-section"
            whileHover={{ scale: 1.05 }}
          >
            <div className="profile-icon">
              <FaUserGraduate />
            </div>
            <div className="profile-info">
              <span className="profile-name">Admin User</span>
              <span className="profile-role">Administrator</span>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div className="stats-grid-enhanced" variants={itemVariants}>
        {statsCards.map((stat, index) => (
          <motion.div
            key={index}
            className={`stat-card-enhanced ${stat.bgPattern}`}
            variants={itemVariants}
            custom={index}
            whileHover={{ 
              y: -8,
              boxShadow: "var(--shadow-2xl)",
              transition: { type: "spring", stiffness: 400, damping: 10 }
            }}
            style={{ background: stat.gradient }}
          >
            <div className="stat-icon-wrapper-enhanced">
              <stat.icon className="stat-main-icon" />
              <stat.secondaryIcon className="stat-secondary-icon" />
            </div>
            <div className="stat-content-enhanced">
              <div className="stat-header-enhanced">
                <h3>{stat.title}</h3>
                <span className={`stat-trend-enhanced ${stat.trendUp ? 'up' : 'down'}`}>
                  {stat.trendUp ? <IoMdTrendingUp /> : <IoMdTrendingDown />}
                  {stat.trend}
                </span>
              </div>
              <p className="stat-value-enhanced">{stat.value}</p>
              <div className="stat-progress">
                <div className="progress-bar" style={{ width: '75%' }} />
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Charts Grid */}
      <div className="charts-grid-enhanced">
        {/* Program Status Chart */}
        <motion.div 
          className="chart-card-enhanced"
          variants={chartVariants}
          whileHover={{ y: -5, boxShadow: "var(--shadow-2xl)" }}
        >
          <div className="chart-header-enhanced">
            <div className="chart-title-group">
              <FaChartPie className="chart-header-icon" />
              <h2>Program Status Distribution</h2>
            </div>
            <div className="chart-actions-enhanced">
              <button 
                className={`chart-action-btn ${selectedChart === 'pie' ? 'active' : ''}`}
                onClick={() => setSelectedChart('pie')}
              >
                Pie
              </button>
              <button 
                className={`chart-action-btn ${selectedChart === 'bar' ? 'active' : ''}`}
                onClick={() => setSelectedChart('bar')}
              >
                Bar
              </button>
              <BsThreeDotsVertical className="chart-more" />
            </div>
          </div>
          <div className="chart-wrapper-enhanced">
            <ResponsiveContainer width="100%" height={300}>
              {selectedChart === 'pie' ? (
                <PieChart>
                  <Pie
                    data={programStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {programStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              ) : (
                <BarChart data={programStatusData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                    {programStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Semester Distribution Chart */}
        <motion.div 
          className="chart-card-enhanced"
          variants={chartVariants}
          whileHover={{ y: -5, boxShadow: "var(--shadow-2xl)" }}
        >
          <div className="chart-header-enhanced">
            <div className="chart-title-group">
              <FaCalendarAlt className="chart-header-icon" />
              <h2>Semester/Term Distribution</h2>
            </div>
          </div>
          <div className="chart-wrapper-enhanced">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={semesterDistributionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {semesterDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Prerequisite Distribution */}
        <motion.div 
          className="chart-card-enhanced"
          variants={chartVariants}
          whileHover={{ y: -5, boxShadow: "var(--shadow-2xl)" }}
        >
          <div className="chart-header-enhanced">
            <div className="chart-title-group">
              <FaLink className="chart-header-icon" />
              <h2>Prerequisite Distribution</h2>
            </div>
          </div>
          <div className="chart-wrapper-enhanced">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={prerequisiteData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {prerequisiteData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Weekly Activity */}
        <motion.div 
          className="chart-card-enhanced"
          variants={chartVariants}
          whileHover={{ y: -5, boxShadow: "var(--shadow-2xl)" }}
        >
          <div className="chart-header-enhanced">
            <div className="chart-title-group">
              <FaFire className="chart-header-icon" />
              <h2>Weekly Activity</h2>
            </div>
          </div>
          <div className="chart-wrapper-enhanced">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={weeklyActivityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="programs" stroke="#6366f1" strokeWidth={2} />
                <Line type="monotone" dataKey="subjects" stroke="#ec4899" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Bottom Section */}
      <div className="dashboard-bottom-enhanced">
        {/* Recent Activities */}
        <motion.div 
          className="activities-card-enhanced"
          variants={itemVariants}
          whileHover={{ y: -5, boxShadow: "var(--shadow-2xl)" }}
        >
          <div className="activities-header-enhanced">
            <div className="header-title-group">
              <FaBell className="activities-icon" />
              <h2>Recent Activities</h2>
            </div>
            <button className="view-all-btn-enhanced">
              View All <FaArrowRight />
            </button>
          </div>
          <div className="activities-list-enhanced">
            {recentActivities.map((activity, index) => (
              <motion.div 
                key={activity.id}
                className="activity-item-enhanced"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ x: 5 }}
              >
                <div className="activity-avatar" style={{ background: activity.color }}>
                  {activity.avatar}
                </div>
                <div className="activity-content-enhanced">
                  <div className="activity-header">
                    <span className="activity-action">{activity.action}</span>
                    <span className="activity-user">{activity.user}</span>
                  </div>
                  <div className="activity-item-name">{activity.item}</div>
                  <div className="activity-time">{activity.time}</div>
                </div>
                <BsThreeDotsVertical className="activity-more" />
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Top Programs Leaderboard */}
        <motion.div 
          className="leaderboard-card-enhanced"
          variants={itemVariants}
          whileHover={{ y: -5, boxShadow: "var(--shadow-2xl)" }}
        >
          <div className="leaderboard-header">
            <div className="header-title-group">
              <FaTrophy className="leaderboard-icon" />
              <h2>Top Programs</h2>
            </div>
            <span className="leaderboard-badge">This Month</span>
          </div>
          <div className="leaderboard-list">
            {topPrograms.map((program, index) => (
              <motion.div 
                key={program.name}
                className="leaderboard-item"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ x: 5 }}
              >
                <div className="rank-badge" style={{ background: program.color }}>
                  {index + 1}
                </div>
                <program.icon className="program-rank-icon" style={{ color: program.color }} />
                <div className="program-info">
                  <span className="program-name">{program.name}</span>
                  <span className="program-students">{program.students} students</span>
                </div>
                <span className={`program-trend ${program.trend > 0 ? 'up' : 'down'}`}>
                  {program.trend > 0 ? <IoMdTrendingUp /> : <IoMdTrendingDown />}
                  {Math.abs(program.trend)}%
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Dashboard;