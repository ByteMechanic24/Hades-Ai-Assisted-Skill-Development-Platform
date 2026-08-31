import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useLearner } from '../../context/LearnerContext';
import {
  X,
  Sparkles,
  GitBranch,
  CheckCircle2,
  ArrowRight,
  PlusCircle,
  BookOpen,
  Compass,
  ShieldCheck,
  Bot,
  BrainCircuit,
  Terminal,
  Cpu,
  Layers
} from 'lucide-react';
import { cn } from '../../utils/cn';

function getDomainMeta(title = '', role = '') {
  const t = `${title} ${role}`.toLowerCase();
  if (t.includes('cyber') || t.includes('security') || t.includes('ethical') || t.includes('soc')) {
    return { icon: ShieldCheck, label: 'Cybersecurity Specialization', badgeClass: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-600 dark:text-emerald-400' };
  }
  if (t.includes('agentic') || t.includes('langgraph') || t.includes('agno') || t.includes('swarm') || t.includes('agent')) {
    return { icon: Bot, label: 'Agentic AI Specialization', badgeClass: 'bg-violet-500/15 border-violet-500/30 text-violet-600 dark:text-violet-400' };
  }
  if (t.includes('machine learning') || t.includes('ai') || t.includes('deep learning') || t.includes('neural') || t.includes('nlp')) {
    return { icon: BrainCircuit, label: 'AI & ML Engineering Domain', badgeClass: 'bg-indigo-500/15 border-indigo-500/30 text-indigo-600 dark:text-indigo-400' };
  }
  if (t.includes('linux') || t.includes('devops') || t.includes('cloud') || t.includes('kubernetes') || t.includes('admin')) {
    return { icon: Terminal, label: 'Systems & Cloud Specialization', badgeClass: 'bg-cyan-500/15 border-cyan-500/30 text-cyan-600 dark:text-cyan-400' };
  }
  return { icon: Cpu, label: 'Technology Specialization', badgeClass: 'bg-violet-500/15 border-violet-500/30 text-violet-600 dark:text-violet-400' };
}

export function RoadmapLibraryModal({ isOpen, onClose, onNewGoal }) {
  const { allRoadmaps, activeRoadmapId, switchRoadmapTrack } = useLearner();

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

  if (!isOpen || typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 lg:p-8">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/75 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="relative w-full max-w-3xl max-h-[85vh] flex flex-col rounded-3xl bg-white dark:bg-[#0F121B] border border-slate-200 dark:border-white/10 shadow-2xl overflow-hidden z-10"
        >
          {/* Header */}
          <div className="px-6 py-5 border-b border-slate-200 dark:border-white/10 flex items-center justify-between bg-slate-50/70 dark:bg-white/[0.02]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-violet-500/20">
                <GitBranch className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold font-display text-slate-900 dark:text-white">
                    My Domain Roadmaps Library
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-violet-500/10 border border-violet-500/25 text-violet-600 dark:text-violet-400">
                    {allRoadmaps.length} {allRoadmaps.length === 1 ? 'Domain Track' : 'Domain Tracks'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Switch between your completed or ongoing career domain roadmaps (e.g. Cybersecurity, Agentic AI, AI/ML).
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.06] transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body: Domains Grid */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {allRoadmaps.length === 0 ? (
              <div className="text-center py-12 px-4 space-y-3">
                <Compass className="w-12 h-12 text-violet-400 mx-auto opacity-70 animate-pulse" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">No Domain Roadmaps Generated Yet</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Complete onboarding or generate your first career domain roadmap (like Cybersecurity or AI/ML) to populate your library.
                </p>
              </div>
            ) : (
              allRoadmaps.map((track, idx) => {
                const isActive = (track.id && track.id === activeRoadmapId) || idx === 0;
                const totalNodes = track.mainNodes ? track.mainNodes.length : (track.nodes ? track.nodes.length : 0);
                const title = track.title || `Domain Roadmap ${idx + 1}`;
                const role = track.rootTopic || track.title?.replace('Personalized Roadmap: ', '') || 'Specialization';
                const meta = getDomainMeta(title, role);
                const MetaIcon = meta.icon;

                return (
                  <motion.div
                    key={track.id || idx}
                    whileHover={{ scale: 1.008 }}
                    transition={{ duration: 0.15 }}
                    className={cn(
                      "p-5 rounded-2xl border transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4",
                      isActive
                        ? "border-violet-500/50 bg-violet-500/[0.06] shadow-sm shadow-violet-500/10"
                        : "border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.02] hover:border-slate-300 dark:hover:border-white/20"
                    )}
                  >
                    <div className="space-y-2 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Domain Category Badge */}
                        <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border", meta.badgeClass)}>
                          <MetaIcon className="w-3 h-3" /> {meta.label}
                        </span>

                        {/* Active Status Badge */}
                        {isActive ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 className="w-3 h-3" /> Currently Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-500/10 border border-slate-500/20 text-slate-600 dark:text-slate-400">
                            <BookOpen className="w-3 h-3" /> Saved Roadmap
                          </span>
                        )}

                        <span className="mono-label text-[10px] text-slate-400 dark:text-slate-500">
                          {totalNodes} Stages &amp; Resources
                        </span>
                      </div>

                      <h3 className="font-display text-base font-bold text-slate-900 dark:text-white truncate">
                        {title}
                      </h3>

                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                        {track.description || `Full AI-curated learning curriculum for ${role}`}
                      </p>

                      {/* Stage Nodes Preview */}
                      {track.mainNodes && track.mainNodes.length > 0 && (
                        <div className="flex items-center gap-1.5 flex-wrap pt-1">
                          {track.mainNodes.slice(0, 3).map((node, nIdx) => (
                            <span
                              key={nIdx}
                              className="px-2 py-0.5 rounded-md text-[10px] bg-slate-200/60 dark:bg-white/[0.05] text-slate-600 dark:text-slate-400 truncate max-w-[180px]"
                            >
                              {nIdx + 1}. {node.title}
                            </span>
                          ))}
                          {track.mainNodes.length > 3 && (
                            <span className="text-[10px] text-slate-400 font-medium">
                              +{track.mainNodes.length - 3} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="shrink-0 flex items-center gap-2">
                      {isActive ? (
                        <button
                          type="button"
                          onClick={onClose}
                          className="px-4 py-2 rounded-xl text-xs font-bold bg-violet-600 hover:bg-violet-500 text-white transition shadow-sm"
                        >
                          Viewing Current
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            switchRoadmapTrack(track);
                            onClose();
                          }}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 transition shadow-sm"
                        >
                          Switch to this Domain <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-slate-200 dark:border-white/10 bg-slate-50/70 dark:bg-white/[0.02] flex items-center justify-between gap-4">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Want to start learning another domain?
            </span>
            <button
              type="button"
              onClick={() => {
                onClose();
                if (onNewGoal) onNewGoal();
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold transition shadow-sm"
            >
              <PlusCircle className="w-3.5 h-3.5" /> Explore New Domain Roadmap
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
}
