'use client';

import { Header } from '@/components/landing/header';
import { Hero } from '@/components/landing/hero';
import { Vision } from '@/components/landing/vision';
import { Solutions } from '@/components/landing/solutions';
import { Architecture } from '@/components/landing/architecture';
import { TechStack } from '@/components/landing/tech-stack';
import { FAQ } from '@/components/landing/faq';
import { CtaDemo } from '@/components/landing/cta-demo';
import { JsonLd } from '@/components/landing/json-ld';
import { Footer } from '@/components/landing/footer';
import { useEffect } from 'react';

export default function LandingPage() {
  useEffect(() => {
    // Force scroll to top on refresh
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-background selection:bg-primary/10 transition-colors duration-500 overflow-x-hidden">
      <JsonLd />
      {/* modern background elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-[-5%] left-[-5%] w-[35%] h-[35%] rounded-full bg-primary/5 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[35%] h-[35%] rounded-full bg-blue-500/5 blur-[120px] animate-pulse delay-1000" />

        {/* subtle grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:60px_60px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      </div>

      <Header />

      <main>
        <Hero />
        <Vision />
        <Solutions />
        <Architecture />
        <TechStack />
        <FAQ />
        <CtaDemo />
      </main>

      <Footer />
    </div>
  );
}
