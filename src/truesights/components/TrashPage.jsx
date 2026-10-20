import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import Icon from '../design-system/icons';
import { api, invalidate, keys, setQueryData, useQuery } from '../data';
import { useTS } from '../session';
import { uidKey } from '../../revamp/lib/api';
import { deleteTextbook } from '../../utils/textbookServiceClient';
import ModalPortal from './ModalPortal';

// ============================================================================
// INITIAL TRASH DATASET
// Realistic student items: Projects, Textbook Notes, and Quiz Attempts
// ============================================================================
// API item types -> the three tabs of this screen.
const TAB_TYPE = { project: 'project', textbook: 'textbook', chat: 'textbook', result: 'quiz' };

/** A /api/v2/trash item in the shape the trash rows render. */
const toRow = (i) => ({
  id: `${i.type}:${i.id}`,
  apiType: i.type,
  apiId: i.id,
  title: i.title,
  type: TAB_TYPE[i.type] || 'project',
  category: i.domain || (i.type === 'result' ? 'Quiz' : i.type === 'chat' ? 'Saved conversation' : i.type === 'textbook' ? 'Uploaded source' : 'Roadmap'),
  originalPath: (i.source || '').replace(/ › /g, ' > '),
  deletedDate: i.trashedAt ? new Date(i.trashedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '',
  daysRemaining: i.daysLeft,
  meta: i.meta || ''
});

const asApi = (rows) => rows.map((r) => ({ type: r.apiType, id: r.apiId }));

/** Delete textbooks from the textbook service (only the owner's token can). */
const purgeBooks = (bookIds) =>
  Promise.allSettled(bookIds.map((bookId) => deleteTextbook(bookId))).then((r) => r.filter((x) => x.status === 'rejected').length);

export default function TrashPage() {
  const { go } = useTS();
  const [params] = useSearchParams();
  const { data, error, isLoading, refetch } = useQuery(keys.trash(), api.trash, { staleMs: 15_000 });
  const items = useMemo(() => (data?.items || []).map(toRow), [data]);
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'project' | 'textbook' | 'quiz'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [busy, setBusy] = useState(false);
  const expiredHandled = useRef(false);
  const highlight = params.get('highlight'); // "<type>:<id>" from a trash-expiring notification

  // Modal Dialogs
  const [confirmEmptyOpen, setConfirmEmptyOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null); // a row, or { title, rows } for a batch
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

  // Finish the 30-day purge for textbooks (the backend can't delete those itself).
  useEffect(() => {
    if (!data?.expiredTextbooks?.length || expiredHandled.current) return;
    expiredHandled.current = true;
    const ids = data.expiredTextbooks.map((b) => b.bookId);
    purgeBooks(ids).then(() => api.purge(ids.map((bookId) => ({ type: 'textbook', id: bookId })))).catch(() => {});
  }, [data]);

  useEffect(() => {
    if (highlight && items.some((i) => i.id === highlight)) setSelectedIds(new Set([highlight]));
  }, [highlight, items]);

  const showToast = (msg) => toast.success(msg);

  // Filtered Items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Category tab
      if (activeTab !== 'all' && item.type !== activeTab) return false;

      // Live search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const inTitle = item.title.toLowerCase().includes(q);
        const inCat = item.category.toLowerCase().includes(q);
        const inPath = item.originalPath.toLowerCase().includes(q);
        if (!inTitle && !inCat && !inPath) return false;
      }

      return true;
    });
  }, [items, activeTab, searchQuery]);

  // Counts by category
  const projectCount = useMemo(() => items.filter((i) => i.type === 'project').length, [items]);
  const textbookCount = useMemo(() => items.filter((i) => i.type === 'textbook').length, [items]);
  const quizCount = useMemo(() => items.filter((i) => i.type === 'quiz').length, [items]);

  // Checkbox handling
  const handleToggleSelect = (id) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const handleSelectAll = () => {
    if (selectedIds.size === filteredItems.length && filteredItems.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredItems.map((i) => i.id)));
    }
  };

  const drop = (rows) => {
    const gone = new Set(rows.map((r) => `${r.apiType}:${r.apiId}`));
    setQueryData(keys.trash(), (d) => d && { ...d, items: d.items.filter((i) => !gone.has(`${i.type}:${i.id}`)) });
    setSelectedIds((sel) => new Set([...sel].filter((k) => !gone.has(k))));
  };

  const restore = async (rows) => {
    if (!rows.length) return;
    setBusy(true);
    try {
      await api.restore(asApi(rows));
      drop(rows);
      invalidate(keys.projects(), keys.results(), keys.dashboard(), `${uidKey('chats:')}*`, uidKey('assistant:trashed-books'));
      showToast(rows.length === 1 ? `Restored "${rows[0].title}" to ${rows[0].originalPath}.` : `Restored ${rows.length} items to your workspace.`);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  };

  const destroy = async (rows) => {
    if (!rows.length) return;
    setBusy(true);
    try {
      const res = await api.purge(asApi(rows));
      const failed = await purgeBooks(res.textbooksToDelete || []);
      drop(rows);
      showToast(`Permanently deleted ${rows.length === 1 ? `"${rows[0].title}"` : `${rows.length} items`}.${failed ? " Some textbooks couldn't be removed from the library - try again later." : ''}`);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  };

  // Restore Single Item
  const handleRestore = (item) => restore([item]);

  // Restore Batch
  const handleRestoreSelected = () => restore(items.filter((i) => selectedIds.has(i.id)));

  // Permanent Delete (single row or a confirmed batch)
  const handleConfirmPermanentDelete = () => {
    if (!itemToDelete) return;
    const rows = itemToDelete.rows || [itemToDelete];
    setItemToDelete(null);
    destroy(rows);
  };

  // Delete Batch: confirm first, it can't be undone
  const handleDeleteSelected = () => {
    const rows = items.filter((i) => selectedIds.has(i.id));
    if (rows.length) setItemToDelete({ title: `${rows.length} selected item${rows.length > 1 ? 's' : ''}`, rows });
  };

  // Empty Entire Trash
  const handleConfirmEmptyTrash = async () => {
    setConfirmEmptyOpen(false);
    setBusy(true);
    try {
      const res = await api.emptyTrash();
      await purgeBooks(res.textbooksToDelete || []);
      setQueryData(keys.trash(), (d) => d && { ...d, items: [] });
      setSelectedIds(new Set());
      showToast('Trash emptied.');
    } catch (e) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  };

  const onBackToDashboard = () => go('dashboard');

  // Get icon and badge styling per item type
  const getTypeBadge = (type) => {
    switch (type) {
      case 'project':
        return {
          label: 'Project Roadmap',
          bg: '#EFF6FF',
          color: '#1D4ED8',
          border: '#BFDBFE'
        };
      case 'textbook':
        return {
          label: 'Textbook / Notes',
          bg: '#FDF4FF',
          color: '#9333EA',
          border: '#F0ABFC'
        };
      case 'quiz':
        return {
          label: 'Quiz Diagnostic',
          bg: '#FFFBEB',
          color: '#B45309',
          border: '#FDE68A'
        };
      default:
        return {
          label: 'Item',
          bg: '#F1F5F9',
          color: '#475569',
          border: '#CBD5E1'
        };
    }
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
          1. HERO BANNER (TrueSights Deep Navy Gradient)
          ====================================================================== */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0B3A6F 0%, #0A2F59 60%, #072242 100%)',
          borderRadius: isMobile ? '14px' : '16px',
          padding: isMobile ? '16px 14px' : '28px 36px',
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          alignItems: isMobile ? 'stretch' : 'center',
          justifyContent: 'space-between',
          gap: isMobile ? '14px' : '20px',
          flexShrink: 0,
          boxSizing: 'border-box',
          boxShadow: '0 4px 20px rgba(11, 58, 111, 0.16)',
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxWidth: '780px', zIndex: 1 }}>

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
            Trash & Archived Items
          </h1>
          <p
            style={{
              fontSize: isMobile ? '12.5px' : '13.5px',
              color: 'rgba(255, 255, 255, 0.9)',
              margin: 0,
              lineHeight: isMobile ? '18px' : '20px'
            }}
          >
            Items moved to trash will be permanently purged after 30 days. You can restore them to your workspace anytime or empty the trash now.
          </p>
        </div>

        {/* Right CTA Actions */}
        {items.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', zIndex: 1, flexShrink: 0 }}>
            <button
              type="button"
              onClick={() => setConfirmEmptyOpen(true)}
              disabled={busy || !items.length}
              style={{
                background: 'rgba(239, 68, 68, 0.18)',
                border: '1px solid rgba(239, 68, 68, 0.45)',
                borderRadius: '10px',
                padding: '11px 18px',
                width: isMobile ? '100%' : 'auto',
                justifyContent: 'center',
                color: '#FECACA',
                fontSize: '12.5px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                backdropFilter: 'blur(6px)',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.32)';
                e.currentTarget.style.color = '#FFFFFF';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.18)';
                e.currentTarget.style.color = '#FECACA';
              }}
            >
              <Icon name="trash" size={14} color="currentColor" />
              <span>Empty Trash</span>
            </button>
          </div>
        )}
      </div>

      {/* ======================================================================
          2. SIMPLE & CLEAN CONTROLS: CATEGORIES + PROMINENT SEARCH
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
        {/* Categories: All Items, Projects, Textbooks, Quizzes */}
        <div
          style={{
            background: '#F1F5F9',
            borderRadius: '10px',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            overflowX: isMobile ? 'auto' : 'visible',
            maxWidth: '100%',
            whiteSpace: 'nowrap',
            WebkitOverflowScrolling: 'touch'
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
            <span>All Items</span>
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
              {items.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('project')}
            style={{
              background: activeTab === 'project' ? '#0B3A6F' : 'transparent',
              color: activeTab === 'project' ? '#FFFFFF' : '#475569',
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
            <span>Projects</span>
            <span
              style={{
                background: activeTab === 'project' ? '#FEE047' : '#E2E8F0',
                color: activeTab === 'project' ? '#0B1A2B' : '#475569',
                fontSize: '11px',
                fontWeight: 800,
                padding: '1px 7px',
                borderRadius: '10px'
              }}
            >
              {projectCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('textbook')}
            style={{
              background: activeTab === 'textbook' ? '#0B3A6F' : 'transparent',
              color: activeTab === 'textbook' ? '#FFFFFF' : '#475569',
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
            <span>Textbooks & Notes</span>
            <span
              style={{
                background: activeTab === 'textbook' ? '#FEE047' : '#E2E8F0',
                color: activeTab === 'textbook' ? '#0B1A2B' : '#475569',
                fontSize: '11px',
                fontWeight: 800,
                padding: '1px 7px',
                borderRadius: '10px'
              }}
            >
              {textbookCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('quiz')}
            style={{
              background: activeTab === 'quiz' ? '#0B3A6F' : 'transparent',
              color: activeTab === 'quiz' ? '#FFFFFF' : '#475569',
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
            <span>Quizzes</span>
            <span
              style={{
                background: activeTab === 'quiz' ? '#FEE047' : '#E2E8F0',
                color: activeTab === 'quiz' ? '#0B1A2B' : '#475569',
                fontSize: '11px',
                fontWeight: 800,
                padding: '1px 7px',
                borderRadius: '10px'
              }}
            >
              {quizCount}
            </span>
          </button>
        </div>

        {/* Prominent High-Visibility Search Bar */}
        <div
          style={{
            position: 'relative',
            flex: isMobile ? '1 1 100%' : '1 1 320px',
            width: isMobile ? '100%' : 'auto',
            maxWidth: isMobile ? '100%' : '520px',
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
            placeholder="Search trashed items by title, domain, or notes..."
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

      {/* ======================================================================
          3. BATCH SELECTION ACTION BAR (Appears when items exist)
          ====================================================================== */}
      {filteredItems.length > 0 && (
        <div
          style={{
            background: selectedIds.size > 0 ? '#EFF6FF' : '#FAF9F6',
            border: `1px solid ${selectedIds.size > 0 ? '#BFDBFE' : '#E6E2D8'}`,
            borderRadius: '12px',
            padding: '10px 18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            flexShrink: 0,
            transition: 'all 0.18s ease'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <input
              type="checkbox"
              id="select-all-trash"
              checked={selectedIds.size === filteredItems.length && filteredItems.length > 0}
              onChange={handleSelectAll}
              style={{
                width: '16px',
                height: '16px',
                cursor: 'pointer',
                accentColor: '#0B3A6F'
              }}
            />
            <label
              htmlFor="select-all-trash"
              style={{
                fontSize: '12.5px',
                fontWeight: 600,
                color: '#0B1A2B',
                cursor: 'pointer'
              }}
            >
              {selectedIds.size === 0
                ? `Select all (${filteredItems.length} items)`
                : `${selectedIds.size} of ${filteredItems.length} selected`}
            </label>
          </div>

          {selectedIds.size > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                type="button"
                onClick={handleRestoreSelected}
                disabled={busy}
                style={{
                  background: '#0B3A6F',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '7px',
                  padding: '6px 14px',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span>Restore Selected ({selectedIds.size})</span>
              </button>

              <button
                type="button"
                onClick={handleDeleteSelected}
                disabled={busy}
                style={{
                  background: '#FEF2F2',
                  color: '#DC2626',
                  border: '1px solid #FECACA',
                  borderRadius: '7px',
                  padding: '6px 14px',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span>Delete Permanently ({selectedIds.size})</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* ======================================================================
          4. TRASH ITEMS LIST (Clean TrueSights Design System Cards)
          ====================================================================== */}
      {error && !data && (
        <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '14px', padding: '14px 18px', color: '#DC2626', fontSize: '13px', fontWeight: 600, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
          <span>Couldn't load your trash: {error.message}</span>
          <button type="button" onClick={() => refetch()} style={{ background: '#FFFFFF', border: '1px solid #FECACA', borderRadius: '8px', padding: '6px 12px', color: '#DC2626', fontWeight: 700, cursor: 'pointer' }}>Retry</button>
        </div>
      )}
      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {[0, 1, 2].map((i) => <div key={i} className="skeleton-shimmer" style={{ height: '96px', borderRadius: '14px' }} />)}
        </div>
      ) : filteredItems.length === 0 ? (
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: '16px',
            border: '1px dashed #CBD5E1',
            padding: '64px 24px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '14px',
            margin: '12px 0'
          }}
        >
          <div
            style={{
              width: '54px',
              height: '54px',
              borderRadius: '50%',
              background: '#F1F5F9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#64748B'
            }}
          >
            <Icon name="trash" size={26} color="#64748B" />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0B1A2B', fontFamily: 'var(--font-heading, "Space Grotesk")' }}>
              {items.length === 0 ? 'Your Trash is Clean & Empty' : 'No items match your filter'}
            </h3>
            <p style={{ margin: '6px 0 0 0', fontSize: '13px', color: '#64748B', maxWidth: '440px' }}>
              {items.length === 0
                ? 'There are no deleted roadmaps, textbook notes, or quiz attempts in the archive. Everything is organized in your workspace.'
                : 'Try clearing your search query or switching tabs to locate other archived files.'}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
            {items.length === 0 ? (
              <button
                type="button"
                onClick={onBackToDashboard}
                style={{
                  background: '#0B3A6F',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '9px 20px',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Return to Dashboard
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setActiveTab('all');
                  setSearchQuery('');
                }}
                style={{
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
            )}
          </div>
        </div>
      ) : (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            paddingBottom: '32px'
          }}
        >
          {filteredItems.map((item) => {
            const isSelected = selectedIds.has(item.id);
            const badge = getTypeBadge(item.type);
            const isUrgent = item.daysRemaining <= 3;

            return (
              <div
                key={item.id}
                style={{
                  background: '#FFFFFF',
                  border: isSelected ? '1.5px solid #0B3A6F' : '1px solid #E2DDD3',
                  borderRadius: '14px',
                  padding: '16px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '18px',
                  boxShadow: '0 1px 4px rgba(11, 26, 43, 0.03)',
                  transition: 'all 0.18s ease',
                  flexWrap: 'wrap'
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.borderColor = '#CBD5E1';
                    e.currentTarget.style.boxShadow = '0 4px 14px rgba(11, 26, 43, 0.06)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.borderColor = '#E2DDD3';
                    e.currentTarget.style.boxShadow = '0 1px 4px rgba(11, 26, 43, 0.03)';
                  }
                }}
              >
                {/* Left: Checkbox + Type Icon + Info */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: '1 1 420px', minWidth: '280px' }}>
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleToggleSelect(item.id)}
                    style={{
                      width: '16px',
                      height: '16px',
                      cursor: 'pointer',
                      accentColor: '#0B3A6F',
                      flexShrink: 0
                    }}
                  />

                  {/* Icon Box */}
                  <div
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '10px',
                      background: badge.bg,
                      border: `1px solid ${badge.border}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: badge.color,
                      flexShrink: 0
                    }}
                  >
                    <Icon name="trash" size={18} color={badge.color} />
                  </div>

                  {/* Title & Metadata */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          color: badge.color,
                          background: badge.bg,
                          padding: '1px 8px',
                          borderRadius: '6px'
                        }}
                      >
                        {badge.label}
                      </span>

                      <span style={{ fontSize: '11.5px', color: '#64748B', fontWeight: 600 }}>
                        {item.category}
                      </span>
                    </div>

                    <h4
                      style={{
                        margin: 0,
                        fontSize: '14.5px',
                        fontWeight: 700,
                        color: '#0B1A2B',
                        fontFamily: 'var(--font-heading, "Space Grotesk")'
                      }}
                    >
                      {item.title}
                    </h4>

                    <div style={{ fontSize: '12px', color: '#64748B', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span>From: {item.originalPath}</span>
                      <span>•</span>
                      <span>{item.meta}</span>
                    </div>
                  </div>
                </div>

                {/* Right: Deletion Countdown & Action Buttons */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexShrink: 0 }}>
                  {/* Countdown Badge */}
                  <div
                    style={{
                      background: isUrgent ? '#FEF2F2' : '#F8FAFC',
                      border: `1px solid ${isUrgent ? '#FCA5A5' : '#E2E8F0'}`,
                      color: isUrgent ? '#DC2626' : '#64748B',
                      borderRadius: '8px',
                      padding: '4px 10px',
                      fontSize: '11.5px',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}
                    title={`Will be permanently removed in ${item.daysRemaining} days`}
                  >
                    <span
                      style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        background: isUrgent ? '#DC2626' : '#94A3B8'
                      }}
                    />
                    <span>{item.daysRemaining} days left</span>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={() => handleRestore(item)}
                      style={{
                        background: '#EFF6FF',
                        border: '1px solid #BFDBFE',
                        borderRadius: '8px',
                        padding: '7px 14px',
                        color: '#1D4ED8',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        transition: 'all 0.15s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#0B3A6F';
                        e.currentTarget.style.color = '#FFFFFF';
                        e.currentTarget.style.borderColor = '#0B3A6F';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#EFF6FF';
                        e.currentTarget.style.color = '#1D4ED8';
                        e.currentTarget.style.borderColor = '#BFDBFE';
                      }}
                    >
                      <Icon name="refresh" size={13} color="currentColor" />
                      <span>Restore</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setItemToDelete(item)}
                      title="Delete permanently"
                      style={{
                        background: '#FFFFFF',
                        border: '1px solid #CBD5E1',
                        borderRadius: '8px',
                        padding: '7px 10px',
                        color: '#DC2626',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.15s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#FEE2E2';
                        e.currentTarget.style.borderColor = '#FCA5A5';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#FFFFFF';
                        e.currentTarget.style.borderColor = '#CBD5E1';
                      }}
                    >
                      <Icon name="trash" size={14} color="#DC2626" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {confirmEmptyOpen && (
        <ModalPortal isOpen={true} onClose={() => setConfirmEmptyOpen(false)}>
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
              width: '100%',
              maxWidth: '480px',
              background: '#FFFFFF',
              borderRadius: '16px',
              boxShadow: '0 24px 60px rgba(0, 0, 0, 0.25)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden'
            }}
          >
            <div
              style={{
                padding: '20px 24px',
                background: '#EF4444',
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
                    background: 'rgba(255, 255, 255, 0.2)',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    display: 'inline-block',
                    marginBottom: '6px'
                  }}
                >
                  PERMANENT DELETION
                </span>
                <h2
                  style={{
                    fontFamily: 'var(--font-heading, "Space Grotesk", sans-serif)',
                    fontSize: '20px',
                    fontWeight: 800,
                    margin: 0
                  }}
                >
                  Empty Entire Trash?
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setConfirmEmptyOpen(false)}
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

            <div style={{ padding: '24px' }}>
              <p style={{ margin: 0, fontSize: '13.5px', color: '#475569', lineHeight: '22px' }}>
                Are you sure you want to permanently delete all <strong>{items.length} items</strong>?
                This will purge all selected projects, uploaded textbook summaries, and quiz records from TrueSights servers. <strong>This action cannot be undone.</strong>
              </p>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px', marginTop: '24px' }}>
                <button
                  type="button"
                  onClick={() => setConfirmEmptyOpen(false)}
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid #CBD5E1',
                    borderRadius: '8px',
                    padding: '9px 18px',
                    fontSize: '12.5px',
                    fontWeight: 700,
                    color: '#64748B',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmEmptyTrash}
                  style={{
                    background: '#DC2626',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '9px 22px',
                    fontSize: '12.5px',
                    fontWeight: 800,
                    color: '#FFFFFF',
                    cursor: 'pointer'
                  }}
                >
                  Yes, Empty Trash
                </button>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}

      {/* ======================================================================
          6. CONFIRM PERMANENT DELETE SINGLE ITEM MODAL
          ====================================================================== */}
      {itemToDelete && (
        <ModalPortal isOpen={true} onClose={() => setItemToDelete(null)}>
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            width: '100%',
            maxWidth: '460px',
            background: '#FFFFFF',
            borderRadius: '16px',
            boxShadow: '0 24px 60px rgba(0, 0, 0, 0.25)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}
        >
            <div
              style={{
                padding: '20px 24px',
                background: '#0B1A2B',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: '16px'
              }}
            >
              <div>
                <h3
                  style={{
                    fontFamily: 'var(--font-heading, "Space Grotesk", sans-serif)',
                    fontSize: '18px',
                    fontWeight: 800,
                    margin: 0
                  }}
                >
                  Delete Permanently?
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setItemToDelete(null)}
                style={{
                  background: 'rgba(255, 255, 255, 0.15)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '28px',
                  height: '28px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ padding: '24px' }}>
              <p style={{ margin: 0, fontSize: '13.5px', color: '#475569', lineHeight: '22px' }}>
                Are you sure you want to permanently delete <strong>"{itemToDelete.title}"</strong>?
                You will not be able to restore this item or its subtopics later.
              </p>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button
                  type="button"
                  onClick={() => setItemToDelete(null)}
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid #CBD5E1',
                    borderRadius: '8px',
                    padding: '8px 16px',
                    fontSize: '12px',
                    fontWeight: 700,
                    color: '#64748B',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmPermanentDelete}
                  style={{
                    background: '#DC2626',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '8px 18px',
                    fontSize: '12px',
                    fontWeight: 800,
                    color: '#FFFFFF',
                    cursor: 'pointer'
                  }}
                >
                  Delete Permanently
                </button>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}

    </div>
  );
}
