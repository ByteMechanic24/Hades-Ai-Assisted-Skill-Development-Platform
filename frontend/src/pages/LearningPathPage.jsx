import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useLearner } from '../context/LearnerContext';
import { Button, Eyebrow, ProgressRing } from '../components/ui';
import { RoadmapCanvas } from '../components/roadmap/RoadmapCanvas';
import {
  GitBranch,
  Sparkles,
  RefreshCw,
  Compass
} from 'lucide-react';
import { fadeUp, staggerContainer } from '../utils/motion';

export function LearningPathPage() {
  const {
    goal,
    roadmap,
    allRoadmaps,
    openRoadmapLibrary,
    roadmapProgressPercentage,
    recordProgressEvent,
    loadActiveLearningPath
  } = useLearner();

  const [recalcNote, setRecalcNote] = useState('');

  React.useEffect(() => {
    loadActiveLearningPath();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleTriggerAdaptiveRecalculation = () => {
    recordProgressEvent('MANUAL_PATH_RECALCULATION', { title: 'Requested AI Graph Re-evaluation' });
    setRecalcNote('Path re-weighted against your latest progress metrics.');
    setTimeout(() => setRecalcNote(''), 4000);
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
                {goal?.title || 'Personalized Engineering Roadmap'}
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-2xl mt-2 leading-relaxed">
                Targeting <strong className="text-slate-900 dark:text-white font-bold">{goal?.targetRole || 'Autonomous AI Systems Engineer'}</strong>.
                Click any stage node to inspect prerequisites, video deep-dives, code sandboxes, and checkpoint exercises.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <Button variant="outline" size="sm" icon={Compass} onClick={openRoadmapLibrary}>
                Domain Roadmaps ({allRoadmaps.length > 0 ? allRoadmaps.length : 1})
              </Button>
              <Button variant="secondary" size="sm" icon={RefreshCw} onClick={handleTriggerAdaptiveRecalculation}>
                Re-weight Path
              </Button>
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

      {/* ================================================== Interactive Roadmap Graph Canvas */}
      <motion.div variants={fadeUp}>
        <RoadmapCanvas />
      </motion.div>
    </motion.div>
  );
}
