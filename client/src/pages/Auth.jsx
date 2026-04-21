import React, { useState, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import {
  Lock, Mail, User as UserIcon, ShieldCheck, ArrowRight,
  Loader2, AlertTriangle, CheckCircle2, ArrowLeft, Send, KeyRound
} from 'lucide-react';
import { authAPI } from '../utils/api';

/* ─────────────────────────────────────────────
   Floating Particle Background
───────────────────────────────────────────── */
const Particle = ({ style }) => (
  <motion.div
    className="absolute rounded-full pointer-events-none"
    style={{ ...style, background: 'radial-gradient(circle, rgba(99,102,241,0.4) 0%, transparent 70%)' }}
    animate={{ y: [0, -40, 0], opacity: [0.1, 0.5, 0.1], scale: [1, 1.3, 1] }}
    transition={{
      duration: style.duration,
      repeat: Infinity,
      delay: style.delay,
      ease: 'easeInOut',
    }}
  />
);

const particles = Array.from({ length: 16 }, (_, i) => ({
  id: i,
  style: {
    width: (Math.sin(i * 1.3) * 4 + 6) + 'px',
    height: (Math.sin(i * 1.3) * 4 + 6) + 'px',
    left: ((i * 6.25) % 100) + '%',
    top: ((i * 13) % 100) + '%',
    duration: Math.cos(i) * 2 + 4,
    delay: i * 0.3,
  },
}));

/* ─────────────────────────────────────────────
   Input Field Component
───────────────────────────────────────────── */
const InputField = ({ icon: Icon, label, name, type, value, onChange, placeholder, required }) => {
  const [focused, setFocused] = useState(false);
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-widest">{label}</label>
      <div
        className="relative rounded-2xl transition-all duration-300"
        style={{
          boxShadow: focused
            ? '0 0 0 2px rgba(99,102,241,0.5), inset 0 0 0 1px rgba(99,102,241,0.3)'
            : '0 0 0 1px rgba(255,255,255,0.07)',
        }}
      >
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Icon
            className="h-4 w-4 transition-colors duration-300"
            style={{ color: focused ? '#818cf8' : '#475569' }}
          />
        </div>
        <input
          name={name}
          type={type}
          required={required}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="block w-full pl-11 pr-4 text-white placeholder-slate-600 text-sm rounded-2xl h-12 transition-all outline-none"
          placeholder={placeholder}
          style={{
            background: focused ? 'rgba(99,102,241,0.06)' : 'rgba(255,255,255,0.03)',
          }}
        />
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────
   Forgot Password View
───────────────────────────────────────────── */
const ForgotPasswordView = ({ onBack }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(null);
  const [focused, setFocused] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    setError(null);
    setLoading(true);
    // Simulate a network call (replace with real API when backend supports it)
    await new Promise((resolve) => setTimeout(resolve, 1800));
    setLoading(false);
    setSent(true);
  };

  return (
    <motion.div
      key="forgot"
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
    >
      {/* Back button */}
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors mb-7 group"
      >
        <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-0.5 transition-transform" />
        Back to Sign In
      </button>

      {/* Icon + heading */}
      <div className="flex flex-col items-center mb-8">
        <div
          className="p-3 rounded-2xl mb-4"
          style={{
            background: 'rgba(99,102,241,0.12)',
            boxShadow: '0 0 24px rgba(99,102,241,0.2), inset 0 0 0 1px rgba(99,102,241,0.2)',
          }}
        >
          <KeyRound className="h-7 w-7 text-indigo-400" />
        </div>
        <h2 className="text-xl font-bold text-white">
          {sent ? 'Check your inbox' : 'Reset your password'}
        </h2>
        <p className="text-sm text-slate-500 mt-1 text-center">
          {sent
            ? `We've sent a reset link to ${email}`
            : `Enter your email and we'll send you a reset link.`}
        </p>
      </div>

      <AnimatePresence mode="wait">
        {!sent ? (
          /* ── Email form ── */
          <motion.form
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            {error && (
              <div
                className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm text-red-400"
                style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}
              >
                <AlertTriangle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-widest">
                Email Address
              </label>
              <div
                className="relative rounded-2xl transition-all duration-300"
                style={{
                  boxShadow: focused
                    ? '0 0 0 2px rgba(99,102,241,0.5), inset 0 0 0 1px rgba(99,102,241,0.3)'
                    : '0 0 0 1px rgba(255,255,255,0.07)',
                }}
              >
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail
                    className="h-4 w-4 transition-colors"
                    style={{ color: focused ? '#818cf8' : '#475569' }}
                  />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocused(true)}
                  onBlur={() => setFocused(false)}
                  placeholder="you@example.com"
                  className="block w-full pl-11 pr-4 text-white placeholder-slate-600 text-sm rounded-2xl h-12 outline-none transition-all"
                  style={{ background: focused ? 'rgba(99,102,241,0.06)' : 'rgba(255,255,255,0.03)' }}
                />
              </div>
            </div>

            <div className="pt-2">
              <motion.button
                whileHover={{ scale: 1.01, boxShadow: '0 0 40px rgba(99,102,241,0.4)' }}
                whileTap={{ scale: 0.99 }}
                type="submit"
                disabled={loading}
                className="w-full relative flex justify-center items-center py-3.5 rounded-2xl text-sm font-bold text-white overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                  boxShadow: '0 4px 24px rgba(79,70,229,0.35)',
                  opacity: loading ? 0.75 : 1,
                  cursor: loading ? 'not-allowed' : 'pointer',
                }}
              >
                <motion.div
                  className="absolute inset-0"
                  style={{
                    background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%)',
                    skewX: '-15deg',
                  }}
                  animate={{ x: ['-150%', '250%'] }}
                  transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 2 }}
                />
                <span className="relative flex items-center gap-2">
                  {loading ? (
                    <><Loader2 className="animate-spin h-4 w-4" /> Sending...</>
                  ) : (
                    <><Send className="h-4 w-4" /> Send Reset Link</>
                  )}
                </span>
              </motion.button>
            </div>
          </motion.form>
        ) : (
          /* ── Success state ── */
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center gap-5"
          >
            {/* Animated checkmark */}
            <div className="relative">
              <motion.div
                className="w-20 h-20 rounded-full flex items-center justify-center"
                style={{
                  background: 'rgba(16,185,129,0.1)',
                  border: '1px solid rgba(16,185,129,0.3)',
                }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 18, delay: 0.1 }}
              >
                <CheckCircle2 className="h-10 w-10 text-emerald-400" />
              </motion.div>
              {/* Ping ring */}
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{ border: '1px solid rgba(16,185,129,0.4)' }}
                animate={{ scale: [1, 1.5], opacity: [0.6, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
              />
            </div>

            <div
              className="w-full px-4 py-3 rounded-xl text-sm text-emerald-400 text-center"
              style={{ background: 'rgba(16,185,129,0.07)', border: '1px solid rgba(16,185,129,0.18)' }}
            >
              If an account exists for <strong>{email}</strong>, a reset link has been sent.
            </div>

            <p className="text-xs text-slate-500 text-center">
              Didn't receive it? Check your spam folder or wait a few minutes.
            </p>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={onBack}
              className="w-full flex justify-center items-center gap-2 py-3 rounded-2xl text-sm font-semibold text-white"
              style={{
                background: 'rgba(99,102,241,0.15)',
                border: '1px solid rgba(99,102,241,0.25)',
              }}
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Sign In
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

/* ─────────────────────────────────────────────
   Main Auth Component
───────────────────────────────────────────── */
// View states: 'auth' | 'forgot'
const Auth = ({ onLogin }) => {
  const [view, setView] = useState('auth');      // 'auth' | 'forgot'
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [formData, setFormData] = useState({ email: '', password: '', name: '' });

  // Cursor glow
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const smoothX = useSpring(mouseX, { stiffness: 80, damping: 20 });
  const smoothY = useSpring(mouseY, { stiffness: 80, damping: 20 });
  const cardRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  };

  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setLoading(true);
    try {
      let res;
      if (isLogin) {
        res = await authAPI.login(formData.email, formData.password);
      } else {
        res = await authAPI.register(formData.email, formData.password, formData.name);
      }
      if (res.success) {
        if (!isLogin) setSuccessMessage('Account created! Signing you in...');
        onLogin(res.data.user, res.data.accessToken);
      } else {
        setError(res.error || 'Authentication failed');
      }
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.message;
      if (err.response?.status === 429) setError(msg || 'Too many attempts. Please wait.');
      else if (err.response?.status === 401) setError('Invalid credentials. Check your email and password.');
      else if (err.response?.status === 403) setError('Session expired. Please sign in again.');
      else setError(msg || err.message || 'Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setIsLogin((p) => !p);
    setError(null);
    setSuccessMessage(null);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ background: '#07090f' }}
    >
      {/* Ambient gradient orbs */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute rounded-full"
          style={{
            width: '60vw', height: '60vw', top: '-20%', left: '-15%',
            background: 'radial-gradient(circle, rgba(79,70,229,0.18) 0%, transparent 70%)',
            filter: 'blur(40px)',
          }}
        />
        <div
          className="absolute rounded-full"
          style={{
            width: '50vw', height: '50vw', bottom: '-15%', right: '-10%',
            background: 'radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)',
            filter: 'blur(40px)',
          }}
        />
        <div
          className="absolute rounded-full"
          style={{
            width: '30vw', height: '30vw', top: '30%', right: '10%',
            background: 'radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)',
            filter: 'blur(60px)',
          }}
        />
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((p) => <Particle key={p.id} style={p.style} />)}
      </div>

      {/* Auth Card */}
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-md"
      >
        <div
          ref={cardRef}
          onMouseMove={handleMouseMove}
          className="relative overflow-hidden rounded-3xl p-8"
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0 0 80px rgba(79,70,229,0.12), 0 40px 80px rgba(0,0,0,0.6)',
            backdropFilter: 'blur(40px)',
          }}
        >
          {/* Mouse-following glow */}
          <motion.div
            className="pointer-events-none absolute rounded-full"
            style={{
              width: 320, height: 320,
              x: smoothX, y: smoothY,
              translateX: '-50%', translateY: '-50%',
              background: 'radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%)',
            }}
          />

          <AnimatePresence mode="wait">
            {view === 'forgot' ? (
              <ForgotPasswordView key="forgot" onBack={() => setView('auth')} />
            ) : (
              <motion.div
                key="auth"
                initial={{ opacity: 0, x: -40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 40 }}
                transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              >
                {/* Brand */}
                <motion.div
                  initial={{ opacity: 0, y: -12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15, duration: 0.5 }}
                  className="flex flex-col items-center mb-8"
                >
                  <div
                    className="p-3 rounded-2xl mb-4"
                    style={{
                      background: 'rgba(99,102,241,0.12)',
                      boxShadow: '0 0 24px rgba(99,102,241,0.25), inset 0 0 0 1px rgba(99,102,241,0.2)',
                    }}
                  >
                    <ShieldCheck className="h-8 w-8 text-indigo-400" />
                  </div>
                  <h1 className="text-2xl font-black text-white tracking-tight">TrustLens</h1>
                  <p className="text-xs text-slate-500 mt-1 font-medium tracking-widest uppercase">
                    Explainable AI Banking
                  </p>
                </motion.div>

                {/* Tab Toggle */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.25, duration: 0.5 }}
                  className="flex rounded-2xl p-1 mb-8"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.06)',
                  }}
                >
                  {['Sign In', 'Sign Up'].map((tab, i) => {
                    const active = isLogin === (i === 0);
                    return (
                      <button
                        key={tab}
                        onClick={() => { setIsLogin(i === 0); setError(null); setSuccessMessage(null); }}
                        className="flex-1 relative py-2.5 text-sm font-semibold rounded-xl transition-colors duration-300"
                        style={{ color: active ? 'white' : '#64748b' }}
                      >
                        {active && (
                          <motion.div
                            layoutId="tab-indicator"
                            className="absolute inset-0 rounded-xl"
                            style={{
                              background: 'linear-gradient(135deg, rgba(99,102,241,0.9), rgba(124,58,237,0.9))',
                              boxShadow: '0 4px 20px rgba(99,102,241,0.4)',
                            }}
                            transition={{ type: 'spring', stiffness: 350, damping: 35 }}
                          />
                        )}
                        <span className="relative z-10">{tab}</span>
                      </button>
                    );
                  })}
                </motion.div>

                {/* Heading */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={isLogin ? 'login-h' : 'signup-h'}
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    transition={{ duration: 0.22 }}
                    className="mb-6"
                  >
                    <h2 className="text-xl font-bold text-white">
                      {isLogin ? 'Welcome back 👋' : 'Create your account'}
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">
                      {isLogin
                        ? 'Sign in to access your fraud detection dashboard.'
                        : 'Join thousands protecting their payments with AI.'}
                    </p>
                  </motion.div>
                </AnimatePresence>

                {/* Alerts */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden mb-5"
                    >
                      <div
                        className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm text-red-400"
                        style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}
                      >
                        <AlertTriangle className="h-4 w-4 shrink-0" />
                        {error}
                      </div>
                    </motion.div>
                  )}
                  {successMessage && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden mb-5"
                    >
                      <div
                        className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm text-emerald-400"
                        style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}
                      >
                        <CheckCircle2 className="h-4 w-4 shrink-0" />
                        {successMessage}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Form */}
                <form className="space-y-4" onSubmit={handleSubmit}>
                  <AnimatePresence initial={false}>
                    {!isLogin && (
                      <motion.div
                        key="name-field"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
                        className="overflow-hidden"
                      >
                        <div className="pb-0">
                          <InputField
                            icon={UserIcon}
                            label="Full Name"
                            name="name"
                            type="text"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="John Doe"
                            required={!isLogin}
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <InputField
                    icon={Mail}
                    label="Email Address"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    required
                  />

                  <div>
                    <InputField
                      icon={Lock}
                      label="Password"
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      required
                    />
                    {isLogin && (
                      <div className="flex justify-end mt-2">
                        <button
                          type="button"
                          onClick={() => setView('forgot')}
                          className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                        >
                          Forgot password?
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Submit */}
                  <div className="pt-2">
                    <motion.button
                      whileHover={{ scale: 1.01, boxShadow: '0 0 40px rgba(99,102,241,0.45)' }}
                      whileTap={{ scale: 0.99 }}
                      type="submit"
                      disabled={loading}
                      className="w-full relative flex justify-center items-center py-3.5 rounded-2xl text-sm font-bold text-white overflow-hidden"
                      style={{
                        background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                        boxShadow: '0 4px 24px rgba(79,70,229,0.35)',
                        opacity: loading ? 0.7 : 1,
                        cursor: loading ? 'not-allowed' : 'pointer',
                      }}
                    >
                      <motion.div
                        className="absolute inset-0"
                        style={{
                          background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%)',
                          skewX: '-15deg',
                        }}
                        animate={{ x: ['-150%', '250%'] }}
                        transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 2 }}
                      />
                      <span className="relative flex items-center gap-2">
                        {loading ? (
                          <><Loader2 className="animate-spin h-4 w-4" />Processing...</>
                        ) : (
                          <>{isLogin ? 'Sign In to Dashboard' : 'Create Account'}<ArrowRight className="h-4 w-4" /></>
                        )}
                      </span>
                    </motion.button>
                  </div>
                </form>

                {/* Footer Switch */}
                <div
                  className="mt-6 pt-6 text-center"
                  style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
                >
                  <p className="text-sm text-slate-500">
                    {isLogin ? "Don't have an account? " : 'Already have an account? '}
                    <button
                      onClick={switchMode}
                      className="font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
                    >
                      {isLogin ? 'Sign up free' : 'Sign in'}
                    </button>
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;