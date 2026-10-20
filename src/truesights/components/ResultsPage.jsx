import React, { useState, useMemo, useEffect } from 'react';
import Icon from '../design-system/icons';
import ModalPortal from './ModalPortal';

// Exact SVG icons directly extracted from Figma Node 210:54581
const FigmaIcons = {
  // Graduation Cap on 36x36 Navy Square (Node 210:54617)
  graduationCap: (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ borderRadius: '6px', flexShrink: 0 }}>
      <rect width="36" height="36" rx="6" fill="#0B3A6F" />
      <path d="M18.0004 11.875C17.7789 11.875 17.5602 11.9133 17.3524 11.9871L9.68245 14.757C9.42269 14.8527 9.25042 15.0988 9.25042 15.375C9.25042 15.6512 9.42269 15.8973 9.68245 15.993L11.2657 16.5645C10.8172 17.2699 10.5629 18.1039 10.5629 18.9816V19.75C10.5629 20.5266 10.2676 21.3277 9.95316 21.9594C9.77542 22.3148 9.57308 22.6648 9.33792 22.9875C9.25042 23.1051 9.22581 23.2582 9.27503 23.3977C9.32425 23.5371 9.43909 23.641 9.58128 23.6766L11.3313 24.1141C11.4461 24.1441 11.5692 24.1223 11.6703 24.0594C11.7715 23.9965 11.8426 23.8926 11.8645 23.775C12.0996 22.6047 11.9821 21.5547 11.8071 20.8027C11.7196 20.4145 11.602 20.018 11.4379 19.6543V18.9816C11.4379 18.1559 11.7168 17.3766 12.2008 16.7531C12.5535 16.3293 13.0102 15.9875 13.5461 15.777L17.8391 14.0898C18.0633 14.0023 18.3176 14.1117 18.4051 14.3359C18.4926 14.5602 18.3832 14.8145 18.159 14.902L13.866 16.5891C13.527 16.723 13.2289 16.9281 12.9856 17.1797L17.3496 18.7547C17.5575 18.8285 17.7762 18.8668 17.9977 18.8668C18.2192 18.8668 18.4379 18.8285 18.6457 18.7547L26.3184 15.993C26.5782 15.9 26.7504 15.6512 26.7504 15.375C26.7504 15.0988 26.5782 14.8527 26.3184 14.757L18.6485 11.9871C18.4407 11.9133 18.2219 11.875 18.0004 11.875ZM12.7504 22.1562C12.7504 23.1215 15.102 24.125 18.0004 24.125C20.8989 24.125 23.2504 23.1215 23.2504 22.1562L22.8321 18.1805L18.9438 19.5859C18.6403 19.6953 18.3203 19.75 18.0004 19.75C17.6805 19.75 17.3578 19.6953 17.0571 19.5859L13.1688 18.1805L12.7504 22.1562Z" fill="white" />
    </svg>
  ),

  // Base Points Stack of Coins (Node 210:54648)
  basePoints: (
    <svg width="12" height="12" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 1.5625C10 1.91406 9.7207 2.23828 9.25 2.5C8.68164 2.81445 7.83398 3.03711 6.86133 3.10352C6.78906 3.06836 6.7168 3.03516 6.64062 3.00586C5.87109 2.68359 4.84766 2.5 3.75 2.5C3.58789 2.5 3.42969 2.50391 3.27148 2.51172L3.25 2.5C2.7793 2.23828 2.5 1.91406 2.5 1.5625C2.5 0.699219 4.17969 0 6.25 0C8.32031 0 10 0.699219 10 1.5625ZM3.13867 3.14648C3.33789 3.13281 3.54297 3.125 3.75 3.125C4.96484 3.125 6.04297 3.36523 6.72852 3.73828C7.21289 4.00195 7.5 4.33008 7.5 4.6875C7.5 4.76562 7.48633 4.8418 7.45898 4.91602C7.36914 5.17383 7.12695 5.41016 6.77539 5.60938C6.77344 5.61133 6.76953 5.61133 6.76758 5.61328C6.76172 5.61719 6.75586 5.61914 6.75 5.62305C6.06641 6.00195 4.97656 6.24805 3.75 6.24805C2.58594 6.24805 1.54492 6.02734 0.855469 5.67969C0.818359 5.66211 0.783203 5.64258 0.748047 5.62305C0.279297 5.36328 0 5.03906 0 4.6875C0 4.00781 1.04297 3.42773 2.5 3.21484C2.70508 3.18555 2.91797 3.16211 3.13867 3.14648ZM8.125 4.6875C8.125 4.25977 7.91797 3.9082 7.6543 3.64453C8.20703 3.55859 8.71289 3.42188 9.14258 3.24414C9.46094 3.11133 9.75781 2.94727 10 2.74609V3.4375C10 3.81445 9.67773 4.16211 9.14453 4.43164C8.85938 4.57617 8.51172 4.69922 8.12109 4.79297C8.12305 4.75781 8.125 4.72461 8.125 4.68945V4.6875ZM7.5 6.5625C7.5 6.91406 7.2207 7.23828 6.75 7.5C6.71484 7.51953 6.67969 7.53711 6.64258 7.55664C5.95508 7.9043 4.91406 8.125 3.75 8.125C2.52344 8.125 1.43359 7.87891 0.75 7.5C0.279297 7.23828 0 6.91406 0 6.5625V5.87109C0.244141 6.07227 0.539063 6.23633 0.857422 6.36914C1.62891 6.69141 2.65234 6.875 3.75 6.875C4.84766 6.875 5.87109 6.69141 6.64258 6.36914C6.79492 6.30664 6.94141 6.23438 7.08008 6.15625C7.19922 6.08984 7.31055 6.01562 7.41602 5.9375C7.44531 5.91602 7.47266 5.89258 7.5 5.87109V5.9375V6.04883V6.5625ZM8.125 6.5625V5.9375V5.43164C8.49609 5.34961 8.83789 5.24609 9.14258 5.11914C9.46094 4.98633 9.75781 4.82227 10 4.62109V5.3125C10 5.51758 9.90234 5.72266 9.70898 5.91602C9.39062 6.23438 8.83008 6.49609 8.12109 6.66602C8.12305 6.63281 8.125 6.59766 8.125 6.5625ZM3.75 8.75C4.84766 8.75 5.87109 8.56641 6.64258 8.24414C6.96094 8.11133 7.25781 7.94727 7.5 7.74609V8.4375C7.5 9.30078 5.82031 10 3.75 10C1.67969 10 0 9.30078 0 8.4375V7.74609C0.244141 7.94727 0.539063 8.11133 0.857422 8.24414C1.62891 8.56641 2.65234 8.75 3.75 8.75Z" fill="#0B3A6F" />
    </svg>
  ),

  // Time Taken Clock (Node 210:54655)
  timeTaken: (
    <svg width="12" height="12" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M5 0C6.32608 0 7.59785 0.526784 8.53553 1.46447C9.47322 2.40215 10 3.67392 10 5C10 6.32608 9.47322 7.59785 8.53553 8.53553C7.59785 9.47322 6.32608 10 5 10C3.67392 10 2.40215 9.47322 1.46447 8.53553C0.526784 7.59785 0 6.32608 0 5C0 3.67392 0.526784 2.40215 1.46447 1.46447C2.40215 0.526784 3.67392 0 5 0ZM4.53125 2.34375V5C4.53125 5.15625 4.60938 5.30273 4.74023 5.39062L6.61523 6.64062C6.83008 6.78516 7.12109 6.72656 7.26562 6.50977C7.41016 6.29297 7.35156 6.00391 7.13477 5.85938L5.46875 4.75V2.34375C5.46875 2.08398 5.25977 1.875 5 1.875C4.74023 1.875 4.53125 2.08398 4.53125 2.34375Z" fill="#0B3A6F" />
    </svg>
  ),

  // Streak Bonus Flame (Node 210:54662)
  streakBonus: (
    <svg width="11" height="12" viewBox="0 0 9 10" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3.11102 0.105952C3.26335 -0.0366125 3.49966 -0.0346596 3.65199 0.107905C4.191 0.613715 4.69681 1.15858 5.16942 1.74837C5.38424 1.46715 5.62836 1.16054 5.892 0.910561C6.04629 0.766043 6.28454 0.766043 6.43882 0.912514C7.11454 1.55698 7.68675 2.40846 8.08905 3.21698C8.4855 4.01377 8.74915 4.82815 8.74915 5.40231C8.74915 7.89425 6.80012 9.99952 4.37457 9.99952C1.92169 9.99952 0 7.8923 0 5.40036C0 4.65043 0.347622 3.7345 0.886632 2.82834C1.4315 1.90851 2.20096 0.949619 3.11102 0.105952ZM4.40777 8.1247C4.90187 8.1247 5.33932 7.98799 5.75139 7.71458C6.57358 7.14042 6.79426 5.9921 6.30017 5.08984C6.21228 4.91408 5.9877 4.90236 5.86076 5.05078L5.36862 5.62299C5.23972 5.77141 5.00732 5.76751 4.88624 5.61323C4.56401 5.20311 3.98789 4.47076 3.6598 4.05479C3.53676 3.89855 3.30241 3.8966 3.17742 4.05283C2.51733 4.88283 2.18533 5.40622 2.18533 5.99405C2.18729 7.33181 3.17547 8.1247 4.40777 8.1247Z" fill="#0B3A6F" />
    </svg>
  ),

  // Status Verified Checkmark Circle (Node 210:54669)
  verifiedStatus: (
    <svg width="12" height="12" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M5 10C6.32608 10 7.59785 9.47322 8.53553 8.53553C9.47322 7.59785 10 6.32608 10 5C10 3.67392 9.47322 2.40215 8.53553 1.46447C7.59785 0.526784 6.32608 0 5 0C3.67392 0 2.40215 0.526784 1.46447 1.46447C0.526784 2.40215 0 3.67392 0 5C0 6.32608 0.526784 7.59785 1.46447 8.53553C2.40215 9.47322 3.67392 10 5 10ZM7.20703 4.08203L4.70703 6.58203C4.52344 6.76562 4.22656 6.76562 4.04492 6.58203L2.79492 5.33203C2.61133 5.14844 2.61133 4.85156 2.79492 4.66992C2.97852 4.48828 3.27539 4.48633 3.45703 4.66992L4.375 5.58789L6.54297 3.41797C6.72656 3.23438 7.02344 3.23438 7.20508 3.41797C7.38672 3.60156 7.38867 3.89844 7.20508 4.08008L7.20703 4.08203Z" fill="#0B3A6F" />
    </svg>
  ),

  // Calendar Icon for Date
  calendar: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#8A97A6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),

  // Clock Icon for Time
  clock: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#8A97A6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  )
};

