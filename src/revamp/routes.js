import { lazy } from "react";
import {
  LuLayoutDashboard,
  LuMap,
  LuGift,
  LuChartLine,
  LuStar,
  LuBookOpen,
  LuTimer,
  LuTrash2,
} from "react-icons/lu";
import { api, keys } from "./lib/api";
import { prefetch } from "./lib/query";

/**
 * Route registry for the revamped student app. Each entry knows how to load
 * its code chunk and which queries it reads, so hovering a nav item warms
 * both before the click (most navigations then render from cache).
 */
const lazyWithPreload = (factory) => {
  const Component = lazy(factory);
  Component.preload = factory;
  return Component;
};

export const pages = {
  Dashboard: lazyWithPreload(() => import("./pages/Dashboard")),
  Projects: lazyWithPreload(() => import("./pages/Projects")),
  ProjectRoadmap: lazyWithPreload(() => import("./pages/ProjectRoadmap")),
  Quiz: lazyWithPreload(() => import("./pages/Quiz")),
  Results: lazyWithPreload(() => import("./pages/Results")),
  Challenges: lazyWithPreload(() => import("./pages/Challenges")),
  Assistant: lazyWithPreload(() => import("./pages/Assistant")),
  Events: lazyWithPreload(() => import("./pages/Events")),
  EventDetail: lazyWithPreload(() => import("./pages/EventDetail")),
  Rewards: lazyWithPreload(() => import("./pages/Rewards")),
  RewardDetail: lazyWithPreload(() => import("./pages/RewardDetail")),
  Cart: lazyWithPreload(() => import("./pages/Cart")),
  Checkout: lazyWithPreload(() => import("./pages/Checkout")),
  Orders: lazyWithPreload(() => import("./pages/Orders")),
  Profile: lazyWithPreload(() => import("./pages/Profile")),
  Trash: lazyWithPreload(() => import("./pages/Trash")),
};

export const BASE = "/l2dashboard";

export const NAV = [
  { id: "dashboard", label: "Dashboard", to: `${BASE}/dashboard`, icon: LuLayoutDashboard, page: pages.Dashboard, data: [[keys.dashboard, api.dashboard]] },
  { id: "projects", label: "Project Roadmap", to: `${BASE}/projects`, icon: LuMap, page: pages.Projects, data: [[keys.projects, api.projects]] },
  { id: "rewards", label: "Rewards", to: `${BASE}/rewards`, icon: LuGift, page: pages.Rewards, data: [[keys.rewards, api.rewards], [keys.wishlist, api.wishlist]] },
  { id: "results", label: "Results", to: `${BASE}/results`, icon: LuChartLine, page: pages.Results, data: [[keys.results, api.results]] },
  { id: "challenges", label: "Challenges", to: `${BASE}/challenges`, icon: LuStar, page: pages.Challenges, data: [[keys.challenges, api.challenges]] },
  { id: "assistant", label: "Ask a Textbook", to: `${BASE}/ask-a-textbook`, icon: LuBookOpen, page: pages.Assistant, data: [] },
  { id: "events", label: "Events", to: `${BASE}/events`, icon: LuTimer, page: pages.Events, data: [[keys.events, api.events]] },
  { id: "trash", label: "Trash", to: `${BASE}/trash`, icon: LuTrash2, page: pages.Trash, data: [[keys.trash, api.trash]] },
];

export const warm = (item) => {
  item.page.preload?.();
  item.data.forEach(([key, fetcher]) => prefetch(key(), fetcher));
};

/** Which nav item a pathname belongs to. */
export const activeNavId = (pathname) => {
  const rest = pathname.replace(BASE, "");
  if (/^\/(projects|quiz)/.test(rest)) return "projects";
  if (/^\/rewards/.test(rest)) return "rewards";
  if (/^\/results/.test(rest)) return "results";
  if (/^\/challenges/.test(rest)) return "challenges";
  if (/^\/ask-a-textbook/.test(rest)) return "assistant";
  if (/^\/events/.test(rest)) return "events";
  if (/^\/trash/.test(rest)) return "trash";
  if (/^\/profile/.test(rest)) return "profile";
  return "dashboard";
};
