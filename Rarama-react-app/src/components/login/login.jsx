import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FaUser, FaLock, FaEnvelope, FaEye, FaEyeSlash, 
  FaGraduationCap, FaGoogle, FaFacebook, FaTwitter,
  FaArrowRight, FaCheckCircle, FaTimesCircle, FaUniversity,
  FaChartLine, FaBook, FaUsers, FaShieldAlt
} from "react-icons/fa";
import { HiOutlineSparkles } from "react-icons/hi";
import { useNavigate } from "react-router-dom";
import "./login.css";

const Login = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    rememberMe: false
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const navigate = useNavigate();

  // Mock user data for demo
  const mockUsers = [
    { email: "admin@umtc.edu.ph", password: "admin123", role: "Administrator", name: "Dr. Maria Santos", avatar: "MS" },
    { email: "faculty@umtc.edu.ph", password: "faculty123", role: "Faculty", name: "Prof. Juan Dela Cruz", avatar: "JC" },
    { email: "student@umtc.edu.ph", password: "student123", role: "Student", name: "Anna Marie Reyes", avatar: "AR" }
  ];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value
    });
    // Clear error for this field
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ""
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    } else if (!formData.email.endsWith("@umtc.edu.ph")) {
      newErrors.email = "Please use your UMTC email address";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (!isLogin) {
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = "Please confirm your password";
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      if (isLogin) {
        // Login logic
        const user = mockUsers.find(u => u.email === formData.email && u.password === formData.password);
        
        if (user) {
          setLoginSuccess(true);
          // Store user info in localStorage
          localStorage.setItem("isAuthenticated", "true");
          localStorage.setItem("user", JSON.stringify({
            name: user.name,
            email: user.email,
            role: user.role,
            avatar: user.avatar
          }));
          
          // Show success message then redirect
          setTimeout(() => {
            if (onLogin) onLogin(user);
            navigate("/");
          }, 1500);
        } else {
          setErrors({
            general: "Invalid email or password. Please try again."
          });
          setIsLoading(false);
        }
      } else {
        // Registration logic
        setLoginSuccess(true);
        setTimeout(() => {
          setIsLogin(true);
          setLoginSuccess(false);
          setFormData({
            email: "",
            password: "",
            confirmPassword: "",
            rememberMe: false
          });
          setIsLoading(false);
        }, 1500);
      }
    }, 1500);
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setErrors({});
    setFormData({
      email: "",
      password: "",
      confirmPassword: "",
      rememberMe: false
    });
  };

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
    hidden: { y: 20, opacity: 0 },
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

  return (
    <motion.div 
      className="login-container"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Animated Background */}
      <div className="login-background">
        <div className="bg-grid"></div>
        <div className="bg-glow"></div>
        <div className="floating-shapes">
          <div className="shape shape1"></div>
          <div className="shape shape2"></div>
          <div className="shape shape3"></div>
          <div className="shape shape4"></div>
        </div>
      </div>

      {/* Main Content */}
      <div className="login-wrapper">
        {/* Left Side - Branding */}
        <motion.div className="brand-side" variants={itemVariants}>
          <div className="brand-content">
            <motion.div 
              className="brand-logo"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <img src="/umtc.png" alt="UMTC Logo" className="logo-image" />
              <HiOutlineSparkles className="logo-sparkle" />
            </motion.div>
            
            <h1 className="brand-title">
              University of
              <span>Mindanao</span>
            </h1>
            
            <p className="brand-subtitle">
              Empowering minds, shaping futures through excellence in education
            </p>

            <div className="brand-features">
              <motion.div className="feature-item" whileHover={{ x: 5 }}>
                <div className="feature-icon" style={{ background: 'var(--primary-100)' }}>
                  <FaChartLine style={{ color: 'var(--primary-600)' }} />
                </div>
                <div className="feature-text">
                  <h4>Academic Excellence</h4>
                  <p>Top-tier programs and curriculum</p>
                </div>
              </motion.div>

              <motion.div className="feature-item" whileHover={{ x: 5 }}>
                <div className="feature-icon" style={{ background: 'var(--secondary-100)' }}>
                  <FaBook style={{ color: 'var(--secondary-600)' }} />
                </div>
                <div className="feature-text">
                  <h4>Comprehensive Programs</h4>
                  <p>Wide range of academic offerings</p>
                </div>
              </motion.div>

              <motion.div className="feature-item" whileHover={{ x: 5 }}>
                <div className="feature-icon" style={{ background: 'var(--success-100)' }}>
                  <FaUsers style={{ color: 'var(--success-600)' }} />
                </div>
                <div className="feature-text">
                  <h4>Vibrant Community</h4>
                  <p>Connect with students and faculty</p>
                </div>
              </motion.div>

              <motion.div className="feature-item" whileHover={{ x: 5 }}>
                <div className="feature-icon" style={{ background: 'var(--warning-100)' }}>
                  <FaShieldAlt style={{ color: 'var(--warning-600)' }} />
                </div>
                <div className="feature-text">
                  <h4>Secure Portal</h4>
                  <p>Your data is always protected</p>
                </div>
              </motion.div>
            </div>

            <div className="testimonial">
              <p className="testimonial-text">
                "The University of Mindanao has provided me with an exceptional learning experience. The faculty and resources are world-class."
              </p>
              <div className="testimonial-author">
                <div className="author-avatar">DR</div>
                <div className="author-info">
                  <strong>Dr. Ricardo Santos</strong>
                  <span>Dean, College of Computing</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right Side - Login Form */}
        <motion.div className="form-side" variants={itemVariants}>
          <div className="form-card">
            {/* Mode Toggle */}
            <div className="mode-toggle">
              <button 
                className={`mode-btn ${isLogin ? 'active' : ''}`}
                onClick={() => setIsLogin(true)}
              >
                Sign In
              </button>
              <button 
                className={`mode-btn ${!isLogin ? 'active' : ''}`}
                onClick={() => setIsLogin(false)}
              >
                Create Account
              </button>
            </div>

            {/* Success Animation */}
            <AnimatePresence>
              {loginSuccess && (
                <motion.div 
                  className="success-message-modern"
                  initial={{ scale: 0.8, opacity: 0, y: 20 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.8, opacity: 0, y: -20 }}
                >
                  <div className="success-icon-wrapper">
                    <FaCheckCircle className="success-icon" />
                  </div>
                  <h3>{isLogin ? "Welcome Back!" : "Registration Successful!"}</h3>
                  <p>{isLogin ? "Redirecting to dashboard..." : "Please sign in with your new account"}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Error Message */}
            <AnimatePresence>
              {errors.general && (
                <motion.div 
                  className="error-message-modern"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <FaTimesCircle className="error-icon" />
                  <span>{errors.general}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Form */}
            <form onSubmit={handleSubmit} className="login-form-modern">
              {/* Email Field */}
              <motion.div className="form-group-modern" variants={itemVariants}>
                <label>
                  <FaEnvelope className="input-icon" />
                  Email Address
                </label>
                <div className="input-wrapper-modern">
                  <input
                    type="email"
                    name="email"
                    placeholder="your.name@umtc.edu.ph"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={errors.email ? "error" : ""}
                    disabled={isLoading || loginSuccess}
                  />
                </div>
                <AnimatePresence>
                  {errors.email && (
                    <motion.span 
                      className="field-error-modern"
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                    >
                      {errors.email}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Password Field */}
              <motion.div className="form-group-modern" variants={itemVariants}>
                <label>
                  <FaLock className="input-icon" />
                  Password
                </label>
                <div className="input-wrapper-modern password-wrapper">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={errors.password ? "error" : ""}
                    disabled={isLoading || loginSuccess}
                  />
                  <button
                    type="button"
                    className="password-toggle-modern"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                <AnimatePresence>
                  {errors.password && (
                    <motion.span 
                      className="field-error-modern"
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                    >
                      {errors.password}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Confirm Password Field */}
              <AnimatePresence>
                {!isLogin && (
                  <motion.div 
                    className="form-group-modern"
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                  >
                    <label>
                      <FaLock className="input-icon" />
                      Confirm Password
                    </label>
                    <div className="input-wrapper-modern password-wrapper">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        placeholder="Confirm your password"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className={errors.confirmPassword ? "error" : ""}
                        disabled={isLoading || loginSuccess}
                      />
                      <button
                        type="button"
                        className="password-toggle-modern"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                    <AnimatePresence>
                      {errors.confirmPassword && (
                        <motion.span 
                          className="field-error-modern"
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -5 }}
                        >
                          {errors.confirmPassword}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Remember Me & Forgot Password */}
              {isLogin && (
                <motion.div className="form-options-modern" variants={itemVariants}>
                  <label className="checkbox-label-modern">
                    <input
                      type="checkbox"
                      name="rememberMe"
                      checked={formData.rememberMe}
                      onChange={handleInputChange}
                    />
                    <span>Remember me</span>
                  </label>
                  <button type="button" className="forgot-password-modern">
                    Forgot Password?
                  </button>
                </motion.div>
              )}

              {/* Submit Button */}
              <motion.button
                type="submit"
                className="submit-btn-modern"
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={isLoading || loginSuccess}
              >
                {isLoading ? (
                  <div className="loading-spinner-modern"></div>
                ) : (
                  <>
                    {isLogin ? "Sign In" : "Create Account"}
                    <FaArrowRight className="btn-icon-modern" />
                  </>
                )}
              </motion.button>
            </form>

            {/* Social Login */}
            <motion.div className="social-login-modern" variants={itemVariants}>
              <div className="divider-modern">
                <span>Or continue with</span>
              </div>
              <div className="social-buttons-modern">
                <motion.button 
                  className="social-btn-modern google"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={isLoading || loginSuccess}
                >
                  <FaGoogle /> Google
                </motion.button>
                <motion.button 
                  className="social-btn-modern facebook"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={isLoading || loginSuccess}
                >
                  <FaFacebook /> Facebook
                </motion.button>
                <motion.button 
                  className="social-btn-modern twitter"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={isLoading || loginSuccess}
                >
                  <FaTwitter /> Twitter
                </motion.button>
              </div>
            </motion.div>

            {/* Demo Credentials */}
            <motion.div className="demo-credentials-modern" variants={itemVariants}>
              <div className="demo-header">
                <FaShieldAlt className="demo-icon" />
                <span>Demo Access</span>
              </div>
              <div className="demo-grid">
                {mockUsers.map((user, index) => (
                  <div key={index} className="demo-card">
                    <div className="demo-avatar" style={{
                      background: index === 0 ? 'var(--primary-500)' : 
                                 index === 1 ? 'var(--secondary-500)' : 
                                 'var(--success-500)'
                    }}>
                      {user.avatar}
                    </div>
                    <div className="demo-details">
                      <span className="demo-role">{user.role}</span>
                      <span className="demo-email">{user.email}</span>
                      <span className="demo-password">{user.password}</span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Login;