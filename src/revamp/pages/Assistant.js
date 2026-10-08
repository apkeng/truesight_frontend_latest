import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import Cookies from "js-cookie";
import { toast } from "react-toastify";
import {
  LuSparkles,
  LuPanelLeftClose,
  LuSquarePen,
  LuSearch,
  LuLayoutDashboard,
  LuArrowLeft,
  LuBookOpen,
  LuBookX,
  LuFileUp,
  LuFileText,
  LuVolume2,
  LuVolumeX,
  LuCopy,
  LuCheck,
  LuExternalLink,
  LuTrash2,
  LuRotateCcw,
  LuCircleAlert,
  LuMessageSquare,
} from "react-icons/lu";
import { api, keys, uidKey } from "../lib/api";
import { invalidate, setQueryData, useQuery } from "../lib/query";
import { cx, formatTime, timeAgo } from "../lib/format";
import { useTextToSpeech } from "../lib/voice";
import { Badge, Button, Card, ConfirmDialog, EmptyState, ErrorState, Input, Skeleton, Spinner } from "../ui";
import { SidebarSlot } from "../layout/AppShell";
import { Composer, VoicePromptDialog } from "../components/Composer";
import AnswerMarkdown from "../../pages/shared/components/AnswerMarkdown";
import TextbookViewer from "../../pages/shared/components/TextbookViewer";
import { listTextbooks, uploadTextbook, askTextbook, isSessionExpired } from "../../utils/textbookServiceClient";
import mark from "../assets/mark-reversed-96.png";

const B = "/l2dashboard/ask-a-textbook";
const booksKey = () => uidKey("assistant:books");
const trashedKey = () => uidKey("assistant:trashed-books");

const suggestionsFor = (title) => [
  `Summarize the key ideas of "${title}"`,
  `Explain the most important formula in ${title}`,
  `Give me 3 practice questions from ${title}`,
];

