import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Navbar } from './Navbar';

export function AppLayout() {
  const location = useLocation();

  return (
    <div className="min-h-screen text-slate-900 dark:text-slate-100 antialiased flex flex-col bg-slate-50 dark:bg-[#0B0D13] transition-colors duration-200">
      <Navbar />

      {/* Main workspace — subtle fade between routes */}
      <motion.main
        key={location.pathname}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="flex-1 p-4 sm:p-8 lg:p-10 max-w-[1440px] w-full mx-auto"
      >
        <Outlet />
      </motion.main>
    </div>
  );
}
