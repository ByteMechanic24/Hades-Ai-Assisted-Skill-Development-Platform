import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';
import { cn } from '../../utils/cn';

export function ThemeToggle({ className }) {
  const { toggleTheme, isDark } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-label="Toggle theme"
      className={cn(
        'relative p-2 rounded-lg border border-transparent transition-colors duration-200 group flex items-center justify-center select-none',
        'text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white',
        'hover:bg-stone-100 dark:hover:bg-white/[0.06] hover:border-stone-200 dark:hover:border-white/10',
        className
      )}
    >
      <div className="relative w-[18px] h-[18px] flex items-center justify-center">
        {isDark ? (
          <Sun className="w-[18px] h-[18px] transition-transform duration-300 group-hover:rotate-45" />
        ) : (
          <Moon className="w-[18px] h-[18px] transition-transform duration-300 group-hover:-rotate-12" />
        )}
      </div>
    </button>
  );
}
