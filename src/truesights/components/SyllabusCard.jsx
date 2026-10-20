import React, { useState, useRef } from 'react';
import { toast } from 'react-toastify';
import Icon from '../design-system/icons';
import ModalPortal from './ModalPortal';
import CreateRoadmapModal from './CreateRoadmapModal';
import { api, invalidate, keys, setQueryData, useDashboard, useQuery } from '../data';

const topicName = (t) => t?.name || t?.title || t?.topic || '';
const subtopicName = (st) => (typeof st === 'string' ? st : st?.name || st?.title || '');

/**
 * Syllabus mind map: upload a syllabus PDF, the backend extracts its topics,
 * and any topic can become a roadmap (same create flow as Projects).
 */
export default function SyllabusCard() {
  const { data: dashboard } = useDashboard();
  const summary = dashboard?.syllabus;
  const syllabus = useQuery(summary ? keys.syllabus() : null, api.syllabus);
  const [isDragging, setIsDragging] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isMindMapModalOpen, setIsMindMapModalOpen] = useState(false);
  const [creatingTopic, setCreatingTopic] = useState(null);
  const fileInputRef = useRef(null);

  const topics = syllabus.data?.mindmap?.topics || [];
  const syllabusTitle = syllabus.data?.mindmap?.syllabusTitle || '';
  const uploadedFile = summary ? { name: summary.filename || syllabus.data?.filename || 'Your syllabus' } : null;

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const processUploadedFile = async (file) => {
    if (!file) return;
    if (file.type !== 'application/pdf') return toast.error('Please choose a PDF file.');
    if (file.size > 100 * 1024 * 1024) return toast.error('That PDF is over 100 MB.');
    setIsGenerating(true);
    try {
      const result = await api.uploadSyllabus(file);
      setQueryData(keys.syllabus(), result);
      invalidate(keys.dashboard());
      toast.success('Syllabus mapped - pick a topic to start a project.');
      setIsMindMapModalOpen(true);
    } catch (e) {
      toast.error(e.message || "Couldn't read that syllabus.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processUploadedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      processUploadedFile(e.target.files[0]);
    }
    e.target.value = '';
  };

  // "Change file": forget the current syllabus, then pick a new one.
  const handleReset = async (e) => {
    e?.stopPropagation();
    try {
      await api.deleteSyllabus();
      setQueryData(keys.syllabus(), null);
      invalidate(keys.dashboard());
      fileInputRef.current?.click();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div
      style={{
        width: '100%',
        height: '285px',
        backgroundColor: 'var(--card-bg)',
        borderRadius: 'var(--card-radius)',
        border: 'var(--card-border)',
        padding: '16px 20px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        boxSizing: 'border-box',
        position: 'relative'
      }}
    >
      {/* Header Info */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Icon name="aiAutomation" size={20} color="var(--primary-navy)" />
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
            Syllabus Mind Map
          </h2>
        </div>

        <p
          style={{
            fontFamily: 'var(--font-primary)',
            fontSize: '13px',
            lineHeight: '18px',
            fontWeight: 400,
            color: 'var(--secondary-text)',
            marginTop: '4px',
            marginBottom: 0
          }}
        >
          AI extracts topics and lets you create projects from them.
        </p>
      </div>

      {/* Dashed Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => {
          if (!uploadedFile && !isGenerating) fileInputRef.current?.click();
        }}
        tabIndex={0}
        role="button"
        aria-label="Upload syllabus PDF"
        style={{
          height: '175px',
          borderRadius: '12px',
          border: `1.5px dashed ${isDragging ? '#283D82' : uploadedFile ? '#10B981' : '#C7D4EB'}`,
          backgroundColor: isDragging ? '#EFF6FF' : uploadedFile ? '#F0FDF4' : '#F9FBFE',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          cursor: uploadedFile ? 'default' : 'pointer',
          outline: 'none',
          transition: 'all 180ms ease',
          padding: '12px'
        }}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          accept="application/pdf"
          style={{ display: 'none' }}
        />

        {/* Max Size Label / Reset Button */}
        <div
          style={{
            position: 'absolute',
            top: '10px',
            right: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          {uploadedFile ? (
            <button
              onClick={handleReset}
              style={{
                background: '#FEE2E2',
                color: '#EF4444',
                border: 'none',
                fontSize: '10px',
                fontWeight: 700,
                padding: '3px 8px',
                borderRadius: '999px',
                cursor: 'pointer'
              }}
            >
              Change file
            </button>
          ) : (
            <div
              style={{
                background: '#EEF2F6',
                color: 'var(--secondary-text)',
                fontFamily: 'var(--font-primary)',
                fontSize: '10px',
                lineHeight: '12px',
                fontWeight: 600,
                padding: '3px 8px',
                borderRadius: '999px',
                letterSpacing: '0.04em'
              }}
            >
              MAX 100MB
            </div>
          )}
        </div>

        {uploadedFile ? (
          /* UPLOADED / GENERATED STATE */
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', textAlign: 'center' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                background: '#ECFDF5',
                color: '#10B981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Icon name="docUpload" size={24} color="#10B981" />
            </div>

            <div
              style={{
                fontFamily: 'var(--font-primary)',
                fontSize: '13px',
                lineHeight: '18px',
                fontWeight: 700,
                color: 'var(--primary-text)',
                maxWidth: '280px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
              title={uploadedFile.name}
            >
              {uploadedFile.name}
            </div>

            {syllabus.isLoading ? (
              <div style={{ fontSize: '11px', color: '#2563EB', fontWeight: 600 }}>
                Loading your mind map…
              </div>
            ) : (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMindMapModalOpen(true);
                }}
                style={{
                  background: '#283D82',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '999px',
                  padding: '6px 16px',
                  fontFamily: 'var(--font-primary)',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(40,61,130,0.25)',
                  transition: 'transform 0.15s ease'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.04)')}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
              >
                Explore Mind Map ({topics.length} Topics)
              </button>
            )}
          </div>
        ) : (
          /* EMPTY DROPZONE STATE */
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--secondary-text)'
              }}
            >
              <Icon name="docUpload" size={24} color="#6B7790" />
            </div>

            <div
              style={{
                fontFamily: 'var(--font-primary)',
                fontSize: '14px',
                lineHeight: '20px',
                fontWeight: 700,
                color: 'var(--primary-text)'
              }}
            >
              {isGenerating ? 'Reading your syllabus…' : 'Drop your syllabus PDF here'}
            </div>

            <div
              style={{
                fontFamily: 'var(--font-primary)',
                fontSize: '12px',
                lineHeight: '16px',
                fontWeight: 500,
                color: 'var(--muted-text)'
              }}
            >
              {isGenerating ? 'This takes up to a minute' : 'or click to browse local files'}
            </div>
          </div>
        )}
      </div>

      {/* INTERACTIVE MIND MAP MODAL */}
      {isMindMapModalOpen && (
        <ModalPortal isOpen={true} onClose={() => setIsMindMapModalOpen(false)}>
        <div
          style={{
            width: '580px',
            maxWidth: '90vw',
            background: '#FFFFFF',
            borderRadius: '20px',
            padding: '24px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
            animation: 'modalContentPop 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
          onClick={(e) => e.stopPropagation()}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, background: '#EFF6FF', color: '#2563EB', padding: '3px 8px', borderRadius: '6px' }}>
                AI Topic Extraction · {topics.length} Topics Discovered
              </span>
              <button
                onClick={() => setIsMindMapModalOpen(false)}
                style={{ background: 'transparent', border: 'none', color: '#64748B', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4px' }}
                aria-label="Close"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#101828', marginBottom: '4px' }}>
              {syllabusTitle || 'Syllabus Mind Map'}
            </h3>
            <p style={{ fontSize: '12px', color: '#64748B', marginBottom: '18px' }}>
              Topics extracted from {uploadedFile?.name}. Pick a topic to create a learning roadmap from it.
            </p>

            {/* Mind Map Interactive Graph Nodes */}
            <div
              style={{
                background: '#F8FAFC',
                borderRadius: '14px',
                border: '1px solid #E2E8F0',
                padding: '16px',
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '12px',
                marginBottom: '20px',
                maxHeight: '52vh',
                overflowY: 'auto'
              }}
            >
              {topics.map((t, idx) => (
                <div key={idx} style={{ background: '#FFFFFF', padding: '12px', borderRadius: '10px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#20346B', marginBottom: '6px' }}>
                    {topicName(t)}
                  </div>
                  <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '11px', color: '#64748B', lineHeight: '1.4', flex: 1 }}>
                    {(t.subtopics || t.children || []).slice(0, 4).map((st, i) => (
                      <li key={i}>{subtopicName(st)}</li>
                    ))}
                  </ul>
                  <button
                    type="button"
                    onClick={() => setCreatingTopic(topicName(t))}
                    style={{ alignSelf: 'flex-start', marginTop: '8px', background: 'none', border: 'none', padding: 0, color: '#2563EB', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}
                  >
                    Create project →
                  </button>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setCreatingTopic(syllabusTitle || topicName(topics[0]))}
                style={{
                  flex: 1,
                  height: '40px',
                  borderRadius: '999px',
                  border: 'none',
                  background: '#FEE047',
                  color: '#101D3B',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                + Create Project From This Syllabus
              </button>
              <button
                onClick={() => setIsMindMapModalOpen(false)}
                style={{
                  padding: '0 20px',
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
                Close
              </button>
          </div>
        </div>
        </ModalPortal>
      )}

      {creatingTopic !== null && (
        <CreateRoadmapModal
          source="syllabus"
          initialTopic={[creatingTopic, creatingTopic === syllabusTitle ? '' : syllabusTitle].filter(Boolean).join(' - ').slice(0, 200)}
          onClose={() => {
            setCreatingTopic(null);
            setIsMindMapModalOpen(false);
          }}
        />
      )}
    </div>
  );
}
