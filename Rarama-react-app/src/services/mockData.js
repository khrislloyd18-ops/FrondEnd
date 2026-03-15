// Mock data functions for dashboard

export const getMockStats = () => ({
  total_students: 1247,
  active_students: 1123,
  total_courses: 48,
  average_attendance: 87
});

export const getMockEnrollmentTrends = () => [
  { month: 1, year: 2024, total: 98 },
  { month: 2, year: 2024, total: 112 },
  { month: 3, year: 2024, total: 134 },
  { month: 4, year: 2024, total: 156 },
  { month: 5, year: 2024, total: 189 },
  { month: 6, year: 2024, total: 203 },
  { month: 7, year: 2024, total: 198 },
  { month: 8, year: 2024, total: 245 },
  { month: 9, year: 2024, total: 267 },
  { month: 10, year: 2024, total: 289 },
  { month: 11, year: 2024, total: 312 },
  { month: 12, year: 2024, total: 334 }
];

export const getMockCourseDistribution = () => [
  { code: 'CS101', name: 'Computer Science Fundamentals', students_count: 245 },
  { code: 'MATH201', name: 'Advanced Mathematics', students_count: 189 },
  { code: 'ENG301', name: 'English Literature', students_count: 156 },
  { code: 'PHY401', name: 'Physics', students_count: 134 },
  { code: 'CHEM201', name: 'Chemistry', students_count: 112 },
  { code: 'BIO101', name: 'Biology', students_count: 98 },
  { code: 'HIST301', name: 'World History', students_count: 87 },
  { code: 'ART201', name: 'Fine Arts', students_count: 76 },
  { code: 'MUSIC101', name: 'Music Theory', students_count: 65 },
  { code: 'PE101', name: 'Physical Education', students_count: 54 }
];

export const getMockAttendancePatterns = () => [
  { date: '2024-01-01', attendance: 92 },
  { date: '2024-01-02', attendance: 88 },
  { date: '2024-01-03', attendance: 91 },
  { date: '2024-01-04', attendance: 85 },
  { date: '2024-01-05', attendance: 89 },
  { date: '2024-01-06', attendance: 93 },
  { date: '2024-01-07', attendance: 87 },
  { date: '2024-01-08', attendance: 90 },
  { date: '2024-01-09', attendance: 86 },
  { date: '2024-01-10', attendance: 88 },
  { date: '2024-01-11', attendance: 92 },
  { date: '2024-01-12', attendance: 94 },
  { date: '2024-01-13', attendance: 89 },
  { date: '2024-01-14', attendance: 91 },
  { date: '2024-01-15', attendance: 87 }
];
