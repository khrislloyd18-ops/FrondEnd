import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaLock, FaGraduationCap } from 'react-icons/fa';

const Login = () => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Mock authentication - will be replaced with Laravel API
    if (credentials.username && credentials.password) {
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('user', JSON.stringify({ username: credentials.username }));
      navigate('/dashboard');
    } else {
      setError('Please enter username and password');
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-left">
          <h1>Welcome to EduSys</h1>
          <p>Modern Enrollment Management System for the future of education. Streamline your academic processes with our comprehensive platform.</p>
          <div style={{ marginTop: '30px' }}>
            <FaGraduationCap size={60} style={{ opacity: 0.5 }} />
          </div>
        </div>
        <div className="login-right">
          <h2>Sign In</h2>
          {error && <div style={{ color: 'red', marginBottom: '15px' }}>{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Username</label>
              <input
                type="text"
                name="username"
                value={credentials.username}
                onChange={handleChange}
                placeholder="Enter your username"
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                value={credentials.password}
                onChange={handleChange}
                placeholder="Enter your password"
              />
            </div>
            <button type="submit" className="login-btn">
              Sign In
            </button>
          </form>
          <div style={{ marginTop: '20px', textAlign: 'center', color: '#666' }}>
            <p>Demo credentials: any username/password</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;