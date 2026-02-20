import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaUser, FaLock, FaGraduationCap, FaRocket, FaShieldAlt } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Login = () => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      if (credentials.username && credentials.password) {
        login({
          username: credentials.username,
          role: 'admin',
          avatar: `https://ui-avatars.com/api/?name=${credentials.username}&background=6366f1&color=fff`
        });
        toast.success('Welcome back! Redirecting to dashboard...');
        navigate('/dashboard');
      } else {
        toast.error('Please enter username and password');
      }
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="login-container">
      <motion.div 
        className="login-card"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="login-left">
          <div className="floating-shapes">
            <div className="shape shape-1"></div>
            <div className="shape shape-2"></div>
            <div className="shape shape-3"></div>
          </div>
          
          <motion.h1
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            Welcome to EduSys
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            The next-generation enrollment management system powered by AI and modern technology. Streamline your academic processes with our cutting-edge platform.
          </motion.p>

          <motion.div 
            style={{ marginTop: '40px', display: 'flex', gap: '20px' }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <FaRocket style={{ fontSize: '1.5rem' }} />
              <span>Lightning Fast</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <FaShieldAlt style={{ fontSize: '1.5rem' }} />
              <span>Secure</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <FaGraduationCap style={{ fontSize: '1.5rem' }} />
              <span>Smart</span>
            </div>
          </motion.div>
        </div>

        <div className="login-right">
          <motion.h2
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            Sign In
          </motion.h2>

          <form onSubmit={handleSubmit}>
            <motion.div 
              className="form-group"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <label>Username</label>
              <input
                type="text"
                name="username"
                value={credentials.username}
                onChange={handleChange}
                placeholder="Enter your username"
              />
            </motion.div>

            <motion.div 
              className="form-group"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <label>Password</label>
              <input
                type="password"
                name="password"
                value={credentials.password}
                onChange={handleChange}
                placeholder="Enter your password"
              />
            </motion.div>

            <motion.button
              type="submit"
              className="login-btn"
              disabled={loading}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </motion.button>
          </form>

          <motion.div 
            style={{ marginTop: '30px', textAlign: 'center' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <p style={{ color: 'rgba(255,255,255,0.5)' }}>
              Demo: Use any username/password
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;