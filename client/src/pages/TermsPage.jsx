import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ShieldCheck, FileText, AlertTriangle, Ban, Scale, ArrowLeft } from 'lucide-react';

const sections = [
  {
    icon: FileText,
    title: 'Acceptance of Terms',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
    content: [
      'By accessing or using TrustLens, you agree to be bound by these Terms of Service.',
      'If you do not agree with any part of these terms, you may not access the service.',
      'These terms apply to all users, including visitors, registered users, and contributors.',
      'TrustLens reserves the right to update these terms at any time with prior notice.',
    ],
  },
  {
    icon: ShieldCheck,
    title: 'Permitted Use',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    content: [
      'TrustLens is intended solely for personal payment fraud prevention and trust verification.',
      'You may use the service to analyze UPI IDs, QR codes, and payee identities.',
      'You may report suspicious payees through the community reporting system.',
      'Commercial use or integration into third-party apps requires explicit written permission.',
    ],
  },
  {
    icon: Ban,
    title: 'Prohibited Activities',
    color: 'text-rose-400',
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/20',
    content: [
      'Attempting to reverse-engineer, scrape, or exploit the TrustLens API without authorization.',
      'Submitting false fraud reports to manipulate trust scores of legitimate payees.',
      'Using the platform to conduct any activity that violates applicable laws or regulations.',
      'Sharing your account credentials with third parties or creating accounts under false identities.',
    ],
  },
  {
    icon: AlertTriangle,
    title: 'Disclaimers & Limitations',
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/20',
    content: [
      'Trust scores are indicative and not a guarantee of payment safety. Always exercise judgement.',
      'TrustLens is not liable for financial losses arising from acting on score recommendations.',
      'The service is provided "as is" without warranties of any kind, express or implied.',
      'We reserve the right to suspend accounts that violate these terms without prior notice.',
    ],
  },
  {
    icon: Scale,
    title: 'Governing Law',
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/20',
    content: [
      'These terms are governed by the laws of India, without regard to conflict of law provisions.',
      'Any disputes shall be subject to the exclusive jurisdiction of courts in India.',
      'If any provision is found unenforceable, the remaining provisions remain in full effect.',
      'Our failure to enforce any right or provision does not waive our right to do so in future.',
    ],
  },
];

const fadeIn = { initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true } };

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-950 font-sans text-white overflow-x-hidden">
      <div className="fixed top-0 right-1/3 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none -z-10" />

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
            <span className="inline-block px-4 py-1.5 mb-5 text-xs font-semibold tracking-widest uppercase text-blue-400 bg-blue-500/10 border border-blue-500/20 rounded-full">
              Legal
            </span>
            <h1 className="text-5xl font-black text-white mb-4">Terms of Service</h1>
            <p className="text-slate-400 leading-relaxed">
              Last updated: <span className="text-slate-300">April 21, 2026</span>. Please read these terms carefully before using TrustLens. By using our platform, you agree to the following conditions.
            </p>
          </motion.div>

          <div className="space-y-6">
            {sections.map((s, i) => (
              <motion.div
                key={i}
                {...fadeIn}
                transition={{ delay: i * 0.08 }}
                className={`p-8 rounded-2xl border ${s.border} bg-white/[0.02]`}
              >
                <div className="flex items-center gap-3 mb-5">
                  <div className={`p-2 rounded-xl ${s.bg}`}>
                    <s.icon className={`w-5 h-5 ${s.color}`} />
                  </div>
                  <h2 className="text-xl font-bold text-white">{s.title}</h2>
                </div>
                <ul className="space-y-3">
                  {s.content.map((item, j) => (
                    <li key={j} className="flex items-start gap-3 text-slate-400 text-sm leading-relaxed">
                      <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${s.color.replace('text-', 'bg-')}`} />
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>

          <motion.p {...fadeIn} className="text-slate-500 text-sm mt-10 text-center">
            Questions? Contact us at{' '}
            <a href="mailto:legal@trustlens.ai" className="text-blue-400 hover:text-blue-300 transition-colors">
              legal@trustlens.ai
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
