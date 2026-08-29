import React from 'react';
import { Radar } from 'lucide-react';
import { cn } from '../../utils/cn';

/**
 * Pixel-perfect HADES Brand Logo component matching the official design specification:
 * - Rounded squircle in vibrant electric iris / purple (#5B50E5)
 * - Pure white Radar glyph
 * - Bold HADES wordmark + Monospace MISSION CONTROL subtitle
 */
export function BrandLogo({ className, subtitle = 'MISSION CONTROL', size = 'md', lightText = false }) {
  const isSm = size === 'sm';

  return (
    <div className={cn('flex items-center gap-3 select-none group', className)}>
      <div
        className={cn(
          'rounded-[14px] bg-[#5B50E5] flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform text-white shrink-0',
          isSm ? 'w-8 h-8 min-w-[32px] rounded-[10px]' : 'w-10 h-10 min-w-[40px]'
        )}
      >
        <Radar className={cn('text-white', isSm ? 'w-4 h-4' : 'w-5 h-5')} strokeWidth={2.5} />
      </div>
      <div className="flex flex-col justify-center leading-none">
        <span
          className={cn(
            'font-display font-extrabold tracking-tight',
            lightText ? 'text-white' : 'text-slate-900 dark:text-white',
            isSm ? 'text-sm' : 'text-base sm:text-lg'
          )}
        >
          HADES
        </span>
        <span
          className={cn(
            'font-mono font-semibold tracking-wider uppercase mt-0.5',
            lightText ? 'text-slate-300/80' : 'text-slate-400 dark:text-slate-500',
            isSm ? 'text-[8px]' : 'text-[10px]'
          )}
        >
          {subtitle}
        </span>
      </div>
    </div>
  );
}
