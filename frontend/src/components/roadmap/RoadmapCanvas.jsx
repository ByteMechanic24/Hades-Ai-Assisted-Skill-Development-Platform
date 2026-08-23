import React, { useState } from 'react';
import { useLearner } from '../../context/LearnerContext';
import { NodeDetailDrawer } from './NodeDetailDrawer';
import { Badge, Button } from '../ui';
import { 
  Sparkles, 
  CheckCircle2, 
  Check, 
  BookOpen, 
  X, 
  Bot, 
  Send, 
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Flame,
  Layers,
  Info
} from 'lucide-react';
import confetti from 'canvas-confetti';

export function RoadmapCanvas() {
  const { roadmap, updateBranchStatus, selectedBranchNode, setSelectedBranchNode, openAssistant } = useLearner();
  const [activeMainNodeId, setActiveMainNodeId] = useState(null);
  const [aiPromptInput, setAiPromptInput] = useState('');

  const handleNodeClick = (mainNodeId, branch) => {
    setActiveMainNodeId(mainNodeId);
    setSelectedBranchNode(branch);
  };

  const handleQuickStatus = (e, mainNodeId, branchId, status) => {
    e.stopPropagation();
    updateBranchStatus(mainNodeId, branchId, status);
    if (status === 'done') {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 }
      });
    }
  };

  const handleAiPromptSubmit = (e) => {
    e.preventDefault();
    if (!aiPromptInput.trim()) return;
    openAssistant(aiPromptInput);
    setAiPromptInput('');
  };

  return (
    <div className="relative min-h-[900px] bg-slate-100/70 dark:bg-[#0c1220] border border-slate-200 dark:border-slate-800/80 rounded-3xl p-6 sm:p-10 shadow-xl dark:shadow-2xl overflow-hidden transition-colors duration-200">
      {/* Top Legend (Matching roadmap.sh) */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800/80">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-amber-400 animate-pulse"></span>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider font-mono">
            Interactive AI Engineering Roadmap
          </h3>
        </div>

        {/* Legend Pills */}
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Done
          </span>
          <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span> Learning
          </span>
          <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-400 dark:bg-slate-500"></span> Skip
          </span>
          <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span> Recommended
          </span>
        </div>
      </div>

      {/* Main Roadmap Tree Area */}
      <div className="py-12 max-w-5xl mx-auto flex flex-col items-center">
        {/* Tree Root Topic */}
        <div className="mb-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-100 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-500/40 text-indigo-700 dark:text-indigo-300 text-xs font-bold mb-3 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-cyan-400" />
            <span>AI Systems & LLMOps Track</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white font-display">
            {roadmap?.rootTopic || "AI Systems Engineering"}
          </h2>
        </div>

        {/* Vertical Connected Nodes */}
        <div className="w-full flex flex-col items-center space-y-12 relative">
          {/* Central Vertical Connector Line */}
          <div className="absolute top-4 bottom-4 left-1/2 -translate-x-1/2 w-0.5 border-l-2 border-dashed border-indigo-400/40 dark:border-indigo-500/30 -z-0 pointer-events-none" />

          {roadmap?.mainNodes?.map((mainNode, nodeIdx) => (
            <div key={mainNode.id} className="w-full max-w-4xl relative z-10">
              <div className="flex flex-col lg:flex-row items-center lg:items-start justify-between gap-8">
                {/* Main Spine Node (Yellow / Neon Box matching roadmap.sh) */}
                <div className="w-full lg:w-[320px] flex-shrink-0">
                  <div
                    className={`p-5 rounded-2xl transition-all duration-300 border-2 shadow-xl ${
                      mainNode.status === 'done'
                        ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-amber-400/20'
                        : mainNode.status === 'learning'
                        ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 border-amber-300 ring-2 ring-amber-400/40 shadow-amber-500/30'
                        : 'bg-white dark:bg-[#1a2333] text-slate-900 dark:text-slate-100 border-slate-200 dark:border-slate-700 hover:border-amber-400/60'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-[10px] uppercase font-mono font-bold ${
                        mainNode.status === 'done' || mainNode.status === 'learning' ? 'text-slate-900/80' : 'text-amber-600 dark:text-amber-400'
                      }`}>
                        Stage 0{nodeIdx + 1}
                      </span>
                      {mainNode.status === 'done' && (
                        <CheckCircle2 className="w-4 h-4 text-slate-950" />
                      )}
                    </div>
                    <h3 className="text-base sm:text-lg font-black font-display leading-tight">
                      {mainNode.title}
                    </h3>
                    <p className={`text-xs mt-1.5 leading-snug ${
                      mainNode.status === 'done' || mainNode.status === 'learning' ? 'text-slate-900/80 font-medium' : 'text-slate-500 dark:text-slate-400'
                    }`}>
                      {mainNode.description}
                    </p>
                  </div>
                </div>

                {/* Branches Container (Right Side Sub-Nodes) */}
                <div className="flex-1 w-full space-y-3 relative">
                  {mainNode.branches?.map((branch) => {
                    const isSelected = selectedBranchNode?.id === branch.id;
                    return (
                      <div
                        key={branch.id}
                        onClick={() => handleNodeClick(mainNode.id, branch)}
                        className={`group relative p-4 rounded-2xl border-2 transition-all duration-200 cursor-pointer ${
                          branch.status === 'done'
                            ? 'bg-white dark:bg-[#131d2e] border-emerald-400 dark:border-emerald-500/60 text-slate-900 dark:text-slate-200 hover:border-emerald-500 shadow-sm'
                            : branch.status === 'learning'
                            ? 'bg-purple-50/90 dark:bg-gradient-to-r dark:from-purple-950/70 dark:to-[#161f33] border-purple-500 ring-2 ring-purple-500/30 shadow-md'
                            : branch.status === 'skip'
                            ? 'bg-slate-100/50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 opacity-60'
                            : 'bg-amber-50 dark:bg-amber-100/90 hover:bg-amber-100 text-slate-950 border-amber-300 shadow-sm'
                        } ${isSelected ? 'ring-2 ring-indigo-500' : ''}`}
                      >
                        {/* Hover Quick Action Bar: Learning | Done | Skip */}
                        <div className="absolute -top-3.5 right-4 z-20 hidden group-hover:flex items-center bg-slate-900 dark:bg-slate-950 border border-slate-700 rounded-xl shadow-xl p-1 gap-1 animate-in fade-in zoom-in-95">
                          <button
                            onClick={(e) => handleQuickStatus(e, mainNode.id, branch.id, 'learning')}
                            className={`px-2.5 py-0.5 rounded-lg text-[11px] font-bold transition ${
                              branch.status === 'learning'
                                ? 'bg-purple-600 text-white'
                                : 'text-slate-300 hover:bg-slate-800'
                            }`}
                          >
                            📖 Learning
                          </button>
                          <button
                            onClick={(e) => handleQuickStatus(e, mainNode.id, branch.id, 'done')}
                            className={`px-2.5 py-0.5 rounded-lg text-[11px] font-bold transition ${
                              branch.status === 'done'
                                ? 'bg-emerald-600 text-white'
                                : 'text-slate-300 hover:bg-slate-800'
                            }`}
                          >
                            ✓ Done
                          </button>
                          <button
                            onClick={(e) => handleQuickStatus(e, mainNode.id, branch.id, 'skip')}
                            className={`px-2.5 py-0.5 rounded-lg text-[11px] font-bold transition ${
                              branch.status === 'skip'
                                ? 'bg-slate-700 text-white'
                                : 'text-slate-300 hover:bg-slate-800'
                            }`}
                          >
                            ✕ Skip
                          </button>
                        </div>

                        {/* Node Content */}
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                              branch.status === 'done'
                                ? 'bg-emerald-500'
                                : branch.status === 'learning'
                                ? 'bg-purple-500 animate-ping'
                                : branch.status === 'skip'
                                ? 'bg-slate-400 dark:bg-slate-600'
                                : 'bg-amber-500'
                            }`} />
                            <h4 className={`text-xs sm:text-sm font-bold leading-tight ${
                              branch.status === 'done' || branch.status === 'learning' ? 'text-slate-900 dark:text-white' : branch.status === 'skip' ? 'text-slate-400 line-through' : 'text-slate-950 font-extrabold'
                            }`}>
                              {branch.title}
                            </h4>
                          </div>

                          <div className="flex items-center gap-2 flex-shrink-0">
                            {branch.rankedVideos?.length > 0 && (
                              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-900/90 text-indigo-700 dark:text-cyan-300 border border-slate-200 dark:border-slate-700 hidden sm:inline">
                                {branch.rankedVideos.length} Videos
                              </span>
                            )}
                            {branch.status === 'done' ? (
                              <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                                <Check className="w-3.5 h-3.5" />
                              </div>
                            ) : (
                              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:translate-x-0.5 transition" />
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Floating Bottom AI Tutor Prompt Bar */}
      <div className="sticky bottom-4 max-w-xl mx-auto z-30">
        <form
          onSubmit={handleAiPromptSubmit}
          className="p-2 rounded-2xl bg-white/95 dark:bg-gradient-to-r dark:from-slate-950/95 dark:via-indigo-950/95 dark:to-slate-950/95 backdrop-blur-xl border border-slate-300 dark:border-indigo-500/40 shadow-xl dark:shadow-2xl flex items-center gap-2"
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center text-white flex-shrink-0 shadow-md">
            <Sparkles className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={aiPromptInput}
            onChange={(e) => setAiPromptInput(e.target.value)}
            placeholder="AI Tutor: Have a question about this roadmap? Type here..."
            className="flex-1 bg-transparent border-none text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none px-2"
          />
          <button
            type="submit"
            disabled={!aiPromptInput.trim()}
            className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-xs font-bold transition shadow-sm flex items-center gap-1.5"
          >
            Ask <Send className="w-3 h-3" />
          </button>
        </form>
      </div>

      {/* Slide-over Node Detail Drawer with Ranked YouTube Videos */}
      <NodeDetailDrawer
        node={selectedBranchNode}
        mainNodeId={activeMainNodeId}
        onClose={() => setSelectedBranchNode(null)}
      />
    </div>
  );
}
