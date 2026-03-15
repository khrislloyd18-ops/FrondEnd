import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { dashboard } from '../../services/api';
import {
  generateSeededSchoolCalendar,
  mergeSchoolCalendarEntries,
  SCHOOL_CALENDAR_END_YEAR,
  SCHOOL_CALENDAR_START_YEAR,
  SCHOOL_CALENDAR_YEARS,
} from '../../data/schoolCalendarSeed';
import { 
  FaCalendarAlt, 
  FaChevronLeft, 
  FaChevronRight,
  FaGraduationCap,
  FaChalkboardTeacher,
  FaCalendarTimes,
  FaCalendarCheck,
  FaSearch
} from 'react-icons/fa';

const formatDayDescription = (entry) => {
  if (entry.day_type === 'holiday') return 'Holiday';
  if (entry.day_type === 'event') return 'School Event';
  if (entry.day_type === 'exam') return 'Examination Day';
  if (entry.day_type === 'break') return 'School Break';
  return `Attendance ${Math.round(entry.attendance_percentage || 0)}%`;
};

const SCHOOL_DAYS_CACHE_KEY = 'umtc-school-days-cache-v2';

const extractCollection = (payload) => {
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload)) return payload;
  return [];
};

const normalizeDateValue = (value) => {
  if (!value) return '';
  if (typeof value === 'string') {
    return value.includes('T') ? value.split('T')[0] : value;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '';
  return parsed.toISOString().split('T')[0];
};

const normalizeSchoolDayEntry = (item) => {
  const dayTypeCandidate = String(item?.day_type || item?.type || 'regular').toLowerCase();
  const allowedDayTypes = new Set(['holiday', 'event', 'exam', 'break', 'regular']);
  const dayType = allowedDayTypes.has(dayTypeCandidate) ? dayTypeCandidate : 'regular';

  const attendanceRaw = Number(item?.attendance_percentage ?? item?.attendance ?? (dayType === 'regular' ? 90 : 0));
  const attendancePercentage = Number.isFinite(attendanceRaw)
    ? Math.max(0, Math.min(100, Math.round(attendanceRaw)))
    : 0;

  const dateValue = normalizeDateValue(item?.date || item?.school_date || item?.attendance_date);
  if (!dateValue) return null;

  const dateObj = new Date(dateValue);
  const dayOfWeek = Number.isNaN(dateObj.getTime())
    ? 'Unknown'
    : dateObj.toLocaleDateString('en-US', { weekday: 'long' });

  return {
    ...item,
    day_type: dayType,
    attendance_percentage: attendancePercentage,
    date: dateValue,
    day_of_week: dayOfWeek,
    description: item?.description || item?.title || formatDayDescription({
      day_type: dayType,
      attendance_percentage: attendancePercentage,
    }),
  };
};

const saveSchoolDaysToCache = (entries) => {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(SCHOOL_DAYS_CACHE_KEY, JSON.stringify(entries));
  } catch (cacheError) {
    console.warn('Unable to cache school calendar data.', cacheError);
  }
};

