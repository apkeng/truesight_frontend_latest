import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { LuBell, LuX, LuCheckCheck, LuTrash2, LuArrowRight, LuSparkles } from "react-icons/lu";
import { api, keys, uidKey } from "../lib/api";
import { invalidate, setQueryData, useQuery } from "../lib/query";
import { cx, timeAgo } from "../lib/format";
import { actionFor, iconFor, linkFor, TONE } from "../lib/notifications";
import { Button, Spinner } from "../ui";
import { PuzzleDialog } from "./DailyPlay";

/**
 * In-app notification center + background roadmap generation.
 *
 * Polling, not sockets: the unread count is one Firestore count() query, so
 * we poll it every 45s while the tab is visible - every 5s while a roadmap
 * is being generated - and only fetch the list when the count goes up.
 * New notifications that arrive during the session pop up as "live" cards
 * with a link to the record they're about.
 */

const SLOW_POLL = 45_000;
const FAST_POLL = 5_000;
const LIVE_TTL = 12_000;
const RECENT_STICKY_MS = 10 * 60_000;
const STICKY_TYPES = new Set(["project_ready", "project_failed", "challenge_received"]);

const NotificationContext = createContext(null);
export const useNotifications = () => useContext(NotificationContext);

// Which caches a notification makes stale.
const invalidateFor = (n) => {
  const kind = n.ref?.kind;
  if (kind === "project" || kind === "project_failed") invalidate(keys.projects(), keys.dashboard(), keys.projectJobs(), keys.challengeTopics());
  if (kind === "challenge") invalidate(keys.challenges(), keys.dashboard(), keys.bootstrap(), `${uidKey("learn:compare:")}*`);
  if (kind === "order") invalidate(keys.orders());
  if (kind === "event") invalidate(keys.events());
  if (kind === "trash") invalidate(keys.trash());
};

