import React, { useState, useEffect } from 'react';
import Icon from '../design-system/icons';

// Curated 5 Questions extracted from Kerala Building Rules 2025
const CHALLENGE_QUESTIONS = [
  {
    id: 'q-1',
    category: 'DIGITAL GOVERNANCE & PERMITS',
    question: 'An architect is submitting a residential building plan under the new Kerala Building Rules 2025. Instead of visiting the municipal office, they use the K-SMART platform. What is the primary conceptual benefit of this integration?',
    options: [
      { letter: 'A', text: 'It eliminates the need to follow any structural safety codes or building rules.' },
      { letter: 'B', text: 'It ensures transparency, allows real-time tracking, and reduces manual bureaucratic delays.' },
      { letter: 'C', text: 'It allows builders to construct properties without keeping any official government records.' },
      { letter: 'D', text: 'It transfers the local building approval authority directly to the central government.' }
    ],
    correctIndex: 1,
    explanation: 'K-SMART delivers automated rule scrutiny and transparent end-to-end digital tracking, eliminating manual clerical delays in statutory permit approvals.'
  },
  {
    id: 'q-2',
    category: 'PERMIT TIERS & SELF-CERTIFICATION',
    question: 'Under the risk-based permit framework of the 2025 amendments, what built-up area threshold qualifies low-risk residential buildings for registered self-certification?',
    options: [
      { letter: 'A', text: 'Structures with total built-up area up to 300 sq.m certified by registered professionals.' },
      { letter: 'B', text: 'Any commercial complex with a minimum 12-meter road frontage.' },
      { letter: 'C', text: 'High-rise residential buildings exceeding 15 meters in municipal corporation limits.' },
      { letter: 'D', text: 'Properties located exclusively within designated coastal CRZ-1 zones.' }
    ],
    correctIndex: 0,
    explanation: 'Residential plots with built-up areas under 300 sq.m qualify for immediate self-certification through registered architects with deemed approval.'
  },
  {
    id: 'q-3',
    category: 'GEO-TECHNICAL & TOPOGRAPHICAL SAFETY',
    question: 'In ecologically sensitive hilly terrains of Wayanad and Idukki, at what natural terrain gradient does the 2025 code mandate certified slope stability and geotechnical borehole testing?',
    options: [
      { letter: 'A', text: 'Terrain slopes under 10 degrees gradient.' },
      { letter: 'B', text: 'Slopes exceeding 25 degrees gradient prior to foundation excavation.' },
      { letter: 'C', text: 'Only when constructing on flat reclaimed wetland beds.' },
      { letter: 'D', text: 'Voluntary geotechnical clearance recommended but not legally enforced.' }
    ],
    correctIndex: 1,
    explanation: 'Terrain slopes exceeding 25 degrees require mandatory geotechnical investigations and certified retaining wall structural calculations to safeguard against landslide hazards.'
  },
  {
    id: 'q-4',
    category: 'SUSTAINABILITY & WATER MANAGEMENT',
    question: 'What is the statutory rainwater harvesting cistern capacity mandated for new residential constructions with a plot size exceeding 200 sq.m under the updated environmental norms?',
    options: [
      { letter: 'A', text: 'Minimum 50 liters per square meter of effective roof catchment area.' },
      { letter: 'B', text: 'No rainwater harvesting is required if connected to municipal piped water.' },
      { letter: 'C', text: 'A flat 500-liter storage barrel regardless of plot dimensions.' },
      { letter: 'D', text: 'Unfiltered open surface percolation trenches without desilting chambers.' }
    ],
    correctIndex: 0,
    explanation: 'The 2025 rules mandate minimum 50 liters of dedicated rainwater storage or ground recharge capacity per square meter of rooftop catchment area.'
  },
  {
    id: 'q-5',
    category: 'FIRE & LIFE SAFETY COMPLIANCE',
    question: 'For commercial assembly buildings and mixed-use structures exceeding 15 meters in height, what automated life safety infrastructure is now compulsory before obtaining an occupancy certificate?',
    options: [
      { letter: 'A', text: 'Dedicated smoke evacuation shafts and automated central riser booster pumps linked to fire telemetry.' },
      { letter: 'B', text: 'Manual handheld fire extinguishers placed only at the ground floor entrance.' },
      { letter: 'C', text: 'Wooden fire doors without certified two-hour fire endurance ratings.' },
      { letter: 'D', text: 'A single exterior spiral staircase serving all upper floors.' }
    ],
    correctIndex: 0,
    explanation: 'High-occupancy buildings above 15m require synchronized automated fire suppression, monitored smoke management dampers, and direct telemetry dispatch links.'
  }
];

