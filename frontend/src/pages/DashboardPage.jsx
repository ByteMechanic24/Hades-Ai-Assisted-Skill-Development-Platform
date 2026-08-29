import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useLearner } from '../context/LearnerContext';
import { useAuth } from '../context/AuthContext';
import { Button, Badge, Eyebrow, ProgressBar, ProgressRing } from '../components/ui';
import { fadeUp, staggerContainer } from '../utils/motion';
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
  Sparkles,
  Layers,
  ArrowUpRight
} from 'lucide-react';

const MotionDiv = motion.div;

export function DashboardPage() {
  const {
    profile,
    goal,
    path,
    skills,
    milestones,
    progressStats,
    recentEvents,
    dismissAdaptationBanner,
    openAssistant,
    loadAllData,
    mergeAuthUser,
    dashboardLoading,
    dashboardError,
  } = useLearner();
  const { user } = useAuth();

  // Load real dashboard & telemetry data on mount
  useEffect(() => {
    if (user) {
      mergeAuthUser(user);
    }
    loadAllData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const phases = path?.phases || [];
  const activePhase =
    phases.find((p) => p.status === 'in_progress') || phases[0] || { id: 'p1', title: goal?.title || 'Personalized AI Systems Roadmap', description: 'Complete roadmap nodes to track milestone progress.', nodes: [] };
  const activeNode =
    activePhase?.nodes?.find((n) => n.status === 'in_progress') ||
    activePhase?.nodes?.[0] || {
      title: activePhase.title || 'Start Your First Learning Module',
      description: 'Explore the interactive skill graph and begin your tailored path.',
      estimatedMinutes: 60,
    };

  const phaseIndex = Math.max(0, phases.findIndex((p) => p.id === activePhase.id));
  const totalPhases = Math.max(1, phases.length);
  const doneNodes = (activePhase.nodes || []).filter((n) => n.status === 'completed').length;
  const totalNodes = Math.max(1, (activePhase.nodes || []).length);
  const phaseProgress = activePhase.progress ?? (totalNodes > 0 ? Math.round((doneNodes / totalNodes) * 100) : 0);

  // Skill gaps = the distance between current mastery and target, largest first.
  const skillGaps = [...(skills || [])]
    .map((s) => ({ ...s, gap: Math.max(0, (s.target ?? 100) - s.mastery) }))
    .sort((a, b) => b.gap - a.gap);

  const today = new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });

  const heroStats = [
    { label: 'Path Complete', value: `${path?.overallProgress ?? progressStats?.overallProgressPercent ?? 38}%`, icon: Gauge, variant: 'violet' },
    { label: 'Hours Left', value: `${path?.estimatedHoursLeft ?? 42}h`, icon: Clock, variant: 'indigo' },
    { label: 'Study Streak', value: `${progressStats?.currentStreak ?? 14}d`, icon: Flame, variant: 'indigo' },
    { label: 'Weekly Target', value: `${progressStats?.weeklyHoursLogged ?? 8}/${progressStats?.weeklyHoursTarget ?? 14}h`, icon: Zap, variant: 'violet' },
  ];

  return (
    <MotionDiv variants={staggerContainer(0.07)} initial="hidden" animate="show" className="space-y-6 pb-16">
      {/* ============================================================ 1 · HERO BRIEFING (Indigo Theme) */}
      <MotionDiv variants={fadeUp} className="relative overflow-hidden rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#121620] shadow-card">
        <div className="absolute inset-0 bg-grid opacity-25 pointer-events-none" />
        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-indigo-600 to-violet-600" />
        <div className="relative p-6 sm:p-8">
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
            <div className="min-w-0">
              <Eyebrow icon={Compass} variant="indigo" className="mb-3">Mission Control · {today}</Eyebrow>
              <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white leading-tight">
                Welcome back, {profile?.name?.split(' ')[0] || 'Learner'}.
              </h1>
              <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
                Building specialization for{' '}
                <span className="text-slate-900 dark:text-white font-bold">{goal?.targetRole || 'Autonomous AI Systems Engineer'}</span>. Active
                mission: <span className="text-indigo-600 dark:text-indigo-400 font-semibold">{goal?.title || activePhase.title}</span>.
              </p>
            </div>
            <div className="flex items-center gap-2.5 shrink-0">
              <Button
                variant="secondary"
                size="md"
                icon={MessageSquare}
                onClick={() => openAssistant('Review my active roadmap progress and suggest the next high-impact concept to study.')}
              >
                Ask AI Coach
              </Button>
              <Link to="/dashboard/learning-path">
                <Button variant="violet" size="md" icon={GitBranch}>
                  Open Roadmap
                </Button>
              </Link>
            </div>
          </div>

          {/* Inline Stat Rail */}
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-200 dark:divide-white/[0.08] border-t border-slate-200 dark:border-white/[0.08] pt-6">
            {heroStats.map((s) => (
              <div key={s.label} className="p-3 sm:px-5 first:pl-0">
                <span className="mono-label text-slate-500 dark:text-slate-400 flex items-center gap-1.5 font-medium text-[10px]">
                  <s.icon className={s.variant === 'emerald' ? 'w-3.5 h-3.5 text-emerald-500' : s.variant === 'indigo' ? 'w-3.5 h-3.5 text-indigo-500' : s.variant === 'cyan' ? 'w-3.5 h-3.5 text-cyan-500' : 'w-3.5 h-3.5 text-violet-500'} />
                  {s.label}
                </span>
                <div className="mt-1 font-display text-xl sm:text-2xl font-bold tabular-nums text-slate-900 dark:text-white">
                  {s.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      </MotionDiv>

      {/* ================================================ Adaptation Banner (Semantic Alert) */}
      {path?.pathAdaptationBanner?.visible && (
        <MotionDiv
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-violet-500/30 bg-violet-500/[0.08] p-4 sm:p-5 flex items-start justify-between gap-4 shadow-subtle"
        >
          <div className="flex items-start gap-3.5">
            <div className="mt-0.5 w-8 h-8 rounded-xl bg-violet-500/20 text-violet-600 dark:text-violet-400 flex items-center justify-center shrink-0">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">{path.pathAdaptationBanner.title}</h4>
                <Badge variant="violet" size="sm">Graph Recalculated</Badge>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed max-w-2xl">
                {path.pathAdaptationBanner.message}
              </p>
            </div>
          </div>
          <button
            onClick={dismissAdaptationBanner}
            className="shrink-0 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.06] transition"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </MotionDiv>
      )}

      {/* ============================================================ Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ---------------------------------------------------- Left Column */}
        <div className="lg:col-span-8 space-y-6">
          {/* 2 · CURRENT ACTIVE STAGE (Indigo / Violet) */}
          <MotionDiv variants={fadeUp}>
            <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#121620] p-6 shadow-card">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <Eyebrow icon={Target} variant="indigo">Active Stage · Phase {phaseIndex + 1} of {totalPhases}</Eyebrow>
                  <h3 className="mt-2 font-display text-xl font-bold text-slate-900 dark:text-white">{activePhase.title}</h3>
                </div>
                <Link
                  to="/dashboard/learning-path"
                  className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 transition shrink-0"
                >
                  Full Roadmap <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
              {activePhase.description && (
                <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
                  {activePhase.description}
                </p>
              )}
              <div className="mt-5 flex items-center gap-4">
                <ProgressBar value={phaseProgress} variant="indigo" className="flex-1" showValue size="lg" />
                <span className="mono-label text-slate-400 dark:text-slate-500 whitespace-nowrap font-medium text-[10px]">
                  {doneNodes}/{totalNodes} Steps
                </span>
              </div>
            </div>
          </MotionDiv>

          {/* 3 · IMMEDIATE NEXT STEP (Violet / High Attention) */}
          <MotionDiv variants={fadeUp}>
            <div className="relative overflow-hidden rounded-2xl border border-violet-500/40 dark:border-violet-500/30 bg-violet-500/[0.04] p-6 shadow-card">
              <div className="flex items-center gap-2 mb-3">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-60" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500" />
                </span>
                <Eyebrow variant="violet">Immediate Next Step</Eyebrow>
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-5">
                <div className="min-w-0">
                  <h3 className="font-display text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                    {activeNode?.title}
                  </h3>
                  <p className="mt-1.5 text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-xl leading-relaxed">
                    {activeNode?.description}
                  </p>
                  <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-4 text-xs text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Clock className="w-3.5 h-3.5 text-violet-500" /> ~{activeNode?.estimatedMinutes || 45} mins
                    </span>
                    {activeNode?.confidenceScore != null && (
                      <span className="flex items-center gap-1.5 font-medium">
                        <Gauge className="w-3.5 h-3.5 text-violet-500" /> {activeNode.confidenceScore}% confidence
                      </span>
                    )}
                    <span className="flex items-center gap-1.5 font-medium">
                      <GitBranch className="w-3.5 h-3.5 text-violet-500" /> {activePhase.title}
                    </span>
                  </div>
                </div>
                <Link to="/dashboard/learning-path" className="shrink-0">
                  <Button variant="violet" size="md" icon={Play} className="shadow-glow-violet">
                    Launch Module
                  </Button>
                </Link>
              </div>
            </div>
          </MotionDiv>

          {/* 4 · STAGE CHECKPOINTS QUEUE */}
          <MotionDiv variants={fadeUp}>
            <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#121620] p-6 shadow-card">
              <div className="flex items-center justify-between pb-4 mb-2 border-b border-slate-200 dark:border-white/[0.08]">
                <div>
                  <Eyebrow icon={Layers} variant="indigo">Stage Queue</Eyebrow>
                  <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">Prerequisite nodes in your current phase</p>
                </div>
                <Badge variant="indigo" size="sm">{totalNodes} Total Nodes</Badge>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-white/[0.06]">
                {(activePhase.nodes || []).map((node, i) => {
                  const done = node.status === 'completed';
                  const active = node.status === 'in_progress';
                  return (
                    <div key={node.id} className="flex items-center justify-between gap-4 py-3.5 group">
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center mono-label text-[11px] shrink-0 font-bold border ${done
                              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                              : active
                                ? 'bg-violet-600 border-violet-600 text-white shadow-sm'
                                : 'bg-slate-50 dark:bg-white/[0.03] border-slate-200 dark:border-white/10 text-slate-400 dark:text-slate-500'
                            }`}
                        >
                          {done ? <CheckCircle2 className="w-4 h-4" /> : active ? <Play className="w-3.5 h-3.5" /> : `0${i + 1}`}
                        </div>
                        <div className="min-w-0">
                          <h4 className={`text-sm font-semibold truncate ${done ? 'text-slate-400 dark:text-slate-500 line-through' : 'text-slate-900 dark:text-white'}`}>
                            {node.title}
                          </h4>
                          <p className="mono-label text-[9px] text-slate-400 dark:text-slate-500 mt-0.5 font-medium">
                            {node.type} · {node.status.replace('_', ' ')}
                          </p>
                        </div>
                      </div>
                      <Badge variant={done ? 'emerald' : active ? 'violet' : 'default'} size="sm">
                        {done ? 'Done' : active ? 'Active' : 'Queued'}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </div>
          </MotionDiv>
        </div>

        {/* ---------------------------------------------------- Right Column */}
        <div className="lg:col-span-4 space-y-6">
          {/* 5 · TRAJECTORY RING (Violet / Mastery) */}
          <MotionDiv variants={fadeUp}>
            <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#121620] p-6 shadow-card">
              <Eyebrow icon={Gauge} variant="violet">Mastery Trajectory</Eyebrow>
              <div className="mt-5 flex items-center gap-5">
                <ProgressRing value={path?.overallProgress ?? 45} variant="violet" size={84} stroke={7}>
                  <span className="font-display text-lg font-bold text-slate-900 dark:text-white tabular-nums">
                    {path?.overallProgress ?? 45}%
                  </span>
                </ProgressRing>
                <div className="flex-1 space-y-3">
                  <div>
                    <span className="mono-label text-slate-400 dark:text-slate-500 font-medium text-[10px]">Roadmap Progress</span>
                    <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                      {phaseIndex + 1} of {totalPhases} phases active
                    </p>
                  </div>
                  <div>
                    <span className="mono-label text-slate-400 dark:text-slate-500 font-medium text-[10px]">Estimated Work</span>
                    <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                      {path?.estimatedHoursLeft ?? 42} hrs remaining
                    </p>
                  </div>
                </div>
              </div>
              <Link
                to="/dashboard/progress"
                className="mt-5 pt-4 border-t border-slate-200 dark:border-white/[0.08] flex items-center justify-between text-xs font-bold text-violet-600 dark:text-violet-400 hover:underline transition"
              >
                Detailed Progress Matrix <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </MotionDiv>

          {/* 6 · SKILL GAPS MATRIX (Violet) */}
          <MotionDiv variants={fadeUp}>
            <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#121620] p-6 shadow-card">
              <div className="flex items-center justify-between mb-4">
                <Eyebrow icon={CircleDashed} variant="violet">Competency Gaps</Eyebrow>
                <Link to="/dashboard/progress" className="text-xs font-bold text-violet-600 dark:text-violet-400 hover:underline transition">
                  All Skills
                </Link>
              </div>
              <div className="space-y-4">
                {skillGaps.length === 0 ? (
                  <p className="text-xs text-slate-500 dark:text-slate-400 py-2">
                    Generate your roadmap to evaluate and track skill gaps.
                  </p>
                ) : (
                  skillGaps.slice(0, 4).map((sk) => (
                    <div key={sk.id}>
                      <div className="flex justify-between items-baseline text-xs mb-1.5">
                        <span className="text-slate-800 dark:text-slate-200 font-semibold truncate pr-2">{sk.name}</span>
                        <span className="mono-label text-slate-500 dark:text-slate-400 tabular-nums shrink-0 font-medium text-[10px]">
                          {sk.mastery}% <span className="text-slate-400 dark:text-slate-600">→ {sk.target ?? 100}%</span>
                        </span>
                      </div>
                      <div className="relative w-full h-1.5 rounded-full bg-slate-200 dark:bg-white/[0.08] overflow-hidden">
                        <div className="h-full rounded-full bg-gradient-to-r from-violet-600 to-indigo-500" style={{ width: `${sk.mastery}%` }} />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </MotionDiv>

          {/* 7 · LIVE EVENT TELEMETRY STREAM */}
          <MotionDiv variants={fadeUp}>
            <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#121620] p-6 shadow-card">
              <Eyebrow icon={Activity} variant="indigo">Engine Event Stream</Eyebrow>
              {recentEvents.length === 0 ? (
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-4">
                  No activity recorded yet. Explore nodes or complete tasks to see your event stream.
                </p>
              ) : (
                <ol className="mt-4 relative border-l border-slate-200 dark:border-white/10 ml-1 space-y-4">
                  {recentEvents.slice(0, 4).map((ev) => (
                    <li key={ev.id} className="pl-4 relative">
                      <span className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-violet-500 ring-4 ring-white dark:ring-[#121620]" />
                      <p className="text-[13px] font-medium text-slate-800 dark:text-slate-200 leading-snug">{ev.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="mono-label text-[9px] text-violet-600 dark:text-violet-400 font-bold">{ev.type}</span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500">{ev.timestamp}</span>
                      </div>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          </MotionDiv>

          {/* 8 · CONTEXTUAL COACH CARD (Electric Violet) */}
          <MotionDiv variants={fadeUp}>
            <div className="rounded-2xl border border-violet-500/30 bg-gradient-to-br from-[#0F172A] to-[#1E1B4B] text-white p-6 shadow-card relative overflow-hidden">
              <div className="absolute inset-0 bg-dots opacity-20 pointer-events-none" />
              <div className="relative z-10">
                <div className="flex items-center gap-2.5 mb-3">
                  <span className="w-8 h-8 rounded-xl bg-violet-600 flex items-center justify-center shadow-sm">
                    <Compass className="w-4 h-4 text-white" />
                  </span>
                  <span className="mono-label text-violet-300 font-bold">HADES AI Coach</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-4">
                  Have a question about {activeNode?.title}? Your coach has complete context on your target role and active prerequisite graph.
                </p>
                <Button
                  variant="violet"
                  size="sm"
                  className="w-full shadow-glow-violet"
                  icon={MessageSquare}
                  onClick={() => openAssistant(`What are the key production practices for "${activeNode?.title}" in the ${goal?.targetRole || 'AI Systems Engineer'} track?`)}
                >
                  Consult AI Coach
                </Button>
              </div>
            </div>
          </MotionDiv>
        </div>
      </div>
    </MotionDiv>
  );
}
