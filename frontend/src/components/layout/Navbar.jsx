import React, { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useLearner } from '../../context/LearnerContext';
import { useAuth } from '../../context/AuthContext';
import { ThemeToggle } from '../ui/ThemeToggle';
import { BrandLogo } from '../ui/BrandLogo';
import {
  Bell,
  LayoutDashboard,
  GitBranch,
  TrendingUp,
  LogOut,
  Target,
  User,
  Radar,
  Sparkles,
  Award,
  Library
} from 'lucide-react';
import { RoadmapLibraryModal } from '../roadmap/RoadmapLibraryModal';
import { cn } from '../../utils/cn';

const navItems = [
  { name: 'Dashboard', short: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, color: 'indigo', badge: null },
  { name: 'Learning Path', short: 'Path', path: '/dashboard/learning-path', icon: GitBranch, color: 'violet', badge: 'ADAPTIVE' },
  { name: 'Progress', short: 'Progress', path: '/dashboard/progress', icon: TrendingUp, color: 'violet', badge: null },
];

/** Small hook: close a popover when clicking outside or pressing Escape. */
function useDismiss(onDismiss) {
  const ref = useRef(null);
  useEffect(() => {
    function onDoc(e) {
      if (ref.current && !ref.current.contains(e.target)) onDismiss();
    }
    function onKey(e) {
      if (e.key === 'Escape') onDismiss();
    }
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [onDismiss]);
  return ref;
}

export function Navbar() {
  const {
    profile,
    recentEvents,
    allRoadmaps,
    isRoadmapLibraryOpen,
    openRoadmapLibrary,
    closeRoadmapLibrary
  } = useLearner();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const notifRef = useDismiss(() => setShowNotifications(false));
  const profileRef = useDismiss(() => setShowProfileMenu(false));

  const activeColorStyles = {
    indigo: 'text-indigo-600 dark:text-indigo-400 bg-white dark:bg-white/[0.08] shadow-sm',
    violet: 'text-violet-600 dark:text-violet-400 bg-white dark:bg-white/[0.08] shadow-sm',
    emerald: 'text-emerald-600 dark:text-emerald-400 bg-white dark:bg-white/[0.08] shadow-sm',
  };

  const activeIconStyles = {
    indigo: 'text-indigo-600 dark:text-indigo-400',
    violet: 'text-violet-600 dark:text-violet-400',
    emerald: 'text-emerald-600 dark:text-emerald-400',
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white/90 dark:bg-[#0B0D13]/90 backdrop-blur-md border-b border-slate-200 dark:border-white/10 transition-colors duration-200">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-4">
        {/* Brand */}
        <Link to="/" className="shrink-0">
          <BrandLogo subtitle="Mission Control" size="sm" />
        </Link>

        {/* Center Navigation with Route-Specific Color Accents */}
        <nav className="flex items-center gap-1 p-1 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-100/70 dark:bg-white/[0.03]">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/dashboard'}
              className={({ isActive }) =>
                cn(
                  'relative flex items-center gap-2 px-3 sm:px-3.5 py-1.5 rounded-lg text-xs sm:text-[13px] font-bold transition-all duration-200 whitespace-nowrap',
                  isActive
                    ? activeColorStyles[item.color]
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon
                    className={cn('w-4 h-4 shrink-0', isActive ? activeIconStyles[item.color] : 'text-slate-400 dark:text-slate-500')}
                  />
                  <span className="hidden sm:inline">{item.name}</span>
                  {item.badge && (
                    <span className="mono-label text-[8px] text-violet-700 dark:text-violet-300 bg-violet-500/10 border border-violet-500/30 rounded px-1.5 py-0.5 hidden lg:inline font-bold">
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Right cluster */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Domain Roadmaps Library Button */}
          <button
            type="button"
            onClick={openRoadmapLibrary}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-violet-500/25 bg-violet-500/10 hover:bg-violet-500/20 text-violet-700 dark:text-violet-300 text-xs font-bold transition shadow-sm"
            title="Browse and switch between all saved Career Domain Roadmaps (Cybersecurity, Agentic AI, AI/ML, etc.)"
          >
            <Library className="w-3.5 h-3.5 text-violet-500" />
            <span className="hidden sm:inline">My Domains</span>
            <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-violet-600 text-white font-mono font-bold">
              {allRoadmaps.length > 0 ? allRoadmaps.length : 1}
            </span>
          </button>

          <ThemeToggle />

          {/* Notifications */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => {
                setShowNotifications((v) => !v);
                setShowProfileMenu(false);
              }}
              className="relative p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.06] border border-transparent hover:border-slate-200 dark:hover:border-white/10 transition"
              aria-label="Event log"
            >
              <Bell className="w-[18px] h-[18px]" />
              {recentEvents.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-violet-500 ring-2 ring-white dark:ring-[#0B0D13]" />
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#121620] shadow-elev p-4 z-50">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/[0.08] mb-3">
                  <span className="mono-label text-slate-600 dark:text-slate-300 font-bold text-xs">
                    Live Telemetry Log
                  </span>
                  <span className="mono-label text-[9px] text-slate-400 dark:text-slate-500">
                    {recentEvents.length} events
                  </span>
                </div>

                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {recentEvents.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-6">No telemetry events recorded yet.</p>
                  ) : (
                    recentEvents.slice(0, 6).map((ev) => (
                      <div
                        key={ev.id}
                        className="p-2.5 rounded-xl border border-slate-100 dark:border-white/[0.06] bg-slate-50/70 dark:bg-white/[0.02]"
                      >
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="mono-label text-[9px] text-violet-600 dark:text-violet-400 font-bold">
                            {ev.type}
                          </span>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500">
                            {ev.timestamp}
                          </span>
                        </div>
                        <p className="text-xs text-slate-800 dark:text-slate-200 leading-snug">{ev.title}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Profile pill */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => {
                setShowProfileMenu((v) => !v);
                setShowNotifications(false);
              }}
              className="flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-xl hover:bg-slate-100 dark:hover:bg-white/[0.06] border border-transparent hover:border-slate-200 dark:hover:border-white/10 transition"
            >
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center font-bold text-[11px] text-white shadow-sm">
                {profile?.name?.split(' ').map(n => n[0]).join('') || 'AK'}
              </div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 hidden md:inline">
                {profile?.name?.split(' ')[0] || 'Learner'}
              </span>
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#121620] shadow-elev p-2 z-50">
                <div className="px-3 py-2 border-b border-slate-100 dark:border-white/[0.08] mb-1">
                  <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {profile?.name || 'Aman Kumar'}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                    {profile?.email || 'aman@hades.ai'}
                  </div>
                </div>

                <Link
                  to="/dashboard/profile"
                  onClick={() => setShowProfileMenu(false)}
                  className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.06] rounded-xl transition"
                >
                  <User className="w-4 h-4 text-indigo-500" /> Profile &amp; Preferences
                </Link>

                <Link
                  to="/onboarding"
                  onClick={() => setShowProfileMenu(false)}
                  className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.06] rounded-xl transition"
                >
                  <Target className="w-4 h-4 text-violet-500" /> Re-run Career Wizard
                </Link>

                <div className="my-1 border-t border-slate-100 dark:border-white/[0.08]" />

                <button
                  type="button"
                  onClick={() => {
                    setShowProfileMenu(false);
                    logout();
                    navigate('/sign-in');
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 rounded-xl transition text-left"
                >
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Roadmap Library Modal */}
      <RoadmapLibraryModal
        isOpen={isRoadmapLibraryOpen}
        onClose={closeRoadmapLibrary}
        onNewGoal={() => {
          window.location.href = '/onboarding';
        }}
      />
    </header>
  );
}
