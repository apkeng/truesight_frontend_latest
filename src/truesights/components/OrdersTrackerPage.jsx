import React, { useState } from 'react';

export default function OrdersTrackerPage({
  orders = [],
  onBackToCatalog,
  pointsWallet = 161,
  isMobile: propIsMobile
}) {
  const [internalIsMobile, setInternalIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  );

  React.useEffect(() => {
    const handleResize = () => setInternalIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = propIsMobile !== undefined ? propIsMobile : internalIsMobile;

  const activeOrdersCount = orders.filter((o) => o.status !== 'Delivered').length;
  const deliveredOrdersCount = orders.filter((o) => o.status === 'Delivered').length;

  if (isMobile) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          boxSizing: 'border-box',
          gap: '12px',
          fontFamily: 'var(--font-primary, "Plus Jakarta Sans", sans-serif)',
          paddingBottom: '24px'
        }}
      >
        {/* Mobile Header Bar */}
        <div
          style={{
            background: '#243367',
            borderRadius: '14px',
            padding: '12px 14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 4px 14px rgba(36, 51, 103, 0.12)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              onClick={onBackToCatalog}
              aria-label="Back to rewards"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                background: '#FFFFFF',
                border: 'none',
                borderRadius: '8px',
                padding: '6px 12px',
                fontSize: '12px',
                fontWeight: 700,
                color: '#20346B',
                cursor: 'pointer'
              }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
              </svg>
              <span>Back</span>
            </button>
            <span style={{ fontSize: '15px', fontWeight: 800, color: '#FFFFFF' }}>My Orders</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {activeOrdersCount > 0 && (
              <span
                style={{
                  background: 'rgba(59, 130, 246, 0.25)',
                  border: '1px solid #60A5FA',
                  color: '#93C5FD',
                  borderRadius: '12px',
                  padding: '3px 8px',
                  fontSize: '10px',
                  fontWeight: 800
                }}
              >
                {activeOrdersCount} In Transit
              </span>
            )}
            <span
              style={{
                background: '#FEE047',
                color: '#101D3B',
                borderRadius: '12px',
                padding: '3px 8px',
                fontSize: '10px',
                fontWeight: 800
              }}
            >
              {orders.length} Total
            </span>
          </div>
        </div>

        {/* Orders List */}
        {orders.length === 0 ? (
          <div
            style={{
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '12px',
              padding: '40px 16px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              textAlign: 'center'
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
                color: '#94A3B8'
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="1" y="3" width="15" height="13"></rect>
                <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
                <circle cx="5.5" cy="18.5" r="2.5"></circle>
                <circle cx="18.5" cy="18.5" r="2.5"></circle>
              </svg>
            </div>
            <span style={{ fontSize: '15px', fontWeight: 800, color: '#101D3B' }}>
              No Reward Orders Yet
            </span>
            <p style={{ fontSize: '12px', color: '#64748B', margin: 0, maxWidth: '280px', lineHeight: '18px' }}>
              Browse campus rewards and redeem with your mastery points.
            </p>
            <button
              type="button"
              onClick={onBackToCatalog}
              style={{
                background: '#FEE047',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 18px',
                fontSize: '12px',
                fontWeight: 900,
                color: '#101D3B',
                cursor: 'pointer',
                marginTop: '4px'
              }}
            >
              Browse Rewards
            </button>
          </div>
        ) : (
          orders.map((ord) => {
            const isDelivered = ord.status === 'Delivered';
            const isInProgress = !isDelivered;

            return (
              <div
                key={ord.id}
                style={{
                  background: '#FFFFFF',
                  border: isInProgress ? '1.5px solid #93C5FD' : '1px solid #E2E8F0',
                  borderRadius: '12px',
                  padding: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  boxShadow: '0 2px 6px rgba(0, 0, 0, 0.03)'
                }}
              >
                {/* Product Header */}
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <div
                    style={{
                      width: '54px',
                      height: '54px',
                      background: '#F8FAFC',
                      borderRadius: '8px',
                      border: '1px solid #E2E8F0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '3px',
                      flexShrink: 0
                    }}
                  >
                    <img
                      src={ord.image}
                      alt={ord.title}
                      style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '9px', fontWeight: 800, color: '#4B7EE8', textTransform: 'uppercase' }}>
                        {ord.categoryLabel || ord.category}
                      </span>
                      {isInProgress ? (
                        <span
                          style={{
                            background: '#EFF6FF',
                            color: '#1D4ED8',
                            border: '1px solid #93C5FD',
                            borderRadius: '4px',
                            padding: '2px 6px',
                            fontSize: '10px',
                            fontWeight: 800
                          }}
                        >
                          In Transit
                        </span>
                      ) : (
                        <span
                          style={{
                            background: '#ECFDF5',
                            color: '#059669',
                            border: '1px solid #A7F3D0',
                            borderRadius: '4px',
                            padding: '2px 6px',
                            fontSize: '10px',
                            fontWeight: 800
                          }}
                        >
                          Delivered
                        </span>
                      )}
                    </div>

                    <span
                      style={{
                        fontSize: '13px',
                        fontWeight: 800,
                        color: '#101D3B',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}
                    >
                      {ord.title}
                    </span>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px', color: '#64748B' }}>
                      <span>Option: <strong>{ord.option}</strong></span>
                      <span style={{ fontWeight: 800, color: '#10B981' }}>-{ord.points} PTS</span>
                    </div>
                  </div>
                </div>

                {/* Mobile Stepper Timeline */}
                <div
                  style={{
                    background: '#F8FAFC',
                    borderRadius: '8px',
                    padding: '10px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px' }}>
                    <span style={{ fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase' }}>
                      CAMPUS DISPATCH
                    </span>
                    <span style={{ fontWeight: 700, color: isInProgress ? '#2563EB' : '#10B981' }}>
                      {isInProgress ? 'ETA: 3–4 Days' : 'Delivered with OTP'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
                    {/* Background Progress Bar */}
                    <div
                      style={{
                        position: 'absolute',
                        top: '10px',
                        left: '20px',
                        right: '20px',
                        height: '2px',
                        background: '#CBD5E1',
                        zIndex: 1
                      }}
                    >
                      <div
                        style={{
                          height: '100%',
                          background: isInProgress ? '#2563EB' : '#10B981',
                          width: isInProgress ? '66%' : '100%'
                        }}
                      />
                    </div>

                    {/* Step 1: Confirmed */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', zIndex: 2 }}>
                      <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#10B981', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                      <span style={{ fontSize: '9px', fontWeight: 700, color: '#101D3B' }}>Confirmed</span>
                    </div>

                    {/* Step 2: Packaged */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', zIndex: 2 }}>
                      <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#10B981', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                      <span style={{ fontSize: '9px', fontWeight: 700, color: '#101D3B' }}>Packaged</span>
                    </div>

                    {/* Step 3: In Transit */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', zIndex: 2 }}>
                      <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: isInProgress ? '#2563EB' : '#10B981', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {isInProgress ? (
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#FFFFFF' }}></span>
                        ) : (
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                      </div>
                      <span style={{ fontSize: '9px', fontWeight: 700, color: isInProgress ? '#2563EB' : '#101D3B' }}>Transit</span>
                    </div>

                    {/* Step 4: Delivered */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', zIndex: 2 }}>
                      <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: isDelivered ? '#10B981' : '#E2E8F0', color: isDelivered ? '#FFFFFF' : '#94A3B8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {isDelivered ? (
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        ) : (
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#CBD5E1' }}></span>
                        )}
                      </div>
                      <span style={{ fontSize: '9px', fontWeight: 700, color: isDelivered ? '#101D3B' : '#94A3B8' }}>Delivered</span>
                    </div>
                  </div>
                </div>

                {/* Recipient info & Tracking ID footer */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '10px', color: '#64748B', paddingTop: '2px' }}>
                  <span>ID: <strong style={{ color: '#20346B' }}>{ord.id}</strong></span>
                  <span>{ord.shipping?.deliveryAddress ? ord.shipping.deliveryAddress.substring(0, 24) + '...' : 'Room 302, Hostel 4'}</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
        maxHeight: '100%',
        boxSizing: 'border-box',
        gap: '14px',
        overflow: 'hidden',
        fontFamily: 'var(--font-primary, "Plus Jakarta Sans", sans-serif)'
      }}
    >
      {/* 1. TOP HEADER BANNER */}
      <div
        style={{
          background: '#243367',
          borderRadius: '12px',
          padding: '16px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          boxShadow: '0 4px 14px rgba(36, 51, 103, 0.12)',
          flexShrink: 0
        }}
      >
        {/* Left: Back to Rewards + Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <button
            type="button"
            onClick={onBackToCatalog}
            aria-label="Back to rewards catalog"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: '#FFFFFF',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 14px',
              fontSize: '13px',
              fontWeight: 700,
              color: '#20346B',
              cursor: 'pointer',
              transition: 'all 0.18s ease',
              boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#FEE047';
              e.currentTarget.style.color = '#101D3B';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#FFFFFF';
              e.currentTarget.style.color = '#20346B';
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            <span>Back to Rewards</span>
          </button>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <h1 style={{ fontSize: '20px', fontWeight: 800, color: '#FFFFFF', margin: 0, letterSpacing: '-0.01em' }}>
              Track My Reward Orders
            </h1>
            <span style={{ fontSize: '12px', color: '#D6E1F9' }}>
              Live campus courier tracking &amp; verified dispatch timelines
            </span>
          </div>
        </div>

        {/* Right: Stats Counters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {activeOrdersCount > 0 && (
            <div
              style={{
                background: 'rgba(59, 130, 246, 0.2)',
                border: '1px solid #60A5FA',
                borderRadius: '8px',
                padding: '8px 14px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                minWidth: '95px'
              }}
            >
              <span style={{ fontSize: '18px', fontWeight: 900, color: '#93C5FD', lineHeight: '20px' }}>
                {activeOrdersCount}
              </span>
              <span style={{ fontSize: '10px', fontWeight: 700, color: '#D6E1F9', letterSpacing: '0.06em' }}>
                IN TRANSIT
              </span>
            </div>
          )}

          <div
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '8px',
              padding: '8px 14px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              minWidth: '85px'
            }}
          >
            <span style={{ fontSize: '18px', fontWeight: 900, color: '#FEE047', lineHeight: '20px' }}>
              {orders.length}
            </span>
            <span style={{ fontSize: '10px', fontWeight: 700, color: '#CBD5E1', letterSpacing: '0.06em' }}>
              TOTAL ORDERS
            </span>
          </div>

          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '8px',
              padding: '8px 16px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              minWidth: '95px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'
            }}
          >
            <span style={{ fontSize: '18px', fontWeight: 900, color: '#20346B', lineHeight: '20px' }}>
              {pointsWallet} PTS
            </span>
            <span style={{ fontSize: '10px', fontWeight: 700, color: '#64748B', letterSpacing: '0.06em' }}>
              WALLET BALANCE
            </span>
          </div>
        </div>
      </div>

      {/* 2. ORDERS LIST CONTAINER */}
      <div
        style={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          paddingRight: '6px',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px'
        }}
      >
        {orders.length === 0 ? (
          <div
            style={{
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '12px',
              padding: '60px 20px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '14px',
              textAlign: 'center'
            }}
          >
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: '#F1F5F9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#94A3B8'
              }}
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="1" y="3" width="15" height="13"></rect>
                <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
                <circle cx="5.5" cy="18.5" r="2.5"></circle>
                <circle cx="18.5" cy="18.5" r="2.5"></circle>
              </svg>
            </div>
            <span style={{ fontSize: '18px', fontWeight: 800, color: '#101D3B' }}>
              No Active Reward Orders Yet
            </span>
            <p style={{ fontSize: '13px', color: '#64748B', maxWidth: '380px', margin: 0, lineHeight: '20px' }}>
              Browse the TrueSights vault, select your favorite campus reward, and redeem with your mastery points to see packaging and courier delivery here.
            </p>
            <button
              type="button"
              onClick={onBackToCatalog}
              style={{
                background: '#FEE047',
                border: 'none',
                borderRadius: '8px',
                padding: '10px 22px',
                fontSize: '13px',
                fontWeight: 900,
                color: '#101D3B',
                cursor: 'pointer',
                marginTop: '6px'
              }}
            >
              Browse Rewards Catalog
            </button>
          </div>
        ) : (
          orders.map((ord) => {
            const isDelivered = ord.status === 'Delivered';
            const isInProgress = !isDelivered;

            return (
              <div
                key={ord.id}
                style={{
                  background: '#FFFFFF',
                  border: isInProgress ? '1.5px solid #93C5FD' : '1px solid #E2E8F0',
                  borderRadius: '12px',
                  padding: '18px 20px',
                  boxShadow: isInProgress ? '0 4px 14px rgba(37, 99, 235, 0.08)' : '0 2px 8px rgba(0, 0, 0, 0.03)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px'
                }}
              >
                {/* Card Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div
                      style={{
                        width: '64px',
                        height: '64px',
                        background: '#F8FAFC',
                        borderRadius: '10px',
                        border: '1px solid #E2E8F0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '4px',
                        flexShrink: 0
                      }}
                    >
                      <img
                        src={ord.image}
                        alt={ord.title}
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                      />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '10px', fontWeight: 800, color: '#4B7EE8', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                          {ord.categoryLabel || ord.category}
                        </span>
                        <span style={{ color: '#CBD5E1' }}>·</span>
                        <span style={{ fontSize: '12px', color: '#64748B' }}>
                          Option: <strong>{ord.option}</strong>
                        </span>
                      </div>

                      <span style={{ fontSize: '16px', fontWeight: 800, color: '#101D3B' }}>
                        {ord.title}
                      </span>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px', color: '#64748B' }}>
                        <span>Tracking ID: <strong style={{ color: '#20346B' }}>{ord.id}</strong></span>
                        <span>·</span>
                        <span>Order Date: {ord.date}</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div
                      style={{
                        background: '#F8FAFC',
                        border: '1px solid #E2E8F0',
                        borderRadius: '8px',
                        padding: '6px 12px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-end'
                      }}
                    >
                      <span style={{ fontSize: '10px', fontWeight: 700, color: '#94A3B8' }}>DEDUCTION</span>
                      <span style={{ fontSize: '14px', fontWeight: 900, color: '#10B981' }}>-{ord.points} PTS</span>
                    </div>

                    {/* Status Pill: Distinct for In Progress vs Delivered */}
                    {isInProgress ? (
                      <span
                        style={{
                          background: '#EFF6FF',
                          color: '#1D4ED8',
                          border: '1.5px solid #93C5FD',
                          borderRadius: '6px',
                          padding: '6px 12px',
                          fontSize: '12px',
                          fontWeight: 800,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#2563EB', animation: 'pulseDot 1.2s infinite' }}></span>
                        <span>In Transit · 3–4 Days</span>
                      </span>
                    ) : (
                      <span
                        style={{
                          background: '#ECFDF5',
                          color: '#059669',
                          border: '1.5px solid #A7F3D0',
                          borderRadius: '6px',
                          padding: '6px 12px',
                          fontSize: '12px',
                          fontWeight: 800,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px'
                        }}
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="3">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        <span>Delivered</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* 4-Step Interactive Timeline */}
                <div
                  style={{
                    background: '#F8FAFC',
                    borderRadius: '10px',
                    padding: '14px 18px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '11px', fontWeight: 800, color: '#94A3B8', letterSpacing: '0.06em' }}>
                      CAMPUS DISPATCH TIMELINE
                    </span>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: isInProgress ? '#2563EB' : '#10B981' }}>
                      {isInProgress ? 'Estimated Arrival: 3 to 4 Working Days' : 'Delivered & Handed Over with OTP'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
                    {/* Background Progress Bar */}
                    <div
                      style={{
                        position: 'absolute',
                        top: '12px',
                        left: '30px',
                        right: '30px',
                        height: '3px',
                        background: '#CBD5E1',
                        zIndex: 1
                      }}
                    >
                      <div
                        style={{
                          height: '100%',
                          background: isInProgress ? 'linear-gradient(90deg, #10B981 0%, #2563EB 100%)' : '#10B981',
                          width: isInProgress ? '62%' : '100%',
                          transition: 'width 0.4s ease'
                        }}
                      />
                    </div>

                    {/* Step 1: Confirmed */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', zIndex: 2 }}>
                      <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#10B981', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: '#101D3B' }}>Confirmed</span>
                    </div>

                    {/* Step 2: Box Packaged */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', zIndex: 2 }}>
                      <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#10B981', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: '#101D3B' }}>Box Packaged</span>
                    </div>

                    {/* Step 3: Courier In Transit */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', zIndex: 2 }}>
                      <div
                        style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          background: isInProgress ? '#2563EB' : '#10B981',
                          color: '#FFFFFF',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: isInProgress ? '0 0 10px rgba(37, 99, 235, 0.4)' : 'none'
                        }}
                      >
                        {isInProgress ? (
                          <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#FFFFFF' }} />
                        ) : (
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                      </div>
                      <span style={{ fontSize: '11px', fontWeight: isInProgress ? 900 : 700, color: isInProgress ? '#2563EB' : '#101D3B' }}>
                        {isInProgress ? 'In Transit (3-4 Days)' : 'Courier Dispatched'}
                      </span>
                    </div>

                    {/* Step 4: Delivered to Hostel */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', zIndex: 2 }}>
                      <div
                        style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          background: isDelivered ? '#10B981' : '#FFFFFF',
                          border: isDelivered ? 'none' : '2px dashed #94A3B8',
                          color: '#FFFFFF',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        {isDelivered && (
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                      </div>
                      <span style={{ fontSize: '11px', fontWeight: isDelivered ? 800 : 500, color: isDelivered ? '#101D3B' : '#94A3B8' }}>
                        {isDelivered ? 'Delivered' : 'Expected Oct 9'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Delivery Footnote */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: '#64748B' }}>
                  <div>
                    Recipient Destination: <strong style={{ color: '#101D3B' }}>{ord.shipping?.fullName || 'Yadu Student'} · {ord.shipping?.deliveryAddress || 'Hostel 4'}, {ord.shipping?.city || 'Hyderabad'}</strong>
                  </div>
                  <div style={{ color: isInProgress ? '#2563EB' : '#059669', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                    </svg>
                    <span>{isInProgress ? 'In Progress · Handover in 3–4 Days' : 'Completed · Verified Handover'}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <style>{`
        @keyframes pulseDot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.35; transform: scale(0.8); }
        }
      `}</style>
    </div>
  );
}
