import { ChevronDown } from 'lucide-react';

export default function ScrollToBottom({ visible, onClick }) {
  if (!visible) return null;

  return (
    <button
      onClick={onClick}
      className="
        absolute bottom-6 left-1/2 -translate-x-1/2
        flex items-center gap-1.5 px-4 py-2
        rounded-full text-xs font-medium text-white
        bg-indigo-600/90 hover:bg-indigo-500
        border border-indigo-400/30
        shadow-lg shadow-indigo-500/30
        backdrop-blur-sm
        transition-all duration-200
        hover:scale-105 active:scale-95
        animate-scale-in
        z-20
      "
      aria-label="Scroll to latest message"
    >
      <ChevronDown size={14} className="animate-bounce" />
      New message
    </button>
  );
}
