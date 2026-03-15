import React, { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
} from 'recharts';
import { FaChartBar } from 'react-icons/fa';

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

const EnrollmentChart = ({ data }) => {
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

  const parseEntries = (input) => {
    const dataArray = Array.isArray(input) ? input : Object.values(input || {});

    return dataArray
      .filter((item) => item && typeof item === 'object')
      .map((item) => ({
        month: Number(item.month),
        year: Number(item.year),
        total: Number(item.total || 0),
      }))
      .filter((item) => Number.isInteger(item.month) && item.month >= 1 && item.month <= 12);
  };

  const formatYearlyData = (entries) => {
    if (!entries.length) {
      return { targetYear: null, chartData: [] };
    }

    const yearCandidates = entries
      .map((item) => item.year)
      .filter((year) => Number.isFinite(year) && year > 0);

    const targetYear = yearCandidates.length
      ? Math.max(...yearCandidates)
      : null;

    const yearScopedEntries = targetYear
      ? entries.filter((item) => item.year === targetYear || !Number.isFinite(item.year) || item.year <= 0)
      : entries;

    const monthTotals = new Array(12).fill(0);
    yearScopedEntries.forEach((item) => {
      monthTotals[item.month - 1] += item.total;
    });

    const chartData = MONTHS.map((monthName, index) => ({
      month: index + 1,
      label: monthName,
      date: targetYear ? `${monthName} ${targetYear}` : monthName,
      total: monthTotals[index],
    }));

    return { targetYear, chartData };
  };

  const sourceEntries = parseEntries(data);
  const { targetYear, chartData } = formatYearlyData(sourceEntries);

  if (!sourceEntries.length) {
    return (
      <div className="h-full rounded-3xl border border-blue-100/80 bg-gradient-to-br from-slate-50 via-white to-blue-50/80 flex items-center justify-center text-gray-500 p-6">
        <div className="text-center">
          <FaChartBar className="w-16 h-16 mx-auto mb-4 text-blue-200" />
          <p className="text-lg font-semibold text-gray-700">No enrollment data available</p>
          <p className="text-sm text-gray-400 mt-2">Check backend data source</p>
        </div>
      </div>
    );
  }

  const totalEnrollments = chartData.reduce((sum, item) => sum + item.total, 0);
  const averageEnrollments = Math.round(totalEnrollments / chartData.length);
  const peakEntry = chartData.reduce(
    (highest, item) => (item.total > highest.total ? item : highest),
    chartData[0]
  );

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const entry = payload[0].payload;
      const share = totalEnrollments ? Math.round((payload[0].value / totalEnrollments) * 100) : 0;

      return (
        <div className="rounded-2xl border border-blue-100 bg-white/95 backdrop-blur-xl px-4 py-3 shadow-xl">
          <p className="text-xs uppercase tracking-[0.18em] text-blue-500 font-semibold mb-1">
            {entry.date}
          </p>
          <p className="text-lg font-black text-gray-900 mb-2">{payload[0].value.toLocaleString()} enrollments</p>
          <p className="text-sm text-gray-500">
            Share of total: <span className="font-semibold text-gray-700">{share}%</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-full flex flex-col rounded-3xl border border-blue-100/80 bg-gradient-to-br from-slate-50 via-white to-blue-50/80 p-3 sm:p-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4 flex-shrink-0">
        <div className="rounded-2xl border border-blue-100 bg-white/90 px-4 py-3 shadow-sm">
          <p className="text-[11px] uppercase tracking-[0.18em] text-blue-600 font-semibold">Peak Month</p>
          <p className="text-lg font-black text-gray-900 mt-1">{peakEntry.label}</p>
          <p className="text-sm text-gray-500">{peakEntry.total.toLocaleString()} students</p>
        </div>
        <div className="rounded-2xl bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 px-4 py-3 shadow-lg">
          <p className="text-[11px] uppercase tracking-[0.18em] text-white/80 font-semibold">Average / Month</p>
          <p className="text-2xl font-black text-white mt-1">{averageEnrollments.toLocaleString()}</p>
          <p className="text-sm text-white/80">Total {totalEnrollments.toLocaleString()} students</p>
        </div>
      </div>

      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between mb-3 px-1 flex-shrink-0">
        <p className="text-[11px] sm:text-xs uppercase tracking-[0.16em] text-gray-400 font-semibold">
          Showing monthly enrollment trend from January to December
        </p>
        <p className="text-xs sm:text-sm text-gray-500">
          {targetYear || 'Current Year'}
        </p>
      </div>

      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 8, right: isCompact ? 0 : 10, left: isCompact ? -10 : 0, bottom: isCompact ? 18 : 8 }}
            barCategoryGap={isCompact ? 16 : 10}
          >
            <defs>
              <linearGradient id="enrollmentBarGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2563EB" />
                <stop offset="55%" stopColor="#7C3AED" />
                <stop offset="100%" stopColor="#EC4899" />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeDasharray="4 8" stroke="#E2E8F0" />
            <XAxis
              dataKey="label"
              interval={isCompact ? 1 : 0}
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#334155', fontSize: isCompact ? 10 : 11, fontWeight: 700 }}
            />
            <YAxis
              allowDecimals={false}
              width={isCompact ? 32 : 44}
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#64748B', fontSize: isCompact ? 10 : 11 }}
              tickFormatter={(value) => value.toLocaleString()}
            />
            <Tooltip
              cursor={{ fill: 'rgba(59, 130, 246, 0.08)' }}
              content={<CustomTooltip />}
            />
            <Bar
              dataKey="total"
              fill="url(#enrollmentBarGradient)"
              radius={[10, 10, 0, 0]}
              maxBarSize={isCompact ? 24 : 34}
              animationDuration={900}
              background={{ fill: '#E2E8F0' }}
            >
              {!isCompact && (
                <LabelList
                  dataKey="total"
                  position="top"
                  offset={8}
                  formatter={(value) => value.toLocaleString()}
                  fill="#0F172A"
                  fontSize={11}
                  fontWeight={700}
                />
              )}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default EnrollmentChart;