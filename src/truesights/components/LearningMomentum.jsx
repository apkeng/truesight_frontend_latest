import React, { useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import Icon from '../design-system/icons';
import ModalPortal from './ModalPortal';
import { DailyQuestionModal, WordQuestModal } from './DailyPlayModals';
import { api, invalidate, keys, setQueryData, useDashboard } from '../data';
import { useTS } from '../session';

/** Hours (rounded up) until an ISO time, for "3h left" labels. */
const hoursUntil = (iso) => Math.max(0, Math.ceil((new Date(iso).getTime() - Date.now()) / 3_600_000));

/** Map a score series (oldest first) onto the 124x32 sparkline box. */
const sparkline = (series) => {
  const pts = series.slice(-6);
  if (!pts.length) return { points: [], path: '' };
  const x0 = 10;
  const x1 = 115;
  const step = pts.length > 1 ? (x1 - x0) / (pts.length - 1) : 0;
  const points = pts.map((p, i) => ({
    attempt: i + 1,
    score: p.percent,
    label: p.label,
    cx: Math.round(pts.length > 1 ? x0 + i * step : (x0 + x1) / 2),
    cy: Math.round(28 - (Math.max(0, Math.min(100, p.percent)) / 100) * 24)
  }));
  const path = points.map((p, i) => `${i ? 'L' : 'M'} ${p.cx} ${p.cy}`).join(' ');
  return { points, path };
};

export default function LearningMomentum({
  onViewResults,
  onViewChallenges,
  onOpenWorkspace,
  onNavigate
}) {
  const { go, points: sessionPoints } = useTS();
  const { data } = useDashboard();
  const [selectedReward, setSelectedReward] = useState(0);
  const [isRewardModalOpen, setIsRewardModalOpen] = useState(false);
  const [dailyModal, setDailyModal] = useState(null); // 'question' | 'quest' | null
  const [hoveredScorePoint, setHoveredScorePoint] = useState(null);
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

  const pointsBalance = data?.rewards?.points ?? sessionPoints ?? 0;
  const rewards = useMemo(
    () =>
      (data?.rewards?.featured || []).map((r) => ({
        id: r.id,
        title: r.name,
        points: r.pointsRequired,
        image: r.imageUrl,
        wished: r.wished
      })),
    [data]
  );
  const currentReward = rewards[Math.min(selectedReward, Math.max(0, rewards.length - 1))] || null;

  const handleToggleWishlist = async (reward) => {
    if (!reward) return;
    const next = !reward.wished;
    const flip = (d) => d && { ...d, rewards: { ...d.rewards, featured: d.rewards.featured.map((r) => (r.id === reward.id ? { ...r, wished: next } : r)) } };
    setQueryData(keys.dashboard(), flip);
    try {
      await (next ? api.wish(reward.id) : api.unwish(reward.id));
      toast.success(next ? `Saved ${reward.title} to your wishlist` : `Removed ${reward.title} from your wishlist`);
      invalidate(keys.wishlist(), keys.bootstrap());
    } catch (err) {
      setQueryData(keys.dashboard(), (d) => d && { ...d, rewards: { ...d.rewards, featured: d.rewards.featured.map((r) => (r.id === reward.id ? { ...r, wished: !next } : r)) } });
      toast.error(err.message);
    }
  };

  const { points: scorePoints, path: scorePath } = sparkline(data?.latestScore?.series || []);
  const latest = data?.latestScore;
  const delta = latest?.delta;
  const daily = data?.daily;
  const project = data?.continueProject;
  const openProject = () => (project ? onOpenWorkspace?.(project) : go('projects'));

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
              onClick={() => go('rewards')}
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
          {currentReward ? (
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
              onClick={() => handleToggleWishlist(currentReward)}
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
                color: currentReward.wished ? '#EF4444' : '#64748B',
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
                color={currentReward.wished ? '#EF4444' : '#64748B'}
                style={{
                  fill: currentReward.wished ? '#EF4444' : 'none',
                  animation: currentReward.wished ? 'heartPop 0.3s ease' : 'none'
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
          ) : (
            <button
              type="button"
              onClick={() => go('rewards')}
              style={{
                width: isMobile ? '100%' : '188px',
                flexShrink: 0,
                background: 'rgba(255, 255, 255, 0.12)',
                border: '1px dashed rgba(255, 255, 255, 0.5)',
                borderRadius: '14px',
                padding: '14px',
                color: '#FFFFFF',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                fontFamily: 'var(--font-primary)'
              }}
            >
              Browse the rewards store →
            </button>
          )}
        </div>

        {/* Bottom Section: 5 Reward Thumbnails & Carousel Dots */}
        {rewards.length > 0 && (
        <div style={{ zIndex: 1, position: 'relative', marginTop: '10px' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            {rewards.map((r, idx) => (
              <div
                key={r.id}
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
        )}
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
              onClick={() => (onViewChallenges ? onViewChallenges() : go('challenges'))}
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
              {data?.challenges?.taken ?? '–'}
            </div>

            <div style={{ display: 'flex', gap: '6px', overflow: 'hidden' }}>
              <button
                onClick={() => setDailyModal('question')}
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
                <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--primary-text)' }}>Daily question</div>
                <div style={{ fontSize: '9px', color: 'var(--muted-text)' }}>
                  {daily?.question?.attempted
                    ? 'Done today · Click to review'
                    : daily?.question?.closesAt
                      ? `${hoursUntil(daily.question.closesAt)}h left · Click to play`
                      : 'Click to play'}
                </div>
              </button>

              <button
                onClick={() => setDailyModal('quest')}
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
                <div style={{ fontSize: '9px', color: 'var(--muted-text)' }}>1-min riddle · Click to play</div>
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
            {typeof delta === 'number' && delta !== 0 && (
            <span
              style={{
                background: delta > 0 ? '#EFF6FF' : '#FEF2F2',
                color: delta > 0 ? '#2563EB' : '#DC2626',
                fontFamily: 'var(--font-primary)',
                fontSize: '10px',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: '999px',
                whiteSpace: 'nowrap'
              }}
            >
              {delta > 0 ? `↑ ${delta}% better` : `↓ ${Math.abs(delta)}% lower`}
            </span>
            )}
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
                {latest ? `${latest.percent}%` : '–'}
              </div>
              <div
                style={{ fontSize: '10px', color: 'var(--muted-text)', maxWidth: '150px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                title={hoveredScorePoint?.label || latest?.subtopic}
              >
                {hoveredScorePoint
                  ? `${hoveredScorePoint.label}: ${hoveredScorePoint.score}%`
                  : latest
                    ? latest.subtopic
                    : 'Take a quiz to see your score'}
              </div>
            </div>

            {/* Interactive Blue Sparkline Wave Curve with Data Points */}
            {scorePoints.length > 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
              <svg width="124" height="32" viewBox="0 0 124 32" fill="none">
                <path
                  d={scorePath}
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

                <circle cx={scorePoints[scorePoints.length - 1].cx} cy={scorePoints[scorePoints.length - 1].cy} r="7" fill="#3C4F8E" opacity="0.2" />
              </svg>
              <span style={{ fontSize: '9px', fontWeight: 600, color: 'var(--muted-text)' }}>
                Hover points to inspect
              </span>
            </div>
            )}
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
              {project ? (project.kind === 'self' ? 'Private' : 'Educator') : 'New'}
            </span>
          </div>

          <div
            onClick={openProject}
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
              {project ? project.title : 'No project in progress'}
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
                {project ? (project.kind === 'self' ? 'Personal workspace' : project.instituteName || 'Assigned by your educator') : 'Start a roadmap to track progress'}
              </span>
              <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--primary-text)' }}>
                {project ? `${project.progress}%` : ''}
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
                  width: `${project?.progress || 0}%`,
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
            onClick={openProject}
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
            {project ? 'continue' : 'browse projects'}
          </button>
        </div>
      </div>

      {/* REWARD PREVIEW MODAL */}
      {isRewardModalOpen && currentReward && (
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
                {currentReward.wished ? 'On your wishlist' : 'Featured reward'}
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

            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#101828', marginBottom: '16px' }}>
              {currentReward.title}
            </h3>

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
              onClick={() => go('rewards', currentReward.id)}
              style={{
                width: '100%',
                height: '42px',
                borderRadius: '999px',
                border: 'none',
                background: '#FEE047',
                color: '#101828',
                fontWeight: 700,
                fontSize: '14px',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(254, 224, 71, 0.4)',
                transition: 'all 0.15s ease'
              }}
            >
              {pointsBalance >= currentReward.points
                ? 'Redeem in the rewards store'
                : `${(currentReward.points - pointsBalance).toLocaleString()} more points to unlock · View`}
            </button>
          </div>
        </ModalPortal>
      )}

      {dailyModal === 'question' && <DailyQuestionModal onClose={() => setDailyModal(null)} />}
      {dailyModal === 'quest' && <WordQuestModal onClose={() => setDailyModal(null)} />}
    </div>
  );
}