export default function LiveChallenge({
  project,
  subtopic,
  savedSession,
  onSaveAndExit,
  onFinishChallenge,
  onReturnToWorkspace,
  onViewResults
}) {
  // Phase: 'loading' | 'testing' | 'results'
  const [phase, setPhase] = useState('loading');
  const [loadingProgress, setLoadingProgress] = useState(0);

  // Challenge State
  const [currentIndex, setCurrentIndex] = useState(savedSession?.currentIndex || 0);
  const [selectedAnswers, setSelectedAnswers] = useState(savedSession?.selectedAnswers || {});
  const [timerSeconds, setTimerSeconds] = useState(savedSession?.timerSeconds || 25);
  const [isTimerPaused, setIsTimerPaused] = useState(false);

  // Results Review State
  const [activeReviewIndex, setActiveReviewIndex] = useState(0);
  const [reviewViewMode, setReviewViewMode] = useState('inspector'); // 'inspector' | 'matrix'
  const [animatedPoints, setAnimatedPoints] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  );

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const QUESTION_TIME_LIMIT = 25;

  // 1. Sleek TrueSights Continuous Loader (smooth 1.2s transition without broken animation)
  useEffect(() => {
    const startTime = Date.now();
    const duration = 1200;

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, Math.round((elapsed / duration) * 100));
      setLoadingProgress(pct);

      if (pct >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setPhase('testing');
        }, 180);
      }
    }, 25);

    return () => clearInterval(interval);
  }, []);

  // 2. 25-Second Focus Timer
  useEffect(() => {
    if (phase !== 'testing' || isTimerPaused) return;

    const timer = setInterval(() => {
      setTimerSeconds((prev) => {
        if (prev <= 1) {
          handleAutoAdvance();
          return QUESTION_TIME_LIMIT;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [phase, currentIndex, isTimerPaused, selectedAnswers]);

  // Keyboard Shortcuts for testing
  useEffect(() => {
    if (phase !== 'testing') return;

    const handleKeyDown = (e) => {
      const key = e.key.toUpperCase();
      if (key === 'A' || key === '1') handleSelectOption(0);
      if (key === 'B' || key === '2') handleSelectOption(1);
      if (key === 'C' || key === '3') handleSelectOption(2);
      if (key === 'D' || key === '4') handleSelectOption(3);
      if (e.key === 'Enter') handleNextOrSubmit();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [phase, currentIndex, selectedAnswers]);

  // Arrow key navigation for Results review
  useEffect(() => {
    if (phase !== 'results') return;

    const handleReviewKeys = (e) => {
      if (e.key === 'ArrowRight' && activeReviewIndex < CHALLENGE_QUESTIONS.length - 1) {
        setActiveReviewIndex((prev) => prev + 1);
      } else if (e.key === 'ArrowLeft' && activeReviewIndex > 0) {
        setActiveReviewIndex((prev) => prev - 1);
      }
    };

    window.addEventListener('keydown', handleReviewKeys);
    return () => window.removeEventListener('keydown', handleReviewKeys);
  }, [phase, activeReviewIndex]);

  const handleAutoAdvance = () => {
    if (currentIndex < CHALLENGE_QUESTIONS.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setTimerSeconds(QUESTION_TIME_LIMIT);
    } else {
      handleSubmitQuiz();
    }
  };

  const handleSelectOption = (optionIndex) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentIndex]: optionIndex
    }));
  };

  const handleNextOrSubmit = () => {
    if (currentIndex < CHALLENGE_QUESTIONS.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setTimerSeconds(QUESTION_TIME_LIMIT);
    } else {
      handleSubmitQuiz();
    }
  };

  const handleSubmitQuiz = () => {
    setPhase('results');
    let correctCount = 0;
    CHALLENGE_QUESTIONS.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctIndex) {
        correctCount += 1;
      }
    });

    const earnedPoints = correctCount * 5;
    if (onFinishChallenge) {
      onFinishChallenge({
        subtopicId: subtopic?.id,
        score: correctCount,
        total: CHALLENGE_QUESTIONS.length,
        points: earnedPoints
      });
    }

    if (correctCount >= 2) {
      setShowConfetti(true);
    }

    // Points ticker animation
    let count = 0;
    const targetPoints = earnedPoints > 0 ? earnedPoints : 5;
    const ticker = setInterval(() => {
      count += 1;
      setAnimatedPoints(count);
      if (count >= targetPoints) {
        clearInterval(ticker);
      }
    }, 45);
  };

  const handleSaveAndExit = () => {
    if (onSaveAndExit) {
      onSaveAndExit({
        projectId: project?.id,
        subtopicId: subtopic?.id,
        currentIndex,
        selectedAnswers,
        timerSeconds
      });
    }
  };

  const handleRetakeChallenge = () => {
    setSelectedAnswers({});
    setCurrentIndex(0);
    setTimerSeconds(QUESTION_TIME_LIMIT);
    setAnimatedPoints(0);
    setShowConfetti(false);
    setActiveReviewIndex(0);
    setPhase('testing');
  };

  const currentQ = CHALLENGE_QUESTIONS[currentIndex];
  const progressPercent = ((currentIndex + 1) / CHALLENGE_QUESTIONS.length) * 100;
  const isTimerUrgent = timerSeconds <= 5;

  const correctTotal = CHALLENGE_QUESTIONS.filter(
    (q, idx) => selectedAnswers[idx] === q.correctIndex
  ).length;
  const masteryPercentage = Math.round((correctTotal / CHALLENGE_QUESTIONS.length) * 100);

  // Active Review Question for Results Inspector
  const activeReviewQ = CHALLENGE_QUESTIONS[activeReviewIndex];
  const userReviewChoice = selectedAnswers[activeReviewIndex];
  const isReviewCorrect = userReviewChoice === activeReviewQ.correctIndex;
  const chosenReviewOpt = userReviewChoice !== undefined ? activeReviewQ.options[userReviewChoice] : null;
  const correctReviewOpt = activeReviewQ.options[activeReviewQ.correctIndex];

  // SVG Gauge calculations
  const gaugeRadius = 40;
  const gaugeCircumference = 2 * Math.PI * gaugeRadius;
  const gaugeOffset = gaugeCircumference - (masteryPercentage / 100) * gaugeCircumference;

  // =============================================================
  // 1. TRUESIGHTS MINIMAL LIGHT LOADING SCREEN (WITH OFFICIAL LOGO)
  // =============================================================
  if (phase === 'loading') {
    return (
      <div
        style={{
          width: '100%',
          height: isMobile ? '100vh' : '100%',
          position: isMobile ? 'fixed' : 'relative',
          top: isMobile ? 0 : undefined,
          left: isMobile ? 0 : undefined,
          right: isMobile ? 0 : undefined,
          bottom: isMobile ? 0 : undefined,
          zIndex: isMobile ? 9999 : undefined,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--surface-main, #F1F3F8)',
          borderRadius: isMobile ? 0 : 'var(--surface-radius, 21px)',
          border: isMobile ? 'none' : '1px solid var(--surface-border, #ADC3F3)',
          padding: isMobile ? '20px 16px' : '40px',
          boxSizing: 'border-box'
        }}
      >
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: '20px',
            border: '1px solid var(--card-border, #E2E6EF)',
            padding: isMobile ? '28px 20px' : '36px 44px',
            boxShadow: '0 8px 30px rgba(40, 61, 130, 0.08)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            maxWidth: '430px',
            width: '100%',
            boxSizing: 'border-box',
            margin: '0 auto'
          }}
        >
          {/* Official TrueSights Brand Logo */}
          <div
            style={{
              width: '72px',
              height: '72px',
              borderRadius: '20px',
              background: '#FFFFFF',
              border: '1.5px solid #ADC3F3',
              boxShadow: '0 8px 24px rgba(40, 61, 130, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '18px',
              position: 'relative'
            }}
          >
            <img
              src="/assets/truesight-logo-colour-1024 2.png"
              alt="TrueSights"
              style={{
                width: '44px',
                height: '44px',
                objectFit: 'contain',
                animation: 'tsLogoPulse 2s ease-in-out infinite'
              }}
            />
          </div>

          <div
            style={{
              fontSize: '11px',
              fontWeight: 800,
              color: '#4B7EE8',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              fontFamily: 'var(--font-primary)',
              marginBottom: '4px'
            }}
          >
            KNOWLEDGE STACK
          </div>

          <h3
            style={{
              fontSize: '20px',
              fontWeight: 800,
              color: 'var(--heading-text, #1F2537)',
              margin: '0 0 6px 0',
              fontFamily: 'var(--font-primary)',
              letterSpacing: '-0.01em'
            }}
          >
            Launching Live Challenge
          </h3>

          <p
            style={{
              fontSize: '12.5px',
              color: 'var(--secondary-text, #6B7790)',
              margin: '0 0 18px 0',
              fontFamily: 'var(--font-primary)'
            }}
          >
            {subtopic?.title || 'Kerala Building Rules 2025'}
          </p>

          {/* Smooth Continuous Progress Bar */}
          <div
            style={{
              width: '100%',
              height: '6px',
              background: '#EEF2F6',
              borderRadius: '999px',
              overflow: 'hidden'
            }}
          >
            <div
              style={{
                width: `${loadingProgress}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #4B7EE8 0%, #2563EB 100%)',
                borderRadius: '999px',
                transition: 'width 0.1s linear'
              }}
            />
          </div>

          <div
            style={{
              fontSize: '11px',
              color: '#6B7790',
              fontWeight: 600,
              marginTop: '12px',
              fontFamily: 'var(--font-primary)'
            }}
          >
            {loadingProgress < 45
              ? 'Verifying statutory scenario parameters...'
              : loadingProgress < 85
              ? 'Synthesizing automated approval criteria...'
              : 'Launching challenge harness...'}
          </div>
        </div>

        <style>{`
          @keyframes tsLogoPulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.06); }
          }
        `}</style>
      </div>
    );
  }

  // =============================================================
  // 2. LIVE CHALLENGE ASSESSMENT STAGE (UNIFIED CONSOLE)
  // =============================================================
  if (phase === 'testing') {
    const isSelected = (optIdx) => selectedAnswers[currentIndex] === optIdx;

    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          maxHeight: isMobile ? 'none' : '829px',
          display: 'flex',
          flexDirection: 'column',
          background: 'var(--surface-main, #F1F3F8)',
          borderRadius: isMobile ? 0 : 'var(--surface-radius, 21px)',
          border: isMobile ? 'none' : '1px solid var(--surface-border, #ADC3F3)',
          padding: isMobile ? '12px 14px' : '16px 28px',
          boxSizing: 'border-box',
          overflowY: isMobile ? 'auto' : 'hidden',
          overflowX: 'hidden',
          position: 'relative'
        }}
      >
        {/* TOP HEADER: Telemetry Bar (Mobile: Sleek Compact Status Row | Desktop: Full Telemetry Header) */}
        {isMobile ? (
          <div style={{ flexShrink: 0, marginBottom: '10px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '8px',
                marginBottom: '8px'
              }}
            >
              <button
                type="button"
                onClick={handleSaveAndExit}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  background: '#FFFFFF',
                  border: '1px solid #E2E6EF',
                  padding: '5px 12px',
                  borderRadius: '999px',
                  color: 'var(--heading-text, #1F2537)',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontFamily: 'var(--font-primary)',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
                }}
              >
                <Icon name="prevStep" size={11} color="#1F2537" />
                <span>Exit</span>
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                {/* Timer Chip */}
                <div
                  style={{
                    background: isTimerUrgent ? '#FEF2F2' : '#FFFFFF',
                    border: isTimerUrgent ? '1.5px solid #FECACA' : '1px solid #E2E6EF',
                    borderRadius: '8px',
                    padding: '4px 8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <Icon name="calendarOutline" size={12} color={isTimerUrgent ? '#EF4444' : '#4B7EE8'} />
                  <span style={{ fontSize: '11.5px', fontWeight: 800, color: isTimerUrgent ? '#EF4444' : '#1F2537', fontFamily: 'var(--font-primary)' }}>
                    00:{timerSeconds < 10 ? `0${timerSeconds}` : timerSeconds}
                  </span>
                </div>

                {/* Question Chip */}
                <div
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid #E2E6EF',
                    borderRadius: '8px',
                    padding: '4px 8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <Icon name="challenges" size={12} color="#4B7EE8" />
                  <span style={{ fontSize: '11.5px', fontWeight: 800, color: '#1F2537', fontFamily: 'var(--font-primary)' }}>
                    {currentIndex + 1}/{CHALLENGE_QUESTIONS.length}
                  </span>
                </div>

                {/* Points Chip */}
                <div
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid #E2E6EF',
                    borderRadius: '8px',
                    padding: '4px 8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <Icon name="rewardGem" size={12} color="#F59E0B" />
                  <span style={{ fontSize: '11px', fontWeight: 800, color: '#1F2537', fontFamily: 'var(--font-primary)' }}>
                    +25
                  </span>
                </div>
              </div>
            </div>

            <div
              style={{
                width: '100%',
                height: '3px',
                background: '#DCE4F0',
                borderRadius: '999px',
                overflow: 'hidden'
              }}
            >
              <div
                style={{
                  width: `${progressPercent}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #4B7EE8 0%, #2563EB 100%)',
                  borderRadius: '999px',
                  transition: 'width 0.3s ease'
                }}
              />
            </div>
          </div>
        ) : (
          <div style={{ flexShrink: 0, marginBottom: '12px' }}>
            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '16px',
                marginBottom: '10px'
              }}
            >
              <div>
                <button
                  type="button"
                  onClick={handleSaveAndExit}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: '#FFFFFF',
                    border: '1px solid #E2E6EF',
                    padding: '5px 13px',
                    borderRadius: '999px',
                    color: 'var(--heading-text, #1F2537)',
                    fontSize: '11.5px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontFamily: 'var(--font-primary)',
                    marginBottom: '6px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#F8FAFC';
                    e.currentTarget.style.borderColor = '#CBD5E1';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#FFFFFF';
                    e.currentTarget.style.borderColor = '#E2E6EF';
                  }}
                >
                  <Icon name="prevStep" size={12} color="#1F2537" />
                  <span>Save & Exit</span>
                </button>

                <h1
                  style={{
                    fontSize: '22px',
                    fontWeight: 800,
                    color: 'var(--heading-text, #1F2537)',
                    margin: '0 0 2px 0',
                    fontFamily: 'var(--font-primary)',
                    letterSpacing: '-0.02em',
                    lineHeight: 1.1
                  }}
                >
                  Live Challenge
                </h1>

                {/* Subtitle - STRICT: ZERO COLORED DOTS */}
                <div
                  style={{
                    fontSize: '11px',
                    fontWeight: 800,
                    color: '#4B7EE8',
                    letterSpacing: '0.07em',
                    textTransform: 'uppercase',
                    fontFamily: 'var(--font-primary)'
                  }}
                >
                  KNOWLEDGE STACK · {subtopic?.title || 'K-SMART INTEGRATION AND AUTOMATED APPROVALS'}
                </div>
              </div>

              {/* Telemetry Chips (Using only official icon package) */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', width: 'auto', gap: '8px' }}>
                <div
                  style={{
                    background: isTimerUrgent ? '#FEF2F2' : '#FFFFFF',
                    border: isTimerUrgent ? '1.5px solid #FECACA' : '1px solid #E2E6EF',
                    borderRadius: '12px',
                    padding: '7px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
                  }}
                >
                  <Icon name="calendarOutline" size={16} color={isTimerUrgent ? '#EF4444' : '#4B7EE8'} />
                  <div>
                    <div style={{ fontSize: '9px', fontWeight: 800, color: '#8A97A6', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      TIMER
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: 800, color: isTimerUrgent ? '#EF4444' : 'var(--heading-text, #1F2537)', fontFamily: 'var(--font-primary)' }}>
                      00:{timerSeconds < 10 ? `0${timerSeconds}` : timerSeconds}
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid #E2E6EF',
                    borderRadius: '12px',
                    padding: '7px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
                  }}
                >
                  <Icon name="challenges" size={16} color="#4B7EE8" />
                  <div>
                    <div style={{ fontSize: '9px', fontWeight: 800, color: '#8A97A6', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      QUESTION
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--heading-text, #1F2537)', fontFamily: 'var(--font-primary)' }}>
                      {currentIndex + 1} <span style={{ fontSize: '11.5px', color: '#8A97A6' }}>/ {CHALLENGE_QUESTIONS.length}</span>
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid #E2E6EF',
                    borderRadius: '12px',
                    padding: '7px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
                  }}
                >
                  <Icon name="rewardGem" size={15} color="#F59E0B" />
                  <span style={{ fontSize: '12px', fontWeight: 800, color: '#1F2537', fontFamily: 'var(--font-primary)' }}>
                    +25 PTS
                  </span>
                </div>
              </div>
            </div>

            <div
              style={{
                width: '100%',
                height: '4px',
                background: '#DCE4F0',
                borderRadius: '999px',
                overflow: 'hidden'
              }}
            >
              <div
                style={{
                  width: `${progressPercent}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #4B7EE8 0%, #2563EB 100%)',
                  borderRadius: '999px',
                  transition: 'width 0.3s ease'
                }}
              />
            </div>
          </div>
        )}

        {/* UNIFIED ASSESSMENT CONSOLE CARD (Self-Contained & Proportioned) */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            maxWidth: '1000px',
            width: '100%',
            margin: '0 auto',
            background: '#FFFFFF',
            border: '1px solid var(--card-border, #E2E6EF)',
            borderRadius: isMobile ? '14px' : '18px',
            padding: isMobile ? '16px 14px' : '22px 28px',
            boxShadow: '0 6px 24px rgba(40, 61, 130, 0.05)',
            boxSizing: 'border-box',
            overflow: 'hidden'
          }}
        >
          {/* Card Top: Category Tag + Keyboard Hint */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span
                style={{
                  background: 'rgba(75, 126, 232, 0.08)',
                  color: '#4B7EE8',
                  fontSize: '11px',
                  fontWeight: 800,
                  letterSpacing: '0.07em',
                  textTransform: 'uppercase',
                  padding: '3px 10px',
                  borderRadius: '6px',
                  fontFamily: 'var(--font-primary)'
                }}
              >
                {currentQ.category}
              </span>

              {!isMobile && (
                <span style={{ fontSize: '11px', color: '#8A97A6', fontWeight: 600 }}>
                  Press [1-4] or [A-D] to select · [Enter] to advance
                </span>
              )}
            </div>

            {/* Question Statement */}
            <h2
              style={{
                fontSize: isMobile ? '15px' : '17px',
                fontWeight: 700,
                color: 'var(--heading-text, #1F2537)',
                lineHeight: isMobile ? 1.4 : 1.45,
                margin: isMobile ? '0 0 12px 0' : '0 0 16px 0',
                fontFamily: 'var(--font-primary)'
              }}
            >
              {currentQ.question}
            </h2>

            {/* Options List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '8px' : '9px' }}>
              {currentQ.options.map((opt, optIdx) => {
                const checked = isSelected(optIdx);

                return (
                  <div
                    key={opt.letter}
                    onClick={() => handleSelectOption(optIdx)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: isMobile ? '10px' : '14px',
                      padding: isMobile ? '10px 12px' : '11px 16px',
                      borderRadius: '12px',
                      background: checked ? 'rgba(75, 126, 232, 0.07)' : '#FFFFFF',
                      border: checked ? '2px solid #4B7EE8' : '1px solid #E2E6EF',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      boxShadow: checked ? '0 2px 8px rgba(75, 126, 232, 0.12)' : 'none'
                    }}
                    onMouseEnter={(e) => {
                      if (!checked) {
                        e.currentTarget.style.borderColor = '#CBD5E1';
                        e.currentTarget.style.background = '#F8FAFC';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!checked) {
                        e.currentTarget.style.borderColor = '#E2E6EF';
                        e.currentTarget.style.background = '#FFFFFF';
                      }
                    }}
                  >
                    <div
                      style={{
                        width: isMobile ? '26px' : '30px',
                        height: isMobile ? '26px' : '30px',
                        borderRadius: '8px',
                        background: checked ? '#4B7EE8' : '#F1F5F9',
                        color: checked ? '#FFFFFF' : '#475569',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: isMobile ? '11.5px' : '12.5px',
                        fontWeight: 800,
                        fontFamily: 'var(--font-primary)',
                        flexShrink: 0,
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {opt.letter}
                    </div>

                    <div
                      style={{
                        flex: 1,
                        fontSize: isMobile ? '12.5px' : '13px',
                        fontWeight: checked ? 700 : 500,
                        color: checked ? '#101D3B' : 'var(--primary-text, #0F1219)',
                        lineHeight: 1.4,
                        fontFamily: 'var(--font-primary)'
                      }}
                    >
                      {opt.text}
                    </div>

                    {/* Radio Indicator */}
                    <div
                      style={{
                        width: isMobile ? '16px' : '18px',
                        height: isMobile ? '16px' : '18px',
                        borderRadius: '50%',
                        border: checked ? '5px solid #4B7EE8' : '2px solid #CBD5E1',
                        background: '#FFFFFF',
                        flexShrink: 0,
                        transition: 'all 0.15s ease'
                      }}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* INTEGRATED ACTION FOOTER (Docked cleanly at the bottom of the card) */}
          <div
            style={{
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              alignItems: isMobile ? 'stretch' : 'center',
              justifyContent: 'space-between',
              gap: isMobile ? '10px' : '0',
              paddingTop: isMobile ? '10px' : '14px',
              marginTop: isMobile ? '10px' : '14px',
              borderTop: '1px solid #EEF2F6',
              flexShrink: 0
            }}
          >
            {/* Question Quick Pills with Official Icon Status */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflowX: isMobile ? 'auto' : 'visible', WebkitOverflowScrolling: 'touch', paddingBottom: isMobile ? '2px' : 0 }}>
              {CHALLENGE_QUESTIONS.map((_, idx) => {
                const isCurrent = idx === currentIndex;
                const isAnswered = selectedAnswers[idx] !== undefined;

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setCurrentIndex(idx);
                      setTimerSeconds(QUESTION_TIME_LIMIT);
                    }}
                    style={{
                      height: '28px',
                      padding: isCurrent ? '0 12px' : '0 10px',
                      borderRadius: '8px',
                      background: isCurrent ? '#4B7EE8' : isAnswered ? '#ECFDF5' : '#FFFFFF',
                      border: isCurrent ? '1.5px solid #4B7EE8' : isAnswered ? '1px solid #A7F3D0' : '1px solid #CBD5E1',
                      color: isCurrent ? '#FFFFFF' : isAnswered ? '#059669' : '#64748B',
                      fontSize: '11.5px',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontFamily: 'var(--font-primary)',
                      transition: 'all 0.15s ease',
                      flexShrink: 0
                    }}
                  >
                    <span>Q{idx + 1}</span>
                    {isAnswered && !isCurrent && (
                      <Icon name="statusUp" size={10} color="#059669" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Stepper Navigation Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: isMobile ? '100%' : 'auto' }}>
              {currentIndex > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setCurrentIndex((prev) => prev - 1);
                    setTimerSeconds(QUESTION_TIME_LIMIT);
                  }}
                  style={{
                    flex: isMobile ? 1 : 'none',
                    height: isMobile ? '38px' : '40px',
                    padding: '0 16px',
                    background: '#FFFFFF',
                    border: '1px solid #CBD5E1',
                    borderRadius: '10px',
                    color: 'var(--heading-text, #1F2537)',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontFamily: 'var(--font-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <Icon name="prevStep" size={11} color="#1F2537" />
                  <span>Previous</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleNextOrSubmit}
                style={{
                  flex: isMobile ? (currentIndex > 0 ? 1.5 : 1) : 'none',
                  height: isMobile ? '38px' : '40px',
                  padding: isMobile ? '0 16px' : '0 22px',
                  background: '#FEE047',
                  border: '1px solid rgba(0,0,0,0.06)',
                  borderRadius: '10px',
                  color: '#0F1219',
                  fontSize: '12.5px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  fontFamily: 'var(--font-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 2px 8px rgba(254, 224, 71, 0.4)',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#FCD34D';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#FEE047';
                }}
              >
                <span>
                  {currentIndex === CHALLENGE_QUESTIONS.length - 1
                    ? 'Submit Challenge'
                    : 'Next Question'}
                </span>
                <Icon name="nextStep" size={12} color="#0F1219" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =============================================================
  // 3. TRUESIGHTS 2-COLUMN RESULTS DASHBOARD (100% Zero Cut, Zero Scroll)
  // =============================================================
  return (
    <div
      style={{
        width: '100%',
        height: isMobile ? 'auto' : '100%',
        minHeight: isMobile ? '100%' : undefined,
        maxHeight: isMobile ? 'none' : '829px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: isMobile ? 'flex-start' : 'center',
        alignItems: 'center',
        background: 'var(--surface-main, #F1F3F8)',
        borderRadius: isMobile ? '0' : 'var(--surface-radius, 21px)',
        border: isMobile ? 'none' : '1px solid var(--surface-border, #ADC3F3)',
        padding: isMobile ? '12px 10px 40px' : '16px',
        boxSizing: 'border-box',
        overflowY: isMobile ? 'auto' : 'hidden',
        overflowX: 'hidden',
        position: 'relative',
        WebkitOverflowScrolling: 'touch'
      }}
    >
      {/* CELEBRATORY CONFETTI */}
      {showConfetti && (
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 10 }}>
          {[...Array(28)].map((_, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                top: '-10px',
                left: `${(i * 3.5) + Math.random() * 2}%`,
                width: `${Math.floor(Math.random() * 8) + 6}px`,
                height: `${Math.floor(Math.random() * 10) + 6}px`,
                backgroundColor: ['#FEE047', '#4B7EE8', '#10B981', '#F43F5E', '#A855F7', '#38BDF8'][i % 6],
                borderRadius: i % 2 === 0 ? '50%' : '2px',
                opacity: 0.95,
                transform: `rotate(${i * 24}deg)`,
                animation: `tsConfetti ${2 + (i % 3) * 0.4}s cubic-bezier(.25,.46,.45,.94) forwards`
              }}
            />
          ))}
        </div>
      )}

      {/* 2-COLUMN SPLIT RESULTS DASHBOARD (Desktop: 2-column | Mobile: Natural Vertical Flow) */}
      <div
        style={{
          width: '100%',
          maxWidth: '1160px',
          height: isMobile ? 'auto' : '100%',
          maxHeight: isMobile ? 'none' : '780px',
          background: '#FFFFFF',
          borderRadius: isMobile ? '16px' : '20px',
          border: '1px solid var(--card-border, #E2E6EF)',
          boxShadow: '0 8px 32px rgba(40, 61, 130, 0.06)',
          display: isMobile ? 'flex' : 'grid',
          flexDirection: isMobile ? 'column' : undefined,
          gridTemplateColumns: isMobile ? undefined : '290px minmax(0, 1fr)',
          gap: isMobile ? '16px' : '20px',
          padding: isMobile ? '16px 14px' : '20px',
          boxSizing: 'border-box',
          overflow: isMobile ? 'visible' : 'hidden'
        }}
      >
        {/* ======================================================== */}
        {/* LEFT COLUMN: Summary, Score Gauge & Actions */}
        {/* ======================================================== */}
        <div
          style={{
            background: '#F8FAFC',
            border: '1px solid #E2E6EF',
            borderRadius: '16px',
            padding: isMobile ? '16px 14px' : '20px 18px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: isMobile ? 'flex-start' : 'space-between',
            gap: isMobile ? '14px' : undefined,
            boxSizing: 'border-box',
            height: isMobile ? 'auto' : '100%',
            overflow: isMobile ? 'visible' : 'hidden'
          }}
        >
          {/* Header & Emblem */}
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '14px',
                background: '#101D3B',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 10px',
                boxShadow: '0 4px 12px rgba(16, 29, 59, 0.2)'
              }}
            >
              <Icon name="rewards" size={24} color="#FEE047" />
            </div>

            <h2
              style={{
                fontSize: '20px',
                fontWeight: 800,
                color: 'var(--heading-text, #1F2537)',
                margin: '0 0 4px 0',
                fontFamily: 'var(--font-primary)',
                letterSpacing: '-0.02em'
              }}
            >
              Session Results
            </h2>

            <p
              style={{
                fontSize: '11.5px',
                color: 'var(--secondary-text, #6B7790)',
                margin: 0,
                fontFamily: 'var(--font-primary)'
              }}
            >
              {subtopic?.title || 'Kerala Building Rules 2025'}
            </p>
          </div>

          {/* Circular SVG Gauge & Points Box (Mobile: Compact Row | Desktop: Centered Stack) */}
          {isMobile ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '16px',
                margin: '8px 0',
                background: '#FFFFFF',
                borderRadius: '12px',
                padding: '12px 14px',
                border: '1px solid #E2E6EF'
              }}
            >
              {/* SVG Score Gauge (Compact 74px) */}
              <div style={{ position: 'relative', width: '74px', height: '74px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="74" height="74" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
                  <circle
                    cx="50"
                    cy="50"
                    r={gaugeRadius}
                    fill="transparent"
                    stroke="#E2E8F0"
                    strokeWidth="9"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r={gaugeRadius}
                    fill="transparent"
                    stroke={masteryPercentage >= 80 ? '#10B981' : masteryPercentage >= 50 ? '#4B7EE8' : '#F59E0B'}
                    strokeWidth="9"
                    strokeDasharray={gaugeCircumference}
                    strokeDashoffset={gaugeOffset}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset 0.8s ease' }}
                  />
                </svg>
                <div style={{ position: 'absolute', textAlign: 'center' }}>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--heading-text, #1F2537)', fontFamily: 'var(--font-primary)', lineHeight: 1 }}>
                    {masteryPercentage}%
                  </div>
                  <div style={{ fontSize: '8px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: '2px' }}>
                    SCORE
                  </div>
                </div>
              </div>

              {/* Stats column next to gauge */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#334155', fontFamily: 'var(--font-primary)' }}>
                  {correctTotal} of {CHALLENGE_QUESTIONS.length} Correct
                </div>

                <div
                  style={{
                    background: '#FEF3C7',
                    border: '1px solid #FDE68A',
                    borderRadius: '8px',
                    padding: '4px 8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px'
                  }}
                >
                  <Icon name="rewardGem" size={13} color="#D97706" />
                  <span style={{ fontSize: '11px', fontWeight: 800, color: '#B45309', fontFamily: 'var(--font-primary)' }}>
                    +{animatedPoints} PTS EARNED
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', margin: '10px 0' }}>
              {/* SVG Score Gauge */}
              <div style={{ position: 'relative', width: '96px', height: '96px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="96" height="96" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
                  <circle
                    cx="50"
                    cy="50"
                    r={gaugeRadius}
                    fill="transparent"
                    stroke="#E2E8F0"
                    strokeWidth="8"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r={gaugeRadius}
                    fill="transparent"
                    stroke={masteryPercentage >= 80 ? '#10B981' : masteryPercentage >= 50 ? '#4B7EE8' : '#F59E0B'}
                    strokeWidth="8"
                    strokeDasharray={gaugeCircumference}
                    strokeDashoffset={gaugeOffset}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset 0.8s ease' }}
                  />
                </svg>
                <div style={{ position: 'absolute', textAlign: 'center' }}>
                  <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--heading-text, #1F2537)', fontFamily: 'var(--font-primary)', lineHeight: 1 }}>
                    {masteryPercentage}%
                  </div>
                  <div style={{ fontSize: '9px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: '2px' }}>
                    MASTERY
                  </div>
                </div>
              </div>

              <div style={{ fontSize: '12px', fontWeight: 700, color: '#475569', fontFamily: 'var(--font-primary)' }}>
                {correctTotal} of {CHALLENGE_QUESTIONS.length} Questions Correct
              </div>

              {/* Points Acquired Highlight Banner */}
              <div
                style={{
                  width: '100%',
                  background: '#FFFFFF',
                  border: '1px solid #FDE68A',
                  borderRadius: '12px',
                  padding: '10px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  boxShadow: '0 2px 8px rgba(245, 158, 11, 0.08)',
                  boxSizing: 'border-box'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Icon name="rewardGem" size={17} color="#D97706" />
                  <div>
                    <div style={{ fontSize: '12.5px', fontWeight: 800, color: '#B45309', fontFamily: 'var(--font-primary)' }}>
                      +{animatedPoints} PTS EARNED
                    </div>
                    <div style={{ fontSize: '10px', color: '#92400E', fontWeight: 600 }}>
                      Credited to Student Wallet
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button
              type="button"
              onClick={onReturnToWorkspace}
              style={{
                width: '100%',
                height: '42px',
                background: '#FEE047',
                border: 'none',
                borderRadius: '8px',
                color: '#0F1219',
                fontSize: '12px',
                fontWeight: 800,
                letterSpacing: '0.03em',
                cursor: 'pointer',
                fontFamily: 'var(--font-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 2px 8px rgba(254, 224, 71, 0.4)',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#FCD34D';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#FEE047';
              }}
            >
              <Icon name="rewardGem" size={14} color="#0F1219" />
              <span>RETURN TO WORKSPACE</span>
            </button>

            {isMobile ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%' }}>
                <button
                  type="button"
                  onClick={handleRetakeChallenge}
                  style={{
                    flex: 1,
                    height: '38px',
                    background: '#FFFFFF',
                    border: '1.5px solid #CBD5E1',
                    borderRadius: '8px',
                    color: 'var(--heading-text, #1F2537)',
                    fontSize: '11.5px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontFamily: 'var(--font-primary)',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#F8FAFC';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#FFFFFF';
                  }}
                >
                  Retake Challenge
                </button>

                {onViewResults && (
                  <button
                    type="button"
                    onClick={onViewResults}
                    style={{
                      flex: 1,
                      height: '38px',
                      background: '#0B3A6F',
                      border: 'none',
                      borderRadius: '8px',
                      color: '#FFFFFF',
                      fontSize: '11.5px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      fontFamily: 'var(--font-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '5px',
                      boxShadow: '0 2px 6px rgba(11, 58, 111, 0.25)',
                      transition: 'all 0.15s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#102B52';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#0B3A6F';
                    }}
                  >
                    <Icon name="results" size={12} color="#FFFFFF" />
                    <span>All Results</span>
                  </button>
                )}
              </div>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleRetakeChallenge}
                  style={{
                    width: '100%',
                    height: '38px',
                    background: '#FFFFFF',
                    border: '1.5px solid #CBD5E1',
                    borderRadius: '8px',
                    color: 'var(--heading-text, #1F2537)',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontFamily: 'var(--font-primary)',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#F8FAFC';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#FFFFFF';
                  }}
                >
                  Retake Challenge
                </button>

                {onViewResults && (
                  <button
                    type="button"
                    onClick={onViewResults}
                    style={{
                      width: '100%',
                      height: '38px',
                      background: '#0B3A6F',
                      border: 'none',
                      borderRadius: '8px',
                      color: '#FFFFFF',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      fontFamily: 'var(--font-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      boxShadow: '0 2px 6px rgba(11, 58, 111, 0.25)',
                      transition: 'all 0.15s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#102B52';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#0B3A6F';
                    }}
                  >
                    <Icon name="results" size={14} color="#FFFFFF" />
                    <span>View All Results</span>
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {/* ======================================================== */}
        {/* RIGHT COLUMN: Question Analysis (Single & List Modes with Enhanced Hierarchy) */}
        {/* ======================================================== */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            minWidth: 0,
            width: '100%',
            height: isMobile ? 'auto' : '100%',
            boxSizing: 'border-box',
            overflow: isMobile ? 'visible' : 'hidden'
          }}
        >
          {/* Top Bar with View Mode Switcher and Question Selector */}
          <div
            style={{
              paddingBottom: '10px',
              borderBottom: '1px solid #EEF2F6',
              marginBottom: '10px',
              flexShrink: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}
          >
            {/* Top row: Section title & Segmented Mode Switcher */}
            <div
              style={{
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                alignItems: isMobile ? 'stretch' : 'center',
                justifyContent: 'space-between',
                gap: isMobile ? '10px' : '12px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                <span
                  style={{
                    fontSize: '12px',
                    fontWeight: 800,
                    color: '#4B7EE8',
                    letterSpacing: '0.07em',
                    textTransform: 'uppercase',
                    fontFamily: 'var(--font-primary)'
                  }}
                >
                  QUESTION ANALYSIS
                </span>
                <span style={{ fontSize: '11px', color: '#8A97A6', fontWeight: 600 }}>
                  • Kerala Building Rules 2025
                </span>
              </div>

              {/* Segmented View Mode Switcher */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  background: '#F1F5F9',
                  padding: '3px',
                  borderRadius: '8px',
                  border: '1px solid #E2E8F0',
                  gap: '2px',
                  flexShrink: 0,
                  width: isMobile ? '100%' : 'auto'
                }}
              >
                <button
                  type="button"
                  onClick={() => setReviewViewMode('inspector')}
                  style={{
                    flex: isMobile ? 1 : 'none',
                    padding: '6px 10px',
                    borderRadius: '6px',
                    border: 'none',
                    background: reviewViewMode === 'inspector' ? '#FFFFFF' : 'transparent',
                    color: reviewViewMode === 'inspector' ? '#101D3B' : '#64748B',
                    fontSize: '11.5px',
                    fontWeight: reviewViewMode === 'inspector' ? 800 : 600,
                    cursor: 'pointer',
                    boxShadow: reviewViewMode === 'inspector' ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
                    fontFamily: 'var(--font-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '5px',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <Icon name="card" size={13} color="currentColor" />
                  <span>Single Question</span>
                </button>

                <button
                  type="button"
                  onClick={() => setReviewViewMode('matrix')}
                  style={{
                    flex: isMobile ? 1 : 'none',
                    padding: '6px 10px',
                    borderRadius: '6px',
                    border: 'none',
                    background: reviewViewMode === 'matrix' ? '#FFFFFF' : 'transparent',
                    color: reviewViewMode === 'matrix' ? '#101D3B' : '#64748B',
                    fontSize: '11.5px',
                    fontWeight: reviewViewMode === 'matrix' ? 800 : 600,
                    cursor: 'pointer',
                    boxShadow: reviewViewMode === 'matrix' ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
                    fontFamily: 'var(--font-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '5px',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <Icon name="categoryGrid" size={13} color="currentColor" />
                  <span>All Questions (5)</span>
                </button>
              </div>
            </div>

            {/* Sub-row: Question Quick Pills (in Inspector mode) or Summary Score Badges (in List mode) */}
            <div
              style={{
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                alignItems: isMobile ? 'flex-start' : 'center',
                justifyContent: 'space-between',
                gap: isMobile ? '8px' : '0',
                minWidth: 0
              }}
            >
              {reviewViewMode === 'inspector' ? (
                <>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      overflowX: isMobile ? 'auto' : 'visible',
                      width: isMobile ? '100%' : 'auto',
                      paddingBottom: isMobile ? '3px' : '0',
                      WebkitOverflowScrolling: 'touch'
                    }}
                  >
                    <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 700, marginRight: '3px', flexShrink: 0 }}>
                      Select:
                    </span>
                    {CHALLENGE_QUESTIONS.map((q, idx) => {
                      const isCorrect = selectedAnswers[idx] === q.correctIndex;
                      const isActive = idx === activeReviewIndex;

                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setActiveReviewIndex(idx)}
                          style={{
                            height: '26px',
                            padding: '0 8px',
                            borderRadius: '6px',
                            background: isActive ? '#101D3B' : isCorrect ? '#DCFCE7' : '#FEE2E2',
                            border: isActive ? '1px solid #101D3B' : isCorrect ? '1px solid #86EFAC' : '1px solid #FCA5A5',
                            color: isActive ? '#FFFFFF' : isCorrect ? '#15803D' : '#B91C1C',
                            fontSize: '11px',
                            fontWeight: 800,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '3px',
                            fontFamily: 'var(--font-primary)',
                            transition: 'all 0.15s ease',
                            flexShrink: 0
                          }}
                        >
                          <span>Q{idx + 1}</span>
                          <span>{isCorrect ? '✓' : '✕'}</span>
                        </button>
                      );
                    })}
                  </div>

                  <span style={{ fontSize: '11px', color: '#8A97A6', fontWeight: 600 }}>
                    Question {activeReviewIndex + 1} of {CHALLENGE_QUESTIONS.length}
                  </span>
                </>
              ) : (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 800,
                        padding: '2px 8px',
                        borderRadius: '6px',
                        background: '#DCFCE7',
                        color: '#15803D',
                        fontFamily: 'var(--font-primary)'
                      }}
                    >
                      {correctTotal} Correct
                    </span>
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 800,
                        padding: '2px 8px',
                        borderRadius: '6px',
                        background: CHALLENGE_QUESTIONS.length - correctTotal > 0 ? '#FEE2E2' : '#F1F5F9',
                        color: CHALLENGE_QUESTIONS.length - correctTotal > 0 ? '#B91C1C' : '#64748B',
                        fontFamily: 'var(--font-primary)'
                      }}
                    >
                      {CHALLENGE_QUESTIONS.length - correctTotal} Incorrect
                    </span>
                  </div>

                  <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>
                    Click any question to inspect in detail
                  </span>
                </>
              )}
            </div>
          </div>

          {/* MAIN REVIEW CONTAINER */}
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              minWidth: 0,
              overflow: isMobile ? 'visible' : 'hidden'
            }}
          >
            {reviewViewMode === 'inspector' ? (
              /* FOCUSED SINGLE QUESTION INSPECTOR VIEW */
              <div
                style={{
                  background: '#FFFFFF',
                  border: isReviewCorrect ? '1.5px solid #BBF7D0' : '1.5px solid #FECDD3',
                  borderRadius: '14px',
                  padding: '16px 20px',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  minWidth: 0,
                  boxSizing: 'border-box'
                }}
              >
                {/* Meta Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', minWidth: 0 }}>
                  <span
                    style={{
                      background: 'rgba(75, 126, 232, 0.08)',
                      color: '#4B7EE8',
                      fontSize: '10.5px',
                      fontWeight: 800,
                      letterSpacing: '0.07em',
                      textTransform: 'uppercase',
                      padding: '3px 8px',
                      borderRadius: '4px',
                      fontFamily: 'var(--font-primary)'
                    }}
                  >
                    QUESTION 0{activeReviewIndex + 1} · {activeReviewQ.category}
                  </span>

                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 800,
                      padding: '3px 10px',
                      borderRadius: '999px',
                      background: isReviewCorrect ? '#DCFCE7' : '#FEE2E2',
                      color: isReviewCorrect ? '#15803D' : '#B91C1C',
                      fontFamily: 'var(--font-primary)'
                    }}
                  >
                    {isReviewCorrect ? 'CORRECT (+5 PTS)' : 'INCORRECT (+0 PTS)'}
                  </span>
                </div>

                {/* Prompt */}
                <h3
                  style={{
                    fontSize: '15px',
                    fontWeight: 700,
                    color: 'var(--heading-text, #1F2537)',
                    lineHeight: 1.4,
                    margin: 0,
                    fontFamily: 'var(--font-primary)',
                    minWidth: 0
                  }}
                >
                  {activeReviewQ.question}
                </h3>

                {/* Comparative Answers Cards (Improved Font Hierarchy) */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: 0 }}>
                  {isReviewCorrect ? (
                    /* User Answered Correctly */
                    <div
                      style={{
                        padding: '12px 14px',
                        borderRadius: '10px',
                        background: '#F0FDF4',
                        border: '1.5px solid #86EFAC',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span
                          style={{
                            fontSize: '9.5px',
                            fontWeight: 800,
                            letterSpacing: '0.08em',
                            textTransform: 'uppercase',
                            color: '#15803D',
                            background: '#DCFCE7',
                            padding: '2px 7px',
                            borderRadius: '4px'
                          }}
                        >
                          ✓ YOUR SUBMITTED ANSWER (CORRECT)
                        </span>
                        <span style={{ fontSize: '11px', fontWeight: 800, color: '#166534' }}>
                          Complies with Kerala Rules 2025
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginTop: '3px' }}>
                        <span
                          style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            background: '#10B981',
                            color: '#FFFFFF',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '11.5px',
                            fontWeight: 800,
                            flexShrink: 0
                          }}
                        >
                          {correctReviewOpt.letter}
                        </span>
                        <span
                          style={{
                            fontSize: '14px',
                            fontWeight: 800,
                            color: '#0F1219',
                            lineHeight: 1.4,
                            fontFamily: 'var(--font-primary)'
                          }}
                        >
                          {correctReviewOpt.text}
                        </span>
                      </div>

                      {/* Legal Rule Box */}
                      <div
                        style={{
                          marginTop: '6px',
                          padding: '8px 12px',
                          background: '#FFFFFF',
                          border: '1px solid #A7F3D0',
                          borderLeft: '4px solid #10B981',
                          borderRadius: '6px'
                        }}
                      >
                        <div style={{ fontSize: '9.5px', fontWeight: 800, color: '#166534', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                          Statutory Authority & Rule Rationale:
                        </div>
                        <div style={{ fontSize: '11.5px', color: '#14532D', fontWeight: 500, lineHeight: 1.4, marginTop: '2px', fontFamily: 'var(--font-primary)' }}>
                          {activeReviewQ.explanation}
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* User Answered Incorrectly - Stark Visual Contrast Between Wrong Answer & Right Answer */
                    <>
                      {/* 1. What the user answered (Subdued, Red tone, clear label) */}
                      <div
                        style={{
                          padding: '10px 14px',
                          borderRadius: '10px',
                          background: '#FEF2F2',
                          border: '1.5px solid #FECACA',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '4px'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span
                            style={{
                              fontSize: '9.5px',
                              fontWeight: 800,
                              letterSpacing: '0.08em',
                              textTransform: 'uppercase',
                              color: '#B91C1C',
                              background: '#FEE2E2',
                              padding: '2px 7px',
                              borderRadius: '4px'
                            }}
                          >
                            ✕ YOUR SUBMISSION (INCORRECT)
                          </span>
                          <span style={{ fontSize: '10.5px', fontWeight: 700, color: '#DC2626' }}>
                            Non-Compliant Choice
                          </span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginTop: '2px' }}>
                          <span
                            style={{
                              width: '22px',
                              height: '22px',
                              borderRadius: '50%',
                              background: '#FEE2E2',
                              color: '#B91C1C',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '11px',
                              fontWeight: 800,
                              flexShrink: 0
                            }}
                          >
                            {chosenReviewOpt?.letter || '-'}
                          </span>
                          <span
                            style={{
                              fontSize: '12.5px',
                              fontWeight: 600,
                              color: '#991B1B',
                              lineHeight: 1.35,
                              fontFamily: 'var(--font-primary)'
                            }}
                          >
                            {chosenReviewOpt ? chosenReviewOpt.text : 'No answer submitted (Timer Expired)'}
                          </span>
                        </div>
                      </div>

                      {/* 2. Statutory Correct Answer (High Prominence, Crisp Typography, Green Focus) */}
                      <div
                        style={{
                          padding: '12px 14px',
                          borderRadius: '10px',
                          background: '#F0FDF4',
                          border: '1.5px solid #86EFAC',
                          boxShadow: '0 2px 8px rgba(16, 185, 129, 0.08)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '5px'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span
                            style={{
                              fontSize: '9.5px',
                              fontWeight: 800,
                              letterSpacing: '0.08em',
                              textTransform: 'uppercase',
                              color: '#15803D',
                              background: '#DCFCE7',
                              padding: '2px 7px',
                              borderRadius: '4px'
                            }}
                          >
                            ✓ STATUTORY CORRECT RULING
                          </span>
                          <span style={{ fontSize: '10.5px', fontWeight: 800, color: '#166534' }}>
                            Mandatory Benchmark
                          </span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginTop: '3px' }}>
                          <span
                            style={{
                              width: '24px',
                              height: '24px',
                              borderRadius: '50%',
                              background: '#10B981',
                              color: '#FFFFFF',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '11.5px',
                              fontWeight: 800,
                              flexShrink: 0
                            }}
                          >
                            {correctReviewOpt.letter}
                          </span>
                          <span
                            style={{
                              fontSize: '13.5px',
                              fontWeight: 800,
                              color: '#0F1219',
                              lineHeight: 1.4,
                              fontFamily: 'var(--font-primary)'
                            }}
                          >
                            {correctReviewOpt.text}
                          </span>
                        </div>

                        {/* Statutory Legal citation */}
                        <div
                          style={{
                            marginTop: '5px',
                            padding: '7px 11px',
                            background: '#FFFFFF',
                            border: '1px solid #A7F3D0',
                            borderLeft: '4px solid #10B981',
                            borderRadius: '6px'
                          }}
                        >
                          <div style={{ fontSize: '9px', fontWeight: 800, color: '#166534', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                            Statutory Legal Basis:
                          </div>
                          <div style={{ fontSize: '11.5px', color: '#14532D', fontWeight: 500, lineHeight: 1.4, marginTop: '2px', fontFamily: 'var(--font-primary)' }}>
                            {activeReviewQ.explanation}
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Bottom Navigation Stepper */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '4px' }}>
                  <button
                    type="button"
                    disabled={activeReviewIndex === 0}
                    onClick={() => setActiveReviewIndex((prev) => prev - 1)}
                    style={{
                      padding: '5px 12px',
                      background: '#FFFFFF',
                      border: '1px solid #CBD5E1',
                      borderRadius: '6px',
                      color: activeReviewIndex === 0 ? '#94A3B8' : '#1F2537',
                      fontSize: '11.5px',
                      fontWeight: 700,
                      cursor: activeReviewIndex === 0 ? 'default' : 'pointer',
                      fontFamily: 'var(--font-primary)'
                    }}
                  >
                    ← Previous Question
                  </button>

                  <span style={{ fontSize: '11px', color: '#8A97A6', fontWeight: 600 }}>
                    Use [←] and [→] arrow keys
                  </span>

                  <button
                    type="button"
                    disabled={activeReviewIndex === CHALLENGE_QUESTIONS.length - 1}
                    onClick={() => setActiveReviewIndex((prev) => prev + 1)}
                    style={{
                      padding: '5px 12px',
                      background: '#FFFFFF',
                      border: '1px solid #CBD5E1',
                      borderRadius: '6px',
                      color: activeReviewIndex === CHALLENGE_QUESTIONS.length - 1 ? '#94A3B8' : '#1F2537',
                      fontSize: '11.5px',
                      fontWeight: 700,
                      cursor: activeReviewIndex === CHALLENGE_QUESTIONS.length - 1 ? 'default' : 'pointer',
                      fontFamily: 'var(--font-primary)'
                    }}
                  >
                    Next Question →
                  </button>
                </div>
              </div>
            ) : (
              /* QUICK MATRIX VIEW: All 5 Questions Distributed Evenly, 100% Visible with High-Contrast Hierarchy */
              <div
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '7px',
                  minWidth: 0,
                  overflow: isMobile ? 'visible' : 'hidden',
                  justifyContent: 'flex-start'
                }}
              >
                {CHALLENGE_QUESTIONS.map((q, qIdx) => {
                  const userPick = selectedAnswers[qIdx];
                  const isRight = userPick === q.correctIndex;
                  const chosen = userPick !== undefined ? q.options[userPick] : null;
                  const right = q.options[q.correctIndex];

                  return (
                    <div
                      key={q.id}
                      onClick={() => {
                        setActiveReviewIndex(qIdx);
                        setReviewViewMode('inspector');
                      }}
                      style={{
                        padding: '8px 12px',
                        borderRadius: '10px',
                        background: isRight ? '#F8FDF9' : '#FEF8F8',
                        border: isRight ? '1px solid #BBF7D0' : '1px solid #FECDD3',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px',
                        boxSizing: 'border-box',
                        minWidth: 0,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateX(2px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'none';
                      }}
                    >
                      {/* Row 1: Header with Q Number, Question text, and PTS badge */}
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px', minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flex: 1 }}>
                          <span
                            style={{
                              width: '20px',
                              height: '20px',
                              borderRadius: '5px',
                              background: isRight ? '#DCFCE7' : '#FEE2E2',
                              color: isRight ? '#15803D' : '#B91C1C',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '10.5px',
                              fontWeight: 800,
                              flexShrink: 0
                            }}
                          >
                            Q{qIdx + 1}
                          </span>
                          <span
                            style={{
                              fontSize: '11.5px',
                              fontWeight: 700,
                              color: 'var(--heading-text, #1F2537)',
                              lineHeight: 1.35,
                              minWidth: 0,
                              fontFamily: 'var(--font-primary)'
                            }}
                          >
                            {q.question}
                          </span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                          <span
                            style={{
                              fontSize: '10px',
                              fontWeight: 800,
                              color: isRight ? '#15803D' : '#B91C1C',
                              padding: '1px 7px',
                              borderRadius: '999px',
                              background: isRight ? '#DCFCE7' : '#FEE2E2',
                              fontFamily: 'var(--font-primary)'
                            }}
                          >
                            {isRight ? '+5 PTS' : '0 PTS'}
                          </span>
                          <span style={{ fontSize: '10.5px', color: '#4B7EE8', fontWeight: 700 }}>
                            Inspect →
                          </span>
                        </div>
                      </div>

                      {/* Row 2: Answers comparison with High-Contrast Font Hierarchy */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', paddingLeft: '28px', minWidth: 0 }}>
                        {isRight ? (
                          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', minWidth: 0 }}>
                            <span
                              style={{
                                fontSize: '9px',
                                fontWeight: 800,
                                letterSpacing: '0.06em',
                                textTransform: 'uppercase',
                                color: '#15803D',
                                background: '#DCFCE7',
                                padding: '1px 5px',
                                borderRadius: '3px',
                                flexShrink: 0
                              }}
                            >
                              YOUR ANSWER (CORRECT)
                            </span>
                            <span
                              style={{
                                fontSize: '11.5px',
                                fontWeight: 700,
                                color: '#0F1219',
                                lineHeight: 1.3,
                                minWidth: 0,
                                wordBreak: 'break-word',
                                fontFamily: 'var(--font-primary)'
                              }}
                            >
                              {chosen ? `${chosen.letter}. ${chosen.text}` : ''}
                            </span>
                          </div>
                        ) : (
                          <>
                            {/* User selection: Red tone, medium weight */}
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', minWidth: 0 }}>
                              <span
                                style={{
                                  fontSize: '9px',
                                  fontWeight: 800,
                                  letterSpacing: '0.06em',
                                  textTransform: 'uppercase',
                                  color: '#B91C1C',
                                  background: '#FEE2E2',
                                  padding: '1px 5px',
                                  borderRadius: '3px',
                                  flexShrink: 0
                                }}
                              >
                                YOUR SELECTION
                              </span>
                              <span
                                style={{
                                  fontSize: '11px',
                                  fontWeight: 600,
                                  color: '#991B1B',
                                  lineHeight: 1.3,
                                  minWidth: 0,
                                  wordBreak: 'break-word',
                                  fontFamily: 'var(--font-primary)'
                                }}
                              >
                                {chosen ? `${chosen.letter}. ${chosen.text}` : 'No answer submitted (Timed out)'}
                              </span>
                            </div>

                            {/* Statutory Correct Ruling: Bold, high contrast #0F1219, authoritative */}
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', minWidth: 0 }}>
                              <span
                                style={{
                                  fontSize: '9px',
                                  fontWeight: 800,
                                  letterSpacing: '0.06em',
                                  textTransform: 'uppercase',
                                  color: '#15803D',
                                  background: '#DCFCE7',
                                  padding: '1px 5px',
                                  borderRadius: '3px',
                                  flexShrink: 0
                                }}
                              >
                                STATUTORY CORRECT
                              </span>
                              <span
                                style={{
                                  fontSize: '11.5px',
                                  fontWeight: 800,
                                  color: '#0F1219',
                                  lineHeight: 1.3,
                                  minWidth: 0,
                                  wordBreak: 'break-word',
                                  fontFamily: 'var(--font-primary)'
                                }}
                              >
                                {right.letter}. {right.text}
                              </span>
                            </div>
                          </>
                        )}

                        {/* Legal Reference Note */}
                        <div
                          style={{
                            fontSize: '10px',
                            color: '#64748B',
                            lineHeight: 1.25,
                            fontStyle: 'italic',
                            marginTop: '1px',
                            fontFamily: 'var(--font-primary)',
                            minWidth: 0,
                            wordBreak: 'break-word'
                          }}
                        >
                          Legal Basis: {q.explanation}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes tsConfetti {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(750px) rotate(720deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
