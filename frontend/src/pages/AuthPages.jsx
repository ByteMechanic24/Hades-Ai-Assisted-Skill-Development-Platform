import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Button, BrandLogo } from '../components/ui';
import { ThemeToggle } from '../components/ui/ThemeToggle';
import { ArrowRight, Lock, Mail, User, ShieldCheck, AlertCircle, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

/* ---------------------------------------------------------------- Input field */
function Field({ label, icon: Icon, ...props }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">{label}</label>
      <div className="relative">
        <Icon className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          {...props}
          className="w-full bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition"
        />
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- Error banner */
function ErrorBanner({ message }) {
  if (!message) return null;
  return (
    <div className="flex items-start gap-2.5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs sm:text-sm">
      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
      <span>{message}</span>
    </div>
  );
}

/* --------------------------------------------------------------- Split shell: Trust & Security */
function AuthShell({ children }) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2 text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-[#0B0A13] transition-colors duration-200">
      {/* Left Feature Showcase Panel: Sleek Midnight with Soft Ambient Depth */}
      <div className="relative hidden lg:flex flex-col justify-between p-12 lg:p-14 bg-[#0A0D14] text-white overflow-hidden border-r border-slate-800/60">
        {/* Soft, reduced-opacity ambient lighting */}
        <div className="absolute top-0 right-0 w-[420px] h-[420px] bg-gradient-to-bl from-indigo-500/10 via-violet-500/05 to-transparent blur-3xl pointer-events-none" />
        <div className="absolute inset-0 bg-grid opacity-10 pointer-events-none" />

        {/* Top Brand with pure white contrast */}
        <div className="relative z-10">
          <Link to="/" className="inline-flex items-center w-fit">
            <BrandLogo subtitle="Adaptive Skill Engine" lightText={true} />
          </Link>
        </div>

        {/* Center Platform Statement in Catchy Outfit Display Typography */}
        <div className="relative z-10 max-w-lg my-auto py-12">
          

          <h2 className="font-fraunces text-3xl sm:text-4xl lg:text-[42px] font-bold tracking-tight text-white leading-[1.1]">
            Stop collecting courses.<br />
            <span className="bg-gradient-to-r from-[#5B50E5] via-indigo-500 to-violet-600 bg-clip-text text-transparent italic">
              Start shipping proof.
            </span>
          </h2>

          <p className="mt-4 text-sm sm:text-base text-slate-300/90 leading-relaxed font-sans max-w-md">
            HADES turns your target career role into a live prerequisite graph, connects the exact competencies you need, and adapts dynamically as you complete checkpoints.
          </p>
        </div>

        {/* Footer info */}
        <div className="relative z-10 text-[11px] text-slate-400/70 mono-label">
          HADES AI · High-Fidelity Competency Engine
        </div>
      </div>

      {/* Form Panel */}
      <div className="relative flex items-center justify-center p-6 sm:p-12">
        <div className="absolute top-4 right-4 sm:top-5 sm:right-6">
          <ThemeToggle />
        </div>

        {/* Mobile Brand */}
        <Link to="/" className="lg:hidden absolute top-4 left-4 sm:top-5 sm:left-6 inline-flex items-center">
          <BrandLogo subtitle="Skill Engine" size="sm" />
        </Link>

        <div className="w-full max-w-md bg-white dark:bg-[#121620] p-8 sm:p-10 rounded-2xl border border-slate-200 dark:border-white/10 shadow-elev">
          {children}
        </div>
      </div>
    </div>
  );
}

/* ==================================================================== Sign In */
export function SignInPage() {
  const navigate = useNavigate();
  const { login, authLoading, authError, setAuthError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignIn = async (e) => {
    e.preventDefault();
    try {
      const user = await login({ email, password });
      const hasRoadmap = user.hasGeneratedRoadmap || localStorage.getItem('hades_has_generated_roadmap') === 'true';
      if (hasRoadmap) {
        navigate('/dashboard');
      } else {
        navigate('/onboarding');
      }
    } catch {
      // error set in context
    }
  };

  return (
    <AuthShell>
      <div className="mb-6">
        <span className="mono-label text-indigo-600 dark:text-indigo-400 font-bold">Welcome Back</span>
        <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-white mt-1">
          Resume Your Mission
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Pick up exactly where your active roadmap left off.
        </p>
      </div>

      <form onSubmit={handleSignIn} className="space-y-4">
        <ErrorBanner message={authError} />
        <Field
          label="Email address"
          icon={Mail}
          type="email"
          value={email}
          onChange={(e) => { setEmail(e.target.value); setAuthError(null); }}
          placeholder="name@domain.com"
          required
        />
        <Field
          label="Password"
          icon={Lock}
          type="password"
          value={password}
          onChange={(e) => { setPassword(e.target.value); setAuthError(null); }}
          placeholder="••••••••"
          required
        />
        <Button type="submit" variant="primary" size="lg" className="w-full mt-2 shadow-glow-indigo" isLoading={authLoading} icon={ArrowRight}>
          Sign In to Workspace
        </Button>
      </form>

      <p className="text-center mt-6 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
        New learner?{' '}
        <Link to="/sign-up" className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline">
          Create an Account
        </Link>
      </p>
    </AuthShell>
  );
}

/* ==================================================================== Sign Up */
export function SignUpPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const role = searchParams.get('role');
  const { register, authLoading, authError, setAuthError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleSignUp = async (e) => {
    e.preventDefault();
    try {
      await register({ name, email, password });
      navigate(role ? `/onboarding?role=${encodeURIComponent(role)}` : '/onboarding');
    } catch {
      // error set in context
    }
  };

  return (
    <AuthShell>
      <div className="mb-6">
        <span className="mono-label text-indigo-600 dark:text-indigo-400 font-bold">Get Started</span>
        <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-white mt-1">
          Build Your Adaptive Path
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Tell us the role you&apos;re chasing — we&apos;ll synthesize the route.
        </p>
      </div>

      <form onSubmit={handleSignUp} className="space-y-4">
        <ErrorBanner message={authError} />
        <Field
          label="Full name"
          icon={User}
          type="text"
          value={name}
          onChange={(e) => { setName(e.target.value); setAuthError(null); }}
          placeholder="Aman Kumar"
          required
        />
        <Field
          label="Email address"
          icon={Mail}
          type="email"
          value={email}
          onChange={(e) => { setEmail(e.target.value); setAuthError(null); }}
          placeholder="aman@example.com"
          required
        />
        <Field
          label="Password"
          icon={Lock}
          type="password"
          value={password}
          onChange={(e) => { setPassword(e.target.value); setAuthError(null); }}
          placeholder="••••••••"
          required
        />
        <Button type="submit" variant="primary" size="lg" className="w-full mt-2 shadow-glow-indigo" isLoading={authLoading} icon={ArrowRight}>
          Start Guided Onboarding
        </Button>
      </form>

      <p className="text-center mt-6 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
        Already have an account?{' '}
        <Link to="/sign-in" className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline">
          Sign In
        </Link>
      </p>
    </AuthShell>
  );
}
