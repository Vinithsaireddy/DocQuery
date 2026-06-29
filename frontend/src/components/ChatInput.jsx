import { useState, useRef, useEffect, useCallback } from 'react';
import { Send } from 'lucide-react';

const MAX_CHARS = 2000;

export default function ChatInput({ onSend, disabled, placeholder }) {
  const [input, setInput] = useState('');
  const textareaRef = useRef(null);

  // Auto-focus when enabled
  useEffect(() => {
    if (!disabled) textareaRef.current?.focus();
  }, [disabled]);

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    const lineHeight = 24;
    const maxHeight = lineHeight * 5 + 32; // 5 rows + padding
    el.style.height = Math.min(el.scrollHeight, maxHeight) + 'px';
  }, [input]);

  const handleSubmit = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed || disabled || trimmed.length > MAX_CHARS) return;
    onSend(trimmed);
    setInput('');
    // Reset height
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  }, [input, disabled, onSend]);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit]
  );

  const remaining = MAX_CHARS - input.length;
  const nearLimit = remaining < 200;
  const overLimit = remaining < 0;
  const canSend = input.trim().length > 0 && !disabled && !overLimit;

  return (
    <div
      className="px-4 pb-4 pt-3 border-t"
      style={{
        borderColor: 'rgba(255,255,255,0.06)',
        background: 'rgba(7,11,20,0.95)',
        backdropFilter: 'blur(16px)',
      }}
    >
      <div className="max-w-4xl mx-auto">
        <div
          className="relative flex items-end gap-2 rounded-2xl px-4 py-3 transition-all duration-200"
          style={{
            background: 'rgba(19, 25, 41, 0.9)',
            border: `1px solid ${disabled ? 'rgba(255,255,255,0.05)' : overLimit ? 'rgba(239,68,68,0.4)' : 'rgba(99,102,241,0.25)'}`,
            boxShadow: disabled ? 'none' : 'inset 0 1px 0 rgba(255,255,255,0.04), 0 4px 20px rgba(0,0,0,0.3)',
          }}
          onFocus={() => {
            // handled via CSS :focus-within below
          }}
        >
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder={placeholder || 'Type a message… (Shift+Enter for new line)'}
            rows={1}
            maxLength={MAX_CHARS + 50}
            style={{
              resize: 'none',
              minHeight: '24px',
              maxHeight: '152px',
              overflowY: 'auto',
              lineHeight: '24px',
            }}
            className="
              flex-1 bg-transparent text-slate-100 placeholder-slate-600
              text-sm leading-6
              focus:outline-none
              disabled:opacity-40 disabled:cursor-not-allowed
              scrollbar-thin
            "
          />

          <div className="flex items-end gap-2 flex-shrink-0 pb-0.5">
            {/* Character counter */}
            {nearLimit && (
              <span
                className={`text-[11px] font-mono transition-colors ${overLimit ? 'text-red-400' : 'text-amber-400'}`}
              >
                {remaining}
              </span>
            )}

            {/* Send button */}
            <button
              id="chat-send-btn"
              onClick={handleSubmit}
              disabled={!canSend}
              className="
                w-9 h-9 rounded-xl flex items-center justify-center
                transition-all duration-200
                disabled:opacity-30 disabled:cursor-not-allowed
                active:scale-90
              "
              style={
                canSend
                  ? {
                      background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
                      boxShadow: '0 0 16px rgba(99,102,241,0.45)',
                    }
                  : {
                      background: 'rgba(99,102,241,0.1)',
                    }
              }
              title="Send message (Enter)"
            >
              <Send size={16} className="text-white" style={{ transform: 'translateX(1px)' }} />
            </button>
          </div>
        </div>

        <p className="text-[10px] text-slate-700 text-center mt-1.5">
          Press <kbd className="px-1 py-0.5 rounded bg-slate-800 text-slate-500 font-mono text-[10px]">Enter</kbd> to send
          · <kbd className="px-1 py-0.5 rounded bg-slate-800 text-slate-500 font-mono text-[10px]">Shift+Enter</kbd> for new line
        </p>
      </div>
    </div>
  );
}
