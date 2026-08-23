import React, { useState } from 'react';
import { useLearner } from '../context/LearnerContext';
import { Button, GlassCard, Badge } from '../components/ui';
import { RoadmapCanvas } from '../components/roadmap/RoadmapCanvas';
import { 
  GitBranch, 
  CheckCircle2, 
  Play, 
  Sparkles, 
  Clock, 
  Layers, 
  RefreshCw, 
  BookOpen, 
  Award, 
  Bookmark, 
  Star, 
  Search, 
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import confetti from 'canvas-confetti';

export function LearningPathPage() {
  const { path, goal, roadmap, roadmapProgressPercentage, resources, toggleSaveResource, updateResourceProgress, recordProgressEvent } = useLearner();
  const [activeViewTab, setActiveViewTab] = useState('roadmap_tree'); // 'roadmap_tree' | 'catalog'

  const [filterFormat, setFilterFormat] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredResources = resources.filter(res => {
    const matchesFormat = filterFormat === 'all' || res.format === filterFormat || (filterFormat === 'saved' && res.isSaved);
    const matchesQuery = res.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.skillsCovered?.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesFormat && matchesQuery;
  });

  const handleCompleteResource = (resourceId) => {
    updateResourceProgress(resourceId, 100);
    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  const handleTriggerAdaptiveRecalculation = () => {
    recordProgressEvent("MANUAL_PATH_RECALCULATION", { title: "Requested AI Graph Re-evaluation" });
    alert("HADES AI Engine: Analyzing your latest progress metrics against the target role. Roadmap re-weighted successfully!");
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Path Header */}
      <div className="rounded-3xl bg-gradient-to-r from-indigo-900/90 via-indigo-950/80 to-slate-900 dark:from-indigo-950/80 dark:via-slate-900 dark:to-slate-900 border border-indigo-500/30 p-6 sm:p-8 shadow-2xl text-white">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="cyan" size="sm">
                <GitBranch className="w-3.5 h-3.5" /> Interactive Roadmap Engine
              </Badge>
              <Badge variant="emerald" size="sm">AI Ranked YouTube Playlists</Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
              {goal?.title || "Personalized AI Engineer Roadmap"}
            </h1>
            <p className="text-xs sm:text-sm text-slate-200 max-w-2xl mt-1.5 leading-relaxed">
              Target Role: <strong className="text-cyan-300">{goal?.targetRole || "AI Systems Engineer"}</strong>. Hover over branches to mark <span className="text-purple-300 font-semibold">Learning</span>, <span className="text-emerald-400 font-semibold">Done</span>, or <span className="text-slate-300 font-semibold">Skip</span>. Click any node to open ranked videos & materials.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              icon={RefreshCw}
              onClick={handleTriggerAdaptiveRecalculation}
              className="text-white border-white/20 hover:bg-white/10"
            >
              Re-weight Path
            </Button>
            <div className="flex items-center bg-slate-900/90 border border-slate-700/80 rounded-xl p-1 overflow-x-auto">
              <button
                onClick={() => setActiveViewTab('roadmap_tree')}
                className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition ${
                  activeViewTab === 'roadmap_tree'
                    ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Interactive Roadmap Tree
              </button>
              <button
                onClick={() => setActiveViewTab('catalog')}
                className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition ${
                  activeViewTab === 'catalog'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Curated Resource Hub
              </button>
            </div>
          </div>
        </div>

        {/* Progress Bar Strip */}
        <div className="mt-6 pt-6 border-t border-slate-700/60 grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
          <div className="sm:col-span-2">
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-slate-300 font-medium">Roadmap Completion</span>
              <span className="text-cyan-300 font-bold">{roadmapProgressPercentage}%</span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 via-cyan-400 to-emerald-400 transition-all duration-500"
                style={{ width: `${roadmapProgressPercentage}%` }}
              />
            </div>
          </div>
          <div className="flex sm:justify-end gap-3 text-xs text-slate-300">
            <span className="px-3 py-1.5 rounded-xl bg-slate-900/60 border border-slate-700/60">
              Stages: <strong className="text-white">{roadmap?.mainNodes?.length || 4} Active</strong>
            </span>
          </div>
        </div>
      </div>

      {/* VIEW 1: Interactive Roadmap.sh Tree View */}
      {activeViewTab === 'roadmap_tree' && (
        <RoadmapCanvas />
      )}

      {/* VIEW 2: Curated Resource Catalog */}
      {activeViewTab === 'catalog' && (
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row gap-4 justify-between items-center shadow-sm">
            <div className="relative w-full sm:max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search path resources (e.g. pgvector, Swarms, ReAct)..."
                className="w-full bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
              {[
                { id: 'all', label: 'All Formats' },
                { id: 'interactive', label: 'Interactive Labs' },
                { id: 'video', label: 'Videos' },
                { id: 'article', label: 'Articles' },
                { id: 'saved', label: 'Saved ★' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setFilterFormat(tab.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                    filterFormat === tab.id
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      : 'bg-slate-100 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredResources.map((res) => (
              <GlassCard key={res.id} className="p-6 flex flex-col justify-between group border-slate-200 dark:border-slate-800/80 hover:border-indigo-500/40">
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="cyan" size="sm">{res.type}</Badge>
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">{res.provider}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/80 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-500/30">
                        {res.matchScore}% Match
                      </span>
                      <button
                        onClick={() => toggleSaveResource(res.id)}
                        className={`p-1.5 rounded-lg border transition ${
                          res.isSaved
                            ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-300 border-amber-300 dark:border-amber-500/40'
                            : 'bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        <Bookmark className="w-4 h-4 fill-current" />
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-4 items-start mb-4">
                    <img
                      src={res.thumbnail}
                      alt={res.title}
                      className="w-20 h-20 rounded-xl object-cover border border-slate-200 dark:border-slate-800 flex-shrink-0"
                    />
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition line-clamp-2">
                        {res.title}
                      </h3>
                      <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                        <span className="flex items-center gap-1 text-amber-500 dark:text-amber-400">
                          <Star className="w-3.5 h-3.5 fill-current" /> {res.rating}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" /> {res.duration}
                        </span>
                        <span>•</span>
                        <span className="text-slate-500 dark:text-slate-400 font-medium">{res.difficulty}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-500/20 mb-4 text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-600 dark:text-cyan-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-indigo-700 dark:text-cyan-300">Why recommended: </strong>
                      {res.whyRecommended}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {res.skillsCovered?.map(sk => (
                      <span key={sk} className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400">
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between">
                  <div>
                    {res.progress > 0 && (
                      <span className="text-xs font-semibold text-indigo-600 dark:text-cyan-400">
                        {res.progress}% Finished
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {res.progress < 100 ? (
                      <Button
                        variant="primary"
                        size="sm"
                        icon={Play}
                        onClick={() => handleCompleteResource(res.id)}
                      >
                        Launch Learning Resource
                      </Button>
                    ) : (
                      <Badge variant="emerald" size="md">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Completed
                      </Badge>
                    )}
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
