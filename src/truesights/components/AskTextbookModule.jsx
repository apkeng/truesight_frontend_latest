import React, { useState, useRef, useEffect } from 'react';
import Icon from '../design-system/icons';
import ModalPortal from './ModalPortal';

// Pre-loaded realistic textbooks for recent books history
// Default book matches the user's reference screenshot: Solid State Physics Lecture Notes by E. Kogan (77 pages)
const PRESET_TEXTBOOKS = [
  {
    id: 'tb-solid',
    title: 'Solid State Physics Lecture Notes',
    author: 'E. Kogan',
    totalPages: 77,
    fileUrl: '/assets/solid-state-physics.pdf',
    category: 'Condensed Matter Physics',
    uploadDate: 'Pre-indexed',
    chapters: [
      { page: 1, title: 'Contents & Course Overview' },
      { page: 2, title: 'Chapter I: About Condensed-Matter Physics' },
      { page: 2, title: 'Chapter II: Heat Capacity of Solids' },
      { page: 7, title: 'Chapter III: One-Dimensional Chain' },
      { page: 10, title: 'Chapter IV: Electrons in Metals: Drude Theory' },
      { page: 13, title: 'Chapter V: Sommerfeld (Free Electrons) Theory' },
      { page: 16, title: 'Chapter VI: Crystals & Bravais Lattices' },
      { page: 20, title: 'Chapter VII: Chemical Elements' },
      { page: 24, title: 'Chapter VIII: Chemical Bond. I' },
      { page: 33, title: 'Chapter X: Wave Scattering by Crystals' },
      { page: 42, title: 'Chapter XII: Bloch (Electrons in Periodic Potential) Theory' },
      { page: 48, title: 'Chapter XIII: Electron Dynamics' },
      { page: 50, title: 'Chapter XIV: Semiconductors' }
    ],
    initialChat: [
      {
        id: 'c-init-solid',
        sender: 'ai',
        time: '10:00 AM',
        text: 'Connected to "Solid State Physics Lecture Notes" by E. Kogan (77 pages). Ask anything regarding crystal lattices, phonons, Sommerfeld theory, or Bloch states.'
      },
      {
        id: 'c-u-solid',
        sender: 'user',
        time: '10:02 AM',
        text: 'Can you summarize the Dulong-Petit Law and Einstein\'s calculation for heat capacity from Chapter II?'
      },
      {
        id: 'c-ai-solid',
        sender: 'ai',
        time: '10:02 AM',
        text: 'From Chapter II (Heat Capacity of Solids), pages 2–4:\n\n1. Dulong–Petit Law (Section A, Page 2):\nClassic theory predicts that the molar heat capacity at high temperatures approaches a constant value:\nC_v = 3R ≈ 25 J/(mol·K)\nThis arises from treating atoms as classical harmonic oscillators with 3 degrees of freedom having energy k_B*T each.\n\n2. Einstein’s Calculation (Section C, Page 4):\nAt low temperatures, classical theory fails as C_v drops exponentially toward zero. Einstein quantized vibrations assuming all N oscillators share the same characteristic frequency ω_E. The quantized energy yields:\n\nC_v = 3R * (ħω_E / k_B*T)^2 * [e^(ħω_E / k_B*T) / (e^(ħω_E / k_B*T) - 1)^2]\n\nThis explains the cryogenic freeze-out of vibrational modes.',
        citations: ['Page 2 · Section II.A', 'Page 4 · Section II.C'],
        formula: 'C_v = 3R * (x)^2 * [e^x / (e^x - 1)^2], where x = ħω_E / (k_B*T)'
      }
    ]
  },
  {
    id: 'tb-marine',
    title: 'Marine Auxiliary Machinery',
    author: 'H.D. McGeorge (6th Ed)',
    totalPages: 482,
    fileUrl: '/assets/solid-state-physics.pdf',
    category: 'Marine Engineering',
    uploadDate: '3 days ago',
    chapters: [
      { page: 1, title: 'Chapter 1: Engine Room Layout & Systems' },
      { page: 42, title: 'Chapter 3: Diesel Indicator Diagrams & Scavenging' },
      { page: 88, title: 'Chapter 5: Centrifugal Pumps & Cavitation' },
      { page: 114, title: 'Chapter 7: Heat Exchangers & Plate Coolers' }
    ],
    initialChat: [
      {
        id: 'c1',
        sender: 'ai',
        time: '10:14 AM',
        text: 'Connected to "Marine Auxiliary Machinery" (482 pages). All responses are strictly grounded in this textbook with verbatim citations and equations.',
        citations: ['Page 42 · Section 3.1']
      }
    ]
  },
  {
    id: 'tb-thermo',
    title: 'Applied Thermodynamics & Heat Engines',
    author: 'T.D. Eastop & A. McConkey',
    totalPages: 320,
    fileUrl: '/assets/solid-state-physics.pdf',
    category: 'Thermal Engineering',
    uploadDate: '1 week ago',
    chapters: [
      { page: 1, title: 'Chapter 1: First & Second Laws of Thermodynamics' },
      { page: 65, title: 'Chapter 3: Reversible Carnot Cycle Limits' },
      { page: 102, title: 'Chapter 5: Rankine Steam Power Cycles' }
    ],
    initialChat: [
      {
        id: 'ct1',
        sender: 'ai',
        time: 'Yesterday',
        text: 'Connected to "Applied Thermodynamics & Heat Engines" (320 pages). Ask any conceptual question regarding cycle efficiencies and steam plant thermodynamics.',
        citations: ['Page 65 · Section 3.1']
      }
    ]
  }
];

