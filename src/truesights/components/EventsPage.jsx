import React, { useState, useMemo, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import Icon from '../design-system/icons';
import { api, keys, useQuery } from '../data';
import { downloadCalendar, modeLabel, toEventView } from '../eventView';
import { useTS } from '../session';
import ModalPortal from './ModalPortal';

// ============================================================================
// RICH CAMPUS & TECHNICAL EVENTS DATASET
// ============================================================================
const timeRange = (startIso, endIso) => {
  const fmt = (iso) => (iso ? new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : null);
  const a = fmt(startIso);
  const b = fmt(endIso);
  return a ? (b ? `${a} - ${b}` : a) : 'Time TBA';
};

/** A /api/v2/events event in the shape the event cards and detail modal render. */
const toEvent = (e) => {
  const start = e.dateTimeStart ? new Date(e.dateTimeStart) : null;
  const view = toEventView(e);
  return {
    id: e.id,
    title: e.title,
    category: view.category,
    format: modeLabel(e),
    date: start ? start.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Date TBA',
    time: timeRange(e.dateTimeStart, e.dateTimeEnd),
    month: start ? start.toLocaleDateString('en-US', { month: 'short' }).toUpperCase() : '--',
    day: start ? String(start.getDate()).padStart(2, '0') : '--',
    venue: view.venue,
    image: view.image,
    points: Number(e.rewardPoints) || 0,
    speakers: (e.speakers || [])
      .map((sp) =>
        typeof sp === 'string'
          ? { name: sp, org: '', role: 'Speaker' }
          : sp && { name: sp.name || sp.fullName || '', org: sp.affiliation || sp.organization || sp.company || '', role: sp.title || sp.role || sp.designation || 'Speaker' }
      )
      .filter((sp) => sp && sp.name),
    desc: e.description || '',
    agenda: (e.agenda || [])
      .map((item) => (typeof item === 'string' ? { time: '', title: item, speaker: '' } : { time: item.time || item.startTime || '', title: item.title || item.topic || '', speaker: item.speaker || '' }))
      .filter((item) => item.title),
    seatCapacity: e.capacity || null,
    seatsRemaining: e.capacity ? Math.max(0, e.capacity - (e.registeredCount || 0)) : null,
    isFeatured: e.isFeatured,
    isPast: new Date(e.dateTimeEnd || e.dateTimeStart || 0).getTime() < Date.now(),
    registerUrl: view.registerUrl,
    view,
    raw: e
  };
};

export default function EventsPage() {
  const { id: routeEventId } = useParams();
  const { go } = useTS();
  const { profile } = useTS();
  const { data, error, isLoading, refetch } = useQuery(keys.events(), api.events);
  // 'all' = upcoming, 'registered' = past events
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const events = useMemo(() => (data?.events || []).map(toEvent), [data]);

  // Older in-app registrations still carry a pass code.
  const registeredMap = useMemo(() => {
    const map = {};
    (data?.events || []).forEach((e) => {
      if (e.isRegistered) map[e.id] = { ticketNumber: e.registrationCode, timestamp: e.registeredAt };
    });
    return map;
  }, [data]);

  // Modal State: /events/:id opens that event's details
  const detailModalEvent = routeEventId ? events.find((ev) => ev.id === routeEventId) || null : null;
  const setDetailModalEvent = (ev) => go('events', ev ? ev.id : undefined);
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

  // Registration happens on the organiser's site.
  const handleToggleRSVP = (event) => {
    if (event.registerUrl) window.open(event.registerUrl, '_blank', 'noopener,noreferrer');
    else toast.info('The organiser has not published a registration link yet.');
  };

  const handleDownloadCalendar = (ev) => {
    downloadCalendar(ev.view);
    toast.success(`Calendar event (.ics) downloaded for "${ev.title}".`);
  };

  const upcomingCount = events.filter((e) => !e.isPast).length;
  const registeredCount = events.length - upcomingCount;

  const filteredEvents = useMemo(() => {
    return events.filter((item) => {
      if (activeTab === 'registered' ? !item.isPast : item.isPast) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const inTitle = item.title.toLowerCase().includes(q);
        const inDesc = item.desc.toLowerCase().includes(q);
        const inVenue = item.venue.toLowerCase().includes(q);
        const inCategory = item.category.toLowerCase().includes(q);
        const inSpeakers = item.speakers.some((sp) => sp.name.toLowerCase().includes(q) || sp.org.toLowerCase().includes(q));
        if (!inTitle && !inDesc && !inVenue && !inCategory && !inSpeakers) return false;
      }

      return true;
    });
  }, [events, activeTab, searchQuery]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
        maxHeight: '100%',
        boxSizing: 'border-box',
        overflowY: 'auto',
        paddingRight: isMobile ? '0' : '6px',
        gap: isMobile ? '12px' : '20px',
        fontFamily: 'var(--font-primary, "Plus Jakarta Sans", sans-serif)'
      }}
    >
      {/* ======================================================================
          1. HERO BANNER
          ====================================================================== */}
      <div
        style={{
          background: '#243367',
          borderRadius: isMobile ? '14px' : '16px',
          padding: isMobile ? '16px 14px' : '28px 36px',
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          alignItems: isMobile ? 'stretch' : 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
          boxSizing: 'border-box',
          boxShadow: '0 4px 20px rgba(36, 51, 103, 0.16)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Subtle decorative background watermarks */}
        <div
          style={{
            position: 'absolute',
            right: '-30px',
            top: '-40px',
            width: '220px',
            height: '220px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(254, 224, 71, 0.12) 0%, rgba(255, 255, 255, 0) 70%)',
            pointerEvents: 'none'
          }}
        />

        {/* Left Heading & Subtitle */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxWidth: '660px', zIndex: 1 }}>

          <h1
            style={{
              fontFamily: 'var(--font-heading, "Space Grotesk", sans-serif)',
              fontSize: isMobile ? '22px' : '30px',
              fontWeight: 800,
              color: '#FFFFFF',
              margin: 0,
              letterSpacing: '-0.02em',
              lineHeight: isMobile ? '26px' : '36px'
            }}
          >
            Campus & Technical Events
          </h1>
          <p
            style={{
              fontSize: isMobile ? '12.5px' : '13.5px',
              color: 'rgba(255, 255, 255, 0.9)',
              margin: 0,
              lineHeight: isMobile ? '18px' : '20px'
            }}
          >
            Explore engineering symposiums, robotics hackathons, and industrial masterclasses. Register to secure student passes, earn skill points, and sync directly with your calendar.
          </p>
        </div>
      </div>

      {/* ======================================================================
          2. SIMPLE & CLEAN LAYOUT: CATEGORIES (ALL EVENTS / MY RSVPS) + SEARCH
          ====================================================================== */}
      <div
        style={{
          background: '#FFFFFF',
          border: '1px solid #E2DDD3',
          borderRadius: '14px',
          padding: isMobile ? '12px 14px' : '14px 20px',
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          alignItems: isMobile ? 'stretch' : 'center',
          justifyContent: 'space-between',
          gap: isMobile ? '10px' : '16px',
          boxShadow: '0 1px 4px rgba(11, 26, 43, 0.03)',
          flexShrink: 0,
          flexWrap: 'wrap'
        }}
      >
        {/* Categories: All Events & My RSVPs */}
        <div
          style={{
            background: '#F1F5F9',
            borderRadius: '10px',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: isMobile ? 'space-between' : 'flex-start',
            width: isMobile ? '100%' : 'auto',
            gap: '4px'
          }}
        >
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            style={{
              background: activeTab === 'all' ? '#0B3A6F' : 'transparent',
              color: activeTab === 'all' ? '#FFFFFF' : '#475569',
              border: 'none',
              borderRadius: '7px',
              padding: '8px 18px',
              fontSize: '12.5px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <span>Upcoming</span>
            <span
              style={{
                background: activeTab === 'all' ? 'rgba(255, 255, 255, 0.24)' : '#E2E8F0',
                color: activeTab === 'all' ? '#FFFFFF' : '#475569',
                fontSize: '11px',
                fontWeight: 800,
                padding: '1px 7px',
                borderRadius: '10px'
              }}
            >
              {upcomingCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('registered')}
            style={{
              background: activeTab === 'registered' ? '#0B3A6F' : 'transparent',
              color: activeTab === 'registered' ? '#FFFFFF' : '#475569',
              border: 'none',
              borderRadius: '7px',
              padding: '8px 18px',
              fontSize: '12.5px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <span>Past events</span>
            <span
              style={{
                background: activeTab === 'registered' ? '#FEE047' : '#047857',
                color: activeTab === 'registered' ? '#0B1A2B' : '#FFFFFF',
                fontSize: '11px',
                fontWeight: 800,
                padding: '1px 7px',
                borderRadius: '10px'
              }}
            >
              {registeredCount}
            </span>
          </button>
        </div>

        {/* Prominent High-Visibility Search Bar */}
        <div
          style={{
            position: 'relative',
            flex: isMobile ? '1 1 100%' : '1 1 340px',
            width: isMobile ? '100%' : 'auto',
            maxWidth: isMobile ? '100%' : '560px',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <span
            style={{
              position: 'absolute',
              left: '14px',
              color: '#0B3A6F',
              display: 'flex',
              alignItems: 'center',
              pointerEvents: 'none'
            }}
          >
            <Icon name="search" size={17} color="#0B3A6F" />
          </span>
          <input
            type="text"
            placeholder="Search events by topic, keynote speaker, or venue..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              height: '42px',
              background: '#F8FAFC',
              border: '1.5px solid #E2E8F0',
              borderRadius: '10px',
              padding: '0 34px 0 42px',
              fontSize: '13px',
              fontWeight: 500,
              fontFamily: 'var(--font-primary, sans-serif)',
              color: '#0B1A2B',
              outline: 'none',
              boxSizing: 'border-box',
              transition: 'border-color 0.15s ease, background 0.15s ease, box-shadow 0.15s ease'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#0B3A6F';
              e.target.style.background = '#FFFFFF';
              e.target.style.boxShadow = '0 0 0 3px rgba(11, 58, 111, 0.08)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#E2E8F0';
              e.target.style.background = '#F8FAFC';
              e.target.style.boxShadow = 'none';
            }}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              title="Clear search"
              style={{
                position: 'absolute',
                right: '12px',
                background: '#E2E8F0',
                border: 'none',
                borderRadius: '50%',
                width: '18px',
                height: '18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#475569',
                cursor: 'pointer',
                fontSize: '11px',
                padding: 0
              }}
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {error && !data && (
        <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '14px', padding: '14px 18px', color: '#DC2626', fontSize: '13px', fontWeight: 600, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
          <span>Couldn't load events: {error.message}</span>
          <button type="button" onClick={() => refetch()} style={{ background: '#FFFFFF', border: '1px solid #FECACA', borderRadius: '8px', padding: '6px 12px', color: '#DC2626', fontWeight: 700, cursor: 'pointer' }}>Retry</button>
        </div>
      )}
      {isLoading && (
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(360px, 1fr))', gap: '20px' }}>
          {[0, 1, 2].map((i) => <div key={i} className="skeleton-shimmer" style={{ height: '420px', borderRadius: '16px' }} />)}
        </div>
      )}

      {/* ======================================================================
          3. EVENTS CARDS GRID (TrueSights Design System)
          ====================================================================== */}
      {isLoading ? null : filteredEvents.length === 0 ? (
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: '16px',
            border: '1px dashed #CBD5E1',
            padding: '54px 24px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px'
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
              color: '#64748B'
            }}
          >
            <Icon name="calendarOutline" size={24} color="#64748B" />
          </div>
          <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: '#0B1A2B' }}>
            No events match your current criteria
          </h3>
          <p style={{ margin: 0, fontSize: '13px', color: '#64748B' }}>
            {activeTab === 'registered'
              ? 'No past events to show yet.'
              : 'Try clearing your search query to discover more sessions.'}
          </p>
          <button
            type="button"
            onClick={() => {
              setActiveTab('all');
              setSearchQuery('');
            }}
            style={{
              marginTop: '8px',
              background: '#0B3A6F',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 18px',
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
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(420px, 1fr))',
            gap: isMobile ? '14px' : '20px',
            paddingBottom: '32px'
          }}
        >
          {filteredEvents.map((event) => {
            const isRegistered = !!registeredMap[event.id];
            const regInfo = registeredMap[event.id];

            return (
              <div
                key={event.id}
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #E2DDD3',
                  borderRadius: '16px',
                  boxShadow: '0 2px 8px rgba(11, 26, 43, 0.03)',
                  boxSizing: 'border-box',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'box-shadow 0.2s ease, transform 0.2s ease, border-color 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 12px 28px -2px rgba(11, 26, 43, 0.08)';
                  e.currentTarget.style.borderColor = '#CBD5E1';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(11, 26, 43, 0.03)';
                  e.currentTarget.style.borderColor = '#E2DDD3';
                  e.currentTarget.style.transform = 'none';
                }}
              >
                {/* 1. Cover Image Banner with Overlaid Badges */}
                <div
                  style={{
                    width: '100%',
                    height: '148px',
                    position: 'relative',
                    overflow: 'hidden',
                    backgroundColor: '#0B3A6F',
                    cursor: 'pointer'
                  }}
                  onClick={() => setDetailModalEvent(event)}
                >
                  <img
                    src={event.image}
                    alt={event.title}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      transition: 'transform 0.4s ease'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.04)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />

                  {/* Gradient Overlay for text contrast */}
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'linear-gradient(180deg, rgba(11, 26, 43, 0.4) 0%, rgba(11, 26, 43, 0.1) 40%, rgba(11, 26, 43, 0.75) 100%)',
                      pointerEvents: 'none'
                    }}
                  />

                  {/* Top Badges Overlaid on Cover */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '12px',
                      left: '12px',
                      right: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      pointerEvents: 'none'
                    }}
                  >
                    <span
                      style={{
                        background: 'rgba(11, 26, 43, 0.88)',
                        backdropFilter: 'blur(6px)',
                        color: '#FFFFFF',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        padding: '3px 9px',
                        borderRadius: '6px',
                        fontSize: '10.5px',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.4px'
                      }}
                    >
                      {event.category}
                    </span>

                    <span
                      style={{
                        background: event.format === 'In-person' ? 'rgba(16, 185, 129, 0.92)' : 'rgba(37, 99, 235, 0.92)',
                        backdropFilter: 'blur(6px)',
                        color: '#FFFFFF',
                        padding: '3px 9px',
                        borderRadius: '6px',
                        fontSize: '10.5px',
                        fontWeight: 800,
                        letterSpacing: '0.3px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#FFFFFF' }} />
                      <span>{event.format}</span>
                    </span>
                  </div>

                  {/* Bottom-left Overlaid Date Badge Tile */}
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '10px',
                      left: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <div
                      style={{
                        background: '#FFFFFF',
                        borderRadius: '8px',
                        padding: '4px 10px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        boxShadow: '0 4px 10px rgba(0, 0, 0, 0.22)',
                        minWidth: '42px'
                      }}
                    >
                      <span style={{ fontSize: '9px', fontWeight: 800, color: '#DC2626', textTransform: 'uppercase' }}>
                        {event.month}
                      </span>
                      <span style={{ fontFamily: 'var(--font-heading, "Space Grotesk")', fontSize: '16px', fontWeight: 800, color: '#0B1A2B', lineHeight: '18px' }}>
                        {event.day}
                      </span>
                    </div>

                    <div style={{ color: '#FFFFFF', textShadow: '0 1px 3px rgba(0,0,0,0.7)' }}>
                      <div style={{ fontSize: '11px', fontWeight: 600 }}>{event.time}</div>
                    </div>
                  </div>

                  {/* Bottom-right Reward Points Badge */}
                  {event.points > 0 && (
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '10px',
                      right: '12px',
                      background: '#FEE047',
                      color: '#0B1A2B',
                      borderRadius: '6px',
                      padding: '3px 8px',
                      fontSize: '11px',
                      fontWeight: 800,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
                    }}
                  >
                    <span>+{event.points} pts</span>
                  </div>
                  )}
                </div>

                {/* 2. Main Content Body */}
                <div style={{ padding: '18px 22px', display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
                  {/* Event Title */}
                  <h3
                    onClick={() => setDetailModalEvent(event)}
                    style={{
                      fontFamily: 'var(--font-heading, "Space Grotesk", sans-serif)',
                      fontSize: '17px',
                      fontWeight: 700,
                      color: '#0B1A2B',
                      margin: 0,
                      lineHeight: '23px',
                      letterSpacing: '-0.01em',
                      cursor: 'pointer',
                      transition: 'color 0.15s ease'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = '#0B3A6F'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = '#0B1A2B'; }}
                  >
                    {event.title}
                  </h3>

                  {/* Venue / Stage Row */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '12px', color: '#475569' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8A97A6" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {event.venue}
                    </span>
                  </div>

                  {/* Speakers Pod */}
                  <div
                    style={{
                      background: '#FAF9F6',
                      border: '1px solid #EFEAE1',
                      borderRadius: '10px',
                      padding: '10px 12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px'
                    }}
                  >
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: '#0B3A6F',
                        color: '#FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '11px',
                        fontWeight: 800,
                        flexShrink: 0
                      }}
                    >
                      {event.speakers[0]?.name.charAt(0) || 'S'}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: '#0B1A2B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {event.speakers.map((s) => s.name).join(', ')}
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {event.speakers.map((s) => s.org).join(' · ')}
                      </div>
                    </div>
                  </div>

                  {/* Short Description */}
                  <p
                    style={{
                      fontSize: '12.5px',
                      color: '#475569',
                      margin: 0,
                      lineHeight: '18px',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}
                  >
                    {event.desc}
                  </p>
                </div>

                {/* 3. Card Footer Action Bar */}
                <div
                  style={{
                    borderTop: '1px solid #F1EFE9',
                    padding: '12px 20px',
                    background: '#FAFBFD',
                    borderRadius: '0 0 16px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    boxSizing: 'border-box',
                    gap: '10px'
                  }}
                >
                  {/* Left: View Details + Add to Calendar */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={() => setDetailModalEvent(event)}
                      style={{
                        background: '#FFFFFF',
                        border: '1px solid #CBD5E1',
                        borderRadius: '8px',
                        padding: '7px 12px',
                        fontSize: '11.5px',
                        fontWeight: 700,
                        color: '#0B1A2B',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#0B3A6F'; e.currentTarget.style.color = '#0B3A6F'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#CBD5E1'; e.currentTarget.style.color = '#0B1A2B'; }}
                    >
                      Details & Agenda
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDownloadCalendar(event)}
                      title="Download .ics Calendar Invite"
                      style={{
                        background: '#FFFFFF',
                        border: '1px solid #CBD5E1',
                        borderRadius: '8px',
                        width: '32px',
                        height: '32px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#64748B',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#0B3A6F'; e.currentTarget.style.color = '#0B3A6F'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#CBD5E1'; e.currentTarget.style.color = '#64748B'; }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                      </svg>
                    </button>
                  </div>

                  {/* Right: RSVP / Registration Button */}
                  {isRegistered ? (
                    <button
                      type="button"
                      onClick={() => setDetailModalEvent(event)}
                      style={{
                        background: '#ECFDF5',
                        border: '1px solid #A7F3D0',
                        borderRadius: '8px',
                        padding: '7px 14px',
                        color: '#047857',
                        fontSize: '12px',
                        fontWeight: 800,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        transition: 'all 0.15s ease'
                      }}
                      title="View your pass"
                    >
                      <Icon name="checkCircle" variant="bold" size={13} color="currentColor" />
                      <span>Registered ({regInfo?.ticketNumber})</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleToggleRSVP(event)}
                      disabled={event.isPast || !event.registerUrl}
                      style={{
                        opacity: event.isPast || !event.registerUrl ? 0.55 : 1,
                        background: '#FEE047',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '8px 16px',
                        color: '#0B1A2B',
                        fontSize: '12.5px',
                        fontWeight: 800,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        boxShadow: '0 2px 6px rgba(254, 224, 71, 0.35)',
                        transition: 'all 0.15s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#FCD34D';
                        e.currentTarget.style.transform = 'translateY(-1px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#FEE047';
                        e.currentTarget.style.transform = 'none';
                      }}
                    >
                      <span>{event.isPast ? 'Event ended' : event.registerUrl ? 'Register on official site' : 'Link coming soon'}</span>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8">
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ======================================================================
          5. EVENT DETAILS & STUDENT TICKET MODAL
          ====================================================================== */}
      {detailModalEvent && (
        <ModalPortal isOpen={true} onClose={() => setDetailModalEvent(null)}>
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
              width: '100%',
              maxWidth: '680px',
              maxHeight: '90vh',
              background: '#FFFFFF',
              borderRadius: '16px',
              boxShadow: '0 24px 60px rgba(0, 0, 0, 0.25)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden'
            }}
          >
            {/* Modal Header Banner */}
            <div
              style={{
                position: 'relative',
                height: '160px',
                background: '#243367',
                overflow: 'hidden',
                flexShrink: 0
              }}
            >
              <img
                src={detailModalEvent.image}
                alt={detailModalEvent.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(180deg, rgba(11, 26, 43, 0.45) 0%, rgba(11, 26, 43, 0.9) 100%)'
                }}
              />

              {/* Close Button */}
              <button
                type="button"
                onClick={() => setDetailModalEvent(null)}
                style={{
                  position: 'absolute',
                  top: '14px',
                  right: '14px',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.2)',
                  border: 'none',
                  color: '#FFFFFF',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '15px'
                }}
              >
                ✕
              </button>

              {/* Title & Badges in Cover */}
              <div
                style={{
                  position: 'absolute',
                  bottom: '16px',
                  left: '24px',
                  right: '24px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <span
                    style={{
                      background: '#FEE047',
                      color: '#0B1A2B',
                      fontSize: '10px',
                      fontWeight: 800,
                      padding: '2px 8px',
                      borderRadius: '4px',
                      textTransform: 'uppercase'
                    }}
                  >
                    {detailModalEvent.category}
                  </span>
                  <span
                    style={{
                      background: 'rgba(255, 255, 255, 0.25)',
                      color: '#FFFFFF',
                      fontSize: '10px',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: '4px'
                    }}
                  >
                    {detailModalEvent.format}
                  </span>
                </div>
                <h2
                  style={{
                    fontFamily: 'var(--font-heading, "Space Grotesk")',
                    fontSize: '20px',
                    fontWeight: 800,
                    color: '#FFFFFF',
                    margin: 0,
                    lineHeight: '26px'
                  }}
                >
                  {detailModalEvent.title}
                </h2>
              </div>
            </div>

            {/* Modal Body (Scrollable) */}
            <div
              style={{
                padding: '24px',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '18px'
              }}
            >
              {/* Event Metadata Row */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '12px',
                  background: '#FAF9F6',
                  border: '1px solid #EFEAE1',
                  borderRadius: '12px',
                  padding: '14px'
                }}
              >
                <div>
                  <div style={{ fontSize: '10px', fontWeight: 700, color: '#8A97A6', textTransform: 'uppercase' }}>
                    DATE & TIME
                  </div>
                  <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#0B1A2B', marginTop: '2px' }}>
                    {detailModalEvent.date}
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748B' }}>
                    {detailModalEvent.time}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '10px', fontWeight: 700, color: '#8A97A6', textTransform: 'uppercase' }}>
                    VENUE / STAGE
                  </div>
                  <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#0B1A2B', marginTop: '2px' }}>
                    {detailModalEvent.venue}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '10px', fontWeight: 700, color: '#8A97A6', textTransform: 'uppercase' }}>
                    SEATS REMAINING
                  </div>
                  <div style={{ fontSize: '12.5px', fontWeight: 800, color: '#047857', marginTop: '2px' }}>
                    {detailModalEvent.seatsRemaining} of {detailModalEvent.seatCapacity} seats
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748B' }}>
                    +{detailModalEvent.points} Points rewarded
                  </div>
                </div>
              </div>

              {/* Digital Student Ticket Banner (if registered) */}
              {registeredMap[detailModalEvent.id] && (
                <div
                  style={{
                    background: 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)',
                    border: '1.5px dashed #059669',
                    borderRadius: '12px',
                    padding: '16px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '16px'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 800, color: '#047857', textTransform: 'uppercase' }}>
                        OFFICIAL STUDENT ENTRY PASS
                      </span>
                      <span style={{ background: '#059669', color: '#FFFFFF', fontSize: '9.5px', fontWeight: 800, padding: '1px 6px', borderRadius: '4px' }}>
                        VERIFIED
                      </span>
                    </div>
                    <div style={{ fontSize: '18px', fontWeight: 800, fontFamily: 'var(--font-heading, "Space Grotesk")', color: '#064E3B', marginTop: '4px' }}>
                      Pass ID: {registeredMap[detailModalEvent.id].ticketNumber}
                    </div>
                    <div style={{ fontSize: '11px', color: '#047857', marginTop: '2px' }}>
                      {profile?.name || 'Student'}{registeredMap[detailModalEvent.id].timestamp ? ` · registered ${new Date(registeredMap[detailModalEvent.id].timestamp).toLocaleDateString('en-GB')}` : ''}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDownloadCalendar(detailModalEvent)}
                    style={{
                      background: '#047857',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '8px 14px',
                      fontSize: '11.5px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      flexShrink: 0
                    }}
                  >
                    Sync to Calendar
                  </button>
                </div>
              )}

              {/* Overview */}
              <div>
                <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#0B1A2B', margin: '0 0 6px 0' }}>
                  About this Session
                </h4>
                <p style={{ fontSize: '13px', color: '#475569', lineHeight: '20px', margin: 0 }}>
                  {detailModalEvent.desc}
                </p>
              </div>

              {/* Agenda Schedule */}
              <div>
                <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#0B1A2B', margin: '0 0 10px 0' }}>
                  Session Agenda & Timelines
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {!detailModalEvent.agenda.length && <div style={{ fontSize: '12.5px', color: '#94A3B8' }}>The organiser hasn't published an agenda yet.</div>}
                  {detailModalEvent.agenda.map((item, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '14px',
                        background: '#FAF9F6',
                        borderRadius: '8px',
                        padding: '10px 14px'
                      }}
                    >
                      <span style={{ fontFamily: 'var(--font-heading, "Space Grotesk")', fontSize: '12px', fontWeight: 700, color: '#0B3A6F', minWidth: '70px' }}>
                        {item.time}
                      </span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#0B1A2B' }}>
                          {item.title}
                        </div>
                        <div style={{ fontSize: '11px', color: '#64748B' }}>
                          {item.speaker ? `Speaker: ${item.speaker}` : ''}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Keynote Speakers */}
              <div>
                <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#0B1A2B', margin: '0 0 10px 0' }}>
                  Distinguished Keynote Speakers
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  {detailModalEvent.speakers.map((sp, idx) => (
                    <div
                      key={idx}
                      style={{
                        border: '1px solid #E2DDD3',
                        borderRadius: '10px',
                        padding: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                      }}
                    >
                      <div
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          background: '#0B3A6F',
                          color: '#FFFFFF',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 800,
                          fontSize: '13px',
                          flexShrink: 0
                        }}
                      >
                        {sp.name.charAt(0)}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#0B1A2B' }}>
                          {sp.name}
                        </div>
                        <div style={{ fontSize: '11px', color: '#64748B' }}>
                          {[sp.role, sp.org].filter(Boolean).join(' · ')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer CTA */}
            <div
              style={{
                borderTop: '1px solid #EFEAE1',
                padding: '16px 24px',
                background: '#FAFBFD',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexShrink: 0
              }}
            >
              <button
                type="button"
                onClick={() => handleDownloadCalendar(detailModalEvent)}
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #CBD5E1',
                  borderRadius: '8px',
                  padding: '9px 18px',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  color: '#0B1A2B',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                <span>Add to Calendar (.ics)</span>
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setDetailModalEvent(null)}
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid #CBD5E1',
                    borderRadius: '8px',
                    padding: '9px 16px',
                    fontSize: '12px',
                    fontWeight: 700,
                    color: '#64748B',
                    cursor: 'pointer'
                  }}
                >
                  Close
                </button>

                <button
                  type="button"
                  onClick={() => {
                    handleToggleRSVP(detailModalEvent);
                  }}
                  disabled={detailModalEvent.isPast || !detailModalEvent.registerUrl}
                  style={{
                    opacity: detailModalEvent.isPast || !detailModalEvent.registerUrl ? 0.55 : 1,
                    background: '#FEE047',
                    color: '#0B1A2B',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '9px 22px',
                    fontSize: '13px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  }}
                >
                  {detailModalEvent.isPast ? 'Event ended' : detailModalEvent.registerUrl ? 'Register on official site ↗' : 'Registration link coming soon'}
                </button>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}



    </div>
  );
}
