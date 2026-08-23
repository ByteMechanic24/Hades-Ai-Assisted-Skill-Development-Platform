import React, { useState } from 'react';
import { GlassCard, Badge, Button } from '../ui';
import { GitBranch, CheckCircle2, Lock, ArrowRight, Sparkles, RefreshCw, Cpu, Layers } from 'lucide-react';
import { Link } from 'react-router-dom';

export function PathVisualizerDemo() {
  const [activeTab, setActiveTab] = useState('agent');

  const demoRoadmaps = {
    agent: {
      role: "Autonomous AI Agent Engineer",
      nodes: [
        { title: "Vector Embeddings & HNSW", status: "completed", type: "Math / Storage", tag: "Completed" },
        { title: "Deterministic Tool Calling (Pydantic / Zod)", status: "completed", type: "Core Schema", tag: "Completed" },
        { title: "ReAct Loops & Execution Memory", status: "active", type: "Reasoning Loop", tag: "Active Step" },
        { title: "Hierarchical Multi-Agent Teams (Agno / Crew)", status: "locked", type: "Swarm Design", tag: "Prerequisite Required" },
        { title: "LLMOps & Ragas Hallucination Evals", status: "locked", type: "Production Ready", tag: "Milestone" }
      ]
    },
    rag: {
      role: "Enterprise RAG & Search Architect",
      nodes: [
        { title: "Lexical BM25 & Sparse Indexing", status: "completed", type: "Information Retrieval", tag: "Completed" },
        { title: "Dense Embedding Fine-Tuning", status: "completed", type: "Representation", tag: "Completed" },
        { title: "Hybrid Reciprocal Rank Fusion (RRF)", status: "active", type: "Re-Ranking", tag: "Active Step" },
        { title: "Context Window Compaction & Chunking", status: "locked", type: "Data Pipeline", tag: "Locked" },
        { title: "Production Latency SLA & pgvector Tuning", status: "locked", type: "Database Optimization", tag: "Milestone" }
      ]
    }
  };

  const currentRoadmap = demoRoadmaps[activeTab];

  return (
    <section id="adaptive-engine" className="py-24 px-6 lg:px-12 relative overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-12 gap-6">
          <div>
            <Badge variant="primary" size="md" className="mb-3">
              Interactive Preview
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white font-display">
              See the Adaptive Graph in Action
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mt-2 text-sm sm:text-base max-w-xl">
              Prerequisite relationships ensure you build deep mental models rather than getting stuck in tutorial hell.
            </p>
          </div>

          <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 self-start lg:self-auto shadow-sm">
            <button
              onClick={() => setActiveTab('agent')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition ${
                activeTab === 'agent'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              AI Agent Engineer Track
            </button>
            <button
              onClick={() => setActiveTab('rag')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition ${
                activeTab === 'rag'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Enterprise RAG Track
            </button>
          </div>
        </div>

        {/* Dynamic Visualizer Card */}
        <GlassCard className="p-6 sm:p-8 border-indigo-200 dark:border-indigo-500/30">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-slate-200 dark:border-slate-800 gap-4">
            <div>
              <span className="text-xs uppercase font-bold tracking-wider text-indigo-600 dark:text-indigo-400">Target Role</span>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white font-display mt-0.5">{currentRoadmap.role}</h3>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="cyan" size="sm">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-cyan-400" /> Auto-Generated Graph
              </Badge>
              <Badge variant="emerald" size="sm">
                Deterministic Hierarchy
              </Badge>
            </div>
          </div>

          {/* Connected Node Visualizer */}
          <div className="py-8 grid grid-cols-1 md:grid-cols-5 gap-4 relative">
            {currentRoadmap.nodes.map((node, i) => (
              <div key={i} className="relative flex flex-col">
                <div
                  className={`p-4 rounded-2xl border transition-all duration-300 h-full flex flex-col justify-between ${
                    node.status === 'completed'
                      ? 'bg-emerald-50/60 dark:bg-slate-900/60 border-emerald-300 dark:border-emerald-500/40 text-slate-700 dark:text-slate-300'
                      : node.status === 'active'
                      ? 'bg-indigo-50 dark:bg-gradient-to-b dark:from-indigo-950/80 dark:to-slate-900 border-indigo-600 dark:border-indigo-500 ring-2 ring-indigo-500/20 text-indigo-950 dark:text-white shadow-md'
                      : 'bg-slate-50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800/80 text-slate-400 dark:text-slate-500 opacity-70'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 text-slate-600 dark:text-slate-300">
                        Node 0{i + 1}
                      </span>
                      {node.status === 'completed' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      ) : node.status === 'active' ? (
                        <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 dark:bg-indigo-400 animate-ping" />
                      ) : (
                        <Lock className="w-3.5 h-3.5 text-slate-400 dark:text-slate-600" />
                      )}
                    </div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white mb-1.5">{node.title}</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">{node.type}</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800/60">
                    <span
                      className={`text-[10px] font-semibold ${
                        node.status === 'completed'
                          ? 'text-emerald-700 dark:text-emerald-400'
                          : node.status === 'active'
                          ? 'text-indigo-700 dark:text-indigo-300 font-bold'
                          : 'text-slate-400 dark:text-slate-500'
                      }`}
                    >
                      {node.tag}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Interactive Adaptation Simulation */}
          <div className="mt-6 p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-600/30 border border-indigo-200 dark:border-indigo-500/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400 flex-shrink-0">
                <RefreshCw className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">Dynamic AI Graph Adaptation</p>
                <p className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-400">
                  Ready to test your knowledge or customize your own path?
                </p>
              </div>
            </div>
            <Link to="/onboarding">
              <Button variant="primary" size="sm" icon={ArrowRight}>
                Create Personalized Roadmap
              </Button>
            </Link>
          </div>
        </GlassCard>
      </div>
    </section>
  );
}
