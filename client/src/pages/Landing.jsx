import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ReactLenis } from '@studio-freight/react-lenis';
import {
  ShieldCheck,
  ScanLine,
  BrainCircuit,
  Users,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Activity,
  Lock,
  Zap,
  Globe,
  Github,
  Twitter,
  Linkedin,
  Mail,
  BadgeCheck,
  Shield,
  BarChart3
} from 'lucide-react';
import { Link } from 'react-router-dom';

const cn = (...classes) => classes.filter(Boolean).join(' ');

// --- Header ---
const Header = () => (
  <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-4 bg-slate-950/50 backdrop-blur-md border-b border-white/5">
    <div className="flex items-center gap-2">
      <ShieldCheck className="w-8 h-8 text-purple-500" />
      <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400">
        TrustLens
      </span>
    </div>
    <nav className="hidden md:flex gap-8 text-sm font-medium text-slate-300">
      <a href="#features" className="hover:text-white transition-colors">Features</a>
      <Link to="/how-it-works" className="hover:text-white transition-colors">How it Works</Link>
      <Link to="/about" className="hover:text-white transition-colors">About</Link>
    </nav>
    <Link to="/app" className="px-5 py-2 text-sm font-medium text-white bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-md border border-white/10 transition-all">
      Open App
    </Link>
  </header>
);

// --- Hero Section ---
const Hero = () => {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 1000], [0, 300]);
  const opacity = useTransform(scrollY, [0, 500], [1, 0]);

  return (
    <section className="relative min-h-screen flex items-center justify-center pt-24 overflow-hidden">
      {/* Background Glows */}
      <motion.div style={{ y, opacity }} className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-purple-600/30 rounded-full blur-[120px] -z-10" />
      <motion.div style={{ y, opacity }} className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[150px] -z-10" />
      
      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay -z-10" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] -z-10" />

      <div className="max-w-5xl mx-auto px-6 text-center z-10 flex flex-col items-center">
        <h1 className="text-6xl md:text-8xl font-black text-white tracking-tight leading-tight mb-6">
          <motion.span className="inline-block" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.7, ease: "easeOut" }}>Verify</motion.span>{" "}
          <motion.span className="inline-block" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.9, ease: "easeOut" }}>Before</motion.span> <br className="hidden md:block" />{" "}
          <motion.span className="inline-block" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 1.1, ease: "easeOut" }}>You</motion.span>{" "}
          <motion.span className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-500 pb-2" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 1.3, ease: "easeOut" }}>Pay.</motion.span>
        </h1>

        <motion.p 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.6, ease: "easeOut" }}
          className="text-lg md:text-xl text-slate-400 max-w-2xl mb-10 leading-relaxed"
        >
          TrustLens proactively prevents payment fraud by analyzing UPI IDs, QR codes, and payees in real time — delivering instant trust scores with clear, explainable risk signals.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.8, ease: "easeOut" }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <Link to="/app" className="flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white rounded-full font-semibold transition-all shadow-[0_0_40px_rgba(168,85,247,0.4)] hover:shadow-[0_0_60px_rgba(168,85,247,0.6)] hover:-translate-y-1">
            Get Started Free <ArrowRight className="w-5 h-5" />
          </Link>
          <Link to="/app" className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-full font-semibold backdrop-blur-md transition-all hover:-translate-y-1">
            Open Dashboard
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

