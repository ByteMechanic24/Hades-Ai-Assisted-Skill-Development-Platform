import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useLearner } from '../context/LearnerContext';
import { Button } from '../components/ui';
import { ThemeToggle } from '../components/ui/ThemeToggle';
import {
  ArrowRight,
  ArrowLeft,
  Target,
  CheckCircle2,
  Radar,
  Loader2,
  Sparkles,
  Check,
  Plus,
} from 'lucide-react';
import { IMAGERY } from '../utils/media';

export function OnboardingPage() {
  const navigate = useNavigate();
  const { updateProfile, updateGoal, setHasGeneratedRoadmap } = useLearner();

  const [currentStep, setCurrentStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStage, setGenerationStage] = useState(0);

  // Form State
  const [formData, setFormData] = useState({
    targetRole: 'Autonomous AI Systems Engineer',
    customGoal: 'Master AI Agent Orchestration & Production LLMOps',
    timeframeWeeks: 12,
    educationLevel: 'Undergraduate / Tech Enthusiast',
    experienceLevel: 'Intermediate',
    interests: ['Generative AI', 'Agentic Workflows', 'Vector Databases', 'FastAPI'],
    learningFormats: ['Hands-on Projects', 'Interactive Labs'],
    pace: 'Accelerated',
    weeklyHours: 14,
  });

  const totalSteps = 5;

  const stepMeta = [
    { n: 1, label: 'Goal', hint: 'What you want' },
    { n: 2, label: 'Interests', hint: 'What excites you' },
    { n: 3, label: 'Background', hint: 'Where you start' },
    { n: 4, label: 'Cadence', hint: 'How you learn' },
    { n: 5, label: 'Review', hint: 'Confirm & build' },
  ];

  const handleInterestToggle = (interest) => {
    setFormData((prev) => {
      const exists = prev.interests.includes(interest);
      return {
        ...prev,
        interests: exists ? prev.interests.filter((i) => i !== interest) : [...prev.interests, interest],
      };
    });
  };

  const handleFormatToggle = (format) => {
    setFormData((prev) => {
      const exists = prev.learningFormats.includes(format);
      return {
        ...prev,
        learningFormats: exists ? prev.learningFormats.filter((f) => f !== format) : [...prev.learningFormats, format],
      };
    });
  };

  const handleFinishOnboarding = () => {
    setIsGenerating(true);
    setGenerationStage(1);

    setTimeout(() => setGenerationStage(2), 600);
    setTimeout(() => setGenerationStage(3), 1200);
    setTimeout(() => setGenerationStage(4), 1800);

    setTimeout(() => {
      updateProfile({
        targetRole: formData.targetRole,
        educationLevel: formData.educationLevel,
        experienceLevel: formData.experienceLevel,
        interests: formData.interests,
        learningPreferences: {
          format: formData.learningFormats,
          pace: formData.pace,
          weeklyHours: formData.weeklyHours,
        },
      });

      updateGoal({
        title: formData.customGoal,
        targetRole: formData.targetRole,
        timeframeWeeks: formData.timeframeWeeks,
      });

      setHasGeneratedRoadmap(true);
      try {
        localStorage.setItem('hades_has_generated_roadmap', 'true');
      } catch (e) {
        console.warn('Storage error:', e);
      }

      navigate('/dashboard/learning-path');
    }, 2400);
  };

  const genStages = [
    'Understanding your target role & experience',
    'Mapping required skills & technologies',
    'Checking code & mathematical prerequisites',
    'Structuring multi-phase path & resources',
  ];

  const inputCls =
    'w-full bg-stone-50 dark:bg-white/[0.03] border border-stone-200 dark:border-white/10 rounded-lg px-4 py-2.5 text-sm text-stone-900 dark:text-white placeholder-stone-400 dark:placeholder-stone-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/40 transition';

  return (
    <div className="min-h-screen grid lg:grid-cols-[380px_1fr] text-stone-900 dark:text-stone-100">
      {/* ---------------------------------------------------- Left identity rail */}
      <aside className="relative hidden lg:flex flex-col justify-between p-10 border-r border-stone-200 dark:border-white/[0.08] overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-60 dark:opacity-100 pointer-events-none [mask-image:linear-gradient(to_bottom,black,transparent)]" />
        <div className="relative">
          <Link to="/" className="inline-flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-lg bg-stone-900 dark:bg-white flex items-center justify-center">
              <Radar className="w-[18px] h-[18px] text-amber-400 dark:text-amber-500" strokeWidth={2.25} />
            </span>
            <span className="flex flex-col leading-none">
              <span className="font-display text-[15px] font-bold tracking-tight">HADES</span>
              <span className="mono-label text-[9px] text-stone-400 dark:text-stone-500 mt-0.5">Mission Control</span>
            </span>
          </Link>

          <h2 className="font-display text-2xl font-bold tracking-tight mt-10 leading-snug">
            Let&apos;s chart your path.
          </h2>
          <p className="text-sm text-stone-500 dark:text-stone-400 mt-2 leading-relaxed max-w-xs">
            Five quick steps. Then the engine builds a prerequisite graph tuned to exactly where you are.
          </p>

          {/* Vertical stepper */}
          <ol className="mt-10 space-y-1">
            {stepMeta.map((s) => {
              const done = s.n < currentStep;
              const active = s.n === currentStep;
              return (
                <li
                  key={s.n}
                  className={`flex items-center gap-3.5 rounded-lg px-3 py-2.5 transition-colors ${
                    active ? 'bg-amber-500/[0.08] border border-amber-500/25' : 'border border-transparent'
                  }`}
                >
                  <span
                    className={`w-7 h-7 rounded-lg flex items-center justify-center mono-label text-[11px] shrink-0 border ${
                      done
                        ? 'bg-amber-500 border-amber-500 text-stone-950'
                        : active
                        ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                        : 'border-stone-200 dark:border-white/10 text-stone-400 dark:text-stone-500'
                    }`}
                  >
                    {done ? <CheckCircle2 className="w-4 h-4" /> : `0${s.n}`}
                  </span>
                  <div className="min-w-0">
                    <div className={`text-sm font-semibold ${active ? 'text-stone-900 dark:text-white' : 'text-stone-500 dark:text-stone-400'}`}>
                      {s.label}
                    </div>
                    <div className="mono-label text-[9px] text-stone-400 dark:text-stone-500 mt-0.5">{s.hint}</div>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>

        <div className="relative rounded-xl overflow-hidden border border-stone-200 dark:border-white/[0.08] h-32">
          <img src={IMAGERY.onboarding} alt="Two students pairing on a project" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 to-transparent" />
          <p className="absolute bottom-3 left-3 right-3 text-[11px] text-white/90 leading-snug">
            &ldquo;Your goal becomes a project. The project reveals the path.&rdquo;
          </p>
        </div>
      </aside>

      {/* ---------------------------------------------------- Right content */}
      <div className="relative flex flex-col min-h-screen">
        {/* Mobile header */}
        <header className="flex items-center justify-between p-5 border-b border-stone-200 dark:border-white/[0.08] lg:justify-end">
          <Link to="/" className="lg:hidden inline-flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-stone-900 dark:bg-white flex items-center justify-center">
              <Radar className="w-4 h-4 text-amber-400 dark:text-amber-500" strokeWidth={2.25} />
            </span>
            <span className="font-display text-sm font-bold tracking-tight">HADES</span>
          </Link>
          <div className="flex items-center gap-4">
            {!isGenerating && (
              <span className="mono-label text-stone-400 dark:text-stone-500 lg:hidden">Step {currentStep}/{totalSteps}</span>
            )}
            <ThemeToggle />
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center p-5 sm:p-10">
          <div className="w-full max-w-2xl">
            {isGenerating ? (
              /* ---------------------------------------- Generation state */
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="rounded-2xl border border-stone-200 dark:border-white/[0.08] bg-white/90 dark:bg-[#101013]/80 backdrop-blur-md p-8 sm:p-10 text-center"
              >
                <div className="w-14 h-14 rounded-2xl bg-amber-500 flex items-center justify-center mx-auto mb-6">
                  <Radar className="w-7 h-7 text-stone-950 animate-spin" style={{ animationDuration: '4s' }} />
                </div>
                <span className="mono-label text-amber-600 dark:text-amber-400">Synthesizing</span>
                <h2 className="font-display text-2xl font-bold tracking-tight text-stone-900 dark:text-white mt-2">
                  Building your adaptive roadmap
                </h2>
                <p className="text-sm text-stone-500 dark:text-stone-400 max-w-md mx-auto mt-2">
                  Generating the prerequisite graph for{' '}
                  <strong className="text-stone-900 dark:text-white font-semibold">{formData.targetRole}</strong>.
                </p>

                <div className="max-w-md mx-auto mt-8 space-y-2.5 text-left">
                  {genStages.map((label, i) => {
                    const stage = i + 1;
                    const active = generationStage >= stage;
                    const isFinal = stage === 4;
                    return (
                      <div
                        key={label}
                        className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                          active
                            ? 'bg-amber-500/[0.06] border-amber-500/30'
                            : 'bg-stone-50 dark:bg-white/[0.02] border-stone-200 dark:border-white/[0.06]'
                        }`}
                      >
                        {active ? (
                          <CheckCircle2 className={`w-4 h-4 shrink-0 ${isFinal ? 'text-emerald-500' : 'text-amber-500'}`} />
                        ) : (
                          <Loader2 className="w-4 h-4 shrink-0 text-stone-300 dark:text-stone-600 animate-spin" />
                        )}
                        <span className={`text-sm ${active ? 'text-stone-900 dark:text-white font-medium' : 'text-stone-400 dark:text-stone-500'}`}>
                          {label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            ) : (
              /* ---------------------------------------- Wizard card */
              <div className="rounded-2xl border border-stone-200 dark:border-white/[0.08] bg-white/90 dark:bg-[#101013]/80 backdrop-blur-md p-6 sm:p-9">
                {/* Mobile progress bar */}
                <div className="lg:hidden mb-6 h-1 rounded-full bg-stone-200 dark:bg-white/[0.08] overflow-hidden">
                  <div className="h-full bg-amber-500 transition-all duration-300" style={{ width: `${(currentStep / totalSteps) * 100}%` }} />
                </div>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                  >
                    {/* STEP 1: Goal */}
                    {currentStep === 1 && (
                      <div className="space-y-6">
                        <div>
                          <span className="mono-label text-amber-600 dark:text-amber-400">Step 1 · The goal</span>
                          <h2 className="font-display text-2xl font-bold tracking-tight text-stone-900 dark:text-white mt-2">
                            What role are you targeting?
                          </h2>
                          <p className="text-sm text-stone-500 dark:text-stone-400 mt-1.5">
                            Pick a high-demand track or write your own.
                          </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {[
                            'Autonomous AI Systems Engineer',
                            'Enterprise RAG & Search Architect',
                            'Full-Stack LLM Developer',
                            'Computer Vision & Robotics Engineer',
                          ].map((role) => {
                            const selected = formData.targetRole === role;
                            return (
                              <button
                                key={role}
                                type="button"
                                onClick={() => setFormData({ ...formData, targetRole: role, customGoal: `Master ${role} in 12 Weeks` })}
                                className={`p-4 rounded-xl text-left border transition-all ${
                                  selected
                                    ? 'bg-amber-500/[0.06] border-amber-500/50 ring-1 ring-amber-500/30'
                                    : 'bg-stone-50 dark:bg-white/[0.02] border-stone-200 dark:border-white/[0.08] hover:border-amber-500/30'
                                }`}
                              >
                                <Target className={`w-5 h-5 mb-2 ${selected ? 'text-amber-500' : 'text-stone-400 dark:text-stone-500'}`} />
                                <div className="text-sm font-semibold text-stone-900 dark:text-white">{role}</div>
                                <div className="mono-label text-[9px] text-stone-400 dark:text-stone-500 mt-1">High industry demand</div>
                              </button>
                            );
                          })}
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-stone-600 dark:text-stone-400 mb-1.5">
                            Describe your goal
                          </label>
                          <input
                            type="text"
                            value={formData.customGoal}
                            onChange={(e) => setFormData({ ...formData, customGoal: e.target.value })}
                            className={inputCls}
                          />
                        </div>
                      </div>
                    )}

                    {/* STEP 2: Interests */}
                    {currentStep === 2 && (
                      <div className="space-y-6">
                        <div>
                          <span className="mono-label text-amber-600 dark:text-amber-400">Step 2 · Interests</span>
                          <h2 className="font-display text-2xl font-bold tracking-tight text-stone-900 dark:text-white mt-2">
                            Which technologies excite you?
                          </h2>
                          <p className="text-sm text-stone-500 dark:text-stone-400 mt-1.5">
                            We&apos;ll prioritize these in your recommendations.
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-2.5">
                          {[
                            'Generative AI',
                            'Agentic Workflows',
                            'Vector Databases',
                            'pgvector',
                            'FastAPI',
                            'Deep Learning',
                            'PyTorch',
                            'LLMOps & Guardrails',
                            'Distributed Systems',
                            'Graph Neural Networks',
                          ].map((interest) => {
                            const selected = formData.interests.includes(interest);
                            return (
                              <button
                                key={interest}
                                type="button"
                                onClick={() => handleInterestToggle(interest)}
                                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium border transition ${
                                  selected
                                    ? 'bg-amber-500 text-stone-950 border-amber-500'
                                    : 'bg-stone-50 dark:bg-white/[0.02] border-stone-200 dark:border-white/10 text-stone-600 dark:text-stone-300 hover:border-amber-500/40'
                                }`}
                              >
                                {selected ? (
                                  <Check className="w-3.5 h-3.5" strokeWidth={3} />
                                ) : (
                                  <Plus className="w-3.5 h-3.5 text-stone-400" />
                                )}
                                {interest}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* STEP 3: Background */}
                    {currentStep === 3 && (
                      <div className="space-y-6">
                        <div>
                          <span className="mono-label text-amber-600 dark:text-amber-400">Step 3 · Background</span>
                          <h2 className="font-display text-2xl font-bold tracking-tight text-stone-900 dark:text-white mt-2">
                            Your current experience
                          </h2>
                          <p className="text-sm text-stone-500 dark:text-stone-400 mt-1.5">
                            This sets where your prerequisite graph begins.
                          </p>
                        </div>

                        <div className="space-y-3">
                          {[
                            { id: 'Beginner', title: 'Beginner', desc: 'Basic Python / programming, starting AI from zero.' },
                            { id: 'Intermediate', title: 'Intermediate', desc: 'Comfortable with backend/data structures, built standard ML models.' },
                            { id: 'Advanced', title: 'Advanced', desc: 'Shipped production code, specializing in agentic systems.' },
                          ].map((lvl) => {
                            const selected = formData.experienceLevel === lvl.id;
                            return (
                              <button
                                key={lvl.id}
                                type="button"
                                onClick={() => setFormData({ ...formData, experienceLevel: lvl.id })}
                                className={`w-full p-4 rounded-xl text-left border flex items-start gap-3 transition-all ${
                                  selected
                                    ? 'bg-amber-500/[0.06] border-amber-500/50 ring-1 ring-amber-500/30'
                                    : 'bg-stone-50 dark:bg-white/[0.02] border-stone-200 dark:border-white/[0.08] hover:border-amber-500/30'
                                }`}
                              >
                                <span
                                  className={`w-4 h-4 rounded-full border-2 mt-0.5 shrink-0 ${
                                    selected ? 'border-amber-500 bg-amber-500' : 'border-stone-300 dark:border-white/20'
                                  }`}
                                />
                                <div>
                                  <div className="text-sm font-semibold text-stone-900 dark:text-white">{lvl.title}</div>
                                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">{lvl.desc}</p>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* STEP 4: Cadence */}
                    {currentStep === 4 && (
                      <div className="space-y-6">
                        <div>
                          <span className="mono-label text-amber-600 dark:text-amber-400">Step 4 · Cadence</span>
                          <h2 className="font-display text-2xl font-bold tracking-tight text-stone-900 dark:text-white mt-2">
                            How do you prefer to learn?
                          </h2>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {['Hands-on Projects', 'Interactive Labs', 'Curated Videos', 'Technical Articles & Whitepapers'].map((fmt) => {
                            const selected = formData.learningFormats.includes(fmt);
                            return (
                              <button
                                key={fmt}
                                type="button"
                                onClick={() => handleFormatToggle(fmt)}
                                className={`p-4 rounded-xl text-left border transition-all ${
                                  selected
                                    ? 'bg-amber-500/[0.06] border-amber-500/50'
                                    : 'bg-stone-50 dark:bg-white/[0.02] border-stone-200 dark:border-white/[0.08] hover:border-amber-500/30'
                                }`}
                              >
                                <div className="text-sm font-semibold text-stone-900 dark:text-white">{fmt}</div>
                                <span className="mono-label text-[9px] text-stone-400 dark:text-stone-500 mt-1 block">
                                  {selected ? 'Included in path' : 'Click to include'}
                                </span>
                              </button>
                            );
                          })}
                        </div>

                        <div className="p-4 rounded-xl bg-stone-50 dark:bg-white/[0.02] border border-stone-200 dark:border-white/[0.08]">
                          <div className="flex justify-between items-center mb-3">
                            <label className="text-xs font-medium text-stone-600 dark:text-stone-300">Weekly commitment</label>
                            <span className="mono-label text-amber-600 dark:text-amber-400">{formData.weeklyHours} hrs/week</span>
                          </div>
                          <input
                            type="range"
                            min="4"
                            max="35"
                            step="1"
                            value={formData.weeklyHours}
                            onChange={(e) => setFormData({ ...formData, weeklyHours: Number(e.target.value) })}
                            className="w-full h-1.5 bg-stone-200 dark:bg-white/[0.08] rounded-lg appearance-none cursor-pointer accent-amber-500"
                          />
                          <div className="flex justify-between mono-label text-[9px] text-stone-400 dark:text-stone-500 mt-2">
                            <span>Casual · 4h</span>
                            <span>Recommended · 14h</span>
                            <span>Intensive · 35h</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* STEP 5: Review */}
                    {currentStep === 5 && (
                      <div className="space-y-6">
                        <div>
                          <span className="mono-label text-amber-600 dark:text-amber-400">Step 5 · Review</span>
                          <h2 className="font-display text-2xl font-bold tracking-tight text-stone-900 dark:text-white mt-2">
                            Ready to build your roadmap?
                          </h2>
                          <p className="text-sm text-stone-500 dark:text-stone-400 mt-1.5">
                            Confirm your selections — the engine generates your adaptive graph.
                          </p>
                        </div>

                        <div className="rounded-xl bg-stone-50 dark:bg-white/[0.02] border border-stone-200 dark:border-white/[0.08] divide-y divide-stone-200 dark:divide-white/[0.06]">
                          {[
                            ['Target role', formData.targetRole],
                            ['Experience', formData.experienceLevel],
                            ['Study load', `${formData.weeklyHours} hrs/week · ${formData.pace}`],
                          ].map(([k, v]) => (
                            <div key={k} className="flex justify-between items-center gap-4 px-4 py-3">
                              <span className="mono-label text-stone-400 dark:text-stone-500">{k}</span>
                              <strong className="text-sm text-stone-900 dark:text-white text-right">{v}</strong>
                            </div>
                          ))}
                          <div className="px-4 py-3">
                            <span className="mono-label text-stone-400 dark:text-stone-500 block mb-2">Core topics</span>
                            <div className="flex flex-wrap gap-1.5">
                              {formData.interests.map((i) => (
                                <span
                                  key={i}
                                  className="mono-label text-[10px] px-2 py-1 rounded border border-amber-500/30 text-amber-700 dark:text-amber-300 bg-amber-500/[0.06]"
                                >
                                  {i}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>

                {/* Nav footer */}
                <div className="flex items-center justify-between pt-6 border-t border-stone-200 dark:border-white/[0.08] mt-8">
                  {currentStep > 1 ? (
                    <Button type="button" variant="secondary" size="md" icon={ArrowLeft} onClick={() => setCurrentStep((p) => p - 1)}>
                      Back
                    </Button>
                  ) : (
                    <div />
                  )}

                  {currentStep < totalSteps ? (
                    <Button type="button" variant="primary" size="md" icon={ArrowRight} onClick={() => setCurrentStep((p) => p + 1)}>
                      Continue
                    </Button>
                  ) : (
                    <Button type="button" variant="primary" size="md" icon={Sparkles} onClick={handleFinishOnboarding}>
                      Generate adaptive path
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </main>

        <footer className="text-center py-5 mono-label text-[10px] text-stone-400 dark:text-stone-500">
          HADES Engine · Deterministic prerequisite graphs &amp; curated resources
        </footer>
      </div>
    </div>
  );
}
