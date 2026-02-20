import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import WeatherWidget from './WeatherWidget';
import Chatbot from './Chatbot';
import { 
  FaUsers, 
  FaBook, 
  FaUserGraduate, 
  FaChartLine,
  FaArrowUp,
  FaArrowDown 
} from 'react-icons/fa';
import { Line, Bar, Pie } from 'recharts';

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalStudents: 1250,
    totalCourses: 48,
    activeEnrollments: 892,
    completionRate: 78
  });

  // Mock data for charts
  const enrollmentTrend = [
    { month: 'Jan', students: 65 },
    { month: 'Feb', students: 85 },
    { month: 'Mar', students: 120 },
    { month: 'Apr', students: 98 },
    { month: 'May', students: 145 },
    { month: 'Jun', students: 168 }
  ];

  const courseDistribution = [
    { name: 'Computer Science', value: 35 },
    { name: 'Engineering', value: 25 },
    { name: 'Business', value: 20 },
    { name: 'Arts', value: 15 },
    { name: 'Others', value: 5 }
  ];

  const weeklyActivity = [
    { day: 'Mon', enrollments: 12 },
    { day: 'Tue', enrollments: 18 },
    { day: 'Wed', enrollments: 15 },
    { day: 'Thu', enrollments: 22 },
    { day: 'Fri', enrollments: 28 },
    { day: 'Sat', enrollments: 8 },
    { day: 'Sun', enrollments: 3 }
  ];

  return (
    <div className="dashboard">
      <Sidebar />
      <div className="main-content">
        <div className="page-header">
          <h1>Dashboard</h1>
          <p>Welcome back! Here's what's happening with your enrollment system.</p>
        </div>

        <div className="widgets-grid">
          <div className="widget">
            <div className="widget-header">
              <h3>Total Students</h3>
              <div className="widget-icon" style={{ background: '#e3f2fd', color: '#1976d2' }}>
                <FaUsers />
              </div>
            </div>
            <div className="widget-value">{stats.totalStudents}</div>
            <div className="widget-trend">
              <span className="trend-up"><FaArrowUp /> 12%</span>
              <span>vs last month</span>
            </div>
          </div>

          <div className="widget">
            <div className="widget-header">
              <h3>Active Courses</h3>
              <div className="widget-icon" style={{ background: '#e8f5e8', color: '#2e7d32' }}>
                <FaBook />
              </div>
            </div>
            <div className="widget-value">{stats.totalCourses}</div>
            <div className="widget-trend">
              <span className="trend-up"><FaArrowUp /> 5%</span>
              <span>vs last month</span>
            </div>
          </div>

          <div className="widget">
            <div className="widget-header">
              <h3>Active Enrollments</h3>
              <div className="widget-icon" style={{ background: '#fff3e0', color: '#ed6c02' }}>
                <FaUserGraduate />
              </div>
            </div>
            <div className="widget-value">{stats.activeEnrollments}</div>
            <div className="widget-trend">
              <span className="trend-up"><FaArrowUp /> 8%</span>
              <span>vs last month</span>
            </div>
          </div>

          <div className="widget">
            <div className="widget-header">
              <h3>Completion Rate</h3>
              <div className="widget-icon" style={{ background: '#f3e5f5', color: '#7b1fa2' }}>
                <FaChartLine />
              </div>
            </div>
            <div className="widget-value">{stats.completionRate}%</div>
            <div className="widget-trend">
              <span className="trend-down"><FaArrowDown /> 3%</span>
              <span>vs last month</span>
            </div>
          </div>
        </div>

        <div className="charts-container">
          <div className="chart-card">
            <h3>Enrollment Trends</h3>
            <Line
              width={400}
              height={200}
              data={enrollmentTrend}
              margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
            >
              <Line type="monotone" dataKey="students" stroke="#8884d8" />
            </Line>
          </div>

          <div className="chart-card">
            <h3>Course Distribution</h3>
            <Pie
              width={400}
              height={200}
              data={courseDistribution}
            >
              <Pie dataKey="value" fill="#8884d8" label />
            </Pie>
          </div>

          <div className="chart-card">
            <h3>Weekly Activity</h3>
            <Bar
              width={400}
              height={200}
              data={weeklyActivity}
              margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
            >
              <Bar dataKey="enrollments" fill="#8884d8" />
            </Bar>
          </div>
        </div>

        <WeatherWidget />
        <Chatbot />
      </div>
    </div>
  );
};

export default Dashboard;