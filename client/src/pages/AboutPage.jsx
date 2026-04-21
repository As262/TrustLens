import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ShieldCheck, ArrowRight, Zap, Brain, Globe, Users,
  BarChart3, Lock, Star, Code2, Github, Linkedin
} from 'lucide-react';

const stats = [
  { value: '50+', label: 'Risk Signals Analyzed' },
  { value: '<200ms', label: 'Avg. Response Time' },
  { value: '99.9%', label: 'Uptime SLA' },
  { value: '100%', label: 'Explainable Decisions' },
];

const techStack = [
  { name: 'React', color: 'text-blue-400 border-blue-500/30 bg-blue-500/5' },
  { name: 'Node.js', color: 'text-green-400 border-green-500/30 bg-green-500/5' },
  { name: 'MongoDB', color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/5' },
  { name: 'JWT Auth', color: 'text-yellow-400 border-yellow-500/30 bg-yellow-500/5' },
  { name: 'Framer Motion', color: 'text-purple-400 border-purple-500/30 bg-purple-500/5' },
  { name: 'Tailwind CSS', color: 'text-cyan-400 border-cyan-500/30 bg-cyan-500/5' },
  { name: 'REST API', color: 'text-pink-400 border-pink-500/30 bg-pink-500/5' },
  { name: 'Lucide Icons', color: 'text-slate-300 border-slate-500/30 bg-slate-500/5' },
];

const values = [
  {
    icon: Brain,
    title: 'Explainability First',
    desc: 'Every fraud decision comes with a plain-language breakdown. No black boxes — ever.',
    gradient: 'from-purple-500/20 to-purple-500/5',
    iconColor: 'text-purple-400',
  },
  {
    icon: Zap,
    title: 'Real-Time Speed',
    desc: 'Sub-200ms analysis powered by deterministic scoring across 50+ behavioral signals.',
    gradient: 'from-blue-500/20 to-blue-500/5',
    iconColor: 'text-blue-400',
  },
  {
    icon: Users,
    title: 'Community Intelligence',
    desc: 'Crowdsourced scam reports continuously sharpen the defense network in real time.',
    gradient: 'from-emerald-500/20 to-emerald-500/5',
    iconColor: 'text-emerald-400',
  },
  {
    icon: Lock,
    title: 'Privacy by Design',
    desc: `End-to-end encryption and zero-storage policies protect every user's financial data.`,
    gradient: 'from-rose-500/20 to-rose-500/5',
    iconColor: 'text-rose-400',
  },
];

const team = [
  {
    name: 'Devansh Verma',
    role: 'Fullstack Developer & AI Architect',
    avatar: 'DV',
    gradient: 'from-purple-500 to-blue-500',
    linkedin: '#',
    github: 'https://github.com/DevanshVerma21',
  },
  {
    name: 'Aryan Garg',
    role: 'Frontend Developer & Data Analyst',
    avatar: 'AG',
    gradient: 'from-blue-500 to-cyan-500',
    linkedin: '#',
    github: '#',
  },
  {
    name: 'Dishu Singla',
    role: 'UI/UX Designer & QA Engineer',
    avatar: 'DS',
    gradient: 'from-pink-500 to-rose-500',
    linkedin: '#',
    github: '#',
  },
  {
    name: 'Avinav Saini',
    role: 'Backend Developer & API Engineer',
    avatar: 'AS',
    gradient: 'from-emerald-500 to-teal-500',
    linkedin: '#',
    github: '#',
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-950 font-sans text-white overflow-x-hidden">
      {/* Ambient orbs */}
      <div className="fixed top-0 left-1/4 w-[600px] h-[600px] bg-purple-600/15 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="fixed bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none -z-10" />

      {/* Nav */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-4 bg-slate-950/60 backdrop-blur-md border-b border-white/5">
        <Link to="/" className="flex items-center gap-2">
          <ShieldCheck className="w-7 h-7 text-purple-400" />
          <span className="text-lg font-black bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400">
            TrustLens
          </span>
        </Link>
        <nav className="hidden md:flex gap-8 text-sm font-medium text-slate-300">
          <Link to="/" className="hover:text-white transition-colors">Home</Link>
          <Link to="/how-it-works" className="hover:text-white transition-colors">How it Works</Link>
          <Link to="/about" className="text-white font-semibold">About</Link>
        </nav>
        <Link
          to="/app"
          className="px-5 py-2 text-sm font-medium text-white bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-md border border-white/10 transition-all"
        >
          Open App
        </Link>
      </header>

      <main className="pt-24">
        {/* Hero */}
        <section className="py-24 px-6 text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <span className="inline-block px-4 py-1.5 mb-6 text-xs font-semibold tracking-widest uppercase text-purple-400 bg-purple-500/10 border border-purple-500/20 rounded-full">
              Our Mission
            </span>
            <h1 className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight">
              Building Trust in<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
                Every Transaction
              </span>
            </h1>
            <p className="text-slate-400 max-w-2xl mx-auto text-lg leading-relaxed mb-10">
              Millions of people lose money to digital payment fraud each year because existing systems operate as black boxes. TrustLens changes that — every risk decision is{' '}
              <span className="text-white font-semibold">transparent, fast, and explainable</span>.
            </p>
            <Link
              to="/app"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white rounded-full font-semibold transition-all shadow-[0_0_40px_rgba(168,85,247,0.35)] hover:-translate-y-1"
            >
              Get Started Free <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </section>

        {/* Stats */}
        <section className="py-16 px-6">
          <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center p-8 rounded-3xl bg-white/[0.02] border border-white/5 hover:border-purple-500/20 transition-colors"
              >
                <p className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400 mb-2">
                  {stat.value}
                </p>
                <p className="text-slate-400 text-sm">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Values */}
        <section className="py-20 px-6">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold text-white mb-4">What We Stand For</h2>
              <p className="text-slate-400 max-w-xl mx-auto">
                Four core principles drive every line of code in TrustLens.
              </p>
            </motion.div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((v, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className={`group p-8 rounded-3xl bg-gradient-to-b ${v.gradient} border border-white/5 hover:border-white/10 transition-all`}
                >
                  <v.icon className={`w-8 h-8 ${v.iconColor} mb-5`} />
                  <h3 className="text-lg font-bold text-white mb-3">{v.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{v.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Story + Tech */}
        <section className="py-20 px-6">
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8">
            {/* Story */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="p-10 rounded-3xl bg-white/[0.02] border border-white/5"
            >
              <h2 className="text-2xl font-bold text-white mb-6">The Problem We're Solving</h2>
              <div className="space-y-4 text-slate-400 leading-relaxed text-sm">
                <p>Traditional fraud detection returns a binary "block / allow" verdict with no reasoning. Users are left confused, and legitimate transactions get wrongly declined.</p>
                <p>
                  Our engine cross-references{' '}
                  <span className="text-slate-200 font-medium">50+ behavioral, geographic, and historical signals</span> to produce a deterministic Trust Score — and then explains every factor in plain language.
                </p>
                <p>The result: fewer fraud losses, fewer false positives, and complete confidence in every payment decision.</p>
              </div>
            </motion.div>

            {/* Tech Stack */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="p-10 rounded-3xl bg-white/[0.02] border border-white/5"
            >
              <div className="flex items-center gap-2 mb-6">
                <Code2 className="w-5 h-5 text-purple-400" />
                <h2 className="text-2xl font-bold text-white">Built With</h2>
              </div>
              <div className="flex flex-wrap gap-3 mb-8">
                {techStack.map((tech) => (
                  <span
                    key={tech.name}
                    className={`px-4 py-2 text-sm font-medium border rounded-xl transition-colors ${tech.color}`}
                  >
                    {tech.name}
                  </span>
                ))}
              </div>
              <div className="pt-6 border-t border-white/5">
                <p className="text-xs text-slate-500 leading-relaxed">
                  Open-source friendly · Designed for hackathon & production · Modular API architecture
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Team */}
        <section className="py-20 px-6">
          <div className="max-w-5xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-14"
            >
              <h2 className="text-4xl font-bold text-white mb-4">The Team</h2>
              <p className="text-slate-400">Built with passion during the hackathon sprint.</p>
            </motion.div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {team.map((member, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  className="p-8 rounded-3xl bg-white/[0.02] border border-white/5 hover:border-purple-500/20 transition-all flex flex-col items-center gap-4 w-64"
                >
                  <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${member.gradient} flex items-center justify-center text-2xl font-black text-white shadow-lg`}>
                    {member.avatar}
                  </div>
                  <div>
                    <p className="text-white font-bold text-lg">{member.name}</p>
                    <p className="text-slate-400 text-sm mt-1">{member.role}</p>
                  </div>
                  <div className="flex gap-3">
                    <a href={member.github} target="_blank" rel="noreferrer" className="w-9 h-9 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white transition-all">
                      <Github className="w-4 h-4" />
                    </a>
                    <a href={member.linkedin} target="_blank" rel="noreferrer" className="w-9 h-9 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white transition-all">
                      <Linkedin className="w-4 h-4" />
                    </a>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to trust every payment?
            </h2>
            <Link
              to="/app"
              className="inline-flex items-center gap-2 px-10 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white rounded-full font-semibold text-lg transition-all shadow-[0_0_50px_rgba(168,85,247,0.4)] hover:-translate-y-1"
            >
              Open TrustLens <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 px-6 py-6 text-center text-xs text-slate-600">
        © 2026 TrustLens Technologies. All rights reserved.
      </footer>
    </div>
  );
}
