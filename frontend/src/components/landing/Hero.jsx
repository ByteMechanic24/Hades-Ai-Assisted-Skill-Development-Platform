import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '../ui';
import { ArrowRight, GitBranch, Play, Search, Wand2, CornerDownLeft } from 'lucide-react';
import { useLearner } from '../../context/LearnerContext';
import { IMAGERY } from '../../utils/media';
import { fadeUp, staggerContainer } from '../../utils/motion';

export function Hero() {
  const navigate = useNavigate();
  const { generateRoadmapForRole } = useLearner();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const suggestedRoles = [
    'Autonomous AI Agent Engineer',
    'Enterprise RAG & Search Architect',
    'Full-Stack LLM Developer',
    'MLOps & Cloud-Native Systems',
  ];

  const handleSearchAndGetRoadmap = (e, roleToUse = null) => {
    if (e) e.preventDefault();
    const query = (roleToUse || searchQuery || 'Autonomous AI Systems Engineer').trim();
    if (!query) return;

    setIsSubmitting(true);
    generateRoadmapForRole(query);

    // Instant smooth redirect to roadmap screen for first-time searchers
    setTimeout(() => {
      setIsSubmitting(false);
      navigate('/dashboard/learning-path');
    }, 450);
  };

  const stats = [
    { value: 'Goal-first', label: 'Not a course catalog' },
    { value: 'Agno AI', label: 'Multi-agent reasoner' },
    { value: 'Prereq graph', label: 'Deterministic ordering' },
    { value: 'Real-time', label: 'Adapts as you build' },
  ];

  return (
    <section className="relative pt-32 pb-16 sm:pt-40 sm:pb-20 px-5 lg:px-8 overflow-hidden">


      <motion.div
        variants={staggerContainer(0.08)}
        initial="hidden"
        animate="show"
        className="relative max-w-3xl mx-auto text-center"
      >
        {/* Eyebrow */}
        <motion.div variants={fadeUp} className="flex justify-center mb-6">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-stone-200 dark:border-white/10 bg-white/60 dark:bg-white/[0.03] backdrop-blur">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            <span className="mono-label text-stone-500 dark:text-stone-400">HCLTech Hackathon 2026 · Adaptive skill architecture</span>
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          variants={fadeUp}
          className="font-display text-4xl sm:text-6xl font-bold tracking-tight text-stone-900 dark:text-white leading-[1.05]"
        >
          Stop collecting courses.
          <br />
          Start shipping <span className="text-amber-500">proof</span>.
        </motion.h1>

        <motion.p
          variants={fadeUp}
          className="mt-6 text-base sm:text-lg text-stone-600 dark:text-stone-400 max-w-2xl mx-auto leading-relaxed"
        >
          HADES turns a career goal into a real project, maps the exact skills that project demands, and charts a
          prerequisite path that adapts as you build — so every hour moves you toward the role, not the certificate.
        </motion.p>

        {/* Search → roadmap */}
        <motion.div variants={fadeUp} className="mt-9 max-w-xl mx-auto">
          <form
            onSubmit={handleSearchAndGetRoadmap}
            className="relative flex items-center gap-2 p-2 rounded-xl bg-white dark:bg-[#141416] border border-stone-300 dark:border-white/10 shadow-elev focus-within:border-amber-500 dark:focus-within:border-amber-500 transition-colors"
          >
            <Search className="w-4.5 h-4.5 text-stone-400 dark:text-stone-500 ml-2.5 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Name the role you're chasing…"
              className="w-full bg-transparent px-1 py-2 text-sm sm:text-base text-stone-900 dark:text-white placeholder-stone-400 dark:placeholder-stone-500 focus:outline-none"
            />
            <Button type="submit" variant="primary" size="md" isLoading={isSubmitting} icon={ArrowRight} className="shrink-0">
              Build path
            </Button>
          </form>

          {/* Suggested roles */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
            <span className="mono-label text-stone-400 dark:text-stone-500">Popular:</span>
            {suggestedRoles.map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => {
                  setSearchQuery(role);
                  handleSearchAndGetRoadmap(null, role);
                }}
                className="group text-xs px-2.5 py-1 rounded-full bg-stone-100 dark:bg-white/[0.03] text-stone-600 dark:text-stone-300 hover:text-amber-700 dark:hover:text-amber-300 border border-stone-200 dark:border-white/10 hover:border-amber-500/40 transition flex items-center gap-1.5"
              >
                <GitBranch className="w-3 h-3 text-stone-400 group-hover:text-amber-500 transition-colors" />
                {role}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Secondary CTAs */}
        <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">
          <Link to="/onboarding" className="w-full sm:w-auto">
            <Button size="md" variant="secondary" icon={Wand2} className="w-full">
              Custom path wizard
            </Button>
          </Link>
          <Link to="/dashboard" className="w-full sm:w-auto">
            <Button size="md" variant="ghost" icon={Play} className="w-full border border-stone-200 dark:border-white/10">
              Explore the workspace
            </Button>
          </Link>
        </motion.div>
      </motion.div>

      {/* Framed real workspace image — a developer building, not AI clip-art */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="show"
        transition={{ delay: 0.2 }}
        className="relative max-w-5xl mx-auto mt-16"
      >
        <div className="relative rounded-2xl overflow-hidden border border-stone-200 dark:border-white/[0.08] bg-stone-100 dark:bg-[#101013] shadow-elev">
          {/* window chrome */}
          <div className="flex items-center gap-1.5 px-4 h-10 border-b border-stone-200 dark:border-white/[0.08] bg-white/80 dark:bg-white/[0.02]">
            <span className="w-2.5 h-2.5 rounded-full bg-stone-300 dark:bg-white/15" />
            <span className="w-2.5 h-2.5 rounded-full bg-stone-300 dark:bg-white/15" />
            <span className="w-2.5 h-2.5 rounded-full bg-stone-300 dark:bg-white/15" />
            <span className="mono-label text-stone-400 dark:text-stone-500 ml-3">hades — mission control</span>
          </div>
          <div className="relative aspect-[16/8] overflow-hidden">
            <img
              src={IMAGERY.heroWorkspace}
              alt="A developer building software at a multi-monitor workstation"
              className="absolute inset-0 w-full h-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950/70 via-transparent to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-4">
              <div>
                <span className="mono-label text-amber-400">Now building</span>
                <p className="text-white font-display font-semibold text-sm sm:text-base mt-1">
                  Retrieval-augmented agent · Phase 2 of 4
                </p>
              </div>
              <span className="hidden sm:inline-flex mono-label text-[10px] text-white/70 border border-white/20 rounded px-2 py-1 backdrop-blur">
                45% complete
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stat rail */}
      <div className="relative max-w-5xl mx-auto mt-10 grid grid-cols-2 md:grid-cols-4 divide-x divide-stone-200 dark:divide-white/[0.08] border-t border-stone-200 dark:border-white/[0.08] pt-6">
        {stats.map((s) => (
          <div key={s.label} className="px-4 text-center md:text-left first:pl-0">
            <div className="font-display text-lg sm:text-xl font-semibold text-stone-900 dark:text-white">{s.value}</div>
            <div className="mono-label text-stone-400 dark:text-stone-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
