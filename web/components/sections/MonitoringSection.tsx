"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { BarChart3, Activity, Clock, AlertTriangle } from 'lucide-react';

export function MonitoringSection() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  const [metrics, setMetrics] = useState({
    requestRate: 1250,
    responseTime: 85,
    uptime: 99.9,
    activeConnections: 156
  });

  const [chartData, setChartData] = useState<number[]>([]);

  useEffect(() => {
    // Simulate real-time metrics
    const interval = setInterval(() => {
      setMetrics(prev => ({
        requestRate: prev.requestRate + Math.floor(Math.random() * 100 - 50),
        responseTime: Math.max(50, prev.responseTime + Math.floor(Math.random() * 20 - 10)),
        uptime: 99.9,
        activeConnections: Math.max(100, prev.activeConnections + Math.floor(Math.random() * 20 - 10))
      }));

      setChartData(prev => {
        const newData = [...prev, Math.random() * 100];
        return newData.slice(-20); // Keep last 20 points
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const monitoringFeatures = [
    {
      icon: BarChart3,
      title: "Prometheus Metrics",
      description: "Comprehensive metrics collection for all system components",
      color: "from-[#e6522c] to-[#f46800]"
    },
    {
      icon: Activity,
      title: "Grafana Dashboards",
      description: "Beautiful visualizations and real-time monitoring",
      color: "from-[#f46800] to-[#fb923c]"
    },
    {
      icon: Clock,
      title: "Performance Tracking",
      description: "Response times, throughput, and latency monitoring",
      color: "from-[#10b981] to-[#06b6d4]"
    },
    {
      icon: AlertTriangle,
      title: "Smart Alerting",
      description: "Intelligent alerts with context and recommended actions",
      color: "from-[#f59e0b] to-[#f97316]"
    }
  ];

  return (
    <section id="monitoring" className="py-20 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0f0f23] via-[#1a1a3e]/80 to-[#0f0f23]" />
      
      <div ref={ref} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Monitoring &
            </span>
            <br />
            <span className="bg-gradient-to-r from-[#4f46e5] to-[#7c3aed] bg-clip-text text-transparent">
              Analytics
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Complete observability with Prometheus metrics, Grafana dashboards, and intelligent alerting
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left Side - Features */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-8"
          >
            {monitoringFeatures.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
                className="group"
              >
                <div className="flex items-start space-x-4 p-6 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300">
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${feature.color} p-3 flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="w-full h-full text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white mb-2 group-hover:text-gray-100 transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-gray-300 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Right Side - Live Dashboard */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="space-y-6"
          >
            <h3 className="text-2xl font-bold text-white">Live Metrics Dashboard</h3>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 gap-4">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="p-6 rounded-xl bg-gradient-to-br from-[#4f46e5]/20 to-[#7c3aed]/20 border border-[#4f46e5]/30 backdrop-blur-sm"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">Request Rate</span>
                  <BarChart3 className="w-4 h-4 text-[#4f46e5]" />
                </div>
                <div className="text-2xl font-bold text-white">{metrics.requestRate.toLocaleString()}</div>
                <div className="text-xs text-gray-400">requests/min</div>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                className="p-6 rounded-xl bg-gradient-to-br from-[#10b981]/20 to-[#06b6d4]/20 border border-[#10b981]/30 backdrop-blur-sm"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">Response Time</span>
                  <Clock className="w-4 h-4 text-[#10b981]" />
                </div>
                <div className="text-2xl font-bold text-white">{metrics.responseTime}ms</div>
                <div className="text-xs text-gray-400">avg latency</div>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                className="p-6 rounded-xl bg-gradient-to-br from-[#f97316]/20 to-[#ec4899]/20 border border-[#f97316]/30 backdrop-blur-sm"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">Uptime</span>
                  <Activity className="w-4 h-4 text-[#f97316]" />
                </div>
                <div className="text-2xl font-bold text-white">{metrics.uptime}%</div>
                <div className="text-xs text-gray-400">availability</div>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                className="p-6 rounded-xl bg-gradient-to-br from-[#8b5cf6]/20 to-[#ec4899]/20 border border-[#8b5cf6]/30 backdrop-blur-sm"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">Connections</span>
                  <AlertTriangle className="w-4 h-4 text-[#8b5cf6]" />
                </div>
                <div className="text-2xl font-bold text-white">{metrics.activeConnections}</div>
                <div className="text-xs text-gray-400">active</div>
              </motion.div>
            </div>

            {/* Chart */}
            <div className="p-6 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
              <h4 className="font-semibold text-white mb-4">Performance Trend</h4>
              <div className="h-32 flex items-end space-x-1">
                {Array.from({ length: 20 }).map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ height: 0 }}
                    animate={{ height: `${20 + Math.random() * 80}%` }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                    className="flex-1 bg-gradient-to-t from-[#4f46e5] to-[#7c3aed] rounded-t opacity-80"
                  />
                ))}
              </div>
              <div className="flex justify-between text-xs text-gray-400 mt-2">
                <span>20min ago</span>
                <span>Now</span>
              </div>
            </div>

            {/* Alert Status */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-[#10b981]/20 to-[#06b6d4]/20 border border-[#10b981]/30">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-[#10b981] rounded-full animate-pulse" />
                <span className="text-white font-medium">All Systems Operational</span>
              </div>
              <p className="text-sm text-gray-300 mt-1">
                No active alerts • Last incident: 14 days ago
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}