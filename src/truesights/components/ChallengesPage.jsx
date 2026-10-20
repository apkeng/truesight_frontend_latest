import React, { useState, useEffect, useMemo } from 'react';
import Icon from '../design-system/icons';
import ModalPortal from './ModalPortal';

// ============================================================================
// VERIFIED PEERS DATABASE FOR DIRECT ENGAGEMENT
// ============================================================================
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { api, invalidate, keys, setQueryData, useQuery } from '../data';
import { pathFor } from '../session';
import { countdown, timeAgo } from '../../revamp/lib/format';

// Challenge card status from the API's viewer-relative `state`.
const STATUS_FOR = {
  awaiting_peer: 'pending',
  invite_received: 'request',
  active: 'active',
  awaiting_peer_result: 'waiting',
  completed: 'finished',
  expired: 'expired',
  cancelled: 'expired',
  declined: 'expired'
};

/** A /api/v2/learn/challenges entry in the shape the challenge cards render. */
const toItem = (c) => {
  const status = STATUS_FOR[c.state] || 'expired';
  const total = c.myResult?.total || c.peerResult?.total || c.questionCount;
  const score = (r, won) => r && { points: r.score ?? 0, correct: r.score ?? 0, total: r.total || total, timeTaken: r.timeTaken || '—', won };
  return {
    id: c.id,
    raw: c,
    type: c.role === 'challenger' ? 'sent' : 'received',
    topic: c.topic,
    domain: c.domain || 'Peer quiz',
    opponent: {
      uid: c.peer?.uid,
      name: c.peer?.name || 'Peer',
      email: c.peer?.emailHint || '',
      dept: [c.peer?.educationLevel, c.peer?.instituteName].filter(Boolean).join(' · ') || 'TrueSights learner',
      avatar: c.peer?.photoURL || null
    },
    status,
    endedLabel: c.state === 'declined' ? 'Invitation declined' : c.state === 'cancelled' ? 'Invitation cancelled' : 'Invitation expired',
    mode: 'Any time',
    expires: status === 'finished' ? 'Completed' : status === 'expired' ? 'Terminated' : countdown(c.expiresAt),
    createdAt: c.completedAt ? new Date(c.completedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : timeAgo(c.createdAt),
    userScore: score(c.myResult, c.outcome === 'victory'),
    opponentScore: score(c.peerResult, c.outcome === 'defeat'),
    outcome: c.outcome
  };
};

// ============================================================================
// MAIN COMPONENT: CHALLENGES PAGE
// ============================================================================
export default function ChallengesPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [params, setParams] = useSearchParams();
  const { data, error, isLoading, refetch } = useQuery(keys.challenges(), api.challenges, { staleMs: 15_000 });
  // Navigation & Filter Tab state ('my-challenges' | 'requests' | 'active' | 'finished')
  const [activeTab, setActiveTab] = useState(() => {
    const urlTab = params.get('tab');
    if (['my-challenges', 'requests', 'active', 'finished'].includes(urlTab)) return urlTab;
    return 'my-challenges';
  });
  const challenges = useMemo(() => (data?.challenges || []).map(toItem), [data]);
  const [busyId, setBusyId] = useState(null);
  const [, tick] = useState(0);
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

  // Keep the "expires in" countdowns moving.
  useEffect(() => {
    const t = setInterval(() => tick((n) => n + 1), 30_000);
    return () => clearInterval(t);
  }, []);

  // New Challenge Modal State
  const [isNewChallengeModalOpen, setIsNewChallengeModalOpen] = useState(false);
  const [preset, setPreset] = useState(null);
  const topicsQuery = useQuery(isNewChallengeModalOpen ? keys.challengeTopics() : null, api.challengeTopics, { staleMs: 120_000 });
  const ACADEMIC_DOMAINS = useMemo(() => {
    const list = (topicsQuery.data || []).map((d) => ({ id: d.id, name: d.title, topics: d.topics.map((t) => ({ id: t, title: t })) }));
    // A preset topic that isn't in any roadmap (e.g. re-challenge) still needs a home.
    if (preset?.topic && !list.some((d) => d.topics.some((t) => t.id === preset.topic))) {
      list.unshift({ id: '__preset', name: preset.domain || 'Selected topic', topics: [{ id: preset.topic, title: preset.topic }] });
    }
    return list;
  }, [topicsQuery.data, preset]);
  const [selectedDomainId, setSelectedDomainId] = useState('');
  const [selectedTopicId, setSelectedTopicId] = useState('');
  const [searchPeerQuery, setSearchPeerQuery] = useState('');
  const [selectedPeer, setSelectedPeer] = useState(null);
  const [isPeerDropdownOpen, setIsPeerDropdownOpen] = useState(false);
  const [peers, setPeers] = useState([]);
  const [isAuthorizing, setIsAuthorizing] = useState(false);

  const openNewChallenge = (p = null) => {
    setPreset(p);
    setSelectedPeer(p?.peer ? { ...p.peer, id: p.peer.uid } : null);
    setSearchPeerQuery(p?.peer?.name || '');
    setSelectedDomainId('');
    setSelectedTopicId(p?.topic || '');
    setIsNewChallengeModalOpen(true);
  };

  // Arriving from a roadmap's "challenge a peer" button.
  useEffect(() => {
    if (location.state?.preset) {
      openNewChallenge(location.state.preset);
      navigate(location.pathname + location.search, { replace: true, state: null });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Seed the domain/topic once the roadmaps load.
  useEffect(() => {
    if (!isNewChallengeModalOpen || !ACADEMIC_DOMAINS.length || selectedDomainId) return;
    const match = preset?.topic && (ACADEMIC_DOMAINS.find((d) => d.name === preset.domain && d.topics.some((t) => t.id === preset.topic)) || ACADEMIC_DOMAINS.find((d) => d.topics.some((t) => t.id === preset.topic)));
    const dom = match || ACADEMIC_DOMAINS[0];
    setSelectedDomainId(dom.id);
    setSelectedTopicId(preset?.topic && match ? preset.topic : dom.topics[0]?.id || '');
  }, [isNewChallengeModalOpen, ACADEMIC_DOMAINS, selectedDomainId, preset]);

  // Debounced peer search.
  useEffect(() => {
    if (!isNewChallengeModalOpen) return undefined;
    const t = setTimeout(() => {
      api.peers(selectedPeer && searchPeerQuery === selectedPeer.name ? '' : searchPeerQuery.trim())
        .then((list) => setPeers(list.map((p) => ({ ...p, id: p.uid }))))
        .catch(() => setPeers([]));
    }, searchPeerQuery ? 220 : 0);
    return () => clearTimeout(t);
  }, [searchPeerQuery, isNewChallengeModalOpen, selectedPeer]);

  // Comparative Review Modal State for Finished challenges
  const [selectedComparisonModal, setSelectedComparisonModal] = useState(null);
  const compare = useQuery(selectedComparisonModal ? keys.compare(selectedComparisonModal.id) : null, () => api.compare(selectedComparisonModal.id), { staleMs: 300_000 });

  // ?compare=<id> / ?highlight=<id> from a notification.
  useEffect(() => {
    const target = challenges.find((c) => c.id === (params.get('compare') || params.get('highlight')));
    if (!target) return;
    setActiveTab(target.status === 'request' ? 'requests' : target.status === 'finished' ? 'finished' : 'my-challenges');
    if (params.get('compare') && target.status === 'finished') setSelectedComparisonModal(target);
    setParams({}, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [challenges]);

  // Question-by-question comparison from /challenges/:id/compare.
  const comparisonQuestions = useMemo(() => {
    return (compare.data?.questions || []).map((q) => {
      const correctOpt = { letter: '✓', text: q.correctAnswer };
      const userOpt = { letter: q.mine?.isCorrect ? '✓' : '✕', text: q.mine ? q.mine.answer || 'No answer' : 'Not answered' };
      const oppOpt = { letter: q.theirs?.isCorrect ? '✓' : '✕', text: q.theirs ? q.theirs.answer || 'No answer' : 'Not answered' };
      return {
        qNum: q.index,
        question: q.question,
        correctOpt,
        userOpt,
        isUserCorrect: Boolean(q.mine?.isCorrect),
        oppOpt,
        isOppCorrect: Boolean(q.theirs?.isCorrect),
        explanation: q.explanation || ''
      };
    });
  }, [compare.data]);

  const comparisonStats = useMemo(() => {
    if (!comparisonQuestions.length) {
      return { total: 0, bothCorrect: 0, userAdvantage: 0, oppAdvantage: 0, bothMissed: 0 };
    }
    let bothCorrect = 0;
    let userAdvantage = 0;
    let oppAdvantage = 0;
    let bothMissed = 0;

    comparisonQuestions.forEach((cq) => {
      if (cq.isUserCorrect && cq.isOppCorrect) bothCorrect++;
      else if (cq.isUserCorrect && !cq.isOppCorrect) userAdvantage++;
      else if (!cq.isUserCorrect && cq.isOppCorrect) oppAdvantage++;
      else bothMissed++;
    });

    return {
      total: comparisonQuestions.length,
      bothCorrect,
      userAdvantage,
      oppAdvantage,
      bothMissed
    };
  }, [comparisonQuestions]);

  const showToast = (msg) => toast.info(msg);

  // Search state for filtering challenges by topic or opponent
  const [challengeSearchQuery, setChallengeSearchQuery] = useState('');

  // Helper to filter items by search query
  const filterBySearch = (list) => {
    if (!challengeSearchQuery.trim()) return list;
    const q = challengeSearchQuery.toLowerCase().trim();
    return list.filter((c) =>
      c.topic?.toLowerCase().includes(q) ||
      c.domain?.toLowerCase().includes(q) ||
      c.opponent?.name?.toLowerCase().includes(q)
    );
  };

  // Filtered lists for each tab
  const myChallengesList = useMemo(() => {
    return filterBySearch(challenges.filter((c) => c.status !== 'request'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [challenges, challengeSearchQuery]);

  const requestsList = useMemo(() => {
    return filterBySearch(challenges.filter((c) => c.status === 'request'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [challenges, challengeSearchQuery]);

  const activeList = useMemo(() => {
    return filterBySearch(challenges.filter((c) => c.status === 'active' || c.status === 'waiting'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [challenges, challengeSearchQuery]);

  const finishedList = useMemo(() => {
    return filterBySearch(challenges.filter((c) => c.status === 'finished'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [challenges, challengeSearchQuery]);

  // Current domain & topics mapping
  const currentDomainObj = useMemo(() => {
    return ACADEMIC_DOMAINS.find((d) => d.id === selectedDomainId) || ACADEMIC_DOMAINS[0] || { id: '', name: '', topics: [] };
  }, [ACADEMIC_DOMAINS, selectedDomainId]);

  // Peers from the server-side search (name or email prefix; same campus first)
  const filteredPeers = peers.map((p) => ({
    ...p,
    email: p.emailHint || '',
    dept: [p.educationLevel, p.instituteName].filter(Boolean).join(' · ') || p.role || 'TrueSights learner',
    avatar: p.photoURL
  }));

  // Handler: Authorize and dispatch new peer challenge
  const handleAuthorizeChallenge = async () => {
    if (!selectedPeer) {
      showToast('Please search and select a verified peer to authorize the challenge.');
      return;
    }
    if (!selectedTopicId) {
      showToast('Pick a topic from one of your roadmaps first.');
      return;
    }
    setIsAuthorizing(true);
    try {
      await api.createChallenge({ topic: selectedTopicId, domain: currentDomainObj.id === '__preset' ? preset?.domain || null : currentDomainObj.name, opponentId: selectedPeer.uid });
      invalidate(keys.challenges(), keys.dashboard());
      toast.success(`Challenge sent to ${selectedPeer.name}. They have 24 hours to play.`);
      setIsNewChallengeModalOpen(false);
      setSelectedPeer(null);
      setSearchPeerQuery('');
      setActiveTab('my-challenges');
    } catch (e) {
      toast.error(e.message || "Couldn't create the challenge.");
    } finally {
      setIsAuthorizing(false);
    }
  };

  const act = async (item, fn, patch, message) => {
    setBusyId(item.id);
    try {
      await fn(item.id);
      setQueryData(keys.challenges(), (d) => d && { ...d, challenges: d.challenges.map((x) => (x.id === item.id ? { ...x, ...patch } : x)) });
      invalidate(keys.challenges(), keys.bootstrap(), keys.dashboard());
      if (message) toast.success(message);
      return true;
    } catch (e) {
      toast.error(e.message);
      invalidate(keys.challenges());
      return false;
    } finally {
      setBusyId(null);
    }
  };

  const startQuizForChallenge = (item) => navigate(`${pathFor('quiz', item.topic)}?challengeId=${item.id}`);

  // Handler: Accept incoming friend request, then play right away
  const handleAcceptRequest = async (item) => {
    if (await act(item, api.acceptChallenge, { status: 'accepted', state: 'active' }, 'Challenge accepted - good luck!')) startQuizForChallenge(item);
  };

  // Handler: Decline incoming request
  const handleDeclineRequest = (challengeId) => {
    const item = challenges.find((c) => c.id === challengeId);
    if (item) act(item, api.declineChallenge, { status: 'declined', state: 'declined' }, 'Challenge request declined.');
  };

  // Handler: Cancel sent challenge
  const handleCancelChallenge = (challengeId) => {
    const item = challenges.find((c) => c.id === challengeId);
    if (item) act(item, api.cancelChallenge, { status: 'cancelled', state: 'cancelled' }, 'Challenge invitation cancelled.');
  };

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
          1. TOP HERO BANNER (Pixel-Perfect Match to Figma Node 210:53377)
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
          gap: isMobile ? '12px' : '20px',
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
            width: '200px',
            height: '200px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(254, 224, 71, 0.08) 0%, rgba(255, 255, 255, 0) 70%)',
            pointerEvents: 'none'
          }}
        />

        {/* Left: Heading 1 & Subtitle */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxWidth: '640px', zIndex: 1 }}>

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
            Show what you know
          </h1>
          <p
            style={{
              fontSize: isMobile ? '12.5px' : '13.5px',
              color: 'rgba(255, 255, 255, 0.9)',
              margin: 0,
              lineHeight: isMobile ? '18px' : '20px'
            }}
          >
            Challenge your friends to a quick quiz and see who knows more. Earn points and climb the leaderboard.
          </p>
        </div>

        {/* Right Action: "+ New Challenge" Yellow Button */}
        <button
          type="button"
          onClick={() => openNewChallenge()}
          style={{
            background: '#FEE047',
            border: 'none',
            borderRadius: '10px',
            padding: isMobile ? '12px 18px' : '12px 24px',
            width: isMobile ? '100%' : 'auto',
            justifyContent: 'center',
            color: '#0B1A2B',
            fontSize: '13px',
            fontWeight: 800,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 4px 14px rgba(254, 224, 71, 0.35)',
            transition: 'all 0.18s ease',
            zIndex: 1
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
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0B1A2B" strokeWidth="3" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          <span>New Challenge</span>
        </button>
      </div>

      {/* ======================================================================
          2. FILTER & NAVIGATION TABS WITH SEARCH
          ====================================================================== */}
      <div
        style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          alignItems: isMobile ? 'stretch' : 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
          gap: isMobile ? '10px' : '14px',
          flexWrap: 'wrap'
        }}
      >
        {/* Left: Segmented Tabs */}
        <div
          style={{
            background: '#FFFFFF',
            border: '1px solid #E2DDD3',
            borderRadius: '10px',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            gap: '3px',
            overflowX: isMobile ? 'auto' : 'visible',
            maxWidth: '100%',
            whiteSpace: 'nowrap',
            WebkitOverflowScrolling: 'touch'
          }}
        >
          {/* Tab 1: MY CHALLENGES */}
          <button
            type="button"
            onClick={() => setActiveTab('my-challenges')}
            style={{
              background: activeTab === 'my-challenges' ? '#0B3A6F' : 'transparent',
              color: activeTab === 'my-challenges' ? '#FFFFFF' : '#8A97A6',
              border: 'none',
              borderRadius: '7px',
              padding: '8px 18px',
              fontSize: '12px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.6px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              transition: 'all 0.15s'
            }}
          >
            <Icon name="challenges" size={14} color={activeTab === 'my-challenges' ? '#FEE047' : 'currentColor'} />
            <span>My Challenges</span>
            <span
              style={{
                background: activeTab === 'my-challenges' ? 'rgba(255, 255, 255, 0.2)' : '#F1F5F9',
                color: activeTab === 'my-challenges' ? '#FFFFFF' : '#64748B',
                fontSize: '11px',
                fontWeight: 700,
                padding: '1px 7px',
                borderRadius: '10px'
              }}
            >
              {myChallengesList.length}
            </span>
          </button>

          {/* Tab 2: REQUESTS */}
          <button
            type="button"
            onClick={() => setActiveTab('requests')}
            style={{
              background: activeTab === 'requests' ? '#0B3A6F' : 'transparent',
              color: activeTab === 'requests' ? '#FFFFFF' : '#8A97A6',
              border: 'none',
              borderRadius: '7px',
              padding: '8px 18px',
              fontSize: '12px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.6px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              transition: 'all 0.15s'
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            <span>Requests</span>
            {requestsList.length > 0 && (
              <span
                style={{
                  background: activeTab === 'requests' ? '#FEE047' : '#EF4444',
                  color: activeTab === 'requests' ? '#0B1A2B' : '#FFFFFF',
                  fontSize: '11px',
                  fontWeight: 800,
                  padding: '1px 7px',
                  borderRadius: '10px'
                }}
              >
                {requestsList.length}
              </span>
            )}
          </button>

          {/* Tab 3: ACTIVE */}
          <button
            type="button"
            onClick={() => setActiveTab('active')}
            style={{
              background: activeTab === 'active' ? '#0B3A6F' : 'transparent',
              color: activeTab === 'active' ? '#FFFFFF' : '#8A97A6',
              border: 'none',
              borderRadius: '7px',
              padding: '8px 18px',
              fontSize: '12px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.6px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              transition: 'all 0.15s'
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
            </svg>
            <span>Active</span>
            <span
              style={{
                background: activeTab === 'active' ? 'rgba(255, 255, 255, 0.2)' : '#F1F5F9',
                color: activeTab === 'active' ? '#FFFFFF' : '#64748B',
                fontSize: '11px',
                fontWeight: 700,
                padding: '1px 7px',
                borderRadius: '10px'
              }}
            >
              {activeList.length}
            </span>
          </button>

          {/* Tab 4: FINISHED */}
          <button
            type="button"
            onClick={() => setActiveTab('finished')}
            style={{
              background: activeTab === 'finished' ? '#0B3A6F' : 'transparent',
              color: activeTab === 'finished' ? '#FFFFFF' : '#8A97A6',
              border: 'none',
              borderRadius: '7px',
              padding: '8px 18px',
              fontSize: '12px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.6px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              transition: 'all 0.15s'
            }}
          >
            <Icon name="checkCircle" size={14} color={activeTab === 'finished' ? '#FFFFFF' : 'currentColor'} />
            <span>Finished</span>
            <span
              style={{
                background: activeTab === 'finished' ? 'rgba(255, 255, 255, 0.2)' : '#F1F5F9',
                color: activeTab === 'finished' ? '#FFFFFF' : '#64748B',
                fontSize: '11px',
                fontWeight: 700,
                padding: '1px 7px',
                borderRadius: '10px'
              }}
            >
              {finishedList.length}
            </span>
          </button>
        </div>

        {/* Right: Search Input */}
        <div
          style={{
            position: 'relative',
            width: isMobile ? '100%' : '240px',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <span style={{ position: 'absolute', left: '10px', color: '#8A97A6', display: 'flex', alignItems: 'center', pointerEvents: 'none' }}>
            <Icon name="search" size={14} color="#8A97A6" />
          </span>
          <input
            type="text"
            placeholder="Search challenges or peers..."
            value={challengeSearchQuery}
            onChange={(e) => setChallengeSearchQuery(e.target.value)}
            style={{
              width: '100%',
              height: '38px',
              background: '#FFFFFF',
              border: '1px solid #E2DDD3',
              borderRadius: '8px',
              padding: '0 28px 0 32px',
              fontSize: '12px',
              fontFamily: 'var(--font-primary, sans-serif)',
              color: '#0B1A2B',
              outline: 'none',
              boxSizing: 'border-box'
            }}
            onFocus={(e) => { e.target.style.borderColor = '#0B3A6F'; }}
            onBlur={(e) => { e.target.style.borderColor = '#E2DDD3'; }}
          />
          {challengeSearchQuery && (
            <button
              type="button"
              onClick={() => setChallengeSearchQuery('')}
              style={{
                position: 'absolute',
                right: '8px',
                background: 'none',
                border: 'none',
                color: '#8A97A6',
                cursor: 'pointer',
                padding: 0,
                fontSize: '12px'
              }}
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* ======================================================================
          3. CHALLENGE CARDS GRID (Pixel-Perfect Match to Figma Node 210:53408)
          ====================================================================== */}
      {(() => {
        const currentTabList =
          activeTab === 'my-challenges'
            ? myChallengesList
            : activeTab === 'requests'
            ? requestsList
            : activeTab === 'active'
            ? activeList
            : finishedList;

        if (error && !data) {
          return (
            <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '14px', padding: '16px 18px', color: '#DC2626', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
              <span>Couldn't load your challenges: {error.message}</span>
              <button type="button" onClick={() => refetch()} style={{ background: '#FFFFFF', border: '1px solid #FECACA', borderRadius: '8px', padding: '6px 12px', color: '#DC2626', fontWeight: 700, cursor: 'pointer' }}>
                Retry
              </button>
            </div>
          );
        }
        if (isLoading) {
          return (
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(420px, 1fr))', gap: isMobile ? '14px' : '20px' }}>
              {[0, 1, 2, 3].map((i) => <div key={i} className="skeleton-shimmer" style={{ height: '260px', borderRadius: '16px' }} />)}
            </div>
          );
        }

        if (currentTabList.length === 0) {
          return (
            <div
              style={{
                background: '#FFFFFF',
                borderRadius: '14px',
                border: '1px dashed #CBD5E1',
                padding: '48px 24px',
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
                  justifyContent: 'center'
                }}
              >
                <Icon name="challenges" size={24} color="#64748B" />
              </div>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#0B1A2B' }}>
                No challenges found in this section
              </h3>
              <p style={{ margin: 0, fontSize: '13px', color: '#64748B' }}>
                {activeTab === 'requests'
                  ? 'You currently have no incoming challenge invites from peers.'
                  : activeTab === 'active'
                  ? 'No challenges currently in progress. Start one by clicking New Challenge!'
                  : 'Start a new challenge with a verified peer to test your mastery.'}
              </p>
              {activeTab !== 'requests' && (
                <button
                  type="button"
                  onClick={() => openNewChallenge()}
                  style={{
                    marginTop: '8px',
                    padding: '8px 18px',
                    borderRadius: '8px',
                    background: '#0B3A6F',
                    color: '#FFFFFF',
                    fontSize: '12px',
                    fontWeight: 700,
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  Create New Challenge
                </button>
              )}
            </div>
          );
        }

        return (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(420px, 1fr))',
              gap: isMobile ? '14px' : '20px',
              paddingBottom: '32px'
            }}
          >
            {currentTabList.map((item) => {
              // Status Pill configuration matching TrueSights Design System
              let pillBg = '#FFFBEB';
              let pillColor = '#B45309';
              let pillBorder = '#FDE68A';
              let pillLabel = 'Awaiting Peer';
              let pillIcon = (
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              );

              if (item.status === 'active') {
                pillBg = '#ECFDF5';
                pillColor = '#047857';
                pillBorder = '#A7F3D0';
                pillLabel = 'Active';
                pillIcon = (
                  <span
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      background: '#10B981',
                      display: 'inline-block'
                    }}
                  />
                );
              } else if (item.status === 'waiting') {
                pillLabel = 'Peer Playing';
              } else if (item.status === 'request') {
                pillBg = '#EFF6FF';
                pillColor = '#1D4ED8';
                pillBorder = '#BFDBFE';
                pillLabel = 'Invite Received';
                pillIcon = (
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <line x1="19" y1="8" x2="19" y2="14" />
                    <line x1="22" y1="11" x2="16" y2="11" />
                  </svg>
                );
              } else if (item.status === 'expired') {
                pillBg = '#F8FAFC';
                pillColor = '#64748B';
                pillBorder = '#E2E8F0';
                pillLabel = 'Expired';
                pillIcon = (
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="15" y1="9" x2="9" y2="15" />
                    <line x1="9" y1="9" x2="15" y2="15" />
                  </svg>
                );
              } else if (item.status === 'finished') {
                pillBg = '#F0FDF4';
                pillColor = '#15803D';
                pillBorder = '#BBF7D0';
                pillLabel = 'Completed';
                pillIcon = (
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                );
              }

              return (
                <div
                  key={item.id}
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
                    transition: 'box-shadow 0.2s ease, transform 0.2s ease, border-color 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = '0 10px 24px -2px rgba(11, 26, 43, 0.08)';
                    e.currentTarget.style.borderColor = '#CBD5E1';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(11, 26, 43, 0.03)';
                    e.currentTarget.style.borderColor = '#E2DDD3';
                    e.currentTarget.style.transform = 'none';
                  }}
                >
                  {/* Card Main Body */}
                  <div style={{ padding: '22px 24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {/* Header Row: Academic Domain Badge + Status Pill */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                      <div
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          background: '#F8FAFC',
                          border: '1px solid #E2E8F0',
                          borderRadius: '6px',
                          padding: '4px 9px',
                          maxWidth: '260px'
                        }}
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#0B3A6F" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                        </svg>
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            color: '#334155',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}
                          title={item.domain}
                        >
                          {item.domain}
                        </span>
                      </div>

                      {/* Status Pill */}
                      <span
                        style={{
                          background: pillBg,
                          color: pillColor,
                          border: `1px solid ${pillBorder}`,
                          padding: '4px 10px',
                          borderRadius: '6px',
                          fontSize: '10.5px',
                          fontWeight: 800,
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          flexShrink: 0
                        }}
                      >
                        {pillIcon}
                        <span>{pillLabel}</span>
                      </span>
                    </div>

                    {/* Topic Title */}
                    <div>
                      <h3
                        style={{
                          fontFamily: 'var(--font-heading, "Space Grotesk", sans-serif)',
                          fontSize: '17.5px',
                          fontWeight: 700,
                          color: '#0B1A2B',
                          margin: 0,
                          lineHeight: '23px',
                          letterSpacing: '-0.01em'
                        }}
                      >
                        {item.topic}
                      </h3>
                    </div>

                    {/* Peer Challenger Pod (Social Presence) */}
                    <div
                      style={{
                        background: '#FAF9F6',
                        border: '1px solid #EFEAE1',
                        borderRadius: '12px',
                        padding: '11px 14px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '12px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flex: 1 }}>
                        {/* Peer Avatar */}
                        <div
                          style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            overflow: 'hidden',
                            border: '2px solid #FFFFFF',
                            boxShadow: '0 2px 6px rgba(11, 26, 43, 0.08)',
                            flexShrink: 0,
                            backgroundColor: '#0B3A6F',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#FFFFFF',
                            fontSize: '13px',
                            fontWeight: 800
                          }}
                        >
                          {item.opponent?.avatar ? (
                            <img
                              src={item.opponent.avatar}
                              alt={item.opponent.name}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          ) : (
                            item.opponent?.name?.charAt(0) || 'P'
                          )}
                        </div>

                        {/* Peer Name & Dept */}
                        <div style={{ minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span
                              style={{
                                fontSize: '13px',
                                fontWeight: 700,
                                color: '#0B1A2B',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                              }}
                            >
                              {item.opponent?.name}
                            </span>
                            <span
                              style={{
                                background: item.type === 'received' ? '#E0E7FF' : '#E2E8F0',
                                color: item.type === 'received' ? '#4338CA' : '#475569',
                                fontSize: '9.5px',
                                fontWeight: 700,
                                padding: '1px 6px',
                                borderRadius: '4px',
                                textTransform: 'uppercase',
                                letterSpacing: '0.4px',
                                flexShrink: 0
                              }}
                            >
                              {item.type === 'received' ? 'Challenger' : 'Invited Peer'}
                            </span>
                          </div>
                          <div
                            style={{
                              fontSize: '11px',
                              color: '#64748B',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              marginTop: '1px'
                            }}
                          >
                            {item.opponent?.dept || item.opponent?.email}
                          </div>
                        </div>
                      </div>

                      {/* Right Side of Peer Pod */}
                      {item.status === 'finished' && item.userScore ? (
                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                          <span
                            style={{
                              fontSize: '10px',
                              fontWeight: 700,
                              textTransform: 'uppercase',
                              color: '#64748B',
                              letterSpacing: '0.4px',
                              display: 'block'
                            }}
                          >
                            Outcome
                          </span>
                          <span
                            style={{
                              fontSize: '12.5px',
                              fontWeight: 800,
                              color: item.outcome === 'victory' ? '#059669' : item.outcome === 'tie' ? '#1D4ED8' : '#DC2626'
                            }}
                          >
                            {item.outcome === 'victory' ? 'Victory' : item.outcome === 'tie' ? 'Tie' : 'Defeat'}
                          </span>
                        </div>
                      ) : (
                        <div
                          style={{
                            fontSize: '11px',
                            color: '#0B3A6F',
                            fontWeight: 700,
                            background: 'rgba(11, 58, 111, 0.06)',
                            padding: '4px 8px',
                            borderRadius: '6px',
                            flexShrink: 0,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <span>Verified</span>
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* Telemetry Boxes: MODE & EXPIRES */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <div
                        style={{
                          background: '#FAF9F6',
                          border: '1px solid #EFEAE1',
                          borderRadius: '8px',
                          padding: '9px 12px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '3px'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#8A97A6" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <polygon points="5 3 19 12 5 21 5 3" />
                          </svg>
                          <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#8A97A6' }}>
                            ENGAGEMENT MODE
                          </span>
                        </div>
                        <span style={{ fontSize: '12.5px', fontWeight: 600, color: '#0B1A2B' }}>
                          {item.mode} (Async)
                        </span>
                      </div>

                      <div
                        style={{
                          background: '#FAF9F6',
                          border: '1px solid #EFEAE1',
                          borderRadius: '8px',
                          padding: '9px 12px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '3px'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#8A97A6" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10" />
                            <polyline points="12 6 12 12 16 14" />
                          </svg>
                          <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#8A97A6' }}>
                            EXPIRES IN
                          </span>
                        </div>
                        <span
                          style={{
                            fontSize: '12.5px',
                            fontWeight: 600,
                            color: item.expires === 'Terminated' ? '#DC2626' : item.status === 'active' ? '#059669' : '#0B1A2B'
                          }}
                        >
                          {item.expires === 'Terminated' ? 'Expired' : item.expires}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer Action Bar */}
                  <div
                    style={{
                      borderTop: '1px solid #F1EFE9',
                      padding: '13px 22px',
                      background: '#FAFBFD',
                      borderRadius: '0 0 16px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      boxSizing: 'border-box'
                    }}
                  >
                    {/* State-specific CTA actions */}
                    {item.status === 'request' ? (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', width: '100%', gap: '10px' }}>
                        <button
                          type="button"
                          onClick={() => handleDeclineRequest(item.id)}
                          disabled={busyId === item.id}
                          style={{
                            background: '#FFFFFF',
                            border: '1px solid #CBD5E1',
                            borderRadius: '8px',
                            padding: '8px 16px',
                            fontSize: '12px',
                            fontWeight: 700,
                            color: '#64748B',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = '#94A3B8';
                            e.currentTarget.style.color = '#1E293B';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = '#CBD5E1';
                            e.currentTarget.style.color = '#64748B';
                          }}
                        >
                          Decline
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAcceptRequest(item)}
                          disabled={busyId === item.id}
                          style={{
                            background: '#FEE047',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '8px 18px',
                            fontSize: '12.5px',
                            fontWeight: 800,
                            color: '#0B1A2B',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            boxShadow: '0 2px 8px rgba(254, 224, 71, 0.35)',
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
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                          <span>{busyId === item.id ? 'Accepting…' : 'Accept Challenge'}</span>
                        </button>
                      </div>
                    ) : item.status === 'active' ? (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', width: '100%' }}>
                        <button
                          type="button"
                          onClick={() => startQuizForChallenge(item)}
                          style={{
                            width: '100%',
                            height: '38px',
                            background: '#FEE047',
                            border: 'none',
                            borderRadius: '8px',
                            color: '#0B1A2B',
                            fontSize: '13px',
                            fontWeight: 800,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            boxShadow: '0 2px 8px rgba(254, 224, 71, 0.4)',
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
                          <Icon name="play" variant="bold" size={13} color="#0B1A2B" />
                          <span>Start Quiz Now</span>
                        </button>
                      </div>
                    ) : item.status === 'finished' ? (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>Your Score:</span>
                          <strong style={{ fontSize: '13px', color: item.userScore?.won ? '#059669' : '#0B3A6F' }}>
                            {item.userScore?.correct ?? 0}/{item.userScore?.total}
                          </strong>
                        </div>
                        <button
                          type="button"
                          onClick={() => setSelectedComparisonModal(item)}
                          style={{
                            background: '#0B3A6F',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '8px 16px',
                            color: '#FFFFFF',
                            fontSize: '12px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            boxShadow: '0 2px 6px rgba(11, 58, 111, 0.2)',
                            transition: 'all 0.15s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#092C54';
                            e.currentTarget.style.transform = 'translateY(-1px)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = '#0B3A6F';
                            e.currentTarget.style.transform = 'none';
                          }}
                        >
                          <span>Compare Results</span>
                          <Icon name="chevronRight" size={12} color="#FFFFFF" />
                        </button>
                      </div>
                    ) : item.status === 'waiting' ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', width: '100%' }}>
                        <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#F59E0B', display: 'inline-block' }} />
                        <span style={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>
                          You scored <strong style={{ color: '#0B1A2B' }}>{item.userScore?.correct}/{item.userScore?.total}</strong> · waiting for {item.opponent.name} to play
                        </span>
                      </div>
                    ) : item.status === 'pending' ? (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span
                            style={{
                              width: '7px',
                              height: '7px',
                              borderRadius: '50%',
                              backgroundColor: '#F59E0B',
                              display: 'inline-block'
                            }}
                          />
                          <span style={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>
                            Awaiting peer response
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCancelChallenge(item.id)}
                          disabled={busyId === item.id}
                          style={{
                            background: '#FFFFFF',
                            border: '1px solid #E2E8F0',
                            borderRadius: '6px',
                            padding: '6px 14px',
                            fontSize: '11.5px',
                            fontWeight: 700,
                            color: '#64748B',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = '#FCA5A5';
                            e.currentTarget.style.color = '#DC2626';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = '#E2E8F0';
                            e.currentTarget.style.color = '#64748B';
                          }}
                        >
                          Cancel Invite
                        </button>
                      </div>
                    ) : (
                      /* Expired */
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                        <span style={{ fontSize: '12px', color: '#94A3B8', fontWeight: 600 }}>
                          {item.endedLabel}
                        </span>
                        <button
                          type="button"
                          onClick={() => openNewChallenge({ topic: item.topic, domain: item.raw.domain, peer: item.raw.peer })}
                          style={{
                            background: '#FFFFFF',
                            border: '1px solid #CBD5E1',
                            borderRadius: '6px',
                            padding: '6px 14px',
                            fontSize: '11.5px',
                            fontWeight: 700,
                            color: '#0B3A6F',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = '#0B3A6F';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = '#CBD5E1';
                          }}
                        >
                          Re-challenge
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        );
      })()}

      {/* ======================================================================
          4. "NEW CHALLENGE" MODAL POPUP
          "Select a domain and authorize an engagement with verified peers"
          ====================================================================== */}
      {isNewChallengeModalOpen && (
        <ModalPortal isOpen={true} onClose={() => setIsNewChallengeModalOpen(false)}>
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
              width: '100%',
              maxWidth: '560px',
              background: '#FFFFFF',
              borderRadius: '16px',
              boxShadow: '0 24px 60px rgba(0, 0, 0, 0.25)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden'
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '20px 24px',
                background: '#0B3A6F',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: '16px'
              }}
            >
              <div>
                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    background: 'rgba(255, 255, 255, 0.18)',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    display: 'inline-block',
                    marginBottom: '6px'
                  }}
                >
                  DIRECT PEER ENGAGEMENT
                </span>
                <h2
                  style={{
                    fontFamily: 'var(--font-heading, "Space Grotesk", sans-serif)',
                    fontSize: '20px',
                    fontWeight: 800,
                    margin: 0
                  }}
                >
                  Authorize a Peer Challenge
                </h2>
                <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: 'rgba(255, 255, 255, 0.82)' }}>
                  Select an academic domain and authorize an engagement with verified peers.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsNewChallengeModalOpen(false)}
                style={{
                  background: 'rgba(255, 255, 255, 0.15)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '30px',
                  height: '30px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF',
                  cursor: 'pointer',
                  fontSize: '15px'
                }}
              >
                ✕
              </button>
            </div>

            {/* Modal Form Content */}
            <div
              style={{
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '18px',
                boxSizing: 'border-box'
              }}
            >
              {/* 1. Academic Domain Dropdown */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#0B1A2B' }}>
                  1. Academic Domain:
                </label>
                <div style={{ position: 'relative' }}>
                  <select
                    value={selectedDomainId}
                    onChange={(e) => {
                      const newDom = e.target.value;
                      setSelectedDomainId(newDom);
                      const domObj = ACADEMIC_DOMAINS.find((d) => d.id === newDom);
                      if (domObj && domObj.topics.length > 0) {
                        setSelectedTopicId(domObj.topics[0].id);
                      }
                    }}
                    style={{
                      width: '100%',
                      height: '40px',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      padding: '0 32px 0 12px',
                      background: '#FFFFFF',
                      fontSize: '13px',
                      color: '#0B1A2B',
                      outline: 'none',
                      appearance: 'none',
                      WebkitAppearance: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    {topicsQuery.isLoading && <option value="">Loading your roadmaps…</option>}
                    {!topicsQuery.isLoading && !ACADEMIC_DOMAINS.length && <option value="">Create a roadmap first to pick topics</option>}
                    {ACADEMIC_DOMAINS.map((dom) => (
                      <option key={dom.id} value={dom.id}>
                        {dom.name}
                      </option>
                    ))}
                  </select>
                  <span style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                    <Icon name="chevronDown" size={14} color="#64748B" />
                  </span>
                </div>
              </div>

              {/* 2. Topic Selector */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#0B1A2B' }}>
                  2. Challenge Quiz Topic:
                </label>
                <div style={{ position: 'relative' }}>
                  <select
                    value={selectedTopicId}
                    onChange={(e) => setSelectedTopicId(e.target.value)}
                    style={{
                      width: '100%',
                      height: '40px',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      padding: '0 32px 0 12px',
                      background: '#FFFFFF',
                      fontSize: '13px',
                      color: '#0B1A2B',
                      outline: 'none',
                      appearance: 'none',
                      WebkitAppearance: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    {currentDomainObj.topics.map((top) => (
                      <option key={top.id} value={top.id}>
                        {top.title}
                      </option>
                    ))}
                  </select>
                  <span style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                    <Icon name="chevronDown" size={14} color="#64748B" />
                  </span>
                </div>
              </div>

              {/* 3. Search User (Drop name or Email ID) */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', position: 'relative' }}>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#0B1A2B' }}>
                  3. Search Verified Peer:
                </label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#8A97A6' }}>
                    <Icon name="search" size={14} color="#8A97A6" />
                  </span>
                  <input
                    type="text"
                    placeholder="Drop friend name or campus email (e.g. sandeep.c@campus.edu)..."
                    value={searchPeerQuery}
                    onChange={(e) => {
                      setSearchPeerQuery(e.target.value);
                      setIsPeerDropdownOpen(true);
                    }}
                    onFocus={() => setIsPeerDropdownOpen(true)}
                    style={{
                      width: '100%',
                      height: '40px',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      padding: '0 32px 0 36px',
                      fontSize: '13px',
                      color: '#0B1A2B',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                  {searchPeerQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchPeerQuery('')}
                      style={{
                        position: 'absolute',
                        right: '10px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        color: '#8A97A6',
                        cursor: 'pointer'
                      }}
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Autocomplete peer dropdown */}
                {isPeerDropdownOpen && filteredPeers.length > 0 && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '70px',
                      left: 0,
                      right: 0,
                      background: '#FFFFFF',
                      border: '1px solid #CBD5E1',
                      borderRadius: '8px',
                      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
                      maxHeight: '190px',
                      overflowY: 'auto',
                      zIndex: 100,
                      display: 'flex',
                      flexDirection: 'column'
                    }}
                  >
                    {filteredPeers.map((peer) => (
                      <button
                        key={peer.id}
                        type="button"
                        onClick={() => {
                          setSelectedPeer(peer);
                          setSearchPeerQuery(peer.name);
                          setIsPeerDropdownOpen(false);
                        }}
                        title={peer.sameInstitute ? 'From your campus' : undefined}
                        style={{
                          padding: '10px 14px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          border: 'none',
                          borderBottom: '1px solid #F1F5F9',
                          background: selectedPeer?.id === peer.id ? '#F0F7FF' : '#FFFFFF',
                          cursor: 'pointer',
                          textAlign: 'left'
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = '#F8FAFC'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = selectedPeer?.id === peer.id ? '#F0F7FF' : '#FFFFFF'; }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          {peer.avatar ? (
                            <img
                              src={peer.avatar}
                              alt={peer.name}
                              style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }}
                            />
                          ) : (
                            <span style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#0B3A6F', color: '#FFFFFF', fontSize: '12px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              {peer.name.charAt(0)}
                            </span>
                          )}
                          <div>
                            <div style={{ fontSize: '13px', fontWeight: 700, color: '#0B1A2B' }}>
                              {peer.name}
                            </div>
                            <div style={{ fontSize: '11px', color: '#64748B' }}>
                              {[peer.email, peer.dept].filter(Boolean).join(' · ')}
                            </div>
                          </div>
                        </div>
                        {peer.sameInstitute && (
                          <span style={{ fontSize: '9.5px', fontWeight: 800, color: '#047857', background: '#ECFDF5', padding: '2px 6px', borderRadius: '4px', textTransform: 'uppercase' }}>
                            Your campus
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )}

                {/* Selected Peer Preview Pill */}
                {selectedPeer && (
                  <div
                    style={{
                      background: '#ECFDF5',
                      border: '1px solid #A7F3D0',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginTop: '4px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ color: '#059669', fontSize: '14px' }}>✓</span>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: '#065F46' }}>
                        Verified Target: <strong>{selectedPeer.name}</strong>{selectedPeer.email || selectedPeer.emailHint ? ` (${selectedPeer.email || selectedPeer.emailHint})` : ''}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedPeer(null);
                        setSearchPeerQuery('');
                      }}
                      style={{ background: 'none', border: 'none', color: '#065F46', fontSize: '12px', cursor: 'pointer' }}
                    >
                      Clear
                    </button>
                  </div>
                )}
              </div>

              {/* Mode Note */}
              <div
                style={{
                  background: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '12px',
                  color: '#64748B'
                }}
              >
                <Icon name="clock" size={14} color="#0B3A6F" />
                <span>
                  <strong>Asynchronous Engagement:</strong> No scheduled live section required. Your friend can take the challenge at any time within 24 hours.
                </span>
              </div>
            </div>

            {/* Modal Footer */}
            <div
              style={{
                padding: '16px 24px',
                borderTop: '1px solid #E2E8F0',
                background: '#F8FAFC',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: '12px'
              }}
            >
              <button
                type="button"
                onClick={() => setIsNewChallengeModalOpen(false)}
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #CBD5E1',
                  borderRadius: '6px',
                  padding: '8px 18px',
                  fontSize: '12.5px',
                  fontWeight: 600,
                  color: '#0B1A2B',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleAuthorizeChallenge}
                disabled={isAuthorizing}
                style={{
                  background: '#FEE047',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '9px 22px',
                  fontSize: '12.5px',
                  fontWeight: 800,
                  color: '#0B1A2B',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 2px 6px rgba(254, 224, 71, 0.35)'
                }}
              >
                <span>{isAuthorizing ? 'Generating questions…' : 'Authorize Challenge'}</span>
                <Icon name="chevronRight" size={12} color="#0B1A2B" />
              </button>
            </div>
          </div>
        </ModalPortal>
      )}

      {/* ======================================================================
          5. COMPARATIVE REVIEW MODAL FOR FINISHED CHALLENGES
          ====================================================================== */}
      {selectedComparisonModal && (
        <ModalPortal isOpen={true} onClose={() => setSelectedComparisonModal(null)}>
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: isMobile ? '95%' : '100%',
              maxWidth: '760px',
              maxHeight: isMobile ? '92vh' : '88vh',
              background: '#FFFFFF',
              borderRadius: isMobile ? '16px' : '20px',
              boxShadow: '0 24px 60px rgba(0, 0, 0, 0.25)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden'
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: isMobile ? '16px 18px' : '20px 28px',
                background: '#0B3A6F',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                flexShrink: 0
              }}
            >
              <div>
                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    background: 'rgba(255, 255, 255, 0.18)',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    display: 'inline-block',
                    marginBottom: '4px'
                  }}
                >
                  COMPARATIVE SCORE BREAKDOWN
                </span>
                <h2 style={{ fontSize: isMobile ? '18px' : '20px', fontWeight: 800, margin: 0 }}>
                  {selectedComparisonModal.topic}
                </h2>
                <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.8)', marginTop: '4px' }}>
                  Completed on {selectedComparisonModal.createdAt} · Verified Head-to-Head
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedComparisonModal(null)}
                style={{
                  background: 'rgba(255, 255, 255, 0.15)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  color: '#FFFFFF',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px',
                  lineHeight: 1,
                  transition: 'background 0.15s ease'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)'; }}
              >
                ✕
              </button>
            </div>

            {/* Scrollable Modal Content */}
            <div
              style={{
                padding: isMobile ? '16px 14px' : '22px 28px',
                display: 'flex',
                flexDirection: 'column',
                gap: isMobile ? '14px' : '18px',
                overflowY: 'auto',
                flex: 1,
                WebkitOverflowScrolling: 'touch'
              }}
            >
              {/* Score Comparison Cards */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                  gap: isMobile ? '10px' : '16px'
                }}
              >
                {/* User Card */}
                <div
                  style={{
                    background: selectedComparisonModal.userScore?.won ? '#ECFDF5' : '#F8FAFC',
                    border: `1.5px solid ${selectedComparisonModal.userScore?.won ? '#10B981' : '#E2E8F0'}`,
                    borderRadius: '12px',
                    padding: isMobile ? '14px' : '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '13px', fontWeight: 800, color: '#0B1A2B' }}>You (Student)</span>
                    {selectedComparisonModal.userScore?.won && (
                      <span style={{ background: '#10B981', color: '#FFFFFF', fontSize: '10px', fontWeight: 800, padding: '2px 6px', borderRadius: '4px' }}>
                        WINNER
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '26px', fontWeight: 800, color: '#0B3A6F' }}>
                    {selectedComparisonModal.userScore?.points} <span style={{ fontSize: '14px', fontWeight: 600 }}>pts</span>
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748B' }}>
                    Correct: <strong>{selectedComparisonModal.userScore?.correct}/{selectedComparisonModal.userScore?.total}</strong>
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748B' }}>
                    Time Taken: <strong>{selectedComparisonModal.userScore?.timeTaken}</strong>
                  </div>
                </div>

                {/* Opponent Card */}
                <div
                  style={{
                    background: selectedComparisonModal.opponentScore?.won ? '#ECFDF5' : '#F8FAFC',
                    border: `1.5px solid ${selectedComparisonModal.opponentScore?.won ? '#10B981' : '#E2E8F0'}`,
                    borderRadius: '12px',
                    padding: isMobile ? '14px' : '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '13px', fontWeight: 800, color: '#0B1A2B' }}>
                      {selectedComparisonModal.opponent.name}
                    </span>
                    {selectedComparisonModal.opponentScore?.won && (
                      <span style={{ background: '#10B981', color: '#FFFFFF', fontSize: '10px', fontWeight: 800, padding: '2px 6px', borderRadius: '4px' }}>
                        WINNER
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '26px', fontWeight: 800, color: '#64748B' }}>
                    {selectedComparisonModal.opponentScore?.points} <span style={{ fontSize: '14px', fontWeight: 600 }}>pts</span>
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748B' }}>
                    Correct: <strong>{selectedComparisonModal.opponentScore?.correct}/{selectedComparisonModal.opponentScore?.total}</strong>
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748B' }}>
                    Time Taken: <strong>{selectedComparisonModal.opponentScore?.timeTaken}</strong>
                  </div>
                </div>
              </div>

              {/* Status Outcome Banner */}
              <div
                style={{
                  background: '#F0F9FF',
                  border: '1px solid #BAE6FD',
                  borderRadius: '10px',
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}
              >
                <Icon name="statusUp" size={18} color="#0284C7" />
                <span style={{ fontSize: '12.5px', color: '#0369A1' }}>
                  {selectedComparisonModal.userScore?.won
                    ? `Victory verified! You outperformed ${selectedComparisonModal.opponent.name} by +${(selectedComparisonModal.userScore?.points || 0) - (selectedComparisonModal.opponentScore?.points || 0)} pts.`
                    : selectedComparisonModal.outcome === 'tie'
                      ? `Dead heat - you and ${selectedComparisonModal.opponent.name} scored the same.`
                      : `Well fought! ${selectedComparisonModal.opponent.name} earned top points in this engagement.`}
                </span>
              </div>

              {/* Question & Answer Comparative Review Section */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '4px' }}>
                {/* Section Header */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '8px',
                    paddingBottom: '8px',
                    borderBottom: '1px solid #E2E8F0'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '8px',
                        background: '#0B3A6F',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Icon name="challenges" size={15} color="#FFFFFF" />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#0B1A2B', margin: 0 }}>
                        Question & Answer Breakdown
                      </h3>
                      <p style={{ fontSize: '11px', color: '#64748B', margin: '2px 0 0 0' }}>
                        Side-by-side responses and technical rationales
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                    <span
                      style={{
                        background: '#ECFDF5',
                        color: '#059669',
                        fontSize: '11px',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: '12px'
                      }}
                    >
                      Both Correct: {comparisonStats.bothCorrect}
                    </span>
                    <span
                      style={{
                        background: '#EFF6FF',
                        color: '#1D4ED8',
                        fontSize: '11px',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: '12px'
                      }}
                    >
                      Advantage You: {comparisonStats.userAdvantage}
                    </span>
                    {comparisonStats.oppAdvantage > 0 && (
                      <span
                        style={{
                          background: '#FFFBEB',
                          color: '#B45309',
                          fontSize: '11px',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: '12px'
                        }}
                      >
                        Advantage {selectedComparisonModal.opponent.name.split(' ')[0]}: {comparisonStats.oppAdvantage}
                      </span>
                    )}
                  </div>
                </div>

                {/* List of Questions */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {compare.isLoading && <div className="skeleton-shimmer" style={{ height: '160px', borderRadius: '12px' }} />}
                  {compare.error && <div style={{ color: '#DC2626', fontSize: '13px', fontWeight: 600 }}>{compare.error.message}</div>}
                  {comparisonQuestions.map((q) => (
                    <div
                      key={q.qNum}
                      style={{
                        background: '#FFFFFF',
                        border: '1px solid #E2E8F0',
                        borderRadius: '12px',
                        padding: isMobile ? '14px' : '16px',
                        boxShadow: '0 1px 4px rgba(0, 0, 0, 0.04)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px'
                      }}
                    >
                      {/* Question Item Header */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          flexWrap: 'wrap',
                          gap: '8px'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span
                            style={{
                              background: '#0B3A6F',
                              color: '#FFFFFF',
                              fontSize: '11px',
                              fontWeight: 800,
                              padding: '2px 8px',
                              borderRadius: '6px'
                            }}
                          >
                            Q{q.qNum}
                          </span>
                          <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748B' }}>
                            Question {q.qNum} of {comparisonQuestions.length}
                          </span>
                        </div>

                        {/* Status pill */}
                        {q.isUserCorrect && q.isOppCorrect ? (
                          <span
                            style={{
                              background: '#ECFDF5',
                              color: '#059669',
                              border: '1px solid #A7F3D0',
                              fontSize: '11px',
                              fontWeight: 700,
                              padding: '3px 10px',
                              borderRadius: '20px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            <Icon name="checkCircle" size={12} color="#059669" />
                            Both Answered Correctly
                          </span>
                        ) : q.isUserCorrect && !q.isOppCorrect ? (
                          <span
                            style={{
                              background: '#EFF6FF',
                              color: '#1D4ED8',
                              border: '1px solid #BFDBFE',
                              fontSize: '11px',
                              fontWeight: 700,
                              padding: '3px 10px',
                              borderRadius: '20px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            <Icon name="statusUp" size={12} color="#1D4ED8" />
                            Advantage You (+1)
                          </span>
                        ) : !q.isUserCorrect && q.isOppCorrect ? (
                          <span
                            style={{
                              background: '#FFFBEB',
                              color: '#B45309',
                              border: '1px solid #FDE68A',
                              fontSize: '11px',
                              fontWeight: 700,
                              padding: '3px 10px',
                              borderRadius: '20px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            <Icon name="clock" size={12} color="#B45309" />
                            Advantage {selectedComparisonModal.opponent.name} (+1)
                          </span>
                        ) : (
                          <span
                            style={{
                              background: '#F8FAFC',
                              color: '#64748B',
                              border: '1px solid #E2E8F0',
                              fontSize: '11px',
                              fontWeight: 700,
                              padding: '3px 10px',
                              borderRadius: '20px'
                            }}
                          >
                            Both Missed (0 pts)
                          </span>
                        )}
                      </div>

                      {/* Question Prompt */}
                      <div
                        style={{
                          fontSize: isMobile ? '13px' : '14px',
                          fontWeight: 700,
                          color: '#0B1A2B',
                          lineHeight: '1.5'
                        }}
                      >
                        {q.question}
                      </div>

                      {/* Candidate Responses (Side-by-side or stacked on mobile) */}
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                          gap: '10px'
                        }}
                      >
                        {/* You / Student Response */}
                        <div
                          style={{
                            background: q.isUserCorrect ? '#F0FDF4' : '#FEF2F2',
                            border: `1.5px solid ${q.isUserCorrect ? '#86EFAC' : '#FECACA'}`,
                            borderRadius: '10px',
                            padding: '10px 12px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '6px'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '11px', fontWeight: 800, color: '#334155' }}>
                              Your Answer
                            </span>
                            <span
                              style={{
                                fontSize: '10.5px',
                                fontWeight: 800,
                                color: q.isUserCorrect ? '#15803D' : '#B91C1C'
                              }}
                            >
                              {q.isUserCorrect ? '✓ Correct (+4)' : '✕ Incorrect (0)'}
                            </span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                            <span
                              style={{
                                minWidth: '20px',
                                height: '20px',
                                borderRadius: '50%',
                                background: q.isUserCorrect ? '#15803D' : '#DC2626',
                                color: '#FFFFFF',
                                fontSize: '11px',
                                fontWeight: 800,
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginTop: '1px'
                              }}
                            >
                              {q.userOpt.letter}
                            </span>
                            <span style={{ fontSize: '12px', color: '#1E293B', lineHeight: '1.4', fontWeight: 600 }}>
                              {q.userOpt.text}
                            </span>
                          </div>
                        </div>

                        {/* Opponent Response */}
                        <div
                          style={{
                            background: q.isOppCorrect ? '#F0FDF4' : '#FEF2F2',
                            border: `1.5px solid ${q.isOppCorrect ? '#86EFAC' : '#FECACA'}`,
                            borderRadius: '10px',
                            padding: '10px 12px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '6px'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '11px', fontWeight: 800, color: '#334155' }}>
                              {selectedComparisonModal.opponent.name}'s Answer
                            </span>
                            <span
                              style={{
                                fontSize: '10.5px',
                                fontWeight: 800,
                                color: q.isOppCorrect ? '#15803D' : '#B91C1C'
                              }}
                            >
                              {q.isOppCorrect ? '✓ Correct (+4)' : '✕ Incorrect (0)'}
                            </span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                            <span
                              style={{
                                minWidth: '20px',
                                height: '20px',
                                borderRadius: '50%',
                                background: q.isOppCorrect ? '#15803D' : '#DC2626',
                                color: '#FFFFFF',
                                fontSize: '11px',
                                fontWeight: 800,
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginTop: '1px'
                              }}
                            >
                              {q.oppOpt.letter}
                            </span>
                            <span style={{ fontSize: '12px', color: '#1E293B', lineHeight: '1.4', fontWeight: 600 }}>
                              {q.oppOpt.text}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Correct Answer & Technical Explanation */}
                      <div
                        style={{
                          background: '#F8FAFC',
                          border: '1px solid #E2E8F0',
                          borderLeft: '4px solid #10B981',
                          borderRadius: '8px',
                          padding: '10px 12px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '4px'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Icon name="checkCircle" size={14} color="#10B981" />
                          <span style={{ fontSize: '11.5px', fontWeight: 800, color: '#065F46' }}>
                            Correct answer: {q.correctOpt.text}
                          </span>
                        </div>
                        <div style={{ fontSize: '11.5px', color: '#475569', lineHeight: '1.45', paddingLeft: '20px' }}>
                          {q.explanation && (<><strong style={{ color: '#0B3A6F' }}>Explanation:</strong> {q.explanation}</>)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div
              style={{
                padding: isMobile ? '12px 16px' : '14px 28px',
                borderTop: '1px solid #E2E8F0',
                background: '#F8FAFC',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexShrink: 0
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Icon name="checkCircle" size={14} color="#059669" />
                <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>
                  Results verified & cryptographically recorded
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedComparisonModal(null)}
                style={{
                  background: '#0B3A6F',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px 20px',
                  color: '#FFFFFF',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#092C54'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = '#0B3A6F'; }}
              >
                Close Comparison
              </button>
            </div>
          </div>
        </ModalPortal>
      )}

    </div>
  );
}
