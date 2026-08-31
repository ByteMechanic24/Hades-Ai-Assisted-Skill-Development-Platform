import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../ui';
import {
  ArrowRight,
  Sparkles,
  GitBranch,
  Target,
  Search,
  CheckCircle2,
  Cpu,
  Layers,
  Zap,
  Activity,
  Code2,
  Terminal,
  Sliders,
  Compass
} from 'lucide-react';

const SUGGESTED_ROLES = [
  'Autonomous AI Agent Engineer',
  'Enterprise RAG & Search Architect',
  'Full-Stack LLM Developer',
  'Production MLOps Engineer',
];

export function Hero() {
  const navigate = useNavigate();
  const [roleQuery, setRoleQuery] = useState('');
  const [activeTab, setActiveTab] = useState('graph'); // 'graph' | 'telemetry' | 'code'

  const handleStartWithRole = (role) => {
    navigate(`/onboarding?role=${encodeURIComponent(role)}`);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!roleQuery.trim()) return;
    handleStartWithRole(roleQuery.trim());
  };

  return (
    <section className="relative overflow-hidden pt-12 pb-24 md:pt-20 md:pb-32">
      {/* Ambient background lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[720px] h-[440px] bg-gradient-to-tr from-indigo-500/15 via-violet-500/10 to-cyan-500/05 blur-3xl pointer-events-none rounded-full" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Headline: Bold, Large, Editorial Fraunces Typography */}
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="font-fraunces text-4xl sm:text-6xl lg:text-[68px] font-bold tracking-tight text-slate-900 dark:text-white leading-[1.06]">
            Stop collecting courses.<br />
            <span className="bg-gradient-to-r from-[#5B50E5] via-indigo-500 to-violet-600 bg-clip-text text-transparent italic">
              Start shipping proof.
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            HADES turns your target career role into a live prerequisite graph, connects the exact competencies you need, and adapts dynamically as you complete checkpoints.
          </p>
        </div>

        {/* Interactive Target Role Input */}
        <div className="mt-10 max-w-2xl mx-auto">
          <form
            onSubmit={handleSearchSubmit}
            className="flex flex-col sm:flex-row items-stretch gap-2.5 p-2 rounded-2xl bg-white dark:bg-[#121620] border border-slate-200 dark:border-white/10 shadow-card focus-within:border-indigo-500/60 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all"
          >
            <div className="relative flex-1 flex items-center pl-3.5">
              <Search className="w-5 h-5 text-slate-400 dark:text-slate-500 shrink-0" />
              <input
                type="text"
                value={roleQuery}
                onChange={(e) => setRoleQuery(e.target.value)}
                placeholder="Name the role you are chasing (e.g. AI Systems Engineer)..."
                className="w-full bg-transparent border-none text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none pl-3 pr-2 py-2.5"
              />
            </div>
            <Button type="submit" variant="primary" size="lg" icon={ArrowRight} className="shrink-0 bg-[#5B50E5] hover:bg-[#4E44D4] text-white">
              Build Path
            </Button>
          </form>

          {/* Quick suggestions */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
            <span className="mono-label text-slate-400 dark:text-slate-500 text-[11px] font-semibold mr-1">TRENDING:</span>
            {SUGGESTED_ROLES.map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => handleStartWithRole(role)}
                className="mono-label text-[11px] px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-white/[0.04] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10 hover:border-indigo-500/40 hover:text-indigo-600 dark:hover:text-indigo-300 transition-all font-semibold"
              >
                {role}
              </button>
            ))}
          </div>

          {/* Action Link Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-6">
            <Link to="/onboarding" className="w-full sm:w-auto">
              <Button variant="secondary" size="md" icon={Sliders} className="w-full sm:w-auto border-slate-200 dark:border-white/10">
                Custom Path Wizard
              </Button>
            </Link>
            <Link to="/dashboard" className="w-full sm:w-auto">
              <Button variant="secondary" size="md" icon={Compass} className="w-full sm:w-auto border-slate-200 dark:border-white/10">
                Explore Live Workspace
              </Button>
            </Link>
          </div>
        </div>

        {/* ================================================= Interactive Telemetry Window */}
        <div className="mt-14 max-w-4xl mx-auto">
          <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#121620] shadow-elev overflow-hidden">
            {/* Window header */}
            <div className="flex items-center justify-between px-5 sm:px-7 py-3.5 border-b border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-white/[0.02]">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                <span className="mono-label text-xs text-slate-600 dark:text-slate-300 ml-2 font-bold">
                  HADES  MISSION BRIEFING &amp; PATH ENGINE
                </span>
              </div>

            </div>

            {/* Window Content */}
            <div className="p-6 sm:p-8">
              {activeTab === 'graph' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl border border-indigo-500/30 bg-indigo-500/[0.04]">
                    <div className="flex items-center justify-between mb-2">
                      <span className="mono-label text-[10px] text-indigo-600 dark:text-indigo-400 font-bold">Stage 01 · Baseline</span>
                      {/* <CheckCircle2 className="w-4 h-4 text-emerald-500" /> */}
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">Vector Math &amp; Embeddings</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                      Cosine distance, dot products, and latent matrix transformations.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl border border-violet-500/40 bg-violet-500/[0.06] shadow-sm relative">
                    {/* <span className="absolute -top-2 right-3 mono-label text-[8px] font-bold px-2 py-0.5 rounded bg-[#5B50E5] text-white">
                      IN PROGRESS
                    </span> */}
                    <div className="flex items-center justify-between mb-2">
                      <span className="mono-label text-[10px] text-violet-600 dark:text-violet-400 font-bold">Stage 02 · Retrieval</span>
                      {/* <Sparkles className="w-4 h-4 text-violet-500 animate-pulse" /> */}
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">pgvector &amp; HNSW Indexing</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                      Sub-10ms approximate nearest neighbor query execution in PostgreSQL.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.01]">
                    <div className="flex items-center justify-between mb-2">
                      <span className="mono-label text-[10px] text-slate-400 dark:text-slate-500 font-medium">Stage 03 · Queued</span>
                      {/* <span className="w-2 h-2 rounded-full bg-slate-300 dark:bg-white/20" /> */}
                    </div>
                    <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">ReAct Agent Orchestration</h4>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 leading-relaxed">
                      Tool calling, cyclic observation steps, and state rollbacks.
                    </p>
                  </div>
                </div>
              )}

              {activeTab === 'telemetry' && (
                <div className="font-mono text-xs space-y-2.5 p-4 rounded-xl bg-slate-950 text-slate-200 border border-slate-800">
                  <div className="text-emerald-400 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    [2026-08-28 01:42:00] DISPATCH: LearnerCompletedCheckpoint (node: pgvector-hnsw-01)
                  </div>
                  <div className="text-cyan-300 pl-4">
                    → Evaluating downstream dependencies: 4 branch nodes recalculated in 18ms
                  </div>
                  <div className="text-violet-400 pl-4">
                    → AI Reasoner assigned confidence score: 88.5% (+12.4% gain)
                  </div>
                  <div className="text-slate-400 pl-4">
                    → Next optimal resource scheduled: &quot;Deep Dive: Hierarchical Navigable Small Worlds&quot;
                  </div>
                </div>
              )}

              {activeTab === 'code' && (
                <div className="font-mono text-xs space-y-1.5 p-4 rounded-xl bg-slate-950 text-slate-300 border border-slate-800 overflow-x-auto">
                  <span className="text-violet-400 font-bold">package</span> hades.learning.actors<br />
                  <span className="text-indigo-400 font-bold">case class</span> <span className="text-emerald-300">AdaptiveRoadmapState</span>(<br />
                  &nbsp;&nbsp;learnerId: <span className="text-cyan-300">UUID</span>,<br />
                  &nbsp;&nbsp;targetRole: <span className="text-cyan-300">String</span> = <span className="text-violet-300">&quot;Autonomous AI Systems Engineer&quot;</span>,<br />
                  &nbsp;&nbsp;masteryVector: <span className="text-cyan-300">Map[SkillId, Double]</span>,<br />
                  &nbsp;&nbsp;graphConfidence: <span className="text-violet-300">0.885</span><br />
                  )
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
