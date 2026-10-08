import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import {
  LuAtom,
  LuArrowLeft,
  LuArrowRight,
  LuClock,
  LuSave,
  LuCircleCheck,
  LuCircleX,
  LuRotateCcw,
  LuShieldCheck,
  LuChartColumn,
  LuSend,
  LuTrophy,
  LuList,
  LuSquare,
} from "react-icons/lu";
import { api, keys, uidKey } from "../lib/api";
import { invalidate } from "../lib/query";
import { cx } from "../lib/format";
import { Badge, Button, Card, ConfirmDialog, ErrorState } from "../ui";
import { Page } from "../layout/AppShell";

const B = "/l2dashboard";
const SECONDS_PER_QUESTION = 30;
const draftKey = (topic, challengeId) => `ts-quiz-draft:${challengeId || topic}`;

const readDraft = (key) => {
  try {
    return JSON.parse(sessionStorage.getItem(key) || "null");
  } catch {
    return null;
  }
};
const writeDraft = (key, value) => {
  try {
    if (value) sessionStorage.setItem(key, JSON.stringify(value));
    else sessionStorage.removeItem(key);
  } catch {
    // ignore
  }
};

const mmss = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

export default function Quiz() {
  const { topic: rawTopic } = useParams();
  const topic = decodeURIComponent(rawTopic);
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const challengeId = params.get("challengeId");
  const projectTopic = params.get("projectTopic");
  const from = params.get("from"); // "self/<id>" | "educator/<id>"
  const backTo = from ? `${B}/projects/${from}` : challengeId ? `${B}/challenges` : `${B}/projects`;
  const key = draftKey(topic, challengeId);

  const [phase, setPhase] = useState("launching"); // launching | playing | submitting | done | error
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({}); // index -> option
  const [index, setIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [error, setError] = useState(null);
  const [outcome, setOutcome] = useState(null);
  const [confirmSubmit, setConfirmSubmit] = useState(false);
  const [minLaunchDone, setMinLaunchDone] = useState(false);
  const submittingRef = useRef(false);

  // Load questions (or resume a saved draft).
  useEffect(() => {
    let alive = true;
    const draft = readDraft(key);
    if (draft?.questions?.length) {
      setQuestions(draft.questions);
      setAnswers(draft.answers || {});
      setIndex(draft.index || 0);
      setTimeLeft(draft.timeLeft || draft.questions.length * SECONDS_PER_QUESTION);
      setPhase("playing");
      toast.info("Resumed your saved quiz.");
      return undefined;
    }
    const load = challengeId
      ? api.getChallenge(challengeId).then((c) => {
          if (!c?.questions?.length) throw new Error("This challenge has no questions.");
          return c.questions;
        })
      : api.generateQuiz(topic, projectTopic);
    load
      .then((qs) => {
        if (!alive) return;
        if (!Array.isArray(qs) || !qs.length) throw new Error("No questions came back - please try again.");
        setQuestions(qs);
        setTimeLeft(qs.length * SECONDS_PER_QUESTION);
        setPhase((p) => (p === "launching" ? "ready" : p));
      })
      .catch((e) => {
        if (!alive) return;
        setError(e);
        setPhase("error");
      });
    return () => {
      alive = false;
    };
  }, [key, challengeId, topic, projectTopic]);

  // Show the launch screen for at least a beat so it doesn't flash.
  useEffect(() => {
    const t = setTimeout(() => setMinLaunchDone(true), 900);
    return () => clearTimeout(t);
  }, []);
  useEffect(() => {
    if (phase === "ready" && minLaunchDone) setPhase("playing");
  }, [phase, minLaunchDone]);

  const submit = useCallback(async () => {
    if (submittingRef.current) return;
    submittingRef.current = true;
    setPhase("submitting");
    const total = questions.length * SECONDS_PER_QUESTION;
    const used = total - timeLeft;
    const timeTaken = mmss(Math.max(0, used));
    const rows = questions.map((q, i) => {
      const userAnswer = answers[i] ?? null;
      const isCorrect = userAnswer !== null && userAnswer === q.correctAnswer;
      return { question: q.question, userAnswer, correctAnswer: q.correctAnswer, points: isCorrect ? 1 : 0, isCorrect, ...(q.explanation ? { explanation: q.explanation } : {}) };
    });
    try {
      let challenge = null;
      if (challengeId) {
        challenge = await api.submitChallenge(challengeId, { answers: rows, timeTaken });
      } else {
        await api.submitQuiz({ answers: rows, timeLeft, timeTaken, subtopic: topic, role: "Level-2" });
      }
      writeDraft(key, null);
      invalidate(keys.results(), keys.dashboard(), keys.bootstrap(), keys.projects(), `${uidKey("learn:project:")}*`, keys.challenges());
      if (from) invalidate(keys.project(...from.split("/")));
      setOutcome({ rows, timeTaken, challenge });
      setPhase("done");
    } catch (e) {
      submittingRef.current = false;
      if (e.status === 429) {
        toast.error(e.message || "Daily quiz limit reached. Come back tomorrow!");
        writeDraft(key, null);
        navigate(backTo);
        return;
      }
      toast.error(e.message || "Couldn't submit - your answers are saved, try again.");
      setPhase("playing");
    }
  }, [questions, answers, timeLeft, challengeId, topic, key, from, navigate, backTo]);

  // Countdown; auto-submits at zero.
  const submitRef = useRef(submit);
  submitRef.current = submit;
  useEffect(() => {
    if (phase !== "playing") return undefined;
    const t = setInterval(() => {
      setTimeLeft((s) => {
        if (s <= 1) {
          clearInterval(t);
          setTimeout(() => submitRef.current(), 0);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [phase]);

  const saveAndExit = () => {
    writeDraft(key, { questions, answers, index, timeLeft });
    toast.success("Progress saved - pick up where you left off any time this session.");
    navigate(backTo);
  };

  if (phase === "error") {
    return (
      <Page>
        <ErrorState error={error} onRetry={() => window.location.reload()} />
        <div className="mt-4 text-center"><Link to={backTo} className="text-sm font-semibold text-ts-blue hover:underline">← Back</Link></div>
      </Page>
    );
  }
  if (phase === "launching" || phase === "ready") {
    return <Launching topic={topic} challenge={Boolean(challengeId)} ready={phase === "ready"} onSkip={() => phase === "ready" && setPhase("playing")} />;
  }
  if (phase === "done") {
    return <ResultsView topic={topic} outcome={outcome} challengeId={challengeId} backTo={backTo} onRetake={() => window.location.reload()} />;
  }

  const q = questions[index];
  const answeredCount = Object.keys(answers).length;
  const last = index === questions.length - 1;
  return (
    <Page wide>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Link to={backTo} className="inline-flex items-center gap-1.5 rounded-full border border-ts-border bg-white px-3 py-1.5 text-xs font-semibold text-ts-ink shadow-card hover:border-ts-field">
          <LuArrowLeft aria-hidden /> {from ? "Back to roadmap" : challengeId ? "Back to Challenges" : "Back"}
        </Link>
        <Badge tone={challengeId ? "amber" : "blue"} caps>{challengeId ? "Peer challenge" : "Practice quiz"}</Badge>
      </div>
      <div className="grid gap-5 lg:grid-cols-[1fr_300px]">
        <Card className="p-5 sm:p-7">
          <p className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-ts-blue">Question {index + 1} of {questions.length} · {topic}</p>
          <h1 className="mt-3 text-[19px] font-bold leading-snug text-ts-ink sm:text-[21px]">{q.question}</h1>
          <div className="mt-6 space-y-3" role="radiogroup" aria-label="Answer options">
            {q.options.map((opt, i) => {
              const selected = answers[index] === opt;
              return (
                <button
                  key={opt}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => setAnswers((a) => ({ ...a, [index]: opt }))}
                  className={cx(
                    "flex w-full items-center gap-4 rounded-xl border px-4 py-3.5 text-left transition-colors",
                    selected ? "border-ts-blue bg-ts-wash shadow-[0_0_0_1px_rgba(37,99,235,0.35)]" : "border-ts-border bg-white hover:border-ts-field hover:bg-ts-subtle"
                  )}
                >
                  <span className={cx("flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold", selected ? "bg-ts-blue text-white" : "bg-ts-subtle text-ts-muted")}>{String.fromCharCode(65 + i)}</span>
                  <span className={cx("flex-1 text-[14px]", selected ? "font-semibold text-ts-ink" : "text-ts-body")}>{opt}</span>
                  <span className={cx("flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2", selected ? "border-ts-blue" : "border-ts-field")} aria-hidden>
                    {selected && <span className="h-2.5 w-2.5 rounded-full bg-ts-blue" />}
                  </span>
                </button>
              );
            })}
          </div>
          <div className="mt-7 flex flex-wrap items-center justify-between gap-3 border-t border-ts-border pt-5">
            <Button variant="secondary" icon={LuArrowLeft} disabled={index === 0} onClick={() => setIndex(index - 1)}>Previous Question</Button>
            {last ? (
              <Button icon={LuSend} onClick={() => (answeredCount < questions.length ? setConfirmSubmit(true) : submit())} loading={phase === "submitting"}>
                {challengeId ? "Submit Challenge" : "Submit Quiz"}
              </Button>
            ) : (
              <Button variant="navy" iconRight={LuArrowRight} onClick={() => setIndex(index + 1)}>Next Question</Button>
            )}
          </div>
        </Card>

        <aside className="space-y-4">
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-ts-faint">Time remaining</span>
              <LuClock aria-hidden className={timeLeft <= 15 ? "text-red-500" : "text-ts-navy"} />
            </div>
            <p className={cx("mt-1 font-mono text-[32px] font-bold leading-none", timeLeft <= 15 ? "animate-pulse text-red-600" : "text-ts-ink")}>{mmss(timeLeft)}</p>
            <div className="mt-4 flex items-center justify-between text-xs">
              <span className="text-ts-muted">Answered</span>
              <span className="font-bold text-ts-ink">{answeredCount}/{questions.length}</span>
            </div>
            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-200"><div className="h-full rounded-full bg-ts-navy transition-[width]" style={{ width: `${(answeredCount / questions.length) * 100}%` }} /></div>
          </Card>
          <Card className="p-5">
            <p className="text-[11px] font-bold uppercase tracking-wider text-ts-faint">Question navigation</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {questions.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setIndex(i)}
                  className={cx(
                    "inline-flex h-7 min-w-[40px] items-center justify-center gap-1 rounded-md border px-2 text-xs font-bold transition-colors",
                    i === index ? "border-ts-blue bg-ts-blue text-white" : answers[i] !== undefined ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-ts-border bg-white text-ts-muted hover:border-ts-field"
                  )}
                  aria-label={`Question ${i + 1}${answers[i] !== undefined ? ", answered" : ""}`}
                  aria-current={i === index}
                >
                  Q{i + 1}{answers[i] !== undefined && i !== index && <LuSquare aria-hidden className="fill-current text-[8px]" />}
                </button>
              ))}
            </div>
            <Button variant="secondary" size="sm" block icon={LuSave} className="mt-4" onClick={saveAndExit}>Save & Exit</Button>
          </Card>
        </aside>
      </div>
      <ConfirmDialog
        open={confirmSubmit}
        onClose={() => setConfirmSubmit(false)}
        onConfirm={() => { setConfirmSubmit(false); submit(); }}
        tone="navy"
        title="Submit with unanswered questions?"
        description={`You've answered ${answeredCount} of ${questions.length}. Unanswered questions count as incorrect.`}
        confirmLabel="Submit anyway"
      />
    </Page>
  );
}

function Launching({ topic, challenge, ready, onSkip }) {
  return (
    <Page>
      <div className="flex min-h-[60vh] items-center justify-center">
        <Card className="w-full max-w-sm p-8 text-center">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-ts-wash text-3xl text-ts-navy"><LuAtom aria-hidden className="animate-spin [animation-duration:3s]" /></span>
          <p className="mt-4 text-[10px] font-bold uppercase tracking-[0.14em] text-ts-blue">{challenge ? "Initiate peer challenge" : "Preparing practice quiz"}</p>
          <h1 className="mt-1 text-xl font-bold text-ts-ink">{challenge ? "Launching Live Challenge" : "Generating your questions"}</h1>
          <p className="mt-1 text-xs text-ts-muted">{topic}</p>
          <div className="mx-auto mt-5 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
            <div className={cx("h-full rounded-full bg-ts-navy transition-[width] duration-700", ready ? "w-full" : "w-2/3 animate-pulse")} />
          </div>
          <p className="mt-2 text-[11px] text-ts-faint">{ready ? "Ready" : "Launching challenge engine…"}</p>
          <Button variant="secondary" size="xs" className="mt-4" disabled={!ready} onClick={onSkip}>Skip Animation</Button>
        </Card>
      </div>
    </Page>
  );
}

function ResultsView({ topic, outcome, challengeId, backTo, onRetake }) {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("all");
  const [single, setSingle] = useState(null);
  const { rows, timeTaken, challenge } = outcome;
  const correct = rows.filter((r) => r.isCorrect).length;
  const pct = Math.round((correct / rows.length) * 100);
  const shown = useMemo(() => rows.map((r, i) => ({ ...r, i })).filter((r) => filter === "all" || (filter === "wrong" ? !r.isCorrect : r.isCorrect)), [rows, filter]);
  const peerDone = challenge?.status === "completed";

  return (
    <Page wide>
      <div className="grid gap-5 lg:grid-cols-[320px_1fr]">
        {/* Quiz / Session Summary */}
        <Card className="h-fit p-6 text-center lg:sticky lg:top-6">
          <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-ts-navy text-ts-yellow"><LuTrophy aria-hidden className="text-xl" /></span>
          <h1 className="mt-3 text-xl font-bold text-ts-ink">Session Results</h1>
          <p className="mt-1 text-xs text-ts-muted">{topic}</p>
          <Ring percent={pct} />
          <p className="text-[11px] font-semibold uppercase tracking-wider text-ts-faint">{correct}/{rows.length} correct · {timeTaken}</p>
          <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-left">
            <p className="text-[10px] font-bold uppercase tracking-wider text-amber-700">+{correct} points earned</p>
            <p className="text-[11px] text-amber-800/80">{challengeId ? (peerDone ? "Bonus applied for the winner." : "Winner gets double points once your peer finishes.") : "Added to your rewards balance."}</p>
          </div>
          {challengeId && (
            <p className="mt-3 text-xs font-semibold text-ts-body">
              {peerDone ? (challenge.winner === "tie" ? "It's a tie!" : "Both players finished - see the comparison on the Challenges page.") : "Waiting for your peer to play."}
            </p>
          )}
          <div className="mt-5 space-y-2">
            <Button block icon={LuShieldCheck} onClick={() => navigate(backTo)}>RETURN TO WORKSPACE</Button>
            {!challengeId && <Button block variant="secondary" icon={LuRotateCcw} onClick={onRetake}>Retake Quiz</Button>}
            <Button block variant="navy" icon={LuChartColumn} onClick={() => navigate(`${B}/results`)}>View All Results</Button>
          </div>
        </Card>

        {/* Quiz / Question Review */}
        <div className="min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-[11px] font-bold uppercase tracking-[0.12em] text-ts-faint">Question analysis</h2>
            <div className="flex gap-1.5">
              {[["all", `All Questions (${rows.length})`], ["wrong", `Incorrect (${rows.length - correct})`], ["right", `Correct (${correct})`]].map(([v, label]) => (
                <button key={v} type="button" onClick={() => { setFilter(v); setSingle(null); }} className={cx("inline-flex h-7 items-center gap-1 rounded-md border px-2.5 text-[11px] font-semibold", filter === v ? "border-ts-deep bg-ts-deep text-white" : "border-ts-border bg-white text-ts-muted hover:text-ts-ink")}>
                  {v === "all" && <LuList aria-hidden />} {label}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {rows.map((r, i) => (
              <button key={i} type="button" onClick={() => setSingle(single === i ? null : i)} className={cx("inline-flex h-7 items-center gap-1 rounded-md border px-2 text-[11px] font-bold", single === i ? "border-ts-blue bg-ts-blue text-white" : r.isCorrect ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-red-200 bg-red-50 text-red-600")}>
                Q{i + 1} {r.isCorrect ? <LuCircleCheck aria-hidden /> : <LuCircleX aria-hidden />}
              </button>
            ))}
          </div>
          <div className="mt-4 space-y-3">
            {(single !== null ? [{ ...rows[single], i: single }] : shown).map((r) => <ReviewItem key={r.i} row={r} />)}
          </div>
        </div>
      </div>
    </Page>
  );
}

export const ReviewItem = ({ row }) => (
  <Card className="p-4 sm:p-5">
    <div className="flex items-start justify-between gap-3">
      <p className="text-[10.5px] font-bold uppercase tracking-[0.1em] text-ts-blue">Question {row.i + 1}</p>
      <Badge tone={row.isCorrect ? "green" : "red"} icon={row.isCorrect ? LuCircleCheck : LuCircleX} caps>{row.isCorrect ? "Correct" : row.userAnswer ? "Incorrect" : "Unanswered"}</Badge>
    </div>
    <p className="mt-1.5 text-[14.5px] font-semibold leading-snug text-ts-ink">{row.question}</p>
    <div className="mt-3 grid gap-2.5 md:grid-cols-2">
      {!row.isCorrect && (
        <div className="rounded-lg border border-red-200 bg-red-50/70 p-3">
          <p className="text-[9.5px] font-bold uppercase tracking-[0.1em] text-red-600">Your answer {row.userAnswer ? "(incorrect)" : ""}</p>
          <p className="mt-1 text-[13px] text-red-800">{row.userAnswer || "No answer given"}</p>
        </div>
      )}
      <div className={cx("rounded-lg border border-emerald-200 bg-emerald-50/70 p-3", row.isCorrect && "md:col-span-2")}>
        <p className="text-[9.5px] font-bold uppercase tracking-[0.1em] text-emerald-700">{row.isCorrect ? "Your answer (correct)" : "Correct answer"}</p>
        <p className="mt-1 text-[13px] font-semibold text-emerald-900">{row.correctAnswer}</p>
      </div>
    </div>
    {row.explanation && <p className="mt-3 rounded-lg bg-ts-subtle p-3 text-[12.5px] leading-relaxed text-ts-body"><span className="font-semibold text-ts-ink">Explanation: </span>{row.explanation}</p>}
  </Card>
);

const Ring = ({ percent }) => {
  const r = 46;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative mx-auto my-5 h-32 w-32">
      <svg viewBox="0 0 110 110" className="h-full w-full -rotate-90">
        <circle cx="55" cy="55" r={r} fill="none" stroke="#E2E8F0" strokeWidth="10" />
        <circle cx="55" cy="55" r={r} fill="none" stroke={percent >= 70 ? "#10B981" : percent >= 40 ? "#F59E0B" : "#EF4444"} strokeWidth="10" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - percent / 100)} className="transition-[stroke-dashoffset] duration-700" />
      </svg>
      <span className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[28px] font-extrabold text-ts-ink">{percent}%</span>
        <span className="text-[9px] font-bold uppercase tracking-wider text-ts-faint">Score</span>
      </span>
    </div>
  );
};
