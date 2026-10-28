import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import Cookies from 'js-cookie';
import { toast as notify } from 'react-toastify';
import Icon from '../design-system/icons';
import ModalPortal from './ModalPortal';
import BookRoadmapModal from './BookRoadmapModal';
import TSModal, { TSButton } from './TSModal';
import { api, invalidate, keys, setQueryData, useQuery } from '../data';
import { pathFor, useTS } from '../session';
import { uidKey } from '../../revamp/lib/api';
import { timeAgo } from '../../revamp/lib/format';
import AnswerMarkdown from '../../pages/shared/components/AnswerMarkdown';
import { askTextbook, fetchTextbookFile, isSessionExpired, listTextbooks, uploadTextbook } from '../../utils/textbookServiceClient';

const booksKey = () => uidKey('assistant:books');
const trashedKey = () => uidKey('assistant:trashed-books');

const clock = (iso) => (iso ? new Date(iso) : new Date()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

/** A textbook-service book in the shape the library lists render. */
const toBook = (b) => ({
  id: b.book_id,
  title: b.title,
  status: b.status,
  error: b.error || null,
  hasOriginal: Boolean(b.has_original),
  sizeLabel: b.status === 'ready' ? `${b.chunk_count || 0} sections` : b.status === 'processing' ? 'Processing…' : 'Failed',
  author: b.status === 'ready' ? 'Ready to ask' : b.status === 'processing' ? 'Indexing your PDF' : 'Upload failed',
  category: 'Your library',
  uploadDate: b.created_at ? timeAgo(b.created_at) : '',
  raw: b
});

/** A saved chat message in the shape the conversation renders. */
const toMessage = (m, i, chatId) => ({
  id: `${chatId || 'new'}-${i}`,
  sender: m.role === 'user' ? 'user' : 'ai',
  time: m.at ? clock(m.at) : '',
  text: m.content || '',
  voice: m.voice,
  foundInBook: m.foundInBook,
  citations: m.citations || []
});

const suggestionsFor = (title) => [
  `Summarize the key ideas of "${title}"`,
  `Explain the most important formula in ${title}`,
  `Give me 3 practice questions from ${title}`
];

// Grounded answer: Markdown (with KaTeX) and numbered citations that open the cited page.
function FormattedAiMessage({
  msg,
  onJumpToCitation,
  speakingMessageId,
  onReadAloud,
  copiedMessageId,
  onCopyMessage,
  onRetry
}) {
  if (msg.pending) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%', padding: '6px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <img src="/assets/Rectangle 4.png" alt="" style={{ width: '18px', height: '18px', objectFit: 'contain' }} />
          <span style={{ fontSize: '13px', fontWeight: 700, color: '#1B2A4A' }}>TrueSight AI</span>
        </div>
        {[92, 76, 84].map((w) => (
          <div key={w} className="skeleton-shimmer" style={{ height: '10px', width: `${w}%`, borderRadius: '999px' }} />
        ))}
        <span style={{ fontSize: '11px', color: '#94A3B8' }}>Searching your textbook…</span>
      </div>
    );
  }
  if (msg.error) {
    return (
      <div style={{ width: '100%', padding: '12px 14px', border: '1px solid #FECACA', background: '#FEF2F2', borderRadius: '10px' }}>
        <div style={{ fontSize: '13px', fontWeight: 700, color: '#B91C1C' }}>Couldn't answer that</div>
        <div style={{ fontSize: '12px', color: '#DC2626', marginTop: '2px' }}>{msg.error}</div>
        {msg.question && (
          <button
            type="button"
            onClick={onRetry}
            style={{ marginTop: '8px', background: '#FFFFFF', border: '1px solid #FECACA', borderRadius: '6px', padding: '4px 10px', fontSize: '11.5px', fontWeight: 700, color: '#B91C1C', cursor: 'pointer' }}
          >
            Try again
          </button>
        )}
      </div>
    );
  }
  const cites = msg.citations || [];
  const grounded = msg.foundInBook !== false;

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
              color: grounded ? '#059669' : '#D97706',
              backgroundColor: grounded ? '#ECFDF5' : '#FFFBEB',
              border: `1px solid ${grounded ? '#A7F3D0' : '#FDE68A'}`,
              padding: '1px 8px',
              borderRadius: '9999px',
              letterSpacing: '0.02em'
            }}
          >
            {grounded ? 'Verified Grounding' : 'Not found in book'}
          </span>
        </div>
        <span style={{ fontSize: '11px', color: '#94A3B8' }}>
          {msg.time}
        </span>
      </div>

      {/* Answer body */}
      <div style={{ width: '100%', fontSize: '13px', lineHeight: '1.68', color: '#1E2538' }}>
        <AnswerMarkdown text={msg.text} citations={cites} onCite={(index) => onJumpToCitation && onJumpToCitation(cites[index])} />
      </div>

      {/* Grounding Source Citations (Clickable buttons that jump straight to that textbook page) */}
      {cites.length > 0 && (
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
            {cites.map((c, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => onJumpToCitation && onJumpToCitation(c)}
                title={c.quote || ''}
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
                <span>[{idx + 1}] {c.page ? `Page ${c.page}` : 'Excerpt'}</span>
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
          title={speakingMessageId === msg.id ? 'Stop voice explanation' : 'Listen to explanation'}
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
        >
          <Icon name={copiedMessageId === msg.id ? 'check' : 'copy'} size={13} color="currentColor" />
          <span>{copiedMessageId === msg.id ? 'Copied' : 'Copy Text'}</span>
        </button>
      </div>
    </div>
  );
}

/**
 * Ask a Textbook (/ask-a-textbook[/:bookId[/:chatId]]): the student's own
 * uploaded books from the textbook service, grounded answers with page
 * citations, saved conversations (/api/v2/chats) and the PDF beside the chat.
 */
export default function AskTextbookModule() {
  const { bookId, chatId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { go } = useTS();
  const onBackToDashboard = () => go('dashboard');

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

  // Library + saved conversations
  const books = useQuery(booksKey(), listTextbooks, { staleMs: 30_000 });
  const trashed = useQuery(trashedKey(), api.trashedTextbookIds, { staleMs: 60_000 });
  const chats = useQuery(keys.chats(), () => api.chats(), { staleMs: 30_000 });
  const textbooks = useMemo(() => {
    const hidden = new Set(trashed.data || []);
    return (books.data || []).filter((b) => !hidden.has(b.book_id)).map(toBook);
  }, [books.data, trashed.data]);

  // Active mode: 'landing' (no book open) or 'workspace' (split view studio)
  const viewMode = bookId ? 'workspace' : 'landing';
  const setViewMode = (mode) => {
    if (mode === 'landing') navigate(pathFor('ask-textbook'));
  };
  const activeBookId = bookId || null;
  const setActiveBookId = (id) => navigate(pathFor('ask-textbook', id));
  const [activePage, setActivePage] = useState(1);
  useEffect(() => setActivePage(1), [bookId]);

  // Search Popup Modal state
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchBookQuery, setSearchBookQuery] = useState('');

  // Hover states for sidebar buttons
  const [isNewChatHovered, setIsNewChatHovered] = useState(false);
  const [hoveredBookId, setHoveredBookId] = useState(null);

  // Split view document visibility toggle
  const [isTextbookHidden, setIsTextbookHidden] = useState(false);

  // PDF Viewer Controls (Chrome's PDF viewer reads #page= and #zoom=)
  const [pdfZoom, setPdfZoom] = useState(100);

  // Landing center input prompt
  const [landingInput, setLandingInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [showVoicePrompt, setShowVoicePrompt] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [speakingMessageId, setSpeakingMessageId] = useState(null);
  const [copiedMessageId, setCopiedMessageId] = useState(null);

  // Real file input reference
  const fileInputRef = useRef(null);

  // Current conversation
  const [messages, setMessages] = useState([]);
  const [loadingChat, setLoadingChat] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const chatBottomRef = useRef(null);
  const chatRef = useRef(chatId || null);
  const sentInitial = useRef(false);

  const currentBook = textbooks.find((b) => b.id === activeBookId) || {
    id: activeBookId,
    title: books.isLoading ? 'Loading…' : 'Textbook not found',
    status: books.isLoading ? 'processing' : 'missing',
    hasOriginal: false,
    sizeLabel: '',
    author: '',
    category: '',
    raw: null
  };
  const bookReady = currentBook.status === 'ready';

  // Move a book to the trash (kept 30 days; Trash deletes it from the service for good).
  const [bookToTrash, setBookToTrash] = useState(null);
  const [trashingBook, setTrashingBook] = useState(false);
  const trashBook = async () => {
    const book = bookToTrash;
    setTrashingBook(true);
    try {
      await api.trashTextbook({ bookId: book.id, title: book.title, sizeLabel: book.status === 'ready' ? book.sizeLabel : null });
      setQueryData(trashedKey(), (d) => [...(d || []), book.id]);
      invalidate(keys.trash(), `${uidKey('chats:')}*`); // its chats are hidden with it
      if (book.id === activeBookId) navigate(pathFor('ask-textbook'));
      notify.success(`Moved "${book.title}" to trash - it's kept for 30 days.`);
      setBookToTrash(null);
    } catch (e) {
      notify.error(e.message || "Couldn't move that book to trash.");
    } finally {
      setTrashingBook(false);
    }
  };

  // "Create roadmap" from this book (also opened by ?roadmap=1, e.g. retrying a failed one).
  const [showRoadmapModal, setShowRoadmapModal] = useState(false);
  useEffect(() => {
    if (new URLSearchParams(location.search).get('roadmap') !== '1') return;
    if (bookReady) setShowRoadmapModal(true);
    navigate(location.pathname, { replace: true });
  }, [location.search, location.pathname, bookReady, navigate]);

  const showToast = (msg) => notify.info(msg);

  const reportError = useCallback(
    (error) => {
      notify.error(error.message);
      if (isSessionExpired(error)) {
        ['authToken', 'uid', 'sessionId', 'isAuthenticated'].forEach((c) => Cookies.remove(c));
        navigate('/login');
      }
    },
    [navigate]
  );

  // Keep polling while a book is still being indexed.
  const { refetch: refetchBooks } = books;
  useEffect(() => {
    if (!textbooks.some((b) => b.status === 'processing')) return undefined;
    const t = setTimeout(() => refetchBooks().catch(() => {}), 4000);
    return () => clearTimeout(t);
  }, [textbooks, refetchBooks]);

  // Load a saved conversation (skip one we just created ourselves).
  useEffect(() => {
    if (!chatId) {
      chatRef.current = null;
      setMessages([]);
      setLoadingChat(false);
      return undefined;
    }
    if (chatRef.current === chatId && messages.length) return undefined;
    let alive = true;
    setLoadingChat(true);
    api
      .chat(chatId)
      .then((chat) => {
        if (!alive) return;
        chatRef.current = chat.id;
        setMessages(chat.messages.map((m, i) => toMessage(m, i, chat.id)));
      })
      .catch((e) => alive && notify.error(e.message))
      .finally(() => alive && setLoadingChat(false));
    return () => {
      alive = false;
    };
    // only react to the route
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatId, bookId]);

  // PDF beside the chat: fetched with the auth header, shown from an object URL.
  const [pdfUrl, setPdfUrl] = useState(null);
  const [pdfError, setPdfError] = useState(null);
  const pdfVisible = viewMode === 'workspace' && currentBook.hasOriginal && (isMobile ? mobileStudioTab === 'pdf' : !isTextbookHidden);
  useEffect(() => {
    if (!pdfVisible || !activeBookId) return undefined;
    let cancelled = false;
    let objectUrl = null;
    setPdfUrl(null);
    setPdfError(null);
    fetchTextbookFile(activeBookId)
      .then((u) => {
        objectUrl = u;
        if (cancelled) URL.revokeObjectURL(u);
        else setPdfUrl(u);
      })
      .catch((e) => !cancelled && setPdfError(e.message));
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [pdfVisible, activeBookId]);

  // Upload a PDF to the library; it can be asked once indexed.
  const handleRealFileUpload = async (eOrFile) => {
    const file = eOrFile?.target ? eOrFile.target.files?.[0] : eOrFile;
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (!file) return;
    if (!(file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf'))) {
      notify.error('Please choose a PDF.');
      return;
    }
    try {
      const created = await uploadTextbook(file, file.name.replace(/\.[^/.]+$/, ''));
      notify.success(`"${created.title}" is processing - you can ask questions as soon as it's ready.`);
      setQueryData(booksKey(), (d) => [{ ...created, status: created.status || 'processing' }, ...(d || [])]);
      invalidate(booksKey());
      navigate(pathFor('ask-textbook', created.book_id));
    } catch (e) {
      reportError(e);
    }
  };

  // Arriving from the dashboard card with a question or a PDF.
  const incoming = useRef(location.state);
  useEffect(() => {
    const st = incoming.current;
    if (!st) return;
    if (st.uploadFile) {
      incoming.current = null;
      handleRealFileUpload(st.uploadFile);
      return;
    }
    if (!st.prompt || bookId || !books.data) return;
    const ready = textbooks.find((b) => b.status === 'ready');
    if (ready) navigate(pathFor('ask-textbook', ready.id), { replace: true, state: { prompt: st.prompt } });
    else {
      setLandingInput(st.prompt);
      notify.info('Upload a textbook first - then ask your question.');
    }
    incoming.current = null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [books.data, textbooks, bookId]);

  // Auto-scroll chat in workspace
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking, activeBookId, viewMode]);

  const persist = async (pair) => {
    try {
      if (!chatRef.current) {
        const chat = await api.createChat({ bookId: currentBook.id, bookTitle: currentBook.title, title: pair[0].content.slice(0, 80), messages: pair });
        chatRef.current = chat.id;
        navigate(`${pathFor('ask-textbook', currentBook.id)}/${chat.id}`, { replace: true });
      } else {
        await api.appendChat(chatRef.current, pair);
      }
      invalidate(keys.chats());
    } catch (e) {
      // Saving history is best-effort; the answer is already on screen.
      console.warn("Couldn't save conversation:", e.message);
    }
  };

  // Send message in chat
  const handleSendChat = async (textToSend, { voice = false } = {}) => {
    const query = typeof textToSend === 'string' ? textToSend : chatInput || landingInput;
    if (!query.trim() || isThinking) return;

    // From the landing screen: ask the most recent ready book.
    if (viewMode === 'landing') {
      const ready = textbooks.find((b) => b.status === 'ready');
      if (!ready) {
        notify.info('Upload a textbook first - then ask your question.');
        return;
      }
      setLandingInput('');
      navigate(pathFor('ask-textbook', ready.id), { state: { prompt: query.trim() } });
      return;
    }
    if (!bookReady) {
      notify.info('This book is still processing - questions unlock when it is ready.');
      return;
    }

    window.speechSynthesis?.cancel();
    const id = `${Date.now()}`;
    const now = new Date().toISOString();
    const userMsg = { id: `${id}-u`, sender: 'user', time: clock(now), text: query.trim(), voice };
    setMessages((m) => [...m, userMsg, { id: `${id}-a`, sender: 'ai', pending: true }]);
    setChatInput('');
    setIsThinking(true);
    try {
      const res = await askTextbook(currentBook.id, query.trim());
      const answer = { id: `${id}-a`, sender: 'ai', time: clock(), text: res.answer, foundInBook: res.foundInBook, citations: res.citations };
      setMessages((m) => m.map((x) => (x.id === answer.id ? answer : x)));
      persist([
        { role: 'user', content: userMsg.text, voice },
        { role: 'assistant', content: res.answer, foundInBook: res.foundInBook, citations: res.citations }
      ]);
    } catch (e) {
      setMessages((m) => m.map((x) => (x.id === `${id}-a` ? { ...x, pending: false, error: e.message, question: userMsg.text } : x)));
      if (isSessionExpired(e)) reportError(e);
    } finally {
      setIsThinking(false);
    }
  };

  // Ask the question handed over from the dashboard once the book is open.
  useEffect(() => {
    const prompt = location.state?.prompt;
    if (prompt && !sentInitial.current && !chatId && bookReady) {
      sentInitial.current = true;
      handleSendChat(prompt);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state, chatId, bookReady]);

  const retry = (msg) => {
    setMessages((list) => list.filter((x) => x.id !== msg.id && x.id !== msg.id.replace(/-a$/, '-u')));
    handleSendChat(msg.question);
  };

  // Speech recognition ref
  const recognitionRef = useRef(null);

  // Open interactive voice prompt modal
  const openVoicePrompt = () => {
    const SpeechRec = typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition);
    if (!SpeechRec) {
      notify.info("Voice input isn't supported in this browser.");
      return;
    }
    setShowVoicePrompt(true);
    setIsListening(true);
    setVoiceTranscript('');
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
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

      recognition.start();
      recognitionRef.current = recognition;
    } catch (err) {
      setIsListening(false);
      notify.error("Couldn't start the microphone.");
    }
  };

  const closeVoicePrompt = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // already stopped
      }
    }
    setShowVoicePrompt(false);
    setIsListening(false);
  };

  const handleSubmitVoicePrompt = (textToSubmit) => {
    const q = textToSubmit || voiceTranscript;
    closeVoicePrompt();
    if (q) handleSendChat(q, { voice: true });
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
      return;
    }

    window.speechSynthesis.cancel();
    setSpeakingMessageId(msgId);

    // Read the words, not the Markdown/LaTeX markup or citation markers.
    const plain = text.replace(/\[\d+\]/g, '').replace(/[#*_`$\\]/g, '');
    const utterance = new SpeechSynthesisUtterance(plain);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.onend = () => setSpeakingMessageId(null);
    utterance.onerror = () => setSpeakingMessageId(null);
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => () => window.speechSynthesis?.cancel(), []);

  // Copy AI response to clipboard with user feedback
  const handleCopyMessage = async (msgId, text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedMessageId(msgId);
      setTimeout(() => setCopiedMessageId(null), 2200);
    } catch {
      notify.error("Couldn't copy to the clipboard.");
    }
  };

  // Jump to a cited page in the PDF beside the chat
  const handleJumpToCitation = (citation) => {
    const pageNum = citation?.page;
    if (!currentBook.hasOriginal) {
      showToast("The original PDF wasn't kept for this book, so its pages can't be shown.");
      return;
    }
    if (pageNum) {
      setActivePage(pageNum);
      setIsTextbookHidden(false);
      if (isMobile) setMobileStudioTab('pdf');
    }
  };

  // Filtered books for search popup
  const filteredBooks = textbooks.filter((b) => b.title.toLowerCase().includes(searchBookQuery.toLowerCase()));

  // Saved conversations: those of the open book, else the most recent ones
  // Chats on books that are trashed or gone from the library aren't shown (the server also prunes them).
  const libraryIds = books.data && !books.error ? new Set(textbooks.map((b) => b.id)) : null;
  const visibleChats = (chats.data || []).filter(
    (c) => (!libraryIds || libraryIds.has(c.bookId)) && (!activeBookId || c.bookId === activeBookId)
  );
  const suggestions = suggestionsFor(currentBook.title);

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
        accept="application/pdf"
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
                        alignItems: 'center',
                        gap: '6px',
                        transition: 'all 140ms ease'
                      }}
                    >
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0, flex: 1 }}>
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
                        {book.sizeLabel}
                      </span>
                      </div>
                      {isHovered && (
                        <button
                          type="button"
                          title="Move to trash"
                          aria-label={`Move ${book.title} to trash`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setBookToTrash(book);
                          }}
                          style={{ background: 'transparent', border: 'none', padding: '4px', borderRadius: '6px', cursor: 'pointer', display: 'flex', flexShrink: 0 }}
                        >
                          <Icon name="trash" size={14} color="#94A3B8" />
                        </button>
                      )}
                    </div>
                  );
                })}
                {!textbooks.length && (
                  <span style={{ fontSize: '11.5px', color: 'rgba(255, 255, 255, 0.55)', padding: '4px' }}>
                    {books.isLoading ? 'Loading your library…' : 'No textbooks yet'}
                  </span>
                )}
              </div>
            </div>

            {visibleChats.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '14px' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'rgba(255, 255, 255, 0.65)', padding: '2px 4px 6px 4px' }}>
                  {activeBookId ? 'Chats in this book' : 'Recent chats'}
                </span>
                {visibleChats.slice(0, 12).map((c) => (
                  <div
                    key={c.id}
                    onClick={() => navigate(`${pathFor('ask-textbook', c.bookId)}/${c.id}`)}
                    style={{
                      padding: '7px 10px',
                      borderRadius: '8px',
                      backgroundColor: c.id === chatId ? 'rgba(255, 255, 255, 0.18)' : 'transparent',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '1px'
                    }}
                    onMouseEnter={(e) => {
                      if (c.id !== chatId) e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
                    }}
                    onMouseLeave={(e) => {
                      if (c.id !== chatId) e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <span style={{ fontSize: '12px', color: '#E2E8F0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.title}</span>
                    <span style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.5)' }}>{timeAgo(c.updatedAt)}</span>
                  </div>
                ))}
              </div>
            )}
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
                  {textbooks.length ? <>Answers come from your {textbooks.length} uploaded book{textbooks.length > 1 ? 's' : ''}.</> : 'Upload a textbook PDF to get started.'}
                </p>
              )}

              {books.error && !books.data && (
                <div style={{ marginBottom: '14px', padding: '10px 14px', borderRadius: '10px', background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626', fontSize: '12.5px', fontWeight: 600 }}>
                  Couldn't load your library: {books.error.message}
                </div>
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
                  ({currentBook.sizeLabel})
                </span>
              )}
            </div>

            {/* Right: Hide / Open Textbook Button (Desktop) OR Segmented Switcher (Mobile) */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {bookReady && (
                <button
                  type="button"
                  onClick={() => setShowRoadmapModal(true)}
                  title="Build a study roadmap and quizzes from this book only"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: '#FEE047',
                    border: 'none',
                    borderRadius: '6px',
                    padding: isMobile ? '5px 8px' : '5px 10px',
                    fontSize: '11.5px',
                    fontWeight: 800,
                    color: '#0B1A2B',
                    cursor: 'pointer',
                    flexShrink: 0
                  }}
                >
                  <Icon name="aiAutomation" size={13} color="currentColor" />
                  <span>{isMobile ? 'Roadmap' : 'Create roadmap'}</span>
                </button>
              )}
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
                      Book
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
                {/* PDF viewer toolbar: upload, page, zoom, download */}
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
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    title="Upload another textbook"
                    style={{ background: 'transparent', border: 'none', color: '#F1F3F4', cursor: 'pointer', padding: '4px 6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor"><path d="M2 3h12v2H2zm0 4h12v2H2zm0 4h12v2H2z"/></svg>
                  </button>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginLeft: '4px' }}>
                    <span style={{ color: '#C4C7C5', fontSize: '11.5px' }}>Page</span>
                    <input
                      type="number"
                      value={activePage}
                      min={1}
                      onChange={(e) => setActivePage(Math.max(1, parseInt(e.target.value, 10) || 1))}
                      style={{
                        width: '40px',
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
                  </div>

                  <div style={{ width: '1px', height: '16px', backgroundColor: '#525659', margin: '0 4px' }} />

                  <button
                    type="button"
                    onClick={() => setPdfZoom((z) => Math.max(50, z - 25))}
                    title="Zoom Out"
                    style={{ background: 'transparent', border: 'none', color: '#F1F3F4', cursor: 'pointer', padding: '2px 6px', fontSize: '14px', fontWeight: 700 }}
                  >
                    –
                  </button>
                  <span style={{ color: '#C4C7C5', fontSize: '11px', minWidth: '34px', textAlign: 'center' }}>{pdfZoom}%</span>
                  <button
                    type="button"
                    onClick={() => setPdfZoom((z) => Math.min(250, z + 25))}
                    title="Zoom In"
                    style={{ background: 'transparent', border: 'none', color: '#F1F3F4', cursor: 'pointer', padding: '2px 6px', fontSize: '14px', fontWeight: 700 }}
                  >
                    +
                  </button>
                  <button
                    type="button"
                    onClick={() => setPdfZoom(100)}
                    title="Reset zoom"
                    style={{ background: 'transparent', border: 'none', color: '#F1F3F4', cursor: 'pointer', padding: '2px 6px', fontSize: '13px' }}
                  >
                    ↕
                  </button>

                  {pdfUrl && (
                    <a
                      href={pdfUrl}
                      download={`${currentBook.title}.pdf`}
                      title="Download Document"
                      style={{ marginLeft: 'auto', background: 'transparent', border: 'none', color: '#F1F3F4', cursor: 'pointer', padding: '2px 6px', fontSize: '13px', textDecoration: 'none', display: 'flex', alignItems: 'center' }}
                    >
                      ↓
                    </a>
                  )}
                </div>

                {/* Document Viewport Area */}
                <div
                  style={{
                    flex: 1,
                    overflow: 'hidden',
                    backgroundColor: '#525659',
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: pdfUrl ? 'flex-start' : 'center',
                    padding: isMobile ? '0 0 calc(72px + env(safe-area-inset-bottom, 0px)) 0' : '0'
                  }}
                >
                  {!currentBook.hasOriginal ? (
                    <div style={{ color: '#E2E8F0', fontSize: '13px', textAlign: 'center', maxWidth: '320px', padding: '20px', lineHeight: 1.5 }}>
                      The original PDF wasn't kept for this textbook. Upload it again to read it here.
                    </div>
                  ) : pdfError ? (
                    <div style={{ color: '#FECACA', fontSize: '13px', textAlign: 'center', maxWidth: '320px', padding: '20px' }}>Couldn't open the PDF: {pdfError}</div>
                  ) : !pdfUrl ? (
                    <div style={{ color: '#CBD5E1', fontSize: '13px' }}>Loading document…</div>
                  ) : (
                    // Remounting on page/zoom change is what makes the #page fragment
                    // take effect - the browser's PDF viewer only reads it on load.
                    <iframe
                      key={`${activePage}-${pdfZoom}`}
                      src={`${pdfUrl}#page=${activePage}&zoom=${pdfZoom}`}
                      style={{ width: '100%', height: '100%', border: 'none', backgroundColor: '#525659' }}
                      title={currentBook.title}
                    />
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
                  {loadingChat && [0, 1].map((i) => <div key={i} className="skeleton-shimmer" style={{ height: '70px', borderRadius: '12px' }} />)}
                  {!loadingChat && !messages.length && (
                    <div style={{ border: '1px dashed #CBD5E1', borderRadius: '12px', padding: '20px', textAlign: 'center', background: '#FFFFFF' }}>
                      <div style={{ fontSize: '13px', color: '#334155', lineHeight: 1.55 }}>
                        {currentBook.status === 'missing'
                          ? 'This textbook is no longer in your library - it may have been moved to trash.'
                          : `Ask anything from "${currentBook.title}". Answers are grounded strictly in this book, with page references.`}
                      </div>
                      {currentBook.status === 'processing' && (
                        <div style={{ fontSize: '12px', fontWeight: 700, color: '#B45309', marginTop: '8px' }}>
                          This book is still processing - questions unlock when it's ready.
                        </div>
                      )}
                      {currentBook.status === 'failed' && (
                        <div style={{ fontSize: '12px', fontWeight: 700, color: '#DC2626', marginTop: '8px' }}>
                          Indexing failed{currentBook.error ? `: ${currentBook.error}` : ''}. Upload the PDF again to retry.
                        </div>
                      )}
                      {bookReady && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', justifyContent: 'center', marginTop: '12px' }}>
                          {suggestions.map((q) => (
                            <button
                              key={q}
                              type="button"
                              onClick={() => handleSendChat(q)}
                              style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '999px', padding: '4px 12px', fontSize: '11.5px', color: '#334155', cursor: 'pointer' }}
                            >
                              “{q}”
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                  {messages.map((msg) => {
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
                          onJumpToCitation={handleJumpToCitation}
                          speakingMessageId={speakingMessageId}
                          onReadAloud={handleReadAloud}
                          copiedMessageId={copiedMessageId}
                          onCopyMessage={handleCopyMessage}
                          onRetry={() => retry(msg)}
                        />
                      );
                    }
                  })}

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
                    placeholder={bookReady ? `Ask anything from "${currentBook.title}"...` : 'Questions unlock when this book is ready'}
                    disabled={!bookReady}
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
                    disabled={!chatInput.trim() || isThinking || !bookReady}
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
                        setShowSearchModal(false);
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
                            {book.author} · {book.sizeLabel} · {book.category}
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
                {(viewMode === 'workspace'
                  ? suggestions
                  : ['Summarize the key ideas of chapter 1', 'Explain the most important formula', 'Give me 3 practice questions']
                ).map((sampleQ, idx) => (
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
                  <span>Recent Conversations</span>
                  <span style={{ fontSize: '10.5px', color: '#CBD5E1', fontWeight: 600 }}>
                    {visibleChats.length} saved
                  </span>
                </div>

                {!visibleChats.length ? (
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
                    No conversations yet. Ask any question to start!
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {visibleChats.slice(0, 20).map((c) => (
                      <div
                        key={c.id}
                        onClick={() => {
                          navigate(`${pathFor('ask-textbook', c.bookId)}/${c.id}`);
                          setShowMobileBooksDrawer(false);
                        }}
                        style={{
                          padding: '10px 12px',
                          backgroundColor: c.id === chatId ? '#EFF6FF' : '#F8FAFC',
                          borderRadius: '10px',
                          border: `1px solid ${c.id === chatId ? '#BFDBFE' : '#E2E8F0'}`,
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '4px'
                        }}
                      >
                        <span style={{ fontSize: '12.5px', fontWeight: 600, color: '#1E293B', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {c.title}
                        </span>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10.5px', color: '#94A3B8' }}>
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '170px' }}>{c.bookTitle || 'Textbook'}</span>
                          <span>{timeAgo(c.updatedAt)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
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
                            {book.sizeLabel} · {book.uploadDate}
                          </div>
                        </div>

                        <button
                          type="button"
                          title="Move to trash"
                          aria-label={`Move ${book.title} to trash`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setBookToTrash(book);
                          }}
                          style={{ background: 'transparent', border: 'none', padding: '6px', marginRight: '4px', cursor: 'pointer', display: 'flex', flexShrink: 0 }}
                        >
                          <Icon name="trash" size={15} color="#94A3B8" />
                        </button>
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

      {bookToTrash && (
        <TSModal
          eyebrow="Ask a Textbook"
          title="Move this book to trash?"
          onClose={() => !trashingBook && setBookToTrash(null)}
          maxWidth={460}
          footer={
            <>
              <TSButton variant="secondary" onClick={() => setBookToTrash(null)} disabled={trashingBook}>
                Cancel
              </TSButton>
              <TSButton variant="danger" onClick={trashBook} busy={trashingBook}>
                Move to trash
              </TSButton>
            </>
          }
        >
          <p style={{ fontSize: '13px', color: '#475569', margin: 0, lineHeight: 1.55 }}>
            <strong style={{ color: '#0F172A' }}>{bookToTrash.title}</strong> and its saved chats will be hidden from Ask a Textbook.
            You can restore them from Trash within 30 days; after that the book and its chats are deleted for good.
            Roadmaps built from it are kept, but their quizzes stop working once the book is deleted for good.
          </p>
        </TSModal>
      )}

      {showRoadmapModal && bookReady && (
        <BookRoadmapModal book={currentBook} onClose={() => setShowRoadmapModal(false)} />
      )}
    </div>
  );
}
