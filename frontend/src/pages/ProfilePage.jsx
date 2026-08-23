import React, { useState } from 'react';
import { useLearner } from '../context/LearnerContext';
import { Button, GlassCard, Badge } from '../components/ui';
import { 
  User, 
  Mail, 
  Briefcase, 
  Target, 
  Clock, 
  Sparkles, 
  Award, 
  ShieldCheck, 
  Flame, 
  Camera, 
  Save, 
  CheckCircle2, 
  ExternalLink, 
  BookOpen, 
  Zap, 
  Sliders, 
  RotateCcw, 
  Download 
} from 'lucide-react';
import confetti from 'canvas-confetti';

export function ProfilePage() {
  const { profile, updateProfile, goal, updateGoal, skills, roadmapProgressPercentage, recordProgressEvent } = useLearner();

  const [activeTab, setActiveTab] = useState('general'); // 'general' | 'preferences' | 'achievements' | 'account'
  
  // Local form state with defensive optional chaining
  const [formData, setFormData] = useState({
    name: profile?.name || 'Aman Kumar',
    email: profile?.email || 'aman@hades.ai',
    avatar: profile?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    currentRole: profile?.currentRole || 'Computer Science Learner',
    targetRole: goal?.targetRole || 'Autonomous AI Systems Engineer',
    educationLevel: profile?.educationLevel || 'Undergraduate / Tech Enthusiast',
    experienceLevel: profile?.experienceLevel || 'Intermediate',
    weeklyHours: profile?.learningPreferences?.weeklyHours || 14,
    pace: profile?.learningPreferences?.pace || 'Accelerated',
    bio: 'Passionate about building production-grade autonomous agent swarms, vector retrieval engines, and deterministic LLM evaluation pipelines.'
  });

  const [isSavedRecently, setIsSavedRecently] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    updateProfile({
      name: formData.name,
      email: formData.email,
      avatar: formData.avatar,
      currentRole: formData.currentRole,
      educationLevel: formData.educationLevel,
      experienceLevel: formData.experienceLevel,
      learningPreferences: {
        ...(profile?.learningPreferences || {}),
        weeklyHours: Number(formData.weeklyHours),
        pace: formData.pace
      }
    });

    updateGoal({
      ...(goal || {}),
      targetRole: formData.targetRole
    });

    setIsSavedRecently(true);
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 }
    });

    setTimeout(() => setIsSavedRecently(false), 3000);
  };

  const handleExportData = () => {
    const exportPayload = {
      profile,
      goal,
      skills,
      exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hades_learner_profile_${Date.now()}.json`;
    a.click();
    recordProgressEvent("DATA_EXPORTED", { title: "Exported Learner History JSON" });
  };

  return (
    <div className="space-y-8 pb-16 max-w-5xl mx-auto">
      {/* 1. Header Profile Banner Card */}
      <div className="relative rounded-3xl bg-gradient-to-r from-indigo-900/90 via-indigo-950/80 to-slate-900 dark:from-indigo-950/80 dark:via-slate-900 dark:to-slate-900 border border-indigo-500/30 p-6 sm:p-8 shadow-2xl overflow-hidden text-white">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-cyan-500/15 to-transparent pointer-events-none" />
        
        <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* Avatar with Pro Halo */}
          <div className="relative group">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl overflow-hidden ring-4 ring-indigo-400/50 shadow-2xl bg-slate-800">
              <img
                src={formData.avatar}
                alt={formData.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-2 -right-2 p-2 rounded-xl bg-indigo-600 text-white shadow-lg border border-indigo-400/50">
              <Sparkles className="w-4 h-4 text-cyan-200" />
            </div>
          </div>

          {/* Profile Identity Info */}
          <div className="flex-1 text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1.5">
              <h1 className="text-2xl sm:text-3xl font-black text-white font-display">
                {formData.name}
              </h1>
              <Badge variant="cyan" size="sm">PRO LEARNER</Badge>
              <Badge variant="emerald" size="sm">
                <Flame className="w-3 h-3 text-amber-400" /> 14 Day Streak
              </Badge>
            </div>

            <p className="text-xs sm:text-sm text-cyan-300 font-semibold mb-2">
              {formData.currentRole} ➔ <span className="text-white font-bold">{formData.targetRole}</span>
            </p>
            <p className="text-xs text-slate-200 max-w-xl leading-relaxed">
              {formData.bio}
            </p>

            {/* Quick Meta Row */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mt-4 pt-4 border-t border-slate-700/60 text-xs text-slate-300">
              <span className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-indigo-300" /> {formData.email}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-cyan-300" /> {formData.weeklyHours} hrs/week
              </span>
              <span className="flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-amber-300" /> {roadmapProgressPercentage || 45}% Roadmap Mastered
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Profile Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800/80 pb-3 overflow-x-auto">
        {[
          { id: 'general', label: 'Personal Information', icon: User },
          { id: 'preferences', label: 'AI Learning Preferences', icon: Sliders },
          { id: 'achievements', label: 'Badges & Certificates', icon: Award },
          { id: 'account', label: 'Data & Account Security', icon: ShieldCheck }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
              activeTab === tab.id
                ? 'bg-indigo-600/20 text-indigo-700 dark:text-indigo-200 border border-indigo-400/50 shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900/60 border border-transparent'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* 3. Tab Contents */}

      {/* TAB 1: General Personal Info */}
      {activeTab === 'general' && (
        <form onSubmit={handleSaveProfile} className="space-y-6">
          <GlassCard className="p-6 sm:p-8 space-y-6">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
              <User className="w-4 h-4 text-indigo-600 dark:text-cyan-400" /> Basic Identity & Background
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Current Role</label>
                <input
                  type="text"
                  name="currentRole"
                  value={formData.currentRole}
                  onChange={handleChange}
                  className="w-full bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Target Engineering Role</label>
                <input
                  type="text"
                  name="targetRole"
                  value={formData.targetRole}
                  onChange={handleChange}
                  className="w-full bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Education / Standing</label>
                <select
                  name="educationLevel"
                  value={formData.educationLevel}
                  onChange={handleChange}
                  className="w-full bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 transition"
                >
                  <option value="High School">High School</option>
                  <option value="Undergraduate / Tech Enthusiast">Undergraduate / Tech Enthusiast</option>
                  <option value="Graduate / Master's">Graduate / Master's</option>
                  <option value="Professional Developer">Professional Developer</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Avatar Image URL</label>
                <input
                  type="text"
                  name="avatar"
                  value={formData.avatar}
                  onChange={handleChange}
                  className="w-full bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 transition font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Short Bio & Learning Goal</label>
              <textarea
                name="bio"
                rows="3"
                value={formData.bio}
                onChange={handleChange}
                className="w-full bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl p-4 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 transition"
              />
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
              {isSavedRecently ? (
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> Changes saved to HADES profile!
                </span>
              ) : <div />}

              <Button
                type="submit"
                variant="primary"
                size="md"
                icon={Save}
              >
                Save Profile Changes
              </Button>
            </div>
          </GlassCard>
        </form>
      )}

      {/* TAB 2: AI Learning Preferences */}
      {activeTab === 'preferences' && (
        <form onSubmit={handleSaveProfile} className="space-y-6">
          <GlassCard className="p-6 sm:p-8 space-y-6">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
              <Sliders className="w-4 h-4 text-indigo-600 dark:text-cyan-400" /> Curriculum Tuning & Study Cadence
            </h3>

            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Weekly Time Commitment</label>
                  <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded border border-indigo-200 dark:border-indigo-500/30">
                    {formData.weeklyHours} Hours / Week
                  </span>
                </div>
                <input
                  type="range"
                  min="4"
                  max="35"
                  step="1"
                  name="weeklyHours"
                  value={formData.weeklyHours}
                  onChange={handleChange}
                  className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
                <div className="flex justify-between text-[11px] text-slate-500 mt-1">
                  <span>Casual (4h)</span>
                  <span>Recommended (14h)</span>
                  <span>Full-Time Intensive (35h)</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">Learning Pace</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {['Moderate & Thorough', 'Accelerated', 'Deep-Dive Specialist'].map((paceOption) => (
                    <button
                      key={paceOption}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, pace: paceOption }))}
                      className={`p-3.5 rounded-2xl border text-left text-xs font-semibold transition ${
                        formData.pace === paceOption
                          ? 'bg-indigo-50 dark:bg-indigo-600/30 border-indigo-500 text-indigo-950 dark:text-white shadow-md'
                          : 'bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <div className="font-bold text-slate-900 dark:text-white mb-0.5">{paceOption}</div>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">
                        {paceOption === 'Accelerated' ? 'Prioritizes ranked YouTube sprints and labs' : 'Balanced theoretical foundations'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-200 dark:border-slate-800">
              <Button type="submit" variant="primary" size="md" icon={Save}>
                Update Learning Cadence
              </Button>
            </div>
          </GlassCard>
        </form>
      )}

      {/* TAB 3: Badges & Achievements */}
      {activeTab === 'achievements' && (
        <div className="space-y-6">
          <GlassCard className="p-6 sm:p-8">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 mb-6">
              <Award className="w-4 h-4 text-amber-500 dark:text-amber-400" /> Earned Milestones & Verified Badges
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                {
                  id: "b1",
                  title: "Vector Math Pioneer",
                  date: "Earned Aug 14, 2026",
                  desc: "Mastered high-dimensional cosine distance, dot products, and latent matrix transformations.",
                  icon: "📐",
                  verified: true
                },
                {
                  id: "b2",
                  title: "pgvector & HNSW Searcher",
                  date: "Earned Aug 18, 2026",
                  desc: "Built sub-10ms approximate nearest neighbor indexes in PostgreSQL.",
                  icon: "⚡",
                  verified: true
                },
                {
                  id: "b3",
                  title: "ReAct Agent Orchestrator",
                  date: "In Progress (60%)",
                  desc: "Cyclic reasoning loops, structured tool calling, and deterministic observation pipelines.",
                  icon: "🤖",
                  verified: false
                },
                {
                  id: "b4",
                  title: "Deterministic LLMOps Architect",
                  date: "Locked Milestone",
                  desc: "NeMo Guardrails security and automated Ragas evaluation suites.",
                  icon: "🛡️",
                  verified: false
                }
              ].map(badge => (
                <div
                  key={badge.id}
                  className={`p-4 rounded-2xl border flex items-start gap-4 transition ${
                    badge.verified
                      ? 'bg-slate-50 dark:bg-slate-900/80 border-indigo-200 dark:border-indigo-500/40 shadow-sm dark:shadow-lg'
                      : 'bg-slate-50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 opacity-60'
                  }`}
                >
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/90 border border-indigo-200 dark:border-indigo-500/30 flex items-center justify-center text-2xl flex-shrink-0">
                    {badge.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">{badge.title}</h4>
                      {badge.verified && (
                        <span className="text-[10px] text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-300 dark:border-emerald-500/30">
                          Verified
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1">{badge.desc}</p>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono mt-2 block">{badge.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      )}

      {/* TAB 4: Data & Account Security */}
      {activeTab === 'account' && (
        <GlassCard className="p-6 sm:p-8 space-y-6">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
            <ShieldCheck className="w-4 h-4 text-cyan-600 dark:text-cyan-400" /> Account Management & Data Portability
          </h3>

          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">Export Learning History</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Download your complete progress telemetry, active roadmap branches, and skill masteries in JSON.</p>
              </div>
              <Button variant="outline" size="sm" icon={Download} onClick={handleExportData}>
                Export JSON
              </Button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">Re-run Goal Onboarding Wizard</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Reset your target role, weekly commitments, or engineering background.</p>
              </div>
              <a href="/onboarding">
                <Button variant="secondary" size="sm" icon={RotateCcw}>
                  Launch Wizard
                </Button>
              </a>
            </div>
          </div>
        </GlassCard>
      )}
    </div>
  );
}
