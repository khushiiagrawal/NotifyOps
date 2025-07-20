"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  CheckCircle, 
  AlertTriangle, 
  Bug,
  GitBranch,
  MessageCircle,
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export function LiveDemoSection() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedIssue, setSelectedIssue] = useState(0);

  const sampleIssues = [
    {
      id: "#1234",
      title: "Memory leak in authentication service",
      type: "bug",
      priority: "high",
      labels: ["bug", "memory-leak", "authentication"],
      author: "john-doe",
      icon: Bug,
      color: "from-red-500 to-pink-500"
    },
    {
      id: "#1235",
      title: "Add dark mode support to dashboard",
      type: "feature",
      priority: "medium",
      labels: ["enhancement", "ui", "dark-mode"],
      author: "jane-smith",
      icon: GitBranch,
      color: "from-blue-500 to-purple-500"
    },
    {
      id: "#1236",
      title: "Database connection timeout in production",
      type: "bug",
      priority: "critical",
      labels: ["bug", "database", "production"],
      author: "dev-team",
      icon: AlertTriangle,
      color: "from-orange-500 to-red-500"
    }
  ];

  const processingSteps = [
    { name: "Webhook Received", duration: 200 },
    { name: "Issue Analysis", duration: 800 },
    { name: "AI Processing", duration: 1200 },
    { name: "Slack Notification", duration: 400 }
  ];

  const slackMessage = {
    title: "🐛 Critical Issue Detected",
    summary: "Memory leak identified in authentication service - requires immediate attention",
    analysis: [
      "**Impact**: High - Authentication performance degradation",
      "**Severity**: Critical - Memory usage increasing over time",
      "**Recommendation**: Immediate code review and hotfix deployment"
    ],
    actions: ["View Issue", "Assign Developer", "Create Hotfix Branch"]
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentStep((prev) => {
          if (prev >= processingSteps.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 1500);
    }

    return () => clearInterval(interval);
  }, [isPlaying, processingSteps.length]);

  const handlePlay = () => {
    if (currentStep >= processingSteps.length - 1) {
      setCurrentStep(0);
    }
    setIsPlaying(true);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentStep(0);
  };

  return (
    <section id="demo" className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-[#0f0f23]/90 via-[#1a1a3e]/60 to-[#0f0f23]/90" />
      
      <div ref={ref} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Live Demo
            </span>
            <br />
            <span className="bg-gradient-to-r from-[#4f46e5] to-[#7c3aed] bg-clip-text text-transparent">
              See It In Action
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Experience real-time GitHub issue processing with AI analysis and Slack notifications
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-white">GitHub Issues</h3>
                <div className="flex space-x-2">
                  <Button
                    onClick={handlePlay}
                    disabled={isPlaying}
                    className="bg-gradient-to-r from-[#10b981] to-[#06b6d4]"
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </Button>
                  <Button
                    onClick={handleReset}
                    variant="outline"
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                {sampleIssues.map((issue, index) => (
                  <motion.div
                    key={issue.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={inView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                    onClick={() => setSelectedIssue(index)}
                    className={`p-6 rounded-xl cursor-pointer transition-all duration-300 border ${
                      selectedIssue === index
                        ? 'bg-white/10 border-white/30 scale-105'
                        : 'bg-white/5 border-white/10 hover:bg-white/8'
                    }`}
                  >
                    <div className="flex items-start space-x-4">
                      <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${issue.color} p-3 flex-shrink-0`}>
                        <issue.icon className="w-full h-full text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="text-sm font-mono text-gray-400">{issue.id}</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            issue.priority === 'critical' ? 'bg-red-500/20 text-red-300' :
                            issue.priority === 'high' ? 'bg-orange-500/20 text-orange-300' :
                            'bg-blue-500/20 text-blue-300'
                          }`}>
                            {issue.priority}
                          </span>
                        </div>
                        <h4 className="font-semibold text-white mb-2 truncate">{issue.title}</h4>
                        <div className="flex flex-wrap gap-1 mb-2">
                          {issue.labels.map((label) => (
                            <span key={label} className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded">
                              {label}
                            </span>
                          ))}
                        </div>
                        <p className="text-sm text-gray-400">by {issue.author}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="mt-8 p-6 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
                <h4 className="font-semibold text-white mb-4">Processing Pipeline</h4>
                <div className="space-y-3">
                  {processingSteps.map((step, index) => (
                    <div key={step.name} className="flex items-center space-x-3">
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        index <= currentStep
                          ? 'border-green-500 bg-green-500'
                          : 'border-gray-400 bg-transparent'
                      }`}>
                        {index <= currentStep && <CheckCircle className="w-4 h-4 text-white" />}
                      </div>
                      <span className={`${
                        index <= currentStep ? 'text-white' : 'text-gray-400'
                      }`}>
                        {step.name}
                      </span>
                      {index === currentStep && isPlaying && (
                        <div className="ml-auto">
                          <div className="w-4 h-4 border-2 border-[#4f46e5] border-t-transparent rounded-full animate-spin" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-white">Slack Notification</h3>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={currentStep >= 3 ? { opacity: 1, scale: 1 } : { opacity: 0.5, scale: 0.9 }}
                transition={{ duration: 0.5 }}
                className="p-6 rounded-xl bg-[#1a1d29] border border-[#2d3748] shadow-2xl"
              >
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-[#4f46e5] to-[#7c3aed] rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">NO</span>
                  </div>
                  <div>
                    <div className="font-semibold text-white">NotifyOps</div>
                    <div className="text-xs text-gray-400">Today at {new Date().toLocaleTimeString()}</div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-lg font-bold text-white">{slackMessage.title}</h4>
                  <p className="text-gray-300">{slackMessage.summary}</p>
                  
                  <div className="p-4 rounded-lg bg-[#2d3748] border-l-4 border-[#4f46e5]">
                    <div className="font-semibold text-white mb-2">🤖 AI Analysis</div>
                    <div className="space-y-1">
                      {slackMessage.analysis.map((point, index) => (
                        <div key={index} className="text-sm text-gray-300">{point}</div>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {slackMessage.actions.map((action, index) => (
                      <button
                        key={action}
                        className="px-4 py-2 bg-[#4f46e5] hover:bg-[#3730a3] text-white text-sm rounded-lg transition-colors duration-200"
                      >
                        {action}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-600">
                    <div className="flex items-center space-x-2 text-sm text-gray-400">
                      <MessageCircle className="w-4 h-4" />
                      <span>Reply in thread</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-400">
                      <ExternalLink className="w-4 h-4" />
                      <span>View in GitHub</span>
                    </div>
                  </div>
                </div>
              </motion.div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
                  <div className="text-2xl font-bold text-white">100ms</div>
                  <div className="text-sm text-gray-400">Processing Time</div>
                </div>
                <div className="p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
                  <div className="text-2xl font-bold text-white">99.9%</div>
                  <div className="text-sm text-gray-400">Delivery Rate</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}