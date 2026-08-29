import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { BrandLogo } from '../ui/BrandLogo';

export function Footer() {
  const nav = [
    { label: 'Get Started', to: '/onboarding' },
    { label: 'Live Workspace', to: '/dashboard' },
    { label: 'Sign In', to: '/sign-in' },
  ];

  return (
    <footer className="border-t border-slate-200 dark:border-white/[0.08] bg-transparent dark:bg-transparent py-14 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="max-w-6xl mx-auto">
        {/* CTA band */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-12 border-b border-slate-200 dark:border-white/[0.08]">
          <div className="max-w-lg">
            <h3 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white leading-tight">
              Your career goal is already a project.
              <br />
              Let&apos;s chart the exact path.
            </h3>
          </div>
          <Link
            to="/onboarding"
            className="inline-flex items-center gap-2 self-start md:self-auto px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-colors shadow-sm"
          >
            Build My Path
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Meta row */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-slate-500 dark:text-slate-400">
          <BrandLogo subtitle="AI-Powered Learning Platform" size="sm" />

          <div className="flex items-center gap-6 font-semibold">
            {nav.map((n) => (
              <Link key={n.label} to={n.to} className="hover:text-slate-900 dark:hover:text-white transition">
                {n.label}
              </Link>
            ))}
          </div>

          <p className="mono-label text-[10px] text-slate-400 dark:text-slate-500 text-center sm:text-right font-medium">
            React · Tailwind · Scala Pekko · Agno AI
          </p>
        </div>
      </div>
    </footer>
  );
}
