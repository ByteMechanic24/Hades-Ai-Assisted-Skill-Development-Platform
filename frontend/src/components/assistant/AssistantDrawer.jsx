import React, { useState, useRef, useEffect } from 'react';
import { useLearner } from '../../context/LearnerContext';
import { Button, Badge } from '../ui';
import { Bot, Send, Sparkles, X, ChevronRight, MessageSquare, Flame, CheckCircle2 } from 'lucide-react';
import { suggestedPrompts } from '../../mock/mockData';

export function AssistantDrawer({ isOpen, onClose }) {
  const { assistantMessages, sendAssistantMessage, path, goal } = useLearner();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [assistantMessages, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    sendAssistantMessage(input);
    setInput('');
  };

  const handlePromptClick = (prompt) => {
    sendAssistantMessage(prompt);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white dark:bg-[#0e1626]/95 backdrop-blur-xl border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col transition-all duration-300 animate-in slide-in-from-right text-slate-900 dark:text-slate-100">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800/80 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-indigo-500/30 text-white">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-slate-900 dark:text-white text-sm">HADES AI Coach</h3>
              <Badge variant="cyan" size="sm">Context-Aware</Badge>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Syncing with Phase 1 & Active Goals</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Context Badge */}
      <div className="px-4 py-2 bg-indigo-50 dark:bg-indigo-950/40 border-b border-indigo-100 dark:border-indigo-500/20 flex items-center justify-between text-xs">
        <span className="text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5 font-medium">
          <Flame className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
          Active: <strong className="text-slate-900 dark:text-white font-semibold">{path?.phases?.[0]?.title || "Foundations & Vector Architecture"}</strong>
        </span>
        <span className="text-slate-500 dark:text-slate-400 font-mono">{path?.overallProgress || 45}% Complete</span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {assistantMessages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.sender === 'assistant' && (
              <div className="w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-600/30 border border-indigo-200 dark:border-indigo-500/40 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              </div>
            )}
            <div
              className={`max-w-[82%] rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${
                msg.sender === 'user'
                  ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white rounded-br-none shadow-md shadow-indigo-600/20'
                  : 'bg-slate-100 dark:bg-slate-800/90 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700/60 rounded-bl-none shadow-sm'
              }`}
            >
              {msg.content}
              <div
                className={`text-[10px] mt-1.5 ${
                  msg.sender === 'user' ? 'text-indigo-100' : 'text-slate-400 dark:text-slate-500'
                }`}
              >
                {msg.timestamp}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompts */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800/60 bg-slate-50 dark:bg-slate-900/30">
        <div className="text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-2 flex items-center gap-1.5">
          <Sparkles className="w-3 h-3 text-indigo-600 dark:text-cyan-400" /> Suggested contextual questions:
        </div>
        <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
          {suggestedPrompts.slice(0, 3).map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handlePromptClick(prompt)}
              className="text-left text-xs bg-white dark:bg-slate-800/80 hover:bg-indigo-50 dark:hover:bg-indigo-950/80 text-slate-700 dark:text-slate-300 hover:text-indigo-700 dark:hover:text-indigo-200 border border-slate-200 dark:border-slate-700/60 hover:border-indigo-400 dark:hover:border-indigo-500/40 px-2.5 py-1 rounded-lg transition duration-150 line-clamp-1"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Composer */}
      <form onSubmit={handleSubmit} className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80">
        <div className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your roadmap, prerequisites..."
            className="w-full bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-700/80 rounded-xl pl-3.5 pr-12 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="absolute right-1.5 p-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:hover:bg-indigo-600 text-white transition shadow-md shadow-indigo-600/30"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
