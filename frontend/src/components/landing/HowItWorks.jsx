import React from 'react';
import { motion } from 'framer-motion';
import { Eyebrow } from '../ui';
import { Target, Network, Layers, Activity, ArrowRight } from 'lucide-react';
import { fadeUp, staggerContainer } from '../../utils/motion';

export function HowItWorks() {
  const steps = [
    {
      step: '01',
      icon: Target,
      title: 'Name the goal',
      desc: 'State the role or outcome you want — "Autonomous AI Engineer", "Production ML Architect". That goal becomes a real project.',
    },
    {
      step: '02',
      icon: Network,
      title: 'Get the graph',
      desc: 'The engine derives the skills that project demands and orders them into phases, checkpoints, and explicit prerequisite nodes.',
    },
    {
      step: '03',
      icon: Layers,
      title: 'Build with the right resources',
      desc: 'Each node is matched to sandboxes, deep-dives, and articles — chosen for your style and schedule, ranked by fit.',
    },
    {
      step: '04',
      icon: Activity,
      title: 'Progress, and adapt',
      desc: 'Finish work and clear milestones. HADES refines your sequence continuously, so there are zero blind spots left behind.',
    },
  ];

  return (
    <section
      id="how-it-works"
      className="py-20 sm:py-24 px-5 lg:px-8 bg-stone-50 dark:bg-white/[0.015] border-y border-stone-200 dark:border-white/[0.08]"
    >
      <div className="max-w-6xl mx-auto">
        <div className="max-w-2xl mb-14">
          <Eyebrow className="mb-3">The method</Eyebrow>
          <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-stone-900 dark:text-white leading-tight">
            Goal → Project → Skills → Mastery.
          </h2>
          <p className="text-stone-600 dark:text-stone-400 mt-3 text-sm sm:text-base leading-relaxed">
            Four coordinated moves that point every hour of study straight at your gaps.
          </p>
        </div>

        <motion.div
          variants={staggerContainer(0.08)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {steps.map((st, i) => (
            <motion.div key={i} variants={fadeUp} className="relative">
              {/* Connector */}
              {i < steps.length - 1 && (
                <ArrowRight className="hidden lg:block absolute top-6 -right-3.5 w-4 h-4 text-stone-300 dark:text-white/15 z-10" />
              )}
              <div className="h-full rounded-xl border border-stone-200 dark:border-white/[0.08] bg-white dark:bg-[#0d0d0f] p-5 hover:border-amber-500/30 transition-colors">
                <div className="flex items-center justify-between mb-4">
                  <span className="font-display text-3xl font-bold text-stone-200 dark:text-white/10 tabular-nums">
                    {st.step}
                  </span>
                  <div className="w-9 h-9 rounded-lg bg-stone-100 dark:bg-white/[0.05] border border-stone-200 dark:border-white/10 flex items-center justify-center text-amber-600 dark:text-amber-400">
                    <st.icon className="w-4.5 h-4.5" />
                  </div>
                </div>
                <h3 className="font-display text-base font-semibold text-stone-900 dark:text-white mb-2">{st.title}</h3>
                <p className="text-xs sm:text-[13px] text-stone-600 dark:text-stone-400 leading-relaxed">{st.desc}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
