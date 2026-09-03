import React, { useCallback, useEffect, useState } from "react";
import { IoMdClose } from "react-icons/io";
import { MdExtension, MdCheckCircle } from "react-icons/md";
import clsx from "clsx";
import { getRandomPuzzle, attemptPuzzle } from "../../utils/apiServices";
import { Button } from "../ui";

/**
 * Full-screen gate shown the instant a project-creation request fires.
 * Offers a choice between a difficult riddle-poem (solve it for +10 points)
 * or returning to the dashboard, while `status`/`result`/`error` (from
 * useProjectCreation) report on the request running in the background.
 */
const PuzzleGate = ({ open, status, result, error, onDismiss, onViewProject }) => {
  const [mode, setMode] = useState("choice"); // choice | puzzle
  const [puzzle, setPuzzle] = useState(null);
  const [puzzleLoading, setPuzzleLoading] = useState(false);
  const [puzzleError, setPuzzleError] = useState(null);
  const [answer, setAnswer] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [attemptFeedback, setAttemptFeedback] = useState(null); // { correct, points } | null
  const [solved, setSolved] = useState(false);

  useEffect(() => {
    if (!open) {
      // Reset for the next time the gate opens.
      setMode("choice");
      setPuzzle(null);
      setAnswer("");
      setAttemptFeedback(null);
      setSolved(false);
      setPuzzleError(null);
    }
  }, [open]);

  const fetchPuzzle = useCallback(async () => {
    setPuzzleLoading(true);
    setPuzzleError(null);
    setAnswer("");
    setAttemptFeedback(null);
    setSolved(false);
    try {
      const p = await getRandomPuzzle();
      setPuzzle(p);
    } catch (err) {
      setPuzzleError(err.message || "Could not load a puzzle. Please try again.");
    } finally {
      setPuzzleLoading(false);
    }
  }, []);

  const handleAttemptPuzzle = () => {
    setMode("puzzle");
    fetchPuzzle();
  };

  const handleSubmitAnswer = async (e) => {
    e.preventDefault();
    if (!puzzle || !answer.trim() || submitting || solved) return;
    setSubmitting(true);
    setAttemptFeedback(null);
    try {
      const res = await attemptPuzzle(puzzle.id, answer.trim());
      if (res.correct) {
        setSolved(true);
        setAttemptFeedback({
          correct: true,
          points: res.alreadySolved ? 0 : res.pointsAwarded || 10,
          alreadySolved: res.alreadySolved,
        });
      } else {
        setAttemptFeedback({ correct: false });
      }
    } catch (err) {
      setAttemptFeedback({ correct: false, error: err.message || "Could not check your answer." });
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  const isPending = status === "pending";
  const isDone = status === "done";
  const isErrored = status === "error";

  return (
    <div className="fixed inset-0 z-[150] overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-ink/60" onClick={onDismiss} />

        <div className="relative w-full max-w-lg border border-line bg-white">
          <button
            onClick={onDismiss}
            aria-label="Go back to dashboard"
            className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center border border-line bg-white text-ink-muted transition-colors hover:text-ink"
          >
            <IoMdClose className="text-xl" />
          </button>

          {/* Background creation status — always visible so the outcome is
              never hidden behind the puzzle screen. */}
          <div
            className={clsx(
              "flex items-center gap-3 border-b border-line-soft px-6 py-4",
              isDone ? "bg-emerald-50" : isErrored ? "bg-red-50" : "bg-navy-wash"
            )}
          >
            {isPending && (
              <div className="flex gap-1">
                <div className="h-1.5 w-1.5 rounded-full bg-navy animate-pulse" />
                <div className="h-1.5 w-1.5 rounded-full bg-navy animate-pulse [animation-delay:-0.15s]" />
                <div className="h-1.5 w-1.5 rounded-full bg-navy animate-pulse [animation-delay:-0.3s]" />
              </div>
            )}
            {isDone && <MdCheckCircle className="text-lg text-emerald-600" />}
            <p
              className={clsx(
                "text-[11px] font-semibold uppercase tracking-[0.14em]",
                isDone ? "text-emerald-700" : isErrored ? "text-red-600" : "text-navy"
              )}
            >
              {isPending && "Generating your roadmap in the background…"}
              {isDone && "Your roadmap is ready"}
              {isErrored && "Roadmap generation failed"}
            </p>

            {isDone && (
              <Button size="sm" className="ml-auto" onClick={() => onViewProject(result)}>
                View project
              </Button>
            )}
            {isErrored && (
              <span className="ml-auto text-[11px] text-red-600">
                {error?.message || "Please try again from the dashboard."}
              </span>
            )}
          </div>

          <div className="p-6">
            {mode === "choice" && (
              <div className="pt-1 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center bg-navy text-xl text-white">
                  <MdExtension />
                </div>
                <h3 className="mt-4 font-display text-xl font-bold text-ink">
                  While your roadmap is being built&hellip;
                </h3>
                <p className="mx-auto mt-2 max-w-sm text-xs leading-relaxed text-ink-muted">
                  Attempt a difficult puzzle for 10 points, or head back to the dashboard —
                  we'll let you know the moment your project is ready either way.
                </p>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
                  <Button onClick={handleAttemptPuzzle}>
                    <MdExtension className="text-sm" /> Attempt a puzzle
                  </Button>
                  <Button variant="secondary" onClick={onDismiss}>
                    Go to dashboard
                  </Button>
                </div>
              </div>
            )}

            {mode === "puzzle" && (
              <div className="pt-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-lg font-bold text-ink">A puzzle while you wait</h3>
                  <span className="border border-navy/30 bg-navy-wash px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-navy">
                    Hard
                  </span>
                </div>
                <p className="mt-1 text-xs text-ink-muted">
                  Solve it for +10 points. Your roadmap keeps generating in the background.
                </p>

                <div className="mt-5 border border-line bg-parchment p-6">
                  {puzzleLoading ? (
                    <div className="flex justify-center gap-1 py-6">
                      <div className="h-1.5 w-1.5 rounded-full bg-navy animate-pulse" />
                      <div className="h-1.5 w-1.5 rounded-full bg-navy animate-pulse [animation-delay:-0.15s]" />
                      <div className="h-1.5 w-1.5 rounded-full bg-navy animate-pulse [animation-delay:-0.3s]" />
                    </div>
                  ) : puzzleError ? (
                    <p className="text-center text-xs text-red-600">{puzzleError}</p>
                  ) : (
                    <p className="whitespace-pre-line text-center font-display text-sm italic leading-relaxed text-ink">
                      {puzzle?.poem}
                    </p>
                  )}
                </div>

                {!solved ? (
                  <form onSubmit={handleSubmitAnswer} className="mt-5 space-y-3">
                    <label
                      htmlFor="puzzle-answer"
                      className="text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-muted"
                    >
                      Your answer
                    </label>
                    <div className="flex gap-2">
                      <input
                        id="puzzle-answer"
                        type="text"
                        value={answer}
                        onChange={(e) => setAnswer(e.target.value)}
                        disabled={puzzleLoading || !puzzle || submitting}
                        placeholder="What am I?"
                        className="h-11 w-full border border-line bg-white px-3 text-sm text-ink outline-none transition-colors placeholder:text-ink-muted focus:border-navy"
                      />
                      <Button
                        type="submit"
                        disabled={puzzleLoading || !puzzle || !answer.trim() || submitting}
                      >
                        {submitting ? "Checking…" : "Submit"}
                      </Button>
                    </div>
                    {attemptFeedback && !attemptFeedback.correct && (
                      <p className="text-xs font-semibold text-red-600">
                        {attemptFeedback.error || "Not quite — read it again."}
                      </p>
                    )}
                    <button
                      type="button"
                      onClick={fetchPuzzle}
                      disabled={puzzleLoading}
                      className="text-[10px] font-semibold uppercase tracking-[0.14em] text-navy transition-colors hover:text-navy-dark disabled:opacity-50"
                    >
                      Try a different puzzle
                    </button>
                  </form>
                ) : (
                  <div className="mt-5 flex items-start gap-3 border border-emerald-200 bg-emerald-50 p-4">
                    <MdCheckCircle className="mt-0.5 text-lg text-emerald-600" />
                    <div>
                      <p className="text-sm font-bold text-emerald-800">
                        {attemptFeedback?.alreadySolved
                          ? "Correct — you'd already solved this one."
                          : `Correct! +${attemptFeedback?.points || 10} points added to your account.`}
                      </p>
                      <p className="mt-1 text-xs text-emerald-700">
                        {isDone
                          ? "Your roadmap is ready above."
                          : isErrored
                          ? "Your roadmap failed to generate — head back to the dashboard to try again."
                          : "Stay here — we'll show your roadmap the moment it's ready."}
                      </p>
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  onClick={onDismiss}
                  className="mt-5 text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-muted transition-colors hover:text-ink"
                >
                  &larr; Go to dashboard instead
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PuzzleGate;
