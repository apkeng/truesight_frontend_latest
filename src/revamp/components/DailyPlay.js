import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { LuCircleCheck, LuCircleX, LuSparkles, LuTimer } from "react-icons/lu";
import useCountdown from "../../hooks/useCountdown";
import { getRandomPuzzle, attemptPuzzle, getDailyQuestionAttemptStatus } from "../../utils/apiServices";
import { api, keys } from "../lib/api";
import { invalidate } from "../lib/query";
import { cx } from "../lib/format";
import { Button, Dialog, Input, Spinner } from "../ui";

/** Today's question (Dashboard "Challenges Taken" chip). +5 points when right. */
export function DailyQuestionDialog({ open, onClose }) {
  const [state, setState] = useState({ loading: true });
  const [choice, setChoice] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    let alive = true;
    setState({ loading: true });
    setChoice("");
    Promise.all([api.dailyQuestion(), getDailyQuestionAttemptStatus().catch(() => null)])
      .then(([question, status]) => {
        if (!alive) return;
        if (status?.hasAttempted) {
          setChoice(status.attempt.answer);
          setState({ question, result: { isCorrect: status.attempt.isCorrect, correctAnswer: status.correctAnswer, coinsAwarded: status.attempt.coinsAwarded } });
        } else setState({ question });
      })
      .catch((error) => alive && setState({ error }));
    return () => {
      alive = false;
    };
  }, [open]);

  const submit = async () => {
    setSubmitting(true);
    try {
      const result = await api.answerDailyQuestion(choice);
      setState((s) => ({ ...s, result }));
      if (result.coinsAwarded) {
        toast.success(`Correct! +${result.coinsAwarded} points`);
        invalidate(keys.dashboard(), keys.bootstrap());
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const { question, result } = state;
  return (
    <Dialog
      open={open}
      onClose={onClose}
      eyebrow="Daily question"
      title="Today's quick question"
      description="One attempt per day - a correct answer earns 5 points."
      footer={
        result ? (
          <Button variant="navy" size="sm" onClick={onClose}>Done</Button>
        ) : (
          <Button variant="primary" size="sm" disabled={!choice} loading={submitting} onClick={submit}>Submit answer</Button>
        )
      }
    >
      {state.loading ? (
        <div className="flex justify-center py-10"><Spinner className="text-2xl" /></div>
      ) : state.error ? (
        <p className="text-sm text-red-600">{state.error.message}</p>
      ) : (
        <div>
          <p className="text-[15px] font-semibold leading-relaxed text-ts-ink">{question?.question}</p>
          <div className="mt-4 space-y-2">
            {(question?.options || []).map((opt, i) => {
              const isRight = result && opt.trim() === (result.correctAnswer || "").trim();
              const isWrongPick = result && opt === choice && !result.isCorrect;
              return (
                <button
                  key={opt}
                  type="button"
                  disabled={Boolean(result)}
                  onClick={() => setChoice(opt)}
                  className={cx(
                    "flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left text-sm transition-colors",
                    isRight ? "border-emerald-300 bg-emerald-50 text-emerald-800" : isWrongPick ? "border-red-300 bg-red-50 text-red-700" : choice === opt ? "border-ts-blue bg-ts-wash text-ts-ink" : "border-ts-border hover:border-ts-field"
                  )}
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-current text-[11px] font-bold">{String.fromCharCode(65 + i)}</span>
                  <span className="flex-1">{opt}</span>
                  {isRight && <LuCircleCheck aria-hidden />}
                  {isWrongPick && <LuCircleX aria-hidden />}
                </button>
              );
            })}
          </div>
          {result && (
            <p className={cx("mt-4 text-sm font-semibold", result.isCorrect ? "text-emerald-700" : "text-ts-body")}>
              {result.isCorrect ? `Nice! ${result.coinsAwarded ? `+${result.coinsAwarded} points added.` : "You've already collected today's points."}` : "Not this time - come back tomorrow for a new one."}
            </p>
          )}
        </div>
      )}
    </Dialog>
  );
}

/** Riddle-poem puzzle (same backend as the project-creation puzzle gate). +10 points, 60 s per riddle. */
export function PuzzleDialog({ open, onClose }) {
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

  const secondsLeft = useCountdown(puzzle?.timeLimitSeconds, puzzle?.sessionId);
  const timedOut = !feedback?.correct && (secondsLeft === 0 || Boolean(feedback?.expired));
  const locked = Boolean(feedback?.correct) || timedOut;

  useEffect(() => {
    if (open) load();
  }, [open]);

  const submit = async (e) => {
    e.preventDefault();
    if (!answer.trim() || locked) return;
    setBusy(true);
    try {
      const r = await attemptPuzzle(puzzle.id, answer.trim(), puzzle.sessionId);
      setFeedback(r);
      if (r.correct && r.pointsAwarded) {
        toast.success(`Solved! +${r.pointsAwarded} points`);
        invalidate(keys.dashboard(), keys.bootstrap());
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} eyebrow="Word quest" title="Solve the riddle" description="You have 1 minute per riddle. First correct solve of each riddle earns 10 points.">
      {error ? (
        <p className="text-sm text-red-600">{error.message}</p>
      ) : !puzzle ? (
        <div className="flex justify-center py-10"><Spinner className="text-2xl" /></div>
      ) : (
        <form onSubmit={submit}>
          {secondsLeft !== null && !feedback?.correct && (
            <div className="mb-3 flex items-center justify-between gap-3">
              <span className={cx("inline-flex items-center gap-1.5 text-sm font-semibold tabular-nums", timedOut ? "text-red-600" : secondsLeft <= 10 ? "text-amber-600" : "text-ts-ink")}>
                <LuTimer aria-hidden />
                {timedOut ? "Time's up" : `0:${String(secondsLeft).padStart(2, "0")}`}
              </span>
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-ts-border" aria-hidden>
                <div
                  className={cx("h-full rounded-full transition-[width] duration-300 ease-linear", secondsLeft <= 10 ? "bg-amber-500" : "bg-ts-blue")}
                  style={{ width: `${(secondsLeft / puzzle.timeLimitSeconds) * 100}%` }}
                />
              </div>
            </div>
          )}
          <blockquote className="whitespace-pre-line rounded-xl border border-ts-border bg-ts-subtle p-4 text-sm italic leading-relaxed text-ts-body">{puzzle.poem}</blockquote>
          <div className="mt-4 flex gap-2">
            <Input value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder="Your answer" disabled={locked} />
            <Button type="submit" variant="primary" loading={busy} disabled={locked}>Check</Button>
          </div>
          {timedOut ? (
            <p className="mt-3 flex items-center gap-1.5 text-sm font-semibold text-red-600">
              <LuTimer aria-hidden />
              Time's up for this riddle - try a different one.
            </p>
          ) : feedback && (
            <p className={cx("mt-3 flex items-center gap-1.5 text-sm font-semibold", feedback.correct ? "text-emerald-700" : "text-red-600")}>
              {feedback.correct ? <LuSparkles aria-hidden /> : <LuCircleX aria-hidden />}
              {feedback.correct ? (feedback.pointsAwarded ? `Correct - +${feedback.pointsAwarded} points!` : "Correct! (already solved before, no new points)") : "Not quite - try again."}
            </p>
          )}
          <button type="button" onClick={load} className="mt-4 text-xs font-semibold text-ts-blue hover:underline">Try a different riddle</button>
        </form>
      )}
    </Dialog>
  );
}