export default function Assistant() {
  const { bookId, chatId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const books = useQuery(booksKey(), listTextbooks, { staleMs: 30_000 });
  const trashed = useQuery(trashedKey(), api.trashedTextbookIds, { staleMs: 60_000 });
  const chats = useQuery(keys.chats(), () => api.chats(), { staleMs: 30_000 });
  const [search, setSearch] = useState("");

  const visibleBooks = useMemo(() => {
    const hidden = new Set(trashed.data || []);
    return (books.data || []).filter((b) => !hidden.has(b.book_id));
  }, [books.data, trashed.data]);
  const book = visibleBooks.find((b) => b.book_id === bookId) || null;

  const reportError = useCallback(
    (error) => {
      toast.error(error.message);
      if (isSessionExpired(error)) {
        ["authToken", "uid", "sessionId", "isAuthenticated"].forEach((c) => Cookies.remove(c));
        navigate("/login");
      }
    },
    [navigate]
  );

  // Keep polling while anything is still being processed.
  const { refetch: refetchBooks } = books;
  useEffect(() => {
    if (!visibleBooks.some((b) => b.status === "processing")) return undefined;
    const t = setTimeout(() => refetchBooks().catch(() => {}), 4000);
    return () => clearTimeout(t);
  }, [visibleBooks, refetchBooks]);

  // Arriving from the dashboard composer with a question or a PDF.
  const incoming = useRef(location.state);
  useEffect(() => {
    const s = incoming.current;
    if (!s?.prompt || bookId || !books.data) return;
    const ready = visibleBooks.find((b) => b.status === "ready");
    if (ready) navigate(`${B}/${ready.book_id}`, { replace: true, state: { prompt: s.prompt } });
    else toast.info("Upload a textbook first - then ask your question.");
    incoming.current = null;
  }, [books.data, visibleBooks, bookId, navigate]);

  const query = search.trim().toLowerCase();
  const filteredBooks = visibleBooks.filter((b) => !query || b.title.toLowerCase().includes(query));
  const filteredChats = (chats.data || []).filter((c) => !query || `${c.title} ${c.bookTitle || ""}`.toLowerCase().includes(query));

  return (
    <>
      <SidebarSlot>
        <AssistantSidebar
          books={filteredBooks}
          chats={filteredChats}
          loading={books.isLoading}
          activeBook={bookId}
          activeChat={chatId}
          search={search}
          onSearch={setSearch}
          onNewChat={() => navigate(book ? `${B}/${book.book_id}` : B)}
        />
      </SidebarSlot>
      <div className="flex min-h-screen flex-col lg:h-screen">
        {books.error && !books.data ? (
          <div className="p-8"><ErrorState error={books.error} onRetry={books.refetch} /></div>
        ) : !bookId ? (
          <Overview books={visibleBooks} loading={books.isLoading} chats={chats.data || []} onError={reportError} uploadFile={location.state?.uploadFile} />
        ) : !book && books.isLoading ? (
          <div className="p-8"><Skeleton className="h-16" /><Skeleton className="mt-4 h-96" /></div>
        ) : !book ? (
          <div className="p-8"><EmptyState icon={LuBookX} title="Textbook not found" description="It may have been moved to trash." action={<Button size="sm" variant="secondary" to={B}>Back to overview</Button>} /></div>
        ) : (
          <Conversation key={book.book_id} book={book} chatId={chatId} initialPrompt={location.state?.prompt} onError={reportError} />
        )}
      </div>
    </>
  );
}

// ---------------------------------------------------------------- sidebar

function AssistantSidebar({ books, chats, loading, activeBook, activeChat, search, onSearch, onNewChat }) {
  const byBook = useMemo(() => {
    const m = new Map();
    chats.forEach((c) => m.set(c.bookId, [...(m.get(c.bookId) || []), c]));
    return m;
  }, [chats]);
  const bookChats = activeBook ? byBook.get(activeBook) || [] : chats.slice(0, 8);
  return (
    <div className="flex min-h-0 flex-1 flex-col text-white">
      <div className="flex h-16 items-center gap-2 px-4">
        <img src={mark} alt="" width={26} height={26} className="h-[26px] w-[26px] rounded" />
        <span className="flex items-center gap-1.5 text-[15px] font-bold"><LuSparkles aria-hidden className="text-ts-yellow" /> Ask Text Book</span>
        <Link to="/l2dashboard/dashboard" className="ml-auto flex h-8 w-8 items-center justify-center rounded-lg text-white/60 hover:bg-white/10 hover:text-white" aria-label="Back to main menu" title="Back to main menu">
          <LuPanelLeftClose aria-hidden />
        </Link>
      </div>
      <div className="space-y-2 px-3">
        <button type="button" onClick={onNewChat} className="flex h-9 w-full items-center gap-2 rounded-lg border border-white/25 px-3 text-[13px] font-semibold hover:bg-white/10">
          <LuSquarePen aria-hidden /> New Chat
        </button>
        <label className="relative flex items-center">
          <LuSearch aria-hidden className="pointer-events-none absolute left-3 text-white/45" />
          <input value={search} onChange={(e) => onSearch(e.target.value)} placeholder="Search" className="h-9 w-full rounded-lg border border-white/10 bg-white/10 pl-9 pr-3 text-[13px] text-white outline-none placeholder:text-white/45 focus:border-white/30" />
        </label>
      </div>
      <div className="ts-scroll mt-4 min-h-0 flex-1 space-y-5 overflow-y-auto px-3 pb-4">
        <div>
          <p className="px-2 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-white/45">Recent Books</p>
          <ul className="mt-1.5 space-y-0.5">
            {loading && [0, 1].map((i) => <li key={i} className="mx-2 my-2 h-8 animate-pulse rounded bg-white/10" />)}
            {books.map((b) => (
              <li key={b.book_id}>
                <Link to={`${B}/${b.book_id}`} className={cx("block rounded-lg px-2 py-1.5", activeBook === b.book_id ? "bg-white/15" : "hover:bg-white/10")}>
                  <span className="block truncate text-[13px] font-medium">{b.title}</span>
                  <span className="block text-[10.5px] text-white/50">
                    {b.status === "ready" ? `${b.chunk_count || 0} sections` : b.status === "processing" ? "Processing…" : "Failed"} · {(byBook.get(b.book_id) || []).length} chats
                  </span>
                </Link>
              </li>
            ))}
            {!loading && !books.length && <li className="px-2 py-1 text-[12px] text-white/50">No textbooks yet</li>}
          </ul>
        </div>
        {bookChats.length > 0 && (
          <div>
            <p className="px-2 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-white/45">{activeBook ? "Chats in this book" : "Recent chats"}</p>
            <ul className="mt-1.5 space-y-0.5">
              {bookChats.map((c) => (
                <li key={c.id}>
                  <Link to={`${B}/${c.bookId}/${c.id}`} className={cx("flex items-start gap-2 rounded-lg px-2 py-1.5", activeChat === c.id ? "bg-white/15" : "hover:bg-white/10")}>
                    <LuMessageSquare aria-hidden className="mt-0.5 shrink-0 text-white/50" />
                    <span className="min-w-0">
                      <span className="block truncate text-[12.5px]">{c.title}</span>
                      <span className="block text-[10px] text-white/45">{timeAgo(c.updatedAt)}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      <div className="border-t border-white/10 p-3">
        <Link to="/l2dashboard/dashboard" className="flex h-9 items-center gap-2 rounded-lg px-2 text-[13px] font-medium text-white/80 hover:bg-white/10 hover:text-white">
          <LuLayoutDashboard aria-hidden /> Dashboard
        </Link>
      </div>
    </div>
  );
}

// --------------------------------------------------------------- overview

function Overview({ books, loading, chats, onError, uploadFile }) {
  const navigate = useNavigate();
  const [file, setFile] = useState(uploadFile || null);
  const [title, setTitle] = useState(uploadFile ? uploadFile.name.replace(/\.pdf$/i, "") : "");
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [toTrash, setToTrash] = useState(null);
  const fileRef = useRef(null);

  const pick = (f) => {
    if (!f) return;
    if (f.type !== "application/pdf") return toast.error("Please choose a PDF.");
    setFile(f);
    if (!title) setTitle(f.name.replace(/\.pdf$/i, ""));
  };

  const upload = async () => {
    setUploading(true);
    try {
      const created = await uploadTextbook(file, title.trim() || file.name);
      toast.success(`"${created.title}" is processing - you can ask questions as soon as it's ready.`);
      setFile(null);
      setTitle("");
      setQueryData(booksKey(), (d) => [{ ...created, status: created.status || "processing" }, ...(d || [])]);
      invalidate(booksKey());
    } catch (e) {
      onError(e);
    } finally {
      setUploading(false);
    }
  };

  const trash = async (b) => {
    try {
      await api.trashTextbook({ bookId: b.book_id, title: b.title, sizeLabel: b.chunk_count ? `${b.chunk_count} sections` : null });
      setQueryData(trashedKey(), (d) => [...(d || []), b.book_id]);
      invalidate(keys.trash());
      toast.success(`Moved "${b.title}" to trash - it's kept for 30 days.`);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setToTrash(null);
    }
  };

  const chatCount = (id) => chats.filter((c) => c.bookId === id).length;
  return (
    <div className="mx-auto w-full max-w-[1100px] px-4 py-8 sm:px-8">
      <div className="text-center">
        <p className="inline-flex items-center gap-1.5 rounded-full bg-ts-wash px-3 py-1 text-[11px] font-bold text-ts-blue"><LuSparkles aria-hidden /> Source-grounded study assistant</p>
        <h1 className="mt-3 text-[28px] font-extrabold tracking-tight text-ts-ink">Ask a Textbook</h1>
        <p className="mx-auto mt-2 max-w-xl text-sm text-ts-muted">Upload your textbook or lecture notes and ask anything. Every answer is grounded in your book, with page citations you can open beside the chat. Your uploads are private to you.</p>
      </div>

      <Card className="mx-auto mt-6 max-w-2xl p-5">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => { e.preventDefault(); setDragging(false); pick(e.dataTransfer.files?.[0]); }}
          className={cx("relative flex w-full flex-col items-center rounded-xl border border-dashed px-6 py-8 text-center transition-colors", dragging ? "border-ts-blue bg-ts-wash" : "border-ts-blue/40 bg-ts-subtle hover:bg-ts-wash/60")}
        >
          <span className="absolute right-3 top-3 rounded-md border border-ts-border bg-white px-1.5 py-0.5 text-[9px] font-bold tracking-wider text-ts-muted">PDF</span>
          <LuFileUp aria-hidden className="text-2xl text-ts-navy" />
          <span className="mt-2 text-sm font-bold text-ts-ink">{file ? file.name : "Drop your textbook PDF here"}</span>
          <span className="mt-0.5 text-xs text-ts-muted">{file ? `${(file.size / 1048576).toFixed(1)} MB · click to choose another` : "or click to browse local files"}</span>
        </button>
        <input ref={fileRef} type="file" accept="application/pdf" className="hidden" onChange={(e) => pick(e.target.files?.[0])} />
        {file && (
          <div className="mt-3 flex gap-2">
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Give it a title" />
            <Button loading={uploading} onClick={upload} disabled={!title.trim()}>Upload</Button>
          </div>
        )}
      </Card>

      <h2 className="mt-8 text-[11px] font-bold uppercase tracking-[0.12em] text-ts-faint">Your library</h2>
      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          [0, 1, 2].map((i) => <Skeleton key={i} className="h-28 rounded-xl" />)
        ) : !books.length ? (
          <p className="text-sm text-ts-muted sm:col-span-3">No textbooks yet - upload one above to start.</p>
        ) : (
          books.map((b) => (
            <Card key={b.book_id} className="group flex flex-col p-4">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-purple-50 text-purple-600"><LuFileText aria-hidden /></span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14px] font-bold text-ts-ink" title={b.title}>{b.title}</p>
                  <p className="text-[11px] text-ts-muted">{b.chunk_count ? `${b.chunk_count} sections · ` : ""}{chatCount(b.book_id)} chats · added {timeAgo(b.created_at)}</p>
                </div>
                <button type="button" onClick={() => setToTrash(b)} className="flex h-7 w-7 items-center justify-center rounded-lg text-ts-faint opacity-0 hover:bg-red-50 hover:text-red-500 group-hover:opacity-100 focus:opacity-100" aria-label={`Move ${b.title} to trash`}>
                  <LuTrash2 aria-hidden />
                </button>
              </div>
              <div className="mt-auto flex items-center justify-between pt-3">
                {b.status === "ready" ? <Badge tone="green" dot>Ready</Badge> : b.status === "processing" ? <Badge tone="amber" dot>Processing…</Badge> : <Badge tone="red" title={b.error || ""}>Failed</Badge>}
                <Button size="xs" disabled={b.status !== "ready"} onClick={() => navigate(`${B}/${b.book_id}`)}>Ask questions</Button>
              </div>
            </Card>
          ))
        )}
      </div>
      <ConfirmDialog open={Boolean(toTrash)} onClose={() => setToTrash(null)} onConfirm={() => trash(toTrash)} title="Move textbook to trash?" description={`"${toTrash?.title}" is hidden from your library now and permanently deleted after 30 days unless you restore it.`} confirmLabel="Move to trash" />
    </div>
  );
}

// ----------------------------------------------------------- conversation

const welcome = (title) => ({ role: "system", content: `Ask anything from "${title}". Answers are grounded strictly in this book, with page references.` });

function Conversation({ book, chatId, initialPrompt, onError }) {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [loadingChat, setLoadingChat] = useState(Boolean(chatId));
  const [prompt, setPrompt] = useState("");
  const [asking, setAsking] = useState(false);
  const [viewer, setViewer] = useState(null); // { page }
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [copied, setCopied] = useState(null);
  const tts = useTextToSpeech();
  const chatRef = useRef(chatId || null);
  const scrollRef = useRef(null);
  const sentInitial = useRef(false);
  const suggestions = useMemo(() => suggestionsFor(book.title), [book.title]);

  // Load a saved conversation (skip when we just created it ourselves).
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
    api.chat(chatId)
      .then((chat) => {
        if (!alive) return;
        chatRef.current = chat.id;
        setMessages(chat.messages.map((m, i) => ({ ...m, id: `${chat.id}-${i}` })));
      })
      .catch((e) => alive && toast.error(e.message))
      .finally(() => alive && setLoadingChat(false));
    return () => {
      alive = false;
    };
    // messages intentionally omitted - only react to the route.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const persist = async (pair) => {
    try {
      if (!chatRef.current) {
        const chat = await api.createChat({ bookId: book.book_id, bookTitle: book.title, title: pair[0].content.slice(0, 80), messages: pair });
        chatRef.current = chat.id;
        navigate(`${B}/${book.book_id}/${chat.id}`, { replace: true });
      } else {
        await api.appendChat(chatRef.current, pair);
      }
      invalidate(keys.chats());
    } catch (e) {
      // Saving history is best-effort; the answer is already on screen.
      console.warn("Couldn't save conversation:", e.message);
    }
  };

  const ask = useCallback(
    async (question, { voice = false } = {}) => {
      if (!question.trim() || asking) return;
      tts.stop();
      const id = `${Date.now()}`;
      const user = { id: `${id}-u`, role: "user", content: question.trim(), voice, at: new Date().toISOString() };
      setMessages((m) => [...m, user, { id: `${id}-a`, role: "assistant", pending: true }]);
      setPrompt("");
      setAsking(true);
      try {
        const res = await askTextbook(book.book_id, question.trim());
        const answer = { id: `${id}-a`, role: "assistant", content: res.answer, foundInBook: res.foundInBook, citations: res.citations, at: new Date().toISOString() };
        setMessages((m) => m.map((x) => (x.id === answer.id ? answer : x)));
        persist([
          { role: "user", content: user.content, voice },
          { role: "assistant", content: res.answer, foundInBook: res.foundInBook, citations: res.citations },
        ]);
      } catch (e) {
        setMessages((m) => m.map((x) => (x.id === `${id}-a` ? { ...x, pending: false, error: e.message, question: user.content } : x)));
        if (isSessionExpired(e)) onError(e);
      } finally {
        setAsking(false);
      }
    },
    // persist/tts are stable enough for this screen's lifetime
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [asking, book.book_id, book.title]
  );

  useEffect(() => {
    if (initialPrompt && !sentInitial.current && !chatId && book.status === "ready") {
      sentInitial.current = true;
      ask(initialPrompt);
    }
  }, [initialPrompt, chatId, book.status, ask]);

  const copy = async (m) => {
    try {
      await navigator.clipboard.writeText(m.content);
      setCopied(m.id);
      setTimeout(() => setCopied(null), 1500);
    } catch {
      toast.error("Couldn't copy to the clipboard.");
    }
  };

  const retry = (m) => {
    setMessages((list) => list.filter((x) => x.id !== m.id && x.id !== m.id.replace(/-a$/, "-u")));
    ask(m.question);
  };

  const ready = book.status === "ready";
  const visible = messages.length ? messages : [welcome(book.title)];
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* AI / Source Toolbar */}
      <div className="flex flex-wrap items-center gap-3 border-b border-ts-border bg-white px-4 py-3 sm:px-6">
        <Link to={B} className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-ts-border px-2.5 text-xs font-semibold text-ts-ink hover:border-ts-field"><LuArrowLeft aria-hidden /> Back to Overview</Link>
        <p className="min-w-0 truncate text-[14px] font-bold text-ts-ink">{book.title} <span className="text-xs font-normal text-ts-muted">({book.chunk_count || 0} sections)</span></p>
        <Button variant="secondary" size="sm" className="ml-auto" icon={viewer ? LuBookX : LuBookOpen} disabled={!book.has_original} title={book.has_original ? undefined : "The original PDF wasn't kept for this book"} onClick={() => setViewer(viewer ? null : { page: 1 })}>
          {viewer ? "Hide Textbook" : "Open Textbook"}
        </Button>
      </div>

      <div className={cx("grid min-h-0 flex-1", viewer && "lg:grid-cols-2")}>
        <div className="flex min-h-0 flex-col">
          <div ref={scrollRef} className="ts-scroll min-h-0 flex-1 overflow-y-auto px-4 py-6 sm:px-6">
            <div className="mx-auto max-w-3xl space-y-5">
              {loadingChat ? (
                <div className="flex justify-center py-16"><Spinner className="text-2xl" /></div>
              ) : (
                visible.map((m, i) =>
                  m.role === "system" ? (
                    <div key="welcome" className="rounded-xl border border-dashed border-ts-field/70 bg-white/70 p-6 text-center">
                      <LuSparkles aria-hidden className="mx-auto text-2xl text-ts-navy" />
                      <p className="mt-2 text-sm text-ts-body">{m.content}</p>
                      {!ready && <p className="mt-2 text-xs font-semibold text-amber-700">This book is still processing - questions unlock when it's ready.</p>}
                    </div>
                  ) : m.role === "user" ? (
                    <div key={m.id || i} className="flex flex-col items-end">
                      <p className="mb-1 text-[10.5px] text-ts-faint">You · {formatTime(m.at)} {m.voice && "· 🎙"}</p>
                      <div className="max-w-[85%] rounded-2xl rounded-tr-sm bg-ts-navy px-4 py-2.5 text-[13.5px] leading-relaxed text-white shadow-card">{m.content}</div>
                    </div>
                  ) : (
                    <AnswerCard
                      key={m.id || i}
                      m={m}
                      speaking={tts.speakingId === m.id}
                      ttsSupported={tts.supported}
                      onSpeak={() => tts.toggle(m.id, m.content)}
                      onCopy={() => copy(m)}
                      copied={copied === m.id}
                      onCite={(index) => {
                        const page = m.citations?.[index]?.page;
                        if (book.has_original) setViewer({ page: page || 1 });
                      }}
                      onRetry={() => retry(m)}
                    />
                  )
                )
              )}
            </div>
          </div>

          {/* AI / Suggested Voice Prompt + Screen-fit Composer */}
          <div className="border-t border-ts-border bg-ts-canvas px-4 pb-4 pt-3 sm:px-6">
            <div className="mx-auto max-w-3xl">
              {!messages.length && ready && (
                <div className="mb-2.5 flex flex-wrap gap-2">
                  {suggestions.map((s) => (
                    <button key={s} type="button" onClick={() => ask(s)} className="rounded-full border border-ts-border bg-white px-3 py-1 text-[11.5px] text-ts-body hover:border-ts-blue/40 hover:bg-ts-wash">“{s}”</button>
                  ))}
                </div>
              )}
              <Composer
                value={prompt}
                onChange={setPrompt}
                onSubmit={(q) => ask(q)}
                onVoiceDialog={() => setVoiceOpen(true)}
                disabled={!ready}
                busy={asking}
                size="lg"
                placeholder={`Ask anything from "${book.title}"...`}
                hint={`Answers strictly grounded in ${book.title}`}
              />
            </div>
          </div>
        </div>

        {viewer && (
          <div className="hidden min-h-0 border-l border-ts-border bg-white p-3 lg:block">
            <TextbookViewer book={book} page={viewer.page} onClose={() => setViewer(null)} />
          </div>
        )}
      </div>

      <VoicePromptDialog open={voiceOpen} onClose={() => setVoiceOpen(false)} onAsk={ask} suggestions={suggestions} contextLabel="textbook" />
    </div>
  );
}

function AnswerCard({ m, speaking, ttsSupported, onSpeak, onCopy, copied, onCite, onRetry }) {
  if (m.pending) {
    return (
      <Card className="p-5">
        <p className="flex items-center gap-2 text-[13px] font-bold text-ts-ink"><LuSparkles aria-hidden className="text-ts-navy" /> TrueSight AI</p>
        <div className="mt-3 space-y-2" aria-label="Thinking">
          <Skeleton className="h-3 w-11/12" />
          <Skeleton className="h-3 w-9/12" />
          <Skeleton className="h-3 w-10/12" />
        </div>
        <p className="mt-3 text-[11px] text-ts-faint">Searching your textbook…</p>
      </Card>
    );
  }
  if (m.error) {
    return (
      <Card className="border-red-200 p-5">
        <p className="flex items-center gap-2 text-[13px] font-bold text-red-700"><LuCircleAlert aria-hidden /> Couldn't answer that</p>
        <p className="mt-1 text-xs text-red-600">{m.error}</p>
        {m.question && <Button variant="secondary" size="xs" icon={LuRotateCcw} className="mt-3" onClick={onRetry}>Try again</Button>}
      </Card>
    );
  }
  const cites = m.citations || [];
  return (
    <Card className="p-5">
      <div className="flex items-center gap-2">
        <span className="flex items-center gap-2 text-[13px] font-bold text-ts-ink"><LuSparkles aria-hidden className="text-ts-navy" /> TrueSight AI</span>
        {m.foundInBook !== false ? <Badge tone="green">Verified Grounding</Badge> : <Badge tone="amber">Not found in book</Badge>}
        {m.at && <span className="ml-auto text-[10.5px] text-ts-faint">{formatTime(m.at)}</span>}
      </div>
      <div className="ts-answer mt-3 text-[13.5px] leading-relaxed text-ts-body [&_.katex-display]:my-3 [&_.katex-display]:rounded-lg [&_.katex-display]:border [&_.katex-display]:border-blue-200 [&_.katex-display]:bg-ts-wash/60 [&_.katex-display]:px-3 [&_.katex-display]:py-2">
        <AnswerMarkdown text={m.content} citations={cites} onCite={onCite} />
      </div>
      {cites.length > 0 && (
        <div className="mt-4">
          <p className="text-[9.5px] font-bold uppercase tracking-[0.12em] text-ts-faint">Verified sources (click to inspect page)</p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {cites.map((c, i) => (
              <button key={i} type="button" onClick={() => onCite(i)} title={c.quote} className="inline-flex items-center gap-1 rounded-md border border-blue-200 bg-ts-wash px-2 py-1 text-[11px] font-semibold text-ts-blue hover:bg-blue-100">
                <LuFileText aria-hidden /> [{i + 1}] {c.page ? `Page ${c.page}` : "Excerpt"} <LuExternalLink aria-hidden className="text-[10px]" />
              </button>
            ))}
          </div>
        </div>
      )}
      <div className="mt-4 flex gap-2">
        {ttsSupported && <Button variant="secondary" size="xs" icon={speaking ? LuVolumeX : LuVolume2} onClick={onSpeak}>{speaking ? "Stop" : "Read Aloud"}</Button>}
        <Button variant="secondary" size="xs" icon={copied ? LuCheck : LuCopy} onClick={onCopy}>{copied ? "Copied" : "Copy Text"}</Button>
      </div>
    </Card>
  );
}
