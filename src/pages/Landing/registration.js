/**
 * Saves a landing-page registration to Firestore `demoRequests` (the same
 * fields RegisterModal has always written, so the security rule and whoever
 * reads the collection see no difference).
 *
 * Latency: the write goes to Firestore's REST API as one HTTPS request instead
 * of through the JS SDK, which has to open its streaming channel before the
 * first write lands (and keeps a write pending forever when offline). The
 * optional Google Sheets webhook is fired in parallel and never waited on
 * unless Firestore fails.
 */

const PROJECT_ID = process.env.REACT_APP_FIREBASE_PROJECT_ID;
const API_KEY = process.env.REACT_APP_FIREBASE_API_KEY;
const SHEETS_WEBHOOK_URL = process.env.REACT_APP_GOOGLE_SHEETS_WEBHOOK_URL;
const TIMEOUT_MS = 8000;

const withTimeout = (promise, ms, message) =>
  Promise.race([promise, new Promise((_, reject) => setTimeout(() => reject(new Error(message)), ms))]);

const toFields = (data) =>
  Object.fromEntries(
    Object.entries(data).map(([key, value]) => [
      key,
      value instanceof Date ? { timestampValue: value.toISOString() } : { stringValue: String(value) },
    ])
  );

const COLLECTION_URL = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/demoRequests`;

/**
 * Called when the form opens: a throwaway read (the rules deny it, nothing is
 * returned or written) so DNS/TLS are done while the user is still typing.
 * A cold submit measured ~1.1-1.8 s; a warm one ~0.4 s.
 */
export function warmRegistration() {
  fetch(`${COLLECTION_URL}/warmup?key=${API_KEY}`).catch(() => {});
}

async function writeViaRest(doc) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    // text/plain keeps this a "simple" CORS request - no preflight round trip.
    // Firestore parses the body as JSON regardless of the declared type.
    const res = await fetch(`${COLLECTION_URL}?key=${API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body: JSON.stringify({ fields: toFields(doc) }),
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`Firestore REST ${res.status}`);
  } finally {
    clearTimeout(timer);
  }
}

// Only reached when the REST call fails (e.g. an API-key restriction), so the
// SDK isn't pulled into the landing page's critical path.
async function writeViaSdk(doc) {
  const [{ db }, { collection, addDoc }] = await Promise.all([
    import("../../firebase/firebase-config"),
    import("firebase/firestore"),
  ]);
  await withTimeout(addDoc(collection(db, "demoRequests"), doc), TIMEOUT_MS, "Firestore SDK timeout");
}

function sendToSheets(payload) {
  if (!SHEETS_WEBHOOK_URL) return Promise.reject(new Error("no webhook"));
  // no-cors + text/plain skips the preflight Apps Script can't answer; the
  // response is opaque, so "didn't throw" is the only success signal.
  return fetch(SHEETS_WEBHOOK_URL, {
    method: "POST",
    mode: "no-cors",
    keepalive: true,
    headers: { "Content-Type": "text/plain" },
    body: JSON.stringify(payload),
  });
}

export async function submitRegistration(form) {
  const payload = {
    firstName: form.firstName.trim(),
    lastName: form.lastName.trim(),
    email: form.email.trim(),
    phone: form.phone.trim(),
    role: form.role,
    university: form.university.trim(),
    timestamp: new Date().toISOString(),
  };
  const doc = { ...payload, createdAt: new Date(), status: "pending", source: "web-form" };

  const sheets = sendToSheets(payload);
  sheets.catch(() => {});

  try {
    await writeViaRest(doc);
    return;
  } catch (restError) {
    console.warn("Registration REST write failed, retrying with the SDK:", restError);
  }
  try {
    await writeViaSdk(doc);
    return;
  } catch (sdkError) {
    console.error("Registration Firestore write failed:", sdkError);
  }
  // Firestore is down for us; the sheet copy is still a usable record.
  await sheets.catch(() => {
    throw new Error("We couldn't send your details. Please check your connection and try again.");
  });
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Field-level errors, keyed by field name; empty object when valid. */
export function validateRegistration(form) {
  const errors = {};
  if (!EMAIL_RE.test(form.email.trim())) errors.email = "Enter a valid email address.";
  const digits = form.phone.replace(/\D/g, "");
  if (!/^[\d\s\-+()]+$/.test(form.phone.trim()) || digits.length < 10 || digits.length > 15)
    errors.phone = "Enter a valid phone number (10+ digits).";
  if (!form.role) errors.role = "Choose student or educator.";
  if (form.university.trim().length < 2) errors.university = "Enter your university or college.";
  return errors;
}
