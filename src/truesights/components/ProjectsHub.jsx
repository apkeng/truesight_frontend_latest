import React, { useState, useMemo, useRef, useEffect } from 'react';
import Icon from '../design-system/icons';
import ProjectWorkspace from './ProjectWorkspace';
import ModalPortal from './ModalPortal';

// Initial dataset extracted accurately from user's reference screens
const INITIAL_EDUCATOR_PROJECTS = [
  {
    id: 'edu-1',
    title: 'Nuclear Fission: A High School Study Plan',
    level: 'HIGH SCHOOL',
    educator: 'Yadu',
    assignedDate: '11/09/2025',
    assetsCount: 0,
    modulesCount: 5,
    coverImage: '/assets/book-nuclear-fission.jpg',
    type: 'educator',
    description: 'Comprehensive guided study plan on atomic structure, chain reactions, nuclear reactors, and radioactive decay fundamentals.',
    modules: [
      'Atomic Nucleus & Binding Energy',
      'Fission Mechanism & Liquid Drop Model',
      'Neutron Moderation & Thermal Fission',
      'Reactor Safety Systems & Control Rods',
      'Radioactive Waste Management'
    ]
  },
  {
    id: 'edu-2',
    title: 'Mastering International Trade: A Postgraduate Study Plan',
    level: 'POST GRADUATE',
    educator: 'Yadu',
    assignedDate: '05/04/2025',
    assetsCount: 0,
    modulesCount: 3,
    coverImage: '/assets/book-trade.jpg',
    type: 'educator',
    description: 'Advanced economic theories, comparative advantage models, exchange rate regimes, and WTO trade policies.',
    modules: [
      'Heckscher-Ohlin Model & Factor Price Equalization',
      'Tariff Barriers, Quotas & Non-Tariff Measures',
      'Global Supply Chains & Currency Volatility'
    ]
  },
  {
    id: 'edu-3',
    title: 'Inflation and Its Impact on Households: A Study Plan',
    level: 'UNDERGRADUATE STUDENT',
    educator: 'Dias Jose',
    assignedDate: '13/12/2025',
    assetsCount: 0,
    modulesCount: 5,
    coverImage: '/assets/book-inflation.jpg',
    type: 'educator',
    description: 'Empirical analysis of consumer price indices, purchasing power parity, and household consumption under cost-of-living shocks.',
    modules: [
      'Measuring CPI & Headline Inflation',
      'Real Wages vs Nominal Purchasing Power',
      'Interest Rate Transmission & Debt Burden',
      'Essential Goods Elasticity in Low-Income Groups',
      'Fiscal Subsidies & Welfare Programs'
    ]
  },
  {
    id: 'edu-4',
    title: 'CTF Mastery: A Postgraduate Study Plan',
    level: 'POST GRADUATE',
    educator: 'Karthik R',
    assignedDate: '02/05/2025',
    assetsCount: 0,
    modulesCount: 3,
    coverImage: '/assets/book-ctf.jpg',
    type: 'educator',
    description: 'Hands-on offensive cybersecurity challenges covering binary exploitation, web vulnerabilities, and cryptographic analysis.',
    modules: [
      'Web Application Penetration & SQLi/XSS',
      'Reverse Engineering & Buffer Overflows',
      'RSA Cryptanalysis & Stream Cipher Weaknesses'
    ]
  },
  {
    id: 'edu-5',
    title: 'Comprehensive Study Plan for Dental Enamel',
    level: 'POST GRADUATE',
    educator: 'Yadu',
    assignedDate: '11/09/2025',
    assetsCount: 0,
    modulesCount: 5,
    coverImage: '/assets/book-dental.jpg',
    type: 'educator',
    description: 'Microstructural mineralization, amelogenesis, hydroxyapatite prism orientation, and remineralization protocols in restorative dentistry.',
    modules: [
      'Enamel Prism Histology & Striae of Retzius',
      'Ameloblast Differentiation Stages',
      'Demineralization Dynamics & Acid Attack',
      'Fluoride Varnish & Remineralization Mechanisms',
      'Adhesive Bonding Protocols in Enamel Etching'
    ]
  },
  {
    id: 'edu-6',
    title: 'HTML Mastery: A Postgraduate Study Plan',
    level: 'POST GRADUATE',
    educator: 'Karthik R',
    assignedDate: '25/03/2025',
    assetsCount: 0,
    modulesCount: 3,
    coverImage: '/assets/book-html.jpg',
    type: 'educator',
    description: 'Modern semantic markup, living HTML standard specifications, accessibility trees (ARIA), and microdata optimization.',
    modules: [
      'Living HTML Standard & DOM Tree Construction',
      'WAI-ARIA Accessibility Roles & Landmark Navigation',
      'Microdata, Schema.org & Performance Preloading'
    ]
  }
];

const INITIAL_PRIVATE_PROJECTS = [
  {
    id: 'priv-1',
    title: 'UX Directions for AI',
    level: 'POSTGRADUATE',
    educator: 'Personal workspace',
    assignedDate: '03/10/2026',
    assetsCount: 0,
    modulesCount: 6,
    coverImage: '/assets/book-ux-ai.jpg',
    type: 'private',
    isPrivate: true,
    description: 'Personal research project on non-deterministic AI interaction states, latency streaming patterns, and human-in-the-loop fallback controls.',
    modules: [
      'Designing for Non-Deterministic AI Output',
      'Streaming Response States & Progressive Rendering',
      'Confidence Scoring Visual Indicators',
      'User Prompt Re-framing & Undo Frameworks',
      'Cognitive Trust & Verification Touchpoints',
      'Agentic Hand-off User Interfaces'
    ]
  },
  {
    id: 'priv-2',
    title: 'kerala building rules 2025 amendment',
    level: 'POSTGRADUATE',
    educator: 'Personal workspace',
    assignedDate: '27/09/2026',
    assetsCount: 0,
    modulesCount: 5,
    coverImage: '/assets/book-building.jpg',
    type: 'private',
    isPrivate: true,
    description: 'Draft regulatory compliance study analyzing Floor Area Ratio (FAR), mandatory setbacks, and rainwater harvesting provisions in Kerala building rules.',
    modules: [
      'Zonal Coverage & Floor Space Index (FSI) Calculations',
      'Frontage, Rear, and Side Setback Table Reference',
      'Mandatory Solar & Rainwater Harvesting Criteria',
      'Fire & Life Safety Evacuation Stairwell Norms',
      'Permit Sanction Workflow with Local Self-Government'
    ]
  },
  {
    id: 'priv-3',
    title: 'marine auxiliary engine',
    level: 'UNDERGRADUATE',
    educator: 'Personal workspace',
    assignedDate: '24/09/2026',
    assetsCount: 0,
    modulesCount: 9,
    coverImage: '/assets/book-marine.jpg',
    type: 'private',
    isPrivate: true,
    description: 'Personal study tracking diesel generator synchronization, starting air distributors, and marine fuel injection timing adjustments.',
    modules: [
      'Medium-Speed Diesel Engine Architecture',
      'Starting Air System & Distributor Timing',
      'Fuel Oil Purifier & Viscosity Controller Setup',
      'Cylinder Lubrication & Liner Wear Limits',
      'Turbocharger Washing & Surging Diagnosis',
      'Governor Droop & Frequency Synchronization',
      'Cooling Water Treatment & Nitrate Monitoring',
      'Exhaust Valve Clearance Measurement',
      'Emergency Stop & Safety Trip Mechanism Tests'
    ]
  },
  {
    id: 'priv-4',
    title: 'MEO Class 4',
    level: 'UNDERGRADUATE',
    educator: 'Personal workspace',
    assignedDate: '24/09/2026',
    assetsCount: 0,
    modulesCount: 6,
    coverImage: '/assets/book-meo.jpg',
    type: 'private',
    isPrivate: true,
    description: 'Examination preparation syllabus focusing on marine engineering knowledge, oral questions, safety conventions (SOLAS/MARPOL), and naval architecture.',
    modules: [
      'Marine Engineering Knowledge (General)',
      'Marine Engineering Knowledge (Motor)',
      'Ship Construction & Naval Architecture Statics',
      'MARPOL Annex I to VI Compliance Protocols',
      'SOLAS Fire Safety Systems Code (FSS Code)',
      'Watchkeeping Regulations & STCW Standards'
    ]
  },
  {
    id: 'priv-5',
    title: 'Diode Circuits',
    level: 'UNDERGRADUATE',
    educator: 'Personal workspace',
    assignedDate: '10/09/2026',
    assetsCount: 0,
    modulesCount: 7,
    coverImage: '/assets/book-circuits.jpg',
    type: 'private',
    isPrivate: true,
    description: 'Practical lab study covering p-n junction physics, half-wave/full-wave bridge rectifiers, Zener diode voltage regulation, and clipper/clamper circuits.',
    modules: [
      'P-N Junction Barrier Potential & Shockley Equation',
      'Half-Wave & Full-Wave Center-Tapped Rectification',
      'Bridge Rectifiers & Capacitor Filter Ripples',
      'Zener Breakdown & DC Voltage Regulation',
      'Positive & Negative Diode Clipping Topologies',
      'Diode Clamping Circuits with DC Restoration',
      'Schottky & Varactor High-Frequency Characteristics'
    ]
  },
  {
    id: 'priv-6',
    title: 'MOSFET Circuits',
    level: 'UNDERGRADUATE',
    educator: 'Personal workspace',
    assignedDate: '07/09/2026',
    assetsCount: 0,
    modulesCount: 8,
    coverImage: '/assets/book-mosfet.jpg',
    type: 'private',
    isPrivate: true,
    description: 'MOSFET small-signal modeling, common-source amplifier design, CMOS digital inverters, and power switching MOSFET gate drive circuits.',
    modules: [
      'Enhancement vs Depletion Mode MOSFET Physics',
      'Threshold Voltage & Pinch-Off Saturation Current',
      'Common-Source Amplifier with Active Load',
      'Common-Drain (Source Follower) Buffer Circuit',
      'CMOS Inverter Transfer Characteristics & Noise Margins',
      'MOSFET Gate Charge Dynamics & Driver Switching Loss',
      'High-Side vs Low-Side N-Channel Gate Driving',
      'Thermal Resistance & Heat Sink Sizing for Power MOSFETs'
    ]
  }
];

