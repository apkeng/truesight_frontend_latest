import React, { useState, useEffect, useMemo } from 'react';
import Icon from '../design-system/icons';
import ModalPortal from './ModalPortal';

// ============================================================================
// VERIFIED PEERS DATABASE FOR DIRECT ENGAGEMENT
// ============================================================================
const VERIFIED_PEERS = [
  {
    id: 'peer-1',
    name: 'Sandeep C',
    email: 'sandeep.c@campus.edu',
    dept: 'Electronics & Communication · Sem 6',
    avatar: '/assets/user-profile.jpg',
    points: 2480,
    rank: '#12 in Institute'
  },
  {
    id: 'peer-2',
    name: 'Roshan Thomas',
    email: 'roshan.t@campus.edu',
    dept: 'Civil & Urban Planning · Sem 8',
    avatar: '/assets/student-avatar.jpg',
    points: 1890,
    rank: '#28 in Institute'
  },
  {
    id: 'peer-3',
    name: 'Ananya Sharma',
    email: 'ananya.s@campus.edu',
    dept: 'Computer Science · Sem 4',
    avatar: '/assets/user-profile.jpg',
    points: 3120,
    rank: '#4 in Institute'
  },
  {
    id: 'peer-4',
    name: 'Testing Student',
    email: 'test.student@campus.edu',
    dept: 'Applied Physics & Nanotech · Sem 6',
    avatar: '/assets/student-avatar.jpg',
    points: 2150,
    rank: '#19 in Institute'
  },
  {
    id: 'peer-5',
    name: 'Devika Menon',
    email: 'devika.m@campus.edu',
    dept: 'Signal Processing & Telecom · Sem 6',
    avatar: '/assets/user-profile.jpg',
    points: 2230,
    rank: '#16 in Institute'
  },
  {
    id: 'peer-6',
    name: 'Karthik R',
    email: 'karthik.r@campus.edu',
    dept: 'Cybersecurity & CTF · Sem 8',
    avatar: '/assets/student-avatar.jpg',
    points: 2750,
    rank: '#8 in Institute'
  }
];

// ============================================================================
// ACADEMIC DOMAINS & CURATED QUESTION HARNESSES
// ============================================================================
const ACADEMIC_DOMAINS = [
  {
    id: 'physics-energy',
    name: 'Nuclear Engineering & Reactor Dynamics',
    topics: [
      { id: 'fission-energy', title: 'Energy Release in Fission', questionsKey: 'fission' },
      { id: 'fission-mech', title: 'Mechanism of Fission', questionsKey: 'fission' },
      { id: 'delayed-neutrons', title: 'Delayed Neutrons & Core Control', questionsKey: 'fission' }
    ]
  },
  {
    id: 'civil-urban',
    name: 'Kerala Building By-Laws & Urban Governance (2025)',
    topics: [
      { id: 'ksmart-permits', title: 'Risk-Based Permitting & K-SMART Self-Certification', questionsKey: 'kerala' },
      { id: 'slope-geotech', title: 'Topographical Slope Stability & Hill Terrains', questionsKey: 'kerala' },
      { id: 'rainwater-cistern', title: 'Environmental Rainwater Harvesting Standards', questionsKey: 'kerala' }
    ]
  },
  {
    id: 'electronics-semi',
    name: 'Electronic Devices & Semiconductor Physics',
    topics: [
      { id: 'iv-curve', title: 'The I-V Characteristic Curve', questionsKey: 'semi' },
      { id: 'semi-basics', title: 'Semiconductor Basics & Dopant Bands', questionsKey: 'semi' },
      { id: 'zener-tunneling', title: 'Quantum Tunneling & Zener Breakdown', questionsKey: 'semi' }
    ]
  },
  {
    id: 'ecology-env',
    name: 'Environmental Sciences & Biodiversity',
    topics: [
      { id: 'biodiversity-hotspots', title: 'Biodiversity Hotspots & Conservation Endemism', questionsKey: 'ecology' },
      { id: 'carbon-cycling', title: 'Wetland Carbon Sinks & Sequestration', questionsKey: 'ecology' }
    ]
  },
  {
    id: 'cloud-dsp',
    name: 'Signal Processing & Distributed Bio-Informatics',
    topics: [
      { id: 'dsp-filters', title: 'Digital Signal Processing & FIR Filters', questionsKey: 'dsp' },
      { id: 'neuro-storage', title: 'Decentralized Storage for Neuroimaging', questionsKey: 'dsp' }
    ]
  }
];

