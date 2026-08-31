import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useLearner } from '../context/LearnerContext';
import { Button, Badge, Eyebrow, EmptyState, ProgressRing } from '../components/ui';
import { RoadmapCanvas } from '../components/roadmap/RoadmapCanvas';
import {
  GitBranch,
  CheckCircle2,
  Play,
  Sparkles,
  Clock,
  RefreshCw,
  Bookmark,
  Star,
  Search,
  Layers,
  SearchX,
  BookOpen,
  Video,
  FileCode,
  Compass
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { fadeUp, staggerContainer } from '../utils/motion';

export function LearningPathPage() {
  const { path, goal, roadmap, roadmapProgressPercentage, resources, toggleSaveResource, updateResourceProgress, recordProgressEvent, loadResources, loadActiveLearningPath } = useLearner();
  const [activeViewTab, setActiveViewTab] = useState('roadmap_tree'); // 'roadmap_tree' | 'catalog'

  const [filterFormat, setFilterFormat] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [recalcNote, setRecalcNote] = useState('');

  React.useEffect(() => {
    loadResources();
    loadActiveLearningPath();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const filteredResources = (resources || []).filter((res) => {
    const matchesFormat = filterFormat === 'all' || res.format === filterFormat || (filterFormat === 'saved' && res.isSaved);
    const matchesQuery =
      (res.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.skillsCovered?.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesFormat && matchesQuery;
  });

  const handleCompleteResource = (resourceId) => {
    updateResourceProgress(resourceId, 100);
    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981'],
    });
  };

  const handleTriggerAdaptiveRecalculation = () => {
    recordProgressEvent('MANUAL_PATH_RECALCULATION', { title: 'Requested AI Graph Re-evaluation' });
    setRecalcNote('Path re-weighted against your latest progress metrics.');
    setTimeout(() => setRecalcNote(''), 4000);
  };

  const views = [
    { id: 'roadmap_tree', label: 'Roadmap Tree', icon: GitBranch, color: 'violet' },
    { id: 'catalog', label: 'Resource Catalog', icon: Layers, color: 'violet' },
  ];

  const filters = [
    { id: 'all', label: 'All Formats', color: 'violet' },
    { id: 'interactive', label: 'Interactive Labs', color: 'violet' },
    { id: 'video', label: 'Video Deep-Dives', color: 'violet' },
    { id: 'article', label: 'Technical Articles', color: 'violet' },
    { id: 'saved', label: 'Saved Bookmarks', color: 'violet' },
  ];

  const getFormatBadge = (format) => {
    switch (format) {
      case 'interactive':
      case 'lab':
        return { icon: FileCode, variant: 'violet', label: 'Lab Sandbox' };
      case 'video':
        return { icon: Video, variant: 'violet', label: 'Video Deep-Dive' };
      default:
        return { icon: BookOpen, variant: 'violet', label: 'Technical Article' };
    }
  };

  return (
    <motion.div variants={staggerContainer(0.07)} initial="hidden" animate="show" className="space-y-6 pb-16">
      {/* ================================================== Path Header (Violet Journey World) */}
      <motion.div
        variants={fadeUp}
        className="relative overflow-hidden rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#121620] p-6 sm:p-8 shadow-card"
      >
        <div className="absolute inset-0 bg-grid opacity-25 pointer-events-none" />
        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-violet-600 to-indigo-600" />
        <div className="relative">
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
            <div className="min-w-0">
              <Eyebrow icon={GitBranch} variant="violet" className="mb-3">Adaptive Prerequisite Journey</Eyebrow>
              <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white leading-tight">
                {goal?.title || 'Personalized AI Engineer Roadmap'}
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-2xl mt-2 leading-relaxed">
                Targeting <strong className="text-slate-900 dark:text-white font-bold">{goal?.targetRole || 'Autonomous AI Systems Engineer'}</strong>.
                Click any stage node to inspect ranked video deep-dives, code sandboxes, and practice exercises.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <Button variant="secondary" size="sm" icon={RefreshCw} onClick={handleTriggerAdaptiveRecalculation}>
                Re-weight Path
              </Button>
              <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10">
                {views.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setActiveViewTab(v.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${activeViewTab === v.id
                        ? 'bg-white dark:bg-white/10 text-violet-600 dark:text-violet-400 shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                  >
                    <v.icon className="w-3.5 h-3.5" />
                    {v.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Progress Strip */}
          <div className="mt-8 pt-6 border-t border-slate-200 dark:border-white/[0.08] flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <ProgressRing value={roadmapProgressPercentage} variant="violet" size={64} stroke={6}>
              <span className="font-display text-sm font-bold text-slate-900 dark:text-white tabular-nums">
                {roadmapProgressPercentage}%
              </span>
            </ProgressRing>
            <div className="flex-1 w-full">
              <div className="flex justify-between items-baseline mb-2">
                <span className="mono-label text-slate-500 dark:text-slate-400 font-medium text-[10px]">Roadmap Completion</span>
                <span className="mono-label text-slate-500 dark:text-slate-400 font-medium text-[10px]">
                  {roadmap?.mainNodes?.length || 4} Core Stages Active
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-white/[0.08] overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-violet-600 to-indigo-500 transition-[width] duration-700 ease-out"
                  style={{ width: `${roadmapProgressPercentage}%` }}
                />
              </div>
              {recalcNote && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2 text-xs text-violet-600 dark:text-violet-400 flex items-center gap-1.5 font-bold"
                >
                  <Sparkles className="w-3.5 h-3.5" /> {recalcNote}
                </motion.p>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* ================================================== VIEW 1: Roadmap Tree */}
      {activeViewTab === 'roadmap_tree' && (
        <motion.div variants={fadeUp}>
          <RoadmapCanvas />
        </motion.div>
      )}

      {/* ================================================== VIEW 2: Resource Catalog (Violet World) */}
      {activeViewTab === 'catalog' && (
        <motion.div variants={fadeUp} className="space-y-6">
          {/* Toolbar */}
          <div className="p-4 rounded-2xl bg-white dark:bg-[#121620] border border-slate-200 dark:border-white/10 shadow-subtle flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center">
            <div className="relative w-full sm:max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search ranked resources (e.g. vector search, ReAct, agents)..."
                className="w-full bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition"
              />
            </div>

            <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 overflow-x-auto">
              {filters.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setFilterFormat(tab.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${filterFormat === tab.id
                      ? 'bg-white dark:bg-white/10 text-violet-600 dark:text-violet-400 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Results Grid */}
          {filteredResources.length === 0 ? (
            <div className="p-8 rounded-2xl bg-white dark:bg-[#121620] border border-slate-200 dark:border-white/10 shadow-card">
              <EmptyState
                icon={SearchX}
                title="No Matching Resources Found"
                description="Try clearing your search query or switching to the Roadmap Tree to explore queued nodes."
                action={
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setSearchQuery('');
                      setFilterFormat('all');
                    }}
                  >
                    Reset Filters
                  </Button>
                }
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filteredResources.map((res) => {
                const badgeInfo = getFormatBadge(res.format);
                const FormatIcon = badgeInfo.icon;

                return (
                  <div key={res.id} className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#121620] p-6 shadow-card hover:border-violet-500/40 hover:shadow-elev transition-all flex flex-col justify-between group">
                    <div>
                      {/* Meta row */}
                      <div className="flex items-start justify-between gap-2 mb-4">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant={badgeInfo.variant} size="sm">
                            <FormatIcon className="w-3.5 h-3.5" />
                            {badgeInfo.label}
                          </Badge>
                          <span className="mono-label text-slate-500 dark:text-slate-400 font-medium text-[10px]">{res.provider}</span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="mono-label text-[10px] text-violet-700 dark:text-violet-300 bg-violet-500/10 border border-violet-500/25 px-2.5 py-0.5 rounded-md font-bold">
                            {res.matchScore}% Match
                          </span>
                          <button
                            onClick={() => toggleSaveResource(res.id)}
                            aria-label={res.isSaved ? 'Unsave resource' : 'Save resource'}
                            className={`p-1.5 rounded-lg border transition ${res.isSaved
                                ? 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-500/40'
                                : 'bg-slate-50 dark:bg-white/[0.03] border-slate-200 dark:border-white/10 text-slate-400 hover:text-slate-900 dark:hover:text-white'
                              }`}
                          >
                            <Bookmark className={`w-4 h-4 ${res.isSaved ? 'fill-current' : ''}`} />
                          </button>
                        </div>
                      </div>

                      {/* Title + format */}
                      <div className="mb-4">
                        <h3 className="font-display text-base font-bold text-slate-900 dark:text-white leading-snug line-clamp-2 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                          {res.title}
                        </h3>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-slate-500 dark:text-slate-400">
                          <span className="flex items-center gap-1 text-indigo-500 font-bold">
                            <Star className="w-3.5 h-3.5 fill-current" /> {res.rating}
                          </span>
                          <span className="flex items-center gap-1 font-medium">
                            <Clock className="w-3.5 h-3.5" /> {res.duration}
                          </span>
                          <span className="mono-label text-slate-500 dark:text-slate-400 text-[10px]">{res.difficulty}</span>
                        </div>
                      </div>

                      {/* Why recommended AI insight */}
                      <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/[0.02] border-l-2 border-violet-500 mb-4">
                        <span className="mono-label text-violet-600 dark:text-violet-400 font-bold block mb-1 text-[10px]">
                          Why this matches your graph
                        </span>
                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{res.whyRecommended}</p>
                      </div>

                      {/* Skills covered */}
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {res.skillsCovered?.map((sk) => (
                          <span
                            key={sk}
                            className="mono-label text-[9px] px-2 py-0.5 rounded-md border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 font-medium"
                          >
                            {sk}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Action footer */}
                    <div className="pt-4 border-t border-slate-200 dark:border-white/[0.08] flex items-center justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        {res.progress > 0 && res.progress < 100 && (
                          <div className="space-y-1">
                            <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-white/[0.08] overflow-hidden max-w-[120px]">
                              <div className="h-full rounded-full bg-violet-500" style={{ width: `${res.progress}%` }} />
                            </div>
                            <span className="mono-label text-slate-400 dark:text-slate-500 text-[10px] font-medium">{res.progress}% Completed</span>
                          </div>
                        )}
                      </div>
                      {res.progress < 100 ? (
                        <Button
                          variant="violet"
                          size="sm"
                          icon={Play}
                          onClick={() => handleCompleteResource(res.id)}
                          className="shrink-0"
                        >
                          Launch Material
                        </Button>
                      ) : (
                        <Badge variant="emerald" size="md">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Completed
                        </Badge>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}
