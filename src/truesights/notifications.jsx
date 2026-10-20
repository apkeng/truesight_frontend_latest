import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { api, keys, uidKey } from '../revamp/lib/api';
import { invalidate, setQueryData, useQuery } from '../revamp/lib/query';
import { actionFor, linkFor } from '../revamp/lib/notifications';

/**
 * In-app notifications and background roadmap generation for the TrueSights
 * app - the same polling scheme as the previous student app: the unread
 * count is polled every 45 s while the tab is visible (every 5 s while a
 * roadmap is generating) and the list is fetched only when the count grows.
 * Notifications that arrive during the session pop up as toasts.
 */

const SLOW_POLL = 45_000;
const FAST_POLL = 5_000;
const RECENT_STICKY_MS = 10 * 60_000;
const STICKY_TYPES = new Set(['project_ready', 'project_failed', 'challenge_received']);

const NotificationContext = createContext(null);
export const useNotifications = () => useContext(NotificationContext);

// Which caches a notification makes stale.
const invalidateFor = (n) => {
  const kind = n.ref?.kind;
  if (kind === 'project' || kind === 'project_failed') invalidate(keys.projects(), keys.dashboard(), keys.projectJobs(), keys.challengeTopics());
  if (kind === 'challenge') invalidate(keys.challenges(), keys.dashboard(), keys.bootstrap(), `${uidKey('learn:compare:')}*`);
  if (kind === 'order') invalidate(keys.orders());
  if (kind === 'event') invalidate(keys.events());
  if (kind === 'trash') invalidate(keys.trash());
};