// Curated questions database for realistic challenge simulation
const QUESTIONS_DATABASE = {
  fission: [
    {
      id: 'q-f1',
      question: 'What is the average energy liberated per single U-235 thermal neutron fission event?',
      options: [
        { letter: 'A', text: 'Approximately 200 MeV, predominantly partitioned into kinetic energy of fragments' },
        { letter: 'B', text: 'Approximately 13.6 eV corresponding to atomic ionization potential' },
        { letter: 'C', text: 'Exactly 1.022 MeV equivalent to electron-positron pair creation' },
        { letter: 'D', text: 'Over 10 GeV released entirely in instantaneous prompt neutrinos' }
      ],
      correctIndex: 0,
      explanation: 'Each thermal fission of U-235 liberates ~200 MeV: ~168 MeV as fragment kinetic energy, ~5 MeV in prompt neutrons, ~7 MeV in prompt gammas, with the remainder in beta/neutrino decay.'
    },
    {
      id: 'q-f2',
      question: 'What role do delayed neutrons play in safe nuclear fission reactor control?',
      options: [
        { letter: 'A', text: 'They increase core thermal power by a factor of 100 within milliseconds' },
        { letter: 'B', text: 'They lengthen the effective neutron generation lifetime, allowing mechanical control rods to regulate power' },
        { letter: 'C', text: 'They completely absorb prompt neutrons to cause emergency shutdown' },
        { letter: 'D', text: 'They convert non-fissile Boron into fissile Uranium isotopes' }
      ],
      correctIndex: 1,
      explanation: 'Delayed neutrons (~0.65% in U-235) are emitted seconds after precursor beta decays, stretching reactor response time from microseconds to seconds so mechanical rods can maintain criticality.'
    },
    {
      id: 'q-f3',
      question: 'In the liquid drop model of nuclear fission, what competing forces govern fissility?',
      options: [
        { letter: 'A', text: 'Gravitational attraction vs centrifugal rotational force' },
        { letter: 'B', text: 'Surface tension (attractive nuclear force) vs Coulomb electrostatic repulsion' },
        { letter: 'C', text: 'Strong force vs electroweak Higgs boson coupling' },
        { letter: 'D', text: 'Van der Waals inter-nucleon forces vs magnetic dipoles' }
      ],
      correctIndex: 1,
      explanation: 'Nuclear surface tension pulls the nucleus into a spherical drop, while electrostatic proton repulsion drives deformation toward scission.'
    },
    {
      id: 'q-f4',
      question: 'Which fission product isotope presents the highest thermal neutron absorption cross-section (fission poison)?',
      options: [
        { letter: 'A', text: 'Xenon-135 with ~2.6 million barns cross-section' },
        { letter: 'B', text: 'Cesium-137 with 0.25 barns' },
        { letter: 'C', text: 'Iodine-131 with negligible thermal absorption' },
        { letter: 'D', text: 'Strontium-90 with pure beta emission' }
      ],
      correctIndex: 0,
      explanation: 'Xe-135 is the strongest known thermal neutron absorber, producing transient reactor poisoning following power reductions.'
    },
    {
      id: 'q-f5',
      question: 'What defines the reproduction factor (k-effective) in a sustained critical reactor assembly?',
      options: [
        { letter: 'A', text: 'k = 0 (complete neutron vacuum)' },
        { letter: 'B', text: 'k = 1.0 (neutron generation rate exactly balances absorption and leakage)' },
        { letter: 'C', text: 'k > 2.5 (exponential explosive runaway)' },
        { letter: 'D', text: 'k = 0.5 (decaying subcritical assembly)' }
      ],
      correctIndex: 1,
      explanation: 'At exact criticality (k_eff = 1.0), each fission generation produces exactly one subsequent fission neutron, sustaining constant power.'
    }
  ],
  kerala: [
    {
      id: 'q-k1',
      question: 'Under Kerala Building Rules 2025, which residential buildings qualify for K-SMART self-certification deemed approval?',
      options: [
        { letter: 'A', text: 'Low-risk residential constructions with built-up area up to 300 sq.m certified by registered professionals' },
        { letter: 'B', text: 'Any commercial high-rise over 15 meters' },
        { letter: 'C', text: 'Properties situated inside Coastal Regulation Zone CRZ-1' },
        { letter: 'D', text: 'All government hospitals regardless of structural floor plans' }
      ],
      correctIndex: 0,
      explanation: 'Low-risk single family and two-unit residences up to 300 sq.m obtain instantaneous digital permits upon architect self-certification.'
    },
    {
      id: 'q-k2',
      question: 'At what natural terrain slope gradient do the 2025 rules mandate certified geotechnical slope stability analysis?',
      options: [
        { letter: 'A', text: 'Any flat terrain below 5 degrees' },
        { letter: 'B', text: 'Slopes exceeding 25 degrees natural gradient prior to excavation' },
        { letter: 'C', text: 'Only when constructing on municipal reclaimed wetlands' },
        { letter: 'D', text: 'Optional advisory guideline without statutory enforcement' }
      ],
      correctIndex: 1,
      explanation: 'In hilly revenue villages, terrain slope exceeding 25 degrees triggers compulsory geotechnical borehole investigations and engineered retaining structures.'
    },
    {
      id: 'q-k3',
      question: 'What is the statutory minimum rainwater harvesting storage capacity per square meter of roof catchment area?',
      options: [
        { letter: 'A', text: 'Minimum 50 liters per sq.m of effective rooftop catchment' },
        { letter: 'B', text: '10 liters per sq.m only if piped water is absent' },
        { letter: 'C', text: 'A single flat 200-liter drum irrespective of roof footprint' },
        { letter: 'D', text: 'No rainwater harvesting required if connected to municipal lines' }
      ],
      correctIndex: 0,
      explanation: 'Mandatory environmental compliance requires at least 50 liters of dedicated cistern storage or ground recharge per sq.m of roof area.'
    },
    {
      id: 'q-k4',
      question: 'What is the primary role of the K-SMART automated scrutiny engine in permit applications?',
      options: [
        { letter: 'A', text: 'Eliminates structural safety norms completely' },
        { letter: 'B', text: 'Automates CAD rule-checking, setback verification, and eliminates manual clerical delays' },
        { letter: 'C', text: 'Transfers local authority jurisdiction to central defense ministry' },
        { letter: 'D', text: 'Increases processing fees based on builder revenue' }
      ],
      correctIndex: 1,
      explanation: 'K-SMART delivers automated CAD drawing validation against FAR, coverage, and setback bylaws with end-to-end transparent telemetry.'
    },
    {
      id: 'q-k5',
      question: 'What mandatory fire safety installation is enforced for mixed-use buildings exceeding 15 meters in height?',
      options: [
        { letter: 'A', text: 'Automated wet riser fire pumps, monitored smoke dampers, and real-time telemetry dispatch' },
        { letter: 'B', text: 'Only one manual water bucket per floor' },
        { letter: 'C', text: 'Wooden unrated fire doors' },
        { letter: 'D', text: 'Exterior spiral rope ladders' }
      ],
      correctIndex: 0,
      explanation: 'High-occupancy and 15m+ structures require automated wet risers, certified two-hour fire doors, and synchronized central fire dispatch telemetry.'
    }
  ],
  semi: [
    {
      id: 'q-s1',
      question: 'What occurs across the depletion layer of a PN junction diode under reverse bias?',
      options: [
        { letter: 'A', text: 'Width widens as majority carriers are drawn away from the metallurgical junction' },
        { letter: 'B', text: 'Depletion region completely collapses into an ohmic short circuit' },
        { letter: 'C', text: 'Direct recombination rate increases by 1000%' },
        { letter: 'D', text: 'Current increases exponentially with reverse voltage' }
      ],
      correctIndex: 0,
      explanation: 'Under reverse bias, external positive and negative terminals pull mobile electrons and holes away from the junction, widening the unneutralized space charge zone.'
    },
    {
      id: 'q-s2',
      question: 'At room temperature (300K), what is the typical forward knee threshold for silicon PN junctions?',
      options: [
        { letter: 'A', text: 'Approximately 0.2V to 0.3V (Germanium value)' },
        { letter: 'B', text: 'Approximately 0.6V to 0.7V' },
        { letter: 'C', text: 'Over 2.5V' },
        { letter: 'D', text: 'Zero volts (ideal diode)' }
      ],
      correctIndex: 1,
      explanation: 'Silicon has an intrinsic bandgap of 1.12 eV, producing a built-in junction potential of ~0.65V to 0.7V at standard ambient temperature.'
    },
    {
      id: 'q-s3',
      question: 'What physical mechanism triggers Zener breakdown in heavily doped silicon junctions (< 5.6V)?',
      options: [
        { letter: 'A', text: 'Quantum mechanical tunneling of valence electrons across the ultra-thin barrier' },
        { letter: 'B', text: 'Thermionic runaway and silicon lattice melting' },
        { letter: 'C', text: 'Impact ionization avalanche cascading' },
        { letter: 'D', text: 'Electrochemical contact corrosion' }
      ],
      correctIndex: 0,
      explanation: 'Heavy doping creates an extremely narrow depletion barrier (<10 nm), enabling direct quantum mechanical tunneling without avalanche multiplication.'
    },
    {
      id: 'q-s4',
      question: 'How does thermal leakage current scale with temperature in silicon diodes?',
      options: [
        { letter: 'A', text: 'Decreases linearly with temperature rise' },
        { letter: 'B', text: 'Doubles approximately every 10°C temperature increase' },
        { letter: 'C', text: 'Remains strictly constant at all temperatures' },
        { letter: 'D', text: 'Drops to absolute zero above 50°C' }
      ],
      correctIndex: 1,
      explanation: 'Minority carrier thermal generation rate scales exponentially with temperature, doubling roughly every 10°C in silicon.'
    },
    {
      id: 'q-s5',
      question: 'In the Shockley diode equation, what is the thermal voltage Vt at 300 Kelvin?',
      options: [
        { letter: 'A', text: '0.7 V' },
        { letter: 'B', text: 'Approximately 25.85 mV (~26 mV)' },
        { letter: 'C', text: '1.5 V' },
        { letter: 'D', text: '12 V' }
      ],
      correctIndex: 1,
      explanation: 'Thermal voltage Vt = (k * T) / q ≈ (1.38e-23 * 300) / 1.6e-19 ≈ 25.85 mV.'
    }
  ],
  ecology: [
    {
      id: 'q-e1',
      question: 'What criteria define an official Myers Biodiversity Hotspot?',
      options: [
        { letter: 'A', text: 'At least 1,500 endemic vascular plant species and lost at least 70% of primary native vegetation' },
        { letter: 'B', text: 'Any national park containing tigers or lions' },
        { letter: 'C', text: 'Agricultural farmlands with high crop diversity' },
        { letter: 'D', text: 'Urban green corridors with ornamental tree coverage' }
      ],
      correctIndex: 0,
      explanation: 'Norman Myers criteria require exceptional plant endemism (≥1,500 endemic species) combined with severe habitat destruction (≥70% primary habitat lost).'
    },
    {
      id: 'q-e2',
      question: 'Which global biodiversity hotspot encompasses the southern tip of India and Sri Lanka?',
      options: [
        { letter: 'A', text: 'The Western Ghats and Sri Lanka' },
        { letter: 'B', text: 'The Mediterranean Basin' },
        { letter: 'C', text: 'The Succulent Karoo' },
        { letter: 'D', text: 'The Cerrado' }
      ],
      correctIndex: 0,
      explanation: 'The Western Ghats hotspot harbors immense tropical wet evergreen forest endemism including the Lion-tailed macaque and Nilgiri tahr.'
    },
    {
      id: 'q-e3',
      question: 'Why are mangrove wetlands designated as primary "blue carbon" ecosystems?',
      options: [
        { letter: 'A', text: 'They release carbon into the atmosphere faster than industrial power plants' },
        { letter: 'B', text: 'Their anaerobic sediments sequester carbon up to 4x faster than terrestrial tropical forests' },
        { letter: 'C', text: 'They only absorb carbon during nighttime low tides' },
        { letter: 'D', text: 'They reflect solar radiation without photosynthesis' }
      ],
      correctIndex: 1,
      explanation: 'Mangrove soils feature waterlogged, low-oxygen conditions that prevent organic decomposition, trapping organic carbon for millennia.'
    },
    {
      id: 'q-e4',
      question: 'What is the principal ecological consequence of habitat fragmentation in high-endemism zones?',
      options: [
        { letter: 'A', text: 'Elevated edge effects, reproductive isolation, and genetic drift leading to inbreeding depression' },
        { letter: 'B', text: 'Instantaneous evolution of hyper-tolerant species' },
        { letter: 'C', text: 'Elimination of all predatory interactions' },
        { letter: 'D', text: 'Uniform increase in species populations' }
      ],
      correctIndex: 0,
      explanation: 'Fragmentation produces microclimate alterations at forest boundaries and disrupts gene flow, drastically elevating local extinction risk.'
    },
    {
      id: 'q-e5',
      question: 'Under the IUCN Red List classification, which category directly precedes "Extinct in the Wild"?',
      options: [
        { letter: 'A', text: 'Critically Endangered (CR)' },
        { letter: 'B', text: 'Near Threatened (NT)' },
        { letter: 'C', text: 'Vulnerable (VU)' },
        { letter: 'D', text: 'Least Concern (LC)' }
      ],
      correctIndex: 0,
      explanation: 'The hierarchy of threat is Least Concern -> Near Threatened -> Vulnerable -> Endangered -> Critically Endangered -> Extinct in the Wild -> Extinct.'
    }
  ],
  dsp: [
    {
      id: 'q-d1',
      question: 'Why are Finite Impulse Response (FIR) digital filters inherently stable?',
      options: [
        { letter: 'A', text: 'Their transfer function poles are located exclusively at the origin (z = 0) of the z-plane' },
        { letter: 'B', text: 'They rely exclusively on analog operational amplifiers' },
        { letter: 'C', text: 'They require non-linear feedback loops' },
        { letter: 'D', text: 'They amplify all high frequency noise infinitely' }
      ],
      correctIndex: 0,
      explanation: 'FIR filters are all-zero systems with all poles strictly at z = 0, meaning bounded inputs unconditionally yield bounded outputs (BIBO stability).'
    },
    {
      id: 'q-d2',
      question: 'What mathematical symmetry condition is required for an FIR filter to exhibit exact linear phase response?',
      options: [
        { letter: 'A', text: 'Filter impulse coefficients must be symmetric or anti-symmetric around the midpoint: h[n] = ±h[N-1-n]' },
        { letter: 'B', text: 'All coefficients must be prime numbers' },
        { letter: 'C', text: 'The filter order must always be an odd multiple of 3' },
        { letter: 'D', text: 'The impulse response must decay exponentially to zero' }
      ],
      correctIndex: 0,
      explanation: 'Even or odd symmetry around the filter center guarantees constant group delay, preserving waveform shape without phase distortion.'
    },
    {
      id: 'q-d3',
      question: 'According to the Nyquist-Shannon sampling theorem, what is the minimum sampling frequency required to reconstruct a signal with maximum bandwidth B?',
      options: [
        { letter: 'A', text: 'Fs ≥ 2 * B to prevent spectral aliasing' },
        { letter: 'B', text: 'Fs = B / 2' },
        { letter: 'C', text: 'Fs = B^2' },
        { letter: 'D', text: 'Fs must be infinite' }
      ],
      correctIndex: 0,
      explanation: 'Sampling at least twice the highest frequency component (Fs ≥ 2*B) prevents adjacent spectral copies from overlapping in the frequency domain.'
    },
    {
      id: 'q-d4',
      question: 'In decentralized neuroimaging archival (IPFS / content addressing), how are multi-gigabyte MRI volumes uniquely referenced?',
      options: [
        { letter: 'A', text: 'Through cryptographic Content Identifiers (CIDs) derived from cryptographic SHA-256 / Blake3 hashing' },
        { letter: 'B', text: 'Using static IP addresses hardcoded into the scanner' },
        { letter: 'C', text: 'Through random integer file numbering on a single server' },
        { letter: 'D', text: 'By storing MRI raw pixels directly in email headers' }
      ],
      correctIndex: 0,
      explanation: 'Content addressing hashes the file bytes into a unique CID, guaranteeing tamper-proof verification and deduplication across peer nodes.'
    },
    {
      id: 'q-d5',
      question: 'What window function achieves the steepest roll-off at the expense of wider transition width in FIR filter design?',
      options: [
        { letter: 'A', text: 'Blackman or Kaiser window' },
        { letter: 'B', text: 'Rectangular window' },
        { letter: 'C', text: 'Dirac delta window' },
        { letter: 'D', text: 'Unit step window' }
      ],
      correctIndex: 0,
      explanation: 'Blackman and adjustable Kaiser windows heavily attenuate Gibbs phenomenon sidelobes (>-74 dB), delivering sharp stopband rejection.'
    }
  ]
};

// ============================================================================
// INITIAL SEED CHALLENGES MATCHING FIGMA NODE 210:53374
// ============================================================================
const INITIAL_CHALLENGES = [
  // 1. My Challenges (Sent Direct Invites)
  {
    id: 'ch-1',
    type: 'sent', // sent direct invite
    topic: 'Energy Release in Fission',
    domain: 'Nuclear Engineering & Reactor Dynamics',
    questionsKey: 'fission',
    opponent: {
      name: 'Sandeep C',
      email: 'sandeep.c@campus.edu',
      dept: 'Electronics & Communication',
      avatar: '/assets/user-profile.jpg'
    },
    status: 'pending', // 'pending' | 'active' | 'expired' | 'finished'
    mode: 'Any time',
    expires: '23h 13m',
    createdAt: 'Today, 11:20 AM',
    userScore: null,
    opponentScore: null
  },
  {
    id: 'ch-2',
    type: 'sent',
    topic: 'Mechanism of Fission',
    domain: 'Nuclear Engineering & Reactor Dynamics',
    questionsKey: 'fission',
    opponent: {
      name: 'Testing Student',
      email: 'test.student@campus.edu',
      dept: 'Applied Physics & Nanotech',
      avatar: '/assets/student-avatar.jpg'
    },
    status: 'pending',
    mode: 'Any time',
    expires: 'Terminated',
    createdAt: 'Yesterday, 04:45 PM',
    userScore: null,
    opponentScore: null
  },
  {
    id: 'ch-3',
    type: 'sent',
    topic: 'Biodiversity Hotspots & Conservation Endemism',
    domain: 'Environmental Sciences & Biodiversity',
    questionsKey: 'ecology',
    opponent: {
      name: 'Roshan Thomas',
      email: 'roshan.t@campus.edu',
      dept: 'Civil & Urban Planning',
      avatar: '/assets/student-avatar.jpg'
    },
    status: 'expired',
    mode: 'Any time',
    expires: 'Terminated',
    createdAt: '02 Oct 2026',
    userScore: null,
    opponentScore: null
  },
  {
    id: 'ch-4',
    type: 'sent',
    topic: 'The I-V Characteristic Curve',
    domain: 'Electronic Devices & Semiconductor Physics',
    questionsKey: 'semi',
    opponent: {
      name: 'Ananya Sharma',
      email: 'ananya.s@campus.edu',
      dept: 'Computer Science',
      avatar: '/assets/user-profile.jpg'
    },
    status: 'active',
    mode: 'Any time',
    expires: '18h 45m',
    createdAt: 'Today, 09:15 AM',
    userScore: null,
    opponentScore: { points: 16, correct: 4, total: 5, timeTaken: '02:40' }
  },

  // 2. Incoming Requests (Received from peers waiting for your acceptance)
  {
    id: 'ch-req-1',
    type: 'received',
    topic: 'Risk-Based Permitting & K-SMART Self-Certification',
    domain: 'Kerala Building By-Laws & Urban Governance (2025)',
    questionsKey: 'kerala',
    opponent: {
      name: 'Sandeep C',
      email: 'sandeep.c@campus.edu',
      dept: 'Electronics & Communication',
      avatar: '/assets/user-profile.jpg'
    },
    status: 'request',
    mode: 'Any time',
    expires: '21h 30m',
    createdAt: '2 hours ago',
    opponentScore: { points: 20, correct: 4, total: 5, timeTaken: '02:15' }
  },
  {
    id: 'ch-req-2',
    type: 'received',
    topic: 'Digital Signal Processing & FIR Filters',
    domain: 'Signal Processing & Distributed Bio-Informatics',
    questionsKey: 'dsp',
    opponent: {
      name: 'Devika Menon',
      email: 'devika.m@campus.edu',
      dept: 'Signal Processing & Telecom',
      avatar: '/assets/user-profile.jpg'
    },
    status: 'request',
    mode: 'Any time',
    expires: '14h 10m',
    createdAt: '5 hours ago',
    opponentScore: { points: 15, correct: 3, total: 5, timeTaken: '03:05' }
  },

  // 3. Finished Challenges (Completed with full comparative scores)
  {
    id: 'ch-fin-1',
    type: 'sent',
    topic: 'Decentralized Storage for Neuroimaging',
    domain: 'Signal Processing & Distributed Bio-Informatics',
    questionsKey: 'dsp',
    opponent: {
      name: 'Sandeep C',
      email: 'sandeep.c@campus.edu',
      dept: 'Electronics & Communication',
      avatar: '/assets/user-profile.jpg'
    },
    status: 'finished',
    mode: 'Any time',
    expires: 'Completed',
    createdAt: '03 Oct 2026',
    userAnswers: [0, 0, 0, 0, 0],
    opponentAnswers: [0, 0, 0, 0, 1],
    userScore: { points: 25, correct: 5, total: 5, timeTaken: '01:50', won: true },
    opponentScore: { points: 18, correct: 4, total: 5, timeTaken: '02:30', won: false }
  },
  {
    id: 'ch-fin-2',
    type: 'received',
    topic: 'Quantum Tunneling & Zener Breakdown',
    domain: 'Electronic Devices & Semiconductor Physics',
    questionsKey: 'semi',
    opponent: {
      name: 'Roshan Thomas',
      email: 'roshan.t@campus.edu',
      dept: 'Civil & Urban Planning',
      avatar: '/assets/student-avatar.jpg'
    },
    status: 'finished',
    mode: 'Any time',
    expires: 'Completed',
    createdAt: '01 Oct 2026',
    userAnswers: [0, 1, 0, 1, 0],
    opponentAnswers: [0, 1, 0, 0, 2],
    userScore: { points: 18, correct: 4, total: 5, timeTaken: '02:10', won: true },
    opponentScore: { points: 12, correct: 3, total: 5, timeTaken: '02:45', won: false }
  }
];

