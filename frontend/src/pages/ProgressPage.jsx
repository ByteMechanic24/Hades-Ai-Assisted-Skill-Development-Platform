import React from 'react';
import { useLearner } from '../context/LearnerContext';
import { GlassCard, Badge, Button } from '../components/ui';
import { 
  TrendingUp, 
  Award, 
  Clock, 
  Flame, 
  CheckCircle2, 
  Lock, 
  Sparkles, 
  Activity,
  Layers
} from 'lucide-react';

export function ProgressPage() {
  const { skills, milestones, path, recentEvents } = useLearner();

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="rounded-3xl bg-gradient-to-r from-indigo-900/90 via-indigo-950/80 to-slate-900 dark:from-indigo-950/80 dark:via-slate-900 dark:to-slate-900 border border-indigo-500/30 p-6 sm:p-8 shadow-2xl text-white">
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="cyan" size="sm">
            <TrendingUp className="w-3.5 h-3.5" /> Competency Tracking & Telemetry
          </Badge>
          <Badge variant="emerald" size="sm">Real-time Event Dispatch</Badge>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
          Learning Velocity & Skill Mastery
        </h1>
        <p className="text-xs sm:text-sm text-slate-200 max-w-2xl mt-1.5 leading-relaxed">
          Monitor your continuous improvement across prerequisite domains, verify milestone completions, and inspect backend event telemetry.
        </p>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <GlassCard className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-600/30 border border-indigo-200 dark:border-indigo-500/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-slate-500 dark:text-slate-400">Study Streak</span>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">14 Days</h3>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-100 dark:bg-cyan-600/30 border border-cyan-200 dark:border-cyan-500/40 flex items-center justify-center text-cyan-600 dark:text-cyan-400">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-slate-500 dark:text-slate-400">Total Hours</span>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">48.5 hrs</h3>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-600/30 border border-emerald-200 dark:border-emerald-500/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-slate-500 dark:text-slate-400">Milestones Met</span>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">1 / 4</h3>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-600/30 border border-purple-200 dark:border-purple-500/40 flex items-center justify-center text-purple-600 dark:text-purple-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-slate-500 dark:text-slate-400">Path Completion</span>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">{path?.overallProgress || 45}%</h3>
            </div>
          </div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Skill Mastery & Milestones */}
        <div className="lg:col-span-2 space-y-6">
          {/* Skill Breakdown */}
          <GlassCard className="p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Domain Competency Matrix</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Mastery percentages verified via hands-on labs and project modules</p>
              </div>
              <Badge variant="cyan" size="sm">6 Active Skills</Badge>
            </div>

            <div className="space-y-4">
              {skills.map((sk) => (
                <div key={sk.id} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">{sk.name}</h4>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">{sk.category}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold text-indigo-600 dark:text-cyan-400">{sk.mastery}%</span>
                      <span className="text-[11px] text-emerald-600 dark:text-emerald-400 block">{sk.trend} this week</span>
                    </div>
                  </div>

                  <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400"
                      style={{ width: `${sk.mastery}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Milestones Checkpoints */}
          <GlassCard className="p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Milestone Verification Timeline</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Formal gates required for track completion</p>
              </div>
            </div>

            <div className="space-y-4">
              {milestones.map((ms) => (
                <div
                  key={ms.id}
                  className={`p-4 rounded-xl border flex items-start justify-between gap-4 ${
                    ms.status === 'completed'
                      ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-500/30'
                      : ms.status === 'in_progress'
                      ? 'bg-indigo-50/60 dark:bg-indigo-950/30 border-indigo-300 dark:border-indigo-500/40 ring-1 ring-indigo-500/30'
                      : 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 opacity-60'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg mt-0.5 ${
                      ms.status === 'completed' ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' : ms.status === 'in_progress' ? 'bg-indigo-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                    }`}>
                      {ms.status === 'completed' ? <CheckCircle2 className="w-4 h-4" /> : ms.status === 'in_progress' ? <Award className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-semibold text-indigo-600 dark:text-cyan-400 uppercase">{ms.phase}</span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">• {ms.completionDate || ms.targetDate}</span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">{ms.title}</h4>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {ms.skillsEarned.map(s => (
                          <span key={s} className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400">
                            + {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <Badge
                    variant={ms.status === 'completed' ? 'emerald' : ms.status === 'in_progress' ? 'amber' : 'default'}
                    size="sm"
                  >
                    {ms.status === 'completed' ? 'Earned' : ms.status === 'in_progress' ? 'Active' : 'Locked'}
                  </Badge>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>

        {/* Right Col: Semantic Event Log Stream */}
        <div className="space-y-6">
          <GlassCard className="p-6 border-indigo-500/20">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Semantic Event Bus</h3>
              </div>
              <Badge variant="cyan" size="sm">POST /progress/events</Badge>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Structured events dispatched to the Scala backend to drive state mutations & graph re-weighting.
            </p>

            <div className="space-y-3">
              {recentEvents.map(ev => (
                <div key={ev.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-xs">
                  <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
                    <span className="font-mono text-indigo-600 dark:text-indigo-400 font-semibold">{ev.type}</span>
                    <span>{ev.timestamp}</span>
                  </div>
                  <p className="text-slate-800 dark:text-slate-200 font-medium">{ev.title}</p>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
