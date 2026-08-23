import React from 'react';
import { Badge, GlassCard } from '../ui';
import { Target, Network, Layers, Activity } from 'lucide-react';

export function HowItWorks() {
  const steps = [
    {
      step: "01",
      icon: Target,
      title: "Define Target Role or Goal",
      desc: "Specify your dream engineering or product role (e.g., 'Autonomous AI Engineer' or 'Production ML Architect')."
    },
    {
      step: "02",
      icon: Network,
      title: "Interactive Prerequisite Graph",
      desc: "Our AI engine creates structured phases, milestone checkpoints, and explicit dependency nodes."
    },
    {
      step: "03",
      icon: Layers,
      title: "Curated Multi-Modal Content",
      desc: "Interactive sandboxes, YouTube deep dives, and articles directly matched to each prerequisite node."
    },
    {
      step: "04",
      icon: Activity,
      title: "Real-Time Adaptive Feedback",
      desc: "Complete modules and milestones. HADES continuously refines your sequence to ensure zero blind spots."
    }
  ];

  return (
    <section id="how-it-works" className="py-24 px-6 lg:px-12 bg-slate-100/60 dark:bg-slate-950/40 border-y border-slate-200 dark:border-slate-800/80">
      <div className="max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <Badge variant="cyan" size="md" className="mb-3">
            Workflow Journey
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white font-display">
            From Goal to Production Mastery
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mt-3 text-sm">
            Four coordinated steps ensuring every hour of your study time directly targets your skill gaps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((st, i) => (
            <div key={i} className="relative group">
              <GlassCard className="h-full flex flex-col justify-between border-slate-200 dark:border-slate-800/80 group-hover:border-cyan-500/40 shadow-sm dark:shadow-none">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-3xl font-black font-display text-slate-300 dark:text-slate-700 group-hover:text-cyan-500 dark:group-hover:text-cyan-400/60 transition">
                      {st.step}
                    </span>
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-slate-800/80 border border-indigo-200 dark:border-slate-700 flex items-center justify-center text-indigo-600 dark:text-cyan-400 group-hover:bg-cyan-500 group-hover:text-white transition duration-300">
                      <st.icon className="w-5 h-5" />
                    </div>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2 font-display">{st.title}</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{st.desc}</p>
                </div>
              </GlassCard>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
