import React, { useState, useMemo, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Icon from '../design-system/icons';
import ModalPortal from './ModalPortal';
import CreateRoadmapModal from './CreateRoadmapModal';
import { api, invalidate, keys, setQueryData, useQuery } from '../data';
import { useNotifications } from '../notifications';
import { useTS } from '../session';

// Artwork for roadmaps that don't have a generated cover yet.
function pickCoverForTopic(topic) {
  const lower = (topic || '').toLowerCase();
  if (lower.includes('blockchain') || lower.includes('crypto') || lower.includes('identity')) return '/assets/book-ux-ai.jpg';
  if (lower.includes('marine') || lower.includes('engine') || lower.includes('auxiliary') || lower.includes('propulsion')) return '/assets/book-marine.jpg';
  if (lower.includes('circuit') || lower.includes('hardware') || lower.includes('mosfet') || lower.includes('semiconductor')) return '/assets/book-circuits.jpg';
  if (lower.includes('web') || lower.includes('html') || lower.includes('code') || lower.includes('frontend')) return '/assets/book-html.jpg';
  if (lower.includes('security') || lower.includes('ctf') || lower.includes('hack') || lower.includes('cyber')) return '/assets/book-ctf.jpg';
  if (lower.includes('nuclear') || lower.includes('physics') || lower.includes('energy') || lower.includes('fission')) return '/assets/book-nuclear-fission.jpg';
  if (lower.includes('dental') || lower.includes('medicine') || lower.includes('anatomy') || lower.includes('biology')) return '/assets/book-dental.jpg';
  if (lower.includes('trade') || lower.includes('economics') || lower.includes('market') || lower.includes('finance')) return '/assets/book-trade.jpg';
  if (lower.includes('inflation') || lower.includes('macro')) return '/assets/book-inflation.jpg';
  if (lower.includes('building') || lower.includes('architecture') || lower.includes('civil')) return '/assets/book-building.jpg';
  return '/assets/book-ux-ai.jpg';
}

const shortDate = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString('en-GB');
};

/** A /api/v2/learn/projects summary in the shape the cards below render. */
const toCard = (p) => ({
  id: p.id,
  kind: p.kind,
  title: p.title,
  level: (p.levelOfLearning || 'Self-paced').toUpperCase(),
  educator: p.kind === 'self' ? 'Personal workspace' : p.ownerName || p.instituteName || 'Your educator',
  assignedDate: shortDate(p.kind === 'self' ? p.createdAt : p.updatedAt),
  assetsCount: 0,
  modulesCount: p.modules,
  coverImage: p.coverUrl || pickCoverForTopic(p.title || p.topic),
  type: p.kind === 'self' ? 'private' : 'educator',
  isPrivate: p.kind === 'self',
  description: p.introduction || `${p.modules} modules · ${p.subtopics} subtopics · ${p.progress}% complete`,
  progress: p.progress,
  updatedAt: p.updatedAt
});

