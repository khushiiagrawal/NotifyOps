"use client";

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Play, ArrowRight, Github, Zap, Brain, MessageCircle } from 'lucide-react';
import { ThreeBackground } from '@/components/ThreeBackground';
import { TypewriterText } from '@/components/TypewriterText';
import { FloatingCards } from '@/components/FloatingCards';

export function HeroSection() {
  const features = [
    { icon: Brain, text: "AI-Powered Analysis" },
    { icon: Zap, text: "Real-time Processing" },
    { icon: MessageCircle, text: "Smart Slack Integration" },
    { icon: Github, text: "GitHub Native" }
  ];

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Three.js Animated Background */}
      <ThreeBackground />
      
      {/* Floating Issue Cards */}
      <FloatingCards />
      
      {/* Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#0f0f23]/80 via-transparent to-[#0f0f23]/80" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#1a1a3e]/50 to-[#0f0f23]/90" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-8"
        >
          {/* Main Headline */}
          <div className="space-y-4">
            <motion.h1 
              className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.2 }}
            >
              <span className="bg-gradient-to-r from-white via-[#e5e7eb] to-white bg-clip-text text-transparent">
                AI-Powered
              </span>
              <br />
              <span className="bg-gradient-to-r from-[#4f46e5] via-[#7c3aed] to-[#ec4899] bg-clip-text text-transparent">
                GitHub Issue
              </span>
              <br />
              <span className="bg-gradient-to-r from-[#10b981] to-[#06b6d4] bg-clip-text text-transparent">
                Intelligence
              </span>
            </motion.h1>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="text-lg md:text-xl lg:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed"
            >
              <TypewriterText 
                text="Transform GitHub issues into actionable insights with AI-powered analysis and real-time Slack notifications"
                delay={1000}
              />
            </motion.div>
          </div>

          {/* Feature Highlights */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto"
          >
            {features.map((feature, index) => (
              <motion.div
                key={feature.text}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 1.2 + index * 0.1 }}
                className="flex flex-col items-center space-y-2 p-4 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10"
                whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.1)' }}
              >
                <feature.icon className="w-6 h-6 text-[#4f46e5]" />
                <span className="text-sm text-gray-300">{feature.text}</span>
              </motion.div>
            ))}
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.0 }}
            className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6"
          >
            <Button 
              size="lg"
              className="bg-gradient-to-r from-[#4f46e5] to-[#7c3aed] hover:from-[#3730a3] hover:to-[#5b21b6] text-white px-8 py-4 text-lg font-semibold shadow-lg shadow-[#4f46e5]/25 hover:shadow-[#4f46e5]/40 transition-all duration-300"
            >
              Get Started Free
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            
            <Button 
              variant="outline"
              size="lg"
              className="border-white/20 text-white hover:bg-white/10 px-8 py-4 text-lg font-semibold backdrop-blur-sm"
            >
              <Play className="mr-2 w-5 h-5" />
              Watch Demo
            </Button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.2 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto pt-16"
          >
            {[
              { number: "99.9%", label: "Uptime" },
              { number: "<100ms", label: "Response Time" },
              { number: "10+", label: "AI Personalities" }
            ].map((stat, index) => (
              <div key={stat.label} className="text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5, delay: 1.5 + index * 0.1 }}
                  className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-[#10b981] to-[#06b6d4] bg-clip-text text-transparent"
                >
                  {stat.number}
                </motion.div>
                <div className="text-gray-400 mt-1">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 2 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center"
        >
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-1 h-3 bg-white/60 rounded-full mt-2"
          />
        </motion.div>
      </motion.div>
    </section>
  );
}