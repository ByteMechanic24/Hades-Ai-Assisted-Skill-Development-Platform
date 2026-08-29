import React, { useState } from 'react';
import { Button, Eyebrow, Badge } from '../ui';
import {
  GitBranch,
  CheckCircle2,
  Play,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Cpu,
  Layers,
  Database,
  Terminal,
  Bot
} from 'lucide-react';
import { Link } from 'react-router-dom';

const DEMO_PATHS = {
  'ai-systems': {
    title: 'Autonomous AI Systems Engineer',
    category: 'Agent Orchestration & Production LLMOps',
    color: 'violet',
    stages: [
      { id: 1, title: 'Vector Math & High-Dimensional Spaces', status: 'completed', duration: '6 hrs', type: 'Core Theory', color: 'emerald' },
      { id: 2, title: 'pgvector & Approximate Nearest Neighbors', status: 'completed', duration: '8 hrs', type: 'Database Engine', color: 'emerald' },
      { id: 3, title: 'ReAct Agent Loops & Tool Execution', status: 'in_progress', duration: '12 hrs', type: 'Active Node', color: 'violet' },
      { id: 4, title: 'Deterministic Guardrails & LLM Eval Suites', status: 'queued', duration: '10 hrs', type: 'Production CI/CD', color: 'slate' },
      { id: 5, title: 'Distributed Multi-Agent Consensus Protocol', status: 'queued', duration: '14 hrs', type: 'Capstone', color: 'slate' },
    ],
  },
  'rag-architect': {
    title: 'Enterprise RAG & Search Architect',
    category: 'Dense Retrieval & Hybrid Semantic Indexing',
    color: 'cyan',
    stages: [
      { id: 1, title: 'Text Chunking Strategies & Tokenizers', status: 'completed', duration: '4 hrs', type: 'Pre-processing', color: 'emerald' },
      { id: 2, title: 'Hybrid BM25 + Dense Embedding Fusion', status: 'in_progress', duration: '10 hrs', type: 'Active Node', color: 'cyan' },
      { id: 3, title: 'Cross-Encoder Re-Ranking Pipelines', status: 'queued', duration: '8 hrs', type: 'Retrieval Quality', color: 'slate' },
      { id: 4, title: 'Context Window Compression & Query Routing', status: 'queued', duration: '6 hrs', type: 'Optimization', color: 'slate' },
    ],
  },
  'llm-fullstack': {
    title: 'Full-Stack LLM Developer',
    category: 'FastAPI Streaming, WebSockets & Real-Time UI',
    color: 'indigo',
    stages: [
      { id: 1, title: 'Async Python, FastAPI & Pydantic V2', status: 'completed', duration: '6 hrs', type: 'Backend Core', color: 'emerald' },
      { id: 2, title: 'Server-Sent Events (SSE) & Token Streaming', status: 'in_progress', duration: '8 hrs', type: 'Active Node', color: 'indigo' },
      { id: 3, title: 'Stateful Chat Sessions & Redis Vector Caching', status: 'queued', duration: '10 hrs', type: 'State Management', color: 'slate' },
      { id: 4, title: 'Production Dockerization & Cloud Deployment', status: 'queued', duration: '8 hrs', type: 'DevOps', color: 'slate' },
    ],
  },
};

export function PathVisualizerDemo() {
  const [activeKey, setActiveKey] = useState('ai-systems');
  const activePath = DEMO_PATHS[activeKey];

  return (
    <section id="demo" className="relative py-16 md:py-24 bg-transparent dark:bg-transparent border-y border-slate-200 dark:border-white/[0.08]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <Eyebrow icon={GitBranch} variant="violet" className="mb-2 justify-center">
            Interactive Prerequisite Engine
          </Eyebrow>
          <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Explore How HADES Structures Graphs
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            Switch career specializations to inspect the synthesized dependency spine in real time.
          </p>

          {/* Role selector tabs */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 p-1 rounded-2xl bg-slate-200/70 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 mt-6 max-w-xl mx-auto">
            {Object.entries(DEMO_PATHS).map(([key, data]) => (
              <button
                key={key}
                type="button"
                onClick={() => setActiveKey(key)}
                className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeKey === key
                    ? 'bg-white dark:bg-white/10 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {data.title.split(' ')[0]} {data.title.split(' ')[1]}
              </button>
            ))}
          </div>
        </div>

        {/* Graph Preview Spine */}
        <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#121620] p-6 sm:p-10 shadow-card">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-white/[0.08] mb-8">
            <div>
              <span className="mono-label text-[10px] text-violet-600 dark:text-violet-400 font-bold block mb-1">
                Synthesized Career Track
              </span>
              <h3 className="font-display text-xl font-bold text-slate-900 dark:text-white">{activePath.title}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{activePath.category}</p>
            </div>
            <Link to={`/onboarding?role=${encodeURIComponent(activePath.title)}`}>
              <Button variant="violet" size="sm" icon={ArrowRight}>
                Start This Track
              </Button>
            </Link>
          </div>

          {/* Interactive Steps Spine */}
          <div className="space-y-4 relative">

            {activePath.stages.map((stage, idx) => {
              const isDone = stage.status === 'completed';
              const isActive = stage.status === 'in_progress';

              return (
                <div
                  key={stage.id}
                  className={`relative z-10 flex items-start gap-4 p-4 rounded-xl border transition-all ${
                    isActive
                      ? 'bg-violet-500/[0.06] border-violet-500/40 shadow-sm ring-1 ring-violet-500/20'
                      : isDone
                      ? 'bg-emerald-500/[0.03] border-emerald-500/25'
                      : 'bg-slate-50/50 dark:bg-white/[0.01] border-slate-200 dark:border-white/[0.06] opacity-75'
                  }`}
                >
                  <span
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 font-display text-xs font-bold shadow-subtle ${
                      isDone
                        ? 'bg-emerald-500 text-white'
                        : isActive
                        ? 'bg-violet-600 text-white'
                        : 'bg-slate-200 dark:bg-white/10 text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {isDone ? <CheckCircle2 className="w-4 h-4" /> : isActive ? <Play className="w-3.5 h-3.5" /> : `0${idx + 1}`}
                  </span>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">{stage.title}</h4>
                      <div className="flex items-center gap-2">
                        <span className="mono-label text-[10px] text-slate-400 dark:text-slate-500">{stage.duration}</span>
                        <Badge
                          variant={isDone ? 'emerald' : isActive ? 'violet' : 'default'}
                          size="sm"
                        >
                          {isDone ? 'Completed' : isActive ? 'Active Stage' : 'Prerequisite Locked'}
                        </Badge>
                      </div>
                    </div>
                    <span className="mono-label text-[9px] text-slate-500 dark:text-slate-400 mt-1 block font-medium">
                      Category: {stage.type}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
