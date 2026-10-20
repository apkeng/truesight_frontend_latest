import React, { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import Icon from '../design-system/icons';
import ModalPortal from './ModalPortal';
import useCountdown from '../../hooks/useCountdown';
import { attemptPuzzle, getRandomPuzzle } from '../../utils/apiServices';
import { api, invalidate, keys } from '../data';
import { useNotifications } from '../notifications';
import { useTS } from '../session';

function PuzzleIcon({ size = 20, color = 'currentColor', style = {} }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={color}
      style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style }}
    >
      <path d="M20.5 11H19V7c0-1.1-.9-2-2-2h-4V3.5C13 2.12 11.88 1 10.5 1S8 2.12 8 3.5V5H4c-1.1 0-1.99.9-1.99 2v3.8H3.5c1.49 0 2.7 1.21 2.7 2.7s-1.21 2.7-2.7 2.7H2V20c0 1.1.9 2 2 2h3.8v-1.5c0-1.49 1.21-2.7 2.7-2.7 1.49 0 2.7 1.21 2.7 2.7V22H17c1.1 0 2-.9 2-2v-4h1.5c1.38 0 2.5-1.12 2.5-2.5s-1.12-2.5-2.5-2.5z" />
    </svg>
  );
}


// Complexity levels accurate to user's legacy screenshot & elevated for TrueSights
const COMPLEXITY_LEVELS = [
  {
    id: 'PRIMARY SCHOOL',
    title: 'PRIMARY SCHOOL',
    subtitle: 'Basic cognitive blocks',
    badge: 'FOUNDATION',
    badgeColor: '#0284C7',
    badgeBg: '#F0F9FF'
  },
  {
    id: 'HIGH SCHOOL',
    title: 'HIGH SCHOOL',
    subtitle: 'Analytical frameworks',
    badge: 'INTERMEDIATE',
    badgeColor: '#0D9488',
    badgeBg: '#F0FDFA'
  },
  {
    id: 'UNDERGRADUATE',
    title: 'UNDERGRADUATE',
    subtitle: 'Scientific methodology',
    badge: 'METHODOLOGY',
    badgeColor: '#4F46E5',
    badgeBg: '#EEF2FF'
  },
  {
    id: 'POSTGRADUATE',
    title: 'POSTGRADUATE',
    subtitle: 'Specialized synthesis',
    badge: 'MASTERY',
    badgeColor: '#7C3AED',
    badgeBg: '#FAF5FF'
  }
];

const SUGGESTED_TOPICS = [
  'Impact of blockchain on digital identity management',
  'Marine auxiliary propulsion & hydrodynamics',
  'Quantum cryptography in financial networks',
  'UX heuristics for generative AI agent interfaces'
];

// The backend's levels of learning, keyed by the complexity tier ids above.
const LEVEL_OF_LEARNING = {
  'PRIMARY SCHOOL': 'Primary School',
  'HIGH SCHOOL': 'High School',
  UNDERGRADUATE: 'Undergraduate',
  POSTGRADUATE: 'Postgraduate'
};
const tierFor = (level) => Object.keys(LEVEL_OF_LEARNING).find((k) => LEVEL_OF_LEARNING[k] === level) || 'UNDERGRADUATE';

/**
 * Create a roadmap, then wait for it: the form starts a background generation
 * job (POST /api/v2/learn/projects/generate); the waiting screen follows that
 * job's real progress and offers Word Quest riddles meanwhile. Closing the
 * modal never stops the job - it ends with a notification either way.
 */
