import React from 'react';
import { cn } from '../../utils/cn';

/**
 * Multi-Color Editorial Design Building Blocks
 * Supports Light & Dark modes, WCAG contrast, and page-specific color accents.
 */

/* ------------------------------------------------------------------ Eyebrow ---- */
export function Eyebrow({ children, className, icon: Icon, variant = 'indigo' }) {
  const variants = {
    indigo: 'text-indigo-600 dark:text-indigo-400',
    violet: 'text-violet-600 dark:text-violet-400',
    cyan: 'text-cyan-600 dark:text-cyan-400',
    teal: 'text-teal-600 dark:text-teal-400',
    emerald: 'text-emerald-600 dark:text-emerald-400',
    coral: 'text-rose-600 dark:text-rose-400',
    amber: 'text-indigo-600 dark:text-indigo-400',
  };

  const iconColors = {
    indigo: 'text-indigo-500',
    violet: 'text-violet-500',
    cyan: 'text-cyan-500',
    teal: 'text-teal-500',
    emerald: 'text-emerald-500',
    coral: 'text-rose-500',
    amber: 'text-indigo-500',
  };

  return (
    <span className={cn('mono-label inline-flex items-center gap-1.5 font-bold', variants[variant] || variants.indigo, className)}>
      {Icon ? <Icon className={cn("w-3.5 h-3.5", iconColors[variant] || iconColors.indigo)} /> : null}
      {children}
    </span>
  );
}

