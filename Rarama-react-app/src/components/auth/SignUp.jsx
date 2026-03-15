import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { auth } from '../../services/api';
import toast from 'react-hot-toast';
import { 
  FaUserGraduate, 
  FaLock, 
  FaEye, 
  FaEyeSlash, 
  FaUser,
  FaGraduationCap,
  FaBook,
  FaUsers,
  FaChartLine
} from 'react-icons/fa';
import { HiMail, HiAcademicCap } from 'react-icons/hi';
import { useAuth } from '../../context/AuthContext';

const SignUp = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    try {
      console.log('Attempting signup with:', formData);
      
      // Format data for backend - password_confirmation instead of confirmPassword
      const submitData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        password_confirmation: formData.confirmPassword
      };
      
      // Try registration with backend API
      try {
        console.log('Trying backend registration...');
        const response = await auth.signUp(submitData);
        console.log('Backend response:', response);
        
        if (response.data && response.data.token && response.data.user) {
          // Registration successful
          const { user, token } = response.data;
          login(user, token);
          toast.success(`Welcome to UMTC, ${user.name}!`);
          navigate('/dashboard');
          return;
        } else {
          console.log('Invalid response format:', response.data);
          toast.error('Invalid response from server');
        }
      } catch (authError) {
        console.log('Backend registration error:', authError.message);
        console.log('Error details:', authError.response?.data);
        
        // Check if backend server is running
        if (authError.code === 'ECONNREFUSED' || authError.code === 'ERR_NETWORK') {
          toast.error('Backend server is not running. Please start the backend server on port 8000.');
        } else if (authError.response?.status === 422) {
          const errors = authError.response.data.errors;
          if (errors?.name) {
            setErrors({ name: errors.name[0] });
          } else if (errors?.email) {
            setErrors({ email: errors.email[0] });
          } else if (errors?.password) {
            setErrors({ password: errors.password[0] });
          } else {
            toast.error('Validation failed. Please check your input.');
          }
        } else {
          toast.error(authError.response?.data?.message || 'Registration failed. Please try again.');
        }
      }
    } catch (error) {
      console.error('Unexpected signup error:', error);
      toast.error('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - UMGYM Photo Background with 70% Transparency */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ 
            backgroundImage: 'url(/umgym.jpg)',
            filter: 'opacity(0.3)' // Increased transparency to 70%
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/70 via-purple-600/70 to-pink-500/70" />
        
        {/* Overlay Content with Repositioned Layout */}
        <div className="relative z-10 flex flex-col justify-center items-center p-12 text-white">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            {/* Logo and Branding with Vertical Line - Bigger */}
            <div className="flex items-center justify-center space-x-8 mb-12">
              {/* UMTC Logo - Bigger */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 20 }}
              >
                <img 
                  src="/umtc.png" 
                  alt="UMTC Logo" 
                  className="w-32 h-32 object-contain"
                />
              </motion.div>
              
              {/* Vertical Line - Bigger */}
              <div className="w-1 h-32 bg-white/60"></div>
              
              {/* Branding Text - Enhanced Design */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="text-left"
              >
                <h2 className="text-5xl font-bold text-white mb-2 bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-200">
                  UM - Tagum
                </h2>
                <p className="text-2xl text-white/90 font-light">
                  University of Mindanao
                </p>
              </motion.div>
            </div>
            
            {/* University Mindanao About - Single Stanza */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="max-w-3xl mx-auto"
            >
              <p className="text-2xl text-white leading-relaxed font-light text-center">
                <span className="font-semibold text-white">University Mindanao</span> is a premier educational institution committed to <span className="text-blue-200 font-medium">academic excellence</span> and <span className="text-purple-200 font-medium">innovative learning</span>. We provide <span className="text-green-200 font-medium">quality education</span> that fosters <span className="text-yellow-200 font-medium">intellectual growth</span>, <span className="text-pink-200 font-medium">character development</span>, and <span className="text-cyan-200 font-medium">professional success</span>. Our <span className="font-semibold text-white">comprehensive learning management system</span> empowers students to <span className="text-orange-200 font-medium">achieve their full potential</span> in a <span className="text-indigo-200 font-medium">dynamic academic environment</span>.
              </p>
            </motion.div>

            {/* Feature Icons */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="flex justify-center space-x-8 mt-12"
            >
              <div className="text-center">
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 mb-2">
                  <FaGraduationCap className="w-8 h-8 text-white" />
                </div>
                <p className="text-sm text-white/80">Academic</p>
              </div>
              <div className="text-center">
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 mb-2">
                  <FaBook className="w-8 h-8 text-white" />
                </div>
                <p className="text-sm text-white/80">Learning</p>
              </div>
              <div className="text-center">
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 mb-2">
                  <FaUsers className="w-8 h-8 text-white" />
                </div>
                <p className="text-sm text-white/80">Community</p>
              </div>
              <div className="text-center">
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 mb-2">
                  <FaChartLine className="w-8 h-8 text-white" />
                </div>
                <p className="text-sm text-white/80">Progress</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Right Side - Enhanced Signup Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gradient-to-br from-slate-50 via-white to-slate-50">
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-lg"
        >
          {/* Mobile Logo with UMTC */}
          <div className="lg:hidden text-center mb-8">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="inline-block mb-6"
            >
              <img 
                src="/umtc.png" 
                alt="UMTC Logo" 
                className="w-20 h-20 object-contain"
              />
            </motion.div>
            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-4xl font-black text-gray-900 mb-3"
            >
              Create Account
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-gray-600 text-lg"
            >
              Join University Mindanao today
            </motion.p>
          </div>

          {/* Enhanced Signup Card without Gradient Hover Effect */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-10 border border-white/50"
          >
            <div className="relative z-10">
            {/* Desktop Header */}
            <div className="hidden lg:block text-center mb-8">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
                className="inline-block mb-6"
              >
                <img 
                  src="/umtc.png" 
                  alt="UMTC Logo" 
                  className="w-20 h-20 object-contain"
                />
              </motion.div>
              <motion.h2
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-3xl font-black text-gray-900 mb-2"
              >
                Create Account
              </motion.h2>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-gray-600"
              >
                Join University Mindanao today
              </motion.p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Enhanced Name Field without Icon */}
              <div>
                <label className="block text-gray-700 text-sm font-semibold mb-3">
                  Full Name
                </label>
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-teal-600 rounded-xl opacity-0 group-hover:opacity-10 transition-opacity"></div>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`w-full px-4 py-4 bg-gray-50/50 border ${
                      errors.name ? 'border-red-400' : 'border-gray-200'
                    } rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all focus:bg-white/80 backdrop-blur-sm focus:shadow-lg focus:shadow-green-500/20`}
                    placeholder="Enter your full name"
                  />
                </div>
                {errors.name && (
                  <p className="mt-2 text-sm text-red-500">
                    {errors.name}
                  </p>
                )}
              </div>

              {/* Enhanced Email Field without Icon */}
              <div>
                <label className="block text-gray-700 text-sm font-semibold mb-3">
                  Email Address
                </label>
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl opacity-0 group-hover:opacity-10 transition-opacity"></div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full px-4 py-4 bg-gray-50/50 border ${
                      errors.email ? 'border-red-400' : 'border-gray-200'
                    } rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all focus:bg-white/80 backdrop-blur-sm focus:shadow-lg focus:shadow-blue-500/20`}
                    placeholder="Enter your email address"
                  />
                </div>
                {errors.email && (
                  <p className="mt-2 text-sm text-red-500">
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Enhanced Password Field without Icon */}
              <div>
                <label className="block text-gray-700 text-sm font-semibold mb-3">
                  Password
                </label>
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl opacity-0 group-hover:opacity-10 transition-opacity"></div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`w-full px-4 py-4 bg-gray-50/50 border ${
                      errors.password ? 'border-red-400' : 'border-gray-200'
                    } rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all focus:bg-white/80 backdrop-blur-sm focus:shadow-lg focus:shadow-purple-500/20`}
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <FaEyeSlash className="w-5 h-5" /> : <FaEye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-2 text-sm text-red-500">
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Enhanced Confirm Password Field without Icon */}
              <div>
                <label className="block text-gray-700 text-sm font-semibold mb-3">
                  Confirm Password
                </label>
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-red-600 rounded-xl opacity-0 group-hover:opacity-10 transition-opacity"></div>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`w-full px-4 py-4 bg-gray-50/50 border ${
                      errors.confirmPassword ? 'border-red-400' : 'border-gray-200'
                    } rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all focus:bg-white/80 backdrop-blur-sm focus:shadow-lg focus:shadow-pink-500/20`}
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showConfirmPassword ? <FaEyeSlash className="w-5 h-5" /> : <FaEye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-2 text-sm text-red-500">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              {/* Enhanced Submit Button without Icon */}
              <motion.button
                whileHover={{ scale: 1.02, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="w-full py-4 px-6 bg-gradient-to-r from-green-600 via-teal-600 to-cyan-600 text-white font-bold rounded-xl hover:from-green-700 hover:via-teal-700 hover:to-cyan-700 focus:outline-none focus:ring-4 focus:ring-green-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity"></div>
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span className="ml-2">Creating Account...</span>
                  </div>
                ) : (
                  <span className="relative flex items-center justify-center">
                    Create Account
                  </span>
                )}
              </motion.button>
            </form>

            {/* Enhanced Sign In Link */}
            <p className="mt-8 text-center text-gray-600 text-sm">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 focus:outline-none transition-all"
              >
                Sign In
              </Link>
            </p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default SignUp;