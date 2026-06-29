import { FileText, Loader2, X, Plus, Trash2, HardDrive } from 'lucide-react';

function formatBytes(bytes) {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default function Sidebar({
  fileName,
  fileSize,
  isUploading,
  uploadProgress,
  onUpload,
  onNewChat,
  isOpen,
  onClose,
  isDragging,
  dragHandlers,
  inputRef,
  handleChange,
}) {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 md:hidden"
          style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }}
          onClick={onClose}
        />
      )}

      <aside
        {...dragHandlers}
        className={`
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0
          fixed md:static inset-y-0 left-0 z-40
          w-72 flex flex-col
          transition-transform duration-300 ease-in-out
          ${isDragging ? 'drop-zone-active' : ''}
        `}
        style={{
          background: 'rgba(10, 13, 22, 0.97)',
          borderRight: '1px solid rgba(255,255,255,0.06)',
          boxShadow: '4px 0 30px rgba(0,0,0,0.5)',
        }}
      >
        {/* Hidden file input */}
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          onChange={handleChange}
          style={{ display: 'none' }}
          aria-hidden="true"
        />

        {/* ── Logo ─────────────────────────────────────── */}
        <div className="p-5 flex items-center justify-between border-b" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center animate-pulse-glow"
              style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
            </div>
            <span className="text-lg font-bold gradient-text">DocQuery AI</span>
          </div>
          <button
            onClick={onClose}
            className="md:hidden p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* ── Upload button ────────────────────────────── */}
        <div className="p-4">
          <button
            id="sidebar-upload-btn"
            onClick={onUpload}
            disabled={isUploading}
            className="
              w-full flex items-center justify-center gap-2
              py-3 rounded-xl font-medium text-sm text-white
              transition-all duration-200
              hover:scale-[1.02] active:scale-[0.97]
              disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100
            "
            style={{
              background: isUploading
                ? 'rgba(59,130,246,0.3)'
                : 'linear-gradient(135deg, #2563eb, #4f46e5)',
              boxShadow: isUploading ? 'none' : '0 0 20px rgba(59,130,246,0.3)',
            }}
          >
            {isUploading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Processing…</span>
              </>
            ) : (
              <>
                <Plus size={16} />
                <span>Upload PDF</span>
              </>
            )}
          </button>

          {/* Upload progress bar */}
          {isUploading && typeof uploadProgress === 'number' && (
            <div className="mt-3">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] text-slate-500">Uploading…</span>
                <span className="text-[10px] text-slate-400 font-mono">{uploadProgress}%</span>
              </div>
              <div
                className="h-1 rounded-full overflow-hidden"
                style={{ background: 'rgba(255,255,255,0.06)' }}
              >
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${uploadProgress}%`,
                    background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)',
                    boxShadow: '0 0 8px rgba(99,102,241,0.5)',
                  }}
                />
              </div>
            </div>
          )}

          {/* Drag hint */}
          {!isUploading && (
            <p className={`text-xs text-center mt-2 transition-colors ${isDragging ? 'text-blue-400' : 'text-slate-600'}`}>
              {isDragging ? '✦ Drop to upload' : 'or drag & drop a PDF here'}
            </p>
          )}
        </div>

        {/* ── Active Session ───────────────────────────── */}
        <div className="flex-1 px-4 overflow-y-auto">
          <p className="text-[10px] text-slate-600 font-semibold uppercase tracking-widest mb-3">
            Active Session
          </p>

          {fileName ? (
            <div
              className="p-3 rounded-xl transition-all"
              style={{
                background: 'rgba(59,130,246,0.08)',
                border: '1px solid rgba(59,130,246,0.2)',
                boxShadow: '0 0 16px rgba(59,130,246,0.08)',
              }}
            >
              <div className="flex items-start gap-3">
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ background: 'rgba(59,130,246,0.15)' }}
                >
                  <FileText size={16} style={{ color: '#60a5fa' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-200 truncate" title={fileName}>{fileName}</p>
                  {fileSize && (
                    <p className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                      <HardDrive size={9} />
                      {formatBytes(fileSize)}
                    </p>
                  )}
                </div>
              </div>
              {/* New Chat button */}
              {onNewChat && (
                <button
                  id="new-chat-btn"
                  onClick={onNewChat}
                  className="
                    w-full mt-3 flex items-center justify-center gap-1.5
                    py-2 rounded-lg text-xs text-slate-400
                    hover:text-red-400 hover:bg-red-500/10
                    transition-all duration-200 border
                  "
                  style={{ borderColor: 'rgba(255,255,255,0.06)' }}
                >
                  <Trash2 size={12} />
                  New Chat
                </button>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center py-10 text-center">
              {/* Animated dashed border placeholder */}
              <div
                className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-3 transition-all duration-300 ${isDragging ? 'scale-110' : ''}`}
                style={{
                  background: 'rgba(99,102,241,0.05)',
                  border: `2px dashed ${isDragging ? '#3b82f6' : 'rgba(99,102,241,0.2)'}`,
                  boxShadow: isDragging ? '0 0 20px rgba(59,130,246,0.2)' : 'none',
                }}
              >
                <FileText size={24} style={{ color: isDragging ? '#60a5fa' : '#374151' }} />
              </div>
              <p className="text-sm text-slate-500">No file yet</p>
              <p className="text-xs text-slate-700 mt-1">Upload a PDF to get started</p>
            </div>
          )}
        </div>

        {/* ── User Profile ─────────────────────────────── */}
        <div
          className="p-4 border-t"
          style={{ borderColor: 'rgba(255,255,255,0.05)', background: 'rgba(0,0,0,0.2)' }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
              style={{
                background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
                boxShadow: '0 0 12px rgba(139,92,246,0.35)',
              }}
            >
              VS
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-200 truncate">G Vinith Sai</p>
              <p className="text-xs" style={{ color: '#10b981' }}>● Pro Plan</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
