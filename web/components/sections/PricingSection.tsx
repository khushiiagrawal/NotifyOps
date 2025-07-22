'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Check, Star, Zap, Building, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function PricingSection() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const plans = [
    {
      name: 'Open Source',
      description: 'Perfect for individual developers and small teams',
      price: 'Free',
      period: 'forever',
      icon: Star,
      color: 'from-[#10b981] to-[#06b6d4]',
      features: [
        'Self-hosted deployment',
        'All AI personalities',
        'GitHub integration',
        'Slack notifications',
        'Basic monitoring',
        'Community support',
        'Docker deployment',
        'Open source license',
      ],
      cta: 'Get Started',
      popular: false,
    },
    {
      name: 'Pro Cloud',
      description: 'Managed service for growing teams',
      price: '$29',
      period: 'per month',
      icon: Zap,
      color: 'from-[#4f46e5] to-[#7c3aed]',
      features: [
        'Everything in Open Source',
        'Managed hosting',
        'Advanced analytics',
        'Priority support',
        '99.9% SLA',
        'Auto-scaling',
        'Backup & recovery',
        'Team collaboration',
      ],
      cta: 'Start Free Trial',
      popular: true,
    },
    {
      name: 'Enterprise',
      description: 'Custom solutions for large organizations',
      price: 'Custom',
      period: 'pricing',
      icon: Building,
      color: 'from-[#8b5cf6] to-[#ec4899]',
      features: [
        'Everything in Pro Cloud',
        'On-premise deployment',
        'SSO integration',
        'Custom integrations',
        'Dedicated support',
        'SLA guarantees',
        'Security compliance',
        'White-label options',
      ],
      cta: 'Contact Sales',
      popular: false,
    },
  ];

  return (
    <section id="pricing" className="py-20 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#0f0f23]/90 via-[#1a1a3e]/40 to-[#0f0f23]/90" />

      <div ref={ref} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Choose Your
            </span>
            <br />
            <span className="bg-gradient-to-r from-[#4f46e5] to-[#7c3aed] bg-clip-text text-transparent">
              Deployment Option
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            From open source self-hosting to fully managed enterprise solutions
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 50 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className={`relative ${plan.popular ? 'lg:scale-105' : ''}`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                  <div className="bg-gradient-to-r from-[#4f46e5] to-[#7c3aed] text-white px-4 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </div>
                </div>
              )}

              <div
                className={`h-full p-8 rounded-2xl backdrop-blur-sm border transition-all duration-300 hover:scale-105 ${
                  plan.popular
                    ? 'bg-white/10 border-white/30 shadow-xl shadow-[#4f46e5]/10'
                    : 'bg-white/5 border-white/10 hover:bg-white/8 hover:border-white/20'
                }`}
              >
                {/* Header */}
                <div className="text-center mb-8">
                  <div
                    className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-r ${plan.color} p-4`}
                  >
                    <plan.icon className="w-full h-full text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                  <p className="text-gray-400 mb-4">{plan.description}</p>
                  <div className="flex items-baseline justify-center">
                    <span className="text-4xl font-bold text-white">{plan.price}</span>
                    {plan.period && <span className="text-gray-400 ml-2">/{plan.period}</span>}
                  </div>
                </div>

                {/* Features */}
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <motion.li
                      key={feature}
                      initial={{ opacity: 0, x: -20 }}
                      animate={inView ? { opacity: 1, x: 0 } : {}}
                      transition={{ duration: 0.5, delay: 0.2 + index * 0.1 + featureIndex * 0.05 }}
                      className="flex items-center text-gray-300"
                    >
                      <Check className="w-5 h-5 text-[#10b981] mr-3 flex-shrink-0" />
                      <span>{feature}</span>
                    </motion.li>
                  ))}
                </ul>

                {/* CTA Button */}
                <Button
                  className={`w-full ${
                    plan.popular
                      ? 'bg-gradient-to-r from-[#4f46e5] to-[#7c3aed] hover:from-[#3730a3] hover:to-[#5b21b6]'
                      : 'bg-white/10 hover:bg-white/20 border border-white/20'
                  }`}
                  size="lg"
                >
                  {plan.cta}
                </Button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Security & Compliance */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-20 text-center"
        >
          <div className="flex items-center justify-center space-x-8 mb-8">
            <div className="flex items-center space-x-2">
              <Shield className="w-6 h-6 text-[#10b981]" />
              <span className="text-gray-300">SOC 2 Compliant</span>
            </div>
            <div className="flex items-center space-x-2">
              <Shield className="w-6 h-6 text-[#10b981]" />
              <span className="text-gray-300">GDPR Ready</span>
            </div>
            <div className="flex items-center space-x-2">
              <Shield className="w-6 h-6 text-[#10b981]" />
              <span className="text-gray-300">ISO 27001</span>
            </div>
          </div>

          <div className="max-w-2xl mx-auto p-6 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
            <h3 className="text-xl font-bold text-white mb-4">Enterprise Features</h3>
            <p className="text-gray-300 leading-relaxed">
              Need custom integrations, on-premise deployment, or enterprise-grade security? Our
              team works with you to create a solution that fits your organization&apos;s specific
              requirements.
            </p>
            <Button className="mt-4 bg-gradient-to-r from-[#8b5cf6] to-[#ec4899]" size="lg">
              Schedule Demo
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
