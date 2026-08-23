import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useLearner } from '../context/LearnerContext';
import { Button, GlassCard, Badge } from '../components/ui';
import { ThemeToggle } from '../components/ui/ThemeToggle';
import { 
  Sparkles, 
  ArrowRight, 
  ArrowLeft, 
  Target, 
  BookOpen, 
  Clock, 
  CheckCircle2, 
  Cpu, 
  Layers,
  Award
} from 'lucide-react';
import confetti from 'canvas-confetti';

export function OnboardingPage() {
  const navigate = useNavigate();
  const { updateProfile, updateGoal, setHasGeneratedRoadmap } = useLearner();

  const [currentStep, setCurrentStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStage, setGenerationStage] = useState(0);

  // Form State
  const [formData, setFormData] = useState({
    targetRole: "Autonomous AI Systems Engineer",
    customGoal: "Master AI Agent Orchestration & Production LLMOps",
    timeframeWeeks: 12,
    educationLevel: "Undergraduate / Tech Enthusiast",
    experienceLevel: "Intermediate",
    interests: ["Generative AI", "Agentic Workflows", "Vector Databases", "FastAPI"],
    learningFormats: ["Hands-on Projects", "Interactive Labs"],
    pace: "Accelerated",
    weeklyHours: 14
  });

  const totalSteps = 5;

  const handleInterestToggle = (interest) => {
    setFormData(prev => {
      const exists = prev.interests.includes(interest);
      return {
        ...prev,
        interests: exists
          ? prev.interests.filter(i => i !== interest)
          : [...prev.interests, interest]
      };
    });
  };

  const handleFormatToggle = (format) => {
    setFormData(prev => {
      const exists = prev.learningFormats.includes(format);
      return {
        ...prev,
        learningFormats: exists
          ? prev.learningFormats.filter(f => f !== format)
          : [...prev.learningFormats, format]
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
          weeklyHours: formData.weeklyHours
        }
      });

      updateGoal({
        title: formData.customGoal,
        targetRole: formData.targetRole,
        timeframeWeeks: formData.timeframeWeeks
      });

      setHasGeneratedRoadmap(true);
      try {
        localStorage.setItem('hades_has_generated_roadmap', 'true');
      } catch (e) {
        console.warn("Storage error:", e);
      }

      navigate('/dashboard/learning-path');
    }, 2400);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F19] text-slate-900 dark:text-slate-100 flex flex-col justify-between p-4 sm:p-8 relative overflow-hidden transition-colors duration-200">
      {/* Background ambient lighting */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/10 dark:bg-indigo-600/15 rounded-full blur-[140px] pointer-events-none -z-10" />

      {/* Top Header */}
      <header className="max-w-4xl w-full mx-auto flex items-center justify-between py-4">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="font-bold text-slate-900 dark:text-white tracking-wider font-display text-lg">HADES</span>
        </Link>

        <div className="flex items-center gap-4">
          <ThemeToggle />
          {!isGenerating && (
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-500 dark:text-slate-400">Step {currentStep} of {totalSteps}</span>
              <div className="w-32 h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 transition-all duration-300"
                  style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Center Form Container */}
      <main className="max-w-3xl w-full mx-auto my-auto py-6">
        {isGenerating ? (
          <GlassCard className="p-8 sm:p-12 text-center border-indigo-300 dark:border-indigo-500/40 shadow-2xl">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-indigo-500/40 animate-pulse text-white">
              <Cpu className="w-8 h-8 animate-spin" style={{ animationDuration: '6s' }} />
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white font-display mb-3">
              Synthesizing Your Adaptive Roadmap
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto mb-8">
              HADES is generating the deterministic prerequisite graph and curated resources for <strong className="text-indigo-600 dark:text-cyan-300">{formData.targetRole}</strong>.
            </p>

            <div className="max-w-md mx-auto space-y-3 text-left">
              <div className={`flex items-center gap-3 p-3 rounded-xl border transition ${generationStage >= 1 ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-300 dark:border-indigo-500/40 text-slate-900 dark:text-white' : 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500'}`}>
                <CheckCircle2 className={`w-4 h-4 ${generationStage >= 1 ? 'text-indigo-600 dark:text-cyan-400' : 'text-slate-400'}`} />
                <span className="text-xs sm:text-sm font-medium">1. Understanding your target role & experience</span>
              </div>
              <div className={`flex items-center gap-3 p-3 rounded-xl border transition ${generationStage >= 2 ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-300 dark:border-indigo-500/40 text-slate-900 dark:text-white' : 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500'}`}>
                <CheckCircle2 className={`w-4 h-4 ${generationStage >= 2 ? 'text-indigo-600 dark:text-cyan-400' : 'text-slate-400'}`} />
                <span className="text-xs sm:text-sm font-medium">2. Mapping required skills & technologies</span>
              </div>
              <div className={`flex items-center gap-3 p-3 rounded-xl border transition ${generationStage >= 3 ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-300 dark:border-indigo-500/40 text-slate-900 dark:text-white' : 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500'}`}>
                <CheckCircle2 className={`w-4 h-4 ${generationStage >= 3 ? 'text-indigo-600 dark:text-cyan-400' : 'text-slate-400'}`} />
                <span className="text-xs sm:text-sm font-medium">3. Checking code & mathematical prerequisites</span>
              </div>
              <div className={`flex items-center gap-3 p-3 rounded-xl border transition ${generationStage >= 4 ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-300 dark:border-indigo-500/40 text-slate-900 dark:text-white' : 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500'}`}>
                <CheckCircle2 className={`w-4 h-4 ${generationStage >= 4 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`} />
                <span className="text-xs sm:text-sm font-medium">4. Structuring multi-phase learning path & resources</span>
              </div>
            </div>
          </GlassCard>
        ) : (
          <GlassCard className="p-6 sm:p-10 border-slate-200 dark:border-slate-800 shadow-2xl">
            {/* STEP 1: Target Role & Goal */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <Badge variant="cyan" size="sm" className="mb-2">Step 1: Learning Goal</Badge>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white font-display">What role are you targeting?</h2>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Select a high-demand track or customize your goal.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    "Autonomous AI Systems Engineer",
                    "Enterprise RAG & Search Architect",
                    "Full-Stack LLM Developer",
                    "Computer Vision & Robotics Engineer"
                  ].map((role) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => setFormData({ ...formData, targetRole: role, customGoal: `Master ${role} in 12 Weeks` })}
                      className={`p-4 rounded-xl text-left border-2 transition-all duration-200 ${
                        formData.targetRole === role
                          ? 'bg-indigo-50 dark:bg-gradient-to-r dark:from-indigo-950/90 dark:to-slate-900 border-indigo-600 dark:border-indigo-500 ring-2 ring-indigo-500/20 text-indigo-950 dark:text-white shadow-sm'
                          : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-indigo-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <Target className="w-5 h-5 text-indigo-600 dark:text-cyan-400 mb-2" />
                      <div className="text-sm font-bold">{role}</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">High industry demand</div>
                    </button>
                  ))}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Custom Learning Goal Description</label>
                  <input
                    type="text"
                    value={formData.customGoal}
                    onChange={(e) => setFormData({ ...formData, customGoal: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                  />
                </div>
              </div>
            )}

            {/* STEP 2: Interests */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <Badge variant="primary" size="sm" className="mb-2">Step 2: Core Interests</Badge>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white font-display">Which technologies excite you?</h2>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Select the key topics you want prioritized in your recommendations.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2.5">
                  {[
                    "Generative AI",
                    "Agentic Workflows",
                    "Vector Databases",
                    "pgvector",
                    "FastAPI",
                    "Deep Learning",
                    "PyTorch",
                    "LLMOps & Guardrails",
                    "Distributed Systems",
                    "Graph Neural Networks"
                  ].map((interest) => {
                    const selected = formData.interests.includes(interest);
                    return (
                      <button
                        key={interest}
                        type="button"
                        onClick={() => handleInterestToggle(interest)}
                        className={`px-4 py-2 rounded-xl text-xs font-semibold border transition ${
                          selected
                            ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/30'
                            : 'bg-slate-50 dark:bg-slate-900/70 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-indigo-300 dark:hover:border-slate-700'
                        }`}
                      >
                        {selected ? '✓ ' : '+ '}
                        {interest}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* STEP 3: Experience */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <Badge variant="cyan" size="sm" className="mb-2">Step 3: Background</Badge>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white font-display">Your Current Experience</h2>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                    This determines where your prerequisite graph starts.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { id: "Beginner", title: "Beginner", desc: "Basic Python / programming knowledge, starting AI from zero." },
                    { id: "Intermediate", title: "Intermediate", desc: "Comfortable with backend/data structures, built standard ML models." },
                    { id: "Advanced", title: "Advanced", desc: "Shipped production code, looking to specialize in agentic systems." }
                  ].map((lvl) => (
                    <button
                      key={lvl.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, experienceLevel: lvl.id })}
                      className={`p-4 rounded-xl text-left border-2 transition ${
                        formData.experienceLevel === lvl.id
                          ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-600 dark:border-indigo-500 ring-2 ring-indigo-500/20 text-indigo-950 dark:text-white shadow-sm'
                          : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-indigo-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <div className="text-sm font-bold">{lvl.title}</div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">{lvl.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 4: Formats & Hours */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div>
                  <Badge variant="primary" size="sm" className="mb-2">Step 4: Preferences & Hours</Badge>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white font-display">How do you prefer to learn?</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    "Hands-on Projects",
                    "Interactive Labs",
                    "Curated Videos",
                    "Technical Articles & Whitepapers"
                  ].map((fmt) => {
                    const selected = formData.learningFormats.includes(fmt);
                    return (
                      <button
                        key={fmt}
                        type="button"
                        onClick={() => handleFormatToggle(fmt)}
                        className={`p-4 rounded-xl text-left border-2 transition ${
                          selected
                            ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-600 dark:border-indigo-500 text-indigo-950 dark:text-white shadow-sm'
                            : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-400 hover:border-indigo-300 dark:hover:border-slate-700'
                        }`}
                      >
                        <div className="text-sm font-bold">{fmt}</div>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 block">{selected ? 'Included in path' : 'Click to include'}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800">
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Weekly Commitment</label>
                    <span className="text-xs font-bold text-indigo-600 dark:text-cyan-400">{formData.weeklyHours} hrs/week</span>
                  </div>
                  <input
                    type="range"
                    min="4"
                    max="35"
                    step="1"
                    value={formData.weeklyHours}
                    onChange={(e) => setFormData({ ...formData, weeklyHours: Number(e.target.value) })}
                    className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
                </div>
              </div>
            )}

            {/* STEP 5: Final Review */}
            {currentStep === 5 && (
              <div className="space-y-6">
                <div>
                  <Badge variant="emerald" size="sm" className="mb-2">Step 5: Review & Generate</Badge>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white font-display">Ready to build your roadmap?</h2>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Verify your selections. HADES AI will generate your adaptive graph.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-4">
                  <div className="flex justify-between items-center pb-3 border-b border-slate-200 dark:border-slate-800">
                    <span className="text-xs text-slate-500 dark:text-slate-400">Target Role</span>
                    <strong className="text-sm text-slate-900 dark:text-white">{formData.targetRole}</strong>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-slate-200 dark:border-slate-800">
                    <span className="text-xs text-slate-500 dark:text-slate-400">Experience Level</span>
                    <strong className="text-sm text-slate-900 dark:text-white">{formData.experienceLevel}</strong>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-slate-200 dark:border-slate-800">
                    <span className="text-xs text-slate-500 dark:text-slate-400">Pace / Study Load</span>
                    <strong className="text-sm text-slate-900 dark:text-white">{formData.weeklyHours} Hours/Week ({formData.pace})</strong>
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1.5">Selected Core Topics</span>
                    <div className="flex flex-wrap gap-1.5">
                      {formData.interests.map(i => (
                        <span key={i} className="text-[11px] px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-500/30 text-indigo-700 dark:text-indigo-300">
                          {i}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Wizard Navigation Footer */}
            <div className="flex items-center justify-between pt-6 border-t border-slate-200 dark:border-slate-800 mt-6">
              {currentStep > 1 ? (
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  icon={ArrowLeft}
                  onClick={() => setCurrentStep(prev => prev - 1)}
                >
                  Back
                </Button>
              ) : (
                <div />
              )}

              {currentStep < totalSteps ? (
                <Button
                  type="button"
                  variant="primary"
                  size="md"
                  onClick={() => setCurrentStep(prev => prev + 1)}
                >
                  Continue <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="primary"
                  size="md"
                  icon={Sparkles}
                  onClick={handleFinishOnboarding}
                >
                  Generate Adaptive Path
                </Button>
              )}
            </div>
          </GlassCard>
        )}
      </main>

      {/* Footer */}
      <footer className="text-center py-4 text-xs text-slate-500">
        HADES Engine • Deterministic Prerequisite Graphs & Curated Learning Resources
      </footer>
    </div>
  );
}
