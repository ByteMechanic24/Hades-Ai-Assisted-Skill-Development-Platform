import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLearner } from '../context/LearnerContext';
import { useAuth } from '../context/AuthContext';
import { Button, Badge, Eyebrow, ProgressRing } from '../components/ui';
import {
  User,
  Mail,
  Clock,
  Award,
  ShieldCheck,
  Flame,
  Save,
  CheckCircle2,
  Sliders,
  RotateCcw,
  Download,
  Lock,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { fadeUp, staggerContainer } from '../utils/motion';

const inputCls =
  'w-full bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition';

function FieldRow({ label, children }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">{label}</label>
      {children}
    </div>
  );
}

export function ProfilePage() {
  const { profile, updateProfile, goal, updateGoal, skills, milestones, roadmapProgressPercentage, recordProgressEvent, loadProfile, loadMilestones, mergeAuthUser } = useLearner();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState('general'); // 'general' | 'preferences' | 'achievements' | 'account'

  // Load real profile & milestones data on mount
  useEffect(() => {
    if (user) {
      mergeAuthUser(user);
    }
    loadProfile();
    loadMilestones();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Local form state
  const [formData, setFormData] = useState({
    name: profile?.name || 'Learner',
    email: profile?.email || '',
    currentRole: profile?.currentRole || 'Computer Science Learner',
    targetRole: goal?.targetRole || profile?.targetRole || 'Autonomous AI Systems Engineer',
    educationLevel: profile?.educationLevel || 'Undergraduate / Tech Enthusiast',
    experienceLevel: profile?.experienceLevel || 'Intermediate',
    weeklyHours: profile?.learningPreferences?.weeklyHours || 14,
    pace: profile?.learningPreferences?.pace || 'Accelerated',
    bio: 'Passionate about building production-grade autonomous agent swarms, vector retrieval engines, and deterministic LLM evaluation pipelines.',
  });

  // Sync form data when profile or goal updates from backend
  useEffect(() => {
    if (profile) {
      setFormData(prev => ({
        ...prev,
        name: profile.name || prev.name,
        email: profile.email || prev.email,
        currentRole: profile.currentRole || prev.currentRole,
        targetRole: goal?.targetRole || profile.targetRole || prev.targetRole,
        educationLevel: profile.educationLevel || prev.educationLevel,
        experienceLevel: profile.experienceLevel || prev.experienceLevel,
        weeklyHours: profile.learningPreferences?.weeklyHours || prev.weeklyHours,
        pace: profile.learningPreferences?.pace || prev.pace,
      }));
    }
  }, [profile, goal]);

  const [isSavedRecently, setIsSavedRecently] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    updateProfile({
      name: formData.name,
      email: formData.email,
      currentRole: formData.currentRole,
      educationLevel: formData.educationLevel,
      experienceLevel: formData.experienceLevel,
      learningPreferences: {
        ...(profile?.learningPreferences || {}),
        weeklyHours: Number(formData.weeklyHours),
        pace: formData.pace,
      },
    });

    updateGoal({
      ...(goal || {}),
      targetRole: formData.targetRole,
    });

    setIsSavedRecently(true);
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#6366f1', '#8b5cf6', '#10b981'],
    });

    setTimeout(() => setIsSavedRecently(false), 3000);
  };

  const handleExportData = () => {
    const exportPayload = {
      profile,
      goal,
      skills,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hades_learner_profile_${Date.now()}.json`;
    a.click();
    recordProgressEvent('DATA_EXPORTED', { title: 'Exported Learner History JSON' });
  };

  const tabs = [
    { id: 'general', label: 'Identity & Goal', icon: User },
    { id: 'preferences', label: 'Study Cadence', icon: Sliders },
    { id: 'achievements', label: 'Milestone Badges', icon: Award },
    { id: 'account', label: 'Data Management', icon: ShieldCheck },
  ];

  return (
    <motion.div variants={staggerContainer(0.07)} initial="hidden" animate="show" className="space-y-6 pb-16 max-w-5xl mx-auto">
      {/* ============================================== Identity Header */}
      <motion.div
        variants={fadeUp}
        className="relative overflow-hidden rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#121620] p-6 sm:p-8 shadow-card"
      >
        <div className="absolute inset-0 bg-grid opacity-25 pointer-events-none" />
        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-indigo-600 to-violet-600" />
        <div className="relative flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* Avatar glyph with initials */}
          <div className="relative shrink-0">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-white font-display text-2xl sm:text-3xl font-bold shadow-md border-2 border-white dark:border-slate-800">
              {formData.name?.split(' ').map(n => n[0]).join('') || 'AK'}
            </div>
            <span className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-lg bg-slate-900 dark:bg-white text-indigo-400 dark:text-indigo-600 flex items-center justify-center border-2 border-white dark:border-[#121620] shadow-sm">
              <Flame className="w-3.5 h-3.5 fill-current" />
            </span>
          </div>

          {/* Identity Info */}
          <div className="flex-1 text-center sm:text-left min-w-0">
            <Eyebrow variant="indigo" className="justify-center sm:justify-start">Learner Profile</Eyebrow>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 mt-2">
              <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                {formData.name}
              </h1>
              <Badge variant="indigo" size="sm">14-Day Streak</Badge>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-2 flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <span>{formData.currentRole}</span>
              <ArrowRight className="w-3.5 h-3.5 text-indigo-500" />
              <span className="font-bold text-slate-900 dark:text-white">{formData.targetRole}</span>
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xl leading-relaxed mt-2.5">{formData.bio}</p>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-5 gap-y-2 mt-4 pt-4 border-t border-slate-200 dark:border-white/[0.08] text-xs text-slate-500 dark:text-slate-400 font-medium">
              <span className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" /> {formData.email}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" /> {formData.weeklyHours} hrs/week
              </span>
              <span className="flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-slate-400" /> {roadmapProgressPercentage || 45}% path mastered
              </span>
            </div>
          </div>

          {/* Progress Ring */}
          <div className="hidden lg:block shrink-0">
            <ProgressRing value={roadmapProgressPercentage || 45} variant="emerald" size={76} stroke={6}>
              <span className="font-display text-base font-bold text-slate-900 dark:text-white tabular-nums">
                {roadmapProgressPercentage || 45}%
              </span>
            </ProgressRing>
          </div>
        </div>
      </motion.div>

      {/* ============================================== Tabs */}
      <motion.div variants={fadeUp} className="flex items-center gap-1 border-b border-slate-200 dark:border-white/[0.08] overflow-x-auto">
        {tabs.map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-bold whitespace-nowrap transition-colors ${
                active
                  ? 'text-indigo-600 dark:text-indigo-400'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <tab.icon className={`w-4 h-4 ${active ? 'text-indigo-600 dark:text-indigo-400' : ''}`} />
              <span>{tab.label}</span>
              {active && <span className="absolute inset-x-2 -bottom-px h-0.5 bg-indigo-600 rounded-full" />}
            </button>
          );
        })}
      </motion.div>

      {/* ============================================== TAB: General Identity */}
      {activeTab === 'general' && (
        <motion.form variants={fadeUp} onSubmit={handleSaveProfile}>
          <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#121620] p-6 sm:p-8 space-y-6 shadow-card">
            <div className="pb-4 border-b border-slate-200 dark:border-white/[0.08]">
              <Eyebrow icon={User} variant="indigo">Learner Identity &amp; Profile Metadata</Eyebrow>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <FieldRow label="Full Name">
                <input type="text" name="name" value={formData.name} onChange={handleChange} className={inputCls} />
              </FieldRow>
              <FieldRow label="Email Address">
                <input type="email" name="email" value={formData.email} onChange={handleChange} className={inputCls} />
              </FieldRow>
              <FieldRow label="Current Background / Role">
                <input type="text" name="currentRole" value={formData.currentRole} onChange={handleChange} className={inputCls} />
              </FieldRow>
              <FieldRow label="Target Career Specialization">
                <input type="text" name="targetRole" value={formData.targetRole} onChange={handleChange} className={inputCls} />
              </FieldRow>
              <FieldRow label="Education Level">
                <select name="educationLevel" value={formData.educationLevel} onChange={handleChange} className={inputCls}>
                  <option value="High School">High School</option>
                  <option value="Undergraduate / Tech Enthusiast">Undergraduate / Tech Enthusiast</option>
                  <option value="Graduate / Master's">Graduate / Master&apos;s</option>
                  <option value="Professional Developer">Professional Developer</option>
                </select>
              </FieldRow>
              <FieldRow label="Experience Baseline">
                <select name="experienceLevel" value={formData.experienceLevel} onChange={handleChange} className={inputCls}>
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </FieldRow>
            </div>

            <FieldRow label="Bio &amp; Specific Focus Objectives">
              <textarea name="bio" rows="3" value={formData.bio} onChange={handleChange} className={`${inputCls} leading-relaxed`} />
            </FieldRow>

            <div className="flex items-center justify-between gap-4 pt-5 border-t border-slate-200 dark:border-white/[0.08]">
              {isSavedRecently ? (
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> Preferences saved and synchronized
                </span>
              ) : (
                <div />
              )}
              <Button type="submit" variant="primary" size="md" icon={Save}>
                Save Profile Changes
              </Button>
            </div>
          </div>
        </motion.form>
      )}

      {/* ============================================== TAB: Cadence */}
      {activeTab === 'preferences' && (
        <motion.form variants={fadeUp} onSubmit={handleSaveProfile}>
          <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#121620] p-6 sm:p-8 space-y-7 shadow-card">
            <div className="pb-4 border-b border-slate-200 dark:border-white/[0.08]">
              <Eyebrow icon={Sliders} variant="indigo">Curriculum Tuning &amp; Study Cadence</Eyebrow>
            </div>

            <div>
              <div className="flex justify-between items-center mb-3">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Weekly Time Commitment</label>
                <span className="mono-label text-indigo-600 dark:text-indigo-400 font-bold">{formData.weeklyHours} hrs / week</span>
              </div>
              <input
                type="range"
                min="4"
                max="35"
                step="1"
                name="weeklyHours"
                value={formData.weeklyHours}
                onChange={handleChange}
                className="w-full h-2 bg-slate-200 dark:bg-white/[0.08] rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <div className="flex justify-between mono-label text-[9px] text-slate-400 dark:text-slate-500 mt-2 font-medium">
                <span>Part-Time · 4h</span>
                <span>Standard · 14h</span>
                <span>Intensive · 35h</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2.5">Learning Pace Profile</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {['Moderate & Thorough', 'Accelerated', 'Deep-Dive Specialist'].map((paceOption) => {
                  const selected = formData.pace === paceOption;
                  return (
                    <button
                      key={paceOption}
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, pace: paceOption }))}
                      className={`p-4 rounded-xl border text-left transition-all ${
                        selected
                          ? 'bg-indigo-500/[0.08] border-indigo-500/50 ring-1 ring-indigo-500/30 shadow-sm'
                          : 'bg-slate-50 dark:bg-white/[0.02] border-slate-200 dark:border-white/[0.08] hover:border-indigo-500/30'
                      }`}
                    >
                      <div className="text-sm font-bold text-slate-900 dark:text-white mb-1">{paceOption}</div>
                      <span className="text-xs text-slate-500 dark:text-slate-400 leading-snug block">
                        {paceOption === 'Accelerated' ? 'Prioritizes coding labs & fast project builds' : 'Comprehensive theoretical foundations'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end pt-5 border-t border-slate-200 dark:border-white/[0.08]">
              <Button type="submit" variant="primary" size="md" icon={Save}>
                Update Cadence
              </Button>
            </div>
          </div>
        </motion.form>
      )}

      {/* ============================================== TAB: Milestones */}
      {activeTab === 'achievements' && (
        <motion.div variants={fadeUp}>
          <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#121620] p-6 sm:p-8 shadow-card">
            <div className="pb-4 mb-6 border-b border-slate-200 dark:border-white/[0.08]">
              <Eyebrow icon={Award} variant="emerald">Earned Milestone Credentials &amp; Badges</Eyebrow>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {milestones.length === 0 ? (
                <p className="text-xs text-slate-500 dark:text-slate-400 py-4 col-span-2 text-center">
                  Milestones unlock as you progress through verified roadmap stages.
                </p>
              ) : (
                milestones.map((ms) => {
                  const isDone = ms.status === 'completed';
                  return (
                    <div
                      key={ms.id}
                      className={`p-5 rounded-2xl border flex items-start gap-4 transition-all ${
                        isDone
                          ? 'bg-white dark:bg-white/[0.02] border-slate-200 dark:border-white/10 shadow-subtle'
                          : 'bg-slate-50 dark:bg-white/[0.01] border-slate-200 dark:border-white/[0.06] opacity-75'
                      }`}
                    >
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                          isDone
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                            : 'bg-slate-100 dark:bg-white/[0.03] border-slate-200 dark:border-white/10 text-slate-400 dark:text-slate-500'
                        }`}
                      >
                        {isDone ? <Award className="w-5 h-5" /> : <Lock className="w-4 h-4" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white">{ms.title}</h4>
                          <Badge variant={isDone ? 'emerald' : ms.status === 'in_progress' ? 'violet' : 'default'} size="sm">
                            {isDone ? 'Verified' : ms.status === 'in_progress' ? 'In Progress' : 'Locked'}
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                          {ms.skillsEarned?.join(', ') || ms.phase}
                        </p>
                        <span className="mono-label text-[9px] text-slate-400 dark:text-slate-500 mt-2.5 block font-medium">
                          {ms.completionDate || ms.targetDate || ms.phase}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* ============================================== TAB: Account Data */}
      {activeTab === 'account' && (
        <motion.div variants={fadeUp}>
          <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#121620] p-6 sm:p-8 space-y-5 shadow-card">
            <div className="pb-4 border-b border-slate-200 dark:border-white/[0.08]">
              <Eyebrow icon={ShieldCheck} variant="indigo">Account Settings &amp; Data Portability</Eyebrow>
            </div>

            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Export Learning Telemetry</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-lg leading-relaxed">
                    Download your complete progress telemetry, active roadmap graph, and skill mastery logs as clean JSON.
                  </p>
                </div>
                <Button variant="secondary" size="sm" icon={Download} onClick={handleExportData} className="shrink-0">
                  Export JSON
                </Button>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Re-run Goal &amp; Career Wizard</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-lg leading-relaxed">
                    Update your primary career goal, target weekly hours, or technical interests. The engine will regenerate your roadmap.
                  </p>
                </div>
                <a href="/onboarding" className="shrink-0">
                  <Button variant="secondary" size="sm" icon={RotateCcw}>
                    Launch Onboarding
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
