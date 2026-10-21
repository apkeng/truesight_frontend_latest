import React, { useEffect, useRef, useState } from "react";
import useCountdown from "../../hooks/useCountdown";
import {
  attemptPuzzle,
  getCurrentDailyQuestion,
  getDailyQuestionAttemptStatus,
  getRandomPuzzle,
  submitDailyQuestionAnswer,
} from "../../utils/apiServices";
import { submitRegistration, validateRegistration, warmRegistration } from "./registration";

/** Dark modal shell: Escape / backdrop click close it, page scroll is locked. */
export function Modal({ onClose, labelledBy, maxWidth = 520, children }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return (
    <div className="tsl-modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby={labelledBy} style={{ maxWidth }}>
        <button type="button" className="modal-x" onClick={onClose} aria-label="Close">
          ×
        </button>
        {children}
      </div>
    </div>
  );
}

const EMPTY_FORM = { firstName: "", lastName: "", email: "", phone: "", role: "", university: "" };

export function RegisterModal({ onClose, onLogin }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState(false);
  const [status, setStatus] = useState("idle"); // idle | sending | done
  const [submitError, setSubmitError] = useState("");
  const firstRef = useRef(null);

  useEffect(() => {
    firstRef.current?.focus();
    warmRegistration();
  }, []);

  // Functional update: browser autofill changes several fields in one tick,
  // and spreading the render-time `form` would drop all but the last.
  const set = (key) => (e) => {
    const value = e && e.target ? e.target.value : e;
    setForm((prev) => ({ ...prev, [key]: value }));
  };
  // After a failed submit, re-check as the user types so errors clear live.
  useEffect(() => {
    if (touched) setErrors(validateRegistration(form));
  }, [form, touched]);

  const submit = async (e) => {
    e.preventDefault();
    if (status === "sending") return;
    const found = validateRegistration(form);
    setTouched(true);
    setErrors(found);
    if (Object.keys(found).length) return;
    setStatus("sending");
    setSubmitError("");
    try {
      await submitRegistration(form);
      setStatus("done");
    } catch (err) {
      setSubmitError(err.message);
      setStatus("idle");
    }
  };

  if (status === "done") {
    return (
      <Modal onClose={onClose} labelledBy="reg-title">
        <span className="pill pill-green" style={{ alignSelf: "flex-start" }}>
          Registration received
        </span>
        <h3 id="reg-title">You're on the list{form.firstName ? `, ${form.firstName.trim()}` : ""}.</h3>
        <p style={{ margin: 0, color: "var(--muted)", fontSize: 15, lineHeight: 1.6 }}>
          We've got your details and will reach out at <b style={{ color: "var(--ink)" }}>{form.email.trim()}</b> shortly with
          your login.
        </p>
        <button type="button" className="btn btn-y" style={{ alignSelf: "flex-start" }} onClick={onClose}>
          Done
        </button>
      </Modal>
    );
  }

  const sending = status === "sending";
  return (
    <Modal onClose={onClose} labelledBy="reg-title">
      <div style={{ display: "flex", flexDirection: "column", gap: 8, paddingRight: 36 }}>
        <span className="mono y" style={{ fontSize: 12 }}>
          REGISTER
        </span>
        <h3 id="reg-title">Get your TrueSight account</h3>
        <p style={{ margin: 0, color: "var(--muted)", fontSize: 14, lineHeight: 1.55 }}>
          Share a few details and we'll set you up.
        </p>
      </div>
      <form onSubmit={submit} noValidate style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div className="field">
          <label>I am a</label>
          <div className={`roles${errors.role ? " bad" : ""}`} role="radiogroup" aria-label="Role">
            {["Student", "Educator"].map((r) => (
              <button
                key={r}
                type="button"
                role="radio"
                aria-checked={form.role === r}
                className={form.role === r ? "on" : ""}
                onClick={() => set("role")(r)}
                disabled={sending}
              >
                {r}
              </button>
            ))}
          </div>
          {errors.role && <span className="err">{errors.role}</span>}
        </div>
        <div className="two">
          <div className="field">
            <label htmlFor="reg-first">
              First name <em>(optional)</em>
            </label>
            <input id="reg-first" ref={firstRef} className="input" autoComplete="given-name" value={form.firstName} onChange={set("firstName")} disabled={sending} />
          </div>
          <div className="field">
            <label htmlFor="reg-last">
              Last name <em>(optional)</em>
            </label>
            <input id="reg-last" className="input" autoComplete="family-name" value={form.lastName} onChange={set("lastName")} disabled={sending} />
          </div>
        </div>
        <div className="field">
          <label htmlFor="reg-email">Email</label>
          <input
            id="reg-email"
            type="email"
            inputMode="email"
            autoComplete="email"
            className={`input${errors.email ? " bad" : ""}`}
            placeholder="you@college.edu"
            value={form.email}
            onChange={set("email")}
            disabled={sending}
          />
          {errors.email && <span className="err">{errors.email}</span>}
        </div>
        <div className="field">
          <label htmlFor="reg-phone">Phone</label>
          <input
            id="reg-phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            className={`input${errors.phone ? " bad" : ""}`}
            placeholder="+91 98765 43210"
            value={form.phone}
            onChange={set("phone")}
            disabled={sending}
          />
          {errors.phone && <span className="err">{errors.phone}</span>}
        </div>
        <div className="field">
          <label htmlFor="reg-uni">University / college</label>
          <input
            id="reg-uni"
            autoComplete="organization"
            className={`input${errors.university ? " bad" : ""}`}
            placeholder="Your university or college"
            value={form.university}
            onChange={set("university")}
            disabled={sending}
          />
          {errors.university && <span className="err">{errors.university}</span>}
        </div>
        {submitError && (
          <div className="alert err" role="alert">
            {submitError}
          </div>
        )}
        <button type="submit" className="btn btn-y btn-lg" disabled={sending} style={{ marginTop: 4 }}>
          {sending ? (
            <>
              <span className="spinner" /> Sending…
            </>
          ) : (
            <>Register →</>
          )}
        </button>
        <p style={{ margin: 0, fontSize: 13, color: "var(--muted)", textAlign: "center" }}>
          Already have an account?{" "}
          <button type="button" onClick={onLogin} style={{ background: "none", border: 0, color: "var(--yellow)", fontWeight: 700, cursor: "pointer", fontSize: 13 }}>
            Log in
          </button>
        </p>
      </form>
    </Modal>
  );
}

