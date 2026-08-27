import React from 'react';
import { motion } from 'framer-motion';
import { Eyebrow } from '../ui';
import { GitBranch, BrainCircuit, ShieldCheck, Zap, Layers, RefreshCw } from 'lucide-react';
import { fadeUp, staggerContainer } from '../../utils/motion';

export function Features() {
  const features = [
    {
      icon: GitBranch,
      title: 'Prerequisite graph modeling',
      description:
        'Not a static playlist. HADES models multi-directional skill dependencies, so you never hit an advanced module without its foundations in place.',
    },
    {
      icon: RefreshCw,
      title: 'Continuous path adaptation',
      description:
        'Completing work and passing milestones triggers a real-time graph recalculation — the roadmap inserts reinforcement or fast-forwards you.',
    },
    {
      icon: Layers,
      title: 'Multi-modal resource ranking',
      description:
        'Sandboxes, video deep-dives, papers, and capstone blueprints — each scored against your learning style, schedule, and current gaps.',
    },
    {
      icon: BrainCircuit,
      title: 'Context-aware coach',
      description:
        'Not a generic chatbot. The coach knows your active node, current phase, and target role — so it answers "why this next?" with precision.',
    },
    {
      icon: Zap,
      title: 'Interactive branching engine',
      description:
        'Explore an interactive tree with inline status controls — Learning, Done, Skip — plus ranked videos and articles per node.',
    },
    {
      icon: ShieldCheck,
      title: 'Deterministic core',
      description:
        'A Scala backend enforces deterministic business logic and progress validation, while Agno agents handle the intelligent reasoning.',
    },
  ];

  return (
    <section id="features" className="py-20 sm:py-24 px-5 lg:px-8 relative">
      <div className="max-w-6xl mx-auto">
        <div className="max-w-2xl mb-14">
          <Eyebrow className="mb-3">Core architecture</Eyebrow>
          <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-stone-900 dark:text-white leading-tight">
            Built for mastery, not passive video consumption.
          </h2>
          <p className="text-stone-600 dark:text-stone-400 mt-4 text-sm sm:text-base leading-relaxed">
            Every layer converts an ambiguous career goal into measurable milestones and validated competencies.
          </p>
        </div>

        <motion.div
          variants={staggerContainer(0.06)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px rounded-2xl overflow-hidden border border-stone-200 dark:border-white/[0.08] bg-stone-200 dark:bg-white/[0.08]"
        >
          {features.map((feat, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              className="group bg-white dark:bg-[#0d0d0f] p-6 sm:p-7 hover:bg-stone-50 dark:hover:bg-white/[0.02] transition-colors"
            >
              <div className="w-10 h-10 rounded-lg bg-stone-100 dark:bg-white/[0.05] border border-stone-200 dark:border-white/10 flex items-center justify-center text-stone-700 dark:text-stone-300 group-hover:border-amber-500/40 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors mb-5">
                <feat.icon className="w-5 h-5" />
              </div>
              <h3 className="font-display text-base font-semibold text-stone-900 dark:text-white mb-2">{feat.title}</h3>
              <p className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed">{feat.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
