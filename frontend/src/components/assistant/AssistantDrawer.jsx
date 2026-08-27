import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLearner } from '../../context/LearnerContext';
import { Send, X, Compass, Sparkles, CornerDownLeft } from 'lucide-react';
import { suggestedPrompts } from '../../mock/mockData';
import { slideOverRight, backdrop } from '../../utils/motion';

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
            className="fixed inset-0 z-50 bg-stone-950/40 backdrop-blur-sm"
          />
          <motion.aside
            variants={slideOverRight}
            initial="hidden"
            animate="show"
            exit="exit"
            className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white dark:bg-[#0e0e10] border-l border-stone-200 dark:border-white/[0.08] flex flex-col text-stone-900 dark:text-stone-100"
          >
            {/* Header */}
            <div className="px-4 py-3.5 border-b border-stone-200 dark:border-white/[0.08] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-amber-500 flex items-center justify-center">
                  <Compass className="w-5 h-5 text-stone-950" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-display font-semibold text-stone-900 dark:text-white text-sm">HADES Coach</h3>
                    <span className="mono-label text-[8px] text-amber-600 dark:text-amber-400 border border-amber-500/30 rounded px-1 py-0.5">
                      Context-aware
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">Knows your goal &amp; where you are</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-stone-400 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-white/[0.06] transition"
                aria-label="Close coach"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Context bar */}
            <div className="px-4 py-2.5 bg-stone-50 dark:bg-white/[0.02] border-b border-stone-200 dark:border-white/[0.08] flex items-center justify-between">
              <span className="text-[11px] text-stone-600 dark:text-stone-300 flex items-center gap-1.5 min-w-0">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                <span className="truncate">
                  {path?.phases?.[0]?.title || 'Foundations & Vector Architecture'}
                </span>
              </span>
              <span className="mono-label text-[9px] text-stone-400 dark:text-stone-500 shrink-0 ml-2">
                {path?.overallProgress ?? 45}% · {goal?.targetRole ? goal.targetRole.split(' ')[0] : 'Goal'}
              </span>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {assistantMessages.map((msg) => (
                <div key={msg.id} className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.sender === 'assistant' && (
                    <div className="w-7 h-7 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center shrink-0 mt-0.5">
                      <Compass className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                    </div>
                  )}
                  <div
                    className={`max-w-[82%] rounded-xl px-3.5 py-2.5 text-[13px] leading-relaxed whitespace-pre-wrap ${
                      msg.sender === 'user'
                        ? 'bg-amber-500 text-stone-950 rounded-br-sm'
                        : 'bg-stone-100 dark:bg-white/[0.05] text-stone-800 dark:text-stone-200 border border-stone-200 dark:border-white/[0.06] rounded-bl-sm'
                    }`}
                  >
                    {msg.content}
                    <div className={`mono-label text-[8px] mt-1.5 ${msg.sender === 'user' ? 'text-stone-800/60' : 'text-stone-400 dark:text-stone-500'}`}>
                      {msg.timestamp}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Suggested prompts */}
            <div className="p-3 border-t border-stone-200 dark:border-white/[0.08]">
              <div className="mono-label text-stone-400 dark:text-stone-500 mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-amber-500" /> Try asking
              </div>
              <div className="flex flex-wrap gap-1.5">
                {suggestedPrompts.slice(0, 3).map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handlePromptClick(prompt)}
                    className="text-left text-xs bg-stone-50 dark:bg-white/[0.03] hover:bg-amber-500/10 text-stone-600 dark:text-stone-300 hover:text-amber-700 dark:hover:text-amber-300 border border-stone-200 dark:border-white/10 hover:border-amber-500/40 px-2.5 py-1.5 rounded-lg transition line-clamp-1"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>

            {/* Composer */}
            <form onSubmit={handleSubmit} className="p-3 border-t border-stone-200 dark:border-white/[0.08]">
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about your path, prerequisites, what to build…"
                  className="w-full bg-stone-50 dark:bg-white/[0.03] border border-stone-200 dark:border-white/10 rounded-lg pl-3.5 pr-11 py-2.5 text-[13px] text-stone-900 dark:text-white placeholder-stone-400 dark:placeholder-stone-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/40 transition"
                />
                <button
                  type="submit"
                  disabled={!input.trim()}
                  className="absolute right-1.5 p-1.5 rounded-md bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:hover:bg-amber-500 text-stone-950 transition"
                  aria-label="Send"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              <p className="mono-label text-[9px] text-stone-400 dark:text-stone-500 mt-2 flex items-center gap-1 justify-end">
                <CornerDownLeft className="w-3 h-3" /> to send
              </p>
            </form>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
