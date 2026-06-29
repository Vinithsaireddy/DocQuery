export default function TypingIndicator() {
  return (
    <div className="flex items-start gap-3 animate-slide-up">
      {/* Avatar */}
      <div
        className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center animate-pulse-glow"
        style={{
          background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 8V4H8" />
          <rect width="16" height="12" x="4" y="8" rx="2" />
          <path d="M2 14h2" />
          <path d="M20 14h2" />
          <path d="M15 13v2" />
          <path d="M9 13v2" />
        </svg>
      </div>

      {/* Bubble */}
      <div
        className="px-5 py-4 rounded-2xl rounded-tl-none border"
        style={{
          background: 'rgba(19, 25, 41, 0.9)',
          borderColor: 'rgba(99, 102, 241, 0.2)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
        }}
      >
        <div className="flex items-center gap-1.5">
          {[0, 150, 300].map((delay, i) => (
            <span
              key={i}
              className="inline-block w-2 h-2 rounded-full animate-bounce-dot"
              style={{
                animationDelay: `${delay}ms`,
                background: i === 0 ? '#3b82f6' : i === 1 ? '#8b5cf6' : '#06b6d4',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
