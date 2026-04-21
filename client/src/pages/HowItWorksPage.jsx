import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ShieldCheck, ArrowRight, ScanLine, BrainCircuit,
  Activity, ChevronDown, CheckCircle2
} from 'lucide-react';

const steps = [
  {
    number: '01',
    title: 'Input a Payee',
    desc: 'Enter a UPI ID, phone number, or scan a QR code from any payment app. TrustLens accepts any standard format instantly.',
    icon: ScanLine,
    color: 'purple',
    detail: [
      'Supports all major UPI formats (name@bank, number@upi)',
      'QR code parsing extracts embedded payee metadata',
      'Works with merchant codes, personal IDs, and VPA aliases',
    ],
  },
  {
    number: '02',
    title: 'AI Multi-Factor Analysis',
    desc: 'Our deterministic engine cross-references 50+ risk signals across behavioral history, geolocation, community flags, and account age.',
    icon: BrainCircuit,
    color: 'blue',
    detail: [
      'Behavioral fingerprinting across historical transaction patterns',
      'Cross-border & geo-anomaly detection in real time',
      'Community report aggregation from verified reporters',
      'UPI ID registration age and velocity checks',
    ],
  },
  {
    number: '03',
    title: 'Trust Score Generated',
    desc: 'A 0–100 Trust Score is produced deterministically — no randomness, no magic. Every point is backed by a specific, explainable factor.',
    icon: Activity,
    color: 'emerald',
    detail: [
      'Score above 70 = Low Risk (Safe to proceed)',
      'Score 40–70 = Medium Risk (Proceed with caution)',
      'Score below 40 = High Risk (Transaction blocked)',
      'Score is deterministic — same input always yields the same output',
    ],
  },
  {
    number: '04',
    title: 'Explainability Matrix',
    desc: 'You see exactly why a score was assigned — a plain-language breakdown of every contributing factor, ranked by impact.',
    icon: BrainCircuit,
    color: 'pink',
    detail: [
      'Ranked list of top risk contributors in plain English',
      'Color-coded factor severity (critical / warning / safe)',
      'Actionable recommendation for each flagged factor',
    ],
  },
  {
    number: '05',
    title: 'Transact with Confidence',
    desc: 'Proceed knowing exactly what you\'re dealing with. Block the payee, report fraud, or transact safely — the decision is always yours.',
    icon: CheckCircle2,
    color: 'teal',
    detail: [
      'One-click fraud report flows directly into the community DB',
      'Blocked transactions are logged with full audit trail',
      'Safe transactions confirm with a verifiable trust receipt',
    ],
  },
];

const colorMap = {
  purple: {
    ring: 'ring-purple-500/40',
    bg: 'bg-purple-500/10',
    text: 'text-purple-400',
    border: 'border-purple-500/30',
    dot: 'bg-purple-400',
    line: 'bg-gradient-to-b from-purple-500/40 to-transparent',
    glow: 'shadow-[0_0_30px_rgba(168,85,247,0.2)]',
  },
  blue: {
    ring: 'ring-blue-500/40',
    bg: 'bg-blue-500/10',
    text: 'text-blue-400',
    border: 'border-blue-500/30',
    dot: 'bg-blue-400',
    line: 'bg-gradient-to-b from-blue-500/40 to-transparent',
    glow: 'shadow-[0_0_30px_rgba(59,130,246,0.2)]',
  },
  emerald: {
    ring: 'ring-emerald-500/40',
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-400',
    border: 'border-emerald-500/30',
    dot: 'bg-emerald-400',
    line: 'bg-gradient-to-b from-emerald-500/40 to-transparent',
    glow: 'shadow-[0_0_30px_rgba(16,185,129,0.2)]',
  },
  pink: {
    ring: 'ring-pink-500/40',
    bg: 'bg-pink-500/10',
    text: 'text-pink-400',
    border: 'border-pink-500/30',
    dot: 'bg-pink-400',
    line: 'bg-gradient-to-b from-pink-500/40 to-transparent',
    glow: 'shadow-[0_0_30px_rgba(236,72,153,0.2)]',
  },
  teal: {
    ring: 'ring-teal-500/40',
    bg: 'bg-teal-500/10',
    text: 'text-teal-400',
    border: 'border-teal-500/30',
    dot: 'bg-teal-400',
    line: 'bg-gradient-to-b from-teal-500/40 to-transparent',
    glow: 'shadow-[0_0_30px_rgba(20,184,166,0.2)]',
  },
};