// Realistic authentic cards matching Figma node 210:54581 with real 3D book cover thumbnails
const FIGMA_RESULTS_CARDS = [
  {
    id: 'res-1',
    topicKey: 'q-curve',
    topic: 'The I-V Characteristic Curve',
    thumbnail: '/assets/book-mosfet.jpg',
    category: 'Electronic Devices & Physics',
    date: '30 Sept 2026',
    time: '12:33',
    correctNumerator: 3,
    correctDenominator: 5,
    scorePercentage: 60,
    points: 3,
    basePoints: '3 pts',
    timeTaken: '02:01',
    streakBonus: '+0 pts',
    status: 'Verified',
    pillStyle: 'amber'
  },
  {
    id: 'res-2',
    topicKey: 'semi-basics-1',
    topic: 'Semiconductor Basics',
    thumbnail: '/assets/book-circuits.jpg',
    category: 'Solid-State Materials',
    date: '27 Sept 2026',
    time: '09:39',
    correctNumerator: 1,
    correctDenominator: 7,
    scorePercentage: 14,
    points: 1,
    basePoints: '1 pts',
    timeTaken: '02:04',
    streakBonus: '+0 pts',
    status: 'Verified',
    pillStyle: 'red'
  },
  {
    id: 'res-3',
    topicKey: 'semi-basics-2',
    topic: 'Semiconductor Basics',
    thumbnail: '/assets/book-circuits.jpg',
    category: 'Solid-State Materials',
    date: '27 Sept 2026',
    time: '09:39',
    correctNumerator: 1,
    correctDenominator: 6,
    scorePercentage: 17,
    points: 1,
    basePoints: '1 pts',
    timeTaken: '02:04',
    streakBonus: '+0 pts',
    status: 'Verified',
    pillStyle: 'red'
  },
  {
    id: 'res-4',
    topicKey: 'neuro-storage',
    topic: 'Decentralized Storage for Large-Scale Neuroimaging',
    thumbnail: '/assets/book-ux-ai.jpg',
    category: 'Cloud & Bio-Informatics',
    date: '10 May 2026',
    time: '18:11',
    correctNumerator: 0,
    correctDenominator: 255,
    scorePercentage: 0,
    points: 0,
    basePoints: '0 pts',
    timeTaken: '02:30',
    streakBonus: '+0 pts',
    status: 'Verified',
    pillStyle: 'red'
  },
  {
    id: 'res-5',
    topicKey: 'dsp-filters',
    topic: 'Digital Signal Processing & FIR Filters',
    thumbnail: '/assets/book-html.jpg',
    category: 'Signal Processing',
    date: '04 May 2026',
    time: '16:45',
    correctNumerator: 10,
    correctDenominator: 10,
    scorePercentage: 100,
    points: 20,
    basePoints: '10 pts',
    timeTaken: '03:15',
    streakBonus: '+10 pts',
    status: 'Verified',
    pillStyle: 'green'
  },
  {
    id: 'res-6',
    topicKey: 'nuclear-fission',
    topic: 'Nuclear Fission & Reactor Dynamics',
    thumbnail: '/assets/book-nuclear-fission.jpg',
    category: 'Physics & Energy',
    date: '18 Apr 2026',
    time: '14:20',
    correctNumerator: 8,
    correctDenominator: 8,
    scorePercentage: 100,
    points: 16,
    basePoints: '8 pts',
    timeTaken: '02:45',
    streakBonus: '+8 pts',
    status: 'Verified',
    pillStyle: 'green'
  }
];

