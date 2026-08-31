import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLearner } from '../../context/LearnerContext';
import { Send, X, Compass, Sparkles, CornerDownLeft } from 'lucide-react';
import { slideOverRight, backdrop } from '../../utils/motion';

const SUGGESTED_PROMPTS = [
  "Explain the core concept for my next roadmap stage.",
  "What prerequisites should I focus on first?",
  "Recommend high-impact practice projects for this track.",
];

export function AssistantDrawer({ isOpen, onClose }) {
  const { assistantMessages, sendAssistantMessage, path, goal } = useLearner();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [assistantMessages, isOpen]);

  // Lock body scroll + Escape to close while open
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener('keydown', onKey);
    };
  }, [isOpen, onClose]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    sendAssistantMessage(input);
    setInput('');
  };

  const handlePromptClick = (prompt) => sendAssistantMessage(prompt);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            variants={backdrop}
            initial="hidden"
            animate="show"
            exit="exit"
            onClick={onClose}
            className="fixed inset-0 z-50 bg-slate-950/25 backdrop-blur-[2px]"
          />
          <motion.aside
            variants={slideOverRight}
            initial="hidden"
            animate="show"
            exit="exit"
            className="fixed top-16 sm:top-20 bottom-4 sm:bottom-6 right-3 sm:right-6 z-50 w-[calc(100vw-1.5rem)] sm:w-[440px] max-h-[calc(100vh-5.5rem)] bg-white dark:bg-[#121620] border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl flex flex-col text-slate-900 dark:text-slate-100 overflow-hidden"
          >
            {/* Header (Violet & Indigo World) */}
            <div className="px-5 py-2 border-b border-slate-200 dark:border-white/10 flex items-center justify-between bg-slate-50/50 dark:bg-white/[0.01]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-sm text-white">
                  <Compass className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-display font-bold text-slate-900 dark:text-white text-sm">HADES AI Coach</h3>
                  </div>  
                  
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.06] transition"
                aria-label="Close coach"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {assistantMessages.map((msg) => (
                <div key={msg.id} className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.sender === 'assistant' && (
                    <div className="w-7 h-7 rounded-lg bg-violet-500/15 border border-violet-500/30 flex items-center justify-center shrink-0 mt-0.5">
                      <Compass className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
                    </div>
                  )}
                  <div
                    className={`max-w-[82%] rounded-2xl px-4 py-3 text-xs sm:text-[13px] leading-relaxed whitespace-pre-wrap ${
                      msg.sender === 'user'
                        ? 'bg-violet-600 text-white rounded-br-sm font-medium shadow-sm'
                        : 'bg-slate-100 dark:bg-white/[0.04] text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-white/[0.08] rounded-bl-sm'
                    }`}
                  >
                    {msg.content}
                    <div className={`mono-label text-[8px] mt-1.5 ${msg.sender === 'user' ? 'text-white/70 font-semibold' : 'text-slate-400 dark:text-slate-500'}`}>
                      {msg.timestamp}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
 

            {/* Composer */}
            <form onSubmit={handleSubmit} className="p-4 border-t border-slate-200 dark:border-white/10 bg-white dark:bg-[#121620]">
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about your roadmap, prerequisites, project ideas..."
                  className="w-full bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 rounded-xl pl-4 pr-12 py-2.5 text-xs sm:text-[13px] text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition"
                />
                <button
                  type="submit"
                  disabled={!input.trim()}
                  className="absolute right-1.5 p-2 rounded-lg bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:hover:bg-violet-600 text-white transition shadow-sm"
                  aria-label="Send message"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="mono-label text-[9px] text-slate-400 dark:text-slate-500 mt-2 flex items-center gap-1 justify-end font-medium">
                <CornerDownLeft className="w-3 h-3" /> Press Enter to send
              </p>
            </form>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
