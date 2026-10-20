import React, { useState, useEffect } from 'react';
import Icon from '../design-system/icons';
import ModalPortal from './ModalPortal';

// Core curriculum dataset consumed from user's Kerala Building Rules knowledge
const KERALA_PROJECT_DATA = {
  id: 'priv-kerala-2025',
  title: 'Kerala Building Rules 2025 Amendment',
  type: 'private',
  level: 'POSTGRADUATE',
  coverImage: '/assets/book-building.jpg',
  description:
    'A comprehensive postgraduate-level study plan focused on the anticipated 2025 amendments to the Kerala Municipality and Panchayat Building Rules.',
  totalModules: 5,
  initialProgress: 39,
  modules: [
    {
      id: 'mod-1',
      number: 1,
      title: 'Administrative Reforms & Digital Governance',
      description:
        'Explores the shift towards fully digitized permit approvals and risk-based administrative workflows introduced in the 2025 amendment to improve ease of doing business in Kerala construction.',
      subtopics: [
        {
          id: 'st-1-1',
          number: '01',
          title: 'K-SMART Integration and Automated Approvals',
          readTime: '18 mins',
          tag: 'DIGITAL WORKFLOW',
          overview:
            'Details the mandatory use of the K-SMART platform for building plan submissions, focusing on automated scrutiny and structural verification processes across all local self-government institutions.',
          concepts: [
            {
              id: 'c-1-1',
              title: 'Auto-Scrutiny of Building Plans',
              icon: 'aiAutomation',
              description:
                'Algorithmic software within K-SMART automatically inspects CAD/BIM models against statutory building parameters like FAR, setbacks, and height limits without manual intervention.',
              memoryAnchor: 'CAD: Check Automatically Dimensions'
            },
            {
              id: 'c-1-2',
              title: 'Single Window Clearance System',
              icon: 'docUpload',
              description:
                'A centralized digital portal where clearances from various statutory departments (Fire & Rescue, Pollution Control Board, Coastal Zone Management) are routed and obtained simultaneously.',
              memoryAnchor: 'ONE: One Network Environment'
            }
          ],
          quizQuestion: {
            question: 'What is the primary function of K-SMART integration in the 2025 building rules amendment?',
            options: [
              'Automated CAD/BIM rule-checking and single-window digital permits',
              'Manual physical document scrutiny at local municipal panchayats',
              'Calculating commercial property tax assessments annually',
              'Standardizing municipal water drainage connection charges'
            ],
            correctIndex: 0,
            explanation:
              'K-SMART provides an algorithmic rule engine that auto-validates CAD submissions against zoning setbacks and height regulations without manual delays.'
          }
        },
        {
          id: 'st-1-2',
          number: '02',
          title: 'Risk-Based Permit Classification',
          readTime: '22 mins',
          tag: 'PERMIT TIERS',
          overview:
            'Categorizes building proposals into objective risk tiers to eliminate bureaucratic bottlenecks for standard low-impact residential structures.',
          concepts: [
            {
              id: 'c-2-1',
              title: 'Self-Certification for Low-Risk Structures',
              icon: 'statusUp',
              description:
                'Residential plots with built-up areas under 300 sq.m qualify for immediate self-certification through registered architects and structural engineers.',
              memoryAnchor: 'LOW: Low Obstacles With 300sqm'
            },
            {
              id: 'c-2-2',
              title: 'High-Risk Environmental & Fire Scrutiny',
              icon: 'bookSquareBold',
              description:
                'High-occupancy commercial assemblies and structures exceeding 15 meters undergo multi-agency site visits and advanced structural peer reviews.',
              memoryAnchor: 'HIGH: Height Inspections Guard Hazards'
            }
          ],
          quizQuestion: {
            question: 'Under the risk-based classification, what qualifies a residential structure for fast-track self-certification?',
            options: [
              'Built-up area under 300 sq.m with registered professional certification',
              'Any commercial mall with adequate road frontage',
              'Multistory residential towers located in municipal corporation zones',
              'Only heritage conservation zone properties'
            ],
            correctIndex: 0,
            explanation:
              'Low-risk residential constructions up to 300 sq.m can proceed on registered professional self-certification with deemed approval.'
          }
        }
      ]
    },
    {
      id: 'mod-2',
      number: 2,
      title: 'Disaster Resilience & Topographical Safety',
      description:
        'Standards for slope stability, landslide hazard zoning, flood-resistant plinth elevations, and mandatory soil stabilization norms in hilly terrains of Wayanad and Idukki districts.',
      subtopics: [
        {
          id: 'st-2-1',
          number: '01',
          title: 'Slope Stability & Retaining Wall Codification',
          readTime: '25 mins',
          tag: 'GEO-TECHNICAL',
          overview:
            'Mandatory geo-technical investigations and reinforced retaining walls for construction on natural terrain slopes exceeding 25 degrees gradient.',
          concepts: [
            {
              id: 'c-3-1',
              title: 'Geo-Technical Borehole Protocols',
              icon: 'statusUp',
              description:
                'Soil boring and sub-surface rock profiling required before foundation permits on steep gradients.',
              memoryAnchor: 'SOIL: Subsurface Observations Indicate Landslides'
            }
          ],
          quizQuestion: {
            question: 'At what terrain slope threshold do the 2025 rules mandate geo-technical slope stability clearance?',
            options: [
              'Slopes exceeding 25 degrees gradient',
              'Only slopes exceeding 60 degrees gradient',
              'Any flat land adjacent to coastal beaches',
              'Slopes under 5 degrees gradient'
            ],
            correctIndex: 0,
            explanation:
              'Slopes over 25 degrees require detailed soil boring tests and certified retaining wall structural calculations.'
          }
        }
      ]
    },
    {
      id: 'mod-3',
      number: 3,
      title: 'Sustainability & Water Management',
      description:
        'Comprehensive rainwater harvesting standards, decentralized greywater recycling, rooftop solar photovoltaic mandates, and organic waste processing in collective residential communities.',
      subtopics: [
        {
          id: 'st-3-1',
          number: '01',
          title: 'Mandatory Decentralized Rainwater Harvesting',
          readTime: '16 mins',
          tag: 'ECOLOGICAL',
          overview:
            'Minimum storage capacity calculated at 50 liters per square meter of roof catchment area, coupled with groundwater recharge percolation wells.',
          concepts: [
            {
              id: 'c-4-1',
              title: 'Roof Catchment Storage Sizing',
              icon: 'sunFog',
              description:
                'Statutory formula mandating 50 L/sq.m storage tank capacity combined with filtration desilting chambers.',
              memoryAnchor: 'RAIN: Retain Aquifers In Nature'
            }
          ],
          quizQuestion: {
            question: 'What is the required rainwater storage capacity per square meter of roof catchment area?',
            options: [
              '50 liters per square meter of roof area',
              '5 liters per square meter of roof area',
              '200 liters per square meter of roof area',
              'Voluntary guideline with zero mandatory capacity'
            ],
            correctIndex: 0,
            explanation:
              'The 2025 amendment prescribes a strict 50 L/sq.m storage minimum to build regional aquifer resilience.'
          }
        }
      ]
    },
    {
      id: 'mod-4',
      number: 4,
      title: 'FAR, Zoning & Height Regulations',
      description:
        'Reformulated base FAR allowances, purchasable Premium FAR indexation linked to transit corridors, and relaxed height restrictions on road widths exceeding 12 meters.',
      subtopics: [
        {
          id: 'st-4-1',
          number: '01',
          title: 'Transit-Oriented Premium FAR Corridors',
          readTime: '24 mins',
          tag: 'URBAN PLANNING',
          overview:
            'Incentivizing compact high-density urban development within 500m of Metro and Suburban railway corridors with up to 1.5x additional purchasable FAR.',
          concepts: [
            {
              id: 'c-5-1',
              title: 'TOD Indexation and Setbacks',
              icon: 'card',
              description:
                'Enhanced Floor Area Ratio granted within 500m of mass rapid transit corridors to curb peripheral urban sprawl.',
              memoryAnchor: 'TOD: Transit Oriented Density'
            }
          ],
          quizQuestion: {
            question: 'Where is the maximum purchasable Premium FAR allowed under the 2025 rules?',
            options: [
              'Within 500m of designated mass transit corridors',
              'Exclusively in agricultural preservation zones',
              'Within designated hill sanctuary reserves',
              'Only on island water boundaries'
            ],
            correctIndex: 0,
            explanation:
              'Transit-oriented development zones permit enhanced FAR to reduce sprawling peripheral vehicle commutes.'
          }
        }
      ]
    },
    {
      id: 'mod-5',
      number: 5,
      title: 'Mobility & EV Parking Norms',
      description:
        'Electric Vehicle (EV) charging infrastructure conduits, mechanized puzzle parking specifications, and dedicated safe pedestrian pathways inside gated residential complexes.',
      subtopics: [
        {
          id: 'st-5-1',
          number: '01',
          title: 'Electric Vehicle (EV) Charging Conduits',
          readTime: '15 mins',
          tag: 'INFRASTRUCTURE',
          overview:
            'Mandating that at least 25% of designated residential parking slots and 40% of commercial parking slots include dedicated EV charging power conduits.',
          concepts: [
            {
              id: 'c-6-1',
              title: 'EV Charging Readiness Specifications',
              icon: 'statusUp',
              description:
                'Statutory requirement for high-load power conduits in 40% of commercial parking stalls.',
              memoryAnchor: 'VOLT: Verify Outlets Linked Today'
            }
          ],
          quizQuestion: {
            question: 'What percentage of parking slots in commercial complexes must have EV charging conduits installed?',
            options: [
              'At least 40% of commercial parking slots',
              'At least 100% of all parking slots',
              'Less than 5% on voluntary basis',
              'EV charging is restricted from indoor parking'
            ],
            correctIndex: 0,
            explanation:
              'The 2025 rules mandate that 40% of commercial bays be pre-wired with dedicated electrical conduits for EV chargers.'
          }
        }
      ]
    }
  ]
};

