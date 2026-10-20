import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Icon from '../design-system/icons';
import { api, keys, useQuery } from '../data';
import { pathFor } from '../session';
import { timeAgo } from '../../revamp/lib/format';

/**
 * Dashboard entry to Ask a Textbook. A question (or an attached PDF) is
 * handed to the Ask a Textbook screen, which answers from the student's own
 * uploaded books; the history button lists their saved conversations.
 */
export default function AskTestBook({ onOpenStudio }) {
  const navigate = useNavigate();
  const chats = useQuery(keys.chats(), () => api.chats(), { staleMs: 30_000 });
  const [prompt, setPrompt] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const fileInputRef = useRef(null);

  const queryHistory = (chats.data || []).slice(0, 5);
  const showToast = (msg) => toast.info(msg);

  const handleSend = (textToSend) => {
    const query = typeof textToSend === 'string' ? textToSend : prompt;
    if (!query.trim()) return;
    navigate(pathFor('ask-textbook'), { state: { prompt: query.trim() } });
  };

  const toggleMic = () => {
    if (isListening) {
      setIsListening(false);
      return;
    }

    const SpeechRec = typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition);
    if (SpeechRec) {
      try {
        const recognition = new SpeechRec();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
          setIsListening(true);
          showToast('Microphone active... Speak your question');
        };

        recognition.onresult = (e) => {
          const transcript = e.results[0][0].transcript;
          setPrompt((prev) => (prev && prev.trim() ? `${prev.trim()} ${transcript}` : transcript));
          setIsListening(false);
        };

        recognition.onerror = () => {
          setIsListening(false);
          showToast('Microphone access ended');
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognition.start();
      } catch (err) {
        setIsListening(false);
        showToast("Couldn't start the microphone.");
      }
    } else {
      showToast("Voice input isn't supported in this browser.");
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files && e.target.files[0];
    e.target.value = '';
    if (!file) return;
    if (file.type !== 'application/pdf') return showToast('Please choose a PDF.');
    navigate(pathFor('ask-textbook'), { state: { uploadFile: file } });
  };

  return (
    <div
      style={{
        width: '100%',
        minWidth: 0,
        maxWidth: '535px',
        height: '378px',
        backgroundColor: '#FFFFFF',
        background: 'linear-gradient(165deg, #FFFFFF 0%, #FAFCFF 55%, #F0F4FF 100%)',
        borderRadius: '14px',
        border: '1px solid #E2E6EF',
        position: 'relative',
        overflow: 'hidden',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '18px 24px 20px 24px'
      }}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="application/pdf"
        style={{ display: 'none' }}
      />

      {/* Premium Ambient AI Liquid Aura (Soft whisper luminescence, reduced color intensity) */}
      <div
        style={{
          position: 'absolute',
          top: '-45px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '640px',
          height: '180px',
          borderRadius: '50%',
          background: 'radial-gradient(ellipse 75% 65% at 50% 40%, rgba(125, 211, 252, 0.16) 0%, rgba(165, 180, 252, 0.12) 42%, rgba(216, 180, 254, 0.08) 70%, transparent 92%)',
          filter: 'blur(56px)',
          pointerEvents: 'none',
          zIndex: 0,
          animation: 'cardAuraPulse 9s ease-in-out infinite',
          willChange: 'transform, opacity'
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '-35px',
          right: '-5%',
          width: '380px',
          height: '180px',
          borderRadius: '50%',
          background: 'radial-gradient(ellipse 70% 60% at 50% 50%, rgba(186, 230, 253, 0.14) 0%, rgba(224, 231, 255, 0.10) 48%, transparent 88%)',
          filter: 'blur(50px)',
          pointerEvents: 'none',
          zIndex: 0,
          animation: 'cardAuraDrift 11s ease-in-out infinite alternate',
          willChange: 'transform, opacity'
        }}
      />


      {/* Top Utility Controls */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 2,
          height: '24px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            type="button"
            onClick={() => setHistoryOpen(!historyOpen)}
            aria-label="Messages & History"
            title="Past Queries"
            style={{
              background: 'transparent',
              border: 'none',
              color: historyOpen ? '#283D82' : '#1F2537',
              cursor: 'pointer',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '20px',
              height: '20px',
              transition: 'color 0.15s ease'
            }}
          >
            <Icon name="messages" size={20} color="currentColor" />
          </button>
        </div>

        <button
          type="button"
          onClick={onOpenStudio || (() => navigate(pathFor('ask-textbook')))}
          aria-label="Full screen mode"
          title="Full screen mode"
          style={{
            background: 'transparent',
            border: 'none',
            color: '#6B7790',
            cursor: 'pointer',
            padding: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '20px',
            height: '20px',
            transition: 'color 0.15s ease'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#283D82')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#6B7790')}
        >
          <Icon name="exportIcon" size={16} color="currentColor" />
        </button>
      </div>

      {/* Center Section */}
      {(
        /* CENTERED DEFAULT VIEW */
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            flex: 1,
            zIndex: 2,
            padding: '8px 0'
          }}
        >
          {/* Title row with TrueSight Logo */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <img
              src="/assets/truesight-logo-colour-1024 2.png"
              alt="TrueSight Logo"
              style={{
                width: '24px',
                height: '24px',
                objectFit: 'contain',
                flexShrink: 0
              }}
            />

            <h2
              style={{
                fontFamily: 'var(--font-primary)',
                fontSize: '18px',
                lineHeight: '24px',
                fontWeight: 700,
                color: '#1F2537',
                margin: 0
              }}
            >
              Ask Text Book
            </h2>
          </div>

          {/* Description */}
          <p
            style={{
              width: '400px',
              maxWidth: '100%',
              fontFamily: 'var(--font-primary)',
              fontSize: '11px',
              lineHeight: '18px',
              fontWeight: 400,
              color: 'var(--secondary-text)',
              textAlign: 'center',
              margin: '0'
            }}
          >
            Upload your textbook and ask anything. Get clear, source-grounded answers and simple explanations from your book.
          </p>
        </div>
      )}

      {/* History Drawer Dropdown */}
      {historyOpen && (
        <div
          style={{
            position: 'absolute',
            top: '48px',
            left: '20px',
            width: '280px',
            background: '#FFFFFF',
            borderRadius: '12px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
            border: '1px solid #E2E8F0',
            zIndex: 10,
            padding: '12px',
            animation: 'modalContentPop 0.2s ease'
          }}
        >
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', marginBottom: '8px' }}>
            Recent Textbook Chats
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {!queryHistory.length && (
              <div style={{ fontSize: '11px', color: '#94A3B8', padding: '4px 2px' }}>
                {chats.isLoading ? 'Loading…' : 'No conversations yet - ask your first question below.'}
              </div>
            )}
            {queryHistory.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  setHistoryOpen(false);
                  navigate(`${pathFor('ask-textbook', item.bookId)}/${item.id}`);
                }}
                style={{
                  padding: '6px 8px',
                  borderRadius: '6px',
                  background: '#F8FAFC',
                  fontSize: '11px',
                  color: '#1E293B',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '180px' }}>
                  {item.title}
                </span>
                <span style={{ fontSize: '9px', color: '#94A3B8' }}>{timeAgo(item.updatedAt)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bottom Pill Input Form: 475px width, 38px height, rounded pill */}
      <div
        style={{
          width: '100%',
          maxWidth: '475px',
          height: '38px',
          margin: '0 auto',
          zIndex: 3,
          flexShrink: 0
        }}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend(prompt);
          }}
          style={{
            width: '100%',
            height: '100%',
            borderRadius: '999px',
            backgroundColor: '#FFFFFF',
            border: `1px solid ${isFocused ? '#283D82' : isListening ? '#EF4444' : '#D6E1F9'}`,
            display: 'flex',
            alignItems: 'center',
            padding: '0 14px',
            gap: '10px',
            boxSizing: 'border-box',
            transition: 'border-color 180ms ease'
          }}
        >
          {/* Add-circle Icon: File Attachment */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            aria-label="Upload document"
            title="Attach textbook / chapter"
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--muted-text)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 0,
              width: '20px',
              height: '20px',
              flexShrink: 0
            }}
          >
            <Icon name="addCircle" size={20} color="currentColor" />
          </button>

          {/* Text Input */}
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={isListening ? 'Listening... speak now' : 'Ask your textbook anything, or attach a PDF'}
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              background: 'transparent',
              fontFamily: 'var(--font-primary)',
              fontSize: '12px',
              lineHeight: '18px',
              fontWeight: 400,
              color: 'var(--primary-text)',
              padding: 0
            }}
          />

          {/* Right Action Icons Group: Microphone ALWAYS visible, Send button appears when typing */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
            {/* Microphone Button - Always accessible even in the middle of typing */}
            <button
              type="button"
              onClick={toggleMic}
              aria-label="Voice question"
              title={isListening ? 'Recording voice query...' : 'Voice input'}
              style={{
                background: isListening ? '#FEE2E2' : 'transparent',
                borderRadius: '50%',
                border: 'none',
                color: isListening ? '#EF4444' : 'var(--muted-text)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 0,
                width: '24px',
                height: '24px',
                flexShrink: 0,
                transition: 'all 0.15s ease'
              }}
            >
              <Icon name="microphone" size={20} color="currentColor" />
            </button>

            {/* Send Button - appears when user types to send the question */}
            {prompt.trim().length > 0 && (
              <button
                type="submit"
                aria-label="Send question"
                title="Send question"
                style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: '50%',
                  border: 'none',
                  background: '#283D82',
                  color: '#FFFFFF',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 0,
                  flexShrink: 0,
                  transition: 'background-color 0.15s ease'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#1D2D63')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#283D82')}
              >
                <Icon name="send" size={14} color="#FFFFFF" />
              </button>
            )}
          </div>
        </form>
      </div>

    </div>
  );
}
