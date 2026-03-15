import React, { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { FaChartLine } from 'react-icons/fa';

const AttendanceChart = ({ data }) => {
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

  // More robust data checking
  const hasData = data && (
    (Array.isArray(data) && data.length > 0) ||
    (typeof data === 'object' && Object.keys(data).length > 0)
  );
  
  if (!hasData) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        <div className="text-center">
          <FaChartLine className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-semibold">No attendance data available</p>
          <p className="text-sm text-gray-400 mt-2">Check backend data source</p>
        </div>
      </div>
    );
  }

  // Handle both array and object data
  const dataArray = Array.isArray(data) ? data : Object.values(data);
  
  // Get last 15 days of attendance for better visualization
  const last15Days = dataArray.slice(-15).map(day => ({
    date: new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    attendance: day.attendance_percentage || day.attendance || 0, // Backend returns 'attendance_percentage' field
  }));

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 rounded-xl shadow-lg border border-gray-100">
          <p className="text-sm font-semibold text-gray-800 mb-2">{label}</p>
          <p className="text-sm text-blue-600">
            Attendance: <span className="font-bold">{payload[0].value}%</span>
          </p>
        </div>
      );
    }
    return null;
  };

  const averageAttendance = last15Days.length
    ? last15Days.reduce((sum, day) => sum + day.attendance, 0) / last15Days.length
    : 0;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={last15Days}
        margin={{ top: 12, right: isCompact ? 6 : 16, left: isCompact ? -10 : 0, bottom: isCompact ? 8 : 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis
          dataKey="date"
          interval={isCompact ? 2 : 0}
          minTickGap={isCompact ? 18 : 8}
          tick={{ fill: '#6B7280', fontSize: isCompact ? 10 : 12 }}
          axisLine={{ stroke: '#E5E7EB' }}
        />
        <YAxis
          width={isCompact ? 30 : 42}
          tick={{ fill: '#6B7280', fontSize: isCompact ? 10 : 12 }}
          axisLine={{ stroke: '#E5E7EB' }}
          domain={[0, 100]}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ fontSize: isCompact ? 10 : 12 }} iconSize={isCompact ? 10 : 14} />
        <ReferenceLine 
          y={averageAttendance} 
          stroke="#EF4444" 
          strokeDasharray="5 5" 
          label={isCompact ? false : { value: `Avg: ${averageAttendance.toFixed(1)}%`, position: 'right' }}
        />
        <ReferenceLine 
          y={85} 
          stroke="#10B981" 
          strokeDasharray="3 3" 
          label={isCompact ? false : { value: 'Target: 85%', position: 'left' }}
        />
        <Line
          type="monotone"
          dataKey="attendance"
          stroke="#3B82F6"
          strokeWidth={3}
          dot={{ fill: '#3B82F6', strokeWidth: 2, r: isCompact ? 3 : 4 }}
          activeDot={{ r: isCompact ? 4 : 6 }}
          name="Attendance %"
          animationDuration={1000}
          animationBegin={0}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default AttendanceChart;