// Sample questions for the review modal ("Result option for that particular topic")
const SAMPLE_BREAKDOWNS = {
  'q-curve': [
    {
      qNum: 1,
      question: 'What occurs across the depletion region in a silicon PN junction under reverse bias?',
      userAnswer: 'Depletion width increases due to majority carriers retreating from the metallurgical junction',
      correctAnswer: 'Depletion width increases due to majority carriers retreating from the metallurgical junction',
      isCorrect: true,
      explanation: 'Under reverse bias, external negative and positive terminals attract mobile holes and electrons away from the interface.'
    },
    {
      qNum: 2,
      question: 'At room temperature (300K), what is the typical forward knee voltage for a silicon diode?',
      userAnswer: '0.6V to 0.7V',
      correctAnswer: '0.6V to 0.7V',
      isCorrect: true,
      explanation: 'The built-in potential barrier of silicon requires approximately ~0.7V before significant forward injection occurs.'
    },
    {
      qNum: 3,
      question: 'What governs reverse Zener breakdown in heavily doped junctions below 5.6V?',
      userAnswer: 'Quantum mechanical tunneling of valence electrons into the conduction band',
      correctAnswer: 'Quantum mechanical tunneling of valence electrons into the conduction band',
      isCorrect: true,
      explanation: 'Heavily doped junctions create an extremely thin barrier (<10nm) enabling quantum tunneling.'
    },
    {
      qNum: 4,
      question: 'How does thermal leakage current scale with temperature in silicon diodes?',
      userAnswer: 'Decreases linearly with temperature rise',
      correctAnswer: 'Doubles approximately every 10°C temperature increase',
      isCorrect: false,
      explanation: 'Thermal carrier generation rate scales exponentially with temperature.'
    },
    {
      qNum: 5,
      question: 'What is the thermal voltage Vt at 300 Kelvin in the Shockley diode equation?',
      userAnswer: '0.7V',
      correctAnswer: 'Approximately 26 mV (k*T/q)',
      isCorrect: false,
      explanation: 'Vt is defined as (Boltzmann constant * Absolute Temperature) / Elementary charge ≈ 25.85 mV.'
    }
  ],
  'semi-basics-1': [
    {
      qNum: 1,
      question: 'Which dopant element is introduced into intrinsic silicon to create an n-type semiconductor?',
      userAnswer: 'Phosphorus or Arsenic (Group V)',
      correctAnswer: 'Phosphorus or Arsenic (Group V)',
      isCorrect: true,
      explanation: 'Pentavalent Group V atoms have 5 valence electrons. 4 form covalent bonds with silicon, and the 5th electron is free to conduct in the conduction band.'
    },
    {
      qNum: 2,
      question: 'What is the dominant charge carrier in an intrinsic (undoped) semiconductor?',
      userAnswer: 'Electrons only',
      correctAnswer: 'Equal concentrations of thermally generated electrons and holes (ni = pi)',
      isCorrect: false,
      explanation: 'In pure semiconductors, carrier creation is purely thermal, yielding identical densities of free electrons and holes.'
    }
  ]
};

