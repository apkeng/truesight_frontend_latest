import React, { useState } from 'react';
import { toast } from 'react-toastify';
import Icon from '../design-system/icons';
import ModalPortal from './ModalPortal';
import { api, invalidate, keys, setQueryData, useDashboard } from '../data';
import { pathFor } from '../session';
import { timeAgo } from '../../revamp/lib/format';

const TAB_KIND = { All: null, Private: 'self', Assigned: 'educator' };

/** Dashboard list of the student's latest roadmaps (private + assigned). */
export default function MyProjects({ onViewAll, onOpenWorkspace }) {
  const { data } = useDashboard();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('All'); // 'All' | 'Private' | 'Assigned'
  const [selectedProject, setSelectedProject] = useState(null);

  const projects = (data?.projects || []).map((p) => ({
    id: p.id,
    kind: p.kind,
    name: p.title,
    level: p.levelOfLearning || 'Self-paced',
    visibility: p.kind === 'self' ? 'Private' : 'Assigned',
    owner: p.kind === 'self' ? timeAgo(p.updatedAt) : p.ownerName || p.instituteName || 'Educator',
    progress: p.progress,
    desc: p.introduction || `${p.modules} modules · ${p.subtopics} subtopics`
  }));

  const filteredProjects = projects.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = !TAB_KIND[activeTab] || p.kind === TAB_KIND[activeTab];
    return matchesSearch && matchesTab;
  });

  const trash = async (proj) => {
    setSelectedProject(null);
    setQueryData(keys.dashboard(), (d) => d && { ...d, projects: d.projects.filter((x) => x.id !== proj.id) });
    try {
      await api.trashProject(proj.id);
      toast.success(`Moved "${proj.name}" to Trash`);
      invalidate(keys.projects(), keys.trash(), keys.dashboard());
    } catch (err) {
      toast.error(err.message);
      invalidate(keys.dashboard());
    }
  };

  const share = async (proj) => {
    const url = `${window.location.origin}${pathFor('workspace', { kind: proj.kind, id: proj.id })}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Project link copied to clipboard');
    } catch {
      toast.error("Couldn't copy the link.");
    }
  };

  return (
    <div
      style={{
        flex: 1,
        minWidth: 0,
        height: '378px',
        backgroundColor: 'var(--card-bg)',
        borderRadius: 'var(--card-radius)',
        border: 'var(--card-border)',
        padding: '16px 20px',
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
          <Icon name="bookSquareBold" size={20} color="var(--primary-navy)" />
          <h2
            style={{
              fontFamily: 'var(--font-primary)',
              fontSize: '18px',
              lineHeight: '24px',
              fontWeight: 700,
              color: 'var(--heading-text)',
              margin: 0
            }}
          >
            My Projects
          </h2>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => {
              if (onViewAll) onViewAll();
            }}
            style={{
              background: 'transparent',
              border: 'none',
              padding: 0,
              fontFamily: 'var(--font-primary)',
              fontSize: '14px',
              color: '#2563EB',
              textDecoration: 'none',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            View all →
          </button>
        </div>
      </div>

      {/* Search Field & Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
        <div
          style={{
            flex: 1,
            height: '34px',
            borderRadius: '10px',
            background: '#F8FAFC',
            border: '1px solid #E2E8F0',
            display: 'flex',
            alignItems: 'center',
            padding: '0 10px',
            gap: '8px'
          }}
        >
          <Icon name="search" size={16} color="var(--muted-text)" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search projects..."
            style={{
              border: 'none',
              outline: 'none',
              background: 'transparent',
              width: '100%',
              fontFamily: 'var(--font-primary)',
              fontSize: '12px',
              fontWeight: 400,
              color: 'var(--primary-text)'
            }}
          />
        </div>

        {/* Filter Tabs */}
        <div style={{ display: 'flex', gap: '4px', background: '#F1F5F9', padding: '3px', borderRadius: '8px' }}>
          {['All', 'Private', 'Assigned'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                border: 'none',
                background: activeTab === tab ? '#FFFFFF' : 'transparent',
                color: activeTab === tab ? '#101828' : '#64748B',
                fontSize: '11px',
                fontWeight: activeTab === tab ? 700 : 500,
                borderRadius: '6px',
                padding: '2px 8px',
                cursor: 'pointer',
                boxShadow: activeTab === tab ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Project List */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
          overflowY: 'auto',
          flex: 1
        }}
      >
        {filteredProjects.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px 0', color: '#94A3B8', fontSize: '12px' }}>
            {!data ? 'Loading your projects…' : searchTerm ? `No projects found matching "${searchTerm}"` : 'No projects yet - create a roadmap to get started.'}
          </div>
        ) : (
          filteredProjects.map((p) => {
            const isPublic = p.kind === 'educator';

            return (
              <div
                key={p.id}
                onClick={() => setSelectedProject(p)}
                style={{
                  borderRadius: '10px',
                  border: '1px solid #F1F5F9',
                  background: '#FAFCFF',
                  padding: '8px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  transition: 'all 0.15s ease',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#BFDBFE';
                  e.currentTarget.style.backgroundColor = '#FFFFFF';
                  e.currentTarget.style.boxShadow = '0 2px 6px rgba(40,61,130,0.06)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#F1F5F9';
                  e.currentTarget.style.backgroundColor = '#FAFCFF';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{ minWidth: 0, flex: 1, paddingRight: '8px' }}>
                  <div
                    style={{
                      fontFamily: 'var(--font-primary)',
                      fontSize: '13px',
                      fontWeight: 700,
                      color: 'var(--primary-text)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}
                    title={p.name}
                  >
                    {p.name}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '3px' }}>
                    <span
                      style={{
                        background: '#EBF2FE',
                        color: '#2563EB',
                        fontFamily: 'var(--font-primary)',
                        fontSize: '10px',
                        fontWeight: 600,
                        padding: '1px 6px',
                        borderRadius: '4px'
                      }}
                    >
                      {p.level}
                    </span>
                    <span
                      style={{
                        color: isPublic ? '#10B981' : 'var(--secondary-text)',
                        fontFamily: 'var(--font-primary)',
                        fontSize: '10px',
                        fontWeight: 500
                      }}
                    >
                      {p.visibility}
                    </span>
                  </div>
                </div>

                <div
                  style={{
                    fontFamily: 'var(--font-primary)',
                    fontSize: '10px',
                    fontWeight: 500,
                    color: 'var(--secondary-text)',
                    textAlign: 'right',
                    whiteSpace: 'nowrap',
                    flexShrink: 0
                  }}
                >
                  {p.owner}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* PROJECT DETAILS MODAL */}
      {selectedProject && (
        <ModalPortal isOpen={true} onClose={() => setSelectedProject(null)}>
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div style={{ display: 'flex', gap: '6px' }}>
                <span style={{ fontSize: '10px', fontWeight: 700, background: '#EBF2FE', color: '#2563EB', padding: '2px 8px', borderRadius: '4px' }}>
                  {selectedProject.level}
                </span>
                <span style={{ fontSize: '10px', fontWeight: 700, background: '#F1F5F9', color: '#475569', padding: '2px 8px', borderRadius: '4px' }}>
                  {selectedProject.visibility}
                </span>
              </div>
              <button
                onClick={() => setSelectedProject(null)}
                style={{ background: 'transparent', border: 'none', color: '#64748B', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4px' }}
                aria-label="Close"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#101828', marginBottom: '6px' }}>
              {selectedProject.name}
            </h3>

            <p style={{ fontSize: '13px', color: '#64748B', lineHeight: '1.45', marginBottom: '16px' }}>
              {selectedProject.desc}
            </p>

            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
                <span style={{ color: '#64748B' }}>Overall Completion</span>
                <span style={{ fontWeight: 700, color: '#20346B' }}>{selectedProject.progress}%</span>
              </div>
              <div style={{ width: '100%', height: '8px', background: '#E2E8F0', borderRadius: '999px', overflow: 'hidden', marginBottom: '8px' }}>
                <div style={{ width: `${selectedProject.progress}%`, height: '100%', background: '#283D82', borderRadius: '999px', transition: 'width 0.2s ease' }} />
              </div>

              <div style={{ fontSize: '11px', color: '#94A3B8' }}>Progress counts subtopics you've taken a quiz on.</div>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => {
                  const p = selectedProject;
                  setSelectedProject(null);
                  onOpenWorkspace?.({ kind: p.kind, id: p.id });
                }}
                style={{
                  flex: 1,
                  height: '40px',
                  borderRadius: '999px',
                  border: 'none',
                  background: '#283D82',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                Open in Workspace
              </button>
              <button
                onClick={() => share(selectedProject)}
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
                Share
              </button>
              {selectedProject.kind === 'self' && (
              <button
                onClick={() => trash(selectedProject)}
                style={{
                  padding: '0 12px',
                  height: '40px',
                  borderRadius: '999px',
                  border: '1px solid #FCA5A5',
                  background: '#FEF2F2',
                  color: '#DC2626',
                  fontWeight: 600,
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
                title="Delete project"
              >
                Delete
              </button>
              )}
            </div>
          </div>
        </ModalPortal>
      )}

    </div>
  );
}
