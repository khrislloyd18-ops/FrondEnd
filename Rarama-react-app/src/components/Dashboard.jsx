import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Sidebar from './Sidebar';
import WeatherWidget from './WeatherWidget';
import Chatbot from './Chatbot';
import { 
  FaUsers, 
  FaBook, 
  FaUserGraduate, 
  FaChartLine,
  FaArrowUp,
  FaArrowDown,
  FaGraduationCap,
  FaClock,
  FaCheckCircle,
  FaTimesCircle
} from 'react-icons/fa';
import { Line, Bar, Pie, Area, Radar, ComposedChart } from 'recharts';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalStudents: 1250,
    totalCourses: 48,
    activeEnrollments: 892,
    completionRate: 78,
    newThisMonth: 145,
    graduationRate: 85
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate data loading
    setTimeout(() => setLoading(false), 1000);
  }, []);

  // Enhanced mock data
  const enrollmentTrend = [
    { month: 'Jan', students: 65, previous: 55 },
    { month: 'Feb', students: 85, previous: 70 },
    { month: 'Mar', students: 120, previous: 95 },
    { month: 'Apr', students: 98, previous: 88 },
    { month: 'May', students: 145, previous: 110 },
    { month: 'Jun', students: 168, previous: 135 }
  ];

  const courseDistribution = [
    { name: 'Computer Science', value: 35, color: '#6366f1' },
    { name: 'Engineering', value: 25, color: '#ec4899' },
    { name: 'Business', value: 20, color: '#10b981' },
    { name: 'Arts', value: 15, color: '#f59e0b' },
    { name: 'Others', value: 5, color: '#8b5cf6' }
  ];

  const weeklyActivity = [
    { day: 'Mon', enrollments: 12, completions: 8, dropouts: 2 },
    { day: 'Tue', enrollments: 18, completions: 12, dropouts: 1 },
    { day: 'Wed', enrollments: 15, completions: 10, dropouts: 3 },
    { day: 'Thu', enrollments: 22, completions: 15, dropouts: 2 },
    { day: 'Fri', enrollments: 28, completions: 20, dropouts: 4 },
    { day: 'Sat', enrollments: 8, completions: 5, dropouts: 1 },
    { day: 'Sun', enrollments: 3, completions: 2, dropouts: 0 }
  ];

  const performanceMetrics = [
    { subject: 'Attendance', A: 95, fullMark: 100 },
    { subject: 'Grades', A: 88, fullMark: 100 },
    { subject: 'Completion', A: 92, fullMark: 100 },
    { subject: 'Satisfaction', A: 85, fullMark: 100 },
    { subject: 'Engagement', A: 78, fullMark: 100 }
  ];

  const recentActivities = [
    { id: 1, action: 'New enrollment', student: 'John Doe', course: 'CS101', time: '5 min ago', status: 'success' },
    { id: 2, action: 'Course completed', student: 'Jane Smith', course: 'ENG201', time: '15 min ago', status: 'success' },
    { id: 3, action: 'Payment received', student: 'Bob Johnson', course: 'BUS301', time: '1 hour ago', status: 'success' },
    { id: 4, action: 'Dropout request', student: 'Alice Brown', course: 'ART102', time: '2 hours ago', status: 'warning' },
  ];

  if (loading) {
    return (
      <div className="dashboard">
        <Sidebar />
        <div className="main-content" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <Sidebar />
      <div className="main-content">
        <motion.div 
          className="page-header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1>Dashboard</h1>
          <p>Welcome back! Here's what's happening with your enrollment system.</p>
        </motion.div>

        <motion.div 
          className="widgets-grid"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <motion.div 
            className="widget"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="widget-header">
              <h3>Total Students</h3>
              <div className="widget-icon">
                <FaUsers />
              </div>
            </div>
            <div className="widget-value">{stats.totalStudents.toLocaleString()}</div>
            <div className="widget-trend">
              <span className="trend-up"><FaArrowUp /> 12%</span>
              <span>vs last month</span>
            </div>
          </motion.div>

          <motion.div 
            className="widget"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="widget-header">
              <h3>Active Courses</h3>
              <div className="widget-icon">
                <FaBook />
              </div>
            </div>
            <div className="widget-value">{stats.totalCourses}</div>
            <div className="widget-trend">
              <span className="trend-up"><FaArrowUp /> 5%</span>
              <span>vs last month</span>
            </div>
          </motion.div>

          <motion.div 
            className="widget"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="widget-header">
              <h3>Active Enrollments</h3>
              <div className="widget-icon">
                <FaUserGraduate />
              </div>
            </div>
            <div className="widget-value">{stats.activeEnrollments}</div>
            <div className="widget-trend">
              <span className="trend-up"><FaArrowUp /> 8%</span>
              <span>vs last month</span>
            </div>
          </motion.div>

          <motion.div 
            className="widget"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="widget-header">
              <h3>Completion Rate</h3>
              <div className="widget-icon">
                <FaChartLine />
              </div>
            </div>
            <div className="widget-value">{stats.completionRate}%</div>
            <div className="widget-trend">
              <span className="trend-down"><FaArrowDown /> 3%</span>
              <span>vs last month</span>
            </div>
          </motion.div>
        </motion.div>

        <div className="charts-container">
          <motion.div 
            className="chart-card"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h3>Enrollment Trends</h3>
            <Area
              width={400}
              height={200}
              data={enrollmentTrend}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <Area type="monotone" dataKey="students" stroke="#6366f1" fill="url(#colorGradient)" />
              <defs>
                <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
              </defs>
            </Area>
          </motion.div>

          <motion.div 
            className="chart-card"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <h3>Course Distribution</h3>
            <Pie
              width={400}
              height={200}
              data={courseDistribution}
            >
              <Pie dataKey="value" fill="#8884d8" label />
            </Pie>
          </motion.div>

          <motion.div 
            className="chart-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <h3>Weekly Activity</h3>
            <Bar
              width={400}
              height={200}
              data={weeklyActivity}
              margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
            >
              <Bar dataKey="enrollments" fill="#6366f1" />
              <Bar dataKey="completions" fill="#10b981" />
              <Bar dataKey="dropouts" fill="#ef4444" />
            </Bar>
          </motion.div>

          <motion.div 
            className="chart-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <h3>Performance Metrics</h3>
            <Radar
              width={400}
              height={200}
              data={performanceMetrics}
            >
              <Radar dataKey="A" stroke="#6366f1" fill="#6366f1" fillOpacity={0.6} />
            </Radar>
          </motion.div>
        </div>

        <motion.div 
          className="content-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          style={{ marginTop: '30px' }}
        >
          <h3 style={{ marginBottom: '20px', color: 'white' }}>Recent Activities</h3>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Action</th>
                  <th>Student</th>
                  <th>Course</th>
                  <th>Time</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentActivities.map(activity => (
                  <tr key={activity.id}>
                    <td>{activity.action}</td>
                    <td>{activity.student}</td>
                    <td>{activity.course}</td>
                    <td>{activity.time}</td>
                    <td>
                      {activity.status === 'success' ? 
                        <FaCheckCircle style={{ color: '#10b981' }} /> : 
                        <FaTimesCircle style={{ color: '#f59e0b' }} />
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        <WeatherWidget />
        <Chatbot />
      </div>
    </div>
  );
};

export default Dashboard;