// --- Features Section ---
const Features = () => {
  const features = [
    {
      title: "Trust Score Engine",
      desc: "Real-time 0-100 scoring based on multi-factor anomaly detection and behavioral history.",
      icon: <Activity className="w-6 h-6 text-blue-400" />
    },
    {
      title: "QR Code Scanner",
      desc: "Instantly scan payment QRs to verify merchant authenticity and intercept malicious links.",
      icon: <ScanLine className="w-6 h-6 text-purple-400" />
    },
    {
      title: "Explainable AI",
      desc: "No black boxes. Get clear, human-readable reasons for every flagged transaction or blocked payee.",
      icon: <BrainCircuit className="w-6 h-6 text-emerald-400" />
    },
    {
      title: "Community Intelligence",
      desc: "Crowdsourced scam reporting continuously updates the defense network in real-time.",
      icon: <Users className="w-6 h-6 text-pink-400" />
    }
  ];

  return (
    <section id="features" className="py-32 px-6 relative">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Built for Absolute Security</h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg">Next-generation tools designed to protect digital payments at scale.</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="group relative p-8 rounded-3xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 rounded-3xl transition-opacity duration-500" />
              <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 shadow-inner">
                {feat.icon}
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">{feat.title}</h3>
              <p className="text-slate-400 leading-relaxed">{feat.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// --- How It Works Section ---
const HowItWorks = () => {
  const steps = [
    { title: "Input Payee", desc: "Scan a QR code or enter a UPI ID." },
    { title: "AI Analysis", desc: "Engine cross-references 50+ risk factors instantly." },
    { title: "Trust Score", desc: "Receive a deterministic score and explanation." },
    { title: "Transact Safely", desc: "Proceed with confidence or block fraudsters." }
  ];

  return (
    <section id="how-it-works" className="py-32 px-6 bg-slate-950/50 border-y border-white/5 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-500/10 blur-[150px] rounded-full pointer-events-none" />
      
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16">
        <div className="lg:w-1/2">
          <motion.h2 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold text-white mb-8"
          >
            Seamless Integration <br/>
            <span className="text-slate-500">Zero Friction.</span>
          </motion.h2>

          <div className="space-y-8">
            {steps.map((step, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="flex gap-6"
              >
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-purple-500/20 border border-purple-500/50 flex items-center justify-center text-purple-300 font-bold shrink-0">
                    {i + 1}
                  </div>
                  {i !== steps.length - 1 && <div className="w-px h-full bg-white/10 mt-4" />}
                </div>
                <div className="pb-8">
                  <h4 className="text-xl font-semibold text-white mb-2">{step.title}</h4>
                  <p className="text-slate-400">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Visual Mockup */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="lg:w-1/2 w-full relative"
        >
          <div className="relative rounded-[2rem] border border-white/10 bg-slate-900/50 p-2 shadow-2xl backdrop-blur-xl">
            <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/10 via-transparent to-blue-500/10 rounded-[2rem]" />
            <div className="relative rounded-[1.5rem] w-full aspect-[4/3] sm:aspect-video bg-slate-950 border border-white/5 overflow-hidden flex flex-col z-0">
              <div className="h-10 bg-slate-900/80 flex items-center px-4 gap-2 border-b border-white/5 backdrop-blur-sm">
                <div className="w-3 h-3 rounded-full bg-slate-700" />
                <div className="w-3 h-3 rounded-full bg-slate-700" />
                <div className="w-3 h-3 rounded-full bg-slate-700" />
              </div>
              <div className="p-4 sm:p-6 flex-1 flex flex-col gap-4">
                <div className="flex items-center gap-4 mb-2">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-purple-500/40 to-blue-500/40 border border-white/10" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 w-1/3 bg-slate-800 rounded" />
                    <div className="h-3 w-1/4 bg-slate-800/50 rounded" />
                  </div>
                </div>
                <div className="h-24 w-full bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-xl border border-white/5 flex flex-col justify-center px-6">
                  <div className="h-3 w-1/5 bg-slate-700/50 rounded mb-3" />
                  <div className="flex justify-between items-center w-full">
                    <div className="h-6 w-1/3 bg-slate-700/80 rounded" />
                    <div className="h-6 w-1/4 bg-purple-500/20 rounded border border-purple-500/30" />
                  </div>
                </div>
                <div className="flex gap-4 flex-1">
                  <div className="flex-1 bg-slate-800/30 rounded-xl border border-white/5 p-4 space-y-3 flex flex-col">
                    <div className="h-3 w-1/2 bg-slate-700/50 rounded" />
                    <div className="flex-1 w-full bg-slate-800/50 rounded border-dashed border-2 border-slate-700/50" />
                  </div>
                  <div className="flex-1 bg-slate-800/30 rounded-xl border border-white/5 flex flex-col justify-center p-4">
                    <div className="bg-slate-800 border border-white/10 p-4 rounded-xl shadow-lg flex items-center gap-4 w-full">
                      <div className="w-12 h-12 rounded-full border-4 border-emerald-500 flex items-center justify-center shrink-0">
                        <span className="text-emerald-400 font-bold">98</span>
                      </div>
                      <div>
                        <p className="text-white font-medium leading-tight">Safe to Pay</p>
                        <p className="text-xs text-slate-400 mt-1">Verified Merchant</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

// --- Footer ---
const REMOVED_DemoSection = () => {
  const [upi, setUpi] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);

  const simulateAnalysis = (e) => {
    e.preventDefault();
    if(!upi) return;
    setAnalyzing(true);
    setResult(null);
    setTimeout(() => {
      setAnalyzing(false);
      const isHighRisk = upi.includes('scam') || upi.includes('unknown');
      setResult({
        score: isHighRisk ? 24 : 96,
        status: isHighRisk ? 'High Risk' : 'Verified Safe',
        color: isHighRisk ? 'text-red-400' : 'text-emerald-400',
        bg: isHighRisk ? 'bg-red-500/10 border-red-500/30' : 'bg-emerald-500/10 border-emerald-500/30',
        reasons: isHighRisk 
          ? ['Unusual cross-border location', 'Reported 12 times today', 'New UPI ID (< 24h)']
          : ['Consistent transaction history', 'Verified business exact match', 'No community flags']
      });
    }, 1500);
  };

  return (
    <section id="demo" className="py-32 px-6 relative">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">Try the AI Engine</h2>
          <p className="text-slate-400">Type any UPI ID (Try 'scammer@ybl' for fraud demo)</p>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-slate-900 border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-blue-500/5 pointer-events-none" />
          
          <form onSubmit={simulateAnalysis} className="flex gap-4 relative z-10 mb-8 max-w-2xl mx-auto">
            <input 
              type="text" 
              value={upi}
              onChange={(e) => setUpi(e.target.value)}
              placeholder="Enter UPI ID (e.g., merchant@bank)"
              className="flex-1 bg-slate-950 border border-white/10 rounded-xl px-6 py-4 text-white focus:outline-none focus:border-purple-500 transition-colors placeholder:text-slate-600"
            />
            <button 
              type="submit"
              disabled={analyzing || !upi}
              className="bg-white text-black px-8 py-4 rounded-xl font-semibold hover:bg-slate-200 transition-colors disabled:opacity-50 flex items-center justify-center min-w-[140px]"
            >
              {analyzing ? <span className="animate-pulse">Scanning...</span> : 'Analyze'}
            </button>
          </form>

          {/* Results Area */}
          <div className="min-h-[160px] max-w-2xl mx-auto">
            {analyzing && (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-4">
                <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                <p>Running multi-factor anomaly detection...</p>
              </div>
            )}
            
            {result && !analyzing && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={cn("p-6 rounded-2xl border", result.bg)}
              >
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h3 className={cn("text-2xl font-bold mb-1", result.color)}>{result.status}</h3>
                    <p className="text-slate-300 font-mono">Trust Score: {result.score}/100</p>
                  </div>
                  {result.score > 50 ? <CheckCircle2 className={cn("w-10 h-10", result.color)} /> : <AlertTriangle className={cn("w-10 h-10", result.color)} />}
                </div>
                
                <div className="space-y-3">
                  <p className="text-sm font-medium text-slate-400 uppercase tracking-wider">AI Explainability Matrix</p>
                  {result.reasons.map((r, i) => (
                    <div key={i} className="flex items-center gap-3 text-slate-200 bg-black/20 px-4 py-3 rounded-lg border border-white/5">
                      <div className={cn("w-2 h-2 rounded-full", result.score > 50 ? "bg-emerald-500" : "bg-red-500")} />
                      {r}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
            
            {!result && !analyzing && (
              <div className="flex items-center justify-center h-full text-slate-600 border-2 border-dashed border-white/5 rounded-2xl p-8">
                Awaiting input for real-time analysis...
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

// --- Footer ---
const footerLinks = {
  Product: [
    { label: 'Trust Score Engine', href: '#features' },
    { label: 'QR Code Scanner', href: '#features' },
    { label: 'Explainable AI', href: '#features' },
    { label: 'Live Demo', href: '#demo' },
  ],
  Developers: [
    { label: 'API Reference', href: '#' },
    { label: 'Integration Guide', href: '#' },
    { label: 'Webhook Events', href: '#' },
    { label: 'SDKs', href: '#' },
  ],
  Company: [
    { label: 'About', href: '#' },
    { label: 'Blog', href: '#' },
    { label: 'Privacy Policy', href: '#' },
    { label: 'Terms of Service', href: '#' },
  ],
};

const trustBadges = [
  { icon: Lock, label: 'SOC 2 Type II' },
  { icon: Shield, label: 'ISO 27001' },
  { icon: BadgeCheck, label: 'PCI DSS' },
  { icon: BarChart3, label: '99.9% Uptime' },
];

const socialLinks = [
  { icon: Github, href: 'https://github.com/DevanshVerma21/TrustLens', label: 'GitHub' },
  { icon: Twitter, href: '#', label: 'Twitter' },
  { icon: Linkedin, href: '#', label: 'LinkedIn' },
];

const Footer = () => (
  <footer className="relative border-t border-white/5 bg-slate-950 overflow-hidden">
    {/* Ambient glow */}
    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-purple-600/8 blur-[120px] rounded-full pointer-events-none" />

    {/* ── CTA Band ── */}
    <div className="relative border-b border-white/5 py-16 px-6">
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
        <div>
          <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">
            Ready to stop fraud before it happens?
          </h3>
          <p className="text-slate-400">
            Join TrustLens and get AI-powered protection on every transaction.
          </p>
        </div>
        <Link
          to="/app"
          className="shrink-0 flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white rounded-full font-semibold transition-all shadow-[0_0_30px_rgba(168,85,247,0.35)] hover:shadow-[0_0_50px_rgba(168,85,247,0.5)] hover:-translate-y-0.5"
        >
          Get Started Free <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>


    {/* ── Main Footer Grid ── */}
    <div className="px-6 pt-14 pb-10">
      <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-5 gap-10">
        {/* Brand col */}
        <div className="col-span-2">
          <div className="flex items-center gap-2 mb-5">
            <div className="p-1.5 bg-purple-500/15 rounded-lg ring-1 ring-purple-500/30">
              <ShieldCheck className="w-5 h-5 text-purple-400" />
            </div>
            <span className="text-lg font-black text-white">TrustLens</span>
          </div>
          <p className="text-slate-400 text-sm leading-relaxed max-w-xs mb-6">
            Explainable AI for the modern financial stack. Real-time fraud detection with full transparency on every decision.
          </p>
          {/* Social links */}
          <div className="flex items-center gap-3">
            {socialLinks.map(({ icon: Icon, href, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer"
                aria-label={label}
                className="w-9 h-9 flex items-center justify-center rounded-lg bg-white/4 hover:bg-white/8 border border-white/8 hover:border-purple-500/40 text-slate-400 hover:text-white transition-all"
              >
                <Icon className="w-4 h-4" />
              </a>
            ))}
          </div>
          {/* Newsletter */}
          <div className="mt-6">
            <p className="text-xs text-slate-500 mb-2 uppercase tracking-wider font-medium">Stay Updated</p>
            <form
              onSubmit={(e) => e.preventDefault()}
              className="flex items-center gap-2"
            >
              <div className="flex-1 flex items-center gap-2 bg-white/4 border border-white/8 rounded-xl px-3 py-2">
                <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <input
                  type="email"
                  placeholder="your@email.com"
                  className="bg-transparent text-xs text-white placeholder-slate-600 outline-none w-full"
                />
              </div>
              <button
                type="submit"
                className="px-3 py-2 bg-purple-600/70 hover:bg-purple-500/80 text-white text-xs rounded-xl transition-colors font-medium"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Link columns */}
        {Object.entries(footerLinks).map(([category, links]) => (
          <div key={category}>
            <p className="text-white text-sm font-semibold mb-4">{category}</p>
            <ul className="space-y-3">
              {links.map(({ label, href }) => (
                <li key={label}>
                  <a
                    href={href}
                    className="text-slate-400 text-sm hover:text-white transition-colors"
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>

    {/* ── Bottom Bar ── */}
    <div className="border-t border-white/5 px-6 py-5">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600">
        <p>© 2026 TrustLens Technologies. All rights reserved.</p>
        <div className="flex items-center gap-1">
          <Zap className="w-3 h-3 text-purple-500" />
          <span>Built with Explainable AI for a safer digital economy</span>
        </div>
        <div className="flex gap-5">
          <Link to="/privacy-policy" className="hover:text-slate-300 transition-colors">Privacy</Link>
          <Link to="/terms" className="hover:text-slate-300 transition-colors">Terms</Link>
          <Link to="/cookies" className="hover:text-slate-300 transition-colors">Cookies</Link>
        </div>
      </div>
    </div>
  </footer>
);

// --- Custom Cursor Glow ---
const CursorGlow = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const updateMousePosition = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', updateMousePosition);
    return () => window.removeEventListener('mousemove', updateMousePosition);
  }, []);

  return (
    <motion.div
      className="pointer-events-none fixed top-0 left-0 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[100px] z-50 mix-blend-screen"
      animate={{
        x: mousePosition.x - 200,
        y: mousePosition.y - 200,
      }}
      transition={{ type: "tween", ease: "backOut", duration: 0.1 }}
    />
  );
};

// --- Main App / Export ---
export default function LandingPage() {
  return (
    <ReactLenis root>
      <div className="min-h-screen bg-slate-950 font-sans selection:bg-purple-500/30 overflow-x-hidden">
        <CursorGlow />
        <Header />
        <main>
          <Hero />
          <Features />
          <HowItWorks />
        </main>
        <Footer />
      </div>
    </ReactLenis>
  );
}
