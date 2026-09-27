import Cookies from "js-cookie";

// Client for the Newspaper_ingestion service (a separate FastAPI app, not
// part of this repo). It verifies the same Firebase ID token the backend
// does, and scopes every textbook to the user whose token uploaded it - so
// each user only ever sees and queries their own uploads.
const TEXTBOOK_SERVICE_URL =
  process.env.REACT_APP_TEXTBOOK_SERVICE_URL || "http://localhost:8000";

// The schema the LLM's JSON answer must satisfy. The descriptions are the
// model's formatting instructions - keep them in sync with how
// AnswerMarkdown renders the answer and how citations are shown.
const ANSWER_SCHEMA = {
  type: "object",
  properties: {
    answer: {
      type: "string",
      description:
        "Answer drawn only from the retrieved textbook excerpts, formatted as Markdown: " +
        "short paragraphs, bullet or numbered lists on their own lines, **bold** for key " +
        "terms, and tables where the source is tabular. Write every formula or equation " +
        "in LaTeX - $...$ inline, $$...$$ on its own line for display equations - and " +
        "escape a literal dollar sign as \\$. Write special characters (en dashes, degree " +
        "signs, Greek letters, superscripts) as the characters themselves, never as " +
        "\\u escape sequences. After each claim, cite the supporting entry of `citations` " +
        "by its 1-based position in square brackets, e.g. [1] or [2][3].",
    },
    found_in_book: {
      type: "boolean",
      description: "Whether the retrieved excerpts actually contained the answer.",
    },
    citations: {
      type: "array",
      description:
        "The excerpts the answer relies on, in the order the answer's [n] markers refer " +
        "to them. Empty if found_in_book is false.",
      items: {
        type: "object",
        properties: {
          page_number: {
            type: ["integer", "null"],
            description: "Page of the excerpt, exactly as given in its [Excerpt ..., page N] header.",
          },
          quote: {
            type: "string",
            description: "A short verbatim quote (under 25 words) from that excerpt.",
          },
        },
        required: ["page_number", "quote"],
      },
    },
  },
  required: ["answer", "found_in_book", "citations"],
};

// Claude occasionally double-escapes non-ASCII characters inside its JSON
// output, so an en dash arrives as the literal text "–" instead of "–".
const fixDoubleEscapedUnicode = (text) =>
  text.replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));

class SessionExpiredError extends Error {}

const authHeaders = () => {
  const token = Cookies.get("authToken");
  if (!token) throw new SessionExpiredError("You're signed out. Please log in again.");
  return { Authorization: `Bearer ${token}` };
};

async function send(path, options = {}) {
  const headers = { ...authHeaders(), ...options.headers };
  let response;
  try {
    response = await fetch(`${TEXTBOOK_SERVICE_URL}${path}`, { ...options, headers });
  } catch {
    throw new Error(
      "Can't reach the textbook service. Make sure it's running (see Newspaper_ingestion)."
    );
  }

  if (response.status === 401) {
    throw new SessionExpiredError("Your session has expired. Please log in again.");
  }
  if (!response.ok) {
    let detail = `Request failed (${response.status})`;
    try {
      const body = await response.json();
      detail = body.detail || body.message || detail;
    } catch {
      // non-JSON error body, keep the generic message
    }
    throw new Error(detail);
  }
  return response;
}

async function request(path, options) {
  const response = await send(path, options);
  if (response.status === 204) return null;
  return response.json();
}

export const isSessionExpired = (error) => error instanceof SessionExpiredError;

export const listTextbooks = () => request("/textbooks").then((r) => r.books);

export const getTextbook = (bookId) => request(`/textbooks/${bookId}`);

export const uploadTextbook = (file, title) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("title", title);
  return request("/textbooks", { method: "POST", body: formData });
};

export const deleteTextbook = (bookId) => request(`/textbooks/${bookId}`, { method: "DELETE" });

/**
 * The uploaded PDF as an object URL. It has to be fetched with the auth
 * header rather than pointed at directly, since an <iframe> can't send one.
 * The caller owns the URL and must URL.revokeObjectURL it when done.
 */
export const fetchTextbookFile = async (bookId) => {
  const response = await send(`/textbooks/${bookId}/file`);
  return URL.createObjectURL(await response.blob());
};

export const askTextbook = (bookId, prompt, topK) =>
  request(`/textbooks/${bookId}/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      prompt,
      output_schema: ANSWER_SCHEMA,
      ...(topK ? { top_k: topK } : {}),
    }),
  }).then(({ result }) => ({
    answer: fixDoubleEscapedUnicode(result.answer ?? ""),
    foundInBook: Boolean(result.found_in_book),
    citations: (result.citations ?? []).map((c) => ({
      page: Number.isInteger(c.page_number) ? c.page_number : null,
      quote: fixDoubleEscapedUnicode(c.quote ?? ""),
    })),
  }));
