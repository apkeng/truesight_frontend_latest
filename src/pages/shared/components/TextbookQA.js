import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCloudArrowUp,
  faPaperPlane,
  faTrash,
  faCircleCheck,
  faCircleXmark,
  faFilePdf,
  faRobot,
  faBookOpen,
} from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import {
  PageShell,
  PageBanner,
  Panel,
  Button,
  Badge,
  EmptyState,
  Input,
  SectionLabel,
  cx,
} from "../../../components/ui";
import Loading from "../../../components/Loading";
import AnswerMarkdown from "./AnswerMarkdown";
import TextbookViewer from "./TextbookViewer";
import {
  listTextbooks,
  uploadTextbook,
  deleteTextbook,
  askTextbook,
  isSessionExpired,
} from "../../../utils/textbookServiceClient";

/**
 * Upload a textbook PDF and ask questions about it. Talks directly to the
 * Newspaper_ingestion service (a separate FastAPI app, not this repo) -
 * see src/utils/textbookServiceClient.js. Uploads are private: the service
 * only ever returns the signed-in user's own textbooks.
 */
const TextbookQA = () => {
  const navigate = useNavigate();
  const [textbooks, setTextbooks] = useState([]);
  const [loadingTextbooks, setLoadingTextbooks] = useState(true);
  const [selectedBookId, setSelectedBookId] = useState(null);

  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadFile, setUploadFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const [question, setQuestion] = useState("");
  const [asking, setAsking] = useState(false);
  const [threads, setThreads] = useState({}); // bookId -> [{question, answer, foundInBook, citations}]
  const [viewer, setViewer] = useState(null); // {page} while the split document view is open

  // Same handling as apiClient's 401: the Firebase token has expired, so the
  // only way forward is a fresh login.
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

  const refreshTextbooks = useCallback(async () => {
    try {
      const books = await listTextbooks();
      setTextbooks(books);
      setSelectedBookId((current) =>
        current && books.some((b) => b.book_id === current)
          ? current
          : (books.find((b) => b.status === "ready") ?? books[0])?.book_id ?? null
      );
    } catch (error) {
      reportError(error);
    } finally {
      setLoadingTextbooks(false);
    }
  }, [reportError]);

  useEffect(() => {
    refreshTextbooks();
  }, [refreshTextbooks]);

  // Large PDFs are chunked/embedded in the background (see
  // textbookServiceClient.js) - keep polling while anything is still
  // "processing" so the list picks up "ready"/"failed" without a manual
  // refresh.
  useEffect(() => {
    if (!textbooks.some((b) => b.status === "processing")) return;
    const timer = setTimeout(refreshTextbooks, 4000);
    return () => clearTimeout(timer);
  }, [textbooks, refreshTextbooks]);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!uploadFile || !uploadTitle.trim()) {
      toast.error("Pick a PDF and give it a title first.");
      return;
    }
    setUploading(true);
    try {
      const book = await uploadTextbook(uploadFile, uploadTitle.trim());
      toast.success(`"${book.title}" is uploading - it'll be ready to ask questions shortly.`);
      setUploadTitle("");
      setUploadFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      await refreshTextbooks();
      setSelectedBookId(book.book_id);
    } catch (error) {
      reportError(error);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (bookId) => {
    try {
      await deleteTextbook(bookId);
      toast.success("Textbook removed.");
      setThreads((prev) => {
        const next = { ...prev };
        delete next[bookId];
        return next;
      });
      if (bookId === selectedBookId) setViewer(null);
      await refreshTextbooks();
    } catch (error) {
      reportError(error);
    }
  };

  const handleAsk = async (e) => {
    e.preventDefault();
    if (!selectedBookId || !question.trim() || selectedBook?.status !== "ready") return;
    const asked = question.trim();
    setAsking(true);
    try {
      const result = await askTextbook(selectedBookId, asked);
      setThreads((prev) => ({
        ...prev,
        [selectedBookId]: [
          ...(prev[selectedBookId] || []),
          { question: asked, ...result },
        ],
      }));
      setQuestion("");
    } catch (error) {
      reportError(error);
    } finally {
      setAsking(false);
    }
  };

  const selectedBook = textbooks.find((b) => b.book_id === selectedBookId);
  const conversation = selectedBookId ? threads[selectedBookId] || [] : [];
  const viewerOpen = Boolean(viewer && selectedBook);

  const selectBook = (bookId) => {
    setSelectedBookId(bookId);
    if (bookId !== selectedBookId) setViewer((current) => (current ? { page: null } : null));
  };

  const openCitation = (citation) => setViewer({ page: citation?.page ?? null });

  if (loadingTextbooks) return <Loading message="Loading your textbooks..." fullScreen />;

  return (
    <PageShell>
      <PageBanner
        title="Ask a Textbook"
        subtitle="Upload a textbook PDF, then ask questions about it. Answers are drawn strictly from that book's own contents, and your uploads are visible only to you."
      />

      <div
        className={cx(
          "grid grid-cols-1 gap-8",
          viewerOpen ? "lg:grid-cols-2" : "lg:grid-cols-[22rem,1fr]"
        )}
      >
        {/* Left: library + upload (makes way for the document in split view) */}
        <div className={cx("space-y-6", viewerOpen && "hidden")}>
          <Panel title="Upload a textbook" divided>
            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <SectionLabel className="mb-1.5 block">Title</SectionLabel>
                <Input
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  placeholder="e.g. Modern Physics, Chapter 4"
                  disabled={uploading}
                />
              </div>
              <div>
                <SectionLabel className="mb-1.5 block">PDF file</SectionLabel>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => setUploadFile(e.target.files?.[0] ?? null)}
                  disabled={uploading}
                  className="block w-full text-xs text-ink-muted file:mr-3 file:border-0 file:bg-navy file:px-4 file:py-2 file:text-[10px] file:font-semibold file:uppercase file:tracking-[0.14em] file:text-white hover:file:bg-navy-dark"
                />
              </div>
              <Button type="submit" disabled={uploading} className="w-full">
                <FontAwesomeIcon icon={faCloudArrowUp} />
                {uploading ? "Uploading..." : "Upload textbook"}
              </Button>
            </form>
          </Panel>

          <Panel title="My textbooks" divided>
            {textbooks.length === 0 ? (
              <EmptyState
                title="No textbooks yet"
                description="Upload a PDF above to start asking it questions."
              />
            ) : (
              <ul className="space-y-2">
                {textbooks.map((book) => (
                  <li key={book.book_id}>
                    <div
                      onClick={() => selectBook(book.book_id)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") selectBook(book.book_id);
                      }}
                      role="button"
                      tabIndex={0}
                      className={cx(
                        "flex w-full cursor-pointer items-center justify-between gap-3 border px-4 py-3 text-left transition-colors",
                        book.book_id === selectedBookId
                          ? "border-navy bg-navy-wash"
                          : "border-line bg-white hover:border-navy/40"
                      )}
                    >
                      <span className="flex min-w-0 items-center gap-3">
                        <FontAwesomeIcon icon={faFilePdf} className="text-ink-muted" />
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-semibold text-ink">
                            {book.title}
                          </span>
                          <span
                            className={cx(
                              "block text-[10px] uppercase tracking-[0.14em]",
                              book.status === "failed" ? "text-red-600" : "text-ink-muted"
                            )}
                          >
                            {book.status === "processing"
                              ? "Processing..."
                              : book.status === "failed"
                              ? "Failed to process"
                              : `${book.chunk_count} chunks`}
                          </span>
                        </span>
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(book.book_id);
                        }}
                        className="flex-shrink-0 text-ink-muted hover:text-red-600"
                        title="Delete textbook"
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>

        {/* Right: Q&A */}
        <section
          className={cx(
            "flex min-h-[32rem] flex-col border border-line bg-white",
            viewerOpen && "lg:h-[calc(100vh-10rem)] lg:min-h-0"
          )}
        >
          <div className="border-b border-line-soft px-6 py-5">
            <div className="flex items-start justify-between gap-3">
              <h2 className="font-display text-xl font-bold text-ink">
                {selectedBook ? selectedBook.title : "Ask a question"}
              </h2>
              {selectedBook?.status === "ready" && (
                <Button
                  variant={viewerOpen ? "primary" : "secondary"}
                  size="sm"
                  type="button"
                  className="flex-shrink-0"
                  onClick={() => setViewer(viewerOpen ? null : { page: null })}
                >
                  <FontAwesomeIcon icon={faBookOpen} />
                  {viewerOpen ? "Hide document" : "View document"}
                </Button>
              )}
            </div>
            {selectedBook && (
              <p className="mt-1 text-sm text-ink-muted">
                {selectedBook.status === "processing"
                  ? "Processing - this can take a few minutes for a large PDF."
                  : selectedBook.status === "failed"
                  ? `Failed to process: ${selectedBook.error || "unknown error"}`
                  : `${selectedBook.chunk_count} chunks indexed`}
              </p>
            )}
          </div>

          {!selectedBook ? (
            <div className="flex flex-1 items-center justify-center px-6 py-14">
              <EmptyState
                title="Pick a textbook"
                description="Upload one on the left, or select an existing textbook to start asking questions."
              />
            </div>
          ) : (
            <>
              <div className="flex-1 space-y-4 overflow-y-auto px-6 py-6">
                {selectedBook.status === "processing" ? (
                  <EmptyState
                    title="Still processing"
                    description="This can take a few minutes for a large PDF. It'll be ready to ask questions here once it's done."
                  />
                ) : selectedBook.status === "failed" ? (
                  <EmptyState
                    title="Processing failed"
                    description={
                      selectedBook.error || "Something went wrong while processing this PDF."
                    }
                  />
                ) : conversation.length === 0 ? (
                  <EmptyState
                    title="No questions yet"
                    description={`Ask anything about "${selectedBook.title}" below.`}
                  />
                ) : (
                  conversation.map((turn, i) => (
                    <div key={i} className="space-y-2">
                      <div className="flex justify-end">
                        <div className="max-w-[80%] bg-navy px-4 py-2.5 text-sm text-white">
                          {turn.question}
                        </div>
                      </div>
                      <div className="flex justify-start">
                        <div className="min-w-0 max-w-[90%] space-y-2 border border-line bg-parchment px-4 py-3">
                          <div className="flex items-center gap-2">
                            <FontAwesomeIcon icon={faRobot} className="text-navy" />
                            <Badge tone={turn.foundInBook ? "positive" : "warning"}>
                              <FontAwesomeIcon
                                icon={turn.foundInBook ? faCircleCheck : faCircleXmark}
                              />
                              {turn.foundInBook ? "In the book" : "Not found in book"}
                            </Badge>
                          </div>
                          <AnswerMarkdown
                            text={turn.answer}
                            citations={turn.citations}
                            onCite={(index) => openCitation(turn.citations[index])}
                          />
                          {turn.citations.length > 0 && (
                            <div className="space-y-1.5 border-t border-line-soft pt-2">
                              <SectionLabel className="block">References</SectionLabel>
                              {turn.citations.map((citation, index) => (
                                <button
                                  key={index}
                                  type="button"
                                  onClick={() => openCitation(citation)}
                                  className="flex w-full items-start gap-2 border border-line bg-white px-2.5 py-1.5 text-left text-xs text-ink hover:border-navy/40 hover:bg-navy-wash"
                                >
                                  <span className="flex-shrink-0 font-semibold text-navy">
                                    [{index + 1}]
                                    {citation.page != null && ` p. ${citation.page}`}
                                  </span>
                                  <span className="line-clamp-2 italic text-ink-muted">
                                    &ldquo;{citation.quote}&rdquo;
                                  </span>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <form
                onSubmit={handleAsk}
                className="flex items-center gap-3 border-t border-line-soft px-6 py-4"
              >
                <Input
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder={`Ask something about "${selectedBook.title}"...`}
                  disabled={asking || selectedBook.status !== "ready"}
                  className="flex-1"
                />
                <Button
                  type="submit"
                  disabled={asking || !question.trim() || selectedBook.status !== "ready"}
                >
                  <FontAwesomeIcon icon={faPaperPlane} />
                  {asking ? "Asking..." : "Ask"}
                </Button>
              </form>
            </>
          )}
        </section>

        {viewerOpen && (
          <TextbookViewer
            book={selectedBook}
            page={viewer.page}
            onClose={() => setViewer(null)}
          />
        )}
      </div>
    </PageShell>
  );
};

export default TextbookQA;
