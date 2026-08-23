import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '../ui';
import { ThemeToggle } from '../ui/ThemeToggle';

export function LandingNavbar() {
  return (
    <nav className="fixed top-0 inset-x-0 z-50 h-20 bg-[#0B0F19]/70 dark:bg-[#0B0F19]/70 bg-white/70 backdrop-blur-xl border-b border-slate-800/80 dark:border-slate-800/80 border-slate-200 px-6 lg:px-12 flex items-center justify-between transition-colors duration-200">
      {/* Brand */}
      <Link to="/" className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-600/30">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <span className="text-xl font-black tracking-wider bg-gradient-to-r from-slate-900 via-indigo-600 to-cyan-500 dark:from-white dark:via-indigo-200 dark:to-cyan-400 bg-clip-text text-transparent font-display">
            HADES
          </span>
          <span className="block text-[10px] uppercase font-bold tracking-widest text-indigo-500 dark:text-indigo-400">
            AI Skill Platform
          </span>
        </div>
      </Link>

      {/* Nav Links */}
      <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600 dark:text-slate-300">
        <a href="#features" className="hover:text-slate-900 dark:hover:text-white transition">Features</a>
        <a href="#how-it-works" className="hover:text-slate-900 dark:hover:text-white transition">How it Works</a>
        <a href="#features" className="hover:text-slate-900 dark:hover:text-white transition">Interactive Roadmap</a>
      </div>

      {/* CTAs & Theme Switcher */}
      <div className="flex items-center gap-3">
        <ThemeToggle />
        <Link to="/sign-in">
          <Button variant="ghost" size="sm">Sign In</Button>
        </Link>
        <Link to="/onboarding">
          <Button variant="primary" size="sm" icon={ArrowRight}>
            Build My Path
          </Button>
        </Link>
      </div>
    </nav>
  );
}
