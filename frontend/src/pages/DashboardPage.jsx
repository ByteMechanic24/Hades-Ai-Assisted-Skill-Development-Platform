import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLearner } from '../context/LearnerContext';
import { Button, GlassCard, Badge } from '../components/ui';
import { 
  Sparkles, 
  ArrowRight, 
  Play, 
  CheckCircle2, 
  Clock, 
  TrendingUp, 
  Award, 
  Bot, 
  GitBranch, 
  Layers, 
  BookOpen, 
  ChevronRight, 
  Flame,
  Bookmark
} from 'lucide-react';

export function DashboardPage() {
  const { profile, goal, path, roadmap, roadmapProgressPercentage, skills, resources, milestones, recentEvents, dismissAdaptationBanner, openAssistant } = useLearner();
  const navigate = useNavigate();

  const activePhase = path?.phases?.find(p => p.status === 'in_progress') || path?.phases?.[0] || { title: "Foundations & Vector Architecture", nodes: [] };
  const activeNode = activePhase?.nodes?.find(n => n.status === 'in_progress') || activePhase?.nodes?.[0] || { title: "Vector Search Deep Dive with pgvector & Qdrant", description: "Hands-on implementation of HNSW index tuning and hybrid lexical + semantic search.", estimatedMinutes: 90 };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Welcome Banner */}
      <div className="relative rounded-3xl bg-gradient-to-r from-indigo-900/90 via-indigo-950/80 to-slate-900 dark:from-indigo-950/90 dark:via-slate-900 dark:to-slate-900 border border-indigo-500/30 p-6 sm:p-8 overflow-hidden shadow-2xl text-white">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-cyan-500/15 to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="cyan" size="sm">
                <Flame className="w-3.5 h-3.5 text-amber-400" /> Active Goal
              </Badge>
              <span className="text-xs text-slate-300">Target Role: <strong className="text-white">{goal?.targetRole || "AI Systems Engineer"}</strong></span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
              Welcome back, {profile?.name || "Aman"}!
            </h1>
            <p className="text-xs sm:text-sm text-slate-200 max-w-2xl mt-1.5 leading-relaxed">
              You are in <span className="text-cyan-300 font-semibold">{activePhase.title}</span>. Your next high-leverage step is to complete the interactive vector search module.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/dashboard/learning-path">
              <Button variant="primary" size="md" icon={GitBranch}>
                Explore Learning Path & Resources
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* AI Path Adaptation Notice */}
      {path?.pathAdaptationBanner?.visible && (
        <div className="p-4 rounded-2xl bg-indigo-50/80 dark:bg-gradient-to-r dark:from-indigo-950/80 dark:to-purple-950/60 border border-indigo-200 dark:border-indigo-500/40 flex items-start justify-between gap-4 animate-in fade-in">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-600/30 text-indigo-600 dark:text-cyan-400 mt-0.5 border border-indigo-200 dark:border-indigo-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">{path.pathAdaptationBanner.title}</h4>
                <Badge variant="cyan" size="sm">AI Re-Weighted</Badge>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                {path.pathAdaptationBanner.message}
              </p>
            </div>
          </div>
          <button
            onClick={dismissAdaptationBanner}
            className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white px-2.5 py-1 rounded-lg bg-slate-200 dark:bg-slate-800/80 hover:bg-slate-300 dark:hover:bg-slate-700 transition"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Next Action, Active Path & Integrated Resources */}
        <div className="lg:col-span-2 space-y-6">
          {/* Next Recommended Action Card */}
          <GlassCard className="border-indigo-500/30 p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Recommended Next Action
                </span>
              </div>
              <Badge variant="primary" size="sm">Priority 1</Badge>
            </div>

            <div className="py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-semibold text-indigo-600 dark:text-cyan-400">{activePhase.title}</span>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mt-0.5">
                  {activeNode?.title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-xl">
                  {activeNode?.description}
                </p>
                <div className="flex items-center gap-4 mt-3 text-xs text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" /> ~{activeNode?.estimatedMinutes || 45} mins
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" /> High-Dimensional Vectors
                  </span>
                </div>
              </div>

              <Link to="/dashboard/learning-path">
                <Button variant="accent" size="md" icon={Play} className="whitespace-nowrap shadow-cyan-500/20">
                  Continue Node
                </Button>
              </Link>
            </div>
          </GlassCard>

          {/* Current Learning Path Phase Overview */}
          <GlassCard className="p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Active Roadmap Breakdown</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Phase 1 of 3: Foundations & Vector Architecture</p>
              </div>
              <Link to="/dashboard/learning-path" className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-semibold flex items-center gap-1">
                Interactive Roadmap <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="py-4 space-y-3">
              {activePhase.nodes?.map((node, i) => (
                <div
                  key={node.id}
                  className={`p-3.5 rounded-xl border flex items-center justify-between transition ${
                    node.status === 'completed'
                      ? 'bg-emerald-50/60 dark:bg-slate-900/40 border-emerald-300 dark:border-emerald-500/30'
                      : node.status === 'in_progress'
                      ? 'bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-500/40 ring-1 ring-indigo-500/30'
                      : 'bg-slate-50 dark:bg-slate-950/30 border-slate-200 dark:border-slate-800/80 text-slate-500'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-mono text-xs font-bold ${
                      node.status === 'completed'
                        ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-300'
                        : node.status === 'in_progress'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-500'
                    }`}>
                      {node.status === 'completed' ? <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400" /> : `0${i+1}`}
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white">{node.title}</h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 capitalize">{node.type} • {node.status.replace('_', ' ')}</p>
                    </div>
                  </div>

                  <Badge
                    variant={node.status === 'completed' ? 'emerald' : node.status === 'in_progress' ? 'cyan' : 'default'}
                    size="sm"
                  >
                    {node.status === 'completed' ? 'Done' : node.status === 'in_progress' ? 'Active' : 'Queued'}
                  </Badge>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Curated Recommendations */}
          <GlassCard className="p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-500 dark:text-cyan-400" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Curated Path Resources</h3>
              </div>
              <Link to="/dashboard/learning-path" className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-semibold flex items-center gap-1">
                View in Path <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {resources.slice(0, 2).map((res) => (
                <div key={res.id} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 hover:border-indigo-500/40 transition flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-semibold text-indigo-600 dark:text-cyan-400">{res.type}</span>
                      <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-300 dark:border-emerald-500/30">
                        {res.matchScore}% Match
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-2">{res.title}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-2">{res.whyRecommended}</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between">
                    <span className="text-xs text-slate-500">{res.duration}</span>
                    <Link to="/dashboard/learning-path">
                      <Button variant="outline" size="sm">Open Resource</Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>

        {/* Right Col: Overall Progress, Skill Matrix & Checkpoints */}
        <div className="space-y-6">
          <GlassCard className="p-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4">
              Roadmap Mastery
            </h3>
            <div className="flex items-end justify-between mb-2">
              <span className="text-3xl font-extrabold text-slate-900 dark:text-white font-display">{path?.overallProgress || 45}%</span>
              <span className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold">{path?.estimatedHoursLeft || 42} hrs remaining</span>
            </div>
            <div className="w-full h-3 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden mb-4">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 via-cyan-400 to-emerald-400 transition-all duration-500"
                style={{ width: `${path?.overallProgress || 45}%` }}
              />
            </div>
            <div className="grid grid-cols-2 gap-2 text-center text-xs">
              <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400 block text-[10px]">Phases</span>
                <strong className="text-slate-900 dark:text-white text-sm">1 / 3 Active</strong>
              </div>
              <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400 block text-[10px]">Weekly Goal</span>
                <strong className="text-emerald-600 dark:text-emerald-400 text-sm">8 / 14 hrs</strong>
              </div>
            </div>
          </GlassCard>

          {/* Skill Mastery Snapshot */}
          <GlassCard className="p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Skill Mastery</h3>
              <Link to="/dashboard/progress" className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-semibold">
                Details
              </Link>
            </div>
            <div className="space-y-3">
              {skills.slice(0, 4).map((sk) => (
                <div key={sk.id}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-700 dark:text-slate-300 font-medium">{sk.name}</span>
                    <span className="text-indigo-600 dark:text-cyan-400 font-semibold">{sk.mastery}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400"
                      style={{ width: `${sk.mastery}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Upcoming Milestone */}
          <GlassCard className="p-6">
            <div className="flex items-center gap-2 mb-3">
              <Award className="w-4 h-4 text-amber-500 dark:text-amber-400" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Target Checkpoint</h3>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between mb-1">
                <Badge variant="amber" size="sm">{milestones[1]?.phase || "Phase 1"}</Badge>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">{milestones[1]?.targetDate || "Aug 26"}</span>
              </div>
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white mt-1">{milestones[1]?.title}</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Requires completing vector search lab and indexing module.</p>
            </div>
          </GlassCard>

          {/* AI Coach Callout */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/70 dark:to-slate-900 border border-indigo-200 dark:border-indigo-500/30">
            <div className="flex items-center gap-2.5 mb-2">
              <Bot className="w-5 h-5 text-indigo-600 dark:text-cyan-400" />
              <span className="text-sm font-bold text-slate-900 dark:text-white">Need Guidance on a Node?</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-3">
              Ask HADES AI to explain concepts, suggest the best resources, or break down prerequisites.
            </p>
            <Button 
              variant="primary" 
              size="sm" 
              className="w-full"
              onClick={() => openAssistant("Can you review my active roadmap progress and suggest the next high-impact concept to study?")}
            >
              Ask AI Coach Now
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
