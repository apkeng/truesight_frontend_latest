import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import Icon from '../design-system/icons';
import ModalPortal from './ModalPortal';
import { TSButton } from './TSModal';
import { api, invalidate, keys, setQueryData, useQuery } from '../data';
import { pathFor, useTS } from '../session';
import { generateSubtopics, updateProject, updateStudyPlan } from '../../utils/apiServices';

const CONCEPT_ICONS = ['aiAutomation', 'docUpload', 'statusUp', 'bookSquareBold', 'sunFog', 'card'];

const topicName = (t, i) => t.topic || t.name || t.title || t.description?.split('.')[0] || `Module ${i + 1}`;
const subName = (st) => st.subtopic || st.name || st.title || 'Subtopic';
// Rough reading time: ~6 minutes per key concept, never under 8.
const minutesFor = (st) => Math.max(8, (st.keyConcepts || []).length * 6);

/** The roadmap from /api/v2/learn/projects/:kind/:id in the shape the layout below renders. */
const toWorkspace = (project, history) => ({
  title: project.title,
  level: (project.levelOfLearning || 'Self-paced').toUpperCase(),
  description: project.introduction || '',
  totalModules: project.modules,
  progress: project.progress,
  modules: (project.topics || []).map((t, i) => ({
    id: t.id || `m${i}`,
    number: i + 1,
    title: topicName(t, i),
    description: t.description || '',
    raw: t,
    subtopics: (t.subtopics || []).map((st, j) => {
      const concepts = st.keyConcepts || [];
      return {
        id: st.id || `m${i}s${j}`,
        number: String(j + 1).padStart(2, '0'),
        title: subName(st),
        readTime: `${minutesFor(st)} mins`,
        tag: `${concepts.length} KEY CONCEPTS`,
        overview: st.description || '',
        history: history[subName(st)] || null,
        concepts: concepts.map((c, k) => ({
          id: c.id || `m${i}s${j}c${k}`,
          title: c.keyConcept,
          icon: CONCEPT_ICONS[k % CONCEPT_ICONS.length],
          description: c.description,
          example: c.example,
          memoryAnchor: c.mnemonic
        }))
      };
    })
  }))
});

