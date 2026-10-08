import React, { useEffect } from "react";
import { Navigate, Route, Routes, useParams } from "react-router-dom";
import AppShell from "./layout/AppShell";
import { pages, NAV, warm } from "./routes";

/**
 * Revamped student (Level-2) app, mounted at /l2dashboard/* by App.js.
 * Old paths used by emails, the landing page and pre-revamp components are
 * redirected to their new homes at the bottom of the table.
 */
const LegacyTask = () => <Navigate to={`/l2dashboard/projects/educator/${useParams().id}`} replace />;
const LegacyPrivate = () => <Navigate to={`/l2dashboard/projects/self/${useParams().id}`} replace />;
const LegacyAll = () => <Navigate to={`/l2dashboard/projects/educator/${useParams().id}`} replace />;

export default function StudentApp() {
  // Warm the most likely next screens once the shell is idle.
  useEffect(() => {
    const idle = window.requestIdleCallback || ((fn) => setTimeout(fn, 1200));
    const handle = idle(() => NAV.slice(1, 4).forEach((item) => item.page.preload?.()));
    return () => (window.cancelIdleCallback || clearTimeout)(handle);
  }, []);

  useEffect(() => warm(NAV[0]), []);

  const P = pages;
  return (
    <AppShell>
      <Routes>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<P.Dashboard />} />
        <Route path="projects" element={<P.Projects />} />
        <Route path="projects/:kind/:id" element={<P.ProjectRoadmap />} />
        <Route path="quiz/:topic" element={<P.Quiz />} />
        <Route path="results" element={<P.Results />} />
        <Route path="challenges" element={<P.Challenges />} />
        <Route path="ask-a-textbook" element={<P.Assistant />} />
        <Route path="ask-a-textbook/:bookId" element={<P.Assistant />} />
        <Route path="ask-a-textbook/:bookId/:chatId" element={<P.Assistant />} />
        <Route path="events" element={<P.Events />} />
        <Route path="events/:id" element={<P.EventDetail />} />
        <Route path="rewards" element={<P.Rewards />} />
        <Route path="rewards/cart" element={<P.Cart />} />
        <Route path="rewards/checkout" element={<P.Checkout />} />
        <Route path="rewards/orders" element={<P.Orders />} />
        <Route path="rewards/:id" element={<P.RewardDetail />} />
        <Route path="profile" element={<P.Profile />} />
        <Route path="trash" element={<P.Trash />} />

        {/* pre-revamp paths */}
        <Route path="history" element={<Navigate to="/l2dashboard/results" replace />} />
        <Route path="settings" element={<Navigate to="/l2dashboard/profile" replace />} />
        <Route path="marketplace" element={<Navigate to="/l2dashboard/rewards" replace />} />
        <Route path="task/:id" element={<LegacyTask />} />
        <Route path="project/all-projects/:id" element={<LegacyAll />} />
        <Route path="project/private-projects/:id" element={<LegacyPrivate />} />
        <Route path="project/*" element={<Navigate to="/l2dashboard/projects" replace />} />
        <Route path="*" element={<Navigate to="/l2dashboard/dashboard" replace />} />
      </Routes>
    </AppShell>
  );
}
