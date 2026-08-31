import React from 'react';
import { LandingNavbar } from '../components/landing/LandingNavbar';
import { Hero } from '../components/landing/Hero';
import { Features } from '../components/landing/Features';
import { HowItWorks } from '../components/landing/HowItWorks';
import { PathVisualizerDemo } from '../components/landing/PathVisualizerDemo';
import { Footer } from '../components/landing/Footer';

export function LandingPage() {
  return (
    <div className="relative min-h-screen bg-slate-50 dark:bg-[#0B0D13] text-slate-900 dark:text-slate-100 selection:bg-indigo-600 selection:text-white transition-colors duration-200 overflow-x-hidden">
      {/* Full-Page Background Grid Texture & Ambient Depth Glow */}
      <div className="fixed inset-0 bg-grid opacity-35 dark:opacity-40 pointer-events-none z-0" />
      <div className="fixed inset-0 pointer-events-none z-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-10%,rgba(99,102,241,0.12),rgba(255,255,255,0))]" />

      <div className="relative z-10">
        <LandingNavbar />
        <Hero />
        <PathVisualizerDemo />
        <Features />
        <HowItWorks />
        <Footer />
      </div>
    </div>
  );
}