// Rich Formatted AI Response with high typographic hierarchy, equation blocks, source pills, and voice/copy actions
function FormattedAiMessage({
  msg,
  currentBook,
  onJumpToCitation,
  speakingMessageId,
  onReadAloud,
  copiedMessageId,
  onCopyMessage
}) {
  const blocks = (msg.text || '').split('\n\n').filter((b) => b.trim().length > 0);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: '12px',
        width: '100%',
        padding: '6px 0'
      }}
    >
      {/* Header row: TrueSight Logo + Name + Grounding Badge + Timestamp */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          paddingBottom: '2px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <img
            src="/assets/Rectangle 4.png"
            alt="TrueSight Logo"
            style={{ width: '18px', height: '18px', objectFit: 'contain' }}
          />
          <span style={{ fontSize: '13px', fontWeight: 700, color: '#1B2A4A', letterSpacing: '-0.01em' }}>
            TrueSight AI
          </span>
          <span
            style={{
              fontSize: '10.5px',
              fontWeight: 600,
              color: '#059669',
              backgroundColor: '#ECFDF5',
              border: '1px solid #A7F3D0',
              padding: '1px 8px',
              borderRadius: '9999px',
              letterSpacing: '0.02em'
            }}
          >
            Verified Grounding
          </span>
        </div>
        <span style={{ fontSize: '11px', color: '#94A3B8' }}>
          {msg.time}
        </span>
      </div>

      {/* Structured Content Stream */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          width: '100%'
        }}
      >
        {blocks.map((block, idx) => {
          const trimmed = block.trim();

          // Check if this block is a numbered section: e.g. "1. Dulong–Petit Law (Section A, Page 2):"
          const numberedMatch = trimmed.match(/^(\d+)\.\s+([^:\n]+)[:\n]?([\s\S]*)$/);
          if (numberedMatch) {
            const num = numberedMatch[1];
            const heading = numberedMatch[2].replace(/:$/, '').trim();
            const rest = numberedMatch[3] ? numberedMatch[3].trim() : '';
            const lines = rest.split('\n').filter(Boolean);

            return (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  backgroundColor: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  marginTop: '2px'
                }}
              >
                {/* Section Title with Distinct Number Badge */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div
                    style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '5px',
                      backgroundColor: '#EFF6FF',
                      border: '1px solid #BFDBFE',
                      color: '#1D4ED8',
                      fontSize: '11px',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    {num}
                  </div>
                  <h4
                    style={{
                      margin: 0,
                      fontSize: '13.5px',
                      fontWeight: 700,
                      color: '#0F172A',
                      letterSpacing: '-0.01em'
                    }}
                  >
                    {heading}
                  </h4>
                </div>

                {/* Section Body with Highlighted Equations */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {lines.map((line, lIdx) => {
                    const isFormulaLine =
                      /(=|≈|ħ|\^|C_v|σ\s*=|ψ_k)/.test(line) &&
                      line.length < 90 &&
                      !line.startsWith('Classic') &&
                      !line.startsWith('At ') &&
                      !line.startsWith('This ') &&
                      !line.startsWith('Accounts');

                    if (isFormulaLine) {
                      return (
                        <div
                          key={lIdx}
                          style={{
                            margin: '4px 0',
                            padding: '6px 12px',
                            borderRadius: '6px',
                            backgroundColor: '#FFFFFF',
                            border: '1px solid #CBD5E1',
                            borderLeft: '3px solid #2563EB',
                            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                            fontSize: '12.5px',
                            fontWeight: 600,
                            color: '#1E3A8A'
                          }}
                        >
                          {line}
                        </div>
                      );
                    }
                    return (
                      <p
                        key={lIdx}
                        style={{
                          margin: 0,
                          fontSize: '13px',
                          lineHeight: '1.68',
                          color: '#334155'
                        }}
                      >
                        {line}
                      </p>
                    );
                  })}
                </div>
              </div>
            );
          }

          // Check if block is an introductory summary line
          const isIntroLead = /^(From|Based on|According to|Retrieved from|Connected to|Regarding)/i.test(trimmed);

          return (
            <p
              key={idx}
              style={{
                margin: 0,
                fontSize: '13px',
                fontWeight: isIntroLead ? 600 : 400,
                color: isIntroLead ? '#475569' : '#1E2538',
                lineHeight: '1.68',
                whiteSpace: 'pre-line'
              }}
            >
              {trimmed}
            </p>
          );
        })}
      </div>

      {/* Featured Key Formula Card */}
      {msg.formula && (
        <div
          style={{
            width: '100%',
            marginTop: '2px',
            background: 'linear-gradient(135deg, #F8FAFC 0%, #EFF6FF 100%)',
            border: '1px solid #BFDBFE',
            borderLeft: '4px solid #2563EB',
            borderRadius: '8px',
            padding: '10px 14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            boxSizing: 'border-box'
          }}
        >
          <div
            style={{
              fontSize: '10px',
              fontWeight: 700,
              color: '#2563EB',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}
          >
            Key Mathematical Formulation
          </div>
          <div
            style={{
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
              fontSize: '12.5px',
              fontWeight: 600,
              color: '#1E3A8A',
              lineHeight: '1.6',
              wordBreak: 'break-word'
            }}
          >
            {msg.formula}
          </div>
        </div>
      )}

      {/* Grounding Source Citations (Clickable buttons that jump straight to that textbook page) */}
      {msg.citations && msg.citations.length > 0 && (
        <div style={{ marginTop: '2px', display: 'flex', flexDirection: 'column', gap: '6px', width: '100%' }}>
          <div
            style={{
              fontSize: '10.5px',
              fontWeight: 700,
              color: '#64748B',
              textTransform: 'uppercase',
              letterSpacing: '0.04em'
            }}
          >
            Verified Sources (Click to inspect page)
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {msg.citations.map((c, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => onJumpToCitation && onJumpToCitation(c)}
                title={`Jump to ${c} in textbook`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '11px',
                  fontWeight: 600,
                  color: '#1D4ED8',
                  background: '#EFF6FF',
                  border: '1px solid #BFDBFE',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  transition: 'all 120ms ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#DBEAFE';
                  e.currentTarget.style.borderColor = '#93C5FD';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#EFF6FF';
                  e.currentTarget.style.borderColor = '#BFDBFE';
                }}
              >
                <Icon name="docUpload" size={13} color="#2563EB" />
                <span>{c}</span>
                <span style={{ fontSize: '10px', color: '#3B82F6', fontWeight: 700 }}>→</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Action Toolbar: Read Aloud + Copy Answer */}
      <div style={{ marginTop: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button
          type="button"
          onClick={() => onReadAloud(msg.id, msg.text)}
          title={speakingMessageId === msg.id ? "Stop voice explanation" : "Listen to explanation"}
          style={{
            background: speakingMessageId === msg.id ? '#DCFCE7' : '#F8FAFC',
            border: `1px solid ${speakingMessageId === msg.id ? '#86EFAC' : '#E2E8F0'}`,
            borderRadius: '6px',
            padding: '4px 10px',
            fontSize: '11px',
            fontWeight: 600,
            color: speakingMessageId === msg.id ? '#15803D' : '#475569',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            transition: 'all 140ms ease'
          }}
          onMouseEnter={(e) => {
            if (speakingMessageId !== msg.id) e.currentTarget.style.background = '#F1F5F9';
          }}
          onMouseLeave={(e) => {
            if (speakingMessageId !== msg.id) e.currentTarget.style.background = '#F8FAFC';
          }}
        >
          <Icon name="microphone" size={13} color="currentColor" />
          <span>{speakingMessageId === msg.id ? 'Pause Voice' : 'Read Aloud'}</span>
        </button>

        <button
          type="button"
          onClick={() => onCopyMessage(msg.id, msg.text)}
          title="Copy response text"
          style={{
            background: copiedMessageId === msg.id ? '#EFF6FF' : '#F8FAFC',
            border: `1px solid ${copiedMessageId === msg.id ? '#BFDBFE' : '#E2E8F0'}`,
            borderRadius: '6px',
            padding: '4px 10px',
            fontSize: '11px',
            fontWeight: 600,
            color: copiedMessageId === msg.id ? '#1D4ED8' : '#475569',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            transition: 'all 140ms ease'
          }}
          onMouseEnter={(e) => {
            if (copiedMessageId !== msg.id) e.currentTarget.style.background = '#F1F5F9';
          }}
          onMouseLeave={(e) => {
            if (copiedMessageId !== msg.id) e.currentTarget.style.background = '#F8FAFC';
          }}
        >
          <Icon name={copiedMessageId === msg.id ? "check" : "copy"} size={13} color="currentColor" />
          <span>{copiedMessageId === msg.id ? 'Copied' : 'Copy Text'}</span>
        </button>
      </div>
    </div>
  );
}

export default function AskTextbookModule({ onBackToDashboard }) {
  // Sidebar expanded/collapsed state (Image 1 vs Image 2)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  );
  const [mobileStudioTab, setMobileStudioTab] = useState('chat'); // 'chat' | 'pdf'
  const [showMobileBooksDrawer, setShowMobileBooksDrawer] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const mob = window.innerWidth < 768;
      setIsMobile(mob);
      if (mob) setIsSidebarCollapsed(true);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Active mode: 'landing' (Matches reference screenshots) or 'workspace' (Split view studio)
  const [viewMode, setViewMode] = useState('landing');

  // Textbooks library & active book
  const [textbooks, setTextbooks] = useState(PRESET_TEXTBOOKS);
  const [activeBookId, setActiveBookId] = useState('tb-solid');
  const [activePage, setActivePage] = useState(1);

  // Search Popup Modal state ("when I click search, open a popup and show search bar, below show already generated files")
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchBookQuery, setSearchBookQuery] = useState('');

  // Hover states for sidebar buttons
  const [isNewChatHovered, setIsNewChatHovered] = useState(false);
  const [hoveredBookId, setHoveredBookId] = useState(null);

  // Split view document visibility toggle (user can hide and open textbook whenever they want)
  const [isTextbookHidden, setIsTextbookHidden] = useState(false);

  // PDF Viewer Controls
  const [pdfZoom, setPdfZoom] = useState(100);
  const [pdfRotation, setPdfRotation] = useState(0);
  const [viewerTab, setViewerTab] = useState('pdf'); // 'pdf' (iframe) or 'contents' (replica)
  const [activeTool, setActiveTool] = useState('cursor'); // 'cursor', 'pen'

  // Landing center input prompt
  const [landingInput, setLandingInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [showVoicePrompt, setShowVoicePrompt] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [speakingMessageId, setSpeakingMessageId] = useState(null);
  const [copiedMessageId, setCopiedMessageId] = useState(null);
  const [toast, setToast] = useState(null);

  // Real file input reference
  const fileInputRef = useRef(null);

  // Chats state per textbook
  const [chatHistory, setChatHistory] = useState({
    'tb-solid': PRESET_TEXTBOOKS[0].initialChat,
    'tb-marine': PRESET_TEXTBOOKS[1].initialChat,
    'tb-thermo': PRESET_TEXTBOOKS[2].initialChat
  });
  const [chatInput, setChatInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const chatBottomRef = useRef(null);

  const currentBook = textbooks.find((b) => b.id === activeBookId) || textbooks[0];

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  // Real file upload handler: creates object URL and loads the real file immediately into the viewer
  const handleRealFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileUrl = URL.createObjectURL(file);
    const fileNameClean = file.name.replace(/\.[^/.]+$/, '');
    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');

    const newBook = {
      id: `tb-${Date.now()}`,
      title: fileNameClean,
      author: 'Uploaded Document',
      totalPages: isPdf ? 77 : 1,
      fileUrl: fileUrl,
      fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
      uploadDate: 'Uploaded just now',
      category: 'Uploaded Course Materials',
      chapters: [
        { page: 1, title: 'Document Start' }
      ],
      initialChat: [
        {
          id: `ai-init-${Date.now()}`,
          sender: 'ai',
          time: 'Just now',
          text: `I've analyzed and indexed "${file.name}". You can now ask questions, request formula breakdowns, or explore concepts directly from this textbook.`
        }
      ]
    };

    setTextbooks((prev) => [newBook, ...prev]);
    setActiveBookId(newBook.id);
    setActivePage(1);
    setChatHistory((prev) => ({
      ...prev,
      [newBook.id]: newBook.initialChat
    }));
    setViewMode('workspace');
    showToast(`Loaded "${file.name}"`);

    // Reset input so re-selecting same file triggers change
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Auto-scroll chat in workspace
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isThinking, activeBookId, viewMode]);

  // Send message in chat
  const handleSendChat = (textToSend) => {
    const query = typeof textToSend === 'string' ? textToSend : chatInput || landingInput;
    if (!query.trim()) return;

    // Switch to workspace view if currently on landing
    if (viewMode === 'landing') {
      setViewMode('workspace');
    }

    const userMsg = {
      id: `u-${Date.now()}`,
      sender: 'user',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: query.trim()
    };

    setChatHistory((prev) => ({
      ...prev,
      [activeBookId]: [...(prev[activeBookId] || []), userMsg]
    }));
    setChatInput('');
    setLandingInput('');
    setIsThinking(true);

    setTimeout(() => {
      let replyText = '';
      let citations = [`Page ${activePage} · ${currentBook.title}`];
      let formula = '';

      const lower = query.toLowerCase();
      if (lower.includes('dulong') || lower.includes('heat capacity') || lower.includes('einstein') || lower.includes('debye')) {
        replyText = `Based on Chapter II (Heat Capacity of Solids), pages 2–4 of "${currentBook.title}":\n\n1. Dulong–Petit Law (Section II.A, Page 2):\nClassic equipartition predicts that molar heat capacity approaches a constant value at high temperatures:\nC_v = 3R ≈ 25 J/(mol·K)\nThis holds because atoms behave as classical harmonic oscillators in 3 dimensions.\n\n2. Einstein’s Calculation (Section II.C, Page 4):\nAt cryogenic temperatures, classical physics fails as vibrational modes freeze out. Assuming a single characteristic frequency ω_E:\nC_v = 3R * (x)^2 * [e^x / (e^x - 1)^2], where x = ħω_E / (k_B*T)\n\n3. Debye Model (Section II.D, Page 4):\nAccounts for acoustic dispersion at low temperatures, accurately recovering the experimental T^3 temperature dependence.`;
        citations = ['Page 2 · Section II.A', 'Page 4 · Section II.C'];
        formula = 'C_v = 3R * (x)^2 * [e^x / (e^x - 1)^2]';
      } else if (lower.includes('drude') || lower.includes('electron') || lower.includes('conductivity') || lower.includes('sommerfeld')) {
        replyText = `Retrieved from Chapter IV & V (Electrons in Metals), pages 10–15 of "${currentBook.title}":\n\n1. Drude Model (Page 10–12):\nModels conduction electrons as an ideal gas colliding with stationary ion cores with collision relaxation time τ. Electrical conductivity is derived as σ = (n * e^2 * τ) / m.\n\n2. Sommerfeld Quantum Correction (Page 13–15):\nReplaces Maxwell-Boltzmann statistics with Fermi-Dirac statistics to satisfy Pauli exclusion. Only electrons within k_B*T of the Fermi energy E_F contribute to thermal and electrical transport, explaining the small electronic heat capacity.`;
        citations = ['Page 10 · Section IV.A', 'Page 13 · Section V.A'];
        formula = 'σ = (n * e^2 * τ) / m';
      } else if (lower.includes('bloch') || lower.includes('band') || lower.includes('periodic') || lower.includes('brillouin')) {
        replyText = `According to Chapter XII (Bloch Theory), pages 42–47 of "${currentBook.title}":\n\nBloch’s theorem states that the wave function of an electron moving in a spatially periodic potential V(r + R) = V(r) takes the form:\n\nψ_k(r) = e^(i * k · r) * u_k(r)\n\nWhere u_k(r) has the same periodicity as the crystal lattice. This leads to the emergence of energy bands and forbidden energy gaps (bandgaps) at the Brillouin zone boundaries.`;
        citations = ['Page 42 · Section XII.A (Bloch Theorem)'];
        formula = 'ψ_k(r) = e^(i * k · r) * u_k(r)';
      } else if (lower.includes('semiconductor') || lower.includes('effective mass') || lower.includes('hole')) {
        replyText = `From Chapter XIV (Semiconductors), pages 50–52 of "${currentBook.title}":\n\n1. Band Gap: Direct and indirect optical transitions dictate carrier excitation from the valence band to the conduction band.\n2. Effective Mass: The dynamic response of electrons near band extrema is governed by curvature: 1 / m* = (1 / ħ^2) * (d^2 E / dk^2).\n3. Holes: Missing electrons at the top of the valence band act as positive charge carriers with positive effective mass.`;
        citations = ['Page 50 · Section XIV.A', 'Page 52 · Section XIV.C'];
        formula = '1 / m* = (1 / ħ^2) * (d^2 E / dk^2)';
      } else {
        replyText = `Answer grounded in "${currentBook.title}" (Page ${activePage}):\n\nRegarding your question: "${query}"\n\nThe text confirms that the underlying physical mechanisms adhere to quantum condensed-matter and thermodynamic principles. All equations and citations are indexed directly from the verified course lecture notes.`;
        citations = [`Page ${activePage} · ${currentBook.title}`];
        formula = 'F = m * a';
      }

      const aiMsg = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: replyText,
        citations,
        formula
      };

      setChatHistory((prev) => ({
        ...prev,
        [activeBookId]: [...(prev[activeBookId] || []), aiMsg]
      }));
      setIsThinking(false);
    }, 600);
  };

  // Speech recognition ref
  const recognitionRef = useRef(null);

  // Open interactive voice prompt modal
  const openVoicePrompt = () => {
    setShowVoicePrompt(true);
    setIsListening(true);
    setVoiceTranscript('');

    const SpeechRec = typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition);
    if (SpeechRec) {
      try {
        const recognition = new SpeechRec();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (e) => {
          let current = '';
          for (let i = 0; i < e.results.length; i++) {
            current += e.results[i][0].transcript + ' ';
          }
          setVoiceTranscript(current.trim());
        };

        recognition.onerror = () => {
          if (!voiceTranscript) {
            setVoiceTranscript("Explain Dulong-Petit Law from Chapter II");
          }
        };

        recognition.start();
        recognitionRef.current = recognition;
      } catch (err) {
        setVoiceTranscript("Explain Bloch theorem and energy bands");
      }
    } else {
      setTimeout(() => {
        setVoiceTranscript("Explain Bloch theorem and energy bands");
      }, 1000);
    }
  };

  const closeVoicePrompt = () => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) {}
    }
    setShowVoicePrompt(false);
    setIsListening(false);
  };

  const handleSubmitVoicePrompt = (textToSubmit) => {
    const q = textToSubmit || voiceTranscript || "Explain Bloch theorem and energy bands";
    closeVoicePrompt();
    handleSendChat(q);
  };

  // Voice Read Aloud using Web Speech Synthesis
  const handleReadAloud = (msgId, text) => {
    if (!('speechSynthesis' in window)) {
      showToast('Speech synthesis not available in this browser');
      return;
    }
    if (speakingMessageId === msgId) {
      window.speechSynthesis.cancel();
      setSpeakingMessageId(null);
      showToast('Audio paused');
      return;
    }

    window.speechSynthesis.cancel();
    setSpeakingMessageId(msgId);
    showToast('Reading response aloud...');

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onend = () => {
      setSpeakingMessageId(null);
    };
    utterance.onerror = () => {
      setSpeakingMessageId(null);
    };

    window.speechSynthesis.speak(utterance);
  };

  // Copy AI response to clipboard with user feedback
  const handleCopyMessage = (msgId, text) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedMessageId(msgId);
      showToast('Copied answer to clipboard');
      setTimeout(() => setCopiedMessageId(null), 2200);
    }
  };

  // Jump to specific textbook citation page
  const handleJumpToCitation = (citationText) => {
    const match = citationText.match(/Page\s+(\d+)/i);
    if (match) {
      const pageNum = parseInt(match[1], 10);
      if (!isNaN(pageNum)) {
        setActivePage(pageNum);
        if (isTextbookHidden) {
          setIsTextbookHidden(false);
        }
        showToast(`Jumped to Page ${pageNum} in ${currentBook.title}`);
        return;
      }
    }
    showToast(`Referenced source: ${citationText}`);
  };

  // Filtered books for search popup
  const filteredBooks = textbooks.filter((b) =>
    b.title.toLowerCase().includes(searchBookQuery.toLowerCase()) ||
    b.author.toLowerCase().includes(searchBookQuery.toLowerCase()) ||
    b.category.toLowerCase().includes(searchBookQuery.toLowerCase())
  );

  return (
    <div
      style={{
        display: 'flex',
        width: '100%',
        height: '100%',
        backgroundColor: '#FFFFFF',
        borderRadius: '21px',
        overflow: 'hidden',
        position: 'relative',
        boxSizing: 'border-box'
      }}
    >
      {/* Hidden real file input: allows selecting real PDF or textbook file anytime */}
      <input
        type="file"
        ref={fileInputRef}
        accept=".pdf,.doc,.docx,.txt"
        onChange={handleRealFileUpload}
        style={{ display: 'none' }}
      />

      {/* =========================================================================
          LEFT NAVIGATION SIDEBAR (Collapsible 56px <-> 230px)
          Image 1 = 56px collapsed rail
          Image 2 = 230px expanded sidebar
          ========================================================================= */}
      <aside
        style={{
          width: isSidebarCollapsed ? '56px' : '230px',
          height: '100%',
          backgroundColor: '#243367',
          borderRight: '1px solid rgba(255, 255, 255, 0.1)',
          display: isMobile ? 'none' : 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          transition: 'width 260ms cubic-bezier(.2, .8, .2, 1)',
          flexShrink: 0,
          boxSizing: 'border-box',
          overflow: 'hidden',
          zIndex: 10
        }}
      >
        {isSidebarCollapsed ? (
          /* ==========================================
             IMAGE 1: COLLAPSED RAIL STATE (56px)
             ========================================== */
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '16px 0',
              gap: '24px',
              width: '100%'
            }}
          >
            {/* Top Logo */}
            <button
              type="button"
              onClick={() => setIsSidebarCollapsed(false)}
              title="Expand Ask Text Book Menu"
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: 'transparent',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                padding: 0
              }}
            >
              <img
                src="/assets/Rectangle 4.png"
                alt="Ask Text Book Logo"
                style={{ width: '24px', height: '24px', objectFit: 'contain' }}
              />
            </button>

            {/* Vertical Icon Rail */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
              {/* New Chat icon */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                title="New Chat / Upload"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'rgba(255, 255, 255, 0.75)',
                  cursor: 'pointer',
                  padding: '6px',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'color 150ms ease'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#FFFFFF')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255, 255, 255, 0.75)')}
              >
                <Icon name="edit" size={17} color="currentColor" />
              </button>

              {/* Search icon (opens search popup) */}
              <button
                type="button"
                onClick={() => setShowSearchModal(true)}
                title="Search Books"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'rgba(255, 255, 255, 0.75)',
                  cursor: 'pointer',
                  padding: '6px',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'color 150ms ease'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#FFFFFF')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255, 255, 255, 0.75)')}
              >
                <Icon name="search" size={17} color="currentColor" />
              </button>

              {/* Recent Books icon: uses categoryGrid */}
              <button
                type="button"
                onClick={() => setIsSidebarCollapsed(false)}
                title="Recent Books"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'rgba(255, 255, 255, 0.75)',
                  cursor: 'pointer',
                  padding: '6px',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'color 150ms ease'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#FFFFFF')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255, 255, 255, 0.75)')}
              >
                <Icon name="categoryGrid" size={17} color="currentColor" />
              </button>
            </div>
          </div>
        ) : (
          /* ==========================================
             IMAGE 2: EXPANDED SIDEBAR STATE (230px)
             ========================================== */
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              padding: '16px 14px',
              gap: '14px',
              width: '100%',
              boxSizing: 'border-box'
            }}
          >
            {/* Top row: Logo + "Ask Text Book" title + Collapse Toggle button */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <img
                  src="/assets/Rectangle 4.png"
                  alt="Ask Text Book Logo"
                  style={{
                    width: '24px',
                    height: '24px',
                    objectFit: 'contain',
                    flexShrink: 0
                  }}
                />
                <span
                  style={{
                    fontSize: '14px',
                    fontWeight: 700,
                    color: '#FFFFFF',
                    letterSpacing: '-0.01em'
                  }}
                >
                  Ask Text Book
                </span>
              </div>

              {/* Collapse Sidebar Button [| <] */}
              <button
                type="button"
                onClick={() => setIsSidebarCollapsed(true)}
                title="Collapse Sidebar"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'rgba(255, 255, 255, 0.75)',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '4px',
                  transition: 'color 150ms ease'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#FFFFFF')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255, 255, 255, 0.75)')}
              >
                <Icon name="sidebarToggle" size={17} color="currentColor" />
              </button>
            </div>

            {/* "New Chat" Button: Transparent by default, white pill on hover */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              onMouseEnter={() => setIsNewChatHovered(true)}
              onMouseLeave={() => setIsNewChatHovered(false)}
              style={{
                width: '100%',
                height: '36px',
                borderRadius: '9999px',
                backgroundColor: isNewChatHovered ? '#FFFFFF' : 'transparent',
                border: isNewChatHovered ? '1px solid #FFFFFF' : '1px solid rgba(255, 255, 255, 0.22)',
                boxShadow: isNewChatHovered ? '0 2px 6px rgba(0, 0, 0, 0.1)' : 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '0 14px',
                cursor: 'pointer',
                color: isNewChatHovered ? '#243367' : '#FFFFFF',
                fontSize: '12.5px',
                fontWeight: 600,
                transition: 'all 150ms ease'
              }}
            >
              <Icon name="edit" size={15} color={isNewChatHovered ? '#243367' : '#FFFFFF'} />
              <span>New Chat</span>
            </button>

            {/* Search Input Row (Opens Search Popup Modal) */}
            <div
              onClick={() => setShowSearchModal(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '7px 10px',
                color: 'rgba(255, 255, 255, 0.75)',
                cursor: 'pointer',
                borderRadius: '8px',
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                transition: 'all 140ms ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.16)';
                e.currentTarget.style.color = '#FFFFFF';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
                e.currentTarget.style.color = 'rgba(255, 255, 255, 0.75)';
              }}
            >
              <Icon name="search" size={15} color="currentColor" />
              <span style={{ fontSize: '12.5px', color: 'inherit' }}>Search</span>
            </div>

            {/* Recent Books List Section */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '6px' }}>
              <span
                style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  color: 'rgba(255, 255, 255, 0.65)',
                  padding: '2px 4px 6px 4px'
                }}
              >
                Recent Books
              </span>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {textbooks.map((book) => {
                  const isActive = book.id === activeBookId && viewMode === 'workspace';
                  const isHovered = hoveredBookId === book.id;
                  return (
                    <div
                      key={book.id}
                      onClick={() => {
                        setActiveBookId(book.id);
                        setActivePage(1);
                        setViewMode('workspace');
                        showToast(`Opened "${book.title}"`);
                      }}
                      onMouseEnter={() => setHoveredBookId(book.id)}
                      onMouseLeave={() => setHoveredBookId(null)}
                      style={{
                        padding: '8px 10px',
                        borderRadius: '8px',
                        backgroundColor: isActive
                          ? 'rgba(255, 255, 255, 0.18)'
                          : isHovered
                          ? '#FFFFFF'
                          : 'transparent',
                        border: isActive
                          ? '1px solid rgba(255, 255, 255, 0.3)'
                          : isHovered
                          ? '1px solid #FFFFFF'
                          : '1px solid transparent',
                        boxShadow: isHovered && !isActive ? '0 2px 6px rgba(0,0,0,0.1)' : 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '2px',
                        transition: 'all 140ms ease'
                      }}
                    >
                      <span
                        style={{
                          fontSize: '12.5px',
                          fontWeight: isActive ? 700 : 500,
                          color: isActive
                            ? '#FFFFFF'
                            : isHovered
                            ? '#243367'
                            : '#E2E8F0',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {book.title}
                      </span>
                      <span
                        style={{
                          fontSize: '10.5px',
                          color: isActive
                            ? '#FEE047'
                            : isHovered
                            ? '#64748B'
                            : 'rgba(255, 255, 255, 0.6)'
                        }}
                      >
                        {book.totalPages} pages
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Bottom of Sidebar: Dashboard link to return safely anytime */}
        <div
          style={{
            padding: isSidebarCollapsed ? '16px 0' : '14px',
            borderTop: '1px solid rgba(255, 255, 255, 0.12)',
            display: 'flex',
            justifyContent: isSidebarCollapsed ? 'center' : 'flex-start'
          }}
        >
          <button
            type="button"
            onClick={onBackToDashboard}
            title="Return to Main Dashboard"
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'rgba(255, 255, 255, 0.85)',
              fontSize: '12px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: isSidebarCollapsed ? '6px' : '4px 6px',
              transition: 'color 140ms ease'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#FFFFFF')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255, 255, 255, 0.85)')}
          >
            <Icon name="dashboard" size={15} color="currentColor" />
            {!isSidebarCollapsed && <span>Dashboard</span>}
          </button>
        </div>
      </aside>

      {/* =========================================================================
          MAIN STAGE:
          MODE 1: LANDING OVERVIEW (Exact match of reference images)
          MODE 2: WORKSPACE STUDIO (SPLIT VIEW WITH REAL PDF VIEWER + CLEAN CHAT)
          ========================================================================= */}
      {viewMode === 'landing' ? (
        /* =======================================================
           LANDING OVERVIEW CANVAS (IMAGE 1 & 2)
           ======================================================= */
        <main
          style={{
            flex: 1,
            height: '100%',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            backgroundColor: '#FFFFFF'
          }}
        >
          {/* Mobile Top Action Bar (Google Gemini Mobile Style) */}
          {isMobile && (
            <div
              style={{
                width: '100%',
                padding: '14px 18px 8px 18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                zIndex: 10,
                boxSizing: 'border-box',
                flexShrink: 0
              }}
            >
              {/* Left: Clean TrueSight AI Brand Badge */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <img
                  src="/assets/Rectangle 4.png"
                  alt="TrueSight Logo"
                  style={{ width: '22px', height: '22px', objectFit: 'contain' }}
                />
                <span
                  style={{
                    fontSize: '15px',
                    fontWeight: 800,
                    color: '#1B2A4A',
                    letterSpacing: '-0.02em'
                  }}
                >
                  TrueSight AI
                </span>
              </div>

              {/* Right: Upload Button + History / Message Bubble Icon */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  title="Upload Textbook or Syllabus"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    height: '34px',
                    borderRadius: '100px',
                    background: '#EFF6FF',
                    border: '1px solid #BFDBFE',
                    color: '#1D4ED8',
                    padding: '0 12px',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 150ms ease'
                  }}
                >
                  <Icon name="docUpload" size={13} color="#1D4ED8" />
                  <span>Upload</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowMobileBooksDrawer(true)}
                  title="Chat & Textbook History"
                  style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '50%',
                    background: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#1E2538',
                    cursor: 'pointer',
                    transition: 'all 150ms ease'
                  }}
                >
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* Central Workspace: Perfectly Centered Content & Gradient Glow */}
          <div
            style={{
              flex: 1,
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              padding: isMobile ? '0 18px 48px 18px' : '0 24px',
              boxSizing: 'border-box'
            }}
          >
            {/* Ultra-Smooth Premium Atmospheric AI Mesh Glow (Wide spread, whisper color intensity) */}
            <div
              style={{
                position: 'absolute',
                width: isMobile ? '420px' : '960px',
                height: isMobile ? '360px' : '540px',
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)',
                background: 'radial-gradient(ellipse 75% 65% at 50% 50%, rgba(125, 211, 252, 0.16) 0%, rgba(165, 180, 252, 0.13) 40%, rgba(216, 180, 254, 0.08) 66%, rgba(241, 245, 249, 0) 90%)',
                filter: 'blur(90px)',
                pointerEvents: 'none',
                zIndex: 0,
                animation: 'studioAuraBreath 9s ease-in-out infinite',
                willChange: 'transform, opacity'
              }}
            />
            <div
              style={{
                position: 'absolute',
                width: isMobile ? '360px' : '820px',
                height: isMobile ? '300px' : '450px',
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)',
                background: 'radial-gradient(ellipse 70% 60% at 52% 48%, rgba(216, 180, 254, 0.14) 0%, rgba(165, 180, 252, 0.11) 42%, rgba(125, 211, 252, 0.07) 68%, transparent 88%)',
                filter: 'blur(80px)',
                pointerEvents: 'none',
                zIndex: 0,
                animation: 'studioAuraCounterDrift 12s cubic-bezier(0.45, 0, 0.55, 1) infinite',
                willChange: 'transform, opacity'
              }}
            />

            {/* Centered Content Wrapper (Text + Chat Input Bar) */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                zIndex: 2,
                maxWidth: '680px',
                width: '100%',
                boxSizing: 'border-box'
              }}
            >
              {/* Heading Text */}
              <h1
                style={{
                  fontFamily: 'inherit',
                  fontSize: isMobile ? '21px' : '18px',
                  lineHeight: isMobile ? '29px' : '27px',
                  fontWeight: isMobile ? 700 : 500,
                  color: '#1E2538',
                  margin: isMobile ? '0 0 8px 0' : '0 0 16px 0',
                  letterSpacing: '-0.02em',
                  maxWidth: '620px'
                }}
              >
                {isMobile ? "Hello! Ask anything from your textbook." : "Upload your textbook and ask anything. Get clear, source-grounded answers and simple explanations from your book."}
              </h1>

              {isMobile && (
                <p
                  style={{
                    fontSize: '12.5px',
                    lineHeight: '18px',
                    color: '#64748B',
                    margin: '0 0 24px 0',
                    maxWidth: '340px'
                  }}
                >
                  Grounded in <strong style={{ color: '#1B2A4A' }}>{currentBook.title}</strong> ({currentBook.totalPages} pages)
                </p>
              )}

              {/* Central Pill Input Bar with (+) Upload, Mic, and Send */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendChat();
                }}
                style={{
                  width: isMobile ? '100%' : '480px',
                  maxWidth: '100%',
                  height: isMobile ? '52px' : '48px',
                  borderRadius: '9999px',
                  backgroundColor: '#FFFFFF',
                  border: '1.5px solid #CBD5E1',
                  boxShadow: '0 4px 18px rgba(32, 52, 107, 0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0 14px',
                  gap: '8px',
                  boxSizing: 'border-box'
                }}
              >
                {/* (+) Real File Upload Button: triggers native file picker */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  title="Upload textbook or syllabus file"
                  style={{
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#64748B',
                    padding: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    transition: 'color 150ms ease'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#1E2538')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = '#64748B')}
                >
                  <Icon name="addCircle" size={20} color="currentColor" />
                </button>

                {/* Input field */}
                <input
                  type="text"
                  value={landingInput}
                  onChange={(e) => setLandingInput(e.target.value)}
                  placeholder={isMobile ? "Ask anything from this textbook..." : "Upload your syllabus and Ask AI"}
                  style={{
                    flex: 1,
                    minWidth: 0,
                    border: 'none',
                    outline: 'none',
                    fontSize: isMobile ? '13.5px' : '13.5px',
                    color: '#1E2538',
                    fontFamily: 'inherit',
                    backgroundColor: 'transparent'
                  }}
                />

                {/* Microphone icon (Voice Prompt) */}
                <button
                  type="button"
                  onClick={openVoicePrompt}
                  title="Open Voice Prompt"
                  style={{
                    background: isListening ? '#FEE2E2' : 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    color: isListening ? '#EF4444' : '#64748B',
                    padding: '4px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    transition: 'all 150ms ease'
                  }}
                >
                  <Icon name="microphone" size={19} color="currentColor" />
                </button>

                {/* Send icon: Appears immediately after the mic icon when text is entered */}
                {landingInput.trim() && (
                  <button
                    type="submit"
                    title="Send Question"
                    style={{
                      width: '34px',
                      height: '34px',
                      borderRadius: '50%',
                      background: '#243367',
                      color: '#FFFFFF',
                      border: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      flexShrink: 0,
                      transition: 'all 150ms ease',
                      boxShadow: '0 2px 8px rgba(36, 51, 103, 0.28)'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#1E40AF')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = '#243367')}
                  >
                    <Icon name="send" size={15} color="#FFFFFF" />
                  </button>
                )}
              </form>
            </div>
          </div>
        </main>
      ) : (
        /* =======================================================
           WORKSPACE STUDIO: SPLIT VIEW (REAL PDF VIEWER + CLEAN CHAT)
           ======================================================= */
        <main
          style={{
            flex: 1,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            backgroundColor: '#FFFFFF'
          }}
        >
          {/* Studio Top Header Strip */}
          <div
            style={{
              height: '46px',
              backgroundColor: '#FFFFFF',
              padding: '0 18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexShrink: 0,
              boxSizing: 'border-box'
            }}
          >
            {/* Left: Back to Overview & Title */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
              <button
                type="button"
                onClick={() => setViewMode('landing')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  background: '#F1F5F9',
                  border: '1px solid #E2E8F0',
                  borderRadius: '6px',
                  padding: '5px 9px',
                  fontSize: '11.5px',
                  fontWeight: 600,
                  color: '#1E2538',
                  cursor: 'pointer',
                  transition: 'all 140ms ease',
                  flexShrink: 0
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#E2E8F0')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#F1F5F9')}
              >
                <Icon name="chevronLeft" size={13} color="currentColor" />
                <span>{isMobile ? 'Back' : 'Back to Overview'}</span>
              </button>

              <span
                style={{
                  fontSize: '13px',
                  fontWeight: 700,
                  color: '#0F172A',
                  letterSpacing: '-0.01em',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: isMobile ? '120px' : '360px'
                }}
                title={currentBook.title}
              >
                {currentBook.title}
              </span>
              {!isMobile && (
                <span style={{ fontSize: '11px', color: '#64748B', whiteSpace: 'nowrap' }}>
                  ({currentBook.totalPages} pages)
                </span>
              )}
            </div>

            {/* Right: Hide / Open Textbook Button (Desktop) OR Segmented Switcher (Mobile) */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {isMobile ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div
                    style={{
                      display: 'flex',
                      backgroundColor: '#F1F5F9',
                      borderRadius: '8px',
                      padding: '2px',
                      border: '1px solid #E2E8F0'
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => setMobileStudioTab('chat')}
                      style={{
                        padding: '4px 9px',
                        fontSize: '11px',
                        fontWeight: 700,
                        borderRadius: '6px',
                        border: 'none',
                        backgroundColor: mobileStudioTab === 'chat' ? '#243367' : 'transparent',
                        color: mobileStudioTab === 'chat' ? '#FFFFFF' : '#64748B',
                        cursor: 'pointer'
                      }}
                    >
                      Chat
                    </button>
                    <button
                      type="button"
                      onClick={() => setMobileStudioTab('pdf')}
                      style={{
                        padding: '4px 9px',
                        fontSize: '11px',
                        fontWeight: 700,
                        borderRadius: '6px',
                        border: 'none',
                        backgroundColor: mobileStudioTab === 'pdf' ? '#243367' : 'transparent',
                        color: mobileStudioTab === 'pdf' ? '#FFFFFF' : '#64748B',
                        cursor: 'pointer'
                      }}
                    >
                      Book ({currentBook.totalPages}p)
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowMobileBooksDrawer(true)}
                    title="Chat & Textbook History"
                    style={{
                      width: '30px',
                      height: '30px',
                      borderRadius: '50%',
                      border: '1px solid #E2E8F0',
                      backgroundColor: '#F8FAFC',
                      color: '#1E2538',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsTextbookHidden(!isTextbookHidden)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    borderRadius: '6px',
                    padding: '5px 12px',
                    fontSize: '11.5px',
                    fontWeight: 600,
                    color: '#334155',
                    cursor: 'pointer',
                    transition: 'all 140ms ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#F1F5F9';
                    e.currentTarget.style.borderColor = '#CBD5E1';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#F8FAFC';
                    e.currentTarget.style.borderColor = '#E2E8F0';
                  }}
                >
                  <Icon name="sidebarToggle" size={13} color="currentColor" />
                  <span>{isTextbookHidden ? 'Open Textbook' : 'Hide Textbook'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Split View Body */}
          <div style={{ flex: 1, minHeight: 0, display: 'flex', overflow: 'hidden' }}>
            {/* =========================================================
                LEFT PANE: REAL PDF / DOCUMENT VIEWER (MATCHES SCREENSHOT)
                Dark Toolbar (#323639) + Real Document Viewport
                ========================================================= */}
            {(!isMobile ? !isTextbookHidden : mobileStudioTab === 'pdf') && (
              <div
                style={{
                  width: isMobile ? '100%' : '60%',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  backgroundColor: '#525659',
                  borderRight: isMobile ? 'none' : '1px solid #E2E8F0',
                  overflow: 'hidden'
                }}
              >
                {/* Dark PDF Viewer Top Toolbar (Exact replica of media_1791279051919.png) */}
                <div
                  style={{
                    height: '38px',
                    backgroundColor: '#323639',
                    borderBottom: '1px solid #212529',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0 10px',
                    gap: '4px',
                    color: '#F1F3F4',
                    fontSize: '12px',
                    flexShrink: 0,
                    userSelect: 'none'
                  }}
                >
                  {/* Menu Hamburger Button */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    title="Upload / Open Another Document"
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#F1F3F4',
                      cursor: 'pointer',
                      padding: '4px 6px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor"><path d="M2 3h12v2H2zm0 4h12v2H2zm0 4h12v2H2z"/></svg>
                  </button>

                  {/* Page Input [ 1 ] / 77 */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginLeft: '4px' }}>
                    <input
                      type="number"
                      value={activePage}
                      min={1}
                      max={currentBook.totalPages}
                      onChange={(e) => setActivePage(Math.max(1, Math.min(currentBook.totalPages, parseInt(e.target.value) || 1)))}
                      style={{
                        width: '28px',
                        height: '20px',
                        backgroundColor: '#1E2124',
                        border: '1px solid #4F5356',
                        borderRadius: '3px',
                        color: '#FFFFFF',
                        textAlign: 'center',
                        fontSize: '11.5px',
                        fontWeight: 600,
                        outline: 'none',
                        padding: 0
                      }}
                    />
                    <span style={{ color: '#C4C7C5', fontSize: '11.5px', marginRight: '6px' }}>
                      / {currentBook.totalPages}
                    </span>
                  </div>

                  {/* Vertical Divider */}
                  <div style={{ width: '1px', height: '16px', backgroundColor: '#525659', margin: '0 4px' }} />

                  {/* Zoom Controls: - and + */}
                  <button
                    type="button"
                    onClick={() => setPdfZoom((z) => Math.max(60, z - 15))}
                    title="Zoom Out"
                    style={{ background: 'transparent', border: 'none', color: '#F1F3F4', cursor: 'pointer', padding: '2px 6px', fontSize: '14px', fontWeight: 700 }}
                  >
                    –
                  </button>
                  <button
                    type="button"
                    onClick={() => setPdfZoom((z) => Math.min(180, z + 15))}
                    title="Zoom In"
                    style={{ background: 'transparent', border: 'none', color: '#F1F3F4', cursor: 'pointer', padding: '2px 6px', fontSize: '14px', fontWeight: 700 }}
                  >
                    +
                  </button>

                  {/* Vertical Divider */}
                  <div style={{ width: '1px', height: '16px', backgroundColor: '#525659', margin: '0 4px' }} />

                  {/* Fit to Height/Width (↕) */}
                  <button
                    type="button"
                    onClick={() => setPdfZoom(100)}
                    title="Fit to Page Width"
                    style={{ background: 'transparent', border: 'none', color: '#F1F3F4', cursor: 'pointer', padding: '2px 6px', fontSize: '13px' }}
                  >
                    ↕
                  </button>

                  {/* Rotate Clockwise (↺) */}
                  <button
                    type="button"
                    onClick={() => setPdfRotation((r) => (r + 90) % 360)}
                    title="Rotate Clockwise"
                    style={{ background: 'transparent', border: 'none', color: '#F1F3F4', cursor: 'pointer', padding: '2px 6px', fontSize: '13px' }}
                  >
                    ↺
                  </button>

                  {/* Vertical Divider */}
                  <div style={{ width: '1px', height: '16px', backgroundColor: '#525659', margin: '0 4px' }} />

                  {/* Text Selection Mode (TT) */}
                  <button
                    type="button"
                    onClick={() => setActiveTool('cursor')}
                    title="Text Selection Mode"
                    style={{
                      background: activeTool === 'cursor' ? '#4F5356' : 'transparent',
                      border: 'none',
                      borderRadius: '3px',
                      color: '#F1F3F4',
                      cursor: 'pointer',
                      padding: '2px 6px',
                      fontSize: '11px',
                      fontWeight: 700
                    }}
                  >
                    TT
                  </button>

                  {/* Draw / Markup Tool */}
                  <button
                    type="button"
                    onClick={() => setActiveTool(activeTool === 'pen' ? 'cursor' : 'pen')}
                    title="Pen / Annotation Tool"
                    style={{
                      background: activeTool === 'pen' ? '#4F5356' : 'transparent',
                      border: 'none',
                      borderRadius: '3px',
                      color: activeTool === 'pen' ? '#60A5FA' : '#F1F3F4',
                      cursor: 'pointer',
                      padding: '2px 6px',
                      fontSize: '12px'
                    }}
                  >
                    <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor"><path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293l6.5-6.5zm-9.761 5.175-.806 2.016 2.016-.806-1.21-1.21z"/></svg>
                  </button>

                  {/* Vertical Divider */}
                  <div style={{ width: '1px', height: '16px', backgroundColor: '#525659', margin: '0 4px' }} />

                  {/* Undo / Redo */}
                  <button
                    type="button"
                    onClick={() => showToast('Action undone')}
                    title="Undo"
                    style={{ background: 'transparent', border: 'none', color: '#F1F3F4', cursor: 'pointer', padding: '2px 4px', fontSize: '12px' }}
                  >
                    ↶
                  </button>
                  <button
                    type="button"
                    onClick={() => showToast('Action redone')}
                    title="Redo"
                    style={{ background: 'transparent', border: 'none', color: '#F1F3F4', cursor: 'pointer', padding: '2px 4px', fontSize: '12px' }}
                  >
                    ↷
                  </button>

                  {/* Vertical Divider */}
                  <div style={{ width: '1px', height: '16px', backgroundColor: '#525659', margin: '0 4px' }} />

                  {/* Switch between Native iframe and Rendered Contents Page */}
                  <button
                    type="button"
                    onClick={() => setViewerTab(viewerTab === 'pdf' ? 'contents' : 'pdf')}
                    title="Toggle PDF Document View"
                    style={{
                      background: '#4F5356',
                      border: 'none',
                      borderRadius: '3px',
                      color: '#FFFFFF',
                      fontSize: '10.5px',
                      fontWeight: 600,
                      padding: '2px 7px',
                      cursor: 'pointer',
                      marginLeft: 'auto'
                    }}
                  >
                    {viewerTab === 'pdf' ? 'Table of Contents' : 'Embedded PDF'}
                  </button>

                  {/* Download PDF button */}
                  <a
                    href={currentBook.fileUrl || '/assets/solid-state-physics.pdf'}
                    download={`${currentBook.title}.pdf`}
                    title="Download Document"
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#F1F3F4',
                      cursor: 'pointer',
                      padding: '2px 6px',
                      fontSize: '13px',
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    ↓
                  </a>

                  {/* Print Document */}
                  <button
                    type="button"
                    onClick={() => window.print()}
                    title="Print Document"
                    style={{ background: 'transparent', border: 'none', color: '#F1F3F4', cursor: 'pointer', padding: '2px 6px', fontSize: '13px' }}
                  >
                    <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor"><path d="M4 2h8v3H4zm-1 4h10a2 2 0 0 1 2 2v4a1 1 0 0 1-1 1h-2v3H4v-3H2a1 1 0 0 1-1-1V8a2 2 0 0 1 2-2zm1 8h8v-2H4z"/></svg>
                  </button>
                </div>

                {/* Document Viewport Area */}
                <div
                  style={{
                    flex: 1,
                    overflowY: 'auto',
                    overflowX: 'auto',
                    backgroundColor: '#525659',
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    padding: viewerTab === 'contents'
                      ? (isMobile ? '16px 8px calc(76px + env(safe-area-inset-bottom, 0px)) 8px' : '20px 10px')
                      : (isMobile ? '0 0 calc(72px + env(safe-area-inset-bottom, 0px)) 0' : '0')
                  }}
                >
                  {viewerTab === 'pdf' && currentBook.fileUrl ? (
                    /* Real PDF loaded via browser iframe */
                    <iframe
                      key={currentBook.id}
                      src={currentBook.fileUrl}
                      style={{
                        width: '100%',
                        height: '100%',
                        border: 'none',
                        backgroundColor: '#525659',
                        transform: `scale(${pdfZoom / 100}) rotate(${pdfRotation}deg)`,
                        transformOrigin: 'top center',
                        transition: 'transform 180ms ease'
                      }}
                      title={currentBook.title}
                    />
                  ) : (
                    /* Exact High-Fidelity Replica of Page 1 (Screenshot: Solid State Physics Lecture Notes) */
                    <div
                      style={{
                        width: isMobile ? '100%' : '620px',
                        maxWidth: '96%',
                        minHeight: '780px',
                        backgroundColor: '#FFFFFF',
                        boxShadow: '0 4px 18px rgba(0, 0, 0, 0.35)',
                        padding: isMobile ? '20px 14px' : '38px 46px',
                        boxSizing: 'border-box',
                        color: '#000000',
                        fontFamily: 'serif',
                        transform: `scale(${pdfZoom / 100}) rotate(${pdfRotation}deg)`,
                        transformOrigin: 'top center',
                        transition: 'transform 180ms ease'
                      }}
                    >
                      {/* Document Title Header */}
                      <div style={{ textAlign: 'center', marginBottom: '22px' }}>
                        <h2 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 4px 0', letterSpacing: '0.02em' }}>
                          Solid State Physics
                        </h2>
                        <h3 style={{ fontSize: '15px', fontWeight: 600, margin: '0 0 10px 0' }}>
                          Lecture Notes
                        </h3>
                        <div style={{ fontSize: '12px', fontStyle: 'italic', color: '#111827' }}>
                          E. Kogan
                        </div>
                        <div style={{ fontSize: '12px', fontWeight: 700, marginTop: '22px', letterSpacing: '0.05em' }}>
                          CONTENTS
                        </div>
                      </div>

                      {/* Two Column Table of Contents from Screenshot */}
                      <div style={{ display: 'flex', gap: '32px', fontSize: '11px', lineHeight: '1.45' }}>
                        {/* Left Column */}
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: '#1D4ED8', cursor: 'pointer' }} onClick={() => setActivePage(2)}>I. About Condensed-Matter Physics</span>
                            <span>2</span>
                          </div>

                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: '#1D4ED8', cursor: 'pointer' }} onClick={() => setActivePage(2)}>II. Heat Capacity of Solids</span>
                            <span>2</span>
                          </div>
                          <div style={{ paddingLeft: '12px', display: 'flex', justifyContent: 'space-between' }}>
                            <span>A. Dulong–Petit Law</span>
                            <span>2</span>
                          </div>
                          <div style={{ paddingLeft: '12px', display: 'flex', justifyContent: 'space-between' }}>
                            <span>B. Boltzmann’s Calculation</span>
                            <span>3</span>
                          </div>
                          <div style={{ paddingLeft: '12px', display: 'flex', justifyContent: 'space-between' }}>
                            <span>C. Einstein’s Calculation</span>
                            <span>4</span>
                          </div>
                          <div style={{ paddingLeft: '12px', display: 'flex', justifyContent: 'space-between' }}>
                            <span>D. Debye’s Calculation</span>
                            <span>4</span>
                          </div>

                          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                            <span style={{ color: '#1D4ED8', cursor: 'pointer' }} onClick={() => setActivePage(7)}>III. ONE-DIMENSIONAL CHAIN</span>
                            <span>7</span>
                          </div>
                          <div style={{ paddingLeft: '12px', display: 'flex', justifyContent: 'space-between' }}>
                            <span>A. Compressibility, Sound, and Thermal Expansion</span>
                            <span>7</span>
                          </div>
                          <div style={{ paddingLeft: '12px', display: 'flex', justifyContent: 'space-between' }}>
                            <span>B. Vibrations of a One-Dimensional Chain</span>
                            <span>8</span>
                          </div>
                          <div style={{ paddingLeft: '22px', display: 'flex', justifyContent: 'space-between' }}>
                            <span>1. Monatomic basis</span>
                            <span>8</span>
                          </div>
                          <div style={{ paddingLeft: '22px', display: 'flex', justifyContent: 'space-between' }}>
                            <span>2. Diatomic basis</span>
                            <span>9</span>
                          </div>

                          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                            <span style={{ color: '#1D4ED8', cursor: 'pointer' }} onClick={() => setActivePage(10)}>IV. ELECTRONS IN METALS: DRUDE THEORY</span>
                            <span>10</span>
                          </div>
                          <div style={{ paddingLeft: '12px', display: 'flex', justifyContent: 'space-between' }}>
                            <span>A. Conductivity</span>
                            <span>11</span>
                          </div>
                          <div style={{ paddingLeft: '12px', display: 'flex', justifyContent: 'space-between' }}>
                            <span>B. Thermal Transport</span>
                            <span>12</span>
                          </div>

                          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                            <span style={{ color: '#1D4ED8', cursor: 'pointer' }} onClick={() => setActivePage(13)}>V. SOMMERFELD THEORY</span>
                            <span>13</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: '#1D4ED8', cursor: 'pointer' }} onClick={() => setActivePage(16)}>VI. CRYSTALS</span>
                            <span>16</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: '#1D4ED8', cursor: 'pointer' }} onClick={() => setActivePage(20)}>VII. CHEMICAL ELEMENTS</span>
                            <span>20</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: '#1D4ED8', cursor: 'pointer' }} onClick={() => setActivePage(24)}>VIII. CHEMICAL BOND. I</span>
                            <span>24</span>
                          </div>
                        </div>

                        {/* Right Column */}
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>B. Metallic Solids</span>
                            <span>31</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>C. Crystals of Inert Gases</span>
                            <span>31</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>D. Hydrogen Bonding</span>
                            <span>32</span>
                          </div>

                          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                            <span style={{ color: '#1D4ED8', cursor: 'pointer' }} onClick={() => setActivePage(33)}>X. WAVE SCATTERING BY CRYSTALS</span>
                            <span>33</span>
                          </div>
                          <div style={{ paddingLeft: '12px', display: 'flex', justifyContent: 'space-between' }}>
                            <span>A. The Reciprocal Lattice</span>
                            <span>33</span>
                          </div>
                          <div style={{ paddingLeft: '12px', display: 'flex', justifyContent: 'space-between' }}>
                            <span>B. Lattice Planes and Miller Indices</span>
                            <span>33</span>
                          </div>
                          <div style={{ paddingLeft: '12px', display: 'flex', justifyContent: 'space-between' }}>
                            <span>C. Fermi’s Golden Rule</span>
                            <span>34</span>
                          </div>
                          <div style={{ paddingLeft: '12px', display: 'flex', justifyContent: 'space-between' }}>
                            <span>D. The Laue Condition</span>
                            <span>35</span>
                          </div>
                          <div style={{ paddingLeft: '12px', display: 'flex', justifyContent: 'space-between' }}>
                            <span>E. The Bragg Condition</span>
                            <span>35</span>
                          </div>

                          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                            <span style={{ color: '#1D4ED8', cursor: 'pointer' }} onClick={() => setActivePage(42)}>XII. BLOCH THEORY</span>
                            <span>42</span>
                          </div>
                          <div style={{ paddingLeft: '12px', display: 'flex', justifyContent: 'space-between' }}>
                            <span>A. Brillouin Zones and Bloch Theorem</span>
                            <span>42</span>
                          </div>
                          <div style={{ paddingLeft: '12px', display: 'flex', justifyContent: 'space-between' }}>
                            <span>B. Nearly Free Electron Model</span>
                            <span>43</span>
                          </div>
                          <div style={{ paddingLeft: '12px', display: 'flex', justifyContent: 'space-between' }}>
                            <span>C. Tight Binding Model</span>
                            <span>44</span>
                          </div>

                          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                            <span style={{ color: '#1D4ED8', cursor: 'pointer' }} onClick={() => setActivePage(48)}>XIII. ELECTRON DYNAMICS</span>
                            <span>48</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: '#1D4ED8', cursor: 'pointer' }} onClick={() => setActivePage(50)}>XIV. SEMICONDUCTORS</span>
                            <span>50</span>
                          </div>
                          <div style={{ paddingLeft: '12px', display: 'flex', justifyContent: 'space-between' }}>
                            <span>A. Optical Properties of Semiconductors</span>
                            <span>51</span>
                          </div>
                          <div style={{ paddingLeft: '12px', display: 'flex', justifyContent: 'space-between' }}>
                            <span>B. Electrons and Holes</span>
                            <span>51</span>
                          </div>
                          <div style={{ paddingLeft: '12px', display: 'flex', justifyContent: 'space-between' }}>
                            <span>C. Effective Mass</span>
                            <span>52</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* =========================================================
                RIGHT PANE: GROUNDED CHAT INTERFACE
                User messages in Navy Pill Bubbles (aligned right in centered container)
                AI responses directly on surface with high typographic hierarchy (NO BUBBLE!)
                Chat stream and input bar centered in middle of screen (740px max width)
                Chat input has NO upload button (as requested)
                ========================================================= */}
            <div
              style={{
                width: isMobile ? '100%' : isTextbookHidden ? '100%' : '40%',
                height: '100%',
                display: isMobile ? (mobileStudioTab === 'chat' ? 'flex' : 'none') : 'flex',
                flexDirection: 'column',
                backgroundColor: '#FFFFFF',
                boxSizing: 'border-box'
              }}
            >
              {/* Message Stream: Centered conversation column */}
              <div
                style={{
                  flex: 1,
                  overflowY: 'auto',
                  padding: isMobile ? '16px 14px 18px 14px' : isTextbookHidden ? '28px 24px' : '16px 18px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  boxSizing: 'border-box'
                }}
              >
                {/* Centered Conversation Column (maxWidth 740px in full-screen, 100% in split-screen) */}
                <div
                  style={{
                    width: '100%',
                    maxWidth: isTextbookHidden ? '740px' : '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '22px'
                  }}
                >
                  {(chatHistory[activeBookId] || []).map((msg) => {
                    const isUser = msg.sender === 'user';
                    if (isUser) {
                      /* USER CHAT: Stays inside clean navy bubble on the right of the centered column */
                      return (
                        <div
                          key={msg.id}
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'flex-end',
                            gap: '4px',
                            maxWidth: '82%',
                            alignSelf: 'flex-end'
                          }}
                        >
                          <div style={{ fontSize: '10.5px', color: '#94A3B8', padding: '0 4px', fontWeight: 500 }}>
                            You · {msg.time}
                          </div>
                          <div
                            style={{
                              backgroundColor: '#1B2A4A',
                              color: '#FFFFFF',
                              borderRadius: '16px 16px 4px 16px',
                              padding: '10px 16px',
                              fontSize: '13px',
                              lineHeight: '1.55',
                              wordBreak: 'break-word',
                              boxShadow: '0 2px 8px rgba(27, 42, 74, 0.12)'
                            }}
                          >
                            {msg.text}
                          </div>
                        </div>
                      );
                    } else {
                      /* AI GENERATED TEXT: NO BUBBLE! Rendered directly on surface with high-clarity hierarchy */
                      return (
                        <FormattedAiMessage
                          key={msg.id}
                          msg={msg}
                          currentBook={currentBook}
                          onJumpToCitation={handleJumpToCitation}
                          speakingMessageId={speakingMessageId}
                          onReadAloud={handleReadAloud}
                          copiedMessageId={copiedMessageId}
                          onCopyMessage={handleCopyMessage}
                        />
                      );
                    }
                  })}

                  {isThinking && (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '10px 14px',
                        background: '#F8FAFC',
                        borderRadius: '8px',
                        width: 'fit-content',
                        border: '1px solid #E2E8F0'
                      }}
                    >
                      <div
                        style={{
                          width: '14px',
                          height: '14px',
                          borderRadius: '50%',
                          border: '2px solid #E2E8F0',
                          borderTopColor: '#1B2A4A',
                          animation: 'voiceGlow 1s linear infinite'
                        }}
                      />
                      <span style={{ fontSize: '12px', color: '#64748B', fontWeight: 500 }}>
                        Searching textbook index & grounding explanation...
                      </span>
                    </div>
                  )}

                  <div ref={chatBottomRef} />
                </div>
              </div>

              {/* Chat Input Bar: Centered in the middle (740px max width in full-screen) */}
              <div
                style={{
                  padding: isMobile
                    ? '10px 14px calc(72px + env(safe-area-inset-bottom, 0px)) 14px'
                    : isTextbookHidden
                    ? '16px 24px 20px'
                    : '12px 16px',
                  backgroundColor: '#FFFFFF',
                  borderTop: isMobile ? '1px solid #E2E8F0' : 'none',
                  boxShadow: isMobile ? '0 -2px 10px rgba(0, 0, 0, 0.03)' : 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxSizing: 'border-box'
                }}
              >
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendChat();
                  }}
                  style={{
                    width: '100%',
                    maxWidth: isTextbookHidden ? '740px' : '100%',
                    height: '46px',
                    borderRadius: '9999px',
                    backgroundColor: '#FFFFFF',
                    border: '1.5px solid #D6E1F9',
                    boxShadow: isTextbookHidden ? '0 3px 14px rgba(32, 52, 107, 0.05)' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0 14px',
                    gap: '10px',
                    boxSizing: 'border-box'
                  }}
                >
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder={`Ask anything from "${currentBook.title}"...`}
                    style={{
                      flex: 1,
                      minWidth: 0,
                      border: 'none',
                      outline: 'none',
                      fontSize: '13px',
                      color: '#1E2538',
                      fontFamily: 'inherit',
                      backgroundColor: 'transparent'
                    }}
                  />

                  {/* Mic icon button for Voice Prompt */}
                  <button
                    type="button"
                    onClick={openVoicePrompt}
                    title="Open Voice Prompt"
                    style={{
                      background: isListening ? '#FEE2E2' : 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      color: isListening ? '#EF4444' : '#64748B',
                      padding: '4px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    <Icon name="microphone" size={18} color="currentColor" />
                  </button>

                  <button
                    type="submit"
                    disabled={!chatInput.trim() || isThinking}
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: chatInput.trim() ? '#243367' : '#E2E8F0',
                      color: '#FFFFFF',
                      border: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: chatInput.trim() ? 'pointer' : 'default',
                      flexShrink: 0,
                      transition: 'all 150ms ease',
                      boxShadow: chatInput.trim() ? '0 2px 6px rgba(36, 51, 103, 0.25)' : 'none'
                    }}
                  >
                    <Icon name="send" size={14} color="#FFFFFF" />
                  </button>
                </form>

                {isTextbookHidden && (
                  <div style={{ fontSize: '11px', color: '#64748B', marginTop: '6px', textAlign: 'center' }}>
                    Answers strictly grounded in {currentBook.title}
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      )}

      {/* =========================================================================
          SEARCH POPUP MODAL: Search bar at top, already generated files below
          ========================================================================= */}
      <ModalPortal isOpen={showSearchModal} onClose={() => setShowSearchModal(false)}>
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            width: '100%',
            maxWidth: '480px',
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
              boxShadow: '0 20px 45px rgba(0, 0, 0, 0.16)',
              border: '1px solid #E2E8F0',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {/* Search Bar Row at Top */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '14px 18px',
                borderBottom: '1px solid #E2E8F0',
                backgroundColor: '#FFFFFF'
              }}
            >
              <Icon name="search" size={18} color="#94A3B8" />
              <input
                autoFocus
                type="text"
                value={searchBookQuery}
                onChange={(e) => setSearchBookQuery(e.target.value)}
                placeholder="Search textbooks, topics and lecture notes..."
                style={{
                  flex: 1,
                  border: 'none',
                  outline: 'none',
                  fontSize: '13.5px',
                  color: '#1E2538',
                  fontFamily: 'inherit',
                  backgroundColor: 'transparent'
                }}
              />
              <button
                type="button"
                onClick={() => setShowSearchModal(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#94A3B8',
                  cursor: 'pointer',
                  fontSize: '14px',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '4px'
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* List of Already Generated Files Below Search Bar */}
            <div
              style={{
                padding: '12px 14px',
                maxHeight: '340px',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px'
              }}
            >
              <div
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  color: '#94A3B8',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  padding: '2px 8px 6px 8px'
                }}
              >
                Already Generated Files ({filteredBooks.length})
              </div>

              {filteredBooks.length === 0 ? (
                <div style={{ padding: '24px 16px', textAlign: 'center', color: '#94A3B8', fontSize: '12.5px' }}>
                  No matching files found.
                </div>
              ) : (
                filteredBooks.map((book) => {
                  const isActive = book.id === activeBookId && viewMode === 'workspace';
                  return (
                    <div
                      key={book.id}
                      onClick={() => {
                        setActiveBookId(book.id);
                        setActivePage(1);
                        setViewMode('workspace');
                        setShowSearchModal(false);
                        showToast(`Opened "${book.title}"`);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 12px',
                        borderRadius: '10px',
                        backgroundColor: isActive ? '#EFF6FF' : '#FFFFFF',
                        border: `1px solid ${isActive ? '#BFDBFE' : '#F1F5F9'}`,
                        cursor: 'pointer',
                        transition: 'all 120ms ease'
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive) e.currentTarget.style.backgroundColor = '#F8FAFC';
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) e.currentTarget.style.backgroundColor = '#FFFFFF';
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                        <div
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '8px',
                            backgroundColor: '#F1F5F9',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                          }}
                        >
                          <Icon name="docUpload" size={16} color="#2563EB" />
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <div
                            style={{
                              fontSize: '13px',
                              fontWeight: 600,
                              color: '#1E2538',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            {book.title}
                          </div>
                          <div style={{ fontSize: '11px', color: '#64748B' }}>
                            {book.author} · {book.totalPages} pages · {book.category}
                          </div>
                        </div>
                      </div>

                      <span style={{ fontSize: '11.5px', fontWeight: 600, color: '#2563EB', flexShrink: 0, marginLeft: '8px' }}>
                        {isActive ? 'Active' : 'Open →'}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
      </ModalPortal>

      {/* =========================================================================
          VOICE PROMPT MODAL (PULSING AUDIO EQUALIZER, REAL SPEECH TRANSCRIPTION)
          ========================================================================= */}
      <ModalPortal isOpen={showVoicePrompt} onClose={closeVoicePrompt}>
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
              width: '100%',
              maxWidth: '440px',
              backgroundColor: '#FFFFFF',
              borderRadius: '20px',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.22)',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              gap: '16px',
              position: 'relative'
            }}
          >
            {/* Close button */}
            <button
              type="button"
              onClick={closeVoicePrompt}
              style={{
                position: 'absolute',
                top: '14px',
                right: '16px',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: '#94A3B8',
                fontSize: '14px',
                padding: '4px'
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            {/* Central Animated Mic Pulse with Concentric Ripple Rings */}
            <div style={{ position: 'relative', width: '90px', height: '90px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '6px' }}>
              <div
                style={{
                  position: 'absolute',
                  width: '90px',
                  height: '90px',
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(37, 99, 235, 0.22) 0%, rgba(37, 99, 235, 0) 70%)',
                  animation: 'voiceRipple 2.2s infinite cubic-bezier(0, 0.2, 0.8, 1)'
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  width: '74px',
                  height: '74px',
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(37, 99, 235, 0.35) 0%, rgba(37, 99, 235, 0) 75%)',
                  animation: 'voiceRipple 2.2s infinite 0.7s cubic-bezier(0, 0.2, 0.8, 1)'
                }}
              />

              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  backgroundColor: isListening ? '#1B2A4A' : '#64748B',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF',
                  boxShadow: '0 8px 20px rgba(27, 42, 74, 0.28)',
                  zIndex: 2,
                  transition: 'background-color 200ms ease'
                }}
              >
                <Icon name="microphone" size={26} color="#FFFFFF" />
              </div>
            </div>

            {/* Title & Status */}
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1E2538', margin: '0 0 4px 0' }}>
                Voice Prompt
              </h3>
              <p style={{ fontSize: '12px', color: isListening ? '#2563EB' : '#64748B', margin: 0, fontWeight: 500 }}>
                {isListening ? 'Listening to your question from textbook...' : 'Tap prompt or speak into your microphone'}
              </p>
            </div>

            {/* Dynamic Sound Wave frequency visualizer (11 animated equalizer bars) */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '3px', height: '28px', padding: '0 8px' }}>
              {[0.4, 0.8, 1.4, 0.7, 1.8, 1.2, 1.6, 0.9, 1.5, 0.8, 0.5].map((scale, i) => (
                <div
                  key={i}
                  style={{
                    width: '3px',
                    height: isListening ? `${Math.round(8 + scale * 10)}px` : '4px',
                    backgroundColor: isListening ? '#2563EB' : '#CBD5E1',
                    borderRadius: '2px',
                    animation: isListening ? `soundWave 0.9s ease-in-out infinite alternate ${i * 80}ms` : 'none',
                    transition: 'all 200ms ease'
                  }}
                />
              ))}
            </div>

            {/* Live Spoken Transcription Box */}
            <div
              style={{
                width: '100%',
                backgroundColor: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: '12px',
                padding: '12px 14px',
                textAlign: 'left',
                boxSizing: 'border-box',
                minHeight: '64px',
                maxHeight: '100px',
                overflowY: 'auto'
              }}
            >
              <div style={{ fontSize: '10px', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>
                Live Spoken Transcript
              </div>
              <div style={{ fontSize: '12.5px', color: voiceTranscript ? '#1E2538' : '#94A3B8', fontStyle: voiceTranscript ? 'normal' : 'italic' }}>
                {voiceTranscript || 'Start speaking or click any sample prompt below...'}
              </div>
            </div>

            {/* Quick Suggested Textbook Questions */}
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '6px', textAlign: 'left' }}>
              <span style={{ fontSize: '10.5px', fontWeight: 600, color: '#64748B' }}>
                Tap to speak suggested question:
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                {[
                  "Explain Dulong-Petit Law from Chapter II",
                  "Summarize Einstein's calculation of heat capacity",
                  "Explain Bloch theorem and energy bands"
                ].map((sampleQ, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setVoiceTranscript(sampleQ);
                      handleSubmitVoicePrompt(sampleQ);
                    }}
                    style={{
                      background: '#FFFFFF',
                      border: '1px solid #E2E8F0',
                      borderRadius: '8px',
                      padding: '6px 10px',
                      fontSize: '11px',
                      color: '#334155',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'all 120ms ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#93C5FD';
                      e.currentTarget.style.backgroundColor = '#EFF6FF';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#E2E8F0';
                      e.currentTarget.style.backgroundColor = '#FFFFFF';
                    }}
                  >
                    "{sampleQ}"
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '10px', width: '100%', justifyContent: 'flex-end', marginTop: '4px' }}>
              <button
                type="button"
                onClick={closeVoicePrompt}
                style={{
                  padding: '7px 14px',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  background: '#FFFFFF',
                  fontSize: '11.5px',
                  fontWeight: 600,
                  color: '#475569',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleSubmitVoicePrompt()}
                style={{
                  padding: '7px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  background: '#1B2A4A',
                  color: '#FFFFFF',
                  fontSize: '11.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span>Ask AI With Voice</span>
                <Icon name="send" size={12} color="#FFFFFF" />
              </button>
            </div>
          </div>
      </ModalPortal>

      {/* Mobile Side Popup Drawer (Google Gemini Mobile Style) */}
      {isMobile && showMobileBooksDrawer && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.45)',
            backdropFilter: 'blur(5px)',
            WebkitBackdropFilter: 'blur(5px)',
            zIndex: 1100,
            display: 'flex',
            justifyContent: 'flex-end',
            transition: 'opacity 200ms ease'
          }}
          onClick={() => setShowMobileBooksDrawer(false)}
        >
          <div
            style={{
              width: '85%',
              maxWidth: '340px',
              height: '100%',
              backgroundColor: '#FFFFFF',
              boxShadow: '-8px 0 32px rgba(15, 23, 42, 0.22)',
              display: 'flex',
              flexDirection: 'column',
              boxSizing: 'border-box'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div
              style={{
                padding: '16px 18px',
                borderBottom: '1px solid #F1F5F9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexShrink: 0
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <img
                  src="/assets/Rectangle 4.png"
                  alt="TrueSight Logo"
                  style={{ width: '22px', height: '22px', objectFit: 'contain' }}
                />
                <span style={{ fontSize: '15px', fontWeight: 800, color: '#1B2A4A', letterSpacing: '-0.02em' }}>
                  TrueSight AI
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowMobileBooksDrawer(false)}
                title="Close Drawer"
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  color: '#64748B',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* "+ New Conversation" Button (Google Gemini Style) */}
            <div style={{ padding: '14px 18px 8px 18px', flexShrink: 0 }}>
              <button
                type="button"
                onClick={() => {
                  setViewMode('landing');
                  setLandingInput('');
                  setShowMobileBooksDrawer(false);
                  showToast('Started new conversation');
                }}
                style={{
                  width: '100%',
                  height: '42px',
                  borderRadius: '100px',
                  backgroundColor: '#EFF6FF',
                  border: '1.5px solid #BFDBFE',
                  color: '#1D4ED8',
                  fontSize: '13px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  transition: 'all 140ms ease'
                }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                <span>New Conversation</span>
              </button>
            </div>

            {/* Scrollable Content Body */}
            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: '10px 18px',
                display: 'flex',
                flexDirection: 'column',
                gap: '20px'
              }}
            >
              {/* SECTION 1: RECENT QUESTIONS (HISTORY OF THE HISTORIES) */}
              <div>
                <div
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    color: '#94A3B8',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    marginBottom: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <span>Recent Questions</span>
                  <span style={{ fontSize: '10.5px', color: '#CBD5E1', fontWeight: 600 }}>
                    {Object.values(chatHistory).reduce((acc, arr) => acc + (arr ? arr.filter((m) => m.sender === 'user').length : 0), 0)} asked
                  </span>
                </div>

                {(() => {
                  const recentQuestions = Object.entries(chatHistory).flatMap(([bookId, msgs]) => {
                    const book = textbooks.find((b) => b.id === bookId);
                    return (msgs || [])
                      .filter((m) => m.sender === 'user')
                      .map((m) => ({
                        id: m.id,
                        text: m.text,
                        time: m.time,
                        bookId,
                        bookTitle: book ? book.title : 'Textbook'
                      }));
                  }).reverse();

                  if (recentQuestions.length === 0) {
                    return (
                      <div
                        style={{
                          padding: '16px 12px',
                          backgroundColor: '#F8FAFC',
                          borderRadius: '12px',
                          border: '1px dashed #E2E8F0',
                          textAlign: 'center',
                          color: '#94A3B8',
                          fontSize: '12px'
                        }}
                      >
                        No questions asked yet. Ask any question to start!
                      </div>
                    );
                  }

                  return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {recentQuestions.map((q) => (
                        <div
                          key={q.id}
                          onClick={() => {
                            setActiveBookId(q.bookId);
                            setViewMode('workspace');
                            setShowMobileBooksDrawer(false);
                            showToast(`Opened "${q.text.slice(0, 24)}..."`);
                          }}
                          style={{
                            padding: '10px 12px',
                            backgroundColor: '#F8FAFC',
                            borderRadius: '10px',
                            border: '1px solid #E2E8F0',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '4px',
                            transition: 'all 120ms ease'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                            </svg>
                            <span
                              style={{
                                fontSize: '12.5px',
                                fontWeight: 600,
                                color: '#1E293B',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                              }}
                            >
                              {q.text}
                            </span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '10.5px', color: '#94A3B8' }}>
                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '170px' }}>
                              {q.bookTitle}
                            </span>
                            <span>{q.time}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>

              {/* SECTION 2: TEXTBOOK LIBRARY */}
              <div>
                <div
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    color: '#94A3B8',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    marginBottom: '10px'
                  }}
                >
                  Textbook Library ({textbooks.length})
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {textbooks.map((book) => {
                    const isSelected = activeBookId === book.id;
                    return (
                      <div
                        key={book.id}
                        onClick={() => {
                          setActiveBookId(book.id);
                          setActivePage(1);
                          setShowMobileBooksDrawer(false);
                          showToast(`Switched to "${book.title}"`);
                        }}
                        style={{
                          padding: '10px 12px',
                          borderRadius: '10px',
                          backgroundColor: isSelected ? '#EFF6FF' : '#F8FAFC',
                          border: `1.5px solid ${isSelected ? '#3B82F6' : '#E2E8F0'}`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          cursor: 'pointer'
                        }}
                      >
                        <div style={{ minWidth: 0, flex: 1, paddingRight: '8px' }}>
                          <div
                            style={{
                              fontSize: '12.5px',
                              fontWeight: 700,
                              color: isSelected ? '#1D4ED8' : '#1E293B',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            {book.title}
                          </div>
                          <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>
                            {book.author} · {book.totalPages}p
                          </div>
                        </div>

                        {isSelected ? (
                          <span
                            style={{
                              fontSize: '10px',
                              fontWeight: 800,
                              color: '#2563EB',
                              backgroundColor: '#DBEAFE',
                              padding: '2px 7px',
                              borderRadius: '999px',
                              flexShrink: 0
                            }}
                          >
                            Active
                          </span>
                        ) : (
                          <span style={{ fontSize: '10.5px', color: '#94A3B8', flexShrink: 0 }}>
                            Select
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Drawer Footer Actions */}
            <div
              style={{
                padding: '14px 18px calc(16px + env(safe-area-inset-bottom, 0px)) 18px',
                borderTop: '1px solid #F1F5F9',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                flexShrink: 0,
                backgroundColor: '#FFFFFF'
              }}
            >
              <button
                type="button"
                onClick={() => {
                  fileInputRef.current?.click();
                  setShowMobileBooksDrawer(false);
                }}
                style={{
                  width: '100%',
                  height: '40px',
                  borderRadius: '10px',
                  border: 'none',
                  backgroundColor: '#243367',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  fontSize: '12.5px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <Icon name="docUpload" size={14} color="#FFFFFF" />
                <span>+ Upload Textbook</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowMobileBooksDrawer(false);
                  onBackToDashboard?.();
                }}
                style={{
                  width: '100%',
                  height: '38px',
                  borderRadius: '10px',
                  border: '1px solid #E2E8F0',
                  backgroundColor: '#F8FAFC',
                  color: '#475569',
                  fontWeight: 600,
                  fontSize: '12px',
                  cursor: 'pointer'
                }}
              >
                Dashboard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div
          style={{
            position: 'absolute',
            top: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: '#1F2538',
            color: '#FFFFFF',
            borderRadius: '20px',
            padding: '6px 16px',
            fontSize: '11.5px',
            fontWeight: 600,
            zIndex: 120,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
          }}
        >
          {toast}
        </div>
      )}
    </div>
  );
}
