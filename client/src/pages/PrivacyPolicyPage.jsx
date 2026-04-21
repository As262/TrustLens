import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ShieldCheck, Lock, Eye, Database, Bell, UserCheck, ArrowLeft } from 'lucide-react';

const sections = [
  {
    icon: Eye,
    title: 'Information We Collect',
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/20',
    content: [
      'Account information: name, email address, and password (hashed, never stored in plaintext).',
      'Transaction data: UPI IDs, QR code scans, and trust score results generated during your session.',
      'Usage analytics: anonymized page views and feature interaction events to improve the product.',
      'Device metadata: browser type, OS, and IP address for security and fraud prevention.',
    ],
  },
  {
    icon: Database,
    title: 'How We Use Your Data',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
    content: [
      'To authenticate your identity and secure your account via JWT tokens.',
      'To generate and personalize your Trust Score based on behavioral patterns.',
      'To improve fraud detection accuracy through aggregated, anonymized insights.',
      'To send critical security alerts and account notifications (no marketing spam).',
    ],
  },
  {
    icon: Lock,
    title: 'Data Security',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    content: [
      'All data in transit is encrypted with TLS 1.3.',
      'Passwords are hashed using bcrypt with per-user salts.',
      'JWT tokens expire after 24 hours and are rotated on every login.',
      'No payment credentials are ever stored on TrustLens servers.',
    ],
  },
  {
    icon: UserCheck,
    title: 'Your Rights',
    color: 'text-pink-400',
    bg: 'bg-pink-500/10',
    border: 'border-pink-500/20',
    content: [
      'Right to access: request a copy of all data we hold about you at any time.',
      'Right to deletion: permanently delete your account and all associated data.',
      'Right to correction: update any inaccurate personal information in your profile.',
      'Right to portability: export your transaction history in JSON or CSV format.',
    ],
  },
  {
    icon: Bell,
    title: 'Third-Party Sharing',
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/20',
    content: [
      'We do not sell, rent, or trade your personal data to any third party.',
      'Anonymized aggregate fraud signals may be shared with partnered financial institutions.',
      'We use MongoDB Atlas for database hosting, subject to their security certifications.',
      'Auth tokens are never shared with third-party analytics or advertising platforms.',
    ],
  },
];

const fadeIn = { initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true } };

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-slate-950 font-sans text-white overflow-x-hidden">
      <div className="fixed top-0 left-1/3 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[140px] pointer-events-none -z-10" />

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
            <span className="inline-block px-4 py-1.5 mb-5 text-xs font-semibold tracking-widest uppercase text-purple-400 bg-purple-500/10 border border-purple-500/20 rounded-full">
              Legal
            </span>
            <h1 className="text-5xl font-black text-white mb-4">Privacy Policy</h1>
            <p className="text-slate-400 leading-relaxed">
              Last updated: <span className="text-slate-300">April 21, 2026</span>. TrustLens is committed to protecting your privacy. This policy explains what data we collect, why, and how we keep it secure.
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
            <a href="mailto:privacy@trustlens.ai" className="text-purple-400 hover:text-purple-300 transition-colors">
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
