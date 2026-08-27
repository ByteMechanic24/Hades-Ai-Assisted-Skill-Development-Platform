import React from 'react';
import { motion } from 'framer-motion';
import { useLearner } from '../context/LearnerContext';
import { GlassCard, Badge, Eyebrow, SectionHeader, StatCell, ProgressRing } from '../components/ui';
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
  Milestone as MilestoneIcon,
} from 'lucide-react';

const MotionDiv = motion.div;

export function ProgressPage() {
  const { skills, milestones, path, recentEvents } = useLearner();

  const milestonesDone = milestones.filter((m) => m.status === 'completed').length;
  const avgMastery = skills.length
    ? Math.round(skills.reduce((sum, s) => sum + s.mastery, 0) / skills.length)
    : 0;

  const kpis = [
    { label: 'Study Streak', value: '14', sub: 'days', icon: Flame },
    { label: 'Focused Hours', value: '48.5', sub: 'logged', icon: Clock },
    { label: 'Milestones', value: `${milestonesDone}/${milestones.length}`, sub: 'earned', icon: Award },
    { label: 'Path Complete', value: `${path?.overallProgress ?? 45}%`, sub: 'overall', icon: Gauge },
  ];

  return (
    <MotionDiv variants={staggerContainer(0.07)} initial="hidden" animate="show" className="space-y-8 pb-16">
      {/* Header */}
      <MotionDiv variants={fadeUp}>
        <Eyebrow icon={TrendingUp} className="mb-3">Progress · The story so far</Eyebrow>
        <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 dark:text-white">
          Your growth, measured.
        </h1>
        <p className="mt-2 text-sm text-stone-600 dark:text-stone-400 max-w-2xl leading-relaxed">
          Every completed step compounds. Track how your competencies are closing on their targets, verify the milestones you&apos;ve
          earned, and watch the events your progress dispatches to the engine.
        </p>
      </MotionDiv>

      {/* KPI strip */}
      <MotionDiv variants={fadeUp} className="grid grid-cols-2 lg:grid-cols-4 gap-px rounded-2xl overflow-hidden border border-stone-200 dark:border-white/[0.08] bg-stone-200 dark:bg-white/[0.08]">
        {kpis.map((k) => (
          <div key={k.label} className="bg-white/90 dark:bg-[#141416]/80 backdrop-blur-md p-5 sm:p-6">
            <StatCell label={k.label} value={k.value} sub={k.sub} icon={k.icon} accent={k.label === 'Path Complete'} />
          </div>
        ))}
      </MotionDiv>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: competency matrix + milestones */}
        <div className="lg:col-span-2 space-y-6">
          {/* Domain competency matrix */}
          <MotionDiv variants={fadeUp}>
            <GlassCard hoverEffect={false} className="p-6">
              <SectionHeader
                eyebrow="Competency Matrix"
                title="Skills closing on target"
                action={
                  <div className="flex items-center gap-3">
                    <ProgressRing value={avgMastery} size={52} stroke={5}>
                      <span className="mono-label text-[10px] text-stone-700 dark:text-stone-200 tabular-nums">{avgMastery}%</span>
                    </ProgressRing>
                    <div className="text-right hidden sm:block">
                      <span className="mono-label text-stone-400 dark:text-stone-500 block">Avg mastery</span>
                    </div>
                  </div>
                }
              />
              <div className="mt-5 space-y-5">
                {skills.map((sk) => {
                  const gap = Math.max(0, (sk.target ?? 100) - sk.mastery);
                  return (
                    <div key={sk.id}>
                      <div className="flex items-end justify-between gap-3 mb-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-semibold text-stone-900 dark:text-white truncate">{sk.name}</h4>
                            <span className="mono-label text-stone-400 dark:text-stone-500 hidden sm:inline">{sk.category}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2.5 shrink-0">
                          {sk.trend && (
                            <span className="inline-flex items-center gap-0.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                              <ArrowUpRight className="w-3 h-3" />
                              {sk.trend}
                            </span>
                          )}
                          <span className="font-display text-base font-semibold text-stone-900 dark:text-white tabular-nums">
                            {sk.mastery}%
                          </span>
                        </div>
                      </div>
                      <div className="relative w-full h-2 rounded-full bg-stone-200 dark:bg-white/[0.08] overflow-hidden">
                        <div
                          className="h-full rounded-full bg-amber-500 transition-[width] duration-700 ease-out"
                          style={{ width: `${sk.mastery}%` }}
                        />
                        {sk.target != null && (
                          <span
                            className="absolute -top-0.5 h-3 w-0.5 bg-stone-500 dark:bg-white/60"
                            style={{ left: `calc(${sk.target}% - 1px)` }}
                            title={`Target ${sk.target}%`}
                          />
                        )}
                      </div>
                      <div className="flex items-center justify-between mt-1.5">
                        <span className="mono-label text-stone-400 dark:text-stone-500">
                          {gap > 0 ? `${gap}% to target` : 'Target reached'}
                        </span>
                        <span className="mono-label text-stone-400 dark:text-stone-500">
                          Confidence {sk.confidence}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </GlassCard>
          </MotionDiv>

          {/* Milestone verification timeline */}
          <MotionDiv variants={fadeUp}>
            <GlassCard hoverEffect={false} className="p-6">
              <SectionHeader eyebrow="Milestones" title="Verification timeline" icon={MilestoneIcon} />
              <ol className="mt-6 relative border-l border-stone-200 dark:border-white/[0.10] ml-3 space-y-6">
                {milestones.map((ms) => {
                  const done = ms.status === 'completed';
                  const active = ms.status === 'in_progress';
                  return (
                    <li key={ms.id} className="pl-6 relative">
                      <span
                        className={`absolute -left-[13px] top-0 w-6 h-6 rounded-full flex items-center justify-center ring-4 ring-white dark:ring-[#141416] ${
                          done
                            ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                            : active
                            ? 'bg-amber-500 text-stone-950'
                            : 'bg-stone-100 dark:bg-white/[0.06] text-stone-400 dark:text-stone-500'
                        }`}
                      >
                        {done ? <CheckCircle2 className="w-3.5 h-3.5" /> : active ? <Award className="w-3.5 h-3.5" /> : <Lock className="w-3 h-3" />}
                      </span>
                      <div className={`${!done && !active ? 'opacity-60' : ''}`}>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="mono-label text-amber-600 dark:text-amber-400/90">{ms.phase}</span>
                          <span className="text-[11px] text-stone-400 dark:text-stone-500">· {ms.completionDate || ms.targetDate}</span>
                          <Badge variant={done ? 'emerald' : active ? 'amber' : 'default'} size="sm" className="ml-auto">
                            {done ? 'Earned' : active ? 'In progress' : 'Locked'}
                          </Badge>
                        </div>
                        <h4 className="text-sm font-semibold text-stone-900 dark:text-white mt-1.5">{ms.title}</h4>
                        {ms.skillsEarned?.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-2.5">
                            {ms.skillsEarned.map((s) => (
                              <span
                                key={s}
                                className="mono-label text-[10px] px-2 py-1 rounded border border-stone-200 dark:border-white/10 text-stone-500 dark:text-stone-400"
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
            </GlassCard>
          </MotionDiv>
        </div>

        {/* Right: event bus */}
        <div className="space-y-6">
          <MotionDiv variants={fadeUp}>
            <GlassCard hoverEffect={false} className="p-0 overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-stone-200 dark:border-white/[0.08] bg-stone-50 dark:bg-white/[0.02]">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-amber-500" />
                  <span className="mono-label text-stone-600 dark:text-stone-300">Event Bus</span>
                </div>
                <span className="mono-label text-[9px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> streaming
                </span>
              </div>
              <div className="px-5 py-3">
                <p className="mono-label text-[10px] text-stone-400 dark:text-stone-500 mb-3">POST /progress/events</p>
                <div className="space-y-2.5">
                  {recentEvents.map((ev) => (
                    <div
                      key={ev.id}
                      className="rounded-lg border border-stone-200 dark:border-white/[0.08] bg-white dark:bg-white/[0.02] p-3"
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="mono-label text-[9px] text-amber-600 dark:text-amber-400">{ev.type}</span>
                        <span className="text-[10px] text-stone-400 dark:text-stone-500">{ev.timestamp}</span>
                      </div>
                      <p className="text-[13px] text-stone-800 dark:text-stone-200 leading-snug">{ev.title}</p>
                    </div>
                  ))}
                </div>
              </div>
            </GlassCard>
          </MotionDiv>

          <MotionDiv variants={fadeUp}>
            <div className="rounded-xl border border-stone-200 dark:border-white/[0.08] p-5">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-4 h-4 text-amber-500" />
                <span className="mono-label text-stone-500 dark:text-stone-400">How this works</span>
              </div>
              <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
                Each action you take emits a structured event. The engine consumes these to re-weight your prerequisite graph and keep
                your path adaptive — no two learners follow the same route.
              </p>
            </div>
          </MotionDiv>
        </div>
      </div>
    </MotionDiv>
  );
}
