import React from 'react';
import { Bot, Sparkles } from 'lucide-react';
import { AssistantDrawer } from './AssistantDrawer';
import { useLearner } from '../../context/LearnerContext';

export function FloatingCoachWidget() {
  const { isAssistantOpen, openAssistant, closeAssistant } = useLearner();

  return (
    <>
      {/* Persistent Floating Bottom-Right Button */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2 pointer-events-auto">
        <button
          onClick={() => isAssistantOpen ? closeAssistant() : openAssistant()}
          className="group flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 text-white font-bold text-xs sm:text-sm shadow-[0_0_25px_rgba(99,102,241,0.5)] hover:shadow-[0_0_35px_rgba(6,182,212,0.6)] hover:scale-105 transition-all duration-200 border border-white/20 select-none"
        >
          <div className="relative flex items-center justify-center">
            <Bot className="w-5 h-5 group-hover:rotate-12 transition-transform duration-200" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-cyan-300 animate-ping" />
          </div>
          <span className="tracking-wide">AI Coach</span>
          <Sparkles className="w-3.5 h-3.5 text-cyan-200 animate-pulse" />
        </button>
      </div>

      {/* Contextual Slide-Over AI Chat Drawer */}
      <AssistantDrawer
        isOpen={isAssistantOpen}
        onClose={closeAssistant}
      />
    </>
  );
}
