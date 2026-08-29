import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useLearner } from '../context/LearnerContext';
import { Button, BrandLogo } from '../components/ui';
import { ThemeToggle } from '../components/ui/ThemeToggle';
import {
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Radar,
  Loader2,
  Sparkles,
  Check,
  Plus,
  AlertCircle,
} from 'lucide-react';

export function OnboardingPage() {
  const navigate = useNavigate();
  const { updateProfile, updateGoal, setHasGeneratedRoadmap, submitOnboarding, generateRoadmapForRole } = useLearner();

  const [currentStep, setCurrentStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStage, setGenerationStage] = useState(0);
  const [generationError, setGenerationError] = useState(null);

  const contentScrollRef = useRef(null);

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
    { n: 1, label: 'Target Role', hint: 'Specialization' },
    { n: 2, label: 'Key Topics', hint: 'Interests & Tools' },
    { n: 3, label: 'Baseline', hint: 'Starting Level' },
    { n: 4, label: 'Cadence', hint: 'Weekly Hours' },
    { n: 5, label: 'Review & Build', hint: 'Synthesize Path' },
  ];

  const stepQuestions = {
    1: {
      eyebrow: 'Step 1 of 5 · Role Specialization',
      title: 'What specialization are you targeting?',
      desc: 'Choose your target engineering specialization to calibrate curriculum milestones.',
    },
    2: {
      eyebrow: 'Step 2 of 5 · Technical Stack',
      title: 'Which technologies and domains do you want to master?',
      desc: 'Select the key tools, frameworks, and topics you want emphasized in your roadmap.',
    },
    3: {
      eyebrow: 'Step 3 of 5 · Baseline Experience',
      title: 'Where is your current engineering baseline?',
      desc: 'We will calibrate prerequisite depths and lab complexities to match your level.',
    },
    4: {
      eyebrow: 'Step 4 of 5 · Schedule & Format',
      title: 'How do you prefer to learn?',
      desc: 'Configure your preferred learning modalities and weekly time investment.',
    },
    5: {
      eyebrow: 'Step 5 of 5 · Final Verification',
      title: 'Ready to synthesize your roadmap?',
      desc: 'Confirm your configuration — our multi-agent engine will construct your personalized path.',
    },
  };

  const roleOptions = [
    { id: 'Autonomous AI Systems Engineer', title: 'Autonomous AI Systems Engineer', category: 'Agent Orchestration & LLMOps' },
    { id: 'Enterprise RAG & Search Architect', title: 'Enterprise RAG & Search Architect', category: 'Dense Retrieval & Vector Indexing' },
    { id: 'Full-Stack LLM Developer', title: 'Full-Stack LLM Developer', category: 'FastAPI, Streaming UI & Sessions' },
    { id: 'Production MLOps Engineer', title: 'Production MLOps Engineer', category: 'Model Serving, CI/CD & Eval Suites' },
  ];

  const baselineOptions = [
    { id: 'Beginner', title: 'Beginner' },
    { id: 'Intermediate', title: 'Intermediate' },
    { id: 'Advanced', title: 'Advanced' }
  ];

  // Auto-reset content viewport scroll position to top when step changes
  useEffect(() => {
    if (contentScrollRef.current) {
      contentScrollRef.current.scrollTop = 0;
    }
  }, [currentStep]);

  // Hotkey navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) {
        if (e.key === 'Enter') {
          e.preventDefault();
          if (currentStep < totalSteps) setCurrentStep((p) => p + 1);
          else if (currentStep === totalSteps && !isGenerating) handleFinishOnboarding();
        }
        return;
      }

      if (e.key === 'Enter') {
        e.preventDefault();
        if (currentStep < totalSteps) setCurrentStep((p) => p + 1);
        else if (currentStep === totalSteps && !isGenerating) handleFinishOnboarding();
      } else if (e.key === 'Backspace' || e.key === 'ArrowLeft') {
        if (currentStep > 1 && !isGenerating) setCurrentStep((p) => p - 1);
      } else if (currentStep === 1) {
        const num = parseInt(e.key, 10);
        if (num >= 1 && num <= roleOptions.length) {
          const selRole = roleOptions[num - 1].id;
          setFormData((prev) => ({ ...prev, targetRole: selRole, customGoal: `Master ${selRole} in 12 Weeks` }));
        }
      } else if (currentStep === 3) {
        const num = parseInt(e.key, 10);
        if (num >= 1 && num <= baselineOptions.length) {
          setFormData((prev) => ({ ...prev, experienceLevel: baselineOptions[num - 1].id }));
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentStep, isGenerating, formData]);

  const handleInterestToggle = (interest) => {
    setFormData((prev) => {
      const exists = prev.interests.includes(interest);
      return { ...prev, interests: exists ? prev.interests.filter((i) => i !== interest) : [...prev.interests, interest] };
    });
  };

  const handleFormatToggle = (format) => {
    setFormData((prev) => {
      const exists = prev.learningFormats.includes(format);
      return { ...prev, learningFormats: exists ? prev.learningFormats.filter((f) => f !== format) : [...prev.learningFormats, format] };
    });
  };

  const handleFinishOnboarding = async () => {
    setIsGenerating(true);
    setGenerationStage(1);
    setGenerationError(null);

    const stageTimers = [
      setTimeout(() => setGenerationStage(2), 800),
      setTimeout(() => setGenerationStage(3), 1600),
    ];

    try {
      await submitOnboarding(formData);
      setGenerationStage(3);

      const prefMap = {
        'Hands-on Projects': 'hands_on',
        'Interactive Labs': 'hands_on',
        'Curated Videos': 'video',
        'Technical Articles & Whitepapers': 'reading',
      };
      const learningPreferences = [...new Set((formData.learningFormats || []).map((f) => prefMap[f] || 'hands_on'))];
      const minutesPerDay = Math.round((formData.weeklyHours / 5) * 60) || 60;

      await generateRoadmapForRole(formData.targetRole, {
        experienceLevel: formData.experienceLevel.toLowerCase(),
        interests: formData.interests,
        learningPreferences,
        minutesPerDay,
        daysPerWeek: 5,
        goalTitle: formData.customGoal,
        goalDescription: formData.customGoal,
      });

      setGenerationStage(4);
      updateProfile({
        targetRole: formData.targetRole,
        educationLevel: formData.educationLevel,
        experienceLevel: formData.experienceLevel,
        learningPreferences: {
          weeklyHours: formData.weeklyHours,
          learningFormats: formData.learningFormats,
          pace: formData.pace,
          timeframeWeeks: formData.timeframeWeeks,
        },
      });
      updateGoal({ title: formData.customGoal, targetRole: formData.targetRole, timeframeWeeks: formData.timeframeWeeks });
      setHasGeneratedRoadmap(true);
      setTimeout(() => navigate('/dashboard'), 700);
    } catch (err) {
      console.error('[HADES] Onboarding failed:', err);
      setGenerationError(err.body?.message || err.message || 'Something went wrong. Please try again.');
      setIsGenerating(false);
      setGenerationStage(0);
    } finally {
      stageTimers.forEach(clearTimeout);
    }
  };

  const genStages = [
    { label: 'Evaluating baseline experience and target career profile' },
    { label: 'Identifying core skill clusters, vector tools, and frameworks' },
    { label: 'Computing deterministic prerequisite graph topology' },
    { label: 'Ranking multi-modal learning modules & coding labs' },
  ];

  const inputCls =
    'w-full bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition';

  return (
    <div className="min-h-screen md:h-screen md:overflow-hidden flex flex-col bg-slate-50 dark:bg-[#0B0D13] text-slate-900 dark:text-slate-100 antialiased transition-colors duration-200">
      {/* ===================== NAVBAR (Compact, dedicated layout space) ===================== */}
      <header className="sticky top-0 z-30 w-full bg-white/90 dark:bg-[#0B0D13]/90 backdrop-blur-md border-b border-slate-200 dark:border-white/10 shrink-0">
        <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 h-13 sm:h-14 flex items-center justify-between gap-4">
          <Link to="/" className="shrink-0">
            <BrandLogo subtitle="Mission Control" size="sm" />
          </Link>
          <div className="flex items-center gap-3">
            <span className="mono-label text-slate-500 dark:text-slate-400 font-bold text-xs bg-slate-100 dark:bg-white/[0.06] border border-slate-200 dark:border-white/10 px-2.5 py-0.5 rounded-lg">
              Step {currentStep} of {totalSteps}
            </span>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* ===================== ONBOARDING WORKSPACE ===================== */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 pt-3 sm:pt-4 pb-10 flex flex-col justify-start overflow-hidden">
        {isGenerating ? (
          /* ───────── GENERATION STATE ───────── */
          <div className="flex-1 flex items-center justify-center py-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-lg rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#121620] p-6 sm:p-8 text-center shadow-card"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center mx-auto mb-3 shadow-md text-white">
                <Radar className="w-6 h-6 animate-spin" style={{ animationDuration: '4s' }} />
              </div>
              <span className="mono-label text-indigo-600 dark:text-indigo-400 font-bold text-[11px]">Graph Synthesis In Progress</span>
              <h2 className="font-display text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white mt-1">
                Synthesizing Your Adaptive Roadmap
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1 leading-relaxed">
                Computing multi-phase dependency tree for <strong className="text-slate-900 dark:text-white font-bold">{formData.targetRole}</strong>.
              </p>
              <div className="max-w-sm mx-auto mt-5 space-y-1.5 text-left">
                {genStages.map((stageItem, i) => {
                  const active = generationStage >= i + 1;
                  const isFinal = i + 1 === 4;
                  return (
                    <div
                      key={stageItem.label}
                      className={`flex items-center gap-2 p-2 rounded-xl border transition-all ${active
                          ? 'bg-indigo-500/[0.08] border-indigo-500/30'
                          : 'bg-slate-50 dark:bg-white/[0.02] border-slate-200 dark:border-white/[0.06]'
                        }`}
                    >
                      {active ? (
                        <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 ${isFinal ? 'text-emerald-500' : 'text-indigo-500'}`} />
                      ) : (
                        <Loader2 className="w-3.5 h-3.5 shrink-0 text-slate-400 dark:text-slate-600 animate-spin" />
                      )}
                      <span className={`text-[11px] ${active ? 'text-slate-900 dark:text-white font-semibold' : 'text-slate-400 dark:text-slate-500'}`}>
                        {stageItem.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        ) : (
          /* ───────── TWO PRIMARY COLUMNS: SIDEBAR (LEFT) + MAIN ONBOARDING CONTAINER (RIGHT) ───────── */
          <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-3 sm:gap-3.5 items-stretch min-h-0 h-[calc(100dvh-170px)] sm:h-[calc(100dvh-170px)] max-h-[550px]">
            {/* ── LEFT: SIDEBAR (SAME TOP & BOTTOM LEVEL AS MAIN CONTAINER) ── */}
            <aside className="md:col-span-4 lg:col-span-3 h-full flex flex-col min-h-0">
              <div className="h-full rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#121620] p-4 shadow-card flex flex-col justify-between overflow-hidden">
                {/* Top: Header, Progress & Steps */}
                <div className="flex-1 min-h-0 flex flex-col">
                  <div className="pb-2.5 mb-2.5 border-b border-slate-100 dark:border-white/[0.06] shrink-0">
                    <span className="mono-label text-[10px] text-indigo-600 dark:text-indigo-400 font-bold">Onboarding Flow</span>
                    <div className="flex items-center justify-between mt-0.5">
                      <h3 className="font-display text-xs sm:text-sm font-bold text-slate-900 dark:text-white">Setup Journey</h3>
                      <span className="mono-label text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                        {Math.round(((currentStep - 1) / totalSteps) * 100)}%
                      </span>
                    </div>
                    <div className="mt-1.5 h-1.5 w-full rounded-full bg-slate-100 dark:bg-white/[0.08] overflow-hidden">
                      <div
                        className="h-full bg-indigo-600 transition-all duration-300 rounded-full"
                        style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Steps Navigation */}
                  <nav className="space-y-1 overflow-y-auto pr-0.5">
                    {stepMeta.map((s) => {
                      const isDone = s.n < currentStep;
                      const isActive = s.n === currentStep;
                      return (
                        <button
                          key={s.n}
                          type="button"
                          onClick={() => {
                            if (s.n < currentStep && !isGenerating) setCurrentStep(s.n);
                          }}
                          disabled={s.n > currentStep || isGenerating}
                          className={`w-full flex items-center gap-2 p-1.5 rounded-xl text-left transition-all ${isActive
                              ? 'bg-indigo-500/[0.12] border border-indigo-500/40 text-indigo-600 dark:text-indigo-400 shadow-sm'
                              : isDone
                                ? 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/[0.04] cursor-pointer'
                                : 'text-slate-400 dark:text-slate-500 opacity-40 cursor-not-allowed'
                            }`}
                        >
                          <span
                            className={`w-4.5 h-4.5 rounded-md flex items-center justify-center mono-label text-[9px] font-bold shrink-0 ${isDone
                                ? 'bg-emerald-500 text-white'
                                : isActive
                                  ? 'bg-indigo-600 text-white shadow-sm'
                                  : 'bg-slate-100 dark:bg-white/10 text-slate-400 dark:text-slate-500'
                              }`}
                          >
                            {isDone ? <Check className="w-2.5 h-2.5 stroke-[3]" /> : `0${s.n}`}
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="text-xs font-bold truncate leading-tight">{s.label}</div>
                            <div className="text-[10px] text-slate-400 dark:text-slate-500 truncate">{s.hint}</div>
                          </div>
                        </button>
                      );
                    })}
                  </nav>
                </div>

                {/* Bottom: Adaptive Engine Info */}
                <div className="hidden md:block mt-3 p-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.06] shrink-0">
                  <span className="mono-label text-[9px] text-indigo-600 dark:text-indigo-400 font-bold block mb-0.5">Adaptive Engine</span>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-snug">
                    Deterministic graph compilation based on calibrated parameters.
                  </p>
                </div>
              </div>
            </aside>

            {/* ── RIGHT: ONE LARGE MAIN ONBOARDING CONTAINER ── */}
            <section className="md:col-span-8 lg:col-span-9 h-full flex flex-col min-h-0">
              <div className="h-full rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#121620] p-4 sm:p-5 shadow-card flex flex-col justify-between overflow-hidden">
                {/* 1. QuestionHeader (Fixed at top of Main Container) */}
                <div className="shrink-0 pb-3 border-b border-slate-100 dark:border-white/[0.06]">
                  <span className="mono-label text-indigo-600 dark:text-indigo-400 font-bold text-[11px] block mb-1">
                    {stepQuestions[currentStep].eyebrow}
                  </span>
                  <h2 className="font-display text-base sm:text-lg lg:text-xl font-bold tracking-tight text-slate-900 dark:text-white leading-snug">
                    {stepQuestions[currentStep].title}
                  </h2>
                  <p className="text-xs sm:text-[13px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                    {stepQuestions[currentStep].desc}
                  </p>
                </div>

                {/* 2. QACard (Large Scrollable Q&A Area, consumes most height inside Main Container) */}
                <div className="flex-1 min-h-0 my-3 rounded-xl border border-slate-200/80 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.02] p-3.5 sm:p-4 overflow-hidden flex flex-col">
                  {/* Validation / Error banner */}
                  {generationError && (
                    <div className="flex items-start gap-2 p-2.5 mb-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs shrink-0">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      <span>{generationError}</span>
                    </div>
                  )}

                  {/* Scrollable Q&A Content Area */}
                  <div
                    ref={contentScrollRef}
                    className="flex-1 min-h-0 overflow-y-auto overscroll-contain pr-1"
                  >
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={currentStep}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.14 }}
                      >
                        {/* STEP 1: Role Specialization */}
                        {currentStep === 1 && (
                          <div className="space-y-3">
                            <div className="flex flex-wrap gap-2">
                              {roleOptions.map((role) => {
                                const selected = formData.targetRole === role.id;
                                return (
                                  <button
                                    key={role.id}
                                    type="button"
                                    onClick={() =>
                                      setFormData({
                                        ...formData,
                                        targetRole: role.id,
                                        customGoal: `Master ${role.id} in 12 Weeks`,
                                      })
                                    }
                                    className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-[13px] font-semibold border transition-all ${selected
                                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                                        : 'bg-white dark:bg-white/[0.04] border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:border-indigo-500/40 hover:bg-slate-100/60 dark:hover:bg-white/[0.06]'
                                      }`}
                                  >
                                    {selected ? <Check className="w-3.5 h-3.5" strokeWidth={3} /> : <Plus className="w-3.5 h-3.5 text-slate-400" />}
                                    {role.title}
                                  </button>
                                );
                              })}
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                Specific Learning Objective
                              </label>
                              <input
                                type="text"
                                value={formData.customGoal}
                                onChange={(e) => setFormData({ ...formData, customGoal: e.target.value })}
                                className={inputCls}
                                placeholder="e.g. Master AI Agent Orchestration & Production LLMOps"
                              />
                            </div>
                          </div>
                        )}

                        {/* STEP 2: Technical Stack */}
                        {currentStep === 2 && (
                          <div className="flex flex-wrap gap-2">
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
                              'DSPy & Prompt Optimization',
                              'Kubernetes & Docker',
                            ].map((interest) => {
                              const selected = formData.interests.includes(interest);
                              return (
                                <button
                                  key={interest}
                                  type="button"
                                  onClick={() => handleInterestToggle(interest)}
                                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-[13px] font-semibold border transition-all ${selected
                                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                                      : 'bg-white dark:bg-white/[0.04] border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:border-indigo-500/40 hover:bg-slate-100/60 dark:hover:bg-white/[0.06]'
                                    }`}
                                >
                                  {selected ? <Check className="w-3 h-3" strokeWidth={3} /> : <Plus className="w-3 h-3 text-slate-400" />}
                                  {interest}
                                </button>
                              );
                            })}
                          </div>
                        )}

                        {/* STEP 3: Baseline Experience */}
                        {currentStep === 3 && (
                          <div className="space-y-2">
                            {baselineOptions.map((lvl, idx) => {
                              const selected = formData.experienceLevel === lvl.id;
                              return (
                                <button
                                  key={lvl.id}
                                  type="button"
                                  onClick={() => setFormData({ ...formData, experienceLevel: lvl.id })}
                                  className={`w-full p-3 rounded-xl text-left border flex items-start justify-between gap-3 transition-all ${selected
                                      ? 'bg-indigo-500/[0.08] border-indigo-500/50 ring-1 ring-indigo-500/30 shadow-sm'
                                      : 'bg-white dark:bg-white/[0.04] border-slate-200 dark:border-white/[0.08] hover:border-indigo-500/40 hover:bg-slate-100/50 dark:hover:bg-white/[0.06]'
                                    }`}
                                >
                                  <div className="flex items-start gap-2.5 min-w-0">
                                    <span
                                      className={`w-5 h-5 rounded-md mono-label text-[10px] flex items-center justify-center font-bold border shrink-0 mt-0.5 ${selected
                                          ? 'bg-indigo-600 text-white border-indigo-600'
                                          : 'bg-slate-100 dark:bg-white/10 text-slate-500 border-slate-200 dark:border-white/10'
                                        }`}
                                    >
                                      {idx + 1}
                                    </span>
                                    <div>
                                      <div className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white">{lvl.title}</div>
                                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">{lvl.desc}</p>
                                    </div>
                                  </div>
                                  <span
                                    className={`w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center mt-0.5 transition-colors ${selected ? 'border-indigo-600 bg-indigo-600' : 'border-slate-300 dark:border-white/20'
                                      }`}
                                  >
                                    {selected && <Check className="w-2.5 h-2.5 text-white stroke-[3]" />}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        )}

                        {/* STEP 4: Schedule & Format */}
                        {currentStep === 4 && (
                          <div className="space-y-3">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {['Hands-on Projects', 'Interactive Labs', 'Curated Videos', 'Technical Articles & Whitepapers'].map((fmt) => {
                                const selected = formData.learningFormats.includes(fmt);
                                return (
                                  <button
                                    key={fmt}
                                    type="button"
                                    onClick={() => handleFormatToggle(fmt)}
                                    className={`p-2.5 rounded-xl text-left border transition-all flex items-center justify-between gap-2 ${selected
                                        ? 'bg-indigo-500/[0.08] border-indigo-500/50 shadow-sm'
                                        : 'bg-white dark:bg-white/[0.04] border-slate-200 dark:border-white/[0.08] hover:border-indigo-500/40'
                                      }`}
                                  >
                                    <div className="text-xs font-semibold text-slate-900 dark:text-white">{fmt}</div>
                                    <span
                                      className={`w-3.5 h-3.5 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors ${selected ? 'border-indigo-600 bg-indigo-600' : 'border-slate-300 dark:border-white/20'
                                        }`}
                                    >
                                      {selected && <Check className="w-2 h-2 text-white stroke-[3]" />}
                                    </span>
                                  </button>
                                );
                              })}
                            </div>
                            <div className="p-3 rounded-xl bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08]">
                              <div className="flex justify-between items-center mb-2">
                                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Weekly Time Commitment</label>
                                <span className="mono-label text-xs text-indigo-600 dark:text-indigo-400 font-bold">{formData.weeklyHours} hrs/week</span>
                              </div>
                              <input
                                type="range"
                                min="4"
                                max="35"
                                step="1"
                                value={formData.weeklyHours}
                                onChange={(e) => setFormData({ ...formData, weeklyHours: Number(e.target.value) })}
                                className="w-full h-1.5 bg-slate-200 dark:bg-white/[0.08] rounded-lg appearance-none cursor-pointer accent-indigo-600"
                              />
                              <div className="flex justify-between mono-label text-[9px] text-slate-400 dark:text-slate-500 mt-1.5 font-medium">
                                <span>Part-Time · 4h</span>
                                <span>Standard · 14h</span>
                                <span>Intensive · 35h</span>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* STEP 5: Review & Build */}
                        {currentStep === 5 && (
                          <div className="rounded-xl bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] divide-y divide-slate-200 dark:divide-white/[0.06]">
                            {[
                              ['Target Role', formData.targetRole],
                              ['Experience Baseline', formData.experienceLevel],
                              ['Study Load', `${formData.weeklyHours} hrs/week · ${formData.pace}`],
                            ].map(([k, v]) => (
                              <div key={k} className="flex justify-between items-center gap-4 px-3.5 py-2">
                                <span className="mono-label text-[11px] text-slate-400 dark:text-slate-500 font-medium">{k}</span>
                                <strong className="text-xs text-slate-900 dark:text-white text-right font-bold">{v}</strong>
                              </div>
                            ))}
                            <div className="px-3.5 py-2">
                              <span className="mono-label text-[11px] text-slate-400 dark:text-slate-500 block mb-1 font-medium">Key Focus Areas</span>
                              <div className="flex flex-wrap gap-1">
                                {formData.interests.map((i) => (
                                  <span
                                    key={i}
                                    className="mono-label text-[9px] px-2 py-0.5 rounded-md border border-indigo-500/30 text-indigo-800 dark:text-indigo-300 bg-indigo-500/10 font-bold"
                                  >
                                    {i}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </div>

                {/* 3. Navigation (Fixed at bottom inside Main Container, stable layout flow) */}
                <div className="shrink-0 w-full flex items-center justify-between ">
                  {currentStep > 1 ? (
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      icon={ArrowLeft}
                      onClick={() => setCurrentStep((p) => p - 1)}
                      className="min-h-[37px] sm:min-h-[15px] px-4 font-semibold"
                    >
                      Back
                    </Button>
                  ) : (
                    <div />
                  )}

                  <div className="flex items-center gap-3">
                    <span className="hidden sm:inline mono-label text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                      Press <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10 font-bold">Enter ↵</kbd>
                    </span>
                    {currentStep < totalSteps ? (
                      <Button
                        type="button"
                        variant="primary"
                        size="sm"
                        icon={ArrowRight}
                        onClick={() => setCurrentStep((p) => p + 1)}
                        className="min-h-[38px] sm:min-h-[15px] px-5 font-semibold shadow-sm"
                      >
                        Continue
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        variant="primary"
                        size="sm"
                        icon={Sparkles}
                        onClick={handleFinishOnboarding}
                        className="min-h-[38px] sm:min-h-[40px] px-5 font-semibold shadow-glow-indigo"
                      >
                        Synthesize Adaptive Path
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* ===================== COMPACT PAGE FOOTER ===================== */}
        <footer className="shrink-0 pt-2 pb-0.5 text-center mono-label text-[10px] text-slate-400 dark:text-slate-500 font-medium">
          HADES Engine · Multi-Agent Prerequisite Synthesis
        </footer>
      </main>
    </div>
  );
}
