import React, { useState, useMemo, useEffect } from 'react';
import Icon from '../design-system/icons';
import ModalPortal from './ModalPortal';

// ============================================================================
// RICH CAMPUS & TECHNICAL EVENTS DATASET
// ============================================================================
const INITIAL_EVENTS = [
  {
    id: 'ev-1',
    title: 'Automation Expo & Robotics Telemetry Forum',
    category: 'Manufacturing / Hardware',
    type: 'expo',
    format: 'In-person',
    date: 'Oct 1, 2026',
    time: '02:30 PM - 06:00 PM',
    month: 'OCT',
    day: '01',
    venue: 'Bengaluru Tech Exhibition Hall 4, Main Campus Hub',
    image: '/assets/event-1.jpg',
    points: 75,
    speakers: [
      { name: 'Dr. R. Menon', org: 'ABB Robotics Lab', role: 'Principal Scientist' },
      { name: 'Priya Nair', org: 'Siemens Digital Industries', role: 'Telemetry Architect' }
    ],
    desc: 'Annual industry symposium bringing together automation leads, robotics researchers, and machinery architects to showcase next-generation PLC and real-time SCADA telemetry.',
    agenda: [
      { time: '02:30 PM', title: 'Keynote: Distributed Telemetry in Modern Assembly Lines', speaker: 'Dr. R. Menon' },
      { time: '03:45 PM', title: 'Live Demonstration: High-Frequency SCADA Sensor Mesh', speaker: 'Priya Nair' },
      { time: '05:00 PM', title: 'Open Q&A & Student Technical Networking', speaker: 'Industry Panel' }
    ],
    seatCapacity: 180,
    seatsRemaining: 42,
    prerequisites: 'Basic knowledge of control loops and industrial sensors recommended.',
    isFeatured: true
  },
  {
    id: 'ev-2',
    title: 'AI in Robotics & Multi-Agent Mechatronics Summit',
    category: 'AI & Robotics',
    type: 'summit',
    format: 'Online / Live',
    date: 'Oct 5, 2026',
    time: '10:00 AM - 01:30 PM',
    month: 'OCT',
    day: '05',
    venue: 'TrueSights Virtual Stage 1 (Interactive Livestream)',
    image: '/assets/event-2.jpg',
    points: 100,
    speakers: [
      { name: 'Arjun Das', org: 'IIT Madras Robotics Center', role: 'Lead AI Researcher' },
      { name: 'Dr. Elena Rostova', org: 'ETH Zurich Robotics', role: 'Visiting Fellow' }
    ],
    desc: 'Deep exploration of reinforcement learning for multi-degree-of-freedom robotic arms, sensor fusion, and computer-vision-guided autonomous mobile manipulators.',
    agenda: [
      { time: '10:00 AM', title: 'Reinforcement Learning in Dynamic Manipulator Control', speaker: 'Arjun Das' },
      { time: '11:15 AM', title: 'Sensor Fusion & Real-Time LiDAR SLAM Algorithms', speaker: 'Dr. Elena Rostova' },
      { time: '12:30 PM', title: 'Live Code Walkthrough: Gym-Robotics Simulations', speaker: 'Technical Team' }
    ],
    seatCapacity: 500,
    seatsRemaining: 168,
    prerequisites: 'Python and linear algebra fundamentals.',
    isFeatured: true
  },
  {
    id: 'ev-3',
    title: 'Cyber-Physical Systems & Embedded Safety Symposium',
    category: 'Systems Engineering',
    type: 'symposium',
    format: 'In-person',
    date: 'Oct 12, 2026',
    time: '04:00 PM - 07:15 PM',
    month: 'OCT',
    day: '12',
    venue: 'Main Campus Auditorium B, Systems Wing',
    image: '/assets/event-3.jpg',
    points: 60,
    speakers: [
      { name: 'Vikram Joshi', org: 'National Cyber Security Hub', role: 'Security Architect' },
      { name: 'Ananya Rao', org: 'Infosys Research Labs', role: 'Embedded Systems Lead' }
    ],
    desc: 'Architectural defense and formal safety verification protocols for critical embedded IoT microcontrollers and mission-critical propulsion control interfaces.',
    agenda: [
      { time: '04:00 PM', title: 'Zero-Trust Architecture for Micro-Controller Firmware', speaker: 'Vikram Joshi' },
      { time: '05:15 PM', title: 'Memory-Safe Embedded Rust in Industrial Hardware', speaker: 'Ananya Rao' },
      { time: '06:30 PM', title: 'Hands-on Hardware Glitch Attack Demonstration', speaker: 'Lab Coordinators' }
    ],
    seatCapacity: 120,
    seatsRemaining: 19,
    prerequisites: 'Microcontrollers (C/Rust) and basic bus protocols (SPI/I2C/CAN).',
    isFeatured: false
  },
  {
    id: 'ev-4',
    title: 'National Collegiate Cybersecurity CTF 2026',
    category: 'Cybersecurity & CTF',
    type: 'hackathon',
    format: 'Online / Live',
    date: 'Oct 16, 2026',
    time: '09:00 AM - 09:00 PM (12h Hackathon)',
    month: 'OCT',
    day: '16',
    venue: 'TrueSights Arena Cyber Lab (Virtual Range)',
    image: '/assets/event-2.jpg',
    points: 150,
    speakers: [
      { name: 'Karthik R', org: 'Campus CTF League', role: 'Tournament Director' },
      { name: 'Meera Sen', org: 'CERT-In Threat Research', role: 'Guest Evaluator' }
    ],
    desc: 'High-stakes 12-hour capture-the-flag tournament testing binary exploitation, reverse engineering, cryptographic ciphers, and smart contract audit puzzles.',
    agenda: [
      { time: '09:00 AM', title: 'CTF Kickoff & Challenge Server Unlocking', speaker: 'Tournament Director' },
      { time: '02:00 PM', title: 'Mid-Game Scoreboard Freeze & Bonus Challenge', speaker: 'Arena Ops' },
      { time: '08:30 PM', title: 'Writeup Verification & Award Ceremony', speaker: 'Meera Sen' }
    ],
    seatCapacity: 350,
    seatsRemaining: 84,
    prerequisites: 'Linux terminal literacy, basic Wireshark and Ghidra tooling.',
    isFeatured: true
  },
  {
    id: 'ev-5',
    title: 'Nuclear Reactor Dynamics & Delayed Neutrons Masterclass',
    category: 'Physics & Energy',
    type: 'workshop',
    format: 'In-person',
    date: 'Oct 22, 2026',
    time: '03:00 PM - 05:45 PM',
    month: 'OCT',
    day: '22',
    venue: 'Dr. H.J. Bhabha Seminar Hall, Energy Sciences Wing',
    image: '/assets/event-1.jpg',
    points: 80,
    speakers: [
      { name: 'Prof. K. Venkatesh', org: 'Nuclear Engineering Dept', role: 'Department Chair' },
      { name: 'Dr. S. Mukherjee', org: 'BARC Advanced Studies', role: 'Reactor Physics Specialist' }
    ],
    desc: 'Rigorous derivation of prompt criticality thresholds, 6-group delayed neutron equations, and thermal-hydraulic negative temperature feedback mechanisms.',
    agenda: [
      { time: '03:00 PM', title: 'Fission Energetics: 200 MeV Partitioning Breakdown', speaker: 'Prof. K. Venkatesh' },
      { time: '04:10 PM', title: 'Delayed Neutron Precursor Kinetics & Reactivity Drift', speaker: 'Dr. S. Mukherjee' },
      { time: '05:15 PM', title: 'Interactive Simulator: Simulating Core Control Rod Scram', speaker: 'Faculty Team' }
    ],
    seatCapacity: 90,
    seatsRemaining: 15,
    prerequisites: 'Undergraduate nuclear physics and differential equations.',
    isFeatured: false
  },
  {
    id: 'ev-6',
    title: 'Kerala Building By-Laws & Urban K-SMART Certification',
    category: 'Civil & Urban',
    type: 'workshop',
    format: 'In-person',
    date: 'Oct 28, 2026',
    time: '11:30 AM - 02:30 PM',
    month: 'OCT',
    day: '28',
    venue: 'Civil Engineering Block Hall 2, Smart City Lab',
    image: '/assets/event-3.jpg',
    points: 50,
    speakers: [
      { name: 'Er. Rajesh Varma', org: 'Town & Country Planning Directorate', role: 'Chief Town Planner' },
      { name: 'Arch. Deepa George', org: 'Green Building Council', role: 'Urban Resilience Fellow' }
    ],
    desc: 'Practical operational seminar on Kerala Municipal Building Rules (2025/2026 amendments), slope geotechnical permits, rainwater cistern norms, and automated digital K-SMART approvals.',
    agenda: [
      { time: '11:30 AM', title: 'Risk-Based Classification: Low vs Medium vs High Hazard', speaker: 'Er. Rajesh Varma' },
      { time: '12:45 PM', title: 'Slope Stability & Landslide Mitigation Standards', speaker: 'Arch. Deepa George' },
      { time: '01:45 PM', title: 'Hands-on K-SMART Portal Application Drafting', speaker: 'Lab Demonstrators' }
    ],
    seatCapacity: 110,
    seatsRemaining: 31,
    prerequisites: 'Building layout drawings & AutoCAD/Revit familiarity.',
    isFeatured: false
  },
  {
    id: 'ev-7',
    title: 'Semiconductor Device Physics & Quantum Tunneling Forum',
    category: 'Manufacturing / Hardware',
    type: 'summit',
    format: 'Online / Live',
    date: 'Nov 02, 2026',
    time: '02:00 PM - 05:00 PM',
    month: 'NOV',
    day: '02',
    venue: 'TrueSights Virtual Stage 2',
    image: '/assets/event-1.jpg',
    points: 90,
    speakers: [
      { name: 'Dr. Alok Chatterjee', org: 'Semiconductor Fab Initiative', role: 'Director of Lithography' },
      { name: 'Naveen P', org: 'Solid-State Materials Institute', role: 'Research Fellow' }
    ],
    desc: 'Comprehensive overview of 3nm gate-all-around (GAA) nanosheet FETs, Zener breakdown tunneling mechanisms, and high-k dielectric gate degradation models.',
    agenda: [
      { time: '02:00 PM', title: 'From FinFET to GAA: Electrostatic Channel Confinement', speaker: 'Dr. Alok Chatterjee' },
      { time: '03:15 PM', title: 'Quantum Band-to-Band Tunneling in Heavily Doped Silicon', speaker: 'Naveen P' },
      { time: '04:15 PM', title: 'Future of 2D Transition Metal Dichalcogenides', speaker: 'Q&A Panel' }
    ],
    seatCapacity: 400,
    seatsRemaining: 188,
    prerequisites: 'Solid state physics and basic PN junction theory.',
    isFeatured: false
  },
  {
    id: 'ev-8',
    title: 'Decentralized Bio-Informatics & Neuroimaging Hackathon',
    category: 'AI & Robotics',
    type: 'hackathon',
    format: 'In-person',
    date: 'Nov 08, 2026',
    time: '09:30 AM - 06:30 PM',
    month: 'NOV',
    day: '08',
    venue: 'Campus Innovation Center, Ground Floor Lab',
    image: '/assets/event-2.jpg',
    points: 200,
    speakers: [
      { name: 'Dr. Meenakshi S', org: 'Center for Neuro-Informatics', role: 'Director' },
      { name: 'Kiran Kurian', org: 'Open Decentralized Science', role: 'Core Contributor' }
    ],
    desc: 'Build distributed archival, CID verification, and federated machine learning workflows for 3D MRI brain scans without centralizing confidential patient datasets.',
    agenda: [
      { time: '09:30 AM', title: 'Neuroimaging Data Standards: BIDS & NIfTI Overviews', speaker: 'Dr. Meenakshi S' },
      { time: '11:00 AM', title: 'IPFS Content Addressing for Multi-Gigabyte Scans', speaker: 'Kiran Kurian' },
      { time: '05:30 PM', title: 'Project Pitches & Institutional Evaluation', speaker: 'Judging Board' }
    ],
    seatCapacity: 150,
    seatsRemaining: 27,
    prerequisites: 'Python (PyTorch / NumPy) and distributed systems fundamentals.',
    isFeatured: true
  }
];

