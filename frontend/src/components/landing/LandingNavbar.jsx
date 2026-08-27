import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Radar, ArrowRight, Menu, X } from 'lucide-react';
import { Button } from '../ui';
import { ThemeToggle } from '../ui/ThemeToggle';

const links = [
  { label: 'Preview', href: '#adaptive-engine' },
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Features', href: '#features' },
];

export function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 inset-x-0 z-50 h-16 flex items-center transition-colors duration-300 ${
        scrolled
          ? 'glass-panel border-b border-stone-200/70 dark:border-white/[0.08]'
          : 'border-b border-transparent'
      }`}
    >
      <div className="w-full max-w-[1280px] mx-auto px-5 lg:px-8 flex items-center justify-between">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <span className="w-9 h-9 rounded-lg bg-stone-900 dark:bg-white flex items-center justify-center group-hover:scale-105 transition-transform">
            <Radar className="w-[18px] h-[18px] text-amber-400 dark:text-amber-500" strokeWidth={2.25} />
          </span>
          <span className="flex flex-col leading-none">
            <span className="font-display text-[15px] font-bold tracking-tight text-stone-900 dark:text-white">HADES</span>
            <span className="mono-label text-[9px] text-stone-400 dark:text-stone-500 mt-0.5">Mission Control</span>
          </span>
        </Link>

        {/* Center links */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-stone-600 dark:text-stone-400">
          {links.map((l) => (
            <a key={l.label} href={l.href} className="hover:text-stone-900 dark:hover:text-white transition">
              {l.label}
            </a>
          ))}
        </div>

        {/* CTAs */}
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link to="/sign-in" className="hidden sm:block">
            <Button variant="ghost" size="sm">Sign in</Button>
          </Link>
          <Link to="/onboarding" className="hidden sm:block">
            <Button variant="primary" size="sm" icon={ArrowRight}>Build my path</Button>
          </Link>
          <button
            onClick={() => setOpen((v) => !v)}
            className="md:hidden p-2 rounded-lg text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-white/[0.06] transition"
            aria-label="Menu"
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile sheet */}
      {open && (
        <div className="md:hidden absolute top-16 inset-x-0 glass-panel border-b border-stone-200 dark:border-white/[0.08] p-5 flex flex-col gap-1">
          {links.map((l) => (
            <a
              key={l.label}
              href={l.href}
              onClick={() => setOpen(false)}
              className="py-2.5 px-3 rounded-lg text-sm font-medium text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-white/[0.06] transition"
            >
              {l.label}
            </a>
          ))}
          <div className="flex gap-2 mt-2 pt-3 border-t border-stone-200 dark:border-white/[0.08]">
            <Link to="/sign-in" className="flex-1" onClick={() => setOpen(false)}>
              <Button variant="secondary" size="sm" className="w-full">Sign in</Button>
            </Link>
            <Link to="/onboarding" className="flex-1" onClick={() => setOpen(false)}>
              <Button variant="primary" size="sm" className="w-full">Build my path</Button>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
