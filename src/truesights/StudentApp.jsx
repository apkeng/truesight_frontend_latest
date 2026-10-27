import React, { Suspense, lazy, useCallback, useEffect, useMemo, useState } from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from '../contexts/AuthContext';
import { api, keys } from '../revamp/lib/api';
import { clearQueryCache, useQuery } from '../revamp/lib/query';
import Sidebar from './components/Sidebar';
import HeaderWelcome from './components/HeaderWelcome';
import SyllabusCard from './components/SyllabusCard';
import LearningMomentum from './components/LearningMomentum';
import AskTestBook from './components/AskTestBook';
import MyProjects from './components/MyProjects';
import UpcomingEvents from './components/UpcomingEvents';
import NoInternetScreen from './components/NoInternetScreen';
import ScreenSkeleton from './components/ScreenSkeletons';
import NotificationModule from './components/NotificationModule';
import UserAvatar from './components/UserAvatar';
import Icon from './design-system/icons';
import { BASE, TSContext, pathFor, screenFromPath, useTS } from './session';
import { NotificationProvider, useNotifications } from './notifications';
import { useDashboard } from './data';
import './truesights.css';

// Large screens load on first visit.
const ProjectsHub = lazy(() => import('./components/ProjectsHub'));
const ProjectWorkspace = lazy(() => import('./components/ProjectWorkspace'));
const LiveChallenge = lazy(() => import('./components/LiveChallenge'));
const RewardsPage = lazy(() => import('./components/RewardsPage'));
const ResultsPage = lazy(() => import('./components/ResultsPage'));
const ChallengesPage = lazy(() => import('./components/ChallengesPage'));
const AskTextbookModule = lazy(() => import('./components/AskTextbookModule'));
const EventsPage = lazy(() => import('./components/EventsPage'));
const TrashPage = lazy(() => import('./components/TrashPage'));
const ProfilePage = lazy(() => import('./components/ProfilePage'));
const Welcome = lazy(() => import('./components/Welcome'));

class ScreenErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Screen render error:', error, errorInfo);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.resetKey !== this.props.resetKey && this.state.hasError) {
      this.setState({ hasError: false, error: null });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: '100%',
            minHeight: '340px',
            padding: '32px 20px',
            textAlign: 'center',
            background: '#FFFFFF',
            borderRadius: '16px',
            border: '1px solid #E2E8F0',
            boxSizing: 'border-box'
          }}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              backgroundColor: '#FEF2F2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '14px',
              color: '#DC2626'
            }}
          >
            <Icon name="statusUp" size={24} />
          </div>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: 800, color: '#1E293B' }}>
            Screen Notice
          </h3>
          <p style={{ margin: '0 0 20px 0', fontSize: '13px', color: '#64748B', maxWidth: '400px', lineHeight: 1.5 }}>
            An unexpected glitch occurred while loading this view. You can return to the dashboard safely.
          </p>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="button"
              onClick={() => {
                this.setState({ hasError: false, error: null });
                if (this.props.onReset) this.props.onReset();
              }}
              style={{
                backgroundColor: '#243367',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 18px',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const COLLAPSE_KEY = 'ts-sidebar-collapsed';
const readCollapsed = () => {
  try {
    return localStorage.getItem(COLLAPSE_KEY) === '1';
  } catch {
    return false;
  }
};

/**
 * TrueSights student app (Level-2), mounted at /l2dashboard/* by App.js.
 * Layout follows the TrueSights design (src/truesights/DESIGN_SYSTEM.md);
 * data comes from /api/v2 through the shared cache in src/revamp/lib.
 */
export default function StudentApp() {
  const navigate = useNavigate();
  const { logout: authLogout } = useAuth();
  const go = useCallback((screen, arg) => navigate(pathFor(screen, arg)), [navigate]);
  const boot = useQuery(keys.bootstrap(), api.bootstrap, { staleMs: 20_000 });
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  // The fixed, non-scrolling canvas applies only while this app is mounted.
  useEffect(() => {
    document.documentElement.classList.add('ts-app');
    return () => document.documentElement.classList.remove('ts-app');
  }, []);

  // The student app is for Level-2 accounts; send faculty/admins to their own
  // dashboards if a shared link or old bookmark lands them here.
  const role = boot.data?.profile?.role;
  useEffect(() => {
    const home = { 'Level-1': '/l1dashboard', 'Institute Admin': '/institutedashboard' }[role];
    if (home) navigate(home, { replace: true });
  }, [role, navigate]);

  const logout = useCallback(async () => {
    clearQueryCache();
    try {
      await authLogout();
    } finally {
      navigate('/login');
    }
  }, [authLogout, navigate]);

  const session = useMemo(
    () => ({
      profile: boot.data?.profile,
      badges: boot.data?.badges || {},
      points: boot.data?.profile?.points ?? 0,
      refreshSession: boot.refetch,
      logout,
      go,
      isNotificationOpen,
      openNotifications: () => setIsNotificationOpen(true),
      closeNotifications: () => setIsNotificationOpen(false)
    }),
    [boot.data, boot.refetch, logout, go, isNotificationOpen]
  );

  return (
    <TSContext.Provider value={session}>
      <NotificationProvider initialUnread={boot.data?.badges?.notifications}>
        <Shell />
      </NotificationProvider>
    </TSContext.Provider>
  );
}

function Shell() {
  const location = useLocation();
  const currentScreen = screenFromPath(location.pathname);
  const { profile, points: pointsWallet, go: setCurrentScreen, isNotificationOpen, openNotifications, closeNotifications } = useTS();
  const { unread: unreadNotificationsCount } = useNotifications();
  const setIsNotificationOpen = (open) => (open ? openNotifications() : closeNotifications());

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(readCollapsed);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(() => (typeof navigator !== 'undefined' ? navigator.onLine : true));
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1511
  );
  const [windowHeight, setWindowHeight] = useState(
    typeof window !== 'undefined' ? window.innerHeight : 857
  );

  useEffect(() => {
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setWindowWidth(width);
      setWindowHeight(window.innerHeight);
      if (width < 1280) setIsSidebarCollapsed(true);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => setIsMobileDrawerOpen(false), [location.pathname]);

  const toggleSidebar = useCallback(() => {
    setIsSidebarCollapsed((c) => {
      try {
        localStorage.setItem(COLLAPSE_KEY, c ? '0' : '1');
      } catch {
        // ignore
      }
      return !c;
    });
  }, []);

  const isMobile = windowWidth < 768;
  const isQuizMode = currentScreen === 'quiz';
  const isAskTextbook = currentScreen === 'ask-textbook';

  // Desktop screens are laid out on a fixed design canvas. Zoom it to fit the
  // window: shorter/narrower windows (e.g. 14" laptops at 175-200% scaling)
  // would otherwise crop it, and large ones would leave it small in the middle.
  const frameWidth = isQuizMode || !isSidebarCollapsed ? 1511 : 1510;
  const frameHeight = isSidebarCollapsed ? 840 : 857;
  const frameZoom = isMobile ? 1 : Math.min(windowWidth / frameWidth, windowHeight / frameHeight);

  const screenDisplayNames = {
    'projects': 'Roadmaps',
    'workspace': 'Workspace',
    'quiz': 'Live Challenge',
    'rewards': 'Rewards',
    'results': 'Results',
    'challenges': 'Challenges',
    'ask-textbook': 'Ask Textbook',
    'events': 'Events',
    'trash': 'Trash',
    'profile': 'Student Profile',
    'no-internet': 'Network Status',
    'first-time-user': 'Get Started'
  };

  return (
    <div
      style={{
        width: isMobile ? '100%' : `${frameWidth}px`,
        height: isMobile ? '100%' : `${frameHeight}px`,
        maxHeight: isMobile ? '100dvh' : undefined,
        flexShrink: 0,
        zoom: frameZoom,
        backgroundColor: 'var(--bg-page)',
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        alignItems: 'stretch',
        padding: isMobile ? '0' : isQuizMode ? '0' : '14px 14px 14px 10px',
        boxSizing: 'border-box',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Mobile Top App Header Bar */}
      {isMobile && !isQuizMode && (
        <header
          style={{
            height: '52px',
            backgroundColor: '#FFFFFF',
            borderBottom: '1px solid #E2E8F0',
            padding: '0 14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
            zIndex: 100,
            boxShadow: '0 1px 4px rgba(0,0,0,0.03)'
          }}
        >
          {/* Left: Brand or Back */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {currentScreen === 'dashboard' ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <img
                  src="/assets/Rectangle 4.png"
                  alt="TrueSights Logo"
                  style={{ width: '24px', height: '24px', objectFit: 'contain' }}
                />
                <span style={{ fontSize: '16.5px', fontWeight: 800, color: '#243367', letterSpacing: '-0.02em' }}>
                  TrueSights
                </span>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setCurrentScreen('dashboard')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: '#F1F5F9',
                  border: '1px solid #E2E8F0',
                  borderRadius: '8px',
                  padding: '6px 10px',
                  fontSize: '12px',
                  fontWeight: 700,
                  color: '#1E2538',
                  cursor: 'pointer'
                }}
              >
                <Icon name="chevronLeft" size={13} color="#1E2538" />
                <span>{screenDisplayNames[currentScreen] || 'Dashboard'}</span>
              </button>
            )}
          </div>

          {/* Right: Notification Bell + Points Wallet Pill + Menu Button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              onClick={() => setIsNotificationOpen(true)}
              aria-label={`Updates and Notifications (${unreadNotificationsCount} unread)`}
              title="Updates & Notifications"
              style={{
                position: 'relative',
                width: '34px',
                height: '34px',
                borderRadius: '10px',
                backgroundColor: '#F8FAFC',
                border: '1px solid #E2E8F0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                padding: 0
              }}
            >
              <Icon name="notifications" size={18} color="#243367" />
              {unreadNotificationsCount > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: '-3px',
                    right: '-3px',
                    minWidth: '15px',
                    height: '15px',
                    borderRadius: '999px',
                    backgroundColor: '#FEE047',
                    color: '#1E2538',
                    fontSize: '9.5px',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1.5px solid #FFFFFF'
                  }}
                >
                  {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
                </span>
              )}
            </button>

            <div
              onClick={() => setCurrentScreen('rewards')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                backgroundColor: '#EFF6FF',
                border: '1px solid #DBEAFE',
                padding: '4px 10px',
                borderRadius: '999px',
                fontSize: '12px',
                fontWeight: 800,
                color: '#1D4ED8',
                cursor: 'pointer'
              }}
            >
              <div style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#F59E0B' }} />
              <span>{pointsWallet} pts</span>
            </div>

            <button
              type="button"
              onClick={() => setIsMobileDrawerOpen(true)}
              aria-label="Open App Menu"
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                backgroundColor: '#F8FAFC',
                border: '1px solid #E2E8F0',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '3.5px',
                cursor: 'pointer',
                padding: 0
              }}
            >
              <div style={{ width: '16px', height: '2px', backgroundColor: '#334155', borderRadius: '2px' }} />
              <div style={{ width: '16px', height: '2px', backgroundColor: '#334155', borderRadius: '2px' }} />
              <div style={{ width: '11px', height: '2px', backgroundColor: '#334155', borderRadius: '2px', alignSelf: 'flex-start', marginLeft: '10px' }} />
            </button>
          </div>
        </header>
      )}

      {/* 1. Left Navigation Sidebar (Desktop only) */}
      {!isMobile && !isQuizMode && !isAskTextbook && (
        <Sidebar
          isCollapsed={isSidebarCollapsed}
          onToggle={toggleSidebar}
          activeNav={
            currentScreen === 'workspace' || currentScreen === 'projects'
              ? 'projects-hub'
              : currentScreen
          }
          unreadNotificationsCount={unreadNotificationsCount}
          onOpenNotifications={() => setIsNotificationOpen(true)}
          onNavigate={(screenId) =>
            setCurrentScreen(['projects-hub', 'all-projects', 'private-projects'].includes(screenId) ? 'projects' : screenId)
          }
        />
      )}

      {/* 2. Main Dashboard Surface */}
      <main
        style={{
          flex: 1,
          minWidth: 0,
          width: '100%',
          height: isMobile ? '100%' : isAskTextbook ? '100%' : isSidebarCollapsed ? '812px' : '829px',
          maxHeight: isMobile ? 'none' : isAskTextbook ? '100%' : isSidebarCollapsed ? '812px' : '829px',
          backgroundColor: isAskTextbook ? '#FFFFFF' : 'var(--surface-main)',
          border: isMobile ? 'none' : isAskTextbook ? '1px solid #E2E8F0' : '1px solid var(--surface-border)',
          borderRadius: isMobile ? 0 : 'var(--surface-radius)',
          boxShadow: isMobile ? 'none' : isAskTextbook ? '0 4px 20px rgba(32, 52, 107, 0.04)' : 'none',
          marginLeft: isMobile || isQuizMode || isAskTextbook ? '0' : isSidebarCollapsed ? '10px' : '11px',
          marginTop: 0,
          padding: isMobile
            ? (isQuizMode || isAskTextbook ? '0' : '12px 14px 84px 14px')
            : (isQuizMode || isAskTextbook
                ? '0'
                : currentScreen === 'projects' || currentScreen === 'workspace' || currentScreen === 'rewards' || currentScreen === 'results' || currentScreen === 'challenges' || currentScreen === 'events' || currentScreen === 'trash' || currentScreen === 'profile' || currentScreen === 'no-internet' || currentScreen === 'first-time-user'
                ? '14px 16px'
                : '16px 18px'),
          display: 'flex',
          flexDirection: 'column',
          justifyContent: isQuizMode || isAskTextbook || currentScreen === 'projects' || currentScreen === 'workspace' || currentScreen === 'rewards' || currentScreen === 'results' || currentScreen === 'challenges' || currentScreen === 'events' || currentScreen === 'trash' || currentScreen === 'profile' || currentScreen === 'no-internet' || currentScreen === 'first-time-user' ? 'flex-start' : 'space-between',
          gap: isQuizMode || isAskTextbook ? '0' : '16px',
          boxSizing: 'border-box',
          transition: 'margin-left 280ms cubic-bezier(.2, .8, .2, 1)',
          overflowY: isMobile ? (isAskTextbook ? 'hidden' : 'auto') : 'hidden',
          WebkitOverflowScrolling: 'touch'
        }}
      >
        <div
          className="t-skel-content"
          style={{
            width: '100%',
            height: isMobile ? (isAskTextbook || isQuizMode ? '100%' : 'auto') : '100%',
            display: 'flex',
            flexDirection: 'column',
            minHeight: 0,
            justifyContent: currentScreen === 'dashboard' && !isMobile ? 'space-between' : 'flex-start',
            gap: isQuizMode || isAskTextbook ? '0' : '16px'
          }}
        >
          <ScreenErrorBoundary resetKey={location.pathname} onReset={() => setCurrentScreen('dashboard')}>
            {!isOnline ? (
              <NoInternetScreen onRetry={() => setIsOnline(true)} onContinueOffline={() => setIsOnline(true)} />
            ) : (
              <Suspense fallback={<ScreenSkeleton screen={currentScreen} isSidebarCollapsed={isSidebarCollapsed} />}>
                <Routes>
                  <Route index element={<Navigate to="dashboard" replace />} />
                  <Route
                    path="dashboard"
                    element={<Dashboard isMobile={isMobile} windowWidth={windowWidth} isSidebarCollapsed={isSidebarCollapsed} />}
                  />
                  <Route path="welcome" element={<Welcome onSkip={() => setCurrentScreen('dashboard')} />} />
                  <Route path="projects" element={<ProjectsHub />} />
                  <Route path="projects/:kind/:id" element={<ProjectWorkspace />} />
                  <Route path="quiz/:topic" element={<LiveChallenge />} />
                  <Route path="results" element={<ResultsPage />} />
                  <Route path="challenges" element={<ChallengesPage />} />
                  <Route path="ask-a-textbook" element={<AskTextbookModule />} />
                  <Route path="ask-a-textbook/:bookId" element={<AskTextbookModule />} />
                  <Route path="ask-a-textbook/:bookId/:chatId" element={<AskTextbookModule />} />
                  <Route path="events" element={<EventsPage />} />
                  <Route path="events/:id" element={<EventsPage />} />
                  <Route path="rewards/*" element={<RewardsPage />} />
                  <Route path="profile" element={<ProfilePage />} />
                  <Route path="trash" element={<TrashPage />} />

                  {/* pre-revamp paths still used by emails and old links */}
                  <Route path="history" element={<Navigate to={`${BASE}/results`} replace />} />
                  <Route path="settings" element={<Navigate to={`${BASE}/profile`} replace />} />
                  <Route path="marketplace" element={<Navigate to={`${BASE}/rewards`} replace />} />
                  <Route path="task/:id" element={<LegacyProject kind="educator" />} />
                  <Route path="project/all-projects/:id" element={<LegacyProject kind="educator" />} />
                  <Route path="project/private-projects/:id" element={<LegacyProject kind="self" />} />
                  <Route path="project/*" element={<Navigate to={`${BASE}/projects`} replace />} />
                  <Route path="*" element={<Navigate to={`${BASE}/dashboard`} replace />} />
                </Routes>
              </Suspense>
            )}
          </ScreenErrorBoundary>
        </div>
      </main>

      {/* Mobile Bottom Navigation Tab Bar (iOS / Material 3 style) */}
      {isMobile && !isQuizMode && (
        <nav
          aria-label="Mobile Navigation"
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            height: '62px',
            paddingBottom: 'max(6px, env(safe-area-inset-bottom, 6px))',
            backgroundColor: 'rgba(255, 255, 255, 0.96)',
            backdropFilter: 'blur(16px)',
            borderTop: '1px solid #E2E8F0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-around',
            zIndex: 1000,
            boxShadow: '0 -4px 16px rgba(0,0,0,0.06)',
            userSelect: 'none'
          }}
        >
          {[
            { id: 'dashboard', label: 'Home', icon: 'dashboard' },
            { id: 'projects', label: 'Roadmaps', icon: 'allProjects' },
            { id: 'ask-textbook', label: 'Ask AI', icon: 'askTextbook', isCenter: true },
            { id: 'challenges', label: 'Quizzes', icon: 'challenges' },
            { id: 'rewards', label: 'Rewards', icon: 'rewards' }
          ].map((tab) => {
            const isActive =
              tab.id === 'projects'
                ? currentScreen === 'projects' || currentScreen === 'workspace'
                : currentScreen === tab.id;

            if (tab.isCenter) {
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setCurrentScreen(tab.id)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '0 4px',
                    position: 'relative',
                    top: '-10px'
                  }}
                >
                  <div
                    style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: '50%',
                      backgroundColor: isActive ? '#243367' : '#1E293B',
                      boxShadow: isActive ? '0 4px 14px rgba(36, 51, 103, 0.45)' : '0 4px 10px rgba(0,0,0,0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 160ms ease',
                      border: '3px solid #FFFFFF'
                    }}
                  >
                    <img
                      src="/assets/Rectangle 4.png"
                      alt="Ask AI"
                      style={{ width: '22px', height: '22px', objectFit: 'contain' }}
                    />
                  </div>
                  <span
                    style={{
                      fontSize: '10px',
                      fontWeight: 700,
                      color: isActive ? '#243367' : '#64748B',
                      marginTop: '2px'
                    }}
                  >
                    {tab.label}
                  </span>
                </button>
              );
            }

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setCurrentScreen(tab.id);
                }}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '3px',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '6px 8px',
                  flex: 1,
                  transition: 'all 140ms ease'
                }}
              >
                <div style={{ color: isActive ? '#243367' : '#94A3B8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name={tab.icon} size={20} color={isActive ? '#243367' : '#94A3B8'} bold={isActive} />
                </div>
                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: isActive ? 800 : 500,
                    color: isActive ? '#243367' : '#64748B',
                    letterSpacing: '-0.01em'
                  }}
                >
                  {tab.label}
                </span>
                {isActive && (
                  <div style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: '#243367' }} />
                )}
              </button>
            );
          })}
        </nav>
      )}

      {/* Mobile Menu Drawer Sheet */}
      {isMobile && isMobileDrawerOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(6px)',
            WebkitBackdropFilter: 'blur(6px)',
            zIndex: 2000,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end'
          }}
          onClick={() => setIsMobileDrawerOpen(false)}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '24px 24px 0 0',
              padding: '16px 20px 32px 20px',
              maxHeight: '82vh',
              overflowY: 'auto',
              boxShadow: '0 -8px 30px rgba(0,0,0,0.18)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Handle */}
            <div style={{ width: '38px', height: '4px', backgroundColor: '#CBD5E1', borderRadius: '2px', margin: '0 auto 16px auto' }} />

            {/* User Profile Card */}
            <div
              style={{
                backgroundColor: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: '16px',
                padding: '14px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '16px'
              }}
            >
              <div
                onClick={() => {
                  setCurrentScreen('profile');
                  setIsMobileDrawerOpen(false);
                }}
                style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
                title="View Student Profile & Security"
              >
                <UserAvatar name={profile?.name} photoURL={profile?.photoURL} size={42} />
                <div>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A' }}>{profile?.name || 'Student'}</div>
                  <div style={{ fontSize: '12px', color: '#64748B' }}>{profile?.instituteName || 'Student'} · Profile</div>
                </div>
              </div>
              <div
                style={{
                  backgroundColor: '#EFF6FF',
                  color: '#1D4ED8',
                  fontWeight: 800,
                  fontSize: '12px',
                  padding: '4px 10px',
                  borderRadius: '999px'
                }}
              >
                {pointsWallet} pts
              </div>
            </div>

            {/* Menu Navigation Items */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {[
                { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
                { id: 'notifications', label: 'Updates & Notifications', icon: 'notifications', badge: unreadNotificationsCount },
                { id: 'projects', label: 'Project Roadmaps', icon: 'allProjects' },
                { id: 'ask-textbook', label: 'Ask a Textbook AI', icon: 'askTextbook' },
                { id: 'challenges', label: 'Quizzes & Challenges', icon: 'challenges' },
                { id: 'rewards', label: 'Rewards Store', icon: 'rewards' },
                { id: 'results', label: 'Results & Performance', icon: 'results' },
                { id: 'events', label: 'Academic Events & Expos', icon: 'events' },
                { id: 'trash', label: 'Recycle Bin / Trash', icon: 'trash' },
                { id: 'profile', label: 'Student Profile & Security', icon: 'profile' }
              ].map((item) => {
                const isActive = currentScreen === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      if (item.id === 'notifications') {
                        setIsNotificationOpen(true);
                        setIsMobileDrawerOpen(false);
                        return;
                      }
                      setCurrentScreen(item.id);
                      setIsMobileDrawerOpen(false);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '11px 14px',
                      borderRadius: '12px',
                      border: 'none',
                      backgroundColor: isActive ? '#EFF6FF' : 'transparent',
                      color: isActive ? '#1D4ED8' : '#1E293B',
                      fontWeight: isActive ? 700 : 500,
                      fontSize: '13.5px',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'background-color 120ms ease'
                    }}
                  >
                    <Icon name={item.icon} size={18} color={isActive ? '#1D4ED8' : '#64748B'} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Close Button */}
            <button
              type="button"
              onClick={() => setIsMobileDrawerOpen(false)}
              style={{
                marginTop: '16px',
                width: '100%',
                height: '42px',
                borderRadius: '12px',
                border: '1px solid #E2E8F0',
                backgroundColor: '#F8FAFC',
                color: '#475569',
                fontWeight: 700,
                fontSize: '13.5px',
                cursor: 'pointer'
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Universal Notification Module */}
      <NotificationModule isOpen={isNotificationOpen} onClose={() => setIsNotificationOpen(false)} />
      <ToastContainer position="top-right" autoClose={3500} newestOnTop />
    </div>
  );
}

const LegacyProject = ({ kind }) => <Navigate to={`${BASE}/projects/${kind}/${useParams().id}`} replace />;

/** The dashboard: the prototype's two-row desktop grid, or a stacked column on mobile. */
const WELCOME_SKIPPED_KEY = 'ts-welcome-skipped';

function Dashboard({ isMobile, windowWidth, isSidebarCollapsed }) {
  const { go: setCurrentScreen, openNotifications } = useTS();
  const { unread: unreadNotificationsCount } = useNotifications();
  const { data } = useDashboard();
  const [welcomeSkipped, setWelcomeSkipped] = useState(() => {
    try {
      return sessionStorage.getItem(WELCOME_SKIPPED_KEY) === '1';
    } catch {
      return false;
    }
  });
  const setIsNotificationOpen = () => openNotifications();
  const openWorkspace = (proj) => setCurrentScreen('workspace', proj);

  // Brand-new students (no roadmaps, no quizzes yet) start on Get Started.
  if (data && !welcomeSkipped && !data.projectCounts?.all && !data.latestScore) {
    return (
      <Welcome
        onSkip={() => {
          try {
            sessionStorage.setItem(WELCOME_SKIPPED_KEY, '1');
          } catch {
            // ignore
          }
          setWelcomeSkipped(true);
        }}
      />
    );
  }

  if (isMobile) {
    return (
      /* NATIVE MOBILE DASHBOARD EXPERIENCE (Fluid, touch-optimized vertical stack) */
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          width: '100%',
          paddingBottom: '24px'
        }}
      >
        {/* 1. Mobile Greeting */}
        <HeaderWelcome
          onOpenNotifications={() => setIsNotificationOpen(true)}
          unreadCount={unreadNotificationsCount}
        />

        {/* 2. Points & Learning Momentum Hero Card */}
        <LearningMomentum
          onViewResults={() => setCurrentScreen('results')}
          onViewChallenges={() => setCurrentScreen('challenges')}
          onOpenWorkspace={openWorkspace}
          onNavigate={(screen) => setCurrentScreen(screen)}
        />

        {/* 3. Ask AI Prompt Card */}
        <AskTestBook onOpenStudio={() => setCurrentScreen('ask-textbook')} />

        {/* 4. My Projects */}
        <MyProjects
          onViewAll={() => setCurrentScreen('projects')}
          onOpenWorkspace={openWorkspace}
        />

        {/* 5. Syllabus Mind Map */}
        <SyllabusCard />

        {/* 6. Upcoming Events */}
        <UpcomingEvents />
      </div>
    );
  }
  return (
    /* DESKTOP TWO-ROW GRID LAYOUT */
    <>
      {/* TOP ROW: Welcome Block + Syllabus (Left) & Learning/Points Card (Right) */}
      <div
        style={{
          display: 'flex',
          flexDirection: windowWidth < 1080 ? 'column' : 'row',
          gap: '16px',
          alignItems: 'flex-start',
          width: '100%'
        }}
      >
        {/* Top Left Column: Welcome block (433x74) + Syllabus Mind Map (433 or 510 x 285) */}
        <div
          style={{
            width: windowWidth < 1080 ? '100%' : isSidebarCollapsed ? '510px' : '433px',
            minWidth: windowWidth < 1080 ? '100%' : isSidebarCollapsed ? '510px' : '433px',
            maxWidth: windowWidth < 1080 ? '100%' : isSidebarCollapsed ? '510px' : '433px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            flexShrink: 0,
            transition: 'width 280ms cubic-bezier(.2, .8, .2, 1), max-width 280ms cubic-bezier(.2, .8, .2, 1), min-width 280ms cubic-bezier(.2, .8, .2, 1)'
          }}
        >
          <HeaderWelcome
            onOpenNotifications={() => setIsNotificationOpen(true)}
            unreadCount={unreadNotificationsCount}
          />
          <SyllabusCard />
        </div>

        {/* Top Right Column: Learning Momentum / Points Card (822 or 873 x 395) */}
        <div
          style={{
            flex: 1,
            minWidth: 0,
            width: '100%',
            transition: 'all 280ms cubic-bezier(.2, .8, .2, 1)'
          }}
        >
          <LearningMomentum
            onViewResults={() => setCurrentScreen('results')}
            onViewChallenges={() => setCurrentScreen('challenges')}
            onOpenWorkspace={openWorkspace}
            onNavigate={(screen) => setCurrentScreen(screen)}
          />
        </div>
      </div>

      {/* BOTTOM ROW: Ask Text Book (535) + My Projects (386 or 510) + Upcoming Event (333) */}
      <div
        style={{
          display: 'flex',
          flexDirection: windowWidth < 1200 ? 'column' : 'row',
          gap: '16px',
          alignItems: 'stretch',
          width: '100%'
        }}
      >
        {/* Ask Text Book: Fixed 535px x 378px */}
        <div style={{ flexShrink: 0 }}>
          <AskTestBook onOpenStudio={() => setCurrentScreen('ask-textbook')} />
        </div>

        {/* My Projects: Absorbs remaining width (386px expanded -> 510px collapsed) */}
        <div
          style={{
            flex: 1,
            minWidth: '320px',
            transition: 'all 280ms cubic-bezier(.2, .8, .2, 1)'
          }}
        >
          <MyProjects
            onViewAll={() => setCurrentScreen('projects')}
            onOpenWorkspace={openWorkspace}
          />
        </div>

        {/* Upcoming Event: Fixed 333px x 378px */}
        <div style={{ flexShrink: 0 }}>
          <UpcomingEvents />
        </div>
      </div>
    </>
  );
}
