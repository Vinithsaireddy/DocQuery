import { useEffect, useRef, useState, useCallback } from 'react';

export function useAutoScroll(deps) {
  const endRef = useRef(null);
  const containerRef = useRef(null);
  const [isAtBottom, setIsAtBottom] = useState(true);

  const scrollToBottom = useCallback((behavior = 'smooth') => {
    endRef.current?.scrollIntoView({ behavior });
    setIsAtBottom(true);
  }, []);

  // Track whether user is near the bottom
  const handleScroll = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const threshold = 80;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < threshold;
    setIsAtBottom(atBottom);
  }, []);

  // Auto-scroll only when at bottom
  useEffect(() => {
    if (isAtBottom) {
      endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(deps)]);

  return { endRef, containerRef, isAtBottom, scrollToBottom, handleScroll };
}
