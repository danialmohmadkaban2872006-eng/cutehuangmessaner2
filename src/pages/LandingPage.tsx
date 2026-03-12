import React from 'react'
import { useNavigate } from 'react-router-dom'
import { MessageCircle, Sparkles, Shield, Globe, ArrowRight, Zap, Lock } from 'lucide-react'

export default function LandingPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-mesh font-body overflow-x-hidden">
      {/* ── Nav ───────────────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-subtle px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #3a3a6e, #ff1a4b)' }}>
            <span className="text-white text-base">花</span>
          </div>
          <span className="font-display text-lg font-medium" style={{ color: 'var(--text-primary)' }}>
            Cute Huang
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/login')}
            className="btn-ghost px-4 py-2 rounded-xl text-sm"
          >
            Sign In
          </button>
          <button
            onClick={() => navigate('/onboarding')}
            className="btn-primary px-5 py-2 rounded-xl text-sm"
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* ── Hero ──────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center justify-center px-6 pt-24 pb-16">
        {/* Background orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-20 blur-3xl animate-pulse-soft"
          style={{ background: 'radial-gradient(circle, #3a3a6e, transparent)' }} />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full opacity-15 blur-3xl animate-pulse-soft"
          style={{ background: 'radial-gradient(circle, #ff1a4b, transparent)', animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full opacity-10 blur-3xl animate-pulse-soft"
          style={{ background: 'radial-gradient(circle, #f59e0b, transparent)', animationDelay: '2s' }} />

        <div className="relative z-10 max-w-4xl mx-auto text-center stagger">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium mb-8 glass"
            style={{ color: 'var(--text-secondary)' }}>
            <Sparkles className="w-3.5 h-3.5 text-rose-400" />
            <span>AI-Powered · Privacy First · Beautiful Design</span>
          </div>

          {/* Title */}
          <h1 className="font-display mb-6 leading-tight">
            <span className="block text-5xl md:text-7xl lg:text-8xl font-light tracking-tight"
              style={{ color: 'var(--text-primary)' }}>
              Messages that
            </span>
            <span className="block text-5xl md:text-7xl lg:text-8xl font-semibold gradient-text">
              Move the Heart
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
            style={{ color: 'var(--text-secondary)' }}>
            A premium messenger with built-in AI intelligence, anonymous secure identity, 
            and extraordinary design. Connect meaningfully — no email or phone required.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => navigate('/onboarding')}
              className="btn-primary group flex items-center gap-3 px-8 py-4 rounded-2xl text-base font-semibold shadow-glow-rose"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => navigate('/login')}
              className="btn-secondary flex items-center gap-3 px-8 py-4 rounded-2xl text-base"
            >
              <Lock className="w-4 h-4" />
              <span>Sign In with ID</span>
            </button>
          </div>

          {/* Trust note */}
          <p className="mt-6 text-xs" style={{ color: 'var(--text-muted)' }}>
            No email · No phone · No personal data required
          </p>
        </div>
      </section>

      {/* ── Features ──────────────────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 stagger">
            <p className="text-xs uppercase tracking-widest font-medium mb-3 text-rose-400">
              Why Cute Huang
            </p>
            <h2 className="font-display text-4xl md:text-5xl font-light mb-4"
              style={{ color: 'var(--text-primary)' }}>
              Everything you need,
              <br />
              <span className="gradient-text-rose font-semibold">nothing you don't</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 stagger">
            {FEATURES.map((feature) => (
              <FeatureCard key={feature.title} {...feature} />
            ))}
          </div>
        </div>
      </section>

      {/* ── AI Showcase ───────────────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="rounded-3xl p-10 md:p-16 relative overflow-hidden glass"
            style={{ border: '1px solid rgba(255,26,75,0.15)' }}>
            {/* BG decoration */}
            <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full blur-3xl opacity-20"
              style={{ background: 'radial-gradient(circle, #ff1a4b, transparent)' }} />
            
            <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
              <div className="stagger">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6"
                  style={{ background: 'linear-gradient(135deg, rgba(255,26,75,0.2), rgba(245,158,11,0.15))' }}>
                  <Sparkles className="w-6 h-6 text-rose-400" />
                </div>
                <h3 className="font-display text-3xl md:text-4xl font-medium mb-4" style={{ color: 'var(--text-primary)' }}>
                  Huang AI at your<br />
                  <span className="gradient-text-rose">fingertips</span>
                </h3>
                <p className="text-base leading-relaxed mb-6" style={{ color: 'var(--text-secondary)' }}>
                  Your personal AI assistant lives right inside your conversations. 
                  Translate languages, draft messages, get answers, and explore ideas — 
                  all without leaving your chat.
                </p>
                <div className="space-y-2.5">
                  {AI_FEATURES.map((f) => (
                    <div key={f} className="flex items-center gap-2.5 text-sm" style={{ color: 'var(--text-secondary)' }}>
                      <div className="w-1.5 h-1.5 rounded-full bg-rose-400 flex-shrink-0" />
                      {f}
                    </div>
                  ))}
                </div>
              </div>

              {/* Mock chat preview */}
              <div className="space-y-3">
                <MockMessage align="right" text="Can you translate 'I miss you' to Arabic and Chinese?" />
                <MockMessage align="left" isAi text={`Arabic: أشتاقك إليك\nChinese: 我想念你\n\nBoth carry deep warmth and longing. ✨`} />
                <MockMessage align="right" text="That's beautiful, thank you!" />
                <div className="flex items-center gap-2 px-4 py-2">
                  <div className="flex gap-1.5">
                    <div className="typing-dot" />
                    <div className="typing-dot" />
                    <div className="typing-dot" />
                  </div>
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Huang AI is thinking...</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Identity Section ──────────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center stagger">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-xs mb-8"
            style={{ color: 'var(--text-secondary)' }}>
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <span>Privacy-First Identity System</span>
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-light mb-6" style={{ color: 'var(--text-primary)' }}>
            Your identity,
            <br />
            <span className="gradient-text">beautifully anonymous</span>
          </h2>
          <p className="text-lg max-w-2xl mx-auto mb-12 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            We generate a unique ID and password for you automatically. No forms, no verification, 
            no personal data. Just a clean credential pair that's entirely yours.
          </p>

          {/* Mock credential card */}
          <div className="max-w-sm mx-auto glass rounded-2xl overflow-hidden shadow-glass">
            <div className="px-5 py-4 text-left"
              style={{ background: 'linear-gradient(135deg, rgba(58,58,110,0.4), rgba(255,26,75,0.1))' }}>
              <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Your Credentials</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Generated instantly. Yours alone.</p>
            </div>
            <div className="px-5 py-4 space-y-3 text-left" style={{ background: 'var(--bg-tertiary)' }}>
              <div>
                <p className="text-xs uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-muted)' }}>User ID</p>
                <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl" style={{ background: 'var(--bg-secondary)' }}>
                  <code className="font-mono text-base tracking-widest gradient-text font-medium">CHM4829103</code>
                </div>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-muted)' }}>Password</p>
                <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl" style={{ background: 'var(--bg-secondary)' }}>
                  <code className="font-mono text-base tracking-widest" style={{ color: 'var(--text-secondary)' }}>
                    ●●●●●●●●●●●●
                  </code>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Final CTA ─────────────────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-display text-4xl md:text-5xl font-light mb-6" style={{ color: 'var(--text-primary)' }}>
            Ready to begin?
          </h2>
          <p className="text-lg mb-10" style={{ color: 'var(--text-secondary)' }}>
            Your account is created in seconds. No forms to fill, no passwords to choose.
          </p>
          <button
            onClick={() => navigate('/onboarding')}
            className="btn-primary group inline-flex items-center gap-3 px-10 py-4 rounded-2xl text-base font-semibold"
          >
            <span>Start Messaging Now</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────── */}
      <footer className="border-t px-6 py-10" style={{ borderColor: 'var(--border)' }}>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #3a3a6e, #ff1a4b)' }}>
              <span className="text-white text-sm">花</span>
            </div>
            <span className="font-display text-base font-medium" style={{ color: 'var(--text-primary)' }}>
              Cute Huang Messenger
            </span>
          </div>
          <p className="text-sm text-center" style={{ color: 'var(--text-muted)' }}>
            © 2024 Cute Huang Messenger. All rights reserved.
            <br className="md:hidden" />
            {' '}Crafted with care by <span style={{ color: 'var(--text-secondary)' }}>Danial Mohmad</span>.
          </p>
          <div className="flex gap-4 text-sm" style={{ color: 'var(--text-muted)' }}>
            <span>Privacy</span>
            <span>·</span>
            <span>Terms</span>
            <span>·</span>
            <span>Support</span>
          </div>
        </div>
      </footer>
    </div>
  )
}

