import React, { useState } from 'react';
import Sidebar from './Sidebar';
import { FaSearch, FaPlus, FaEdit, FaTrash } from 'react-icons/fa';

const Students = () => {
  const [students] = useState([
    { id: 1, name: 'John Doe', email: 'john@example.com', course: 'Computer Science', year: '3rd', status: 'active' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', course: 'Engineering', year: '2nd', status: 'active' },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', course: 'Business', year: '4th', status: 'inactive' },
    { id: 4, name: 'Alice Brown', email: 'alice@example.com', course: 'Arts', year: '1st', status: 'active' },
    { id: 5, name: 'Charlie Wilson', email: 'charlie@example.com', course: 'Computer Science', year: '2nd', status: 'pending' },
  ]);

  return (
    <div className="dashboard">
      <Sidebar />
      <div className="main-content">
        <div className="page-header">
          <h1>Students</h1>
          <p>Manage student records and information</p>
        </div>

        <div className="content-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div style={{ display: 'flex', gap: '10px' }}>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  placeholder="Search students..."
                  style={{
                    padding: '10px 35px 10px 15px',
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    width: '300px'
                  }}
                />
                <FaSearch style={{ position: 'absolute', right: '10px', top: '12px', color: '#666' }} />
              </div>
            </div>
            <button style={{
              padding: '10px 20px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}>
              <FaPlus /> Add Student
            </button>
          </div>

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Course</th>
                  <th>Year</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map(student => (
                  <tr key={student.id}>
                    <td>{student.id}</td>
                    <td>{student.name}</td>
                    <td>{student.email}</td>
                    <td>{student.course}</td>
                    <td>{student.year}</td>
                    <td>
                      <span className={`status-badge status-${student.status}`}>
                        {student.status}
                      </span>
                    </td>
                    <td>
                      <button style={{ marginRight: '10px', color: '#667eea', background: 'none', border: 'none', cursor: 'pointer' }}>
                        <FaEdit />
                      </button>
                      <button style={{ color: '#f72585', background: 'none', border: 'none', cursor: 'pointer' }}>
                        <FaTrash />
                      </button>
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

export default Students;