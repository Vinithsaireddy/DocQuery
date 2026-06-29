import { useRef, useCallback, useState } from 'react';

/**
 * Reusable hook for file uploads via a hidden <input> ref.
 * Replaces all scattered document.createElement('input') patterns.
 * The hidden input must be rendered by the consuming component using renderInput().
 */
export function useFileUpload({ onUpload, accept = 'application/pdf' }) {
  const inputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragCounter = useRef(0);

  const triggerUpload = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const handleChange = useCallback(
    (e) => {
      const file = e.target.files?.[0];
      if (file) {
        onUpload(file);
        // Reset so the same file can be re-uploaded
        e.target.value = '';
      }
    },
    [onUpload]
  );

  const dragHandlers = {
    onDragEnter: (e) => {
      e.preventDefault();
      dragCounter.current++;
      setIsDragging(true);
    },
    onDragLeave: (e) => {
      e.preventDefault();
      dragCounter.current--;
      if (dragCounter.current === 0) setIsDragging(false);
    },
    onDragOver: (e) => {
      e.preventDefault();
    },
    onDrop: (e) => {
      e.preventDefault();
      dragCounter.current = 0;
      setIsDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file?.type === accept) {
        onUpload(file);
      }
    },
  };

  return { inputRef, handleChange, triggerUpload, isDragging, dragHandlers };
}
