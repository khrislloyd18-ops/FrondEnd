import React from 'react';

const LoadingSkeleton = ({ type = 'card', count = 1, className = '' }) => {
  const renderSkeleton = (index) => {
    switch (type) {
      case 'card':
        return (
          <div key={index} className={`bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-white/30 ${className}`}>
            <div className="p-6">
              {/* Header skeleton */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="h-3 w-16 bg-gray-200 rounded-full animate-pulse"></div>
                  <div className="h-3 w-12 bg-gray-200 rounded-full animate-pulse"></div>
                </div>
                <div className="h-6 w-6 bg-gray-200 rounded-full animate-pulse"></div>
              </div>
              {/* Title skeleton */}
              <div className="h-6 w-3/4 bg-gray-200 rounded-lg animate-pulse mb-4"></div>
              
              {/* Content skeleton */}
              <div className="space-y-3 mb-4">
                <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 w-5/6 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 w-4/5 bg-gray-200 rounded animate-pulse"></div>
              </div>
              
              {/* Footer skeleton */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="h-4 w-8 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 w-12 bg-gray-200 rounded animate-pulse"></div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="h-8 w-16 bg-gray-200 rounded-lg animate-pulse"></div>
                  <div className="h-8 w-16 bg-gray-200 rounded-lg animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
        );
        
      case 'stat':
        return (
          <div key={index} className={`bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-white/30 p-6 ${className}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse"></div>
              <div className="h-6 w-16 bg-gray-200 rounded-full animate-pulse"></div>
            </div>
            <div className="space-y-2">
              <div className="h-8 w-20 bg-gray-200 rounded-lg animate-pulse"></div>
              <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-3 w-24 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        );
        
      case 'chart':
        return (
          <div key={index} className={`bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-white/30 p-8 ${className}`}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="h-6 w-6 bg-gray-200 rounded-full animate-pulse"></div>
                <div className="h-6 w-32 bg-gray-200 rounded-lg animate-pulse"></div>
              </div>
              <div className="h-6 w-6 bg-gray-200 rounded-full animate-pulse"></div>
            </div>
            <div className="h-64 bg-gray-100 rounded-xl animate-pulse"></div>
          </div>
        );
        
      case 'table':
        return (
          <div key={index} className={`bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-white/30 overflow-hidden ${className}`}>
            <div className="p-6">
              <div className="space-y-4">
                {/* Table header skeleton */}
                <div className="grid grid-cols-4 gap-4 pb-4 border-b border-gray-200">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  ))}
                </div>
                {/* Table rows skeleton */}
                {[1, 2, 3, 4, 5].map((row) => (
                  <div key={row} className="grid grid-cols-4 gap-4 py-3 border-b border-gray-100">
                    {[1, 2, 3, 4].map((col) => (
                      <div key={col} className="h-4 bg-gray-100 rounded animate-pulse"></div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
        
      case 'form':
        return (
          <div key={index} className={`bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-white/30 p-6 ${className}`}>
            <div className="space-y-4">
              <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-10 w-full bg-gray-100 rounded-lg animate-pulse"></div>
              <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-20 w-full bg-gray-100 rounded-lg animate-pulse"></div>
              <div className="h-10 w-32 bg-gray-200 rounded-lg animate-pulse"></div>
            </div>
          </div>
        );
        
      default:
        return (
          <div key={index} className={`bg-gray-200 rounded-lg animate-pulse ${className}`}>
            <div className="h-32 w-full"></div>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {Array.from({ length: count }, (_, index) => renderSkeleton(index))}
    </div>
  );
};

export default LoadingSkeleton;
