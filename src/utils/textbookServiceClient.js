// Client for the Newspaper_ingestion service (a separate FastAPI app, not
// part of this repo). It has no auth of its own, so this talks to it with
// plain fetch rather than the Firebase-token-injecting apiClient.
const TEXTBOOK_SERVICE_URL =
  process.env.REACT_APP_TEXTBOOK_SERVICE_URL || "http://localhost:8000";

// The schema the LLM's JSON answer must satisfy - kept in sync with how the
// answer is rendered below (an answer string plus whether it was actually
// grounded in the retrieved textbook excerpts).
const ANSWER_SCHEMA = {
  type: "object",
  properties: {
    answer: {
      type: "string",
      description: "Answer to the question, drawn only from the retrieved textbook excerpts.",
    },
    found_in_book: {
      type: "boolean",
      description: "Whether the retrieved excerpts actually contained the answer.",
    },
  },
  required: ["answer", "found_in_book"],
};

async function request(path, options = {}) {
  let response;
  try {
    response = await fetch(`${TEXTBOOK_SERVICE_URL}${path}`, options);
  } catch {
    throw new Error(
      "Can't reach the textbook service. Make sure it's running (see Newspaper_ingestion)."
    );
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

  if (response.status === 204) return null;
  return response.json();
}

export const listTextbooks = () => request("/textbooks").then((r) => r.books);

export const getTextbook = (bookId) => request(`/textbooks/${bookId}`);

export const uploadTextbook = (file, title) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("title", title);
  return request("/textbooks", { method: "POST", body: formData });
};

export const deleteTextbook = (bookId) => request(`/textbooks/${bookId}`, { method: "DELETE" });

export const askTextbook = (bookId, prompt, topK) =>
  request(`/textbooks/${bookId}/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      prompt,
      output_schema: ANSWER_SCHEMA,
      ...(topK ? { top_k: topK } : {}),
    }),
  }).then((r) => r.result);
