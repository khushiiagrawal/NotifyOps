'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import {
  Brain,
  Zap,
  MessageCircle,
  BarChart3,
  Shield,
  Container,
  Github,
  Slack,
  Eye,
} from 'lucide-react';

export function FeaturesSection() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Summarization',
      description:
        'OpenAI GPT integration with 10 specialized prompt styles for different analysis needs',
      gradient: 'from-[#4f46e5] to-[#7c3aed]',
      details: ['Custom prompt engineering', 'Context-aware analysis', 'Multiple AI personalities'],
    },
    {
      icon: Zap,
      title: 'Real-time Processing',
      description:
        'Instant webhook processing with sub-100ms response times for immediate insights',
      gradient: 'from-[#f97316] to-[#ec4899]',
      details: ['Webhook automation', 'Lightning-fast processing', 'Zero-delay notifications'],
    },
    {
      icon: MessageCircle,
      title: 'Rich Slack Integration',
      description: 'Beautiful interactive messages with action buttons and threaded conversations',
      gradient: 'from-[#10b981] to-[#06b6d4]',
      details: ['Interactive buttons', 'Thread management', 'Custom formatting'],
    },
    {
      icon: BarChart3,
      title: 'Comprehensive Monitoring',
      description: 'Prometheus metrics with Grafana dashboards for complete observability',
      gradient: 'from-[#8b5cf6] to-[#ec4899]',
      details: ['Real-time metrics', 'Custom dashboards', 'Performance insights'],
    },
    {
      icon: Shield,
      title: 'Production Ready',
      description: 'Health checks, graceful shutdown, error handling, and enterprise security',
      gradient: 'from-[#06b6d4] to-[#3b82f6]',
      details: ['Health monitoring', 'Error recovery', 'Security hardened'],
    },
    {
      icon: Container,
      title: 'Containerized Deployment',
      description: 'Docker and Docker Compose ready with automated CI/CD pipeline support',
      gradient: 'from-[#ec4899] to-[#f97316]',
      details: ['Docker optimized', 'Compose templates', 'CI/CD ready'],
    },
  ];

  return (
    <section id="features" className="py-20 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#1a1a3e]/30 to-transparent" />

      <div ref={ref} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Powerful Features for
            </span>
            <br />
            <span className="bg-gradient-to-r from-[#4f46e5] to-[#7c3aed] bg-clip-text text-transparent">
              Modern Development
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Everything you need to transform GitHub issues into actionable insights with AI-powered
            analysis
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 50 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ scale: 1.05, y: -10 }}
              className="group relative"
            >
              <div className="h-full p-8 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all duration-300 hover:bg-white/10">
                {/* Icon */}
                <div
                  className={`w-16 h-16 rounded-xl bg-gradient-to-r ${feature.gradient} p-4 mb-6 group-hover:scale-110 transition-transform duration-300`}
                >
                  <feature.icon className="w-full h-full text-white" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-white mb-4 group-hover:text-gray-100 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-300 mb-6 leading-relaxed">{feature.description}</p>

                {/* Feature Details */}
                <ul className="space-y-2">
                  {feature.details.map((detail, detailIndex) => (
                    <li key={detailIndex} className="flex items-center text-sm text-gray-400">
                      <div
                        className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${feature.gradient} mr-3`}
                      />
                      {detail}
                    </li>
                  ))}
                </ul>

                {/* Hover Glow Effect */}
                <div
                  className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${feature.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none`}
                />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Integration Showcase */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-20 text-center"
        >
          <h3 className="text-2xl font-bold text-white mb-8">Seamless Integration</h3>
          <div className="flex items-center justify-center space-x-8 md:space-x-16">
            {[
              { icon: Github, name: 'GitHub' },
              { icon: Brain, name: 'OpenAI' },
              { icon: Slack, name: 'Slack' },
              { icon: BarChart3, name: 'Grafana' },
              { icon: Container, name: 'Docker' },
            ].map((integration, index) => (
              <motion.div
                key={integration.name}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={inView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
                whileHover={{ scale: 1.1 }}
                className="flex flex-col items-center space-y-2 group cursor-pointer"
              >
                <div className="w-16 h-16 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 flex items-center justify-center group-hover:bg-white/10 group-hover:border-white/20 transition-all duration-300">
                  <integration.icon className="w-8 h-8 text-gray-400 group-hover:text-white transition-colors" />
                </div>
                <span className="text-sm text-gray-400 group-hover:text-white transition-colors">
                  {integration.name}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
