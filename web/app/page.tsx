'use client';

import { HeroSection } from '@/components/sections/HeroSection';
import { FeaturesSection } from '@/components/sections/FeaturesSection';
import { AIPersonalitiesSection } from '@/components/sections/AIPersonalitiesSection';
import { ArchitectureSection } from '@/components/sections/ArchitectureSection';
import { LiveDemoSection } from '@/components/sections/LiveDemoSection';
import { MonitoringSection } from '@/components/sections/MonitoringSection';
import { SetupSection } from '@/components/sections/SetupSection';
import { PricingSection } from '@/components/sections/PricingSection';
import { ContactSection } from '@/components/sections/ContactSection';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { Toaster } from 'react-hot-toast';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0f23] via-[#1a1a3e] to-[#0f0f23] text-white overflow-x-hidden">
      <Navigation />
      <main>
        <HeroSection />
        <FeaturesSection />
        <AIPersonalitiesSection />
        <ArchitectureSection />
        <LiveDemoSection />
        <MonitoringSection />
        <SetupSection />
        <PricingSection />
        <ContactSection />
      </main>
      <Footer />
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: 'rgba(15, 15, 35, 0.9)',
            color: '#ffffff',
            border: '1px solid rgba(79, 70, 229, 0.3)',
            backdropFilter: 'blur(10px)',
          },
        }}
      />
    </div>
  );
}
