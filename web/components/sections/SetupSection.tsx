'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import {
  Terminal,
  Copy,
  CheckCircle,
  Github,
  Settings,
  Webhook,
  Key,
  MessageCircle,
  Download,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export function SetupSection() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const [activeStep, setActiveStep] = useState(0);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const setupSteps = [
    {
      icon: Download,
      title: 'Clone Repository',
      description: 'Get the NotifyOps source code',
      code: `git clone https://github.com/notifyops/notifyops.git
cd notifyops`,
      config: null,
    },
    {
      icon: Settings,
      title: 'Environment Setup',
      description: 'Configure your environment variables',
      code: `cp .env.example .env`,
      config: {
        title: 'Environment Variables',
        content: `# GitHub Configuration
GITHUB_WEBHOOK_SECRET=your-webhook-secret

# OpenAI Configuration
OPENAI_API_KEY=sk-your-api-key
OPENAI_MODEL=gpt-4

# Slack Configuration
SLACK_BOT_TOKEN=xoxb-your-bot-token
SLACK_WEBHOOK_URL=https://hooks.slack.com/your-webhook

# Monitoring
PROMETHEUS_PORT=9090
GRAFANA_PORT=3000`,
      },
    },
    {
      icon: Webhook,
      title: 'GitHub Webhook',
      description: 'Configure GitHub webhook for your repository',
      code: `# Webhook URL
https://your-domain.com/webhook/github

# Events to subscribe to:
- Issues
- Issue comments
- Pull requests`,
      config: {
        title: 'Webhook Settings',
        content: `Payload URL: https://your-domain.com/webhook/github
Content type: application/json
Secret: your-webhook-secret
SSL verification: Enable

Events:
☑️ Issues
☑️ Issue comments  
☑️ Pull requests
☑️ Pull request reviews`,
      },
    },
    {
      icon: Key,
      title: 'API Keys Setup',
      description: 'Configure OpenAI and Slack credentials',
      code: `# Get your OpenAI API key from:
# https://platform.openai.com/api-keys

# Create Slack app and get bot token:
# https://api.slack.com/apps`,
      config: {
        title: 'Required Permissions',
        content: `Slack Bot Token Scopes:
- chat:write
- chat:write.public
- channels:read
- groups:read
- im:read
- mpim:read

OpenAI:
- API key with GPT-4 access
- Sufficient token quota`,
      },
    },
    {
      icon: Terminal,
      title: 'Deploy with Docker',
      description: 'Start all services with Docker Compose',
      code: `# Build and start all services
docker-compose up -d

# Check logs
docker-compose logs -f notifyops

# Stop services
docker-compose down`,
      config: null,
    },
  ];

  const copyToClipboard = (text: string, identifier: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(identifier);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <section id="setup" className="py-20 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0f0f23] via-[#1a1a3e]/60 to-[#0f0f23]" />

      <div ref={ref} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Quick Setup
            </span>
            <br />
            <span className="bg-gradient-to-r from-[#4f46e5] to-[#7c3aed] bg-clip-text text-transparent">
              Get Started in Minutes
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Follow our step-by-step guide to deploy NotifyOps in your environment
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Steps Navigation */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-4"
          >
            {setupSteps.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                onClick={() => setActiveStep(index)}
                className={`p-4 rounded-xl cursor-pointer transition-all duration-300 border ${
                  activeStep === index
                    ? 'bg-white/10 border-white/30'
                    : 'bg-white/5 border-white/10 hover:bg-white/8'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-10 h-10 rounded-lg p-2 flex items-center justify-center ${
                      activeStep === index
                        ? 'bg-gradient-to-r from-[#4f46e5] to-[#7c3aed]'
                        : 'bg-white/10'
                    }`}
                  >
                    <step.icon className="w-full h-full text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{step.title}</h3>
                    <p className="text-sm text-gray-400">{step.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Code/Configuration Display */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="lg:col-span-2 space-y-6"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold text-white">
                Step {activeStep + 1}: {setupSteps[activeStep].title}
              </h3>
              <div className="text-sm text-gray-400">
                {activeStep + 1} of {setupSteps.length}
              </div>
            </div>

            {/* Code Block */}
            <div className="relative">
              <div className="p-6 rounded-xl bg-[#0d1117] border border-gray-600">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <Terminal className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-400">Terminal</span>
                  </div>
                  <Button
                    onClick={() =>
                      copyToClipboard(setupSteps[activeStep].code, `step-${activeStep}`)
                    }
                    variant="ghost"
                    size="sm"
                    className="text-gray-400 hover:text-white"
                  >
                    {copiedCode === `step-${activeStep}` ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                <pre className="text-sm text-gray-300 font-mono leading-relaxed overflow-x-auto">
                  {setupSteps[activeStep].code}
                </pre>
              </div>
            </div>

            {/* Configuration Panel */}
            {setupSteps[activeStep].config && (
              <div className="relative">
                <div className="p-6 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <Settings className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-400">
                        {setupSteps[activeStep].config!.title}
                      </span>
                    </div>
                    <Button
                      onClick={() =>
                        copyToClipboard(
                          setupSteps[activeStep].config!.content,
                          `config-${activeStep}`,
                        )
                      }
                      variant="ghost"
                      size="sm"
                      className="text-gray-400 hover:text-white"
                    >
                      {copiedCode === `config-${activeStep}` ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                  <pre className="text-sm text-gray-300 font-mono leading-relaxed overflow-x-auto whitespace-pre-wrap">
                    {setupSteps[activeStep].config!.content}
                  </pre>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <Button
                onClick={() => setActiveStep(Math.max(0, activeStep - 1))}
                disabled={activeStep === 0}
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10"
              >
                Previous
              </Button>

              <div className="flex space-x-2">
                {setupSteps.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === activeStep ? 'bg-[#4f46e5]' : 'bg-gray-600'
                    }`}
                  />
                ))}
              </div>

              <Button
                onClick={() => setActiveStep(Math.min(setupSteps.length - 1, activeStep + 1))}
                disabled={activeStep === setupSteps.length - 1}
                className="bg-gradient-to-r from-[#4f46e5] to-[#7c3aed]"
              >
                Next
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Quick Links */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {[
            {
              icon: Github,
              title: 'GitHub Repository',
              description: 'View source code and documentation',
              link: 'https://github.com/notifyops/notifyops',
            },
            {
              icon: MessageCircle,
              title: 'Community Support',
              description: 'Join our Discord for help and discussions',
              link: 'https://discord.gg/notifyops',
            },
            {
              icon: Settings,
              title: 'Documentation',
              description: 'Complete setup and configuration guide',
              link: 'https://docs.notifyops.com',
            },
          ].map((link, index) => (
            <motion.div
              key={link.title}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
              className="p-6 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 group cursor-pointer"
            >
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-[#4f46e5] to-[#7c3aed] p-3 group-hover:scale-110 transition-transform duration-300">
                  <link.icon className="w-full h-full text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-2 group-hover:text-gray-100 transition-colors">
                    {link.title}
                  </h3>
                  <p className="text-gray-300 text-sm leading-relaxed">{link.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
