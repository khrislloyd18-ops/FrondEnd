import React from 'react';
import { motion } from 'framer-motion';
import { FaBookOpen, FaChalkboardTeacher, FaCalendarAlt } from 'react-icons/fa';

const CoursesPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold gradient-text mb-2">
            Courses Management
          </h1>
          <p className="text-gray-600">
            Manage curriculum, courses, and academic programs.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card rounded-2xl p-8 text-center"
        >
          <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <FaBookOpen className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Courses Module
          </h2>
          <p className="text-gray-600 mb-6">
            This module is under development. Full course management features will be available soon.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            <div className="bg-purple-50 rounded-xl p-4">
              <FaBookOpen className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-800">Curriculum</h3>
              <p className="text-sm text-gray-600">Manage curriculum</p>
            </div>
            <div className="bg-blue-50 rounded-xl p-4">
              <FaChalkboardTeacher className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-800">Faculty</h3>
              <p className="text-sm text-gray-600">Assign instructors</p>
            </div>
            <div className="bg-green-50 rounded-xl p-4">
              <FaCalendarAlt className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-800">Schedule</h3>
              <p className="text-sm text-gray-600">Course scheduling</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CoursesPage;
