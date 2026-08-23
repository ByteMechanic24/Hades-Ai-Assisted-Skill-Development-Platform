import React from 'react';
import { GlassCard, Badge } from '../ui';
import { GitBranch, BrainCircuit, Sparkles, ShieldCheck, Zap, Layers, RefreshCw } from 'lucide-react';

export function Features() {
  const features = [
    {
      icon: GitBranch,
      color: "from-indigo-500 to-cyan-500",
      title: "Prerequisite Graph Modeling",
      description: "Unlike static playlists, HADES models complex multi-directional skill dependencies. You never tackle advanced modules without mastering the foundational concepts."
    },
    {
      icon: RefreshCw,
      color: "from-cyan-500 to-emerald-500",
      title: "Continuous Path Adaptation",
      description: "Completing resources and mastering milestones triggers real-time graph recalculation. Your roadmap dynamically inserts reinforcement labs or accelerates forward."
    },
    {
      icon: Layers,
      color: "from-blue-500 to-indigo-600",
      title: "Multi-Modal Resource Ranking",
      description: "Combines interactive sandboxes, video deep dives, research papers, and capstone blueprints, scored against your custom learning style and schedule."
    },
    {
      icon: BrainCircuit,
      color: "from-purple-500 to-indigo-500",
      title: "Context-Aware AI Learning Coach",
      description: "Your AI coach isn't a generic chatbot. It has instant access to your active node, current phase, and target role, answering 'Why is this next?' with precision."
    },
    {
      icon: Zap,
      color: "from-amber-500 to-rose-500",
      title: "Interactive Branching Engine",
      description: "Explore the roadmap.sh style interactive tree with instant hover status controllers (Learning, Done, Skip) and ranked YouTube videos."
    },
    {
      icon: ShieldCheck,
      color: "from-emerald-500 to-teal-500",
      title: "Deterministic Engine Security",
      description: "Scala backend enforces deterministic business logic and progress validation, while Python/Agno agents generate intelligent reasoning."
    }
  ];

  return (
    <section id="features" className="py-24 px-6 lg:px-12 relative">
      <div className="max-w-6xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge variant="primary" size="md" className="mb-3">
            Core Architecture
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white font-display">
            Built for Serious Skill Mastery, <br />
            Not Passive Video Consumption
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mt-4 text-sm sm:text-base">
            Every layer of the platform is designed to convert ambiguous career goals into measurable milestones and validated competencies.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat, i) => (
            <GlassCard key={i} className="p-6 flex flex-col justify-between group border-slate-200 dark:border-slate-800/80 hover:border-indigo-500/40 shadow-sm dark:shadow-none">
              <div>
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${feat.color} flex items-center justify-center text-white mb-5 shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition duration-300`}>
                  <feat.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 font-display">{feat.title}</h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{feat.description}</p>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>
    </section>
  );
}
