import React, { useState } from 'react';

export default function ProductDetailPage({
  product,
  pointsWallet = 161,
  onBack,
  onProceedToRedeem,
  ordersCount = 0,
  onOpenOrders,
  wishlistIds = [],
  onToggleWishlist,
  onOpenWishlist,
  isMobile: propIsMobile
}) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState(
    product?.options?.choices?.[0] || 'Standard'
  );

  const [internalIsMobile, setInternalIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  );

  React.useEffect(() => {
    const handleResize = () => setInternalIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = propIsMobile !== undefined ? propIsMobile : internalIsMobile;

  const isWished = wishlistIds.includes(product?.id);
  const imagesList = product?.images && product.images.length > 0
    ? product.images
    : [product?.image, product?.image, product?.image];

  const currentImage = imagesList[activeImageIndex] || product?.image;
  const canAfford = pointsWallet >= (product?.points || 0);

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
          paddingBottom: '86px'
        }}
      >
        {/* 1. Mobile Top Branded App Bar */}
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
          {/* Back Button */}
          <button
            type="button"
            onClick={onBack}
            aria-label="Back to rewards"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: '#FFFFFF',
              border: 'none',
              borderRadius: '8px',
              padding: '6px 12px',
              fontSize: '12px',
              fontWeight: 700,
              color: '#20346B',
              cursor: 'pointer',
              boxShadow: '0 1px 4px rgba(0,0,0,0.1)'
            }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            <span>Back</span>
          </button>

          {/* Points Balance Chip */}
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

          {/* Right Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              onClick={onOpenWishlist}
              aria-label="Wishlist Cart"
              style={{
                position: 'relative',
                width: '34px',
                height: '34px',
                borderRadius: '8px',
                background: 'rgba(255, 255, 255, 0.15)',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                padding: 0
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill={wishlistIds.length > 0 ? '#FEE047' : 'none'} stroke={wishlistIds.length > 0 ? '#FEE047' : '#FFFFFF'} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
              </svg>
              {wishlistIds.length > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: '-4px',
                    right: '-4px',
                    background: '#FEE047',
                    color: '#101D3B',
                    borderRadius: '10px',
                    minWidth: '15px',
                    height: '15px',
                    padding: '0 3px',
                    fontSize: '9px',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {wishlistIds.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={onOpenOrders}
              aria-label="Track Orders"
              style={{
                position: 'relative',
                width: '34px',
                height: '34px',
                borderRadius: '8px',
                background: 'rgba(255, 255, 255, 0.15)',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                padding: 0
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#FEE047" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="1" y="3" width="15" height="13"></rect>
                <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
                <circle cx="5.5" cy="18.5" r="2.5"></circle>
                <circle cx="18.5" cy="18.5" r="2.5"></circle>
              </svg>
              {ordersCount > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: '-4px',
                    right: '-4px',
                    background: '#FEE047',
                    color: '#101D3B',
                    borderRadius: '10px',
                    minWidth: '15px',
                    height: '15px',
                    padding: '0 3px',
                    fontSize: '9px',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {ordersCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* 2. Hero Image Stage with Angle Thumbnails */}
        <div
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
          {/* Main Visual Display */}
          <div
            style={{
              height: '210px',
              background: '#F8FAFC',
              borderRadius: '10px',
              border: '1px solid #F1F5F9',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden'
            }}
          >
            {/* Points Badge (Top Left) */}
            <div
              style={{
                position: 'absolute',
                top: '10px',
                left: '10px',
                background: '#20346B',
                borderRadius: '6px',
                padding: '4px 9px',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                zIndex: 2,
                boxShadow: '0 2px 6px rgba(32, 52, 107, 0.25)'
              }}
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="#FEE047">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#FFFFFF' }}>
                {product.points} PTS
              </span>
            </div>

            {/* Top Right Wishlist Heart */}
            <button
              type="button"
              onClick={() => onToggleWishlist && onToggleWishlist(product.id)}
              aria-label={isWished ? 'Remove from wishlist' : 'Add to wishlist'}
              style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: isWished ? '#FFF1F2' : 'rgba(255, 255, 255, 0.95)',
                border: isWished ? '1.5px solid #FECDD3' : '1px solid #CBD5E1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                zIndex: 2,
                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.08)'
              }}
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill={isWished ? '#E11D48' : 'none'}
                stroke={isWished ? '#E11D48' : '#64748B'}
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
              </svg>
            </button>

            {/* Hero Image */}
            <img
              src={currentImage}
              alt={product.title}
              style={{
                width: '100%',
                height: '100%',
                maxHeight: '190px',
                objectFit: 'contain',
                display: 'block'
              }}
            />
          </div>

          {/* 3 Angle Thumbnails */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '8px'
            }}
          >
            {imagesList.map((thumbUrl, idx) => {
              const isSelected = activeImageIndex === idx;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveImageIndex(idx)}
                  style={{
                    background: '#F8FAFC',
                    border: isSelected ? '2px solid #20346B' : '1px solid #E2E8F0',
                    borderRadius: '8px',
                    padding: '4px',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '2px'
                  }}
                >
                  <img
                    src={thumbUrl}
                    alt={`${product.title} angle ${idx + 1}`}
                    style={{
                      width: '100%',
                      height: '42px',
                      objectFit: 'contain',
                      display: 'block'
                    }}
                  />
                  <span style={{ fontSize: '9px', fontWeight: 700, color: isSelected ? '#20346B' : '#64748B' }}>
                    View {idx + 1}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Product Info Card */}
        <div
          style={{
            background: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '12px',
            padding: '14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            boxShadow: '0 2px 6px rgba(0, 0, 0, 0.03)'
          }}
        >
          {/* Category & Status */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span
              style={{
                background: '#EBF2FE',
                color: '#20346B',
                fontSize: '10px',
                fontWeight: 800,
                padding: '3px 8px',
                borderRadius: '5px',
                letterSpacing: '0.04em',
                textTransform: 'uppercase'
              }}
            >
              {product.categoryLabel}
            </span>
            <span style={{ fontSize: '11px', fontWeight: 600, color: '#10B981', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981', display: 'inline-block' }}></span>
              In Stock · Ready for Dispatch
            </span>
          </div>

          {/* Title */}
          <h1
            style={{
              fontSize: '17px',
              fontWeight: 800,
              color: '#101D3B',
              margin: 0,
              lineHeight: '23px',
              letterSpacing: '-0.01em'
            }}
          >
            {product.title}
          </h1>

          {/* Points Price Banner */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 12px',
              background: '#F8FAFC',
              borderRadius: '8px',
              border: '1px solid #E2E8F0'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="#FEE047">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
              <span style={{ fontSize: '18px', fontWeight: 900, color: '#20346B' }}>
                {product.points} Points
              </span>
            </div>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#10B981' }}>
              100% Free Acquisition
            </span>
          </div>

          {/* About This Reward */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '10px', fontWeight: 700, color: '#94A3B8', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              ABOUT THIS REWARD
            </span>
            <p style={{ fontSize: '12px', lineHeight: '18px', color: '#475569', margin: 0 }}>
              {product.description}
            </p>
          </div>

          {/* Variant Selector */}
          {product.options && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span style={{ fontSize: '10px', fontWeight: 700, color: '#94A3B8', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                SELECT {product.options.type.toUpperCase()}: <span style={{ color: '#20346B' }}>{selectedChoice}</span>
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {product.options.choices.map((choice) => {
                  const isCurrent = selectedChoice === choice;
                  return (
                    <button
                      key={choice}
                      type="button"
                      onClick={() => setSelectedChoice(choice)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '6px',
                        border: isCurrent ? '2px solid #20346B' : '1px solid #CBD5E1',
                        background: isCurrent ? '#EBF2FE' : '#FFFFFF',
                        color: isCurrent ? '#20346B' : '#475569',
                        fontSize: '11px',
                        fontWeight: isCurrent ? 700 : 500,
                        cursor: 'pointer'
                      }}
                    >
                      {choice}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Campus Specs */}
          <div
            style={{
              background: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: '8px',
              padding: '10px 12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '11px' }}>
              <span style={{ color: '#64748B', fontWeight: 500 }}>Fulfillment Pickup:</span>
              <span style={{ color: '#101D3B', fontWeight: 700 }}>{product.pickupLocation}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '11px' }}>
              <span style={{ color: '#64748B', fontWeight: 500 }}>Specifications:</span>
              <span style={{ color: '#101D3B', fontWeight: 700 }}>{product.specifications}</span>
            </div>
          </div>
        </div>

        {/* 4. Sticky Mobile Bottom Action Bar */}
        <div
          style={{
            position: 'sticky',
            bottom: '12px',
            zIndex: 99,
            background: 'rgba(255, 255, 255, 0.98)',
            backdropFilter: 'blur(8px)',
            borderRadius: '12px',
            border: '1px solid #E2E8F0',
            padding: '10px 14px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.12)',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            marginTop: '8px'
          }}
        >
          {!canAfford && (
            <div
              style={{
                background: '#FEF2F2',
                border: '1px solid #FCA5A5',
                borderRadius: '6px',
                padding: '6px 10px',
                fontSize: '11px',
                color: '#B91C1C',
                fontWeight: 600,
                textAlign: 'center'
              }}
            >
              Need {product.points - pointsWallet} more points to redeem this item.
            </div>
          )}

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              onClick={() => onToggleWishlist && onToggleWishlist(product.id)}
              aria-label={isWished ? 'Remove from wishlist' : 'Add to wishlist'}
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '8px',
                border: isWished ? '1.5px solid #FECDD3' : '1.5px solid #CBD5E1',
                background: isWished ? '#FFF1F2' : '#FFFFFF',
                color: isWished ? '#E11D48' : '#64748B',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                flexShrink: 0
              }}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill={isWished ? '#E11D48' : 'none'}
                stroke={isWished ? '#E11D48' : 'currentColor'}
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
              </svg>
            </button>

            <button
              type="button"
              disabled={!canAfford}
              onClick={() => onProceedToRedeem(product, selectedChoice)}
              style={{
                flex: 1,
                height: '46px',
                borderRadius: '8px',
                border: 'none',
                background: canAfford ? '#FEE047' : '#E2E8F0',
                color: canAfford ? '#101D3B' : '#94A3B8',
                fontSize: '14px',
                fontWeight: 900,
                cursor: canAfford ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                boxShadow: canAfford ? '0 2px 8px rgba(254, 224, 71, 0.4)' : 'none'
              }}
            >
              <span>Proceed to Redeem ({product.points} PTS)</span>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </button>
          </div>
        </div>
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
      {/* 1. TOP HEADER & NAVIGATION BAR */}
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
        {/* Left: Back to Products + Breadcrumbs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <button
            type="button"
            onClick={onBack}
            aria-label="Back to products"
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
            <span>Back to Products</span>
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#D6E1F9', fontSize: '13px' }}>
            <span>Rewards</span>
            <span style={{ opacity: 0.6 }}>/</span>
            <span style={{ textTransform: 'capitalize' }}>{product.category}</span>
            <span style={{ opacity: 0.6 }}>/</span>
            <span style={{ fontWeight: 600, color: '#FFFFFF' }}>{product.title}</span>
          </div>
        </div>

        {/* Right: Wishlist Cart + Track My Orders + Points Wallet */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Wishlist Cart Header Button */}
          <button
            type="button"
            onClick={onOpenWishlist}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(255, 255, 255, 0.12)',
              border: '1px solid rgba(255, 255, 255, 0.22)',
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
            <svg width="15" height="15" viewBox="0 0 24 24" fill={wishlistIds.length > 0 ? '#FEE047' : 'none'} stroke={wishlistIds.length > 0 ? '#FEE047' : '#FFFFFF'} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
            </svg>
            <span>Wishlist Cart</span>
            {wishlistIds.length > 0 && (
              <span
                style={{
                  background: '#FEE047',
                  color: '#101D3B',
                  borderRadius: '10px',
                  padding: '1px 6px',
                  fontSize: '11px',
                  fontWeight: 800
                }}
              >
                {wishlistIds.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={onOpenOrders}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(255, 255, 255, 0.12)',
              border: '1px solid rgba(255, 255, 255, 0.22)',
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
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#FEE047" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="1" y="3" width="15" height="13"></rect>
              <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
              <circle cx="5.5" cy="18.5" r="2.5"></circle>
              <circle cx="18.5" cy="18.5" r="2.5"></circle>
            </svg>
            <span>Track My Orders</span>
            {ordersCount > 0 && (
              <span
                style={{
                  background: '#FEE047',
                  color: '#101D3B',
                  borderRadius: '10px',
                  padding: '1px 6px',
                  fontSize: '11px',
                  fontWeight: 800
                }}
              >
                {ordersCount}
              </span>
            )}
          </button>

          {/* Student Available Points Box */}
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '8px',
              padding: '6px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="#FEE047">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '15px', fontWeight: 800, color: '#20346B', lineHeight: '18px' }}>
                {pointsWallet} PTS
              </span>
              <span style={{ fontSize: '9px', fontWeight: 700, color: '#64748B', letterSpacing: '0.04em' }}>
                AVAILABLE
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. PRODUCT HERO DETAIL CONTAINER */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1.05fr 1fr',
          gap: '20px',
          flex: 1,
          minHeight: 0,
          background: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: '12px',
          padding: '20px 24px',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)',
          overflow: 'hidden'
        }}
      >
        {/* LEFT COLUMN: HERO IMAGE & 3 ANGLE THUMBNAILS */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            height: '100%',
            minHeight: 0
          }}
        >
          {/* Main Hero Product Stage */}
          <div
            style={{
              flex: 1,
              minHeight: 0,
              background: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: '12px',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '16px',
              boxShadow: 'inset 0 1px 4px rgba(0,0,0,0.02)',
              overflow: 'hidden'
            }}
          >
            {/* Top Floating Badges */}
            <div
              style={{
                position: 'absolute',
                top: '12px',
                left: '12px',
                background: '#20346B',
                borderRadius: '6px',
                padding: '4px 10px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                zIndex: 2,
                boxShadow: '0 2px 6px rgba(32, 52, 107, 0.25)'
              }}
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="#FEE047">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
              <span style={{ fontSize: '12px', fontWeight: 800, color: '#FFFFFF', letterSpacing: '0.04em' }}>
                {product.points} PTS
              </span>
            </div>

            {/* Top Right: Category Tag + Heart Wishlist Button */}
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
              <div
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #D6E1F9',
                  borderRadius: '6px',
                  padding: '4px 10px',
                  fontSize: '11px',
                  fontWeight: 800,
                  color: '#20346B',
                  letterSpacing: '0.06em',
                  boxShadow: '0 2px 5px rgba(0, 0, 0, 0.04)'
                }}
              >
                {product.categoryLabel}
              </div>

              <button
                type="button"
                onClick={() => onToggleWishlist && onToggleWishlist(product.id)}
                aria-label={isWished ? "Remove from wishlist" : "Add to wishlist"}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: isWished ? '#FFF1F2' : '#FFFFFF',
                  border: isWished ? '1.5px solid #FECDD3' : '1px solid #CBD5E1',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(0, 0, 0, 0.08)',
                  transition: 'all 0.18s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.12)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill={isWished ? '#E11D48' : 'none'}
                  stroke={isWished ? '#E11D48' : '#64748B'}
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                </svg>
              </button>
            </div>

            {/* Active Hero Image */}
            <img
              src={currentImage}
              alt={product.title}
              style={{
                width: '100%',
                height: '100%',
                maxHeight: '380px',
                objectFit: 'contain',
                display: 'block',
                transition: 'all 0.25s ease'
              }}
            />
          </div>

          {/* 3 Different Angle Thumbnails Below */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '12px',
              height: '92px',
              flexShrink: 0
            }}
          >
            {imagesList.map((thumbUrl, idx) => {
              const isSelected = activeImageIndex === idx;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveImageIndex(idx)}
                  style={{
                    height: '100%',
                    background: '#F8FAFC',
                    border: isSelected ? '2px solid #4B7EE8' : '1px solid #E2E8F0',
                    borderRadius: '8px',
                    padding: '6px',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    transition: 'all 0.18s ease',
                    boxShadow: isSelected ? '0 3px 10px rgba(75, 126, 232, 0.2)' : 'none'
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) e.currentTarget.style.borderColor = '#94A3B8';
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) e.currentTarget.style.borderColor = '#E2E8F0';
                  }}
                >
                  <img
                    src={thumbUrl}
                    alt={`${product.title} angle ${idx + 1}`}
                    style={{
                      width: '100%',
                      height: '62px',
                      objectFit: 'contain',
                      display: 'block'
                    }}
                  />
                  <span
                    style={{
                      fontSize: '10px',
                      fontWeight: 700,
                      color: isSelected ? '#4B7EE8' : '#64748B',
                      marginTop: '2px'
                    }}
                  >
                    View {idx + 1}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: PRODUCT DETAILS & REDEMPTION CTA */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '14px',
            overflowY: 'auto',
            paddingRight: '6px'
          }}
        >
          {/* Main Title & Key Pitch */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                style={{
                  background: '#EBF2FE',
                  color: '#20346B',
                  fontSize: '11px',
                  fontWeight: 800,
                  padding: '3px 9px',
                  borderRadius: '6px',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase'
                }}
              >
                {product.categoryLabel}
              </span>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#10B981', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#10B981', display: 'inline-block' }}></span>
                In Stock · Ready for Dispatch
              </span>
            </div>

            <h1
              style={{
                fontSize: '22px',
                fontWeight: 800,
                color: '#101D3B',
                margin: 0,
                lineHeight: '28px',
                letterSpacing: '-0.02em'
              }}
            >
              {product.title}
            </h1>

            {/* Price & Points Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'baseline',
                gap: '12px',
                padding: '10px 14px',
                background: '#F8FAFC',
                borderRadius: '8px',
                border: '1px solid #E2E8F0',
                marginTop: '4px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="#FEE047">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
                <span style={{ fontSize: '24px', fontWeight: 900, color: '#20346B' }}>
                  {product.points} Points
                </span>
              </div>
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#10B981' }}>
                · 100% Free Acquisition
              </span>
            </div>
          </div>

          {/* Description Section */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#94A3B8', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              ABOUT THIS REWARD
            </span>
            <p
              style={{
                fontSize: '13px',
                lineHeight: '20px',
                color: '#475569',
                margin: 0,
                fontWeight: 400
              }}
            >
              {product.description}
            </p>
          </div>

          {/* Options / Variant Selector */}
          {product.options && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#94A3B8', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                SELECT {product.options.type.toUpperCase()}: <span style={{ color: '#20346B' }}>{selectedChoice}</span>
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {product.options.choices.map((choice) => {
                  const isCurrent = selectedChoice === choice;
                  return (
                    <button
                      key={choice}
                      type="button"
                      onClick={() => setSelectedChoice(choice)}
                      style={{
                        padding: '7px 14px',
                        borderRadius: '6px',
                        border: isCurrent ? '2px solid #20346B' : '1px solid #CBD5E1',
                        background: isCurrent ? '#EBF2FE' : '#FFFFFF',
                        color: isCurrent ? '#20346B' : '#475569',
                        fontSize: '12px',
                        fontWeight: isCurrent ? 700 : 500,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {choice}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Specifications Grid */}
          <div
            style={{
              background: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: '8px',
              padding: '12px 14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
              <span style={{ color: '#64748B', fontWeight: 500 }}>Fulfillment Pickup:</span>
              <span style={{ color: '#101D3B', fontWeight: 700 }}>{product.pickupLocation}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
              <span style={{ color: '#64748B', fontWeight: 500 }}>Specifications:</span>
              <span style={{ color: '#101D3B', fontWeight: 700, textAlign: 'right', maxWidth: '280px' }}>
                {product.specifications}
              </span>
            </div>
          </div>

          {/* Wallet Balance Check & PROCEED TO REDEEM Button (Click 1 to Checkout Page) */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              paddingTop: '6px',
              borderTop: '1px solid #E2E8F0'
            }}
          >
            {!canAfford && (
              <div
                style={{
                  background: '#FEF2F2',
                  border: '1px solid #FCA5A5',
                  borderRadius: '6px',
                  padding: '8px 12px',
                  fontSize: '12px',
                  color: '#B91C1C',
                  fontWeight: 600
                }}
              >
                You need {product.points - pointsWallet} more mastery points to acquire this item. Complete challenges or project milestones to earn more!
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px' }}>
              {/* Wishlist Heart Toggle Button */}
              <button
                type="button"
                onClick={() => onToggleWishlist && onToggleWishlist(product.id)}
                title={isWished ? "Remove from Wishlist Cart" : "Add to Wishlist Cart"}
                aria-label={isWished ? "Remove from Wishlist Cart" : "Add to Wishlist Cart"}
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '8px',
                  border: isWished ? '1.5px solid #FECDD3' : '1.5px solid #CBD5E1',
                  background: isWished ? '#FFF1F2' : '#FFFFFF',
                  color: isWished ? '#E11D48' : '#64748B',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                  transition: 'all 0.18s ease',
                  flexShrink: 0
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)';
                  if (!isWished) {
                    e.currentTarget.style.borderColor = '#20346B';
                    e.currentTarget.style.color = '#20346B';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  if (!isWished) {
                    e.currentTarget.style.borderColor = '#CBD5E1';
                    e.currentTarget.style.color = '#64748B';
                  }
                }}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill={isWished ? '#E11D48' : 'none'}
                  stroke={isWished ? '#E11D48' : 'currentColor'}
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                </svg>
              </button>

              <button
                type="button"
                disabled={!canAfford}
                onClick={() => onProceedToRedeem(product, selectedChoice)}
                style={{
                  flex: 1,
                  height: '46px',
                  borderRadius: '8px',
                  border: 'none',
                  background: canAfford ? '#FEE047' : '#E2E8F0',
                  color: canAfford ? '#101D3B' : '#94A3B8',
                  fontSize: '15px',
                  fontWeight: 900,
                  cursor: canAfford ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: canAfford ? '0 4px 14px rgba(254, 224, 71, 0.4)' : 'none',
                  transition: 'all 0.18s ease'
                }}
                onMouseEnter={(e) => {
                  if (canAfford) {
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = '0 6px 18px rgba(254, 224, 71, 0.55)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (canAfford) {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 14px rgba(254, 224, 71, 0.4)';
                  }
                }}
              >
                <span>Proceed to Redeem</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