export default function ResultsPage({ onBackToDashboard, onRetakeQuiz }) {
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'full-marks'
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedReviewModal, setSelectedReviewModal] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
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

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      showToast('Results synchronized with academic ledger!');
    }, 600);
  };

  const fullMarksCount = FIGMA_RESULTS_CARDS.filter((c) => c.scorePercentage === 100).length;

  const displayedCards = useMemo(() => {
    let list = FIGMA_RESULTS_CARDS;
    if (activeFilter === 'full-marks') {
      list = list.filter((c) => c.scorePercentage === 100);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((c) => c.topic.toLowerCase().includes(q) || c.category.toLowerCase().includes(q));
    }
    return list;
  }, [activeFilter, searchQuery]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
        maxHeight: '100%',
        boxSizing: 'border-box',
        overflowY: 'auto',
        paddingRight: isMobile ? '0' : '6px',
        gap: isMobile ? '12px' : '20px',
        fontFamily: 'var(--font-primary, "Plus Jakarta Sans", sans-serif)'
      }}
    >
      {/* ======================================================================
          1. TOP HERO BANNER (Pixel-Perfect Match to Figma Node 210:54583)
          ====================================================================== */}
      {/* 1. TOP HERO BANNER (Mobile: Sleek Compact Bar | Desktop: Exact Full Banner) */}
      {isMobile ? (
        <div
          style={{
            background: '#243367',
            borderRadius: '12px',
            padding: '12px 14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '10px',
            flexShrink: 0,
            boxSizing: 'border-box',
            boxShadow: '0 4px 16px rgba(36, 51, 103, 0.12)'
          }}
        >
          <div>
            <h1
              style={{
                fontFamily: 'var(--font-heading, "Space Grotesk", sans-serif)',
                fontSize: '18px',
                fontWeight: 800,
                color: '#FFFFFF',
                margin: 0,
                letterSpacing: '-0.02em',
                lineHeight: '22px'
              }}
            >
              Results
            </h1>
            <p
              style={{
                fontSize: '11px',
                color: 'rgba(255, 255, 255, 0.85)',
                margin: '2px 0 0 0',
                lineHeight: '15px'
              }}
            >
              Track your quiz progress & scores
            </p>
          </div>

          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '8px',
              padding: '6px 12px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
              flexShrink: 0
            }}
          >
            <span style={{ fontSize: '16px', fontWeight: 800, color: '#0B1A2B', fontFamily: 'var(--font-numbers)' }}>
              478
            </span>
            <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: '#8A97A6' }}>
              Attempts
            </span>
          </div>
        </div>
      ) : (
        <div
          style={{
            background: '#243367',
            borderRadius: '14px',
            padding: '32px 38px',
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '20px',
            flexShrink: 0,
            boxSizing: 'border-box',
            boxShadow: '0 4px 16px rgba(36, 51, 103, 0.12)'
          }}
        >
          {/* Left: Heading 1 & Subtitle */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <h1
              style={{
                fontFamily: 'var(--font-heading, "Space Grotesk", sans-serif)',
                fontSize: '32px',
                fontWeight: 800,
                color: '#FFFFFF',
                margin: 0,
                letterSpacing: '-0.02em',
                lineHeight: '38px'
              }}
            >
              Results
            </h1>
            <p
              style={{
                fontSize: '14px',
                color: 'rgba(255, 255, 255, 0.92)',
                margin: 0,
                lineHeight: '20px'
              }}
            >
              Track your progress across every quiz you have taken.
            </p>
          </div>

          {/* Right: The 478 Attempts Card (Figma Node 210:54589) */}
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '12px',
              padding: '16px 36px',
              width: 'auto',
              boxSizing: 'border-box',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.08)'
            }}
          >
            <div
              style={{
                fontFamily: 'var(--font-numbers, "Space Grotesk", sans-serif)',
                fontSize: '34px',
                fontWeight: 800,
                color: '#0B1A2B',
                lineHeight: '38px'
              }}
            >
              478
            </div>
            <div
              style={{
                fontSize: '11px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '1px',
                color: '#8A97A6',
                marginTop: '2px'
              }}
            >
              Attempts
            </div>
          </div>
        </div>
      )}

      {/* 2. FILTER & CONTROLS BAR (Mobile: Compact 2-Row | Desktop: Full Match) */}
      {isMobile ? (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            width: '100%'
          }}
        >
          {/* Row 1: Segmented Tabs + Refresh */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
            <div
              style={{
                background: '#FFFFFF',
                border: '1px solid #E2DDD3',
                borderRadius: '8px',
                padding: '2px',
                display: 'flex',
                alignItems: 'center',
                gap: '2px',
                flex: 1
              }}
            >
              <button
                type="button"
                onClick={() => setActiveFilter('all')}
                style={{
                  flex: 1,
                  background: activeFilter === 'all' ? '#0B3A6F' : 'transparent',
                  color: activeFilter === 'all' ? '#FFFFFF' : '#8A97A6',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '6px 8px',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  textAlign: 'center'
                }}
              >
                All ({FIGMA_RESULTS_CARDS.length})
              </button>

              <button
                type="button"
                onClick={() => setActiveFilter('full-marks')}
                style={{
                  flex: 1,
                  background: activeFilter === 'full-marks' ? '#0B3A6F' : 'transparent',
                  color: activeFilter === 'full-marks' ? '#FFFFFF' : '#8A97A6',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '6px 8px',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  textAlign: 'center'
                }}
              >
                Full marks ({fullMarksCount})
              </button>
            </div>

            <button
              type="button"
              onClick={handleRefresh}
              style={{
                background: '#FFFFFF',
                border: '1px solid #E2DDD3',
                borderRadius: '8px',
                padding: '0 12px',
                height: '34px',
                color: '#0B1A2B',
                fontSize: '11px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                cursor: isRefreshing ? 'wait' : 'pointer',
                flexShrink: 0
              }}
            >
              <span
                style={{
                  display: 'inline-flex',
                  transition: 'transform 0.5s ease',
                  transform: isRefreshing ? 'rotate(360deg)' : 'none'
                }}
              >
                <Icon name="refresh" size={13} color="currentColor" />
              </span>
              <span>Sync</span>
            </button>
          </div>

          {/* Row 2: Search */}
          <div style={{ position: 'relative', width: '100%', display: 'flex', alignItems: 'center' }}>
            <span style={{ position: 'absolute', left: '10px', color: '#8A97A6', display: 'flex', alignItems: 'center', pointerEvents: 'none' }}>
              <Icon name="search" size={13} color="#8A97A6" />
            </span>
            <input
              type="text"
              placeholder="Search quiz topic..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                height: '34px',
                background: '#FFFFFF',
                border: '1px solid #E2DDD3',
                borderRadius: '8px',
                padding: '0 28px 0 28px',
                fontSize: '12px',
                fontFamily: 'var(--font-primary)',
                color: '#0B1A2B',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                style={{ position: 'absolute', right: '8px', background: 'none', border: 'none', color: '#8A97A6', cursor: 'pointer', padding: 0, fontSize: '12px' }}
              >
                ✕
              </button>
            )}
          </div>
        </div>
      ) : (
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
            gap: '14px',
            flexWrap: 'wrap'
          }}
        >
          {/* Left: Segmented Tabs [ ALL RESULTS ] and [ FULL MARKS ] */}
          <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '14px', width: 'auto' }}>
            <div
              style={{
                background: '#FFFFFF',
                border: '1px solid #E2DDD3',
                borderRadius: '8px',
                padding: '3px',
                display: 'flex',
                alignItems: 'center',
                overflowX: 'visible',
                maxWidth: '100%',
                whiteSpace: 'nowrap'
              }}
            >
              {/* ALL RESULTS BUTTON */}
              <button
                type="button"
                onClick={() => setActiveFilter('all')}
                style={{
                  background: activeFilter === 'all' ? '#0B3A6F' : 'transparent',
                  color: activeFilter === 'all' ? '#FFFFFF' : '#8A97A6',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '8px 20px',
                  fontSize: '12px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.6px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.18s'
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                  <path d="M3 3v5h5" />
                </svg>
                <span>All results ({FIGMA_RESULTS_CARDS.length})</span>
              </button>

              {/* FULL MARKS BUTTON */}
              <button
                type="button"
                onClick={() => setActiveFilter('full-marks')}
                style={{
                  background: activeFilter === 'full-marks' ? '#0B3A6F' : 'transparent',
                  color: activeFilter === 'full-marks' ? '#FFFFFF' : '#8A97A6',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '8px 20px',
                  fontSize: '12px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.6px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.18s'
                }}
              >
                <Icon
                  name="checkCircle"
                  variant={activeFilter === 'full-marks' ? 'bold' : 'linear'}
                  size={14}
                  color={activeFilter === 'full-marks' ? '#FFFFFF' : '#8A97A6'}
                />
                <span>Full marks ({fullMarksCount})</span>
              </button>
            </div>

            {/* Quick Search */}
            <div
              style={{
                position: 'relative',
                width: '240px',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <span style={{ position: 'absolute', left: '10px', color: '#8A97A6', display: 'flex', alignItems: 'center', pointerEvents: 'none' }}>
                <Icon name="search" size={14} color="#8A97A6" />
              </span>
              <input
                type="text"
                placeholder="Search quiz topic..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  height: '36px',
                  background: '#FFFFFF',
                  border: '1px solid #E2DDD3',
                  borderRadius: '8px',
                  padding: '0 28px 0 30px',
                  fontSize: '12px',
                  fontFamily: 'var(--font-primary)',
                  color: '#0B1A2B',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => { e.target.style.borderColor = '#0B3A6F'; }}
                onBlur={(e) => { e.target.style.borderColor = '#E2DDD3'; }}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  style={{
                    position: 'absolute',
                    right: '8px',
                    background: 'none',
                    border: 'none',
                    color: '#8A97A6',
                    cursor: 'pointer',
                    padding: 0,
                    fontSize: '12px'
                  }}
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Right: AVG 0 PTS & REFRESH BUTTON */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
            <span
              style={{
                fontSize: '12px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.8px',
                color: '#8A97A6'
              }}
            >
              Avg 0 pts
            </span>

            <button
              type="button"
              onClick={handleRefresh}
              style={{
                background: '#FFFFFF',
                border: '1px solid #E2DDD3',
                borderRadius: '8px',
                padding: '8px 18px',
                color: '#0B1A2B',
                fontSize: '12px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.6px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: isRefreshing ? 'wait' : 'pointer',
                transition: 'all 0.18s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#0B3A6F';
                e.currentTarget.style.color = '#0B3A6F';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#E2DDD3';
                e.currentTarget.style.color = '#0B1A2B';
              }}
            >
              <span
                style={{
                  display: 'inline-flex',
                  transition: 'transform 0.5s ease',
                  transform: isRefreshing ? 'rotate(360deg)' : 'none'
                }}
              >
                <Icon name="refresh" size={14} color="currentColor" />
              </span>
              <span>Refresh</span>
            </button>
          </div>
        </div>
      )}

      {/* ======================================================================
          3. QUIZ CARDS LIST (Pixel-Perfect Match to Figma Node 210:54612)
          ====================================================================== */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '18px',
          width: '100%',
          boxSizing: 'border-box',
          paddingBottom: '32px'
        }}
      >
        {displayedCards.map((item) => {
          // Pill Colors matching Figma exact visual
          let pillBg = '#FFF4E5';
          let pillColor = '#D97706';
          let numColor = '#EA580C';

          if (item.scorePercentage === 100) {
            pillBg = '#ECFDF5';
            pillColor = '#059669';
            numColor = '#059669';
          } else if (item.scorePercentage < 30) {
            pillBg = '#FEE2E2';
            pillColor = '#DC2626';
            numColor = '#DC2626';
          }

          if (isMobile) {
            return (
              <div
                key={item.id}
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #E2DDD3',
                  borderRadius: '12px',
                  boxShadow: '0 2px 8px rgba(11, 26, 43, 0.04)',
                  display: 'flex',
                  flexDirection: 'column',
                  padding: '12px 14px',
                  gap: '10px',
                  boxSizing: 'border-box',
                  width: '100%'
                }}
              >
                {/* Header: Thumbnail + Meta + Score Badge */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div
                    style={{
                      width: '46px',
                      height: '54px',
                      borderRadius: '6px',
                      overflow: 'hidden',
                      backgroundColor: '#0B3A6F',
                      flexShrink: 0
                    }}
                  >
                    <img
                      src={item.thumbnail}
                      alt={item.topic}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px', marginBottom: '2px' }}>
                      <span style={{ fontSize: '9.5px', fontWeight: 700, textTransform: 'uppercase', color: '#6B7790', background: '#F1F5F9', padding: '1px 6px', borderRadius: '4px' }}>
                        {item.category}
                      </span>
                      <span style={{ background: pillBg, color: pillColor, padding: '2px 7px', borderRadius: '4px', fontSize: '11px', fontWeight: 800 }}>
                        {item.scorePercentage}%
                      </span>
                    </div>
                    <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#0B1A2B', margin: '0 0 2px 0', lineHeight: '18px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.topic}
                    </h3>
                    <span style={{ fontSize: '11px', color: '#8A97A6' }}>
                      {item.date} · {item.time}
                    </span>
                  </div>
                </div>

                {/* Stats Row */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: '#FBFAF7',
                    border: '1px solid #EFEBE3',
                    borderRadius: '8px',
                    padding: '7px 12px'
                  }}
                >
                  <div style={{ fontSize: '11.5px', color: '#64748B' }}>
                    Correct: <strong style={{ color: numColor, fontWeight: 800 }}>{item.correctNumerator}/{item.correctDenominator}</strong>
                  </div>
                  <div style={{ fontSize: '11.5px', color: '#64748B' }}>
                    Points: <strong style={{ color: '#0B3A6F', fontWeight: 800 }}>{item.points}</strong>
                  </div>
                  <div style={{ fontSize: '11.5px', color: '#64748B' }}>
                    Time: <strong style={{ color: '#0B1A2B', fontWeight: 700 }}>{item.timeTaken}</strong>
                  </div>
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => setSelectedReviewModal(item)}
                    style={{
                      flex: 1,
                      height: '34px',
                      background: '#FFFFFF',
                      border: '1.5px solid #0B3A6F',
                      borderRadius: '7px',
                      color: '#0B3A6F',
                      fontSize: '11.5px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '5px'
                    }}
                  >
                    <span>Review Answers</span>
                    <Icon name="chevronRight" size={11} color="currentColor" />
                  </button>

                  {item.scorePercentage < 100 && (
                    <button
                      type="button"
                      onClick={() => { if (onRetakeQuiz) onRetakeQuiz(item.topic); }}
                      style={{
                        flex: 1,
                        height: '34px',
                        background: '#FEE047',
                        border: 'none',
                        borderRadius: '7px',
                        color: '#0B1A2B',
                        fontSize: '11.5px',
                        fontWeight: 800,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '5px',
                        boxShadow: '0 2px 6px rgba(254, 224, 71, 0.25)'
                      }}
                    >
                      <Icon name="play" variant="bold" size={10} color="#0B1A2B" />
                      <span>Retake Quiz</span>
                    </button>
                  )}
                </div>
              </div>
            );
          }

          return (
            <div
              key={item.id}
              style={{
                background: '#FFFFFF',
                border: '1px solid #E2DDD3',
                borderRadius: '12px',
                boxShadow: '0 2px 10px rgba(11, 26, 43, 0.03)',
                display: 'flex',
                flexDirection: 'column',
                boxSizing: 'border-box',
                flexShrink: 0,
                width: '100%',
                overflow: 'visible',
                transition: 'box-shadow 0.2s ease, transform 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(11, 26, 43, 0.08)';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 2px 10px rgba(11, 26, 43, 0.03)';
                e.currentTarget.style.transform = 'none';
              }}
            >
              {/* --- TOP SECTION (Figma: Height 119px, padding 24px) --- */}
              <div
                style={{
                  padding: isMobile ? '14px 14px' : '22px 28px',
                  display: 'flex',
                  flexDirection: isMobile ? 'column' : 'row',
                  alignItems: isMobile ? 'stretch' : 'center',
                  justifyContent: 'space-between',
                  gap: isMobile ? '14px' : '24px',
                  boxSizing: 'border-box'
                }}
              >
                {/* Left Group: Prominent 3D Book Cover Thumbnail + Topic Details */}
                <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '12px' : '22px', minWidth: 0, flex: 1, width: isMobile ? '100%' : 'auto' }}>
                  {/* 1. Prominent High-Fidelity 3D Book Cover Thumbnail */}
                  <div
                    style={{
                      width: '76px',
                      height: '88px',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      backgroundColor: '#0B3A6F',
                      boxShadow: '0 4px 12px rgba(11, 58, 111, 0.18)',
                      border: '1px solid rgba(0, 0, 0, 0.08)',
                      flexShrink: 0,
                      position: 'relative',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <img
                      src={item.thumbnail}
                      alt={item.topic}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                      onError={(e) => {
                        // Elegant fallback if image asset is unavailable
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.parentElement.style.background = '#0B3A6F';
                      }}
                    />
                    {/* Topic Graduation Cap Watermark Emblem on Thumbnail */}
                    <div
                      style={{
                        position: 'absolute',
                        bottom: '4px',
                        right: '4px',
                        width: '22px',
                        height: '22px',
                        borderRadius: '4px',
                        background: 'rgba(11, 58, 111, 0.88)',
                        backdropFilter: 'blur(4px)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '1px solid rgba(255, 255, 255, 0.2)'
                      }}
                      title="Academic Knowledge Verification"
                    >
                      <svg width="14" height="14" viewBox="0 0 36 36" fill="none">
                        <path d="M18 12L9.5 15.5L18 19L26.5 15.5L18 12ZM13 22C13 23 15.2 24 18 24C20.8 24 23 23 23 22V18.2L18 20.2L13 18.2V22Z" fill="#FFFFFF" />
                      </svg>
                    </div>
                  </div>

                  {/* 2. Topic Text & Meta */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', minWidth: 0 }}>
                    {/* Micro-label: QUIZ TOPIC */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span
                        style={{
                          fontSize: '10px',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          letterSpacing: '0.8px',
                          color: '#8A97A6'
                        }}
                      >
                        Quiz topic
                      </span>
                      <span
                        style={{
                          fontSize: '10px',
                          fontWeight: 600,
                          color: '#6B7790',
                          background: '#F1F5F9',
                          padding: '1px 8px',
                          borderRadius: '4px'
                        }}
                      >
                        {item.category}
                      </span>
                    </div>

                    {/* Topic Title & Percentage Pill Row */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                      <h3
                        style={{
                          fontFamily: 'var(--font-heading, "Space Grotesk", sans-serif)',
                          fontSize: '18px',
                          fontWeight: 700,
                          color: '#0B1A2B',
                          margin: 0,
                          lineHeight: '24px'
                        }}
                      >
                        {item.topic}
                      </h3>

                      {/* Percentage Pill */}
                      <span
                        style={{
                          background: pillBg,
                          color: pillColor,
                          padding: '3px 9px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: 700,
                          lineHeight: '16px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        {item.scorePercentage === 100 && (
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                          </svg>
                        )}
                        {item.scorePercentage}%
                      </span>
                    </div>

                    {/* Date & Time Row */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px',
                        fontSize: '12px',
                        color: '#8A97A6',
                        marginTop: '3px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {FigmaIcons.calendar}
                        <span>{item.date}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {FigmaIcons.clock}
                        <span>{item.time}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Group: Correct Box + Points Box (Exact Figma Node 210:54627) */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', width: isMobile ? '100%' : 'auto', flexShrink: 0 }}>
                  {/* CORRECT BOX (120x69 in Figma) */}
                  <div
                    style={{
                      flex: isMobile ? 1 : 'none',
                      width: isMobile ? 'auto' : '120px',
                      height: '69px',
                      borderRadius: '8px',
                      background: '#FBFAF7',
                      border: '1px solid #E2DDD3',
                      padding: '12px 14px',
                      boxSizing: 'border-box',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div
                      style={{
                        fontSize: '10px',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.6px',
                        color: '#8A97A6'
                      }}
                    >
                      Correct
                    </div>
                    <div
                      style={{
                        fontFamily: 'var(--font-numbers, "Space Grotesk", sans-serif)',
                        fontSize: '20px',
                        lineHeight: '22px'
                      }}
                    >
                      <span style={{ color: numColor, fontWeight: 800 }}>{item.correctNumerator}</span>
                      <span style={{ color: '#0B1A2B', fontWeight: 700 }}>/{item.correctDenominator}</span>
                    </div>
                  </div>

                  {/* POINTS BOX (120x69 in Figma: Deep Navy #0B3A6F) */}
                  <div
                    style={{
                      flex: isMobile ? 1 : 'none',
                      width: isMobile ? 'auto' : '120px',
                      height: '69px',
                      borderRadius: '8px',
                      background: '#0B3A6F',
                      padding: '12px 14px',
                      boxSizing: 'border-box',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div
                      style={{
                        fontSize: '10px',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.6px',
                        color: 'rgba(255, 255, 255, 0.8)'
                      }}
                    >
                      Points
                    </div>
                    <div
                      style={{
                        fontFamily: 'var(--font-numbers, "Space Grotesk", sans-serif)',
                        fontSize: '22px',
                        fontWeight: 800,
                        color: '#FFFFFF',
                        lineHeight: '24px'
                      }}
                    >
                      {item.points}
                    </div>
                  </div>
                </div>
              </div>

              {/* --- BOTTOM SECTION (Figma: Height 68px, padding 16px 28px, borderTop) --- */}
              <div
                style={{
                  borderTop: '1px solid #EFEBE3',
                  padding: isMobile ? '14px 14px' : '16px 28px',
                  display: 'flex',
                  flexDirection: isMobile ? 'column' : 'row',
                  alignItems: isMobile ? 'stretch' : 'center',
                  justifyContent: 'space-between',
                  boxSizing: 'border-box',
                  background: '#FFFFFF',
                  borderBottomLeftRadius: '12px',
                  borderBottomRightRadius: '12px',
                  minHeight: '66px',
                  gap: isMobile ? '14px' : '16px'
                }}
              >
                {/* 4 Standard Columns (Figma Node 210:54641) - 2x2 Grid on Mobile, Row on Desktop */}
                <div
                  style={{
                    display: isMobile ? 'grid' : 'flex',
                    gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : undefined,
                    alignItems: 'center',
                    gap: isMobile ? '12px 14px' : '48px',
                    flexWrap: isMobile ? undefined : 'wrap'
                  }}
                >
                  {/* Column 1: Base points */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', minWidth: isMobile ? 'auto' : '95px' }}>
                    <div
                      style={{
                        fontSize: '10px',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.6px',
                        color: '#8A97A6'
                      }}
                    >
                      Base points
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, color: '#0B1A2B' }}>
                      {FigmaIcons.basePoints}
                      <span>{item.basePoints}</span>
                    </div>
                  </div>

                  {/* Column 2: Time taken */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', minWidth: isMobile ? 'auto' : '95px' }}>
                    <div
                      style={{
                        fontSize: '10px',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.6px',
                        color: '#8A97A6'
                      }}
                    >
                      Time taken
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, color: '#0B1A2B' }}>
                      {FigmaIcons.timeTaken}
                      <span>{item.timeTaken}</span>
                    </div>
                  </div>

                  {/* Column 3: Streak bonus */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', minWidth: isMobile ? 'auto' : '95px' }}>
                    <div
                      style={{
                        fontSize: '10px',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.6px',
                        color: '#8A97A6'
                      }}
                    >
                      Streak bonus
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, color: '#0B1A2B' }}>
                      {FigmaIcons.streakBonus}
                      <span>{item.streakBonus}</span>
                    </div>
                  </div>

                  {/* Column 4: Status */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', minWidth: isMobile ? 'auto' : '95px' }}>
                    <div
                      style={{
                        fontSize: '10px',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.6px',
                        color: '#8A97A6'
                      }}
                    >
                      Status
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, color: '#059669' }}>
                      {FigmaIcons.verifiedStatus}
                      <span>{item.status}</span>
                    </div>
                  </div>
                </div>

                {/* Right: Action Buttons */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: isMobile ? '100%' : 'auto' }}>
                  <button
                    type="button"
                    onClick={() => setSelectedReviewModal(item)}
                    style={{
                      flex: isMobile ? 1 : 'none',
                      background: '#FFFFFF',
                      border: '1.5px solid #0B3A6F',
                      borderRadius: '8px',
                      padding: isMobile ? '9px 12px' : '7px 16px',
                      color: '#0B3A6F',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      transition: 'all 0.15s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#0B3A6F';
                      e.currentTarget.style.color = '#FFFFFF';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#FFFFFF';
                      e.currentTarget.style.color = '#0B3A6F';
                    }}
                  >
                    <span>Review Answers</span>
                    <Icon name="chevronRight" size={12} color="currentColor" />
                  </button>

                  {/* Only show Retake Quiz if the user did NOT score full marks (100%) */}
                  {item.scorePercentage < 100 && (
                    <button
                      type="button"
                      onClick={() => {
                        if (onRetakeQuiz) onRetakeQuiz(item.topic);
                      }}
                      style={{
                        flex: isMobile ? 1 : 'none',
                        background: '#FEE047',
                        border: 'none',
                        borderRadius: '8px',
                        padding: isMobile ? '9px 12px' : '7px 16px',
                        color: '#0B1A2B',
                        fontSize: '12px',
                        fontWeight: 800,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        boxShadow: '0 2px 6px rgba(254, 224, 71, 0.25)',
                        transition: 'all 0.15s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#FCD34D';
                        e.currentTarget.style.transform = 'translateY(-1px)';
                        e.currentTarget.style.boxShadow = '0 4px 10px rgba(254, 224, 71, 0.35)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#FEE047';
                        e.currentTarget.style.transform = 'none';
                        e.currentTarget.style.boxShadow = '0 2px 6px rgba(254, 224, 71, 0.25)';
                      }}
                    >
                      <Icon name="play" variant="bold" size={10} color="#0B1A2B" />
                      <span>Retake Quiz</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ======================================================================
          4. MODAL: QUESTION-BY-QUESTION BREAKDOWN ("Result Option")
          ====================================================================== */}
      {selectedReviewModal && (
        <ModalPortal
          isOpen={true}
          onClose={() => setSelectedReviewModal(null)}
          style={{
            alignItems: isMobile ? 'flex-end' : 'center',
            padding: isMobile ? 0 : '24px'
          }}
        >
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
              width: '100%',
              maxWidth: '780px',
              maxHeight: isMobile ? '92vh' : '88vh',
              background: '#FFFFFF',
              borderRadius: isMobile ? '20px 20px 0 0' : '16px',
              boxShadow: '0 24px 60px rgba(0, 0, 0, 0.25)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden'
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: isMobile ? '16px 18px' : '20px 28px',
                background: '#0B3A6F',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: '16px'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span
                    style={{
                      fontSize: '10px',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      background: 'rgba(255, 255, 255, 0.18)',
                      padding: '2px 8px',
                      borderRadius: '4px'
                    }}
                  >
                    Quiz Result Breakdown
                  </span>
                  <span style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.8)' }}>
                    {selectedReviewModal.date} at {selectedReviewModal.time}
                  </span>
                </div>
                <h2
                  style={{
                    fontFamily: 'var(--font-heading, "Space Grotesk", sans-serif)',
                    fontSize: isMobile ? '18px' : '22px',
                    fontWeight: 800,
                    margin: 0
                  }}
                >
                  {selectedReviewModal.topic}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setSelectedReviewModal(null)}
                style={{
                  background: 'rgba(255, 255, 255, 0.15)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF',
                  cursor: 'pointer',
                  padding: 0
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Performance Summary Strip */}
            <div
              style={{
                padding: isMobile ? '12px 18px' : '14px 28px',
                background: '#F8FAFC',
                borderBottom: '1px solid #E2E8F0',
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                gap: isMobile ? '8px' : '24px',
                alignItems: isMobile ? 'flex-start' : 'center'
              }}
            >
              <div>
                <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>Score: </span>
                <strong style={{ fontSize: '14px', color: '#0B1A2B' }}>
                  {selectedReviewModal.correctNumerator}/{selectedReviewModal.correctDenominator} ({selectedReviewModal.scorePercentage}%)
                </strong>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>Points Earned: </span>
                <strong style={{ fontSize: '14px', color: '#0B3A6F' }}>{selectedReviewModal.points} pts</strong>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>Time: </span>
                <strong style={{ fontSize: '14px', color: '#0B1A2B' }}>{selectedReviewModal.timeTaken}</strong>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>Status: </span>
                <strong style={{ fontSize: '14px', color: '#059669' }}>Verified</strong>
              </div>
            </div>

            {/* Questions List */}
            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: isMobile ? '14px 16px' : '24px 28px',
                display: 'flex',
                flexDirection: 'column',
                gap: isMobile ? '12px' : '16px',
                WebkitOverflowScrolling: 'touch'
              }}
            >
              {(SAMPLE_BREAKDOWNS[selectedReviewModal.topicKey] || SAMPLE_BREAKDOWNS['q-curve']).map((q) => (
                <div
                  key={q.qNum}
                  style={{
                    border: `1px solid ${q.isCorrect ? '#D1FAE5' : '#FECACA'}`,
                    background: q.isCorrect ? '#F0FDF4' : '#FEF2F2',
                    borderRadius: '10px',
                    padding: '16px 18px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: q.isCorrect ? '#065F46' : '#991B1B' }}>
                      Question {q.qNum}
                    </span>
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: '4px',
                        background: q.isCorrect ? '#DCFCE7' : '#FEE2E2',
                        color: q.isCorrect ? '#166534' : '#991B1B'
                      }}
                    >
                      {q.isCorrect ? '✓ Correct (+1 pt base)' : '✗ Incorrect (0 pts)'}
                    </span>
                  </div>

                  <p style={{ margin: 0, fontSize: '13.5px', fontWeight: 600, color: '#0F172A', lineHeight: '20px' }}>
                    {q.question}
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '4px', fontSize: '12.5px' }}>
                    <div style={{ color: q.isCorrect ? '#166534' : '#991B1B' }}>
                      <strong>Your Answer:</strong> {q.userAnswer}
                    </div>
                    {!q.isCorrect && (
                      <div style={{ color: '#166534' }}>
                        <strong>Correct Answer:</strong> {q.correctAnswer}
                      </div>
                    )}
                  </div>

                  {q.explanation && (
                    <div
                      style={{
                        marginTop: '4px',
                        padding: '8px 12px',
                        background: 'rgba(255, 255, 255, 0.7)',
                        borderRadius: '6px',
                        fontSize: '12px',
                        color: '#475569',
                        lineHeight: '16px'
                      }}
                    >
                      <strong>Explanation:</strong> {q.explanation}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Modal Footer */}
            <div
              style={{
                padding: '16px 28px',
                borderTop: '1px solid #E2E8F0',
                background: '#F8FAFC',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: '12px'
              }}
            >
              <button
                type="button"
                onClick={() => setSelectedReviewModal(null)}
                style={{
                  background: 'none',
                  border: '1px solid #CBD5E1',
                  borderRadius: '6px',
                  padding: '8px 18px',
                  fontSize: '12.5px',
                  fontWeight: 600,
                  color: '#0B1A2B',
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
              {selectedReviewModal.scorePercentage < 100 && (
                <button
                  type="button"
                  onClick={() => {
                    const topic = selectedReviewModal.topic;
                    setSelectedReviewModal(null);
                    if (onRetakeQuiz) onRetakeQuiz(topic);
                  }}
                  style={{
                    background: '#FEE047',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '8px 18px',
                    fontSize: '12.5px',
                    fontWeight: 800,
                    color: '#0B1A2B',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 2px 6px rgba(254, 224, 71, 0.25)',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#FCD34D';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#FEE047';
                    e.currentTarget.style.transform = 'none';
                  }}
                >
                  <Icon name="play" variant="bold" size={12} color="#0B1A2B" />
                  <span>Retake This Quiz</span>
                </button>
              )}
            </div>
          </div>
        </ModalPortal>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            background: '#0B1A2B',
            color: '#FFFFFF',
            padding: '12px 20px',
            borderRadius: '8px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '13px',
            fontWeight: 600,
            zIndex: 10000
          }}
        >
          <Icon name="checkCircle" variant="bold" size={16} color="#10B981" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
