import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useLearner } from '../context/LearnerContext';
import { Button, GlassCard, Badge, Eyebrow, EmptyState, ProgressRing } from '../components/ui';
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
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { fadeUp, staggerContainer } from '../utils/motion';

export function LearningPathPage() {
  const { path, goal, roadmap, roadmapProgressPercentage, resources, toggleSaveResource, updateResourceProgress, recordProgressEvent } = useLearner();
  const [activeViewTab, setActiveViewTab] = useState('roadmap_tree'); // 'roadmap_tree' | 'catalog'

  const [filterFormat, setFilterFormat] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [recalcNote, setRecalcNote] = useState('');

  const filteredResources = resources.filter((res) => {
    const matchesFormat = filterFormat === 'all' || res.format === filterFormat || (filterFormat === 'saved' && res.isSaved);
    const matchesQuery =
      res.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.skillsCovered?.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesFormat && matchesQuery;
  });

  const handleCompleteResource = (resourceId) => {
    updateResourceProgress(resourceId, 100);
    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#f59e0b', '#fbbf24', '#fcd34d'],
    });
  };

  const handleTriggerAdaptiveRecalculation = () => {
    recordProgressEvent('MANUAL_PATH_RECALCULATION', { title: 'Requested AI Graph Re-evaluation' });
    setRecalcNote('Path re-weighted against your latest progress metrics.');
    setTimeout(() => setRecalcNote(''), 4000);
  };

  const views = [
    { id: 'roadmap_tree', label: 'Roadmap', icon: GitBranch },
    { id: 'catalog', label: 'Resources', icon: Layers },
  ];

  const filters = [
    { id: 'all', label: 'All' },
    { id: 'interactive', label: 'Labs' },
    { id: 'video', label: 'Video' },
    { id: 'article', label: 'Articles' },
    { id: 'saved', label: 'Saved' },
  ];

  return (
    <motion.div variants={staggerContainer(0.07)} initial="hidden" animate="show" className="space-y-6 pb-16">
      {/* ================================================== Path header */}
      <motion.div
        variants={fadeUp}
        className="relative overflow-hidden rounded-2xl border border-stone-200 dark:border-white/[0.08] bg-white/90 dark:bg-[#121214]/80 backdrop-blur-md"
      >
        <div className="absolute inset-0 bg-grid opacity-[0.5] dark:opacity-100 pointer-events-none" />
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500" />
        <div className="relative p-6 sm:p-8">
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
            <div className="min-w-0">
              <Eyebrow icon={GitBranch} className="mb-3">The Build · Your adaptive roadmap</Eyebrow>
              <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 dark:text-white leading-tight">
                {goal?.title || 'Personalized AI Engineer Roadmap'}
              </h1>
              <p className="text-sm text-stone-600 dark:text-stone-400 max-w-2xl mt-2.5 leading-relaxed">
                Building toward <strong className="text-stone-900 dark:text-white font-semibold">{goal?.targetRole || 'AI Systems Engineer'}</strong>.
                Hover a node to mark it <span className="text-stone-900 dark:text-white font-medium">Learning</span>,{' '}
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">Done</span>, or{' '}
                <span className="text-stone-500 dark:text-stone-400 font-medium">Skip</span> — click it to open ranked videos and materials.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <Button variant="secondary" size="sm" icon={RefreshCw} onClick={handleTriggerAdaptiveRecalculation}>
                Re-weight path
              </Button>
              <div className="flex items-center gap-1 p-1 rounded-lg bg-stone-100 dark:bg-white/[0.04] border border-stone-200 dark:border-white/10">
                {views.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setActiveViewTab(v.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition ${
                      activeViewTab === v.id
                        ? 'bg-white dark:bg-white/10 text-stone-900 dark:text-white shadow-sm'
                        : 'text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
                    }`}
                  >
                    <v.icon className="w-3.5 h-3.5" />
                    {v.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Progress strip */}
          <div className="mt-7 pt-5 border-t border-stone-200 dark:border-white/[0.08] flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <ProgressRing value={roadmapProgressPercentage} size={64} stroke={6}>
              <span className="font-display text-sm font-bold text-stone-900 dark:text-white tabular-nums">
                {roadmapProgressPercentage}%
              </span>
            </ProgressRing>
            <div className="flex-1 w-full">
              <div className="flex justify-between items-baseline mb-2">
                <span className="mono-label text-stone-400 dark:text-stone-500">Roadmap completion</span>
                <span className="mono-label text-stone-400 dark:text-stone-500">
                  {roadmap?.mainNodes?.length || 4} stages active
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-stone-200 dark:bg-white/[0.08] overflow-hidden">
                <div
                  className="h-full rounded-full bg-amber-500 transition-[width] duration-700 ease-out"
                  style={{ width: `${roadmapProgressPercentage}%` }}
                />
              </div>
              {recalcNote && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2.5 text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" /> {recalcNote}
                </motion.p>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* ================================================== VIEW 1: Roadmap tree */}
      {activeViewTab === 'roadmap_tree' && (
        <motion.div variants={fadeUp}>
          <RoadmapCanvas />
        </motion.div>
      )}

      {/* ================================================== VIEW 2: Resource catalog */}
      {activeViewTab === 'catalog' && (
        <motion.div variants={fadeUp} className="space-y-6">
          {/* Toolbar */}
          <div className="p-4 rounded-xl bg-white/90 dark:bg-[#121214]/80 backdrop-blur-md border border-stone-200 dark:border-white/[0.08] flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center">
            <div className="relative w-full sm:max-w-sm">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 dark:text-stone-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search resources — pgvector, ReAct, swarms…"
                className="w-full bg-stone-50 dark:bg-white/[0.03] border border-stone-200 dark:border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-sm text-stone-900 dark:text-white placeholder-stone-400 dark:placeholder-stone-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/40 transition"
              />
            </div>

            <div className="flex items-center gap-1 p-1 rounded-lg bg-stone-100 dark:bg-white/[0.04] border border-stone-200 dark:border-white/10 overflow-x-auto">
              {filters.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setFilterFormat(tab.id)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition ${
                    filterFormat === tab.id
                      ? 'bg-white dark:bg-white/10 text-stone-900 dark:text-white shadow-sm'
                      : 'text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Results */}
          {filteredResources.length === 0 ? (
            <GlassCard hoverEffect={false} className="p-4">
              <EmptyState
                icon={SearchX}
                title="Nothing matches that filter"
                description="Try a different format, clear your search, or explore the roadmap tree to find what's queued next."
                action={
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setSearchQuery('');
                      setFilterFormat('all');
                    }}
                  >
                    Reset filters
                  </Button>
                }
              />
            </GlassCard>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filteredResources.map((res) => (
                <GlassCard key={res.id} className="p-5 flex flex-col justify-between group">
                  <div>
                    {/* Meta row */}
                    <div className="flex items-start justify-between gap-2 mb-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="default" size="sm">{res.type}</Badge>
                        <span className="mono-label text-stone-400 dark:text-stone-500">{res.provider}</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="mono-label text-[9px] text-amber-700 dark:text-amber-400 bg-amber-500/10 border border-amber-500/25 px-2 py-1 rounded">
                          {res.matchScore}% match
                        </span>
                        <button
                          onClick={() => toggleSaveResource(res.id)}
                          aria-label={res.isSaved ? 'Unsave resource' : 'Save resource'}
                          className={`p-1.5 rounded-lg border transition ${
                            res.isSaved
                              ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/40'
                              : 'bg-stone-50 dark:bg-white/[0.03] border-stone-200 dark:border-white/10 text-stone-400 hover:text-stone-900 dark:hover:text-white'
                          }`}
                        >
                          <Bookmark className={`w-4 h-4 ${res.isSaved ? 'fill-current' : ''}`} />
                        </button>
                      </div>
                    </div>

                    {/* Title + thumb */}
                    <div className="flex gap-4 items-start mb-4">
                      <img
                        src={res.thumbnail}
                        alt={res.title}
                        loading="lazy"
                        className="w-16 h-16 rounded-lg object-cover border border-stone-200 dark:border-white/10 shrink-0"
                      />
                      <div className="min-w-0">
                        <h3 className="font-display text-[15px] font-semibold text-stone-900 dark:text-white leading-snug line-clamp-2 group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors">
                          {res.title}
                        </h3>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-xs text-stone-500 dark:text-stone-400">
                          <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                            <Star className="w-3.5 h-3.5 fill-current" /> {res.rating}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" /> {res.duration}
                          </span>
                          <span className="mono-label text-stone-400 dark:text-stone-500">{res.difficulty}</span>
                        </div>
                      </div>
                    </div>

                    {/* Why recommended */}
                    <div className="p-3 rounded-lg bg-stone-50 dark:bg-white/[0.02] border-l-2 border-amber-500 mb-4">
                      <span className="mono-label text-amber-600 dark:text-amber-400 block mb-1">Why this, for you</span>
                      <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">{res.whyRecommended}</p>
                    </div>

                    {/* Skills */}
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {res.skillsCovered?.map((sk) => (
                        <span
                          key={sk}
                          className="mono-label text-[9px] px-2 py-1 rounded border border-stone-200 dark:border-white/10 text-stone-500 dark:text-stone-400"
                        >
                          {sk}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="pt-4 border-t border-stone-200 dark:border-white/[0.08] flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      {res.progress > 0 && res.progress < 100 && (
                        <>
                          <div className="w-full h-1.5 rounded-full bg-stone-200 dark:bg-white/[0.08] overflow-hidden max-w-[120px]">
                            <div className="h-full rounded-full bg-amber-500" style={{ width: `${res.progress}%` }} />
                          </div>
                          <span className="mono-label text-stone-400 dark:text-stone-500 mt-1.5 block">{res.progress}% done</span>
                        </>
                      )}
                    </div>
                    {res.progress < 100 ? (
                      <Button variant="primary" size="sm" icon={Play} onClick={() => handleCompleteResource(res.id)} className="shrink-0">
                        Start
                      </Button>
                    ) : (
                      <Badge variant="emerald" size="md">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Completed
                      </Badge>
                    )}
                  </div>
                </GlassCard>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}