/* ------------------------------------------------------------- SectionHeader ---- */
export function SectionHeader({ eyebrow, title, description, action, className, icon, variant = 'indigo' }) {
  return (
    <div className={cn('flex flex-col sm:flex-row sm:items-end justify-between gap-4', className)}>
      <div className="min-w-0">
        {eyebrow ? <Eyebrow icon={icon} variant={variant} className="mb-2">{eyebrow}</Eyebrow> : null}
        {title ? (
          <h2 className="font-display text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            {title}
          </h2>
        ) : null}
        {description ? (
          <p className="mt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

/* -------------------------------------------------------------------- Divider ---- */
export function Divider({ className, label }) {
  if (label) {
    return (
      <div className={cn('flex items-center gap-3', className)}>
        <span className="h-px flex-1 bg-slate-200 dark:bg-white/10" />
        <span className="mono-label text-slate-400 dark:text-slate-500 font-medium text-[10px]">{label}</span>
        <span className="h-px flex-1 bg-slate-200 dark:bg-white/10" />
      </div>
    );
  }
  return <div className={cn('h-px w-full bg-slate-200 dark:bg-white/10', className)} />;
}

/* ------------------------------------------------------------------- StatCell ---- */
export function StatCell({ label, value, sub, icon: Icon, accent = false, variant = 'indigo', className }) {
  const accentText = {
    indigo: 'text-indigo-600 dark:text-indigo-400',
    violet: 'text-violet-600 dark:text-violet-400',
    cyan: 'text-cyan-600 dark:text-cyan-400',
    teal: 'text-teal-600 dark:text-teal-400',
    emerald: 'text-emerald-600 dark:text-emerald-400',
    coral: 'text-rose-600 dark:text-rose-400',
    amber: 'text-indigo-600 dark:text-indigo-400',
  };

  const iconColors = {
    indigo: 'text-indigo-500',
    violet: 'text-violet-500',
    cyan: 'text-cyan-500',
    teal: 'text-teal-500',
    emerald: 'text-emerald-500',
    coral: 'text-rose-500',
    amber: 'text-indigo-500',
  };

  return (
    <div className={cn('flex flex-col gap-1', className)}>
      <span className="mono-label text-slate-500 dark:text-slate-400 flex items-center gap-1.5 font-medium text-[10px]">
        {Icon ? <Icon className={cn("w-3.5 h-3.5", iconColors[variant] || iconColors.indigo)} /> : null}
        {label}
      </span>
      <span
        className={cn(
          'font-display text-2xl sm:text-3xl font-bold tabular-nums tracking-tight',
          accent ? (accentText[variant] || accentText.indigo) : 'text-slate-900 dark:text-white'
        )}
      >
        {value}
      </span>
      {sub ? <span className="text-xs text-slate-500 dark:text-slate-400">{sub}</span> : null}
    </div>
  );
}

/* ---------------------------------------------------------------- ProgressBar ---- */
export function ProgressBar({ value = 0, className, trackClassName, showValue = false, size = 'md', variant = 'indigo' }) {
  const pct = Math.max(0, Math.min(100, value));
  const h = size === 'sm' ? 'h-1.5' : size === 'lg' ? 'h-3' : 'h-2';

  const barGradients = {
    indigo: 'bg-gradient-to-r from-indigo-600 to-indigo-400',
    violet: 'bg-gradient-to-r from-violet-600 to-violet-400',
    cyan: 'bg-gradient-to-r from-cyan-600 to-cyan-400',
    teal: 'bg-gradient-to-r from-teal-600 to-teal-400',
    emerald: 'bg-gradient-to-r from-emerald-600 to-emerald-400',
    coral: 'bg-gradient-to-r from-rose-600 to-rose-400',
    amber: 'bg-gradient-to-r from-indigo-600 to-violet-400',
  };

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div className={cn('flex-1 rounded-full bg-slate-200 dark:bg-white/[0.08] overflow-hidden', h, trackClassName)}>
        <div
          className={cn("h-full rounded-full transition-[width] duration-700 ease-out", barGradients[variant] || barGradients.indigo)}
          style={{ width: `${pct}%` }}
        />
      </div>
      {showValue ? (
        <span className="mono-label text-slate-600 dark:text-slate-400 tabular-nums w-10 text-right font-semibold text-xs">
          {Math.round(pct)}%
        </span>
      ) : null}
    </div>
  );
}

/* -------------------------------------------------------------------- KbdKey ---- */
export function Kbd({ children, className }) {
  return (
    <kbd className={cn('mono-label inline-flex items-center rounded border border-slate-300 dark:border-white/15 bg-slate-100 dark:bg-white/[0.04] px-1.5 py-0.5 text-slate-600 dark:text-slate-400 text-[10px]', className)}>
      {children}
    </kbd>
  );
}

/* ---------------------------------------------------------------- EmptyState ---- */
export function EmptyState({ icon: Icon, title, description, action, className }) {
  return (
    <div className={cn('flex flex-col items-center justify-center text-center py-12 px-6', className)}>
      {Icon ? (
        <div className="w-12 h-12 rounded-2xl border border-dashed border-slate-300 dark:border-white/15 flex items-center justify-center text-slate-400 dark:text-slate-500 mb-4 bg-slate-50 dark:bg-white/[0.02]">
          <Icon className="w-5 h-5" />
        </div>
      ) : null}
      {title ? (
        <h3 className="font-display text-base font-bold text-slate-800 dark:text-slate-100">{title}</h3>
      ) : null}
      {description ? (
        <p className="mt-1.5 text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed">{description}</p>
      ) : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

/* --------------------------------------------------------------------- Ring ----- */
export function ProgressRing({ value = 0, size = 68, stroke = 6, children, variant = 'indigo', className }) {
  const pct = Math.max(0, Math.min(100, value));
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (pct / 100) * c;

  const strokeColors = {
    indigo: 'stroke-indigo-600 dark:stroke-indigo-400',
    violet: 'stroke-violet-600 dark:stroke-violet-400',
    cyan: 'stroke-cyan-600 dark:stroke-cyan-400',
    teal: 'stroke-teal-600 dark:stroke-teal-400',
    emerald: 'stroke-emerald-600 dark:stroke-emerald-400',
    coral: 'stroke-rose-600 dark:stroke-rose-400',
    amber: 'stroke-indigo-600 dark:stroke-indigo-400',
  };

  return (
    <div className={cn('relative inline-flex items-center justify-center shrink-0', className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke}
          className="stroke-slate-200 dark:stroke-white/10"
        />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke}
          strokeDasharray={c} strokeDashoffset={offset} strokeLinecap="round"
          className={cn("transition-[stroke-dashoffset] duration-700 ease-out", strokeColors[variant] || strokeColors.indigo)}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        {children}
      </div>
    </div>
  );
}
