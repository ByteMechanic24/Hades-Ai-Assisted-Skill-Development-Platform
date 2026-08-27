import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { GlassCard, Badge, Button, Eyebrow } from '../ui';
import { CheckCircle2, Lock, ArrowRight, RefreshCw, Play } from 'lucide-react';
import { Link } from 'react-router-dom';

export function PathVisualizerDemo() {
  const [activeTab, setActiveTab] = useState('agent');

  const demoRoadmaps = {
    agent: {
      role: 'Autonomous AI Agent Engineer',
      nodes: [
        { title: 'Vector Embeddings & HNSW', status: 'completed', type: 'Math / Storage', tag: 'Done' },
        { title: 'Deterministic Tool Calling', status: 'completed', type: 'Core Schema', tag: 'Done' },
        { title: 'ReAct Loops & Execution Memory', status: 'active', type: 'Reasoning Loop', tag: 'Active' },
        { title: 'Hierarchical Multi-Agent Teams', status: 'locked', type: 'Swarm Design', tag: 'Prereq required' },
        { title: 'LLMOps & Hallucination Evals', status: 'locked', type: 'Production', tag: 'Milestone' },
      ],
    },
    rag: {
      role: 'Enterprise RAG & Search Architect',
      nodes: [
        { title: 'Lexical BM25 & Sparse Indexing', status: 'completed', type: 'Retrieval', tag: 'Done' },
        { title: 'Dense Embedding Fine-Tuning', status: 'completed', type: 'Representation', tag: 'Done' },
        { title: 'Hybrid Reciprocal Rank Fusion', status: 'active', type: 'Re-ranking', tag: 'Active' },
        { title: 'Context Compaction & Chunking', status: 'locked', type: 'Data Pipeline', tag: 'Locked' },
        { title: 'Latency SLA & pgvector Tuning', status: 'locked', type: 'DB Optimization', tag: 'Milestone' },
      ],
    },
  };

  const currentRoadmap = demoRoadmaps[activeTab];

  const tabs = [
    { id: 'agent', label: 'AI Agent Engineer' },
    { id: 'rag', label: 'Enterprise RAG' },
  ];

  return (
    <section id="adaptive-engine" className="py-20 sm:py-24 px-5 lg:px-8 relative">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-10 gap-6">
          <div className="max-w-xl">
            <Eyebrow className="mb-3">Interactive preview</Eyebrow>
            <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-stone-900 dark:text-white">
              The prerequisite graph, live.
            </h2>
            <p className="text-stone-600 dark:text-stone-400 mt-3 text-sm sm:text-base leading-relaxed">
              Dependencies are explicit. You never reach an advanced node until its foundations are earned — no tutorial
              hell, no guessing what comes next.
            </p>
          </div>

          {/* Track switcher */}
          <div className="flex items-center gap-1 p-1 rounded-lg bg-stone-100 dark:bg-white/[0.04] border border-stone-200 dark:border-white/10 self-start">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`px-3.5 py-2 rounded-md text-xs sm:text-sm font-medium transition ${
                  activeTab === t.id
                    ? 'bg-white dark:bg-white/10 text-stone-900 dark:text-white shadow-sm'
                    : 'text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Visualizer */}
        <GlassCard hoverEffect={false} className="p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-stone-200 dark:border-white/[0.08] gap-4">
            <div>
              <span className="mono-label text-amber-600 dark:text-amber-400">Target role</span>
              <motion.h3
                key={currentRoadmap.role}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="font-display text-xl sm:text-2xl font-bold text-stone-900 dark:text-white mt-1"
              >
                {currentRoadmap.role}
              </motion.h3>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="primary" size="sm">Auto-generated</Badge>
              <Badge variant="default" size="sm">Deterministic order</Badge>
            </div>
          </div>

          {/* Node row */}
          <div className="py-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 relative">
            {currentRoadmap.nodes.map((node, i) => {
              const done = node.status === 'completed';
              const active = node.status === 'active';
              return (
                <motion.div
                  key={`${activeTab}-${i}`}
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className={`relative p-4 rounded-xl border h-full flex flex-col justify-between transition-colors ${
                    active
                      ? 'bg-amber-500/[0.06] border-amber-500/40 dark:border-amber-500/40'
                      : done
                      ? 'bg-white dark:bg-white/[0.02] border-stone-200 dark:border-white/[0.08]'
                      : 'bg-stone-50 dark:bg-white/[0.01] border-stone-200 dark:border-white/[0.06] opacity-70'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="mono-label text-[9px] text-stone-400 dark:text-stone-500">Node 0{i + 1}</span>
                      {done ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      ) : active ? (
                        <span className="relative flex h-2.5 w-2.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-60" />
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500" />
                        </span>
                      ) : (
                        <Lock className="w-3.5 h-3.5 text-stone-400 dark:text-stone-600" />
                      )}
                    </div>
                    <h4 className={`text-sm font-semibold mb-1 ${active ? 'text-stone-900 dark:text-white' : 'text-stone-800 dark:text-stone-200'}`}>
                      {node.title}
                    </h4>
                    <p className="mono-label text-[9px] text-stone-400 dark:text-stone-500">{node.type}</p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-stone-200 dark:border-white/[0.06]">
                    <span
                      className={`mono-label text-[9px] ${
                        active
                          ? 'text-amber-600 dark:text-amber-400'
                          : done
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-stone-400 dark:text-stone-500'
                      }`}
                    >
                      {node.tag}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Adaptation callout */}
          <div className="mt-2 p-4 rounded-xl bg-stone-50 dark:bg-white/[0.02] border border-stone-200 dark:border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
                <RefreshCw className="w-4.5 h-4.5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-stone-900 dark:text-white">The graph re-weights as you go</p>
                <p className="text-xs text-stone-600 dark:text-stone-400 mt-0.5">
                  Struggle with a concept and reinforcement nodes appear. Master it early and the path accelerates.
                </p>
              </div>
            </div>
            <Link to="/onboarding" className="shrink-0">
              <Button variant="primary" size="sm" icon={ArrowRight}>
                Chart my roadmap
              </Button>
            </Link>
          </div>
        </GlassCard>
      </div>
    </section>
  );
}
