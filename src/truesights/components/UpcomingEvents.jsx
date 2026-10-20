import React, { useState } from 'react';
import Icon from '../design-system/icons';
import ModalPortal from './ModalPortal';

export default function UpcomingEvents() {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [registeredEvents, setRegisteredEvents] = useState({});
  const [toast, setToast] = useState(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const events = [
    {
      id: 1,
      title: 'Automation Expo (Regional Edition)',
      category: 'Manufacturing / Hardware',
      date: 'Oct 1 · 02:30 PM',
      location: 'In-person',
      venue: 'Bengaluru Tech Exhibition Hall 4',
      image: '/assets/event-1.jpg',
      speakers: 'Dr. R. Menon (ABB Robotics), Priya Nair (Siemens Digital)',
      desc: 'Annual symposium bringing together automation leads, robotics researchers, and industrial machinery architects to showcase next-generation PLC and SCADA telemetry.'
    },
    {
      id: 2,
      title: 'AI in Robotics & Mechatronics Summit',
      category: 'AI & Robotics',
      date: 'Oct 5 · 10:00 AM',
      location: 'Online / Live',
      venue: 'TrueSights Virtual Stage 1',
      image: '/assets/event-2.jpg',
      speakers: 'Arjun Das (IIT Madras), Elena Rostova (ETH Zurich)',
      desc: 'Explore deep reinforcement learning for multi-degree-of-freedom robotic arms and computer vision-guided autonomous mobile manipulators.'
    },
    {
      id: 3,
      title: 'Cyber-Physical Systems Symposium',
      category: 'Systems Engineering',
      date: 'Oct 12 · 04:00 PM',
      location: 'In-person',
      venue: 'Main Campus Auditorium B',
      image: '/assets/event-3.jpg',
      speakers: 'Vikram Joshi (National Cyber Hub), Ananya Rao (Infosys Lab)',
      desc: 'Defensive architecture and real-time safety protocols for critical embedded IoT hardware and naval propulsion control interfaces.'
    }
  ];

  const handleToggleRSVP = (id) => {
    const isReg = !registeredEvents[id];
    setRegisteredEvents({ ...registeredEvents, [id]: isReg });
    showToast(isReg ? 'RSVP Confirmed! Your student ticket is ready.' : 'RSVP Cancelled.');
  };

  const handleDownloadCalendar = (ev) => {
    const icsContent = `BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nSUMMARY:${ev.title}\nDESCRIPTION:${ev.desc}\nLOCATION:${ev.venue}\nEND:VEVENT\nEND:VCALENDAR`;
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${ev.title.replace(/\s+/g, '_')}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Added to Calendar (.ics downloaded)');
  };

  return (
    <div
      style={{
        width: '100%',
        minWidth: 0,
        height: '378px',
        backgroundColor: 'var(--card-bg)',
        borderRadius: 'var(--card-radius)',
        border: 'var(--card-border)',
        padding: '16px 18px',
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
        position: 'relative'
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '10px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Icon name="calendarBold" size={20} color="var(--primary-navy)" />
          <h2
            style={{
              fontFamily: 'var(--font-primary)',
              fontSize: '18px',
              fontWeight: 700,
              color: 'var(--heading-text)',
              margin: 0
            }}
          >
            Upcoming Event
          </h2>
        </div>

        <a
          href="#events"
          style={{
            fontFamily: 'var(--font-primary)',
            fontSize: '14px',
            color: '#2563EB',
            textDecoration: 'none',
            fontWeight: 700
          }}
        >
          View all →
        </a>
      </div>

      {/* Events List */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          overflowY: 'auto',
          flex: 1
        }}
      >
        {events.map((event) => (
          <div
            key={event.id}
            style={{
              display: 'flex',
              gap: '10px',
              padding: '8px',
              borderRadius: '10px',
              background: '#F8FAFC',
              border: '1px solid #EEF2F6',
              alignItems: 'center',
              boxSizing: 'border-box',
              transition: 'all 0.15s ease'
            }}
          >
            {/* Thumbnail Image */}
            <div
              onClick={() => setSelectedEvent(event)}
              style={{
                width: '78px',
                height: '78px',
                borderRadius: '8px',
                overflow: 'hidden',
                flexShrink: 0,
                background: '#0B1A2B',
                cursor: 'pointer'
              }}
            >
              <img
                src={event.image}
                alt={event.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>

            {/* Info & View Details Button */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px', overflow: 'hidden' }}>
              <div
                onClick={() => setSelectedEvent(event)}
                style={{
                  fontFamily: 'var(--font-primary)',
                  fontSize: '12px',
                  lineHeight: '18px',
                  fontWeight: 400,
                  color: 'var(--primary-text)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  cursor: 'pointer'
                }}
                title={event.title}
              >
                {event.title}
              </div>

              {/* Category */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Icon name="categoryGrid" size={12} color="var(--muted-text)" />
                <span
                  style={{
                    fontFamily: 'var(--font-inter)',
                    fontSize: '10px',
                    fontWeight: 500,
                    color: 'var(--secondary-text)',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {event.category}
                </span>
              </div>

              {/* Meta Date & Location */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <Icon name="calendarOutline" size={11} color="var(--muted-text)" />
                  <span
                    style={{
                      fontFamily: 'var(--font-inter)',
                      fontSize: '9px',
                      fontWeight: 600,
                      color: 'var(--secondary-text)',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {event.date}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <Icon name="locationOutline" size={11} color="var(--muted-text)" />
                  <span
                    style={{
                      fontFamily: 'var(--font-inter)',
                      fontSize: '10px',
                      fontWeight: 500,
                      color: 'var(--secondary-text)',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {event.location}
                  </span>
                </div>
              </div>

              {/* Action Button: Urbanist Bold 12px/16px */}
              <button
                onClick={() => setSelectedEvent(event)}
                style={{
                  marginTop: '2px',
                  width: '100%',
                  height: '22px',
                  borderRadius: '999px',
                  border: 'none',
                  background: registeredEvents[event.id] ? '#ECFDF5' : '#FEE047',
                  color: registeredEvents[event.id] ? '#047857' : '#101D3B',
                  fontFamily: 'var(--font-urbanist)',
                  fontSize: '11px',
                  lineHeight: '16px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                  transition: 'all 0.15s ease'
                }}
              >
                {registeredEvents[event.id] ? 'Registered' : 'View details'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* EVENT DETAILS MODAL */}
      {selectedEvent && (
        <ModalPortal isOpen={true} onClose={() => setSelectedEvent(null)}>
          <div
            style={{
              width: '450px',
              maxWidth: '92vw',
              background: '#FFFFFF',
              borderRadius: '20px',
              padding: '24px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
              animation: 'modalContentPop 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, background: '#EBF2FE', color: '#2563EB', padding: '3px 8px', borderRadius: '6px' }}>
                {selectedEvent.category} · {selectedEvent.location}
              </span>
              <button
                onClick={() => setSelectedEvent(null)}
                style={{ background: 'transparent', border: 'none', color: '#64748B', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4px' }}
                aria-label="Close"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            <div style={{ height: '140px', borderRadius: '12px', overflow: 'hidden', background: '#0B1A2B', marginBottom: '14px' }}>
              <img src={selectedEvent.image} alt={selectedEvent.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>

            <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#101828', marginBottom: '6px' }}>
              {selectedEvent.title}
            </h3>

            <div style={{ fontSize: '12px', color: '#2563EB', fontWeight: 600, marginBottom: '4px' }}>
              {selectedEvent.date} · {selectedEvent.venue}
            </div>

            <p style={{ fontSize: '12.5px', color: '#475569', lineHeight: '1.45', margin: '10px 0' }}>
              {selectedEvent.desc}
            </p>

            <div style={{ fontSize: '11px', color: '#64748B', background: '#F8FAFC', padding: '8px 12px', borderRadius: '8px', marginBottom: '16px' }}>
              <strong>Featured Speakers:</strong> {selectedEvent.speakers}
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => handleToggleRSVP(selectedEvent.id)}
                style={{
                  flex: 1,
                  height: '40px',
                  borderRadius: '999px',
                  border: 'none',
                  background: registeredEvents[selectedEvent.id] ? '#10B981' : '#FEE047',
                  color: registeredEvents[selectedEvent.id] ? '#FFFFFF' : '#101D3B',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                {registeredEvents[selectedEvent.id] ? 'Registered (Click to cancel)' : 'Register for Event'}
              </button>

              <button
                onClick={() => handleDownloadCalendar(selectedEvent)}
                style={{
                  padding: '0 16px',
                  height: '40px',
                  borderRadius: '999px',
                  border: '1px solid #CBD5E1',
                  background: '#FFFFFF',
                  color: '#475569',
                  fontWeight: 600,
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                + Add to Cal
              </button>
            </div>
          </div>
        </ModalPortal>
      )}

      {/* Floating Toast */}
      {toast && (
        <div
          style={{
            position: 'absolute',
            bottom: '12px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: '#1E293B',
            color: '#FFFFFF',
            padding: '6px 14px',
            borderRadius: '999px',
            fontSize: '11px',
            fontWeight: 600,
            zIndex: 100,
            whiteSpace: 'nowrap',
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
          }}
        >
          {toast}
        </div>
      )}
    </div>
  );
}