/**
 * Today's question. Anyone can answer; signed-in students get the attempt
 * recorded and +5 points for a correct answer.
 */
export function DailyQuestionModal({ onClose, isAuthenticated, initialQuestion, onRegister }) {
  const [question, setQuestion] = useState(initialQuestion || null);
  const [loadError, setLoadError] = useState(null);
  const [choice, setChoice] = useState("");
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    let alive = true;
    Promise.all([
      initialQuestion ? Promise.resolve(initialQuestion) : getCurrentDailyQuestion(),
      isAuthenticated ? getDailyQuestionAttemptStatus().catch(() => null) : null,
    ])
      .then(([q, status]) => {
        if (!alive) return;
        setQuestion(q);
        if (status?.hasAttempted) {
          setChoice(status.attempt.answer);
          setResult({
            isCorrect: status.attempt.isCorrect,
            correctAnswer: status.correctAnswer,
            coinsAwarded: status.attempt.coinsAwarded,
            already: true,
          });
        }
      })
      .catch((err) => alive && setLoadError(err));
    return () => {
      alive = false;
    };
  }, [initialQuestion, isAuthenticated]);

  const submit = async () => {
    if (!choice || busy) return;
    setBusy(true);
    setSubmitError("");
    try {
      setResult(await submitDailyQuestionAnswer(choice));
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal onClose={onClose} labelledBy="dq-title" maxWidth={580}>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, paddingRight: 36 }}>
        <span className="mono y" style={{ fontSize: 12 }}>
          DAILY QUESTION · +5 PTS
        </span>
        <h3 id="dq-title">{question ? question.question : "Today's question"}</h3>
      </div>
      {loadError ? (
        <div className="alert err">Today's question isn't available right now. Please try again later.</div>
      ) : !question ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="skeleton" style={{ height: 48 }} />
          ))}
        </div>
      ) : (
        <>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {(question.options || []).map((opt, i) => {
              const right = result && opt.trim() === (result.correctAnswer || "").trim();
              const wrong = result && opt === choice && !result.isCorrect;
              const cls = right ? "right" : wrong ? "wrong" : !result && choice === opt ? "picked" : "";
              return (
                <button key={opt} type="button" className={`opt ${cls}`} disabled={Boolean(result) || busy} onClick={() => setChoice(opt)}>
                  <span className="letter">{right ? "✓" : wrong ? "✕" : String.fromCharCode(65 + i)}</span>
                  <span style={{ flex: 1 }}>{opt}</span>
                </button>
              );
            })}
          </div>
          {submitError && <div className="alert err">{submitError}</div>}
          {result ? (
            <>
              <div className={`alert ${result.isCorrect ? "ok" : "err"}`}>
                {result.isCorrect
                  ? result.coinsAwarded
                    ? `Correct! +${result.coinsAwarded} points added to your balance.`
                    : isAuthenticated
                      ? "Correct! You've already answered today, so no new points."
                      : "Correct! Register to bank 5 points for every daily question you get right."
                  : result.already
                    ? "You've already answered today's question. A new one drops tomorrow."
                    : "Not this time. A new question drops tomorrow."}
              </div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {!isAuthenticated && (
                  <button type="button" className="btn btn-y" onClick={onRegister}>
                    Register to earn points
                  </button>
                )}
                <button type="button" className="btn btn-ghost" onClick={onClose}>
                  Close
                </button>
              </div>
            </>
          ) : (
            <button type="button" className="btn btn-y btn-lg" disabled={!choice || busy} onClick={submit}>
              {busy ? (
                <>
                  <span className="spinner" /> Checking…
                </>
              ) : (
                "Submit answer"
              )}
            </button>
          )}
          <p style={{ margin: 0, fontSize: 12, color: "var(--dim)" }}>
            One attempt per day{isAuthenticated ? " · a correct answer earns 5 points" : " · sign in to earn points"}
          </p>
        </>
      )}
    </Modal>
  );
}