export default function ProjectWorkspace({
  project,
  onExit,
  onAwardPoints,
  onStartLiveChallenge,
  savedChallengeSession
}) {
  const projectTitle = project?.title || project?.name || KERALA_PROJECT_DATA.title;
  const isKerala = projectTitle.toLowerCase().includes('kerala');
  const activeData = isKerala
    ? KERALA_PROJECT_DATA
    : {
        ...KERALA_PROJECT_DATA,
        title: projectTitle,
        level: project?.level || KERALA_PROJECT_DATA.level,
        description: project?.description || project?.desc || KERALA_PROJECT_DATA.description,
        modules: (Array.isArray(project?.modules) && typeof project.modules[0] === 'object' && project.modules[0]?.subtopics)
          ? project.modules
          : KERALA_PROJECT_DATA.modules
      };

  const [activeModuleIndex, setActiveModuleIndex] = useState(0);
  const [expandedSubtopics, setExpandedSubtopics] = useState({ 'st-1-1': true });

  // Quiz Modal State
  const [activeQuizSubtopic, setActiveQuizSubtopic] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [completedQuizzes, setCompletedQuizzes] = useState({});
  const [progressScore, setProgressScore] = useState(activeData.initialProgress || 39);
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

  // Toast
  const [toastMessage, setToastMessage] = useState(null);
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const currentModule = (activeData.modules && activeData.modules[activeModuleIndex]) || (activeData.modules && activeData.modules[0]) || KERALA_PROJECT_DATA.modules[0];

  const toggleSubtopic = (id) => {
    setExpandedSubtopics((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const openQuiz = (subtopic, e) => {
    e.stopPropagation();
    setActiveQuizSubtopic(subtopic);
    setSelectedOption(null);
    setIsSubmitted(false);
  };

  const handleVerifyQuiz = () => {
    if (selectedOption === null || !activeQuizSubtopic) return;
    setIsSubmitted(true);
    const isCorrect = selectedOption === activeQuizSubtopic.quizQuestion.correctIndex;

    if (isCorrect && !completedQuizzes[activeQuizSubtopic.id]) {
      setCompletedQuizzes((prev) => ({ ...prev, [activeQuizSubtopic.id]: true }));
      const newScore = Math.min(100, progressScore + 18);
      setProgressScore(newScore);
      if (onAwardPoints) onAwardPoints(25);
      showToast('Mastery Verified! +25 Points Added to Wallet.');
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: isMobile ? 'auto' : '100%',
        minHeight: isMobile ? '100%' : '100%',
        boxSizing: 'border-box',
        gap: isMobile ? '10px' : '14px',
        overflow: isMobile ? 'visible' : 'hidden'
      }}
    >
      {/* 1. TOP SECURE EXIT & BREADCRUMB ROW */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
          gap: isMobile ? '8px' : '12px'
        }}
      >
        <button
          type="button"
          onClick={onExit}
          style={{
            height: isMobile ? '34px' : '36px',
            padding: isMobile ? '0 12px' : '0 16px',
            background: '#FFFFFF',
            border: '1px solid var(--card-border, #E2E6EF)',
            borderRadius: '999px',
            color: 'var(--primary-navy, #20346B)',
            fontFamily: 'var(--font-primary)',
            fontSize: isMobile ? '11.5px' : '12px',
            fontWeight: 800,
            letterSpacing: '0.04em',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            cursor: 'pointer',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            transition: 'all 0.16s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--primary-navy, #20346B)';
            e.currentTarget.style.color = '#FFFFFF';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#FFFFFF';
            e.currentTarget.style.color = 'var(--primary-navy, #20346B)';
          }}
        >
          <Icon name="prevStep" size={13} color="currentColor" />
          <span>{isMobile ? 'Back' : 'Back to Projects'}</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '6px' : '8px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              background: '#FFFFFF',
              border: '1px solid #E2E6EF',
              padding: isMobile ? '5px 10px' : '6px 14px',
              borderRadius: '999px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
            }}
          >
            <Icon name="rewardGem" size={isMobile ? 13 : 15} color="#F59E0B" />
            <span style={{ fontSize: isMobile ? '11px' : '12px', fontWeight: 800, color: '#1F2537', fontFamily: 'var(--font-primary)' }}>
              150 PTS
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: isMobile ? '6px' : '8px',
              background: '#FFFFFF',
              border: '1px solid #E2E6EF',
              padding: isMobile ? '5px 10px' : '6px 14px',
              borderRadius: '999px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
            }}
          >
            <div style={{ width: isMobile ? '30px' : '40px', height: '6px', background: '#F1F5F9', borderRadius: '3px', overflow: 'hidden' }}>
              <div
                style={{
                  width: `${progressScore}%`,
                  height: '100%',
                  background: 'var(--primary-navy, #20346B)',
                  transition: 'width 0.3s ease'
                }}
              />
            </div>
            <span style={{ fontSize: isMobile ? '11px' : '12px', fontWeight: 800, color: 'var(--primary-navy, #20346B)', fontFamily: 'var(--font-primary)' }}>
              {progressScore}%
            </span>
          </div>
        </div>
      </div>

      {/* 2. HERO BANNER (Matches TrueSights Navy Banners cleanly) */}
      <div
        style={{
          background: '#243367',
          borderRadius: isMobile ? '14px' : '16px',
          padding: isMobile ? '14px 16px' : '18px 24px',
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          alignItems: isMobile ? 'stretch' : 'center',
          justifyContent: 'space-between',
          gap: isMobile ? '12px' : '20px',
          boxShadow: '0 4px 16px rgba(36, 51, 103, 0.14)',
          flexShrink: 0
        }}
      >
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span
              style={{
                background: 'rgba(255, 255, 255, 0.15)',
                color: '#FFFFFF',
                fontSize: isMobile ? '9.5px' : '10.5px',
                fontWeight: 800,
                letterSpacing: '0.06em',
                padding: '2px 8px',
                borderRadius: '6px',
                fontFamily: 'var(--font-primary)'
              }}
            >
              {activeData.level} · ROADMAP WORKSPACE
            </span>
          </div>

          <h1
            style={{
              fontFamily: 'var(--font-primary)',
              fontSize: isMobile ? '18px' : '22px',
              fontWeight: 800,
              color: '#FFFFFF',
              margin: '2px 0 4px 0',
              letterSpacing: '-0.01em',
              lineHeight: 1.3
            }}
          >
            {activeData.title}
          </h1>

          <p
            style={{
              fontFamily: 'var(--font-primary)',
              fontSize: isMobile ? '12px' : '12.5px',
              color: 'rgba(255, 255, 255, 0.85)',
              margin: 0,
              lineHeight: 1.45,
              maxWidth: '820px'
            }}
          >
            {activeData.description}
          </p>
        </div>

        {/* Banner Right Metric Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0, width: isMobile ? '100%' : 'auto' }}>
          <div
            style={{
              flex: isMobile ? 1 : 'none',
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.16)',
              borderRadius: '10px',
              padding: isMobile ? '6px 12px' : '8px 16px',
              textAlign: 'center'
            }}
          >
            <div style={{ color: '#FFFFFF', fontSize: isMobile ? '16px' : '18px', fontWeight: 800, fontFamily: 'var(--font-primary)' }}>
              {activeData.totalModules || activeData.modules?.length || 5}
            </div>
            <div style={{ color: 'rgba(255, 255, 255, 0.65)', fontSize: '9px', fontWeight: 700, fontFamily: 'var(--font-primary)' }}>
              MODULES
            </div>
          </div>

          <div
            style={{
              flex: isMobile ? 1 : 'none',
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.16)',
              borderRadius: '10px',
              padding: isMobile ? '6px 12px' : '8px 16px',
              textAlign: 'center'
            }}
          >
            <div style={{ color: '#FFFFFF', fontSize: isMobile ? '16px' : '18px', fontWeight: 800, fontFamily: 'var(--font-primary)' }}>
              {progressScore}%
            </div>
            <div style={{ color: 'rgba(255, 255, 255, 0.65)', fontSize: '9px', fontWeight: 700, fontFamily: 'var(--font-primary)' }}>
              COMPLETED
            </div>
          </div>
        </div>
      </div>

      {/* MOBILE-ONLY HORIZONTAL MODULE SELECTOR STRIP (Clean native app carousel) */}
      {isMobile && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            background: '#FFFFFF',
            border: '1px solid #E2E6EF',
            borderRadius: '14px',
            padding: '12px 14px',
            boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 2px' }}>
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#4B7EE8', letterSpacing: '0.06em', textTransform: 'uppercase', fontFamily: 'var(--font-primary)' }}>
              ROADMAP MODULES ({activeData.modules.length})
            </span>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', fontFamily: 'var(--font-primary)' }}>
              Module {activeModuleIndex + 1} of {activeData.modules.length}
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              overflowX: 'auto',
              paddingBottom: '2px',
              WebkitOverflowScrolling: 'touch',
              scrollbarWidth: 'none'
            }}
          >
            {activeData.modules.map((mod, idx) => {
              const isSelected = idx === activeModuleIndex;
              return (
                <button
                  key={mod.id || idx}
                  type="button"
                  onClick={() => setActiveModuleIndex(idx)}
                  style={{
                    flexShrink: 0,
                    padding: '8px 14px',
                    borderRadius: '10px',
                    border: isSelected ? '1.5px solid #243367' : '1px solid #E2E8F0',
                    background: isSelected ? '#243367' : '#F8FAFC',
                    color: isSelected ? '#FFFFFF' : '#334155',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    cursor: 'pointer',
                    boxShadow: isSelected ? '0 2px 8px rgba(36, 51, 103, 0.25)' : 'none',
                    transition: 'all 0.15s ease',
                    fontFamily: 'var(--font-primary)'
                  }}
                >
                  <span
                    style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      background: isSelected ? 'rgba(255, 255, 255, 0.25)' : '#E2E8F0',
                      color: isSelected ? '#FFFFFF' : '#4B7EE8',
                      fontSize: '11px',
                      fontWeight: 800,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {mod.number || idx + 1}
                  </span>
                  <span style={{ fontSize: '12px', fontWeight: isSelected ? 800 : 600, whiteSpace: 'nowrap' }}>
                    {mod.title.length > 22 ? mod.title.slice(0, 22) + '...' : mod.title}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. MAIN WORKSPACE CANVAS (Two-Column on Desktop, Full-Width on Mobile) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '290px 1fr',
          gap: isMobile ? '12px' : '16px',
          flex: 1,
          minHeight: 0,
          overflow: isMobile ? 'visible' : 'hidden'
        }}
      >
        {/* LEFT COLUMN: KNOWLEDGE STACK (Desktop only - Mobile uses the horizontal carousel above) */}
        {!isMobile && (
        <div
          style={{
            background: '#FFFFFF',
            border: '1px solid var(--card-border, #E2E6EF)',
            borderRadius: '16px',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            overflowY: 'auto',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
          }}
        >
          {/* Knowledge Stack Header with #4B7EE8 branding */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingBottom: '12px',
              borderBottom: '1px solid #EEF2F6',
              marginBottom: '4px'
            }}
          >
            <div>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  color: '#4B7EE8',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  fontFamily: 'var(--font-primary)'
                }}
              >
                KNOWLEDGE STACK
              </span>
            </div>
            <span
              style={{
                fontSize: '10.5px',
                fontWeight: 700,
                color: '#4B7EE8',
                background: 'rgba(75, 126, 232, 0.1)',
                padding: '2px 8px',
                borderRadius: '999px',
                fontFamily: 'var(--font-primary)'
              }}
            >
              {activeData.modules.length} Modules
            </span>
          </div>

          {activeData.modules.map((mod, idx) => {
            const isSelected = idx === activeModuleIndex;
            return (
              <div
                key={mod.id}
                onClick={() => setActiveModuleIndex(idx)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 14px',
                  borderRadius: '12px',
                  background: isSelected ? 'rgba(75, 126, 232, 0.08)' : '#FFFFFF',
                  border: isSelected ? '1.5px solid #4B7EE8' : '1px solid #E2E6EF',
                  cursor: 'pointer',
                  transition: 'all 0.16s ease',
                  position: 'relative'
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.borderColor = '#CBD5E1';
                    e.currentTarget.style.background = '#F8FAFC';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.borderColor = '#E2E6EF';
                    e.currentTarget.style.background = '#FFFFFF';
                  }
                }}
              >
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: isSelected ? '#4B7EE8' : '#F1F5F9',
                    color: isSelected ? '#FFFFFF' : '#475569',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '13px',
                    fontWeight: 800,
                    fontFamily: 'var(--font-primary)',
                    flexShrink: 0,
                    boxShadow: isSelected ? '0 2px 6px rgba(75, 126, 232, 0.3)' : 'none',
                    transition: 'all 0.16s ease'
                  }}
                >
                  {mod.number}
                </div>

                <div style={{ minWidth: 0, flex: 1 }}>
                  <h4
                    style={{
                      fontFamily: 'var(--font-primary)',
                      fontSize: '13px',
                      fontWeight: isSelected ? 700 : 600,
                      color: isSelected ? '#1E3A8A' : 'var(--heading-text, #1F2537)',
                      margin: 0,
                      lineHeight: 1.35
                    }}
                  >
                    {mod.title}
                  </h4>
                  <div
                    style={{
                      fontSize: '11px',
                      color: isSelected ? '#4B7EE8' : 'var(--secondary-text, #6B7790)',
                      fontWeight: 600,
                      marginTop: '3px',
                      fontFamily: 'var(--font-primary)'
                    }}
                  >
                    {mod.subtopics?.length || 0} subtopics
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        )}

        {/* RIGHT COLUMN: MODULE DETAILS & EXPANDABLE SUBTOPICS */}
        <div
          style={{
            background: '#FFFFFF',
            border: '1px solid var(--card-border, #E2E6EF)',
            borderRadius: '16px',
            padding: isMobile ? '16px 14px' : '22px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            overflowY: 'auto',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
          }}
        >
          {/* Module Title Header */}
          <div style={{ borderBottom: '1px solid #F1F5F9', paddingBottom: '14px' }}>
            <h2
              style={{
                fontFamily: 'var(--font-primary)',
                fontSize: '20px',
                fontWeight: 800,
                color: 'var(--heading-text, #1F2537)',
                margin: '0 0 6px 0',
                letterSpacing: '-0.01em'
              }}
            >
              {currentModule.title}
            </h2>
            <p
              style={{
                fontFamily: 'var(--font-primary)',
                fontSize: '13px',
                color: 'var(--secondary-text, #6B7790)',
                margin: 0,
                lineHeight: 1.5
              }}
            >
              {currentModule.description}
            </p>
          </div>

          {/* Subtopics List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {currentModule.subtopics.map((st) => {
              const isExpanded = !!expandedSubtopics[st.id];
              const isMastered = !!completedQuizzes[st.id];

              return (
                <div
                  key={st.id}
                  style={{
                    background: '#FFFFFF',
                    border: isExpanded ? '1.5px solid var(--primary-navy, #20346B)' : '1px solid #E2E6EF',
                    borderRadius: '14px',
                    padding: '16px 20px',
                    boxShadow: isExpanded ? '0 4px 14px rgba(32, 52, 107, 0.06)' : 'none',
                    transition: 'all 0.18s ease'
                  }}
                >
                  {/* Subtopic Header Bar */}
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: isMobile ? 'column' : 'row',
                      alignItems: isMobile ? 'stretch' : 'center',
                      justifyContent: 'space-between',
                      gap: isMobile ? '12px' : '16px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '10px' : '14px', minWidth: 0, flex: 1 }}>
                      <div
                        style={{
                          width: isMobile ? '36px' : '40px',
                          height: isMobile ? '36px' : '40px',
                          borderRadius: '10px',
                          background: isExpanded ? '#EEF2FF' : '#F8FAFC',
                          border: isExpanded ? '1px solid #C7D2FE' : '1px solid #E2E8F0',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}
                      >
                        <span style={{ fontSize: '9px', fontWeight: 800, color: '#64748B', fontFamily: 'var(--font-primary)' }}>
                          ST
                        </span>
                        <span style={{ fontSize: isMobile ? '13px' : '14px', fontWeight: 800, color: 'var(--primary-navy, #20346B)', fontFamily: 'var(--font-primary)' }}>
                          {st.number}
                        </span>
                      </div>

                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <h3
                            style={{
                              fontFamily: 'var(--font-primary)',
                              fontSize: isMobile ? '14px' : '15px',
                              fontWeight: 700,
                              color: 'var(--heading-text, #1F2537)',
                              margin: 0,
                              lineHeight: 1.3
                            }}
                          >
                            {st.title}
                          </h3>
                          {isMastered && (
                            <span
                              style={{
                                background: '#ECFDF5',
                                border: '1px solid #A7F3D0',
                                color: '#059669',
                                fontSize: '10px',
                                fontWeight: 800,
                                padding: '1px 6px',
                                borderRadius: '999px',
                                fontFamily: 'var(--font-primary)'
                              }}
                            >
                              MASTERED
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: isMobile ? '11px' : '11.5px', color: '#64748B', fontFamily: 'var(--font-primary)', marginTop: '2px' }}>
                          {st.readTime} · {st.tag}
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons: Explore & Quiz */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0, width: isMobile ? '100%' : 'auto' }}>
                      <button
                        type="button"
                        onClick={() => toggleSubtopic(st.id)}
                        style={{
                          flex: isMobile ? 1 : 'none',
                          height: isMobile ? '38px' : '36px',
                          padding: isMobile ? '0 12px' : '0 14px',
                          background: '#FFFFFF',
                          border: '1px solid #CBD5E1',
                          borderRadius: '8px',
                          color: 'var(--primary-navy, #20346B)',
                          fontFamily: 'var(--font-primary)',
                          fontSize: isMobile ? '11px' : '11.5px',
                          fontWeight: 800,
                          letterSpacing: '0.04em',
                          textTransform: 'uppercase',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          transition: 'all 0.15s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = 'var(--primary-navy, #20346B)';
                          e.currentTarget.style.backgroundColor = '#F8FAFC';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = '#CBD5E1';
                          e.currentTarget.style.backgroundColor = '#FFFFFF';
                        }}
                      >
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          style={{
                            transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                            transition: 'transform 0.18s ease'
                          }}
                        >
                          <polyline points="6 9 12 15 18 9" />
                        </svg>
                        <span>{isExpanded ? 'Collapse' : 'Explore'}</span>
                      </button>

                      {/* TrueSights Yellow Start Quiz Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onStartLiveChallenge) {
                            onStartLiveChallenge(st);
                          } else {
                            openQuiz(st, e);
                          }
                        }}
                        style={{
                          flex: isMobile ? 1 : 'none',
                          height: isMobile ? '38px' : '36px',
                          padding: isMobile ? '0 12px' : '0 16px',
                          background: isMastered ? '#10B981' : '#FEE047',
                          border: isMastered ? 'none' : '1px solid rgba(0, 0, 0, 0.05)',
                          borderRadius: '8px',
                          color: isMastered ? '#FFFFFF' : '#0F1219',
                          fontFamily: 'var(--font-primary)',
                          fontSize: isMobile ? '11.5px' : '12px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          boxShadow: isMastered
                            ? '0 2px 6px rgba(16, 185, 129, 0.25)'
                            : '0 2px 6px rgba(254, 224, 71, 0.35)',
                          transition: 'all 0.15s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = isMastered ? '#059669' : '#FCD34D';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = isMastered ? '#10B981' : '#FEE047';
                        }}
                      >
                        <Icon name="playBold" size={11} color={isMastered ? '#FFFFFF' : '#0F1219'} />
                        <span>
                          {savedChallengeSession && savedChallengeSession.subtopicId === st.id
                            ? `Resume Quiz (Q${savedChallengeSession.currentIndex + 1})`
                            : isMastered
                            ? 'Retake Quiz'
                            : 'Start Quiz'}
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* EXPLORED VIEW: Clean, spacious, and decluttered */}
                  {isExpanded && (
                    <div
                      style={{
                        marginTop: '16px',
                        paddingTop: '16px',
                        borderTop: '1px solid #E2E8F0',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '14px',
                        animation: 'modalContentPop 0.2s ease'
                      }}
                    >
                      {/* Overview Box */}
                      <div
                        style={{
                          background: '#F8FAFC',
                          border: '1px solid #E2E8F0',
                          borderRadius: '10px',
                          padding: '12px 16px'
                        }}
                      >
                        <div
                          style={{
                            fontSize: '10.5px',
                            fontWeight: 800,
                            letterSpacing: '0.05em',
                            textTransform: 'uppercase',
                            color: 'var(--primary-navy, #20346B)',
                            fontFamily: 'var(--font-primary)',
                            marginBottom: '4px'
                          }}
                        >
                          CONTEXT & MANDATE
                        </div>
                        <p
                          style={{
                            fontSize: '13px',
                            color: '#334155',
                            fontFamily: 'var(--font-primary)',
                            lineHeight: 1.5,
                            margin: 0
                          }}
                        >
                          {st.overview}
                        </p>
                      </div>

                      {/* Concepts List */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {st.concepts.map((concept) => (
                          <div
                            key={concept.id}
                            style={{
                              background: '#FFFFFF',
                              border: '1px solid #E2E8F0',
                              borderRadius: '10px',
                              padding: '14px 16px',
                              display: 'flex',
                              alignItems: 'flex-start',
                              gap: '14px'
                            }}
                          >
                            <div
                              style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: '8px',
                                background: '#EEF2FF',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'var(--primary-navy, #20346B)',
                                flexShrink: 0
                              }}
                            >
                              <Icon name={concept.icon} size={18} color="var(--primary-navy, #20346B)" />
                            </div>

                            <div style={{ minWidth: 0, flex: 1 }}>
                              <h4
                                style={{
                                  fontSize: '14px',
                                  fontWeight: 700,
                                  color: 'var(--heading-text, #1F2537)',
                                  fontFamily: 'var(--font-primary)',
                                  margin: '0 0 4px 0'
                                }}
                              >
                                {concept.title}
                              </h4>
                              <p
                                style={{
                                  fontSize: '12.5px',
                                  color: '#475569',
                                  fontFamily: 'var(--font-primary)',
                                  lineHeight: 1.45,
                                  margin: '0 0 8px 0'
                                }}
                              >
                                {concept.description}
                              </p>

                              {/* Clean Mnemonic Anchor Chip */}
                              <div
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '6px',
                                  background: '#FFFBEB',
                                  border: '1px solid #FDE68A',
                                  borderRadius: '6px',
                                  padding: '4px 10px'
                                }}
                              >
                                <Icon name="rewardGem" size={12} color="#D97706" />
                                <span
                                  style={{
                                    fontSize: '11px',
                                    fontWeight: 700,
                                    color: '#92400E',
                                    fontFamily: 'var(--font-primary)'
                                  }}
                                >
                                  Memory Anchor: "{concept.memoryAnchor}"
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 4. CLEAN DEDICATED QUIZ MODAL (Opens cleanly when user clicks QUIZ) */}
      {activeQuizSubtopic && (
        <ModalPortal isOpen={true} onClose={() => setActiveQuizSubtopic(null)}>
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
              width: '100%',
              maxWidth: '540px',
              background: '#FFFFFF',
              borderRadius: '16px',
              border: '1px solid #E2E6EF',
              boxShadow: '0 16px 40px rgba(0,0,0,0.18)',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              animation: 'modalContentPop 0.2s ease'
            }}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 800,
                    color: 'var(--primary-navy, #20346B)',
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                    fontFamily: 'var(--font-primary)'
                  }}
                >
                  KNOWLEDGE CHECK · +25 PTS
                </span>
                <h3
                  style={{
                    fontFamily: 'var(--font-primary)',
                    fontSize: '16px',
                    fontWeight: 800,
                    color: 'var(--heading-text, #1F2537)',
                    margin: '3px 0 0 0'
                  }}
                >
                  {activeQuizSubtopic.title}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setActiveQuizSubtopic(null)}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  border: '1px solid #E2E6EF',
                  background: '#FFFFFF',
                  color: '#64748B',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                ✕
              </button>
            </div>

            {/* Question Text */}
            <div
              style={{
                fontSize: '14px',
                fontWeight: 600,
                color: '#1F2537',
                fontFamily: 'var(--font-primary)',
                lineHeight: 1.45
              }}
            >
              {activeQuizSubtopic.quizQuestion.question}
            </div>

            {/* Options List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {activeQuizSubtopic.quizQuestion.options.map((opt, oIdx) => {
                const isSelected = selectedOption === oIdx;
                const isCorrect = oIdx === activeQuizSubtopic.quizQuestion.correctIndex;

                let optBg = '#FFFFFF';
                let optBorder = '#E2E6EF';
                let optColor = '#1F2537';

                if (isSubmitted) {
                  if (isCorrect) {
                    optBg = '#ECFDF5';
                    optBorder = '#10B981';
                    optColor = '#065F46';
                  } else if (isSelected) {
                    optBg = '#FEF2F2';
                    optBorder = '#EF4444';
                    optColor = '#991B1B';
                  }
                } else if (isSelected) {
                  optBg = '#F0F4FF';
                  optBorder = 'var(--primary-navy, #20346B)';
                  optColor = 'var(--primary-navy, #20346B)';
                }

                return (
                  <button
                    key={oIdx}
                    type="button"
                    onClick={() => {
                      if (!isSubmitted) setSelectedOption(oIdx);
                    }}
                    style={{
                      padding: '10px 14px',
                      borderRadius: '10px',
                      background: optBg,
                      border: `1.5px solid ${optBorder}`,
                      color: optColor,
                      fontFamily: 'var(--font-primary)',
                      fontSize: '13px',
                      fontWeight: isSelected ? 700 : 500,
                      textAlign: 'left',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      cursor: isSubmitted ? 'default' : 'pointer'
                    }}
                  >
                    <span
                      style={{
                        width: '22px',
                        height: '22px',
                        borderRadius: '999px',
                        background: isSelected ? 'var(--primary-navy, #20346B)' : '#F1F5F9',
                        color: isSelected ? '#FFFFFF' : '#64748B',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '11px',
                        fontWeight: 800,
                        fontFamily: 'var(--font-primary)',
                        flexShrink: 0
                      }}
                    >
                      {String.fromCharCode(65 + oIdx)}
                    </span>
                    <span>{opt}</span>
                  </button>
                );
              })}
            </div>

            {/* Explanation card after submit */}
            {isSubmitted && (
              <div
                style={{
                  background: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: '10px',
                  padding: '12px 14px',
                  fontSize: '12.5px',
                  color: '#334155',
                  lineHeight: 1.5,
                  fontFamily: 'var(--font-primary)'
                }}
              >
                <strong style={{ color: 'var(--primary-navy, #20346B)' }}>Ruling: </strong>
                {activeQuizSubtopic.quizQuestion.explanation}
              </div>
            )}

            {/* Modal Bottom Actions */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
              {!isSubmitted ? (
                <button
                  type="button"
                  disabled={selectedOption === null}
                  onClick={handleVerifyQuiz}
                  style={{
                    height: '40px',
                    padding: '0 20px',
                    background: selectedOption === null ? '#E2E8F0' : '#FEE047',
                    border: 'none',
                    borderRadius: '10px',
                    color: selectedOption === null ? '#94A3B8' : '#101D3B',
                    fontFamily: 'var(--font-primary)',
                    fontSize: '12.5px',
                    fontWeight: 800,
                    letterSpacing: '0.04em',
                    cursor: selectedOption === null ? 'not-allowed' : 'pointer'
                  }}
                >
                  Verify Answer
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setActiveQuizSubtopic(null)}
                  style={{
                    height: '40px',
                    padding: '0 20px',
                    background: 'var(--primary-navy, #20346B)',
                    border: 'none',
                    borderRadius: '10px',
                    color: '#FFFFFF',
                    fontFamily: 'var(--font-primary)',
                    fontSize: '12.5px',
                    fontWeight: 800,
                    cursor: 'pointer'
                  }}
                >
                  Done
                </button>
              )}
            </div>
          </div>
        </ModalPortal>
      )}

      {/* FLOATING SUCCESS TOAST */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            background: '#101D3B',
            color: '#FFFFFF',
            padding: '12px 20px',
            borderRadius: '12px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.22)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontFamily: 'var(--font-primary)',
            fontSize: '13px',
            fontWeight: 700,
            zIndex: 9999,
            animation: 'modalContentPop 0.22s ease'
          }}
        >
          <Icon name="rewardGem" size={18} color="#FEE047" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
