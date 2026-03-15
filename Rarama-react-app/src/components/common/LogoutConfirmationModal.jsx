import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FaSignOutAlt, FaTimes } from 'react-icons/fa';

const LogoutConfirmationModal = ({
  isOpen,
  isLoading = false,
  onCancel,
  onConfirm,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-slate-900/45 backdrop-blur-sm flex items-center justify-center px-4"
          onClick={() => {
            if (!isLoading) onCancel();
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.96 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="w-full max-w-md bg-white/95 backdrop-blur-xl rounded-2xl border border-white/60 shadow-2xl overflow-hidden"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-100 flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="h-11 w-11 rounded-xl bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white shadow-lg flex items-center justify-center shrink-0">
                  <FaSignOutAlt className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Confirm Logout</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    You are about to sign out of your account.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onCancel}
                disabled={isLoading}
                className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50"
                aria-label="Close confirmation dialog"
              >
                <FaTimes className="w-4 h-4" />
              </button>
            </div>

            <div className="px-6 pt-4 pb-6">
              <p className="text-sm text-gray-600 leading-relaxed">
                If you continue, you will need to log in again to access the dashboard.
              </p>

              <div className="mt-6 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onCancel}
                  disabled={isLoading}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-100 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={onConfirm}
                  disabled={isLoading}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white font-semibold shadow-lg hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 transition-all disabled:opacity-60"
                >
                  {isLoading ? 'Logging out...' : 'Yes, Logout'}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LogoutConfirmationModal;