function StepCard({ step, index, isOpen, toggle }) {
  const c = colorMap[step.color];
  const Icon = step.icon;
  return (
    <motion.div
      initial={{ opacity: 0, x: -30 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      className="flex gap-6"
    >
      {/* Timeline */}
      <div className="flex flex-col items-center">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm ring-1 ${c.ring} ${c.bg} ${c.text} shrink-0`}>
          {step.number}
        </div>
        {index < steps.length - 1 && (
          <div className={`w-px flex-1 mt-4 min-h-[2rem] ${c.line}`} />
        )}
      </div>

      {/* Content card */}
      <div className={`flex-1 mb-8 rounded-2xl border ${c.border} bg-white/[0.02] overflow-hidden ${isOpen ? c.glow : ''} transition-all duration-300`}>
        <button
          onClick={toggle}
          className="w-full p-6 flex items-start gap-4 text-left"
        >
          <Icon className={`w-6 h-6 mt-0.5 shrink-0 ${c.text}`} />
          <div className="flex-1">
            <h3 className="text-xl font-bold text-white mb-1">{step.title}</h3>
            <p className="text-slate-400 text-sm leading-relaxed">{step.desc}</p>
          </div>
          <ChevronDown
            className={`w-5 h-5 text-slate-500 mt-1 shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
          />
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className={`border-t ${c.border} px-6 py-5 space-y-3`}>
                {step.detail.map((d, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${c.dot}`} />
                    <p className="text-slate-300 text-sm">{d}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export default function HowItWorksPage() {
  const [openIndex, setOpenIndex] = useState(0);

  const toggle = (i) => setOpenIndex(openIndex === i ? null : i);

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-white overflow-x-hidden">
      {/* Ambient orbs */}
      <div className="fixed top-0 right-1/4 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="fixed bottom-0 left-1/4 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none -z-10" />

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
          <Link to="/how-it-works" className="text-white font-semibold">How it Works</Link>
          <Link to="/about" className="hover:text-white transition-colors">About</Link>
        </nav>
        <Link
          to="/app"
          className="px-5 py-2 text-sm font-medium text-white bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-md border border-white/10 transition-all"
        >
          Login/Sign Up
        </Link>
      </header>

      <main className="pt-24">
        {/* Hero */}
        <section className="py-24 px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <span className="inline-block px-4 py-1.5 mb-6 text-xs font-semibold tracking-widest uppercase text-blue-400 bg-blue-500/10 border border-blue-500/20 rounded-full">
              Zero Friction · Full Transparency
            </span>
            <h1 className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight">
              How TrustLens<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                Actually Works
              </span>
            </h1>
            <p className="text-slate-400 max-w-2xl mx-auto text-lg leading-relaxed">
              A five-step, fully deterministic pipeline that turns a UPI ID or QR scan into
              an explainable fraud verdict — in under 200ms.
            </p>
          </motion.div>
        </section>

        {/* Steps */}
        <section className="py-10 px-6 pb-24">
          <div className="max-w-3xl mx-auto">
            <p className="text-xs text-slate-500 uppercase tracking-widest font-medium mb-10 text-center">
              Click any step to expand details
            </p>
            {steps.map((step, i) => (
              <StepCard
                key={i}
                step={step}
                index={i}
                isOpen={openIndex === i}
                toggle={() => toggle(i)}
              />
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 px-6 text-center border-t border-white/5">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              See it in action
            </h2>
            <p className="text-slate-400 mb-8 max-w-md mx-auto">
              Sign in to run real fraud analysis on any UPI ID — it takes under 10 seconds.
            </p>
            <Link
              to="/app"
              className="inline-flex items-center gap-2 px-10 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white rounded-full font-semibold text-lg transition-all shadow-[0_0_50px_rgba(168,85,247,0.4)] hover:-translate-y-1"
            >
              Open TrustLens <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </section>
      </main>

      <footer className="border-t border-white/5 px-6 py-6 text-center text-xs text-slate-600">
        © 2026 TrustLens Technologies. All rights reserved.
      </footer>
    </div>
  );
}
