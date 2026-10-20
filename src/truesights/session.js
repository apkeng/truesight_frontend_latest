import { createContext, useContext, useEffect, useState } from 'react';

/**
 * Session data for the TrueSights student app: the signed-in profile, points
 * and nav badges (from /api/v2/bootstrap), plus navigation helpers. Provided
 * by StudentApp; every screen reads it with useTS().
 */
export const TSContext = createContext(null);

export const useTS = () => useContext(TSContext);

export const BASE = '/l2dashboard';

/** Screen id -> URL. `arg` fills the screen's path parameter, if it has one. */
export const pathFor = (screen, arg) => {
  switch (screen) {
    case 'dashboard': return `${BASE}/dashboard`;
    case 'projects': return `${BASE}/projects`;
    case 'workspace': return arg ? `${BASE}/projects/${arg.kind}/${arg.id}` : `${BASE}/projects`;
    case 'quiz': return `${BASE}/quiz/${encodeURIComponent(arg || '')}`;
    case 'results': return `${BASE}/results`;
    case 'challenges': return `${BASE}/challenges`;
    case 'ask-textbook': return arg ? `${BASE}/ask-a-textbook/${arg}` : `${BASE}/ask-a-textbook`;
    case 'events': return arg ? `${BASE}/events/${arg}` : `${BASE}/events`;
    case 'rewards': return arg ? `${BASE}/rewards/${arg}` : `${BASE}/rewards`;
    case 'orders': return `${BASE}/rewards/orders`;
    case 'cart': return `${BASE}/rewards/cart`;
    case 'trash': return `${BASE}/trash`;
    case 'profile': return `${BASE}/profile`;
    case 'first-time-user': return `${BASE}/welcome`;
    default: return `${BASE}/dashboard`;
  }
};

/** URL -> screen id (the prototype's `currentScreen`). */
export const screenFromPath = (pathname) => {
  const rest = pathname.replace(BASE, '');
  if (/^\/projects\/[^/]+\/[^/]+/.test(rest)) return 'workspace';
  if (/^\/projects/.test(rest)) return 'projects';
  if (/^\/quiz/.test(rest)) return 'quiz';
  if (/^\/results/.test(rest)) return 'results';
  if (/^\/challenges/.test(rest)) return 'challenges';
  if (/^\/ask-a-textbook/.test(rest)) return 'ask-textbook';
  if (/^\/events/.test(rest)) return 'events';
  if (/^\/rewards/.test(rest)) return 'rewards';
  if (/^\/trash/.test(rest)) return 'trash';
  if (/^\/profile/.test(rest)) return 'profile';
  if (/^\/welcome/.test(rest)) return 'first-time-user';
  return 'dashboard';
};

/** The prototype's 768px breakpoint, kept in sync with the window. */
export function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(() => (typeof window !== 'undefined' ? window.innerWidth <= breakpoint : false));
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= breakpoint);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [breakpoint]);
  return isMobile;
}

export const firstName = (name) => (name || '').trim().split(/\s+/)[0] || 'there';

export const initials = (name) =>
  (name || '?')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() || '')
    .join('') || '?';
