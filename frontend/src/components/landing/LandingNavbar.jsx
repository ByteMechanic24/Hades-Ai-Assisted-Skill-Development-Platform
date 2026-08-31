import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, BrandLogo } from '../ui';
import { ThemeToggle } from '../ui/ThemeToggle';
import { ArrowRight, Menu, X, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export function LandingNavbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isAuthenticated } = useAuth();

  const navLinks = [
    { label: 'Architecture', href: '#features' },
    { label: 'The HADES Method', href: '#how-it-works' },
    { label: 'Live Graph Demo', href: '#demo' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 dark:bg-[#0B0D13]/95 backdrop-blur-md border-b border-slate-200 dark:border-white/10 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 sm:h-15 flex items-center justify-between gap-6">
        {/* Brand Logo - Sleek & Compact */}
        <Link to="/" className="shrink-0">
          <BrandLogo subtitle="MISSION CONTROL" size="sm" />
        </Link>

        {/* Center Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 lg:gap-10">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-xs sm:text-sm font-semibold text-slate-600 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-400 transition-colors"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Right CTA Cluster */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          <ThemeToggle />

          {isAuthenticated ? (
            <Link to="/dashboard">
              <Button
                variant="primary"
                size="sm"
                icon={LayoutDashboard}
                className="h-8 text-xs font-bold px-3.5 bg-[#5B50E5] hover:bg-[#4E44D4] text-white shadow-sm"
              >
                Go to Workspace
              </Button>
            </Link>
          ) : (
            <>
              <Link to="/sign-in" className="hidden sm:inline-flex">
                <Button variant="ghost" size="sm" className="h-8 text-xs font-semibold px-3">
                  Sign In
                </Button>
              </Link>

              <Link to="/sign-up">
                <Button
                  variant="primary"
                  size="sm"
                  icon={ArrowRight}
                  className="h-8 text-xs font-bold px-3.5 bg-[#5B50E5] hover:bg-[#4E44D4] text-white shadow-sm"
                >
                  Build Path
                </Button>
              </Link>
            </>
          )}

          {/* Mobile menu trigger */}
          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="md:hidden p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.06] transition"
            aria-label="Toggle navigation menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-white/10 bg-white/98 dark:bg-[#121620]/98 backdrop-blur-lg p-5 space-y-4 shadow-elev">
          <nav className="flex flex-col space-y-2.5">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="text-sm font-bold text-slate-800 dark:text-slate-200 py-1 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
              >
                {link.label}
              </a>
            ))}
          </nav>
          <div className="pt-3 border-t border-slate-100 dark:border-white/[0.08] flex flex-col gap-2">
            <Link to="/sign-in" onClick={() => setMobileOpen(false)}>
              <Button variant="secondary" size="md" className="w-full">
                Sign In
              </Button>
            </Link>
            <Link to="/sign-up" onClick={() => setMobileOpen(false)}>
              <Button variant="primary" size="md" icon={ArrowRight} className="w-full bg-[#5B50E5] hover:bg-[#4E44D4] text-white">
                Build Path
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
