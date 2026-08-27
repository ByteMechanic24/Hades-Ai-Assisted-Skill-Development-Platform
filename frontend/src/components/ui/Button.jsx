import React from 'react';
import { cn } from '../../utils/cn';

/**
 * Shared UI primitives. Export names, prop names, variant keys and size keys are
 * preserved exactly (Button / Badge / GlassCard) so every existing call site keeps
 * working — only the visual language changes: single amber accent, flat editorial
 * surfaces, hairline borders, restrained motion.
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
    "inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-[#0a0a0b] disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98] whitespace-nowrap";

  const variants = {
    // Solid gold — the one primary call to action
    primary:
      "bg-amber-500 hover:bg-amber-400 text-stone-950 shadow-sm focus-visible:ring-amber-500/60",
    // Quiet neutral surface
    secondary:
      "bg-stone-900/[0.04] hover:bg-stone-900/[0.08] text-stone-800 border border-stone-900/10 dark:bg-white/[0.06] dark:hover:bg-white/[0.10] dark:text-stone-100 dark:border-white/10 focus-visible:ring-stone-400/50",
    // Ghosted gold — emphasis without a second color
    accent:
      "bg-amber-500/10 hover:bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 dark:border-amber-500/25 focus-visible:ring-amber-500/50",
    outline:
      "border border-stone-300 dark:border-white/15 bg-transparent text-stone-700 dark:text-stone-200 hover:border-stone-400 dark:hover:border-white/30 hover:bg-stone-900/[0.03] dark:hover:bg-white/[0.04] focus-visible:ring-stone-400/50",
    ghost:
      "bg-transparent text-stone-600 dark:text-stone-300 hover:bg-stone-900/[0.05] dark:hover:bg-white/[0.06] hover:text-stone-900 dark:hover:text-white focus-visible:ring-stone-400/40",
    danger:
      "bg-rose-600 hover:bg-rose-500 text-white shadow-sm focus-visible:ring-rose-500/50",
    success:
      "bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm focus-visible:ring-emerald-500/50",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs gap-1.5",
    md: "px-4 py-2 text-sm gap-2",
    lg: "px-6 py-3 text-base gap-2.5",
    icon: "p-2 aspect-square",
  };

  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : Icon ? (
        <Icon className={cn(size === 'sm' ? "w-3.5 h-3.5" : size === 'lg' ? "w-5 h-5" : "w-4 h-4")} />
      ) : null}
      {children}
    </button>
  );
}

export function Badge({ children, variant = 'default', size = 'md', className }) {
  // De-rainbowed: everything collapses to the amber accent, a neutral slate, or the two
  // semantic status hues (emerald = done, rose = danger). Keys preserved for call sites.
  const variants = {
    default:
      "bg-stone-100 text-stone-600 border-stone-200 dark:bg-white/[0.06] dark:text-stone-300 dark:border-white/10",
    primary:
      "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/25",
    amber:
      "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/25",
    cyan:
      "bg-slate-500/10 text-slate-600 dark:text-slate-300 border-slate-400/20",
    purple:
      "bg-slate-500/10 text-slate-600 dark:text-slate-300 border-slate-400/20",
    emerald:
      "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/25",
    rose:
      "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/25",
  };

  const sizes = {
    sm: "px-2 py-0.5 text-[11px] font-medium",
    md: "px-2.5 py-1 text-xs font-semibold",
    lg: "px-3 py-1.5 text-sm font-semibold",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border",
        variants[variant] || variants.default,
        sizes[size],
        className
      )}
    >
      {children}
    </span>
  );
}

export function GlassCard({ children, className, hoverEffect = true, glow = false, ...props }) {
  return (
    <div
      className={cn(
        "rounded-xl border bg-white dark:bg-[#141416] border-stone-200/80 dark:border-white/[0.08] p-5 transition-colors duration-200",
        hoverEffect && "hover:border-stone-300 dark:hover:border-white/[0.16]",
        glow && "border-amber-500/40 dark:border-amber-500/30 shadow-glow-accent",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