export default function EventsPage({ onBackToDashboard, onAwardPoints }) {
  // Navigation & Category state: 'all' | 'registered'
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Registration & RSVP State (Pre-registered on event 1 & 2 for realistic continuity)
  const [registeredMap, setRegisteredMap] = useState({
    'ev-1': { ticketNumber: 'TS-8492', timestamp: 'Today, 10:14 AM' },
    'ev-2': { ticketNumber: 'TS-9104', timestamp: 'Yesterday, 03:40 PM' }
  });

  // Modal State
  const [detailModalEvent, setDetailModalEvent] = useState(null);
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

  // Toast feedback
  const [toastMessage, setToastMessage] = useState(null);
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3200);
  };

  // Toggle RSVP
  const handleToggleRSVP = (event) => {
    const isCurrentlyReg = !!registeredMap[event.id];
    if (isCurrentlyReg) {
      const nextMap = { ...registeredMap };
      delete nextMap[event.id];
      setRegisteredMap(nextMap);
      showToast(`Registration cancelled for "${event.title}".`);
    } else {
      const newTicket = `TS-${Math.floor(1000 + Math.random() * 9000)}`;
      setRegisteredMap({
        ...registeredMap,
        [event.id]: { ticketNumber: newTicket, timestamp: 'Just now' }
      });
      if (onAwardPoints && event.points) {
        onAwardPoints(event.points);
      }
      showToast(`Registration Confirmed! Pass #${newTicket} issued. (+${event.points} pts added)`);
    }
  };

  // Calendar (.ics) Generator
  const handleDownloadCalendar = (ev) => {
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//TrueSights Academic Platform//Events//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      `SUMMARY:${ev.title}`,
      `DESCRIPTION:${ev.desc} | Organized by TrueSights Academic Platform`,
      `LOCATION:${ev.venue}`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${ev.title.replace(/[^a-zA-Z0-9]/g, '_')}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Calendar event (.ics) downloaded for "${ev.title}".`);
  };

  // Filtered Events: only categories 'all' vs 'registered', plus search query
  const filteredEvents = useMemo(() => {
    return INITIAL_EVENTS.filter((item) => {
      // Category filter: 'all' vs 'registered'
      if (activeTab === 'registered' && !registeredMap[item.id]) return false;

      // Live search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const inTitle = item.title.toLowerCase().includes(q);
        const inDesc = item.desc.toLowerCase().includes(q);
        const inVenue = item.venue.toLowerCase().includes(q);
        const inCategory = item.category.toLowerCase().includes(q);
        const inSpeakers = item.speakers.some((s) => s.name.toLowerCase().includes(q) || s.org.toLowerCase().includes(q));
        if (!inTitle && !inDesc && !inVenue && !inCategory && !inSpeakers) return false;
      }

      return true;
    });
  }, [activeTab, searchQuery, registeredMap]);

  const registeredCount = Object.keys(registeredMap).length;

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
          1. HERO BANNER
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
            width: '220px',
            height: '220px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(254, 224, 71, 0.12) 0%, rgba(255, 255, 255, 0) 70%)',
            pointerEvents: 'none'
          }}
        />

        {/* Left Heading & Subtitle */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxWidth: '660px', zIndex: 1 }}>

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
            Campus & Technical Events
          </h1>
          <p
            style={{
              fontSize: isMobile ? '12.5px' : '13.5px',
              color: 'rgba(255, 255, 255, 0.9)',
              margin: 0,
              lineHeight: isMobile ? '18px' : '20px'
            }}
          >
            Explore engineering symposiums, robotics hackathons, and industrial masterclasses. Register to secure student passes, earn skill points, and sync directly with your calendar.
          </p>
        </div>
      </div>

      {/* ======================================================================
          2. SIMPLE & CLEAN LAYOUT: CATEGORIES (ALL EVENTS / MY RSVPS) + SEARCH
          ====================================================================== */}
      <div
        style={{
          background: '#FFFFFF',
          border: '1px solid #E2DDD3',
          borderRadius: '14px',
          padding: isMobile ? '12px 14px' : '14px 20px',
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          alignItems: isMobile ? 'stretch' : 'center',
          justifyContent: 'space-between',
          gap: isMobile ? '10px' : '16px',
          boxShadow: '0 1px 4px rgba(11, 26, 43, 0.03)',
          flexShrink: 0,
          flexWrap: 'wrap'
        }}
      >
        {/* Categories: All Events & My RSVPs */}
        <div
          style={{
            background: '#F1F5F9',
            borderRadius: '10px',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: isMobile ? 'space-between' : 'flex-start',
            width: isMobile ? '100%' : 'auto',
            gap: '4px'
          }}
        >
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            style={{
              background: activeTab === 'all' ? '#0B3A6F' : 'transparent',
              color: activeTab === 'all' ? '#FFFFFF' : '#475569',
              border: 'none',
              borderRadius: '7px',
              padding: '8px 18px',
              fontSize: '12.5px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <span>All Events</span>
            <span
              style={{
                background: activeTab === 'all' ? 'rgba(255, 255, 255, 0.24)' : '#E2E8F0',
                color: activeTab === 'all' ? '#FFFFFF' : '#475569',
                fontSize: '11px',
                fontWeight: 800,
                padding: '1px 7px',
                borderRadius: '10px'
              }}
            >
              {INITIAL_EVENTS.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('registered')}
            style={{
              background: activeTab === 'registered' ? '#0B3A6F' : 'transparent',
              color: activeTab === 'registered' ? '#FFFFFF' : '#475569',
              border: 'none',
              borderRadius: '7px',
              padding: '8px 18px',
              fontSize: '12.5px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <span>My RSVPs</span>
            <span
              style={{
                background: activeTab === 'registered' ? '#FEE047' : '#047857',
                color: activeTab === 'registered' ? '#0B1A2B' : '#FFFFFF',
                fontSize: '11px',
                fontWeight: 800,
                padding: '1px 7px',
                borderRadius: '10px'
              }}
            >
              {registeredCount}
            </span>
          </button>
        </div>

        {/* Prominent High-Visibility Search Bar */}
        <div
          style={{
            position: 'relative',
            flex: isMobile ? '1 1 100%' : '1 1 340px',
            width: isMobile ? '100%' : 'auto',
            maxWidth: isMobile ? '100%' : '560px',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <span
            style={{
              position: 'absolute',
              left: '14px',
              color: '#0B3A6F',
              display: 'flex',
              alignItems: 'center',
              pointerEvents: 'none'
            }}
          >
            <Icon name="search" size={17} color="#0B3A6F" />
          </span>
          <input
            type="text"
            placeholder="Search events by topic, keynote speaker, or venue..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              height: '42px',
              background: '#F8FAFC',
              border: '1.5px solid #E2E8F0',
              borderRadius: '10px',
              padding: '0 34px 0 42px',
              fontSize: '13px',
              fontWeight: 500,
              fontFamily: 'var(--font-primary, sans-serif)',
              color: '#0B1A2B',
              outline: 'none',
              boxSizing: 'border-box',
              transition: 'border-color 0.15s ease, background 0.15s ease, box-shadow 0.15s ease'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#0B3A6F';
              e.target.style.background = '#FFFFFF';
              e.target.style.boxShadow = '0 0 0 3px rgba(11, 58, 111, 0.08)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#E2E8F0';
              e.target.style.background = '#F8FAFC';
              e.target.style.boxShadow = 'none';
            }}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              title="Clear search"
              style={{
                position: 'absolute',
                right: '12px',
                background: '#E2E8F0',
                border: 'none',
                borderRadius: '50%',
                width: '18px',
                height: '18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#475569',
                cursor: 'pointer',
                fontSize: '11px',
                padding: 0
              }}
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* ======================================================================
          3. EVENTS CARDS GRID (TrueSights Design System)
          ====================================================================== */}
      {filteredEvents.length === 0 ? (
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: '16px',
            border: '1px dashed #CBD5E1',
            padding: '54px 24px',
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
              justifyContent: 'center',
              color: '#64748B'
            }}
          >
            <Icon name="calendarOutline" size={24} color="#64748B" />
          </div>
          <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: '#0B1A2B' }}>
            No events match your current criteria
          </h3>
          <p style={{ margin: 0, fontSize: '13px', color: '#64748B' }}>
            {activeTab === 'registered'
              ? 'You have not registered for any events yet. Explore all events to secure your passes!'
              : 'Try clearing your search query to discover more sessions.'}
          </p>
          <button
            type="button"
            onClick={() => {
              setActiveTab('all');
              setSearchQuery('');
            }}
            style={{
              marginTop: '8px',
              background: '#0B3A6F',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 18px',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(420px, 1fr))',
            gap: isMobile ? '14px' : '20px',
            paddingBottom: '32px'
          }}
        >
          {filteredEvents.map((event) => {
            const isRegistered = !!registeredMap[event.id];
            const regInfo = registeredMap[event.id];

            return (
              <div
                key={event.id}
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
                  overflow: 'hidden',
                  transition: 'box-shadow 0.2s ease, transform 0.2s ease, border-color 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 12px 28px -2px rgba(11, 26, 43, 0.08)';
                  e.currentTarget.style.borderColor = '#CBD5E1';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(11, 26, 43, 0.03)';
                  e.currentTarget.style.borderColor = '#E2DDD3';
                  e.currentTarget.style.transform = 'none';
                }}
              >
                {/* 1. Cover Image Banner with Overlaid Badges */}
                <div
                  style={{
                    width: '100%',
                    height: '148px',
                    position: 'relative',
                    overflow: 'hidden',
                    backgroundColor: '#0B3A6F',
                    cursor: 'pointer'
                  }}
                  onClick={() => setDetailModalEvent(event)}
                >
                  <img
                    src={event.image}
                    alt={event.title}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      transition: 'transform 0.4s ease'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.04)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />

                  {/* Gradient Overlay for text contrast */}
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'linear-gradient(180deg, rgba(11, 26, 43, 0.4) 0%, rgba(11, 26, 43, 0.1) 40%, rgba(11, 26, 43, 0.75) 100%)',
                      pointerEvents: 'none'
                    }}
                  />

                  {/* Top Badges Overlaid on Cover */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '12px',
                      left: '12px',
                      right: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      pointerEvents: 'none'
                    }}
                  >
                    <span
                      style={{
                        background: 'rgba(11, 26, 43, 0.88)',
                        backdropFilter: 'blur(6px)',
                        color: '#FFFFFF',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        padding: '3px 9px',
                        borderRadius: '6px',
                        fontSize: '10.5px',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.4px'
                      }}
                    >
                      {event.category}
                    </span>

                    <span
                      style={{
                        background: event.format === 'In-person' ? 'rgba(16, 185, 129, 0.92)' : 'rgba(37, 99, 235, 0.92)',
                        backdropFilter: 'blur(6px)',
                        color: '#FFFFFF',
                        padding: '3px 9px',
                        borderRadius: '6px',
                        fontSize: '10.5px',
                        fontWeight: 800,
                        letterSpacing: '0.3px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#FFFFFF' }} />
                      <span>{event.format}</span>
                    </span>
                  </div>

                  {/* Bottom-left Overlaid Date Badge Tile */}
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '10px',
                      left: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <div
                      style={{
                        background: '#FFFFFF',
                        borderRadius: '8px',
                        padding: '4px 10px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        boxShadow: '0 4px 10px rgba(0, 0, 0, 0.22)',
                        minWidth: '42px'
                      }}
                    >
                      <span style={{ fontSize: '9px', fontWeight: 800, color: '#DC2626', textTransform: 'uppercase' }}>
                        {event.month}
                      </span>
                      <span style={{ fontFamily: 'var(--font-heading, "Space Grotesk")', fontSize: '16px', fontWeight: 800, color: '#0B1A2B', lineHeight: '18px' }}>
                        {event.day}
                      </span>
                    </div>

                    <div style={{ color: '#FFFFFF', textShadow: '0 1px 3px rgba(0,0,0,0.7)' }}>
                      <div style={{ fontSize: '11px', fontWeight: 600 }}>{event.time}</div>
                    </div>
                  </div>

                  {/* Bottom-right Reward Points Badge */}
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '10px',
                      right: '12px',
                      background: '#FEE047',
                      color: '#0B1A2B',
                      borderRadius: '6px',
                      padding: '3px 8px',
                      fontSize: '11px',
                      fontWeight: 800,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
                    }}
                  >
                    <span>+{event.points} pts</span>
                  </div>
                </div>

                {/* 2. Main Content Body */}
                <div style={{ padding: '18px 22px', display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
                  {/* Event Title */}
                  <h3
                    onClick={() => setDetailModalEvent(event)}
                    style={{
                      fontFamily: 'var(--font-heading, "Space Grotesk", sans-serif)',
                      fontSize: '17px',
                      fontWeight: 700,
                      color: '#0B1A2B',
                      margin: 0,
                      lineHeight: '23px',
                      letterSpacing: '-0.01em',
                      cursor: 'pointer',
                      transition: 'color 0.15s ease'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = '#0B3A6F'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = '#0B1A2B'; }}
                  >
                    {event.title}
                  </h3>

                  {/* Venue / Stage Row */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '12px', color: '#475569' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8A97A6" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {event.venue}
                    </span>
                  </div>

                  {/* Speakers Pod */}
                  <div
                    style={{
                      background: '#FAF9F6',
                      border: '1px solid #EFEAE1',
                      borderRadius: '10px',
                      padding: '10px 12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px'
                    }}
                  >
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: '#0B3A6F',
                        color: '#FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '11px',
                        fontWeight: 800,
                        flexShrink: 0
                      }}
                    >
                      {event.speakers[0]?.name.charAt(0) || 'S'}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: '#0B1A2B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {event.speakers.map((s) => s.name).join(', ')}
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {event.speakers.map((s) => s.org).join(' · ')}
                      </div>
                    </div>
                  </div>

                  {/* Short Description */}
                  <p
                    style={{
                      fontSize: '12.5px',
                      color: '#475569',
                      margin: 0,
                      lineHeight: '18px',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}
                  >
                    {event.desc}
                  </p>
                </div>

                {/* 3. Card Footer Action Bar */}
                <div
                  style={{
                    borderTop: '1px solid #F1EFE9',
                    padding: '12px 20px',
                    background: '#FAFBFD',
                    borderRadius: '0 0 16px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    boxSizing: 'border-box',
                    gap: '10px'
                  }}
                >
                  {/* Left: View Details + Add to Calendar */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={() => setDetailModalEvent(event)}
                      style={{
                        background: '#FFFFFF',
                        border: '1px solid #CBD5E1',
                        borderRadius: '8px',
                        padding: '7px 12px',
                        fontSize: '11.5px',
                        fontWeight: 700,
                        color: '#0B1A2B',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#0B3A6F'; e.currentTarget.style.color = '#0B3A6F'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#CBD5E1'; e.currentTarget.style.color = '#0B1A2B'; }}
                    >
                      Details & Agenda
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDownloadCalendar(event)}
                      title="Download .ics Calendar Invite"
                      style={{
                        background: '#FFFFFF',
                        border: '1px solid #CBD5E1',
                        borderRadius: '8px',
                        width: '32px',
                        height: '32px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#64748B',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#0B3A6F'; e.currentTarget.style.color = '#0B3A6F'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#CBD5E1'; e.currentTarget.style.color = '#64748B'; }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                      </svg>
                    </button>
                  </div>

                  {/* Right: RSVP / Registration Button */}
                  {isRegistered ? (
                    <button
                      type="button"
                      onClick={() => handleToggleRSVP(event)}
                      style={{
                        background: '#ECFDF5',
                        border: '1px solid #A7F3D0',
                        borderRadius: '8px',
                        padding: '7px 14px',
                        color: '#047857',
                        fontSize: '12px',
                        fontWeight: 800,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        transition: 'all 0.15s ease'
                      }}
                      title="Click to cancel registration"
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#FEE2E2';
                        e.currentTarget.style.borderColor = '#FCA5A5';
                        e.currentTarget.style.color = '#DC2626';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#ECFDF5';
                        e.currentTarget.style.borderColor = '#A7F3D0';
                        e.currentTarget.style.color = '#047857';
                      }}
                    >
                      <Icon name="checkCircle" variant="bold" size={13} color="currentColor" />
                      <span>Registered ({regInfo?.ticketNumber})</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleToggleRSVP(event)}
                      style={{
                        background: '#FEE047',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '8px 16px',
                        color: '#0B1A2B',
                        fontSize: '12.5px',
                        fontWeight: 800,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        boxShadow: '0 2px 6px rgba(254, 224, 71, 0.35)',
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
                      <span>Register Now</span>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8">
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ======================================================================
          5. EVENT DETAILS & STUDENT TICKET MODAL
          ====================================================================== */}
      {detailModalEvent && (
        <ModalPortal isOpen={true} onClose={() => setDetailModalEvent(null)}>
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
              width: '100%',
              maxWidth: '680px',
              maxHeight: '90vh',
              background: '#FFFFFF',
              borderRadius: '16px',
              boxShadow: '0 24px 60px rgba(0, 0, 0, 0.25)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden'
            }}
          >
            {/* Modal Header Banner */}
            <div
              style={{
                position: 'relative',
                height: '160px',
                background: '#243367',
                overflow: 'hidden',
                flexShrink: 0
              }}
            >
              <img
                src={detailModalEvent.image}
                alt={detailModalEvent.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(180deg, rgba(11, 26, 43, 0.45) 0%, rgba(11, 26, 43, 0.9) 100%)'
                }}
              />

              {/* Close Button */}
              <button
                type="button"
                onClick={() => setDetailModalEvent(null)}
                style={{
                  position: 'absolute',
                  top: '14px',
                  right: '14px',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.2)',
                  border: 'none',
                  color: '#FFFFFF',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '15px'
                }}
              >
                ✕
              </button>

              {/* Title & Badges in Cover */}
              <div
                style={{
                  position: 'absolute',
                  bottom: '16px',
                  left: '24px',
                  right: '24px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <span
                    style={{
                      background: '#FEE047',
                      color: '#0B1A2B',
                      fontSize: '10px',
                      fontWeight: 800,
                      padding: '2px 8px',
                      borderRadius: '4px',
                      textTransform: 'uppercase'
                    }}
                  >
                    {detailModalEvent.category}
                  </span>
                  <span
                    style={{
                      background: 'rgba(255, 255, 255, 0.25)',
                      color: '#FFFFFF',
                      fontSize: '10px',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: '4px'
                    }}
                  >
                    {detailModalEvent.format}
                  </span>
                </div>
                <h2
                  style={{
                    fontFamily: 'var(--font-heading, "Space Grotesk")',
                    fontSize: '20px',
                    fontWeight: 800,
                    color: '#FFFFFF',
                    margin: 0,
                    lineHeight: '26px'
                  }}
                >
                  {detailModalEvent.title}
                </h2>
              </div>
            </div>

            {/* Modal Body (Scrollable) */}
            <div
              style={{
                padding: '24px',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '18px'
              }}
            >
              {/* Event Metadata Row */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '12px',
                  background: '#FAF9F6',
                  border: '1px solid #EFEAE1',
                  borderRadius: '12px',
                  padding: '14px'
                }}
              >
                <div>
                  <div style={{ fontSize: '10px', fontWeight: 700, color: '#8A97A6', textTransform: 'uppercase' }}>
                    DATE & TIME
                  </div>
                  <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#0B1A2B', marginTop: '2px' }}>
                    {detailModalEvent.date}
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748B' }}>
                    {detailModalEvent.time}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '10px', fontWeight: 700, color: '#8A97A6', textTransform: 'uppercase' }}>
                    VENUE / STAGE
                  </div>
                  <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#0B1A2B', marginTop: '2px' }}>
                    {detailModalEvent.venue}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '10px', fontWeight: 700, color: '#8A97A6', textTransform: 'uppercase' }}>
                    SEATS REMAINING
                  </div>
                  <div style={{ fontSize: '12.5px', fontWeight: 800, color: '#047857', marginTop: '2px' }}>
                    {detailModalEvent.seatsRemaining} of {detailModalEvent.seatCapacity} seats
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748B' }}>
                    +{detailModalEvent.points} Points rewarded
                  </div>
                </div>
              </div>

              {/* Digital Student Ticket Banner (if registered) */}
              {registeredMap[detailModalEvent.id] && (
                <div
                  style={{
                    background: 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)',
                    border: '1.5px dashed #059669',
                    borderRadius: '12px',
                    padding: '16px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '16px'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 800, color: '#047857', textTransform: 'uppercase' }}>
                        OFFICIAL STUDENT ENTRY PASS
                      </span>
                      <span style={{ background: '#059669', color: '#FFFFFF', fontSize: '9.5px', fontWeight: 800, padding: '1px 6px', borderRadius: '4px' }}>
                        VERIFIED
                      </span>
                    </div>
                    <div style={{ fontSize: '18px', fontWeight: 800, fontFamily: 'var(--font-heading, "Space Grotesk")', color: '#064E3B', marginTop: '4px' }}>
                      Pass ID: {registeredMap[detailModalEvent.id].ticketNumber}
                    </div>
                    <div style={{ fontSize: '11px', color: '#047857', marginTop: '2px' }}>
                      Student: Test Student (ID: TS-2026-ENG) · Hall Admittance Granted
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDownloadCalendar(detailModalEvent)}
                    style={{
                      background: '#047857',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '8px 14px',
                      fontSize: '11.5px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      flexShrink: 0
                    }}
                  >
                    Sync to Calendar
                  </button>
                </div>
              )}

              {/* Overview */}
              <div>
                <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#0B1A2B', margin: '0 0 6px 0' }}>
                  About this Session
                </h4>
                <p style={{ fontSize: '13px', color: '#475569', lineHeight: '20px', margin: 0 }}>
                  {detailModalEvent.desc}
                </p>
              </div>

              {/* Agenda Schedule */}
              <div>
                <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#0B1A2B', margin: '0 0 10px 0' }}>
                  Session Agenda & Timelines
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {detailModalEvent.agenda.map((item, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '14px',
                        background: '#FAF9F6',
                        borderRadius: '8px',
                        padding: '10px 14px'
                      }}
                    >
                      <span style={{ fontFamily: 'var(--font-heading, "Space Grotesk")', fontSize: '12px', fontWeight: 700, color: '#0B3A6F', minWidth: '70px' }}>
                        {item.time}
                      </span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#0B1A2B' }}>
                          {item.title}
                        </div>
                        <div style={{ fontSize: '11px', color: '#64748B' }}>
                          Speaker: {item.speaker}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Keynote Speakers */}
              <div>
                <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#0B1A2B', margin: '0 0 10px 0' }}>
                  Distinguished Keynote Speakers
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  {detailModalEvent.speakers.map((sp, idx) => (
                    <div
                      key={idx}
                      style={{
                        border: '1px solid #E2DDD3',
                        borderRadius: '10px',
                        padding: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                      }}
                    >
                      <div
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          background: '#0B3A6F',
                          color: '#FFFFFF',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 800,
                          fontSize: '13px',
                          flexShrink: 0
                        }}
                      >
                        {sp.name.charAt(0)}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#0B1A2B' }}>
                          {sp.name}
                        </div>
                        <div style={{ fontSize: '11px', color: '#64748B' }}>
                          {sp.role} · {sp.org}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer CTA */}
            <div
              style={{
                borderTop: '1px solid #EFEAE1',
                padding: '16px 24px',
                background: '#FAFBFD',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexShrink: 0
              }}
            >
              <button
                type="button"
                onClick={() => handleDownloadCalendar(detailModalEvent)}
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #CBD5E1',
                  borderRadius: '8px',
                  padding: '9px 18px',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  color: '#0B1A2B',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                <span>Add to Calendar (.ics)</span>
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setDetailModalEvent(null)}
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid #CBD5E1',
                    borderRadius: '8px',
                    padding: '9px 16px',
                    fontSize: '12px',
                    fontWeight: 700,
                    color: '#64748B',
                    cursor: 'pointer'
                  }}
                >
                  Close
                </button>

                <button
                  type="button"
                  onClick={() => {
                    handleToggleRSVP(detailModalEvent);
                  }}
                  style={{
                    background: registeredMap[detailModalEvent.id] ? '#DC2626' : '#FEE047',
                    color: registeredMap[detailModalEvent.id] ? '#FFFFFF' : '#0B1A2B',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '9px 22px',
                    fontSize: '13px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  }}
                >
                  {registeredMap[detailModalEvent.id] ? 'Cancel Registration' : 'Confirm Registration'}
                </button>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}



      {/* Floating Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            background: '#0B1A2B',
            color: '#FFFFFF',
            padding: '12px 20px',
            borderRadius: '10px',
            fontSize: '13px',
            fontWeight: 700,
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.25)',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            animation: 'slideUpToast 0.2s ease-out'
          }}
        >
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