// Waiting puzzles shown during roadmap background generation (100% faithful to user's reference screens)
const WAITING_PUZZLES = [
  {
    id: 'rainbow',
    difficulty: 'HARD',
    points: 10,
    title: 'A puzzle while you wait',
    subtitle: 'Solve it for +10 points. Your roadmap keeps generating in the background.',
    lines: [
      'Born of the rain and the sun’s second glance,',
      'I arch like a bridge that gives colors a chance.',
      'No hands can hold me, no feet ever tread,',
      'I vanish as quickly as the tale I once said.',
      'Seven my colors, though none touch the ground —',
      'what fleeting arc in the sky have you found?'
    ],
    questionPrompt: 'What am I?',
    acceptedAnswers: ['rainbow', 'a rainbow', 'the rainbow'],
    hint: 'Look up at the sky when sunlight refracts through falling rain.'
  },
  {
    id: 'foundation',
    difficulty: 'HARD',
    points: 10,
    title: 'A puzzle while you wait',
    subtitle: 'Solve it for +10 points. Your roadmap keeps generating in the background.',
    lines: [
      'I am buried in earth so that giants may stand,',
      'I hold up the pillars and fortify land.',
      'Unseen by the crowds that walk through the door,',
      'Without me, the castle collapses to floor.'
    ],
    questionPrompt: 'What am I?',
    acceptedAnswers: ['foundation', 'a foundation', 'the foundation', 'footing', 'cornerstone'],
    hint: 'The lowest load-bearing subsurface structure of any building.'
  },
  {
    id: 'blueprint',
    difficulty: 'HARD',
    points: 10,
    title: 'A puzzle while you wait',
    subtitle: 'Solve it for +10 points. Your roadmap keeps generating in the background.',
    lines: [
      'Drawn in white lines on an ocean of blue,',
      'I show all the secrets of what you will do.',
      'Before a stone rises or girder is placed,',
      'Upon my clear parchment the future is traced.'
    ],
    questionPrompt: 'What am I?',
    acceptedAnswers: ['blueprint', 'a blueprint', 'the blueprint', 'blueprints', 'plan'],
    hint: 'A technical drawing or architectural design plan.'
  },
  {
    id: 'map',
    difficulty: 'HARD',
    points: 10,
    title: 'A puzzle while you wait',
    subtitle: 'Solve it for +10 points. Your roadmap keeps generating in the background.',
    lines: [
      'I have cities with no houses, mountains with no stone,',
      'I have rivers with no water where no fish has ever grown.',
      'You may fold me in your pocket as you travel far and wide,',
      'Through uncharted paths and kingdoms, I will always be your guide.'
    ],
    questionPrompt: 'What am I?',
    acceptedAnswers: ['map', 'a map', 'the map', 'atlas'],
    hint: 'A visual diagrammatic representation of geography and navigation.'
  }
];

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

function generateModulesForTopic(topic, level) {
  const t = topic.trim();
  const shortTopic = t.length > 34 ? t.slice(0, 34) + '...' : t;

  if (level === 'PRIMARY SCHOOL') {
    return [
      `1. Everyday Foundations: What is ${shortTopic}?`,
      `2. Real-World Wonders: Visual Examples & Stories`,
      `3. Hands-On Activity: Building & Sketching Concepts`,
      `4. Show & Tell Discovery: Explaining Findings to Friends`
    ];
  } else if (level === 'HIGH SCHOOL') {
    return [
      `1. Conceptual Foundations & Scope of ${shortTopic}`,
      `2. Scientific Frameworks & Hypothesis Formulation`,
      `3. Evidence Gathering, Comparative Data & Analysis`,
      `4. Structured Synthesis, Practical Implications & Review`
    ];
  } else if (level === 'POSTGRADUATE') {
    return [
      `1. Epistemological Scoping & Gap Analysis of ${shortTopic}`,
      `2. Advanced Theoretical Modeling & Empirical Methodology`,
      `3. Multi-Disciplinary Synthesis & Algorithmic Validation`,
      `4. Peer-Reviewed Dissertation Defense & Dissemination`
    ];
  } else {
    // UNDERGRADUATE (default)
    return [
      `1. Comprehensive Literature Survey & Theoretical Scope`,
      `2. Quantitative Research Methodology & Architectural Schema`,
      `3. Empirical Experimentation, Synthesis & Prototyping`,
      `4. Structured Validation, Peer Evaluation & Final Review`
    ];
  }
}

function pickCoverForTopic(topic) {
  const lower = topic.toLowerCase();
  if (lower.includes('blockchain') || lower.includes('crypto') || lower.includes('identity')) {
    return '/assets/book-ux-ai.jpg';
  }
  if (lower.includes('marine') || lower.includes('engine') || lower.includes('auxiliary') || lower.includes('propulsion')) {
    return '/assets/book-marine.jpg';
  }
  if (lower.includes('circuit') || lower.includes('hardware') || lower.includes('mosfet') || lower.includes('semiconductor')) {
    return '/assets/book-circuits.jpg';
  }
  if (lower.includes('web') || lower.includes('html') || lower.includes('code') || lower.includes('frontend')) {
    return '/assets/book-html.jpg';
  }
  if (lower.includes('security') || lower.includes('ctf') || lower.includes('hack') || lower.includes('cyber')) {
    return '/assets/book-ctf.jpg';
  }
  if (lower.includes('nuclear') || lower.includes('physics') || lower.includes('energy') || lower.includes('fission')) {
    return '/assets/book-nuclear-fission.jpg';
  }
  if (lower.includes('dental') || lower.includes('medicine') || lower.includes('anatomy') || lower.includes('biology')) {
    return '/assets/book-dental.jpg';
  }
  if (lower.includes('trade') || lower.includes('economics') || lower.includes('market') || lower.includes('finance')) {
    return '/assets/book-trade.jpg';
  }
  if (lower.includes('inflation') || lower.includes('macro')) {
    return '/assets/book-inflation.jpg';
  }
  if (lower.includes('building') || lower.includes('architecture') || lower.includes('civil')) {
    return '/assets/book-building.jpg';
  }
  return '/assets/book-ux-ai.jpg';
}

