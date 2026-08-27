import React from 'react';
import { Link } from 'react-router-dom';
import { Radar, ArrowUpRight } from 'lucide-react';

export function Footer() {
  const nav = [
    { label: 'Get started', to: '/onboarding' },
    { label: 'Live workspace', to: '/dashboard' },
    { label: 'Sign in', to: '/sign-in' },
  ];

  return (
    <footer className="border-t border-stone-200 dark:border-white/[0.08] bg-white dark:bg-[#08080a] py-14 px-5 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* CTA band */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-12 border-b border-stone-200 dark:border-white/[0.08]">
          <div className="max-w-lg">
            <h3 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 dark:text-white leading-tight">
              Your goal is already a project.
              <br />
              Let&apos;s find the path.
            </h3>
          </div>
          <Link
            to="/onboarding"
            className="inline-flex items-center gap-2 self-start md:self-auto px-5 py-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 text-sm font-semibold transition-colors"
          >
            Build my path
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Meta row */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-stone-500 dark:text-stone-400">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-lg bg-stone-900 dark:bg-white flex items-center justify-center">
              <Radar className="w-4 h-4 text-amber-400 dark:text-amber-500" strokeWidth={2.25} />
            </span>
            <div className="leading-tight">
              <span className="font-display font-bold text-stone-900 dark:text-white text-sm tracking-tight">HADES</span>
              <span className="block mono-label text-[9px] text-stone-400 dark:text-stone-500 mt-0.5">
                HCLTech Hackathon 2026
              </span>
            </div>
          </div>

          <div className="flex items-center gap-6 font-medium">
            {nav.map((n) => (
              <Link key={n.label} to={n.to} className="hover:text-stone-900 dark:hover:text-white transition">
                {n.label}
              </Link>
            ))}
          </div>

          <p className="mono-label text-[10px] text-stone-400 dark:text-stone-500 text-center sm:text-right">
            React · Tailwind · Scala Pekko · Agno AI
          </p>
        </div>
      </div>
    </footer>
  );
}