export function NotificationProvider({ initialUnread, children }) {
  const navigate = useNavigate();
  const [unread, setUnread] = useState(initialUnread ?? 0);
  const [panelOpen, setPanelOpen] = useState(false);
  const [live, setLive] = useState([]); // notifications shown as pop-up cards
  const [puzzleOpen, setPuzzleOpen] = useState(false);
  const seen = useRef(null); // Set of ids already known this session (null until first list load)
  const sessionStart = useRef(Date.now());
  const jobs = useQuery(keys.projectJobs(), api.projectJobs, { staleMs: 20_000 });
  const pendingJobs = (jobs.data || []).filter((j) => j.status === "pending");

  useEffect(() => {
    if (typeof initialUnread === "number") setUnread(initialUnread);
  }, [initialUnread]);

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
    if (fresh.length) {
      fresh.forEach(invalidateFor);
      setLive((current) => [...fresh.reverse(), ...current].slice(0, 3));
    }
    return res;
  }, []);

  // First load establishes what's "already seen" (no pop-ups for old items).
  useEffect(() => {
    loadList().catch(() => {});
  }, [loadList]);

  // Poll the unread count; fetch the list only when it grows.
  const lastUnread = useRef(unread);
  useEffect(() => {
    const interval = pendingJobs.length ? FAST_POLL : SLOW_POLL;
    const tick = async () => {
      if (document.visibilityState !== "visible") return;
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
    const onVisible = () => document.visibilityState === "visible" && tick();
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearInterval(t);
      document.removeEventListener("visibilitychange", onVisible);
    };
    // jobs.refetch is stable; re-arm when the pending count changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingJobs.length, loadList]);

  useEffect(() => {
    lastUnread.current = unread;
  }, [unread]);

  const markRead = useCallback(async (n) => {
    if (n.read) return;
    setQueryData(keys.notifications(), (d) => d && { ...d, notifications: d.notifications.map((x) => (x.id === n.id ? { ...x, read: true } : x)) });
    setUnread((u) => Math.max(0, u - 1));
    api.markRead(n.id).catch(() => {});
  }, []);

  const open = useCallback(
    (n) => {
      markRead(n);
      setLive((l) => l.filter((x) => x.id !== n.id));
      setPanelOpen(false);
      const to = linkFor(n.ref);
      if (to) navigate(to);
    },
    [markRead, navigate]
  );

  /** Start background roadmap generation (Projects page + syllabus mind map). */
  const startRoadmap = useCallback(async ({ topic, levelOfLearning, source = "projects" }) => {
    try {
      const job = await api.generateProject({ topic, levelOfLearning, source });
      setQueryData(keys.projectJobs(), (d) => [job, ...(d || [])]);
      toast.info(
        <span>
          <b>Building “{topic}”.</b> You can keep working - we'll notify you here as soon as your roadmap is ready.{" "}
          <button type="button" className="font-bold text-ts-blue underline" onClick={() => setPuzzleOpen(true)}>Play Word quest while you wait</button>
        </span>,
        { autoClose: 7000, icon: <LuSparkles className="text-ts-navy" /> }
      );
      return job;
    } catch (e) {
      toast.error(e.message || "Couldn't start generating that roadmap.");
      throw e;
    }
  }, []);

  // Closing a sticky card counts as acknowledging it, so it won't pop up again.
  const dismissLive = useCallback(
    (n) => {
      setLive((l) => l.filter((x) => x.id !== n.id));
      if (STICKY_TYPES.has(n.type)) markRead(n);
    },
    [markRead]
  );

  const value = useMemo(
    () => ({ unread, openPanel: () => setPanelOpen(true), startRoadmap, pendingJobs, jobs: jobs.data || [], refreshJobs: jobs.refetch }),
    [unread, startRoadmap, pendingJobs, jobs.data, jobs.refetch]
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <NotificationPanel open={panelOpen} onClose={() => setPanelOpen(false)} onOpenItem={open} setUnread={setUnread} />
      {!panelOpen && <LiveCards items={live} onOpen={open} onDismiss={dismissLive} />}
      <PuzzleDialog open={puzzleOpen} onClose={() => setPuzzleOpen(false)} />
    </NotificationContext.Provider>
  );
}

/** Sidebar / top-bar trigger with the unread badge. */
export function NotificationBell({ variant = "row", collapsed, className }) {
  const { unread, openPanel } = useNotifications();
  if (variant === "icon") {
    return (
      <button type="button" onClick={openPanel} className={cx("relative flex h-9 w-9 items-center justify-center rounded-lg text-current hover:bg-black/5", className)} aria-label={`Notifications${unread ? ` (${unread} unread)` : ""}`}>
        <LuBell aria-hidden />
        {unread > 0 && <span className="absolute right-1 top-1 min-w-[16px] rounded-full bg-red-500 px-1 text-[9px] font-bold leading-4 text-white">{unread > 99 ? "99+" : unread}</span>}
      </button>
    );
  }
  return (
    <button
      type="button"
      onClick={openPanel}
      title={collapsed ? "Notifications" : undefined}
      className={cx("group relative flex h-10 w-full items-center gap-3 rounded-lg px-3 text-[13.5px] font-medium text-ts-body hover:bg-ts-subtle hover:text-ts-ink", collapsed && "lg:justify-center lg:px-0", className)}
    >
      <LuBell aria-hidden className="shrink-0 text-[18px] text-ts-faint group-hover:text-ts-navy" />
      <span className={cx(collapsed && "lg:sr-only")}>Notifications</span>
      {unread > 0 && (
        <span className={cx("ml-auto rounded-full bg-red-500 px-1.5 text-[10px] font-bold leading-[18px] text-white", collapsed && "lg:absolute lg:right-1 lg:top-1 lg:ml-0")}>{unread > 99 ? "99+" : unread}</span>
      )}
    </button>
  );
}

function NotificationItem({ n, onOpen, onDelete }) {
  const Icon = iconFor(n);
  const tone = TONE[n.tone] || TONE.info;
  const link = linkFor(n.ref);
  return (
    <li className={cx("group relative flex gap-3 rounded-xl px-3 py-3 transition-colors", n.read ? "hover:bg-ts-subtle" : "bg-ts-wash/50 hover:bg-ts-wash")}>
      <span className={cx("mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg", tone.icon)}><Icon aria-hidden /></span>
      <button type="button" onClick={() => onOpen(n)} className="min-w-0 flex-1 text-left" disabled={!link && n.read}>
        <span className="flex items-start gap-2">
          <span className={cx("text-[13px] leading-snug text-ts-ink", n.read ? "font-medium" : "font-bold")}>{n.title}</span>
          {!n.read && <span className={cx("mt-1.5 h-2 w-2 shrink-0 rounded-full", tone.dot)} aria-label="Unread" />}
        </span>
        {n.body && <span className="mt-0.5 block text-[12px] leading-snug text-ts-muted">{n.body}</span>}
        <span className="mt-1 flex items-center gap-2 text-[11px]">
          <span className="text-ts-faint">{timeAgo(n.createdAt)}</span>
          {link && <span className="font-semibold text-ts-blue">{actionFor(n)} →</span>}
        </span>
      </button>
      <button type="button" onClick={() => onDelete(n)} className="absolute right-2 top-2 hidden h-6 w-6 items-center justify-center rounded-md text-ts-faint hover:bg-white hover:text-red-500 group-hover:flex" aria-label="Delete notification">
        <LuTrash2 aria-hidden className="text-xs" />
      </button>
    </li>
  );
}

function NotificationPanel({ open, onClose, onOpenItem, setUnread }) {
  const { data, isLoading, refetch } = useQuery(open ? keys.notifications() : null, () => api.notifications(), { staleMs: 10_000 });
  const [more, setMore] = useState([]);
  const [loadingMore, setLoadingMore] = useState(false);
  const items = [...(data?.notifications || []), ...more];

  useEffect(() => {
    if (!open) return undefined;
    setMore([]);
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const markAll = async () => {
    setQueryData(keys.notifications(), (d) => d && { ...d, unread: 0, notifications: d.notifications.map((n) => ({ ...n, read: true })) });
    setMore((m) => m.map((n) => ({ ...n, read: true })));
    setUnread(0);
    try {
      await api.markAllRead();
    } catch (e) {
      toast.error(e.message);
      refetch();
    }
  };

  const remove = async (n) => {
    setQueryData(keys.notifications(), (d) => d && { ...d, notifications: d.notifications.filter((x) => x.id !== n.id) });
    setMore((m) => m.filter((x) => x.id !== n.id));
    if (!n.read) setUnread((u) => Math.max(0, u - 1));
    api.deleteNotification(n.id).catch(() => refetch());
  };

  const loadMore = async () => {
    setLoadingMore(true);
    try {
      const res = await api.notifications(items[items.length - 1]?.createdAt);
      setMore((m) => [...m, ...res.notifications]);
      if (!res.hasMore) setQueryData(keys.notifications(), (d) => d && { ...d, hasMore: false });
    } finally {
      setLoadingMore(false);
    }
  };

  if (!open) return null;
  const today = new Date().toDateString();
  const groups = [
    { label: "Today", items: items.filter((n) => new Date(n.createdAt).toDateString() === today) },
    { label: "Earlier", items: items.filter((n) => new Date(n.createdAt).toDateString() !== today) },
  ].filter((g) => g.items.length);
  const hasMore = more.length ? items.length % 30 === 0 : data?.hasMore;
  const unreadHere = items.some((n) => !n.read);

  return createPortal(
    <div className="ts-app fixed inset-0 z-[70]">
      <div className="absolute inset-0 bg-slate-900/30" onClick={onClose} aria-hidden />
      <aside role="dialog" aria-label="Notifications" className="absolute inset-y-0 right-0 flex w-full max-w-[400px] flex-col bg-white shadow-pop animate-ts-fade">
        <header className="flex items-center gap-2 border-b border-ts-border px-5 py-4">
          <LuBell aria-hidden className="text-ts-navy" />
          <h2 className="text-[16px] font-bold text-ts-ink">Notifications</h2>
          <div className="ml-auto flex items-center gap-1">
            {unreadHere && <Button variant="ghost" size="xs" icon={LuCheckCheck} onClick={markAll}>Mark all read</Button>}
            <button type="button" onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg text-ts-muted hover:bg-slate-100" aria-label="Close notifications"><LuX aria-hidden /></button>
          </div>
        </header>
        <div className="ts-scroll min-h-0 flex-1 overflow-y-auto px-2 py-2">
          {isLoading ? (
            <div className="flex justify-center py-12"><Spinner className="text-2xl" /></div>
          ) : !items.length ? (
            <div className="px-6 py-16 text-center">
              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-ts-wash text-xl text-ts-navy"><LuBell aria-hidden /></span>
              <p className="mt-3 text-sm font-bold text-ts-ink">You're all caught up</p>
              <p className="mt-1 text-xs text-ts-muted">Roadmaps, challenges, orders and event reminders will show up here.</p>
            </div>
          ) : (
            groups.map((g) => (
              <section key={g.label} className="mb-2">
                <p className="px-3 pb-1 pt-2 text-[10.5px] font-bold uppercase tracking-[0.12em] text-ts-faint">{g.label}</p>
                <ul className="space-y-0.5">
                  {g.items.map((n) => <NotificationItem key={n.id} n={n} onOpen={onOpenItem} onDelete={remove} />)}
                </ul>
              </section>
            ))
          )}
          {hasMore && (
            <div className="py-3 text-center">
              <Button variant="secondary" size="xs" loading={loadingMore} onClick={loadMore}>Load older</Button>
            </div>
          )}
        </div>
      </aside>
    </div>,
    document.body
  );
}

/** "Active" pop-up cards for notifications that arrive during the session. */
function LiveCards({ items, onOpen, onDismiss }) {
  return createPortal(
    <div className="ts-app pointer-events-none fixed bottom-4 right-4 z-[90] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-3" aria-live="polite">
      {items.map((n) => <LiveCard key={n.id} n={n} onOpen={onOpen} onDismiss={onDismiss} />)}
    </div>,
    document.body
  );
}

function LiveCard({ n, onOpen, onDismiss }) {
  const Icon = iconFor(n);
  const tone = TONE[n.tone] || TONE.info;
  const link = linkFor(n.ref);
  useEffect(() => {
    if (STICKY_TYPES.has(n.type)) return undefined;
    const t = setTimeout(() => onDismiss(n), LIVE_TTL);
    return () => clearTimeout(t);
  }, [n, onDismiss]);
  return (
    <div role="status" className="pointer-events-auto relative overflow-hidden rounded-xl border border-ts-border bg-white shadow-pop animate-ts-fade">
      <span className={cx("absolute inset-y-0 left-0 w-1", tone.bar)} aria-hidden />
      <div className="flex gap-3 py-3.5 pl-4 pr-3">
        <span className={cx("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg", tone.icon)}><Icon aria-hidden /></span>
        <div className="min-w-0 flex-1">
          <p className="text-[13.5px] font-bold leading-snug text-ts-ink">{n.title}</p>
          {n.body && <p className="mt-0.5 text-[12px] leading-snug text-ts-muted">{n.body}</p>}
          {link && (
            <Button size="xs" className="mt-2.5" iconRight={LuArrowRight} variant={n.tone === "error" ? "secondary" : "primary"} onClick={() => onOpen(n)}>
              {actionFor(n)}
            </Button>
          )}
        </div>
        <button type="button" onClick={() => onDismiss(n)} className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-ts-faint hover:bg-slate-100 hover:text-ts-ink" aria-label="Dismiss">
          <LuX aria-hidden />
        </button>
      </div>
    </div>
  );
}

