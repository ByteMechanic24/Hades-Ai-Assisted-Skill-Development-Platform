import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLearner } from '../../context/LearnerContext';
import { Eyebrow, Badge, Button } from '../ui';
import {
  X,
  Sparkles,
  Video,
  ExternalLink,
  CheckCircle2,
  Clock,
  Star,
  BookOpen,
  MinusCircle,
  Check,
  Award,
  FileText,
  Filter,
  Play
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { slideOverRight, backdrop as backdropVariants } from '../../utils/motion';

export function NodeDetailDrawer({ node, mainNodeId, onClose }) {
  const { updateBranchStatus, openAssistant } = useLearner();
  const [resourcePricingFilter, setResourcePricingFilter] = useState('all'); // 'all' | 'free' | 'paid'

  useEffect(() => {
    if (!node) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener('keydown', onKey);
    };
  }, [node, onClose]);

  const handleStatusChange = (newStatus) => {
    updateBranchStatus(mainNodeId, node.id, newStatus);
    if (newStatus === 'done') {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10b981', '#34d399', '#6ee7b7', '#6366f1'],
      });
    }
  };

  const handleAskAiAboutNode = () => {
    openAssistant(`Can you explain the core concepts and real-world production implementations for "${node.title}"?`);
  };

  const showFree = resourcePricingFilter === 'all' || resourcePricingFilter === 'free';
  const showPaid = resourcePricingFilter === 'all' || resourcePricingFilter === 'paid';

  const statusMeta = {
    done: { label: 'Completed', cls: 'text-emerald-700 dark:text-emerald-300 border-emerald-500/40 bg-emerald-500/10' },
    learning: { label: 'In Progress', cls: 'text-violet-700 dark:text-violet-300 border-violet-500/40 bg-violet-500/10' },
    skip: { label: 'Skipped', cls: 'text-slate-600 dark:text-slate-400 border-slate-300 dark:border-white/15 bg-slate-100 dark:bg-white/[0.04]' },
  };
  const meta = node ? statusMeta[node.status] : null;

  const statusButtons = [
    { key: 'learning', label: 'In Progress', icon: BookOpen, active: 'bg-violet-600 border-violet-600 text-white shadow-sm' },
    { key: 'done', label: 'Completed', icon: Check, active: 'bg-emerald-600 border-emerald-600 text-white shadow-sm' },
    { key: 'skip', label: 'Skip Node', icon: MinusCircle, active: 'bg-slate-700 border-slate-700 text-white shadow-sm' },
  ];

  const pricingTabs = [
    { id: 'all', label: 'All Formats' },
    { id: 'free', label: 'Free' },
    { id: 'paid', label: 'Certified' },
  ];

  return (
    <AnimatePresence>
      {node && (
        <>
          {/* Backdrop */}
          <motion.div
            variants={backdropVariants}
            initial="hidden"
            animate="show"
            exit="hidden"
            onClick={onClose}
            className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm"
          />

          {/* Panel */}
          <motion.aside
            variants={slideOverRight}
            initial="hidden"
            animate="show"
            exit="exit"
            role="dialog"
            aria-modal="true"
            aria-label={node.title}
            className="fixed inset-y-0 right-0 z-50 w-full sm:max-w-xl flex flex-col bg-white dark:bg-[#121620] border-l border-slate-200 dark:border-white/10 shadow-2xl text-slate-900 dark:text-slate-100"
          >
            {/* ================================= Header */}
            <div className="relative px-6 pt-6 pb-5 border-b border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.01]">
              <div className="absolute left-0 top-6 bottom-5 w-1 bg-violet-600" />
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2.5 flex-wrap mb-2">
                    <Eyebrow variant="violet">Competency Node</Eyebrow>
                    {meta && (
                      <span className={`mono-label text-[9px] px-2 py-0.5 rounded-md border font-semibold ${meta.cls}`}>{meta.label}</span>
                    )}
                  </div>
                  <h2 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white leading-tight">
                    {node.title}
                  </h2>
                </div>

                <button
                  onClick={onClose}
                  aria-label="Close panel"
                  className="p-2 -mr-1 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.06] transition shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* ================================= Status Switcher */}
            <div className="px-6 py-4 border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.02]">
              <span className="mono-label text-slate-500 dark:text-slate-400 block mb-2 font-medium text-[10px]">Update Progression Status</span>
              <div className="flex items-center gap-2">
                {statusButtons.map((b) => {
                  const isActive = node.status === b.key;
                  return (
                    <button
                      key={b.key}
                      type="button"
                      onClick={() => handleStatusChange(b.key)}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                        isActive
                          ? b.active
                          : 'bg-white dark:bg-white/[0.03] border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-white/20'
                      }`}
                    >
                      <b.icon className="w-3.5 h-3.5" strokeWidth={b.key === 'done' ? 3 : 2} />
                      {b.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ================================= Body */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-7">
              {/* Summary description */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/[0.02] border-l-2 border-violet-500">
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  {node.summary ||
                    'Master the core conceptual foundation, mathematical principles, and production architecture required for this competency checkpoint.'}
                </p>
              </div>

              {/* Resource Filter */}
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <span className="flex items-center gap-2 mono-label text-slate-600 dark:text-slate-400 font-semibold text-[10px]">
                  <Filter className="w-3.5 h-3.5 text-violet-500" /> Curated Materials
                </span>
                <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10">
                  {pricingTabs.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setResourcePricingFilter(t.id)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                        resourcePricingFilter === t.id
                          ? 'bg-white dark:bg-white/10 text-slate-900 dark:text-white shadow-sm'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* ---------- Primary Recommendation ---------- */}
              {node.recommendedResource && (resourcePricingFilter === 'all' || resourcePricingFilter === 'free') && (
                <div className="relative rounded-2xl border border-violet-500/40 bg-violet-500/[0.05] p-5 shadow-sm">
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <span className="flex items-center gap-1.5 mono-label text-violet-700 dark:text-violet-300 font-bold text-[10px]">
                      <Star className="w-3.5 h-3.5 fill-current text-violet-500" /> Recommended Starting Point
                    </span>
                    <span className="mono-label text-[9px] px-2 py-0.5 rounded-md border border-violet-500/40 bg-violet-500/10 text-violet-700 dark:text-violet-300 font-bold">
                      Free Access
                    </span>
                  </div>

                  <h3 className="font-display text-base font-bold text-slate-900 dark:text-white leading-snug">
                    {node.recommendedResource.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {node.recommendedResource.provider} · {node.recommendedResource.duration}
                  </p>

                  <div className="mt-4 pt-4 border-t border-violet-500/20 flex items-center justify-between gap-3">
                    <span className="mono-label text-slate-500 dark:text-slate-400 text-[10px] font-medium">{node.recommendedResource.type}</span>
                    <a
                      href={node.recommendedResource.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold transition shadow-sm"
                    >
                      Open Resource <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              )}

              {/* ---------- Paid / Pro Certifications (Indigo) ---------- */}
              {showPaid && node.paidCourses?.length > 0 && (
                <section className="space-y-3">
                  <div className="flex items-center justify-between gap-3 pb-2.5 border-b border-slate-200 dark:border-white/[0.08]">
                    <span className="flex items-center gap-2 mono-label text-indigo-600 dark:text-indigo-400 font-bold text-[10px]">
                      <Award className="w-3.5 h-3.5 text-indigo-500" /> Industry Certifications
                    </span>
                    <span className="mono-label text-slate-400 dark:text-slate-500 font-medium text-[10px]">{node.paidCourses.length} verified options</span>
                  </div>

                  <div className="space-y-3">
                    {node.paidCourses.map((paid) => (
                      <div
                        key={paid.id}
                        className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.02] p-4 hover:border-indigo-500/40 hover:shadow-card transition-all"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <span className="mono-label text-slate-400 dark:text-slate-500 block mb-1 font-medium text-[10px]">{paid.provider}</span>
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                              {paid.title}
                            </h4>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="font-display text-sm font-bold text-slate-900 dark:text-white block tabular-nums">
                              {paid.price}
                            </span>
                            <span className="mono-label text-[9px] text-emerald-600 dark:text-emerald-400 font-semibold">
                              {paid.discount}
                            </span>
                          </div>
                        </div>

                        <div className="mt-3.5 pt-3.5 border-t border-slate-200 dark:border-white/[0.08] flex items-center justify-between gap-3">
                          <span className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                            <span className="flex items-center gap-1 font-medium">
                              <Clock className="w-3.5 h-3.5" /> {paid.duration}
                            </span>
                            <span className="flex items-center gap-1 text-indigo-500 font-bold">
                              <Star className="w-3.5 h-3.5 fill-current" /> {paid.rating}
                            </span>
                          </span>
                          <a
                            href={paid.url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline transition"
                          >
                            Enroll Now <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* ---------- Ranked Free Videos (Violet) ---------- */}
              {showFree && node.rankedVideos?.length > 0 && (
                <section className="space-y-3">
                  <div className="flex items-center justify-between gap-3 pb-2.5 border-b border-slate-200 dark:border-white/[0.08]">
                    <span className="flex items-center gap-2 mono-label text-violet-600 dark:text-violet-400 font-bold text-[10px]">
                      <Video className="w-3.5 h-3.5 text-violet-500" /> Ranked Video Walkthroughs
                    </span>
                    <span className="mono-label text-slate-400 dark:text-slate-500 font-medium text-[10px]">Curated for Node</span>
                  </div>

                  <div className="divide-y divide-slate-200 dark:divide-white/[0.06]">
                    {node.rankedVideos.map((video) => (
                      <div key={video.id} className="group flex gap-4 items-start py-3.5 first:pt-1">
                        <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/25 flex items-center justify-center font-display text-xs font-bold text-violet-700 dark:text-violet-400 shrink-0">
                          #{video.rank}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className="mono-label text-slate-500 dark:text-slate-400 truncate font-medium text-[10px]">{video.channel}</span>
                            <span className="flex items-center gap-1 mono-label text-[10px] text-violet-600 dark:text-violet-400 shrink-0 font-bold">
                              <Star className="w-3 h-3 fill-current text-indigo-500" /> {video.rating}
                            </span>
                          </div>
                          <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-snug line-clamp-2 mt-1">
                            {video.title}
                          </h4>
                          <div className="flex items-center justify-between gap-2 mt-2">
                            <span className="mono-label text-slate-400 dark:text-slate-500 text-[10px]">{video.views} · {video.duration}</span>
                            <a
                              href="https://youtube.com"
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-xs font-bold text-violet-600 dark:text-violet-400 hover:underline"
                            >
                              Watch <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* ---------- Reference Articles (Violet) ---------- */}
              {showFree && node.articles?.length > 0 && (
                <section className="space-y-2">
                  <div className="flex items-center gap-2 mono-label text-violet-600 dark:text-violet-400 pb-2.5 border-b border-slate-200 dark:border-white/[0.08] font-bold text-[10px]">
                    <FileText className="w-3.5 h-3.5 text-violet-500" /> Reference Documentation &amp; Whitepapers
                  </div>
                  <div className="divide-y divide-slate-200 dark:divide-white/[0.06]">
                    {node.articles.map((art, idx) => (
                      <div key={idx} className="flex items-center justify-between gap-4 py-2.5">
                        <span className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 truncate">{art.title}</span>
                        <span className="mono-label text-slate-400 dark:text-slate-500 shrink-0 text-[10px]">{art.duration}</span>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>

            {/* ================================= Footer */}
            <div className="px-6 py-4 border-t border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.02]">
              <button
                type="button"
                onClick={handleAskAiAboutNode}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold transition shadow-sm"
              >
                <Sparkles className="w-4 h-4 text-white" />
                Ask AI Coach About This Node
              </button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
