import React, { useState } from 'react';

const STAGE_NAMES = {
  placed: 'Placed',
  confirmed: 'Confirmed',
  packed: 'Packed',
  shipped: 'Shipped',
  out_for_delivery: 'Out for delivery',
  delivered: 'Delivered',
  ready_for_pickup: 'Ready for pickup',
  collected: 'Collected'
};

/** The order's real fulfilment stages: done in green, current in blue, upcoming in grey. */
function StageTrack({ ord, compact }) {
  const stages = ord.raw.stages || [];
  const status = ord.raw.status;
  const current = stages.indexOf(status);
  const cancelled = status === 'cancelled';
  const size = compact ? 20 : 24;
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', position: 'relative' }}>
      {stages.map((stage, i) => {
        const done = !cancelled && i <= current;
        const isCurrent = !cancelled && i === current && i < stages.length - 1;
        return (
          <div key={stage} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', position: 'relative' }}>
            {i > 0 && (
              <div
                style={{
                  position: 'absolute',
                  top: `${size / 2 - 1}px`,
                  right: '50%',
                  width: '100%',
                  height: compact ? '2px' : '3px',
                  background: !cancelled && i <= current ? '#10B981' : '#CBD5E1'
                }}
              />
            )}
            <div
              style={{
                width: `${size}px`,
                height: `${size}px`,
                borderRadius: '50%',
                background: isCurrent ? '#2563EB' : done ? '#10B981' : '#FFFFFF',
                border: done || isCurrent ? 'none' : '2px dashed #94A3B8',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 2,
                boxSizing: 'border-box'
              }}
            >
              {isCurrent ? (
                <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#FFFFFF' }} />
              ) : done ? (
                <svg width={compact ? 10 : 12} height={compact ? 10 : 12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : null}
            </div>
            <span
              style={{
                fontSize: compact ? '9px' : '11px',
                fontWeight: isCurrent ? 800 : done ? 700 : 500,
                color: isCurrent ? '#2563EB' : done ? '#101D3B' : '#94A3B8',
                textAlign: 'center',
                lineHeight: 1.2
              }}
            >
              {STAGE_NAMES[stage] || stage}
            </span>
          </div>
        );
      })}
    </div>
  );
}

const CancelButton = ({ ord, onCancelOrder, cancellingId }) =>
  ord.cancellable && onCancelOrder ? (
    <button
      type="button"
      onClick={() => onCancelOrder(ord)}
      disabled={cancellingId === ord.raw.id}
      style={{
        background: '#FFFFFF',
        border: '1px solid #FECACA',
        borderRadius: '6px',
        padding: '4px 10px',
        fontSize: '11px',
        fontWeight: 700,
        color: '#DC2626',
        cursor: 'pointer',
        transition: 'all 0.15s ease'
      }}
    >
      {cancellingId === ord.raw.id ? 'Cancelling…' : 'Cancel order'}
    </button>
  ) : null;

export default function OrdersTrackerPage({
  orders = [],
  onBackToCatalog,
  onCancelOrder,
  cancellingId = null,
  highlightId = null,
  pointsWallet = 0,
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

  const activeOrdersCount = orders.filter((o) => o.status !== 'Delivered' && o.status !== 'Cancelled').length;

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
            const isCancelled = ord.status === 'Cancelled';
            const isInProgress = !isDelivered && !isCancelled;

            return (
              <div
                key={ord.id}
                style={{
                  background: '#FFFFFF',
                  border: highlightId && ord.raw.id === highlightId ? '2px solid #FEE047' : isInProgress ? '1.5px solid #93C5FD' : '1px solid #E2E8F0',
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
                          {ord.stageLabel}
                        </span>
                      ) : (
                        <span
                          style={{
                            background: isCancelled ? '#FEF2F2' : '#ECFDF5',
                            color: isCancelled ? '#DC2626' : '#059669',
                            border: isCancelled ? '1px solid #FECACA' : '1px solid #A7F3D0',
                            borderRadius: '4px',
                            padding: '2px 6px',
                            fontSize: '10px',
                            fontWeight: 800
                          }}
                        >
                          {isCancelled ? 'Cancelled' : 'Delivered'}
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
                      ORDER PROGRESS
                    </span>
                    <span style={{ fontWeight: 700, color: isInProgress ? '#2563EB' : '#10B981' }}>
                      {isInProgress ? ord.eta : isCancelled ? 'Points refunded' : 'Delivered'}
                    </span>
                  </div>

                  <StageTrack ord={ord} compact={true} />
                </div>

                {/* Recipient info & Tracking ID footer */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '10px', color: '#64748B', paddingTop: '2px' }}>
                  <span>ID: <strong style={{ color: '#20346B' }}>{ord.id}</strong></span>
                  <span>{ord.shipping?.deliveryAddress ? ord.shipping.deliveryAddress.substring(0, 24) + '...' : 'Campus pickup'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <CancelButton ord={ord} onCancelOrder={onCancelOrder} cancellingId={cancellingId} />
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
              Track every reward you have redeemed
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
            const isCancelled = ord.status === 'Cancelled';
            const isInProgress = !isDelivered && !isCancelled;

            return (
              <div
                key={ord.id}
                style={{
                  background: '#FFFFFF',
                  border: highlightId && ord.raw.id === highlightId ? '2px solid #FEE047' : isInProgress ? '1.5px solid #93C5FD' : '1px solid #E2E8F0',
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
                        <span>{ord.stageLabel} · {ord.eta}</span>
                      </span>
                    ) : (
                      <span
                        style={{
                          background: isCancelled ? '#FEF2F2' : '#ECFDF5',
                          color: isCancelled ? '#DC2626' : '#059669',
                          border: isCancelled ? '1.5px solid #FECACA' : '1.5px solid #A7F3D0',
                          borderRadius: '6px',
                          padding: '6px 12px',
                          fontSize: '12px',
                          fontWeight: 800,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px'
                        }}
                      >
                        <span>{isCancelled ? 'Cancelled · points refunded' : 'Delivered'}</span>
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
                      ORDER PROGRESS
                    </span>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: isInProgress ? '#2563EB' : '#10B981' }}>
                      {isInProgress ? `${ord.stageLabel} · ${ord.eta}` : isCancelled ? 'Cancelled - points refunded' : 'Delivered'}
                    </span>
                  </div>

                  <StageTrack ord={ord} compact={false} />
                </div>

                {/* Delivery Footnote */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: '#64748B' }}>
                  <div>
                    {ord.fulfilment === 'pickup' ? 'Collect at: ' : 'Recipient Destination: '}<strong style={{ color: '#101D3B' }}>{ord.shipping?.deliveryAddress || 'Campus pickup at your institute'}</strong>
                  </div>
                  <div style={{ color: isInProgress ? '#2563EB' : '#059669', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                    </svg>
                    <span>{isInProgress ? `In progress · ${ord.eta}` : isCancelled ? 'Cancelled' : 'Completed'}</span>
                    <CancelButton ord={ord} onCancelOrder={onCancelOrder} cancellingId={cancellingId} />
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
