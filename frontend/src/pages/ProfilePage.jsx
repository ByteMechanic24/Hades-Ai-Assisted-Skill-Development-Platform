import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useLearner } from '../context/LearnerContext';
import { Button, GlassCard, Badge, Eyebrow, ProgressRing } from '../components/ui';
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
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { fadeUp, staggerContainer } from '../utils/motion';

const inputCls =
  'w-full bg-stone-50 dark:bg-white/[0.03] border border-stone-200 dark:border-white/10 rounded-lg px-3.5 py-2.5 text-sm text-stone-900 dark:text-white placeholder-stone-400 dark:placeholder-stone-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/40 transition';

function FieldRow({ label, children }) {
  return (
    <div>
      <label className="block text-xs font-medium text-stone-600 dark:text-stone-400 mb-1.5">{label}</label>
      {children}
    </div>
  );
}

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
    bio: 'Passionate about building production-grade autonomous agent swarms, vector retrieval engines, and deterministic LLM evaluation pipelines.',
  });

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
      avatar: formData.avatar,
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
      colors: ['#f59e0b', '#fbbf24', '#fcd34d'],
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
    { id: 'general', label: 'Identity', icon: User },
    { id: 'preferences', label: 'Cadence', icon: Sliders },
    { id: 'achievements', label: 'Milestones', icon: Award },
    { id: 'account', label: 'Data', icon: ShieldCheck },
  ];

  const badges = [
    {
      id: 'b1',
      title: 'Vector Math Pioneer',
      date: 'Earned Aug 14, 2026',
      desc: 'Mastered high-dimensional cosine distance, dot products, and latent matrix transformations.',
      verified: true,
    },
    {
      id: 'b2',
      title: 'pgvector & HNSW Searcher',
      date: 'Earned Aug 18, 2026',
      desc: 'Built sub-10ms approximate nearest neighbor indexes in PostgreSQL.',
      verified: true,
    },
    {
      id: 'b3',
      title: 'ReAct Agent Orchestrator',
      date: 'In progress · 60%',
      desc: 'Cyclic reasoning loops, structured tool calling, and deterministic observation pipelines.',
      verified: false,
    },
    {
      id: 'b4',
      title: 'Deterministic LLMOps Architect',
      date: 'Locked milestone',
      desc: 'Guardrail security and automated evaluation suites.',
      verified: false,
    },
  ];

  return (
    <motion.div variants={staggerContainer(0.07)} initial="hidden" animate="show" className="space-y-6 pb-16 max-w-5xl mx-auto">
      {/* ============================================== Identity header */}
      <motion.div
        variants={fadeUp}
        className="relative overflow-hidden rounded-2xl border border-stone-200 dark:border-white/[0.08] bg-white/90 dark:bg-[#121214]/80 backdrop-blur-md"
      >
        <div className="absolute inset-0 bg-grid opacity-[0.5] dark:opacity-100 pointer-events-none" />
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500" />
        <div className="relative p-6 sm:p-8 flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* Avatar */}
          <div className="relative shrink-0">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden border border-stone-200 dark:border-white/10 bg-stone-100 dark:bg-white/[0.04]">
              <img src={formData.avatar} alt={formData.name} className="w-full h-full object-cover" />
            </div>
            <span className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-lg bg-amber-500 flex items-center justify-center border-2 border-white dark:border-[#121214]">
              <Flame className="w-3.5 h-3.5 text-stone-950" />
            </span>
          </div>

          {/* Identity */}
          <div className="flex-1 text-center sm:text-left min-w-0">
            <Eyebrow className="justify-center sm:justify-start">Learner profile</Eyebrow>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 mt-2">
              <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 dark:text-white">
                {formData.name}
              </h1>
              <Badge variant="primary" size="sm">14-day streak</Badge>
            </div>

            <p className="text-sm text-stone-600 dark:text-stone-400 mt-2 flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <span>{formData.currentRole}</span>
              <ArrowRight className="w-3.5 h-3.5 text-amber-500" />
              <span className="font-semibold text-stone-900 dark:text-white">{formData.targetRole}</span>
            </p>
            <p className="text-xs text-stone-500 dark:text-stone-400 max-w-xl leading-relaxed mt-2.5">{formData.bio}</p>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-5 gap-y-2 mt-4 pt-4 border-t border-stone-200 dark:border-white/[0.08] text-xs text-stone-500 dark:text-stone-400">
              <span className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-stone-400" /> {formData.email}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-stone-400" /> {formData.weeklyHours} hrs/week
              </span>
              <span className="flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-stone-400" /> {roadmapProgressPercentage || 45}% path mastered
              </span>
            </div>
          </div>

          {/* Ring */}
          <div className="hidden lg:block shrink-0">
            <ProgressRing value={roadmapProgressPercentage || 45} size={76} stroke={6}>
              <span className="font-display text-base font-bold text-stone-900 dark:text-white tabular-nums">
                {roadmapProgressPercentage || 45}%
              </span>
            </ProgressRing>
          </div>
        </div>
      </motion.div>

      {/* ============================================== Tabs */}
      <motion.div variants={fadeUp} className="flex items-center gap-1 border-b border-stone-200 dark:border-white/[0.08] overflow-x-auto">
        {tabs.map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
                active
                  ? 'text-stone-900 dark:text-white'
                  : 'text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
              }`}
            >
              <tab.icon className={`w-4 h-4 ${active ? 'text-amber-500' : ''}`} />
              <span>{tab.label}</span>
              {active && <span className="absolute inset-x-2 -bottom-px h-0.5 bg-amber-500 rounded-full" />}
            </button>
          );
        })}
      </motion.div>

      {/* ============================================== TAB: Identity */}
      {activeTab === 'general' && (
        <motion.form variants={fadeUp} onSubmit={handleSaveProfile}>
          <GlassCard hoverEffect={false} className="p-6 sm:p-8 space-y-6">
            <div className="pb-4 border-b border-stone-200 dark:border-white/[0.08]">
              <Eyebrow icon={User}>Basic identity &amp; background</Eyebrow>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <FieldRow label="Full name">
                <input type="text" name="name" value={formData.name} onChange={handleChange} className={inputCls} />
              </FieldRow>
              <FieldRow label="Email address">
                <input type="email" name="email" value={formData.email} onChange={handleChange} className={inputCls} />
              </FieldRow>
              <FieldRow label="Current role">
                <input type="text" name="currentRole" value={formData.currentRole} onChange={handleChange} className={inputCls} />
              </FieldRow>
              <FieldRow label="Target engineering role">
                <input type="text" name="targetRole" value={formData.targetRole} onChange={handleChange} className={inputCls} />
              </FieldRow>
              <FieldRow label="Education / standing">
                <select name="educationLevel" value={formData.educationLevel} onChange={handleChange} className={inputCls}>
                  <option value="High School">High School</option>
                  <option value="Undergraduate / Tech Enthusiast">Undergraduate / Tech Enthusiast</option>
                  <option value="Graduate / Master's">Graduate / Master&apos;s</option>
                  <option value="Professional Developer">Professional Developer</option>
                </select>
              </FieldRow>
              <FieldRow label="Avatar image URL">
                <input
                  type="text"
                  name="avatar"
                  value={formData.avatar}
                  onChange={handleChange}
                  className={`${inputCls} font-mono text-xs`}
                />
              </FieldRow>
            </div>

            <FieldRow label="Short bio & learning goal">
              <textarea name="bio" rows="3" value={formData.bio} onChange={handleChange} className={`${inputCls} leading-relaxed`} />
            </FieldRow>

            <div className="flex items-center justify-between gap-4 pt-5 border-t border-stone-200 dark:border-white/[0.08]">
              {isSavedRecently ? (
                <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> Saved to your HADES profile
                </span>
              ) : (
                <div />
              )}
              <Button type="submit" variant="primary" size="md" icon={Save}>
                Save changes
              </Button>
            </div>
          </GlassCard>
        </motion.form>
      )}

      {/* ============================================== TAB: Cadence */}
      {activeTab === 'preferences' && (
        <motion.form variants={fadeUp} onSubmit={handleSaveProfile}>
          <GlassCard hoverEffect={false} className="p-6 sm:p-8 space-y-7">
            <div className="pb-4 border-b border-stone-200 dark:border-white/[0.08]">
              <Eyebrow icon={Sliders}>Curriculum tuning &amp; study cadence</Eyebrow>
            </div>

            <div>
              <div className="flex justify-between items-center mb-3">
                <label className="text-xs font-medium text-stone-600 dark:text-stone-300">Weekly time commitment</label>
                <span className="mono-label text-amber-600 dark:text-amber-400">{formData.weeklyHours} hrs / week</span>
              </div>
              <input
                type="range"
                min="4"
                max="35"
                step="1"
                name="weeklyHours"
                value={formData.weeklyHours}
                onChange={handleChange}
                className="w-full h-1.5 bg-stone-200 dark:bg-white/[0.08] rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
              <div className="flex justify-between mono-label text-[9px] text-stone-400 dark:text-stone-500 mt-2">
                <span>Casual · 4h</span>
                <span>Recommended · 14h</span>
                <span>Intensive · 35h</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-600 dark:text-stone-300 mb-2.5">Learning pace</label>
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
                          ? 'bg-amber-500/[0.06] border-amber-500/50 ring-1 ring-amber-500/30'
                          : 'bg-stone-50 dark:bg-white/[0.02] border-stone-200 dark:border-white/[0.08] hover:border-amber-500/30'
                      }`}
                    >
                      <div className="text-sm font-semibold text-stone-900 dark:text-white mb-1">{paceOption}</div>
                      <span className="text-[11px] text-stone-500 dark:text-stone-400 leading-snug block">
                        {paceOption === 'Accelerated' ? 'Prioritizes ranked video sprints and labs' : 'Balanced theoretical foundations'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end pt-5 border-t border-stone-200 dark:border-white/[0.08]">
              <Button type="submit" variant="primary" size="md" icon={Save}>
                Update cadence
              </Button>
            </div>
          </GlassCard>
        </motion.form>
      )}

      {/* ============================================== TAB: Milestones */}
      {activeTab === 'achievements' && (
        <motion.div variants={fadeUp}>
          <GlassCard hoverEffect={false} className="p-6 sm:p-8">
            <div className="pb-4 mb-6 border-b border-stone-200 dark:border-white/[0.08]">
              <Eyebrow icon={Award}>Earned milestones &amp; verified badges</Eyebrow>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {badges.map((badge) => (
                <div
                  key={badge.id}
                  className={`p-4 rounded-xl border flex items-start gap-4 transition ${
                    badge.verified
                      ? 'bg-white dark:bg-white/[0.02] border-stone-200 dark:border-white/[0.08]'
                      : 'bg-stone-50 dark:bg-white/[0.01] border-stone-200 dark:border-white/[0.06] opacity-65'
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border ${
                      badge.verified
                        ? 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400'
                        : 'bg-stone-100 dark:bg-white/[0.03] border-stone-200 dark:border-white/10 text-stone-400 dark:text-stone-500'
                    }`}
                  >
                    {badge.verified ? <Award className="w-5 h-5" /> : <Lock className="w-4 h-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-sm font-semibold text-stone-900 dark:text-white">{badge.title}</h4>
                      {badge.verified && (
                        <Badge variant="emerald" size="sm">Verified</Badge>
                      )}
                    </div>
                    <p className="text-xs text-stone-500 dark:text-stone-400 mt-1.5 leading-relaxed">{badge.desc}</p>
                    <span className="mono-label text-[9px] text-stone-400 dark:text-stone-500 mt-2.5 block">{badge.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </motion.div>
      )}

      {/* ============================================== TAB: Data */}
      {activeTab === 'account' && (
        <motion.div variants={fadeUp}>
          <GlassCard hoverEffect={false} className="p-6 sm:p-8 space-y-5">
            <div className="pb-4 border-b border-stone-200 dark:border-white/[0.08]">
              <Eyebrow icon={ShieldCheck}>Account management &amp; data portability</Eyebrow>
            </div>

            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-stone-50 dark:bg-white/[0.02] border border-stone-200 dark:border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-semibold text-stone-900 dark:text-white">Export learning history</h4>
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 max-w-lg leading-relaxed">
                    Download your complete progress telemetry, active roadmap branches, and skill masteries as JSON.
                  </p>
                </div>
                <Button variant="secondary" size="sm" icon={Download} onClick={handleExportData} className="shrink-0">
                  Export JSON
                </Button>
              </div>

              <div className="p-4 rounded-xl bg-stone-50 dark:bg-white/[0.02] border border-stone-200 dark:border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-semibold text-stone-900 dark:text-white">Re-run the goal wizard</h4>
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 max-w-lg leading-relaxed">
                    Reset your target role, weekly commitment, or engineering background — the graph rebuilds around it.
                  </p>
                </div>
                <a href="/onboarding" className="shrink-0">
                  <Button variant="secondary" size="sm" icon={RotateCcw}>
                    Launch wizard
                  </Button>
                </a>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      )}
    </motion.div>
  );
}
