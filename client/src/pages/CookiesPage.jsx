import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ShieldCheck, Cookie, Settings, ToggleLeft, Info, ArrowLeft } from 'lucide-react';

const cookieTypes = [
  {
    icon: ShieldCheck,
    title: 'Strictly Necessary Cookies',
    required: true,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    content: [
      'Authentication tokens (JWT) that keep you logged in securely across sessions.',
      'CSRF protection tokens that defend against cross-site request forgery attacks.',
      'Session identifiers that maintain your state between page navigations.',
      'These cookies cannot be disabled as they are essential for the service to function.',
    ],
  },
  {
    icon: Info,
    title: 'Analytics Cookies',
    required: false,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
    content: [
      'Anonymized page view counters to understand which features are most used.',
      'Error tracking cookies that help us identify and fix bugs faster.',
      'Performance timing cookies that measure page load times across regions.',
      'No personally identifiable information is ever linked to analytics cookies.',
    ],
  },
  {
    icon: Settings,
    title: 'Preference Cookies',
    required: false,
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/20',
    content: [
      'Theme preference (dark/light mode) stored locally in your browser.',
      'Sidebar collapsed/expanded state for a consistent dashboard experience.',
      'Notification preferences so alerts behave the way you configured them.',
      'These preferences are stored in localStorage, not transmitted to our servers.',
    ],
  },
  {
    icon: ToggleLeft,
    title: 'Managing Your Cookies',
    required: null,
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/20',
    content: [
      'You can clear all cookies at any time through your browser settings.',
      'Disabling necessary cookies will log you out and may break core functionality.',
      'Analytics and preference cookies can be disabled without affecting core features.',
      'TrustLens does not use any third-party advertising or tracking cookies.',
    ],
  },
];

const fadeIn = { initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true } };

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-slate-950 font-sans text-white overflow-x-hidden">
      <div className="fixed bottom-0 left-1/3 w-[500px] h-[500px] bg-emerald-600/8 rounded-full blur-[140px] pointer-events-none -z-10" />

      {/* Nav */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-4 bg-slate-950/60 backdrop-blur-md border-b border-white/5">
        <Link to="/" className="flex items-center gap-2">
          <ShieldCheck className="w-7 h-7 text-purple-400" />
          <span className="text-lg font-black bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400">TrustLens</span>
        </Link>
        <Link to="/" className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
      </header>

      <main className="pt-32 pb-24 px-6">
        <div className="max-w-3xl mx-auto">
          <motion.div {...fadeIn} className="mb-14">
            <span className="inline-block px-4 py-1.5 mb-5 text-xs font-semibold tracking-widest uppercase text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
              Legal
            </span>
            <h1 className="text-5xl font-black text-white mb-4">Cookie Policy</h1>
            <p className="text-slate-400 leading-relaxed">
              Last updated: <span className="text-slate-300">April 21, 2026</span>. TrustLens uses a minimal set of cookies to keep your session secure and your preferences intact. Here is exactly what we use and why.
            </p>
          </motion.div>

          <div className="space-y-6">
            {cookieTypes.map((s, i) => (
              <motion.div
                key={i}
                {...fadeIn}
                transition={{ delay: i * 0.08 }}
                className={`p-8 rounded-2xl border ${s.border} bg-white/[0.02]`}
              >
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl ${s.bg}`}>
                      <s.icon className={`w-5 h-5 ${s.color}`} />
                    </div>
                    <h2 className="text-xl font-bold text-white">{s.title}</h2>
                  </div>
                  {s.required === true && (
                    <span className="px-3 py-1 text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full">
                      Required
                    </span>
                  )}
                  {s.required === false && (
                    <span className="px-3 py-1 text-xs font-semibold bg-slate-500/10 text-slate-400 border border-slate-500/20 rounded-full">
                      Optional
                    </span>
                  )}
                </div>
                <ul className="space-y-3">
                  {s.content.map((item, j) => (
                    <li key={j} className="flex items-start gap-3 text-slate-400 text-sm leading-relaxed">
                      <Cookie className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${s.color} opacity-60`} />
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>

          <motion.p {...fadeIn} className="text-slate-500 text-sm mt-10 text-center">
            Questions about cookies? Contact us at{' '}
            <a href="mailto:privacy@trustlens.ai" className="text-emerald-400 hover:text-emerald-300 transition-colors">
              privacy@trustlens.ai
            </a>
          </motion.p>
        </div>
      </main>

      <footer className="border-t border-white/5 px-6 py-6 text-center text-xs text-slate-600">
        © 2026 TrustLens Technologies. All rights reserved.
      </footer>
    </div>
  );
}