export default function CreateRoadmapModal({ onClose, initialTopic = '', initialLevel = '', source = 'projects' }) {
  const { go } = useTS();
  const { startRoadmap, jobs, refreshJobs } = useNotifications();
  const [createModalStep, setCreateModalStep] = useState('form'); // 'form' | 'waiting_prompt' | 'puzzle'
  const [researchTopic, setResearchTopic] = useState(initialTopic);
  const [complexityLevel, setComplexityLevel] = useState(tierFor(initialLevel));
  const [sending, setSending] = useState(false);
  const [job, setJob] = useState(null);
  const [readyProjectId, setReadyProjectId] = useState(null);
  const puzzleInputRef = useRef(null);

  const canSubmit = researchTopic.trim().length >= 3 && !sending;

  // The job's latest state from the polled jobs list. Finished jobs drop out
  // of that list (it holds pending jobs and recent failures only).
  const liveJob = useMemo(() => (job ? jobs.find((j) => j.id === job.id) : null), [job, jobs]);
  const jobFailed = liveJob?.status === 'failed' ? liveJob.error || 'The AI could not build this roadmap right now. Please try again.' : null;
  const isRoadmapReady = Boolean(readyProjectId);
  const genProgress = isRoadmapReady ? 100 : Math.max(4, Math.min(99, Math.round(liveJob?.progress ?? 4)));

  // Gone from the list without failing = done; find the new project.
  useEffect(() => {
    if (!job || liveJob || readyProjectId) return;
    let alive = true;
    api.projects().then((r) => {
      if (!alive) return;
      const since = new Date(job.createdAt).getTime() - 60_000;
      const made = r.projects.find((p) => p.kind === 'self' && new Date(p.createdAt).getTime() >= since);
      if (made) {
        setReadyProjectId(made.id);
        invalidate(keys.projects(), keys.dashboard());
      }
    }).catch(() => {});
    return () => {
      alive = false;
    };
  }, [job, liveJob, readyProjectId]);

  // While waiting, poll the job a little faster than the notification bell does.
  useEffect(() => {
    if (!job || readyProjectId || jobFailed) return;
    const t = setInterval(() => refreshJobs().catch(() => {}), 4000);
    return () => clearInterval(t);
  }, [job, readyProjectId, jobFailed, refreshJobs]);

  // --- Word Quest riddle while waiting
  const [puzzle, setPuzzle] = useState(null);
  const [puzzleError, setPuzzleError] = useState(null);
  const [puzzleAnswer, setPuzzleAnswer] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [busy, setBusy] = useState(false);
  const secondsLeft = useCountdown(puzzle?.timeLimitSeconds, puzzle?.sessionId);
  const solved = Boolean(feedback?.correct);
  const timedOut = !solved && (secondsLeft === 0 || Boolean(feedback?.expired));
  const locked = !puzzle || solved || timedOut;

  const loadPuzzle = () => {
    setPuzzle(null);
    setPuzzleError(null);
    setPuzzleAnswer('');
    setFeedback(null);
    getRandomPuzzle().then(setPuzzle).catch((e) => setPuzzleError(e.message));
  };

  useEffect(() => {
    if (createModalStep === 'puzzle' && !puzzle && !puzzleError) loadPuzzle();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [createModalStep]);

  useEffect(() => {
    if (createModalStep === 'puzzle' && puzzle && puzzleInputRef.current) puzzleInputRef.current.focus();
  }, [createModalStep, puzzle]);

  const handleStartRoadmapGeneration = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!canSubmit) return;
    setSending(true);
    try {
      const started = await startRoadmap({ topic: researchTopic.trim(), levelOfLearning: LEVEL_OF_LEARNING[complexityLevel], source });
      setJob(started);
      setCreateModalStep('waiting_prompt');
    } catch {
      // startRoadmap already showed why; keep the form open to fix it
    } finally {
      setSending(false);
    }
  };

  const handlePuzzleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!puzzleAnswer.trim() || locked) return;
    setBusy(true);
    try {
      const r = await attemptPuzzle(puzzle.id, puzzleAnswer.trim(), puzzle.sessionId);
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

  const handleNextPuzzle = loadPuzzle;
  const handleCloseModal = onClose;
  const handleGoToDashboard = () => {
    onClose();
    go('dashboard');
  };
  const handleOpenGeneratedProject = () => {
    if (!readyProjectId) return;
    onClose();
    go('workspace', { kind: 'self', id: readyProjectId });
  };

  return (
    <ModalPortal isOpen={true} onClose={handleCloseModal}>
      {/* STEP 1: NEW PROJECT CREATION MODAL */}
      {createModalStep === 'form' && (
        <div
          style={{
            width: '560px',
            maxWidth: '94vw',
            background: '#FFFFFF',
            borderRadius: '20px',
            border: '1.5px solid var(--surface-border, #ADC3F3)',
            boxShadow: '0 24px 60px -10px rgba(40, 61, 130, 0.22), 0 0 0 1px rgba(40, 61, 130, 0.05)',
            overflow: 'hidden',
            animation: 'modalContentPop 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
            position: 'relative'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top Sub-Bar */}
          <div
            style={{
              background: 'linear-gradient(135deg, #F0F4FD 0%, #E8F0FC 100%)',
              borderBottom: '1px solid #D6E1F9',
              height: '50px',
              padding: '0 18px 0 22px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Icon name="aiAutomation" size={17} color="#283D82" />
              <span
                style={{
                  fontFamily: 'var(--font-primary)',
                  fontSize: '11.5px',
                  fontWeight: 800,
                  letterSpacing: '0.08em',
                  color: '#283D82',
                  textTransform: 'uppercase'
                }}
              >
                CREATE NEW RESEARCH PROJECT
              </span>
            </div>

            <button
              type="button"
              onClick={handleCloseModal}
              aria-label="Close dialog"
              style={{
                width: '32px',
                height: '32px',
                background: '#FFFFFF',
                border: '1px solid #D6E1F9',
                borderRadius: '8px',
                color: '#6B7790',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 0,
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#283D82';
                e.currentTarget.style.color = '#283D82';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#D6E1F9';
                e.currentTarget.style.color = '#6B7790';
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          {/* Form Body */}
          <div style={{ padding: '26px 32px 30px 32px' }}>
            <h3
              id="modal-step-title"
              style={{
                fontSize: '22px',
                fontWeight: 800,
                color: '#1F2537',
                fontFamily: 'var(--font-primary)',
                letterSpacing: '-0.02em',
                margin: 0
              }}
            >
              New project
            </h3>
            <p
              style={{
                fontSize: '13px',
                color: '#6B7790',
                fontFamily: 'var(--font-primary)',
                margin: '4px 0 18px 0'
              }}
            >
              AI researches your topic, drafts the modules, then reviews and fact-checks every one. It takes a few minutes - we'll notify you when it's ready.
            </p>

            <form onSubmit={handleStartRoadmapGeneration} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Field 1: RESEARCH TOPIC */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label
                    htmlFor="research-topic-input"
                    style={{
                      fontSize: '11px',
                      fontWeight: 800,
                      color: '#6B7790',
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      fontFamily: 'var(--font-primary)'
                    }}
                  >
                    RESEARCH TOPIC
                  </label>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 600,
                      fontFamily: 'var(--font-primary)',
                      color: researchTopic.length >= 190 ? '#EF4444' : '#9AA3B8'
                    }}
                  >
                    {researchTopic.length}/200
                  </span>
                </div>

                <textarea
                  id="research-topic-input"
                  rows={3}
                  maxLength={200}
                  required
                  placeholder="e.g. Impact of blockchain on digital identity management"
                  value={researchTopic}
                  onChange={(e) => setResearchTopic(e.target.value)}
                  style={{
                    width: '100%',
                    height: '76px',
                    borderRadius: '10px',
                    border: '1.5px solid #CBD5E1',
                    background: '#FFFFFF',
                    padding: '11px 14px',
                    fontSize: '13.5px',
                    color: '#0F1219',
                    fontFamily: 'var(--font-primary)',
                    lineHeight: 1.45,
                    resize: 'none',
                    outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.18s ease, box-shadow 0.18s ease'
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#283D82';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(40, 61, 130, 0.12)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#CBD5E1';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />

                {/* Quick suggestions pills */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '7px' }}>
                  {SUGGESTED_TOPICS.map((sug) => {
                    const shortLabel = sug.split(' ')[0] + ' ' + (sug.split(' ')[1] || '');
                    return (
                      <button
                        key={sug}
                        type="button"
                        onClick={() => setResearchTopic(sug)}
                        style={{
                          background: '#F1F5F9',
                          border: '1px solid #E2E8F0',
                          borderRadius: '6px',
                          padding: '3px 9px',
                          fontSize: '11px',
                          fontWeight: 600,
                          fontFamily: 'var(--font-primary)',
                          color: '#334155',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = '#E2EDFC';
                          e.currentTarget.style.borderColor = '#ADC3F3';
                          e.currentTarget.style.color = '#283D82';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = '#F1F5F9';
                          e.currentTarget.style.borderColor = '#E2E8F0';
                          e.currentTarget.style.color = '#334155';
                        }}
                      >
                        {shortLabel}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Field 2: COMPLEXITY LEVEL */}
              <div>
                <div
                  style={{
                    fontSize: '11px',
                    fontWeight: 800,
                    color: '#6B7790',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    fontFamily: 'var(--font-primary)',
                    marginBottom: '8px'
                  }}
                >
                  COMPLEXITY LEVEL
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {COMPLEXITY_LEVELS.map((level) => {
                    const isSelected = complexityLevel === level.id;
                    return (
                      <div
                        key={level.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => setComplexityLevel(level.id)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            setComplexityLevel(level.id);
                          }
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '10px 14px',
                          borderRadius: '10px',
                          border: isSelected ? '1.5px solid #283D82' : '1.5px solid #E2E6EF',
                          background: isSelected ? '#F4F7FF' : '#FFFFFF',
                          boxShadow: isSelected ? '0 3px 12px rgba(40, 61, 130, 0.08)' : 'none',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <div>
                          <div
                            style={{
                              fontSize: '12px',
                              fontWeight: isSelected ? 800 : 700,
                              color: isSelected ? '#283D82' : '#1F2537',
                              letterSpacing: '0.04em',
                              fontFamily: 'var(--font-primary)'
                            }}
                          >
                            {level.title}
                          </div>
                          <div
                            style={{
                              fontSize: '11px',
                              fontWeight: 500,
                              color: '#6B7790',
                              fontFamily: 'var(--font-primary)',
                              marginTop: '2px'
                            }}
                          >
                            {level.subtitle}
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span
                            style={{
                              fontSize: '9.5px',
                              fontWeight: 800,
                              letterSpacing: '0.06em',
                              color: isSelected ? '#283D82' : '#6B7790',
                              background: isSelected ? '#D6E1F9' : '#F1F5F9',
                              border: '1px solid #D6E1F9',
                              padding: '2px 7px',
                              borderRadius: '6px',
                              fontFamily: 'var(--font-primary)'
                            }}
                          >
                            {level.badge}
                          </span>

                          <div
                            style={{
                              width: '16px',
                              height: '16px',
                              borderRadius: '50%',
                              border: isSelected ? '1.5px solid #283D82' : '1.5px solid #CBD5E1',
                              background: isSelected ? '#283D82' : 'transparent',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            {isSelected && (
                              <div
                                style={{
                                  width: '6px',
                                  height: '6px',
                                  borderRadius: '50%',
                                  background: '#FFFFFF'
                                }}
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Submit CTA */}
              <div style={{ marginTop: '4px' }}>
                <button
                  type="submit"
                  disabled={!canSubmit}
                  style={{
                    width: '100%',
                    height: '46px',
                    borderRadius: '12px',
                    border: 'none',
                    background: !canSubmit ? '#E2E6EF' : '#FEE047',
                    color: !canSubmit ? '#94A3B8' : '#0F1219',
                    fontFamily: 'var(--font-primary)',
                    fontSize: '13px',
                    fontWeight: 800,
                    letterSpacing: '0.04em',
                    cursor: !canSubmit ? 'not-allowed' : 'pointer',
                    boxShadow: !canSubmit ? 'none' : '0 4px 14px rgba(254, 224, 71, 0.35)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    transition: 'all 0.18s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (researchTopic.trim()) {
                      e.currentTarget.style.background = '#FACC15';
                      e.currentTarget.style.transform = 'translateY(-1px)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (researchTopic.trim()) {
                      e.currentTarget.style.background = '#FEE047';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }
                  }}
                >
                  <Icon name="playBold" size={12} color="#0F1219" />
                  <span>{sending ? 'STARTING…' : 'GENERATE PROJECT ROADMAP'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* STEP 2: WAITING PROMPT SCREEN ("While your roadmap is being built...") */}
      {createModalStep === 'waiting_prompt' && (
        <div
          style={{
            width: '600px',
            maxWidth: '94vw',
            background: '#FFFFFF',
            borderRadius: '20px',
            border: '1.5px solid var(--surface-border, #ADC3F3)',
            boxShadow: '0 24px 60px -10px rgba(40, 61, 130, 0.22), 0 0 0 1px rgba(40, 61, 130, 0.05)',
            overflow: 'hidden',
            animation: 'modalContentPop 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
            position: 'relative'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top Sub-Bar with Live Status Communication */}
          <div
            style={{
              background: isRoadmapReady
                ? 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)'
                : 'linear-gradient(135deg, #F0F4FD 0%, #E8F0FC 100%)',
              borderBottom: isRoadmapReady ? '1px solid #A7F3D0' : '1px solid #D6E1F9',
              height: '50px',
              padding: '0 18px 0 22px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              transition: 'all 0.3s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: isRoadmapReady ? '#10B981' : '#283D82',
                  display: 'inline-block',
                  boxShadow: isRoadmapReady
                    ? '0 0 10px rgba(16, 185, 129, 0.6)'
                    : '0 0 8px rgba(40, 61, 130, 0.5)',
                  animation: isRoadmapReady ? 'none' : 'pulseGlow 1.4s infinite'
                }}
              />
              <span
                style={{
                  fontFamily: 'var(--font-primary)',
                  fontSize: '11px',
                  fontWeight: 800,
                  letterSpacing: '0.08em',
                  color: isRoadmapReady ? '#065F46' : '#283D82',
                  textTransform: 'uppercase'
                }}
              >
                {isRoadmapReady ? 'ROADMAP GENERATION COMPLETE' : 'GENERATING YOUR ROADMAP IN THE BACKGROUND'}
              </span>
              <span
                style={{
                  background: isRoadmapReady ? '#059669' : '#283D82',
                  color: isRoadmapReady ? '#FFFFFF' : '#FEE047',
                  borderRadius: '999px',
                  padding: '2px 9px',
                  fontSize: '11px',
                  fontWeight: 800,
                  fontFamily: 'var(--font-primary)'
                }}
              >
                {isRoadmapReady ? '100% READY' : `${genProgress}%`}
              </span>
            </div>

            <button
              type="button"
              onClick={handleCloseModal}
              aria-label="Close dialog"
              style={{
                width: '32px',
                height: '32px',
                background: '#FFFFFF',
                border: '1px solid #D6E1F9',
                borderRadius: '8px',
                color: '#6B7790',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 0,
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#283D82';
                e.currentTarget.style.color = '#283D82';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#D6E1F9';
                e.currentTarget.style.color = '#6B7790';
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          {/* Real-time Smooth Fill Progress Bar Track */}
          <div style={{ width: '100%', height: '4px', background: '#D6E1F9', overflow: 'hidden' }}>
            <div
              style={{
                height: '100%',
                width: `${genProgress}%`,
                background: isRoadmapReady ? '#10B981' : 'linear-gradient(90deg, #283D82 0%, #3B82F6 70%, #FEE047 100%)',
                transition: 'width 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: isRoadmapReady ? '0 0 10px rgba(16, 185, 129, 0.5)' : '0 0 10px rgba(59, 130, 246, 0.5)'
              }}
            />
          </div>

          {/* Modal Body */}
          <div
            style={{
              padding: '32px 34px 34px 34px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center'
            }}
          >
            {/* Center Hero Icon */}
            <div
              style={{
                width: '64px',
                height: '64px',
                background: isRoadmapReady
                  ? 'linear-gradient(135deg, #059669 0%, #047857 100%)'
                  : 'linear-gradient(135deg, #283D82 0%, #1B2956 100%)',
                borderRadius: '18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: isRoadmapReady ? '#FFFFFF' : '#FEE047',
                boxShadow: isRoadmapReady
                  ? '0 8px 24px rgba(5, 150, 105, 0.25)'
                  : '0 8px 24px rgba(40, 61, 130, 0.22)',
                transition: 'all 0.3s ease'
              }}
            >
              {isRoadmapReady ? (
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              ) : (
                <PuzzleIcon size={30} color="#FEE047" />
              )}
            </div>

            <h3
              id="modal-step-title"
              style={{
                fontSize: '22px',
                fontWeight: 800,
                color: '#1F2537',
                fontFamily: 'var(--font-primary)',
                letterSpacing: '-0.02em',
                margin: '18px 0 6px 0'
              }}
            >
              {isRoadmapReady ? 'Your Project Roadmap is Ready!' : 'While your roadmap is being built...'}
            </h3>

            <p
              style={{
                fontSize: '13px',
                color: '#6B7790',
                fontFamily: 'var(--font-primary)',
                lineHeight: 1.5,
                maxWidth: '460px',
                margin: '0 0 20px 0'
              }}
            >
              {isRoadmapReady
                ? `Your roadmap for "${job?.topic}" is researched, fact-checked and ready. Launch it now or try a riddle.`
                : jobFailed
                  ? jobFailed
                  : "Attempt a riddle for 10 points, or head back to the dashboard — we'll let you know the moment your project is ready either way."}
            </p>

            {/* Clean, Focused Progress Card */}
            <div
              style={{
                width: '100%',
                background: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: '14px',
                padding: '16px 18px',
                marginBottom: '20px',
                textAlign: 'left'
              }}
            >
              {/* Topic Header Row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                  <span
                    style={{
                      fontSize: '13px',
                      fontWeight: 700,
                      color: '#1E293B',
                      fontFamily: 'var(--font-primary)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}
                  >
                    {job?.topic || 'Synthesizing Project'}
                  </span>
                  <span
                    style={{
                      fontSize: '9.5px',
                      fontWeight: 800,
                      color: '#283D82',
                      background: '#E0ECFC',
                      padding: '2px 7px',
                      borderRadius: '6px',
                      fontFamily: 'var(--font-primary)',
                      flexShrink: 0
                    }}
                  >
                    {job?.levelOfLearning}
                  </span>
                </div>

                <span
                  style={{
                    fontSize: '12px',
                    fontWeight: 800,
                    color: isRoadmapReady ? '#059669' : '#283D82',
                    fontFamily: 'var(--font-primary)'
                  }}
                >
                  {genProgress}%
                </span>
              </div>

              {/* Clean Smooth Fill Track */}
              <div style={{ width: '100%', height: '6px', background: '#E2E8F0', borderRadius: '999px', overflow: 'hidden', marginBottom: '10px' }}>
                <div
                  style={{
                    height: '100%',
                    width: `${genProgress}%`,
                    background: isRoadmapReady ? '#10B981' : 'linear-gradient(90deg, #283D82 0%, #3B82F6 70%, #FEE047 100%)',
                    borderRadius: '999px',
                    transition: 'width 0.25s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                />
              </div>

              {/* Live Status Indicator */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '11.5px', color: isRoadmapReady ? '#059669' : '#64748B', fontFamily: 'var(--font-primary)' }}>
                <Icon name={isRoadmapReady ? 'checkCircle' : 'aiAutomation'} size={13} color={isRoadmapReady ? '#059669' : '#283D82'} />
                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: isRoadmapReady ? 700 : 500 }}>
                  {isRoadmapReady
                    ? 'All modules compiled and ready for exploration.'
                    : jobFailed
                      ? 'Generation stopped.'
                      : liveJob?.stageMessage || 'Researching your topic and drafting modules in the background...'}
                </span>
              </div>
            </div>

            {/* If Ready: Prominent Yellow CTA + Secondary Options */}
            {isRoadmapReady ? (
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <button
                  type="button"
                  onClick={handleOpenGeneratedProject}
                  style={{
                    width: '100%',
                    height: '48px',
                    background: '#FEE047',
                    color: '#0F1219',
                    border: 'none',
                    borderRadius: '12px',
                    fontFamily: 'var(--font-primary)',
                    fontSize: '13px',
                    fontWeight: 800,
                    letterSpacing: '0.04em',
                    whiteSpace: 'nowrap',
                    cursor: 'pointer',
                    boxShadow: '0 4px 16px rgba(254, 224, 71, 0.45)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#FACC15';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#FEE047';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <Icon name="playBold" size={13} color="#0F1219" />
                  <span>LAUNCH PROJECT WORKSPACE →</span>
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setCreateModalStep('puzzle')}
                    style={{
                      flex: 1,
                      height: '42px',
                      background: '#FFFFFF',
                      border: '1.5px solid #283D82',
                      color: '#283D82',
                      borderRadius: '10px',
                      fontFamily: 'var(--font-primary)',
                      fontSize: '12px',
                      fontWeight: 800,
                      letterSpacing: '0.03em',
                      whiteSpace: 'nowrap',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      transition: 'all 0.15s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#F4F7FF';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#FFFFFF';
                    }}
                  >
                    <PuzzleIcon size={14} color="#283D82" />
                    <span>ATTEMPT A PUZZLE (+10 PTS)</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleGoToDashboard}
                    style={{
                      flex: 1,
                      height: '42px',
                      background: '#F8FAFC',
                      border: '1px solid #E2E8F0',
                      color: '#475569',
                      borderRadius: '10px',
                      fontFamily: 'var(--font-primary)',
                      fontSize: '12px',
                      fontWeight: 700,
                      whiteSpace: 'nowrap',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.15s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#F1F5F9';
                      e.currentTarget.style.color = '#1E293B';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#F8FAFC';
                      e.currentTarget.style.color = '#475569';
                    }}
                  >
                    <span>GO TO DASHBOARD</span>
                  </button>
                </div>
              </div>
            ) : (
              /* While Generating: Two Action Buttons Side by Side */
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '14px', width: '100%' }}>
                <button
                  type="button"
                  onClick={() => setCreateModalStep('puzzle')}
                  style={{
                    flex: 1,
                    height: '46px',
                    background: '#FEE047',
                    color: '#0F1219',
                    border: 'none',
                    borderRadius: '12px',
                    fontFamily: 'var(--font-primary)',
                    fontSize: '12.5px',
                    fontWeight: 800,
                    letterSpacing: '0.04em',
                    whiteSpace: 'nowrap',
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(254, 224, 71, 0.35)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#FACC15';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#FEE047';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <PuzzleIcon size={16} color="#0F1219" />
                  <span>ATTEMPT A PUZZLE (+10 PTS)</span>
                </button>

                <button
                  type="button"
                  onClick={handleGoToDashboard}
                  style={{
                    flex: 1,
                    height: '46px',
                    background: '#FFFFFF',
                    border: '1.5px solid #283D82',
                    color: '#283D82',
                    borderRadius: '12px',
                    fontFamily: 'var(--font-primary)',
                    fontSize: '12.5px',
                    fontWeight: 800,
                    letterSpacing: '0.04em',
                    whiteSpace: 'nowrap',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#F4F7FF';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#FFFFFF';
                  }}
                >
                  <span>GO TO DASHBOARD</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* STEP 3: PUZZLE WHILE YOU WAIT (Elevated TrueSights Riddle Game Screen) */}
      {createModalStep === 'puzzle' && (
        <div
          style={{
            width: '600px',
            maxWidth: '94vw',
            background: '#FFFFFF',
            borderRadius: '20px',
            border: '1.5px solid var(--surface-border, #ADC3F3)',
            boxShadow: '0 24px 60px -10px rgba(40, 61, 130, 0.22), 0 0 0 1px rgba(40, 61, 130, 0.05)',
            overflow: 'hidden',
            animation: 'modalContentPop 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
            position: 'relative'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top Sub-Bar with Live Status & Percentage */}
          <div
            style={{
              background: isRoadmapReady
                ? 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)'
                : 'linear-gradient(135deg, #F0F4FD 0%, #E8F0FC 100%)',
              borderBottom: isRoadmapReady ? '1px solid #A7F3D0' : '1px solid #D6E1F9',
              height: '50px',
              padding: '0 18px 0 22px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              transition: 'all 0.3s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: isRoadmapReady ? '#10B981' : '#283D82',
                  display: 'inline-block',
                  boxShadow: isRoadmapReady
                    ? '0 0 10px rgba(16, 185, 129, 0.6)'
                    : '0 0 8px rgba(40, 61, 130, 0.5)',
                  animation: isRoadmapReady ? 'none' : 'pulseGlow 1.4s infinite'
                }}
              />
              <span
                style={{
                  fontFamily: 'var(--font-primary)',
                  fontSize: '11px',
                  fontWeight: 800,
                  letterSpacing: '0.08em',
                  color: isRoadmapReady ? '#065F46' : '#283D82',
                  textTransform: 'uppercase'
                }}
              >
                {isRoadmapReady ? 'ROADMAP COMPILED & READY' : 'GENERATING YOUR ROADMAP IN THE BACKGROUND'}
              </span>
              <span
                style={{
                  background: isRoadmapReady ? '#059669' : '#283D82',
                  color: isRoadmapReady ? '#FFFFFF' : '#FEE047',
                  borderRadius: '999px',
                  padding: '2px 9px',
                  fontSize: '11px',
                  fontWeight: 800,
                  fontFamily: 'var(--font-primary)'
                }}
              >
                {isRoadmapReady ? '100%' : `${genProgress}%`}
              </span>
            </div>

            <button
              type="button"
              onClick={handleCloseModal}
              aria-label="Close dialog"
              style={{
                width: '32px',
                height: '32px',
                background: '#FFFFFF',
                border: '1px solid #D6E1F9',
                borderRadius: '8px',
                color: '#6B7790',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 0,
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#283D82';
                e.currentTarget.style.color = '#283D82';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#D6E1F9';
                e.currentTarget.style.color = '#6B7790';
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          {/* Real-time Smooth Fill Progress Bar Track */}
          <div style={{ width: '100%', height: '4px', background: '#D6E1F9', overflow: 'hidden' }}>
            <div
              style={{
                height: '100%',
                width: `${genProgress}%`,
                background: isRoadmapReady ? '#10B981' : 'linear-gradient(90deg, #283D82 0%, #3B82F6 70%, #FEE047 100%)',
                transition: 'width 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: isRoadmapReady ? '0 0 10px rgba(16, 185, 129, 0.5)' : '0 0 10px rgba(59, 130, 246, 0.5)'
              }}
            />
          </div>

          {/* Puzzle Content Card Body */}
          <div style={{ padding: '24px 28px 28px 28px' }}>
            {/* Header Row: Title + TrueSights Pill Badges */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
              <div>
                <h3
                  id="modal-step-title"
                  style={{
                    fontSize: '20px',
                    fontWeight: 800,
                    color: '#1F2537',
                    fontFamily: 'var(--font-primary)',
                    letterSpacing: '-0.02em',
                    margin: 0
                  }}
                >
                  A puzzle while you wait
                </h3>
                <p
                  style={{
                    fontSize: '12px',
                    color: '#6B7790',
                    fontFamily: 'var(--font-primary)',
                    margin: '3px 0 0 0'
                  }}
                >
                  Solve it for +10 points in 1 minute. Your roadmap keeps generating in the background.
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                <span
                  style={{
                    border: '1px solid #FECACA',
                    background: '#FEF2F2',
                    color: '#DC2626',
                    fontSize: '10px',
                    fontWeight: 800,
                    letterSpacing: '0.06em',
                    padding: '3px 8px',
                    borderRadius: '7px',
                    fontFamily: 'var(--font-primary)'
                  }}
                >
                  {(puzzle?.difficulty || 'hard').toUpperCase()}
                </span>

                <span
                  style={{
                    border: '1px solid #FDE047',
                    background: '#FEF9C3',
                    color: '#854D0E',
                    fontSize: '10px',
                    fontWeight: 800,
                    letterSpacing: '0.04em',
                    padding: '3px 8px',
                    borderRadius: '7px',
                    fontFamily: 'var(--font-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <Icon name="rewardGem" size={12} color="#D97706" />
                  +10 PTS
                </span>

              </div>
            </div>

            {/* Riddle Container (Clean TrueSights Card with Centered Italic Verses) */}
            <div
              style={{
                background: '#F8FAFC',
                border: '1.5px solid #E2E8F0',
                borderRadius: '14px',
                padding: '24px 22px',
                textAlign: 'center',
                margin: '18px 0 16px 0'
              }}
            >
              <div
                style={{
                  fontFamily: 'var(--font-primary)',
                  fontSize: '14px',
                  fontStyle: 'italic',
                  lineHeight: 1.65,
                  color: '#1F2537',
                  fontWeight: 500
                }}
              >
                {puzzleError ? (
                  <span style={{ color: '#DC2626', fontStyle: 'normal' }}>{puzzleError}</span>
                ) : !puzzle ? (
                  <span style={{ color: '#94A3B8' }}>Loading a riddle…</span>
                ) : (
                  puzzle.poem.split('\n').map((line, idx) => <div key={idx}>{line}</div>)
                )}
              </div>

              {secondsLeft !== null && !solved && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '14px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 800, fontVariantNumeric: 'tabular-nums', color: timedOut ? '#DC2626' : secondsLeft <= 10 ? '#D97706' : '#283D82', fontStyle: 'normal' }}>
                    {timedOut ? "Time's up" : `0:${String(secondsLeft).padStart(2, '0')}`}
                  </span>
                  <div style={{ flex: 1, height: '5px', borderRadius: '999px', background: '#E2E8F0', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${(secondsLeft / (puzzle?.timeLimitSeconds || 60)) * 100}%`, background: secondsLeft <= 10 ? '#F59E0B' : '#2563EB', transition: 'width 0.3s linear' }} />
                  </div>
                </div>
              )}
            </div>

            {/* Answer Form */}
            <form onSubmit={handlePuzzleSubmit}>
              <div style={{ marginBottom: '5px' }}>
                <label
                  htmlFor="puzzle-answer-input"
                  style={{
                    fontSize: '10.5px',
                    fontWeight: 800,
                    color: '#6B7790',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    fontFamily: 'var(--font-primary)'
                  }}
                >
                  YOUR ANSWER: What am I?
                </label>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <input
                  id="puzzle-answer-input"
                  ref={puzzleInputRef}
                  type="text"
                  placeholder="Type your answer..." 
                  value={puzzleAnswer}
                  onChange={(e) => setPuzzleAnswer(e.target.value)}
                  disabled={locked}
                  style={{
                    flex: 1,
                    height: '44px',
                    background: '#FFFFFF',
                    border: '1.5px solid #CBD5E1',
                    borderRadius: '10px',
                    padding: '0 14px',
                    fontSize: '13.5px',
                    fontFamily: 'var(--font-primary)',
                    color: '#0F1219',
                    outline: 'none',
                    transition: 'border-color 0.15s ease'
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = '#283D82')}
                  onBlur={(e) => (e.currentTarget.style.borderColor = '#CBD5E1')}
                />

                <button
                  type="submit"
                  disabled={!puzzleAnswer.trim() || locked}
                  style={{
                    height: '44px',
                    padding: '0 22px',
                    borderRadius: '10px',
                    border: 'none',
                    background:
                      !puzzleAnswer.trim() || locked
                        ? '#E2E6EF'
                        : '#FEE047',
                    color:
                      !puzzleAnswer.trim() || locked
                        ? '#94A3B8'
                        : '#0F1219',
                    fontFamily: 'var(--font-primary)',
                    fontSize: '12px',
                    fontWeight: 800,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    whiteSpace: 'nowrap',
                    cursor:
                      !puzzleAnswer.trim() || locked
                        ? 'not-allowed'
                        : 'pointer',
                    boxShadow:
                      !puzzleAnswer.trim() || locked
                        ? 'none'
                        : '0 3px 10px rgba(254, 224, 71, 0.35)',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {solved ? 'SOLVED ✓' : busy ? 'CHECKING…' : 'SUBMIT'}
                </button>
              </div>
            </form>

            {/* Solved Celebration Box (Offers Next Puzzle immediately) */}
            {solved && (
              <div
                style={{
                  marginTop: '12px',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  background: '#ECFDF5',
                  border: '1.5px solid #A7F3D0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '10px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Icon name="checkCircle" size={16} color="#059669" />
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 800, color: '#065F46', fontFamily: 'var(--font-primary)' }}>
                      Correct!
                    </div>
                    <div style={{ fontSize: '10.5px', color: '#047857', fontFamily: 'var(--font-primary)' }}>
                      {feedback?.pointsAwarded ? `+${feedback.pointsAwarded} points credited to your wallet!` : 'Already solved before - no new points this time.'}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleNextPuzzle}
                  style={{
                    background: '#FEE047',
                    color: '#0F1219',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '6px 12px',
                    fontSize: '11px',
                    fontWeight: 800,
                    fontFamily: 'var(--font-primary)',
                    whiteSpace: 'nowrap',
                    cursor: 'pointer',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.08)'
                  }}
                >
                  NEXT PUZZLE (+10 PTS) →
                </button>
              </div>
            )}

            {/* Feedback Notification (when error) */}
            {(timedOut || (feedback && !feedback.correct)) && (
              <div
                style={{
                  marginTop: '10px',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontFamily: 'var(--font-primary)',
                  background: '#FFFBEB',
                  border: '1px solid #FDE68A',
                  color: '#92400E',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <span>{timedOut ? "Time's up for this riddle - try a different one." : 'Not quite - try again.'}</span>
              </div>
            )}

            {/* Secondary Actions Row */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginTop: '16px',
                paddingTop: '10px',
                borderTop: '1px solid #F1F5F9'
              }}
            >
              <button
                type="button"
                onClick={handleNextPuzzle}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  color: '#283D82',
                  fontSize: '11.5px',
                  fontWeight: 800,
                  letterSpacing: '0.03em',
                  textTransform: 'uppercase',
                  fontFamily: 'var(--font-primary)',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')}
                onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}
              >
                TRY A DIFFERENT PUZZLE
              </button>

              <button
                type="button"
                onClick={handleGoToDashboard}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  color: '#64748B',
                  fontSize: '11.5px',
                  fontWeight: 700,
                  fontFamily: 'var(--font-primary)',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#1F2537')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#64748B')}
              >
                ← GO TO DASHBOARD INSTEAD
              </button>
            </div>

            {/* Subtle Ready Callout at bottom (Guaranteed One-Line Button) */}
            {isRoadmapReady && (
              <div
                style={{
                  marginTop: '14px',
                  padding: '12px 16px',
                  background: '#ECFDF5',
                  border: '1.5px solid #A7F3D0',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '14px'
                }}
              >
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: '12.5px', fontWeight: 800, color: '#065F46', fontFamily: 'var(--font-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Icon name="checkCircle" size={13} color="#059669" />
                    <span>Your project roadmap is ready!</span>
                  </div>
                  <div style={{ fontSize: '11px', color: '#047857', fontFamily: 'var(--font-primary)', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    Roadmap generated for "{job?.topic}".
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleOpenGeneratedProject}
                  style={{
                    background: '#FEE047',
                    color: '#0F1219',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '9px 18px',
                    fontSize: '12px',
                    fontWeight: 800,
                    fontFamily: 'var(--font-primary)',
                    letterSpacing: '0.04em',
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                    minWidth: 'fit-content',
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Icon name="playBold" size={11} color="#0F1219" />
                  <span>OPEN WORKSPACE →</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </ModalPortal>
  );
}
