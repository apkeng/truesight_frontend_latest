import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import useCountdown from '../../hooks/useCountdown';
import { attemptPuzzle, getDailyQuestionAttemptStatus, getRandomPuzzle } from '../../utils/apiServices';
import { api, keys } from '../../revamp/lib/api';
import { invalidate } from '../../revamp/lib/query';
import TSModal, { TSButton } from './TSModal';

const Loading = () => (
  <div className="skeleton-shimmer" style={{ height: '120px', borderRadius: '12px' }} aria-label="Loading" />
);

const ErrorText = ({ children }) => (
  <p style={{ fontSize: '13px', color: '#DC2626', fontWeight: 600 }}>{children}</p>
);

/** Today's question, one attempt per day; +5 points when right. */
export function DailyQuestionModal({ onClose }) {
  const [state, setState] = useState({ loading: true });
  const [choice, setChoice] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let alive = true;
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
  }, []);

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
    <TSModal
      eyebrow="Daily question"
      title="Today's quick question"
      onClose={onClose}
      maxWidth={560}
      footerNote="One attempt per day · a correct answer earns 5 points"
      footer={
        result ? (
          <TSButton onClick={onClose}>Done</TSButton>
        ) : (
          <TSButton variant="blue" disabled={!choice || state.loading} busy={submitting} onClick={submit}>Submit answer</TSButton>
        )
      }
    >
      {state.loading ? (
        <Loading />
      ) : state.error ? (
        <ErrorText>{state.error.message}</ErrorText>
      ) : (
        <>
          <p style={{ fontSize: '15px', fontWeight: 700, color: '#0B1A2B', lineHeight: 1.5 }}>{question?.question}</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {(question?.options || []).map((opt, i) => {
              const isRight = result && opt.trim() === (result.correctAnswer || '').trim();
              const isWrongPick = result && opt === choice && !result.isCorrect;
              const picked = !result && choice === opt;
              return (
                <button
                  key={opt}
                  type="button"
                  disabled={Boolean(result)}
                  onClick={() => setChoice(opt)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    textAlign: 'left',
                    fontSize: '13px',
                    fontWeight: picked ? 700 : 500,
                    color: '#1E293B',
                    cursor: result ? 'default' : 'pointer',
                    border: isRight ? '1px solid #A7F3D0' : isWrongPick ? '1px solid #FECACA' : picked ? '2px solid #2563EB' : '1px solid #E2E8F0',
                    background: isRight ? '#ECFDF5' : isWrongPick ? '#FEF2F2' : picked ? '#EFF6FF' : '#F8FAFC',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <span style={{ width: '22px', height: '22px', borderRadius: '50%', border: '1.5px solid currentColor', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 800, flexShrink: 0 }}>
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span style={{ flex: 1 }}>{opt}</span>
                  {isRight && <span style={{ color: '#059669', fontWeight: 800 }}>✓</span>}
                  {isWrongPick && <span style={{ color: '#DC2626', fontWeight: 800 }}>✕</span>}
                </button>
              );
            })}
          </div>
          {result && (
            <div
              style={{
                padding: '10px 14px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 600,
                background: result.isCorrect ? '#ECFDF5' : '#F8FAFC',
                color: result.isCorrect ? '#047857' : '#475569',
                borderLeft: `4px solid ${result.isCorrect ? '#10B981' : '#2563EB'}`
              }}
            >
              {result.isCorrect
                ? result.coinsAwarded
                  ? `Nice! +${result.coinsAwarded} points added.`
                  : "Correct - you've already collected today's points."
                : 'Not this time - come back tomorrow for a new one.'}
            </div>
          )}
        </>
      )}
    </TSModal>
  );
}

/** Word Quest riddle: 60 s per riddle, +10 points for each riddle's first solve. */
export function WordQuestModal({ onClose }) {
  const [puzzle, setPuzzle] = useState(null);
  const [error, setError] = useState(null);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = () => {
    setPuzzle(null);
    setError(null);
    setAnswer('');
    setFeedback(null);
    getRandomPuzzle().then(setPuzzle).catch(setError);
  };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(load, []);

  const secondsLeft = useCountdown(puzzle?.timeLimitSeconds, puzzle?.sessionId);
  const timedOut = !feedback?.correct && (secondsLeft === 0 || Boolean(feedback?.expired));
  const locked = Boolean(feedback?.correct) || timedOut;

  const submit = async (e) => {
    e?.preventDefault();
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

  const low = secondsLeft !== null && secondsLeft <= 10;
  return (
    <TSModal
      eyebrow="Word quest"
      title="Solve the riddle"
      onClose={onClose}
      maxWidth={560}
      footerNote="1 minute per riddle · first solve earns 10 points"
      footer={
        <>
          <TSButton variant="secondary" onClick={load}>Different riddle</TSButton>
          <TSButton variant="blue" onClick={submit} busy={busy} disabled={!puzzle || locked || !answer.trim()}>Check</TSButton>
        </>
      }
    >
      {error ? (
        <ErrorText>{error.message}</ErrorText>
      ) : !puzzle ? (
        <Loading />
      ) : (
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {secondsLeft !== null && !feedback?.correct && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '13px', fontWeight: 800, fontVariantNumeric: 'tabular-nums', color: timedOut ? '#DC2626' : low ? '#D97706' : '#0B1A2B' }}>
                {timedOut ? "Time's up" : `0:${String(secondsLeft).padStart(2, '0')}`}
              </span>
              <div style={{ flex: 1, height: '6px', borderRadius: '999px', background: '#E2E8F0', overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    width: `${(secondsLeft / puzzle.timeLimitSeconds) * 100}%`,
                    background: low ? '#F59E0B' : '#2563EB',
                    borderRadius: '999px',
                    transition: 'width 0.3s linear'
                  }}
                />
              </div>
            </div>
          )}
          <blockquote
            style={{
              margin: 0,
              whiteSpace: 'pre-line',
              background: '#FBFAF7',
              border: '1px solid #E2DDD3',
              borderRadius: '12px',
              padding: '16px',
              fontSize: '13.5px',
              fontStyle: 'italic',
              lineHeight: 1.6,
              color: '#1E293B'
            }}
          >
            {puzzle.poem}
          </blockquote>
          <input
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Your answer"
            disabled={locked}
            autoFocus
            style={{
              height: '42px',
              borderRadius: '10px',
              border: '1px solid #D6E1F9',
              padding: '0 14px',
              fontSize: '14px',
              fontFamily: 'var(--font-primary)',
              outline: 'none',
              background: locked ? '#F8FAFC' : '#FFFFFF'
            }}
          />
          {timedOut ? (
            <ErrorText>Time's up for this riddle - try a different one.</ErrorText>
          ) : (
            feedback && (
              <p style={{ fontSize: '13px', fontWeight: 700, color: feedback.correct ? '#047857' : '#DC2626' }}>
                {feedback.correct
                  ? feedback.pointsAwarded
                    ? `Correct - +${feedback.pointsAwarded} points!`
                    : 'Correct! (already solved before, no new points)'
                  : 'Not quite - try again.'}
              </p>
            )
          )}
        </form>
      )}
    </TSModal>
  );
}
