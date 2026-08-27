import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useLearner } from '../../context/LearnerContext';
import { NodeDetailDrawer } from './NodeDetailDrawer';
import { EmptyState } from '../ui';
import {
  Sparkles,
  CheckCircle2,
  Check,
  Send,
  ChevronRight,
  BookOpen,
  MinusCircle,
  Video,
  GitBranch,
  CornerDownLeft,
} from 'lucide-react';
import confetti from 'canvas-confetti';

const LEGEND = [
  { label: 'Done', dot: 'bg-emerald-500' },
  { label: 'Learning', dot: 'bg-amber-500' },
  { label: 'Queued', dot: 'bg-stone-300 dark:bg-white/25' },
  { label: 'Skipped', dot: 'bg-stone-200 dark:bg-white/10' },
];

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
        origin: { y: 0.6 },
        colors: ['#f59e0b', '#fbbf24', '#fcd34d'],
      });
    }
  };

  const handleAiPromptSubmit = (e) => {
    e.preventDefault();
    if (!aiPromptInput.trim()) return;
    openAssistant(aiPromptInput);
    setAiPromptInput('');
  };

  const mainNodes = roadmap?.mainNodes || [];

  return (
    <div className="relative rounded-2xl border border-stone-200 dark:border-white/[0.08] bg-white dark:bg-[#0d0d0f] overflow-hidden">
      <div className="absolute inset-0 bg-dots opacity-60 dark:opacity-100 pointer-events-none" />

      {/* ============================================ Canvas header */}
      <div className="relative px-5 sm:px-8 py-4 border-b border-stone-200 dark:border-white/[0.08] flex flex-wrap items-center justify-between gap-x-6 gap-y-3 bg-white/70 dark:bg-white/[0.02] backdrop-blur-sm">
        <div className="flex items-center gap-2.5 min-w-0">
          <GitBranch className="w-4 h-4 text-amber-500 shrink-0" strokeWidth={2.25} />
          <span className="mono-label text-stone-500 dark:text-stone-400 truncate">
            Skill graph · {mainNodes.length} stages
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          {LEGEND.map((l) => (
            <span key={l.label} className="flex items-center gap-1.5 mono-label text-stone-400 dark:text-stone-500">
              <span className={`w-2 h-2 rounded-full ${l.dot}`} />
              {l.label}
            </span>
          ))}
        </div>
      </div>

      {/* ============================================ Tree */}
      <div className="relative px-5 sm:px-8 py-10 sm:py-14">
        {mainNodes.length === 0 ? (
          <EmptyState
            icon={GitBranch}
            title="No roadmap generated yet"
            description="Name a goal and HADES will derive the skill graph, order the prerequisites, and rank the materials for each node."
          />
        ) : (
          <>
            {/* Root */}
            <div className="max-w-5xl mx-auto mb-12 sm:mb-16">
              <div className="inline-flex items-center gap-2 mono-label text-amber-600 dark:text-amber-400 mb-3">
                <Sparkles className="w-3.5 h-3.5" />
                Root track
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 dark:text-white leading-tight">
                {roadmap?.rootTopic || 'AI Systems Engineering'}
              </h2>
              <div className="mt-5 flex items-center gap-3">
                <span className="h-px flex-1 bg-stone-200 dark:bg-white/[0.08]" />
                <span className="mono-label text-stone-400 dark:text-stone-500">Prerequisites flow downward</span>
                <span className="h-px flex-1 bg-stone-200 dark:bg-white/[0.08]" />
              </div>
            </div>

            <div className="max-w-5xl mx-auto space-y-12 sm:space-y-16">
              {mainNodes.map((mainNode, nodeIdx) => {
                const total = mainNode.branches?.length || 0;
                const doneCount = mainNode.branches?.filter((b) => b.status === 'done').length || 0;

                return (
                  <div key={mainNode.id} className="relative grid lg:grid-cols-[300px_1fr] gap-6 lg:gap-10">
                    {/* ---------- Stage spine card ---------- */}
                    <div className="relative">
                      {/* Vertical rail to next stage */}
                      {nodeIdx < mainNodes.length - 1 && (
                        <span className="hidden lg:block absolute left-[15px] top-full h-12 sm:h-16 w-px bg-gradient-to-b from-stone-200 dark:from-white/[0.12] to-transparent" />
                      )}

                      <div className="lg:sticky lg:top-24">
                        <div className="flex items-start gap-3">
                          {/* Stage marker */}
                          <span
                            className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center border font-display text-xs font-bold tabular-nums ${
                              mainNode.status === 'done'
                                ? 'bg-emerald-500 border-emerald-500 text-white'
                                : mainNode.status === 'learning'
                                ? 'bg-amber-500 border-amber-500 text-stone-950'
                                : 'bg-white dark:bg-white/[0.04] border-stone-200 dark:border-white/10 text-stone-500 dark:text-stone-400'
                            }`}
                          >
                            {mainNode.status === 'done' ? <Check className="w-4 h-4" strokeWidth={3} /> : nodeIdx + 1}
                          </span>

                          <div className="min-w-0 pt-0.5">
                            <span className="mono-label text-stone-400 dark:text-stone-500 block mb-1.5">
                              Stage {String(nodeIdx + 1).padStart(2, '0')}
                            </span>
                            <h3 className="font-display text-lg font-bold tracking-tight text-stone-900 dark:text-white leading-snug">
                              {mainNode.title}
                            </h3>
                            <p className="text-[13px] text-stone-600 dark:text-stone-400 mt-2 leading-relaxed">
                              {mainNode.description}
                            </p>

                            {total > 0 && (
                              <div className="mt-4 max-w-[200px]">
                                <div className="flex justify-between items-baseline mb-1.5">
                                  <span className="mono-label text-stone-400 dark:text-stone-500">
                                    {doneCount}/{total} nodes
                                  </span>
                                </div>
                                <div className="h-1 rounded-full bg-stone-200 dark:bg-white/[0.08] overflow-hidden">
                                  <div
                                    className="h-full rounded-full bg-amber-500 transition-[width] duration-500"
                                    style={{ width: `${total ? (doneCount / total) * 100 : 0}%` }}
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* ---------- Branch nodes ---------- */}
                    <div className="relative pl-5 lg:pl-8 border-l border-stone-200 dark:border-white/[0.08] space-y-2.5">
                      {mainNode.branches?.map((branch) => {
                        const isSelected = selectedBranchNode?.id === branch.id;
                        const isDone = branch.status === 'done';
                        const isLearning = branch.status === 'learning';
                        const isSkip = branch.status === 'skip';

                        return (
                          <div key={branch.id} className="relative">
                            {/* Elbow connector */}
                            <span className="absolute -left-5 lg:-left-8 top-1/2 w-5 lg:w-8 h-px bg-stone-200 dark:bg-white/[0.08]" />

                            <div
                              onClick={() => handleNodeClick(mainNode.id, branch)}
                              role="button"
                              tabIndex={0}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                  e.preventDefault();
                                  handleNodeClick(mainNode.id, branch);
                                }
                              }}
                              className={`group relative rounded-xl border px-4 py-3.5 cursor-pointer transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/60 ${
                                isSelected
                                  ? 'border-amber-500 bg-amber-500/[0.06] dark:bg-amber-500/[0.08]'
                                  : isDone
                                  ? 'border-emerald-500/30 bg-emerald-500/[0.04] hover:border-emerald-500/60'
                                  : isLearning
                                  ? 'border-amber-500/50 bg-amber-500/[0.05] hover:border-amber-500'
                                  : isSkip
                                  ? 'border-stone-200 dark:border-white/[0.06] bg-transparent opacity-50 hover:opacity-75'
                                  : 'border-stone-200 dark:border-white/[0.08] bg-white dark:bg-white/[0.02] hover:border-stone-300 dark:hover:border-white/20'
                              }`}
                            >
                              {/* Quick status bar (hover / focus / selected) */}
                              <div
                                className={`absolute -top-3 right-3 z-20 items-center gap-0.5 p-1 rounded-lg bg-stone-900 dark:bg-[#1c1c20] border border-stone-700 dark:border-white/10 shadow-lg transition-opacity ${
                                  isSelected ? 'flex opacity-100' : 'hidden group-hover:flex group-focus-within:flex'
                                }`}
                              >
                                <button
                                  onClick={(e) => handleQuickStatus(e, mainNode.id, branch.id, 'learning')}
                                  title="Mark as learning"
                                  className={`flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-semibold transition ${
                                    isLearning ? 'bg-amber-500 text-stone-950' : 'text-stone-300 hover:bg-white/10 hover:text-white'
                                  }`}
                                >
                                  <BookOpen className="w-3 h-3" /> Learning
                                </button>
                                <button
                                  onClick={(e) => handleQuickStatus(e, mainNode.id, branch.id, 'done')}
                                  title="Mark as done"
                                  className={`flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-semibold transition ${
                                    isDone ? 'bg-emerald-500 text-white' : 'text-stone-300 hover:bg-white/10 hover:text-white'
                                  }`}
                                >
                                  <Check className="w-3 h-3" strokeWidth={3} /> Done
                                </button>
                                <button
                                  onClick={(e) => handleQuickStatus(e, mainNode.id, branch.id, 'skip')}
                                  title="Skip this node"
                                  className={`flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-semibold transition ${
                                    isSkip ? 'bg-stone-600 text-white' : 'text-stone-300 hover:bg-white/10 hover:text-white'
                                  }`}
                                >
                                  <MinusCircle className="w-3 h-3" /> Skip
                                </button>
                              </div>

                              <div className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-3 min-w-0">
                                  <span className="relative flex w-2 h-2 shrink-0">
                                    {isLearning && (
                                      <span className="absolute inline-flex w-full h-full rounded-full bg-amber-500 opacity-60 animate-ping" />
                                    )}
                                    <span
                                      className={`relative inline-flex w-2 h-2 rounded-full ${
                                        isDone
                                          ? 'bg-emerald-500'
                                          : isLearning
                                          ? 'bg-amber-500'
                                          : isSkip
                                          ? 'bg-stone-300 dark:bg-white/15'
                                          : 'bg-stone-300 dark:bg-white/25'
                                      }`}
                                    />
                                  </span>

                                  <h4
                                    className={`text-[13px] sm:text-sm font-medium leading-snug truncate ${
                                      isSkip
                                        ? 'text-stone-400 dark:text-stone-500 line-through'
                                        : 'text-stone-900 dark:text-white'
                                    }`}
                                  >
                                    {branch.title}
                                  </h4>
                                </div>

                                <div className="flex items-center gap-2.5 shrink-0">
                                  {branch.rankedVideos?.length > 0 && (
                                    <span className="hidden sm:flex items-center gap-1 mono-label text-stone-400 dark:text-stone-500">
                                      <Video className="w-3 h-3" />
                                      {branch.rankedVideos.length}
                                    </span>
                                  )}
                                  {isDone ? (
                                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                  ) : (
                                    <ChevronRight className="w-4 h-4 text-stone-300 dark:text-stone-600 group-hover:text-amber-500 group-hover:translate-x-0.5 transition" />
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* ============================================ Sticky coach prompt bar */}
      <div className="sticky bottom-4 z-30 px-5 sm:px-8 pb-4">
        <motion.form
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          onSubmit={handleAiPromptSubmit}
          className="max-w-2xl mx-auto flex items-center gap-2 p-1.5 rounded-xl glass-panel border border-stone-200 dark:border-white/10 shadow-elev"
        >
          <span className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4 text-stone-950" strokeWidth={2.25} />
          </span>
          <input
            type="text"
            value={aiPromptInput}
            onChange={(e) => setAiPromptInput(e.target.value)}
            placeholder="Ask the coach about any node on this graph…"
            className="flex-1 min-w-0 bg-transparent border-none text-sm text-stone-900 dark:text-white placeholder-stone-400 dark:placeholder-stone-500 focus:outline-none px-1.5"
          />
          <button
            type="submit"
            disabled={!aiPromptInput.trim()}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-stone-900 dark:bg-white text-white dark:text-stone-950 text-xs font-semibold transition disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-90 shrink-0"
          >
            <span className="hidden sm:inline">Ask</span>
            <Send className="w-3.5 h-3.5 sm:hidden" />
            <CornerDownLeft className="w-3.5 h-3.5 hidden sm:inline" />
          </button>
        </motion.form>
      </div>

      {/* Slide-over node detail */}
      <NodeDetailDrawer
        node={selectedBranchNode}
        mainNodeId={activeMainNodeId}
        onClose={() => setSelectedBranchNode(null)}
      />
    </div>
  );
}
