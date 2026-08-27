import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useLearner } from '../context/LearnerContext';
import { Button, GlassCard, Badge, Eyebrow, ProgressBar, ProgressRing } from '../components/ui';
import { fadeUp, staggerContainer } from '../utils/motion';
import { IMAGERY } from '../utils/media';
import {
  ArrowRight,
  Play,
  CheckCircle2,
  Clock,
  Award,
  GitBranch,
  Target,
  ChevronRight,
  Flame,
  Gauge,
  Compass,
  Activity,
  MessageSquare,
  X,
  Zap,
  CircleDashed,
} from 'lucide-react';

const MotionDiv = motion.div;

export function DashboardPage() {
  const {
    profile,
    goal,
    path,
    skills,
    milestones,
    recentEvents,
    dismissAdaptationBanner,
    openAssistant,
  } = useLearner();

  const phases = path?.phases || [];
  const activePhase =
    phases.find((p) => p.status === 'in_progress') || phases[0] || { title: 'Foundations & Vector Architecture', nodes: [] };
  const activeNode =
    activePhase?.nodes?.find((n) => n.status === 'in_progress') ||
    activePhase?.nodes?.[0] || {
      title: 'Vector Search Deep Dive with pgvector & Qdrant',
      description: 'Hands-on implementation of HNSW index tuning and hybrid lexical + semantic search.',
      estimatedMinutes: 90,
    };

  const phaseIndex = Math.max(0, phases.findIndex((p) => p.id === activePhase.id));
  const totalPhases = phases.length || 3;
  const doneNodes = (activePhase.nodes || []).filter((n) => n.status === 'completed').length;
  const totalNodes = (activePhase.nodes || []).length || 1;
  const phaseProgress = activePhase.progress ?? Math.round((doneNodes / totalNodes) * 100);

  // Skill gaps = the distance between current mastery and target, largest first.
  const skillGaps = [...(skills || [])]
    .map((s) => ({ ...s, gap: Math.max(0, (s.target ?? 100) - s.mastery) }))
    .sort((a, b) => b.gap - a.gap);

  const today = new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });

  const heroStats = [
    { label: 'Path Complete', value: `${path?.overallProgress ?? 45}%`, icon: Gauge },
    { label: 'Hours Left', value: `${path?.estimatedHoursLeft ?? 42}`, icon: Clock },
    { label: 'Streak', value: '14d', icon: Flame },
    { label: 'This Week', value: '8/14h', icon: Zap },
  ];

  return (
    <MotionDiv variants={staggerContainer(0.07)} initial="hidden" animate="show" className="space-y-6 pb-16">
      {/* ============================================================ 1 · HERO */}
      <MotionDiv variants={fadeUp} className="relative overflow-hidden rounded-2xl border border-stone-200 dark:border-white/[0.08] bg-white/90 dark:bg-[#121214]/80 backdrop-blur-md">
        <img
          src={IMAGERY.dashboardBackdrop}
          alt="Developer workspace with multiple monitors"
          className="absolute inset-0 h-full w-full object-cover opacity-[0.07] dark:opacity-[0.18]"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-white via-white/95 to-white/70 dark:from-[#121214] dark:via-[#121214]/95 dark:to-[#121214]/70" />
        <div className="absolute inset-0 bg-grid opacity-[0.5] dark:opacity-100 pointer-events-none" />
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500" />
        <div className="relative p-6 sm:p-8">
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
            <div className="min-w-0">
              <Eyebrow icon={Compass} className="mb-3">Mission Briefing · {today}</Eyebrow>
              <h1 className="font-display text-2xl sm:text-[32px] font-bold tracking-tight text-stone-900 dark:text-white leading-tight">
                Welcome back, {profile?.name?.split(' ')[0] || 'Aman'}.
              </h1>
              <p className="mt-2 text-sm text-stone-600 dark:text-stone-400 max-w-2xl leading-relaxed">
                You&apos;re building toward{' '}
                <span className="text-stone-900 dark:text-white font-semibold">{goal?.targetRole || 'AI Systems Engineer'}</span>. Current
                mission: <span className="text-amber-600 dark:text-amber-400 font-medium">{goal?.title || activePhase.title}</span>.
              </p>
            </div>
            <div className="flex items-center gap-2.5 shrink-0">
              <Button
                variant="secondary"
                size="md"
                icon={MessageSquare}
                onClick={() => openAssistant('Review my active roadmap progress and suggest the next high-impact concept to study.')}
              >
                Ask Coach
              </Button>
              <Link to="/dashboard/learning-path">
                <Button variant="primary" size="md" icon={GitBranch}>
                  Open Path
                </Button>
              </Link>
            </div>
          </div>

          {/* Inline stat rail */}
          <div className="mt-7 grid grid-cols-2 sm:grid-cols-4 divide-x divide-stone-200 dark:divide-white/[0.08] border-t border-stone-200 dark:border-white/[0.08] pt-5">
            {heroStats.map((s) => (
              <div key={s.label} className="px-4 first:pl-0">
                <span className="mono-label text-stone-400 dark:text-stone-500 flex items-center gap-1.5">
                  <s.icon className="w-3 h-3" />
                  {s.label}
                </span>
                <div className="mt-1.5 font-display text-xl sm:text-2xl font-semibold tabular-nums text-stone-900 dark:text-white">
                  {s.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      </MotionDiv>

      {/* ================================================ Adaptation banner (conditional) */}
      {path?.pathAdaptationBanner?.visible && (
        <MotionDiv
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-amber-500/30 bg-amber-500/[0.06] p-4 flex items-start justify-between gap-4"
        >
          <div className="flex items-start gap-3">
            <div className="mt-0.5 w-8 h-8 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="text-sm font-semibold text-stone-900 dark:text-white">{path.pathAdaptationBanner.title}</h4>
                <Badge variant="amber" size="sm">Path re-weighted</Badge>
              </div>
              <p className="text-xs text-stone-600 dark:text-stone-400 mt-1 leading-relaxed max-w-2xl">
                {path.pathAdaptationBanner.message}
              </p>
            </div>
          </div>
          <button
            onClick={dismissAdaptationBanner}
            className="shrink-0 p-1.5 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-white/[0.06] transition"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </MotionDiv>
      )}

      {/* ============================================================ Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ---------------------------------------------------- Left column */}
        <div className="lg:col-span-8 space-y-6">
          {/* 2 · CURRENT PROJECT */}
          <MotionDiv variants={fadeUp}>
            <GlassCard hoverEffect={false} className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <Eyebrow icon={Target}>Current Project · Phase {phaseIndex + 1} of {totalPhases}</Eyebrow>
                  <h3 className="mt-3 font-display text-xl font-semibold text-stone-900 dark:text-white">{activePhase.title}</h3>
                </div>
                <img
                  src={IMAGERY.projectCard}
                  alt="Code editor on a developer workstation"
                  loading="lazy"
                  className="hidden sm:block w-24 h-16 object-cover rounded-lg border border-stone-200 dark:border-white/10 opacity-90"
                />
                <Link
                  to="/dashboard/learning-path"
                  className="text-xs font-medium text-stone-500 hover:text-amber-600 dark:hover:text-amber-400 flex items-center gap-1 transition"
                >
                  Full roadmap <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
              {activePhase.description && (
                <p className="mt-1.5 text-sm text-stone-600 dark:text-stone-400 max-w-2xl leading-relaxed">
                  {activePhase.description}
                </p>
              )}
              <div className="mt-5 flex items-center gap-4">
                <ProgressBar value={phaseProgress} className="flex-1" showValue size="lg" />
                <span className="mono-label text-stone-400 dark:text-stone-500 whitespace-nowrap">
                  {doneNodes}/{totalNodes} steps
                </span>
              </div>
            </GlassCard>
          </MotionDiv>

          {/* 3 · YOUR NEXT MOVE */}
          <MotionDiv variants={fadeUp}>
            <div className="relative overflow-hidden rounded-xl border border-amber-500/40 dark:border-amber-500/30 bg-amber-500/[0.04] p-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-60" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
                </span>
                <Eyebrow>Your Next Move</Eyebrow>
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-5">
                <div className="min-w-0">
                  <h3 className="font-display text-lg sm:text-xl font-semibold text-stone-900 dark:text-white">
                    {activeNode?.title}
                  </h3>
                  <p className="mt-1.5 text-sm text-stone-600 dark:text-stone-400 max-w-xl leading-relaxed">
                    {activeNode?.description}
                  </p>
                  <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-4 text-xs text-stone-500 dark:text-stone-400">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-amber-500" /> ~{activeNode?.estimatedMinutes || 45} min
                    </span>
                    {activeNode?.confidenceScore != null && (
                      <span className="flex items-center gap-1.5">
                        <Gauge className="w-3.5 h-3.5 text-amber-500" /> {activeNode.confidenceScore}% confidence
                      </span>
                    )}
                    <span className="flex items-center gap-1.5">
                      <GitBranch className="w-3.5 h-3.5 text-amber-500" /> {activePhase.title}
                    </span>
                  </div>
                </div>
                <Link to="/dashboard/learning-path" className="shrink-0">
                  <Button variant="primary" size="md" icon={Play}>
                    Continue
                  </Button>
                </Link>
              </div>
            </div>
          </MotionDiv>

          {/* 4 · BUILD QUEUE */}
          <MotionDiv variants={fadeUp}>
            <GlassCard hoverEffect={false} className="p-6">
              <div className="flex items-center justify-between pb-4 mb-2 border-b border-stone-200 dark:border-white/[0.08]">
                <div>
                  <Eyebrow>Build Queue</Eyebrow>
                  <p className="mt-1.5 text-sm text-stone-500 dark:text-stone-400">Steps in your current phase</p>
                </div>
                <Badge variant="cyan" size="sm">{totalNodes} steps</Badge>
              </div>
              <div className="divide-y divide-stone-100 dark:divide-white/[0.06]">
                {(activePhase.nodes || []).map((node, i) => {
                  const done = node.status === 'completed';
                  const active = node.status === 'in_progress';
                  return (
                    <div key={node.id} className="flex items-center justify-between gap-4 py-3.5 group">
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center mono-label text-[11px] shrink-0 border ${
                            done
                              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                              : active
                              ? 'bg-amber-500 border-amber-500 text-stone-950'
                              : 'bg-stone-50 dark:bg-white/[0.03] border-stone-200 dark:border-white/10 text-stone-400 dark:text-stone-500'
                          }`}
                        >
                          {done ? <CheckCircle2 className="w-4 h-4" /> : active ? <Play className="w-3.5 h-3.5" /> : `0${i + 1}`}
                        </div>
                        <div className="min-w-0">
                          <h4 className={`text-sm font-medium truncate ${done ? 'text-stone-400 dark:text-stone-500 line-through' : 'text-stone-900 dark:text-white'}`}>
                            {node.title}
                          </h4>
                          <p className="mono-label text-stone-400 dark:text-stone-500 mt-1">
                            {node.type} · {node.status.replace('_', ' ')}
                          </p>
                        </div>
                      </div>
                      <Badge variant={done ? 'emerald' : active ? 'amber' : 'default'} size="sm">
                        {done ? 'Done' : active ? 'Active' : 'Queued'}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </GlassCard>
          </MotionDiv>
        </div>

        {/* ---------------------------------------------------- Right column */}
        <div className="lg:col-span-4 space-y-6">
          {/* 5 · TRAJECTORY (Roadmap Journey) */}
          <MotionDiv variants={fadeUp}>
            <GlassCard hoverEffect={false} className="p-6">
              <Eyebrow icon={Gauge}>Trajectory</Eyebrow>
              <div className="mt-4 flex items-center gap-5">
                <ProgressRing value={path?.overallProgress ?? 45} size={84} stroke={7}>
                  <span className="font-display text-lg font-bold text-stone-900 dark:text-white tabular-nums">
                    {path?.overallProgress ?? 45}%
                  </span>
                </ProgressRing>
                <div className="flex-1 space-y-3">
                  <div>
                    <span className="mono-label text-stone-400 dark:text-stone-500">Phases</span>
                    <p className="text-sm font-semibold text-stone-900 dark:text-white mt-0.5">
                      {phaseIndex + 1} of {totalPhases} active
                    </p>
                  </div>
                  <div>
                    <span className="mono-label text-stone-400 dark:text-stone-500">Remaining</span>
                    <p className="text-sm font-semibold text-stone-900 dark:text-white mt-0.5">
                      {path?.estimatedHoursLeft ?? 42} hrs of focused build
                    </p>
                  </div>
                </div>
              </div>
              <Link
                to="/dashboard/progress"
                className="mt-5 pt-4 border-t border-stone-200 dark:border-white/[0.08] flex items-center justify-between text-xs font-medium text-stone-500 hover:text-amber-600 dark:hover:text-amber-400 transition"
              >
                View full progress <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </GlassCard>
          </MotionDiv>

          {/* 6 · SKILL GAPS */}
          <MotionDiv variants={fadeUp}>
            <GlassCard hoverEffect={false} className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Eyebrow icon={CircleDashed}>Skill Gaps</Eyebrow>
                <Link to="/dashboard/progress" className="text-xs font-medium text-stone-500 hover:text-amber-600 dark:hover:text-amber-400 transition">
                  All skills
                </Link>
              </div>
              <div className="space-y-4">
                {skillGaps.slice(0, 4).map((sk) => (
                  <div key={sk.id}>
                    <div className="flex justify-between items-baseline text-xs mb-1.5">
                      <span className="text-stone-700 dark:text-stone-300 font-medium truncate pr-2">{sk.name}</span>
                      <span className="mono-label text-stone-400 dark:text-stone-500 tabular-nums shrink-0">
                        {sk.mastery}<span className="opacity-50">→{sk.target ?? 100}</span>
                      </span>
                    </div>
                    <div className="relative w-full h-1.5 rounded-full bg-stone-200 dark:bg-white/[0.08] overflow-hidden">
                      <div className="h-full rounded-full bg-amber-500" style={{ width: `${sk.mastery}%` }} />
                      {sk.target != null && (
                        <span
                          className="absolute top-1/2 -translate-y-1/2 w-0.5 h-3 bg-stone-400 dark:bg-white/40"
                          style={{ left: `calc(${sk.target}% - 1px)` }}
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          </MotionDiv>

          {/* 7 · RECENT ACTIVITY */}
          <MotionDiv variants={fadeUp}>
            <GlassCard hoverEffect={false} className="p-6">
              <Eyebrow icon={Activity}>Recent Activity</Eyebrow>
              <ol className="mt-4 relative border-l border-stone-200 dark:border-white/[0.10] ml-1 space-y-4">
                {recentEvents.slice(0, 4).map((ev) => (
                  <li key={ev.id} className="pl-4 relative">
                    <span className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-amber-500 ring-4 ring-white dark:ring-[#141416]" />
                    <p className="text-[13px] text-stone-800 dark:text-stone-200 leading-snug">{ev.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="mono-label text-[9px] text-amber-600 dark:text-amber-400/80">{ev.type}</span>
                      <span className="text-[10px] text-stone-400 dark:text-stone-500">{ev.timestamp}</span>
                    </div>
                  </li>
                ))}
              </ol>
            </GlassCard>
          </MotionDiv>

          {/* 8 · AI INSIGHT */}
          <MotionDiv variants={fadeUp}>
            <div className="rounded-xl border border-stone-200 dark:border-white/[0.08] bg-stone-900 dark:bg-white/[0.03] p-6 relative overflow-hidden">
              <div className="absolute inset-0 bg-dots opacity-40 dark:opacity-60 pointer-events-none" />
              <div className="relative">
                <div className="flex items-center gap-2 mb-2.5">
                  <span className="w-7 h-7 rounded-lg bg-amber-500 flex items-center justify-center">
                    <Compass className="w-4 h-4 text-stone-950" />
                  </span>
                  <span className="mono-label text-amber-400">HADES Coach</span>
                </div>
                <p className="text-sm text-stone-300 dark:text-stone-300 leading-relaxed mb-4">
                  Stuck on a concept or unsure what to build next? Your context-aware coach knows exactly where you are in the path.
                </p>
                <Button
                  variant="primary"
                  size="sm"
                  className="w-full"
                  icon={MessageSquare}
                  onClick={() => openAssistant('What is the single highest-impact concept for me to focus on next, given my current phase?')}
                >
                  Talk to your coach
                </Button>
              </div>
            </div>
          </MotionDiv>
        </div>
      </div>
    </MotionDiv>
  );
}
