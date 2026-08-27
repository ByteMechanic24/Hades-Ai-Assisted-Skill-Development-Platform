import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Navbar } from './Navbar';

export function AppLayout() {
  const location = useLocation();

  return (
    <div className="min-h-screen text-stone-900 dark:text-stone-100 antialiased flex flex-col">
      <Navbar />

      {/* Main workspace — subtle fade between routes */}
      <motion.main
        key={location.pathname}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="flex-1 p-6 sm:p-10 lg:p-14 max-w-[1536px] w-full mx-auto"
      >
        <Outlet />
      </motion.main>
    </div>
  );
}