/** Word Quest: a 60-second riddle, +10 points on a riddle's first solve. Signed-in only. */
export function WordQuestModal({ onClose, isAuthenticated, onRegister, onLogin }) {
  const [puzzle, setPuzzle] = useState(null);
  const [error, setError] = useState(null);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = () => {
    setPuzzle(null);
    setError(null);
    setAnswer("");
    setFeedback(null);
    getRandomPuzzle().then(setPuzzle).catch(setError);
  };
  useEffect(() => {
    if (isAuthenticated) load();
  }, [isAuthenticated]);

  const secondsLeft = useCountdown(puzzle?.timeLimitSeconds, puzzle?.sessionId);
  const timedOut = !feedback?.correct && (secondsLeft === 0 || Boolean(feedback?.expired));
  const locked = Boolean(feedback?.correct) || timedOut;

  const submit = async (e) => {
    e?.preventDefault();
    if (!answer.trim() || locked || busy) return;
    setBusy(true);
    try {
      setFeedback(await attemptPuzzle(puzzle.id, answer.trim(), puzzle.sessionId));
    } catch (err) {
      setFeedback({ correct: false, message: err.message });
    } finally {
      setBusy(false);
    }
  };

  const head = (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, paddingRight: 36 }}>
      <span className="mono y" style={{ fontSize: 12 }}>
        WORD QUEST · +10 PTS
      </span>
      <h3 id="wq-title">Solve the riddle in 60 seconds</h3>
    </div>
  );

  if (!isAuthenticated) {
    return (
      <Modal onClose={onClose} labelledBy="wq-title">
        {head}
        <p className="riddle">
          {"I have pages but I'm not a tree,\nI hold your syllabus, cite me and see.\nUpload me once and ask me twice -\nwhat am I?"}
        </p>
        <p style={{ margin: 0, color: "var(--muted)", fontSize: 15, lineHeight: 1.6 }}>
          Word Quest serves a fresh timed riddle from a pool of 60, and every first solve adds 10 points to your rewards
          balance. Sign in to play.
        </p>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button type="button" className="btn btn-y" onClick={onRegister}>
            Register to play
          </button>
          <button type="button" className="btn btn-ghost" onClick={onLogin}>
            I have an account
          </button>
        </div>
      </Modal>
    );
  }

  const low = secondsLeft !== null && secondsLeft <= 10;
  return (
    <Modal onClose={onClose} labelledBy="wq-title" maxWidth={580}>
      {head}
      {error ? (
        <div className="alert err">{error.message}</div>
      ) : !puzzle ? (
        <div className="skeleton" style={{ height: 140 }} />
      ) : (
        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {secondsLeft !== null && !feedback?.correct && (
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span className="mono" style={{ fontSize: 14, minWidth: 64, color: timedOut ? "#FF8A8A" : low ? "#FFB066" : "var(--ink)" }}>
                {timedOut ? "Time's up" : `0:${String(secondsLeft).padStart(2, "0")}`}
              </span>
              <div className="bar" style={{ flex: 1 }}>
                <div style={{ width: `${(secondsLeft / puzzle.timeLimitSeconds) * 100}%`, background: low ? "#FFB066" : "var(--yellow)", transition: "width .3s linear" }} />
              </div>
            </div>
          )}
          <p className="riddle">{puzzle.poem}</p>
          <input className="input" value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder="Your answer" disabled={locked} autoFocus />
          {timedOut ? (
            <div className="alert err">Time's up for this riddle. Try a different one.</div>
          ) : (
            feedback && (
              <div className={`alert ${feedback.correct ? "ok" : "err"}`}>
                {feedback.message ||
                  (feedback.correct
                    ? feedback.pointsAwarded
                      ? `Correct! +${feedback.pointsAwarded} points.`
                      : "Correct! You'd solved this one before, so no new points."
                    : "Not quite. Try again.")}
              </div>
            )
          )}
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button type="submit" className="btn btn-y" disabled={locked || !answer.trim() || busy}>
              {busy ? <span className="spinner" /> : "Check answer"}
            </button>
            <button type="button" className="btn btn-ghost" onClick={load}>
              Different riddle
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}
