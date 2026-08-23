import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useLearner } from '../../context/LearnerContext';
import { Button, Badge } from '../ui';
import { ThemeToggle } from '../ui/ThemeToggle';
import { 
  Bot, 
  Search, 
  Bell, 
  Sparkles, 
  ChevronDown, 
  LayoutDashboard,
  GitBranch,
  TrendingUp,
  Award,
  LogOut,
  Target,
  User
} from 'lucide-react';
import { cn } from '../../utils/cn';

export function Navbar() {
  const { profile, goal, path, recentEvents } = useLearner();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const navigate = useNavigate();

  const navItems = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard, badge: null },
    { name: "Learning Path & Resources", path: "/dashboard/learning-path", icon: GitBranch, badge: "ADAPTIVE" },
    { name: "Progress & Skills", path: "/dashboard/progress", icon: TrendingUp, badge: null }
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-[#0B0F19]/80 dark:bg-[#0B0F19]/80 bg-white/80 backdrop-blur-2xl border-b border-slate-800/80 dark:border-slate-800/80 border-slate-200 shadow-2xl transition-all duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* Left: Brand Logo */}
        <Link to="/" className="flex items-center gap-3 group flex-shrink-0">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 via-indigo-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-600/30 group-hover:scale-105 transition duration-200">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-lg sm:text-xl font-black tracking-wider bg-gradient-to-r from-slate-900 via-indigo-600 to-cyan-500 dark:from-white dark:via-indigo-200 dark:to-cyan-400 bg-clip-text text-transparent font-display">
                HADES
              </span>
            </div>
            <span className="block text-[9px] uppercase font-bold tracking-widest text-indigo-500 dark:text-indigo-400">
              AI Learning Engine
            </span>
          </div>
        </Link>

        {/* Center: Glassmorphism Sticky CTA Pill Navigation Buttons */}
        <nav className="flex items-center gap-1.5 sm:gap-2 p-1.5 rounded-2xl bg-slate-100/80 dark:bg-[#0B101E]/60 backdrop-blur-2xl backdrop-saturate-150 border border-slate-200 dark:border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.15)] dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.45)] overflow-x-auto max-w-full">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/dashboard"}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 select-none group relative whitespace-nowrap",
                  isActive
                    ? "bg-gradient-to-r from-indigo-600/40 via-purple-600/30 to-indigo-600/40 dark:text-white text-indigo-900 border border-indigo-500/50 shadow-md shadow-indigo-500/10"
                    : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-white/[0.06]"
                )
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon
                    className={cn(
                      "w-4 h-4 transition duration-200",
                      isActive ? "text-indigo-600 dark:text-indigo-300 group-hover:scale-110" : "text-slate-400 dark:text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200"
                    )}
                  />
                  <span className="hidden sm:inline">{item.name}</span>
                  <span className="sm:hidden">{item.name.split(' ')[0]}</span>
                  {item.badge && (
                    <span
                      className={cn(
                        "text-[9px] px-1.5 py-0.2 rounded-md font-extrabold uppercase tracking-wider border hidden md:inline",
                        isActive
                          ? "bg-indigo-500/20 text-indigo-700 dark:text-indigo-200 border-indigo-400/40 shadow-sm"
                          : "bg-slate-200 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700/60"
                      )}
                    >
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Right: Theme Toggle, Notifications & Profile Dropdown */}
        <div className="flex items-center gap-2.5 sm:gap-3 flex-shrink-0">
          {/* Theme Toggle Button (Light / Dark mode switcher) */}
          <ThemeToggle />

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80 border border-slate-200 dark:border-slate-800 transition"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-500"></span>
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                  <span className="text-xs font-semibold text-slate-900 dark:text-white">Event Log & Telemetry</span>
                  <span className="text-[10px] text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-950/80 px-2 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-500/30">Realtime</span>
                </div>
                <div className="mt-3 space-y-2.5 max-h-64 overflow-y-auto">
                  {recentEvents.map(ev => (
                    <div key={ev.id} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/60 text-xs">
                      <p className="font-medium text-slate-800 dark:text-slate-200">{ev.title}</p>
                      <div className="flex items-center justify-between mt-1 text-[10px] text-slate-500">
                        <span className="font-mono text-indigo-600 dark:text-indigo-400">{ev.type}</span>
                        <span>{ev.timestamp}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-1.5 sm:gap-2 p-1 pl-1.5 pr-2 rounded-xl bg-slate-100 dark:bg-slate-900/60 hover:bg-slate-200 dark:hover:bg-slate-800/80 border border-slate-200 dark:border-slate-800 transition"
            >
              <img
                src={profile.avatar}
                alt={profile.name}
                className="w-8 h-8 rounded-xl object-cover ring-1 ring-indigo-500/40"
              />
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95">
                <div className="p-2.5 border-b border-slate-200 dark:border-slate-800">
                  <p className="text-xs font-semibold text-slate-900 dark:text-white">{profile.name}</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{profile.email}</p>
                </div>
                <div className="p-1 space-y-1">
                  <Link
                    to="/dashboard/profile"
                    onClick={() => setShowProfileMenu(false)}
                    className="flex items-center gap-2.5 px-3 py-2 text-xs text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 rounded-xl transition font-semibold"
                  >
                    <User className="w-4 h-4 text-cyan-500 dark:text-cyan-400" />
                    My Profile & Settings
                  </Link>
                  <Link
                    to="/dashboard/progress"
                    onClick={() => setShowProfileMenu(false)}
                    className="flex items-center gap-2.5 px-3 py-2 text-xs text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 rounded-xl transition"
                  >
                    <Award className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
                    My Skills & Mastery
                  </Link>
                  <Link
                    to="/onboarding"
                    onClick={() => setShowProfileMenu(false)}
                    className="flex items-center gap-2.5 px-3 py-2 text-xs text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 rounded-xl transition"
                  >
                    <Target className="w-4 h-4 text-cyan-500 dark:text-cyan-400" />
                    Reconfigure Goals
                  </Link>
                  <Link
                    to="/sign-in"
                    onClick={() => setShowProfileMenu(false)}
                    className="flex items-center gap-2.5 px-3 py-2 text-xs text-rose-600 dark:text-rose-300 hover:text-rose-700 dark:hover:text-rose-200 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition"
                  >
                    <LogOut className="w-4 h-4 text-rose-500 dark:text-rose-400" />
                    Sign Out
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
