import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { EmptyState } from "../../../components/ui";
import { fetchTextbookFile } from "../../../utils/textbookServiceClient";

/**
 * The uploaded PDF, shown beside the conversation. `page` is where the reader
 * last asked to jump (e.g. by clicking a citation).
 */
const TextbookViewer = ({ book, page, onClose }) => {
  const [url, setUrl] = useState(null);
  const [error, setError] = useState(null);
  const bookId = book.book_id;
  const hasOriginal = book.has_original;

  useEffect(() => {
    if (!hasOriginal) return undefined;
    let cancelled = false;
    let objectUrl = null;
    setUrl(null);
    setError(null);

    fetchTextbookFile(bookId)
      .then((fetched) => {
        objectUrl = fetched;
        if (cancelled) URL.revokeObjectURL(fetched);
        else setUrl(fetched);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      });

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [bookId, hasOriginal]);

  return (
    <section className="flex min-h-[32rem] flex-col border border-line bg-white lg:h-[calc(100vh-10rem)] lg:min-h-0">
      <header className="flex items-center justify-between gap-3 border-b border-line-soft px-5 py-4">
        <div className="min-w-0">
          <p className="truncate font-display text-base font-bold text-ink">{book.title}</p>
          <p className="text-[10px] uppercase tracking-[0.14em] text-ink-muted">
            {page ? `Source · page ${page}` : "Source document"}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex h-8 w-8 flex-shrink-0 items-center justify-center border border-line text-ink-muted hover:border-navy hover:text-navy"
          title="Close document"
        >
          <FontAwesomeIcon icon={faXmark} />
        </button>
      </header>

      <div className="flex min-h-0 flex-1 items-center justify-center bg-cream p-2">
        {!hasOriginal ? (
          <EmptyState
            title="No preview available"
            description="The original PDF wasn't kept for this textbook. Upload it again to read it here."
          />
        ) : error ? (
          <EmptyState title="Couldn't open the PDF" description={error} />
        ) : !url ? (
          <p className="text-sm text-ink-muted">Loading document...</p>
        ) : (
          // Remounting on page change is what makes the #page fragment take
          // effect - the browser's PDF viewer only reads it on load.
          <iframe
            key={page ?? "first"}
            src={`${url}#page=${page ?? 1}`}
            title={book.title}
            className="h-full min-h-[28rem] w-full border border-line bg-white"
          />
        )}
      </div>
    </section>
  );
};

export default TextbookViewer;
