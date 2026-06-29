import { useState, useEffect, useCallback, useRef } from 'react';
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react';
import { setGlobalDispatch } from '../services/toast';

const ICONS = {
  success: { Icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/25', glow: 'shadow-emerald-500/20' },
  error:   { Icon: XCircle,     color: 'text-red-400',     bg: 'bg-red-500/10',     border: 'border-red-500/25',     glow: 'shadow-red-500/20' },
  info:    { Icon: Info,         color: 'text-blue-400',    bg: 'bg-blue-500/10',    border: 'border-blue-500/25',    glow: 'shadow-blue-500/20' },
  warning: { Icon: AlertTriangle,color: 'text-amber-400',   bg: 'bg-amber-500/10',   border: 'border-amber-500/25',   glow: 'shadow-amber-500/20' },
};

let toastId = 0;

function ToastItem({ id, type, message, onRemove }) {
  const [leaving, setLeaving] = useState(false);
  const { Icon, color, bg, border, glow } = ICONS[type] || ICONS.info;

  const dismiss = useCallback(() => {
    setLeaving(true);
    setTimeout(() => onRemove(id), 260);
  }, [id, onRemove]);

  useEffect(() => {
    const timer = setTimeout(dismiss, 4500);
    return () => clearTimeout(timer);
  }, [dismiss]);

  return (
    <div
      className={`
        flex items-start gap-3 px-4 py-3 rounded-2xl border shadow-lg
        ${bg} ${border} ${glow}
        ${leaving ? 'animate-toast-out' : 'animate-toast-in'}
        max-w-sm w-full pointer-events-auto
        backdrop-blur-md
      `}
      style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}
    >
      <Icon size={18} className={`${color} flex-shrink-0 mt-0.5`} />
      <p className="text-sm text-slate-200 leading-snug flex-1">{message}</p>
      <button
        onClick={dismiss}
        className="flex-shrink-0 text-slate-500 hover:text-slate-300 transition-colors mt-0.5"
      >
        <X size={14} />
      </button>
    </div>
  );
}

export function ToastProvider() {
  const [toasts, setToasts] = useState([]);
  const dispatchRef = useRef(null);

  dispatchRef.current = ({ type, payload }) => {
    if (type === 'ADD') {
      const id = ++toastId;
      setToasts((prev) => [...prev, { id, ...payload }]);
    }
  };

  useEffect(() => {
    setGlobalDispatch((action) => dispatchRef.current?.(action));
    return () => { setGlobalDispatch(null); };
  }, []);

  const remove = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  if (!toasts.length) return null;

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <ToastItem key={t.id} {...t} onRemove={remove} />
      ))}
    </div>
  );
}
