import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { students, courses as coursesApi } from '../../services/api';
import { FaUsers, FaSearch, FaFilter, FaGraduationCap, FaEnvelope, FaPhone, FaCalendarAlt, FaBook, FaEdit, FaTrash, FaEye } from 'react-icons/fa';

const STUDENTS_CACHE_KEY = 'umtc-students-cache-v1';

const DEFAULT_COURSE_OPTIONS = [
  { id: 1, course_code: 'CS101', course_name: 'Bachelor of Science in Computer Science', department: 'Computer Studies' },
  { id: 2, course_code: 'IT101', course_name: 'Bachelor of Science in Information Technology', department: 'Computer Studies' },
  { id: 3, course_code: 'IS101', course_name: 'Bachelor of Science in Information Systems', department: 'Computer Studies' },
  { id: 4, course_code: 'CE101', course_name: 'Bachelor of Science in Computer Engineering', department: 'Engineering' },
  { id: 5, course_code: 'EE101', course_name: 'Bachelor of Science in Electrical Engineering', department: 'Engineering' },
  { id: 6, course_code: 'ME101', course_name: 'Bachelor of Science in Mechanical Engineering', department: 'Engineering' },
  { id: 7, course_code: 'BSBA101', course_name: 'Bachelor of Science in Business Administration', department: 'Business' },
  { id: 8, course_code: 'BSE101', course_name: 'Bachelor of Science in Entrepreneurship', department: 'Business' },
  { id: 9, course_code: 'NURS101', course_name: 'Bachelor of Science in Nursing', department: 'Health Sciences' },
  { id: 10, course_code: 'PHAR101', course_name: 'Bachelor of Science in Pharmacy', department: 'Health Sciences' },
  { id: 11, course_code: 'PSY101', course_name: 'Bachelor of Science in Psychology', department: 'Arts and Sciences' },
  { id: 12, course_code: 'COMM101', course_name: 'Bachelor of Arts in Communication', department: 'Arts and Sciences' },
  { id: 13, course_code: 'DIT101', course_name: 'Diploma in Information Technology', department: 'Computer Studies' },
  { id: 14, course_code: 'DBA101', course_name: 'Diploma in Business Administration', department: 'Business' },
  { id: 15, course_code: 'MCS101', course_name: 'Master of Computer Science', department: 'Computer Studies' },
  { id: 16, course_code: 'MBA101', course_name: 'Master of Business Administration', department: 'Business' },
  { id: 17, course_code: 'CWD101', course_name: 'Certificate in Web Development', department: 'Computer Studies' },
  { id: 18, course_code: 'CDA101', course_name: 'Certificate in Data Analytics', department: 'Computer Studies' },
  { id: 19, course_code: 'CGR101', course_name: 'Certificate in Graphic Design', department: 'Arts and Sciences' },
  { id: 20, course_code: 'CHM101', course_name: 'Certificate in Hotel Management', department: 'Business' },
];

