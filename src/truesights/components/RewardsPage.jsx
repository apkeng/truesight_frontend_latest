import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { toast as notify } from 'react-toastify';
import Icon from '../design-system/icons';
import ProductDetailPage from './ProductDetailPage';
import CheckoutPage from './CheckoutPage';
import DispatchAnimationPage from './DispatchAnimationPage';
import OrdersTrackerPage from './OrdersTrackerPage';
import WishlistCartPage from './WishlistCartPage';
import { api, invalidate, keys, setQueryData, useQuery } from '../data';
import { pathFor, useTS } from '../session';

const PLACEHOLDER_IMAGE = '/assets/Product visual.png';
const KNOWN_ICONS = new Set(['wellness', 'apparel', 'fantasy', 'trend']);

const specText = (specs) =>
  Array.isArray(specs)
    ? specs.map((sp) => (typeof sp === 'string' ? sp : [sp.label || sp.name || sp.key, sp.value].filter(Boolean).join(': '))).filter(Boolean).join(' · ')
    : '';

/** A shop reward (catalog summary or full detail) in the shape the store screens render. */
const toProduct = (r) => {
  const images = Array.isArray(r.images) && r.images.length ? r.images : r.imageUrl ? [r.imageUrl] : [];
  const options = Array.isArray(r.options) && r.options.length ? { type: r.optionLabel || 'Option', choices: r.options } : null;
  return {
    id: r.id,
    title: r.name,
    category: r.category || 'other',
    categoryLabel: (r.category || 'other').toUpperCase(),
    points: r.pointsRequired,
    description: r.description || r.summary || '',
    image: r.imageUrl || PLACEHOLDER_IMAGE,
    images,
    options,
    hasOptions: Boolean(options) || Boolean(r.hasOptions),
    inStock: r.stock !== 0,
    pickupLocation: r.type === 'digital' ? 'Delivered digitally to your email' : 'Home delivery or campus pickup',
    specifications: specText(r.specifications) || (r.brand ? `Brand: ${r.brand}` : 'See description')
  };
};

const STAGE_LABEL = {
  placed: 'Placed',
  confirmed: 'Confirmed',
  packed: 'Packed',
  shipped: 'Shipped',
  out_for_delivery: 'Out for delivery',
  delivered: 'Delivered',
  ready_for_pickup: 'Ready for pickup',
  collected: 'Collected',
  cancelled: 'Cancelled'
};

const shortDay = (iso) => new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });

