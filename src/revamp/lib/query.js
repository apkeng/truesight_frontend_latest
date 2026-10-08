import { useCallback, useEffect, useRef, useSyncExternalStore } from "react";

/**
 * A small stale-while-revalidate cache - the main latency tool of the
 * revamped app.
 *
 * - Every screen reads through `useQuery(key, fetcher)`. Cached data renders
 *   immediately (even across reloads: entries are mirrored to sessionStorage)
 *   and is revalidated in the background once it is older than `staleMs`.
 * - Concurrent requests for the same key share one in-flight promise.
 * - `prefetch(key, fetcher)` warms a key before navigation (sidebar hover).
 * - `setQueryData` / `invalidate` support optimistic updates after mutations.
 */

const STORAGE_KEY = "ts-query-cache-v1";
const PERSIST_MAX_BYTES = 1_500_000;
const DEFAULT_STALE_MS = 30_000;

const entries = new Map(); // key -> { data, error, updatedAt, promise }
const listeners = new Map(); // key -> Set<fn>

const hydrate = () => {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const saved = JSON.parse(raw);
    Object.entries(saved).forEach(([key, value]) => {
      // Persisted entries are always treated as stale so they revalidate.
      entries.set(key, { data: value.data, error: null, updatedAt: 0, promise: null });
    });
  } catch {
    // Storage unavailable or corrupt - start cold.
  }
};
hydrate();

let persistTimer = null;
const persist = () => {
  clearTimeout(persistTimer);
  persistTimer = setTimeout(() => {
    try {
      const out = {};
      entries.forEach((entry, key) => {
        if (entry.data !== undefined && !key.startsWith("nopersist:")) out[key] = { data: entry.data };
      });
      const json = JSON.stringify(out);
      if (json.length < PERSIST_MAX_BYTES) sessionStorage.setItem(STORAGE_KEY, json);
    } catch {
      // Quota or serialization failure: the in-memory cache still works.
    }
  }, 250);
};

const emit = (key) => {
  const set = listeners.get(key);
  if (set) set.forEach((fn) => fn());
};

const getEntry = (key) => entries.get(key);

const subscribe = (key, fn) => {
  if (!listeners.has(key)) listeners.set(key, new Set());
  listeners.get(key).add(fn);
  return () => listeners.get(key)?.delete(fn);
};

export const fetchQuery = (key, fetcher, { force = false, staleMs = DEFAULT_STALE_MS } = {}) => {
  const entry = entries.get(key) || { data: undefined, error: null, updatedAt: 0, promise: null };
  if (entry.promise) return entry.promise;
  if (!force && entry.data !== undefined && Date.now() - entry.updatedAt < staleMs) {
    return Promise.resolve(entry.data);
  }
  const promise = Promise.resolve()
    .then(fetcher)
    .then((data) => {
      entries.set(key, { data, error: null, updatedAt: Date.now(), promise: null });
      emit(key);
      persist();
      return data;
    })
    .catch((error) => {
      const current = entries.get(key) || entry;
      entries.set(key, { ...current, error, promise: null });
      emit(key);
      throw error;
    });
  entries.set(key, { ...entry, promise });
  emit(key);
  return promise;
};

export const prefetch = (key, fetcher, options) => {
  fetchQuery(key, fetcher, options).catch(() => {});
};

export const setQueryData = (key, updater) => {
  const entry = entries.get(key) || { data: undefined, error: null, updatedAt: 0, promise: null };
  const data = typeof updater === "function" ? updater(entry.data) : updater;
  entries.set(key, { ...entry, data, updatedAt: Date.now(), error: null });
  emit(key);
  persist();
};

export const getQueryData = (key) => entries.get(key)?.data;

/** Mark keys (exact or by prefix ending in "*") stale and refetch any that are mounted. */
export const invalidate = (...keys) => {
  keys.forEach((pattern) => {
    const prefix = pattern.endsWith("*") ? pattern.slice(0, -1) : null;
    [...entries.keys()].forEach((key) => {
      if (prefix ? key.startsWith(prefix) : key === pattern) {
        const entry = entries.get(key);
        entries.set(key, { ...entry, updatedAt: 0 });
        emit(key);
      }
    });
  });
};

export const clearQueryCache = () => {
  entries.clear();
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
};

/**
 * Read a cached query, fetching/revalidating as needed.
 * Returns { data, error, isLoading (no data yet), isFetching, refetch, mutate }.
 */
export function useQuery(key, fetcher, { enabled = true, staleMs = DEFAULT_STALE_MS } = {}) {
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const snapshot = useSyncExternalStore(
    useCallback((fn) => (key ? subscribe(key, fn) : () => {}), [key]),
    () => (key ? getEntry(key) : undefined)
  );

  useEffect(() => {
    if (!key || !enabled) return;
    fetchQuery(key, () => fetcherRef.current(), { staleMs }).catch(() => {});
  }, [key, enabled, staleMs, snapshot?.updatedAt]);

  // Revalidate when the tab regains focus.
  useEffect(() => {
    if (!key || !enabled) return undefined;
    const onFocus = () => fetchQuery(key, () => fetcherRef.current(), { staleMs }).catch(() => {});
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [key, enabled, staleMs]);

  const refetch = useCallback(
    () => (key ? fetchQuery(key, () => fetcherRef.current(), { force: true }) : Promise.resolve()),
    [key]
  );
  const mutate = useCallback((updater) => key && setQueryData(key, updater), [key]);

  return {
    data: snapshot?.data,
    error: snapshot?.data === undefined ? snapshot?.error || null : null,
    isLoading: Boolean(enabled && key && snapshot?.data === undefined && !snapshot?.error),
    isFetching: Boolean(snapshot?.promise),
    refetch,
    mutate,
  };
}
