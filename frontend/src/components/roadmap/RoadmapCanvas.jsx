import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useLearner } from '../../context/LearnerContext';
import { NodeDetailDrawer } from './NodeDetailDrawer';
import { EmptyState } from '../ui';
import {
  Sparkles,
  CheckCircle2,
  Check,
  ChevronRight,
  BookOpen,
  MinusCircle,
  Video,
  GitBranch
} from 'lucide-react';
import confetti from 'canvas-confetti';

const LEGEND = [
  { label: 'Completed', dot: 'bg-emerald-500' },
  { label: 'In Progress', dot: 'bg-violet-500' },
  { label: 'Queued', dot: 'bg-slate-300 dark:bg-white/25' },
  { label: 'Skipped', dot: 'bg-slate-200 dark:bg-white/10' },
];

export function RoadmapCanvas() {
  const { roadmap, updateBranchStatus, selectedBranchNode, setSelectedBranchNode } = useLearner();
  const [activeMainNodeId, setActiveMainNodeId] = useState(null);

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
        colors: ['#10b981', '#34d399', '#6ee7b7'],
      });
    }
  };

  const mainNodes = roadmap?.mainNodes || [];

  return (
    <div className="relative rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#121620] overflow-hidden shadow-card">
      <div className="absolute inset-0 bg-dots opacity-25 pointer-events-none" />

      {/* ============================================ Canvas Header */}
      <div className="relative px-5 sm:px-8 py-4 border-b border-slate-200 dark:border-white/[0.08] flex flex-wrap items-center justify-between gap-x-6 gap-y-3 bg-slate-50/70 dark:bg-white/[0.02] backdrop-blur-sm">
        <div className="flex items-center gap-2.5 min-w-0">
          <GitBranch className="w-4 h-4 text-violet-500 shrink-0" strokeWidth={2.25} />
          <span className="mono-label text-slate-600 dark:text-slate-400 font-bold truncate text-[11px]">
            Deterministic Skill Graph · {mainNodes.length} Verified Stages
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          {LEGEND.map((l) => (
            <span key={l.label} className="flex items-center gap-1.5 mono-label text-slate-500 dark:text-slate-400 font-medium text-[10px]">
              <span className={`w-2 h-2 rounded-full ${l.dot}`} />
              {l.label}
            </span>
          ))}
        </div>
      </div>

      {/* ============================================ Graph Tree */}
      <div className="relative px-5 sm:px-8 py-10 sm:py-14">
        {mainNodes.length === 0 ? (
          <EmptyState
            icon={GitBranch}
            title="No Roadmap Generated Yet"
            description="Name a role and HADES will synthesize the skill graph, order the prerequisites, and rank curated materials for each stage."
          />
        ) : (
          <>
            {/* Root Topic Header */}
            <div className="max-w-5xl mx-auto mb-12 sm:mb-16">
               
              <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white leading-tight">
                {roadmap?.rootTopic || 'AI Systems Engineering'}
              </h2>
              <div className="mt-5 flex items-center gap-3">
                <span className="h-px flex-1 bg-slate-200 dark:bg-white/[0.08]" />
                <span className="mono-label text-slate-400 dark:text-slate-500 font-medium text-[12px]">Prerequisites Flow Downward</span>
                <span className="h-px flex-1 bg-slate-200 dark:bg-white/[0.08]" />
              </div>
            </div>

            <div className="max-w-5xl mx-auto space-y-12 sm:space-y-16">
              {mainNodes.map((mainNode, nodeIdx) => {
                const total = mainNode.branches?.length || 0;
                const doneCount = mainNode.branches?.filter((b) => b.status === 'done').length || 0;

                return (
                  <div key={mainNode.id} className="relative grid lg:grid-cols-[300px_1fr] gap-6 lg:gap-10">
                    {/* ---------- Stage Spine Card ---------- */}
                    <div className="relative">
                      {/* Vertical rail to next stage */}
                      {nodeIdx < mainNodes.length - 1 && (
                        <span className="hidden lg:block absolute left-[15px] top-full h-12 sm:h-16 w-px bg-gradient-to-b from-slate-200 dark:from-white/[0.12] to-transparent" />
                      )}

                      <div className="lg:sticky lg:top-24">
                        <div className="flex items-start gap-3.5">
                          {/* Stage marker */}
                          <span
                            className={`shrink-0 w-8 h-8 rounded-xl flex items-center justify-center font-display text-xs font-bold tabular-nums border shadow-subtle ${
                              mainNode.status === 'done'
                                ? 'bg-emerald-500 border-emerald-500 text-white'
                                : mainNode.status === 'learning'
                                ? 'bg-violet-600 border-violet-600 text-white'
                                : 'bg-white dark:bg-white/[0.04] border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400'
                            }`}
                          >
                            {mainNode.status === 'done' ? <Check className="w-4 h-4" strokeWidth={3} /> : nodeIdx + 1}
                          </span>

                          <div className="min-w-0 pt-0.5">
                            <span className="mono-label text-slate-400 dark:text-slate-500 block mb-1 font-semibold text-xs">
                              Stage {String(nodeIdx + 1).padStart(2, '0')}
                            </span>
                            <h3 className="font-display text-lg font-bold tracking-tight text-slate-900 dark:text-white leading-snug">
                              {mainNode.title}
                            </h3>
                            <p className="text-xs sm:text-[13px] text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed">
                              {mainNode.description}
                            </p>

                            {total > 0 && (
                              <div className="mt-4 max-w-[200px]">
                                <div className="flex justify-between items-baseline mb-1.5">
                                  <span className="mono-label text-slate-400 dark:text-slate-500 text-xs font-semibold">
                                    {doneCount}/{total} Completed
                                  </span>
                                </div>
                                <div className="h-1.5 rounded-full bg-slate-200 dark:bg-white/[0.08] overflow-hidden">
                                  <div
                                    className="h-full rounded-full bg-violet-600 transition-[width] duration-500"
                                    style={{ width: `${total ? (doneCount / total) * 100 : 0}%` }}
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* ---------- Branch Nodes ---------- */}
                    <div className="relative pl-5 lg:pl-8 border-l border-slate-200 dark:border-white/[0.08] space-y-3">
                      {mainNode.branches?.map((branch) => {
                        const isSelected = selectedBranchNode?.id === branch.id;
                        const isDone = branch.status === 'done';
                        const isLearning = branch.status === 'learning';
                        const isSkip = branch.status === 'skip';

                        return (
                          <div key={branch.id} className="relative">
                            {/* Elbow connector */}
                            <span className="absolute -left-5 lg:-left-8 top-1/2 w-5 lg:w-8 h-px bg-slate-200 dark:bg-white/[0.08]" />

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
                              className={`group relative rounded-xl border px-4 py-3.5 cursor-pointer transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60 ${
                                isSelected
                                  ? 'border-violet-500 bg-violet-500/[0.08] dark:bg-violet-500/[0.10] shadow-card ring-1 ring-violet-500/30'
                                  : isDone
                                  ? 'border-emerald-500/30 bg-emerald-500/[0.03] hover:border-emerald-500/50 hover:bg-emerald-500/[0.06]'
                                  : isLearning
                                  ? 'border-violet-500/40 bg-violet-500/[0.04] hover:border-violet-500 hover:bg-violet-500/[0.08]'
                                  : isSkip
                                  ? 'border-slate-200 dark:border-white/[0.06] bg-slate-50/40 dark:bg-white/[0.01] opacity-50 hover:opacity-75'
                                  : 'border-slate-200 dark:border-white/[0.08] bg-white dark:bg-white/[0.02] hover:border-slate-300 dark:hover:border-white/20'
                              }`}
                            >
                              {/* Quick status bar on hover/focus */}
                              <div
                                className={`absolute -top-4 right-3 z-20 items-center gap-1 p-1 rounded-xl bg-slate-900 dark:bg-[#181E2C] border border-slate-700 dark:border-white/20 shadow-elev transition-opacity ${
                                  isSelected ? 'flex opacity-100' : 'hidden group-hover:flex group-focus-within:flex'
                                }`}
                              >
                                <button
                                  type="button"
                                  onClick={(e) => handleQuickStatus(e, mainNode.id, branch.id, 'learning')}
                                  title="Mark as in progress"
                                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                                    isLearning ? 'bg-violet-600 text-white' : 'text-slate-300 hover:bg-white/10 hover:text-white'
                                  }`}
                                >
                                  <BookOpen className="w-3.5 h-3.5" /> Learning
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => handleQuickStatus(e, mainNode.id, branch.id, 'done')}
                                  title="Mark as completed"
                                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                                    isDone ? 'bg-emerald-500 text-white' : 'text-slate-300 hover:bg-white/10 hover:text-white'
                                  }`}
                                >
                                  <Check className="w-3.5 h-3.5" strokeWidth={3} /> Done
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => handleQuickStatus(e, mainNode.id, branch.id, 'skip')}
                                  title="Skip this node"
                                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                                    isSkip ? 'bg-slate-700 text-white' : 'text-slate-300 hover:bg-white/10 hover:text-white'
                                  }`}
                                >
                                  <MinusCircle className="w-3.5 h-3.5" /> Skip
                                </button>
                              </div>

                              <div className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-3 min-w-0">
                                  <span className="relative flex w-2 h-2 shrink-0">
                                    {isLearning && (
                                      <span className="absolute inline-flex w-full h-full rounded-full bg-violet-500 opacity-60 animate-ping" />
                                    )}
                                    <span
                                      className={`relative inline-flex w-2 h-2 rounded-full ${
                                        isDone
                                          ? 'bg-emerald-500'
                                          : isLearning
                                          ? 'bg-violet-500'
                                          : isSkip
                                          ? 'bg-slate-300 dark:bg-white/15'
                                          : 'bg-slate-300 dark:bg-white/25'
                                      }`}
                                    />
                                  </span>

                                  <h4
                                    className={`text-[13px] sm:text-sm font-semibold leading-snug truncate ${
                                      isSkip
                                        ? 'text-slate-400 dark:text-slate-500 line-through'
                                        : 'text-slate-900 dark:text-white'
                                    }`}
                                  >
                                    {branch.title}
                                  </h4>
                                </div>

                                <div className="flex items-center gap-2.5 shrink-0">
                                  {branch.rankedVideos?.length > 0 && (
                                    <span className="hidden sm:flex items-center gap-1 mono-label text-cyan-600 dark:text-cyan-400 text-[10px] font-bold">
                                      <Video className="w-3 h-3" />
                                      {branch.rankedVideos.length}
                                    </span>
                                  )}
                                  {isDone ? (
                                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                  ) : (
                                    <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-violet-500 group-hover:translate-x-0.5 transition" />
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

      {/* Slide-over node detail */}
      <NodeDetailDrawer
        node={selectedBranchNode}
        mainNodeId={activeMainNodeId}
        onClose={() => setSelectedBranchNode(null)}
      />
    </div>
  );
}
