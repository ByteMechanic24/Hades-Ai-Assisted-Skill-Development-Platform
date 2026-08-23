import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Badge } from '../ui';
import { Sparkles, ArrowRight, GitBranch, Cpu, CheckCircle2, Play, Search, Flame, Wand2 } from 'lucide-react';
import { useLearner } from '../../context/LearnerContext';

export function Hero() {
  const navigate = useNavigate();
  const { generateRoadmapForRole } = useLearner();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const suggestedRoles = [
    "Autonomous AI Agent Engineer",
    "Enterprise RAG & Search Architect",
    "Full-Stack LLM Developer",
    "MLOps & Cloud Native Systems"
  ];

  const handleSearchAndGetRoadmap = (e, roleToUse = null) => {
    if (e) e.preventDefault();
    const query = (roleToUse || searchQuery || "Autonomous AI Systems Engineer").trim();
    if (!query) return;

    setIsSubmitting(true);
    generateRoadmapForRole(query);

    // Instant smooth redirect to roadmap screen for first-time searchers
    setTimeout(() => {
      setIsSubmitting(false);
      navigate('/dashboard/learning-path');
    }, 450);
  };

  return (
    <section className="relative pt-36 pb-20 px-6 lg:px-12 overflow-hidden">
      {/* Glow background spheres */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/10 dark:bg-indigo-600/20 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] bg-cyan-500/10 dark:bg-cyan-500/15 rounded-full blur-[120px] pointer-events-none -z-10" />

      <div className="max-w-5xl mx-auto text-center">
        {/* Hackathon Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-500/40 text-indigo-700 dark:text-indigo-300 text-xs font-semibold mb-8 backdrop-blur-md shadow-sm dark:shadow-lg dark:shadow-indigo-950/50">
          <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-cyan-400 animate-pulse" />
          <span>Next-Gen AI Personalized Skill Architecture</span>
          <span className="w-1 h-1 rounded-full bg-slate-400 dark:slate-500"></span>
          <span className="text-indigo-600 dark:text-cyan-300 font-mono">Scala + Agno AI</span>
        </div>

        {/* Hero Headline */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white font-display leading-[1.1] mb-6">
          Not just courses. <br />
          An <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-600 dark:from-cyan-400 dark:via-indigo-300 dark:to-purple-400 bg-clip-text text-transparent">Adaptive AI Brain</span> for your learning path.
        </h1>

        {/* Subtitle */}
        <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed mb-8">
          HADES models your skill gaps, generates deterministic prerequisite graphs, curates multi-modal resources, and adapts dynamically as you progress.
        </p>

        {/* Direct Search & Get Roadmap Bar */}
        <div className="max-w-2xl mx-auto mb-8">
          <form
            onSubmit={handleSearchAndGetRoadmap}
            className="relative flex items-center p-2 rounded-2xl bg-white/90 dark:bg-slate-900/90 border-2 border-indigo-400/40 dark:border-indigo-500/50 shadow-2xl backdrop-blur-xl focus-within:border-indigo-500 dark:focus-within:border-cyan-400 transition-all duration-300"
          >
            <Search className="w-5 h-5 text-indigo-500 dark:text-cyan-400 ml-3 flex-shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search any skill or role to get your roadmap (e.g. AI Agent Engineer)..."
              className="w-full bg-transparent px-3.5 py-2.5 text-sm sm:text-base text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none"
            />
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isSubmitting}
              icon={Sparkles}
              className="flex-shrink-0 shadow-lg shadow-indigo-600/30"
            >
              Get Roadmap
            </Button>
          </form>

          {/* Quick Suggested Roles Chips */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-3">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Popular roadmaps:</span>
            {suggestedRoles.map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => {
                  setSearchQuery(role);
                  handleSearchAndGetRoadmap(null, role);
                }}
                className="text-xs px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 hover:text-indigo-600 dark:hover:text-cyan-300 border border-slate-200 dark:border-slate-700/80 transition flex items-center gap-1"
              >
                <GitBranch className="w-3 h-3 text-indigo-500 dark:text-cyan-400" />
                {role}
              </button>
            ))}
          </div>
        </div>

        {/* Secondary Alternative CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <Link to="/onboarding">
            <Button size="lg" variant="secondary" icon={Wand2} className="w-full sm:w-auto">
              Custom Path Wizard
            </Button>
          </Link>
          <Link to="/dashboard">
            <Button size="lg" variant="ghost" icon={Play} className="w-full sm:w-auto border border-slate-300 dark:border-slate-800">
              Explore Live Workspace (Dashboard)
            </Button>
          </Link>
        </div>

        {/* Social Proof / Stats Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-5 rounded-2xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/80 backdrop-blur-md max-w-4xl mx-auto text-left shadow-lg dark:shadow-none">
          <div className="p-3 border-r border-slate-200 dark:border-slate-800/80 last:border-none">
            <div className="text-2xl font-bold text-slate-900 dark:text-white font-display">100%</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Interactive Roadmaps</div>
          </div>
          <div className="p-3 border-r border-slate-200 dark:border-slate-800/80 last:border-none">
            <div className="text-2xl font-bold text-indigo-600 dark:text-cyan-400 font-display">Agno AI</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Multi-Agent Reasoner</div>
          </div>
          <div className="p-3 border-r border-slate-200 dark:border-slate-800/80 last:border-none">
            <div className="text-2xl font-bold text-purple-600 dark:text-indigo-400 font-display">Curated</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Multi-Modal Resources</div>
          </div>
          <div className="p-3">
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 font-display">Real-Time</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Adaptive Path Updates</div>
          </div>
        </div>
      </div>
    </section>
  );
}
