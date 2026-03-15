import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { courses as coursesApi } from '../services/api';
import {
  FaBookOpen,
  FaGraduationCap,
  FaClock,
  FaUsers,
  FaSearch,
  FaFilter,
  FaSort,
  FaPlus,
  FaEdit,
  FaTrash,
  FaEye,
  FaUniversity,
  FaLaptopCode,
  FaHeartbeat,
  FaChartBar,
  FaCertificate
} from 'react-icons/fa';

const normalizeCourse = (course) => ({
  ...course,
  students_count: typeof course.students_count === 'number' ? course.students_count : 0,
  instructor: course.instructor || 'TBA',
  schedule: course.schedule || 'Schedule TBA',
  is_active: typeof course.is_active === 'boolean' ? course.is_active : true,
});

const CourseList = () => {
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [sortBy, setSortBy] = useState('course_name');

  // Fallback data if backend API is unavailable
  const mockCourses = [
    // Computer Science Department
    {
      id: 1,
      course_code: 'CS101',
      course_name: 'Bachelor of Science in Computer Science',
      department: 'Computer Studies',
      description: 'Comprehensive program covering algorithms, programming, and software development',
      duration_years: 4,
      total_credits: 142,
      degree_level: 'bachelor',
      is_active: true,
      students_count: 245,
      instructor: 'Dr. Sarah Johnson',
      schedule: 'Mon-Wed-Fri, 9:00 AM - 5:00 PM'
    },
    {
      id: 2,
      course_code: 'IT101',
      course_name: 'Bachelor of Science in Information Technology',
      department: 'Computer Studies',
      description: 'Focus on IT infrastructure, networking, and system administration',
      duration_years: 4,
      total_credits: 138,
      degree_level: 'bachelor',
      is_active: true,
      students_count: 189,
      instructor: 'Dr. Michael Chen',
      schedule: 'Mon-Wed-Fri, 10:00 AM - 6:00 PM'
    },
    {
      id: 3,
      course_code: 'IS101',
      course_name: 'Bachelor of Science in Information Systems',
      department: 'Computer Studies',
      description: 'Integration of business processes and information technology',
      duration_years: 4,
      total_credits: 136,
      degree_level: 'bachelor',
      is_active: true,
      students_count: 156,
      instructor: 'Dr. Emily Davis',
      schedule: 'Tue-Thu, 8:00 AM - 4:00 PM'
    },
    // Engineering Department
    {
      id: 4,
      course_code: 'CE101',
      course_name: 'Bachelor of Science in Computer Engineering',
      department: 'Engineering',
      description: 'Hardware and software integration, embedded systems',
      duration_years: 5,
      total_credits: 165,
      degree_level: 'bachelor',
      is_active: true,
      students_count: 134,
      instructor: 'Dr. Robert Wilson',
      schedule: 'Mon-Wed-Fri, 8:00 AM - 6:00 PM'
    },
    {
      id: 5,
      course_code: 'EE101',
      course_name: 'Bachelor of Science in Electrical Engineering',
      department: 'Engineering',
      description: 'Power systems, electronics, and electrical design',
      duration_years: 5,
      total_credits: 168,
      degree_level: 'bachelor',
      is_active: true,
      students_count: 112,
      instructor: 'Dr. Lisa Anderson',
      schedule: 'Mon-Wed-Fri, 9:00 AM - 5:00 PM'
    },
    // Business Department
    {
      id: 6,
      course_code: 'BSBA101',
      course_name: 'Bachelor of Science in Business Administration',
      department: 'Business',
      description: 'Management, marketing, and business operations',
      duration_years: 4,
      total_credits: 132,
      degree_level: 'bachelor',
      is_active: true,
      students_count: 198,
      instructor: 'Dr. James Taylor',
      schedule: 'Mon-Wed-Fri, 9:00 AM - 5:00 PM'
    },
    // Health Sciences
    {
      id: 7,
      course_code: 'NURS101',
      course_name: 'Bachelor of Science in Nursing',
      department: 'Health Sciences',
      description: 'Patient care, clinical practice, and healthcare management',
      duration_years: 4,
      total_credits: 155,
      degree_level: 'bachelor',
      is_active: true,
      students_count: 167,
      instructor: 'Dr. Patricia Brown',
      schedule: 'Mon-Fri, 7:00 AM - 3:00 PM'
    },
    // Arts and Sciences
    {
      id: 8,
      course_code: 'PSY101',
      course_name: 'Bachelor of Science in Psychology',
      department: 'Arts and Sciences',
      description: 'Human behavior, mental processes, and counseling',
      duration_years: 4,
      total_credits: 130,
      degree_level: 'bachelor',
      is_active: true,
      students_count: 98,
      instructor: 'Dr. Jennifer Martinez',
      schedule: 'Tue-Thu, 10:00 AM - 2:00 PM'
    },
    // Diploma Programs
    {
      id: 9,
      course_code: 'DIT101',
      course_name: 'Diploma in Information Technology',
      department: 'Computer Studies',
      description: 'Practical IT skills for immediate employment',
      duration_years: 2,
      total_credits: 72,
      degree_level: 'diploma',
      is_active: true,
      students_count: 76,
      instructor: 'Dr. David Lee',
      schedule: 'Mon-Wed-Fri, 6:00 PM - 10:00 PM'
    },
    // Master's Programs
    {
      id: 10,
      course_code: 'MCS101',
      course_name: 'Master of Computer Science',
      department: 'Computer Studies',
      description: 'Advanced computer science concepts and research',
      duration_years: 2,
      total_credits: 42,
      degree_level: 'master',
      is_active: true,
      students_count: 45,
      instructor: 'Dr. Amanda White',
      schedule: 'Mon-Wed, 6:00 PM - 9:00 PM'
    },
    // Certificate Programs
    {
      id: 11,
      course_code: 'CWD101',
      course_name: 'Certificate in Web Development',
      department: 'Computer Studies',
      description: 'Frontend and backend web development',
      duration_years: 1,
      total_credits: 36,
      degree_level: 'certificate',
      is_active: true,
      students_count: 54,
      instructor: 'Dr. Kevin Rodriguez',
      schedule: 'Sat-Sun, 9:00 AM - 5:00 PM'
    }
  ];

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);

      try {
        const response = await coursesApi.getAll();
        const payload = response.data;
        const apiCourses = Array.isArray(payload?.data)
          ? payload.data
          : Array.isArray(payload)
            ? payload
            : [];

        const normalizedCourses = apiCourses.map(normalizeCourse);
        setCourses(normalizedCourses);
        setFilteredCourses(normalizedCourses);
      } catch (error) {
        console.error('Failed to fetch courses from backend API. Falling back to local list.', error);
        setCourses(mockCourses);
        setFilteredCourses(mockCourses);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  useEffect(() => {
    let filtered = courses;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(course =>
        course.course_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.course_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by department
    if (selectedDepartment !== 'all') {
      filtered = filtered.filter(course => course.department === selectedDepartment);
    }

    // Filter by degree level
    if (selectedLevel !== 'all') {
      filtered = filtered.filter(course => course.degree_level === selectedLevel);
    }

    // Sort
    filtered.sort((a, b) => {
      if (sortBy === 'course_name') {
        return a.course_name.localeCompare(b.course_name);
      } else if (sortBy === 'department') {
        return a.department.localeCompare(b.department);
      } else if (sortBy === 'students_count') {
        return b.students_count - a.students_count;
      }
      return 0;
    });

    setFilteredCourses(filtered);
  }, [courses, searchTerm, selectedDepartment, selectedLevel, sortBy]);

  const departments = ['all', ...new Set(courses.map(c => c.department))];
  const levels = ['all', ...new Set(courses.map(c => c.degree_level))];
  const sortOptions = [
    { value: 'course_name', label: 'Course Name' },
    { value: 'department', label: 'Department' },
    { value: 'students_count', label: 'Student Count' }
  ];

  const getDepartmentColor = (department) => {
    const colors = {
      'Computer Studies': 'from-blue-500 to-blue-600',
      'Engineering': 'from-orange-500 to-orange-600',
      'Business': 'from-green-500 to-green-600',
      'Health Sciences': 'from-red-500 to-red-600',
      'Arts and Sciences': 'from-purple-500 to-purple-600'
    };
    return colors[department] || 'from-gray-500 to-gray-600';
  };

  const getLevelIcon = (level) => {
    const icons = {
      'bachelor': FaGraduationCap,
      'master': FaUniversity,
      'diploma': FaCertificate,
      'certificate': FaCertificate
    };
    return icons[level] || FaBookOpen;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        {/* Background Pattern */}
        <div className="fixed inset-0 opacity-10">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400/5 via-purple-400/5 to-pink-400/5"></div>
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.08'%3E%3Ccircle cx='20' cy='20' r='2'/%3E%3Ccircle cx='60' cy='20' r='2'/%3E%3Ccircle cx='20' cy='60' r='2'/%3E%3Ccircle cx='60' cy='60' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 text-center"
        >
          {/* Logo with Animation */}
          <motion.div
            animate={{ 
              rotate: [0, 360],
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              rotate: { duration: 3, repeat: Infinity, ease: "linear" },
              scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
            }}
            className="mb-8"
          >
            <img 
              src="/umtc.png" 
              alt="UMTC Logo" 
              className="w-32 h-32 mx-auto object-contain"
            />
          </motion.div>

          {/* Loading Text */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="space-y-4"
          >
            <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              UMTC Course Catalog
            </h1>
            <p className="text-xl text-gray-600 max-w-md mx-auto">
              Loading amazing courses for you...
            </p>
            
            {/* Loading Dots */}
            <div className="flex items-center justify-center space-x-2 mt-6">
              {[0, 1, 2].map((dot) => (
                <motion.div
                  key={dot}
                  animate={{ 
                    scale: [1, 1.5, 1],
                    opacity: [0.5, 1, 0.5]
                  }}
                  transition={{ 
                    duration: 1.5,
                    repeat: Infinity,
                    delay: dot * 0.2
                  }}
                  className="w-3 h-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full"
                />
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Background Pattern */}
      <div className="fixed inset-0 opacity-10">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-400/5 via-purple-400/5 to-pink-400/5"></div>
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.08'%3E%3Ccircle cx='20' cy='20' r='2'/%3E%3Ccircle cx='60' cy='20' r='2'/%3E%3Ccircle cx='20' cy='60' r='2'/%3E%3Ccircle cx='60' cy='60' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
      </div>

      <div className="relative z-10 container mx-auto px-3 sm:px-4 md:px-6 py-6 sm:py-8 md:py-10 max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-8"
        >
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-3 sm:mb-4">
              Course Catalog
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
              Explore our comprehensive range of academic programs
            </p>
          </div>

          {/* Enhanced Filters and Search */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-8"
          >
            <div className="bg-white/98 backdrop-blur-2xl rounded-3xl shadow-2xl p-4 sm:p-6 md:p-8 border border-white/40 relative overflow-hidden">
              {/* Background Effects */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5"></div>
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-pink-400/10 to-orange-400/10 rounded-full blur-2xl"></div>
              
              <div className="relative z-10">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
                  <div className="flex items-center space-x-3 min-w-0">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <FaSearch className="w-6 h-6 text-white" />
                    </div>
                    <div className="min-w-0">
                      <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 truncate">Course Search & Filters</h2>
                      <p className="text-sm text-gray-600">Find your perfect course with powerful search tools</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span>{filteredCourses.length} Results</span>
                    </div>
                  </div>
                </div>

                {/* Main Search Bar */}
                <div className="mb-8">
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl"></div>
                    <div className="relative bg-gradient-to-r from-gray-50 to-gray-100 border-2 border-gray-200 rounded-2xl p-3 sm:p-4 hover:border-blue-400 transition-all duration-300 focus-within:border-blue-500 focus-within:shadow-xl">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                        <div className="flex items-center space-x-3 self-start sm:self-auto">
                          <FaSearch className="w-6 h-6 text-blue-500" />
                          <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></div>
                        </div>
                        <input
                          type="text"
                          placeholder="Search courses by name, code, instructor, or description..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full flex-1 bg-transparent text-gray-900 placeholder-gray-500 text-base sm:text-lg font-medium outline-none"
                        />
                        {searchTerm && (
                          <button
                            onClick={() => setSearchTerm('')}
                            className="flex items-center space-x-2 bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded-xl transition-all duration-200"
                          >
                            <span className="text-sm font-medium">Clear</span>
                            <span className="text-lg">×</span>
                          </button>
                        )}
                        <div className="w-full sm:w-auto flex items-center justify-end sm:justify-start space-x-2">
                          <button className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg transition-all duration-300 flex items-center justify-center space-x-2">
                            <FaSearch className="w-4 h-4" />
                            <span>Search</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  {searchTerm && (
                    <div className="mt-3 flex items-center space-x-2 text-sm text-blue-600">
                      <FaSearch className="w-4 h-4" />
                      <span>Searching for "{searchTerm}"</span>
                    </div>
                  )}
                </div>

                {/* Filter Controls */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
                  {/* Department Filter */}
                  <div className="relative group">
                    <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center space-x-2">
                      <FaFilter className="w-4 h-4 text-blue-500" />
                      <span>Department</span>
                    </label>
                    <div className="relative">
                      <select
                        value={selectedDepartment}
                        onChange={(e) => setSelectedDepartment(e.target.value)}
                        className="w-full bg-gradient-to-r from-gray-50 to-gray-100 border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-900 font-medium hover:border-blue-400 focus:border-blue-500 focus:shadow-lg transition-all duration-300 appearance-none cursor-pointer"
                      >
                        {departments.map(dept => (
                          <option key={dept} value={dept}>
                            {dept === 'all' ? '🏫 All Departments' : `📚 ${dept}`}
                          </option>
                        ))}
                      </select>
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                        <FaSort className="w-5 h-5 text-gray-400" />
                      </div>
                    </div>
                  </div>

                  {/* Degree Level Filter */}
                  <div className="relative group">
                    <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center space-x-2">
                      <FaGraduationCap className="w-4 h-4 text-purple-500" />
                      <span>Degree Level</span>
                    </label>
                    <div className="relative">
                      <select
                        value={selectedLevel}
                        onChange={(e) => setSelectedLevel(e.target.value)}
                        className="w-full bg-gradient-to-r from-gray-50 to-gray-100 border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-900 font-medium hover:border-purple-400 focus:border-purple-500 focus:shadow-lg transition-all duration-300 appearance-none cursor-pointer"
                      >
                        {levels.map(level => (
                          <option key={level} value={level}>
                            {level === 'all' ? '🎓 All Levels' : `🎯 ${level.charAt(0).toUpperCase() + level.slice(1)}`}
                          </option>
                        ))}
                      </select>
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                        <FaSort className="w-5 h-5 text-gray-400" />
                      </div>
                    </div>
                  </div>

                  {/* Sort Options */}
                  <div className="relative group">
                    <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center space-x-2">
                      <FaSort className="w-4 h-4 text-green-500" />
                      <span>Sort By</span>
                    </label>
                    <div className="relative">
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="w-full bg-gradient-to-r from-gray-50 to-gray-100 border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-900 font-medium hover:border-green-400 focus:border-green-500 focus:shadow-lg transition-all duration-300 appearance-none cursor-pointer"
                      >
                        {sortOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            📊 {option.label}
                          </option>
                        ))}
                      </select>
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                        <FaSort className="w-5 h-5 text-gray-400" />
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="relative group">
                    <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center space-x-2">
                      <FaChartBar className="w-4 h-4 text-orange-500" />
                      <span>Quick Actions</span>
                    </label>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setSearchTerm('');
                          setSelectedDepartment('all');
                          setSelectedLevel('all');
                        }}
                        className="flex-1 bg-gradient-to-r from-red-500 to-pink-600 text-white px-4 py-3 rounded-xl font-medium hover:shadow-lg transition-all duration-300 flex items-center justify-center space-x-2"
                      >
                        <span className="text-sm">Reset</span>
                      </button>
                      <button className="flex-1 bg-gradient-to-r from-gray-600 to-gray-700 text-white px-4 py-3 rounded-xl font-medium hover:shadow-lg transition-all duration-300 flex items-center justify-center space-x-2">
                        <span className="text-sm">Export</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Active Filters Display */}
                {(searchTerm || selectedDepartment !== 'all' || selectedLevel !== 'all') && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-2xl"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3 min-w-0">
                        <div className="flex items-center space-x-2 text-blue-800 font-bold">
                          <FaFilter className="w-4 h-4" />
                          <span>Active Filters:</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 min-w-0">
                          {searchTerm && (
                            <span className="bg-white text-blue-800 px-3 py-1 rounded-full text-sm font-medium border border-blue-300 flex items-center space-x-1">
                              <FaSearch className="w-3 h-3" />
                              <span>{searchTerm}</span>
                            </span>
                          )}
                          {selectedDepartment !== 'all' && (
                            <span className="bg-white text-purple-800 px-3 py-1 rounded-full text-sm font-medium border border-purple-300 flex items-center space-x-1">
                              <FaFilter className="w-3 h-3" />
                              <span>{selectedDepartment}</span>
                            </span>
                          )}
                          {selectedLevel !== 'all' && (
                            <span className="bg-white text-green-800 px-3 py-1 rounded-full text-sm font-medium border border-green-300 flex items-center space-x-1">
                              <FaGraduationCap className="w-3 h-3" />
                              <span>{selectedLevel}</span>
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setSearchTerm('');
                          setSelectedDepartment('all');
                          setSelectedLevel('all');
                        }}
                        className="self-start lg:self-auto bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 flex items-center space-x-2"
                      >
                        <span>Clear All</span>
                        <span>×</span>
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* Search Tips */}
                {!searchTerm && selectedDepartment === 'all' && selectedLevel === 'all' && (
                  <div className="mt-6 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-2xl">
                    <div className="flex items-center space-x-3 text-yellow-800">
                      <FaSearch className="w-5 h-5" />
                      <div>
                        <p className="font-bold">Pro Tips:</p>
                        <p className="text-sm">Try searching for "Computer", "Engineering", or "Business" to find relevant courses</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6 mb-8"
        >
          <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl p-5 sm:p-6 border border-white/30 text-center">
            <FaBookOpen className="w-8 h-8 text-blue-600 mx-auto mb-3" />
            <div className="text-3xl font-bold text-gray-900">{courses.length}</div>
            <div className="text-sm text-gray-600">Total Courses</div>
          </div>
          <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl p-5 sm:p-6 border border-white/30 text-center">
            <FaUsers className="w-8 h-8 text-green-600 mx-auto mb-3" />
            <div className="text-3xl font-bold text-gray-900">
              {filteredCourses.reduce((sum, course) => sum + course.students_count, 0)}
            </div>
            <div className="text-sm text-gray-600">Total Students</div>
          </div>
          <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl p-5 sm:p-6 border border-white/30 text-center">
            <FaUniversity className="w-8 h-8 text-purple-600 mx-auto mb-3" />
            <div className="text-3xl font-bold text-gray-900">
              {new Set(courses.map(c => c.department)).size}
            </div>
            <div className="text-sm text-gray-600">Departments</div>
          </div>
          <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl p-5 sm:p-6 border border-white/30 text-center">
            <FaHeartbeat className="w-8 h-8 text-orange-600 mx-auto mb-3" />
            <div className="text-3xl font-bold text-gray-900">
              {courses.filter(c => c.is_active).length}
            </div>
            <div className="text-sm text-gray-600">Active Courses</div>
          </div>
        </motion.div>

        {/* Course Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          <AnimatePresence>
            {filteredCourses.map((course, index) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -8, scale: 1.03 }}
                className="group"
              >
                <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-white/30 hover:shadow-2xl transition-all duration-300 h-full">
                  {/* Course Header */}
                  <div className={`bg-gradient-to-r ${getDepartmentColor(course.department)} text-white p-4 rounded-t-2xl`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold">
                          {course.course_code}
                        </span>
                        <span className="text-xs">•</span>
                        <span className="text-xs">{course.degree_level.toUpperCase()}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {course.is_active && (
                          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        )}
                        <FaBookOpen className="w-5 h-5" />
                      </div>
                    </div>
                    <h3 className="text-lg font-bold mb-2 line-clamp-2">{course.course_name}</h3>
                  </div>

                  {/* Course Body */}
                  <div className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                      <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-2">
                          <FaClock className="w-4 h-4" />
                          <span className="font-medium">{course.duration_years} years</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <FaChartBar className="w-4 h-4" />
                          <span className="font-medium">{course.total_credits} credits</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="bg-white/20 px-2 py-1 rounded text-xs">
                          {course.department}
                        </span>
                        {getLevelIcon(course.degree_level)}
                      </div>
                    </div>

                    <p className="text-gray-700 text-sm mb-4 line-clamp-3 leading-relaxed">{course.description}</p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center space-x-3 text-sm text-gray-600">
                        <FaUsers className="w-4 h-4 text-blue-500" />
                        <div>
                          <span className="font-semibold text-gray-800">{course.students_count}</span>
                          <span className="text-gray-500"> students enrolled</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 text-sm text-gray-600">
                        <FaLaptopCode className="w-4 h-4 text-green-500" />
                        <span className="font-medium">{course.department}</span>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-gray-200">
                      <div className="flex flex-col items-start gap-1 text-xs text-gray-500 mb-2">
                        <div className="flex items-center space-x-2 min-w-0">
                          <span className="font-medium">Instructor:</span>
                          <span className="truncate">{course.instructor}</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-start gap-1 text-xs text-gray-500">
                        <div className="flex items-center space-x-2 min-w-0">
                          <span className="font-medium">Schedule:</span>
                          <span className="truncate">{course.schedule}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Course Actions */}
                  <div className="bg-gray-50 px-4 py-3 rounded-b-2xl border-t border-gray-200">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <button className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-3 py-2 rounded-lg transition-all duration-200">
                          <FaEye className="w-4 h-4" />
                          <span className="text-sm font-medium">View</span>
                        </button>
                        <button className="flex items-center space-x-2 text-green-600 hover:text-green-800 hover:bg-green-50 px-3 py-2 rounded-lg transition-all duration-200">
                          <FaEdit className="w-4 h-4" />
                          <span className="text-sm font-medium">Edit</span>
                        </button>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <button className="flex items-center space-x-2 text-orange-600 hover:text-orange-800 hover:bg-orange-50 px-3 py-2 rounded-lg transition-all duration-200">
                          <FaPlus className="w-4 h-4" />
                          <span className="text-sm font-medium">Enroll</span>
                        </button>
                        <button className="flex items-center space-x-2 text-red-600 hover:text-red-800 hover:bg-red-50 px-3 py-2 rounded-lg transition-all duration-200">
                          <FaTrash className="w-4 h-4" />
                          <span className="text-sm font-medium">Delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default CourseList;
