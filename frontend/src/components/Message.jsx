import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { User, Copy, Check } from 'lucide-react';

function formatTime(date) {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function Message({ role, text, timestamp }) {
  const isUser = role === 'user';
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [text]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 14, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className={`group flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
    >
      {/* Avatar */}
      <div
        className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center shadow-lg"
        style={
          isUser
            ? {
                background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                boxShadow: '0 0 14px rgba(59,130,246,0.4)',
              }
            : {
                background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                boxShadow: '0 0 14px rgba(139,92,246,0.35)',
              }
        }
      >
        {isUser ? (
          <User size={16} className="text-white" />
        ) : (
          /* AI Bot icon */
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 8V4H8" />
            <rect width="16" height="12" x="4" y="8" rx="2" />
            <path d="M2 14h2" /><path d="M20 14h2" />
            <path d="M15 13v2" /><path d="M9 13v2" />
          </svg>
        )}
      </div>

      {/* Message Bubble */}
      <div className={`relative max-w-[78%] flex flex-col gap-1 ${isUser ? 'items-end' : 'items-start'}`}>
        <div
          className={`px-4 py-3 rounded-2xl leading-relaxed text-sm ${isUser ? 'rounded-tr-none' : 'rounded-tl-none'}`}
          style={
            isUser
              ? {
                  background: 'linear-gradient(135deg, #2563eb, #4f46e5)',
                  color: '#fff',
                  boxShadow: '0 4px 20px rgba(59,130,246,0.25)',
                }
              : {
                  background: 'rgba(19, 25, 41, 0.95)',
                  border: '1px solid rgba(99,102,241,0.18)',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                }
          }
        >
          {isUser ? (
            <p className="whitespace-pre-wrap break-words text-white">{text}</p>
          ) : (
            <div className="prose-ai">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{text}</ReactMarkdown>
            </div>
          )}
        </div>

        {/* Timestamp + copy row */}
        <div className={`flex items-center gap-2 px-1 ${isUser ? 'flex-row-reverse' : ''}`}>
          {timestamp && (
            <span className="text-[10px] text-slate-600">
              {formatTime(timestamp)}
            </span>
          )}
          {!isUser && (
            <button
              onClick={handleCopy}
              className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-600 hover:text-slate-300 flex items-center gap-1 text-[10px]"
              title="Copy to clipboard"
            >
              {copied ? (
                <><Check size={11} className="text-emerald-400" /><span className="text-emerald-400">Copied!</span></>
              ) : (
                <><Copy size={11} /><span>Copy</span></>
              )}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
