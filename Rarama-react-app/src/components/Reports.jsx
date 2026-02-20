import React from 'react';
import Sidebar from './Sidebar';
import { FaFilePdf, FaFileExcel, FaPrint } from 'react-icons/fa';
import { Bar, Pie, Line } from 'recharts';

const Reports = () => {
  const enrollmentByDepartment = [
    { department: 'CS', students: 450 },
    { department: 'ENG', students: 320 },
    { department: 'BUS', students: 280 },
    { department: 'ART', students: 150 },
    { department: 'SCI', students: 180 }
  ];

  const monthlyEnrollment = [
    { month: 'Jan', count: 85 },
    { month: 'Feb', count: 95 },
    { month: 'Mar', count: 120 },
    { month: 'Apr', count: 110 },
    { month: 'May', count: 145 },
    { month: 'Jun', count: 168 }
  ];

  return (
    <div className="dashboard">
      <Sidebar />
      <div className="main-content">
        <div className="page-header">
          <h1>Reports</h1>
          <p>View and generate enrollment reports</p>
        </div>

        <div style={{ display: 'flex', gap: '15px', marginBottom: '25px' }}>
          <button style={{
            padding: '10px 20px',
            background: '#dc2626',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '5px'
          }}>
            <FaFilePdf /> Export PDF
          </button>
          <button style={{
            padding: '10px 20px',
            background: '#059669',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '5px'
          }}>
            <FaFileExcel /> Export Excel
          </button>
          <button style={{
            padding: '10px 20px',
            background: '#4b5563',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '5px'
          }}>
            <FaPrint /> Print
          </button>
        </div>

        <div className="charts-container">
          <div className="chart-card">
            <h3>Enrollment by Department</h3>
            <Bar
              width={400}
              height={200}
              data={enrollmentByDepartment}
              margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
            >
              <Bar dataKey="students" fill="#8884d8" />
            </Bar>
          </div>

          <div className="chart-card">
            <h3>Monthly Enrollment Trend</h3>
            <Line
              width={400}
              height={200}
              data={monthlyEnrollment}
              margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
            >
              <Line type="monotone" dataKey="count" stroke="#8884d8" />
            </Line>
          </div>
        </div>

        <div className="content-card" style={{ marginTop: '25px' }}>
          <h3 style={{ marginBottom: '20px' }}>Summary Statistics</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
            <div>
              <h4 style={{ color: '#666', marginBottom: '5px' }}>Total Students</h4>
              <p style={{ fontSize: '2rem', fontWeight: '700', color: '#333' }}>1,380</p>
            </div>
            <div>
              <h4 style={{ color: '#666', marginBottom: '5px' }}>Active Enrollments</h4>
              <p style={{ fontSize: '2rem', fontWeight: '700', color: '#333' }}>892</p>
            </div>
            <div>
              <h4 style={{ color: '#666', marginBottom: '5px' }}>Graduation Rate</h4>
              <p style={{ fontSize: '2rem', fontWeight: '700', color: '#333' }}>78%</p>
            </div>
            <div>
              <h4 style={{ color: '#666', marginBottom: '5px' }}>Average Class Size</h4>
              <p style={{ fontSize: '2rem', fontWeight: '700', color: '#333' }}>28</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;