export default function ProjectsHub({ onBackToDashboard, initialTab = 'all', onTabChange, onOpenWorkspace, onAwardPoints }) {
  const [activeTab, setActiveTab] = useState(initialTab); // 'all' | 'assigned' | 'private'
  const [activeWorkspaceProject, setActiveWorkspaceProject] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('ALL');
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'grid'
  const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'modules' | 'alphabetical'
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
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

  React.useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  const handleTabSwitch = (newTab) => {
    setActiveTab(newTab);
    if (onTabChange) {
      onTabChange(newTab);
    }
  };

  const [educatorProjects, setEducatorProjects] = useState(INITIAL_EDUCATOR_PROJECTS);
  const [privateProjects, setPrivateProjects] = useState(INITIAL_PRIVATE_PROJECTS);

  // Modal & Generation States
  const [selectedProject, setSelectedProject] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createModalStep, setCreateModalStep] = useState('form'); // 'form' | 'waiting_prompt' | 'puzzle'
  const [createdPendingProject, setCreatedPendingProject] = useState(null);
  const [genProgress, setGenProgress] = useState(0);
  const [isRoadmapReady, setIsRoadmapReady] = useState(false);
  const [currentPuzzleIndex, setCurrentPuzzleIndex] = useState(0);
  const [puzzleAnswer, setPuzzleAnswer] = useState('');
  const [puzzleFeedback, setPuzzleFeedback] = useState(null); // { type: 'success' | 'error', message: string }
  const [showHint, setShowHint] = useState(false);
  const [solvedPuzzleIds, setSolvedPuzzleIds] = useState([]);
  const [toastMessage, setToastMessage] = useState(null);
  const puzzleInputRef = useRef(null);

  // New Project Form State
  const [researchTopic, setResearchTopic] = useState('');
  const [complexityLevel, setComplexityLevel] = useState('UNDERGRADUATE');
  const [isGenerating, setIsGenerating] = useState(false);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3200);
  };

  // Auto-focus puzzle input when entering puzzle mode or changing puzzle
  useEffect(() => {
    if (createModalStep === 'puzzle' && puzzleInputRef.current) {
      puzzleInputRef.current.focus();
    }
  }, [createModalStep, currentPuzzleIndex]);

  // Background Roadmap Generator Simulation
  useEffect(() => {
    let timer = null;
    if (createdPendingProject && !isRoadmapReady) {
      timer = setInterval(() => {
        setGenProgress((prev) => {
          if (prev >= 98) {
            clearInterval(timer);
            setIsRoadmapReady(true);
            return 100;
          }
          const jump = Math.floor(Math.random() * 4) + 3;
          const nextVal = Math.min(100, prev + jump);
          if (nextVal >= 100) {
            setIsRoadmapReady(true);
          }
          return nextVal;
        });
      }, 230);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [createdPendingProject, isRoadmapReady]);

  // Combine projects based on the active tab and filters
  const allCombinedProjects = useMemo(() => {
    let list = [];
    if (activeTab === 'all') {
      list = [...educatorProjects, ...privateProjects];
    } else if (activeTab === 'assigned') {
      list = [...educatorProjects];
    } else if (activeTab === 'private') {
      list = [...privateProjects];
    }

    // Apply level filter
    if (selectedLevel !== 'ALL') {
      list = list.filter((p) => p.level.toUpperCase().includes(selectedLevel.toUpperCase()));
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.educator.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      );
    }

    // Apply sorting
    if (sortBy === 'newest') {
      // Sort keeping order or parse dates
      list = [...list].sort((a, b) => b.id.localeCompare(a.id));
    } else if (sortBy === 'modules') {
      list = [...list].sort((a, b) => b.modulesCount - a.modulesCount);
    } else if (sortBy === 'alphabetical') {
      list = [...list].sort((a, b) => a.title.localeCompare(b.title));
    }

    return list;
  }, [activeTab, selectedLevel, searchQuery, sortBy, educatorProjects, privateProjects]);

  const handleStartRoadmapGeneration = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!researchTopic.trim()) return;

    const topic = researchTopic.trim();
    const generatedModules = generateModulesForTopic(topic, complexityLevel);
    const chosenCover = pickCoverForTopic(topic);

    const createdProject = {
      id: `priv-${Date.now()}`,
      title: topic,
      level: complexityLevel,
      educator: 'Personal workspace',
      assignedDate: 'Just now',
      assetsCount: 0,
      modulesCount: generatedModules.length,
      coverImage: chosenCover,
      type: 'private',
      isPrivate: true,
      description: `Personal research project on ${topic}. Generated roadmap with ${generatedModules.length} structured modules for ${complexityLevel.toLowerCase()} study.`,
      modules: generatedModules
    };

    setPrivateProjects((prev) => [createdProject, ...prev]);
    setCreatedPendingProject(createdProject);
    setGenProgress(14);
    setIsRoadmapReady(false);
    setPuzzleAnswer('');
    setPuzzleFeedback(null);
    setShowHint(false);
    setCreateModalStep('waiting_prompt');
    showToast(`Roadmap generation started for "${topic}"!`);
  };

  const handlePuzzleSubmit = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const currentPuzzle = WAITING_PUZZLES[currentPuzzleIndex];
    if (!currentPuzzle) return;

    const normalized = puzzleAnswer.trim().toLowerCase();
    if (!normalized) return;

    const isMatch = currentPuzzle.acceptedAnswers.some((ans) => {
      const a = ans.toLowerCase();
      return normalized === a || normalized.includes(a) || a.includes(normalized);
    });

    if (isMatch) {
      if (!solvedPuzzleIds.includes(currentPuzzle.id)) {
        setSolvedPuzzleIds((prev) => [...prev, currentPuzzle.id]);
        if (onAwardPoints) {
          onAwardPoints(currentPuzzle.points || 10);
        }
        showToast(`Puzzle solved! +${currentPuzzle.points || 10} Points credited to your wallet.`);
      }
      setPuzzleFeedback({
        type: 'success',
        message: `Outstanding! The answer is "${currentPuzzle.acceptedAnswers[0]}". +${currentPuzzle.points || 10} Points added!`
      });
    } else {
      setPuzzleFeedback({
        type: 'error',
        message: `Not quite! Hint: ${currentPuzzle.hint}`
      });
    }
  };

  const handleNextPuzzle = () => {
    setCurrentPuzzleIndex((prev) => (prev + 1) % WAITING_PUZZLES.length);
    setPuzzleAnswer('');
    setPuzzleFeedback(null);
    setShowHint(false);
  };


  const handleCloseModal = () => {
    setIsCreateModalOpen(false);
    if (createModalStep !== 'form') {
      showToast('Roadmap generation continues in the background!');
    }
    setCreateModalStep('form');
  };

  const handleGoToDashboard = () => {
    setIsCreateModalOpen(false);
    setCreateModalStep('form');
    if (onBackToDashboard) {
      onBackToDashboard();
    }
  };

  const handleOpenGeneratedProject = () => {
    if (createdPendingProject) {
      const p = createdPendingProject;
      setIsCreateModalOpen(false);
      setCreateModalStep('form');
      handleOpenWorkspace(p);
    }
  };

  const handleDeleteProject = (projectId, projectTitle, e) => {
    e.stopPropagation();
    setPrivateProjects(privateProjects.filter((p) => p.id !== projectId));
    showToast(`Moved "${projectTitle}" to Trash`);
  };

  const handleOpenWorkspace = (proj) => {
    if (onOpenWorkspace) {
      onOpenWorkspace(proj);
    } else {
      setActiveWorkspaceProject(proj);
    }
  };

  if (activeWorkspaceProject) {
    return (
      <ProjectWorkspace
        project={activeWorkspaceProject}
        onExit={() => setActiveWorkspaceProject(null)}
        onAwardPoints={(pts) => showToast(`Mastery Bonus: +${pts} Points Added!`)}
      />
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: isMobile ? 'auto' : '100%',
        minHeight: isMobile ? '100%' : '100%',
        maxHeight: isMobile ? 'none' : '100%',
        boxSizing: 'border-box',
        gap: isMobile ? '10px' : '12px',
        overflow: isMobile ? 'visible' : 'hidden'
      }}
    >
      {/* 1. TOP HERO BANNER (Mobile: Sleek Compact Bar | Desktop: Exact Full Fidelity Banner) */}
      {isMobile ? (
        <div
          style={{
            background: '#243367',
            borderRadius: '14px',
            padding: '12px 14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            boxShadow: '0 4px 16px rgba(36, 51, 103, 0.14)',
            position: 'relative',
            flexShrink: 0
          }}
        >
          {/* Mobile Top Row: Title + Count Badge + Compact '+ New' Button */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '8px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1
                style={{
                  fontFamily: 'var(--font-primary)',
                  fontSize: '18px',
                  fontWeight: 800,
                  color: '#FFFFFF',
                  margin: 0,
                  letterSpacing: '-0.02em',
                  lineHeight: '22px'
                }}
              >
                Project Roadmaps
              </h1>
              <span
                style={{
                  background: 'rgba(255, 255, 255, 0.18)',
                  color: '#FFFFFF',
                  borderRadius: '999px',
                  padding: '2px 8px',
                  fontSize: '11px',
                  fontWeight: 800,
                  fontFamily: 'var(--font-primary)'
                }}
              >
                {educatorProjects.length + privateProjects.length}
              </span>
            </div>

            <button
              onClick={() => {
                setCreateModalStep('form');
                setIsCreateModalOpen(true);
              }}
              style={{
                background: '#FEE047',
                color: '#101D3B',
                border: 'none',
                borderRadius: '999px',
                height: '32px',
                padding: '0 14px',
                fontFamily: 'var(--font-primary)',
                fontSize: '12px',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                whiteSpace: 'nowrap',
                boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                transition: 'background-color 150ms ease'
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              <span>New</span>
            </button>
          </div>

          {/* Mobile Tools Row: Search + Filter + Sort + Grid/List */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              position: 'relative'
            }}
          >
            {/* Search Input */}
            <div
              style={{
                flex: 1,
                height: '36px',
                borderRadius: '10px',
                background: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                padding: '0 10px',
                gap: '8px',
                boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
                minWidth: 0
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search roadmaps..."
                style={{
                  border: 'none',
                  outline: 'none',
                  background: 'transparent',
                  width: '100%',
                  fontFamily: 'var(--font-primary)',
                  fontSize: '12px',
                  fontWeight: 400,
                  color: '#101828',
                  minWidth: 0
                }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    color: '#94A3B8',
                    cursor: 'pointer',
                    padding: '2px',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              )}
            </div>

            {/* Filter Button */}
            <button
              onClick={() => {
                setIsFilterDropdownOpen(!isFilterDropdownOpen);
                setIsSortDropdownOpen(false);
              }}
              title="Filter roadmaps"
              style={{
                height: '36px',
                width: '36px',
                borderRadius: '10px',
                background: (selectedLevel !== 'ALL' || activeTab !== 'all') ? '#FEE047' : '#FFFFFF',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
                flexShrink: 0,
                position: 'relative'
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#101D3B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
              </svg>
            </button>

            {/* Sort Button */}
            <button
              onClick={() => {
                setIsSortDropdownOpen(!isSortDropdownOpen);
                setIsFilterDropdownOpen(false);
              }}
              title="Sort roadmaps"
              style={{
                height: '36px',
                width: '36px',
                borderRadius: '10px',
                background: sortBy !== 'newest' ? '#FEE047' : '#FFFFFF',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
                flexShrink: 0
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#101D3B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="4" y1="6" x2="16" y2="6"></line>
                <line x1="4" y1="12" x2="12" y2="12"></line>
                <line x1="4" y1="18" x2="8" y2="18"></line>
              </svg>
            </button>

            {/* Grid / List Switcher */}
            <div
              style={{
                height: '36px',
                borderRadius: '10px',
                background: '#FFFFFF',
                padding: '2px',
                display: 'flex',
                alignItems: 'center',
                boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
                flexShrink: 0
              }}
            >
              <button
                onClick={() => setViewMode('grid')}
                style={{
                  width: '30px',
                  height: '32px',
                  borderRadius: '8px',
                  border: 'none',
                  background: viewMode === 'grid' ? '#FEE047' : 'transparent',
                  color: '#101D3B',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <rect x="3" y="3" width="7" height="7" rx="1.5"></rect>
                  <rect x="14" y="3" width="7" height="7" rx="1.5"></rect>
                  <rect x="14" y="14" width="7" height="7" rx="1.5"></rect>
                  <rect x="3" y="14" width="7" height="7" rx="1.5"></rect>
                </svg>
              </button>
              <button
                onClick={() => setViewMode('list')}
                style={{
                  width: '30px',
                  height: '32px',
                  borderRadius: '8px',
                  border: 'none',
                  background: viewMode === 'list' ? '#FEE047' : 'transparent',
                  color: '#101D3B',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="8" y1="6" x2="21" y2="6"></line>
                  <line x1="8" y1="12" x2="21" y2="12"></line>
                  <line x1="8" y1="18" x2="21" y2="18"></line>
                  <line x1="3" y1="6" x2="3.01" y2="6"></line>
                  <line x1="3" y1="12" x2="3.01" y2="12"></line>
                  <line x1="3" y1="18" x2="3.01" y2="18"></line>
                </svg>
              </button>
            </div>

            {/* Filter Dropdown on Mobile */}
            {isFilterDropdownOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: '44px',
                  right: 0,
                  width: '240px',
                  background: '#FFFFFF',
                  borderRadius: '12px',
                  padding: '14px',
                  boxShadow: '0 12px 28px rgba(0,0,0,0.22)',
                  zIndex: 100,
                  border: '1px solid #E2E8F0'
                }}
              >
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', letterSpacing: '0.04em', marginBottom: '8px' }}>
                  FILTER BY LEVEL
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '10px' }}>
                  {['ALL', 'HIGH SCHOOL', 'UNDERGRADUATE', 'POSTGRADUATE'].map((lvl) => (
                    <button
                      key={lvl}
                      onClick={() => {
                        setSelectedLevel(lvl);
                        setIsFilterDropdownOpen(false);
                      }}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '7px 10px',
                        borderRadius: '7px',
                        border: 'none',
                        background: selectedLevel === lvl ? '#EBF2FE' : 'transparent',
                        color: selectedLevel === lvl ? '#2563EB' : '#334155',
                        fontSize: '12px',
                        fontWeight: selectedLevel === lvl ? 700 : 500,
                        cursor: 'pointer'
                      }}
                    >
                      {lvl === 'ALL' ? 'All Levels' : lvl}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Sort Dropdown on Mobile */}
            {isSortDropdownOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: '44px',
                  right: 0,
                  width: '180px',
                  background: '#FFFFFF',
                  borderRadius: '12px',
                  padding: '8px',
                  boxShadow: '0 12px 28px rgba(0,0,0,0.22)',
                  zIndex: 100,
                  border: '1px solid #E2E8F0'
                }}
              >
                {[
                  { id: 'newest', label: 'Newest first' },
                  { id: 'modules', label: 'Most modules' },
                  { id: 'alphabetical', label: 'Alphabetical (A-Z)' }
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      setSortBy(s.id);
                      setIsSortDropdownOpen(false);
                    }}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '7px 10px',
                      borderRadius: '7px',
                      border: 'none',
                      background: sortBy === s.id ? '#EBF2FE' : 'transparent',
                      color: sortBy === s.id ? '#2563EB' : '#334155',
                      fontSize: '12px',
                      fontWeight: sortBy === s.id ? 700 : 500,
                      cursor: 'pointer'
                    }}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div
          style={{
            background: '#243367',
            borderRadius: '16px',
            padding: '18px 22px 16px 22px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            boxShadow: '0 4px 16px rgba(36, 51, 103, 0.14)',
            position: 'relative',
            flexShrink: 0
          }}
        >
          {/* Banner Top Row: Title + Subtitle + "+ New Project" Button */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              gap: '16px'
            }}
          >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <h1
                style={{
                  fontFamily: 'var(--font-primary)',
                  fontSize: isMobile ? '22px' : '28px',
                  fontWeight: 800,
                  color: '#FFFFFF',
                  margin: 0,
                  letterSpacing: '-0.02em',
                  lineHeight: isMobile ? '26px' : '34px'
                }}
              >
                Project Roadmaps
              </h1>
              <span
                style={{
                  background: '#FEE047',
                  color: '#0F1219',
                  borderRadius: '6px',
                  padding: '3px 9px',
                  fontSize: '10px',
                  fontWeight: 800,
                  letterSpacing: '0.06em',
                  fontFamily: 'var(--font-primary)'
                }}
              >
                STUDY & RESEARCH HUB
              </span>
            </div>
            <p
              style={{
                fontFamily: 'var(--font-primary)',
                fontSize: isMobile ? '12px' : '13px',
                lineHeight: isMobile ? '17px' : '19px',
                fontWeight: 400,
                color: 'rgba(255, 255, 255, 0.85)',
                margin: '6px 0 0 0',
                maxWidth: '740px'
              }}
            >
              Unified study workspace combining faculty-assigned academic curriculums and your self-directed personal research projects in one intelligent roadmap hub.
            </p>
          </div>

          {/* Yellow "+ New project" Button */}
          <button
            onClick={() => {
              setCreateModalStep('form');
              setIsCreateModalOpen(true);
            }}
            style={{
              background: '#FEE047',
              color: '#101D3B',
              border: 'none',
              borderRadius: '999px',
              height: isMobile ? '40px' : '38px',
              width: isMobile ? '100%' : 'auto',
              padding: '0 24px',
              fontFamily: 'var(--font-primary)',
              fontSize: '13px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              whiteSpace: 'nowrap',
              boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
              transition: 'background-color 150ms ease, transform 150ms ease',
              flexShrink: 0
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#FCD34D';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#FEE047';
            }}
          >
            New project
          </button>
        </div>

        {/* Banner Bottom Row: Search Box + Filters + Sort + View Switcher */}
        <div
          style={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            alignItems: isMobile ? 'stretch' : 'center',
            justifyContent: 'space-between',
            gap: isMobile ? '10px' : '12px',
            flexWrap: 'wrap'
          }}
        >
          {/* Search Box */}
          <div
            style={{
              flex: isMobile ? 'none' : 1,
              width: isMobile ? '100%' : 'auto',
              minWidth: isMobile ? '100%' : '280px',
              height: '42px',
              borderRadius: '12px',
              background: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              padding: '0 14px',
              gap: '10px',
              boxShadow: '0 2px 6px rgba(0,0,0,0.06)'
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search projects, authors, or modules"
              style={{
                border: 'none',
                outline: 'none',
                background: 'transparent',
                width: '100%',
                fontFamily: 'var(--font-primary)',
                fontSize: '13px',
                fontWeight: 400,
                color: '#101828'
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{
                  border: 'none',
                  background: 'transparent',
                  color: '#94A3B8',
                  cursor: 'pointer',
                  padding: '2px',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            )}
          </div>

          {/* Right Action Tools: Filters + Sort + View */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: isMobile ? 'space-between' : 'flex-end',
              width: isMobile ? '100%' : 'auto',
              gap: '10px',
              position: 'relative'
            }}
          >
            {/* Filters Pill Button */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => {
                  setIsFilterDropdownOpen(!isFilterDropdownOpen);
                  setIsSortDropdownOpen(false);
                }}
                style={{
                  height: '42px',
                  borderRadius: '12px',
                  background: '#FFFFFF',
                  border: 'none',
                  padding: '0 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.06)'
                }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                </svg>
                <span
                  style={{
                    fontFamily: 'var(--font-primary)',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#101D3B'
                  }}
                >
                  Filters
                </span>
                <span
                  style={{
                    background: '#EBF2FE',
                    color: '#2563EB',
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '999px',
                    fontFamily: 'var(--font-primary)'
                  }}
                >
                  {selectedLevel === 'ALL' && activeTab === 'all' ? '3 active' : `${(selectedLevel !== 'ALL' ? 1 : 0) + (activeTab !== 'all' ? 1 : 0) + 1} active`}
                </span>
              </button>

              {/* Filters Dropdown Panel */}
              {isFilterDropdownOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: '48px',
                    left: 0,
                    width: '260px',
                    background: '#FFFFFF',
                    borderRadius: '14px',
                    padding: '16px',
                    boxShadow: '0 12px 28px rgba(0,0,0,0.18)',
                    zIndex: 100,
                    border: '1px solid #E2E8F0'
                  }}
                >
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', letterSpacing: '0.04em', marginBottom: '8px' }}>
                    FILTER BY LEVEL
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '14px' }}>
                    {['ALL', 'HIGH SCHOOL', 'UNDERGRADUATE', 'POSTGRADUATE'].map((lvl) => (
                      <button
                        key={lvl}
                        onClick={() => {
                          setSelectedLevel(lvl);
                          setIsFilterDropdownOpen(false);
                        }}
                        style={{
                          textAlign: 'left',
                          padding: '6px 10px',
                          borderRadius: '8px',
                          border: 'none',
                          background: selectedLevel === lvl ? '#EBF2FE' : 'transparent',
                          color: selectedLevel === lvl ? '#2563EB' : '#334155',
                          fontSize: '12px',
                          fontWeight: selectedLevel === lvl ? 700 : 500,
                          cursor: 'pointer'
                        }}
                      >
                        {lvl === 'ALL' ? 'All Education Levels' : lvl}
                      </button>
                    ))}
                  </div>

                  <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '10px', display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                      onClick={() => {
                        setSelectedLevel('ALL');
                        setActiveTab('all');
                        setIsFilterDropdownOpen(false);
                      }}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#64748B',
                        fontSize: '11px',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      Reset filters
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Sort Dropdown Button */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => {
                  setIsSortDropdownOpen(!isSortDropdownOpen);
                  setIsFilterDropdownOpen(false);
                }}
                style={{
                  height: '42px',
                  borderRadius: '12px',
                  background: '#FFFFFF',
                  border: 'none',
                  padding: '0 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.06)'
                }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="4" y1="6" x2="16" y2="6"></line>
                  <line x1="4" y1="12" x2="12" y2="12"></line>
                  <line x1="4" y1="18" x2="8" y2="18"></line>
                </svg>
                <span
                  style={{
                    fontFamily: 'var(--font-primary)',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#101D3B'
                  }}
                >
                  {sortBy === 'newest' ? 'Newest first' : sortBy === 'modules' ? 'Most modules' : 'Alphabetical'}
                </span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </button>

              {/* Sort Options Panel */}
              {isSortDropdownOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: '48px',
                    right: 0,
                    width: '180px',
                    background: '#FFFFFF',
                    borderRadius: '14px',
                    padding: '8px',
                    boxShadow: '0 12px 28px rgba(0,0,0,0.18)',
                    zIndex: 100,
                    border: '1px solid #E2E8F0'
                  }}
                >
                  {[
                    { id: 'newest', label: 'Newest first' },
                    { id: 'modules', label: 'Most modules' },
                    { id: 'alphabetical', label: 'Alphabetical (A-Z)' }
                  ].map((s) => (
                    <button
                      key={s.id}
                      onClick={() => {
                        setSortBy(s.id);
                        setIsSortDropdownOpen(false);
                      }}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '8px 10px',
                        borderRadius: '8px',
                        border: 'none',
                        background: sortBy === s.id ? '#EBF2FE' : 'transparent',
                        color: sortBy === s.id ? '#2563EB' : '#334155',
                        fontSize: '12px',
                        fontWeight: sortBy === s.id ? 700 : 500,
                        cursor: 'pointer'
                      }}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Grid / List View Switcher */}
            <div
              style={{
                height: '42px',
                borderRadius: '12px',
                background: '#FFFFFF',
                padding: '3px',
                display: 'flex',
                alignItems: 'center',
                boxShadow: '0 2px 6px rgba(0,0,0,0.06)'
              }}
            >
              <button
                onClick={() => setViewMode('grid')}
                title="Grid view"
                style={{
                  height: '36px',
                  borderRadius: '9px',
                  border: 'none',
                  padding: '0 12px',
                  background: viewMode === 'grid' ? '#FEE047' : 'transparent',
                  color: viewMode === 'grid' ? '#101D3B' : '#64748B',
                  fontFamily: 'var(--font-primary)',
                  fontSize: '13px',
                  fontWeight: viewMode === 'grid' ? 700 : 500,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 150ms ease'
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="7" height="7" rx="1.5"></rect>
                  <rect x="14" y="3" width="7" height="7" rx="1.5"></rect>
                  <rect x="14" y="14" width="7" height="7" rx="1.5"></rect>
                  <rect x="3" y="14" width="7" height="7" rx="1.5"></rect>
                </svg>
                <span>Grid</span>
              </button>

              <button
                onClick={() => setViewMode('list')}
                title="List view"
                style={{
                  height: '36px',
                  borderRadius: '9px',
                  border: 'none',
                  padding: '0 14px',
                  background: viewMode === 'list' ? '#FEE047' : 'transparent',
                  color: viewMode === 'list' ? '#101D3B' : '#64748B',
                  fontFamily: 'var(--font-primary)',
                  fontSize: '13px',
                  fontWeight: viewMode === 'list' ? 700 : 500,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 150ms ease'
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="8" y1="6" x2="21" y2="6"></line>
                  <line x1="8" y1="12" x2="21" y2="12"></line>
                  <line x1="8" y1="18" x2="21" y2="18"></line>
                  <line x1="3" y1="6" x2="3.01" y2="6"></line>
                  <line x1="3" y1="12" x2="3.01" y2="12"></line>
                  <line x1="3" y1="18" x2="3.01" y2="18"></line>
                </svg>
                <span>List</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      )}

      {/* 2. UNIFIED SEGMENTED TABS: Divides Educator Roadmaps and Private Projects seamlessly */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: isMobile ? '8px' : '0',
          padding: isMobile ? '0 2px' : '2px 4px'
        }}
      >
        {/* Scope Tabs */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: isMobile ? '6px' : '8px',
            background: 'rgba(255, 255, 255, 0.75)',
            padding: isMobile ? '3px' : '4px',
            borderRadius: '12px',
            border: '1px solid #E2E8F0',
            overflowX: isMobile ? 'auto' : 'visible',
            maxWidth: '100%',
            whiteSpace: 'nowrap',
            WebkitOverflowScrolling: 'touch'
          }}
        >
          {[
            { id: 'all', label: isMobile ? 'All' : 'All Roadmaps', count: educatorProjects.length + privateProjects.length },
            { id: 'assigned', label: isMobile ? 'Assigned' : 'Educator Assigned', count: educatorProjects.length },
            { id: 'private', label: isMobile ? 'Self-Directed' : 'Self-Directed Research', count: privateProjects.length }
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabSwitch(tab.id)}
                style={{
                  height: isMobile ? '28px' : '32px',
                  borderRadius: isMobile ? '8px' : '9px',
                  border: 'none',
                  padding: isMobile ? '0 10px' : '0 14px',
                  background: isActive ? '#20346B' : 'transparent',
                  color: isActive ? '#FFFFFF' : '#64748B',
                  fontFamily: 'var(--font-primary)',
                  fontSize: isMobile ? '11px' : '12px',
                  fontWeight: isActive ? 700 : 500,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: isMobile ? '4px' : '6px',
                  transition: 'all 150ms ease'
                }}
              >
                <span>{tab.label}</span>
                <span
                  style={{
                    background: isActive ? 'rgba(255, 255, 255, 0.2)' : '#F1F5F9',
                    color: isActive ? '#FFFFFF' : '#475569',
                    fontSize: isMobile ? '9.5px' : '10px',
                    fontWeight: 700,
                    padding: '1px 5px',
                    borderRadius: '999px'
                  }}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Total Results Indicator (Desktop only) */}
        {!isMobile && (
          <div
            style={{
              fontFamily: 'var(--font-primary)',
              fontSize: '12px',
              fontWeight: 500,
              color: '#64748B'
            }}
          >
            Showing <span style={{ fontWeight: 700, color: '#101D3B' }}>{allCombinedProjects.length}</span> roadmaps
          </div>
        )}
      </div>


      {/* 3. PROJECT CARDS CONTENT: STRICTLY INTERNAL SCROLL CONTAINER */}
      <div
        style={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          overflowX: 'hidden',
          paddingRight: '6px',
          paddingBottom: '8px',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {viewMode === 'list' ? (
          /* LIST VIEW: Exactly matching the user's reference screenshot */
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}
          >
          {allCombinedProjects.length === 0 ? (
            <div
              style={{
                background: '#FFFFFF',
                borderRadius: '16px',
                border: '1px solid #E2E8F0',
                padding: '48px 24px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                color: '#64748B'
              }}
            >
              <div
                style={{
                  width: '200px',
                  height: '140px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px'
                }}
              >
                <img
                  src="/assets/first-project.png"
                  alt="Your first project starts here"
                  style={{
                    maxWidth: '100%',
                    maxHeight: '100%',
                    objectFit: 'contain'
                  }}
                />
              </div>
              <div style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A', marginBottom: '8px' }}>
                Your first project starts here
              </div>
              <div style={{ fontSize: '13.5px', color: '#64748B', maxWidth: '420px', lineHeight: 1.5, marginBottom: '20px' }}>
                Create your first guided academic learning roadmap or reset search filters to explore faculty courses.
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(true)}
                  style={{
                    backgroundColor: '#0B3A6F',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '9px',
                    padding: '9px 18px',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Icon name="plus" size={14} color="#FFFFFF" />
                  <span>Create Project</span>
                </button>
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedLevel('All Levels');
                    }}
                    style={{
                      backgroundColor: '#F8FAFC',
                      color: '#475569',
                      border: '1px solid #CBD5E1',
                      borderRadius: '9px',
                      padding: '9px 16px',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    Reset Filters
                  </button>
                )}
              </div>
            </div>
          ) : (
            allCombinedProjects.map((proj) => {
              const isPrivate = proj.type === 'private' || proj.isPrivate;

              return (
                <div
                  key={proj.id}
                  onClick={() => setSelectedProject(proj)}
                  style={{
                    background: '#FFFFFF',
                    borderRadius: '16px',
                    border: '1px solid #E2E8F0',
                    padding: isMobile ? '12px' : '12px 20px',
                    display: 'flex',
                    flexDirection: isMobile ? 'column' : 'row',
                    alignItems: isMobile ? 'stretch' : 'center',
                    justifyContent: 'space-between',
                    gap: isMobile ? '12px' : '20px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                    transition: 'all 180ms ease',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#BFDBFE';
                    e.currentTarget.style.boxShadow = '0 6px 16px rgba(40, 61, 130, 0.08)';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#E2E8F0';
                    e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.03)';
                    e.currentTarget.style.transform = 'none';
                  }}
                >
                  {/* Left Group: 3D Book Thumbnail + Details */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '12px' : '20px', minWidth: 0, flex: 1, width: isMobile ? '100%' : 'auto' }}>
                    {/* 3D Book Thumbnail */}
                    <div
                      style={{
                        width: isMobile ? '76px' : '110px',
                        height: isMobile ? '56px' : '74px',
                        borderRadius: '10px',
                        overflow: 'hidden',
                        backgroundColor: '#F8FAFC',
                        boxShadow: '0 3px 8px rgba(0,0,0,0.08)',
                        flexShrink: 0,
                        position: 'relative'
                      }}
                    >
                      <img
                        src={proj.coverImage}
                        alt={proj.title}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                      />
                    </div>

                    {/* Metadata & Title */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', minWidth: 0 }}>
                      <h3
                        style={{
                          fontFamily: 'var(--font-primary)',
                          fontSize: '15px',
                          lineHeight: '20px',
                          fontWeight: 700,
                          color: '#101828',
                          margin: 0,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}
                        title={proj.title}
                      >
                        {proj.title}
                      </h3>

                      {/* Line 1: 4-square dots icon + Date */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="1.8">
                          <rect x="3" y="3" width="7" height="7" rx="1.5" />
                          <rect x="14" y="3" width="7" height="7" rx="1.5" />
                          <rect x="3" y="14" width="7" height="7" rx="1.5" />
                          <rect x="14" y="14" width="7" height="7" rx="1.5" />
                        </svg>
                        <span
                          style={{
                            fontFamily: 'var(--font-primary)',
                            fontSize: '12px',
                            fontWeight: 500,
                            color: '#94A3B8'
                          }}
                        >
                          {proj.assignedDate}
                        </span>
                      </div>

                      {/* Line 2: Author/Workspace + Modules Count + Subtle Badge */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        {isPrivate ? (
                          <span
                            style={{
                              background: '#F0FDF4',
                              border: '1px solid #BBF7D0',
                              color: '#15803D',
                              fontSize: '10px',
                              fontWeight: 800,
                              padding: '2px 8px',
                              borderRadius: '6px',
                              letterSpacing: '0.04em'
                            }}
                          >
                            SELF-DIRECTED RESEARCH
                          </span>
                        ) : (
                          <span
                            style={{
                              background: '#EEF2FF',
                              border: '1px solid #C7D2FE',
                              color: '#283D82',
                              fontSize: '10px',
                              fontWeight: 800,
                              padding: '2px 8px',
                              borderRadius: '6px',
                              letterSpacing: '0.04em'
                            }}
                          >
                            EDUCATOR ASSIGNED • {proj.educator}
                          </span>
                        )}

                        <span
                          style={{
                            background: '#F1F5F9',
                            border: '1px solid #E2E8F0',
                            color: '#475569',
                            fontSize: '10px',
                            fontWeight: 700,
                            padding: '2px 7px',
                            borderRadius: '6px',
                            fontFamily: 'var(--font-primary)'
                          }}
                        >
                          {proj.level}
                        </span>

                        <span
                          style={{
                            fontFamily: 'var(--font-primary)',
                            fontSize: '11.5px',
                            fontWeight: 500,
                            color: '#64748B'
                          }}
                        >
                          {proj.modulesCount} Modules
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Group: Yellow Pill Action Button */}
                  <div style={{ display: 'flex', alignItems: 'center', width: isMobile ? '100%' : 'auto', gap: '10px', flexShrink: 0 }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenWorkspace(proj);
                      }}
                      style={{
                        background: '#FEE047',
                        color: '#101D3B',
                        border: 'none',
                        borderRadius: '999px',
                        height: isMobile ? '42px' : '38px',
                        width: isMobile ? '100%' : 'auto',
                        padding: '0 24px',
                        fontFamily: 'var(--font-primary)',
                        fontSize: '13px',
                        fontWeight: 800,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        whiteSpace: 'nowrap',
                        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                        transition: 'background-color 150ms ease, transform 150ms ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#FCD34D';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#FEE047';
                      }}
                    >
                      {isPrivate ? 'Resume building' : 'Explore roadmap'}
                    </button>

                    {/* Delete action for private projects */}
                    {isPrivate && (
                      <button
                        onClick={(e) => handleDeleteProject(proj.id, proj.title, e)}
                        title="Delete project"
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '8px',
                          border: '1px solid #F1F5F9',
                          background: 'transparent',
                          color: '#94A3B8',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: 0,
                          transition: 'all 150ms ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#FEF2F2';
                          e.currentTarget.style.borderColor = '#FCA5A5';
                          e.currentTarget.style.color = '#EF4444';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.borderColor = '#F1F5F9';
                          e.currentTarget.style.color = '#94A3B8';
                        }}
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : (
        /* GRID VIEW: 3-column card grid highlighting large 3D book covers */
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '16px'
          }}
        >
          {allCombinedProjects.map((proj) => {
            const isPrivate = proj.type === 'private' || proj.isPrivate;

            return (
              <div
                key={proj.id}
                onClick={() => setSelectedProject(proj)}
                style={{
                  background: '#FFFFFF',
                  borderRadius: '16px',
                  border: '1px solid #E2E8F0',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                  transition: 'all 180ms ease',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#BFDBFE';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(40, 61, 130, 0.1)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#E2E8F0';
                  e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.04)';
                  e.currentTarget.style.transform = 'none';
                }}
              >
                {/* Large 3D Book Cover Banner */}
                <div
                  style={{
                    width: '100%',
                    height: '160px',
                    position: 'relative',
                    background: '#F1F5F9',
                    overflow: 'hidden'
                  }}
                >
                  <img
                    src={proj.coverImage}
                    alt={proj.title}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      top: '10px',
                      left: '10px',
                      background: isPrivate ? 'rgba(21, 128, 61, 0.92)' : 'rgba(32, 52, 107, 0.92)',
                      backdropFilter: 'blur(6px)',
                      color: '#FFFFFF',
                      fontSize: '10px',
                      fontWeight: 800,
                      padding: '3px 8px',
                      borderRadius: '6px',
                      letterSpacing: '0.04em',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
                    }}
                  >
                    <span>{isPrivate ? 'SELF-DIRECTED' : `ASSIGNED • ${proj.educator}`}</span>
                  </div>
                </div>

                {/* Card Body */}
                <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <h3
                    style={{
                      fontFamily: 'var(--font-primary)',
                      fontSize: '15px',
                      lineHeight: '20px',
                      fontWeight: 700,
                      color: '#101828',
                      marginBottom: '8px'
                    }}
                  >
                    {proj.title}
                  </h3>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11.5px', color: '#64748B', marginBottom: '14px', flexWrap: 'wrap', gap: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2">
                        <rect x="3" y="3" width="7" height="7" rx="1.5" />
                        <rect x="14" y="3" width="7" height="7" rx="1.5" />
                        <rect x="3" y="14" width="7" height="7" rx="1.5" />
                        <rect x="14" y="14" width="7" height="7" rx="1.5" />
                      </svg>
                      <span>{proj.assignedDate}</span>
                    </div>

                    <span
                      style={{
                        background: '#F1F5F9',
                        padding: '1px 6px',
                        borderRadius: '4px',
                        fontWeight: 700,
                        fontSize: '9.5px',
                        color: '#475569'
                      }}
                    >
                      {proj.level}
                    </span>

                    <span>{proj.modulesCount} Modules</span>
                  </div>

                  {/* Yellow Button */}
                  <div style={{ marginTop: 'auto', display: 'flex', gap: '8px' }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenWorkspace(proj);
                      }}
                      style={{
                        flex: 1,
                        background: '#FEE047',
                        color: '#101D3B',
                        border: 'none',
                        borderRadius: '999px',
                        height: '36px',
                        fontFamily: 'var(--font-primary)',
                        fontSize: '12px',
                        fontWeight: 800,
                        cursor: 'pointer'
                      }}
                    >
                      {isPrivate ? 'Resume building' : 'Explore roadmap'}
                    </button>
                    {isPrivate && (
                      <button
                        onClick={(e) => handleDeleteProject(proj.id, proj.title, e)}
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '8px',
                          border: '1px solid #F1F5F9',
                          background: 'transparent',
                          color: '#94A3B8',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      </div>

      {/* 4. CURATED ROADMAP / PROJECT DETAIL MODAL */}
      {selectedProject && (
        <ModalPortal isOpen={true} onClose={() => setSelectedProject(null)}>
        <div
          style={{
            width: '560px',
            maxWidth: '92vw',
            maxHeight: '88vh',
            background: '#FFFFFF',
            borderRadius: '20px',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 24px 48px rgba(0, 0, 0, 0.22)'
          }}
          onClick={(e) => e.stopPropagation()}
        >
            {/* Modal Header with Project Book Visual */}
            <div
              style={{
                background: 'linear-gradient(135deg, #101D3B 0%, #20346B 100%)',
                padding: '24px',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                gap: '18px',
                position: 'relative'
              }}
            >
              <img
                src={selectedProject.coverImage}
                alt={selectedProject.title}
                style={{
                  width: '90px',
                  height: '60px',
                  borderRadius: '8px',
                  objectFit: 'cover',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
                  flexShrink: 0
                }}
              />

              <div style={{ flex: 1, minWidth: 0, paddingRight: '24px' }}>
                <span
                  style={{
                    background: selectedProject.isPrivate ? '#334155' : '#2563EB',
                    color: '#FFFFFF',
                    fontSize: '10px',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '4px',
                    letterSpacing: '0.04em'
                  }}
                >
                  {selectedProject.isPrivate ? 'PRIVATE WORKSPACE' : selectedProject.level}
                </span>
                <h2
                  style={{
                    fontFamily: 'var(--font-primary)',
                    fontSize: '18px',
                    fontWeight: 700,
                    margin: '6px 0 2px 0',
                    lineHeight: '22px'
                  }}
                >
                  {selectedProject.title}
                </h2>
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.75)' }}>
                  By {selectedProject.educator} · {selectedProject.assignedDate}
                </div>
              </div>

              <button
                onClick={() => setSelectedProject(null)}
                style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  background: 'rgba(255,255,255,0.15)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '28px',
                  height: '28px',
                  color: '#FFFFFF',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div>
                <h4 style={{ fontSize: '12px', fontWeight: 700, color: '#64748B', letterSpacing: '0.04em', margin: '0 0 6px 0' }}>
                  CURRICULUM OVERVIEW
                </h4>
                <p style={{ fontSize: '13px', lineHeight: '1.5', color: '#334155', margin: 0 }}>
                  {selectedProject.description}
                </p>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <h4 style={{ fontSize: '12px', fontWeight: 700, color: '#64748B', letterSpacing: '0.04em', margin: 0 }}>
                    MODULE ROADMAP ({selectedProject.modules?.length || selectedProject.modulesCount} CHAPTERS)
                  </h4>
                  <span style={{ fontSize: '11px', color: '#2563EB', fontWeight: 600 }}>Guided Milestone Path</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {selectedProject.modules?.map((mod, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '10px 14px',
                        background: '#F8FAFC',
                        borderRadius: '10px',
                        border: '1px solid #E2E8F0',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                      }}
                    >
                      <div
                        style={{
                          width: '22px',
                          height: '22px',
                          borderRadius: '50%',
                          background: idx === 0 ? '#20346B' : '#E2E8F0',
                          color: idx === 0 ? '#FFFFFF' : '#64748B',
                          fontSize: '11px',
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}
                      >
                        {idx + 1}
                      </div>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: '#1E293B', flex: 1 }}>
                        {mod}
                      </span>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2">
                        <polyline points="9 18 15 12 9 6"></polyline>
                      </svg>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div
              style={{
                padding: '16px 24px',
                background: '#F8FAFC',
                borderTop: '1px solid #E2E8F0',
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '10px'
              }}
            >
              <button
                onClick={() => setSelectedProject(null)}
                style={{
                  padding: '9px 18px',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  background: '#FFFFFF',
                  color: '#475569',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
              <button
                onClick={() => {
                  const p = selectedProject;
                  setSelectedProject(null);
                  handleOpenWorkspace(p);
                }}
                style={{
                  padding: '9px 24px',
                  borderRadius: '999px',
                  border: 'none',
                  background: '#FEE047',
                  color: '#101D3B',
                  fontFamily: 'var(--font-primary)',
                  fontSize: '13px',
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                {selectedProject.isPrivate ? 'Resume building' : 'Explore roadmap'}
              </button>
            </div>
          </div>
        </ModalPortal>
      )}

      {/* 5. CREATE NEW PROJECT & WAITING PUZZLE MODALS (Modern TrueSights Design System with Unique Polish) */}
      {isCreateModalOpen && (
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
                  Describe your topic and pick a complexity tier — your roadmap is generated for you.
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
                          color: researchTopic.length >= 110 ? '#EF4444' : '#9AA3B8'
                        }}
                      >
                        {researchTopic.length}/120
                      </span>
                    </div>

                    <textarea
                      id="research-topic-input"
                      rows={3}
                      maxLength={120}
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
                      disabled={!researchTopic.trim()}
                      style={{
                        width: '100%',
                        height: '46px',
                        borderRadius: '12px',
                        border: 'none',
                        background: !researchTopic.trim() ? '#E2E6EF' : '#FEE047',
                        color: !researchTopic.trim() ? '#94A3B8' : '#0F1219',
                        fontFamily: 'var(--font-primary)',
                        fontSize: '13px',
                        fontWeight: 800,
                        letterSpacing: '0.04em',
                        cursor: !researchTopic.trim() ? 'not-allowed' : 'pointer',
                        boxShadow: !researchTopic.trim() ? 'none' : '0 4px 14px rgba(254, 224, 71, 0.35)',
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
                      <span>GENERATE PROJECT ROADMAP</span>
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
                    ? `4 structured modules have been compiled for "${createdPendingProject?.title}". Launch directly into your workspace or attempt challenging puzzles.`
                    : "Attempt a difficult puzzle for 10 points, or head back to the dashboard — we'll let you know the moment your project is ready either way."}
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
                        {createdPendingProject?.title || 'Synthesizing Project'}
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
                        {createdPendingProject?.level}
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
                        ? 'All 4 modules compiled and ready for exploration.'
                        : 'Synthesizing curriculum syllabus and research topics in background...'}
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
                      {WAITING_PUZZLES[currentPuzzleIndex].title}
                    </h3>
                    <p
                      style={{
                        fontSize: '12px',
                        color: '#6B7790',
                        fontFamily: 'var(--font-primary)',
                        margin: '3px 0 0 0'
                      }}
                    >
                      {WAITING_PUZZLES[currentPuzzleIndex].subtitle}
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
                      {WAITING_PUZZLES[currentPuzzleIndex].difficulty}
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
                      +{WAITING_PUZZLES[currentPuzzleIndex].points} PTS
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
                    {WAITING_PUZZLES[currentPuzzleIndex].lines.map((line, idx) => (
                      <div key={idx}>{line}</div>
                    ))}
                  </div>

                  {/* Interactive Clue Toggle Button */}
                  <div style={{ display: 'flex', justifyContent: 'center', marginTop: '12px' }}>
                    <button
                      type="button"
                      onClick={() => setShowHint((prev) => !prev)}
                      style={{
                        background: showHint ? '#EEF2FF' : '#FFFFFF',
                        border: showHint ? '1px solid #C7D2FE' : '1px solid #E2E8F0',
                        color: showHint ? '#283D82' : '#64748B',
                        borderRadius: '7px',
                        padding: '3px 10px',
                        fontSize: '10.5px',
                        fontWeight: 700,
                        fontFamily: 'var(--font-primary)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <span>{showHint ? 'Hide Clue' : 'Need a clue?'}</span>
                    </button>
                  </div>

                  {/* Revealed Clue Card */}
                  {showHint && (
                    <div
                      style={{
                        marginTop: '10px',
                        padding: '8px 12px',
                        background: '#EFF6FF',
                        border: '1px solid #BFDBFE',
                        borderRadius: '8px',
                        fontSize: '11.5px',
                        color: '#1E40AF',
                        fontFamily: 'var(--font-primary)',
                        textAlign: 'center',
                        lineHeight: 1.45,
                        animation: 'modalContentPop 0.15s ease'
                      }}
                    >
                      <strong>Clue:</strong> {WAITING_PUZZLES[currentPuzzleIndex].hint}
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
                      YOUR ANSWER: {WAITING_PUZZLES[currentPuzzleIndex].questionPrompt}
                    </label>
                  </div>

                  <div style={{ display: 'flex', gap: '10px' }}>
                    <input
                      id="puzzle-answer-input"
                      ref={puzzleInputRef}
                      type="text"
                      placeholder={`Type your answer (e.g. ${WAITING_PUZZLES[currentPuzzleIndex].id})...`}
                      value={puzzleAnswer}
                      onChange={(e) => setPuzzleAnswer(e.target.value)}
                      disabled={solvedPuzzleIds.includes(WAITING_PUZZLES[currentPuzzleIndex].id)}
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
                      disabled={!puzzleAnswer.trim() || solvedPuzzleIds.includes(WAITING_PUZZLES[currentPuzzleIndex].id)}
                      style={{
                        height: '44px',
                        padding: '0 22px',
                        borderRadius: '10px',
                        border: 'none',
                        background:
                          !puzzleAnswer.trim() || solvedPuzzleIds.includes(WAITING_PUZZLES[currentPuzzleIndex].id)
                            ? '#E2E6EF'
                            : '#FEE047',
                        color:
                          !puzzleAnswer.trim() || solvedPuzzleIds.includes(WAITING_PUZZLES[currentPuzzleIndex].id)
                            ? '#94A3B8'
                            : '#0F1219',
                        fontFamily: 'var(--font-primary)',
                        fontSize: '12px',
                        fontWeight: 800,
                        letterSpacing: '0.06em',
                        textTransform: 'uppercase',
                        whiteSpace: 'nowrap',
                        cursor:
                          !puzzleAnswer.trim() || solvedPuzzleIds.includes(WAITING_PUZZLES[currentPuzzleIndex].id)
                            ? 'not-allowed'
                            : 'pointer',
                        boxShadow:
                          !puzzleAnswer.trim() || solvedPuzzleIds.includes(WAITING_PUZZLES[currentPuzzleIndex].id)
                            ? 'none'
                            : '0 3px 10px rgba(254, 224, 71, 0.35)',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {solvedPuzzleIds.includes(WAITING_PUZZLES[currentPuzzleIndex].id) ? 'SOLVED ✓' : 'SUBMIT'}
                    </button>
                  </div>
                </form>

                {/* Solved Celebration Box (Offers Next Puzzle immediately) */}
                {solvedPuzzleIds.includes(WAITING_PUZZLES[currentPuzzleIndex].id) && (
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
                          Correct! The answer is "{WAITING_PUZZLES[currentPuzzleIndex].acceptedAnswers[0]}".
                        </div>
                        <div style={{ fontSize: '10.5px', color: '#047857', fontFamily: 'var(--font-primary)' }}>
                          +10 Points credited to your wallet!
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
                {puzzleFeedback && puzzleFeedback.type === 'error' && (
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
                    <span>{puzzleFeedback.message}</span>
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
                        4 modules generated for "{createdPendingProject?.title}".
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
      )}

      {/* 6. TOAST NOTIFICATION */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            backgroundColor: '#1E293B',
            color: '#FFFFFF',
            padding: '10px 18px',
            borderRadius: '10px',
            fontSize: '13px',
            fontWeight: 500,
            fontFamily: 'var(--font-primary)',
            boxShadow: '0 8px 20px rgba(0,0,0,0.18)',
            zIndex: 2000
          }}
        >
          {toastMessage}
        </div>
      )}
    </div>
  );
}