export default function ProjectsHub() {
  const { go } = useTS();
  const location = useLocation();
  const navigate = useNavigate();
  const { pendingJobs, jobs, refreshJobs } = useNotifications();
  const { data, error, isLoading, refetch } = useQuery(keys.projects(), api.projects);

  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'assigned' | 'private'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('ALL');
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'grid'
  const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'modules' | 'alphabetical'
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  );
  const [selectedProject, setSelectedProject] = useState(null);
  const [createModal, setCreateModal] = useState(null); // { topic, level } while open

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // ?new=1&topic=&level= (the "Try again" link on a failed-roadmap notification)
  useEffect(() => {
    const q = new URLSearchParams(location.search);
    if (q.get('new') === '1') {
      setCreateModal({ topic: q.get('topic') || '', level: q.get('level') || '' });
      navigate(location.pathname, { replace: true });
    }
  }, [location.search, location.pathname, navigate]);

  const handleTabSwitch = (newTab) => setActiveTab(newTab);

  const cards = useMemo(() => (data?.projects || []).map(toCard), [data]);
  const educatorProjects = useMemo(() => cards.filter((p) => p.kind === 'educator'), [cards]);
  const privateProjects = useMemo(() => cards.filter((p) => p.kind === 'self'), [cards]);
  const failedJobs = jobs.filter((j) => j.status === 'failed');

  // Combine projects based on the active tab and filters
  const allCombinedProjects = useMemo(() => {
    let list = activeTab === 'assigned' ? educatorProjects : activeTab === 'private' ? privateProjects : cards;

    if (selectedLevel !== 'ALL') {
      list = list.filter((p) => p.level.toUpperCase().includes(selectedLevel.toUpperCase()));
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.educator.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      );
    }

    if (sortBy === 'newest') {
      list = [...list].sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0));
    } else if (sortBy === 'modules') {
      list = [...list].sort((a, b) => b.modulesCount - a.modulesCount);
    } else if (sortBy === 'alphabetical') {
      list = [...list].sort((a, b) => a.title.localeCompare(b.title));
    }
    return list;
  }, [activeTab, selectedLevel, searchQuery, sortBy, cards, educatorProjects, privateProjects]);

  const openCreate = (topic = '', level = '') => setCreateModal({ topic, level });

  const handleDeleteProject = async (projectId, projectTitle, e) => {
    e.stopPropagation();
    setQueryData(keys.projects(), (d) => d && { ...d, projects: d.projects.filter((p) => p.id !== projectId) });
    try {
      await api.trashProject(projectId);
      toast.success(`Moved "${projectTitle}" to Trash`);
      invalidate(keys.dashboard(), keys.trash());
    } catch (err) {
      toast.error(err.message);
      refetch();
    }
  };

  const dismissJob = async (j) => {
    try {
      await api.dismissJob(j.id);
    } catch {
      // already gone
    }
    refreshJobs();
  };

  const handleOpenWorkspace = (proj) => go('workspace', { kind: proj.kind, id: proj.id });

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: isMobile ? 'auto' : '100%',
        minHeight: isMobile ? '100%' : '100%',
        maxHeight: isMobile ? 'none' : '100%',
        boxSizing: 'border-box',
        gap: isMobile ? '10px' : '12px',
        overflow: isMobile ? 'visible' : 'hidden'
      }}
    >
      {/* 1. TOP HERO BANNER (Mobile: Sleek Compact Bar | Desktop: Exact Full Fidelity Banner) */}
      {isMobile ? (
        <div
          style={{
            background: '#243367',
            borderRadius: '14px',
            padding: '12px 14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            boxShadow: '0 4px 16px rgba(36, 51, 103, 0.14)',
            position: 'relative',
            flexShrink: 0
          }}
        >
          {/* Mobile Top Row: Title + Count Badge + Compact '+ New' Button */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '8px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1
                style={{
                  fontFamily: 'var(--font-primary)',
                  fontSize: '18px',
                  fontWeight: 800,
                  color: '#FFFFFF',
                  margin: 0,
                  letterSpacing: '-0.02em',
                  lineHeight: '22px'
                }}
              >
                Project Roadmaps
              </h1>
              <span
                style={{
                  background: 'rgba(255, 255, 255, 0.18)',
                  color: '#FFFFFF',
                  borderRadius: '999px',
                  padding: '2px 8px',
                  fontSize: '11px',
                  fontWeight: 800,
                  fontFamily: 'var(--font-primary)'
                }}
              >
                {educatorProjects.length + privateProjects.length}
              </span>
            </div>

            <button
              onClick={() => {
                openCreate();
              }}
              style={{
                background: '#FEE047',
                color: '#101D3B',
                border: 'none',
                borderRadius: '999px',
                height: '32px',
                padding: '0 14px',
                fontFamily: 'var(--font-primary)',
                fontSize: '12px',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                whiteSpace: 'nowrap',
                boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                transition: 'background-color 150ms ease'
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              <span>New</span>
            </button>
          </div>

          {/* Mobile Tools Row: Search + Filter + Sort + Grid/List */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              position: 'relative'
            }}
          >
            {/* Search Input */}
            <div
              style={{
                flex: 1,
                height: '36px',
                borderRadius: '10px',
                background: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                padding: '0 10px',
                gap: '8px',
                boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
                minWidth: 0
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search roadmaps..."
                style={{
                  border: 'none',
                  outline: 'none',
                  background: 'transparent',
                  width: '100%',
                  fontFamily: 'var(--font-primary)',
                  fontSize: '12px',
                  fontWeight: 400,
                  color: '#101828',
                  minWidth: 0
                }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    color: '#94A3B8',
                    cursor: 'pointer',
                    padding: '2px',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              )}
            </div>

            {/* Filter Button */}
            <button
              onClick={() => {
                setIsFilterDropdownOpen(!isFilterDropdownOpen);
                setIsSortDropdownOpen(false);
              }}
              title="Filter roadmaps"
              style={{
                height: '36px',
                width: '36px',
                borderRadius: '10px',
                background: (selectedLevel !== 'ALL' || activeTab !== 'all') ? '#FEE047' : '#FFFFFF',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
                flexShrink: 0,
                position: 'relative'
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#101D3B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
              </svg>
            </button>

            {/* Sort Button */}
            <button
              onClick={() => {
                setIsSortDropdownOpen(!isSortDropdownOpen);
                setIsFilterDropdownOpen(false);
              }}
              title="Sort roadmaps"
              style={{
                height: '36px',
                width: '36px',
                borderRadius: '10px',
                background: sortBy !== 'newest' ? '#FEE047' : '#FFFFFF',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
                flexShrink: 0
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#101D3B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="4" y1="6" x2="16" y2="6"></line>
                <line x1="4" y1="12" x2="12" y2="12"></line>
                <line x1="4" y1="18" x2="8" y2="18"></line>
              </svg>
            </button>

            {/* Grid / List Switcher */}
            <div
              style={{
                height: '36px',
                borderRadius: '10px',
                background: '#FFFFFF',
                padding: '2px',
                display: 'flex',
                alignItems: 'center',
                boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
                flexShrink: 0
              }}
            >
              <button
                onClick={() => setViewMode('grid')}
                style={{
                  width: '30px',
                  height: '32px',
                  borderRadius: '8px',
                  border: 'none',
                  background: viewMode === 'grid' ? '#FEE047' : 'transparent',
                  color: '#101D3B',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <rect x="3" y="3" width="7" height="7" rx="1.5"></rect>
                  <rect x="14" y="3" width="7" height="7" rx="1.5"></rect>
                  <rect x="14" y="14" width="7" height="7" rx="1.5"></rect>
                  <rect x="3" y="14" width="7" height="7" rx="1.5"></rect>
                </svg>
              </button>
              <button
                onClick={() => setViewMode('list')}
                style={{
                  width: '30px',
                  height: '32px',
                  borderRadius: '8px',
                  border: 'none',
                  background: viewMode === 'list' ? '#FEE047' : 'transparent',
                  color: '#101D3B',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="8" y1="6" x2="21" y2="6"></line>
                  <line x1="8" y1="12" x2="21" y2="12"></line>
                  <line x1="8" y1="18" x2="21" y2="18"></line>
                  <line x1="3" y1="6" x2="3.01" y2="6"></line>
                  <line x1="3" y1="12" x2="3.01" y2="12"></line>
                  <line x1="3" y1="18" x2="3.01" y2="18"></line>
                </svg>
              </button>
            </div>

            {/* Filter Dropdown on Mobile */}
            {isFilterDropdownOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: '44px',
                  right: 0,
                  width: '240px',
                  background: '#FFFFFF',
                  borderRadius: '12px',
                  padding: '14px',
                  boxShadow: '0 12px 28px rgba(0,0,0,0.22)',
                  zIndex: 100,
                  border: '1px solid #E2E8F0'
                }}
              >
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', letterSpacing: '0.04em', marginBottom: '8px' }}>
                  FILTER BY LEVEL
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '10px' }}>
                  {['ALL', 'HIGH SCHOOL', 'UNDERGRADUATE', 'POSTGRADUATE'].map((lvl) => (
                    <button
                      key={lvl}
                      onClick={() => {
                        setSelectedLevel(lvl);
                        setIsFilterDropdownOpen(false);
                      }}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '7px 10px',
                        borderRadius: '7px',
                        border: 'none',
                        background: selectedLevel === lvl ? '#EBF2FE' : 'transparent',
                        color: selectedLevel === lvl ? '#2563EB' : '#334155',
                        fontSize: '12px',
                        fontWeight: selectedLevel === lvl ? 700 : 500,
                        cursor: 'pointer'
                      }}
                    >
                      {lvl === 'ALL' ? 'All Levels' : lvl}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Sort Dropdown on Mobile */}
            {isSortDropdownOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: '44px',
                  right: 0,
                  width: '180px',
                  background: '#FFFFFF',
                  borderRadius: '12px',
                  padding: '8px',
                  boxShadow: '0 12px 28px rgba(0,0,0,0.22)',
                  zIndex: 100,
                  border: '1px solid #E2E8F0'
                }}
              >
                {[
                  { id: 'newest', label: 'Newest first' },
                  { id: 'modules', label: 'Most modules' },
                  { id: 'alphabetical', label: 'Alphabetical (A-Z)' }
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      setSortBy(s.id);
                      setIsSortDropdownOpen(false);
                    }}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '7px 10px',
                      borderRadius: '7px',
                      border: 'none',
                      background: sortBy === s.id ? '#EBF2FE' : 'transparent',
                      color: sortBy === s.id ? '#2563EB' : '#334155',
                      fontSize: '12px',
                      fontWeight: sortBy === s.id ? 700 : 500,
                      cursor: 'pointer'
                    }}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div
          style={{
            background: '#243367',
            borderRadius: '16px',
            padding: '18px 22px 16px 22px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            boxShadow: '0 4px 16px rgba(36, 51, 103, 0.14)',
            position: 'relative',
            flexShrink: 0
          }}
        >
          {/* Banner Top Row: Title + Subtitle + "+ New Project" Button */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              gap: '16px'
            }}
          >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <h1
                style={{
                  fontFamily: 'var(--font-primary)',
                  fontSize: isMobile ? '22px' : '28px',
                  fontWeight: 800,
                  color: '#FFFFFF',
                  margin: 0,
                  letterSpacing: '-0.02em',
                  lineHeight: isMobile ? '26px' : '34px'
                }}
              >
                Project Roadmaps
              </h1>
              <span
                style={{
                  background: '#FEE047',
                  color: '#0F1219',
                  borderRadius: '6px',
                  padding: '3px 9px',
                  fontSize: '10px',
                  fontWeight: 800,
                  letterSpacing: '0.06em',
                  fontFamily: 'var(--font-primary)'
                }}
              >
                STUDY & RESEARCH HUB
              </span>
            </div>
            <p
              style={{
                fontFamily: 'var(--font-primary)',
                fontSize: isMobile ? '12px' : '13px',
                lineHeight: isMobile ? '17px' : '19px',
                fontWeight: 400,
                color: 'rgba(255, 255, 255, 0.85)',
                margin: '6px 0 0 0',
                maxWidth: '740px'
              }}
            >
              Unified study workspace combining faculty-assigned academic curriculums and your self-directed personal research projects in one intelligent roadmap hub.
            </p>
          </div>

          {/* Yellow "+ New project" Button */}
          <button
            onClick={() => openCreate()}
            style={{
              background: '#FEE047',
              color: '#101D3B',
              border: 'none',
              borderRadius: '999px',
              height: isMobile ? '40px' : '38px',
              width: isMobile ? '100%' : 'auto',
              padding: '0 24px',
              fontFamily: 'var(--font-primary)',
              fontSize: '13px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              whiteSpace: 'nowrap',
              boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
              transition: 'background-color 150ms ease, transform 150ms ease',
              flexShrink: 0
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#FCD34D';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#FEE047';
            }}
          >
            New project
          </button>
        </div>

        {/* Banner Bottom Row: Search Box + Filters + Sort + View Switcher */}
        <div
          style={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            alignItems: isMobile ? 'stretch' : 'center',
            justifyContent: 'space-between',
            gap: isMobile ? '10px' : '12px',
            flexWrap: 'wrap'
          }}
        >
          {/* Search Box */}
          <div
            style={{
              flex: isMobile ? 'none' : 1,
              width: isMobile ? '100%' : 'auto',
              minWidth: isMobile ? '100%' : '280px',
              height: '42px',
              borderRadius: '12px',
              background: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              padding: '0 14px',
              gap: '10px',
              boxShadow: '0 2px 6px rgba(0,0,0,0.06)'
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search projects, authors, or modules"
              style={{
                border: 'none',
                outline: 'none',
                background: 'transparent',
                width: '100%',
                fontFamily: 'var(--font-primary)',
                fontSize: '13px',
                fontWeight: 400,
                color: '#101828'
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{
                  border: 'none',
                  background: 'transparent',
                  color: '#94A3B8',
                  cursor: 'pointer',
                  padding: '2px',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            )}
          </div>

          {/* Right Action Tools: Filters + Sort + View */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: isMobile ? 'space-between' : 'flex-end',
              width: isMobile ? '100%' : 'auto',
              gap: '10px',
              position: 'relative'
            }}
          >
            {/* Filters Pill Button */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => {
                  setIsFilterDropdownOpen(!isFilterDropdownOpen);
                  setIsSortDropdownOpen(false);
                }}
                style={{
                  height: '42px',
                  borderRadius: '12px',
                  background: '#FFFFFF',
                  border: 'none',
                  padding: '0 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.06)'
                }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                </svg>
                <span
                  style={{
                    fontFamily: 'var(--font-primary)',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#101D3B'
                  }}
                >
                  Filters
                </span>
                <span
                  style={{
                    background: '#EBF2FE',
                    color: '#2563EB',
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '999px',
                    fontFamily: 'var(--font-primary)'
                  }}
                >
                  {selectedLevel === 'ALL' && activeTab === 'all' ? '3 active' : `${(selectedLevel !== 'ALL' ? 1 : 0) + (activeTab !== 'all' ? 1 : 0) + 1} active`}
                </span>
              </button>

              {/* Filters Dropdown Panel */}
              {isFilterDropdownOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: '48px',
                    left: 0,
                    width: '260px',
                    background: '#FFFFFF',
                    borderRadius: '14px',
                    padding: '16px',
                    boxShadow: '0 12px 28px rgba(0,0,0,0.18)',
                    zIndex: 100,
                    border: '1px solid #E2E8F0'
                  }}
                >
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', letterSpacing: '0.04em', marginBottom: '8px' }}>
                    FILTER BY LEVEL
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '14px' }}>
                    {['ALL', 'HIGH SCHOOL', 'UNDERGRADUATE', 'POSTGRADUATE'].map((lvl) => (
                      <button
                        key={lvl}
                        onClick={() => {
                          setSelectedLevel(lvl);
                          setIsFilterDropdownOpen(false);
                        }}
                        style={{
                          textAlign: 'left',
                          padding: '6px 10px',
                          borderRadius: '8px',
                          border: 'none',
                          background: selectedLevel === lvl ? '#EBF2FE' : 'transparent',
                          color: selectedLevel === lvl ? '#2563EB' : '#334155',
                          fontSize: '12px',
                          fontWeight: selectedLevel === lvl ? 700 : 500,
                          cursor: 'pointer'
                        }}
                      >
                        {lvl === 'ALL' ? 'All Education Levels' : lvl}
                      </button>
                    ))}
                  </div>

                  <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '10px', display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                      onClick={() => {
                        setSelectedLevel('ALL');
                        setActiveTab('all');
                        setIsFilterDropdownOpen(false);
                      }}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#64748B',
                        fontSize: '11px',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      Reset filters
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Sort Dropdown Button */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => {
                  setIsSortDropdownOpen(!isSortDropdownOpen);
                  setIsFilterDropdownOpen(false);
                }}
                style={{
                  height: '42px',
                  borderRadius: '12px',
                  background: '#FFFFFF',
                  border: 'none',
                  padding: '0 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.06)'
                }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="4" y1="6" x2="16" y2="6"></line>
                  <line x1="4" y1="12" x2="12" y2="12"></line>
                  <line x1="4" y1="18" x2="8" y2="18"></line>
                </svg>
                <span
                  style={{
                    fontFamily: 'var(--font-primary)',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#101D3B'
                  }}
                >
                  {sortBy === 'newest' ? 'Newest first' : sortBy === 'modules' ? 'Most modules' : 'Alphabetical'}
                </span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </button>

              {/* Sort Options Panel */}
              {isSortDropdownOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: '48px',
                    right: 0,
                    width: '180px',
                    background: '#FFFFFF',
                    borderRadius: '14px',
                    padding: '8px',
                    boxShadow: '0 12px 28px rgba(0,0,0,0.18)',
                    zIndex: 100,
                    border: '1px solid #E2E8F0'
                  }}
                >
                  {[
                    { id: 'newest', label: 'Newest first' },
                    { id: 'modules', label: 'Most modules' },
                    { id: 'alphabetical', label: 'Alphabetical (A-Z)' }
                  ].map((s) => (
                    <button
                      key={s.id}
                      onClick={() => {
                        setSortBy(s.id);
                        setIsSortDropdownOpen(false);
                      }}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '8px 10px',
                        borderRadius: '8px',
                        border: 'none',
                        background: sortBy === s.id ? '#EBF2FE' : 'transparent',
                        color: sortBy === s.id ? '#2563EB' : '#334155',
                        fontSize: '12px',
                        fontWeight: sortBy === s.id ? 700 : 500,
                        cursor: 'pointer'
                      }}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Grid / List View Switcher */}
            <div
              style={{
                height: '42px',
                borderRadius: '12px',
                background: '#FFFFFF',
                padding: '3px',
                display: 'flex',
                alignItems: 'center',
                boxShadow: '0 2px 6px rgba(0,0,0,0.06)'
              }}
            >
              <button
                onClick={() => setViewMode('grid')}
                title="Grid view"
                style={{
                  height: '36px',
                  borderRadius: '9px',
                  border: 'none',
                  padding: '0 12px',
                  background: viewMode === 'grid' ? '#FEE047' : 'transparent',
                  color: viewMode === 'grid' ? '#101D3B' : '#64748B',
                  fontFamily: 'var(--font-primary)',
                  fontSize: '13px',
                  fontWeight: viewMode === 'grid' ? 700 : 500,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 150ms ease'
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="7" height="7" rx="1.5"></rect>
                  <rect x="14" y="3" width="7" height="7" rx="1.5"></rect>
                  <rect x="14" y="14" width="7" height="7" rx="1.5"></rect>
                  <rect x="3" y="14" width="7" height="7" rx="1.5"></rect>
                </svg>
                <span>Grid</span>
              </button>

              <button
                onClick={() => setViewMode('list')}
                title="List view"
                style={{
                  height: '36px',
                  borderRadius: '9px',
                  border: 'none',
                  padding: '0 14px',
                  background: viewMode === 'list' ? '#FEE047' : 'transparent',
                  color: viewMode === 'list' ? '#101D3B' : '#64748B',
                  fontFamily: 'var(--font-primary)',
                  fontSize: '13px',
                  fontWeight: viewMode === 'list' ? 700 : 500,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 150ms ease'
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="8" y1="6" x2="21" y2="6"></line>
                  <line x1="8" y1="12" x2="21" y2="12"></line>
                  <line x1="8" y1="18" x2="21" y2="18"></line>
                  <line x1="3" y1="6" x2="3.01" y2="6"></line>
                  <line x1="3" y1="12" x2="3.01" y2="12"></line>
                  <line x1="3" y1="18" x2="3.01" y2="18"></line>
                </svg>
                <span>List</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      )}

      {/* 2. UNIFIED SEGMENTED TABS: Divides Educator Roadmaps and Private Projects seamlessly */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: isMobile ? '8px' : '0',
          padding: isMobile ? '0 2px' : '2px 4px'
        }}
      >
        {/* Scope Tabs */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: isMobile ? '6px' : '8px',
            background: 'rgba(255, 255, 255, 0.75)',
            padding: isMobile ? '3px' : '4px',
            borderRadius: '12px',
            border: '1px solid #E2E8F0',
            overflowX: isMobile ? 'auto' : 'visible',
            maxWidth: '100%',
            whiteSpace: 'nowrap',
            WebkitOverflowScrolling: 'touch'
          }}
        >
          {[
            { id: 'all', label: isMobile ? 'All' : 'All Roadmaps', count: educatorProjects.length + privateProjects.length },
            { id: 'assigned', label: isMobile ? 'Assigned' : 'Educator Assigned', count: educatorProjects.length },
            { id: 'private', label: isMobile ? 'Self-Directed' : 'Self-Directed Research', count: privateProjects.length }
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabSwitch(tab.id)}
                style={{
                  height: isMobile ? '28px' : '32px',
                  borderRadius: isMobile ? '8px' : '9px',
                  border: 'none',
                  padding: isMobile ? '0 10px' : '0 14px',
                  background: isActive ? '#20346B' : 'transparent',
                  color: isActive ? '#FFFFFF' : '#64748B',
                  fontFamily: 'var(--font-primary)',
                  fontSize: isMobile ? '11px' : '12px',
                  fontWeight: isActive ? 700 : 500,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: isMobile ? '4px' : '6px',
                  transition: 'all 150ms ease'
                }}
              >
                <span>{tab.label}</span>
                <span
                  style={{
                    background: isActive ? 'rgba(255, 255, 255, 0.2)' : '#F1F5F9',
                    color: isActive ? '#FFFFFF' : '#475569',
                    fontSize: isMobile ? '9.5px' : '10px',
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

        {/* Total Results Indicator (Desktop only) */}
        {!isMobile && (
          <div
            style={{
              fontFamily: 'var(--font-primary)',
              fontSize: '12px',
              fontWeight: 500,
              color: '#64748B'
            }}
          >
            Showing <span style={{ fontWeight: 700, color: '#101D3B' }}>{allCombinedProjects.length}</span> roadmaps
          </div>
        )}
      </div>


      {/* 3. PROJECT CARDS CONTENT: STRICTLY INTERNAL SCROLL CONTAINER */}
      <div
        style={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          overflowX: 'hidden',
          paddingRight: '6px',
          paddingBottom: '8px',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Roadmaps still being generated, and recent failures */}
        {(pendingJobs.length > 0 || failedJobs.length > 0) && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '10px' }}>
            {pendingJobs.map((j) => (
              <div
                key={j.id}
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #D6E1F9',
                  borderRadius: '12px',
                  padding: '12px 16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#283D82', animation: 'pulseGlow 1.4s infinite', flexShrink: 0 }} />
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#1E293B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{j.topic}</span>
                    <span style={{ fontSize: '9.5px', fontWeight: 800, color: '#283D82', background: '#E0ECFC', padding: '2px 7px', borderRadius: '6px', flexShrink: 0 }}>
                      {(j.levelOfLearning || '').toUpperCase()}
                    </span>
                  </div>
                  <span style={{ fontSize: '12px', fontWeight: 800, color: '#283D82' }}>{Math.round(j.progress ?? 4)}%</span>
                </div>
                <div style={{ width: '100%', height: '5px', background: '#E2E8F0', borderRadius: '999px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${Math.max(4, Math.round(j.progress ?? 4))}%`, background: 'linear-gradient(90deg, #283D82 0%, #3B82F6 70%, #FEE047 100%)', borderRadius: '999px', transition: 'width 0.4s ease' }} />
                </div>
                <div style={{ fontSize: '11.5px', color: '#64748B' }}>{j.stageMessage || 'Generating your roadmap in the background…'}</div>
              </div>
            ))}
            {failedJobs.map((j) => (
              <div
                key={j.id}
                style={{
                  background: '#FEF2F2',
                  border: '1px solid #FECACA',
                  borderRadius: '12px',
                  padding: '10px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '10px',
                  flexWrap: 'wrap'
                }}
              >
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#DC2626' }}>Couldn't create "{j.topic}"</div>
                  <div style={{ fontSize: '11.5px', color: '#B91C1C' }}>{j.error}</div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      dismissJob(j);
                      openCreate(j.topic, j.levelOfLearning);
                    }}
                    style={{ background: '#FEE047', color: '#0F1219', border: 'none', borderRadius: '8px', padding: '6px 12px', fontSize: '12px', fontWeight: 800, cursor: 'pointer' }}
                  >
                    Try again
                  </button>
                  <button
                    type="button"
                    onClick={() => dismissJob(j)}
                    style={{ background: '#FFFFFF', color: '#475569', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '6px 12px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {error && !data && (
          <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '12px', padding: '12px 16px', color: '#DC2626', fontSize: '13px', fontWeight: 600, marginBottom: '10px' }}>
            Couldn't load your roadmaps: {error.message}
          </div>
        )}
        {isLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="skeleton-shimmer" style={{ height: '86px', borderRadius: '14px' }} />
            ))}
          </div>
        ) : null}
        {!isLoading && (viewMode === 'list' ? (
          /* LIST VIEW: Exactly matching the user's reference screenshot */
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}
          >
          {allCombinedProjects.length === 0 ? (
            <div
              style={{
                background: '#FFFFFF',
                borderRadius: '16px',
                border: '1px solid #E2E8F0',
                padding: '48px 24px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                color: '#64748B'
              }}
            >
              <div
                style={{
                  width: '200px',
                  height: '140px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px'
                }}
              >
                <img
                  src="/assets/first-project.png"
                  alt="Your first project starts here"
                  style={{
                    maxWidth: '100%',
                    maxHeight: '100%',
                    objectFit: 'contain'
                  }}
                />
              </div>
              <div style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A', marginBottom: '8px' }}>
                Your first project starts here
              </div>
              <div style={{ fontSize: '13.5px', color: '#64748B', maxWidth: '420px', lineHeight: 1.5, marginBottom: '20px' }}>
                Create your first guided academic learning roadmap or reset search filters to explore faculty courses.
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => openCreate()}
                  style={{
                    backgroundColor: '#0B3A6F',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '9px',
                    padding: '9px 18px',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Icon name="plus" size={14} color="#FFFFFF" />
                  <span>Create Project</span>
                </button>
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedLevel('All Levels');
                    }}
                    style={{
                      backgroundColor: '#F8FAFC',
                      color: '#475569',
                      border: '1px solid #CBD5E1',
                      borderRadius: '9px',
                      padding: '9px 16px',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    Reset Filters
                  </button>
                )}
              </div>
            </div>
          ) : (
            allCombinedProjects.map((proj) => {
              const isPrivate = proj.type === 'private' || proj.isPrivate;

              return (
                <div
                  key={proj.id}
                  onClick={() => setSelectedProject(proj)}
                  style={{
                    background: '#FFFFFF',
                    borderRadius: '16px',
                    border: '1px solid #E2E8F0',
                    padding: isMobile ? '12px' : '12px 20px',
                    display: 'flex',
                    flexDirection: isMobile ? 'column' : 'row',
                    alignItems: isMobile ? 'stretch' : 'center',
                    justifyContent: 'space-between',
                    gap: isMobile ? '12px' : '20px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                    transition: 'all 180ms ease',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#BFDBFE';
                    e.currentTarget.style.boxShadow = '0 6px 16px rgba(40, 61, 130, 0.08)';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#E2E8F0';
                    e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.03)';
                    e.currentTarget.style.transform = 'none';
                  }}
                >
                  {/* Left Group: 3D Book Thumbnail + Details */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '12px' : '20px', minWidth: 0, flex: 1, width: isMobile ? '100%' : 'auto' }}>
                    {/* 3D Book Thumbnail */}
                    <div
                      style={{
                        width: isMobile ? '76px' : '110px',
                        height: isMobile ? '56px' : '74px',
                        borderRadius: '10px',
                        overflow: 'hidden',
                        backgroundColor: '#F8FAFC',
                        boxShadow: '0 3px 8px rgba(0,0,0,0.08)',
                        flexShrink: 0,
                        position: 'relative'
                      }}
                    >
                      <img
                        src={proj.coverImage}
                        alt={proj.title}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                      />
                    </div>

                    {/* Metadata & Title */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', minWidth: 0 }}>
                      <h3
                        style={{
                          fontFamily: 'var(--font-primary)',
                          fontSize: '15px',
                          lineHeight: '20px',
                          fontWeight: 700,
                          color: '#101828',
                          margin: 0,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}
                        title={proj.title}
                      >
                        {proj.title}
                      </h3>

                      {/* Line 1: 4-square dots icon + Date */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="1.8">
                          <rect x="3" y="3" width="7" height="7" rx="1.5" />
                          <rect x="14" y="3" width="7" height="7" rx="1.5" />
                          <rect x="3" y="14" width="7" height="7" rx="1.5" />
                          <rect x="14" y="14" width="7" height="7" rx="1.5" />
                        </svg>
                        <span
                          style={{
                            fontFamily: 'var(--font-primary)',
                            fontSize: '12px',
                            fontWeight: 500,
                            color: '#94A3B8'
                          }}
                        >
                          {proj.assignedDate}
                        </span>
                      </div>

                      {/* Line 2: Author/Workspace + Modules Count + Subtle Badge */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        {isPrivate ? (
                          <span
                            style={{
                              background: '#F0FDF4',
                              border: '1px solid #BBF7D0',
                              color: '#15803D',
                              fontSize: '10px',
                              fontWeight: 800,
                              padding: '2px 8px',
                              borderRadius: '6px',
                              letterSpacing: '0.04em'
                            }}
                          >
                            SELF-DIRECTED RESEARCH
                          </span>
                        ) : (
                          <span
                            style={{
                              background: '#EEF2FF',
                              border: '1px solid #C7D2FE',
                              color: '#283D82',
                              fontSize: '10px',
                              fontWeight: 800,
                              padding: '2px 8px',
                              borderRadius: '6px',
                              letterSpacing: '0.04em'
                            }}
                          >
                            EDUCATOR ASSIGNED • {proj.educator}
                          </span>
                        )}

                        <span
                          style={{
                            background: '#F1F5F9',
                            border: '1px solid #E2E8F0',
                            color: '#475569',
                            fontSize: '10px',
                            fontWeight: 700,
                            padding: '2px 7px',
                            borderRadius: '6px',
                            fontFamily: 'var(--font-primary)'
                          }}
                        >
                          {proj.level}
                        </span>

                        <span
                          style={{
                            fontFamily: 'var(--font-primary)',
                            fontSize: '11.5px',
                            fontWeight: 500,
                            color: '#64748B'
                          }}
                        >
                          {proj.modulesCount} Modules
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Group: Yellow Pill Action Button */}
                  <div style={{ display: 'flex', alignItems: 'center', width: isMobile ? '100%' : 'auto', gap: '10px', flexShrink: 0 }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenWorkspace(proj);
                      }}
                      style={{
                        background: '#FEE047',
                        color: '#101D3B',
                        border: 'none',
                        borderRadius: '999px',
                        height: isMobile ? '42px' : '38px',
                        width: isMobile ? '100%' : 'auto',
                        padding: '0 24px',
                        fontFamily: 'var(--font-primary)',
                        fontSize: '13px',
                        fontWeight: 800,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        whiteSpace: 'nowrap',
                        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                        transition: 'background-color 150ms ease, transform 150ms ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#FCD34D';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#FEE047';
                      }}
                    >
                      {isPrivate ? 'Resume building' : 'Explore roadmap'}
                    </button>

                    {/* Delete action for private projects */}
                    {isPrivate && (
                      <button
                        onClick={(e) => handleDeleteProject(proj.id, proj.title, e)}
                        title="Delete project"
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '8px',
                          border: '1px solid #F1F5F9',
                          background: 'transparent',
                          color: '#94A3B8',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: 0,
                          transition: 'all 150ms ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#FEF2F2';
                          e.currentTarget.style.borderColor = '#FCA5A5';
                          e.currentTarget.style.color = '#EF4444';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.borderColor = '#F1F5F9';
                          e.currentTarget.style.color = '#94A3B8';
                        }}
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : (
        /* GRID VIEW: 3-column card grid highlighting large 3D book covers */
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '16px'
          }}
        >
          {allCombinedProjects.map((proj) => {
            const isPrivate = proj.type === 'private' || proj.isPrivate;

            return (
              <div
                key={proj.id}
                onClick={() => setSelectedProject(proj)}
                style={{
                  background: '#FFFFFF',
                  borderRadius: '16px',
                  border: '1px solid #E2E8F0',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                  transition: 'all 180ms ease',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#BFDBFE';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(40, 61, 130, 0.1)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#E2E8F0';
                  e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.04)';
                  e.currentTarget.style.transform = 'none';
                }}
              >
                {/* Large 3D Book Cover Banner */}
                <div
                  style={{
                    width: '100%',
                    height: '160px',
                    position: 'relative',
                    background: '#F1F5F9',
                    overflow: 'hidden'
                  }}
                >
                  <img
                    src={proj.coverImage}
                    alt={proj.title}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      top: '10px',
                      left: '10px',
                      background: isPrivate ? 'rgba(21, 128, 61, 0.92)' : 'rgba(32, 52, 107, 0.92)',
                      backdropFilter: 'blur(6px)',
                      color: '#FFFFFF',
                      fontSize: '10px',
                      fontWeight: 800,
                      padding: '3px 8px',
                      borderRadius: '6px',
                      letterSpacing: '0.04em',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
                    }}
                  >
                    <span>{isPrivate ? 'SELF-DIRECTED' : `ASSIGNED • ${proj.educator}`}</span>
                  </div>
                </div>

                {/* Card Body */}
                <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <h3
                    style={{
                      fontFamily: 'var(--font-primary)',
                      fontSize: '15px',
                      lineHeight: '20px',
                      fontWeight: 700,
                      color: '#101828',
                      marginBottom: '8px'
                    }}
                  >
                    {proj.title}
                  </h3>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11.5px', color: '#64748B', marginBottom: '14px', flexWrap: 'wrap', gap: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2">
                        <rect x="3" y="3" width="7" height="7" rx="1.5" />
                        <rect x="14" y="3" width="7" height="7" rx="1.5" />
                        <rect x="3" y="14" width="7" height="7" rx="1.5" />
                        <rect x="14" y="14" width="7" height="7" rx="1.5" />
                      </svg>
                      <span>{proj.assignedDate}</span>
                    </div>

                    <span
                      style={{
                        background: '#F1F5F9',
                        padding: '1px 6px',
                        borderRadius: '4px',
                        fontWeight: 700,
                        fontSize: '9.5px',
                        color: '#475569'
                      }}
                    >
                      {proj.level}
                    </span>

                    <span>{proj.modulesCount} Modules</span>
                  </div>

                  {/* Yellow Button */}
                  <div style={{ marginTop: 'auto', display: 'flex', gap: '8px' }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenWorkspace(proj);
                      }}
                      style={{
                        flex: 1,
                        background: '#FEE047',
                        color: '#101D3B',
                        border: 'none',
                        borderRadius: '999px',
                        height: '36px',
                        fontFamily: 'var(--font-primary)',
                        fontSize: '12px',
                        fontWeight: 800,
                        cursor: 'pointer'
                      }}
                    >
                      {isPrivate ? 'Resume building' : 'Explore roadmap'}
                    </button>
                    {isPrivate && (
                      <button
                        onClick={(e) => handleDeleteProject(proj.id, proj.title, e)}
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '8px',
                          border: '1px solid #F1F5F9',
                          background: 'transparent',
                          color: '#94A3B8',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ))}
      </div>

      {/* 4. CURATED ROADMAP / PROJECT DETAIL MODAL */}
      {selectedProject && (
        <ModalPortal isOpen={true} onClose={() => setSelectedProject(null)}>
        <div
          style={{
            width: '560px',
            maxWidth: '92vw',
            maxHeight: '88vh',
            background: '#FFFFFF',
            borderRadius: '20px',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 24px 48px rgba(0, 0, 0, 0.22)'
          }}
          onClick={(e) => e.stopPropagation()}
        >
            {/* Modal Header with Project Book Visual */}
            <div
              style={{
                background: 'linear-gradient(135deg, #101D3B 0%, #20346B 100%)',
                padding: '24px',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                gap: '18px',
                position: 'relative'
              }}
            >
              <img
                src={selectedProject.coverImage}
                alt={selectedProject.title}
                style={{
                  width: '90px',
                  height: '60px',
                  borderRadius: '8px',
                  objectFit: 'cover',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
                  flexShrink: 0
                }}
              />

              <div style={{ flex: 1, minWidth: 0, paddingRight: '24px' }}>
                <span
                  style={{
                    background: selectedProject.isPrivate ? '#334155' : '#2563EB',
                    color: '#FFFFFF',
                    fontSize: '10px',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '4px',
                    letterSpacing: '0.04em'
                  }}
                >
                  {selectedProject.isPrivate ? 'PRIVATE WORKSPACE' : selectedProject.level}
                </span>
                <h2
                  style={{
                    fontFamily: 'var(--font-primary)',
                    fontSize: '18px',
                    fontWeight: 700,
                    margin: '6px 0 2px 0',
                    lineHeight: '22px'
                  }}
                >
                  {selectedProject.title}
                </h2>
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.75)' }}>
                  By {selectedProject.educator} · {selectedProject.assignedDate}
                </div>
              </div>

              <button
                onClick={() => setSelectedProject(null)}
                style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  background: 'rgba(255,255,255,0.15)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '28px',
                  height: '28px',
                  color: '#FFFFFF',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div>
                <h4 style={{ fontSize: '12px', fontWeight: 700, color: '#64748B', letterSpacing: '0.04em', margin: '0 0 6px 0' }}>
                  CURRICULUM OVERVIEW
                </h4>
                <p style={{ fontSize: '13px', lineHeight: '1.5', color: '#334155', margin: 0 }}>
                  {selectedProject.description}
                </p>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <h4 style={{ fontSize: '12px', fontWeight: 700, color: '#64748B', letterSpacing: '0.04em', margin: 0 }}>
                    MODULE ROADMAP ({selectedProject.modules?.length || selectedProject.modulesCount} CHAPTERS)
                  </h4>
                  <span style={{ fontSize: '11px', color: '#2563EB', fontWeight: 600 }}>Guided Milestone Path</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {selectedProject.modules?.map((mod, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '10px 14px',
                        background: '#F8FAFC',
                        borderRadius: '10px',
                        border: '1px solid #E2E8F0',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                      }}
                    >
                      <div
                        style={{
                          width: '22px',
                          height: '22px',
                          borderRadius: '50%',
                          background: idx === 0 ? '#20346B' : '#E2E8F0',
                          color: idx === 0 ? '#FFFFFF' : '#64748B',
                          fontSize: '11px',
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}
                      >
                        {idx + 1}
                      </div>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: '#1E293B', flex: 1 }}>
                        {mod}
                      </span>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2">
                        <polyline points="9 18 15 12 9 6"></polyline>
                      </svg>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div
              style={{
                padding: '16px 24px',
                background: '#F8FAFC',
                borderTop: '1px solid #E2E8F0',
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '10px'
              }}
            >
              <button
                onClick={() => setSelectedProject(null)}
                style={{
                  padding: '9px 18px',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  background: '#FFFFFF',
                  color: '#475569',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
              <button
                onClick={() => {
                  const p = selectedProject;
                  setSelectedProject(null);
                  handleOpenWorkspace(p);
                }}
                style={{
                  padding: '9px 24px',
                  borderRadius: '999px',
                  border: 'none',
                  background: '#FEE047',
                  color: '#101D3B',
                  fontFamily: 'var(--font-primary)',
                  fontSize: '13px',
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                {selectedProject.isPrivate ? 'Resume building' : 'Explore roadmap'}
              </button>
            </div>
          </div>
        </ModalPortal>
      )}

      {/* 5. CREATE NEW PROJECT (shared with the dashboard's syllabus card) */}
      {createModal && (
        <CreateRoadmapModal
          initialTopic={createModal.topic}
          initialLevel={createModal.level}
          onClose={() => {
            setCreateModal(null);
            refetch();
          }}
        />
      )}

    </div>
  );
}
