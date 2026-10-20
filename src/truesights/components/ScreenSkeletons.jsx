import React from 'react';

/**
 * Reusable Skeleton Primitives
 */
export function SkeletonBox({ width = '100%', height = '20px', borderRadius = '8px', style = {}, subtle = false, className = '' }) {
  return (
    <div
      className={`${subtle ? 'skeleton-shimmer-subtle' : 'skeleton-shimmer'} ${className}`}
      style={{
        width,
        height,
        borderRadius,
        flexShrink: 0,
        ...style
      }}
    />
  );
}

export function SkeletonCircle({ size = 40, style = {}, subtle = false }) {
  return (
    <SkeletonBox
      width={`${size}px`}
      height={`${size}px`}
      borderRadius="50%"
      subtle={subtle}
      style={style}
    />
  );
}

export function SkeletonPill({ width = '80px', height = '26px', borderRadius = '999px', style = {}, subtle = false }) {
  return (
    <SkeletonBox
      width={width}
      height={height}
      borderRadius={borderRadius}
      subtle={subtle}
      style={style}
    />
  );
}

export function SkeletonLine({ width = '100%', height = '12px', borderRadius = '6px', style = {}, subtle = false }) {
  return (
    <SkeletonBox
      width={width}
      height={height}
      borderRadius={borderRadius}
      subtle={subtle}
      style={style}
    />
  );
}

export function SkeletonCard({ children, style = {}, className = '' }) {
  return (
    <div
      className={`skeleton-card ${className}`}
      style={{
        padding: '18px',
        display: 'flex',
        flexDirection: 'column',
        ...style
      }}
    >
      {children}
    </div>
  );
}

/**
 * 1. DASHBOARD SKELETON
 */