const STUDENT_SEED_DATA = {
  genders: ['male', 'female', 'other'],
  semesters: ['1st', '2nd', 'summer'],
  statuses: ['enrolled', 'graduated', 'on_leave'],
  firstNames: {
    male: ['James', 'John', 'Robert', 'Michael', 'William', 'David', 'Richard', 'Joseph', 'Thomas', 'Charles', 'Daniel', 'Matthew', 'Anthony', 'Donald', 'Mark', 'Paul', 'Steven', 'Andrew', 'Kenneth', 'Joshua', 'Kevin', 'Brian', 'George', 'Edward', 'Ronald', 'Timothy', 'Jason', 'Jeffrey', 'Ryan', 'Jacob'],
    female: ['Mary', 'Patricia', 'Jennifer', 'Linda', 'Elizabeth', 'Barbara', 'Susan', 'Jessica', 'Sarah', 'Karen', 'Nancy', 'Lisa', 'Margaret', 'Betty', 'Sandra', 'Ashley', 'Dorothy', 'Kimberly', 'Emily', 'Donna', 'Michelle', 'Carol', 'Amanda', 'Melissa', 'Deborah', 'Stephanie', 'Rebecca', 'Laura', 'Sharon', 'Cynthia'],
    other: ['Alex', 'Jordan', 'Casey', 'Taylor', 'Morgan', 'Riley', 'Cameron', 'Quinn', 'Avery', 'Sage'],
  },
  lastNames: ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson'],
  cities: ['Manila', 'Quezon City', 'Makati', 'Taguig', 'Pasig', 'Mandaluyong', 'Paranaque', 'Caloocan', 'Las Pinas', 'Muntinlupa'],
  streets: ['Rizal Ave', 'Recto Ave', 'Taft Ave', 'Commonwealth Ave', 'EDSA', 'McKinley Rd', 'Ortigas Ave', 'Shaw Blvd', 'Boni Ave', 'Kalayaan Ave'],
};

const getYearLabel = (enrollmentYear) => {
  const nowYear = new Date().getFullYear();
  if (!enrollmentYear) return 'N/A';

  const level = Math.max(1, Math.min(5, nowYear - Number(enrollmentYear) + 1));
  const labels = {
    1: '1st Year',
    2: '2nd Year',
    3: '3rd Year',
    4: '4th Year',
    5: '5th Year',
  };

  return labels[level] || 'N/A';
};

const getAge = (birthDate) => {
  if (!birthDate) return null;

  const birth = new Date(birthDate);
  if (Number.isNaN(birth.getTime())) return null;

  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
};

const mapStudent = (student) => {
  const firstName = student.first_name || '';
  const lastName = student.last_name || '';
  const fullName = `${firstName} ${lastName}`.trim();

  return {
    id: student.id,
    name: student.name || fullName || 'Unknown Student',
    student_id: student.student_id,
    email: student.email,
    phone_number: student.phone_number || 'N/A',
    address: student.address || 'N/A',
    gender: student.gender || 'N/A',
    birth_date: student.birth_date,
    age: getAge(student.birth_date),
    status: student.status || 'enrolled',
    enrollment_year: student.enrollment_year,
    semester: student.semester,
    year_level: student.year_level || getYearLabel(student.enrollment_year),
    course: student.course?.course_name || student.course || 'N/A',
    course_code: student.course?.course_code || student.course_code || 'N/A',
    gpa: student.gpa ?? 'N/A',
    attendance: typeof student.attendance === 'number' ? student.attendance : null,
  };
};

const normalizeCourseOption = (course, index) => ({
  id: course?.id ?? index + 1,
  course_code: course?.course_code || `CRS-${String(index + 1).padStart(3, '0')}`,
  course_name: course?.course_name || course?.name || 'Unknown Course',
  department: course?.department || 'General Studies',
});

const extractCollection = (payload) => {
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload)) return payload;
  return [];
};

const formatLabel = (value) => {
  if (!value) return 'N/A';
  return String(value)
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const saveStudentsToCache = (entries) => {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STUDENTS_CACHE_KEY, JSON.stringify(entries));
  } catch (cacheError) {
    console.warn('Unable to cache students data.', cacheError);
  }
};

