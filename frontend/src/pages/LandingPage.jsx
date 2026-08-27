import React from 'react';
import { LandingNavbar } from '../components/landing/LandingNavbar';
import { Hero } from '../components/landing/Hero';
import { Features } from '../components/landing/Features';
import { HowItWorks } from '../components/landing/HowItWorks';
import { PathVisualizerDemo } from '../components/landing/PathVisualizerDemo';
import { Footer } from '../components/landing/Footer';

export function LandingPage() {
  return (
    <div className="min-h-screen text-stone-900 dark:text-stone-100 selection:bg-amber-400 selection:text-black transition-colors duration-200">
      <LandingNavbar />
      <Hero />
      <PathVisualizerDemo />
      <Features />
      <HowItWorks />
      <Footer />
    </div>
  );
}