export function NotificationProvider({ initialUnread, children }) {
  const navigate = useNavigate();
  const [unread, setUnread] = useState(initialUnread ?? 0);
  const seen = useRef(null); // ids already known this session (null until the first list load)
  const sessionStart = useRef(Date.now());
  const jobs = useQuery(keys.projectJobs(), api.projectJobs, { staleMs: 20_000 });
  const list = useQuery(keys.notifications(), api.notifications, { staleMs: 20_000 });
  const pendingJobs = (jobs.data || []).filter((j) => j.status === 'pending');

  useEffect(() => {
    if (typeof initialUnread === 'number') setUnread(initialUnread);
  }, [initialUnread]);

  /** Mark one notification read (or unread again with read=false). */
  const markRead = useCallback(async (n, read = true) => {
    if (Boolean(n.read) === read) return;
    setQueryData(keys.notifications(), (d) => d && { ...d, notifications: d.notifications.map((x) => (x.id === n.id ? { ...x, read } : x)) });
    setUnread((u) => Math.max(0, u + (read ? -1 : 1)));
    api.markRead(n.id, read).catch(() => {});
  }, []);

  /** Go to the record a notification is about. */
  const open = useCallback(
    (n) => {
      markRead(n);
      const to = linkFor(n.ref);
      if (to) navigate(to);
    },
    [markRead, navigate]
  );

  const popUp = useCallback(
    (n) => {
      const to = linkFor(n.ref);
      const tone = n.tone === 'error' ? toast.error : n.tone === 'success' ? toast.success : n.tone === 'warning' ? toast.warning : toast.info;
      tone(
        <div>
          <div style={{ fontWeight: 800, fontSize: '13px', color: '#0B1A2B' }}>{n.title}</div>
          {n.body && <div style={{ fontSize: '12px', color: '#475569', marginTop: '2px' }}>{n.body}</div>}
          {to && (
            <button
              type="button"
              onClick={() => open(n)}
              style={{ marginTop: '6px', background: 'none', border: 'none', padding: 0, color: '#2563EB', fontWeight: 700, fontSize: '12px', cursor: 'pointer' }}
            >
              {actionFor(n)} →
            </button>
          )}
        </div>,
        { autoClose: STICKY_TYPES.has(n.type) ? false : 8000, onClose: () => STICKY_TYPES.has(n.type) && markRead(n) }
      );
    },
    [open, markRead]
  );

  const loadList = useCallback(async () => {
    const res = await api.notifications();
    setQueryData(keys.notifications(), res);
    setUnread(res.unread);
    const fresh = [];
    if (seen.current) {
      res.notifications.forEach((n) => {
        if (!seen.current.has(n.id) && !n.read && new Date(n.createdAt).getTime() >= sessionStart.current - 60_000) fresh.push(n);
      });
    } else {
      // First load: still surface unread "sticky" results from the last few
      // minutes (e.g. a roadmap that finished while the page was reloading).
      res.notifications.forEach((n) => {
        if (!n.read && STICKY_TYPES.has(n.type) && Date.now() - new Date(n.createdAt).getTime() < RECENT_STICKY_MS) fresh.push(n);
      });
    }
    seen.current = new Set([...(seen.current || []), ...res.notifications.map((n) => n.id)]);
    fresh.forEach(invalidateFor);
    fresh.slice(0, 3).forEach(popUp);
    return res;
  }, [popUp]);

  // First load establishes what's "already seen" (no pop-ups for old items).
  useEffect(() => {
    loadList().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Poll the unread count; fetch the list only when it grows.
  const lastUnread = useRef(unread);
  useEffect(() => {
    const interval = pendingJobs.length ? FAST_POLL : SLOW_POLL;
    const tick = async () => {
      // Hidden tabs are skipped unless a roadmap is generating, so its
      // notification is waiting the moment the student comes back.
      if (document.visibilityState !== 'visible' && !pendingJobs.length) return;
      try {
        const count = await api.unreadCount();
        if (count > lastUnread.current) await loadList();
        else setUnread(count);
        lastUnread.current = count;
        if (pendingJobs.length) jobs.refetch().catch(() => {});
      } catch {
        // offline / token expiry is handled elsewhere
      }
    };
    const t = setInterval(tick, interval);
    const onVisible = () => document.visibilityState === 'visible' && tick();
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      clearInterval(t);
      document.removeEventListener('visibilitychange', onVisible);
    };
    // jobs.refetch is stable; re-arm when the pending count changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingJobs.length, loadList]);

  useEffect(() => {
    lastUnread.current = unread;
  }, [unread]);

  const markAllRead = useCallback(async () => {
    setQueryData(keys.notifications(), (d) => d && { ...d, notifications: d.notifications.map((x) => ({ ...x, read: true })), unread: 0 });
    setUnread(0);
    try {
      await api.markAllRead();
    } catch (e) {
      toast.error(e.message);
      list.refetch();
    }
  }, [list]);

  const remove = useCallback(
    async (n) => {
      setQueryData(keys.notifications(), (d) => d && { ...d, notifications: d.notifications.filter((x) => x.id !== n.id) });
      if (!n.read) setUnread((u) => Math.max(0, u - 1));
      try {
        await api.deleteNotification(n.id);
      } catch (e) {
        toast.error(e.message);
        list.refetch();
      }
    },
    [list]
  );

  /** Start background roadmap generation (Projects screen + syllabus mind map). */
  const startRoadmap = useCallback(async ({ topic, levelOfLearning, source = 'projects' }) => {
    try {
      const job = await api.generateProject({ topic, levelOfLearning, source });
      setQueryData(keys.projectJobs(), (d) => [job, ...(d || [])]);
      toast.info(`Building “${topic}”. Keep working - we'll notify you as soon as your roadmap is ready.`, { autoClose: 7000 });
      return job;
    } catch (e) {
      toast.error(e.message || "Couldn't start generating that roadmap.");
      throw e;
    }
  }, []);

  const value = useMemo(
    () => ({
      unread,
      notifications: list.data?.notifications || [],
      loading: list.isLoading,
      open,
      markRead,
      markAllRead,
      remove,
      refresh: loadList,
      startRoadmap,
      pendingJobs,
      jobs: jobs.data || [],
      refreshJobs: jobs.refetch
    }),
    [unread, list.data, list.isLoading, open, markRead, markAllRead, remove, loadList, startRoadmap, pendingJobs, jobs.data, jobs.refetch]
  );

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}
