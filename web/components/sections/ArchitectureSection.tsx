'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import {
  ArrowRight,
  Github,
  Brain,
  MessageCircle,
  BarChart3,
  Server,
  Database,
  Cloud,
} from 'lucide-react';

export function ArchitectureSection() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const flowSteps = [
    {
      icon: Github,
      title: 'GitHub Webhook',
      description: 'Issue events trigger real-time processing',
      color: 'from-[#24292e] to-[#586069]',
    },
    {
      icon: Server,
      title: 'Go Service',
      description: 'High-performance webhook processing',
      color: 'from-[#00add8] to-[#5dc9e2]',
    },
    {
      icon: Brain,
      title: 'OpenAI API',
      description: 'AI-powered analysis and summarization',
      color: 'from-[#10a37f] to-[#26d0ce]',
    },
    {
      icon: MessageCircle,
      title: 'Slack Integration',
      description: 'Rich notifications with action buttons',
      color: 'from-[#4a154b] to-[#350d36]',
    },
    {
      icon: BarChart3,
      title: 'Monitoring',
      description: 'Prometheus metrics & Grafana dashboards',
      color: 'from-[#e6522c] to-[#f46800]',
    },
  ];

  const components = [
    {
      name: 'Load Balancer',
      description: 'High availability traffic distribution',
      position: { top: '10%', left: '10%' },
    },
    {
      name: 'API Gateway',
      description: 'Request routing and authentication',
      position: { top: '10%', right: '10%' },
    },
    {
      name: 'Webhook Service',
      description: 'GitHub event processing',
      position: { top: '40%', left: '15%' },
    },
    {
      name: 'AI Service',
      description: 'OpenAI integration layer',
      position: { top: '40%', right: '15%' },
    },
    {
      name: 'Notification Service',
      description: 'Slack message delivery',
      position: { bottom: '40%', left: '15%' },
    },
    {
      name: 'Metrics Service',
      description: 'Prometheus data collection',
      position: { bottom: '40%', right: '15%' },
    },
    {
      name: 'Database',
      description: 'Configuration and state storage',
      position: { bottom: '10%', left: '10%' },
    },
    {
      name: 'Cache Layer',
      description: 'Redis for performance optimization',
      position: { bottom: '10%', right: '10%' },
    },
  ];

  return (
    <section id="architecture" className="py-20 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0f0f23] via-[#1a1a3e] to-[#0f0f23]" />

      <div ref={ref} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              System Architecture
            </span>
            <br />
            <span className="bg-gradient-to-r from-[#4f46e5] to-[#7c3aed] bg-clip-text text-transparent">
              Built for Scale
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Enterprise-grade architecture designed for high availability, scalability, and real-time
            processing
          </p>
        </motion.div>

        {/* Data Flow Visualization */}
        <div className="mb-20">
          <h3 className="text-2xl font-bold text-white text-center mb-12">Data Flow Pipeline</h3>

          <div className="flex flex-col lg:flex-row items-center justify-between space-y-8 lg:space-y-0 lg:space-x-4">
            {flowSteps.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={inView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="relative flex flex-col items-center"
              >
                {/* Step Card */}
                <div className="group relative">
                  <div
                    className={`w-24 h-24 rounded-2xl bg-gradient-to-r ${step.color} p-6 mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}
                  >
                    <step.icon className="w-full h-full text-white" />
                  </div>

                  <div className="text-center max-w-xs">
                    <h4 className="font-semibold text-white mb-2">{step.title}</h4>
                    <p className="text-sm text-gray-400">{step.description}</p>
                  </div>

                  {/* Glow Effect */}
                  <div
                    className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${step.color} opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300 pointer-events-none`}
                  />
                </div>

                {/* Arrow */}
                {index < flowSteps.length - 1 && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={inView ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.5, delay: index * 0.2 + 0.3 }}
                    className="hidden lg:block absolute -right-8 top-12"
                  >
                    <ArrowRight className="w-6 h-6 text-gray-400" />

                    {/* Animated Particles */}
                    <motion.div
                      animate={{ x: [0, 32, 0] }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                      className="absolute top-2 left-2 w-2 h-2 bg-gradient-to-r from-[#4f46e5] to-[#7c3aed] rounded-full"
                    />
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* 3D Architecture Diagram */}
        <div className="relative">
          <h3 className="text-2xl font-bold text-white text-center mb-12">System Components</h3>

          <div className="relative h-96 bg-gradient-to-br from-[#1a1a3e]/30 to-[#0f0f23]/30 rounded-3xl border border-white/10 backdrop-blur-sm overflow-hidden">
            {/* Grid Background */}
            <div className="absolute inset-0 opacity-10">
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: `radial-gradient(circle at 25px 25px, rgba(255,255,255,0.2) 2px, transparent 0)`,
                  backgroundSize: '50px 50px',
                }}
              />
            </div>

            {/* Components */}
            {components.map((component, index) => (
              <motion.div
                key={component.name}
                initial={{ opacity: 0, scale: 0 }}
                animate={inView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="absolute group cursor-pointer"
                style={component.position}
                whileHover={{ scale: 1.1 }}
              >
                <div className="relative">
                  <div className="w-20 h-20 bg-gradient-to-r from-[#4f46e5]/20 to-[#7c3aed]/20 rounded-xl border border-white/20 backdrop-blur-sm flex items-center justify-center group-hover:bg-gradient-to-r group-hover:from-[#4f46e5]/40 group-hover:to-[#7c3aed]/40 transition-all duration-300">
                    <div className="w-8 h-8 bg-gradient-to-r from-[#4f46e5] to-[#7c3aed] rounded-lg flex items-center justify-center">
                      <Server className="w-5 h-5 text-white" />
                    </div>
                  </div>

                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                    <div className="bg-black/90 backdrop-blur-sm text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap border border-white/20">
                      <div className="font-semibold">{component.name}</div>
                      <div className="text-gray-400">{component.description}</div>
                    </div>
                  </div>
                </div>

                {/* Connection Lines */}
                <svg className="absolute inset-0 pointer-events-none">
                  <line
                    x1="50%"
                    y1="50%"
                    x2="60%"
                    y2="60%"
                    stroke="rgba(79, 70, 229, 0.3)"
                    strokeWidth="1"
                    strokeDasharray="4,4"
                  />
                </svg>
              </motion.div>
            ))}

            {/* Central Hub */}
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={inView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
            >
              <div className="w-32 h-32 bg-gradient-to-r from-[#4f46e5] to-[#7c3aed] rounded-3xl flex items-center justify-center shadow-2xl shadow-[#4f46e5]/25">
                <div className="text-center">
                  <Cloud className="w-12 h-12 text-white mx-auto mb-2" />
                  <div className="text-white font-bold text-sm">NotifyOps</div>
                  <div className="text-white/80 text-xs">Core</div>
                </div>
              </div>

              {/* Pulsing Ring */}
              <motion.div
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.2, 0.5] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute inset-0 rounded-3xl border-2 border-[#4f46e5] pointer-events-none"
              />
            </motion.div>
          </div>
        </div>

        {/* Technical Specifications */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {[
            {
              title: 'Performance',
              specs: ['< 100ms response time', '10k+ requests/minute', '99.9% uptime SLA'],
            },
            {
              title: 'Scalability',
              specs: ['Horizontal auto-scaling', 'Load balancing', 'Multi-region deployment'],
            },
            {
              title: 'Security',
              specs: ['End-to-end encryption', 'OAuth 2.0 / JWT', 'SOC 2 compliant'],
            },
          ].map((category, index) => (
            <div
              key={category.title}
              className="p-6 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10"
            >
              <h4 className="font-bold text-white mb-4">{category.title}</h4>
              <ul className="space-y-2">
                {category.specs.map((spec, specIndex) => (
                  <li key={specIndex} className="flex items-center text-sm text-gray-300">
                    <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-[#10b981] to-[#06b6d4] mr-3" />
                    {spec}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
