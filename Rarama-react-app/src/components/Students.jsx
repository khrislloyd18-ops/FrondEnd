import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Sidebar from './Sidebar';
import { FaSearch, FaPlus, FaEdit, FaTrash, FaFilter, FaDownload } from 'react-icons/fa';

const Students = () => {
  const [students] = useState([
    { id: 1, name: 'John Doe', email: 'john@example.com', course: 'Computer Science', year: '3rd', status: 'active', avatar: 'https://i.pravatar.cc/150?img=1' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', course: 'Engineering', year: '2nd', status: 'active', avatar: 'https://i.pravatar.cc/150?img=2' },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', course: 'Business', year: '4th', status: 'inactive', avatar: 'https://i.pravatar.cc/150?img=3' },
    { id: 4, name: 'Alice Brown', email: 'alice@example.com', course: 'Arts', year: '1st', status: 'active', avatar: 'https://i.pravatar.cc/150?img=4' },
    { id: 5, name: 'Charlie Wilson', email: 'charlie@example.com', course: 'Computer Science', year: '2nd', status: 'pending', avatar: 'https://i.pravatar.cc/150?img=5' },
  ]);

  const [searchTerm, setSearchTerm] = useState('');

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.course.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <h1>Students</h1>
          <p>Manage student records and information</p>
        </motion.div>

        <motion.div 
          className="content-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px', flexWrap: 'wrap', gap: '15px' }}>
            <div className="search-container">
              <FaSearch className="search-icon" />
              <input
                type="text"
                className="search-input"
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div style={{ display: 'flex', gap: '15px' }}>
              <motion.button 
                className="add-btn"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <FaPlus /> Add Student
              </motion.button>
              <motion.button 
                style={{
                  padding: '15px 20px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '15px',
                  color: 'white',
                  cursor: 'pointer'
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <FaFilter />
              </motion.button>
              <motion.button 
                style={{
                  padding: '15px 20px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '15px',
                  color: 'white',
                  cursor: 'pointer'
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <FaDownload />
              </motion.button>
            </div>
          </div>

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Email</th>
                  <th>Course</th>
                  <th>Year</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student, index) => (
                  <motion.tr 
                    key={student.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <td style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <img 
                        src={student.avatar} 
                        alt={student.name}
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '10px',
                          objectFit: 'cover'
                        }}
                      />
                      {student.name}
                    </td>
                    <td>{student.email}</td>
                    <td>{student.course}</td>
                    <td>{student.year}</td>
                    <td>
                      <span className={`status-badge status-${student.status}`}>
                        {student.status}
                      </span>
                    </td>
                    <td>
                      <motion.button 
                        className="action-btn edit"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <FaEdit />
                      </motion.button>
                      <motion.button 
                        className="action-btn delete"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <FaTrash />
                      </motion.button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Students;