// ============================================================================
// MAIN COMPONENT: CHALLENGES PAGE
// ============================================================================
export default function ChallengesPage({ onBackToDashboard, onAwardPoints, onViewResults }) {
  // Navigation & Filter Tab state ('my-challenges' | 'requests' | 'active' | 'finished')
  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlTab = params.get('tab');
      if (['my-challenges', 'requests', 'active', 'finished'].includes(urlTab)) {
        return urlTab;
      }
    }
    return 'my-challenges';
  });
  const [challenges, setChallenges] = useState(INITIAL_CHALLENGES);
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

  // New Challenge Modal State
  const [isNewChallengeModalOpen, setIsNewChallengeModalOpen] = useState(false);
  const [selectedDomainId, setSelectedDomainId] = useState(ACADEMIC_DOMAINS[0].id);
  const [selectedTopicId, setSelectedTopicId] = useState(ACADEMIC_DOMAINS[0].topics[0].id);
  const [searchPeerQuery, setSearchPeerQuery] = useState('');
  const [selectedPeer, setSelectedPeer] = useState(null);
  const [isPeerDropdownOpen, setIsPeerDropdownOpen] = useState(false);

  // Active Challenge Runner (In-Quiz Engine) State
  const [activeQuizChallenge, setActiveQuizChallenge] = useState(null);
  const [quizPhase, setQuizPhase] = useState('loading'); // 'loading' | 'testing' | 'results'
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [timerSeconds, setTimerSeconds] = useState(25);
  const [isTimerPaused, setIsTimerPaused] = useState(false);
  const [quizResultSummary, setQuizResultSummary] = useState(null);
  const [activeReviewIndex, setActiveReviewIndex] = useState(0);
  const [reviewViewMode, setReviewViewMode] = useState('inspector'); // 'inspector' | 'matrix'

  // Comparative Review Modal State for Finished challenges
  const [selectedComparisonModal, setSelectedComparisonModal] = useState(null);

  // Derive detailed question-by-question comparative breakdown for Finished modal
  const comparisonQuestions = useMemo(() => {
    if (!selectedComparisonModal) return [];
    const key = selectedComparisonModal.questionsKey || 'kerala';
    const questions = QUESTIONS_DATABASE[key] || QUESTIONS_DATABASE.kerala;

    const userCorrectTarget = selectedComparisonModal.userScore?.correct ?? questions.length;
    const oppCorrectTarget = selectedComparisonModal.opponentScore?.correct ?? Math.max(1, questions.length - 1);

    return questions.map((q, idx) => {
      let userAnsIdx;
      if (selectedComparisonModal.userAnswers && selectedComparisonModal.userAnswers[idx] !== undefined) {
        userAnsIdx = selectedComparisonModal.userAnswers[idx];
      } else {
        userAnsIdx = idx < userCorrectTarget ? q.correctIndex : (q.correctIndex + 1) % q.options.length;
      }

      let oppAnsIdx;
      if (selectedComparisonModal.opponentAnswers && selectedComparisonModal.opponentAnswers[idx] !== undefined) {
        oppAnsIdx = selectedComparisonModal.opponentAnswers[idx];
      } else {
        oppAnsIdx = idx < oppCorrectTarget ? q.correctIndex : (q.correctIndex + 1) % q.options.length;
      }

      const userOpt = q.options[userAnsIdx] || q.options[0];
      const oppOpt = q.options[oppAnsIdx] || q.options[0];
      const correctOpt = q.options[q.correctIndex] || q.options[0];

      return {
        qNum: idx + 1,
        question: q.question,
        options: q.options,
        correctIndex: q.correctIndex,
        correctOpt,
        userAnsIdx,
        userOpt,
        isUserCorrect: userAnsIdx === q.correctIndex,
        oppAnsIdx,
        oppOpt,
        isOppCorrect: oppAnsIdx === q.correctIndex,
        explanation: q.explanation
      };
    });
  }, [selectedComparisonModal]);

  const comparisonStats = useMemo(() => {
    if (!comparisonQuestions.length) {
      return { total: 0, bothCorrect: 0, userAdvantage: 0, oppAdvantage: 0, bothMissed: 0 };
    }
    let bothCorrect = 0;
    let userAdvantage = 0;
    let oppAdvantage = 0;
    let bothMissed = 0;

    comparisonQuestions.forEach((cq) => {
      if (cq.isUserCorrect && cq.isOppCorrect) bothCorrect++;
      else if (cq.isUserCorrect && !cq.isOppCorrect) userAdvantage++;
      else if (!cq.isUserCorrect && cq.isOppCorrect) oppAdvantage++;
      else bothMissed++;
    });

    return {
      total: comparisonQuestions.length,
      bothCorrect,
      userAdvantage,
      oppAdvantage,
      bothMissed
    };
  }, [comparisonQuestions]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3200);
  };

  // Search state for filtering challenges by topic or opponent
  const [challengeSearchQuery, setChallengeSearchQuery] = useState('');

  // Helper to filter items by search query
  const filterBySearch = (list) => {
    if (!challengeSearchQuery.trim()) return list;
    const q = challengeSearchQuery.toLowerCase().trim();
    return list.filter((c) =>
      c.topic?.toLowerCase().includes(q) ||
      c.domain?.toLowerCase().includes(q) ||
      c.opponent?.name?.toLowerCase().includes(q)
    );
  };

  // Filtered lists for each tab
  const myChallengesList = useMemo(() => {
    return filterBySearch(challenges.filter((c) => c.type === 'sent'));
  }, [challenges, challengeSearchQuery]);

  const requestsList = useMemo(() => {
    return filterBySearch(challenges.filter((c) => c.status === 'request'));
  }, [challenges, challengeSearchQuery]);

  const activeList = useMemo(() => {
    return filterBySearch(challenges.filter((c) => c.status === 'active'));
  }, [challenges, challengeSearchQuery]);

  const finishedList = useMemo(() => {
    return filterBySearch(challenges.filter((c) => c.status === 'finished'));
  }, [challenges, challengeSearchQuery]);

  // Current domain & topics mapping
  const currentDomainObj = useMemo(() => {
    return ACADEMIC_DOMAINS.find((d) => d.id === selectedDomainId) || ACADEMIC_DOMAINS[0];
  }, [selectedDomainId]);

  // Filtered peers based on search query
  const filteredPeers = useMemo(() => {
    if (!searchPeerQuery.trim()) return VERIFIED_PEERS;
    const q = searchPeerQuery.toLowerCase().trim();
    return VERIFIED_PEERS.filter(
      (p) => p.name.toLowerCase().includes(q) || p.email.toLowerCase().includes(q) || p.dept.toLowerCase().includes(q)
    );
  }, [searchPeerQuery]);

  // Handler: Authorize and dispatch new peer challenge
  const handleAuthorizeChallenge = () => {
    if (!selectedPeer) {
      showToast('Please search and select a verified peer to authorize the challenge.');
      return;
    }

    const currentTopic = currentDomainObj.topics.find((t) => t.id === selectedTopicId) || currentDomainObj.topics[0];

    const newChallengeItem = {
      id: `ch-${Date.now()}`,
      type: 'sent',
      topic: currentTopic.title,
      domain: currentDomainObj.name,
      questionsKey: currentTopic.questionsKey,
      opponent: {
        name: selectedPeer.name,
        email: selectedPeer.email,
        dept: selectedPeer.dept,
        avatar: selectedPeer.avatar
      },
      status: 'pending',
      mode: 'Any time',
      expires: '24h 00m',
      createdAt: 'Just now',
      userScore: null,
      opponentScore: null
    };

    setChallenges((prev) => [newChallengeItem, ...prev]);
    setIsNewChallengeModalOpen(false);
    setSelectedPeer(null);
    setSearchPeerQuery('');
    setActiveTab('my-challenges');
    showToast(`Engagement authorized! Challenge invitation dispatched to ${selectedPeer.name}.`);
  };

  // Handler: Accept incoming friend request
  const handleAcceptRequest = (challengeItem) => {
    setChallenges((prev) =>
      prev.map((c) => (c.id === challengeItem.id ? { ...c, status: 'active', expires: '23h 59m' } : c))
    );
    setActiveTab('active');
    showToast(`Accepted challenge from ${challengeItem.opponent.name}! Challenge activated.`);
  };

  // Handler: Decline incoming request
  const handleDeclineRequest = (challengeId) => {
    setChallenges((prev) => prev.filter((c) => c.id !== challengeId));
    showToast('Challenge request declined.');
  };

  // Handler: Cancel sent challenge
  const handleCancelChallenge = (challengeId) => {
    setChallenges((prev) => prev.filter((c) => c.id !== challengeId));
    showToast('Challenge invitation cancelled.');
  };

  // ============================================================================
  // QUIZ ENGINE CONTROLLERS
  // ============================================================================
  const startQuizForChallenge = (challengeItem) => {
    setActiveQuizChallenge(challengeItem);
    setQuizPhase('loading');
    setLoadingProgress(0);
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setTimerSeconds(25);
    setIsTimerPaused(false);
    setQuizResultSummary(null);
  };

  // 1. Loading Phase Simulator
  useEffect(() => {
    if (!activeQuizChallenge || quizPhase !== 'loading') return;
    const startTime = Date.now();
    const duration = 1100;

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, Math.round((elapsed / duration) * 100));
      setLoadingProgress(pct);

      if (pct >= 100) {
        clearInterval(interval);
        setTimeout(() => setQuizPhase('testing'), 150);
      }
    }, 25);

    return () => clearInterval(interval);
  }, [activeQuizChallenge, quizPhase]);

  // Active questions for the current challenge
  const activeQuestions = useMemo(() => {
    if (!activeQuizChallenge) return QUESTIONS_DATABASE.kerala;
    return QUESTIONS_DATABASE[activeQuizChallenge.questionsKey] || QUESTIONS_DATABASE.kerala;
  }, [activeQuizChallenge]);

  // 2. 25-Second Focus Timer
  useEffect(() => {
    if (quizPhase !== 'testing' || isTimerPaused) return;

    const timer = setInterval(() => {
      setTimerSeconds((prev) => {
        if (prev <= 1) {
          handleAutoAdvance();
          return 25;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [quizPhase, currentQuestionIndex, isTimerPaused]);

  const handleAutoAdvance = () => {
    if (currentQuestionIndex < activeQuestions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setTimerSeconds(25);
    } else {
      handleCompleteQuiz();
    }
  };

  const handleSelectOption = (optIdx) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQuestionIndex]: optIdx
    }));
  };

  const handleNextOrSubmit = () => {
    if (currentQuestionIndex < activeQuestions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setTimerSeconds(25);
    } else {
      handleCompleteQuiz();
    }
  };

  // Keyboard navigation for A, B, C, D and Enter
  useEffect(() => {
    if (!activeQuizChallenge || quizPhase !== 'testing') return;

    const currQ = activeQuestions[currentQuestionIndex];
    if (!currQ) return;

    const handleKeyDown = (e) => {
      const key = e.key ? e.key.toUpperCase() : '';
      if (['A', 'B', 'C', 'D'].includes(key)) {
        const idx = ['A', 'B', 'C', 'D'].indexOf(key);
        if (idx < currQ.options.length) {
          handleSelectOption(idx);
        }
      } else if (e.key === 'Enter') {
        handleNextOrSubmit();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeQuizChallenge, quizPhase, currentQuestionIndex, activeQuestions, selectedAnswers]);

  // Complete Quiz & Compute Head-to-Head Comparative Result
  const handleCompleteQuiz = () => {
    let correctCount = 0;
    activeQuestions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctIndex) {
        correctCount += 1;
      }
    });

    const earnedPoints = correctCount * 4 + (correctCount === activeQuestions.length ? 10 : 0);
    const opponentPoints = activeQuizChallenge.opponentScore?.points ?? Math.max(8, (correctCount - 1) * 4);
    const opponentCorrect = activeQuizChallenge.opponentScore?.correct ?? Math.max(2, correctCount - 1);
    const isVictory = earnedPoints >= opponentPoints;

    const summary = {
      userCorrect: correctCount,
      totalQuestions: activeQuestions.length,
      userPoints: earnedPoints,
      masteryPct: Math.round((correctCount / activeQuestions.length) * 100),
      timeTaken: '02:08',
      isVictory,
      opponentName: activeQuizChallenge.opponent.name,
      opponentPoints,
      opponentCorrect
    };

    setQuizResultSummary(summary);
    setQuizPhase('results');

    // Reset any container scrolls so results render perfectly at top
    setTimeout(() => {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      const root = document.getElementById('root');
      if (root) root.scrollTop = 0;
      const rootDiv = root?.firstElementChild;
      if (rootDiv) rootDiv.scrollTop = 0;
      const main = document.querySelector('main');
      if (main) main.scrollTop = 0;
    }, 10);

    if (onAwardPoints) onAwardPoints(earnedPoints);

    // Update challenge in state to 'finished'
    setChallenges((prev) =>
      prev.map((c) => {
        if (c.id === activeQuizChallenge.id) {
          const userAnsArray = activeQuestions.map((q, idx) =>
            selectedAnswers[idx] !== undefined ? selectedAnswers[idx] : q.correctIndex
          );
          const oppAnsArray = activeQuestions.map((q, idx) => {
            if (idx < opponentCorrect) {
              return q.correctIndex;
            }
            return (q.correctIndex + 1) % q.options.length;
          });

          return {
            ...c,
            status: 'finished',
            userAnswers: userAnsArray,
            opponentAnswers: oppAnsArray,
            userScore: {
              points: earnedPoints,
              correct: correctCount,
              total: activeQuestions.length,
              timeTaken: '02:08',
              won: isVictory
            },
            opponentScore: {
              points: opponentPoints,
              correct: opponentCorrect,
              total: activeQuestions.length,
              timeTaken: '02:45',
              won: !isVictory
            }
          };
        }
        return c;
      })
    );
  };

  // ============================================================================
  // RENDER: IN-QUIZ RUNNER OVERLAY (IF ACTIVE QUIZ IS RUNNING)
  // ============================================================================
  if (activeQuizChallenge) {
    // 1. Loading Phase
    if (quizPhase === 'loading') {
      return (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxSizing: 'border-box'
          }}
        >
          <div
            style={{
              background: '#FFFFFF',
              border: '1px solid #E2E6EF',
              borderRadius: '24px',
              padding: '36px 32px',
              boxShadow: '0 8px 30px rgba(40, 61, 130, 0.06)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              maxWidth: '430px',
              width: '100%',
              boxSizing: 'border-box'
            }}
          >
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
                marginBottom: '18px'
              }}
            >
              <img
                src="/assets/truesight-logo-colour-1024 2.png"
                alt="TrueSights"
                style={{ width: '44px', height: '44px', objectFit: 'contain' }}
              />
            </div>

            <div
              style={{
                fontSize: '11px',
                fontWeight: 800,
                color: '#4B7EE8',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                marginBottom: '4px'
              }}
            >
              PEER ENGAGEMENT HARNESS
            </div>

            <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#1F2537', margin: '0 0 6px 0' }}>
              Launching Peer Challenge
            </h3>

            <p style={{ fontSize: '13px', color: '#6B7790', margin: '0 0 18px 0' }}>
              {activeQuizChallenge.topic} vs {activeQuizChallenge.opponent.name}
            </p>

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
                  background: 'linear-gradient(90deg, #FEE047 0%, #4B7EE8 100%)',
                  borderRadius: '999px',
                  transition: 'width 0.1s linear'
                }}
              />
            </div>
          </div>
        </div>
      );
    }

    // 2. Testing Phase
    if (quizPhase === 'testing') {
      const currQ = activeQuestions[currentQuestionIndex];
      const isSelected = (optIdx) => selectedAnswers[currentQuestionIndex] === optIdx;

      return (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            boxSizing: 'border-box',
            overflow: 'hidden'
          }}
        >
          {/* Header Telemetry Bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '16px',
              flexShrink: 0
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button
                type="button"
                onClick={() => setActiveQuizChallenge(null)}
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #CBD5E1',
                  borderRadius: '8px',
                  padding: '6px 12px',
                  fontSize: '12px',
                  fontWeight: 700,
                  color: '#0B1A2B',
                  cursor: 'pointer'
                }}
              >
                ← Exit Challenge
              </button>
              <div>
                <div style={{ fontSize: '10px', fontWeight: 700, color: '#8A97A6', textTransform: 'uppercase' }}>
                  PEER SHOWDOWN
                </div>
                <div style={{ fontSize: '14px', fontWeight: 800, color: '#0B1A2B' }}>
                  {activeQuizChallenge.topic} <span style={{ color: '#8A97A6' }}>vs</span> {activeQuizChallenge.opponent.name}
                </div>
              </div>
            </div>

            {/* Timer & Question Progress */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div
                style={{
                  background: timerSeconds <= 5 ? '#FEE2E2' : '#FFFFFF',
                  border: `1px solid ${timerSeconds <= 5 ? '#EF4444' : '#E2DDD3'}`,
                  borderRadius: '8px',
                  padding: '6px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontWeight: 800,
                  fontSize: '13px',
                  color: timerSeconds <= 5 ? '#DC2626' : '#0B1A2B'
                }}
              >
                <Icon name="clock" size={14} color="currentColor" />
                <span>00:{timerSeconds < 10 ? `0${timerSeconds}` : timerSeconds}</span>
              </div>

              <div style={{ fontSize: '12px', fontWeight: 800, color: '#4B7EE8' }}>
                Question {currentQuestionIndex + 1} of {activeQuestions.length}
              </div>
            </div>
          </div>

          {/* Question Box */}
          <div
            style={{
              flex: 1,
              background: '#FFFFFF',
              borderRadius: '16px',
              border: '1px solid #E2E6EF',
              padding: '24px 32px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxSizing: 'border-box',
              overflowY: 'auto'
            }}
          >
            <div>
              <div
                style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  color: '#8A97A6',
                  textTransform: 'uppercase',
                  marginBottom: '8px'
                }}
              >
                QUESTION {currentQuestionIndex + 1}
              </div>
              <h2
                style={{
                  fontSize: '18px',
                  fontWeight: 700,
                  color: '#0B1A2B',
                  lineHeight: '26px',
                  margin: '0 0 24px 0',
                  fontFamily: 'var(--font-heading, "Space Grotesk", sans-serif)'
                }}
              >
                {currQ.question}
              </h2>

              {/* Options Stack */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {currQ.options.map((opt, optIdx) => {
                  const active = isSelected(optIdx);
                  return (
                    <button
                      key={opt.letter}
                      id={`quiz-option-${optIdx}`}
                      type="button"
                      onClick={() => handleSelectOption(optIdx)}
                      style={{
                        padding: '14px 18px',
                        borderRadius: '12px',
                        border: `1.5px solid ${active ? '#0B3A6F' : '#E2DDD3'}`,
                        background: active ? '#F0F7FF' : '#FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '14px',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div
                        style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '8px',
                          background: active ? '#0B3A6F' : '#F1F5F9',
                          color: active ? '#FFFFFF' : '#64748B',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '12px',
                          fontWeight: 800,
                          flexShrink: 0
                        }}
                      >
                        {opt.letter}
                      </div>
                      <div
                        style={{
                          fontSize: '13.5px',
                          fontWeight: active ? 700 : 500,
                          color: active ? '#0B1A2B' : '#334155',
                          lineHeight: '19px'
                        }}
                      >
                        {opt.text}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bottom Actions */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingTop: '20px',
                borderTop: '1px solid #EEF2F6',
                marginTop: '20px'
              }}
            >
              <div style={{ fontSize: '11px', color: '#8A97A6' }}>
                Press <strong>A, B, C, D</strong> to select · <strong>Enter</strong> to advance
              </div>

              <button
                id="quiz-next-question-btn"
                type="button"
                onClick={handleNextOrSubmit}
                style={{
                  background: '#FEE047',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '10px 24px',
                  color: '#0B1A2B',
                  fontSize: '13px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 2px 6px rgba(254, 224, 71, 0.35)'
                }}
              >
                <span>{currentQuestionIndex === activeQuestions.length - 1 ? 'Submit Challenge' : 'Next Question'}</span>
                <Icon name="chevronRight" size={14} color="#0B1A2B" />
              </button>
            </div>
          </div>
        </div>
      );
    }

    // 3. Results Phase (Comparative Head-to-Head Breakdown)
    if (quizPhase === 'results' && quizResultSummary) {
      const currReviewQ = activeQuestions[activeReviewIndex];
      const isCorrectReview = selectedAnswers[activeReviewIndex] === currReviewQ.correctIndex;

      return (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'grid',
            gridTemplateColumns: '330px minmax(0, 1fr)',
            gap: '16px',
            boxSizing: 'border-box',
            overflow: 'hidden'
          }}
        >
          {/* LEFT COLUMN: Head-to-Head Winner Card & Mastery Gauge */}
          <div
            style={{
              background: '#FFFFFF',
              border: '1px solid #E2DDD3',
              borderRadius: '16px',
              padding: '16px 18px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxSizing: 'border-box',
              height: '100%',
              overflow: 'hidden'
            }}
          >
            <div style={{ textAlign: 'center' }}>
                {/* Victory Ribbon */}
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: quizResultSummary.isVictory ? '#ECFDF5' : '#FFFBEB',
                    border: `1px solid ${quizResultSummary.isVictory ? '#A7F3D0' : '#FCD34D'}`,
                    padding: '3px 12px',
                    borderRadius: '20px',
                    fontSize: '11px',
                    fontWeight: 800,
                    color: quizResultSummary.isVictory ? '#059669' : '#D97706',
                    marginBottom: '6px'
                  }}
                >
                  <span>{quizResultSummary.isVictory ? 'CHALLENGE VICTORY!' : 'WELL CONTESTED!'}</span>
                </div>

                <h2
                  style={{
                    fontSize: '19px',
                    fontWeight: 800,
                    color: '#0B1A2B',
                    margin: '0 0 2px 0',
                    fontFamily: 'var(--font-heading, "Space Grotesk", sans-serif)'
                  }}
                >
                  Session Results
                </h2>
                <p style={{ fontSize: '12px', color: '#6B7790', margin: 0 }}>
                  Excellent work on {activeQuizChallenge.topic}!
                </p>

                {/* Score Circular Gauge */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', margin: '10px 0' }}>
                  <div
                    style={{
                      width: '76px',
                      height: '76px',
                      borderRadius: '50%',
                      background: quizResultSummary.isVictory ? '#ECFDF5' : '#F0F7FF',
                      border: `3.5px solid ${quizResultSummary.isVictory ? '#10B981' : '#0B3A6F'}`,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <span style={{ fontSize: '20px', fontWeight: 800, color: '#0B1A2B', lineHeight: '22px' }}>
                      {quizResultSummary.masteryPct}%
                    </span>
                    <span style={{ fontSize: '8.5px', fontWeight: 700, color: '#64748B', letterSpacing: '0.06em' }}>
                      MASTERY
                    </span>
                  </div>

                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#0B1A2B' }}>
                    {quizResultSummary.userCorrect} of {quizResultSummary.totalQuestions} Questions Correct
                  </div>
                </div>

                {/* COMPARATIVE HEAD-TO-HEAD PODIUM */}
                <div
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid #E2DDD3',
                    borderRadius: '10px',
                    padding: '10px 12px',
                    marginBottom: '10px',
                    boxSizing: 'border-box'
                  }}
                >
                  <div style={{ fontSize: '9.5px', fontWeight: 800, color: '#8A97A6', textTransform: 'uppercase', marginBottom: '6px' }}>
                    PEER SCORE COMPARISON
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid #F1F5F9' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '12.5px', fontWeight: 800, color: '#0B1A2B' }}>You (Student)</span>
                      {quizResultSummary.isVictory && (
                        <span style={{ background: '#ECFDF5', color: '#059669', fontSize: '9.5px', fontWeight: 700, padding: '1px 5px', borderRadius: '4px' }}>
                          WINNER
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '13px', fontWeight: 800, color: '#0B3A6F' }}>
                      {quizResultSummary.userPoints} pts ({quizResultSummary.userCorrect}/{quizResultSummary.totalQuestions})
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '5px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#64748B' }}>{quizResultSummary.opponentName}</span>
                    </div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#64748B' }}>
                      {quizResultSummary.opponentPoints} pts ({quizResultSummary.opponentCorrect}/{quizResultSummary.totalQuestions})
                    </div>
                  </div>
                </div>

                {/* Points Reward Box */}
                <div
                  style={{
                    background: '#FEF9C3',
                    border: '1px solid #FDE047',
                    borderRadius: '8px',
                    padding: '8px 10px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    textAlign: 'left'
                  }}
                >
                  <Icon name="rewardGem" size={18} color="#D97706" />
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 800, color: '#854D0E' }}>
                      +{quizResultSummary.userPoints} PTS ACQUIRED
                    </div>
                    <div style={{ fontSize: '10px', color: '#A16207' }}>
                      Added to Institute Leaderboard & Wallet
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '16px' }}>
                <button
                  type="button"
                  onClick={() => {
                    setActiveQuizChallenge(null);
                    setActiveTab('finished');
                  }}
                  style={{
                    width: '100%',
                    height: '40px',
                    background: '#FEE047',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#0B1A2B',
                    fontSize: '12.5px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    boxShadow: '0 2px 6px rgba(254, 224, 71, 0.35)'
                  }}
                >
                  <span>Return to Challenges Hub</span>
                </button>

                {onViewResults && (
                  <button
                    type="button"
                    onClick={onViewResults}
                    style={{
                      width: '100%',
                      height: '38px',
                      background: '#FFFFFF',
                      border: '1px solid #CBD5E1',
                      borderRadius: '8px',
                      color: '#0B1A2B',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    View Overall Results Ledger →
                  </button>
                )}
              </div>
            </div>

            {/* RIGHT COLUMN: Question Detailed Feedback & Analysis */}
            <div
              style={{
                background: '#FFFFFF',
                border: '1px solid #E2DDD3',
                borderRadius: '16px',
                padding: '20px 24px',
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                boxSizing: 'border-box',
                overflow: 'hidden'
              }}
            >
              <div
                style={{
                  paddingBottom: '12px',
                  borderBottom: '1px solid #EEF2F6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ fontSize: '10px', fontWeight: 800, color: '#8A97A6', textTransform: 'uppercase' }}>
                    DETAILED QUESTION ANALYSIS
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: '#0B1A2B' }}>
                    {activeQuizChallenge.topic}
                  </div>
                </div>

                {/* Question Numbers Strip */}
                <div style={{ display: 'flex', gap: '6px' }}>
                  {activeQuestions.map((_, idx) => {
                    const isCorr = selectedAnswers[idx] === activeQuestions[idx].correctIndex;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setActiveReviewIndex(idx)}
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '8px',
                          border: idx === activeReviewIndex ? '2px solid #0B3A6F' : '1px solid transparent',
                          background: isCorr ? '#DCFCE7' : '#FEE2E2',
                          color: isCorr ? '#166534' : '#991B1B',
                          fontSize: '12px',
                          fontWeight: 800,
                          cursor: 'pointer'
                        }}
                      >
                        Q{idx + 1}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Active Review Question Card */}
              <div
                style={{
                  flex: 1,
                  overflowY: 'auto',
                  padding: '20px 0',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px'
                }}
              >
                <div
                  style={{
                    background: isCorrectReview ? '#F0FDF4' : '#FEF2F2',
                    border: `1px solid ${isCorrectReview ? '#BBF7D0' : '#FECACA'}`,
                    borderRadius: '12px',
                    padding: '18px 20px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 800, color: isCorrectReview ? '#166534' : '#991B1B' }}>
                      QUESTION {activeReviewIndex + 1} OF {activeQuestions.length}
                    </span>
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: '4px',
                        background: isCorrectReview ? '#DCFCE7' : '#FEE2E2',
                        color: isCorrectReview ? '#166534' : '#991B1B'
                      }}
                    >
                      {isCorrectReview ? '✓ Correct (+4 PTS)' : '✗ Incorrect (0 PTS)'}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A', lineHeight: '22px', margin: '0 0 14px 0' }}>
                    {currReviewQ.question}
                  </h3>

                  {/* Options Overview */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {currReviewQ.options.map((opt, oIdx) => {
                      const wasPicked = selectedAnswers[activeReviewIndex] === oIdx;
                      const isTargetCorrect = currReviewQ.correctIndex === oIdx;

                      let rowBg = '#FFFFFF';
                      let rowBorder = '#E2E8F0';
                      let label = null;

                      if (isTargetCorrect) {
                        rowBg = '#DCFCE7';
                        rowBorder = '#86EFAC';
                        label = 'CORRECT ANSWER';
                      } else if (wasPicked) {
                        rowBg = '#FEE2E2';
                        rowBorder = '#FCA5A5';
                        label = 'YOUR ANSWER';
                      }

                      return (
                        <div
                          key={opt.letter}
                          style={{
                            padding: '10px 14px',
                            borderRadius: '8px',
                            background: rowBg,
                            border: `1px solid ${rowBorder}`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            fontSize: '13px'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <strong style={{ color: '#0B1A2B' }}>{opt.letter}.</strong>
                            <span style={{ color: '#1E293B' }}>{opt.text}</span>
                          </div>
                          {label && (
                            <span style={{ fontSize: '10px', fontWeight: 800, color: isTargetCorrect ? '#166534' : '#991B1B' }}>
                              {label}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Explanation Note */}
                  {currReviewQ.explanation && (
                    <div
                      style={{
                        marginTop: '14px',
                        padding: '12px 14px',
                        borderRadius: '8px',
                        background: 'rgba(255, 255, 255, 0.85)',
                        border: '1px solid rgba(0, 0, 0, 0.06)',
                        fontSize: '12.5px',
                        color: '#475569',
                        lineHeight: '18px'
                      }}
                    >
                      <strong style={{ color: '#0B1A2B' }}>Explanation: </strong>
                      {currReviewQ.explanation}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      }
    }

  // ============================================================================
  // MAIN DASHBOARD VIEW (MATCHING FIGMA NODE 210:53374)
  // ============================================================================
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
          1. TOP HERO BANNER (Pixel-Perfect Match to Figma Node 210:53377)
          ====================================================================== */}
      <div
        style={{
          background: '#243367',
          borderRadius: isMobile ? '14px' : '16px',
          padding: isMobile ? '16px 14px' : '28px 36px',
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          alignItems: isMobile ? 'stretch' : 'center',
          justifyContent: 'space-between',
          gap: isMobile ? '12px' : '20px',
          flexShrink: 0,
          boxSizing: 'border-box',
          boxShadow: '0 4px 20px rgba(36, 51, 103, 0.16)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Subtle decorative background watermarks */}
        <div
          style={{
            position: 'absolute',
            right: '-30px',
            top: '-40px',
            width: '200px',
            height: '200px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(254, 224, 71, 0.08) 0%, rgba(255, 255, 255, 0) 70%)',
            pointerEvents: 'none'
          }}
        />

        {/* Left: Heading 1 & Subtitle */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxWidth: '640px', zIndex: 1 }}>

          <h1
            style={{
              fontFamily: 'var(--font-heading, "Space Grotesk", sans-serif)',
              fontSize: isMobile ? '22px' : '30px',
              fontWeight: 800,
              color: '#FFFFFF',
              margin: 0,
              letterSpacing: '-0.02em',
              lineHeight: isMobile ? '26px' : '36px'
            }}
          >
            Show what you know
          </h1>
          <p
            style={{
              fontSize: isMobile ? '12.5px' : '13.5px',
              color: 'rgba(255, 255, 255, 0.9)',
              margin: 0,
              lineHeight: isMobile ? '18px' : '20px'
            }}
          >
            Challenge your friends to a quick quiz and see who knows more. Earn points and climb the leaderboard.
          </p>
        </div>

        {/* Right Action: "+ New Challenge" Yellow Button */}
        <button
          type="button"
          onClick={() => setIsNewChallengeModalOpen(true)}
          style={{
            background: '#FEE047',
            border: 'none',
            borderRadius: '10px',
            padding: isMobile ? '12px 18px' : '12px 24px',
            width: isMobile ? '100%' : 'auto',
            justifyContent: 'center',
            color: '#0B1A2B',
            fontSize: '13px',
            fontWeight: 800,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 4px 14px rgba(254, 224, 71, 0.35)',
            transition: 'all 0.18s ease',
            zIndex: 1
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
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0B1A2B" strokeWidth="3" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          <span>New Challenge</span>
        </button>
      </div>

      {/* ======================================================================
          2. FILTER & NAVIGATION TABS WITH SEARCH
          ====================================================================== */}
      <div
        style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          alignItems: isMobile ? 'stretch' : 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
          gap: isMobile ? '10px' : '14px',
          flexWrap: 'wrap'
        }}
      >
        {/* Left: Segmented Tabs */}
        <div
          style={{
            background: '#FFFFFF',
            border: '1px solid #E2DDD3',
            borderRadius: '10px',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            gap: '3px',
            overflowX: isMobile ? 'auto' : 'visible',
            maxWidth: '100%',
            whiteSpace: 'nowrap',
            WebkitOverflowScrolling: 'touch'
          }}
        >
          {/* Tab 1: MY CHALLENGES */}
          <button
            type="button"
            onClick={() => setActiveTab('my-challenges')}
            style={{
              background: activeTab === 'my-challenges' ? '#0B3A6F' : 'transparent',
              color: activeTab === 'my-challenges' ? '#FFFFFF' : '#8A97A6',
              border: 'none',
              borderRadius: '7px',
              padding: '8px 18px',
              fontSize: '12px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.6px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              transition: 'all 0.15s'
            }}
          >
            <Icon name="challenges" size={14} color={activeTab === 'my-challenges' ? '#FEE047' : 'currentColor'} />
            <span>My Challenges</span>
            <span
              style={{
                background: activeTab === 'my-challenges' ? 'rgba(255, 255, 255, 0.2)' : '#F1F5F9',
                color: activeTab === 'my-challenges' ? '#FFFFFF' : '#64748B',
                fontSize: '11px',
                fontWeight: 700,
                padding: '1px 7px',
                borderRadius: '10px'
              }}
            >
              {myChallengesList.length}
            </span>
          </button>

          {/* Tab 2: REQUESTS */}
          <button
            type="button"
            onClick={() => setActiveTab('requests')}
            style={{
              background: activeTab === 'requests' ? '#0B3A6F' : 'transparent',
              color: activeTab === 'requests' ? '#FFFFFF' : '#8A97A6',
              border: 'none',
              borderRadius: '7px',
              padding: '8px 18px',
              fontSize: '12px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.6px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              transition: 'all 0.15s'
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            <span>Requests</span>
            {requestsList.length > 0 && (
              <span
                style={{
                  background: activeTab === 'requests' ? '#FEE047' : '#EF4444',
                  color: activeTab === 'requests' ? '#0B1A2B' : '#FFFFFF',
                  fontSize: '11px',
                  fontWeight: 800,
                  padding: '1px 7px',
                  borderRadius: '10px'
                }}
              >
                {requestsList.length}
              </span>
            )}
          </button>

          {/* Tab 3: ACTIVE */}
          <button
            type="button"
            onClick={() => setActiveTab('active')}
            style={{
              background: activeTab === 'active' ? '#0B3A6F' : 'transparent',
              color: activeTab === 'active' ? '#FFFFFF' : '#8A97A6',
              border: 'none',
              borderRadius: '7px',
              padding: '8px 18px',
              fontSize: '12px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.6px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              transition: 'all 0.15s'
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
            </svg>
            <span>Active</span>
            <span
              style={{
                background: activeTab === 'active' ? 'rgba(255, 255, 255, 0.2)' : '#F1F5F9',
                color: activeTab === 'active' ? '#FFFFFF' : '#64748B',
                fontSize: '11px',
                fontWeight: 700,
                padding: '1px 7px',
                borderRadius: '10px'
              }}
            >
              {activeList.length}
            </span>
          </button>

          {/* Tab 4: FINISHED */}
          <button
            type="button"
            onClick={() => setActiveTab('finished')}
            style={{
              background: activeTab === 'finished' ? '#0B3A6F' : 'transparent',
              color: activeTab === 'finished' ? '#FFFFFF' : '#8A97A6',
              border: 'none',
              borderRadius: '7px',
              padding: '8px 18px',
              fontSize: '12px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.6px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              transition: 'all 0.15s'
            }}
          >
            <Icon name="checkCircle" size={14} color={activeTab === 'finished' ? '#FFFFFF' : 'currentColor'} />
            <span>Finished</span>
            <span
              style={{
                background: activeTab === 'finished' ? 'rgba(255, 255, 255, 0.2)' : '#F1F5F9',
                color: activeTab === 'finished' ? '#FFFFFF' : '#64748B',
                fontSize: '11px',
                fontWeight: 700,
                padding: '1px 7px',
                borderRadius: '10px'
              }}
            >
              {finishedList.length}
            </span>
          </button>
        </div>

        {/* Right: Search Input */}
        <div
          style={{
            position: 'relative',
            width: isMobile ? '100%' : '240px',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <span style={{ position: 'absolute', left: '10px', color: '#8A97A6', display: 'flex', alignItems: 'center', pointerEvents: 'none' }}>
            <Icon name="search" size={14} color="#8A97A6" />
          </span>
          <input
            type="text"
            placeholder="Search challenges or peers..."
            value={challengeSearchQuery}
            onChange={(e) => setChallengeSearchQuery(e.target.value)}
            style={{
              width: '100%',
              height: '38px',
              background: '#FFFFFF',
              border: '1px solid #E2DDD3',
              borderRadius: '8px',
              padding: '0 28px 0 32px',
              fontSize: '12px',
              fontFamily: 'var(--font-primary, sans-serif)',
              color: '#0B1A2B',
              outline: 'none',
              boxSizing: 'border-box'
            }}
            onFocus={(e) => { e.target.style.borderColor = '#0B3A6F'; }}
            onBlur={(e) => { e.target.style.borderColor = '#E2DDD3'; }}
          />
          {challengeSearchQuery && (
            <button
              type="button"
              onClick={() => setChallengeSearchQuery('')}
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

      {/* ======================================================================
          3. CHALLENGE CARDS GRID (Pixel-Perfect Match to Figma Node 210:53408)
          ====================================================================== */}
      {(() => {
        const currentTabList =
          activeTab === 'my-challenges'
            ? myChallengesList
            : activeTab === 'requests'
            ? requestsList
            : activeTab === 'active'
            ? activeList
            : finishedList;

        if (currentTabList.length === 0) {
          return (
            <div
              style={{
                background: '#FFFFFF',
                borderRadius: '14px',
                border: '1px dashed #CBD5E1',
                padding: '48px 24px',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '12px'
              }}
            >
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: '#F1F5F9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Icon name="challenges" size={24} color="#64748B" />
              </div>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#0B1A2B' }}>
                No challenges found in this section
              </h3>
              <p style={{ margin: 0, fontSize: '13px', color: '#64748B' }}>
                {activeTab === 'requests'
                  ? 'You currently have no incoming challenge invites from peers.'
                  : activeTab === 'active'
                  ? 'No challenges currently in progress. Start one by clicking New Challenge!'
                  : 'Start a new challenge with a verified peer to test your mastery.'}
              </p>
              {activeTab !== 'requests' && (
                <button
                  type="button"
                  onClick={() => setIsNewChallengeModalOpen(true)}
                  style={{
                    marginTop: '8px',
                    padding: '8px 18px',
                    borderRadius: '8px',
                    background: '#0B3A6F',
                    color: '#FFFFFF',
                    fontSize: '12px',
                    fontWeight: 700,
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  Create New Challenge
                </button>
              )}
            </div>
          );
        }

        return (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(420px, 1fr))',
              gap: isMobile ? '14px' : '20px',
              paddingBottom: '32px'
            }}
          >
            {currentTabList.map((item) => {
              // Status Pill configuration matching TrueSights Design System
              let pillBg = '#FFFBEB';
              let pillColor = '#B45309';
              let pillBorder = '#FDE68A';
              let pillLabel = 'Awaiting Peer';
              let pillIcon = (
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              );

              if (item.status === 'active') {
                pillBg = '#ECFDF5';
                pillColor = '#047857';
                pillBorder = '#A7F3D0';
                pillLabel = 'Active';
                pillIcon = (
                  <span
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      background: '#10B981',
                      display: 'inline-block'
                    }}
                  />
                );
              } else if (item.status === 'request') {
                pillBg = '#EFF6FF';
                pillColor = '#1D4ED8';
                pillBorder = '#BFDBFE';
                pillLabel = 'Invite Received';
                pillIcon = (
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <line x1="19" y1="8" x2="19" y2="14" />
                    <line x1="22" y1="11" x2="16" y2="11" />
                  </svg>
                );
              } else if (item.status === 'expired') {
                pillBg = '#F8FAFC';
                pillColor = '#64748B';
                pillBorder = '#E2E8F0';
                pillLabel = 'Expired';
                pillIcon = (
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="15" y1="9" x2="9" y2="15" />
                    <line x1="9" y1="9" x2="15" y2="15" />
                  </svg>
                );
              } else if (item.status === 'finished') {
                pillBg = '#F0FDF4';
                pillColor = '#15803D';
                pillBorder = '#BBF7D0';
                pillLabel = 'Completed';
                pillIcon = (
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                );
              }

              return (
                <div
                  key={item.id}
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid #E2DDD3',
                    borderRadius: '16px',
                    boxShadow: '0 2px 8px rgba(11, 26, 43, 0.03)',
                    boxSizing: 'border-box',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    position: 'relative',
                    transition: 'box-shadow 0.2s ease, transform 0.2s ease, border-color 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = '0 10px 24px -2px rgba(11, 26, 43, 0.08)';
                    e.currentTarget.style.borderColor = '#CBD5E1';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(11, 26, 43, 0.03)';
                    e.currentTarget.style.borderColor = '#E2DDD3';
                    e.currentTarget.style.transform = 'none';
                  }}
                >
                  {/* Card Main Body */}
                  <div style={{ padding: '22px 24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {/* Header Row: Academic Domain Badge + Status Pill */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                      <div
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          background: '#F8FAFC',
                          border: '1px solid #E2E8F0',
                          borderRadius: '6px',
                          padding: '4px 9px',
                          maxWidth: '260px'
                        }}
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#0B3A6F" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                        </svg>
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            color: '#334155',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}
                          title={item.domain}
                        >
                          {item.domain}
                        </span>
                      </div>

                      {/* Status Pill */}
                      <span
                        style={{
                          background: pillBg,
                          color: pillColor,
                          border: `1px solid ${pillBorder}`,
                          padding: '4px 10px',
                          borderRadius: '6px',
                          fontSize: '10.5px',
                          fontWeight: 800,
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          flexShrink: 0
                        }}
                      >
                        {pillIcon}
                        <span>{pillLabel}</span>
                      </span>
                    </div>

                    {/* Topic Title */}
                    <div>
                      <h3
                        style={{
                          fontFamily: 'var(--font-heading, "Space Grotesk", sans-serif)',
                          fontSize: '17.5px',
                          fontWeight: 700,
                          color: '#0B1A2B',
                          margin: 0,
                          lineHeight: '23px',
                          letterSpacing: '-0.01em'
                        }}
                      >
                        {item.topic}
                      </h3>
                    </div>

                    {/* Peer Challenger Pod (Social Presence) */}
                    <div
                      style={{
                        background: '#FAF9F6',
                        border: '1px solid #EFEAE1',
                        borderRadius: '12px',
                        padding: '11px 14px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '12px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flex: 1 }}>
                        {/* Peer Avatar */}
                        <div
                          style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            overflow: 'hidden',
                            border: '2px solid #FFFFFF',
                            boxShadow: '0 2px 6px rgba(11, 26, 43, 0.08)',
                            flexShrink: 0,
                            backgroundColor: '#0B3A6F',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#FFFFFF',
                            fontSize: '13px',
                            fontWeight: 800
                          }}
                        >
                          {item.opponent?.avatar ? (
                            <img
                              src={item.opponent.avatar}
                              alt={item.opponent.name}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          ) : (
                            item.opponent?.name?.charAt(0) || 'P'
                          )}
                        </div>

                        {/* Peer Name & Dept */}
                        <div style={{ minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span
                              style={{
                                fontSize: '13px',
                                fontWeight: 700,
                                color: '#0B1A2B',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                              }}
                            >
                              {item.opponent?.name}
                            </span>
                            <span
                              style={{
                                background: item.type === 'received' ? '#E0E7FF' : '#E2E8F0',
                                color: item.type === 'received' ? '#4338CA' : '#475569',
                                fontSize: '9.5px',
                                fontWeight: 700,
                                padding: '1px 6px',
                                borderRadius: '4px',
                                textTransform: 'uppercase',
                                letterSpacing: '0.4px',
                                flexShrink: 0
                              }}
                            >
                              {item.type === 'received' ? 'Challenger' : 'Invited Peer'}
                            </span>
                          </div>
                          <div
                            style={{
                              fontSize: '11px',
                              color: '#64748B',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              marginTop: '1px'
                            }}
                          >
                            {item.opponent?.dept || item.opponent?.email}
                          </div>
                        </div>
                      </div>

                      {/* Right Side of Peer Pod */}
                      {item.status === 'finished' && item.userScore ? (
                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                          <span
                            style={{
                              fontSize: '10px',
                              fontWeight: 700,
                              textTransform: 'uppercase',
                              color: '#64748B',
                              letterSpacing: '0.4px',
                              display: 'block'
                            }}
                          >
                            Outcome
                          </span>
                          <span
                            style={{
                              fontSize: '12.5px',
                              fontWeight: 800,
                              color: item.userScore.won ? '#059669' : '#0B3A6F'
                            }}
                          >
                            {item.userScore.won ? 'Victory' : 'Completed'}
                          </span>
                        </div>
                      ) : (
                        <div
                          style={{
                            fontSize: '11px',
                            color: '#0B3A6F',
                            fontWeight: 700,
                            background: 'rgba(11, 58, 111, 0.06)',
                            padding: '4px 8px',
                            borderRadius: '6px',
                            flexShrink: 0,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <span>Verified</span>
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* Telemetry Boxes: MODE & EXPIRES */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <div
                        style={{
                          background: '#FAF9F6',
                          border: '1px solid #EFEAE1',
                          borderRadius: '8px',
                          padding: '9px 12px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '3px'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#8A97A6" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <polygon points="5 3 19 12 5 21 5 3" />
                          </svg>
                          <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#8A97A6' }}>
                            ENGAGEMENT MODE
                          </span>
                        </div>
                        <span style={{ fontSize: '12.5px', fontWeight: 600, color: '#0B1A2B' }}>
                          {item.mode} (Async)
                        </span>
                      </div>

                      <div
                        style={{
                          background: '#FAF9F6',
                          border: '1px solid #EFEAE1',
                          borderRadius: '8px',
                          padding: '9px 12px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '3px'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#8A97A6" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10" />
                            <polyline points="12 6 12 12 16 14" />
                          </svg>
                          <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#8A97A6' }}>
                            EXPIRES IN
                          </span>
                        </div>
                        <span
                          style={{
                            fontSize: '12.5px',
                            fontWeight: 600,
                            color: item.expires === 'Terminated' ? '#DC2626' : item.status === 'active' ? '#059669' : '#0B1A2B'
                          }}
                        >
                          {item.expires === 'Terminated' ? 'Expired' : item.expires}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer Action Bar */}
                  <div
                    style={{
                      borderTop: '1px solid #F1EFE9',
                      padding: '13px 22px',
                      background: '#FAFBFD',
                      borderRadius: '0 0 16px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      boxSizing: 'border-box'
                    }}
                  >
                    {/* State-specific CTA actions */}
                    {item.status === 'request' ? (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', width: '100%', gap: '10px' }}>
                        <button
                          type="button"
                          onClick={() => handleDeclineRequest(item.id)}
                          style={{
                            background: '#FFFFFF',
                            border: '1px solid #CBD5E1',
                            borderRadius: '8px',
                            padding: '8px 16px',
                            fontSize: '12px',
                            fontWeight: 700,
                            color: '#64748B',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = '#94A3B8';
                            e.currentTarget.style.color = '#1E293B';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = '#CBD5E1';
                            e.currentTarget.style.color = '#64748B';
                          }}
                        >
                          Decline
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAcceptRequest(item)}
                          style={{
                            background: '#FEE047',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '8px 18px',
                            fontSize: '12.5px',
                            fontWeight: 800,
                            color: '#0B1A2B',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            boxShadow: '0 2px 8px rgba(254, 224, 71, 0.35)',
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
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                          <span>Accept Challenge</span>
                        </button>
                      </div>
                    ) : item.status === 'active' ? (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', width: '100%' }}>
                        <button
                          type="button"
                          onClick={() => startQuizForChallenge(item)}
                          style={{
                            width: '100%',
                            height: '38px',
                            background: '#FEE047',
                            border: 'none',
                            borderRadius: '8px',
                            color: '#0B1A2B',
                            fontSize: '13px',
                            fontWeight: 800,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            boxShadow: '0 2px 8px rgba(254, 224, 71, 0.4)',
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
                          <Icon name="play" variant="bold" size={13} color="#0B1A2B" />
                          <span>Start Quiz Now</span>
                        </button>
                      </div>
                    ) : item.status === 'finished' ? (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>Your Score:</span>
                          <strong style={{ fontSize: '13px', color: item.userScore?.won ? '#059669' : '#0B3A6F' }}>
                            {item.userScore?.points} pts ({item.userScore?.correct}/{item.userScore?.total})
                          </strong>
                        </div>
                        <button
                          type="button"
                          onClick={() => setSelectedComparisonModal(item)}
                          style={{
                            background: '#0B3A6F',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '8px 16px',
                            color: '#FFFFFF',
                            fontSize: '12px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            boxShadow: '0 2px 6px rgba(11, 58, 111, 0.2)',
                            transition: 'all 0.15s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#092C54';
                            e.currentTarget.style.transform = 'translateY(-1px)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = '#0B3A6F';
                            e.currentTarget.style.transform = 'none';
                          }}
                        >
                          <span>Compare Results</span>
                          <Icon name="chevronRight" size={12} color="#FFFFFF" />
                        </button>
                      </div>
                    ) : item.status === 'pending' ? (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span
                            style={{
                              width: '7px',
                              height: '7px',
                              borderRadius: '50%',
                              backgroundColor: '#F59E0B',
                              display: 'inline-block'
                            }}
                          />
                          <span style={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>
                            Awaiting peer response
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCancelChallenge(item.id)}
                          style={{
                            background: '#FFFFFF',
                            border: '1px solid #E2E8F0',
                            borderRadius: '6px',
                            padding: '6px 14px',
                            fontSize: '11.5px',
                            fontWeight: 700,
                            color: '#64748B',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = '#FCA5A5';
                            e.currentTarget.style.color = '#DC2626';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = '#E2E8F0';
                            e.currentTarget.style.color = '#64748B';
                          }}
                        >
                          Cancel Invite
                        </button>
                      </div>
                    ) : (
                      /* Expired */
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                        <span style={{ fontSize: '12px', color: '#94A3B8', fontWeight: 600 }}>
                          Invitation expired
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedDomainId(ACADEMIC_DOMAINS[0].id);
                            setIsNewChallengeModalOpen(true);
                          }}
                          style={{
                            background: '#FFFFFF',
                            border: '1px solid #CBD5E1',
                            borderRadius: '6px',
                            padding: '6px 14px',
                            fontSize: '11.5px',
                            fontWeight: 700,
                            color: '#0B3A6F',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = '#0B3A6F';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = '#CBD5E1';
                          }}
                        >
                          Re-challenge
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        );
      })()}

      {/* ======================================================================
          4. "NEW CHALLENGE" MODAL POPUP
          "Select a domain and authorize an engagement with verified peers"
          ====================================================================== */}
      {isNewChallengeModalOpen && (
        <ModalPortal isOpen={true} onClose={() => setIsNewChallengeModalOpen(false)}>
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
              width: '100%',
              maxWidth: '560px',
              background: '#FFFFFF',
              borderRadius: '16px',
              boxShadow: '0 24px 60px rgba(0, 0, 0, 0.25)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden'
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '20px 24px',
                background: '#0B3A6F',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: '16px'
              }}
            >
              <div>
                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    background: 'rgba(255, 255, 255, 0.18)',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    display: 'inline-block',
                    marginBottom: '6px'
                  }}
                >
                  DIRECT PEER ENGAGEMENT
                </span>
                <h2
                  style={{
                    fontFamily: 'var(--font-heading, "Space Grotesk", sans-serif)',
                    fontSize: '20px',
                    fontWeight: 800,
                    margin: 0
                  }}
                >
                  Authorize a Peer Challenge
                </h2>
                <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: 'rgba(255, 255, 255, 0.82)' }}>
                  Select an academic domain and authorize an engagement with verified peers.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsNewChallengeModalOpen(false)}
                style={{
                  background: 'rgba(255, 255, 255, 0.15)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '30px',
                  height: '30px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF',
                  cursor: 'pointer',
                  fontSize: '15px'
                }}
              >
                ✕
              </button>
            </div>

            {/* Modal Form Content */}
            <div
              style={{
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '18px',
                boxSizing: 'border-box'
              }}
            >
              {/* 1. Academic Domain Dropdown */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#0B1A2B' }}>
                  1. Academic Domain:
                </label>
                <div style={{ position: 'relative' }}>
                  <select
                    value={selectedDomainId}
                    onChange={(e) => {
                      const newDom = e.target.value;
                      setSelectedDomainId(newDom);
                      const domObj = ACADEMIC_DOMAINS.find((d) => d.id === newDom);
                      if (domObj && domObj.topics.length > 0) {
                        setSelectedTopicId(domObj.topics[0].id);
                      }
                    }}
                    style={{
                      width: '100%',
                      height: '40px',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      padding: '0 32px 0 12px',
                      background: '#FFFFFF',
                      fontSize: '13px',
                      color: '#0B1A2B',
                      outline: 'none',
                      appearance: 'none',
                      WebkitAppearance: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    {ACADEMIC_DOMAINS.map((dom) => (
                      <option key={dom.id} value={dom.id}>
                        {dom.name}
                      </option>
                    ))}
                  </select>
                  <span style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                    <Icon name="chevronDown" size={14} color="#64748B" />
                  </span>
                </div>
              </div>

              {/* 2. Topic Selector */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#0B1A2B' }}>
                  2. Challenge Quiz Topic:
                </label>
                <div style={{ position: 'relative' }}>
                  <select
                    value={selectedTopicId}
                    onChange={(e) => setSelectedTopicId(e.target.value)}
                    style={{
                      width: '100%',
                      height: '40px',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      padding: '0 32px 0 12px',
                      background: '#FFFFFF',
                      fontSize: '13px',
                      color: '#0B1A2B',
                      outline: 'none',
                      appearance: 'none',
                      WebkitAppearance: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    {currentDomainObj.topics.map((top) => (
                      <option key={top.id} value={top.id}>
                        {top.title}
                      </option>
                    ))}
                  </select>
                  <span style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                    <Icon name="chevronDown" size={14} color="#64748B" />
                  </span>
                </div>
              </div>

              {/* 3. Search User (Drop name or Email ID) */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', position: 'relative' }}>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#0B1A2B' }}>
                  3. Search Verified Peer:
                </label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#8A97A6' }}>
                    <Icon name="search" size={14} color="#8A97A6" />
                  </span>
                  <input
                    type="text"
                    placeholder="Drop friend name or campus email (e.g. sandeep.c@campus.edu)..."
                    value={searchPeerQuery}
                    onChange={(e) => {
                      setSearchPeerQuery(e.target.value);
                      setIsPeerDropdownOpen(true);
                    }}
                    onFocus={() => setIsPeerDropdownOpen(true)}
                    style={{
                      width: '100%',
                      height: '40px',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      padding: '0 32px 0 36px',
                      fontSize: '13px',
                      color: '#0B1A2B',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                  {searchPeerQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchPeerQuery('')}
                      style={{
                        position: 'absolute',
                        right: '10px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        color: '#8A97A6',
                        cursor: 'pointer'
                      }}
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Autocomplete peer dropdown */}
                {isPeerDropdownOpen && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '70px',
                      left: 0,
                      right: 0,
                      background: '#FFFFFF',
                      border: '1px solid #CBD5E1',
                      borderRadius: '8px',
                      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
                      maxHeight: '190px',
                      overflowY: 'auto',
                      zIndex: 100,
                      display: 'flex',
                      flexDirection: 'column'
                    }}
                  >
                    {filteredPeers.map((peer) => (
                      <button
                        key={peer.id}
                        type="button"
                        onClick={() => {
                          setSelectedPeer(peer);
                          setSearchPeerQuery(peer.name);
                          setIsPeerDropdownOpen(false);
                        }}
                        style={{
                          padding: '10px 14px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          border: 'none',
                          borderBottom: '1px solid #F1F5F9',
                          background: selectedPeer?.id === peer.id ? '#F0F7FF' : '#FFFFFF',
                          cursor: 'pointer',
                          textAlign: 'left'
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = '#F8FAFC'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = selectedPeer?.id === peer.id ? '#F0F7FF' : '#FFFFFF'; }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <img
                            src={peer.avatar}
                            alt={peer.name}
                            style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }}
                          />
                          <div>
                            <div style={{ fontSize: '13px', fontWeight: 700, color: '#0B1A2B' }}>
                              {peer.name}
                            </div>
                            <div style={{ fontSize: '11px', color: '#64748B' }}>
                              {peer.email} · {peer.dept}
                            </div>
                          </div>
                        </div>
                        <span style={{ fontSize: '11px', fontWeight: 800, color: '#4B7EE8' }}>
                          {peer.points} PTS
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Selected Peer Preview Pill */}
                {selectedPeer && (
                  <div
                    style={{
                      background: '#ECFDF5',
                      border: '1px solid #A7F3D0',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginTop: '4px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ color: '#059669', fontSize: '14px' }}>✓</span>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: '#065F46' }}>
                        Verified Target: <strong>{selectedPeer.name}</strong> ({selectedPeer.email})
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedPeer(null);
                        setSearchPeerQuery('');
                      }}
                      style={{ background: 'none', border: 'none', color: '#065F46', fontSize: '12px', cursor: 'pointer' }}
                    >
                      Clear
                    </button>
                  </div>
                )}
              </div>

              {/* Mode Note */}
              <div
                style={{
                  background: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '12px',
                  color: '#64748B'
                }}
              >
                <Icon name="clock" size={14} color="#0B3A6F" />
                <span>
                  <strong>Asynchronous Engagement:</strong> No scheduled live section required. Your friend can take the challenge at any time within 24 hours.
                </span>
              </div>
            </div>

            {/* Modal Footer */}
            <div
              style={{
                padding: '16px 24px',
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
                onClick={() => setIsNewChallengeModalOpen(false)}
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #CBD5E1',
                  borderRadius: '6px',
                  padding: '8px 18px',
                  fontSize: '12.5px',
                  fontWeight: 600,
                  color: '#0B1A2B',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleAuthorizeChallenge}
                style={{
                  background: '#FEE047',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '9px 22px',
                  fontSize: '12.5px',
                  fontWeight: 800,
                  color: '#0B1A2B',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 2px 6px rgba(254, 224, 71, 0.35)'
                }}
              >
                <span>Authorize Challenge</span>
                <Icon name="chevronRight" size={12} color="#0B1A2B" />
              </button>
            </div>
          </div>
        </ModalPortal>
      )}

      {/* ======================================================================
          5. COMPARATIVE REVIEW MODAL FOR FINISHED CHALLENGES
          ====================================================================== */}
      {selectedComparisonModal && (
        <ModalPortal isOpen={true} onClose={() => setSelectedComparisonModal(null)}>
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: isMobile ? '95%' : '100%',
              maxWidth: '760px',
              maxHeight: isMobile ? '92vh' : '88vh',
              background: '#FFFFFF',
              borderRadius: isMobile ? '16px' : '20px',
              boxShadow: '0 24px 60px rgba(0, 0, 0, 0.25)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden'
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: isMobile ? '16px 18px' : '20px 28px',
                background: '#0B3A6F',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                flexShrink: 0
              }}
            >
              <div>
                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    background: 'rgba(255, 255, 255, 0.18)',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    display: 'inline-block',
                    marginBottom: '4px'
                  }}
                >
                  COMPARATIVE SCORE BREAKDOWN
                </span>
                <h2 style={{ fontSize: isMobile ? '18px' : '20px', fontWeight: 800, margin: 0 }}>
                  {selectedComparisonModal.topic}
                </h2>
                <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.8)', marginTop: '4px' }}>
                  Completed on {selectedComparisonModal.createdAt} · Verified Head-to-Head
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedComparisonModal(null)}
                style={{
                  background: 'rgba(255, 255, 255, 0.15)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  color: '#FFFFFF',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px',
                  lineHeight: 1,
                  transition: 'background 0.15s ease'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)'; }}
              >
                ✕
              </button>
            </div>

            {/* Scrollable Modal Content */}
            <div
              style={{
                padding: isMobile ? '16px 14px' : '22px 28px',
                display: 'flex',
                flexDirection: 'column',
                gap: isMobile ? '14px' : '18px',
                overflowY: 'auto',
                flex: 1,
                WebkitOverflowScrolling: 'touch'
              }}
            >
              {/* Score Comparison Cards */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                  gap: isMobile ? '10px' : '16px'
                }}
              >
                {/* User Card */}
                <div
                  style={{
                    background: selectedComparisonModal.userScore?.won ? '#ECFDF5' : '#F8FAFC',
                    border: `1.5px solid ${selectedComparisonModal.userScore?.won ? '#10B981' : '#E2E8F0'}`,
                    borderRadius: '12px',
                    padding: isMobile ? '14px' : '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '13px', fontWeight: 800, color: '#0B1A2B' }}>You (Student)</span>
                    {selectedComparisonModal.userScore?.won && (
                      <span style={{ background: '#10B981', color: '#FFFFFF', fontSize: '10px', fontWeight: 800, padding: '2px 6px', borderRadius: '4px' }}>
                        WINNER
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '26px', fontWeight: 800, color: '#0B3A6F' }}>
                    {selectedComparisonModal.userScore?.points} <span style={{ fontSize: '14px', fontWeight: 600 }}>pts</span>
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748B' }}>
                    Correct: <strong>{selectedComparisonModal.userScore?.correct}/{selectedComparisonModal.userScore?.total}</strong>
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748B' }}>
                    Time Taken: <strong>{selectedComparisonModal.userScore?.timeTaken}</strong>
                  </div>
                </div>

                {/* Opponent Card */}
                <div
                  style={{
                    background: selectedComparisonModal.opponentScore?.won ? '#ECFDF5' : '#F8FAFC',
                    border: `1.5px solid ${selectedComparisonModal.opponentScore?.won ? '#10B981' : '#E2E8F0'}`,
                    borderRadius: '12px',
                    padding: isMobile ? '14px' : '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '13px', fontWeight: 800, color: '#0B1A2B' }}>
                      {selectedComparisonModal.opponent.name}
                    </span>
                    {selectedComparisonModal.opponentScore?.won && (
                      <span style={{ background: '#10B981', color: '#FFFFFF', fontSize: '10px', fontWeight: 800, padding: '2px 6px', borderRadius: '4px' }}>
                        WINNER
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '26px', fontWeight: 800, color: '#64748B' }}>
                    {selectedComparisonModal.opponentScore?.points} <span style={{ fontSize: '14px', fontWeight: 600 }}>pts</span>
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748B' }}>
                    Correct: <strong>{selectedComparisonModal.opponentScore?.correct}/{selectedComparisonModal.opponentScore?.total}</strong>
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748B' }}>
                    Time Taken: <strong>{selectedComparisonModal.opponentScore?.timeTaken}</strong>
                  </div>
                </div>
              </div>

              {/* Status Outcome Banner */}
              <div
                style={{
                  background: '#F0F9FF',
                  border: '1px solid #BAE6FD',
                  borderRadius: '10px',
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}
              >
                <Icon name="statusUp" size={18} color="#0284C7" />
                <span style={{ fontSize: '12.5px', color: '#0369A1' }}>
                  {selectedComparisonModal.userScore?.won
                    ? `Victory verified! You outperformed ${selectedComparisonModal.opponent.name} by +${(selectedComparisonModal.userScore?.points || 0) - (selectedComparisonModal.opponentScore?.points || 0)} pts.`
                    : `Well fought! ${selectedComparisonModal.opponent.name} earned top points in this engagement.`}
                </span>
              </div>

              {/* Question & Answer Comparative Review Section */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '4px' }}>
                {/* Section Header */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '8px',
                    paddingBottom: '8px',
                    borderBottom: '1px solid #E2E8F0'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '8px',
                        background: '#0B3A6F',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Icon name="challenges" size={15} color="#FFFFFF" />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#0B1A2B', margin: 0 }}>
                        Question & Answer Breakdown
                      </h3>
                      <p style={{ fontSize: '11px', color: '#64748B', margin: '2px 0 0 0' }}>
                        Side-by-side responses and technical rationales
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                    <span
                      style={{
                        background: '#ECFDF5',
                        color: '#059669',
                        fontSize: '11px',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: '12px'
                      }}
                    >
                      Both Correct: {comparisonStats.bothCorrect}
                    </span>
                    <span
                      style={{
                        background: '#EFF6FF',
                        color: '#1D4ED8',
                        fontSize: '11px',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: '12px'
                      }}
                    >
                      Advantage You: {comparisonStats.userAdvantage}
                    </span>
                    {comparisonStats.oppAdvantage > 0 && (
                      <span
                        style={{
                          background: '#FFFBEB',
                          color: '#B45309',
                          fontSize: '11px',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: '12px'
                        }}
                      >
                        Advantage {selectedComparisonModal.opponent.name.split(' ')[0]}: {comparisonStats.oppAdvantage}
                      </span>
                    )}
                  </div>
                </div>

                {/* List of Questions */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {comparisonQuestions.map((q) => (
                    <div
                      key={q.qNum}
                      style={{
                        background: '#FFFFFF',
                        border: '1px solid #E2E8F0',
                        borderRadius: '12px',
                        padding: isMobile ? '14px' : '16px',
                        boxShadow: '0 1px 4px rgba(0, 0, 0, 0.04)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px'
                      }}
                    >
                      {/* Question Item Header */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          flexWrap: 'wrap',
                          gap: '8px'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span
                            style={{
                              background: '#0B3A6F',
                              color: '#FFFFFF',
                              fontSize: '11px',
                              fontWeight: 800,
                              padding: '2px 8px',
                              borderRadius: '6px'
                            }}
                          >
                            Q{q.qNum}
                          </span>
                          <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748B' }}>
                            Question {q.qNum} of {comparisonQuestions.length}
                          </span>
                        </div>

                        {/* Status pill */}
                        {q.isUserCorrect && q.isOppCorrect ? (
                          <span
                            style={{
                              background: '#ECFDF5',
                              color: '#059669',
                              border: '1px solid #A7F3D0',
                              fontSize: '11px',
                              fontWeight: 700,
                              padding: '3px 10px',
                              borderRadius: '20px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            <Icon name="checkCircle" size={12} color="#059669" />
                            Both Answered Correctly
                          </span>
                        ) : q.isUserCorrect && !q.isOppCorrect ? (
                          <span
                            style={{
                              background: '#EFF6FF',
                              color: '#1D4ED8',
                              border: '1px solid #BFDBFE',
                              fontSize: '11px',
                              fontWeight: 700,
                              padding: '3px 10px',
                              borderRadius: '20px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            <Icon name="statusUp" size={12} color="#1D4ED8" />
                            Advantage You (+4 pts)
                          </span>
                        ) : !q.isUserCorrect && q.isOppCorrect ? (
                          <span
                            style={{
                              background: '#FFFBEB',
                              color: '#B45309',
                              border: '1px solid #FDE68A',
                              fontSize: '11px',
                              fontWeight: 700,
                              padding: '3px 10px',
                              borderRadius: '20px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            <Icon name="clock" size={12} color="#B45309" />
                            Advantage {selectedComparisonModal.opponent.name} (+4 pts)
                          </span>
                        ) : (
                          <span
                            style={{
                              background: '#F8FAFC',
                              color: '#64748B',
                              border: '1px solid #E2E8F0',
                              fontSize: '11px',
                              fontWeight: 700,
                              padding: '3px 10px',
                              borderRadius: '20px'
                            }}
                          >
                            Both Missed (0 pts)
                          </span>
                        )}
                      </div>

                      {/* Question Prompt */}
                      <div
                        style={{
                          fontSize: isMobile ? '13px' : '14px',
                          fontWeight: 700,
                          color: '#0B1A2B',
                          lineHeight: '1.5'
                        }}
                      >
                        {q.question}
                      </div>

                      {/* Candidate Responses (Side-by-side or stacked on mobile) */}
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                          gap: '10px'
                        }}
                      >
                        {/* You / Student Response */}
                        <div
                          style={{
                            background: q.isUserCorrect ? '#F0FDF4' : '#FEF2F2',
                            border: `1.5px solid ${q.isUserCorrect ? '#86EFAC' : '#FECACA'}`,
                            borderRadius: '10px',
                            padding: '10px 12px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '6px'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '11px', fontWeight: 800, color: '#334155' }}>
                              Your Answer
                            </span>
                            <span
                              style={{
                                fontSize: '10.5px',
                                fontWeight: 800,
                                color: q.isUserCorrect ? '#15803D' : '#B91C1C'
                              }}
                            >
                              {q.isUserCorrect ? '✓ Correct (+4)' : '✕ Incorrect (0)'}
                            </span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                            <span
                              style={{
                                minWidth: '20px',
                                height: '20px',
                                borderRadius: '50%',
                                background: q.isUserCorrect ? '#15803D' : '#DC2626',
                                color: '#FFFFFF',
                                fontSize: '11px',
                                fontWeight: 800,
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginTop: '1px'
                              }}
                            >
                              {q.userOpt.letter}
                            </span>
                            <span style={{ fontSize: '12px', color: '#1E293B', lineHeight: '1.4', fontWeight: 600 }}>
                              {q.userOpt.text}
                            </span>
                          </div>
                        </div>

                        {/* Opponent Response */}
                        <div
                          style={{
                            background: q.isOppCorrect ? '#F0FDF4' : '#FEF2F2',
                            border: `1.5px solid ${q.isOppCorrect ? '#86EFAC' : '#FECACA'}`,
                            borderRadius: '10px',
                            padding: '10px 12px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '6px'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '11px', fontWeight: 800, color: '#334155' }}>
                              {selectedComparisonModal.opponent.name}'s Answer
                            </span>
                            <span
                              style={{
                                fontSize: '10.5px',
                                fontWeight: 800,
                                color: q.isOppCorrect ? '#15803D' : '#B91C1C'
                              }}
                            >
                              {q.isOppCorrect ? '✓ Correct (+4)' : '✕ Incorrect (0)'}
                            </span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                            <span
                              style={{
                                minWidth: '20px',
                                height: '20px',
                                borderRadius: '50%',
                                background: q.isOppCorrect ? '#15803D' : '#DC2626',
                                color: '#FFFFFF',
                                fontSize: '11px',
                                fontWeight: 800,
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginTop: '1px'
                              }}
                            >
                              {q.oppOpt.letter}
                            </span>
                            <span style={{ fontSize: '12px', color: '#1E293B', lineHeight: '1.4', fontWeight: 600 }}>
                              {q.oppOpt.text}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Correct Answer & Technical Explanation */}
                      <div
                        style={{
                          background: '#F8FAFC',
                          border: '1px solid #E2E8F0',
                          borderLeft: '4px solid #10B981',
                          borderRadius: '8px',
                          padding: '10px 12px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '4px'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Icon name="checkCircle" size={14} color="#10B981" />
                          <span style={{ fontSize: '11.5px', fontWeight: 800, color: '#065F46' }}>
                            Correct Solution: Option {q.correctOpt.letter} — {q.correctOpt.text}
                          </span>
                        </div>
                        <div style={{ fontSize: '11.5px', color: '#475569', lineHeight: '1.45', paddingLeft: '20px' }}>
                          <strong style={{ color: '#0B3A6F' }}>Technical Rationale:</strong> {q.explanation}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div
              style={{
                padding: isMobile ? '12px 16px' : '14px 28px',
                borderTop: '1px solid #E2E8F0',
                background: '#F8FAFC',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexShrink: 0
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Icon name="checkCircle" size={14} color="#059669" />
                <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>
                  Results verified & cryptographically recorded
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedComparisonModal(null)}
                style={{
                  background: '#0B3A6F',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px 20px',
                  color: '#FFFFFF',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#092C54'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = '#0B3A6F'; }}
              >
                Close Comparison
              </button>
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
