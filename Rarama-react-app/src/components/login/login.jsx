import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  FaEnvelope, FaLock, FaEye, FaEyeSlash, 
  FaArrowRight, FaUniversity
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { authService } from '../../services/authService';
import "./login.css";

const Login = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
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
      newErrors.email = "Invalid email format";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
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

    try {
      if (isLogin) {
        const response = await authService.login({
          email: formData.email,
          password: formData.password
        });
        
        if (onLogin) onLogin(response.user);
        navigate('/');
      } else {
        const response = await authService.register({
          name: formData.email.split('@')[0],
          email: formData.email,
          password: formData.password,
          password_confirmation: formData.confirmPassword
        });
        
        setIsLogin(true);
        setFormData({
          email: "",
          password: "",
          confirmPassword: ""
        });
      }
    } catch (error) {
      setErrors({
        general: error.message || 'Authentication failed'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setErrors({});
    setFormData({
      email: "",
      password: "",
      confirmPassword: ""
    });
  };

  return (
    <div className="login-container-simple">
      <div className="login-box">
        {/* Header */}
        <div className="login-header-simple">
          <div className="logo-wrapper-simple">
            <img src="/umtc.png" alt="UMTC Logo" className="logo-simple" />
          </div>
          <h1>University of Mindanao</h1>
          <p>{isLogin ? "Sign in to your account" : "Create a new account"}</p>
        </div>

        {/* Error Message */}
        {errors.general && (
          <div className="error-message-simple">
            {errors.general}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="login-form-simple">
          {/* Email Field */}
          <div className="form-group-simple">
            <label>
              <FaEnvelope className="input-icon-simple" />
              Email Address
            </label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleInputChange}
              className={errors.email ? "error" : ""}
              disabled={isLoading}
            />
            {errors.email && (
              <span className="field-error-simple">{errors.email}</span>
            )}
          </div>

          {/* Password Field */}
          <div className="form-group-simple">
            <label>
              <FaLock className="input-icon-simple" />
              Password
            </label>
            <div className="password-field">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleInputChange}
                className={errors.password ? "error" : ""}
                disabled={isLoading}
              />
              <button
                type="button"
                className="password-toggle-simple"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {errors.password && (
              <span className="field-error-simple">{errors.password}</span>
            )}
          </div>

          {/* Confirm Password Field (Register only) */}
          {!isLogin && (
            <div className="form-group-simple">
              <label>
                <FaLock className="input-icon-simple" />
                Confirm Password
              </label>
              <div className="password-field">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className={errors.confirmPassword ? "error" : ""}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="password-toggle-simple"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {errors.confirmPassword && (
                <span className="field-error-simple">{errors.confirmPassword}</span>
              )}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="submit-btn-simple"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="spinner-simple"></div>
            ) : (
              <>
                {isLogin ? "Sign In" : "Create Account"}
                <FaArrowRight className="btn-icon-simple" />
              </>
            )}
          </button>
        </form>

        {/* Toggle between Login and Register */}
        <div className="toggle-mode-simple">
          <p>
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <button 
              type="button"
              onClick={toggleMode}
              className="toggle-btn-simple"
              disabled={isLoading}
            >
              {isLogin ? "Register" : "Sign In"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;