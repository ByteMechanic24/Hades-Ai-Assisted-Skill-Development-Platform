import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';
import { cn } from '../../utils/cn';

export function ThemeToggle({ className }) {
  const { theme, toggleTheme, isDark } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      aria-label="Toggle Theme"
      className={cn(
        "relative p-2 rounded-xl border transition-all duration-300 group flex items-center justify-center select-none",
        isDark
          ? "bg-slate-900/80 hover:bg-slate-800 border-slate-800 text-amber-400 hover:text-amber-300 shadow-sm"
          : "bg-slate-100 hover:bg-slate-200 border-slate-300 text-indigo-600 hover:text-indigo-700 shadow-sm",
        className
      )}
    >
      <div className="relative w-4 h-4 flex items-center justify-center">
        {isDark ? (
          <Sun className="w-4 h-4 transition-transform duration-300 rotate-0 scale-100 group-hover:rotate-45" />
        ) : (
          <Moon className="w-4 h-4 transition-transform duration-300 -rotate-12 scale-100 group-hover:rotate-0" />
        )}
      </div>
    </button>
  );
}
