import React from 'react';
import { cn } from '../../utils/cn';

/**
 * Editorial building blocks shared across every route. These encode the HADES visual
 * grammar (mono eyebrow labels, hairline dividers, restrained progress meters, custom
 * empty states, skeletons) so pages stay coherent without repeating markup.
 */

/* ------------------------------------------------------------------ Eyebrow ---- */
export function Eyebrow({ children, className, icon: Icon }) {
  return (
    <span className={cn('mono-label inline-flex items-center gap-1.5 text-amber-600 dark:text-amber-400/90', className)}>
      {Icon ? <Icon className="w-3 h-3" /> : null}
      {children}
    </span>
  );
}

/* ------------------------------------------------------------- SectionHeader ---- */
export function SectionHeader({ eyebrow, title, description, action, className, icon }) {
  return (
    <div className={cn('flex items-end justify-between gap-4', className)}>
      <div className="min-w-0">
        {eyebrow ? <Eyebrow icon={icon} className="mb-2">{eyebrow}</Eyebrow> : null}
        {title ? (
          <h2 className="font-display text-lg sm:text-xl font-semibold text-stone-900 dark:text-white tracking-tight">
            {title}
          </h2>
        ) : null}
        {description ? (
          <p className="mt-1 text-sm text-stone-500 dark:text-stone-400 max-w-2xl leading-relaxed">
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
        <span className="h-px flex-1 bg-stone-200 dark:bg-white/10" />
        <span className="mono-label text-stone-400 dark:text-stone-500">{label}</span>
        <span className="h-px flex-1 bg-stone-200 dark:bg-white/10" />
      </div>
    );
  }
  return <div className={cn('h-px w-full bg-stone-200 dark:bg-white/10', className)} />;
}

/* ------------------------------------------------------------------- StatCell ---- */
export function StatCell({ label, value, sub, icon: Icon, accent = false, className }) {
  return (
    <div className={cn('flex flex-col gap-1', className)}>
      <span className="mono-label text-stone-400 dark:text-stone-500 flex items-center gap-1.5">
        {Icon ? <Icon className="w-3 h-3" /> : null}
        {label}
      </span>
      <span
        className={cn(
          'font-display text-2xl font-semibold tabular-nums tracking-tight',
          accent ? 'text-amber-600 dark:text-amber-400' : 'text-stone-900 dark:text-white'
        )}
      >
        {value}
      </span>
      {sub ? <span className="text-xs text-stone-500 dark:text-stone-400">{sub}</span> : null}
    </div>
  );
}

/* ---------------------------------------------------------------- ProgressBar ---- */
export function ProgressBar({ value = 0, className, trackClassName, showValue = false, size = 'md' }) {
  const pct = Math.max(0, Math.min(100, value));
  const h = size === 'sm' ? 'h-1' : size === 'lg' ? 'h-2.5' : 'h-1.5';
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div className={cn('flex-1 rounded-full bg-stone-200 dark:bg-white/[0.08] overflow-hidden', h, trackClassName)}>
        <div
          className="h-full rounded-full bg-amber-500 transition-[width] duration-700 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
      {showValue ? (
        <span className="mono-label text-stone-500 dark:text-stone-400 tabular-nums w-9 text-right">
          {Math.round(pct)}%
        </span>
      ) : null}
    </div>
  );
}

/* -------------------------------------------------------------------- KbdKey ---- */
export function Kbd({ children, className }) {
  return (
    <kbd className={cn('mono-label inline-flex items-center rounded border border-stone-300 dark:border-white/15 bg-stone-50 dark:bg-white/[0.04] px-1.5 py-0.5 text-stone-500 dark:text-stone-400', className)}>
      {children}
    </kbd>
  );
}

/* ------------------------------------------------------------------ Skeleton ---- */
export function Skeleton({ className }) {
  return <div className={cn('skeleton', className)} />;
}

/* ---------------------------------------------------------------- EmptyState ---- */
export function EmptyState({ icon: Icon, title, description, action, className }) {
  return (
    <div className={cn('flex flex-col items-center justify-center text-center py-14 px-6', className)}>
      {Icon ? (
        <div className="w-12 h-12 rounded-xl border border-dashed border-stone-300 dark:border-white/15 flex items-center justify-center text-stone-400 dark:text-stone-500 mb-4">
          <Icon className="w-5 h-5" />
        </div>
      ) : null}
      {title ? (
        <h3 className="font-display text-base font-semibold text-stone-800 dark:text-stone-100">{title}</h3>
      ) : null}
      {description ? (
        <p className="mt-1.5 text-sm text-stone-500 dark:text-stone-400 max-w-sm leading-relaxed">{description}</p>
      ) : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

/* --------------------------------------------------------------------- Ring ----- */
/** Compact circular progress used for mastery / completion dials. */
export function ProgressRing({ value = 0, size = 72, stroke = 6, children, className }) {
  const pct = Math.max(0, Math.min(100, value));
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (pct / 100) * c;
  return (
    <div className={cn('relative inline-flex items-center justify-center', className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke}
          className="stroke-stone-200 dark:stroke-white/10"
        />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke}
          strokeDasharray={c} strokeDashoffset={offset} strokeLinecap="round"
          className="stroke-amber-500 transition-[stroke-dashoffset] duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">{children}</div>
    </div>
  );
}
