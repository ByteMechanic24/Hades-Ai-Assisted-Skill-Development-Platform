import React, { useState } from 'react';
import { useLearner } from '../../context/LearnerContext';
import { Button, Badge } from '../ui';
import { 
  X, 
  Sparkles, 
  Video, 
  BookOpen, 
  ExternalLink, 
  CheckCircle2, 
  Clock, 
  Play, 
  Heart, 
  Star, 
  Flame, 
  Zap, 
  Bookmark, 
  Share2,
  DollarSign,
  Award,
  Filter,
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';

export function NodeDetailDrawer({ node, mainNodeId, onClose }) {
  const { updateBranchStatus, openAssistant } = useLearner();
  const [resourcePricingFilter, setResourcePricingFilter] = useState('all'); // 'all' | 'free' | 'paid'

  if (!node) return null;

  const handleStatusChange = (newStatus) => {
    updateBranchStatus(mainNodeId, node.id, newStatus);
    if (newStatus === 'done') {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  };

  const handleAskAiAboutNode = () => {
    openAssistant(`Can you explain "${node.title}" and give me key practice tips?`);
  };

  const showFree = resourcePricingFilter === 'all' || resourcePricingFilter === 'free';
  const showPaid = resourcePricingFilter === 'all' || resourcePricingFilter === 'paid';

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-xl bg-white dark:bg-[#0e1626]/98 backdrop-blur-2xl border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col transition-all duration-300 animate-in slide-in-from-right text-slate-900 dark:text-slate-100">
      {/* Top Header */}
      <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between bg-slate-50/80 dark:bg-slate-900/60">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 font-mono">
              Topic Module
            </span>
            <Badge
              variant={
                node.status === 'done'
                  ? 'emerald'
                  : node.status === 'learning'
                  ? 'purple'
                  : node.status === 'skip'
                  ? 'default'
                  : 'cyan'
              }
              size="sm"
            >
              {node.status === 'done'
                ? '✓ Completed'
                : node.status === 'learning'
                ? '📖 In Learning'
                : node.status === 'skip'
                ? '✕ Skipped'
                : 'Pending'}
            </Badge>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white font-display">
            {node.title}
          </h2>
        </div>

        <button
          onClick={onClose}
          className="p-2 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Quick Action Button Group: Learning | Done | Skip */}
      <div className="px-6 py-3 bg-slate-100/60 dark:bg-slate-900/40 border-b border-slate-200 dark:border-slate-800/80 flex items-center gap-2">
        <button
          onClick={() => handleStatusChange('learning')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 border ${
            node.status === 'learning'
              ? 'bg-purple-100 dark:bg-purple-600/30 text-purple-900 dark:text-purple-200 border-purple-400 dark:border-purple-500 shadow-sm'
              : 'bg-white dark:bg-slate-900/80 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-700'
          }`}
        >
          <span>📖</span> Learning
        </button>
        <button
          onClick={() => handleStatusChange('done')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 border ${
            node.status === 'done'
              ? 'bg-emerald-100 dark:bg-emerald-600/30 text-emerald-900 dark:text-emerald-200 border-emerald-400 dark:border-emerald-500 shadow-sm'
              : 'bg-white dark:bg-slate-900/80 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-700'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" /> Done
        </button>
        <button
          onClick={() => handleStatusChange('skip')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 border ${
            node.status === 'skip'
              ? 'bg-slate-200 dark:bg-slate-700/50 text-slate-900 dark:text-slate-200 border-slate-400 dark:border-slate-500 shadow-sm'
              : 'bg-white dark:bg-slate-900/80 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-700'
          }`}
        >
          <span>✕</span> Skip
        </button>
      </div>

      {/* Drawer Body */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Conceptual Summary */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
          {node.summary || "Explore the core theoretical principles, mental models, and practical code implementations for this node."}
        </div>

        {/* Course Pricing Filter Button Toggle */}
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm dark:shadow-md">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-indigo-600 dark:text-cyan-400" />
            <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Course Pricing</span>
          </div>

          <div className="flex items-center gap-1 bg-white dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800 w-full sm:w-auto shadow-inner">
            <button
              onClick={() => setResourcePricingFilter('all')}
              className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                resourcePricingFilter === 'all'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setResourcePricingFilter('free')}
              className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 ${
                resourcePricingFilter === 'free'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
              }`}
            >
              <span>💚</span> Free Courses
            </button>
            <button
              onClick={() => setResourcePricingFilter('paid')}
              className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 ${
                resourcePricingFilter === 'paid'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40'
              }`}
            >
              <span>⭐</span> Paid / Pro
            </button>
          </div>
        </div>

        {/* Recommended Official / Primary Resource Card */}
        {node.recommendedResource && (resourcePricingFilter === 'all' || resourcePricingFilter === 'free') && (
          <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-50/60 to-white dark:from-amber-950/40 dark:via-slate-900 dark:to-slate-900 border border-amber-400/60 dark:border-amber-500/50 shadow-md">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5 fill-current" /> Recommended • Official Series
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/40">
                100% FREE
              </span>
            </div>

            <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1">
              {node.recommendedResource.title}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              {node.recommendedResource.provider} • {node.recommendedResource.duration}
            </p>

            <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between">
              <span className="text-xs text-slate-500 dark:text-slate-400">{node.recommendedResource.type}</span>
              <a
                href={node.recommendedResource.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition shadow-md shadow-amber-500/20"
              >
                Start Module <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        )}

        {/* PAID / PRO COURSES SECTION */}
        {showPaid && node.paidCourses?.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5 font-mono">
                <Award className="w-4 h-4 text-amber-500 dark:text-amber-400" /> Paid / Pro Certifications
              </span>
              <span className="text-[10px] text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/80 px-2 py-0.5 rounded-full border border-amber-300 dark:border-amber-500/30">
                Verified Diplomas
              </span>
            </div>

            <div className="space-y-3">
              {node.paidCourses.map((paid) => (
                <div
                  key={paid.id}
                  className="p-4 rounded-2xl bg-white dark:bg-gradient-to-r dark:from-amber-950/20 dark:to-slate-900/90 border border-amber-300 dark:border-amber-500/30 hover:border-amber-500 transition flex flex-col justify-between group shadow-sm dark:shadow-lg"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400">{paid.provider}</span>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-200 transition mt-0.5">
                        {paid.title}
                      </h4>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className="text-sm font-black text-amber-600 dark:text-amber-300 block">{paid.price}</span>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">{paid.discount}</span>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between text-xs">
                    <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" /> {paid.duration} • {paid.rating}
                    </span>
                    <a
                      href={paid.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition"
                    >
                      Enroll in Pro Course <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* FREE SECTION: Ranked YouTube Videos & Playlists */}
        {showFree && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Video className="w-4 h-4 text-rose-500" /> Ranked Free YouTube Playlists & Videos
              </span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">100% Free Access</span>
            </div>

            <div className="space-y-3">
              {node.rankedVideos?.map((video) => (
                <div
                  key={video.id}
                  className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 hover:border-indigo-500/40 transition flex gap-3.5 items-start group shadow-sm"
                >
                  <div className="relative w-24 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700">
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition"
                    />
                    <span className="absolute bottom-1 right-1 px-1.5 py-0.2 rounded bg-black/80 text-[10px] font-mono text-white">
                      {video.duration}
                    </span>
                    <div className="absolute top-1 left-1 px-1.5 py-0.2 rounded bg-indigo-600 text-[9px] font-bold text-white">
                      #{video.rank}
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-indigo-600 dark:text-cyan-400 truncate">
                        {video.channel}
                      </span>
                      <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-300 dark:border-emerald-500/30">
                        {video.rating}
                      </span>
                    </div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition line-clamp-2 mt-0.5">
                      {video.title}
                    </h4>
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200 dark:border-slate-800/60 text-[11px] text-slate-500 dark:text-slate-400">
                      <span>{video.views}</span>
                      <a
                        href="https://youtube.com"
                        target="_blank"
                        rel="noreferrer"
                        className="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold flex items-center gap-1"
                      >
                        Watch on YouTube <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Free Articles & References */}
        {showFree && node.articles?.length > 0 && (
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2 mb-3">
              <Heart className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
              <span className="text-xs font-bold text-slate-900 dark:text-white">Free Documentation & Articles</span>
            </div>
            <div className="space-y-2">
              {node.articles.map((art, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs py-1.5 border-b border-slate-200 dark:border-slate-800/80 last:border-none">
                  <div className="flex items-center gap-2">
                    <span className="px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 text-[10px] font-bold">
                      Article
                    </span>
                    <span className="text-slate-700 dark:text-slate-300 font-medium">{art.title}</span>
                  </div>
                  <span className="text-slate-400 text-[11px] whitespace-nowrap">{art.duration}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Floating AI Assistant Trigger */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 flex items-center justify-between gap-3">
        <button
          onClick={handleAskAiAboutNode}
          className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:opacity-90 text-xs font-bold text-white flex items-center justify-center gap-2 transition shadow-md"
        >
          <Sparkles className="w-4 h-4 text-cyan-200" />
          Ask AI Coach to explain "{node.title.slice(0, 20)}..."
        </button>
      </div>
    </div>
  );
}
