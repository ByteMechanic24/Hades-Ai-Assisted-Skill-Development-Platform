import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui';
import { ThemeToggle } from '../components/ui/ThemeToggle';
import { ArrowRight, Lock, Mail, User, ShieldCheck, Radar, Quote } from 'lucide-react';
import { useLearner } from '../context/LearnerContext';
import { IMAGERY } from '../utils/media';
import { cn } from '../utils/cn';

/* ---------------------------------------------------------------- Input field */
function Field({ label, icon: Icon, ...props }) {
  return (
    <div>
      <label className="block text-xs font-medium text-stone-600 dark:text-stone-400 mb-1.5">{label}</label>
      <div className="relative">
        <Icon className="w-4 h-4 text-stone-400 dark:text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          {...props}
          className="w-full bg-stone-50 dark:bg-white/[0.03] border border-stone-200 dark:border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-sm text-stone-900 dark:text-white placeholder-stone-400 dark:placeholder-stone-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/40 transition"
        />
      </div>
    </div>
  );
}

/* --------------------------------------------------------------- Split shell */
function AuthShell({ image, quote, quoteAuthor, quoteRole, children }) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2 text-stone-900 dark:text-stone-100">
      {/* Imagery panel — real people building software */}
      <div className="relative hidden lg:block overflow-hidden">
        <img src={image} alt="A developer at work" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950/95 via-stone-950/45 to-stone-950/70" />
        <div className="absolute inset-0 bg-dots opacity-30" />

        <div className="relative h-full flex flex-col justify-between p-10 text-white">
          <Link to="/" className="inline-flex items-center gap-2.5 w-fit">
            <span className="w-9 h-9 rounded-lg bg-white flex items-center justify-center">
              <Radar className="w-[18px] h-[18px] text-amber-500" strokeWidth={2.25} />
            </span>
            <span className="flex flex-col leading-none">
              <span className="font-display text-[15px] font-bold tracking-tight">HADES</span>
              <span className="mono-label text-[9px] text-white/60 mt-0.5">Mission Control</span>
            </span>
          </Link>

          <div className="max-w-md">
            <Quote className="w-7 h-7 text-amber-400 mb-4" />
            <p className="font-display text-xl font-medium leading-snug">{quote}</p>
            <div className="mt-4 flex items-center gap-3">
              <div className="h-px w-8 bg-amber-400" />
              <div>
                <p className="text-sm font-semibold">{quoteAuthor}</p>
                <p className="mono-label text-[10px] text-white/60 mt-0.5">{quoteRole}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Form panel */}
      <div className="relative flex items-center justify-center p-6 sm:p-10">
        <div className="absolute top-6 right-6">
          <ThemeToggle />
        </div>

        {/* Mobile brand */}
        <Link to="/" className="lg:hidden absolute top-6 left-6 inline-flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-stone-900 dark:bg-white flex items-center justify-center">
            <Radar className="w-4 h-4 text-amber-400 dark:text-amber-500" strokeWidth={2.25} />
          </span>
          <span className="font-display text-sm font-bold tracking-tight">HADES</span>
        </Link>

        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  );
}

/* ==================================================================== Sign in */
export function SignInPage() {
  const navigate = useNavigate();
  const { profile } = useLearner();
  const [email, setEmail] = useState('aman@hades.ai');
  const [password, setPassword] = useState('••••••••••••');
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      navigate('/dashboard');
    }, 600);
  };

  return (
    <AuthShell
      image={IMAGERY.authPrimary}
      quote="I stopped collecting courses and started shipping projects. HADES showed me exactly what to build next."
      quoteAuthor="A HADES learner"
      quoteRole="On the path to AI Systems Engineer"
    >
      <div className="mb-8">
        <span className="mono-label text-amber-600 dark:text-amber-400">Welcome back</span>
        <h1 className="font-display text-2xl font-bold tracking-tight text-stone-900 dark:text-white mt-2">
          Resume your mission
        </h1>
        <p className="text-sm text-stone-500 dark:text-stone-400 mt-1.5">
          Pick up exactly where your path left off.
        </p>
      </div>

      <form onSubmit={handleSignIn} className="space-y-4">
        <Field
          label="Email address"
          icon={Mail}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="name@domain.com"
          required
        />
        <Field
          label="Password"
          icon={Lock}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
        />
        <Button type="submit" variant="primary" size="lg" className="w-full mt-1" isLoading={isLoading} icon={ArrowRight}>
          Sign in to workspace
        </Button>
      </form>

      <div className="mt-6 pt-5 border-t border-stone-200 dark:border-white/[0.08]">
        <p className="mono-label text-stone-400 dark:text-stone-500 text-center mb-3">Hackathon demo access</p>
        <button
          onClick={handleSignIn}
          className="w-full py-2.5 px-3 rounded-lg bg-amber-500/10 hover:bg-amber-500/15 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-sm font-medium transition flex items-center justify-center gap-2"
        >
          <ShieldCheck className="w-4 h-4" />
          Continue as {profile?.name || 'Aman Kumar'}
        </button>
      </div>

      <p className="text-center mt-6 text-sm text-stone-500 dark:text-stone-400">
        New here?{' '}
        <Link to="/sign-up" className="text-amber-600 dark:text-amber-400 font-medium hover:underline">
          Create an account
        </Link>
      </p>
    </AuthShell>
  );
}

/* ==================================================================== Sign up */
export function SignUpPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleSignUp = (e) => {
    e.preventDefault();
    navigate('/onboarding');
  };

  return (
    <AuthShell
      image={IMAGERY.authSecondary}
      quote="Your goal becomes a project. The project reveals the skills. The gaps become your path."
      quoteAuthor="The HADES method"
      quoteRole="Goal → Project → Skills → Mastery"
    >
      <div className="mb-8">
        <span className="mono-label text-amber-600 dark:text-amber-400">Get started</span>
        <h1 className="font-display text-2xl font-bold tracking-tight text-stone-900 dark:text-white mt-2">
          Build your path
        </h1>
        <p className="text-sm text-stone-500 dark:text-stone-400 mt-1.5">
          Tell us the role you&apos;re chasing — we&apos;ll chart the route.
        </p>
      </div>

      <form onSubmit={handleSignUp} className="space-y-4">
        <Field
          label="Full name"
          icon={User}
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Aman Kumar"
          required
        />
        <Field
          label="Email address"
          icon={Mail}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="aman@example.com"
          required
        />
        <Field
          label="Password"
          icon={Lock}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
        />
        <Button type="submit" variant="primary" size="lg" className="w-full mt-1" icon={ArrowRight}>
          Start onboarding
        </Button>
      </form>

      <p className="text-center mt-6 text-sm text-stone-500 dark:text-stone-400">
        Already have an account?{' '}
        <Link to="/sign-in" className="text-amber-600 dark:text-amber-400 font-medium hover:underline">
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}