export default function ProjectWorkspace() {
  const { kind, id } = useParams();
  const navigate = useNavigate();
  const { go, points } = useTS();
  const { data, error, isLoading, refetch } = useQuery(keys.project(kind, id), () => api.project(kind, id));
  const project = data?.project;
  const history = useMemo(() => data?.history || {}, [data]);
  const activeData = useMemo(() => (project ? toWorkspace(project, history) : null), [project, history]);

  const [activeModuleIndex, setActiveModuleIndex] = useState(0);
  const [expandedSubtopics, setExpandedSubtopics] = useState({});
  const [generating, setGenerating] = useState(false);
  const [confirmTrash, setConfirmTrash] = useState(false);
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

  const toggleSubtopic = (stId) => {
    setExpandedSubtopics((prev) => ({
      ...prev,
      [stId]: !prev[stId]
    }));
  };

  const onExit = () => go('projects');
  const quizUrl = (sub) =>
    `${pathFor('quiz', sub)}?projectTopic=${encodeURIComponent(project.topic || project.title)}&from=${kind}/${id}`;
  const startQuiz = (st) => navigate(quizUrl(st.title));
  const challengePeer = (st) => navigate(pathFor('challenges'), { state: { preset: { topic: st.title, domain: project.title } } });

  const nextSubtopic = useMemo(() => {
    for (const m of activeData?.modules || []) for (const st of m.subtopics) if (!st.history) return st;
    return null;
  }, [activeData]);

  const generateMore = async () => {
    const current = activeData.modules[activeModuleIndex];
    setGenerating(true);
    try {
      const extra = await generateSubtopics(current.title, current.raw.subtopics || []);
      if (!Array.isArray(extra) || !extra.length) throw new Error('No new subtopics came back - try again.');
      const updatedTopics = project.topics.map((t, i) => (i === activeModuleIndex ? { ...t, subtopics: [...(t.subtopics || []), ...extra] } : t));
      await (kind === 'educator' ? updateStudyPlan(id, { topics: updatedTopics }) : updateProject(id, { topics: updatedTopics }));
      setQueryData(keys.project(kind, id), (d) => d && { ...d, project: { ...d.project, topics: updatedTopics, subtopics: d.project.subtopics + extra.length } });
      invalidate(keys.projects(), keys.dashboard());
      toast.success(`Added ${extra.length} subtopics.`);
    } catch (e) {
      toast.error(e.message || "Couldn't generate more subtopics right now.");
    } finally {
      setGenerating(false);
    }
  };

  const trash = async () => {
    setConfirmTrash(false);
    try {
      await api.trashProject(id);
      invalidate(keys.projects(), keys.dashboard(), keys.trash());
      toast.success('Moved to trash.');
      go('projects');
    } catch (e) {
      toast.error(e.message);
    }
  };

  if (error && !data) {
    return (
      <div style={{ padding: '40px 20px', textAlign: 'center', background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1E293B', marginBottom: '8px' }}>Couldn't open this roadmap</h3>
        <p style={{ fontSize: '13px', color: '#64748B', marginBottom: '18px' }}>{error.message}</p>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
          <TSButton variant="secondary" onClick={onExit}>Back to Projects</TSButton>
          <TSButton onClick={() => refetch()}>Try again</TSButton>
        </div>
      </div>
    );
  }
  if (isLoading || !activeData) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', width: '100%' }}>
        <div className="skeleton-shimmer" style={{ height: '36px', width: '160px', borderRadius: '999px' }} />
        <div className="skeleton-shimmer" style={{ height: '110px', borderRadius: '16px' }} />
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '290px 1fr', gap: '16px' }}>
          <div className="skeleton-shimmer" style={{ height: '420px', borderRadius: '16px' }} />
          <div className="skeleton-shimmer" style={{ height: '420px', borderRadius: '16px' }} />
        </div>
      </div>
    );
  }

  const progressScore = activeData.progress;
  const currentModule = activeData.modules[activeModuleIndex] || activeData.modules[0] || { title: 'No modules yet', description: 'This roadmap has no modules yet.', subtopics: [] };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: isMobile ? 'auto' : '100%',
        minHeight: isMobile ? '100%' : '100%',
        boxSizing: 'border-box',
        gap: isMobile ? '10px' : '14px',
        overflow: isMobile ? 'visible' : 'hidden'
      }}
    >
      {/* 1. TOP SECURE EXIT & BREADCRUMB ROW */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
          gap: isMobile ? '8px' : '12px'
        }}
      >
        <button
          type="button"
          onClick={onExit}
          style={{
            height: isMobile ? '34px' : '36px',
            padding: isMobile ? '0 12px' : '0 16px',
            background: '#FFFFFF',
            border: '1px solid var(--card-border, #E2E6EF)',
            borderRadius: '999px',
            color: 'var(--primary-navy, #20346B)',
            fontFamily: 'var(--font-primary)',
            fontSize: isMobile ? '11.5px' : '12px',
            fontWeight: 800,
            letterSpacing: '0.04em',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            cursor: 'pointer',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            transition: 'all 0.16s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--primary-navy, #20346B)';
            e.currentTarget.style.color = '#FFFFFF';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#FFFFFF';
            e.currentTarget.style.color = 'var(--primary-navy, #20346B)';
          }}
        >
          <Icon name="prevStep" size={13} color="currentColor" />
          <span>{isMobile ? 'Back' : 'Back to Projects'}</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '6px' : '8px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              background: '#FFFFFF',
              border: '1px solid #E2E6EF',
              padding: isMobile ? '5px 10px' : '6px 14px',
              borderRadius: '999px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
            }}
          >
            <Icon name="rewardGem" size={isMobile ? 13 : 15} color="#F59E0B" />
            <span style={{ fontSize: isMobile ? '11px' : '12px', fontWeight: 800, color: '#1F2537', fontFamily: 'var(--font-primary)' }}>
              {points.toLocaleString()} PTS
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: isMobile ? '6px' : '8px',
              background: '#FFFFFF',
              border: '1px solid #E2E6EF',
              padding: isMobile ? '5px 10px' : '6px 14px',
              borderRadius: '999px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
            }}
          >
            <div style={{ width: isMobile ? '30px' : '40px', height: '6px', background: '#F1F5F9', borderRadius: '3px', overflow: 'hidden' }}>
              <div
                style={{
                  width: `${progressScore}%`,
                  height: '100%',
                  background: 'var(--primary-navy, #20346B)',
                  transition: 'width 0.3s ease'
                }}
              />
            </div>
            <span style={{ fontSize: isMobile ? '11px' : '12px', fontWeight: 800, color: 'var(--primary-navy, #20346B)', fontFamily: 'var(--font-primary)' }}>
              {progressScore}%
            </span>
          </div>
        </div>
      </div>

      {/* 2. HERO BANNER (Matches TrueSights Navy Banners cleanly) */}
      <div
        style={{
          background: '#243367',
          borderRadius: isMobile ? '14px' : '16px',
          padding: isMobile ? '14px 16px' : '18px 24px',
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          alignItems: isMobile ? 'stretch' : 'center',
          justifyContent: 'space-between',
          gap: isMobile ? '12px' : '20px',
          boxShadow: '0 4px 16px rgba(36, 51, 103, 0.14)',
          flexShrink: 0
        }}
      >
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span
              style={{
                background: 'rgba(255, 255, 255, 0.15)',
                color: '#FFFFFF',
                fontSize: isMobile ? '9.5px' : '10.5px',
                fontWeight: 800,
                letterSpacing: '0.06em',
                padding: '2px 8px',
                borderRadius: '6px',
                fontFamily: 'var(--font-primary)'
              }}
            >
              {activeData.level} · ROADMAP WORKSPACE
            </span>
          </div>

          <h1
            style={{
              fontFamily: 'var(--font-primary)',
              fontSize: isMobile ? '18px' : '22px',
              fontWeight: 800,
              color: '#FFFFFF',
              margin: '2px 0 4px 0',
              letterSpacing: '-0.01em',
              lineHeight: 1.3
            }}
          >
            {activeData.title}
          </h1>

          <p
            style={{
              fontFamily: 'var(--font-primary)',
              fontSize: isMobile ? '12px' : '12.5px',
              color: 'rgba(255, 255, 255, 0.85)',
              margin: 0,
              lineHeight: 1.45,
              maxWidth: '820px'
            }}
          >
            {activeData.description}
          </p>
          {project.generation && (
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                marginTop: '8px',
                background: 'rgba(16, 185, 129, 0.16)',
                border: '1px solid rgba(167, 243, 208, 0.35)',
                color: '#D1FAE5',
                borderRadius: '999px',
                padding: '3px 10px',
                fontSize: '11px',
                fontWeight: 700
              }}
            >
              <Icon name="checkCircle" size={12} color="#A7F3D0" />
              Researched & fact-checked
              {project.generation.averageFinalScore != null && ` · accuracy ${project.generation.averageFinalScore}/100`}
              {project.generation.sources?.length > 0 && ` · ${project.generation.sources.length} sources`}
            </div>
          )}
        </div>

        {/* Banner Right Metric Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0, width: isMobile ? '100%' : 'auto' }}>
          <div
            style={{
              flex: isMobile ? 1 : 'none',
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.16)',
              borderRadius: '10px',
              padding: isMobile ? '6px 12px' : '8px 16px',
              textAlign: 'center'
            }}
          >
            <div style={{ color: '#FFFFFF', fontSize: isMobile ? '16px' : '18px', fontWeight: 800, fontFamily: 'var(--font-primary)' }}>
              {activeData.totalModules || activeData.modules?.length || 5}
            </div>
            <div style={{ color: 'rgba(255, 255, 255, 0.65)', fontSize: '9px', fontWeight: 700, fontFamily: 'var(--font-primary)' }}>
              MODULES
            </div>
          </div>

          <div
            style={{
              flex: isMobile ? 1 : 'none',
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.16)',
              borderRadius: '10px',
              padding: isMobile ? '6px 12px' : '8px 16px',
              textAlign: 'center'
            }}
          >
            <div style={{ color: '#FFFFFF', fontSize: isMobile ? '16px' : '18px', fontWeight: 800, fontFamily: 'var(--font-primary)' }}>
              {progressScore}%
            </div>
            <div style={{ color: 'rgba(255, 255, 255, 0.65)', fontSize: '9px', fontWeight: 700, fontFamily: 'var(--font-primary)' }}>
              COMPLETED
            </div>
          </div>

          <button
            type="button"
            disabled={!nextSubtopic}
            onClick={() => nextSubtopic && startQuiz(nextSubtopic)}
            style={{
              flex: isMobile ? 1 : 'none',
              height: '44px',
              padding: '0 18px',
              background: nextSubtopic ? '#FEE047' : 'rgba(255,255,255,0.2)',
              color: nextSubtopic ? '#0F1219' : 'rgba(255,255,255,0.7)',
              border: 'none',
              borderRadius: '10px',
              fontSize: '12.5px',
              fontWeight: 800,
              cursor: nextSubtopic ? 'pointer' : 'default',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              whiteSpace: 'nowrap',
              transition: 'all 0.15s ease'
            }}
          >
            <Icon name="playBold" size={12} color={nextSubtopic ? '#0F1219' : 'rgba(255,255,255,0.7)'} />
            {nextSubtopic ? 'Next quiz' : 'All done'}
          </button>
          {kind === 'self' && project.canEdit && (
            <button
              type="button"
              onClick={() => setConfirmTrash(true)}
              aria-label="Move project to trash"
              title="Move project to trash"
              style={{
                width: '40px',
                height: '44px',
                borderRadius: '10px',
                border: '1px solid rgba(255,255,255,0.16)',
                background: 'rgba(255,255,255,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                flexShrink: 0
              }}
            >
              <Icon name="trash" size={16} color="#FFFFFF" />
            </button>
          )}
        </div>
      </div>

      {/* MOBILE-ONLY HORIZONTAL MODULE SELECTOR STRIP (Clean native app carousel) */}
      {isMobile && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            background: '#FFFFFF',
            border: '1px solid #E2E6EF',
            borderRadius: '14px',
            padding: '12px 14px',
            boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 2px' }}>
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#4B7EE8', letterSpacing: '0.06em', textTransform: 'uppercase', fontFamily: 'var(--font-primary)' }}>
              ROADMAP MODULES ({activeData.modules.length})
            </span>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', fontFamily: 'var(--font-primary)' }}>
              Module {activeModuleIndex + 1} of {activeData.modules.length}
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              overflowX: 'auto',
              paddingBottom: '2px',
              WebkitOverflowScrolling: 'touch',
              scrollbarWidth: 'none'
            }}
          >
            {activeData.modules.map((mod, idx) => {
              const isSelected = idx === activeModuleIndex;
              return (
                <button
                  key={mod.id || idx}
                  type="button"
                  onClick={() => setActiveModuleIndex(idx)}
                  style={{
                    flexShrink: 0,
                    padding: '8px 14px',
                    borderRadius: '10px',
                    border: isSelected ? '1.5px solid #243367' : '1px solid #E2E8F0',
                    background: isSelected ? '#243367' : '#F8FAFC',
                    color: isSelected ? '#FFFFFF' : '#334155',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    cursor: 'pointer',
                    boxShadow: isSelected ? '0 2px 8px rgba(36, 51, 103, 0.25)' : 'none',
                    transition: 'all 0.15s ease',
                    fontFamily: 'var(--font-primary)'
                  }}
                >
                  <span
                    style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      background: isSelected ? 'rgba(255, 255, 255, 0.25)' : '#E2E8F0',
                      color: isSelected ? '#FFFFFF' : '#4B7EE8',
                      fontSize: '11px',
                      fontWeight: 800,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {mod.number || idx + 1}
                  </span>
                  <span style={{ fontSize: '12px', fontWeight: isSelected ? 800 : 600, whiteSpace: 'nowrap' }}>
                    {mod.title.length > 22 ? mod.title.slice(0, 22) + '...' : mod.title}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. MAIN WORKSPACE CANVAS (Two-Column on Desktop, Full-Width on Mobile) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '290px 1fr',
          gap: isMobile ? '12px' : '16px',
          flex: 1,
          minHeight: 0,
          overflow: isMobile ? 'visible' : 'hidden'
        }}
      >
        {/* LEFT COLUMN: KNOWLEDGE STACK (Desktop only - Mobile uses the horizontal carousel above) */}
        {!isMobile && (
        <div
          style={{
            background: '#FFFFFF',
            border: '1px solid var(--card-border, #E2E6EF)',
            borderRadius: '16px',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            overflowY: 'auto',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
          }}
        >
          {/* Knowledge Stack Header with #4B7EE8 branding */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingBottom: '12px',
              borderBottom: '1px solid #EEF2F6',
              marginBottom: '4px'
            }}
          >
            <div>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  color: '#4B7EE8',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  fontFamily: 'var(--font-primary)'
                }}
              >
                KNOWLEDGE STACK
              </span>
            </div>
            <span
              style={{
                fontSize: '10.5px',
                fontWeight: 700,
                color: '#4B7EE8',
                background: 'rgba(75, 126, 232, 0.1)',
                padding: '2px 8px',
                borderRadius: '999px',
                fontFamily: 'var(--font-primary)'
              }}
            >
              {activeData.modules.length} Modules
            </span>
          </div>

          {activeData.modules.map((mod, idx) => {
            const isSelected = idx === activeModuleIndex;
            return (
              <div
                key={mod.id}
                onClick={() => setActiveModuleIndex(idx)}
                title={mod.title}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 14px',
                  borderRadius: '12px',
                  background: isSelected ? 'rgba(75, 126, 232, 0.08)' : '#FFFFFF',
                  border: isSelected ? '1.5px solid #4B7EE8' : '1px solid #E2E6EF',
                  cursor: 'pointer',
                  transition: 'all 0.16s ease',
                  position: 'relative'
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.borderColor = '#CBD5E1';
                    e.currentTarget.style.background = '#F8FAFC';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.borderColor = '#E2E6EF';
                    e.currentTarget.style.background = '#FFFFFF';
                  }
                }}
              >
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: isSelected ? '#4B7EE8' : '#F1F5F9',
                    color: isSelected ? '#FFFFFF' : '#475569',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '13px',
                    fontWeight: 800,
                    fontFamily: 'var(--font-primary)',
                    flexShrink: 0,
                    boxShadow: isSelected ? '0 2px 6px rgba(75, 126, 232, 0.3)' : 'none',
                    transition: 'all 0.16s ease'
                  }}
                >
                  {mod.number}
                </div>

                <div style={{ minWidth: 0, flex: 1 }}>
                  <h4
                    style={{
                      fontFamily: 'var(--font-primary)',
                      fontSize: '13px',
                      fontWeight: isSelected ? 700 : 600,
                      color: isSelected ? '#1E3A8A' : 'var(--heading-text, #1F2537)',
                      margin: 0,
                      lineHeight: 1.35
                    }}
                  >
                    {mod.title}
                  </h4>
                  <div
                    style={{
                      fontSize: '11px',
                      color: isSelected ? '#4B7EE8' : 'var(--secondary-text, #6B7790)',
                      fontWeight: 600,
                      marginTop: '3px',
                      fontFamily: 'var(--font-primary)'
                    }}
                  >
                    {mod.subtopics?.length || 0} subtopics
                    {mod.subtopics?.filter((x) => x.history).length ? ` · ${mod.subtopics.filter((x) => x.history).length} quizzed` : ''}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        )}

        {/* RIGHT COLUMN: MODULE DETAILS & EXPANDABLE SUBTOPICS */}
        <div
          style={{
            background: '#FFFFFF',
            border: '1px solid var(--card-border, #E2E6EF)',
            borderRadius: '16px',
            padding: isMobile ? '16px 14px' : '22px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            overflowY: 'auto',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
          }}
        >
          {/* Module Title Header */}
          <div style={{ borderBottom: '1px solid #F1F5F9', paddingBottom: '14px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{ minWidth: 0, flex: 1 }}>
            <h2
              style={{
                fontFamily: 'var(--font-primary)',
                fontSize: '20px',
                fontWeight: 800,
                color: 'var(--heading-text, #1F2537)',
                margin: '0 0 6px 0',
                letterSpacing: '-0.01em'
              }}
            >
              {currentModule.title}
            </h2>
            <p
              style={{
                fontFamily: 'var(--font-primary)',
                fontSize: '13px',
                color: 'var(--secondary-text, #6B7790)',
                margin: 0,
                lineHeight: 1.5
              }}
            >
              {currentModule.description}
            </p>
            </div>
            {project.canEdit && activeData.modules.length > 0 && (
              <TSButton variant="secondary" busy={generating} onClick={generateMore}>
                <Icon name="aiAutomation" size={14} color="#0B1A2B" /> More subtopics
              </TSButton>
            )}
          </div>

          {/* Subtopics List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {!currentModule.subtopics.length && (
              <div style={{ padding: '30px 0', textAlign: 'center', fontSize: '13px', color: '#94A3B8' }}>No subtopics in this module yet.</div>
            )}
            {currentModule.subtopics.map((st) => {
              const isExpanded = !!expandedSubtopics[st.id];
              const isMastered = st.history?.best === 100;

              return (
                <div
                  key={st.id}
                  style={{
                    background: '#FFFFFF',
                    border: isExpanded ? '1.5px solid var(--primary-navy, #20346B)' : '1px solid #E2E6EF',
                    borderRadius: '14px',
                    padding: '16px 20px',
                    boxShadow: isExpanded ? '0 4px 14px rgba(32, 52, 107, 0.06)' : 'none',
                    transition: 'all 0.18s ease'
                  }}
                >
                  {/* Subtopic Header Bar */}
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: isMobile ? 'column' : 'row',
                      alignItems: isMobile ? 'stretch' : 'center',
                      justifyContent: 'space-between',
                      gap: isMobile ? '12px' : '16px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '10px' : '14px', minWidth: 0, flex: 1 }}>
                      <div
                        style={{
                          width: isMobile ? '36px' : '40px',
                          height: isMobile ? '36px' : '40px',
                          borderRadius: '10px',
                          background: isExpanded ? '#EEF2FF' : '#F8FAFC',
                          border: isExpanded ? '1px solid #C7D2FE' : '1px solid #E2E8F0',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}
                      >
                        <span style={{ fontSize: '9px', fontWeight: 800, color: '#64748B', fontFamily: 'var(--font-primary)' }}>
                          ST
                        </span>
                        <span style={{ fontSize: isMobile ? '13px' : '14px', fontWeight: 800, color: 'var(--primary-navy, #20346B)', fontFamily: 'var(--font-primary)' }}>
                          {st.number}
                        </span>
                      </div>

                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <h3
                            style={{
                              fontFamily: 'var(--font-primary)',
                              fontSize: isMobile ? '14px' : '15px',
                              fontWeight: 700,
                              color: 'var(--heading-text, #1F2537)',
                              margin: 0,
                              lineHeight: 1.3
                            }}
                          >
                            {st.title}
                          </h3>
                          {isMastered && (
                            <span
                              style={{
                                background: '#ECFDF5',
                                border: '1px solid #A7F3D0',
                                color: '#059669',
                                fontSize: '10px',
                                fontWeight: 800,
                                padding: '1px 6px',
                                borderRadius: '999px',
                                fontFamily: 'var(--font-primary)'
                              }}
                            >
                              MASTERED
                            </span>
                          )}
                          {st.history && !isMastered && (
                            <span
                              style={{
                                background: '#EFF6FF',
                                border: '1px solid #BFDBFE',
                                color: '#1D4ED8',
                                fontSize: '10px',
                                fontWeight: 800,
                                padding: '1px 6px',
                                borderRadius: '999px',
                                fontFamily: 'var(--font-primary)'
                              }}
                            >
                              BEST {st.history.best}%
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: isMobile ? '11px' : '11.5px', color: '#64748B', fontFamily: 'var(--font-primary)', marginTop: '2px' }}>
                          {st.readTime} · {st.tag}
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons: Explore, Challenge & Quiz */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0, width: isMobile ? '100%' : 'auto' }}>
                      <button
                        type="button"
                        onClick={() => challengePeer(st)}
                        title="Challenge a peer on this topic"
                        aria-label="Challenge a peer on this topic"
                        style={{
                          width: '36px',
                          height: isMobile ? '38px' : '36px',
                          borderRadius: '8px',
                          background: '#F8FAFC',
                          border: '1px solid #E2E8F0',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          flexShrink: 0,
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <Icon name="challenges" size={16} color="#20346B" />
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleSubtopic(st.id)}
                        style={{
                          flex: isMobile ? 1 : 'none',
                          height: isMobile ? '38px' : '36px',
                          padding: isMobile ? '0 12px' : '0 14px',
                          background: '#FFFFFF',
                          border: '1px solid #CBD5E1',
                          borderRadius: '8px',
                          color: 'var(--primary-navy, #20346B)',
                          fontFamily: 'var(--font-primary)',
                          fontSize: isMobile ? '11px' : '11.5px',
                          fontWeight: 800,
                          letterSpacing: '0.04em',
                          textTransform: 'uppercase',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          transition: 'all 0.15s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = 'var(--primary-navy, #20346B)';
                          e.currentTarget.style.backgroundColor = '#F8FAFC';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = '#CBD5E1';
                          e.currentTarget.style.backgroundColor = '#FFFFFF';
                        }}
                      >
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          style={{
                            transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                            transition: 'transform 0.18s ease'
                          }}
                        >
                          <polyline points="6 9 12 15 18 9" />
                        </svg>
                        <span>{isExpanded ? 'Collapse' : 'Explore'}</span>
                      </button>

                      {/* TrueSights Yellow Start Quiz Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          startQuiz(st);
                        }}
                        style={{
                          flex: isMobile ? 1 : 'none',
                          height: isMobile ? '38px' : '36px',
                          padding: isMobile ? '0 12px' : '0 16px',
                          background: isMastered ? '#10B981' : '#FEE047',
                          border: isMastered ? 'none' : '1px solid rgba(0, 0, 0, 0.05)',
                          borderRadius: '8px',
                          color: isMastered ? '#FFFFFF' : '#0F1219',
                          fontFamily: 'var(--font-primary)',
                          fontSize: isMobile ? '11.5px' : '12px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          boxShadow: isMastered
                            ? '0 2px 6px rgba(16, 185, 129, 0.25)'
                            : '0 2px 6px rgba(254, 224, 71, 0.35)',
                          transition: 'all 0.15s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = isMastered ? '#059669' : '#FCD34D';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = isMastered ? '#10B981' : '#FEE047';
                        }}
                      >
                        <Icon name="playBold" size={11} color={isMastered ? '#FFFFFF' : '#0F1219'} />
                        <span>
                          {st.history ? 'Retake Quiz' : 'Start Quiz'}
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* EXPLORED VIEW: Clean, spacious, and decluttered */}
                  {isExpanded && (
                    <div
                      style={{
                        marginTop: '16px',
                        paddingTop: '16px',
                        borderTop: '1px solid #E2E8F0',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '14px',
                        animation: 'modalContentPop 0.2s ease'
                      }}
                    >
                      {/* Overview Box */}
                      {st.overview && (
                      <div
                        style={{
                          background: '#F8FAFC',
                          border: '1px solid #E2E8F0',
                          borderRadius: '10px',
                          padding: '12px 16px'
                        }}
                      >
                        <div
                          style={{
                            fontSize: '10.5px',
                            fontWeight: 800,
                            letterSpacing: '0.05em',
                            textTransform: 'uppercase',
                            color: 'var(--primary-navy, #20346B)',
                            fontFamily: 'var(--font-primary)',
                            marginBottom: '4px'
                          }}
                        >
                          CONTEXT & MANDATE
                        </div>
                        <p
                          style={{
                            fontSize: '13px',
                            color: '#334155',
                            fontFamily: 'var(--font-primary)',
                            lineHeight: 1.5,
                            margin: 0
                          }}
                        >
                          {st.overview}
                        </p>
                      </div>
                      )}

                      {/* Concepts List */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {st.concepts.map((concept) => (
                          <div
                            key={concept.id}
                            style={{
                              background: '#FFFFFF',
                              border: '1px solid #E2E8F0',
                              borderRadius: '10px',
                              padding: '14px 16px',
                              display: 'flex',
                              alignItems: 'flex-start',
                              gap: '14px'
                            }}
                          >
                            <div
                              style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: '8px',
                                background: '#EEF2FF',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'var(--primary-navy, #20346B)',
                                flexShrink: 0
                              }}
                            >
                              <Icon name={concept.icon} size={18} color="var(--primary-navy, #20346B)" />
                            </div>

                            <div style={{ minWidth: 0, flex: 1 }}>
                              <h4
                                style={{
                                  fontSize: '14px',
                                  fontWeight: 700,
                                  color: 'var(--heading-text, #1F2537)',
                                  fontFamily: 'var(--font-primary)',
                                  margin: '0 0 4px 0'
                                }}
                              >
                                {concept.title}
                              </h4>
                              <p
                                style={{
                                  fontSize: '12.5px',
                                  color: '#475569',
                                  fontFamily: 'var(--font-primary)',
                                  lineHeight: 1.45,
                                  margin: '0 0 8px 0'
                                }}
                              >
                                {concept.description}
                              </p>
                              {concept.example && (
                                <p style={{ fontSize: '12px', color: '#64748B', lineHeight: 1.45, margin: '0 0 8px 0' }}>
                                  <strong style={{ color: '#1F2537' }}>Example: </strong>
                                  {concept.example}
                                </p>
                              )}

                              {/* Clean Mnemonic Anchor Chip */}
                              {concept.memoryAnchor && (
                              <div
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '6px',
                                  background: '#FFFBEB',
                                  border: '1px solid #FDE68A',
                                  borderRadius: '6px',
                                  padding: '4px 10px'
                                }}
                              >
                                <Icon name="rewardGem" size={12} color="#D97706" />
                                <span
                                  style={{
                                    fontSize: '11px',
                                    fontWeight: 700,
                                    color: '#92400E',
                                    fontFamily: 'var(--font-primary)'
                                  }}
                                >
                                  Memory Anchor: "{concept.memoryAnchor}"
                                </span>
                              </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                      {st.history?.last && (
                        <div style={{ fontSize: '11px', color: '#64748B' }}>
                          {st.history.attempts} attempt{st.history.attempts > 1 ? 's' : ''} · last scored {st.history.last.percent}% on{' '}
                          {new Date(st.history.last.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {project.generation?.sources?.length > 0 && (
            <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 800, color: '#1F2537' }}>
                <Icon name="checkCircle" size={14} color="#059669" /> Sources used to research this roadmap
              </div>
              <p style={{ fontSize: '11.5px', color: '#64748B', margin: '2px 0 10px 0' }}>
                Every module was fact-checked against these references; flagged facts were re-verified with a web search before being corrected.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '6px 18px' }}>
                {project.generation.sources.map((src) => (
                  <a
                    key={src.uri}
                    href={src.uri}
                    target="_blank"
                    rel="noreferrer"
                    style={{ fontSize: '12px', color: '#2563EB', textDecoration: 'none', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                  >
                    ↗ {src.title}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 4. MOVE-TO-TRASH CONFIRMATION */}
      {confirmTrash && (
        <ModalPortal isOpen={true} onClose={() => setConfirmTrash(false)}>
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ width: '360px', maxWidth: '92vw', background: '#FFFFFF', borderRadius: '18px', padding: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.18)', textAlign: 'center', animation: 'modalContentPop 0.25s ease' }}
          >
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1E293B', marginBottom: '8px' }}>Move to trash?</h3>
            <p style={{ fontSize: '13px', color: '#64748B', lineHeight: 1.5, marginBottom: '20px' }}>
              "{activeData.title}" stays in Trash for 30 days before it's permanently deleted.
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <TSButton variant="secondary" style={{ flex: 1 }} onClick={() => setConfirmTrash(false)}>Cancel</TSButton>
              <TSButton variant="danger" style={{ flex: 1 }} onClick={trash}>Move to trash</TSButton>
            </div>
          </div>
        </ModalPortal>
      )}
    </div>
  );
}