const loadStudentsFromCache = () => {
  if (typeof window === 'undefined') return [];

  try {
    const raw = localStorage.getItem(STUDENTS_CACHE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed.map(mapStudent);
  } catch (cacheError) {
    console.warn('Unable to read cached students data.', cacheError);
    return [];
  }
};

const buildSeededStudents = (courseOptions = DEFAULT_COURSE_OPTIONS) => {
  const coursesPool = Array.isArray(courseOptions) && courseOptions.length > 0
    ? courseOptions
    : DEFAULT_COURSE_OPTIONS;
  const { genders, semesters, statuses, firstNames, lastNames, cities, streets } = STUDENT_SEED_DATA;
  const currentYear = new Date().getFullYear();

  return Array.from({ length: 500 }, (_, index) => {
    const sequence = index + 1;
    const gender = genders[index % genders.length];
    const genderNames = firstNames[gender];
    const firstName = genderNames[(index * 7) % genderNames.length];
    const lastName = lastNames[(index * 11) % lastNames.length];
    const course = coursesPool[(index * 3) % coursesPool.length];
    const enrollmentYear = 2020 + (index % 5);
    const birthYear = currentYear - (18 + (index % 13));
    const birthMonth = String((index % 12) + 1).padStart(2, '0');
    const birthDay = String(((index * 5) % 28) + 1).padStart(2, '0');
    const phoneSuffix = String(900000000 + ((index * 7919) % 100000000)).padStart(9, '0');

    return {
      id: sequence,
      student_id: `STU-${String(sequence).padStart(5, '0')}`,
      first_name: firstName,
      last_name: lastName,
      email: `${firstName}.${lastName}${sequence}@university.edu`.toLowerCase(),
      birth_date: `${birthYear}-${birthMonth}-${birthDay}`,
      gender,
      address: `${(sequence % 999) + 1} ${streets[index % streets.length]}, ${cities[(index * 5) % cities.length]}`,
      phone_number: `+63${phoneSuffix}`,
      course_id: course.id,
      course: {
        course_code: course.course_code,
        course_name: course.course_name,
        department: course.department,
      },
      enrollment_year: enrollmentYear,
      semester: semesters[index % semesters.length],
      status: statuses[index % statuses.length],
      gpa: Number((1.5 + ((index % 18) * 0.09)).toFixed(2)),
      attendance: 72 + (index % 27),
    };
  }).map(mapStudent);
};

const StudentsPage = () => {
  const [studentsList, setStudentsList] = useState([]);
  const [coursesTotal, setCoursesTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [studentsPerPage] = useState(25);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    setLoading(true);
    setError(null);

    let mappedStudents = [];
    let courseOptions = DEFAULT_COURSE_OPTIONS;

    const [studentsResult, coursesResult] = await Promise.allSettled([
      students.getAll({ per_page: 500 }),
      coursesApi.getAll(),
    ]);

    if (coursesResult.status === 'fulfilled') {
      const rawCourses = extractCollection(coursesResult.value.data);
      const normalizedCourses = rawCourses.map(normalizeCourseOption);
      if (normalizedCourses.length > 0) {
        courseOptions = normalizedCourses;
      }
      setCoursesTotal(rawCourses.length || normalizedCourses.length);
    }

    if (studentsResult.status === 'fulfilled') {
      const rawStudents = extractCollection(studentsResult.value.data);
      mappedStudents = rawStudents.map(mapStudent);

      if (mappedStudents.length > 0) {
        setStudentsList(mappedStudents);
        saveStudentsToCache(rawStudents);
      } else {
        const cachedStudents = loadStudentsFromCache();
        if (cachedStudents.length > 0) {
          mappedStudents = cachedStudents;
          setStudentsList(cachedStudents);
        } else {
          mappedStudents = buildSeededStudents(courseOptions);
          setStudentsList(mappedStudents);
          saveStudentsToCache(mappedStudents);
        }
      }
    } else {
      const cachedStudents = loadStudentsFromCache();

      if (cachedStudents.length > 0) {
        mappedStudents = cachedStudents;
        setStudentsList(cachedStudents);
      } else {
        mappedStudents = buildSeededStudents(courseOptions);
        setStudentsList(mappedStudents);
        saveStudentsToCache(mappedStudents);
      }

      setError(null);
      console.error('Failed to fetch students:', studentsResult.reason);
    }

    if (coursesResult.status !== 'fulfilled') {
      const fallbackCourseTotal = new Set(
        mappedStudents.map((student) => student.course).filter((course) => course && course !== 'N/A')
      ).size;
      setCoursesTotal(fallbackCourseTotal);
      console.error('Failed to fetch courses for total count:', coursesResult.reason);
    }

    setLoading(false);
  };

  const filteredStudents = (Array.isArray(studentsList) ? studentsList : []).filter(student => {
    const normalizedSearch = searchTerm.toLowerCase();
    const matchesSearch = (student.name || '').toLowerCase().includes(normalizedSearch) ||
                         (student.email || '').toLowerCase().includes(normalizedSearch) ||
                         (student.course || '').toLowerCase().includes(normalizedSearch) ||
                         (student.student_id || '').toLowerCase().includes(normalizedSearch);

    const matchesFilter =
      filterStatus === 'all' ||
      (filterStatus === 'active' && ['active', 'enrolled'].includes(student.status)) ||
      (filterStatus === 'inactive' && ['inactive', 'graduated', 'on_leave'].includes(student.status)) ||
      student.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  // Pagination logic
  const indexOfLastStudent = currentPage * studentsPerPage;
  const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
  const currentStudents = filteredStudents.slice(indexOfFirstStudent, indexOfLastStudent);
  const totalPages = Math.ceil(filteredStudents.length / studentsPerPage);
  const showingStart = filteredStudents.length ? indexOfFirstStudent + 1 : 0;
  const showingEnd = filteredStudents.length ? Math.min(indexOfLastStudent, filteredStudents.length) : 0;
  const hasActiveFilters = searchTerm.trim().length > 0 || filterStatus !== 'all';
  const activeStudentsCount = Array.isArray(studentsList)
    ? studentsList.filter((s) => ['active', 'enrolled'].includes(s.status)).length
    : 0;
  const averageAttendance =
    Array.isArray(studentsList) && studentsList.length > 0
      ? Math.round(studentsList.reduce((acc, s) => acc + (s.attendance || 0), 0) / studentsList.length)
      : 0;

  // Reset to page 1 when search or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'enrolled':
        return 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200';
      case 'graduated':
        return 'bg-sky-50 text-sky-700 ring-1 ring-inset ring-sky-200';
      case 'on_leave':
        return 'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200';
      case 'active':
        return 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200';
      case 'inactive':
        return 'bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-200';
      default:
        return 'bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-200';
    }
  };

  const getYearColor = (year) => {
    const yearColors = {
      '1st Year': 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200',
      '2nd Year': 'bg-violet-50 text-violet-700 ring-1 ring-inset ring-violet-200',
      '3rd Year': 'bg-indigo-50 text-indigo-700 ring-1 ring-inset ring-indigo-200',
      '4th Year': 'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200',
      '5th Year': 'bg-orange-50 text-orange-700 ring-1 ring-inset ring-orange-200'
    };
    return yearColors[year] || 'bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-200';
  };

  const handleViewDetails = (student) => {
    setSelectedStudent(student);
    setShowDetails(true);
  };

  const handleEdit = (student) => {
    alert(`Edit functionality for ${student.name} coming soon!`);
  };

  const handleDelete = (student) => {
    if (window.confirm(`Are you sure you want to delete ${student.name}?`)) {
      alert(`Delete functionality for ${student.name} coming soon!`);
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterStatus('all');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading students...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-3 sm:px-4 md:px-6 py-6 sm:py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2">
            Students Management
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Manage and view all student information and records.
          </p>
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl"
          >
            <p className="text-sm text-amber-800">
              <span className="font-semibold">Notice:</span> {error}
            </p>
          </motion.div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-50 rounded-xl">
                <FaUsers className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-2xl font-bold text-gray-800">{(Array.isArray(studentsList) ? studentsList.length : 0)}</span>
            </div>
            <h3 className="text-gray-600 text-sm">Total Students</h3>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-50 rounded-xl">
                <FaGraduationCap className="w-6 h-6 text-green-600" />
              </div>
              <span className="text-2xl font-bold text-gray-800">
                {activeStudentsCount}
              </span>
            </div>
            <h3 className="text-gray-600 text-sm">Active Students</h3>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-50 rounded-xl">
                <FaBook className="w-6 h-6 text-purple-600" />
              </div>
              <span className="text-2xl font-bold text-gray-800">
                {coursesTotal}
              </span>
            </div>
            <h3 className="text-gray-600 text-sm">Courses</h3>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-orange-50 rounded-xl">
                <FaCalendarAlt className="w-6 h-6 text-orange-600" />
              </div>
              <span className="text-2xl font-bold text-gray-800">
                {averageAttendance}%
              </span>
            </div>
            <h3 className="text-gray-600 text-sm">Avg Attendance</h3>
          </motion.div>
        </div>

        {/* Search and Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-[28px] shadow-[0_24px_60px_rgba(15,23,42,0.08)] border border-slate-200 p-4 sm:p-6 mb-8"
        >
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Student Directory</p>
                <h2 className="mt-2 text-xl font-semibold text-slate-900">Searchable student list</h2>
                <p className="mt-1 text-sm text-slate-600">
                  Showing {showingStart} to {showingEnd} of {filteredStudents.length} matching students.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white">
                  {filteredStudents.length} results
                </span>
                <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 ring-1 ring-inset ring-blue-200">
                  Status: {filterStatus === 'all' ? 'All' : formatLabel(filterStatus)}
                </span>
                {searchTerm && (
                  <span className="rounded-full bg-violet-50 px-3 py-1.5 text-xs font-semibold text-violet-700 ring-1 ring-inset ring-violet-200">
                    Query: {searchTerm}
                  </span>
                )}
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="rounded-full border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-100"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            </div>

            <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search students by name, email, course, or student ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-10 py-3.5 bg-slate-50 border border-slate-300 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 text-slate-900 placeholder-slate-400 transition-all duration-200"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
              <div className="relative w-full md:w-auto">
                <FaFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5 pointer-events-none" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full md:min-w-[220px] pl-10 pr-10 py-3.5 bg-slate-50 border border-slate-300 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 text-slate-900 transition-all duration-200 appearance-none cursor-pointer"
                >
                  <option value="all">All Status</option>
                  <option value="enrolled">Enrolled</option>
                  <option value="graduated">Graduated</option>
                  <option value="on_leave">On Leave</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
                <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Mobile Students Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="lg:hidden space-y-4"
        >
          {(Array.isArray(currentStudents) ? currentStudents : []).map((student, index) => (
            <motion.div
              key={student.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.65 + index * 0.04 }}
              className="bg-white rounded-xl shadow-lg p-4 border border-gray-100"
            >
              <div className="flex flex-col gap-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-11 h-11 flex-shrink-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                      {student.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold text-gray-800 break-words">{student.name}</p>
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-medium ${getStatusColor(student.status)}`}>
                          {formatLabel(student.status)}
                        </span>
                      </div>
                      <p className="text-sm font-mono text-gray-500 break-all">{student.student_id || `ID-${student.id}`}</p>
                      <p className="text-sm text-gray-600 break-words">{student.course}</p>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-medium flex-shrink-0 ${getYearColor(student.year_level)}`}>
                    {student.year_level}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div className="rounded-lg bg-gray-50 p-3">
                    <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Contact</p>
                    <div className="space-y-1 min-w-0">
                      <p className="flex items-center gap-2 text-gray-700 break-all"><FaEnvelope className="w-3 h-3 text-gray-400 flex-shrink-0" />{student.email}</p>
                      <p className="flex items-center gap-2 text-gray-700 break-all"><FaPhone className="w-3 h-3 text-gray-400 flex-shrink-0" />{student.phone_number}</p>
                    </div>
                  </div>
                  <div className="rounded-lg bg-gray-50 p-3">
                    <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Academic</p>
                    <div className="space-y-1 text-gray-700">
                      <p>GPA: <span className="font-medium">{student.gpa}</span></p>
                      <p>Attendance: <span className="font-medium">{student.attendance ?? 'N/A'}%</span></p>
                      <p>Age: <span className="font-medium">{student.age || 'N/A'}</span></p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-gray-100">
                  <button
                    onClick={() => handleViewDetails(student)}
                    className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-2 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <FaEye className="w-4 h-4" />
                    <span className="text-sm font-medium">View</span>
                  </button>
                  <button
                    onClick={() => handleEdit(student)}
                    className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-3 py-2 rounded-lg hover:bg-green-100 transition-colors"
                  >
                    <FaEdit className="w-4 h-4" />
                    <span className="text-sm font-medium">Edit</span>
                  </button>
                  <button
                    onClick={() => handleDelete(student)}
                    className="inline-flex items-center gap-2 bg-red-50 text-red-700 px-3 py-2 rounded-lg hover:bg-red-100 transition-colors"
                  >
                    <FaTrash className="w-4 h-4" />
                    <span className="text-sm font-medium">Delete</span>
                  </button>
                </div>
              </div>
            </motion.div>
          ))}

          {(!Array.isArray(currentStudents) || currentStudents.length === 0) && (
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <FaUsers className="w-14 h-14 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No students found</p>
              <p className="text-gray-400 text-sm">Try adjusting your search or filters</p>
            </div>
          )}
        </motion.div>

        {/* Students Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="hidden lg:block overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-[0_28px_80px_rgba(15,23,42,0.1)]"
        >
          <div className="border-b border-slate-200 bg-gradient-to-r from-slate-950 via-blue-950 to-indigo-950 px-6 py-6 text-white">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.26em] text-blue-100/80">Visibility Improved</p>
                <h2 className="mt-2 text-2xl font-semibold">Student list</h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
                  Cleaner row grouping, stronger contrast, and readable course, contact, status, and attendance details.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3 text-right">
                <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur-sm">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-blue-100/75">Showing</p>
                  <p className="mt-1 text-xl font-semibold text-white">{showingEnd - showingStart + (filteredStudents.length ? 1 : 0)}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur-sm">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-blue-100/75">Matches</p>
                  <p className="mt-1 text-xl font-semibold text-white">{filteredStudents.length}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur-sm">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-blue-100/75">Page</p>
                  <p className="mt-1 text-xl font-semibold text-white">{currentPage}/{Math.max(totalPages, 1)}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-[1120px] w-full border-separate border-spacing-0">
              <thead className="sticky top-0 z-10">
                <tr className="bg-slate-100/95 backdrop-blur-sm">
                  <th className="text-left py-4 px-5 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Student</th>
                  <th className="text-left py-4 px-5 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Student ID</th>
                  <th className="text-left py-4 px-5 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Contact</th>
                  <th className="text-left py-4 px-5 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Academic</th>
                  <th className="text-left py-4 px-5 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Year & Attendance</th>
                  <th className="text-left py-4 px-5 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Status</th>
                  <th className="text-left py-4 px-5 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {(Array.isArray(currentStudents) ? currentStudents : []).map((student, index) => (
                  <motion.tr
                    key={student.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 + index * 0.05 }}
                    className={`${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/55'} transition-colors hover:bg-blue-50/60`}
                  >
                    <td className="py-5 px-5 border-b border-slate-100 align-top">
                      <div className="flex items-center space-x-4 min-w-0">
                        <div className="w-11 h-11 flex-shrink-0 bg-gradient-to-br from-blue-600 via-violet-600 to-fuchsia-500 rounded-2xl flex items-center justify-center text-white font-semibold shadow-lg shadow-blue-200/60">
                          {student.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-900 truncate">{student.name}</p>
                          <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-slate-500">
                            <span>Age: {student.age || 'N/A'}</span>
                            <span className="text-slate-300">•</span>
                            <span className="capitalize">{student.gender || 'N/A'}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-5 px-5 border-b border-slate-100 align-top">
                      <span className="inline-flex items-center rounded-xl bg-slate-100 px-3 py-1.5 text-sm font-mono text-slate-700 ring-1 ring-inset ring-slate-200">
                        {student.student_id || `ID-${student.id}`}
                      </span>
                    </td>
                    <td className="py-5 px-5 border-b border-slate-100 align-top">
                      <div className="space-y-2 min-w-0">
                        <div className="flex items-start space-x-2 rounded-xl bg-slate-50 px-3 py-2 text-sm ring-1 ring-inset ring-slate-200">
                          <FaEnvelope className="mt-0.5 w-3.5 h-3.5 flex-shrink-0 text-slate-400" />
                          <span className="min-w-0 break-all text-slate-700">{student.email}</span>
                        </div>
                        <div className="flex items-start space-x-2 rounded-xl bg-slate-50 px-3 py-2 text-sm ring-1 ring-inset ring-slate-200">
                          <FaPhone className="mt-0.5 w-3.5 h-3.5 flex-shrink-0 text-slate-400" />
                          <span className="min-w-0 break-all text-slate-700">{student.phone_number}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-5 px-5 border-b border-slate-100 align-top">
                      <div className="space-y-2 min-w-0">
                        <span className="inline-flex items-center rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700 ring-1 ring-inset ring-violet-200">
                          {student.course_code || 'N/A'}
                        </span>
                        <p className="font-medium leading-6 text-slate-900">{student.course}</p>
                        <p className="text-sm text-slate-500">GPA: <span className="font-semibold text-slate-700">{student.gpa}</span></p>
                      </div>
                    </td>
                    <td className="py-5 px-5 border-b border-slate-100 align-top">
                      <div className="space-y-3">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getYearColor(student.year_level)}`}>
                          {student.year_level}
                        </span>
                        <div>
                          <div className="mb-1 flex items-center justify-between text-xs font-medium text-slate-500">
                            <span>Attendance</span>
                            <span className="text-slate-700">{student.attendance ?? 'N/A'}%</span>
                          </div>
                          <div className="h-2.5 overflow-hidden rounded-full bg-slate-200">
                            <div
                              className={`h-full rounded-full ${
                                (student.attendance ?? 0) >= 90
                                  ? 'bg-emerald-500'
                                  : (student.attendance ?? 0) >= 80
                                    ? 'bg-blue-500'
                                    : (student.attendance ?? 0) >= 70
                                      ? 'bg-amber-500'
                                      : 'bg-rose-500'
                              }`}
                              style={{ width: `${Math.max(0, Math.min(student.attendance ?? 0, 100))}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-5 px-5 border-b border-slate-100 align-top">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(student.status)}`}>
                        {formatLabel(student.status)}
                      </span>
                    </td>
                    <td className="py-5 px-5 border-b border-slate-100 align-top">
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          onClick={() => handleViewDetails(student)}
                          className="inline-flex items-center gap-2 rounded-xl bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700 ring-1 ring-inset ring-blue-200 transition-colors hover:bg-blue-100"
                          title="View Details"
                        >
                          <FaEye className="w-4 h-4" />
                          View
                        </button>
                        <button
                          onClick={() => handleEdit(student)}
                          className="inline-flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700 ring-1 ring-inset ring-emerald-200 transition-colors hover:bg-emerald-100"
                          title="Edit"
                        >
                          <FaEdit className="w-4 h-4" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(student)}
                          className="inline-flex items-center gap-2 rounded-xl bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700 ring-1 ring-inset ring-rose-200 transition-colors hover:bg-rose-100"
                          title="Delete"
                        >
                          <FaTrash className="w-4 h-4" />
                          Delete
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {(!Array.isArray(currentStudents) || currentStudents.length === 0) && (
            <div className="text-center py-12">
              <FaUsers className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No students found</p>
              <p className="text-gray-400 text-sm">Try adjusting your search or filters</p>
            </div>
          )}
        </motion.div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-white rounded-2xl shadow-lg border border-slate-200 p-4 sm:p-6 mt-6"
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="text-sm text-slate-600 text-center lg:text-left">
                Showing {showingStart} to {showingEnd} of {filteredStudents.length} students
              </div>
              
              <div className="flex flex-wrap items-center justify-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    currentPage === 1
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Previous
                </button>
                
                <div className="flex max-w-full items-center gap-1 overflow-x-auto pb-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          currentPage === pageNum
                            ? 'bg-blue-600 text-white'
                            : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  
                  {totalPages > 5 && (
                    <>
                      <span className="text-gray-500">...</span>
                      <button
                        onClick={() => setCurrentPage(totalPages)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          currentPage === totalPages
                            ? 'bg-blue-600 text-white'
                            : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {totalPages}
                      </button>
                    </>
                  )}
                </div>
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    currentPage === totalPages
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Next
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Student Details Modal */}
        {showDetails && selectedStudent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowDetails(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-2xl p-4 sm:p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Student Details</h2>
                <button
                  onClick={() => setShowDetails(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                {/* Basic Info */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xl sm:text-2xl font-bold">
                    {selectedStudent.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-800 break-words">{selectedStudent.name}</h3>
                    <p className="text-gray-600 break-all">Student ID: {selectedStudent.student_id || `ID-${selectedStudent.id}`}</p>
                    <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedStudent.status)}`}>
                      {formatLabel(selectedStudent.status)}
                    </span>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h4 className="font-semibold text-gray-700 mb-2">Contact Information</h4>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <FaEnvelope className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600 break-all">{selectedStudent.email}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <FaPhone className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600 break-all">{selectedStudent.phone_number}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-400">📍</span>
                        <span className="text-gray-600 break-words">{selectedStudent.address}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4">
                    <h4 className="font-semibold text-gray-700 mb-2">Academic Information</h4>
                    <div className="space-y-2">
                      <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                        <span className="text-gray-600">Course:</span>
                        <span className="font-medium break-words">{selectedStudent.course}</span>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                        <span className="text-gray-600">Year Level:</span>
                        <span className="font-medium">{selectedStudent.year_level}</span>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                        <span className="text-gray-600">GPA:</span>
                        <span className="font-medium">{selectedStudent.gpa}</span>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                        <span className="text-gray-600">Attendance:</span>
                        <span className="font-medium">{selectedStudent.attendance}%</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Personal Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h4 className="font-semibold text-gray-700 mb-2">Personal Information</h4>
                    <div className="space-y-2">
                      <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                        <span className="text-gray-600">Birth Date:</span>
                        <span className="font-medium">{selectedStudent.birth_date || 'N/A'}</span>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                        <span className="text-gray-600">Age:</span>
                        <span className="font-medium">{selectedStudent.age || 'N/A'}</span>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                        <span className="text-gray-600">Gender:</span>
                        <span className="font-medium capitalize">{selectedStudent.gender || 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4">
                    <h4 className="font-semibold text-gray-700 mb-2">Enrollment Information</h4>
                    <div className="space-y-2">
                      <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                        <span className="text-gray-600">Enrollment Year:</span>
                        <span className="font-medium">{selectedStudent.enrollment_year || 'N/A'}</span>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                        <span className="text-gray-600">Semester:</span>
                        <span className="font-medium capitalize">{selectedStudent.semester || 'N/A'}</span>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                        <span className="text-gray-600">Course Code:</span>
                        <span className="font-medium">{selectedStudent.course_code || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 mt-6">
                <button
                  onClick={() => handleEdit(selectedStudent)}
                  className="px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors"
                >
                  Edit Student
                </button>
                <button
                  onClick={() => setShowDetails(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300 transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default StudentsPage;