export function DashboardSkeleton({ isSidebarCollapsed = false }) {
  const leftColWidth = isSidebarCollapsed ? '510px' : '433px';

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: '16px',
        boxSizing: 'border-box'
      }}
    >
      {/* Top Row: Welcome + Syllabus (Left) & Learning Momentum (Right) */}
      <div style={{ display: 'flex', gap: '16px', alignItems: 'stretch', width: '100%' }}>
        {/* Left Column: 433px or 510px */}
        <div style={{ width: leftColWidth, minWidth: leftColWidth, maxWidth: leftColWidth, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Welcome Block (74px) */}
          <div style={{ height: '74px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <SkeletonLine width="280px" height="38px" borderRadius="10px" />
            <SkeletonLine width="360px" height="14px" borderRadius="6px" />
          </div>

          {/* Syllabus Mind Map Card (285px) */}
          <SkeletonCard style={{ height: '285px', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <SkeletonPill width="140px" height="24px" />
                <SkeletonCircle size={18} />
              </div>
              <SkeletonPill width="56px" height="22px" />
            </div>

            {/* Simulated Mind Map Radial Nodes */}
            <div
              style={{
                position: 'relative',
                height: '140px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '8px 0'
              }}
            >
              {/* Central glowing hub */}
              <SkeletonCircle size={56} style={{ boxShadow: '0 0 16px rgba(11, 58, 111, 0.1)' }} />
              {/* Orbiting nodes */}
              <SkeletonCircle size={32} style={{ position: 'absolute', top: '10px', left: '60px' }} />
              <SkeletonCircle size={32} style={{ position: 'absolute', top: '12px', right: '60px' }} />
              <SkeletonCircle size={28} style={{ position: 'absolute', bottom: '15px', left: '75px' }} />
              <SkeletonCircle size={34} style={{ position: 'absolute', bottom: '10px', right: '70px' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <SkeletonLine width="160px" height="12px" />
                <SkeletonLine width="40px" height="12px" />
              </div>
              <SkeletonLine width="100%" height="8px" borderRadius="4px" />
            </div>
          </SkeletonCard>
        </div>

        {/* Right Column: Learning Momentum */}
        <SkeletonCard style={{ flex: 1, minWidth: 0, justifyContent: 'space-between' }}>
          {/* Header row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <SkeletonCircle size={36} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <SkeletonLine width="190px" height="18px" />
                <SkeletonLine width="130px" height="12px" />
              </div>
            </div>
            {/* Weekdays pills */}
            <div style={{ display: 'flex', gap: '8px' }}>
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((_, idx) => (
                <SkeletonPill key={idx} width="32px" height="32px" borderRadius="8px" />
              ))}
            </div>
          </div>

          {/* 3 Metric Pods */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', margin: '14px 0' }}>
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                style={{
                  background: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: '12px',
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}
              >
                <SkeletonCircle size={38} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
                  <SkeletonLine width="50%" height="18px" />
                  <SkeletonLine width="80%" height="11px" />
                </div>
              </div>
            ))}
          </div>

          {/* Activity Bar Chart Skeleton */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <SkeletonLine width="120px" height="12px" />
              <SkeletonPill width="84px" height="20px" />
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'space-between',
                height: '110px',
                padding: '0 16px 8px 16px',
                borderBottom: '1px solid #E2E8F0',
                gap: '20px'
              }}
            >
              {[45, 75, 35, 90, 60, 85, 50, 95, 70, 40, 65, 80].map((h, i) => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', flex: 1 }}>
                  <SkeletonBox width="100%" height={`${h}px`} borderRadius="6px 6px 2px 2px" />
                  <SkeletonLine width="16px" height="8px" />
                </div>
              ))}
            </div>
          </div>
        </SkeletonCard>
      </div>

      {/* Bottom Row: AskTestBook (535px) + MyProjects (flex: 1) + UpcomingEvents (333px) */}
      <div style={{ display: 'flex', gap: '16px', height: '375px', alignItems: 'stretch' }}>
        {/* 1. Ask Textbook (535px) */}
        <SkeletonCard style={{ width: '535px', flexShrink: 0, justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <SkeletonCircle size={44} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
              <SkeletonLine width="180px" height="18px" />
              <SkeletonLine width="120px" height="12px" />
            </div>
          </div>

          {/* Sample Prompts */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <SkeletonPill width="100%" height="34px" borderRadius="10px" />
            <SkeletonPill width="90%" height="34px" borderRadius="10px" />
            <SkeletonPill width="95%" height="34px" borderRadius="10px" />
          </div>

          {/* Mic / Prompt Box */}
          <div
            style={{
              background: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: '12px',
              padding: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}
          >
            <SkeletonCircle size={32} />
            <SkeletonLine width="75%" height="14px" />
            <SkeletonCircle size={28} />
          </div>
        </SkeletonCard>

        {/* 2. My Projects (flex: 1) */}
        <SkeletonCard style={{ flex: 1, minWidth: '320px', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <SkeletonCircle size={24} />
              <SkeletonLine width="140px" height="18px" />
            </div>
            <SkeletonPill width="68px" height="22px" />
          </div>

          {/* 2 Project Items */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1, justifyContent: 'center' }}>
            {[1, 2].map((proj) => (
              <div
                key={proj}
                style={{
                  background: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: '12px',
                  padding: '14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <SkeletonPill width="90px" height="20px" />
                  <SkeletonLine width="42px" height="12px" />
                </div>
                <SkeletonLine width="70%" height="16px" />
                <SkeletonLine width="100%" height="7px" borderRadius="4px" />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: '-6px' }}>
                    <SkeletonCircle size={24} style={{ border: '2px solid white' }} />
                    <SkeletonCircle size={24} style={{ border: '2px solid white', marginLeft: '-6px' }} />
                  </div>
                  <SkeletonLine width="80px" height="12px" />
                </div>
              </div>
            ))}
          </div>
        </SkeletonCard>

        {/* 3. Upcoming Events (333px) */}
        <SkeletonCard style={{ width: '333px', flexShrink: 0, justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <SkeletonCircle size={24} />
              <SkeletonLine width="140px" height="18px" />
            </div>
            <SkeletonPill width="60px" height="22px" />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1, justifyContent: 'center' }}>
            {[1, 2].map((ev) => (
              <div
                key={ev}
                style={{
                  background: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: '12px',
                  padding: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}
              >
                <SkeletonBox width="46px" height="46px" borderRadius="10px" />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
                  <SkeletonLine width="75%" height="15px" />
                  <SkeletonLine width="50%" height="11px" />
                </div>
                <SkeletonPill width="64px" height="24px" />
              </div>
            ))}
          </div>
        </SkeletonCard>
      </div>
    </div>
  );
}

/**
 * 2. PROJECTS HUB SKELETON
 */
export function ProjectsSkeleton() {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        overflow: 'hidden'
      }}
    >
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <SkeletonLine width="260px" height="28px" borderRadius="8px" />
          <SkeletonLine width="380px" height="14px" />
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <SkeletonBox width="260px" height="38px" borderRadius="10px" />
          <SkeletonPill width="130px" height="38px" borderRadius="10px" />
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '10px', borderBottom: '1px solid #E2E8F0', paddingBottom: '10px' }}>
        {['All Projects', 'Active Roadmaps', 'Completed', 'Bookmarked'].map((tab, idx) => (
          <SkeletonPill key={idx} width="110px" height="32px" borderRadius="8px" />
        ))}
      </div>

      {/* 6 Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '16px',
          flex: 1,
          overflow: 'hidden'
        }}
      >
        {[1, 2, 3, 4, 5, 6].map((card) => (
          <SkeletonCard key={card} style={{ justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <SkeletonPill width="90px" height="22px" />
              <SkeletonCircle size={24} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', margin: '8px 0' }}>
              <SkeletonLine width="80%" height="18px" />
              <SkeletonLine width="100%" height="12px" />
              <SkeletonLine width="65%" height="12px" />
            </div>

            {/* Stepper Dots */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', margin: '6px 0' }}>
              {[1, 2, 3, 4].map((step) => (
                <React.Fragment key={step}>
                  <SkeletonCircle size={14} />
                  {step < 4 && <SkeletonBox width="24px" height="3px" />}
                </React.Fragment>
              ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <SkeletonLine width="70px" height="12px" />
                <SkeletonLine width="32px" height="12px" />
              </div>
              <SkeletonLine width="100%" height="6px" borderRadius="3px" />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
              <div style={{ display: 'flex', gap: '-6px' }}>
                <SkeletonCircle size={26} />
                <SkeletonCircle size={26} style={{ marginLeft: '-8px' }} />
                <SkeletonCircle size={26} style={{ marginLeft: '-8px' }} />
              </div>
              <SkeletonPill width="110px" height="32px" borderRadius="8px" />
            </div>
          </SkeletonCard>
        ))}
      </div>
    </div>
  );
}

/**
 * 3. WORKSPACE SKELETON
 */
export function WorkspaceSkeleton() {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        overflow: 'hidden'
      }}
    >
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <SkeletonPill width="80px" height="34px" borderRadius="8px" />
          <SkeletonLine width="280px" height="24px" />
          <SkeletonPill width="90px" height="24px" />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <SkeletonPill width="110px" height="32px" />
          <SkeletonCircle size={36} />
        </div>
      </div>

      {/* Stepper Stage Tracker */}
      <div
        style={{
          background: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: '12px',
          padding: '12px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        {[1, 2, 3, 4].map((phase, idx) => (
          <div key={phase} style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
            <SkeletonCircle size={28} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <SkeletonLine width="80px" height="12px" />
              <SkeletonLine width="50px" height="10px" />
            </div>
            {idx < 3 && <SkeletonBox width="60px" height="3px" style={{ marginLeft: 'auto', marginRight: '16px' }} />}
          </div>
        ))}
      </div>

      {/* Split Body: Left Tasks (360px) + Right Interactive Canvas (flex: 1) */}
      <div style={{ display: 'flex', gap: '16px', flex: 1, minHeight: 0 }}>
        {/* Left tasks sidebar */}
        <SkeletonCard style={{ width: '380px', flexShrink: 0, gap: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <SkeletonLine width="140px" height="16px" />
            <SkeletonPill width="60px" height="20px" />
          </div>

          {[1, 2, 3, 4].map((task) => (
            <div
              key={task}
              style={{
                background: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: '10px',
                padding: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}
            >
              <SkeletonCircle size={20} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
                <SkeletonLine width="85%" height="13px" />
                <SkeletonLine width="50%" height="10px" />
              </div>
              <SkeletonPill width="44px" height="18px" />
            </div>
          ))}
        </SkeletonCard>

        {/* Right canvas hero */}
        <SkeletonCard style={{ flex: 1, minWidth: 0, justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <SkeletonPill width="120px" height="24px" />
              <SkeletonPill width="90px" height="24px" />
            </div>
            <SkeletonLine width="60%" height="24px" />
            <SkeletonLine width="90%" height="14px" />
            <SkeletonLine width="75%" height="14px" />
          </div>

          {/* Interactive Preview Canvas Placeholder */}
          <div
            style={{
              background: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: '12px',
              padding: '24px',
              height: '240px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
          >
            <div style={{ display: 'flex', gap: '10px' }}>
              <SkeletonCircle size={14} />
              <SkeletonCircle size={14} />
              <SkeletonCircle size={14} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <SkeletonLine width="45%" height="16px" />
              <SkeletonLine width="80%" height="14px" />
              <SkeletonLine width="65%" height="14px" />
              <SkeletonLine width="70%" height="14px" />
            </div>
            <SkeletonLine width="30%" height="14px" />
          </div>

          {/* Footer Action Buttons */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <SkeletonBox width="200px" height="44px" borderRadius="10px" />
            <SkeletonBox width="140px" height="44px" borderRadius="10px" />
          </div>
        </SkeletonCard>
      </div>
    </div>
  );
}

/**
 * 4. LIVE CHALLENGE / QUIZ SKELETON
 */
export function QuizSkeleton() {
  return (
    <div
      style={{
        width: '100%',
        maxWidth: '1511px',
        height: '840px',
        margin: '0 auto',
        padding: '24px',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
      }}
    >
      {/* Top Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <SkeletonPill width="100px" height="38px" borderRadius="10px" />
        <SkeletonPill width="160px" height="38px" borderRadius="999px" />
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <SkeletonPill width="90px" height="38px" borderRadius="999px" />
          <SkeletonCircle size={38} />
        </div>
      </div>

      {/* Question Center Card */}
      <SkeletonCard style={{ padding: '32px', gap: '18px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <SkeletonPill width="140px" height="26px" />
          <SkeletonLine width="90px" height="14px" />
        </div>
        <SkeletonLine width="90%" height="28px" borderRadius="8px" />
        <SkeletonLine width="70%" height="28px" borderRadius="8px" />

        {/* Code / Diagram block */}
        <div
          style={{
            background: '#F8FAFC',
            border: '1px solid #E2E8F0',
            borderRadius: '12px',
            padding: '18px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
          }}
        >
          <SkeletonLine width="40%" height="14px" />
          <SkeletonLine width="75%" height="14px" />
          <SkeletonLine width="60%" height="14px" />
        </div>
      </SkeletonCard>

      {/* 4 Options Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
        {['A', 'B', 'C', 'D'].map((letter) => (
          <div
            key={letter}
            style={{
              background: '#FFFFFF',
              border: '1.5px solid #E2E8F0',
              borderRadius: '14px',
              padding: '20px 24px',
              display: 'flex',
              alignItems: 'center',
              gap: '16px'
            }}
          >
            <SkeletonCircle size={36} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
              <SkeletonLine width="80%" height="16px" />
              <SkeletonLine width="50%" height="12px" />
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Footer Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <SkeletonPill width="110px" height="42px" borderRadius="10px" />
        <SkeletonBox width="160px" height="46px" borderRadius="12px" />
      </div>
    </div>
  );
}

/**
 * 5. REWARDS CATALOG SKELETON
 */
export function RewardsSkeleton() {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        overflow: 'hidden'
      }}
    >
      {/* Wallet Hero Banner */}
      <SkeletonCard
        style={{
          background: 'linear-gradient(135deg, #0B3A6F 0%, #174C88 100%)',
          padding: '22px 28px',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
          <SkeletonCircle size={56} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <SkeletonLine width="180px" height="28px" />
            <SkeletonLine width="260px" height="14px" />
          </div>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <SkeletonPill width="130px" height="40px" borderRadius="10px" />
          <SkeletonPill width="110px" height="40px" borderRadius="10px" />
        </div>
      </SkeletonCard>

      {/* Category Pills */}
      <div style={{ display: 'flex', gap: '10px' }}>
        {['All Rewards', 'Digital Badges', 'Swag & Merch', 'Gift Vouchers', 'Certificates'].map((cat, i) => (
          <SkeletonPill key={i} width="110px" height="34px" borderRadius="8px" />
        ))}
      </div>

      {/* Rewards Product Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '16px',
          flex: 1,
          overflow: 'hidden'
        }}
      >
        {[1, 2, 3, 4].map((item) => (
          <SkeletonCard key={item} style={{ justifyContent: 'space-between', padding: '14px' }}>
            <SkeletonBox width="100%" height="140px" borderRadius="10px" />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
              <SkeletonPill width="70px" height="20px" />
              <SkeletonLine width="60px" height="14px" />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', margin: '8px 0' }}>
              <SkeletonLine width="85%" height="16px" />
              <SkeletonLine width="60%" height="12px" />
            </div>
            <SkeletonBox width="100%" height="36px" borderRadius="8px" />
          </SkeletonCard>
        ))}
      </div>
    </div>
  );
}

/**
 * 6. RESULTS PAGE SKELETON
 */
export function ResultsSkeleton() {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        overflow: 'hidden'
      }}
    >
      {/* Hero Score Card */}
      <SkeletonCard
        style={{
          padding: '24px',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          gap: '14px'
        }}
      >
        <SkeletonCircle size={100} />
        <SkeletonLine width="240px" height="26px" />
        <SkeletonLine width="340px" height="14px" />
        <SkeletonPill width="150px" height="32px" borderRadius="999px" />
      </SkeletonCard>

      {/* 3 Metric Tiles */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
        {[1, 2, 3].map((tile) => (
          <div
            key={tile}
            style={{
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '12px',
              padding: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}
          >
            <SkeletonCircle size={40} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
              <SkeletonLine width="60px" height="20px" />
              <SkeletonLine width="90px" height="12px" />
            </div>
          </div>
        ))}
      </div>

      {/* Review Rows */}
      <SkeletonCard style={{ flex: 1, gap: '10px', overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <SkeletonLine width="160px" height="16px" />
          <SkeletonPill width="80px" height="22px" />
        </div>
        {[1, 2, 3].map((q) => (
          <div
            key={q}
            style={{
              background: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: '10px',
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
              <SkeletonCircle size={22} />
              <SkeletonLine width="70%" height="14px" />
            </div>
            <SkeletonPill width="64px" height="22px" />
          </div>
        ))}
      </SkeletonCard>

      {/* Action Footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <SkeletonBox width="160px" height="42px" borderRadius="10px" />
        <div style={{ display: 'flex', gap: '12px' }}>
          <SkeletonBox width="140px" height="42px" borderRadius="10px" />
          <SkeletonBox width="140px" height="42px" borderRadius="10px" />
        </div>
      </div>
    </div>
  );
}

/**
 * 7. CHALLENGES SKELETON
 */
export function ChallengesSkeleton() {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        overflow: 'hidden'
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <SkeletonLine width="240px" height="28px" />
          <SkeletonLine width="380px" height="14px" />
        </div>
        <SkeletonBox width="160px" height="40px" borderRadius="10px" />
      </div>

      {/* 3 Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
        {[1, 2, 3].map((stat) => (
          <div
            key={stat}
            style={{
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '12px',
              padding: '14px 18px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}
          >
            <SkeletonCircle size={38} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <SkeletonLine width="50px" height="18px" />
              <SkeletonLine width="100px" height="12px" />
            </div>
          </div>
        ))}
      </div>

      {/* Tabs & Search */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          {['My Challenges', 'Requests (2)', 'Active (3)', 'Finished (5)'].map((tab, i) => (
            <SkeletonPill key={i} width="110px" height="34px" borderRadius="8px" />
          ))}
        </div>
        <SkeletonBox width="240px" height="34px" borderRadius="8px" />
      </div>

      {/* Challenge Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '16px',
          flex: 1,
          overflow: 'hidden'
        }}
      >
        {[1, 2, 3].map((ch) => (
          <SkeletonCard key={ch} style={{ justifyContent: 'space-between', padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <SkeletonPill width="80px" height="22px" />
              <SkeletonPill width="70px" height="22px" />
            </div>

            {/* Matchup avatars */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', margin: '14px 0' }}>
              <SkeletonCircle size={46} />
              <SkeletonCircle size={24} />
              <SkeletonCircle size={46} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
              <SkeletonLine width="160px" height="16px" />
              <SkeletonLine width="100px" height="12px" />
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
              <SkeletonBox width="100%" height="36px" borderRadius="8px" />
              <SkeletonBox width="100%" height="36px" borderRadius="8px" />
            </div>
          </SkeletonCard>
        ))}
      </div>
    </div>
  );
}

/**
 * 8. ASK TEXTBOOK SKELETON
 */
export function AskTextbookSkeleton() {
  return (
    <div
      style={{
        width: '100%',
        maxWidth: '1511px',
        height: '840px',
        display: 'flex',
        alignItems: 'stretch',
        background: '#FFFFFF',
        borderRadius: '21px',
        overflow: 'hidden',
        border: '1px solid #E2E8F0'
      }}
    >
      {/* Left PDF Panel (50%) */}
      <div
        style={{
          width: '50%',
          borderRight: '1px solid #E2E8F0',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '20px'
        }}
      >
        {/* PDF Toolbar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E2E8F0', paddingBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <SkeletonCircle size={28} />
            <SkeletonLine width="180px" height="16px" />
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <SkeletonPill width="60px" height="28px" />
            <SkeletonCircle size={28} />
            <SkeletonCircle size={28} />
          </div>
        </div>

        {/* Document Page Canvas */}
        <div
          style={{
            background: '#F8FAFC',
            border: '1px solid #E2E8F0',
            borderRadius: '12px',
            padding: '24px',
            flex: 1,
            margin: '16px 0',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}
        >
          <SkeletonLine width="45%" height="22px" />
          <SkeletonLine width="100%" height="13px" />
          <SkeletonLine width="95%" height="13px" />
          <SkeletonLine width="90%" height="13px" />
          <SkeletonBox width="100%" height="140px" borderRadius="8px" style={{ margin: '8px 0' }} />
          <SkeletonLine width="100%" height="13px" />
          <SkeletonLine width="80%" height="13px" />
        </div>

        {/* Page counter footer */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <SkeletonPill width="100px" height="28px" />
          <div style={{ display: 'flex', gap: '6px' }}>
            <SkeletonCircle size={28} />
            <SkeletonCircle size={28} />
          </div>
        </div>
      </div>

      {/* Right AI Chat Panel (50%) */}
      <div
        style={{
          width: '50%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '20px'
        }}
      >
        {/* Chat Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E2E8F0', paddingBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <SkeletonCircle size={36} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <SkeletonLine width="160px" height="16px" />
              <SkeletonLine width="100px" height="11px" />
            </div>
          </div>
          <SkeletonPill width="80px" height="30px" />
        </div>

        {/* Chat Transcript Area */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1, padding: '20px 0', overflow: 'hidden' }}>
          {/* User Bubble (Right) */}
          <div style={{ alignSelf: 'flex-end', width: '65%', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ background: '#0B3A6F', opacity: 0.15, borderRadius: '14px 14px 2px 14px', padding: '14px' }}>
              <SkeletonLine width="100%" height="13px" />
              <SkeletonLine width="75%" height="13px" style={{ marginTop: '6px' }} />
            </div>
          </div>

          {/* AI Response (Left) */}
          <div style={{ alignSelf: 'flex-start', width: '80%', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <SkeletonPill width="140px" height="22px" />
            <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '14px 14px 14px 2px', padding: '16px' }}>
              <SkeletonLine width="100%" height="13px" />
              <SkeletonLine width="95%" height="13px" style={{ margin: '6px 0' }} />
              <SkeletonLine width="85%" height="13px" />
              <SkeletonBox width="100%" height="60px" borderRadius="8px" style={{ marginTop: '10px' }} />
            </div>
          </div>
        </div>

        {/* Input Bar */}
        <div
          style={{
            background: '#F8FAFC',
            border: '1px solid #E2E8F0',
            borderRadius: '14px',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}
        >
          <SkeletonCircle size={28} />
          <SkeletonLine width="80%" height="16px" />
          <SkeletonCircle size={32} />
        </div>
      </div>
    </div>
  );
}

/**
 * 9. EVENTS SKELETON
 */
export function EventsSkeleton() {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        overflow: 'hidden'
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <SkeletonLine width="260px" height="28px" />
          <SkeletonLine width="360px" height="14px" />
        </div>
        <SkeletonPill width="120px" height="36px" borderRadius="10px" />
      </div>

      {/* Search & Tabs */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <SkeletonBox width="340px" height="40px" borderRadius="10px" />
        <div style={{ display: 'flex', gap: '10px' }}>
          <SkeletonPill width="100px" height="38px" borderRadius="8px" />
          <SkeletonPill width="100px" height="38px" borderRadius="8px" />
        </div>
      </div>

      {/* 2x2 Grid of Event Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '16px',
          flex: 1,
          overflow: 'hidden'
        }}
      >
        {[1, 2, 3, 4].map((ev) => (
          <SkeletonCard key={ev} style={{ justifyContent: 'space-between', padding: '16px' }}>
            <SkeletonBox width="100%" height="130px" borderRadius="10px" />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
              <SkeletonPill width="90px" height="22px" />
              <SkeletonLine width="110px" height="13px" />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', margin: '8px 0' }}>
              <SkeletonLine width="85%" height="18px" />
              <SkeletonLine width="95%" height="12px" />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #E2E8F0', paddingTop: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <SkeletonCircle size={32} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <SkeletonLine width="90px" height="12px" />
                  <SkeletonLine width="60px" height="10px" />
                </div>
              </div>
              <SkeletonPill width="110px" height="34px" borderRadius="8px" />
            </div>
          </SkeletonCard>
        ))}
      </div>
    </div>
  );
}

/**
 * 10. TRASH SKELETON
 */
export function TrashSkeleton() {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        overflow: 'hidden'
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <SkeletonLine width="220px" height="28px" />
          <SkeletonLine width="380px" height="14px" />
        </div>
        <SkeletonPill width="130px" height="38px" borderRadius="10px" />
      </div>

      {/* Search & Tabs */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <SkeletonBox width="320px" height="38px" borderRadius="10px" />
        <div style={{ display: 'flex', gap: '8px' }}>
          {['All (4)', 'Roadmaps (2)', 'Challenges (1)', 'Notes (1)'].map((tab, i) => (
            <SkeletonPill key={i} width="95px" height="34px" borderRadius="8px" />
          ))}
        </div>
      </div>

      {/* Selection toolbar */}
      <div
        style={{
          background: '#F8FAFC',
          border: '1px solid #E2E8F0',
          borderRadius: '10px',
          padding: '10px 16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <SkeletonCircle size={18} />
          <SkeletonLine width="110px" height="12px" />
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <SkeletonPill width="80px" height="26px" />
          <SkeletonPill width="100px" height="26px" />
        </div>
      </div>

      {/* List Rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1, overflow: 'hidden' }}>
        {[1, 2, 3, 4].map((row) => (
          <div
            key={row}
            style={{
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '12px',
              padding: '14px 18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '16px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1 }}>
              <SkeletonCircle size={18} />
              <SkeletonBox width="40px" height="40px" borderRadius="10px" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
                <SkeletonLine width="45%" height="16px" />
                <SkeletonLine width="25%" height="11px" />
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <SkeletonLine width="90px" height="12px" />
              <SkeletonPill width="96px" height="24px" />
              <div style={{ display: 'flex', gap: '8px' }}>
                <SkeletonCircle size={32} />
                <SkeletonCircle size={32} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * 11. Profile Skeleton
 */
export function ProfileSkeleton() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        gap: '20px',
        paddingRight: '6px'
      }}
    >
      {/* Top Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <SkeletonBox width="100px" height="36px" borderRadius="10px" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <SkeletonLine width="260px" height="22px" />
            <SkeletonLine width="340px" height="13px" />
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <SkeletonBox width="140px" height="38px" borderRadius="10px" />
          <SkeletonBox width="130px" height="38px" borderRadius="10px" />
        </div>
      </div>

      {/* Identity Hero Card */}
      <div
        style={{
          background: '#FFFFFF',
          borderRadius: '16px',
          border: '1px solid #E2E8F0',
          padding: '24px 28px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <SkeletonCircle size={84} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <SkeletonLine width="200px" height="20px" />
                <SkeletonPill width="70px" height="20px" />
              </div>
              <SkeletonLine width="240px" height="14px" />
              <SkeletonLine width="300px" height="12px" />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <SkeletonBox width="110px" height="34px" borderRadius="8px" />
            <SkeletonBox width="60px" height="34px" borderRadius="8px" />
          </div>
        </div>

        {/* Pills & Protocol URL */}
        <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '16px', display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <SkeletonPill width="130px" height="28px" />
            <SkeletonPill width="170px" height="28px" />
            <SkeletonPill width="160px" height="28px" />
          </div>
          <SkeletonBox width="280px" height="32px" borderRadius="8px" />
        </div>
      </div>

      {/* Two Column Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
          gap: '20px'
        }}
      >
        {/* Card 1: Identity Information Form */}
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: '16px',
            border: '1px solid #E2E8F0',
            padding: '22px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid #F1F5F9', paddingBottom: '14px' }}>
            <SkeletonCircle size={32} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
              <SkeletonLine width="160px" height="16px" />
              <SkeletonLine width="220px" height="11px" />
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <SkeletonLine width="110px" height="12px" />
                <SkeletonBox width="100%" height="42px" borderRadius="10px" />
              </div>
            ))}
          </div>
        </div>

        {/* Card 2: Affiliation & Vault */}
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: '16px',
            border: '1px solid #E2E8F0',
            padding: '22px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid #F1F5F9', paddingBottom: '14px' }}>
            <SkeletonCircle size={32} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
              <SkeletonLine width="180px" height="16px" />
              <SkeletonLine width="200px" height="11px" />
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {[1, 2, 3].map((i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <SkeletonLine width="130px" height="12px" />
                <SkeletonBox width="100%" height="42px" borderRadius="10px" />
              </div>
            ))}
            <SkeletonBox width="100%" height="64px" borderRadius="12px" />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * 12. No Internet Skeleton
 */
export function NoInternetSkeleton() {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        minHeight: '520px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 20px',
        backgroundColor: '#FFFFFF',
        borderRadius: '16px',
        border: '1px solid #E2E8F0',
        gap: '20px'
      }}
    >
      <SkeletonBox width="260px" height="180px" borderRadius="14px" />
      <SkeletonLine width="280px" height="24px" />
      <SkeletonLine width="420px" height="14px" />
      <SkeletonLine width="360px" height="14px" />
      <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
        <SkeletonBox width="130px" height="42px" borderRadius="10px" />
        <SkeletonBox width="160px" height="42px" borderRadius="10px" />
      </div>
    </div>
  );
}

/**
 * 13. First Time User Skeleton
 */
export function FirstTimeUserSkeleton() {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        paddingRight: '6px'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <SkeletonLine width="180px" height="22px" />
        <SkeletonBox width="140px" height="38px" borderRadius="9px" />
      </div>
      <div
        style={{
          background: '#FFFFFF',
          borderRadius: '16px',
          border: '1px solid #E2E8F0',
          padding: '40px 24px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px'
        }}
      >
        <SkeletonBox width="220px" height="160px" borderRadius="14px" />
        <SkeletonLine width="300px" height="22px" />
        <SkeletonLine width="460px" height="14px" />
        <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
          <SkeletonBox width="180px" height="42px" borderRadius="10px" />
          <SkeletonBox width="160px" height="42px" borderRadius="10px" />
        </div>
      </div>
    </div>
  );
}

/**
 * Master Screen Skeleton Switcher
 */
export default function ScreenSkeleton({ screen }) {
  switch (screen) {
    case 'dashboard':
      return <DashboardSkeleton />;
    case 'projects':
      return <ProjectsSkeleton />;
    case 'workspace':
      return <WorkspaceSkeleton />;
    case 'quiz':
      return <QuizSkeleton />;
    case 'rewards':
      return <RewardsSkeleton />;
    case 'results':
      return <ResultsSkeleton />;
    case 'challenges':
      return <ChallengesSkeleton />;
    case 'ask-textbook':
      return <AskTextbookSkeleton />;
    case 'events':
      return <EventsSkeleton />;
    case 'trash':
      return <TrashSkeleton />;
    case 'profile':
      return <ProfileSkeleton />;
    case 'no-internet':
      return <NoInternetSkeleton />;
    case 'first-time-user':
      return <FirstTimeUserSkeleton />;
    default:
      return <DashboardSkeleton />;
  }
}
