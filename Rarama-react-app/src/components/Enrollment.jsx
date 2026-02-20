import React, { useState } from 'react';
import Sidebar from './Sidebar';
import { FaSearch, FaCheck, FaTimes } from 'react-icons/fa';

const Enrollment = () => {
  const [enrollments] = useState([
    { id: 1, student: 'John Doe', course: 'CS101 - Programming', date: '2024-01-15', status: 'approved' },
    { id: 2, student: 'Jane Smith', course: 'ENG201 - Mathematics', date: '2024-01-16', status: 'pending' },
    { id: 3, student: 'Bob Johnson', course: 'BUS301 - Management', date: '2024-01-14', status: 'approved' },
    { id: 4, student: 'Alice Brown', course: 'ART102 - Digital Art', date: '2024-01-17', status: 'pending' },
    { id: 5, student: 'Charlie Wilson', course: 'CS202 - Algorithms', date: '2024-01-15', status: 'rejected' },
  ]);

  return (
    <div className="dashboard">
      <Sidebar />
      <div className="main-content">
        <div className="page-header">
          <h1>Enrollment</h1>
          <p>Manage student enrollments and approvals</p>
        </div>

        <div className="content-card">
          <div style={{ marginBottom: '20px' }}>
            <div style={{ position: 'relative', width: '300px' }}>
              <input
                type="text"
                placeholder="Search enrollments..."
                style={{
                  padding: '10px 35px 10px 15px',
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                  width: '100%'
                }}
              />
              <FaSearch style={{ position: 'absolute', right: '10px', top: '12px', color: '#666' }} />
            </div>
          </div>

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Course</th>
                  <th>Enrollment Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {enrollments.map(enrollment => (
                  <tr key={enrollment.id}>
                    <td>{enrollment.student}</td>
                    <td>{enrollment.course}</td>
                    <td>{enrollment.date}</td>
                    <td>
                      <span className={`status-badge status-${enrollment.status}`}>
                        {enrollment.status}
                      </span>
                    </td>
                    <td>
                      {enrollment.status === 'pending' && (
                        <>
                          <button style={{ marginRight: '10px', color: '#10b981', background: 'none', border: 'none', cursor: 'pointer' }}>
                            <FaCheck />
                          </button>
                          <button style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}>
                            <FaTimes />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Enrollment;