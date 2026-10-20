import React, { useState, useRef } from 'react';
import Icon from '../design-system/icons';

export default function AskTestBook({ onOpenStudio }) {
  const [prompt, setPrompt] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [conversation, setConversation] = useState(null);
  const [isThinking, setIsThinking] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [attachedFile, setAttachedFile] = useState(null);
  const fileInputRef = useRef(null);

  const queryHistory = [
    { q: 'Explain Carnot Cycle efficiency limits', time: 'Yesterday' },
    { q: 'Kerala building rules floor area ratio', time: '2 days ago' },
    { q: 'Marine diesel fuel injection pump timing', time: '3 days ago' }
  ];

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleSend = (textToSend) => {
    const query = typeof textToSend === 'string' ? textToSend : prompt;
    if (!query.trim()) return;

    setIsThinking(true);
    setPrompt('');

    setTimeout(() => {
      let answer = '';
      let pageRef = 'Page 42 · Chapter 3';

      if (query.toLowerCase().includes('bernoulli')) {
        answer = 'Bernoulli’s principle states that an increase in the speed of a fluid occurs simultaneously with a decrease in static pressure: P + 0.5ρv² + ρgh = constant.';
        pageRef = 'Page 88 · Fluid Mechanics Section 4.2';
      } else if (query.toLowerCase().includes('chapter 3') || query.toLowerCase().includes('summary')) {
        answer = 'Chapter 3 covers internal combustion cycles, thermal efficiency calculations, indicator diagrams, and thermodynamic losses in medium-speed marine diesels.';
        pageRef = 'Page 42 · Marine Auxiliary Engine Handbook';
      } else if (query.toLowerCase().includes('formula')) {
        answer = 'Key formulas: 1) Indicated Power: IP = (P_m · L · A · N · n) / 60. 2) Brake Thermal Efficiency: η_bt = BP / (m_f · CV). 3) Mechanical Efficiency: η_m = BP / IP.';
        pageRef = 'Page 114 · Applied Thermodynamics Index';
      } else {
        answer = `Based on your uploaded course textbook: "${query}" is thoroughly detailed in the syllabus guidelines. Core principles involve strict adherence to statutory engineering clearances and thermodynamic equilibrium limits.`;
        pageRef = 'Page 65 · Core Syllabus Topics';
      }

      setConversation({ query, answer, pageRef });
      setIsThinking(false);
    }, 600);
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
        setIsListening(true);
        showToast('Microphone active... Speak your question');
        setTimeout(() => {
          setPrompt((prev) => (prev && prev.trim() ? `${prev.trim()} Explain Bernoulli's Principle` : "Explain Bernoulli's Principle"));
          setIsListening(false);
        }, 2200);
      }
    } else {
      setIsListening(true);
      showToast('Microphone active... Speak your question');
      setTimeout(() => {
        setPrompt((prev) => (prev && prev.trim() ? `${prev.trim()} Explain Bernoulli's Principle` : "Explain Bernoulli's Principle"));
        setIsListening(false);
      }, 2200);
    }
  };

  const handleCopyExport = () => {
    if (conversation) {
      navigator.clipboard?.writeText(`Q: ${conversation.query}\nA: ${conversation.answer}\nSource: ${conversation.pageRef}`);
      showToast('Q&A copied to clipboard');
    } else {
      showToast('Ask Textbook summary copied');
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setAttachedFile(e.target.files[0].name);
      showToast(`Attached "${e.target.files[0].name}"`);
    }
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
        accept=".pdf,.epub,.txt"
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

        {attachedFile && (
          <div style={{ fontSize: '10px', color: '#2563EB', background: '#EFF6FF', padding: '2px 8px', borderRadius: '4px', maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            Attached: {attachedFile}
          </div>
        )}

        <button
          type="button"
          onClick={onOpenStudio || handleCopyExport}
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

      {/* Center Section: Toggles between Overview & Active Conversation */}
      {conversation ? (
        /* ACTIVE CONVERSATION RESULT VIEW */
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            flex: 1,
            zIndex: 2,
            padding: '4px 6px',
            overflowY: 'auto'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#2563EB', background: '#EFF6FF', padding: '2px 8px', borderRadius: '4px' }}>
              {conversation.pageRef}
            </div>
            <button
              onClick={() => setConversation(null)}
              style={{ background: 'transparent', border: 'none', fontSize: '11px', color: '#64748B', cursor: 'pointer', textDecoration: 'underline' }}
            >
              ← Back to Overview
            </button>
          </div>

          <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '10px 12px', marginBottom: '8px' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#0F1219', marginBottom: '4px' }}>
              Q: {conversation.query}
            </div>
            <div style={{ fontSize: '12px', color: '#334155', lineHeight: '1.45' }}>
              {conversation.answer}
            </div>
          </div>

          {/* Quick Actions on Answer */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '4px' }}>
            <button
              onClick={() => {
                if ('speechSynthesis' in window) {
                  window.speechSynthesis.cancel();
                  const utterance = new SpeechSynthesisUtterance(conversation.answer);
                  utterance.rate = 1.0;
                  window.speechSynthesis.speak(utterance);
                  showToast('Reading explanation aloud...');
                } else {
                  showToast('Audio explanation played');
                }
              }}
              style={{
                background: '#F1F5F9',
                border: '1px solid #E2E8F0',
                borderRadius: '6px',
                padding: '4px 10px',
                fontSize: '11px',
                fontWeight: 600,
                color: '#334155',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              Read Aloud
            </button>

            <button
              onClick={() => {
                navigator.clipboard?.writeText(conversation.answer);
                showToast('Copied answer to clipboard');
              }}
              style={{
                background: '#F1F5F9',
                border: '1px solid #E2E8F0',
                borderRadius: '6px',
                padding: '4px 10px',
                fontSize: '11px',
                fontWeight: 600,
                color: '#334155',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              Copy
            </button>

            <button
              onClick={() => showToast('Saved insight to Study Notes')}
              style={{
                background: '#F1F5F9',
                border: '1px solid #E2E8F0',
                borderRadius: '6px',
                padding: '4px 10px',
                fontSize: '11px',
                fontWeight: 600,
                color: '#334155',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              Save Note
            </button>

            {onOpenStudio && (
              <button
                onClick={onOpenStudio}
                style={{
                  background: '#20346B',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '4px 10px',
                  fontSize: '11px',
                  fontWeight: 600,
                  color: '#FFFFFF',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  marginLeft: 'auto'
                }}
              >
                <span>Open in Studio</span>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            )}
          </div>
        </div>
      ) : isThinking ? (
        /* THINKING INDICATOR */
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, zIndex: 2 }}>
          <div style={{ width: '28px', height: '28px', borderRadius: '50%', border: '3px solid #E2E8F0', borderTopColor: '#283D82', animation: 'voiceGlow 1s linear infinite' }} />
          <div style={{ fontSize: '12px', color: '#64748B', marginTop: '10px', fontWeight: 600 }}>
            Searching textbook index & grounding answer...
          </div>
        </div>
      ) : (
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
            Recent Textbook Queries
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {queryHistory.map((item, i) => (
              <div
                key={i}
                onClick={() => {
                  setHistoryOpen(false);
                  handleSend(item.q);
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
                  {item.q}
                </span>
                <span style={{ fontSize: '9px', color: '#94A3B8' }}>{item.time}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bottom Pill Input Form: 475px width, 38px height, rounded pill */}
      <div
        style={{
          width: '475px',
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
            placeholder={isListening ? 'Listening... speak now' : 'Upload your syllabus and Ask AI'}
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

      {/* Floating Toast */}
      {toast && (
        <div
          style={{
            position: 'absolute',
            bottom: '68px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: '#1E293B',
            color: '#FFFFFF',
            padding: '6px 14px',
            borderRadius: '999px',
            fontSize: '11px',
            fontWeight: 600,
            zIndex: 100,
            whiteSpace: 'nowrap',
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
          }}
        >
          {toast}
        </div>
      )}
    </div>
  );
}