/** A /api/v2/shop/orders order in the shape the tracker and dispatch screens render. */
const toOrder = (o) => {
  const first = o.items?.[0] || {};
  const stages = o.stages || [];
  const idx = Math.max(0, stages.indexOf(o.status));
  const done = o.status === 'delivered' || o.status === 'collected';
  return {
    id: o.orderNumber,
    raw: o,
    productId: first.rewardId,
    title: o.items?.length > 1 ? `${first.name} + ${o.items.length - 1} more` : first.name || 'Reward',
    category: '',
    categoryLabel: o.fulfilment === 'pickup' ? 'CAMPUS PICKUP' : 'HOME DELIVERY',
    image: first.imageUrl || PLACEHOLDER_IMAGE,
    points: o.total,
    option: first.option || (o.items?.length > 1 ? `${o.items.length} items` : 'Standard'),
    shipping: { fullName: '', email: o.email || '', phone: o.phone || '', deliveryAddress: o.address || '', city: '', zipCode: '' },
    date: o.createdAt ? new Date(o.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '',
    status: done ? 'Delivered' : o.status === 'cancelled' ? 'Cancelled' : 'In Transit',
    stageLabel: STAGE_LABEL[o.status] || o.status,
    progressPct: o.status === 'cancelled' ? 0 : done ? 100 : Math.round((idx / Math.max(1, stages.length - 1)) * 100),
    eta: o.estimatedDelivery ? `Expected by ${shortDay(o.estimatedDelivery)}` : o.fulfilment === 'pickup' ? 'Ready in about 3 days' : 'Arrives in about a week',
    expectedLabel: o.estimatedDelivery ? `Expected ${shortDay(o.estimatedDelivery)}` : 'On its way',
    fulfilment: o.fulfilment,
    cancellable: !o.legacy && ['placed', 'confirmed'].includes(o.status)
  };
};

export default function RewardsPage() {
  const { '*': subPath = '' } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { points: pointsWallet } = useTS();

  const catalogQuery = useQuery(keys.rewards(), api.rewards);
  const wishlistQuery = useQuery(keys.wishlist(), api.wishlist);
  const ordersQuery = useQuery(keys.orders(), api.orders);

  const REWARDS_CATALOG = useMemo(() => (catalogQuery.data?.rewards || []).map(toProduct), [catalogQuery.data]);
  const CATEGORIES = useMemo(
    () => [
      { id: 'all', label: 'All Vaults', icon: 'vault' },
      ...Object.keys(catalogQuery.data?.categories || {})
        .sort()
        .map((c) => ({ id: c, label: c.charAt(0).toUpperCase() + c.slice(1), icon: KNOWN_ICONS.has(c) ? c : 'vault' }))
    ],
    [catalogQuery.data]
  );
  const wishlist = wishlistQuery.data?.rewardIds || [];
  const orders = useMemo(() => (ordersQuery.data || []).map(toOrder), [ordersQuery.data]);

  // URL -> screen: /rewards, /rewards/:id, /rewards/orders, /rewards/cart
  const routeMode = subPath === 'orders' ? 'orders' : subPath === 'cart' || subPath === 'wishlist' ? 'wishlist' : subPath ? 'product' : 'catalog';
  const routeProductId = routeMode === 'product' ? subPath : null;
  const detailQuery = useQuery(routeProductId ? keys.reward(routeProductId) : null, () => api.reward(routeProductId));
  const selectedProduct = useMemo(() => {
    if (!routeProductId) return null;
    if (detailQuery.data?.reward) return toProduct(detailQuery.data.reward);
    return REWARDS_CATALOG.find((r) => r.id === routeProductId) || null;
  }, [routeProductId, detailQuery.data, REWARDS_CATALOG]);

  // Checkout and the dispatch animation sit on top of the route.
  const [flow, setFlow] = useState(null); // { mode: 'checkout', product, choice } | { mode: 'dispatch', order }
  useEffect(() => setFlow(null), [subPath]);
  const pageMode = flow?.mode || routeMode;
  const setPageMode = (mode) => {
    setFlow(null);
    if (mode === 'catalog') navigate(pathFor('rewards'));
    else if (mode === 'orders') navigate(pathFor('orders'));
    else if (mode === 'wishlist') navigate(pathFor('cart'));
  };
  const selectedChoice = flow?.choice ?? null;
  const activeOrder = flow?.mode === 'dispatch' ? flow.order : null;

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [placing, setPlacing] = useState(false);
  const [cancellingId, setCancellingId] = useState(null);
  const [toast, setToast] = useState(null);
  const toastTimeoutRef = useRef(null);
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

  const handleToggleWishlist = async (productId, e) => {
    if (e && e.stopPropagation) e.stopPropagation();

    const targetProduct = REWARDS_CATALOG.find((item) => item.id === productId) || selectedProduct;
    const productTitle = targetProduct?.title || 'Reward Item';
    const isCurrentlyWished = wishlist.includes(productId);

    setQueryData(keys.wishlist(), (d) => ({
      ...(d || {}),
      rewardIds: isCurrentlyWished ? (d?.rewardIds || []).filter((id) => id !== productId) : [...(d?.rewardIds || []), productId]
    }));
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToast({
      type: isCurrentlyWished ? 'remove' : 'add',
      message: isCurrentlyWished ? 'Removed from Wishlist Cart' : 'Added to Wishlist Cart',
      title: productTitle
    });
    toastTimeoutRef.current = setTimeout(() => setToast(null), 3500);

    try {
      await (isCurrentlyWished ? api.unwish(productId) : api.wish(productId));
      invalidate(keys.wishlist(), keys.bootstrap(), keys.dashboard());
    } catch (err) {
      notify.error(err.message);
      invalidate(keys.wishlist());
    }
  };

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
    };
  }, []);

  // Filter rewards
  const filteredRewards = useMemo(() => {
    return REWARDS_CATALOG.filter((item) => {
      if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false;
      }
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesTitle = item.title.toLowerCase().includes(query);
        const matchesDesc = item.description.toLowerCase().includes(query);
        const matchesCat = item.category.toLowerCase().includes(query);
        if (!matchesTitle && !matchesDesc && !matchesCat) {
          return false;
        }
      }
      return true;
    });
  }, [REWARDS_CATALOG, selectedCategory, searchQuery]);

  const handleOpenProduct = (item) => navigate(pathFor('rewards', item.id));

  const handleProceedToRedeem = (item, choice) => {
    // Items with options need a choice from the product page first.
    if (item.hasOptions && !item.options) {
      handleOpenProduct(item);
      return;
    }
    setFlow({ mode: 'checkout', product: item, choice: item.options ? choice : null });
  };

  const handleConfirmAcquisition = async ({ product, selectedChoice: choice, address, shippingForm, appliedCoupon }) => {
    setPlacing(true);
    try {
      const { order, remainingPoints } = await api.placeOrder({
        items: [{ rewardId: product.id, qty: 1, option: product.options ? choice : null }],
        fulfilment: 'delivery',
        address,
        phone: shippingForm.phone.trim(),
        email: shippingForm.email || undefined,
        couponCode: appliedCoupon?.code || undefined
      });
      setQueryData(keys.orders(), (d) => (d ? [order, ...d] : d));
      setQueryData(keys.bootstrap(), (d) => d && { ...d, profile: { ...d.profile, points: remainingPoints } });
      invalidate(keys.orders(), keys.bootstrap(), keys.dashboard(), keys.rewards());
      notify.success(`Order ${order.orderNumber} confirmed!`);
      setFlow({ mode: 'dispatch', order: toOrder(order) });
    } catch (err) {
      notify.error(err.message);
    } finally {
      setPlacing(false);
    }
  };

  const handleCancelOrder = async (ord) => {
    setCancellingId(ord.raw.id);
    try {
      const { order } = await api.cancelOrder(ord.raw.id);
      setQueryData(keys.orders(), (d) => d && d.map((o) => (o.id === order.id ? order : o)));
      invalidate(keys.bootstrap(), keys.dashboard(), keys.rewards());
      notify.success(`Order ${order.orderNumber} cancelled - ${order.total} points refunded.`);
    } catch (err) {
      notify.error(err.message);
    } finally {
      setCancellingId(null);
    }
  };

  const highlightOrderId = new URLSearchParams(location.search).get('highlight') || location.state?.highlight || null;

  // =========================================================================
  // VIEW ROUTING: PAGE-BASED INSTEAD OF POP-UPS (Zero Modals!)
  // =========================================================================

  // 1. Dedicated Full-Page Product Detail View
  let pageContent = null;
  if (pageMode === 'product' && !selectedProduct) {
    pageContent = (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', width: '100%' }}>
        {detailQuery.error || (catalogQuery.data && !detailQuery.isLoading) ? (
          <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '14px', padding: '32px', textAlign: 'center' }}>
            <div style={{ fontSize: '16px', fontWeight: 800, color: '#0B1A2B', marginBottom: '6px' }}>Reward not found</div>
            <div style={{ fontSize: '13px', color: '#64748B', marginBottom: '16px' }}>It may no longer be available in the store.</div>
            <button type="button" onClick={() => setPageMode('catalog')} style={{ background: '#0B3A6F', color: '#FFFFFF', border: 'none', borderRadius: '8px', padding: '9px 18px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>
              Back to rewards
            </button>
          </div>
        ) : (
          <>
            <div className="skeleton-shimmer" style={{ height: '60px', borderRadius: '14px' }} />
            <div className="skeleton-shimmer" style={{ height: '420px', borderRadius: '14px' }} />
          </>
        )}
      </div>
    );
  } else if (pageMode === 'product' && selectedProduct) {
    pageContent = (
      <ProductDetailPage
        product={selectedProduct}
        pointsWallet={pointsWallet}
        onBack={() => setPageMode('catalog')}
        onProceedToRedeem={handleProceedToRedeem}
        ordersCount={orders.length}
        onOpenOrders={() => setPageMode('orders')}
        wishlistIds={wishlist}
        key={selectedProduct.id + (selectedProduct.options ? ':detail' : '')}
        onToggleWishlist={handleToggleWishlist}
        onOpenWishlist={() => setPageMode('wishlist')}
        isMobile={isMobile}
      />
    );
  } else if (pageMode === 'checkout' && flow?.product) {
    pageContent = (
      <CheckoutPage
        product={flow.product}
        selectedChoice={selectedChoice}
        pointsWallet={pointsWallet}
        submitting={placing}
        onBackToProduct={() => setFlow(null)}
        onConfirmAcquisition={handleConfirmAcquisition}
        onOpenOrders={() => setPageMode('orders')}
        ordersCount={orders.length}
        isMobile={isMobile}
      />
    );
  } else if (pageMode === 'dispatch' && activeOrder) {
    pageContent = (
      <DispatchAnimationPage
        order={activeOrder}
        onViewOrders={() => setPageMode('orders')}
        onBackToCatalog={() => setPageMode('catalog')}
        isMobile={isMobile}
      />
    );
  } else if (pageMode === 'orders') {
    pageContent = (
      <OrdersTrackerPage
        orders={orders}
        onCancelOrder={handleCancelOrder}
        cancellingId={cancellingId}
        highlightId={highlightOrderId}
        pointsWallet={pointsWallet}
        onBackToCatalog={() => setPageMode('catalog')}
        isMobile={isMobile}
      />
    );
  } else if (pageMode === 'wishlist') {
    pageContent = (
      <WishlistCartPage
        wishlistIds={wishlist}
        catalog={REWARDS_CATALOG}
        pointsWallet={pointsWallet}
        onBackToCatalog={() => setPageMode('catalog')}
        onToggleWishlist={handleToggleWishlist}
        onOpenProduct={handleOpenProduct}
        onProceedToRedeem={handleProceedToRedeem}
        ordersCount={orders.length}
        onOpenOrders={() => setPageMode('orders')}
        isMobile={isMobile}
      />
    );
  } else if (isMobile) {
    pageContent = (
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 style={{ fontSize: '18px', fontWeight: 800, color: '#FFFFFF', margin: 0, letterSpacing: '-0.02em' }}>
              Rewards
            </h1>
            <div
              style={{
                background: '#FEE047',
                color: '#101D3B',
                borderRadius: '20px',
                padding: '3px 8px',
                fontSize: '11px',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
              }}
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="#101D3B">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
              <span>{pointsWallet} PTS</span>
            </div>
          </div>

          {/* Right Action Icons: Wishlist & Orders */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              onClick={() => setPageMode('wishlist')}
              aria-label="Wishlist Cart"
              style={{
                position: 'relative',
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'rgba(255, 255, 255, 0.15)',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                padding: 0
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill={wishlist.length > 0 ? '#FEE047' : 'none'} stroke={wishlist.length > 0 ? '#FEE047' : '#FFFFFF'} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
              </svg>
              {wishlist.length > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: '-4px',
                    right: '-4px',
                    background: '#FEE047',
                    color: '#101D3B',
                    borderRadius: '10px',
                    minWidth: '16px',
                    height: '16px',
                    padding: '0 4px',
                    fontSize: '10px',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {wishlist.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setPageMode('orders')}
              aria-label="Track Orders"
              style={{
                position: 'relative',
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'rgba(255, 255, 255, 0.15)',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                padding: 0
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FEE047" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="1" y="3" width="15" height="13"></rect>
                <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
                <circle cx="5.5" cy="18.5" r="2.5"></circle>
                <circle cx="18.5" cy="18.5" r="2.5"></circle>
              </svg>
              {orders.length > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: '-4px',
                    right: '-4px',
                    background: '#FEE047',
                    color: '#101D3B',
                    borderRadius: '10px',
                    minWidth: '16px',
                    height: '16px',
                    padding: '0 4px',
                    fontSize: '10px',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {orders.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* 2. Instant Search Bar */}
        <div style={{ position: 'relative', width: '100%' }}>
          <div
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#94A3B8',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <Icon name="search" size={15} color="#94A3B8" />
          </div>
          <input
            type="text"
            placeholder="Search rewards..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              height: '40px',
              background: '#FFFFFF',
              border: '1px solid #D6E1F9',
              borderRadius: '10px',
              padding: '0 32px 0 36px',
              fontSize: '13px',
              fontFamily: 'var(--font-primary)',
              color: '#1F2537',
              outline: 'none',
              boxSizing: 'border-box',
              boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
            }}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              style={{
                position: 'absolute',
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: '#94A3B8',
                cursor: 'pointer',
                padding: 0
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          )}
        </div>

        {/* 3. Horizontal Category Carousel Strip */}
        <div
          style={{
            display: 'flex',
            gap: '8px',
            overflowX: 'auto',
            paddingBottom: '2px',
            scrollbarWidth: 'none',
            WebkitOverflowScrolling: 'touch'
          }}
        >
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '7px 12px',
                  borderRadius: '20px',
                  border: isActive ? '1px solid #20346B' : '1px solid #E2E8F0',
                  background: isActive ? '#20346B' : '#FFFFFF',
                  color: isActive ? '#FFFFFF' : '#475569',
                  fontSize: '12px',
                  fontWeight: isActive ? 700 : 600,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                  boxShadow: isActive ? '0 2px 6px rgba(32, 52, 107, 0.2)' : 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                <Icon
                  name={cat.icon}
                  size={13}
                  bold={isActive}
                  color={isActive ? '#FEE047' : '#64748B'}
                />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* 4. Active Catalog Count */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 2px' }}>
          <span style={{ fontSize: '11px', fontWeight: 800, color: '#94A3B8', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            {filteredRewards.length} ITEMS AVAILABLE
          </span>
          <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748B' }}>
            Campus delivery eligible
          </span>
        </div>

        {/* 5. Mobile 2-Column Product Grid */}
        {filteredRewards.length === 0 ? (
          <div
            style={{
              padding: '36px 16px',
              background: '#FFFFFF',
              borderRadius: '12px',
              border: '1px solid #E2E8F0',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <span style={{ fontSize: '14px', fontWeight: 700, color: '#101D3B' }}>
              No rewards found
            </span>
            <span style={{ fontSize: '12px', color: '#64748B' }}>
              Try searching for something else or reset category filters.
            </span>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              style={{
                marginTop: '8px',
                background: '#20346B',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '8px',
                padding: '6px 14px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
              gap: '10px'
            }}
          >
            {filteredRewards.map((reward) => {
              const isWished = wishlist.includes(reward.id);
              return (
                <div
                  key={reward.id}
                  onClick={() => handleOpenProduct(reward)}
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    borderRadius: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.04)',
                    cursor: 'pointer'
                  }}
                >
                  {/* Image Preview Container */}
                  <div
                    style={{
                      height: '120px',
                      width: '100%',
                      background: '#F8FAFC',
                      position: 'relative',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden',
                      borderBottom: '1px solid #F1F5F9'
                    }}
                  >
                    {/* Points Badge (Top Left) */}
                    <div
                      style={{
                        position: 'absolute',
                        top: '6px',
                        left: '6px',
                        background: '#20346B',
                        borderRadius: '5px',
                        padding: '3px 7px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        zIndex: 3,
                        boxShadow: '0 1px 4px rgba(32, 52, 107, 0.25)'
                      }}
                    >
                      <svg width="8" height="8" viewBox="0 0 24 24" fill="#FEE047">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                      <span style={{ fontSize: '10px', fontWeight: 800, color: '#FFFFFF' }}>
                        {reward.points} PTS
                      </span>
                    </div>

                    {/* Wishlist Heart Toggle Button (Top Right) */}
                    <button
                      type="button"
                      onClick={(e) => handleToggleWishlist(reward.id, e)}
                      aria-label={isWished ? 'Remove from wishlist' : 'Add to wishlist'}
                      style={{
                        position: 'absolute',
                        top: '6px',
                        right: '6px',
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        background: isWished ? '#FFF1F2' : 'rgba(255, 255, 255, 0.92)',
                        border: isWished ? '1px solid #FECDD3' : '1px solid #E2E8F0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        zIndex: 3,
                        boxShadow: '0 1px 3px rgba(0,0,0,0.06)'
                      }}
                    >
                      <svg
                        width="13"
                        height="13"
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

                    {/* Product Image */}
                    <img
                      src={reward.image}
                      alt={reward.title}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: reward.id === 'rew-1' ? 'cover' : 'contain',
                        padding: reward.id === 'rew-1' ? '0' : '6px',
                        display: 'block'
                      }}
                    />
                  </div>

                  {/* Card Body */}
                  <div
                    style={{
                      padding: '9px 8px 10px 8px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      flex: 1,
                      gap: '8px'
                    }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                      <span
                        style={{
                          fontSize: '9px',
                          fontWeight: 700,
                          color: '#64748B',
                          letterSpacing: '0.04em',
                          textTransform: 'uppercase'
                        }}
                      >
                        {reward.categoryLabel}
                      </span>
                      <h3
                        style={{
                          fontSize: '12px',
                          fontWeight: 800,
                          color: '#101D3B',
                          margin: 0,
                          lineHeight: '16px',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}
                      >
                        {reward.title}
                      </h3>
                    </div>

                    {/* View & Redeem button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenProduct(reward);
                      }}
                      style={{
                        width: '100%',
                        height: '32px',
                        borderRadius: '6px',
                        border: 'none',
                        background: '#FEE047',
                        color: '#101D3B',
                        fontSize: '11px',
                        fontWeight: 900,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '4px',
                        boxShadow: '0 1px 4px rgba(254, 224, 71, 0.35)'
                      }}
                    >
                      <span>View &amp; Redeem</span>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="9 18 15 12 9 6"></polyline>
                      </svg>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  } else {
    pageContent = (
      <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: isMobile ? 'auto' : '100%',
        maxHeight: isMobile ? 'none' : '100%',
        boxSizing: 'border-box',
        gap: isMobile ? '10px' : '14px',
        overflow: isMobile ? 'visible' : 'hidden',
        fontFamily: 'var(--font-primary, "Plus Jakarta Sans", sans-serif)'
      }}
    >
      {/* 1. TOP HEADER BANNER */}
      <div
        style={{
          background: '#243367',
          borderRadius: isMobile ? '14px' : '12px',
          padding: isMobile ? '14px 14px 12px 14px' : '18px 24px',
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          alignItems: isMobile ? 'stretch' : 'center',
          justifyContent: 'space-between',
          gap: isMobile ? '12px' : '20px',
          boxShadow: '0 4px 14px rgba(36, 51, 103, 0.12)',
          flexShrink: 0
        }}
      >
        {/* Title & Subtitle */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <h1
            style={{
              fontSize: isMobile ? '20px' : '24px',
              fontWeight: 800,
              color: '#FFFFFF',
              margin: 0,
              lineHeight: isMobile ? '24px' : '28px',
              letterSpacing: '-0.02em'
            }}
          >
            Rewards
          </h1>
          <p
            style={{
              fontSize: isMobile ? '12px' : '13px',
              color: '#D6E1F9',
              margin: 0,
              lineHeight: isMobile ? '16px' : '18px',
              fontWeight: 400
            }}
          >
            Exchange the points you have earned for the rewards available to your institute.
          </p>
        </div>

        {/* Right: Wishlist Cart + Track My Orders + catalog size card */}
        <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '8px' : '12px', flexWrap: 'wrap', justifyContent: isMobile ? 'space-between' : 'flex-end' }}>
          {/* Wishlist Cart Header Button */}
          <button
            type="button"
            onClick={() => setPageMode('wishlist')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(255, 255, 255, 0.12)',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              borderRadius: '8px',
              padding: '10px 16px',
              fontSize: '13px',
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
            <svg width="16" height="16" viewBox="0 0 24 24" fill={wishlist.length > 0 ? '#FEE047' : 'none'} stroke={wishlist.length > 0 ? '#FEE047' : '#FFFFFF'} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
            </svg>
            <span>Wishlist Cart</span>
            {wishlist.length > 0 && (
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
                {wishlist.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setPageMode('orders')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(255, 255, 255, 0.12)',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              borderRadius: '8px',
              padding: '10px 16px',
              fontSize: '13px',
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
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FEE047" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="1" y="3" width="15" height="13"></rect>
              <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
              <circle cx="5.5" cy="18.5" r="2.5"></circle>
              <circle cx="18.5" cy="18.5" r="2.5"></circle>
            </svg>
            <span>Track My Orders</span>
            {orders.length > 0 && (
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
                {orders.length}
              </span>
            )}
          </button>

          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '8px',
              padding: '8px 22px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
              minWidth: '90px'
            }}
          >
            <span
              style={{
                fontSize: '22px',
                fontWeight: 800,
                color: '#20346B',
                lineHeight: '26px'
              }}
            >
              {REWARDS_CATALOG.length}
            </span>
            <span
              style={{
                fontSize: '10px',
                fontWeight: 700,
                color: '#64748B',
                letterSpacing: '0.08em',
                textTransform: 'uppercase'
              }}
            >
              REWARDS
            </span>
          </div>
        </div>
      </div>

      {/* 2. MAIN BODY: Left Sidebar + Right 3-Column Catalog Grid */}
      <div
        style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          gap: isMobile ? '12px' : '16px',
          flex: 1,
          minHeight: 0,
          overflow: isMobile ? 'visible' : 'hidden'
        }}
      >
        {/* LEFT SIDEBAR (Search, Collections, Point Balance) */}
        <div
          style={{
            width: isMobile ? '100%' : '200px',
            minWidth: isMobile ? '100%' : '200px',
            maxWidth: isMobile ? '100%' : '200px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            flexShrink: 0
          }}
        >
          {/* Search vault input */}
          <div style={{ position: 'relative', width: '100%' }}>
            <div
              style={{
                position: 'absolute',
                left: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#94A3B8',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <Icon name="search" size={14} color="#94A3B8" />
            </div>
            <input
              type="text"
              placeholder="Search vault..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                height: '36px',
                background: '#FFFFFF',
                border: '1px solid #D6E1F9',
                borderRadius: '8px',
                padding: '0 28px 0 32px',
                fontSize: '12px',
                fontFamily: 'var(--font-primary)',
                color: '#1F2537',
                outline: 'none',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#20346B';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#D6E1F9';
              }}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                style={{
                  position: 'absolute',
                  right: '8px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#94A3B8',
                  cursor: 'pointer',
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            )}
          </div>

          {/* Collections Panel */}
          <div
            style={{
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '10px',
              padding: isMobile ? '8px 10px' : '12px 10px',
              display: 'flex',
              flexDirection: isMobile ? 'row' : 'column',
              overflowX: isMobile ? 'auto' : 'visible',
              whiteSpace: isMobile ? 'nowrap' : 'normal',
              WebkitOverflowScrolling: 'touch',
              gap: '4px',
              boxShadow: '0 1px 4px rgba(0, 0, 0, 0.02)'
            }}
          >
            <div
              style={{
                fontSize: '10px',
                fontWeight: 700,
                color: '#94A3B8',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                padding: '2px 8px 6px 8px'
              }}
            >
              COLLECTIONS
            </div>

            {/* Wishlist Cart Quick Item */}
            <button
              type="button"
              onClick={() => setPageMode('wishlist')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 10px',
                borderRadius: '6px',
                border: 'none',
                background: 'transparent',
                color: '#64748B',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                textAlign: 'left'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#FFF1F2';
                e.currentTarget.style.color = '#E11D48';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = '#64748B';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill={wishlist.length > 0 ? '#E11D48' : 'none'} stroke="#E11D48" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                </svg>
                <span>Wishlist Cart</span>
              </div>
              {wishlist.length > 0 && (
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 800,
                    padding: '1px 6px',
                    borderRadius: '100px',
                    background: '#FFF1F2',
                    color: '#E11D48',
                    border: '1px solid #FECDD3'
                  }}
                >
                  {wishlist.length}
                </span>
              )}
            </button>

            {CATEGORIES.map((cat) => {
              const isActive = selectedCategory === cat.id;

              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '8px 10px',
                    borderRadius: '6px',
                    border: 'none',
                    background: isActive ? '#20346B' : 'transparent',
                    color: isActive ? '#FFFFFF' : '#64748B',
                    fontSize: '13px',
                    fontWeight: isActive ? 700 : 500,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    textAlign: 'left'
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = '#F1F5F9';
                      e.currentTarget.style.color = '#20346B';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = '#64748B';
                    }
                  }}
                >
                  <Icon
                    name={cat.icon}
                    size={16}
                    bold={isActive}
                    color={isActive ? '#FEE047' : 'currentColor'}
                  />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Point Balance Card */}
          <div
            style={{
              background: '#101D3B',
              borderRadius: '10px',
              padding: '16px 14px',
              color: '#FFFFFF',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
              boxShadow: '0 4px 12px rgba(16, 29, 59, 0.1)'
            }}
          >
            <div
              style={{
                fontSize: '10px',
                fontWeight: 700,
                color: '#94A3B8',
                letterSpacing: '0.08em',
                textTransform: 'uppercase'
              }}
            >
              POINT BALANCE
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginTop: '2px' }}>
              <span style={{ fontSize: '28px', fontWeight: 800, color: '#FFFFFF', lineHeight: '30px' }}>
                {pointsWallet}
              </span>
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#D6E1F9' }}>
                PTS
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT AREA: 3-Column Cards Grid */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            minWidth: 0,
            overflow: 'hidden'
          }}
        >
          {/* Subheader: 128 REWARDS */}
          <div
            style={{
              fontSize: '11px',
              fontWeight: 800,
              color: '#94A3B8',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              paddingLeft: '2px',
              flexShrink: 0
            }}
          >
            128 REWARDS
          </div>

          {/* 3-Column Cards Grid */}
          <div
            style={{
              flex: 1,
              minHeight: 0,
              overflowY: 'auto',
              paddingRight: '6px',
              paddingBottom: '24px',
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, minmax(0, 1fr))',
              gap: isMobile ? '12px' : '16px',
              alignContent: 'start'
            }}
          >
            {catalogQuery.isLoading && [0, 1, 2, 3, 4, 5].map((i) => <div key={i} className="skeleton-shimmer" style={{ height: '340px', borderRadius: '12px' }} />)}
            {catalogQuery.error && !catalogQuery.data && (
              <div style={{ gridColumn: '1 / -1', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '12px', padding: '14px 16px', color: '#DC2626', fontSize: '13px', fontWeight: 600 }}>
                Couldn't load the rewards store: {catalogQuery.error.message}
              </div>
            )}
            {catalogQuery.data && !filteredRewards.length && (
              <div style={{ gridColumn: '1 / -1', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '32px', textAlign: 'center', fontSize: '13px', color: '#64748B' }}>
                No rewards match your search.
              </div>
            )}
            {filteredRewards.map((reward) => {
              const isWished = wishlist.includes(reward.id);

              return (
                <div
                  key={reward.id}
                  onClick={() => handleOpenProduct(reward)}
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    borderRadius: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.04)',
                    transition: 'border-color 0.15s ease, box-shadow 0.15s ease, transform 0.15s ease',
                    minHeight: '340px',
                    flexShrink: 0,
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#20346B';
                    e.currentTarget.style.boxShadow = '0 8px 20px rgba(32, 52, 107, 0.1)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#E2E8F0';
                    e.currentTarget.style.boxShadow = '0 2px 6px rgba(0, 0, 0, 0.04)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  {/* Top Image Preview Container */}
                  <div
                    style={{
                      height: '170px',
                      minHeight: '170px',
                      maxHeight: '170px',
                      width: '100%',
                      background: '#F8FAFC',
                      position: 'relative',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden',
                      borderBottom: '1px solid #E2E8F0',
                      flexShrink: 0
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
                        zIndex: 3,
                        boxShadow: '0 2px 6px rgba(32, 52, 107, 0.25)'
                      }}
                    >
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="#FEE047">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 800,
                          color: '#FFFFFF',
                          letterSpacing: '0.04em'
                        }}
                      >
                        {reward.points} PTS
                      </span>
                    </div>

                    {/* Top Right Controls: Category Tag + Heart Wishlist Button */}
                    <div
                      style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        zIndex: 3
                      }}
                    >
                      <div
                        style={{
                          background: 'rgba(255, 255, 255, 0.96)',
                          border: '1px solid #D6E1F9',
                          borderRadius: '5px',
                          padding: '3px 8px',
                          fontSize: '10px',
                          fontWeight: 800,
                          color: '#20346B',
                          letterSpacing: '0.06em',
                          boxShadow: '0 2px 5px rgba(0, 0, 0, 0.05)'
                        }}
                      >
                        {reward.categoryLabel}
                      </div>

                      {/* Wishlist Heart Toggle Button */}
                      <button
                        type="button"
                        onClick={(e) => handleToggleWishlist(reward.id, e)}
                        title={isWished ? "Remove from Wishlist Cart" : "Add to Wishlist Cart"}
                        aria-label={isWished ? "Remove from Wishlist Cart" : "Add to Wishlist Cart"}
                        style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '50%',
                          background: isWished ? '#FFF1F2' : 'rgba(255, 255, 255, 0.95)',
                          border: isWished ? '1.5px solid #FECDD3' : '1px solid #CBD5E1',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          boxShadow: '0 2px 5px rgba(0, 0, 0, 0.06)',
                          transition: 'all 0.15s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'scale(1.15)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'scale(1)';
                        }}
                      >
                        <svg
                          width="14"
                          height="14"
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

                    {/* Product Image */}
                    <img
                      src={reward.image}
                      alt={reward.title}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: reward.id === 'rew-1' ? 'cover' : 'contain',
                        padding: reward.id === 'rew-1' ? '0' : '8px',
                        display: 'block'
                      }}
                    />
                  </div>

                  {/* Bottom Content Body */}
                  <div
                    style={{
                      padding: '14px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      flex: 1,
                      gap: '10px'
                    }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <h3
                        style={{
                          fontSize: '13px',
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
                        {reward.title}
                      </h3>
                      <p
                        style={{
                          fontSize: '11px',
                          color: '#64748B',
                          margin: 0,
                          lineHeight: '16px',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}
                      >
                        {reward.description}
                      </p>
                    </div>

                    {/* Button: View Reward (Yellow Background, Navy Text) */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenProduct(reward);
                      }}
                      style={{
                        width: '100%',
                        height: '38px',
                        borderRadius: '6px',
                        border: 'none',
                        background: '#FEE047',
                        color: '#101D3B',
                        fontSize: '13px',
                        fontWeight: 900,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        boxShadow: '0 2px 8px rgba(254, 224, 71, 0.35)',
                        transition: 'all 0.15s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#FEE047';
                        e.currentTarget.style.color = '#101D3B';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(254, 224, 71, 0.55)';
                        e.currentTarget.style.transform = 'translateY(-1px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(254, 224, 71, 0.35)';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                    >
                      <span>View &amp; Redeem</span>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                        <polyline points="12 5 19 12 12 19"></polyline>
                      </svg>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: isMobile ? (pageMode === 'dispatch' ? 'calc(100vh - 120px)' : 'auto') : '100%',
        minHeight: isMobile ? (pageMode === 'dispatch' ? 'calc(100vh - 120px)' : '100%') : '0',
        overflow: isMobile ? (pageMode === 'dispatch' ? 'hidden' : 'visible') : 'hidden',
        display: pageMode === 'dispatch' ? 'flex' : 'block',
        flexDirection: pageMode === 'dispatch' ? 'column' : 'initial'
      }}
    >
      {pageContent}

      {/* Floating Wishlist Notification Toast / Pop-up */}
      {toast && (
        <div
          style={{
            position: 'absolute',
            bottom: '24px',
            right: '24px',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            background: '#101D3B',
            border: '1.5px solid #20346B',
            borderRadius: '10px',
            padding: '12px 16px',
            boxShadow: '0 8px 24px rgba(16, 29, 59, 0.35)',
            animation: 'toastSlideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
            maxWidth: '420px'
          }}
        >
          {/* Heart Icon Pill */}
          <div
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              background: toast.type === 'add' ? '#FFF1F2' : '#F1F5F9',
              border: toast.type === 'add' ? '1px solid #FECDD3' : '1px solid #CBD5E1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill={toast.type === 'add' ? '#E11D48' : 'none'}
              stroke={toast.type === 'add' ? '#E11D48' : '#64748B'}
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
            </svg>
          </div>

          {/* Text Message */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', overflow: 'hidden' }}>
            <div style={{ fontSize: '13px', fontWeight: 800, color: '#FFFFFF', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
              {toast.message}
            </div>
            <div style={{ fontSize: '11px', color: '#94A3B8', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
              {toast.title}
            </div>
          </div>

          {/* Direct Action Button: View Cart */}
          {toast.type === 'add' && (
            <button
              type="button"
              onClick={() => {
                setToast(null);
                setPageMode('wishlist');
              }}
              style={{
                marginLeft: '4px',
                background: '#FEE047',
                border: 'none',
                borderRadius: '6px',
                padding: '6px 12px',
                fontSize: '11px',
                fontWeight: 900,
                color: '#101D3B',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                boxShadow: '0 2px 6px rgba(254, 224, 71, 0.3)',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <span>View Cart</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </button>
          )}

          {/* Close 'X' Button */}
          <button
            type="button"
            onClick={() => setToast(null)}
            aria-label="Dismiss notification"
            style={{
              background: 'none',
              border: 'none',
              color: '#94A3B8',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginLeft: '4px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#FFFFFF';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#94A3B8';
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      )}

      {/* Embedded CSS for Toast Slide Up Animation */}
      <style>{`
        @keyframes toastSlideUp {
          from {
            opacity: 0;
            transform: translateY(16px) scale(0.96);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
}
