import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLearner } from '../../context/LearnerContext';
import { Eyebrow } from '../ui';
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
        colors: ['#f59e0b', '#fbbf24', '#fcd34d'],
      });
    }
  };

  const handleAskAiAboutNode = () => {
    openAssistant(`Can you explain "${node.title}" and give me key practice tips?`);
  };

  const showFree = resourcePricingFilter === 'all' || resourcePricingFilter === 'free';
  const showPaid = resourcePricingFilter === 'all' || resourcePricingFilter === 'paid';

  const statusMeta = {
    done: { label: 'Completed', cls: 'text-emerald-600 dark:text-emerald-400 border-emerald-500/40 bg-emerald-500/10' },
    learning: { label: 'In progress', cls: 'text-amber-600 dark:text-amber-400 border-amber-500/40 bg-amber-500/10' },
    skip: { label: 'Skipped', cls: 'text-stone-500 dark:text-stone-400 border-stone-300 dark:border-white/15 bg-stone-100 dark:bg-white/[0.04]' },
  };
  const meta = node ? statusMeta[node.status] : null;

  const statusButtons = [
    { key: 'learning', label: 'Learning', icon: BookOpen, active: 'bg-amber-500 border-amber-500 text-stone-950' },
    { key: 'done', label: 'Done', icon: Check, active: 'bg-emerald-500 border-emerald-500 text-white' },
    { key: 'skip', label: 'Skip', icon: MinusCircle, active: 'bg-stone-700 border-stone-700 text-white' },
  ];

  const pricingTabs = [
    { id: 'all', label: 'Everything' },
    { id: 'free', label: 'Free' },
    { id: 'paid', label: 'Paid' },
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
            className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-[2px]"
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
            className="fixed inset-y-0 right-0 z-50 w-full sm:max-w-xl flex flex-col bg-white dark:bg-[#101013] border-l border-stone-200 dark:border-white/[0.08] shadow-2xl text-stone-900 dark:text-stone-100"
          >
            {/* ================================= Header */}
            <div className="relative px-6 pt-6 pb-5 border-b border-stone-200 dark:border-white/[0.08]">
              <div className="absolute left-0 top-6 bottom-5 w-0.5 bg-amber-500" />
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2.5 flex-wrap mb-2.5">
                    <Eyebrow>Skill node</Eyebrow>
                    {meta && (
                      <span className={`mono-label text-[9px] px-2 py-1 rounded border ${meta.cls}`}>{meta.label}</span>
                    )}
                  </div>
                  <h2 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-stone-900 dark:text-white leading-tight">
                    {node.title}
                  </h2>
                </div>

                <button
                  onClick={onClose}
                  aria-label="Close panel"
                  className="p-2 -mr-1 rounded-lg text-stone-400 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-white/[0.06] transition shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* ================================= Status switcher */}
            <div className="px-6 py-4 border-b border-stone-200 dark:border-white/[0.08] bg-stone-50 dark:bg-white/[0.02]">
              <span className="mono-label text-stone-400 dark:text-stone-500 block mb-2.5">Mark this node</span>
              <div className="flex items-center gap-2">
                {statusButtons.map((b) => {
                  const isActive = node.status === b.key;
                  return (
                    <button
                      key={b.key}
                      onClick={() => handleStatusChange(b.key)}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold border transition ${
                        isActive
                          ? b.active
                          : 'bg-white dark:bg-white/[0.03] border-stone-200 dark:border-white/10 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white hover:border-stone-300 dark:hover:border-white/20'
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
              {/* Summary */}
              <p className="text-sm text-stone-600 dark:text-stone-300 leading-relaxed border-l-2 border-stone-200 dark:border-white/10 pl-4">
                {node.summary ||
                  'Explore the core theoretical principles, mental models, and practical code implementations for this node.'}
              </p>

              {/* Pricing filter */}
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <span className="flex items-center gap-2 mono-label text-stone-400 dark:text-stone-500">
                  <Filter className="w-3.5 h-3.5" /> Materials
                </span>
                <div className="flex items-center gap-1 p-1 rounded-lg bg-stone-100 dark:bg-white/[0.04] border border-stone-200 dark:border-white/10">
                  {pricingTabs.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setResourcePricingFilter(t.id)}
                      className={`px-3 py-1.5 rounded-md text-xs font-medium transition ${
                        resourcePricingFilter === t.id
                          ? 'bg-white dark:bg-white/10 text-stone-900 dark:text-white shadow-sm'
                          : 'text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* ---------- Primary recommendation ---------- */}
              {node.recommendedResource && (resourcePricingFilter === 'all' || resourcePricingFilter === 'free') && (
                <div className="relative rounded-xl border border-amber-500/40 bg-amber-500/[0.05] p-5 overflow-hidden">
                  <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-amber-500" />
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <span className="flex items-center gap-1.5 mono-label text-amber-600 dark:text-amber-400">
                      <Star className="w-3.5 h-3.5 fill-current" /> Best match
                    </span>
                    <span className="mono-label text-[9px] px-2 py-1 rounded border border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                      Free
                    </span>
                  </div>

                  <h3 className="font-display text-base font-semibold text-stone-900 dark:text-white leading-snug">
                    {node.recommendedResource.title}
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-1.5">
                    {node.recommendedResource.provider} · {node.recommendedResource.duration}
                  </p>

                  <div className="mt-4 pt-4 border-t border-amber-500/20 flex items-center justify-between gap-3">
                    <span className="mono-label text-stone-400 dark:text-stone-500">{node.recommendedResource.type}</span>
                    <a
                      href={node.recommendedResource.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-semibold transition"
                    >
                      Start building <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              )}

              {/* ---------- Paid / Pro ---------- */}
              {showPaid && node.paidCourses?.length > 0 && (
                <section className="space-y-3">
                  <div className="flex items-center justify-between gap-3 pb-2.5 border-b border-stone-200 dark:border-white/[0.08]">
                    <span className="flex items-center gap-2 mono-label text-stone-500 dark:text-stone-400">
                      <Award className="w-3.5 h-3.5 text-amber-500" /> Certifications
                    </span>
                    <span className="mono-label text-stone-400 dark:text-stone-500">{node.paidCourses.length} options</span>
                  </div>

                  <div className="space-y-2.5">
                    {node.paidCourses.map((paid) => (
                      <div
                        key={paid.id}
                        className="group rounded-xl border border-stone-200 dark:border-white/[0.08] bg-white dark:bg-white/[0.02] p-4 hover:border-amber-500/40 transition"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <span className="mono-label text-stone-400 dark:text-stone-500 block mb-1">{paid.provider}</span>
                            <h4 className="text-sm font-semibold text-stone-900 dark:text-white leading-snug group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors">
                              {paid.title}
                            </h4>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="font-display text-sm font-bold text-stone-900 dark:text-white block tabular-nums">
                              {paid.price}
                            </span>
                            <span className="mono-label text-[9px] text-emerald-600 dark:text-emerald-400">
                              {paid.discount}
                            </span>
                          </div>
                        </div>

                        <div className="mt-3.5 pt-3.5 border-t border-stone-200 dark:border-white/[0.08] flex items-center justify-between gap-3">
                          <span className="flex items-center gap-3 text-xs text-stone-500 dark:text-stone-400">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" /> {paid.duration}
                            </span>
                            <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                              <Star className="w-3.5 h-3.5 fill-current" /> {paid.rating}
                            </span>
                          </span>
                          <a
                            href={paid.url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-900 dark:text-white hover:text-amber-600 dark:hover:text-amber-400 transition"
                          >
                            Enroll <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* ---------- Ranked free videos ---------- */}
              {showFree && node.rankedVideos?.length > 0 && (
                <section className="space-y-3">
                  <div className="flex items-center justify-between gap-3 pb-2.5 border-b border-stone-200 dark:border-white/[0.08]">
                    <span className="flex items-center gap-2 mono-label text-stone-500 dark:text-stone-400">
                      <Video className="w-3.5 h-3.5 text-amber-500" /> Ranked walkthroughs
                    </span>
                    <span className="mono-label text-stone-400 dark:text-stone-500">Free access</span>
                  </div>

                  <div className="divide-y divide-stone-200 dark:divide-white/[0.06]">
                    {node.rankedVideos.map((video) => (
                      <div key={video.id} className="group flex gap-4 items-start py-3.5 first:pt-1">
                        <div className="relative w-24 h-16 rounded-lg overflow-hidden shrink-0 border border-stone-200 dark:border-white/10 bg-stone-100 dark:bg-white/[0.04]">
                          <img
                            src={video.thumbnail}
                            alt={video.title}
                            loading="lazy"
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                          />
                          <span className="absolute bottom-1 right-1 px-1.5 rounded bg-stone-950/85 mono-label text-[9px] text-white">
                            {video.duration}
                          </span>
                          <span className="absolute top-1 left-1 w-5 h-5 rounded bg-amber-500 flex items-center justify-center font-display text-[10px] font-bold text-stone-950 tabular-nums">
                            {video.rank}
                          </span>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className="mono-label text-stone-400 dark:text-stone-500 truncate">{video.channel}</span>
                            <span className="flex items-center gap-1 mono-label text-[9px] text-amber-600 dark:text-amber-400 shrink-0">
                              <Star className="w-3 h-3 fill-current" /> {video.rating}
                            </span>
                          </div>
                          <h4 className="text-[13px] font-medium text-stone-900 dark:text-white leading-snug line-clamp-2 mt-1 group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors">
                            {video.title}
                          </h4>
                          <div className="flex items-center justify-between gap-2 mt-2">
                            <span className="mono-label text-stone-400 dark:text-stone-500">{video.views}</span>
                            <a
                              href="https://youtube.com"
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-xs font-medium text-stone-600 dark:text-stone-300 hover:text-amber-600 dark:hover:text-amber-400 transition"
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

              {/* ---------- Articles ---------- */}
              {showFree && node.articles?.length > 0 && (
                <section className="space-y-1">
                  <div className="flex items-center gap-2 mono-label text-stone-500 dark:text-stone-400 pb-2.5 border-b border-stone-200 dark:border-white/[0.08]">
                    <FileText className="w-3.5 h-3.5 text-amber-500" /> Reference reading
                  </div>
                  <div className="divide-y divide-stone-200 dark:divide-white/[0.06]">
                    {node.articles.map((art, idx) => (
                      <div key={idx} className="flex items-center justify-between gap-4 py-2.5">
                        <span className="text-[13px] text-stone-700 dark:text-stone-300 truncate">{art.title}</span>
                        <span className="mono-label text-stone-400 dark:text-stone-500 shrink-0">{art.duration}</span>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>

            {/* ================================= Footer */}
            <div className="px-6 py-4 border-t border-stone-200 dark:border-white/[0.08] bg-stone-50 dark:bg-white/[0.02]">
              <button
                onClick={handleAskAiAboutNode}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-stone-900 dark:bg-white text-white dark:text-stone-950 text-xs font-semibold hover:opacity-90 transition"
              >
                <Sparkles className="w-4 h-4 text-amber-400 dark:text-amber-600" />
                Ask the coach about this node
              </button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
