import React, { useState } from 'react';

export default function WishlistCartPage({
  wishlistIds = [],
  catalog = [],
  pointsWallet = 161,
  onBackToCatalog,
  onToggleWishlist,
  onOpenProduct,
  onProceedToRedeem,
  ordersCount = 0,
  onOpenOrders,
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

  const wishedProducts = catalog.filter((item) => wishlistIds.includes(item.id));
  const totalPointsNeeded = wishedProducts.reduce((sum, item) => sum + item.points, 0);
  const remainingPoints = pointsWallet - totalPointsNeeded;

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
        {/* Mobile Top Header */}
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
            <span style={{ fontSize: '15px', fontWeight: 800, color: '#FFFFFF' }}>Saved Wishlist</span>
          </div>

          <div
            style={{
              background: '#FEE047',
              color: '#101D3B',
              borderRadius: '16px',
              padding: '3px 9px',
              fontSize: '11px',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="#101D3B">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            <span>{pointsWallet} PTS</span>
          </div>
        </div>

        {/* Empty State */}
        {wishedProducts.length === 0 ? (
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
                background: '#FFF1F2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#E11D48'
              }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#E11D48" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
              </svg>
            </div>
            <span style={{ fontSize: '15px', fontWeight: 800, color: '#101D3B' }}>
              Your Wishlist is Empty
            </span>
            <p style={{ fontSize: '12px', color: '#64748B', margin: 0, maxWidth: '280px', lineHeight: '18px' }}>
              Heart any campus rewards in the vault to save them here for easy redemption.
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
              Explore Rewards
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {/* Header info */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 2px' }}>
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase' }}>
                {wishedProducts.length} SAVED ITEMS
              </span>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#20346B' }}>
                Total: {totalPointsNeeded} PTS
              </span>
            </div>

            {/* List of items */}
            {wishedProducts.map((item) => {
              const canAffordItem = pointsWallet >= item.points;

              return (
                <div
                  key={item.id}
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    borderRadius: '12px',
                    padding: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.03)'
                  }}
                >
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <div
                      onClick={() => onOpenProduct(item)}
                      style={{
                        width: '56px',
                        height: '56px',
                        background: '#F8FAFC',
                        borderRadius: '8px',
                        border: '1px solid #E2E8F0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '4px',
                        flexShrink: 0,
                        cursor: 'pointer'
                      }}
                    >
                      <img
                        src={item.image}
                        alt={item.title}
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                      />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1, minWidth: 0 }}>
                      <span style={{ fontSize: '9px', fontWeight: 800, color: '#4B7EE8', textTransform: 'uppercase' }}>
                        {item.categoryLabel}
                      </span>
                      <span
                        onClick={() => onOpenProduct(item)}
                        style={{
                          fontSize: '13px',
                          fontWeight: 800,
                          color: '#101D3B',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          cursor: 'pointer'
                        }}
                      >
                        {item.title}
                      </span>
                      <span style={{ fontSize: '12px', fontWeight: 800, color: '#20346B' }}>
                        {item.points} PTS
                      </span>
                    </div>
                  </div>

                  {/* Actions Row */}
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={() => onToggleWishlist(item.id)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '6px',
                        border: '1px solid #FECDD3',
                        background: '#FFF1F2',
                        color: '#E11D48',
                        fontSize: '11px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                      <span>Remove</span>
                    </button>

                    <button
                      type="button"
                      disabled={!canAffordItem}
                      onClick={() => onProceedToRedeem(item, item.options?.choices?.[0] || 'Standard')}
                      style={{
                        flex: 1,
                        height: '32px',
                        borderRadius: '6px',
                        border: 'none',
                        background: canAffordItem ? '#FEE047' : '#E2E8F0',
                        color: canAffordItem ? '#101D3B' : '#94A3B8',
                        fontSize: '12px',
                        fontWeight: 800,
                        cursor: canAffordItem ? 'pointer' : 'not-allowed',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '4px'
                      }}
                    >
                      <span>{canAffordItem ? 'Redeem Item' : `Need ${item.points - pointsWallet} PTS`}</span>
                    </button>
                  </div>
                </div>
              );
            })}

            {/* Total Points summary box */}
            <div
              style={{
                background: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '12px',
                padding: '12px 14px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
              }}
            >
              <div>
                <span style={{ display: 'block', fontSize: '11px', color: '#64748B' }}>Total Required</span>
                <span style={{ fontSize: '15px', fontWeight: 800, color: '#20346B' }}>{totalPointsNeeded} PTS</span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ display: 'block', fontSize: '11px', color: '#64748B' }}>Your Balance</span>
                <span style={{ fontSize: '15px', fontWeight: 800, color: '#10B981' }}>{pointsWallet} PTS</span>
              </div>
            </div>
          </div>
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
        gap: '12px',
        overflow: 'hidden',
        fontFamily: 'var(--font-primary, "Plus Jakarta Sans", sans-serif)'
      }}
    >
      {/* 1. TOP HEADER & BREADCRUMB BAR */}
      <div
        style={{
          background: '#243367',
          borderRadius: '12px',
          padding: '12px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          boxShadow: '0 4px 14px rgba(36, 51, 103, 0.12)',
          flexShrink: 0
        }}
      >
        {/* Left: Back to Catalog & Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <button
            type="button"
            onClick={onBackToCatalog}
            aria-label="Back to Rewards Catalog"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: '#FFFFFF',
              border: 'none',
              borderRadius: '8px',
              padding: '7px 14px',
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

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#D6E1F9', fontSize: '13px' }}>
            <span>Rewards</span>
            <span style={{ opacity: 0.6 }}>/</span>
            <span style={{ fontWeight: 700, color: '#FFFFFF' }}>Wishlist &amp; Saved Cart</span>
          </div>
        </div>

        {/* Right: Point Balance & Track Orders */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            type="button"
            onClick={onOpenOrders}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(255, 255, 255, 0.12)',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              borderRadius: '8px',
              padding: '7px 14px',
              fontSize: '12px',
              fontWeight: 700,
              color: '#FFFFFF',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.22)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)';
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FEE047" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="1" y="3" width="15" height="13"></rect>
              <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
              <circle cx="5.5" cy="18.5" r="2.5"></circle>
              <circle cx="18.5" cy="18.5" r="2.5"></circle>
            </svg>
            <span>Track Orders</span>
            {ordersCount > 0 && (
              <span
                style={{
                  background: '#FEE047',
                  color: '#101D3B',
                  borderRadius: '10px',
                  padding: '1px 6px',
                  fontSize: '10px',
                  fontWeight: 800
                }}
              >
                {ordersCount}
              </span>
            )}
          </button>

          {/* Points Wallet Tag */}
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.14)',
              border: '1px solid rgba(254, 224, 71, 0.4)',
              borderRadius: '8px',
              padding: '6px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="#FEE047">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            <span style={{ fontSize: '13px', fontWeight: 800, color: '#FFFFFF' }}>
              {pointsWallet} PTS
            </span>
          </div>
        </div>
      </div>

      {/* 2. MAIN SCROLLABLE CONTENT SURFACE */}
      <div
        style={{
          flex: 1,
          minHeight: 0,
          background: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: '12px',
          padding: '18px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          overflowY: 'auto',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)'
        }}
      >
        {/* Wishlist Header Summary Card */}
        <div
          style={{
            background: 'linear-gradient(180deg, #F8FAFC 0%, #FFFFFF 100%)',
            border: '1.5px solid #E2E8F0',
            borderRadius: '12px',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '20px',
            flexWrap: 'wrap'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '10px',
                background: '#FFF1F2',
                border: '1.5px solid #FECDD3',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#E11D48',
                boxShadow: '0 2px 8px rgba(225, 29, 72, 0.15)'
              }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="#E11D48" stroke="#E11D48" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
              </svg>
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#101D3B', margin: 0 }}>
                  Wished Rewards &amp; Cart
                </h2>
                <span
                  style={{
                    background: '#EFF6FF',
                    color: '#2563EB',
                    borderRadius: '100px',
                    padding: '2px 8px',
                    fontSize: '11px',
                    fontWeight: 800,
                    border: '1px solid #BFDBFE'
                  }}
                >
                  {wishedProducts.length} Saved
                </span>
              </div>
              <p style={{ fontSize: '12px', color: '#64748B', margin: '4px 0 0 0' }}>
                Products you have marked with the heart icon. Redeem anytime with zero cash required.
              </p>
            </div>
          </div>

          {/* Cart Point Metrics */}
          {wishedProducts.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase' }}>
                  Total Points Needed
                </div>
                <div style={{ fontSize: '20px', fontWeight: 900, color: '#20346B', lineHeight: '24px' }}>
                  {totalPointsNeeded} PTS
                </div>
              </div>

              <div
                style={{
                  height: '36px',
                  width: '1px',
                  background: '#CBD5E1'
                }}
              />

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase' }}>
                  Wallet Balance
                </div>
                <div
                  style={{
                    fontSize: '16px',
                    fontWeight: 800,
                    color: remainingPoints >= 0 ? '#10B981' : '#DC2626',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <span>{pointsWallet} PTS</span>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748B' }}>
                    ({remainingPoints >= 0 ? `+${remainingPoints} left` : `${Math.abs(remainingPoints)} short`})
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Empty State vs Products Grid */}
        {wishedProducts.length === 0 ? (
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '16px',
              padding: '60px 20px',
              textAlign: 'center'
            }}
          >
            <div
              style={{
                width: '74px',
                height: '74px',
                borderRadius: '50%',
                background: '#FFF1F2',
                border: '2px dashed #FECDD3',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#E11D48'
              }}
            >
              <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
              </svg>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxWidth: '380px' }}>
              <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#101D3B', margin: 0 }}>
                Your Wishlist Cart is Empty
              </h3>
              <p style={{ fontSize: '13px', color: '#64748B', margin: 0, lineHeight: '18px' }}>
                Tap the heart icon on any reward in the catalog to pin it to your saved cart for instant access and quick redemption.
              </p>
            </div>
            <button
              type="button"
              onClick={onBackToCatalog}
              style={{
                marginTop: '8px',
                height: '42px',
                padding: '0 22px',
                borderRadius: '8px',
                border: 'none',
                background: '#20346B',
                color: '#FFFFFF',
                fontSize: '13px',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 12px rgba(32, 52, 107, 0.2)',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#101D3B';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#20346B';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <span>Explore Rewards Catalog</span>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </button>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '16px',
              alignContent: 'start',
              paddingBottom: '20px'
            }}
          >
            {wishedProducts.map((item) => {
              const canAfford = pointsWallet >= item.points;

              return (
                <div
                  key={item.id}
                  style={{
                    background: '#FFFFFF',
                    border: '1.5px solid #E2E8F0',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                    transition: 'all 0.2s ease',
                    position: 'relative'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#20346B';
                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(32, 52, 107, 0.1)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#E2E8F0';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.04)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  {/* Top Preview Area */}
                  <div
                    style={{
                      height: '170px',
                      background: '#F8FAFC',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                      borderBottom: '1px solid #E2E8F0'
                    }}
                  >
                    {/* Points Badge */}
                    <div
                      style={{
                        position: 'absolute',
                        top: '12px',
                        left: '12px',
                        background: '#20346B',
                        borderRadius: '6px',
                        padding: '4px 9px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                        boxShadow: '0 2px 6px rgba(32, 52, 107, 0.25)',
                        zIndex: 2
                      }}
                    >
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="#FEE047">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                      <span style={{ fontSize: '11px', fontWeight: 800, color: '#FFFFFF', letterSpacing: '0.04em' }}>
                        {item.points} PTS
                      </span>
                    </div>

                    {/* Top Right Controls: Category Tag + Remove Heart Button */}
                    <div
                      style={{
                        position: 'absolute',
                        top: '12px',
                        right: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        zIndex: 2
                      }}
                    >
                      <span
                        style={{
                          background: 'rgba(255, 255, 255, 0.95)',
                          border: '1px solid #D6E1F9',
                          borderRadius: '5px',
                          padding: '3px 8px',
                          fontSize: '10px',
                          fontWeight: 800,
                          color: '#20346B',
                          letterSpacing: '0.04em'
                        }}
                      >
                        {item.categoryLabel}
                      </span>

                      {/* Heart Toggle Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleWishlist(item.id);
                        }}
                        title="Remove from wishlist"
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          background: '#FFF1F2',
                          border: '1.5px solid #FECDD3',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          color: '#E11D48',
                          boxShadow: '0 2px 6px rgba(225, 29, 72, 0.15)',
                          transition: 'all 0.15s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'scale(1.12)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'scale(1)';
                        }}
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="#E11D48" stroke="#E11D48" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                        </svg>
                      </button>
                    </div>

                    <img
                      src={item.image}
                      alt={item.title}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: item.id === 'rew-1' ? 'cover' : 'contain',
                        padding: item.id === 'rew-1' ? 0 : '10px',
                        display: 'block'
                      }}
                    />
                  </div>

                  {/* Card Content & Action Area */}
                  <div
                    style={{
                      padding: '16px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      flex: 1,
                      gap: '12px'
                    }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 800,
                            padding: '2px 8px',
                            borderRadius: '100px',
                            background: canAfford ? '#F0FDF4' : '#FEF3C7',
                            color: canAfford ? '#16A34A' : '#B45309',
                            border: canAfford ? '1px solid #BBF7D0' : '1px solid #FDE68A'
                          }}
                        >
                          {canAfford ? 'Available to Redeem' : `Need ${item.points - pointsWallet} more PTS`}
                        </span>
                      </div>

                      <h3
                        style={{
                          fontSize: '14px',
                          fontWeight: 800,
                          color: '#101D3B',
                          margin: 0,
                          lineHeight: '18px',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}
                      >
                        {item.title}
                      </h3>
                      <p
                        style={{
                          fontSize: '11.5px',
                          color: '#64748B',
                          margin: 0,
                          lineHeight: '16px',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}
                      >
                        {item.description}
                      </p>
                    </div>

                    {/* Dual Action Buttons: Quick Redeem + Inspect */}
                    <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                      <button
                        type="button"
                        onClick={() => onOpenProduct(item)}
                        style={{
                          flex: 1,
                          height: '38px',
                          borderRadius: '6px',
                          border: '1.5px solid #CBD5E1',
                          background: '#FFFFFF',
                          color: '#20346B',
                          fontSize: '12px',
                          fontWeight: 800,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.15s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = '#20346B';
                          e.currentTarget.style.background = '#F8FAFC';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = '#CBD5E1';
                          e.currentTarget.style.background = '#FFFFFF';
                        }}
                      >
                        Details
                      </button>

                      <button
                        type="button"
                        onClick={() => onProceedToRedeem(item, item.options?.choices?.[0] || 'Standard')}
                        style={{
                          flex: 2,
                          height: '38px',
                          borderRadius: '6px',
                          border: 'none',
                          background: canAfford ? '#FEE047' : '#E2E8F0',
                          color: canAfford ? '#101D3B' : '#94A3B8',
                          fontSize: '12.5px',
                          fontWeight: 900,
                          cursor: canAfford ? 'pointer' : 'not-allowed',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          boxShadow: canAfford ? '0 2px 8px rgba(254, 224, 71, 0.4)' : 'none',
                          transition: 'all 0.15s ease'
                        }}
                        onMouseEnter={(e) => {
                          if (canAfford) {
                            e.currentTarget.style.boxShadow = '0 4px 14px rgba(254, 224, 71, 0.6)';
                            e.currentTarget.style.transform = 'translateY(-1px)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (canAfford) {
                            e.currentTarget.style.boxShadow = '0 2px 8px rgba(254, 224, 71, 0.4)';
                            e.currentTarget.style.transform = 'translateY(0)';
                          }
                        }}
                      >
                        <span>Redeem Now</span>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="5" y1="12" x2="19" y2="12"></line>
                          <polyline points="12 5 19 12 12 19"></polyline>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
