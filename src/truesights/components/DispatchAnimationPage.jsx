import React, { useState, useEffect } from 'react';

export default function DispatchAnimationPage({
  order,
  onViewOrders,
  onBackToCatalog,
  isMobile: propIsMobile
}) {
  // Current animation stage (1: 2D Box Packaging, 2: Active Moving Bike, 3: Campus Route & ETA, 4: Confirmed & In Transit)
  const [activeStage, setActiveStage] = useState(1);
  const [isPaused, setIsPaused] = useState(false);
  const [internalIsMobile, setInternalIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  );

  useEffect(() => {
    const handleResize = () => setInternalIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = propIsMobile !== undefined ? propIsMobile : internalIsMobile;

  useEffect(() => {
    if (isPaused) return;

    if (activeStage === 1) {
      const timer = setTimeout(() => setActiveStage(2), 2800);
      return () => clearTimeout(timer);
    } else if (activeStage === 2) {
      const timer = setTimeout(() => setActiveStage(3), 3200);
      return () => clearTimeout(timer);
    } else if (activeStage === 3) {
      const timer = setTimeout(() => setActiveStage(4), 4200);
      return () => clearTimeout(timer);
    }
  }, [activeStage, isPaused]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: '100%',
        minHeight: isMobile ? 'calc(100vh - 130px)' : '100%',
        maxHeight: '100%',
        boxSizing: 'border-box',
        overflow: 'hidden',
        fontFamily: 'var(--font-primary, "Plus Jakarta Sans", sans-serif)'
      }}
    >
      {/* MAIN ANIMATION CONTAINER (Light, clean, premium TrueSights palette with NO top strip) */}
      <div
        style={{
          flex: 1,
          width: '100%',
          maxWidth: '720px',
          minHeight: isMobile ? 'calc(100vh - 140px)' : 0,
          background: 'linear-gradient(180deg, #F8FAFC 0%, #FFFFFF 100%)',
          border: '1px solid #E2E8F0',
          borderRadius: '12px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: isMobile ? '46px 14px 20px 14px' : '24px 32px',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 4px 20px rgba(32, 52, 107, 0.05)',
          boxSizing: 'border-box',
          margin: '0 auto'
        }}
      >
        {/* Subtle, slim, modern 4-segment progress line right at top edge */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: '#E2E8F0',
            display: 'flex',
            zIndex: 10
          }}
        >
          {[1, 2, 3, 4].map((step) => {
            const isFilled = activeStage >= step;
            return (
              <div
                key={step}
                style={{
                  flex: 1,
                  height: '100%',
                  background: isFilled ? '#20346B' : 'transparent',
                  borderRight: step < 4 ? '2px solid #FFFFFF' : 'none',
                  transition: 'background 0.4s ease'
                }}
              />
            );
          })}
        </div>

        {/* Minimal floating stage info & skip control (No heavy dark banner!) */}
        <div
          style={{
            position: 'absolute',
            top: isMobile ? '10px' : '16px',
            left: isMobile ? '12px' : '20px',
            right: isMobile ? '12px' : '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            zIndex: 10,
            gap: '8px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '6px' : '8px', minWidth: 0 }}>
            <div
              style={{
                width: isMobile ? '24px' : '28px',
                height: isMobile ? '24px' : '28px',
                borderRadius: '6px',
                background: '#FFFFFF',
                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2px',
                flexShrink: 0
              }}
            >
              <img
                src="/assets/truesight-logo-colour-1024 2.png"
                alt="TrueSights"
                style={{ width: isMobile ? '18px' : '22px', height: isMobile ? '18px' : '22px', objectFit: 'contain' }}
              />
            </div>
            <span style={{ fontSize: isMobile ? '12px' : '13px', fontWeight: 800, color: '#101D3B', whiteSpace: 'nowrap' }}>
              TrueSights Logistics
            </span>
            {!isMobile && <span style={{ color: '#CBD5E1' }}>·</span>}
            {!isMobile && (
              <span style={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>
                {activeStage === 1 && 'Step 1 of 4: Packing in 2D Box'}
                {activeStage === 2 && 'Step 2 of 4: Courier Bike Dispatch'}
                {activeStage === 3 && 'Step 3 of 4: Transit Route (3-4 Days)'}
                {activeStage === 4 && 'Step 4 of 4: Order Confirmed & In Transit'}
              </span>
            )}
          </div>

          {activeStage < 4 && (
            <button
              type="button"
              onClick={() => {
                setActiveStage(4);
                setIsPaused(true);
              }}
              style={{
                background: '#FFFFFF',
                border: '1px solid #CBD5E1',
                borderRadius: '6px',
                padding: isMobile ? '4px 9px' : '5px 12px',
                fontSize: isMobile ? '10.5px' : '11px',
                fontWeight: 700,
                color: '#475569',
                cursor: 'pointer',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                transition: 'all 0.15s ease',
                flexShrink: 0
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#20346B';
                e.currentTarget.style.color = '#20346B';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#CBD5E1';
                e.currentTarget.style.color = '#475569';
              }}
            >
              Skip Animation
            </button>
          )}
        </div>

        {/* ============================================================ */}
        {/* STAGE 1: REALISTIC CARDBOARD PACKAGING & SEALING            */}
        {/* ============================================================ */}
        {activeStage === 1 && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: isMobile ? '12px' : '16px',
              animation: 'fadeInClean 0.35s ease',
              textAlign: 'center',
              zIndex: 2,
              width: '100%',
              maxWidth: '380px',
              margin: '0 auto'
            }}
          >
            {/* Visual Clean 2D Vector Box with Real Opening & Closing Flaps */}
            <div
              style={{
                width: '100%',
                maxWidth: '340px',
                height: isMobile ? '200px' : '240px',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto'
              }}
            >
              <svg
                width="100%"
                height="100%"
                viewBox="0 0 340 240"
                preserveAspectRatio="xMidYMid meet"
                style={{ overflow: 'visible', maxWidth: '340px', display: 'block', margin: '0 auto' }}
              >
                <defs>
                  <linearGradient id="tapeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#20346B" />
                    <stop offset="100%" stopColor="#101D3B" />
                  </linearGradient>
                  <filter id="boxDropShadow" x="-10%" y="-10%" width="120%" height="130%">
                    <feDropShadow dx="0" dy="4" stdDeviation="6" floodOpacity="0.08" floodColor="#20346B" />
                  </filter>
                </defs>

                {/* 1. Flat Soft Ground Shadow */}
                <ellipse cx="170" cy="214" rx="115" ry="9" fill="#E2E8F0" />

                {/* Whole Box Group (receives physical landing cushion bounce) */}
                <g style={{ animation: 'boxImpactSettle 2.8s ease' }}>
                  {/* 2. Back Interior Wall of the Box (Darker Kraft Cardboard) */}
                  <rect
                    x="75"
                    y="110"
                    width="190"
                    height="95"
                    rx="6"
                    fill="#D4AF57"
                    stroke="#B8913B"
                    strokeWidth="1.5"
                  />

                  {/* 3. Deep Interior Cavity (Open space where item sinks in) */}
                  <rect
                    x="82"
                    y="111"
                    width="176"
                    height="32"
                    rx="4"
                    fill="#9E782F"
                    opacity="0.75"
                  />

                  {/* 4. Product Dropping In: Positioned BEHIND the Front Wall, slipping inside the box! */}
                  <g style={{ animation: 'productDropInsideBox 2.8s cubic-bezier(0.2, 0.9, 0.3, 1) forwards' }}>
                    <rect
                      x="135"
                      y="16"
                      width="70"
                      height="70"
                      rx="10"
                      fill="#FFFFFF"
                      stroke="#CBD5E1"
                      strokeWidth="1.5"
                      filter="url(#boxDropShadow)"
                    />
                    <image
                      href={order.image}
                      x="140"
                      y="21"
                      width="60"
                      height="60"
                      preserveAspectRatio="xMidYMid meet"
                    />
                  </g>

                  {/* 5. Front Body of Box: Drawn on top of product so item genuinely enters INSIDE */}
                  <rect
                    x="75"
                    y="110"
                    width="190"
                    height="95"
                    rx="6"
                    fill="#ECC880"
                    stroke="#B8913B"
                    strokeWidth="2"
                  />

                  {/* Shipping Barcode Label */}
                  <rect x="92" y="136" width="56" height="34" rx="4" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1" />
                  <line x1="98" y1="143" x2="98" y2="163" stroke="#101D3B" strokeWidth="2" />
                  <line x1="103" y1="143" x2="103" y2="163" stroke="#101D3B" strokeWidth="1" />
                  <line x1="108" y1="143" x2="108" y2="163" stroke="#101D3B" strokeWidth="3" />
                  <line x1="115" y1="143" x2="115" y2="163" stroke="#101D3B" strokeWidth="1.5" />
                  <line x1="121" y1="143" x2="121" y2="163" stroke="#101D3B" strokeWidth="2" />
                  <line x1="128" y1="143" x2="128" y2="163" stroke="#101D3B" strokeWidth="1" />
                  <line x1="134" y1="143" x2="134" y2="163" stroke="#101D3B" strokeWidth="2.5" />
                  <line x1="141" y1="143" x2="141" y2="163" stroke="#101D3B" strokeWidth="1.5" />

                  {/* TrueSights Official Brand Stamp on Front Body */}
                  <g transform="translate(182, 134)">
                    <rect x="0" y="0" width="70" height="40" rx="5" fill="#20346B" stroke="#FEE047" strokeWidth="1.5" />
                    <text x="35" y="16" fill="#FEE047" fontFamily="'Plus Jakarta Sans', sans-serif" fontSize="8" fontWeight="900" textAnchor="middle" letterSpacing="0.06em">
                      TRUESIGHTS
                    </text>
                    <text x="35" y="28" fill="#FFFFFF" fontFamily="'Plus Jakarta Sans', sans-serif" fontSize="7" fontWeight="800" textAnchor="middle">
                      PARCEL HUB
                    </text>
                  </g>

                  {/* 6. Top Opening Left Flap: Opens UP (-74deg), then folds DOWN (0deg) to close */}
                  <polygon
                    points="75,110 75,92 170,92 170,110"
                    fill="#F5D799"
                    stroke="#B8913B"
                    strokeWidth="1.5"
                    style={{
                      transformOrigin: '75px 110px',
                      animation: 'flapLeftOpenAndClose 2.8s cubic-bezier(0.4, 0, 0.2, 1) forwards'
                    }}
                  />

                  {/* 7. Top Opening Right Flap: Opens UP (+74deg), then folds DOWN (0deg) to close */}
                  <polygon
                    points="265,110 265,92 170,92 170,110"
                    fill="#DFC076"
                    stroke="#B8913B"
                    strokeWidth="1.5"
                    style={{
                      transformOrigin: '265px 110px',
                      animation: 'flapRightOpenAndClose 2.8s cubic-bezier(0.4, 0, 0.2, 1) forwards'
                    }}
                  />

                  {/* 8. Tamper-evident Security Tape: Applies across center seam after flaps close! */}
                  <g
                    style={{
                      transformOrigin: '170px 92px',
                      animation: 'sealingTapeApply 2.8s cubic-bezier(0.2, 0.8, 0.3, 1) forwards'
                    }}
                  >
                    {/* Dark Navy Tape Band */}
                    <rect
                      x="158"
                      y="90"
                      width="24"
                      height="115"
                      fill="url(#tapeGradient)"
                      rx="2"
                    />
                    {/* Gold Security Thread in center of tape */}
                    <line
                      x1="170"
                      y1="90"
                      x2="170"
                      y2="205"
                      stroke="#FEE047"
                      strokeWidth="1.5"
                      strokeDasharray="4 3"
                    />
                  </g>

                  {/* 9. Verified & Sealed Stamp Pop */}
                  <g
                    transform="translate(196, 102)"
                    style={{
                      transformOrigin: '196px 102px',
                      animation: 'verifiedStampPop 2.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards'
                    }}
                  >
                    <circle cx="16" cy="16" r="16" fill="#10B981" stroke="#FFFFFF" strokeWidth="2" />
                    <path
                      d="M10 16 L14 20 L22 11"
                      fill="none"
                      stroke="#FFFFFF"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </g>
                </g>
              </svg>
            </div>

            {/* Description Text */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'center' }}>
              <div
                style={{
                  background: '#EBF2FE',
                  border: '1px solid #BFDBFE',
                  borderRadius: '20px',
                  padding: '4px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#2563EB', animation: 'pulseDot 1.2s infinite' }}></div>
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#1E40AF', letterSpacing: '0.04em' }}>
                  STEP 1: PACKAGING REWARD INTO 2D PARCEL BOX
                </span>
              </div>
              <h2 style={{ fontSize: '19px', fontWeight: 800, color: '#101D3B', margin: 0 }}>
                Packing {order.title}
              </h2>
              <span style={{ fontSize: '13px', color: '#64748B', maxWidth: '420px', lineHeight: '18px' }}>
                Box opens, reward descends inside, and automated tamper-evident tape seals parcel.
              </span>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* STAGE 2: COURIER BIKE IN ACTIVE DYNAMIC MOTION               */}
        {/* ============================================================ */}
        {activeStage === 2 && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: isMobile ? '12px' : '16px',
              animation: 'fadeInClean 0.35s ease',
              textAlign: 'center',
              zIndex: 2,
              width: '100%',
              maxWidth: '540px',
              margin: '0 auto'
            }}
          >
            {/* The Dynamic Moving Bike Stage */}
            <div
              style={{
                width: '100%',
                maxWidth: '460px',
                height: isMobile ? '190px' : '230px',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                margin: '0 auto'
              }}
            >
              <svg
                width="100%"
                height="100%"
                viewBox="0 0 460 210"
                preserveAspectRatio="xMidYMid meet"
                style={{ maxWidth: '460px', display: 'block', margin: '0 auto' }}
              >
                <defs>
                  {/* Wheel Pattern with visible spinning spokes */}
                  <g id="spinningSpokes">
                    <circle cx="0" cy="0" r="28" fill="#1E293B" stroke="#475569" strokeWidth="4"/>
                    <circle cx="0" cy="0" r="14" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="2"/>
                    <line x1="-24" y1="0" x2="24" y2="0" stroke="#CBD5E1" strokeWidth="2"/>
                    <line x1="0" y1="-24" x2="0" y2="24" stroke="#CBD5E1" strokeWidth="2"/>
                    <line x1="-17" y1="-17" x2="17" y2="17" stroke="#CBD5E1" strokeWidth="2"/>
                    <line x1="-17" y1="17" x2="17" y2="-17" stroke="#CBD5E1" strokeWidth="2"/>
                    <circle cx="0" cy="0" r="5" fill="#FEE047"/>
                  </g>
                </defs>

                {/* Animated Streaming Asphalt Road (Dashes move right to left to show high speed) */}
                <rect x="0" y="165" width="460" height="25" rx="4" fill="#E2E8F0"/>
                <line
                  x1="0"
                  y1="177"
                  x2="460"
                  y2="177"
                  stroke="#94A3B8"
                  strokeWidth="3"
                  strokeDasharray="20 14"
                  style={{ animation: 'roadDashRapid 0.35s linear infinite' }}
                />

                {/* Wind / Speed Streaks whooshing past */}
                <line x1="320" y1="65" x2="420" y2="65" stroke="#4B7EE8" strokeWidth="2" strokeDasharray="14 10" opacity="0.6" style={{ animation: 'windStreak1 0.4s linear infinite' }}/>
                <line x1="280" y1="90" x2="380" y2="90" stroke="#CBD5E1" strokeWidth="2" strokeDasharray="18 12" opacity="0.8" style={{ animation: 'windStreak2 0.5s linear infinite' }}/>
                <line x1="300" y1="130" x2="440" y2="130" stroke="#FEE047" strokeWidth="2.5" strokeDasharray="12 8" opacity="0.7" style={{ animation: 'windStreak3 0.38s linear infinite' }}/>

                {/* The Bike & Courier Group: Has active suspension bouncing motion */}
                <g style={{ animation: 'bikeActiveBounce 0.45s ease-in-out infinite' }}>
                  <g transform="translate(100, 32)">
                    {/* Spinning Rear Wheel */}
                    <g transform="translate(50, 130)">
                      <g style={{ animation: 'wheelRotationFast 0.5s linear infinite', transformOrigin: '0px 0px' }}>
                        <use href="#spinningSpokes" />
                      </g>
                    </g>

                    {/* Spinning Front Wheel */}
                    <g transform="translate(210, 130)">
                      <g style={{ animation: 'wheelRotationFast 0.5s linear infinite', transformOrigin: '0px 0px' }}>
                        <use href="#spinningSpokes" />
                      </g>
                    </g>

                    {/* Bike Chassis in TrueSights Navy & Yellow */}
                    <path d="M50 130 L105 120 L155 70 L195 70 L210 130" fill="none" stroke="#20346B" strokeWidth="7" strokeLinecap="round"/>
                    <path d="M105 120 L135 130" stroke="#FEE047" strokeWidth="9" strokeLinecap="round"/>

                    {/* Cargo Trunk on Rear with TrueSights Logo */}
                    <rect x="15" y="65" width="58" height="50" rx="6" fill="#20346B" stroke="#FEE047" strokeWidth="1.8"/>
                    <rect x="22" y="76" width="44" height="20" rx="3" fill="#FFFFFF"/>
                    <text x="44" y="90" fill="#20346B" fontSize="7" fontWeight="900" textAnchor="middle">TRUESIGHTS</text>

                    {/* LED Headlight Beam with warm forward glow */}
                    <polygon points="215,66 315,45 315,100 215,74" fill="rgba(254, 224, 71, 0.35)" />
                    <circle cx="215" cy="70" r="7" fill="#FEE047" stroke="#101D3B" strokeWidth="1.5"/>

                    {/* Courier Rider with animated posture */}
                    {/* Jacket in Navy with Yellow Stripe */}
                    <path d="M125 72 L105 105 L150 105 Z" fill="#20346B"/>
                    <path d="M118 78 L140 78" stroke="#FEE047" strokeWidth="4" strokeLinecap="round"/>
                    {/* Arms to Handlebar */}
                    <path d="M125 76 L185 68" stroke="#20346B" strokeWidth="6" strokeLinecap="round"/>

                    {/* Helmet Head with Aerodynamic Visor */}
                    <circle cx="135" cy="46" r="17" fill="#FEE047" stroke="#101D3B" strokeWidth="2"/>
                    <path d="M138 40 Q152 44 150 54 L138 52 Z" fill="#101D3B"/>
                  </g>
                </g>
              </svg>
            </div>

            {/* Stage Description */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'center' }}>
              <div
                style={{
                  background: '#FEF3C7',
                  border: '1px solid #FCD34D',
                  borderRadius: '20px',
                  padding: '4px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#D97706', animation: 'pulseDot 1.2s infinite' }}></div>
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#B45309', letterSpacing: '0.04em' }}>
                  STEP 2: COURIER RUNNER IN TRANSIT ON BIKE
                </span>
              </div>
              <h2 style={{ fontSize: '19px', fontWeight: 800, color: '#101D3B', margin: 0 }}>
                Courier Rajesh K. En Route with Your Parcel
              </h2>
              <span style={{ fontSize: '13px', color: '#64748B', maxWidth: '440px', lineHeight: '18px' }}>
                The bike is in active transit towards the regional logistics sorting facility.
              </span>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* STAGE 3: LOGISTICS TRANSIT MAP & 3-4 DAYS TIMELINE           */}
        {/* ============================================================ */}
        {/* STAGE 3: REALISTIC CAMPUS COURIER MAP ROUTING                */}
        {/* ============================================================ */}
        {activeStage === 3 && (
          isMobile ? (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '10px',
                animation: 'fadeInClean 0.35s ease',
                width: '100%',
                maxWidth: '360px',
                margin: '0 auto',
                boxSizing: 'border-box'
              }}
            >
              {/* Mobile Logistics Header Bar */}
              <div
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  background: '#FFFFFF',
                  borderRadius: '12px 12px 0 0',
                  border: '1.5px solid #CBD5E1',
                  borderBottom: 'none',
                  boxShadow: '0 2px 6px rgba(0, 0, 0, 0.03)',
                  boxSizing: 'border-box'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '6px',
                      background: '#EFF6FF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#2563EB',
                      border: '1px solid #BFDBFE'
                    }}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
                      <line x1="9" y1="3" x2="9" y2="18" />
                      <line x1="15" y1="6" x2="15" y2="21" />
                    </svg>
                  </div>
                  <div>
                    <span style={{ fontSize: '12px', fontWeight: 800, color: '#101D3B', display: 'block' }}>
                      Campus Logistics Corridor
                    </span>
                    <span style={{ fontSize: '10px', color: '#64748B' }}>
                      LIVE ROUTE 04
                    </span>
                  </div>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: '#F0FDF4',
                    border: '1px solid #BBF7D0',
                    padding: '4px 8px',
                    borderRadius: '6px'
                  }}
                >
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#16A34A', animation: 'pulseDot 1.2s infinite' }} />
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#16A34A' }}>
                    3–4 Days
                  </span>
                </div>
              </div>

              {/* Mobile Campus Map Stage */}
              <div
                style={{
                  width: '100%',
                  height: '220px',
                  background: '#F1F5F9',
                  borderRadius: '0 0 12px 12px',
                  border: '1.5px solid #CBD5E1',
                  borderTop: '1px solid #E2E8F0',
                  position: 'relative',
                  overflow: 'hidden',
                  boxShadow: '0 4px 14px rgba(0, 0, 0, 0.04)',
                  boxSizing: 'border-box'
                }}
              >
                <svg width="100%" height="100%" viewBox="0 0 340 220" preserveAspectRatio="xMidYMid meet">
                  <defs>
                    <linearGradient id="cleanRouteMob" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#2563EB" />
                      <stop offset="60%" stopColor="#20346B" />
                      <stop offset="100%" stopColor="#10B981" />
                    </linearGradient>
                    <pattern id="campusGridMob" width="16" height="16" patternUnits="userSpaceOnUse">
                      <line x1="0" y1="0" x2="16" y2="0" stroke="#E2E8F0" strokeWidth="0.5" />
                      <line x1="0" y1="0" x2="0" y2="16" stroke="#E2E8F0" strokeWidth="0.5" />
                    </pattern>
                  </defs>

                  <rect width="340" height="220" fill="url(#campusGridMob)" opacity="0.4" />

                  {/* Streets */}
                  {/* Top Parkway Boulevard (y = 52) */}
                  <rect x="0" y="42" width="340" height="24" fill="#FFFFFF" />
                  <line x1="0" y1="54" x2="340" y2="54" stroke="#CBD5E1" strokeWidth="1.5" strokeDasharray="6 4" />
                  <text x="75" y="49" fill="#94A3B8" fontSize="6.5" fontWeight="800" textAnchor="middle">NORTH PARKWAY</text>

                  {/* Bottom Transit Artery (y = 160) */}
                  <rect x="0" y="148" width="340" height="24" fill="#FFFFFF" />
                  <line x1="0" y1="160" x2="340" y2="160" stroke="#CBD5E1" strokeWidth="1.5" strokeDasharray="6 4" />
                  <text x="260" y="156" fill="#94A3B8" fontSize="6.5" fontWeight="800" textAnchor="middle">SOUTH TRANSIT</text>

                  {/* Central Vertical Connector (x = 135) */}
                  <rect x="123" y="0" width="24" height="220" fill="#FFFFFF" />
                  <line x1="135" y1="0" x2="135" y2="220" stroke="#CBD5E1" strokeWidth="1.5" strokeDasharray="6 4" />

                  {/* Buildings */}
                  {/* Top Left: Science & Library */}
                  <rect x="12" y="10" width="95" height="26" rx="5" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1.2" />
                  <text x="59" y="27" fill="#475569" fontSize="7.5" fontWeight="800" textAnchor="middle">SCIENCE COMPLEX</text>

                  {/* Bottom Left: Origin Hub */}
                  <rect x="12" y="178" width="100" height="34" rx="6" fill="#F8FAFC" stroke="#20346B" strokeWidth="1.5" />
                  <text x="62" y="194" fill="#20346B" fontSize="8" fontWeight="900" textAnchor="middle">TRUESIGHTS HUB</text>
                  <text x="62" y="205" fill="#64748B" fontSize="6.5" fontWeight="700" textAnchor="middle">Origin</text>

                  {/* Center: Green Commons */}
                  <rect x="155" y="74" width="95" height="66" rx="6" fill="#ECFDF5" stroke="#A7F3D0" strokeWidth="1.2" />
                  <text x="202" y="112" fill="#047857" fontSize="8" fontWeight="800" textAnchor="middle">CAMPUS COMMONS</text>

                  {/* Top Right: Destination Hostel 4 */}
                  <rect x="235" y="10" width="95" height="26" rx="5" fill="#EFF6FF" stroke="#3B82F6" strokeWidth="1.5" />
                  <text x="282" y="27" fill="#1E40AF" fontSize="8" fontWeight="900" textAnchor="middle">HOSTEL QUAD 4</text>

                  {/* Route Path (Follows streets cleanly) */}
                  <path
                    d="M 50 160 L 125 160 Q 135 160 135 150 L 135 64 Q 135 54 145 54 L 275 54"
                    fill="none"
                    stroke="url(#cleanRouteMob)"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeDasharray="8 5"
                    style={{ animation: 'dashMoveClean 1.2s linear infinite' }}
                  />

                  {/* Origin Hub Pin */}
                  <g transform="translate(42, 146)">
                    <circle cx="8" cy="14" r="10" fill="#20346B" stroke="#FEE047" strokeWidth="2" />
                    <text x="8" y="17" fill="#FFFFFF" fontSize="7" fontWeight="900" textAnchor="middle">HUB</text>
                  </g>

                  {/* Destination Pin with Pulsing Beacon */}
                  <g transform="translate(267, 40)">
                    <circle cx="8" cy="14" r="16" fill="none" stroke="#2563EB" strokeWidth="1.5" opacity="0.6" style={{ animation: 'beaconPulse 1.5s infinite' }} />
                    <circle cx="8" cy="14" r="10" fill="#FEE047" stroke="#101D3B" strokeWidth="2" />
                    <circle cx="8" cy="14" r="3.5" fill="#DC2626" />
                  </g>
                </svg>

                {/* Moving Courier Bike Marker on Mobile */}
                <div
                  style={{
                    position: 'absolute',
                    top: '146px',
                    left: '36px',
                    animation: 'bikeRideMapMobile 4s cubic-bezier(0.4, 0, 0.2, 1) forwards',
                    zIndex: 6
                  }}
                >
                  <div
                    style={{
                      background: '#20346B',
                      border: '2px solid #FEE047',
                      borderRadius: '50%',
                      width: '26px',
                      height: '26px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 2px 8px rgba(32, 52, 107, 0.35)'
                    }}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#FEE047" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="5.5" cy="17.5" r="3.5" />
                      <circle cx="18.5" cy="17.5" r="3.5" />
                      <path d="M15 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm-3 11.5V14l-3-3 4-3 2 3h3" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Mobile 2-Card Status Deck */}
              <div
                style={{
                  width: '100%',
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '8px',
                  marginTop: '2px'
                }}
              >
                <div
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    borderRadius: '8px',
                    padding: '8px 10px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '6px',
                      background: '#EFF6FF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#2563EB',
                      flexShrink: 0
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                  </div>
                  <div>
                    <div style={{ fontSize: '9px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>ETA</div>
                    <div style={{ fontSize: '11px', fontWeight: 800, color: '#101D3B' }}>3 to 4 Days</div>
                  </div>
                </div>

                <div
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    borderRadius: '8px',
                    padding: '8px 10px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '6px',
                      background: '#F0FDF4',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#16A34A',
                      flexShrink: 0
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                      <polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                  </div>
                  <div>
                    <div style={{ fontSize: '9px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Status</div>
                    <div style={{ fontSize: '11px', fontWeight: 800, color: '#16A34A' }}>Active Courier</div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '12px',
                animation: 'fadeInClean 0.35s ease',
                width: '100%',
                maxWidth: '820px',
                marginTop: '4px'
              }}
            >
            {/* Dedicated Top Logistics Header Bar (No Floating Card Overlap) */}
            <div
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 18px',
                background: '#FFFFFF',
                borderRadius: '12px 12px 0 0',
                border: '1.5px solid #CBD5E1',
                borderBottom: 'none',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: '#EFF6FF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#2563EB',
                    border: '1px solid #BFDBFE'
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
                    <line x1="9" y1="3" x2="9" y2="18" />
                    <line x1="15" y1="6" x2="15" y2="21" />
                  </svg>
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 800, color: '#101D3B' }}>
                      TrueSights Campus Logistics Corridor
                    </span>
                    <span
                      style={{
                        fontSize: '10px',
                        fontWeight: 800,
                        background: '#EFF6FF',
                        color: '#2563EB',
                        padding: '2px 8px',
                        borderRadius: '100px',
                        border: '1px solid #BFDBFE'
                      }}
                    >
                      LIVE ROUTE 04
                    </span>
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748B' }}>
                    Automated Waypoint Transit: Hub A &rarr; Central Parkway &rarr; Sector 4
                  </div>
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  padding: '6px 14px',
                  borderRadius: '8px'
                }}
              >
                <span
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: '#2563EB',
                    animation: 'pulseDot 1.2s infinite'
                  }}
                />
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#475569' }}>
                  Delivery Window: <strong style={{ color: '#101D3B' }}>3 to 4 Working Days</strong>
                </span>
              </div>
            </div>

            {/* The Light Campus Logistics Map with True Road-Following Geometry */}
            <div
              style={{
                width: '100%',
                height: '280px',
                background: '#F1F5F9',
                borderRadius: '0 0 12px 12px',
                border: '1.5px solid #CBD5E1',
                borderTop: '1px solid #E2E8F0',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)'
              }}
            >
              <svg width="100%" height="100%" viewBox="0 0 760 280" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="cleanRoute" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#2563EB" />
                    <stop offset="50%" stopColor="#20346B" />
                    <stop offset="100%" stopColor="#10B981" />
                  </linearGradient>
                  <pattern id="campusGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                    <line x1="0" y1="0" x2="20" y2="0" stroke="#E2E8F0" strokeWidth="0.5" />
                    <line x1="0" y1="0" x2="0" y2="20" stroke="#E2E8F0" strokeWidth="0.5" />
                  </pattern>
                </defs>

                {/* Subtle Campus Grid Background */}
                <rect width="760" height="280" fill="url(#campusGrid)" opacity="0.4" />

                {/* --- CAMPUS ROAD NETWORK (White Avenues with Clear Curvature) --- */}
                {/* Horizontal: North Parkway Boulevard (y = 65, height = 28) */}
                <rect x="0" y="51" width="760" height="28" fill="#FFFFFF" />
                <line x1="0" y1="65" x2="760" y2="65" stroke="#CBD5E1" strokeWidth="1.5" strokeDasharray="8 6" />
                <text x="380" y="61" fill="#94A3B8" fontSize="8" fontWeight="800" textAnchor="middle" letterSpacing="1.2">
                  NORTH PARKWAY BOULEVARD
                </text>

                {/* Horizontal: South Main Transit Corridor (y = 190, height = 30) */}
                <rect x="0" y="175" width="760" height="30" fill="#FFFFFF" />
                <line x1="0" y1="190" x2="760" y2="190" stroke="#CBD5E1" strokeWidth="1.5" strokeDasharray="8 6" />
                <text x="380" y="186" fill="#94A3B8" fontSize="8" fontWeight="800" textAnchor="middle" letterSpacing="1.2">
                  SOUTH CAMPUS TRANSIT ARTERY
                </text>

                {/* Vertical: West Avenue (x = 160, width = 28) */}
                <rect x="146" y="0" width="28" height="280" fill="#FFFFFF" />
                <line x1="160" y1="0" x2="160" y2="280" stroke="#CBD5E1" strokeWidth="1.5" strokeDasharray="8 6" />

                {/* Vertical: Central Avenue (x = 380, width = 24) */}
                <rect x="368" y="0" width="24" height="280" fill="#FFFFFF" />
                <line x1="380" y1="0" x2="380" y2="280" stroke="#CBD5E1" strokeWidth="1.5" strokeDasharray="8 6" />

                {/* Vertical: East Avenue (x = 600, width = 28) */}
                <rect x="586" y="0" width="28" height="280" fill="#FFFFFF" />
                <line x1="600" y1="0" x2="600" y2="280" stroke="#CBD5E1" strokeWidth="1.5" strokeDasharray="8 6" />

                {/* --- ROW 1 BUILDINGS (North Side, y=14 to y=46) --- */}
                <rect x="25" y="14" width="112" height="32" rx="6" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1.5" />
                <text x="81" y="34" fill="#475569" fontSize="9" fontWeight="800" textAnchor="middle">CENTRAL LIBRARY</text>

                <rect x="185" y="14" width="175" height="32" rx="6" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1.5" />
                <text x="272" y="34" fill="#475569" fontSize="9" fontWeight="800" textAnchor="middle">SCIENCE & RESEARCH</text>

                <rect x="402" y="14" width="175" height="32" rx="6" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1.5" />
                <text x="489" y="34" fill="#475569" fontSize="9" fontWeight="800" textAnchor="middle">ACADEMIC COMPLEX</text>

                <rect x="625" y="14" width="110" height="32" rx="6" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1.5" />
                <text x="680" y="34" fill="#475569" fontSize="9" fontWeight="800" textAnchor="middle">SPORTS ARENA</text>

                {/* --- ROW 2 BUILDINGS (Central Sector, y=86 to y=168) --- */}
                {/* Innovation Labs */}
                <rect x="25" y="86" width="112" height="82" rx="8" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1.5" />
                <rect x="25" y="86" width="112" height="18" rx="8" fill="#F8FAFC" />
                <text x="81" y="99" fill="#64748B" fontSize="8" fontWeight="700" textAnchor="middle">FACILITY 01</text>
                <text x="81" y="132" fill="#334155" fontSize="9.5" fontWeight="800" textAnchor="middle">INNOVATION LAB</text>

                {/* Tech Quad (Safely Positioned in Sector B) */}
                <rect x="185" y="86" width="175" height="82" rx="8" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1.5" />
                <rect x="185" y="86" width="175" height="18" rx="8" fill="#F8FAFC" />
                <text x="272" y="99" fill="#64748B" fontSize="8" fontWeight="700" textAnchor="middle">SECTOR B</text>
                <text x="272" y="132" fill="#20346B" fontSize="10" fontWeight="800" textAnchor="middle">TECH QUAD & INCUBATOR</text>

                {/* Central Green Commons / Lawn */}
                <rect x="402" y="86" width="175" height="82" rx="8" fill="#ECFDF5" stroke="#A7F3D0" strokeWidth="1.5" />
                <rect x="402" y="86" width="175" height="18" rx="8" fill="#D1FAE5" />
                <text x="489" y="99" fill="#047857" fontSize="8" fontWeight="800" textAnchor="middle">ECOLOGY PARK</text>
                <text x="489" y="132" fill="#065F46" fontSize="9.5" fontWeight="800" textAnchor="middle">CENTRAL GREEN COMMONS</text>

                {/* Student Union */}
                <rect x="625" y="86" width="110" height="82" rx="8" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1.5" />
                <rect x="625" y="86" width="110" height="18" rx="8" fill="#F8FAFC" />
                <text x="680" y="99" fill="#64748B" fontSize="8" fontWeight="700" textAnchor="middle">SECTOR D</text>
                <text x="680" y="132" fill="#334155" fontSize="9.5" fontWeight="800" textAnchor="middle">STUDENT UNION</text>

                {/* --- ROW 3 BUILDINGS (South Sector, y=212 to y=268) --- */}
                {/* Origin Hub */}
                <rect x="25" y="214" width="112" height="52" rx="8" fill="#F8FAFC" stroke="#20346B" strokeWidth="1.8" />
                <text x="81" y="238" fill="#20346B" fontSize="10" fontWeight="900" textAnchor="middle">TRUESIGHTS HUB</text>
                <text x="81" y="254" fill="#64748B" fontSize="8" fontWeight="700" textAnchor="middle">Dispatch Origin</text>

                {/* Logistics Desk B */}
                <rect x="185" y="214" width="175" height="52" rx="8" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1.5" />
                <text x="272" y="244" fill="#475569" fontSize="9.5" fontWeight="800" textAnchor="middle">REGIONAL SORTING B</text>

                {/* Science Hall */}
                <rect x="402" y="214" width="175" height="52" rx="8" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1.5" />
                <text x="489" y="244" fill="#475569" fontSize="9.5" fontWeight="800" textAnchor="middle">CAMPUS COMMONS</text>

                {/* Destination: Hostel Quad 4 */}
                <rect x="625" y="214" width="110" height="52" rx="8" fill="#EFF6FF" stroke="#3B82F6" strokeWidth="2" />
                <text x="680" y="238" fill="#1E40AF" fontSize="10" fontWeight="900" textAnchor="middle">HOSTEL QUAD 4</text>
                <text x="680" y="254" fill="#3B82F6" fontSize="8" fontWeight="700" textAnchor="middle">Target Destination</text>

                {/* --- ANIMATED ROAD ROUTE (STRICTLY ON STREETS WITH ROUNDED CORNERS) --- */}
                {/* Route path strictly follows street centerlines:
                    (75, 190) -> (160, 190) -> (160, 65) -> (600, 65) -> (600, 190) -> (670, 190)
                    Uses quadratic bezier curves at turns to stay on asphalt. Never touches buildings! */}
                <path
                  d="M 75 190 L 145 190 Q 160 190 160 175 L 160 80 Q 160 65 175 65 L 585 65 Q 600 65 600 80 L 600 175 Q 600 190 615 190 L 670 190"
                  fill="none"
                  stroke="url(#cleanRoute)"
                  strokeWidth="5.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray="12 6"
                  style={{ animation: 'dashMoveClean 1.2s linear infinite' }}
                />

                {/* Origin Hub Pin */}
                <g transform="translate(65, 172)">
                  <circle cx="10" cy="18" r="13" fill="#20346B" stroke="#FEE047" strokeWidth="2.5" />
                  <text x="10" y="22" fill="#FFFFFF" fontSize="8.5" fontWeight="900" textAnchor="middle">HUB</text>
                </g>

                {/* Destination Pin with Pulsing Beacon */}
                <g transform="translate(660, 172)">
                  <circle cx="10" cy="18" r="22" fill="none" stroke="#2563EB" strokeWidth="2" opacity="0.6" style={{ animation: 'beaconPulse 1.5s infinite' }} />
                  <circle cx="10" cy="18" r="14" fill="#FEE047" stroke="#101D3B" strokeWidth="2.5" />
                  <circle cx="10" cy="18" r="5" fill="#DC2626" />
                </g>
              </svg>

              {/* Moving Courier Bike Marker Along Accurate Street Waypoints */}
              <div
                style={{
                  position: 'absolute',
                  top: '173px',
                  left: '58px',
                  animation: 'bikeRideMapRealistic 4s cubic-bezier(0.4, 0, 0.2, 1) forwards',
                  zIndex: 6
                }}
              >
                <div
                  style={{
                    background: '#20346B',
                    border: '2.5px solid #FEE047',
                    borderRadius: '50%',
                    width: '34px',
                    height: '34px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 14px rgba(32, 52, 107, 0.35)'
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FEE047" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="5.5" cy="17.5" r="3.5" />
                    <circle cx="18.5" cy="17.5" r="3.5" />
                    <path d="M15 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm-3 11.5V14l-3-3 4-3 2 3h3" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Structured 3-Card Logistics Status Deck Below Map */}
            <div
              style={{
                width: '100%',
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '12px',
                marginTop: '4px'
              }}
            >
              {/* Card 1: Logistics Window */}
              <div
                style={{
                  background: '#FFFFFF',
                  border: '1.5px solid #E2E8F0',
                  borderRadius: '10px',
                  padding: '12px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  boxShadow: '0 2px 6px rgba(0, 0, 0, 0.02)'
                }}
              >
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    background: '#EFF6FF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#2563EB',
                    flexShrink: 0
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                </div>
                <div style={{ overflow: 'hidden' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Delivery Timeline
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: '#101D3B', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                    3 to 4 Working Days
                  </div>
                </div>
              </div>

              {/* Card 2: Transit Status */}
              <div
                style={{
                  background: '#FFFFFF',
                  border: '1.5px solid #E2E8F0',
                  borderRadius: '10px',
                  padding: '12px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  boxShadow: '0 2px 6px rgba(0, 0, 0, 0.02)'
                }}
              >
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    background: '#F0FDF4',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#16A34A',
                    flexShrink: 0
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                </div>
                <div style={{ overflow: 'hidden' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Transit Status
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: '#16A34A', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                    In Transit &bull; Active Courier
                  </div>
                </div>
              </div>

              {/* Card 3: Destination Address */}
              <div
                style={{
                  background: '#FFFFFF',
                  border: '1.5px solid #E2E8F0',
                  borderRadius: '10px',
                  padding: '12px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  boxShadow: '0 2px 6px rgba(0, 0, 0, 0.02)'
                }}
              >
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    background: '#FEF9C3',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#854D0E',
                    flexShrink: 0
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                </div>
                <div style={{ overflow: 'hidden' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Delivery Target
                  </div>
                  <div
                    style={{ fontSize: '13px', fontWeight: 800, color: '#101D3B', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}
                    title={order.shipping?.deliveryAddress}
                  >
                    {order.shipping?.deliveryAddress || 'Hostel Quad 4'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      )}

        {/* ============================================================ */}
        {/* STAGE 4: CONFIRMED & IN PROGRESS (NOT INSTANT DELIVERED!)     */}
        {/* ============================================================ */}
        {activeStage === 4 && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '14px',
              animation: 'scaleUpClean 0.35s ease',
              textAlign: 'center',
              width: '100%',
              maxWidth: '540px',
              zIndex: 2,
              marginTop: '8px'
            }}
          >
            {/* Grand Order Confirmed Badge in Navy/Blue */}
            <div
              style={{
                width: '70px',
                height: '70px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #20346B 0%, #101D3B 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FEE047',
                boxShadow: '0 8px 24px rgba(32, 52, 107, 0.25)',
                border: '3px solid #FEE047'
              }}
            >
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div
                style={{
                  background: '#EFF6FF',
                  border: '1px solid #BFDBFE',
                  borderRadius: '20px',
                  padding: '3px 14px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  margin: '0 auto'
                }}
              >
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#2563EB', animation: 'pulseDot 1.2s infinite' }}></div>
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#1E40AF', letterSpacing: '0.04em' }}>
                  ORDER CONFIRMED · DELIVERY IN PROGRESS
                </span>
              </div>

              <h2 style={{ fontSize: '21px', fontWeight: 900, color: '#101D3B', margin: 0, letterSpacing: '-0.01em' }}>
                Acquisition Confirmed &amp; In Transit!
              </h2>
              <span style={{ fontSize: '13px', color: '#64748B', lineHeight: '20px' }}>
                Your order for <strong>{order.title}</strong> has been registered and scheduled for courier dispatch.
              </span>
            </div>

            {/* Prominent Estimated Delivery Window Card */}
            <div
              style={{
                width: '100%',
                background: '#F0FDF4',
                border: '1.5px solid #86EFAC',
                borderRadius: '10px',
                padding: '12px 18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: '#10B981',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#FFFFFF'
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', textAlign: 'left' }}>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: '#15803D' }}>ESTIMATED DELIVERY</span>
                  <span style={{ fontSize: '13px', fontWeight: 800, color: '#101D3B' }}>3 to 4 Working Days</span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', textAlign: 'right' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#15803D' }}>SECURITY PROTOCOL</span>
                <span style={{ fontSize: '12px', color: '#166534', fontWeight: 600 }}>OTP Handover at Hostel</span>
              </div>
            </div>

            {/* Official TrueSights Order Summary Card */}
            <div
              style={{
                width: '100%',
                background: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '12px',
                padding: '14px 18px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)'
              }}
            >
              {/* Product Info Row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid #F1F5F9', paddingBottom: '10px' }}>
                <img
                  src={order.image}
                  alt={order.title}
                  style={{
                    width: '48px',
                    height: '48px',
                    objectFit: 'contain',
                    background: '#F8FAFC',
                    borderRadius: '8px',
                    padding: '4px',
                    border: '1px solid #E2E8F0'
                  }}
                />
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', flex: 1 }}>
                  <span style={{ fontSize: '13px', fontWeight: 800, color: '#101D3B' }}>{order.title}</span>
                  <span style={{ fontSize: '12px', color: '#64748B' }}>Option: <strong>{order.option}</strong></span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                  <span style={{ fontSize: '10px', color: '#94A3B8', fontWeight: 700 }}>POINTS PAID</span>
                  <span style={{ fontSize: '14px', fontWeight: 900, color: '#10B981' }}>-{order.points} PTS</span>
                </div>
              </div>

              {/* Order Meta details */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '12px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                  <span style={{ color: '#94A3B8', fontSize: '10px', fontWeight: 700 }}>TRACKING NUMBER</span>
                  <span style={{ color: '#20346B', fontWeight: 800 }}>{order.id}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                  <span style={{ color: '#94A3B8', fontSize: '10px', fontWeight: 700 }}>DELIVERY STATUS</span>
                  <span style={{ color: '#2563EB', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#2563EB', animation: 'pulseDot 1.2s infinite' }}></span>
                    In Transit (3-4 Days)
                  </span>
                </div>
              </div>
            </div>

            {/* Navigation Actions */}
            <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? '8px' : '12px', width: '100%', marginTop: '4px' }}>
              <button
                type="button"
                onClick={onViewOrders}
                style={{
                  flex: isMobile ? 'none' : 1,
                  width: '100%',
                  height: '46px',
                  borderRadius: '8px',
                  background: '#20346B',
                  border: 'none',
                  color: '#FFFFFF',
                  fontSize: '14px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#284185';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#20346B';
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FEE047" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="1" y="3" width="15" height="13"></rect>
                  <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
                  <circle cx="5.5" cy="18.5" r="2.5"></circle>
                  <circle cx="18.5" cy="18.5" r="2.5"></circle>
                </svg>
                <span>Track My Orders</span>
              </button>

              <button
                type="button"
                onClick={onBackToCatalog}
                style={{
                  flex: isMobile ? 'none' : 1,
                  width: '100%',
                  height: '46px',
                  borderRadius: '8px',
                  background: '#FEE047',
                  border: 'none',
                  color: '#101D3B',
                  fontSize: '14px',
                  fontWeight: 900,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 12px rgba(254, 224, 71, 0.45)',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 6px 18px rgba(254, 224, 71, 0.6)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 14px rgba(254, 224, 71, 0.45)';
                }}
              >
                <span>Back to Rewards Catalog</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Embedded CSS Keyframes for Real Dynamic Animations */}
      <style>{`
        /* Stage 1: Cardboard Box Flaps Opening Up, Product Dropping In, Flaps Closing & Sealing */
        @keyframes flapLeftOpenAndClose {
          0% {
            transform: rotate(0deg);
          }
          15% {
            transform: rotate(-74deg);
          }
          55% {
            transform: rotate(-74deg);
          }
          75% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(0deg);
          }
        }

        @keyframes flapRightOpenAndClose {
          0% {
            transform: rotate(0deg);
          }
          18% {
            transform: rotate(74deg);
          }
          55% {
            transform: rotate(74deg);
          }
          72% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(0deg);
          }
        }

        @keyframes productDropInsideBox {
          0% {
            transform: translateY(-30px) scale(0.92);
            opacity: 0;
          }
          18% {
            transform: translateY(0px) scale(1);
            opacity: 1;
          }
          54% {
            transform: translateY(105px) scale(0.85);
            opacity: 1;
          }
          68% {
            transform: translateY(112px) scale(0.82);
            opacity: 0.85;
          }
          76%, 100% {
            transform: translateY(112px) scale(0.82);
            opacity: 0;
          }
        }

        @keyframes boxImpactSettle {
          0%, 48% {
            transform: scale(1);
          }
          55% {
            transform: scaleY(0.96) scaleX(1.02);
          }
          64% {
            transform: scaleY(1.01) scaleX(0.99);
          }
          72%, 100% {
            transform: scale(1);
          }
        }

        @keyframes sealingTapeApply {
          0%, 74% {
            opacity: 0;
            transform: scaleY(0);
          }
          82% {
            opacity: 1;
            transform: scaleY(0.5);
          }
          90%, 100% {
            opacity: 1;
            transform: scaleY(1);
          }
        }

        @keyframes verifiedStampPop {
          0%, 82% {
            opacity: 0;
            transform: scale(0.4);
          }
          90% {
            opacity: 1;
            transform: scale(1.15);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }

        /* Stage 2: Active Wheel Spin & Road Motion */
        @keyframes wheelRotationFast {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes roadDashRapid {
          from {
            stroke-dashoffset: 0;
          }
          to {
            stroke-dashoffset: -34;
          }
        }

        @keyframes bikeActiveBounce {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-4px) rotate(0.6deg);
          }
        }

        @keyframes windStreak1 {
          0% { transform: translateX(30px); opacity: 0; }
          50% { opacity: 0.8; }
          100% { transform: translateX(-30px); opacity: 0; }
        }

        @keyframes windStreak2 {
          0% { transform: translateX(40px); opacity: 0; }
          50% { opacity: 0.9; }
          100% { transform: translateX(-40px); opacity: 0; }
        }

        @keyframes windStreak3 {
          0% { transform: translateX(20px); opacity: 0; }
          50% { opacity: 0.7; }
          100% { transform: translateX(-20px); opacity: 0; }
        }

        /* Stage 3: Realistic Map Transit strictly following street network */
        @keyframes bikeRideMapRealistic {
          0% {
            transform: translate(0px, 0px);
          }
          16% {
            transform: translate(85px, 0px);
          }
          40% {
            transform: translate(85px, -125px);
          }
          70% {
            transform: translate(525px, -125px);
          }
          88% {
            transform: translate(525px, 0px);
          }
          100% {
            transform: translate(595px, 0px);
          }
        }

        @keyframes bikeRideMapMobile {
          0% {
            transform: translate(0px, 0px);
          }
          25% {
            transform: translate(88px, 0px);
          }
          60% {
            transform: translate(88px, -106px);
          }
          100% {
            transform: translate(228px, -106px);
          }
        }

        @keyframes pulseDot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.35; transform: scale(0.8); }
        }

        @keyframes beaconPulse {
          0% { transform: scale(0.7); opacity: 1; }
          100% { transform: scale(1.6); opacity: 0; }
        }

        @keyframes dashMoveClean {
          to {
            stroke-dashoffset: -36;
          }
        }

        @keyframes fadeInClean {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes scaleUpClean {
          from { transform: scale(0.92); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
