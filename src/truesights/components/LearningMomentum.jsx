import React, { useState } from 'react';
import Icon from '../design-system/icons';
import ModalPortal from './ModalPortal';

const KERALA_PROJECT = {
  id: 'priv-kerala-2025',
  title: 'Kerala Building Rules 2025 Amendment',
  name: 'Kerala Building Rules 2025 Amendment',
  level: 'Postgraduate',
  visibility: 'Private',
  type: 'private',
  progress: 50,
  description: 'Comprehensive architectural compliance & municipal zoning analysis under the 2025 amended Kerala building bylaws.'
};

export default function LearningMomentum({
  onViewResults,
  onViewChallenges,
  onOpenWorkspace,
  onNavigate
}) {
  const [selectedReward, setSelectedReward] = useState(0);
  const [pointsBalance, setPointsBalance] = useState(2480);
  const [wishlist, setWishlist] = useState({ 0: false, 1: false, 2: false, 3: false, 4: false });
  const [isRewardModalOpen, setIsRewardModalOpen] = useState(false);
  const [activeChallengeModal, setActiveChallengeModal] = useState(null); // 'algebra' | 'word' | null
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [challengeResult, setChallengeResult] = useState(null);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [projectTasks, setProjectTasks] = useState([
    { id: 1, title: 'Review 2025 Kerala Building By-laws Section 4', completed: true },
    { id: 2, title: 'Floor Area Ratio (FAR) calculations & setback requirements', completed: true },
    { id: 3, title: 'Fire safety & rainwater harvesting compliance checklist', completed: false },
    { id: 4, title: 'Draft zoning permit submission documentation', completed: false }
  ]);
  const [hoveredScorePoint, setHoveredScorePoint] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  );

  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3200);
  };

  const rewards = [
    {
      id: 0,
      title: 'Yoga Mat',
      points: 150,
      image: '/assets/Product visual.png',
      category: 'Fitness & Wellness',
      desc: 'Eco-friendly non-slip natural rubber yoga mat with alignment markers and travel strap.'
    },
    {
      id: 1,
      title: 'Curated Gift Box',
      points: 200,
      image: '/assets/Image Container.png',
      category: 'Lifestyle',
      desc: 'Handcrafted luxury gift box with artisanal snacks and custom study essentials.'
    },
    {
      id: 2,
      title: 'Retro Instant Camera',
      points: 450,
      image: '/assets/Image Container-1.png',
      category: 'Electronics',
      desc: 'Vintage film instant camera with auto exposure and built-in flash for creative students.'
    },
    {
      id: 3,
      title: 'Executive Journal',
      points: 120,
      image: '/assets/Image Container-2.png',
      category: 'Stationery',
      desc: 'Premium vegan leather notebook with heavyweight bleed-proof paper and luxury ballpoint pen.'
    },
    {
      id: 4,
      title: 'Sapphire Paperweight',
      points: 300,
      image: '/assets/Image Container-3.png',
      category: 'Collectibles',
      desc: 'Optical-grade precision cut sapphire blue crystal prism for your study desk.'
    }
  ];

  const currentReward = rewards[selectedReward];

  const handleToggleWishlist = (idx) => {
    const nextState = !wishlist[idx];
    setWishlist({ ...wishlist, [idx]: nextState });
    showToast(nextState ? `Saved ${rewards[idx].title} to Wishlist!` : `Removed ${rewards[idx].title} from Wishlist`);
  };

  const handleRedeemReward = () => {
    if (pointsBalance >= currentReward.points) {
      setPointsBalance((prev) => prev - currentReward.points);
      setIsRewardModalOpen(false);
      showToast(`Redeemed ${currentReward.title} for ${currentReward.points} PTS`);
    } else {
      showToast(`You need ${currentReward.points - pointsBalance} more points to unlock this.`);
    }
  };

  const handleChallengeSubmit = (correctIdx) => {
    if (selectedAnswer === correctIdx) {
      setChallengeResult('correct');
      setPointsBalance((prev) => prev + 25);
      showToast('+25 Points Earned for completing challenge');
    } else {
      setChallengeResult('wrong');
    }
  };

  const toggleTask = (id) => {
    setProjectTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const scorePoints = [
    { attempt: 1, score: 72, cx: 10, cy: 22 },
    { attempt: 2, score: 78, cx: 32, cy: 19 },
    { attempt: 3, score: 74, cx: 54, cy: 21 },
    { attempt: 4, score: 82, cx: 74, cy: 15 },
    { attempt: 5, score: 86, cx: 94, cy: 14 },
    { attempt: 6, score: 92, cx: 115, cy: 4 }
  ];

  return (
    <div
      style={{
        width: '100%',
        height: isMobile ? 'auto' : '395px',
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        gap: '16px',
        boxSizing: 'border-box',
        position: 'relative'
      }}
    >
      {/* 1. LEFT CARD: Points & Rewards Module with exact color #3C4F8E and Ambient orb overlay */}
      <div
        style={{
          flex: isMobile ? 'none' : '1.25',
          width: '100%',
          minWidth: 0,
          height: isMobile ? 'auto' : '395px',
          backgroundColor: '#3C4F8E',
          borderRadius: 'var(--card-radius)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          padding: '18px 20px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 8px 24px rgba(60, 79, 142, 0.15)',
          boxSizing: 'border-box'
        }}
      >
        {/* Ambient Orb Watermark Overlay from Untitled 2 */}
        <img
          src="/assets/Ambient orb.png"
          alt=""
          style={{
            position: 'absolute',
            bottom: '-45px',
            left: '-45px',
            width: '360px',
            height: '360px',
            objectFit: 'contain',
            pointerEvents: 'none',
            zIndex: 0,
            opacity: 0.95
          }}
        />

        {/* Top Section: Points Summary (Left) & Active Reward Card (Right) */}
        <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '14px', alignItems: 'stretch', zIndex: 1, position: 'relative' }}>
          {/* Left Info Column */}
          <div style={{ flex: 1 }}>
            {/* Header: Exact Rectangle 4.png white icon from Untitled 2 + POINTS heading (18px) */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <img
                src="/assets/Rectangle 4.png"
                alt="Points Logo"
                style={{
                  width: '24px',
                  height: '26px',
                  objectFit: 'contain'
                }}
              />

              <h2
                style={{
                  fontFamily: 'var(--font-primary)',
                  fontSize: '18px',
                  lineHeight: '24px',
                  fontWeight: 700,
                  color: '#FFFFFF',
                  letterSpacing: '0.04em',
                  margin: 0
                }}
              >
                POINTS
              </h2>
            </div>

            {/* Points Total: ExtraBold 56px with smooth transition */}
            <div
              style={{
                fontFamily: 'var(--font-primary)',
                fontSize: '56px',
                lineHeight: '64px',
                fontWeight: 800,
                color: '#FFFFFF',
                letterSpacing: '-2px',
                marginTop: '4px',
                transition: 'all 0.3s ease'
              }}
            >
              {pointsBalance.toLocaleString()}
            </div>

            {/* Description: Title Case matching Image 2 & 3 */}
            <p
              style={{
                fontFamily: 'var(--font-primary)',
                fontSize: '13px',
                lineHeight: '21px',
                fontWeight: 500,
                color: '#FFFFFF',
                marginTop: '8px',
                marginBottom: 0
              }}
            >
              Take On Challenges And Quizzes To Earn Points And Unlock Your Favorite Products
            </p>

            {/* View all link: Bold 14px with underline */}
            <button
              onClick={() => setIsRewardModalOpen(true)}
              style={{
                background: 'transparent',
                border: 'none',
                padding: 0,
                cursor: 'pointer',
                display: 'inline-block',
                marginTop: '12px',
                fontFamily: 'var(--font-primary)',
                fontSize: '14px',
                fontWeight: 700,
                color: '#FFFFFF',
                textDecoration: 'underline',
                textUnderlineOffset: '3px'
              }}
            >
              View all →
            </button>
          </div>

          {/* Right Product Card: Active Reward Item */}
          <div
            style={{
              width: isMobile ? '100%' : '188px',
              flexShrink: 0,
              background: '#FFFFFF',
              borderRadius: '14px',
              padding: '10px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              position: 'relative',
              boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
              boxSizing: 'border-box',
              transition: 'transform 0.2s ease'
            }}
          >
            {/* Wishlist Heart Button */}
            <button
              onClick={() => handleToggleWishlist(selectedReward)}
              aria-label="Save to Wishlist"
              style={{
                position: 'absolute',
                top: '14px',
                right: '14px',
                width: '26px',
                height: '26px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.94)',
                border: '1px solid #E2E8F0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: wishlist[selectedReward] ? '#EF4444' : '#64748B',
                boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                zIndex: 2,
                transition: 'transform 180ms ease'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.1)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            >
              <Icon
                name="heart"
                size={13}
                color={wishlist[selectedReward] ? '#EF4444' : '#64748B'}
                style={{
                  fill: wishlist[selectedReward] ? '#EF4444' : 'none',
                  animation: wishlist[selectedReward] ? 'heartPop 0.3s ease' : 'none'
                }}
              />
            </button>

            {/* Product Image */}
            <div
              onClick={() => setIsRewardModalOpen(true)}
              style={{
                height: '105px',
                borderRadius: '10px',
                overflow: 'hidden',
                background: '#F1F5F9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <img
                src={currentReward.image}
                alt={currentReward.title}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  transition: 'transform 0.25s ease'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
              />
            </div>

            <div style={{ marginTop: '8px' }}>
              <div
                style={{
                  fontFamily: 'var(--font-primary)',
                  fontSize: '13px',
                  fontWeight: 700,
                  color: 'var(--primary-text)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
                title={currentReward.title}
              >
                {currentReward.title}
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-primary)',
                  fontSize: '10px',
                  fontWeight: 600,
                  color: 'var(--muted-text)',
                  marginTop: '2px'
                }}
              >
                {currentReward.points} PTS To unlock
              </div>
            </div>

            {/* Action Row: Prev, View (Urbanist Bold 12px/16px), Next */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginTop: '8px'
              }}
            >
              <button
                onClick={() => setSelectedReward((p) => (p > 0 ? p - 1 : rewards.length - 1))}
                aria-label="Previous reward"
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#101D3B',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '4px'
                }}
              >
                <Icon name="prevStep" size={14} color="#101D3B" />
              </button>

              <button
                onClick={() => setIsRewardModalOpen(true)}
                style={{
                  padding: '4px 22px',
                  borderRadius: '999px',
                  border: 'none',
                  background: '#FEE047',
                  color: '#101D3B',
                  fontFamily: 'var(--font-urbanist)',
                  fontSize: '12px',
                  lineHeight: '16px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                  transition: 'background-color 150ms ease, transform 150ms ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#FCD34D';
                  e.currentTarget.style.transform = 'scale(1.03)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#FEE047';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                View
              </button>

              <button
                onClick={() => setSelectedReward((p) => (p < rewards.length - 1 ? p + 1 : 0))}
                aria-label="Next reward"
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#101D3B',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '4px'
                }}
              >
                <Icon name="nextStep" size={14} color="#101D3B" />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Section: 5 Reward Thumbnails & Carousel Dots */}
        <div style={{ zIndex: 1, position: 'relative', marginTop: '10px' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            {rewards.map((r, idx) => (
              <div
                key={idx}
                onClick={() => setSelectedReward(idx)}
                style={{
                  flex: 1,
                  height: '56px',
                  borderRadius: '10px',
                  background: '#FFFFFF',
                  border: selectedReward === idx ? '2px solid #60A5FA' : '1px solid rgba(255, 255, 255, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  overflow: 'hidden',
                  padding: '4px',
                  transition: 'all 0.18s ease',
                  boxSizing: 'border-box',
                  transform: selectedReward === idx ? 'translateY(-2px)' : 'none',
                  boxShadow: selectedReward === idx ? '0 4px 10px rgba(0,0,0,0.18)' : 'none'
                }}
                title={r.title}
              >
                <img
                  src={r.image}
                  alt={r.title}
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
              </div>
            ))}
          </div>

          {/* 5 Carousel Dots with active indicator */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '5px', marginTop: '8px' }}>
            {rewards.map((_, dot) => (
              <div
                key={dot}
                onClick={() => setSelectedReward(dot)}
                style={{
                  width: selectedReward === dot ? '14px' : '5px',
                  height: '5px',
                  borderRadius: '999px',
                  background: selectedReward === dot ? '#60A5FA' : 'rgba(255, 255, 255, 0.4)',
                  transition: 'all 0.25s ease',
                  cursor: 'pointer'
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* 2. RIGHT COLUMN: 3 Activity Modules */}
      <div
        style={{
          flex: isMobile ? 'none' : '1',
          width: '100%',
          minWidth: 0,
          height: isMobile ? 'auto' : '395px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          gap: '10px'
        }}
      >
        {/* Module 1: Challenges Taken */}
        <div
          style={{
            flex: 1,
            backgroundColor: 'var(--card-bg)',
            borderRadius: 'var(--card-radius)',
            border: 'var(--card-border)',
            padding: '12px 14px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxSizing: 'border-box'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="sunFog" size={20} color="#2563EB" />
              </div>
              <h3
                style={{
                  fontFamily: 'var(--font-primary)',
                  fontSize: '18px',
                  lineHeight: '24px',
                  fontWeight: 700,
                  color: 'var(--heading-text)',
                  margin: 0
                }}
              >
                Challenges Taken
              </h3>
            </div>
            <button
              type="button"
              onClick={() => {
                if (onViewChallenges) {
                  onViewChallenges();
                } else if (onNavigate) {
                  onNavigate('challenges');
                } else {
                  setActiveChallengeModal('algebra');
                }
              }}
              style={{
                background: 'transparent',
                border: 'none',
                padding: 0,
                cursor: 'pointer',
                fontFamily: 'var(--font-primary)',
                fontSize: '14px',
                color: '#2563EB',
                fontWeight: 700,
                transition: 'opacity 0.15s ease'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.8')}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
            >
              View all →
            </button>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '8px',
              marginTop: '4px'
            }}
          >
            <div
              style={{
                fontFamily: 'var(--font-primary)',
                fontSize: '31px',
                lineHeight: '34px',
                fontWeight: 800,
                color: 'var(--primary-text)',
                flexShrink: 0
              }}
            >
              373
            </div>

            <div style={{ display: 'flex', gap: '6px', overflow: 'hidden' }}>
              <button
                onClick={() => {
                  setActiveChallengeModal('algebra');
                  setSelectedAnswer(null);
                  setChallengeResult(null);
                }}
                style={{
                  background: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: '6px',
                  padding: '3px 8px',
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#2563EB')}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#E2E8F0')}
              >
                <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--primary-text)' }}>Algebra sprint</div>
                <div style={{ fontSize: '9px', color: 'var(--muted-text)' }}>3h left · Click to play</div>
              </button>

              <button
                onClick={() => {
                  setActiveChallengeModal('word');
                  setSelectedAnswer(null);
                  setChallengeResult(null);
                }}
                style={{
                  background: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: '6px',
                  padding: '3px 8px',
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#2563EB')}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#E2E8F0')}
              >
                <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--primary-text)' }}>Word quest</div>
                <div style={{ fontSize: '9px', color: 'var(--muted-text)' }}>Tomorrow · Click to preview</div>
              </button>
            </div>
          </div>
        </div>

        {/* Module 2: Latest Score */}
        <div
          onClick={onViewResults}
          title={onViewResults ? "Click to view full Results & Quiz History" : undefined}
          style={{
            flex: 1,
            backgroundColor: 'var(--card-bg)',
            borderRadius: 'var(--card-radius)',
            border: 'var(--card-border)',
            padding: '12px 14px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxSizing: 'border-box',
            position: 'relative',
            cursor: onViewResults ? 'pointer' : 'default',
            transition: 'transform 0.18s ease, box-shadow 0.18s ease'
          }}
          onMouseEnter={(e) => {
            if (onViewResults) {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(37, 99, 235, 0.12)';
            }
          }}
          onMouseLeave={(e) => {
            if (onViewResults) {
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.boxShadow = 'none';
            }
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="statusUp" size={20} color="#2563EB" />
              </div>
              <h3
                style={{
                  fontFamily: 'var(--font-primary)',
                  fontSize: '18px',
                  lineHeight: '24px',
                  fontWeight: 700,
                  color: 'var(--heading-text)',
                  margin: 0
                }}
              >
                Latest Score
              </h3>
            </div>
            <span
              style={{
                background: '#EFF6FF',
                color: '#2563EB',
                fontFamily: 'var(--font-primary)',
                fontSize: '10px',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: '999px',
                whiteSpace: 'nowrap'
              }}
            >
              ↑ 8% better
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: '4px'
            }}
          >
            <div>
              <div
                style={{
                  fontFamily: 'var(--font-primary)',
                  fontSize: '34px',
                  lineHeight: '37px',
                  fontWeight: 800,
                  color: 'var(--primary-text)'
                }}
              >
                92%
              </div>
              <div style={{ fontSize: '10px', color: 'var(--muted-text)' }}>
                {hoveredScorePoint ? `Attempt ${hoveredScorePoint.attempt}: ${hoveredScorePoint.score}%` : 'Excellent work!'}
              </div>
            </div>

            {/* Interactive Blue Sparkline Wave Curve with Data Points */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
              <svg width="124" height="32" viewBox="0 0 124 32" fill="none">
                <path
                  d="M10 22 Q 22 24, 32 19 T 54 21 T 74 15 T 94 14 T 115 4"
                  stroke="#3C4F8E"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  fill="none"
                />

                {scorePoints.map((pt, i) => (
                  <circle
                    key={i}
                    cx={pt.cx}
                    cy={pt.cy}
                    r={hoveredScorePoint?.attempt === pt.attempt ? 5 : 3}
                    fill="#3C4F8E"
                    style={{ cursor: 'pointer', transition: 'r 0.15s ease' }}
                    onMouseEnter={() => setHoveredScorePoint(pt)}
                    onMouseLeave={() => setHoveredScorePoint(null)}
                  />
                ))}

                <circle cx="115" cy="4" r="7" fill="#3C4F8E" opacity="0.2" />
              </svg>
              <span style={{ fontSize: '9px', fontWeight: 600, color: 'var(--muted-text)' }}>
                Hover points to inspect
              </span>
            </div>
          </div>
        </div>

        {/* Module 3: Continue Project */}
        <div
          style={{
            flex: 1.15,
            backgroundColor: 'var(--card-bg)',
            borderRadius: 'var(--card-radius)',
            border: 'var(--card-border)',
            padding: '12px 14px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxSizing: 'border-box'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="playBold" size={20} color="#2563EB" />
              </div>
              <h3
                style={{
                  fontFamily: 'var(--font-primary)',
                  fontSize: '18px',
                  lineHeight: '24px',
                  fontWeight: 700,
                  color: 'var(--heading-text)',
                  margin: 0
                }}
              >
                Continue Project
              </h3>
            </div>
            <span
              style={{
                background: '#F1F5F9',
                color: 'var(--secondary-text)',
                fontFamily: 'var(--font-primary)',
                fontSize: '10px',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: '4px'
              }}
            >
              Private
            </span>
          </div>

          <div
            onClick={() => {
              if (onOpenWorkspace) {
                onOpenWorkspace(KERALA_PROJECT);
              } else if (onNavigate) {
                onNavigate('workspace');
              } else {
                setIsProjectModalOpen(true);
              }
            }}
            style={{ marginTop: '2px', cursor: 'pointer' }}
            title="Open project workspace"
          >
            <div
              style={{
                fontFamily: 'var(--font-primary)',
                fontSize: '13px',
                fontWeight: 700,
                color: 'var(--primary-text)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
            >
              kerala building rules 2025 amendment
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginTop: '3px'
              }}
            >
              <span
                style={{
                  fontSize: '10px',
                  color: '#2563EB',
                  fontWeight: 500,
                  userSelect: 'none'
                }}
              >
                Personal workspace
              </span>
              <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--primary-text)' }}>
                {Math.round((projectTasks.filter((t) => t.completed).length / projectTasks.length) * 100)}%
              </span>
            </div>

            {/* Progress Bar */}
            <div
              style={{
                width: '100%',
                height: '4px',
                background: '#E2E8F0',
                borderRadius: '999px',
                marginTop: '4px',
                overflow: 'hidden'
              }}
            >
              <div
                style={{
                  width: `${Math.round((projectTasks.filter((t) => t.completed).length / projectTasks.length) * 100)}%`,
                  height: '100%',
                  background: '#3C4F8E',
                  borderRadius: '999px',
                  transition: 'width 0.3s ease'
                }}
              />
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              if (onOpenWorkspace) {
                onOpenWorkspace(KERALA_PROJECT);
              } else if (onNavigate) {
                onNavigate('workspace');
              } else {
                setIsProjectModalOpen(true);
              }
            }}
            style={{
              width: '100%',
              height: '26px',
              marginTop: '6px',
              background: '#FEE047',
              border: 'none',
              borderRadius: '999px',
              fontFamily: 'var(--font-urbanist)',
              fontSize: '12px',
              lineHeight: '16px',
              fontWeight: 700,
              color: '#101D3B',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              transition: 'background-color 150ms ease, transform 150ms ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#FCD34D';
              e.currentTarget.style.transform = 'scale(1.01)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#FEE047';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            continue
          </button>
        </div>
      </div>

      {/* REWARD DETAILS & REDEEM MODAL */}
      {isRewardModalOpen && (
        <ModalPortal isOpen={true} onClose={() => setIsRewardModalOpen(false)}>
        <div
          style={{
            width: '420px',
            maxWidth: '92vw',
            background: '#FFFFFF',
            borderRadius: '20px',
            padding: '24px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
            animation: 'modalContentPop 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
            position: 'relative'
          }}
          onClick={(e) => e.stopPropagation()}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, background: '#EBF2FE', color: '#2563EB', padding: '3px 8px', borderRadius: '6px' }}>
                {currentReward.category}
              </span>
              <button
                onClick={() => setIsRewardModalOpen(false)}
                style={{ background: 'transparent', border: 'none', color: '#64748B', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4px' }}
                aria-label="Close"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            <div style={{ height: '170px', borderRadius: '12px', overflow: 'hidden', background: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
              <img src={currentReward.image} alt={currentReward.title} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>

            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#101828', marginBottom: '6px' }}>
              {currentReward.title}
            </h3>
            <p style={{ fontSize: '13px', color: '#64748B', lineHeight: '1.45', marginBottom: '16px' }}>
              {currentReward.desc}
            </p>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: '#F8FAFC', borderRadius: '10px', marginBottom: '18px' }}>
              <div>
                <div style={{ fontSize: '11px', color: '#64748B' }}>Cost</div>
                <div style={{ fontSize: '16px', fontWeight: 700, color: '#2563EB' }}>{currentReward.points} PTS</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '11px', color: '#64748B' }}>Your Balance</div>
                <div style={{ fontSize: '16px', fontWeight: 700, color: pointsBalance >= currentReward.points ? '#10B981' : '#EF4444' }}>
                  {pointsBalance.toLocaleString()} PTS
                </div>
              </div>
            </div>

            <button
              onClick={handleRedeemReward}
              disabled={pointsBalance < currentReward.points}
              style={{
                width: '100%',
                height: '42px',
                borderRadius: '999px',
                border: 'none',
                background: pointsBalance >= currentReward.points ? '#FEE047' : '#E2E8F0',
                color: pointsBalance >= currentReward.points ? '#101828' : '#94A3B8',
                fontWeight: 700,
                fontSize: '14px',
                cursor: pointsBalance >= currentReward.points ? 'pointer' : 'not-allowed',
                boxShadow: pointsBalance >= currentReward.points ? '0 4px 12px rgba(254, 224, 71, 0.4)' : 'none'
              }}
            >
              {pointsBalance >= currentReward.points ? `Claim for ${currentReward.points} PTS` : 'Insufficient Points'}
            </button>
          </div>
        </ModalPortal>
      )}

      {/* CHALLENGE QUIZ MODAL */}
      {activeChallengeModal && (
        <ModalPortal isOpen={true} onClose={() => setActiveChallengeModal(null)}>
        <div
          style={{
            width: '420px',
            maxWidth: '92vw',
            background: '#FFFFFF',
            borderRadius: '20px',
            padding: '24px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
            animation: 'modalContentPop 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
          onClick={(e) => e.stopPropagation()}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, background: '#FEF3C7', color: '#D97706', padding: '3px 8px', borderRadius: '6px' }}>
                Quick Challenge · Win +25 PTS
              </span>
              <button
                onClick={() => setActiveChallengeModal(null)}
                style={{ background: 'transparent', border: 'none', color: '#64748B', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4px' }}
                aria-label="Close"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#101828', marginBottom: '8px' }}>
              {activeChallengeModal === 'algebra' ? 'Algebra Sprint Challenge' : 'Word Quest Engineering Terminology'}
            </h3>

            <p style={{ fontSize: '13px', color: '#475569', marginBottom: '16px', lineHeight: '1.4' }}>
              {activeChallengeModal === 'algebra'
                ? 'Question: If 3x + 12 = 45, what is the value of x?'
                : 'Question: What does the term "Specific Fuel Consumption (SFC)" measure in Marine Engines?'}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '18px' }}>
              {(activeChallengeModal === 'algebra'
                ? ['x = 9', 'x = 11', 'x = 13', 'x = 15']
                : [
                    'Fuel mass consumed per unit power output',
                    'Maximum engine RPM at full throttle',
                    'Thermal expansion of cylinder liners',
                    'Volume of lubricant oil in sump'
                  ]
              ).map((opt, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedAnswer(i)}
                  style={{
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: selectedAnswer === i ? '2px solid #2563EB' : '1px solid #E2E8F0',
                    background: selectedAnswer === i ? '#EFF6FF' : '#F8FAFC',
                    textAlign: 'left',
                    fontSize: '13px',
                    fontWeight: selectedAnswer === i ? 600 : 400,
                    color: '#1E293B',
                    cursor: 'pointer'
                  }}
                >
                  {String.fromCharCode(65 + i)}. {opt}
                </button>
              ))}
            </div>

            {challengeResult === 'correct' && (
              <div style={{ padding: '10px', borderRadius: '8px', background: '#ECFDF5', color: '#047857', fontSize: '13px', fontWeight: 600, marginBottom: '14px', textAlign: 'center' }}>
                Correct! +25 Points added to your account!
              </div>
            )}

            {challengeResult === 'wrong' && (
              <div style={{ padding: '10px', borderRadius: '8px', background: '#FEF2F2', color: '#B91C1C', fontSize: '13px', fontWeight: 600, marginBottom: '14px', textAlign: 'center' }}>
                Not quite right. Review the equation and try again!
              </div>
            )}

            <button
              onClick={() => handleChallengeSubmit(activeChallengeModal === 'algebra' ? 1 : 0)}
              disabled={selectedAnswer === null || challengeResult === 'correct'}
              style={{
                width: '100%',
                height: '40px',
                borderRadius: '999px',
                border: 'none',
                background: selectedAnswer !== null ? '#283D82' : '#CBD5E1',
                color: '#FFFFFF',
                fontWeight: 700,
                fontSize: '13px',
                cursor: selectedAnswer !== null ? 'pointer' : 'not-allowed'
              }}
            >
              {challengeResult === 'correct' ? 'Completed' : 'Submit Answer'}
            </button>
          </div>
        </ModalPortal>
      )}

      {/* PROJECT WORKSPACE MODAL */}
      {isProjectModalOpen && (
        <ModalPortal isOpen={true} onClose={() => setIsProjectModalOpen(false)}>
        <div
          style={{
            width: '460px',
            maxWidth: '92vw',
            background: '#FFFFFF',
            borderRadius: '20px',
            padding: '24px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
            animation: 'modalContentPop 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
          onClick={(e) => e.stopPropagation()}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, background: '#F1F5F9', color: '#475569', padding: '3px 8px', borderRadius: '6px' }}>
                Active Project · Postgraduate
              </span>
              <button
                onClick={() => setIsProjectModalOpen(false)}
                style={{ background: 'transparent', border: 'none', color: '#64748B', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4px' }}
                aria-label="Close"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#101828', marginBottom: '4px' }}>
              Kerala Building Rules 2025 Amendment
            </h3>
            <p style={{ fontSize: '12px', color: '#64748B', marginBottom: '16px' }}>
              Workspace progress checklist. Check off milestones as you review.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '18px' }}>
              {projectTasks.map((t) => (
                <div
                  key={t.id}
                  onClick={() => toggleTask(t.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    background: t.completed ? '#F8FAFC' : '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <input
                    type="checkbox"
                    checked={t.completed}
                    onChange={() => {}}
                    style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                  />
                  <span
                    style={{
                      fontSize: '12px',
                      color: t.completed ? '#64748B' : '#0F1219',
                      textDecoration: t.completed ? 'line-through' : 'none'
                    }}
                  >
                    {t.title}
                  </span>
                </div>
              ))}
            </div>

            <button
              onClick={() => {
                setIsProjectModalOpen(false);
                showToast('Changes saved to Kerala Building Rules project');
              }}
              style={{
                width: '100%',
                height: '40px',
                borderRadius: '999px',
                border: 'none',
                background: '#FEE047',
                color: '#101D3B',
                fontWeight: 700,
                fontSize: '13px',
                cursor: 'pointer'
              }}
            >
              Save & Return to Dashboard
            </button>
          </div>
        </ModalPortal>
      )}

      {/* FLOATING TOAST NOTIFICATION */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            background: '#1F2937',
            color: '#FFFFFF',
            padding: '10px 18px',
            borderRadius: '12px',
            fontSize: '13px',
            fontWeight: 600,
            boxShadow: '0 10px 25px rgba(0,0,0,0.25)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            animation: 'toastSlideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
        >
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
