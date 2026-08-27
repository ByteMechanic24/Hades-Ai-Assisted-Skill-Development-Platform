import React, { useState, useRef, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useLearner } from '../../context/LearnerContext';
import { ThemeToggle } from '../ui/ThemeToggle';
import {
  Bell,
  ChevronDown,
  LayoutDashboard,
  GitBranch,
  TrendingUp,
  Award,
  LogOut,
  Target,
  User,
  Radar,
} from 'lucide-react';
import { cn } from '../../utils/cn';

const navItems = [
  { name: 'Dashboard', short: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, badge: null },
  { name: 'Learning Path', short: 'Path', path: '/dashboard/learning-path', icon: GitBranch, badge: 'ADAPTIVE' },
  { name: 'Progress', short: 'Progress', path: '/dashboard/progress', icon: TrendingUp, badge: null },
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
  const { profile, recentEvents } = useLearner();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const notifRef = useDismiss(() => setShowNotifications(false));
  const profileRef = useDismiss(() => setShowProfileMenu(false));

  return (
    <header className="sticky top-0 z-50 w-full glass-panel">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2.5 group shrink-0">
          <span className="relative w-9 h-9 rounded-lg bg-stone-900 dark:bg-white flex items-center justify-center overflow-hidden">
            <Radar className="w-[18px] h-[18px] text-amber-400 dark:text-amber-500" strokeWidth={2.25} />
          </span>
          <span className="flex flex-col leading-none">
            <span className="font-display text-[15px] font-bold tracking-tight text-stone-900 dark:text-white">
              HADES
            </span>
            <span className="mono-label text-[9px] text-stone-400 dark:text-stone-500 mt-0.5">
              Mission Control
            </span>
          </span>
        </Link>

        {/* Center nav */}
        <nav className="flex items-center gap-1 p-1 rounded-xl border border-stone-200 dark:border-white/[0.08] bg-stone-50/60 dark:bg-white/[0.03]">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/dashboard'}
              className={({ isActive }) =>
                cn(
                  'relative flex items-center gap-2 px-2.5 sm:px-3.5 py-1.5 rounded-lg text-[13px] font-medium transition-colors duration-200 whitespace-nowrap',
                  isActive
                    ? 'bg-white dark:bg-white/[0.08] text-stone-900 dark:text-white shadow-sm'
                    : 'text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon
                    className={cn('w-4 h-4 shrink-0', isActive ? 'text-amber-500' : 'text-stone-400 dark:text-stone-500')}
                  />
                  <span className="hidden sm:inline">{item.name}</span>
                  {item.badge && (
                    <span className="mono-label text-[8px] text-amber-600 dark:text-amber-400 border border-amber-500/30 rounded px-1 py-0.5 hidden lg:inline">
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
          <ThemeToggle />

          {/* Notifications */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => {
                setShowNotifications((v) => !v);
                setShowProfileMenu(false);
              }}
              className="relative p-2 rounded-lg text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-white/[0.06] border border-transparent hover:border-stone-200 dark:hover:border-white/10 transition"
              aria-label="Event log"
            >
              <Bell className="w-[18px] h-[18px]" />
              {recentEvents.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-amber-500 ring-2 ring-[var(--bg-main)]" />
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 rounded-xl bg-white dark:bg-[#141416] border border-stone-200 dark:border-white/10 shadow-elev p-3 z-50 animate-fade-in">
                <div className="flex items-center justify-between pb-2.5 mb-1 border-b border-stone-200 dark:border-white/10">
                  <span className="mono-label text-stone-500 dark:text-stone-400">Event Log</span>
                  <span className="mono-label text-[9px] text-amber-600 dark:text-amber-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" /> Live
                  </span>
                </div>
                <div className="mt-2 space-y-1 max-h-72 overflow-y-auto">
                  {recentEvents.map((ev) => (
                    <div key={ev.id} className="p-2.5 rounded-lg hover:bg-stone-50 dark:hover:bg-white/[0.04] transition">
                      <p className="text-[13px] font-medium text-stone-800 dark:text-stone-200 leading-snug">{ev.title}</p>
                      <div className="flex items-center justify-between mt-1.5">
                        <span className="mono-label text-[9px] text-amber-600 dark:text-amber-400/80">{ev.type}</span>
                        <span className="text-[10px] text-stone-400 dark:text-stone-500">{ev.timestamp}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Profile */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => {
                setShowProfileMenu((v) => !v);
                setShowNotifications(false);
              }}
              className="flex items-center gap-1.5 p-1 pr-2 rounded-lg border border-stone-200 dark:border-white/10 hover:bg-stone-100 dark:hover:bg-white/[0.06] transition"
            >
              <img
                src={profile.avatar}
                alt={profile.name}
                className="w-7 h-7 rounded-md object-cover"
              />
              <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-60 rounded-xl bg-white dark:bg-[#141416] border border-stone-200 dark:border-white/10 shadow-elev p-1.5 z-50 animate-fade-in">
                <div className="flex items-center gap-3 p-2.5 mb-1 border-b border-stone-200 dark:border-white/10">
                  <img src={profile.avatar} alt={profile.name} className="w-9 h-9 rounded-lg object-cover" />
                  <div className="min-w-0">
                    <p className="text-[13px] font-semibold text-stone-900 dark:text-white truncate">{profile.name}</p>
                    <p className="text-[11px] text-stone-500 dark:text-stone-400 truncate">{profile.email}</p>
                  </div>
                </div>
                <MenuLink to="/dashboard/profile" icon={User} onClick={() => setShowProfileMenu(false)}>
                  Profile &amp; Settings
                </MenuLink>
                <MenuLink to="/dashboard/progress" icon={Award} onClick={() => setShowProfileMenu(false)}>
                  Skills &amp; Mastery
                </MenuLink>
                <MenuLink to="/onboarding" icon={Target} onClick={() => setShowProfileMenu(false)}>
                  Reconfigure Goal
                </MenuLink>
                <div className="my-1 h-px bg-stone-200 dark:bg-white/10" />
                <MenuLink to="/sign-in" icon={LogOut} danger onClick={() => setShowProfileMenu(false)}>
                  Sign Out
                </MenuLink>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

function MenuLink({ to, icon: Icon, children, danger, onClick }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={cn(
        'flex items-center gap-2.5 px-2.5 py-2 text-[13px] font-medium rounded-lg transition',
        danger
          ? 'text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30'
          : 'text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-white/[0.06] hover:text-stone-900 dark:hover:text-white'
      )}
    >
      <Icon className={cn('w-4 h-4', danger ? 'text-rose-500' : 'text-stone-400 dark:text-stone-500')} />
      {children}
    </Link>
  );
}
