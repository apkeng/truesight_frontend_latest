import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { api, keys, useQuery } from '../data';
import { useTS } from '../session';

const ADDRESS_KEY = 'ts-last-address';
const readSaved = () => {
  try {
    return JSON.parse(localStorage.getItem(ADDRESS_KEY) || 'null') || {};
  } catch {
    return {};
  }
};

export default function CheckoutPage({
  product,
  selectedChoice,
  pointsWallet = 0,
  submitting = false,
  onBackToProduct,
  onConfirmAcquisition,
  onOpenOrders,
  ordersCount = 0,
  isMobile: propIsMobile
}) {
  const { profile } = useTS();
  const me = useQuery(keys.me(), api.me, { staleMs: 300_000 });
  const [checkingCoupon, setCheckingCoupon] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [isCouponOpen, setIsCouponOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState('points');

  const [internalIsMobile, setInternalIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  );

  React.useEffect(() => {
    const handleResize = () => setInternalIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = propIsMobile !== undefined ? propIsMobile : internalIsMobile;

  // Shipping form: prefilled from the profile and the last address used
  const [shippingForm, setShippingForm] = useState(() => {
    const saved = readSaved();
    return {
      fullName: profile?.name || '',
      email: profile?.email || '',
      phone: saved.phone || '',
      deliveryAddress: saved.deliveryAddress || '',
      city: saved.city || '',
      zipCode: saved.zipCode || ''
    };
  });
  useEffect(() => {
    if (!me.data) return;
    setShippingForm((f) => ({
      ...f,
      fullName: f.fullName || me.data.name || '',
      email: f.email || me.data.email || '',
      phone: f.phone || me.data.phone || ''
    }));
  }, [me.data]);

  // Calculate pricing & balance
  const discountPoints = appliedCoupon ? appliedCoupon.discount : 0;
  const finalPoints = Math.max(0, (product?.points || 0) - discountPoints);
  const postBalance = Math.max(0, pointsWallet - finalPoints);
  const canAfford = pointsWallet >= finalPoints;

  const handleApplyCoupon = async () => {
    setCouponError('');
    const code = couponCode.trim().toUpperCase();
    if (!code) {
      setCouponError('Please enter a coupon code.');
      return;
    }
    setCheckingCoupon(true);
    try {
      const result = await api.validateCoupon(code, product.points);
      setAppliedCoupon({ code: result.coupon.code, discount: result.discount, label: `${result.discount} PTS off with ${result.coupon.code}` });
    } catch (err) {
      setAppliedCoupon(null);
      setCouponError(err.message || 'That coupon is not valid.');
    } finally {
      setCheckingCoupon(false);
    }
  };

  const handleInputChange = (field, val) => {
    setShippingForm((prev) => ({ ...prev, [field]: val }));
  };

  const fullAddress = [shippingForm.deliveryAddress, shippingForm.city, shippingForm.zipCode].map((x) => x.trim()).filter(Boolean).join(', ');

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (!canAfford || submitting) return;
    if (fullAddress.length < 10) {
      toast.error('Please enter a full delivery address.');
      return;
    }
    if (!/^[+\d\s()-]{6,20}$/.test(shippingForm.phone.trim())) {
      toast.error('Please enter a valid phone number.');
      return;
    }
    try {
      localStorage.setItem(ADDRESS_KEY, JSON.stringify({ phone: shippingForm.phone, deliveryAddress: shippingForm.deliveryAddress, city: shippingForm.city, zipCode: shippingForm.zipCode }));
    } catch {
      // ignore
    }
    onConfirmAcquisition({
      product,
      selectedChoice,
      finalPoints,
      shippingForm,
      address: fullAddress,
      appliedCoupon
    });
  };

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
              onClick={onBackToProduct}
              aria-label="Back to product"
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
            <span style={{ fontSize: '15px', fontWeight: 800, color: '#FFFFFF' }}>Checkout</span>
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

        {/* Selected Product Card */}
        <div
          style={{
            background: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '12px',
            padding: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              background: '#F8FAFC',
              borderRadius: '8px',
              border: '1px solid #F1F5F9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            <img
              src={product.image}
              alt={product.title}
              style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '4px' }}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', flex: 1, minWidth: 0 }}>
            <span style={{ fontSize: '10px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
              {product.categoryLabel}
            </span>
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
              {product.title}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
              <span style={{ fontSize: '11px', background: '#F1F5F9', padding: '2px 6px', borderRadius: '4px', color: '#475569', fontWeight: 600 }}>
                {selectedChoice}
              </span>
              <span style={{ fontSize: '12px', fontWeight: 800, color: '#20346B' }}>
                {finalPoints} PTS
              </span>
            </div>
          </div>
        </div>

        {/* Delivery Form Card */}
        <div
          style={{
            background: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '12px',
            padding: '14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '14px', fontWeight: 800, color: '#101D3B' }}>
              Delivery Destination
            </span>
            <span style={{ fontSize: '10px', fontWeight: 700, color: '#10B981', background: '#ECFDF5', padding: '2px 6px', borderRadius: '4px' }}>
              Campus Courier
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#64748B', marginBottom: '4px' }}>
                Full Name
              </label>
              <input
                type="text"
                value={shippingForm.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                style={{
                  width: '100%',
                  height: '38px',
                  border: '1px solid #D6E1F9',
                  borderRadius: '8px',
                  padding: '0 12px',
                  fontSize: '13px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#64748B', marginBottom: '4px' }}>
                Campus Email
              </label>
              <input
                type="email"
                value={shippingForm.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                style={{
                  width: '100%',
                  height: '38px',
                  border: '1px solid #D6E1F9',
                  borderRadius: '8px',
                  padding: '0 12px',
                  fontSize: '13px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#64748B', marginBottom: '4px' }}>
                Phone Number
              </label>
              <input
                type="tel"
                value={shippingForm.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                style={{
                  width: '100%',
                  height: '38px',
                  border: '1px solid #D6E1F9',
                  borderRadius: '8px',
                  padding: '0 12px',
                  fontSize: '13px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#64748B', marginBottom: '4px' }}>
                Hostel / Room Address
              </label>
              <input
                type="text"
                value={shippingForm.deliveryAddress}
                onChange={(e) => handleInputChange('deliveryAddress', e.target.value)}
                style={{
                  width: '100%',
                  height: '38px',
                  border: '1px solid #D6E1F9',
                  borderRadius: '8px',
                  padding: '0 12px',
                  fontSize: '13px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#64748B', marginBottom: '4px' }}>
                  City
                </label>
                <input
                  type="text"
                  value={shippingForm.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  style={{
                    width: '100%',
                    height: '38px',
                    border: '1px solid #D6E1F9',
                    borderRadius: '8px',
                    padding: '0 12px',
                    fontSize: '13px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#64748B', marginBottom: '4px' }}>
                  Pin Code
                </label>
                <input
                  type="text"
                  value={shippingForm.zipCode}
                  onChange={(e) => handleInputChange('zipCode', e.target.value)}
                  style={{
                    width: '100%',
                    height: '38px',
                    border: '1px solid #D6E1F9',
                    borderRadius: '8px',
                    padding: '0 12px',
                    fontSize: '13px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Points Summary & Redemption */}
        <div
          style={{
            background: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '12px',
            padding: '14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
          }}
        >
          <span style={{ fontSize: '14px', fontWeight: 800, color: '#101D3B' }}>
            Points Balance Summary
          </span>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748B' }}>
              <span>Current Points Balance</span>
              <span style={{ fontWeight: 700, color: '#101D3B' }}>{pointsWallet} PTS</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748B' }}>
              <span>Item Cost</span>
              <span style={{ fontWeight: 700, color: '#B91C1C' }}>-{finalPoints} PTS</span>
            </div>
            {appliedCoupon && (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#10B981' }}>
                <span>Coupon ({appliedCoupon.code})</span>
                <span style={{ fontWeight: 700 }}>+{appliedCoupon.discount} PTS</span>
              </div>
            )}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                paddingTop: '8px',
                borderTop: '1px dashed #E2E8F0',
                fontWeight: 800,
                color: '#20346B'
              }}
            >
              <span>Balance After Order</span>
              <span>{postBalance} PTS</span>
            </div>
          </div>

          {!canAfford && (
            <div
              style={{
                background: '#FEF2F2',
                border: '1px solid #FCA5A5',
                borderRadius: '6px',
                padding: '8px 10px',
                fontSize: '11px',
                color: '#B91C1C',
                fontWeight: 600,
                textAlign: 'center'
              }}
            >
              You do not have enough points for this reward.
            </div>
          )}

          <button
            type="button"
            disabled={!canAfford || submitting}
            onClick={handleSubmit}
            style={{
              width: '100%',
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
              marginTop: '4px',
              boxShadow: canAfford ? '0 2px 8px rgba(254, 224, 71, 0.4)' : 'none'
            }}
          >
            <span>{submitting ? 'Placing your order…' : 'Confirm & Acquire Reward'}</span>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </button>
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
      {/* 1. TOP HEADER & BREADCRUMBS BAR (Clean, unified) */}
      <div
        style={{
          background: '#243367',
          borderRadius: '12px',
          padding: '12px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          boxShadow: '0 2px 8px rgba(36, 51, 103, 0.08)',
          flexShrink: 0
        }}
      >
        {/* Left: Back to Product + Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <button
            type="button"
            onClick={onBackToProduct}
            aria-label="Back to product"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: '#FFFFFF',
              border: 'none',
              borderRadius: '8px',
              padding: '6px 14px',
              fontSize: '13px',
              fontWeight: 700,
              color: '#20346B',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              boxShadow: '0 1px 4px rgba(0,0,0,0.08)'
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
            <span>Back to Product</span>
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#D6E1F9', fontSize: '13px' }}>
            <span>Rewards</span>
            <span style={{ opacity: 0.5 }}>/</span>
            <span>{product.title}</span>
            <span style={{ opacity: 0.5 }}>/</span>
            <span style={{ fontWeight: 700, color: '#FFFFFF' }}>Checkout</span>
          </div>
        </div>

        {/* Right: Wallet Balance & Orders button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            type="button"
            onClick={onOpenOrders}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(255, 255, 255, 0.12)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '8px',
              padding: '6px 12px',
              fontSize: '12px',
              fontWeight: 700,
              color: '#FFFFFF',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FEE047" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="1" y="3" width="15" height="13"></rect>
              <polygon points="16 8 20 8 23 11 23 16 16 16 8"></polygon>
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

          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '8px',
              padding: '6px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 1px 4px rgba(0, 0, 0, 0.05)'
            }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="#FEE047">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            <span style={{ fontSize: '13px', fontWeight: 800, color: '#20346B' }}>
              {pointsWallet} PTS
            </span>
          </div>
        </div>
      </div>

      {/* 2. MAIN CHECKOUT SURFACE (Clean 2-Column Layout, Zero Clutter) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1.25fr 1fr',
          gap: '24px',
          flex: 1,
          minHeight: 0,
          background: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: '12px',
          padding: '24px 28px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.02)',
          overflow: 'hidden'
        }}
      >
        {/* ============================================================ */}
        {/* LEFT COLUMN: DELIVERY DETAILS & LIGHT PROTOCOL NOTE          */}
        {/* ============================================================ */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '16px',
            overflowY: 'auto',
            paddingRight: '12px'
          }}
        >
          {/* Section Header with quiet subtitle */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#101D3B', margin: 0 }}>
                Delivery Destination &amp; Recipient
              </h2>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#10B981', background: '#ECFDF5', padding: '3px 8px', borderRadius: '4px' }}>
                Campus Courier · Free Delivery
              </span>
            </div>
            <p style={{ margin: 0, fontSize: '12px', color: '#64748B', lineHeight: '18px' }}>
              Make sure the delivery details are accurate as points will be deducted immediately after order confirmation.
            </p>
          </div>

          {/* Form Fields: Clean 2-Column Grid on White, No Heavy Nested Containers */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '14px 16px'
            }}
          >
            {/* Full Name */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569' }}>
                Full Name
              </label>
              <input
                type="text"
                value={shippingForm.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                style={{
                  height: '38px',
                  padding: '0 12px',
                  border: '1px solid #D6E1F9',
                  borderRadius: '6px',
                  fontSize: '13px',
                  color: '#101D3B',
                  background: '#F8FAFC',
                  outline: 'none',
                  fontFamily: 'inherit',
                  transition: 'border-color 0.15s ease'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#20346B';
                  e.target.style.background = '#FFFFFF';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#D6E1F9';
                  e.target.style.background = '#F8FAFC';
                }}
              />
            </div>

            {/* Email Address */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569' }}>
                Institute Email
              </label>
              <input
                type="email"
                value={shippingForm.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                style={{
                  height: '38px',
                  padding: '0 12px',
                  border: '1px solid #D6E1F9',
                  borderRadius: '6px',
                  fontSize: '13px',
                  color: '#101D3B',
                  background: '#F8FAFC',
                  outline: 'none',
                  fontFamily: 'inherit',
                  transition: 'border-color 0.15s ease'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#20346B';
                  e.target.style.background = '#FFFFFF';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#D6E1F9';
                  e.target.style.background = '#F8FAFC';
                }}
              />
            </div>

            {/* Phone Number */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569' }}>
                Phone Number
              </label>
              <input
                type="tel"
                value={shippingForm.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                style={{
                  height: '38px',
                  padding: '0 12px',
                  border: '1px solid #D6E1F9',
                  borderRadius: '6px',
                  fontSize: '13px',
                  color: '#101D3B',
                  background: '#F8FAFC',
                  outline: 'none',
                  fontFamily: 'inherit',
                  transition: 'border-color 0.15s ease'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#20346B';
                  e.target.style.background = '#FFFFFF';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#D6E1F9';
                  e.target.style.background = '#F8FAFC';
                }}
              />
            </div>

            {/* City / Campus Location */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569' }}>
                City / Campus Location
              </label>
              <input
                type="text"
                value={shippingForm.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                style={{
                  height: '38px',
                  padding: '0 12px',
                  border: '1px solid #D6E1F9',
                  borderRadius: '6px',
                  fontSize: '13px',
                  color: '#101D3B',
                  background: '#F8FAFC',
                  outline: 'none',
                  fontFamily: 'inherit',
                  transition: 'border-color 0.15s ease'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#20346B';
                  e.target.style.background = '#FFFFFF';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#D6E1F9';
                  e.target.style.background = '#F8FAFC';
                }}
              />
            </div>

            {/* Delivery Address (Full width) */}
            <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569' }}>
                Hostel / Room / Department Address
              </label>
              <input
                type="text"
                value={shippingForm.deliveryAddress}
                onChange={(e) => handleInputChange('deliveryAddress', e.target.value)}
                style={{
                  height: '38px',
                  padding: '0 12px',
                  border: '1px solid #D6E1F9',
                  borderRadius: '6px',
                  fontSize: '13px',
                  color: '#101D3B',
                  background: '#F8FAFC',
                  outline: 'none',
                  fontFamily: 'inherit',
                  transition: 'border-color 0.15s ease'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#20346B';
                  e.target.style.background = '#FFFFFF';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#D6E1F9';
                  e.target.style.background = '#F8FAFC';
                }}
              />
            </div>

            {/* Postal / Zip Code */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569' }}>
                Postal / Zip Code
              </label>
              <input
                type="text"
                value={shippingForm.zipCode}
                onChange={(e) => handleInputChange('zipCode', e.target.value)}
                style={{
                  height: '38px',
                  padding: '0 12px',
                  border: '1px solid #D6E1F9',
                  borderRadius: '6px',
                  fontSize: '13px',
                  color: '#101D3B',
                  background: '#F8FAFC',
                  outline: 'none',
                  fontFamily: 'inherit',
                  transition: 'border-color 0.15s ease'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#20346B';
                  e.target.style.background = '#FFFFFF';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#D6E1F9';
                  e.target.style.background = '#F8FAFC';
                }}
              />
            </div>

            {/* Route Info */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569' }}>
                Courier Service
              </label>
              <div
                style={{
                  height: '38px',
                  padding: '0 12px',
                  border: '1px solid #E2E8F0',
                  borderRadius: '6px',
                  fontSize: '12px',
                  color: '#20346B',
                  background: '#F8FAFC',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <span>Standard delivery</span>
                <span style={{ color: '#10B981', fontWeight: 800 }}>FREE</span>
              </div>
            </div>
          </div>

          {/* Authorization Protocol Note (Clean, subtle trust row without harsh colored box) */}
          <div
            style={{
              paddingTop: '12px',
              borderTop: '1px solid #F1F5F9',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px'
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '2px' }}>
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
            </svg>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#1E40AF', letterSpacing: '0.04em' }}>
                AUTHORIZATION PROTOCOL
              </span>
              <p style={{ margin: 0, fontSize: '12px', color: '#64748B', lineHeight: '17px' }}>
                By confirming, you authorize the immediate deduction of <strong>{finalPoints} mastery points</strong> from your institute wallet.
              </p>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* RIGHT COLUMN: SINGLE UNIFIED ORDER & PAYMENT SUMMARY         */}
        {/* ============================================================ */}
        <div
          style={{
            background: '#F8FAFC',
            border: '1px solid #E2E8F0',
            borderRadius: '10px',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '14px',
            overflowY: 'auto'
          }}
        >
          {/* Top: Product Row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                background: '#FFFFFF',
                borderRadius: '8px',
                border: '1px solid #E2E8F0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '4px',
                flexShrink: 0
              }}
            >
              <img
                src={product.image}
                alt={product.title}
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1, minWidth: 0 }}>
              <span style={{ fontSize: '10px', fontWeight: 800, color: '#4B7EE8', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                {product.categoryLabel}
              </span>
              <span
                style={{
                  fontSize: '14px',
                  fontWeight: 800,
                  color: '#101D3B',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
              >
                {product.title}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#64748B' }}>
                <span>Option: <strong style={{ color: '#20346B' }}>{selectedChoice}</strong></span>
                <span>·</span>
                <span style={{ color: '#10B981', fontWeight: 700 }}>In Stock</span>
              </div>
            </div>
          </div>

          <div style={{ height: '1px', background: '#E2E8F0' }} />

          {/* Pricing Breakdown Lines */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748B' }}>
              <span>Base Points Price</span>
              <span style={{ fontWeight: 700, color: '#101D3B' }}>{product.points} PTS</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748B' }}>
              <span>Cash Payment</span>
              <span style={{ fontWeight: 800, color: '#10B981' }}>FREE (₹0.00)</span>
            </div>

            {appliedCoupon && (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#059669', fontWeight: 700 }}>
                <span>Coupon ({appliedCoupon.code})</span>
                <span>-{appliedCoupon.discount} PTS</span>
              </div>
            )}

            {/* Expandable / Clean Coupon Line */}
            {!appliedCoupon ? (
              <div style={{ paddingTop: '2px' }}>
                {!isCouponOpen ? (
                  <button
                    type="button"
                    onClick={() => setIsCouponOpen(true)}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: 0,
                      fontSize: '12px',
                      color: '#2563EB',
                      fontWeight: 700,
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                  >
                    + Apply Student Coupon
                  </button>
                ) : (
                  <div style={{ display: 'flex', gap: '6px', marginTop: '2px' }}>
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder="e.g. CAMPUS10"
                      style={{
                        flex: 1,
                        height: '32px',
                        padding: '0 10px',
                        border: '1px solid #CBD5E1',
                        borderRadius: '6px',
                        fontSize: '12px',
                        textTransform: 'uppercase',
                        fontWeight: 600,
                        background: '#FFFFFF',
                        outline: 'none'
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      disabled={checkingCoupon}
                      style={{
                        background: '#20346B',
                        color: '#FFFFFF',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '0 12px',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      Apply
                    </button>
                  </div>
                )}
                {couponError && (
                  <span style={{ fontSize: '11px', color: '#DC2626', fontWeight: 600, display: 'block', marginTop: '4px' }}>
                    {couponError}
                  </span>
                )}
              </div>
            ) : (
              <div style={{ fontSize: '11px', color: '#10B981', fontWeight: 700 }}>
                {appliedCoupon.label} active
              </div>
            )}
          </div>

          <div style={{ height: '1px', background: '#E2E8F0' }} />

          {/* Total Points Deduction & Remaining Balance in One High-Scanning Block */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span style={{ fontSize: '14px', fontWeight: 800, color: '#101D3B' }}>
                Total Deduction
              </span>
              <span style={{ fontSize: '20px', fontWeight: 900, color: '#20346B' }}>
                {finalPoints} PTS
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
              <span style={{ color: '#64748B' }}>Post-Redemption Balance:</span>
              <span style={{ color: '#15803D', fontWeight: 700 }}>
                {postBalance} PTS (from {pointsWallet} PTS)
              </span>
            </div>
          </div>

          <div style={{ height: '1px', background: '#E2E8F0' }} />

          {/* Payment Method Selector (Quiet, clean radio options) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#94A3B8', letterSpacing: '0.04em' }}>
              PAYMENT METHOD
            </span>

            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 10px',
                background: '#FFFFFF',
                border: '1.5px solid #20346B',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="radio"
                  name="payment"
                  checked={selectedPayment === 'points'}
                  onChange={() => setSelectedPayment('points')}
                  style={{ accentColor: '#20346B' }}
                />
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#101D3B' }}>
                  100% Mastery Points
                </span>
              </div>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#10B981' }}>
                Instant ({finalPoints} PTS)
              </span>
            </label>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 10px',
                background: '#F1F5F9',
                borderRadius: '6px',
                opacity: 0.7
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input type="radio" disabled />
                <span style={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>
                  Cash on Points (Hybrid)
                </span>
              </div>
              <span style={{ fontSize: '10px', fontWeight: 700, color: '#64748B' }}>
                COMING SOON
              </span>
            </div>
          </div>

          {/* Primary Action Button */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', paddingTop: '4px' }}>
            {!canAfford && (
              <span style={{ fontSize: '11px', color: '#DC2626', fontWeight: 600, textAlign: 'center' }}>
                Insufficient points balance ({finalPoints - pointsWallet} PTS needed).
              </span>
            )}

            <button
              type="button"
              disabled={!canAfford || submitting}
              onClick={handleSubmit}
              style={{
                width: '100%',
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
                gap: '8px',
                boxShadow: canAfford ? '0 4px 12px rgba(254, 224, 71, 0.4)' : 'none',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => {
                if (canAfford) {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(254, 224, 71, 0.55)';
                }
              }}
              onMouseLeave={(e) => {
                if (canAfford) {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(254, 224, 71, 0.4)';
                }
              }}
            >
              <span>{submitting ? 'Placing your order…' : 'Authorize & Confirm Acquisition'}</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
