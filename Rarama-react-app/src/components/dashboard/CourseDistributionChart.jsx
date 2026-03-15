import React, { useEffect, useState } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { FaChartPie } from 'react-icons/fa';

const PALETTE = [
  '#2563EB',
  '#7C3AED',
  '#0EA5E9',
  '#F97316',
  '#10B981',
  '#EC4899',
  '#6366F1',
  '#84CC16',
];

const CourseDistributionChart = ({ data }) => {
  const [isCompact, setIsCompact] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth < 640;
  });

  useEffect(() => {
    const handleResize = () => {
      setIsCompact(window.innerWidth < 640);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const rawData = Array.isArray(data) ? data : Object.values(data || {});

  const normalizedData = rawData
    .filter((item) => item && typeof item === 'object')
    .map((item) => ({
      code: item.code || item.course_code || 'N/A',
      fullName: item.name || item.course_name || 'Unknown Course',
      value: Number(item.students_count || 0),
    }))
    .filter((item) => Number.isFinite(item.value) && item.value >= 0)
    .sort((a, b) => b.value - a.value);

  const totalStudents = normalizedData.reduce((sum, item) => sum + item.value, 0);
  const totalCourses = normalizedData.length;

  if (!normalizedData.length || totalStudents <= 0) {
    return (
      <div className="h-full rounded-3xl border border-emerald-100/80 bg-gradient-to-br from-emerald-50/40 via-white to-teal-50/40 flex items-center justify-center text-gray-500 p-6">
        <div className="text-center">
          <FaChartPie className="w-16 h-16 mx-auto mb-4 text-emerald-200" />
          <p className="text-lg font-semibold text-gray-700">No course data available</p>
          <p className="text-sm text-gray-400 mt-2">Check backend data source</p>
        </div>
      </div>
    );
  }

  const visibleLimit = 6;
  const topCourses = normalizedData.slice(0, visibleLimit);
  const othersTotal = normalizedData
    .slice(visibleLimit)
    .reduce((sum, item) => sum + item.value, 0);

  const chartData = othersTotal > 0
    ? [...topCourses, { code: 'OTH', fullName: 'Other Courses', value: othersTotal, isOthers: true }]
    : topCourses;

  const peakCourse = normalizedData[0];
  const averageStudents = Math.round(totalStudents / Math.max(totalCourses, 1));

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const entry = payload[0].payload;
      const share = totalStudents ? Math.round((entry.value / totalStudents) * 100) : 0;

      return (
        <div className="rounded-2xl border border-emerald-100 bg-white/95 backdrop-blur-xl px-4 py-3 shadow-xl">
          <p className="text-xs uppercase tracking-[0.16em] text-emerald-500 font-semibold mb-1">
            {entry.code}
          </p>
          <p className="text-sm font-semibold text-gray-800 mb-2">
            {entry.fullName}
          </p>
          <p className="text-sm text-gray-600">
            Students: <span className="font-bold text-gray-900">{entry.value.toLocaleString()}</span>
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Share: <span className="font-semibold text-emerald-700">{share}%</span>
          </p>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="h-full rounded-3xl border border-emerald-100/80 bg-gradient-to-br from-emerald-50/40 via-white to-teal-50/40 p-3 sm:p-4 md:p-5 flex flex-col">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4 flex-shrink-0">
        <div className="rounded-2xl border border-emerald-100 bg-white/90 px-4 py-3 shadow-sm">
          <p className="text-[11px] uppercase tracking-[0.18em] text-emerald-600 font-semibold">Top Course</p>
          <p className="text-lg font-black text-gray-900 mt-1">{peakCourse.code}</p>
          <p className="text-sm text-gray-500">{peakCourse.value.toLocaleString()} students</p>
        </div>
        <div className="rounded-2xl border border-blue-100 bg-white/90 px-4 py-3 shadow-sm">
          <p className="text-[11px] uppercase tracking-[0.18em] text-blue-600 font-semibold">Programs</p>
          <p className="text-2xl font-black text-gray-900 mt-1">{totalCourses}</p>
          <p className="text-sm text-gray-500">Tracked courses</p>
        </div>
        <div className="rounded-2xl bg-gradient-to-r from-emerald-600 via-cyan-600 to-blue-600 px-4 py-3 shadow-lg">
          <p className="text-[11px] uppercase tracking-[0.18em] text-white/80 font-semibold">Total Enrollees</p>
          <p className="text-2xl font-black text-white mt-1">{totalStudents.toLocaleString()}</p>
          <p className="text-sm text-white/80">Avg {averageStudents.toLocaleString()} / course</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 flex-1 min-h-0">
        <div className="lg:col-span-3 rounded-2xl border border-emerald-100 bg-white/85 p-2 sm:p-3 min-h-[260px] lg:min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="code"
                cx="50%"
                cy="50%"
                innerRadius={isCompact ? 46 : 60}
                outerRadius={isCompact ? 82 : 102}
                paddingAngle={2}
                stroke="#FFFFFF"
                strokeWidth={2}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`${entry.code}-${index}`} fill={PALETTE[index % PALETTE.length]} />
                ))}
              </Pie>

              <Tooltip content={<CustomTooltip />} />

              <text
                x="50%"
                y="47%"
                textAnchor="middle"
                dominantBaseline="middle"
                className="fill-slate-900"
                style={{ fontSize: isCompact ? '18px' : '22px', fontWeight: 800 }}
              >
                {totalStudents.toLocaleString()}
              </text>
              <text
                x="50%"
                y="58%"
                textAnchor="middle"
                dominantBaseline="middle"
                className="fill-slate-500"
                style={{ fontSize: isCompact ? '10px' : '12px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}
              >
                Students
              </text>
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="lg:col-span-2 rounded-2xl border border-emerald-100 bg-white/85 p-3 overflow-auto">
          <h4 className="text-sm font-bold text-slate-700 uppercase tracking-[0.16em] mb-3">Course Ranking</h4>

          <div className="space-y-3">
            {chartData.map((course, index) => {
              const share = totalStudents ? Math.round((course.value / totalStudents) * 100) : 0;
              const color = PALETTE[index % PALETTE.length];

              return (
                <div key={`${course.code}-rank`} className="rounded-xl border border-slate-100 p-3 bg-white/90">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-800 flex items-center gap-2">
                        <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }}></span>
                        {course.code}
                      </p>
                      <p className="text-xs text-slate-500 truncate" title={course.fullName}>{course.fullName}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-bold text-slate-900">{course.value.toLocaleString()}</p>
                      <p className="text-xs text-slate-500">{share}%</p>
                    </div>
                  </div>

                  <div className="mt-2 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(share, 2)}%`, backgroundColor: color }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDistributionChart;