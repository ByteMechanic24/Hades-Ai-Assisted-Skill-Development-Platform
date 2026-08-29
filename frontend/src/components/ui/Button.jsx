import React from 'react';
import { cn } from '../../utils/cn';

/**
 * Standardized Multi-Color Design System Primitives (Button, Badge, GlassCard)
 * Supports Light and Dark modes with WCAG-conscious contrast and contextual page accents.
 */

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className,
  disabled,
  isLoading,
  icon: Icon,
  ...props
}) {
  const baseStyles =
    "inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-[#0B0D13] disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98] whitespace-nowrap";

  const variants = {
    // Primary Core Brand: Electric Indigo
    primary:
      "bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm font-semibold focus-visible:ring-indigo-500/60",
    brand:
      "bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm font-semibold focus-visible:ring-indigo-500/60",
    // AI & Learning Path: Electric Violet
    violet:
      "bg-violet-600 hover:bg-violet-500 text-white shadow-sm font-semibold focus-visible:ring-violet-500/60",
    // Exploration & Resources: Cyan
    cyan:
      "bg-cyan-600 hover:bg-cyan-500 text-white shadow-sm font-semibold focus-visible:ring-cyan-500/60",
    // Knowledge & Articles: Teal
    teal:
      "bg-teal-600 hover:bg-teal-500 text-white shadow-sm font-semibold focus-visible:ring-teal-500/60",
    // Progress & Milestones: Emerald
    emerald:
      "bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm font-semibold focus-visible:ring-emerald-500/60",
    success:
      "bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm focus-visible:ring-emerald-500/60",
    // Challenge & Assessments: Coral
    coral:
      "bg-rose-600 hover:bg-rose-500 text-white shadow-sm font-semibold focus-visible:ring-rose-500/60",
    danger:
      "bg-rose-600 hover:bg-rose-500 text-white shadow-sm focus-visible:ring-rose-500/60",
    // Semantic Alert / Accent: Electric Indigo
    amber:
      "bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm font-semibold focus-visible:ring-indigo-500/60",
    accent:
      "bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm font-semibold focus-visible:ring-indigo-500/60",
    // Neutral Secondary
    secondary:
      "bg-slate-100 hover:bg-slate-200/80 text-slate-800 border border-slate-200 dark:bg-white/[0.06] dark:hover:bg-white/[0.10] dark:text-slate-100 dark:border-white/10 focus-visible:ring-slate-400/50",
    // Outline
    outline:
      "border border-slate-300 dark:border-white/15 bg-transparent text-slate-700 dark:text-slate-200 hover:border-slate-400 dark:hover:border-white/30 hover:bg-slate-100/60 dark:hover:bg-white/[0.04] focus-visible:ring-slate-400/50",
    // Ghost
    ghost:
      "bg-transparent text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.06] hover:text-slate-900 dark:hover:text-white focus-visible:ring-slate-400/40",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs gap-1.5",
    md: "px-4 py-2 text-xs sm:text-sm gap-2",
    lg: "px-5 py-2.5 text-sm sm:text-base gap-2.5",
    icon: "p-2 aspect-square",
  };

  return (
    <button
      className={cn(baseStyles, variants[variant] || variants.primary, sizes[size] || sizes.md, className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <svg className="animate-spin -ml-0.5 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : Icon ? (
        <Icon className={cn(size === 'sm' ? "w-3.5 h-3.5" : size === 'lg' ? "w-4.5 h-4.5" : "w-4 h-4")} />
      ) : null}
      {children}
    </button>
  );
}

export function Badge({ children, variant = 'default', size = 'md', className }) {
  const variants = {
    default:
      "bg-slate-100 text-slate-700 border-slate-200 dark:bg-white/[0.06] dark:text-slate-300 dark:border-white/10",
    primary:
      "bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/25",
    indigo:
      "bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/25",
    violet:
      "bg-violet-500/10 text-violet-700 dark:text-violet-300 border-violet-500/25",
    purple:
      "bg-violet-500/10 text-violet-700 dark:text-violet-300 border-violet-500/25",
    cyan:
      "bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border-cyan-500/25",
    teal:
      "bg-teal-500/10 text-teal-700 dark:text-teal-300 border-teal-500/25",
    emerald:
      "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/25",
    green:
      "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/25",
    coral:
      "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/25",
    rose:
      "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/25",
    amber:
      "bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/25",
    warning:
      "bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/25",
  };

  const sizes = {
    sm: "px-2 py-0.5 text-[11px] font-semibold",
    md: "px-2.5 py-0.5 text-xs font-semibold",
    lg: "px-3 py-1 text-xs font-bold",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md border font-sans select-none tracking-tight",
        variants[variant] || variants.default,
        sizes[size] || sizes.md,
        className
      )}
    >
      {children}
    </span>
  );
}

export function GlassCard({ children, className, hoverEffect = true, ...props }) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#121620] shadow-card",
        hoverEffect && "hover:border-indigo-500/30 hover:shadow-elev transition-all duration-200",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
