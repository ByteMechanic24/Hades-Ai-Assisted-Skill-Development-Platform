import React from 'react';
import { motion } from 'framer-motion';
import { useLearner } from '../context/LearnerContext';
import { Badge, Eyebrow, SectionHeader, StatCell, ProgressRing } from '../components/ui';
import { fadeUp, staggerContainer } from '../utils/motion';
import {
  TrendingUp,
  Award,
  Clock,
  Flame,
  CheckCircle2,
  Lock,
  Gauge,
  Activity,
  ArrowUpRight,
  Terminal,
  Milestone as MilestoneIcon
} from 'lucide-react';

const MotionDiv = motion.div;

export function ProgressPage() {
  const {
    skills,
    milestones,
    path,
    progressStats,
    recentEvents,
    loadSkills,
    loadMilestones,
    loadProgressStats,
    loadProgressEvents,
  } = useLearner();

  React.useEffect(() => {
    loadSkills();
    loadMilestones();
    loadProgressStats();
    loadProgressEvents();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const milestonesDone = milestones.filter((m) => m.status === 'completed').length;
  const avgMastery = skills.length
    ? Math.round(skills.reduce((sum, s) => sum + s.mastery, 0) / skills.length)
    : 0;

  const kpis = [
    { label: 'Study Streak', value: `${progressStats?.currentStreak ?? 14}d`, sub: 'days continuous', icon: Flame, variant: 'indigo' },
    { label: 'Focused Time', value: `${progressStats?.weeklyHoursLogged ?? 8.0}`, sub: `hours logged (target: ${progressStats?.weeklyHoursTarget ?? 14}h)`, icon: Clock, variant: 'indigo' },
    { label: 'Verified Badges', value: `${milestonesDone}/${milestones.length || 4}`, sub: 'milestones earned', icon: Award, variant: 'violet' },
    { label: 'Path Complete', value: `${path?.overallProgress ?? progressStats?.overallProgressPercent ?? 38}%`, sub: 'overall roadmap', icon: Gauge, variant: 'violet' },
  ];

  return (
    <MotionDiv variants={staggerContainer(0.07)} initial="hidden" animate="show" className="space-y-8 pb-16">
      {/* Header (Violet / Growth World) */}
      <MotionDiv variants={fadeUp}>
        <Eyebrow icon={TrendingUp} variant="violet" className="mb-3">Mastery Analytics &amp; Verification</Eyebrow>
        <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          Verified Competency Telemetry
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
          Every completed stage and checkpoint recalculates your competency scores. Track your progression against target thresholds, review earned milestone credentials, and monitor live telemetry events.
        </p>
      </MotionDiv>

      {/* KPI Strip */}
      <MotionDiv variants={fadeUp} className="grid grid-cols-2 lg:grid-cols-4 gap-px rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 bg-slate-200 dark:border-white/10 shadow-card">
        {kpis.map((k) => (
          <div key={k.label} className="bg-white dark:bg-[#121620] p-5 sm:p-6">
            <StatCell label={k.label} value={k.value} sub={k.sub} icon={k.icon} accent={k.variant === 'violet' || k.variant === 'indigo'} variant={k.variant} />
          </div>
        ))}
      </MotionDiv>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Competency Matrix + Milestones */}
        <div className="lg:col-span-2 space-y-6">
          {/* Domain competency matrix */}
          <MotionDiv variants={fadeUp}>
            <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#121620] p-6 shadow-card">
              <SectionHeader
                eyebrow="Competency Matrix"
                title="Skills Closing on Target"
                variant="violet"
                action={
                  <div className="flex items-center gap-3">
                    <ProgressRing value={avgMastery} variant="violet" size={52} stroke={5}>
                      <span className="mono-label text-[10px] text-slate-900 dark:text-white font-bold tabular-nums">{avgMastery}%</span>
                    </ProgressRing>
                    <div className="text-right hidden sm:block">
                      <span className="mono-label text-slate-400 dark:text-slate-500 font-medium text-[10px] block">Average Mastery</span>
                    </div>
                  </div>
                }
              />
              <div className="mt-6 space-y-5">
                {skills.length === 0 ? (
                  <p className="text-xs text-slate-500 dark:text-slate-400 py-4 text-center">
                    No active competencies yet. Generate a learning roadmap to start tracking skill masteries.
                  </p>
                ) : (
                  skills.map((sk) => {
                    const gap = Math.max(0, (sk.target ?? 100) - sk.mastery);
                    return (
                      <div key={sk.id}>
                        <div className="flex items-end justify-between gap-3 mb-2">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">{sk.name}</h4>
                              <span className="mono-label text-violet-600 dark:text-violet-400 text-[10px] hidden sm:inline font-semibold">{sk.category}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2.5 shrink-0">
                            {sk.trend && (
                              <span className="inline-flex items-center gap-0.5 text-xs font-bold text-violet-600 dark:text-violet-400">
                                <ArrowUpRight className="w-3 h-3" />
                                {sk.trend}
                              </span>
                            )}
                            <span className="font-display text-sm font-bold text-slate-900 dark:text-white tabular-nums">
                              {sk.mastery}%
                            </span>
                          </div>
                        </div>
                        <div className="relative w-full h-2 rounded-full bg-slate-200 dark:bg-white/[0.08] overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-violet-600 to-indigo-500 transition-[width] duration-700 ease-out"
                            style={{ width: `${sk.mastery}%` }}
                          />
                          {sk.target != null && (
                            <span
                              className="absolute -top-0.5 h-3 w-0.5 bg-slate-600 dark:bg-white/70"
                              style={{ left: `calc(${sk.target}% - 1px)` }}
                              title={`Target: ${sk.target}%`}
                            />
                          )}
                        </div>
                        <div className="flex items-center justify-between mt-1.5">
                          <span className="mono-label text-slate-500 dark:text-slate-400 text-[10px] font-medium">
                            {gap > 0 ? `${gap}% to target benchmark` : 'Target threshold reached'}
                          </span>
                          <span className="mono-label text-slate-500 dark:text-slate-400 text-[10px] font-medium">
                            Confidence: {sk.confidence}%
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </MotionDiv>

          {/* Milestone Verification Timeline */}
          <MotionDiv variants={fadeUp}>
            <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#121620] p-6 shadow-card">
              <SectionHeader eyebrow="Milestone Credentials" title="Verification Timeline" icon={MilestoneIcon} variant="violet" />
              {milestones.length === 0 ? (
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-6 py-4 text-center">
                  Milestones unlock as you progress through verified roadmap stages.
                </p>
              ) : (
                <ol className="mt-6 relative border-l border-slate-200 dark:border-white/10 ml-3 space-y-6">
                  {milestones.map((ms) => {
                    const done = ms.status === 'completed';
                    const active = ms.status === 'in_progress';
                    return (
                      <li key={ms.id} className="pl-6 relative">
                        <span
                          className={`absolute -left-[13px] top-0 w-6 h-6 rounded-full flex items-center justify-center ring-4 ring-white dark:ring-[#121620] shadow-sm ${done
                              ? 'bg-violet-600 text-white'
                              : active
                                ? 'bg-violet-500 text-white'
                                : 'bg-slate-100 dark:bg-white/[0.06] text-slate-400 dark:text-slate-500'
                            }`}
                        >
                          {done ? <CheckCircle2 className="w-3.5 h-3.5" /> : active ? <Award className="w-3.5 h-3.5" /> : <Lock className="w-3 h-3" />}
                        </span>
                        <div className={`${!done && !active ? 'opacity-60' : ''}`}>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="mono-label text-violet-600 dark:text-violet-400 font-bold">{ms.phase}</span>
                            <span className="text-xs text-slate-400 dark:text-slate-500">· {ms.completionDate || ms.targetDate}</span>
                            <Badge variant={done ? 'violet' : active ? 'violet' : 'default'} size="sm" className="ml-auto">
                              {done ? 'Verified' : active ? 'In Progress' : 'Locked'}
                            </Badge>
                          </div>
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-1.5">{ms.title}</h4>
                          {ms.skillsEarned?.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-2.5">
                              {ms.skillsEarned.map((s) => (
                                <span
                                  key={s}
                                  className="mono-label text-[10px] px-2 py-0.5 rounded-md border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 font-medium"
                                >
                                  +{s}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ol>
              )}
            </div>
          </MotionDiv>
        </div>

        {/* Right: Telemetry Event Bus */}
        <div className="space-y-6">
          <MotionDiv variants={fadeUp}>
            <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#121620] overflow-hidden shadow-card">
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-white/[0.02]">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-violet-500" />
                  <span className="mono-label text-slate-800 dark:text-slate-200 font-bold text-xs">Engine Event Stream</span>
                </div>
                <span className="mono-label text-[9px] text-violet-600 dark:text-violet-400 flex items-center gap-1 font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" /> Live Telemetry
                </span>
              </div>
              <div className="p-5">
                <p className="mono-label text-[10px] text-slate-400 dark:text-slate-500 mb-3 font-medium">DISPATCH: POST /api/progress/events</p>
                {recentEvents.length === 0 ? (
                  <p className="text-xs text-slate-500 dark:text-slate-400 py-3">
                    No progress events dispatched yet.
                  </p>
                ) : (
                  <div className="space-y-2.5">
                    {recentEvents.map((ev) => (
                      <div
                        key={ev.id}
                        className="rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.02] p-3"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="mono-label text-[9px] text-violet-600 dark:text-violet-400 font-bold">{ev.type}</span>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500">{ev.timestamp}</span>
                        </div>
                        <p className="text-xs font-medium text-slate-800 dark:text-slate-200 leading-snug">{ev.title}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </MotionDiv>

          <MotionDiv variants={fadeUp}>
            <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#121620] p-5 shadow-subtle">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-4 h-4 text-violet-500" />
                <span className="mono-label text-slate-700 dark:text-slate-300 font-bold text-xs">Deterministic Feedback Loop</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Each interaction and checkpoint completion emits a structured event payload. The Hades Engine processes these events to re-weight your downstream prerequisite graph dynamically.
              </p>
            </div>
          </MotionDiv>
        </div>
      </div>
    </MotionDiv>
  );
}
