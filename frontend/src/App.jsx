import { useState, useCallback } from 'react';
import { Menu, FileText } from 'lucide-react';
import { uploadPDF, chatWithPDF } from './services/api';
import { useAutoScroll } from './hooks/useAutoScroll';
import { useFileUpload } from './hooks/useFileUpload';
import Sidebar from './components/Sidebar';
import EmptyState from './components/EmptyState';
import Message from './components/Message';
import ChatInput from './components/ChatInput';
import TypingIndicator from './components/TypingIndicator';
import ScrollToBottom from './components/ScrollToBottom';
import { ToastProvider, toast } from './components/Toast';

export default function App() {
  const [messages, setMessages] = useState([]);
  const [sessionId, setSessionId] = useState(null);
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { endRef, containerRef, isAtBottom, scrollToBottom, handleScroll } =
    useAutoScroll([messages, isLoading]);

  // ── Upload Handler ────────────────────────────────────────────────────────
  const handleUpload = useCallback(async (file) => {
    if (!file || file.type !== 'application/pdf') {
      toast.error('Please select a valid PDF file.');
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      toast.error('File too large. Maximum size is 50 MB.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const data = await uploadPDF(file, (pct) => setUploadProgress(pct));
      setSessionId(data.session_id);
      setFileName(file.name);
      setFileSize(file.size);
      setMessages([
        {
          role: 'ai',
          text: `I've read **${file.name}**. Ask me anything about it!`,
          timestamp: new Date(),
        },
      ]);
      toast.success(`"${file.name}" uploaded successfully!`);
      setSidebarOpen(false);
    } catch (err) {
      toast.error(err.normalizedMessage || 'Failed to upload PDF. Please try again.');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  }, []);

  // ── Chat Handler ──────────────────────────────────────────────────────────
  const handleSend = useCallback(
    async (text) => {
      if (!sessionId) return;

      const userMsg = { role: 'user', text, timestamp: new Date() };
      setMessages((prev) => [...prev, userMsg]);
      setIsLoading(true);
      scrollToBottom();

      try {
        const data = await chatWithPDF(sessionId, text);
        setMessages((prev) => [
          ...prev,
          { role: 'ai', text: data.answer, timestamp: new Date() },
        ]);
      } catch (err) {
        const msg = err.normalizedMessage || 'Sorry, something went wrong.';
        setMessages((prev) => [
          ...prev,
          { role: 'ai', text: `⚠️ ${msg}`, timestamp: new Date() },
        ]);
        toast.error(msg);
      } finally {
        setIsLoading(false);
      }
    },
    [sessionId, scrollToBottom]
  );

  // ── New Chat ──────────────────────────────────────────────────────────────
  const handleNewChat = useCallback(() => {
    setMessages([]);
    setSessionId(null);
    setFileName('');
    setFileSize(null);
    toast.info('Session cleared. Upload a new PDF to start again.');
  }, []);

  // ── File Upload Hook ──────────────────────────────────────────────────────
  const { inputRef, handleChange, triggerUpload, isDragging, dragHandlers } = useFileUpload({
    onUpload: handleUpload,
  });

  // ── EmptyState upload trigger ─────────────────────────────────────────────
  const handleEmptyStateUpload = useCallback(() => {
    triggerUpload();
  }, [triggerUpload]);

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ background: '#070b14', color: '#e2e8f0' }}
    >
      <ToastProvider />

      <Sidebar
        fileName={fileName}
        fileSize={fileSize}
        isUploading={isUploading}
        uploadProgress={uploadProgress}
        onUpload={triggerUpload}
        onNewChat={fileName ? handleNewChat : null}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        isDragging={isDragging}
        dragHandlers={dragHandlers}
        inputRef={inputRef}
        handleChange={handleChange}
      />

      {/* ── Main Content ── */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Header */}
        <header
          className="h-14 flex items-center gap-3 px-4 md:px-6 flex-shrink-0"
          style={{
            background: 'rgba(7,11,20,0.95)',
            borderBottom: '1px solid rgba(255,255,255,0.05)',
            backdropFilter: 'blur(16px)',
          }}
        >
          <button
            id="mobile-menu-btn"
            onClick={() => setSidebarOpen(true)}
            className="md:hidden p-2 -ml-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-colors"
          >
            <Menu size={20} />
          </button>

          <div className="flex items-center gap-2.5 min-w-0">
            {fileName ? (
              <>
                <div
                  className="hidden sm:flex w-7 h-7 rounded-lg items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.25)' }}
                >
                  <FileText size={14} style={{ color: '#60a5fa' }} />
                </div>
                <h1 className="text-sm font-medium truncate text-slate-200">{fileName}</h1>
                <span
                  className="hidden sm:inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium"
                  style={{ background: 'rgba(16,185,129,0.12)', color: '#34d399', border: '1px solid rgba(16,185,129,0.2)' }}
                >
                  Active
                </span>
              </>
            ) : (
              <h1 className="text-sm font-semibold gradient-text">DocQuery AI</h1>
            )}
          </div>
        </header>

        {/* Message Area */}
        <div
          ref={containerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto px-4 md:px-6 py-6"
          style={{
            backgroundImage: `
              radial-gradient(ellipse at 20% 50%, rgba(59,130,246,0.03) 0%, transparent 60%),
              radial-gradient(ellipse at 80% 20%, rgba(139,92,246,0.03) 0%, transparent 60%)
            `,
          }}
        >
          <div className="max-w-3xl mx-auto space-y-5">
            {messages.length === 0 ? (
              <EmptyState onUpload={handleEmptyStateUpload} />
            ) : (
              messages.map((msg, i) => (
                <Message
                  key={i}
                  role={msg.role}
                  text={msg.text}
                  timestamp={msg.timestamp}
                />
              ))
            )}

            {isLoading && <TypingIndicator />}

            <div ref={endRef} />
          </div>
        </div>

        {/* Scroll to bottom */}
        <div className="relative">
          <ScrollToBottom
            visible={!isAtBottom && messages.length > 0}
            onClick={scrollToBottom}
          />
        </div>

        {/* Chat Input */}
        <ChatInput
          onSend={handleSend}
          disabled={!sessionId || isLoading}
          placeholder={
            !sessionId
              ? 'Upload a PDF to start chatting…'
              : 'Ask anything about your document…'
          }
        />
      </main>
    </div>
  );
}
