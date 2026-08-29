import React from 'react';
import { Eyebrow } from '../ui';
import { Target, Sparkles, Code2, Award, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../ui';

export function HowItWorks() {
  const steps = [
    {
      n: '01',
      title: 'Target Specialization',
      colorText: 'text-indigo-600 dark:text-indigo-400',
      colorBg: 'bg-indigo-500/10 border-indigo-500/30 text-indigo-700 dark:text-indigo-300',
      desc: 'Declare your desired technical role and current experience level. No manual curriculum guessing.',
    },
    {
      n: '02',
      title: 'Prerequisite Graph Synthesis',
      colorText: 'text-violet-600 dark:text-violet-400',
      colorBg: 'bg-violet-500/10 border-violet-500/30 text-violet-700 dark:text-violet-300',
      desc: 'Our engine generates a deterministic dependency tree, ordering concepts from foundational math to advanced orchestration.',
    },
    {
      n: '03',
      title: 'Curated Multi-Modal Sprints',
      colorText: 'text-cyan-600 dark:text-cyan-400',
      colorBg: 'bg-cyan-500/10 border-cyan-500/30 text-cyan-700 dark:text-cyan-300',
      desc: 'Execute ranked video deep-dives, whitepaper reading, and practical coding labs with zero fluff.',
    },
    {
      n: '04',
      title: 'Verified Competency & Adaptation',
      colorText: 'text-emerald-600 dark:text-emerald-400',
      colorBg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300',
      desc: 'Complete checkpoints to earn milestone badges while the engine continuously adapts your path based on telemetry.',
    },
  ];

  return (
    <section id="how-it-works" className="relative py-16 md:py-24 bg-transparent dark:bg-transparent border-t border-slate-200 dark:border-white/[0.08]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <Eyebrow   variant="violet" className="mb-2 justify-center">
            The HADES Method
          </Eyebrow>
          <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            From Career Target to Production Mastery
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            A continuous loop of goal definition, graph synthesis, practical building, and live telemetry recalculation.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((s) => (
            <div
              key={s.n}
              className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#121620] p-6 shadow-card flex flex-col justify-between"
            >
              <div>
                <span className={`mono-label text-xs font-bold px-2.5 py-1 rounded-md border inline-block mb-4 ${s.colorBg}`}>
                  Step {s.n}
                </span>
                <h3 className="font-display text-base font-bold text-slate-900 dark:text-white mb-2">
                  {s.title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {s.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA Banner */}
        <div className="mt-14 p-8 sm:p-10 rounded-2xl bg-gradient-to-r from-indigo-900/80 via-slate-900 to-violet-950/80 border border-indigo-500/30 text-white shadow-elev text-center relative overflow-hidden">
          <div className="relative z-10 max-w-xl mx-auto">
            <h3 className="font-display text-2xl sm:text-3xl font-bold tracking-tight mb-3">
              Ready to chart your technical roadmap?
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 mb-6 leading-relaxed">
              Launch guided onboarding and let HADES compute your personalized career curriculum.
            </p>
            <Link to="/sign-up">
              <Button variant="primary" size="lg" icon={ArrowRight} className="shadow-glow-indigo">
                Get Started for Free
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
