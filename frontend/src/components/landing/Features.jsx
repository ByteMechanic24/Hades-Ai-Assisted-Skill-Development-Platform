import React from 'react';
import { Eyebrow } from '../ui';
import {
  Brain,
  GitBranch,
  Search,
  Code2,
  TrendingUp,
  ShieldCheck,
  Cpu,
  Layers,
  Sparkles,
  Award
} from 'lucide-react';

export function Features() {
  const pillars = [
    {
      icon: Brain,
      color: 'indigo',
      badge: 'Reasoning Engine',
      badgeClass: 'text-indigo-700 dark:text-indigo-300 bg-indigo-500/10 border-indigo-500/30',
      iconBox: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/30',
      title: 'Multi-Agent AI Reasoner',
      desc: 'Orchestrates role taxonomies, baseline evaluations, and downstream dependency computations without model hallucinations.',
    },
    {
      icon: GitBranch,
      color: 'violet',
      badge: 'Topology Engine',
      badgeClass: 'text-violet-700 dark:text-violet-300 bg-violet-500/10 border-violet-500/30',
      iconBox: 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/30',
      title: 'Deterministic Knowledge Graphs',
      desc: 'Enforces rigorous prerequisite ordering. Every node is mathematically grounded in verified engineering competency trees.',
    },
    {
      icon: Search,
      color: 'cyan',
      badge: 'Resource Ranker',
      badgeClass: 'text-cyan-700 dark:text-cyan-300 bg-cyan-500/10 border-cyan-500/30',
      iconBox: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/30',
      title: 'Curated Resource Synthesis',
      desc: 'Scours technical whitepapers, ranked video deep-dives, and documentation to deliver the exact top resource per concept.',
    },
     
     
  ];

  return (
    <section id="features" className="relative py-16 md:py-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <Eyebrow icon={Layers} variant="indigo" className="mb-2 justify-center">
            System Architecture
          </Eyebrow>
          <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Engineered for Serious Technical Depth
          </h2>
          <p className="mt-3 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            HADES combines reactive actor concurrency, deterministic graph solvers, and multi-modal ranking models to provide a true learning command center.
          </p>
        </div>

        {/* 6-Pillar Multi-Color Architecture Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pillars.map((p) => (
            <div
              key={p.title}
              className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#121620] p-6 shadow-card hover:shadow-elev hover:border-indigo-500/30 transition-all duration-200 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${p.iconBox}`}>
                    <p.icon className="w-5 h-5" />
                  </div>
                  <span className={`mono-label text-[12px] px-2 py-0.5 rounded-md border font-bold ${p.badgeClass}`}>
                    {p.badge}
                  </span>
                </div>
                <h3 className="font-display text-base font-bold text-slate-900 dark:text-white mb-2">
                  {p.title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {p.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
