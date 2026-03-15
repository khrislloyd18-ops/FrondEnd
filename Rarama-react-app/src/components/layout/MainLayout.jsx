import React, { useEffect, useState } from 'react';
import Sidebar from '../common/Sidebar';

const MainLayout = ({ children }) => {
  const getInitialSidebarState = () => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth < 1024;
  };

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(getInitialSidebarState);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsSidebarCollapsed(true);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        onCollapseChange={setIsSidebarCollapsed}
      />
      <main className={`min-w-0 pt-20 sm:pt-24 lg:pt-0 transition-all duration-300 ${isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-80'}`}>
        <div className="mx-auto w-full max-w-7xl px-3 py-4 sm:px-4 sm:py-6 md:px-6 lg:px-8 lg:py-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default MainLayout;
