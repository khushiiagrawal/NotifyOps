"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { 
  Code, 
  Settings, 
  Briefcase, 
  Shield, 
  TrendingUp, 
  Zap, 
  Building, 
  Rocket,
  AlertTriangle
} from 'lucide-react';

export function AIPersonalitiesSection() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  const [selectedPersonality, setSelectedPersonality] = useState(0);

  const personalities: Array<{
    icon: React.ComponentType<{ className?: string }>;
    name: string;
    description: string;
    gradient: string;
    prompt: string;
    useCase: string;
    focus: string[];
  }> = [
    {
      icon: Code,
      name: "Master Analyst",
      description: "Technical Impact Focus",
      gradient: "from-[#4f46e5] to-[#7c3aed]",
      prompt: "Analyze technical complexity, code impact, and architectural implications",
      useCase: "Deep technical analysis for complex issues",
      focus: ["Code complexity", "Architecture impact", "Technical debt"]
    },
    {
      icon: Code,
      name: "Senior Developer",
      description: "Code Quality Expert",
      gradient: "from-[#10b981] to-[#06b6d4]",
      prompt: "Focus on code quality, best practices, and maintainability",
      useCase: "Code review and quality assessment",
      focus: ["Code quality", "Best practices", "Maintainability"]
    },
    {
      icon: Settings,
      name: "DevOps Engineer",
      description: "Operations Focus",
      gradient: "from-[#f97316] to-[#ec4899]",
      prompt: "Analyze deployment, infrastructure, and operational impact",
      useCase: "Infrastructure and deployment planning",
      focus: ["Deployment impact", "Infrastructure", "Operations"]
    },
    {
      icon: Briefcase,
      name: "Product Manager",
      description: "Business Value",
      gradient: "from-[#8b5cf6] to-[#ec4899]",
      prompt: "Assess business value, user impact, and feature priority",
      useCase: "Product planning and prioritization",
      focus: ["Business value", "User impact", "Priority"]
    },
    {
      icon: Shield,
      name: "Security Expert",
      description: "Security Focus",
      gradient: "from-[#dc2626] to-[#f97316]",
      prompt: "Analyze security implications, vulnerabilities, and risks",
      useCase: "Security assessment and risk analysis",
      focus: ["Security risks", "Vulnerabilities", "Compliance"]
    },
    {
      icon: TrendingUp,
      name: "Executive Summary",
      description: "Business Impact",
      gradient: "from-[#06b6d4] to-[#3b82f6]",
      prompt: "High-level business impact and strategic implications",
      useCase: "Executive reporting and decision making",
      focus: ["Business impact", "Strategic value", "ROI"]
    },
    {
      icon: Zap,
      name: "Quick Triage",
      description: "Rapid Assessment",
      gradient: "from-[#eab308] to-[#f97316]",
      prompt: "Quick categorization and immediate action items",
      useCase: "Fast initial triage and categorization",
      focus: ["Quick assessment", "Categorization", "Urgency"]
    },
    {
      icon: Rocket,
      name: "Startup Focused",
      description: "Growth & Speed",
      gradient: "from-[#ec4899] to-[#8b5cf6]",
      prompt: "Focus on speed, growth impact, and resource efficiency",
      useCase: "Startup environments and rapid iteration",
      focus: ["Speed to market", "Growth impact", "Resource efficiency"]
    },
    {
      icon: Building,
      name: "Enterprise",
      description: "Scale & Compliance",
      gradient: "from-[#374151] to-[#6b7280]",
      prompt: "Enterprise considerations: scale, compliance, governance",
      useCase: "Large organizations with complex requirements",
      focus: ["Scalability", "Compliance", "Governance"]
    },
    {
      icon: AlertTriangle,
      name: "Security Critical",
      description: "High Security",
      gradient: "from-[#dc2626] to-[#991b1b]",
      prompt: "Maximum security focus with detailed threat analysis",
      useCase: "Security-critical applications and environments",
      focus: ["Threat analysis", "Security protocols", "Risk mitigation"]
    }
  ];

  return (
    <section id="ai-personalities" className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-[#0f0f23]/80 via-[#1a1a3e]/40 to-[#0f0f23]/80" />
      
      <div ref={ref} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              AI Personalities
            </span>
            <br />
            <span className="bg-gradient-to-r from-[#4f46e5] to-[#7c3aed] bg-clip-text text-transparent">
              Tailored Analysis
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Choose from 10 specialized AI prompt styles, each designed for different analysis perspectives and use cases
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {personalities.map((personality, index) => (
                <motion.div
                  key={personality.name}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={inView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  onClick={() => setSelectedPersonality(index)}
                  className={`p-6 rounded-xl cursor-pointer transition-all duration-300 border ${
                    selectedPersonality === index
                      ? 'bg-white/10 border-white/30 scale-105'
                      : 'bg-white/5 border-white/10 hover:bg-white/8 hover:border-white/20'
                  }`}
                  whileHover={{ scale: selectedPersonality === index ? 1.05 : 1.02 }}
                >
                  <div className="flex items-start space-x-4">
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${personality.gradient} p-3 flex-shrink-0`}>
                      {(() => {
                        const IconComponent = personality.icon;
                        return <IconComponent className="w-full h-full text-white" />;
                      })()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-white mb-1">{personality.name}</h3>
                      <p className="text-sm text-gray-400">{personality.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-1">
            <motion.div
              key={selectedPersonality}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="sticky top-8"
            >
              <div className="p-8 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
                <div className="flex items-center space-x-4 mb-6">
                  <div className={`w-16 h-16 rounded-xl bg-gradient-to-r ${personalities[selectedPersonality].gradient} p-4`}>
                    {(() => {
                      const IconComponent = personalities[selectedPersonality].icon;
                      return <IconComponent className="w-full h-full text-white" />;
                    })()}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">{personalities[selectedPersonality].name}</h3>
                    <p className="text-gray-400">{personalities[selectedPersonality].description}</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <h4 className="font-semibold text-white mb-2">Analysis Focus</h4>
                    <p className="text-gray-300 text-sm leading-relaxed">
                      {personalities[selectedPersonality].prompt}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-white mb-2">Best Use Case</h4>
                    <p className="text-gray-300 text-sm leading-relaxed">
                      {personalities[selectedPersonality].useCase}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-white mb-3">Key Areas</h4>
                    <ul className="space-y-2">
                      {personalities[selectedPersonality].focus.map((area, index) => (
                        <li key={index} className="flex items-center text-sm text-gray-300">
                          <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${personalities[selectedPersonality].gradient} mr-3`} />
                          {area}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-6 p-4 rounded-lg bg-black/20 border border-white/10">
                  <h5 className="text-sm font-semibold text-white mb-2">Sample Analysis</h5>
                  <div className="text-xs text-gray-400 font-mono leading-relaxed">
                    🔍 {personalities[selectedPersonality].name} Analysis:<br />
                    • Technical complexity: High<br />
                    • Impact scope: Critical<br />
                    • Recommended action: Immediate review
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}