const loadSchoolDaysFromCache = () => {
  if (typeof window === 'undefined') return [];

  try {
    const raw = localStorage.getItem(SCHOOL_DAYS_CACHE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .map(normalizeSchoolDayEntry)
      .filter(Boolean);
  } catch (cacheError) {
    console.warn('Unable to read cached school calendar data.', cacheError);
    return [];
  }
};

const SchoolDays = () => {
  const today = new Date();
  const defaultYear = Math.min(
    Math.max(today.getFullYear(), SCHOOL_CALENDAR_START_YEAR),
    SCHOOL_CALENDAR_END_YEAR
  );
  const defaultMonth = today.getFullYear() >= SCHOOL_CALENDAR_START_YEAR && today.getFullYear() <= SCHOOL_CALENDAR_END_YEAR
    ? today.getMonth()
    : 0;
  const [schoolDays, setSchoolDays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(defaultMonth);
  const [selectedYear, setSelectedYear] = useState(defaultYear);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchSchoolDays = async () => {
      const seededCalendar = generateSeededSchoolCalendar();

      try {
        setLoading(true);
        setError(null);

        const response = await (async () => {
          try {
            return await dashboard.getSchoolDays();
          } catch (schoolDaysError) {
            return dashboard.getAttendancePatterns();
          }
        })();

        const attendanceData = extractCollection(response.data);

        const mapped = attendanceData
          .map(normalizeSchoolDayEntry)
          .filter(Boolean);

        const mergedCalendar = mergeSchoolCalendarEntries(seededCalendar, mapped);

        setSchoolDays(mergedCalendar);
        saveSchoolDaysToCache(mergedCalendar);
      } catch (err) {
        const cachedSchoolDays = loadSchoolDaysFromCache();

        if (cachedSchoolDays.length > 0) {
          setSchoolDays(mergeSchoolCalendarEntries(seededCalendar, cachedSchoolDays));
          setError(null);
        } else {
          setSchoolDays(seededCalendar);
          setError(null);
        }

        console.error('Failed to fetch school days:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSchoolDays();
  }, []);

  const monthData = schoolDays.filter((day) => {
    const dateObj = new Date(day.date);
    if (Number.isNaN(dateObj.getTime())) return false;
    return dateObj.getMonth() === selectedMonth && dateObj.getFullYear() === selectedYear;
  });
  
  // Filter data based on search
  const filteredDays = monthData.filter(day => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return day.description.toLowerCase().includes(searchLower) ||
           day.day_type.toLowerCase().includes(searchLower);
  });

  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const canGoToPreviousMonth = selectedYear > SCHOOL_CALENDAR_START_YEAR || selectedMonth > 0;
  const canGoToNextMonth = selectedYear < SCHOOL_CALENDAR_END_YEAR || selectedMonth < 11;

  const handlePreviousMonth = () => {
    if (!canGoToPreviousMonth) return;

    if (selectedMonth === 0) {
      setSelectedYear((prev) => prev - 1);
      setSelectedMonth(11);
      return;
    }

    setSelectedMonth((prev) => prev - 1);
  };

  const handleNextMonth = () => {
    if (!canGoToNextMonth) return;

    if (selectedMonth === 11) {
      setSelectedYear((prev) => prev + 1);
      setSelectedMonth(0);
      return;
    }

    setSelectedMonth((prev) => prev + 1);
  };

  const getDayTypeColor = (type) => {
    switch (type) {
      case 'holiday': return 'bg-gradient-to-br from-red-500 to-red-600 text-white shadow-lg';
      case 'event': return 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg';
      case 'exam': return 'bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg';
      case 'break': return 'bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg';
      case 'regular': return 'bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg';
      default: return 'bg-gray-100 text-gray-800 border border-gray-300';
    }
  };

  const getDayTypeIcon = (type) => {
    switch (type) {
      case 'holiday': return <FaCalendarTimes className="w-4 h-4" />;
      case 'event': return <FaGraduationCap className="w-4 h-4" />;
      case 'exam': return <FaChalkboardTeacher className="w-4 h-4" />;
      case 'break': return <FaCalendarAlt className="w-4 h-4" />;
      case 'regular': return <FaCalendarCheck className="w-4 h-4" />;
      default: return <FaCalendarAlt className="w-4 h-4" />;
    }
  };

  const getDaysInMonth = (month, year) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month, year) => {
    return new Date(year, month, 1).getDay();
  };

  const isToday = (day, month, year) => {
    const today = new Date();
    return day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
  };

  const getCalendarDays = () => {
    const daysInMonth = getDaysInMonth(selectedMonth, selectedYear);
    const firstDay = getFirstDayOfMonth(selectedMonth, selectedYear);
    const days = [];

    // Add empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }

    return days;
  };

  const getDayData = (day) => {
    const dateStr = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return filteredDays.find(d => d.date === dateStr);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading school calendar...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Background Effects */}
      <div className="fixed inset-0 opacity-20">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 via-purple-400/10 to-pink-400/10"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-300/20 to-purple-300/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-pink-300/20 to-orange-300/20 rounded-full blur-2xl"></div>
      </div>

      <div className="relative z-10 container mx-auto max-w-7xl px-3 sm:px-4 md:px-6 py-5 sm:py-7 md:py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-6 sm:mb-8"
        >
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 text-center sm:text-left mb-4">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl">
              <FaCalendarAlt className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                School Calendar
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-gray-600">
                {months[selectedMonth]} {selectedYear}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Seeded academic calendar coverage: January {SCHOOL_CALENDAR_START_YEAR} to December {SCHOOL_CALENDAR_END_YEAR}
              </p>
            </div>
          </div>

          {/* Navigation and Search */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 sm:gap-4 bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl p-4 sm:p-6 border border-white/30">
            {/* Month Navigation */}
            <div className="w-full md:w-auto flex items-center justify-between md:justify-start gap-2 sm:gap-4">
              <button
                onClick={handlePreviousMonth}
                disabled={!canGoToPreviousMonth}
                className="p-2.5 sm:p-3 bg-gradient-to-r from-gray-100 to-gray-200 rounded-xl hover:from-gray-200 hover:to-gray-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FaChevronLeft className="w-5 h-5 text-gray-700" />
              </button>
              
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                className="flex-1 md:flex-none min-w-0 md:min-w-[190px] px-3 sm:px-5 py-2.5 sm:py-3 text-sm sm:text-base bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-xl text-gray-900 font-bold hover:border-blue-400 focus:border-blue-500 focus:shadow-lg transition-all duration-300 appearance-none cursor-pointer"
              >
                {months.map((month, index) => (
                  <option key={index} value={index} className="text-gray-900 font-medium">
                    {month}
                  </option>
                ))}
              </select>

              <button
                onClick={handleNextMonth}
                disabled={!canGoToNextMonth}
                className="p-2.5 sm:p-3 bg-gradient-to-r from-gray-100 to-gray-200 rounded-xl hover:from-gray-200 hover:to-gray-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FaChevronRight className="w-5 h-5 text-gray-700" />
              </button>
            </div>

            {/* Year Navigation */}
            <div className="w-full md:w-auto flex items-center justify-between md:justify-start gap-2 sm:gap-4">
              <button
                onClick={() => setSelectedYear((prev) => Math.max(prev - 1, SCHOOL_CALENDAR_START_YEAR))}
                disabled={selectedYear === SCHOOL_CALENDAR_START_YEAR}
                className="p-2.5 sm:p-3 bg-gradient-to-r from-gray-100 to-gray-200 rounded-xl hover:from-gray-200 hover:to-gray-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FaChevronLeft className="w-5 h-5 text-gray-700" />
              </button>
              
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="flex-1 md:flex-none min-w-0 md:min-w-[130px] px-3 sm:px-5 py-2.5 sm:py-3 text-sm sm:text-base bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-xl text-gray-900 font-bold hover:border-blue-400 focus:border-blue-500 focus:shadow-lg transition-all duration-300 appearance-none cursor-pointer"
              >
                {SCHOOL_CALENDAR_YEARS.map((year) => (
                  <option key={year} value={year} className="text-gray-900 font-medium">{year}</option>
                ))}
              </select>

              <button
                onClick={() => setSelectedYear((prev) => Math.min(prev + 1, SCHOOL_CALENDAR_END_YEAR))}
                disabled={selectedYear === SCHOOL_CALENDAR_END_YEAR}
                className="p-2.5 sm:p-3 bg-gradient-to-r from-gray-100 to-gray-200 rounded-xl hover:from-gray-200 hover:to-gray-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FaChevronRight className="w-5 h-5 text-gray-700" />
              </button>
            </div>

            {/* Search */}
            <div className="relative w-full md:w-auto">
              <div className="flex w-full items-center space-x-3 bg-gradient-to-r from-gray-50 to-gray-100 border-2 border-gray-200 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3">
                <FaSearch className="w-5 h-5 text-blue-500" />
                <input
                  type="text"
                  placeholder="Search holidays or events..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full min-w-0 bg-transparent text-gray-900 placeholder-gray-500 font-medium outline-none text-sm sm:text-base"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="text-red-500 hover:text-red-700 transition-colors"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>
          </div>
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

        {/* Calendar Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white/98 backdrop-blur-2xl rounded-3xl shadow-2xl p-3 sm:p-5 md:p-8 border border-white/40 relative overflow-hidden"
        >
          {/* Background Effects */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5"></div>
          
          <div className="relative z-10">
            <div className="overflow-x-auto -mx-1 px-1">
              <div className="min-w-[640px]">
                {/* Day Headers */}
                <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-3 sm:mb-4">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
                    <div key={index} className="text-center text-xs sm:text-sm font-bold text-gray-700 py-2 sm:py-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar Days */}
                <div className="grid grid-cols-7 gap-1 sm:gap-2">
                  {getCalendarDays().map((day, index) => {
                    const dayData = day ? getDayData(day) : null;
                    const isCurrentDay = day && isToday(day, selectedMonth, selectedYear);
                    
                    return (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.05 * index, duration: 0.3 }}
                        whileHover={{ scale: day ? 1.05 : 1 }}
                        className={`
                          relative min-h-[72px] sm:min-h-[92px] md:min-h-[100px] rounded-xl sm:rounded-2xl p-1.5 sm:p-2 border
                          ${day ? 'border-gray-200 bg-white hover:shadow-lg cursor-pointer' : 'border-transparent bg-transparent'}
                          ${isCurrentDay ? 'ring-2 sm:ring-4 ring-blue-400 ring-opacity-50 border-blue-500' : ''}
                        `}
                      >
                        {day && (
                          <>
                            {/* Day Number */}
                            <div className="text-center mb-1 sm:mb-2">
                              <span className={`text-sm sm:text-base md:text-lg font-bold ${isCurrentDay ? 'text-blue-600' : 'text-gray-800'}`}>
                                {day}
                              </span>
                            </div>

                            {/* Day Content */}
                            {dayData && (
                              <motion.div
                                initial={{ opacity: 0, y: -5 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 + index * 0.01 }}
                                className={`text-center p-1.5 sm:p-2 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-medium ${getDayTypeColor(dayData.day_type)}`}
                              >
                                <div className="flex items-center justify-center space-x-1 mb-1">
                                  {getDayTypeIcon(dayData.day_type)}
                                  <span className="truncate max-w-[64px] sm:max-w-[84px]">{dayData.description}</span>
                                </div>
                              </motion.div>
                            )}

                            {/* Empty day indicator */}
                            {!dayData && day && (
                              <div className="text-center">
                                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gray-200 rounded-full mx-auto mb-1 sm:mb-2"></div>
                                <span className="text-[10px] sm:text-xs text-gray-500">No events</span>
                              </div>
                            )}
                          </>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Legend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-8 bg-white/98 backdrop-blur-2xl rounded-3xl shadow-2xl p-4 sm:p-6 border border-white/40"
        >
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 text-center">Calendar Legend</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 bg-gradient-to-r from-red-50 to-red-100 rounded-xl">
              <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 text-white rounded-lg flex items-center justify-center">
                <FaCalendarTimes className="w-4 h-4" />
              </div>
              <span className="text-xs sm:text-sm font-medium text-red-800">Holiday</span>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg flex items-center justify-center">
                <FaGraduationCap className="w-4 h-4" />
              </div>
              <span className="text-xs sm:text-sm font-medium text-blue-800">Event</span>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg flex items-center justify-center">
                <FaChalkboardTeacher className="w-4 h-4" />
              </div>
              <span className="text-xs sm:text-sm font-medium text-purple-800">Exam</span>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 bg-gradient-to-r from-amber-50 to-orange-100 rounded-xl">
              <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 text-white rounded-lg flex items-center justify-center">
                <FaCalendarAlt className="w-4 h-4" />
              </div>
              <span className="text-xs sm:text-sm font-medium text-orange-800">Break</span>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 bg-gradient-to-r from-green-50 to-green-100 rounded-xl">
              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg flex items-center justify-center">
                <FaCalendarCheck className="w-4 h-4" />
              </div>
              <span className="text-xs sm:text-sm font-medium text-green-800">Regular Day</span>
            </div>
          </div>
        </motion.div>

        {/* Search Results */}
        {searchTerm && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-8 bg-white/98 backdrop-blur-2xl rounded-3xl shadow-2xl p-4 sm:p-6 border border-white/40"
          >
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 text-center break-words">
              Search Results for "{searchTerm}"
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredDays.map((day, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 * index }}
                  whileHover={{ scale: 1.02 }}
                  className="bg-gradient-to-r from-gray-50 to-gray-100 border-2 border-gray-200 rounded-xl p-4 hover:shadow-lg"
                >
                  <div className="flex items-center gap-2 sm:gap-3 mb-2">
                    <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center ${getDayTypeColor(day.day_type)}`}>
                      {getDayTypeIcon(day.day_type)}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-sm sm:text-base">{day.date}</p>
                      <p className="text-sm text-gray-600">{day.day_of_week}</p>
                    </div>
                  </div>
                  <p className="text-sm font-medium text-gray-800">{day.description}</p>
                </motion.div>
              ))}
            </div>
            {filteredDays.length === 0 && (
              <div className="text-center py-8">
                <FaSearch className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-base sm:text-xl text-gray-600 break-words">No holidays or events found for "{searchTerm}"</p>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default SchoolDays;
