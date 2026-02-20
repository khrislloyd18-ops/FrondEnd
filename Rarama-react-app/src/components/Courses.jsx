import React, { useState } from 'react';
import Sidebar from './Sidebar';
import { FaSearch, FaPlus, FaEdit, FaTrash } from 'react-icons/fa';

const Courses = () => {
  const [courses] = useState([
    { id: 1, code: 'CS101', name: 'Introduction to Programming', department: 'Computer Science', credits: 3, instructor: 'Dr. Smith', students: 45 },
    { id: 2, code: 'ENG201', name: 'Advanced Engineering Mathematics', department: 'Engineering', credits: 4, instructor: 'Prof. Johnson', students: 32 },
    { id: 3, code: 'BUS301', name: 'Business Management', department: 'Business', credits: 3, instructor: 'Dr. Williams', students: 28 },
    { id: 4, code: 'ART102', name: 'Digital Art Fundamentals', department: 'Arts', credits: 3, instructor: 'Prof. Davis', students: 22 },
    { id: 5, code: 'CS202', name: 'Data Structures and Algorithms', department: 'Computer Science', credits: 4, instructor: 'Dr. Smith', students: 38 },
  ]);

  return (
    <div className="dashboard">
      <Sidebar />
      <div className="main-content">
        <div className="page-header">
          <h1>Courses</h1>
          <p>Manage course offerings and details</p>
        </div>

        <div className="content-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div style={{ display: 'flex', gap: '10px' }}>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  placeholder="Search courses..."
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
              <FaPlus /> Add Course
            </button>
          </div>

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Course Name</th>
                  <th>Department</th>
                  <th>Credits</th>
                  <th>Instructor</th>
                  <th>Enrolled</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {courses.map(course => (
                  <tr key={course.id}>
                    <td><strong>{course.code}</strong></td>
                    <td>{course.name}</td>
                    <td>{course.department}</td>
                    <td>{course.credits}</td>
                    <td>{course.instructor}</td>
                    <td>{course.students}</td>
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

export default Courses;