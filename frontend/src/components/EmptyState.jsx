import { FileText, Sparkles, Zap, BookOpen, Upload } from 'lucide-react';

const FEATURES = [
  {
    icon: Zap,
    color: '#f59e0b',
    glow: 'rgba(245,158,11,0.25)',
    title: 'Instant Answers',
    desc: 'Ask anything about your document and get precise answers in seconds.',
  },
  {
    icon: BookOpen,
    color: '#06b6d4',
    glow: 'rgba(6,182,212,0.25)',
    title: 'Deep Understanding',
    desc: 'AI reads and comprehends your entire document, not just keywords.',
  },
  {
    icon: Sparkles,
    color: '#8b5cf6',
    glow: 'rgba(139,92,246,0.25)',
    title: 'Smart Summaries',
    desc: 'Ask for summaries, key points, or specific sections — it handles it all.',
  },
];

const SUGGESTIONS = [
  'Summarize this document',
  'What are the key findings?',
  'List the main conclusions',
  'Explain the methodology',
];

export default function EmptyState({ onUpload }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-full text-center px-6 py-12 select-none">

      {/* Animated hero icon */}
      <div className="relative mb-8 animate-scale-in">
        {/* Outer glow ring */}
        <div
          className="absolute inset-0 rounded-3xl blur-2xl"
          style={{
            background: 'radial-gradient(circle, rgba(99,102,241,0.4) 0%, rgba(139,92,246,0.15) 60%, transparent 100%)',
            transform: 'scale(1.5)',
          }}
        />
        {/* Icon container */}
        <div
          className="relative w-28 h-28 rounded-3xl flex items-center justify-center animate-float"
          style={{
            background: 'linear-gradient(135deg, rgba(59,130,246,0.15), rgba(139,92,246,0.15))',
            border: '1px solid rgba(99,102,241,0.3)',
            boxShadow: '0 0 40px rgba(99,102,241,0.3), inset 0 1px 0 rgba(255,255,255,0.08)',
          }}
        >
          {/* Spinning gradient ring */}
          <div
            className="absolute inset-0 rounded-3xl animate-spin-slow"
            style={{
              background: 'conic-gradient(from 0deg, transparent 60%, rgba(99,102,241,0.4) 100%)',
              borderRadius: 'inherit',
            }}
          />
          <FileText size={48} className="relative z-10" style={{ color: '#818cf8' }} />
        </div>
      </div>

      {/* Headline */}
      <div className="animate-slide-up" style={{ animationDelay: '150ms' }}>
        <h2 className="text-4xl font-bold mb-3 tracking-tight">
          <span className="gradient-text">Chat with any PDF</span>
        </h2>
        <p className="text-slate-400 max-w-md mx-auto leading-relaxed text-sm">
          Upload your document and start asking questions. DocQuery AI reads, understands, and answers — instantly.
        </p>
      </div>

      {/* Upload CTA */}
      <div className="mt-8 mb-10 animate-slide-up" style={{ animationDelay: '250ms' }}>
        <button
          id="empty-state-upload-btn"
          onClick={onUpload}
          className="group relative flex items-center gap-3 px-8 py-4 rounded-2xl text-white font-semibold text-sm transition-all duration-300 hover:scale-105 active:scale-95"
          style={{
            background: 'linear-gradient(135deg, #3b82f6, #6366f1, #8b5cf6)',
            boxShadow: '0 0 30px rgba(99,102,241,0.5), 0 4px 20px rgba(0,0,0,0.4)',
          }}
        >
          {/* Shimmer overlay */}
          <div className="absolute inset-0 rounded-2xl animate-shimmer" />
          <Upload size={18} className="relative z-10 group-hover:animate-bounce" />
          <span className="relative z-10">Upload your PDF</span>
        </button>
        <p className="text-slate-600 text-xs mt-3">
          or drag & drop onto the sidebar · Max 50 MB
        </p>
      </div>

      {/* Feature cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-2xl mb-10 animate-slide-up" style={{ animationDelay: '350ms' }}>
        {FEATURES.map((feature, i) => (
          <div
            key={feature.title}
            className="flex flex-col items-start gap-3 p-4 rounded-2xl text-left transition-all duration-300 hover:scale-[1.02]"
            style={{
              background: 'rgba(19,25,41,0.7)',
              border: '1px solid rgba(255,255,255,0.06)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
              animationDelay: `${400 + i * 100}ms`,
            }}
          >
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{
                background: `rgba(${hexToRgb(feature.color)},0.15)`,
                boxShadow: `0 0 12px ${feature.glow}`,
              }}
            >
              <feature.icon size={18} style={{ color: feature.color }} />
            </div>
            <div>
              <p className="text-slate-200 font-semibold text-sm mb-1">{feature.title}</p>
              <p className="text-slate-500 text-xs leading-relaxed">{feature.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Suggested questions */}
      <div className="flex flex-wrap justify-center gap-2 max-w-lg animate-fade-in" style={{ animationDelay: '700ms' }}>
        <p className="w-full text-xs text-slate-600 mb-1">Try asking:</p>
        {SUGGESTIONS.map((s) => (
          <span
            key={s}
            className="px-3 py-1.5 rounded-full text-xs text-slate-400 cursor-default transition-colors hover:text-slate-200"
            style={{
              background: 'rgba(99,102,241,0.08)',
              border: '1px solid rgba(99,102,241,0.15)',
            }}
          >
            {s}
          </span>
        ))}
      </div>
    </div>
  );
}

// Utility: convert hex color to RGB for inline rgba()
function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r},${g},${b}`;
}
