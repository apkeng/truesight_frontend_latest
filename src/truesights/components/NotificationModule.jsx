import React, { useState, useMemo } from 'react';
import Icon from '../design-system/icons';
import ModalPortal from './ModalPortal';

/**
 * Play a gentle, modern synthetic notification chime via Web Audio API.
 * Guaranteed zero-asset dependency.
 */
function playNotificationChime() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const now = ctx.currentTime;

    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, now);
    gain1.gain.setValueAtTime(0, now);
    gain1.gain.linearRampToValueAtTime(0.16, now + 0.02);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.25);

    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880.0, now + 0.08);
    gain2.gain.setValueAtTime(0, now + 0.08);
    gain2.gain.linearRampToValueAtTime(0.18, now + 0.1);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.38);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.08);
    osc2.stop(now + 0.4);
  } catch (e) {
    // Ignore safely if blocked
  }
}

export const DEFAULT_NOTIFICATIONS = [
  // 1. Challenge Request
  {
    id: 'notif-ch-1',
    title: 'New 1v1 Challenge Request',
    desc: 'Rohit K. (Rank #4) challenged you on "Thermodynamic Heat Cycles". 5-minute sprint with +50 PTS wager.',
    category: 'challenges',
    timestamp: '12 mins ago',
    dateGroup: 'Today',
    unread: true,
    priority: 'high',
    tag: '+50 PTS Wager',
    actionText: 'Accept Challenge',
    actionType: 'challenge',
    payload: {
      subtopic: {
        id: 'thermo-cycles',
        title: 'Thermodynamic Heat Cycles Live Sprint',
        duration: '5 mins',
        points: 50
      }
    }
  },
  // 2. Project Created Status
  {
    id: 'notif-pr-1',
    title: 'Project Created: Kerala Building Rules 2025',
    desc: 'AI Textbook compilation complete. 5 interactive syllabus modules and mock test papers are now ready in your workspace.',
    category: 'projects',
    timestamp: '45 mins ago',
    dateGroup: 'Today',
    unread: true,
    priority: 'normal',
    tag: '5 Modules Ready',
    actionText: 'Open Workspace',
    actionType: 'project',
    payload: {
      project: {
        id: 'kbr-2025',
        title: 'Kerala Building Rules 2025',
        level: 'Undergraduate',
        description: 'Comprehensive municipal regulations, setback zoning, structural safety bylaws, and energy conservation standards.',
        modulesCount: 5,
        coverImage: '/assets/Rectangle 4.png',
        type: 'private'
      }
    }
  },
  // 3. Event Update
  {
    id: 'notif-ev-1',
    title: 'Event Update: Seat & Pass Confirmed',
    desc: 'Your registration for "National Robotics & Autonomous Systems Expo 2026" is approved. Desk #14 in Hall B reserved.',
    category: 'events',
    timestamp: '2 hours ago',
    dateGroup: 'Today',
    unread: true,
    priority: 'high',
    tag: 'Desk #14 · Hall B',
    actionText: 'View Event Pass',
    actionType: 'event',
    payload: { eventId: 'evt-2' }
  },
  // 4. Challenge Accepted / Results
  {
    id: 'notif-ch-2',
    title: 'Challenge Duel Completed: Aarav S.',
    desc: 'Aarav finished the 5-min Quantum Wells sprint with 4/5 correct in 3m 42s. Compare your scores to see the outcome.',
    category: 'challenges',
    timestamp: '3 hours ago',
    dateGroup: 'Today',
    unread: false,
    priority: 'normal',
    tag: 'Duel Finished',
    actionText: 'View Duel Results',
    actionType: 'results'
  },
  // 5. Project Created Status
  {
    id: 'notif-pr-2',
    title: 'Project Created: Semiconductor Device Physics',
    desc: 'Flashcards, formula sheets, and MOSFET characteristic curve diagrams compiled into your private roadmap.',
    category: 'projects',
    timestamp: '5 hours ago',
    dateGroup: 'Today',
    unread: false,
    priority: 'normal',
    tag: 'Roadmap Ready',
    actionText: 'Open Workspace',
    actionType: 'project',
    payload: {
      project: {
        id: 'semi-dev-phys',
        title: 'Semiconductor Device Physics',
        level: 'Postgraduate',
        description: 'Carrier transport, PN junction electrostatics, MOSFET gate dielectrics, and subthreshold slope analysis.',
        modulesCount: 6,
        coverImage: '/assets/MOSFET.png',
        type: 'private'
      }
    }
  },
  // 6. Event Reminder
  {
    id: 'notif-ev-2',
    title: 'Upcoming Keynote: Dr. Sarah Vance',
    desc: '“Next-Gen Neuromorphic Architectures” live webinar begins tomorrow at 10:00 AM. Handout available.',
    category: 'events',
    timestamp: 'Yesterday',
    dateGroup: 'Yesterday',
    unread: false,
    priority: 'normal',
    tag: 'Webinar Alert',
    actionText: 'Event Details',
    actionType: 'event',
    payload: { eventId: 'evt-1' }
  },
  // 7. Rewards & Streak
  {
    id: 'notif-rw-1',
    title: 'Study Streak Milestone: +100 PTS Credited',
    desc: 'You completed your 7-day learning momentum streak. Points have been credited to your rewards wallet.',
    category: 'rewards',
    timestamp: 'Yesterday',
    dateGroup: 'Yesterday',
    unread: false,
    priority: 'normal',
    tag: '+100 PTS Bonus',
    actionText: 'Open Rewards Store',
    actionType: 'rewards'
  }
];