// ─── Feature Card ──────────────────────────────────────────────────────────
function FeatureCard({
  icon: Icon,
  title,
  desc,
  color,
}: {
  icon: React.ElementType
  title: string
  desc: string
  color: string
}) {
  return (
    <div className="hover-lift glass-subtle rounded-2xl p-6 cursor-default">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
        style={{ background: color + '20', border: `1px solid ${color}30` }}>
        <Icon className="w-5 h-5" style={{ color }} />
      </div>
      <h3 className="font-semibold text-base mb-2" style={{ color: 'var(--text-primary)' }}>{title}</h3>
      <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>{desc}</p>
    </div>
  )
}

// ─── Mock Message ─────────────────────────────────────────────────────────
function MockMessage({ align, text, isAi }: { align: 'left' | 'right'; text: string; isAi?: boolean }) {
  return (
    <div className={`flex ${align === 'right' ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-xs px-4 py-2.5 text-sm whitespace-pre-line ${
        align === 'right' ? 'bubble-sent' : isAi ? 'bubble-ai' : 'bubble-received'
      }`}>
        {isAi && <p className="text-xs font-medium text-rose-400 mb-1">✨ Huang AI</p>}
        {text}
      </div>
    </div>
  )
}


const FEATURES = [
  {
    icon: MessageCircle,
    title: 'Beautiful Conversations',
    desc: 'Elegant message bubbles, smooth animations, and a layout that makes every chat feel premium.',
    color: '#3a3a6e',
  },
  {
    icon: Sparkles,
    title: 'Built-in AI Assistant',
    desc: 'Huang AI understands context, translates languages, and helps you communicate better.',
    color: '#ff1a4b',
  },
  {
    icon: Shield,
    title: 'Anonymous Identity',
    desc: 'A unique ID + password pair is generated for you. No email, no phone, no personal data.',
    color: '#10b981',
  },
  {
    icon: Globe,
    title: 'Multilingual',
    desc: 'Built to support Arabic, English, Chinese, Kurdish Sorani, and Bengali from the ground up.',
    color: '#6366f1',
  },
  {
    icon: Zap,
    title: 'Real-time Messages',
    desc: 'Messages appear instantly. Stay in the flow without page refreshes or delays.',
    color: '#f59e0b',
  },
  {
    icon: Lock,
    title: 'End-to-End Secure',
    desc: 'Your password is hashed, your session is protected. Security by design, not afterthought.',
    color: '#8b5cf6',
  },
]

const AI_FEATURES = [
  'Translate between 5+ languages instantly',
  'Draft and polish messages with AI assistance',
  'Answer any question with contextual intelligence',
  'Emotionally intelligent and culturally aware',
  'Powered by Groq — blazing fast response times',
]
