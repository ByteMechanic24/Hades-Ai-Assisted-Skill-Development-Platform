import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Heart } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#070b13] py-12 px-6 lg:px-12 text-xs text-slate-500 dark:text-slate-400 transition-colors duration-200">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center text-white">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-slate-900 dark:text-white tracking-wider font-display text-sm">HADES</span>
            <span className="block text-[10px] text-slate-400 dark:text-slate-500">HCLTech Hackathon 2026</span>
          </div>
        </div>

        <div className="flex items-center gap-6 font-medium text-slate-600 dark:text-slate-400">
          <Link to="/onboarding" className="hover:text-indigo-600 dark:hover:text-white transition">Get Started</Link>
          <Link to="/dashboard" className="hover:text-indigo-600 dark:hover:text-white transition">Live Platform</Link>
          <Link to="/sign-in" className="hover:text-indigo-600 dark:hover:text-white transition">Sign In</Link>
        </div>

        <div className="text-slate-400 dark:text-slate-500 text-center sm:text-right">
          Architected with React, Tailwind CSS, Scala Pekko & Agno AI.
        </div>
      </div>
    </footer>
  );
}