export { playNotificationChime };

export default function NotificationModule({
  isOpen,
  onClose,
  notifications = DEFAULT_NOTIFICATIONS,
  onUpdateNotifications,
  onNavigate,
  onOpenWorkspace,
  onStartLiveChallenge,
  onOpenEvent
}) {
  const [activeCategory, setActiveCategory] = useState('all');
  const [onlyUnread, setOnlyUnread] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2800);
  };

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts = { all: notifications.length, events: 0, challenges: 0, projects: 0, rewards: 0, unread: 0 };
    notifications.forEach((n) => {
      if (counts[n.category] !== undefined) counts[n.category]++;
      if (n.unread) counts.unread++;
    });
    return counts;
  }, [notifications]);

  // Filtered list
  const filteredNotifications = useMemo(() => {
    return notifications.filter((n) => {
      if (activeCategory !== 'all' && n.category !== activeCategory) return false;
      if (onlyUnread && !n.unread) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          n.title.toLowerCase().includes(q) ||
          n.desc.toLowerCase().includes(q) ||
          (n.tag && n.tag.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [notifications, activeCategory, onlyUnread, searchQuery]);

  // Mark single as read
  const handleMarkAsRead = (id) => {
    if (!onUpdateNotifications) return;
    onUpdateNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, unread: false } : n))
    );
  };

  // Toggle single read/unread
  const handleToggleRead = (id, e) => {
    e.stopPropagation();
    if (!onUpdateNotifications) return;
    onUpdateNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, unread: !n.unread } : n))
    );
  };

  // Dismiss / delete single
  const handleDismiss = (id, e) => {
    e.stopPropagation();
    if (!onUpdateNotifications) return;
    onUpdateNotifications((prev) => prev.filter((n) => n.id !== id));
    showToast('Notification dismissed');
  };

  // Mark all as read
  const handleMarkAllAsRead = () => {
    if (!onUpdateNotifications) return;
    onUpdateNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
    showToast('All marked as read');
  };

  // Clear all
  const handleClearAll = () => {
    if (!onUpdateNotifications) return;
    onUpdateNotifications([]);
    showToast('All notifications cleared');
  };

  // Trigger Simulation with clean minimal data
  const handleSimulate = (type) => {
    playNotificationChime();
    const id = 'sim-' + Date.now();
    let newNotif = null;

    if (type === 'challenge') {
      newNotif = {
        id,
        title: 'New 1v1 Challenge Request',
        desc: 'Rohit K. challenged you on "Thermodynamic Heat Cycles". +50 PTS at stake.',
        category: 'challenges',
        timestamp: 'Just now',
        dateGroup: 'Today',
        unread: true,
        priority: 'high',
        tag: '+50 PTS Wager',
        actionText: 'Accept Challenge',
        actionType: 'challenge',
        payload: {
          subtopic: {
            id: 'thermo-cycles',
            title: 'Thermodynamic Heat Cycles Live Sprint',
            duration: '5 mins',
            points: 50
          }
        }
      };
      showToast('New Challenge Request received');
    } else if (type === 'event') {
      newNotif = {
        id,
        title: 'Event Update: Seat Allocated',
        desc: 'Your reserved seat for "AI & Robotics Summit" is confirmed in Hall 2.',
        category: 'events',
        timestamp: 'Just now',
        dateGroup: 'Today',
        unread: true,
        priority: 'normal',
        tag: 'Seat #B-14 Confirmed',
        actionText: 'View Event Pass',
        actionType: 'event',
        payload: { eventId: 'evt-2' }
      };
      showToast('Event update received');
    } else if (type === 'project') {
      newNotif = {
        id,
        title: 'Project Created: Turbine Fluid Mechanics',
        desc: 'Syllabus roadmap compiled with 6 practice modules and formulas.',
        category: 'projects',
        timestamp: 'Just now',
        dateGroup: 'Today',
        unread: true,
        priority: 'normal',
        tag: '6 Modules Ready',
        actionText: 'Open Workspace',
        actionType: 'project',
        payload: {
          project: {
            id: 'proj-' + Date.now(),
            title: 'Turbine Fluid Mechanics',
            level: 'Undergraduate',
            description: 'Advanced turbine principles, boundary layer flow, and performance analysis.',
            modulesCount: 6,
            coverImage: '/assets/MOSFET.png',
            type: 'private'
          }
        }
      };
      showToast('Project created status updated');
    }

    if (newNotif && onUpdateNotifications) {
      onUpdateNotifications((prev) => [newNotif, ...prev]);
    }
  };

  // Perform notification card primary action
  const handleActionClick = (notif, e) => {
    e.stopPropagation();
    handleMarkAsRead(notif.id);
    onClose();

    if (notif.actionType === 'challenge') {
      if (onStartLiveChallenge) {
        onStartLiveChallenge(
          notif.payload?.subtopic || {
            id: 'live-challenge-quick',
            title: notif.title,
            duration: '5 mins',
            points: 50
          }
        );
      } else if (onNavigate) {
        onNavigate('challenges');
      }
    } else if (notif.actionType === 'event') {
      if (onOpenEvent && notif.payload?.eventId) {
        onOpenEvent(notif.payload.eventId);
      } else if (onNavigate) {
        onNavigate('events');
      }
    } else if (notif.actionType === 'project') {
      if (onOpenWorkspace) {
        onOpenWorkspace(
          notif.payload?.project || {
            id: notif.payload?.projectId || 'sample-project',
            title: notif.payload?.title || 'Kerala Building Rules 2025',
            level: 'Undergraduate',
            description: 'Syllabus project workspace',
            modulesCount: 5,
            coverImage: '/assets/Rectangle 4.png'
          }
        );
      } else if (onNavigate) {
        onNavigate('projects');
      }
    } else if (notif.actionType === 'rewards') {
      if (onNavigate) onNavigate('rewards');
    } else if (notif.actionType === 'results') {
      if (onNavigate) onNavigate('results');
    }
  };

  // Unified minimal category metadata with TrueSights icons
  const categoryMeta = {
    events: { label: 'Event', icon: 'events' },
    challenges: { label: 'Challenge', icon: 'challenges' },
    projects: { label: 'Project', icon: 'allProjects' },
    rewards: { label: 'Reward', icon: 'rewards' },
    system: { label: 'Update', icon: 'statusUp' }
  };

  return (
    <>
      {isOpen && (
        <ModalPortal isOpen={true} onClose={onClose} zIndex={999999}>
          <div
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              bottom: 0,
              width: '100%',
              maxWidth: '480px',
              backgroundColor: '#FFFFFF',
              boxShadow: '-8px 0 32px rgba(15, 23, 42, 0.16)',
              display: 'flex',
              flexDirection: 'column',
              boxSizing: 'border-box',
              animation: 'notificationSlideRight 0.24s cubic-bezier(0.16, 1, 0.3, 1)',
              overflow: 'hidden',
              zIndex: 1000000
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* 1. MINIMAL HEADER BAR (Brand Navy + Yellow Accent) */}
            <div
              style={{
                backgroundColor: '#243367',
                padding: '16px 20px',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexShrink: 0
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Icon name="notifications" size={20} color="#FEE047" />
                <h2
                  style={{
                    margin: 0,
                    fontSize: '16px',
                    fontWeight: 700,
                    color: '#FFFFFF',
                    letterSpacing: '-0.01em'
                  }}
                >
                  Notifications
                </h2>
                {categoryCounts.unread > 0 && (
                  <span
                    style={{
                      backgroundColor: '#FEE047',
                      color: '#1E2538',
                      fontSize: '11px',
                      fontWeight: 800,
                      padding: '2px 8px',
                      borderRadius: '999px',
                      lineHeight: '14px'
                    }}
                  >
                    {categoryCounts.unread} new
                  </span>
                )}
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 255, 255, 0.16)',
                  background: 'transparent',
                  color: '#FFFFFF',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 0
                }}
              >
                <Icon name="close" size={14} color="#FFFFFF" />
              </button>
            </div>

            {/* 2. MINIMAL SUB-HEADER: Category Filter Tabs */}
            <div
              style={{
                padding: '10px 16px',
                borderBottom: '1px solid #E2E8F0',
                backgroundColor: '#FFFFFF',
                flexShrink: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}
            >
              {/* Category Filter Pills (Using TrueSights Icons) */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  overflowX: 'auto',
                  scrollbarWidth: 'none'
                }}
              >
                {[
                  { id: 'all', label: 'All', icon: 'dashboard', count: categoryCounts.all },
                  { id: 'events', label: 'Events', icon: 'events', count: categoryCounts.events },
                  { id: 'challenges', label: 'Challenges', icon: 'challenges', count: categoryCounts.challenges },
                  { id: 'projects', label: 'Projects', icon: 'allProjects', count: categoryCounts.projects },
                  { id: 'rewards', label: 'Rewards', icon: 'rewards', count: categoryCounts.rewards }
                ].map((tab) => {
                  const isActive = activeCategory === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveCategory(tab.id)}
                      style={{
                        padding: '5px 11px',
                        borderRadius: '8px',
                        border: isActive ? '1px solid #243367' : '1px solid #E2E8F0',
                        backgroundColor: isActive ? '#243367' : '#FFFFFF',
                        color: isActive ? '#FFFFFF' : '#475569',
                        fontSize: '12px',
                        fontWeight: isActive ? 700 : 500,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        whiteSpace: 'nowrap',
                        transition: 'all 120ms ease'
                      }}
                    >
                      <Icon name={tab.icon} size={13} color={isActive ? '#FFFFFF' : '#64748B'} />
                      <span>{tab.label}</span>
                      <span
                        style={{
                          backgroundColor: isActive ? 'rgba(255,255,255,0.2)' : '#F1F5F9',
                          color: isActive ? '#FFFFFF' : '#64748B',
                          fontSize: '10px',
                          fontWeight: 700,
                          padding: '1px 5px',
                          borderRadius: '999px'
                        }}
                      >
                        {tab.count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Minimal Search & Controls */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                {/* Search Input */}
                <div
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    backgroundColor: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    borderRadius: '8px',
                    padding: '5px 9px'
                  }}
                >
                  <Icon name="search" size={13} color="#94A3B8" />
                  <input
                    type="text"
                    placeholder="Search updates..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                      border: 'none',
                      background: 'transparent',
                      outline: 'none',
                      fontSize: '12px',
                      color: '#1E293B',
                      width: '100%',
                      fontFamily: 'inherit'
                    }}
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      aria-label="Clear search"
                      style={{
                        border: 'none',
                        background: 'transparent',
                        color: '#94A3B8',
                        cursor: 'pointer',
                        padding: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Icon name="close" size={11} color="#94A3B8" />
                    </button>
                  )}
                </div>

                {/* Only Unread Toggle */}
                <button
                  type="button"
                  onClick={() => setOnlyUnread(!onlyUnread)}
                  style={{
                    backgroundColor: onlyUnread ? '#F1F5F9' : '#FFFFFF',
                    border: '1px solid #CBD5E1',
                    color: onlyUnread ? '#1E2538' : '#64748B',
                    padding: '5px 9px',
                    borderRadius: '8px',
                    fontSize: '11.5px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px'
                  }}
                >
                  <div
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      backgroundColor: onlyUnread ? '#243367' : '#CBD5E1'
                    }}
                  />
                  <span>Unread</span>
                </button>

                {/* Mark All as Read */}
                {categoryCounts.unread > 0 && (
                  <button
                    type="button"
                    onClick={handleMarkAllAsRead}
                    title="Mark all as read"
                    style={{
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #E2E8F0',
                      color: '#243367',
                      padding: '5px 9px',
                      borderRadius: '8px',
                      fontSize: '11.5px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    Read all
                  </button>
                )}
              </div>
            </div>

            {/* 3. NOTIFICATION LIST (Simple, minimal white cards) */}
            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: '14px 16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                backgroundColor: '#F8FAFC'
              }}
            >
              {filteredNotifications.length === 0 ? (
                /* EMPTY STATE */
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '48px 20px',
                    textAlign: 'center',
                    background: '#FFFFFF',
                    borderRadius: '12px',
                    border: '1px dashed #CBD5E1',
                    marginTop: '20px'
                  }}
                >
                  <Icon name="notifications" size={24} color="#94A3B8" />
                  <h3
                    style={{
                      margin: '10px 0 4px 0',
                      fontSize: '15px',
                      fontWeight: 700,
                      color: '#1E293B'
                    }}
                  >
                    No notifications
                  </h3>
                  <p
                    style={{
                      margin: 0,
                      fontSize: '12px',
                      color: '#64748B',
                      maxWidth: '260px',
                      lineHeight: 1.4
                    }}
                  >
                    {searchQuery
                      ? 'No updates matched your search.'
                      : onlyUnread
                      ? 'No unread notifications left.'
                      : 'You are all caught up.'}
                  </p>
                </div>
              ) : (
                /* CARDS: Clean, minimal surface with yellow primary buttons */
                filteredNotifications.map((notif) => {
                  const meta = categoryMeta[notif.category] || categoryMeta.system;
                  return (
                    <div
                      key={notif.id}
                      onClick={() => handleMarkAsRead(notif.id)}
                      style={{
                        backgroundColor: '#FFFFFF',
                        border: notif.unread ? '1px solid #CBD5E1' : '1px solid #E2E8F0',
                        borderLeft: notif.unread ? '3.5px solid #FEE047' : '1px solid #E2E8F0',
                        borderRadius: '10px',
                        padding: '13px 15px',
                        boxShadow: notif.unread ? '0 2px 6px rgba(15, 23, 42, 0.05)' : 'none',
                        position: 'relative',
                        transition: 'all 120ms ease',
                        cursor: 'pointer',
                        boxSizing: 'border-box'
                      }}
                    >
                      {/* Top Meta Line: Clean minimal neutral badge + Timestamp + Dismiss */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          marginBottom: '6px'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          {/* Neutral Category Tag with TrueSights Icon */}
                          <span
                            style={{
                              backgroundColor: '#F1F5F9',
                              border: '1px solid #E2E8F0',
                              color: '#334155',
                              fontSize: '10px',
                              fontWeight: 700,
                              padding: '2px 7px',
                              borderRadius: '5px',
                              textTransform: 'uppercase',
                              letterSpacing: '0.03em',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            <Icon name={meta.icon} size={11} color="#475569" />
                            <span>{meta.label}</span>
                          </span>

                          {/* Extra subtle tag */}
                          {notif.tag && (
                            <span
                              style={{
                                backgroundColor: '#F8FAFC',
                                border: '1px solid #E2E8F0',
                                color: '#64748B',
                                fontSize: '10px',
                                fontWeight: 600,
                                padding: '2px 6px',
                                borderRadius: '5px'
                              }}
                            >
                              {notif.tag}
                            </span>
                          )}
                        </div>

                        {/* Right: Timestamp & Dismiss */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '11px', color: '#94A3B8' }}>
                            {notif.timestamp}
                          </span>

                          {/* Dismiss button */}
                          <button
                            type="button"
                            onClick={(e) => handleDismiss(notif.id, e)}
                            title="Dismiss"
                            aria-label="Dismiss notification"
                            style={{
                              border: 'none',
                              background: 'transparent',
                              color: '#94A3B8',
                              cursor: 'pointer',
                              padding: '2px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            <Icon name="close" size={11} color="#94A3B8" />
                          </button>
                        </div>
                      </div>

                      {/* Title */}
                      <h4
                        style={{
                          margin: '0 0 3px 0',
                          fontSize: '13.5px',
                          fontWeight: notif.unread ? 700 : 600,
                          color: '#1E2538',
                          lineHeight: 1.35
                        }}
                      >
                        {notif.title}
                      </h4>

                      {/* Description */}
                      <p
                        style={{
                          margin: '0 0 10px 0',
                          fontSize: '12px',
                          color: '#64748B',
                          lineHeight: 1.45
                        }}
                      >
                        {notif.desc}
                      </p>

                      {/* Bottom Action Area: YELLOW buttons only! */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          paddingTop: '8px',
                          borderTop: '1px solid #F1F5F9'
                        }}
                      >
                        {notif.actionText ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            {/* Signature Yellow Action Button */}
                            <button
                              type="button"
                              onClick={(e) => handleActionClick(notif, e)}
                              style={{
                                backgroundColor: '#FEE047',
                                color: '#1E2538',
                                border: 'none',
                                borderRadius: '7px',
                                padding: '6px 12px',
                                fontSize: '11.5px',
                                fontWeight: 700,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                boxShadow: '0 1px 2px rgba(0,0,0,0.06)',
                                transition: 'background-color 140ms ease'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = '#FACC15';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = '#FEE047';
                              }}
                            >
                              <span>{notif.actionText}</span>
                              <Icon name="chevronRight" size={10} color="#1E2538" />
                            </button>

                            {/* Secondary neutral Decline for challenge requests */}
                            {notif.actionType === 'challenge' && (
                              <button
                                type="button"
                                onClick={(e) => handleDismiss(notif.id, e)}
                                style={{
                                  backgroundColor: '#F8FAFC',
                                  color: '#64748B',
                                  border: '1px solid #E2E8F0',
                                  borderRadius: '7px',
                                  padding: '5px 10px',
                                  fontSize: '11.5px',
                                  fontWeight: 600,
                                  cursor: 'pointer'
                                }}
                              >
                                Decline
                              </button>
                            )}
                          </div>
                        ) : (
                          <div />
                        )}

                        {/* Read / Unread toggle link */}
                        <button
                          type="button"
                          onClick={(e) => handleToggleRead(notif.id, e)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#64748B',
                            fontSize: '11px',
                            fontWeight: 500,
                            cursor: 'pointer',
                            padding: '3px 4px'
                          }}
                        >
                          {notif.unread ? 'Mark read' : 'Mark unread'}
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* 4. MINIMAL FOOTER WITH SIMULATE TEST STRIP */}
            <div
              style={{
                padding: '10px 16px',
                borderTop: '1px solid #E2E8F0',
                backgroundColor: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexShrink: 0
              }}
            >
              {/* Subtle Simulation Quick Triggers using TrueSights Icons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 500 }}>
                  Test:
                </span>
                <button
                  type="button"
                  onClick={() => handleSimulate('challenge')}
                  title="Simulate Challenge Request"
                  style={{
                    backgroundColor: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    color: '#475569',
                    fontSize: '11px',
                    fontWeight: 600,
                    padding: '3px 8px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <Icon name="challenges" size={11} color="#475569" />
                  <span>Challenge</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSimulate('event')}
                  title="Simulate Event Update"
                  style={{
                    backgroundColor: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    color: '#475569',
                    fontSize: '11px',
                    fontWeight: 600,
                    padding: '3px 8px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <Icon name="events" size={11} color="#475569" />
                  <span>Event</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSimulate('project')}
                  title="Simulate Project Status"
                  style={{
                    backgroundColor: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    color: '#475569',
                    fontSize: '11px',
                    fontWeight: 600,
                    padding: '3px 8px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <Icon name="allProjects" size={11} color="#475569" />
                  <span>Project</span>
                </button>
              </div>

              {/* Clear All */}
              {notifications.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearAll}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#94A3B8',
                    fontSize: '11.5px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    padding: '4px 6px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#EF4444';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#94A3B8';
                  }}
                >
                  Clear all
                </button>
              )}
            </div>
          </div>
        </ModalPortal>
      )}

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            backgroundColor: '#1E2538',
            color: '#FFFFFF',
            padding: '9px 15px',
            borderRadius: '8px',
            fontSize: '12.5px',
            fontWeight: 600,
            boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
            zIndex: 10000000,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            animation: 'toastSlideUp 0.18s ease'
          }}
        >
          <span>{toastMessage}</span>
        </div>
      )}
    </>
  );
}
