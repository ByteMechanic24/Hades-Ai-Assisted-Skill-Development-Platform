import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Compass, X } from 'lucide-react';
import { AssistantDrawer } from './AssistantDrawer';
import { useLearner } from '../../context/LearnerContext';

export function FloatingCoachWidget() {
  const { isAssistantOpen, openAssistant, closeAssistant } = useLearner();

  return (
    <>
      {/* Persistent floating trigger, bottom-right */}
      <div className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-40 pointer-events-auto">
        <button
          type="button"
          onClick={() => (isAssistantOpen ? closeAssistant() : openAssistant())}
          aria-label={isAssistantOpen ? 'Close HADES AI Coach' : 'Open HADES AI Coach'}
          className="group relative flex items-center gap-2.5 pl-3.5 pr-4 py-2.5 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-950 shadow-elev hover:scale-105 hover:-translate-y-0.5 transition-all duration-200 border border-slate-700 dark:border-slate-200 select-none"
        >
          <span className="relative flex items-center justify-center w-6 h-6 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-sm">
            <AnimatePresence mode="wait" initial={false}>
              {isAssistantOpen ? (
                <motion.span
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="flex"
                >
                  <X className="w-3.5 h-3.5" strokeWidth={2.5} />
                </motion.span>
              ) : (
                <motion.span
                  key="open"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="flex"
                >
                  <Compass className="w-3.5 h-3.5" strokeWidth={2.5} />
                </motion.span>
              )}
            </AnimatePresence>
            {!isAssistantOpen && (
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-cyan-400 ring-2 ring-slate-900 dark:ring-white animate-pulse" />
            )}
          </span>
          <span className="font-bold text-xs tracking-tight pr-0.5">
            {isAssistantOpen ? 'Close Coach' : 'Ask Coach'}
          </span>
        </button>
      </div>

      {/* Contextual slide-over coach drawer */}
      <AssistantDrawer isOpen={isAssistantOpen} onClose={closeAssistant} />
    </>
  );
}
