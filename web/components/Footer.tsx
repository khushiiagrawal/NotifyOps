"use client";

import { motion } from 'framer-motion';
import { Github, Twitter, MessageCircle, Mail, ArrowUp } from 'lucide-react';

export function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const footerLinks = {
    product: [
      { name: "Features", href: "#features" },
      { name: "AI Personalities", href: "#ai-personalities" },
      { name: "Architecture", href: "#architecture" },
      { name: "Monitoring", href: "#monitoring" },
    ],
    resources: [
      { name: "Documentation", href: "#" },
      { name: "GitHub", href: "#" },
      { name: "Community", href: "#" },
      { name: "Blog", href: "#" },
    ],
    company: [
      { name: "About", href: "#" },
      { name: "Contact", href: "#contact" },
      { name: "Privacy", href: "#" },
      { name: "Terms", href: "#" },
    ]
  };

  return (
    <footer className="relative bg-gradient-to-b from-[#1a1a3e] to-[#0f0f23] border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-16">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Brand Section */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="space-y-4"
              >
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-[#4f46e5] to-[#7c3aed] rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">NO</span>
                  </div>
                  <span className="text-xl font-bold bg-gradient-to-r from-[#4f46e5] to-[#7c3aed] bg-clip-text text-transparent">
                    NotifyOps
                  </span>
                </div>
                <p className="text-gray-400 leading-relaxed">
                  AI-powered GitHub issue intelligence for modern development teams. 
                  Transform issues into actionable insights with real-time Slack notifications.
                </p>
                <div className="flex space-x-4">
                  {[
                    { icon: Github, href: "#", label: "GitHub" },
                    { icon: Twitter, href: "#", label: "Twitter" },
                    { icon: MessageCircle, href: "#", label: "Discord" },
                    { icon: Mail, href: "#contact", label: "Contact" }
                  ].map((social) => (
                    <a
                      key={social.label}
                      href={social.href}
                      className="w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 flex items-center justify-center text-gray-400 hover:text-white transition-all duration-200"
                      aria-label={social.label}
                    >
                      <social.icon className="w-5 h-5" />
                    </a>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Links Sections */}
            <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-8">
              {Object.entries(footerLinks).map(([category, links], index) => (
                <motion.div
                  key={category}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <h3 className="text-white font-semibold mb-4 capitalize">
                    {category}
                  </h3>
                  <ul className="space-y-3">
                    {links.map((link) => (
                      <li key={link.name}>
                        <a
                          href={link.href}
                          className="text-gray-400 hover:text-white transition-colors duration-200 text-sm"
                        >
                          {link.name}
                        </a>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="py-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <div className="text-gray-400 text-sm">
              © 2024 NotifyOps. All rights reserved.
            </div>
            
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2 text-gray-400 text-sm">
                <div className="w-2 h-2 bg-[#10b981] rounded-full animate-pulse" />
                <span>All systems operational</span>
              </div>
              
              <button
                onClick={scrollToTop}
                className="w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 flex items-center justify-center text-gray-400 hover:text-white transition-all duration-200"
                aria-label="Scroll to top"
              >
                <ArrowUp className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}