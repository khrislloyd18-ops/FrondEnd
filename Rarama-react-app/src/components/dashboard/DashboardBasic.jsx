import React from 'react';

const DashboardBasic = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Background Pattern */}
      <div className="fixed inset-0 opacity-10">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-400/5 via-purple-400/5 to-pink-400/5"></div>
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.08'%3E%3Ccircle cx='20' cy='20' r='2'/%3E%3Ccircle cx='60' cy='20' r='2'/%3E%3Ccircle cx='20' cy='60' r='2'/%3E%3Ccircle cx='60' cy='60' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
      </div>

      <div className="relative z-10 container mx-auto px-6 py-10 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            UMTC Dashboard
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Welcome to your academic management dashboard
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl p-6 border border-white/30">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <span className="text-2xl">👥</span>
              </div>
              <span className="text-sm text-gray-500">Total</span>
            </div>
            <div className="text-3xl font-bold text-gray-800">1,247</div>
            <div className="text-sm text-gray-600">Students</div>
          </div>

          <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl p-6 border border-white/30">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <span className="text-2xl">✅</span>
              </div>
              <span className="text-sm text-gray-500">Active</span>
            </div>
            <div className="text-3xl font-bold text-gray-800">1,123</div>
            <div className="text-sm text-gray-600">Enrolled</div>
          </div>

          <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl p-6 border border-white/30">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <span className="text-2xl">📚</span>
              </div>
              <span className="text-sm text-gray-500">Total</span>
            </div>
            <div className="text-3xl font-bold text-gray-800">48</div>
            <div className="text-sm text-gray-600">Courses</div>
          </div>

          <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl p-6 border border-white/30">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <span className="text-2xl">📊</span>
              </div>
              <span className="text-sm text-gray-500">Average</span>
            </div>
            <div className="text-3xl font-bold text-gray-800">87%</div>
            <div className="text-sm text-gray-600">Attendance</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl p-6 border border-white/30">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <button className="w-full px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors">
                📊 View Reports
              </button>
              <button className="w-full px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors">
                👥 Manage Students
              </button>
              <button className="w-full px-4 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors">
                📚 Course Management
              </button>
            </div>
          </div>

          <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl p-6 border border-white/30">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Recent Activity</h2>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                <span className="text-2xl">👤</span>
                <div>
                  <div className="font-semibold text-gray-800">New student enrolled</div>
                  <div className="text-sm text-gray-600">2 minutes ago</div>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                <span className="text-2xl">📚</span>
                <div>
                  <div className="font-semibold text-gray-800">Course updated</div>
                  <div className="text-sm text-gray-600">1 hour ago</div>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                <span className="text-2xl">📊</span>
                <div>
                  <div className="font-semibold text-gray-800">Report generated</div>
                  <div className="text-sm text-gray-600">3 hours ago</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* System Status */}
        <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl p-6 border border-white/30">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">System Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-gray-700">Database: Online</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-gray-700">API: Connected</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-gray-700">Services: Running</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardBasic;
