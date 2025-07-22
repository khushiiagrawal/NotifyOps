'use client';

import { motion } from 'framer-motion';
import { Bug, GitBranch, AlertTriangle, CheckCircle } from 'lucide-react';

export function FloatingCards() {
  const cards = [
    {
      icon: Bug,
      title: 'Critical Bug',
      status: 'High Priority',
      color: 'from-red-500 to-pink-500',
      delay: 0,
    },
    {
      icon: GitBranch,
      title: 'Feature Request',
      status: 'In Progress',
      color: 'from-blue-500 to-purple-500',
      delay: 0.5,
    },
    {
      icon: AlertTriangle,
      title: 'Security Issue',
      status: 'Urgent',
      color: 'from-orange-500 to-red-500',
      delay: 1,
    },
    {
      icon: CheckCircle,
      title: 'Enhancement',
      status: 'Completed',
      color: 'from-green-500 to-teal-500',
      delay: 1.5,
    },
  ];

  return (
    <div className="absolute inset-0 pointer-events-none">
      {cards.map((card, index) => (
        <motion.div
          key={card.title}
          initial={{ opacity: 0, y: 100, rotate: -10 }}
          animate={{
            opacity: 0.8,
            y: 0,
            rotate: 0,
            x: [0, 20, -20, 0],
          }}
          transition={{
            duration: 2,
            delay: card.delay,
            x: {
              duration: 4,
              repeat: Infinity,
              ease: 'easeInOut',
            },
          }}
          className={`absolute bg-gradient-to-r ${card.color} p-4 rounded-lg backdrop-blur-sm border border-white/20 shadow-lg`}
          style={{
            left: `${20 + index * 15}%`,
            top: `${30 + index * 10}%`,
            transform: `rotate(${-5 + index * 3}deg)`,
          }}
        >
          <div className="flex items-center space-x-3">
            <card.icon className="w-6 h-6 text-white" />
            <div>
              <div className="text-white font-semibold text-sm">{card.title}</div>
              <div className="text-white/80 text-xs">{card.status}</div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
