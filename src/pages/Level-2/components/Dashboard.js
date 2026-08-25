import React, { useEffect, useMemo, useRef, useState } from "react";
import Cookies from "js-cookie";
import { getUser, getProjects, getStudyPlans, getQuizResults } from "../../../utils/apiServices";
import { FaFileAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import SyllabusMindMap from "../../../components/SyllabusMindMap";
import {
  Badge,
  Button,
  EmptyState,
  PageBanner,
  PageShell,
  Panel,
  SectionLabel,
  StatCard,
} from "../../../components/ui";

// Kept for the lifetime of the tab, keyed by user, so returning to the
// dashboard shows the last known numbers straight away while fresh ones load
// behind them.
let dashboardCache = { uid: null, data: null };

// A window refocus refreshes the dashboard, but not more often than this -
// alt-tabbing used to fire the whole batch of requests every time.
const FOCUS_REFRESH_INTERVAL = 60 * 1000;

const Dashboard = () => {
  const cached =
    dashboardCache.uid && dashboardCache.uid === Cookies.get("uid")
      ? dashboardCache.data
      : null;

  const [loading, setLoading] = useState(!cached);
  const [lastQuizScore, setLastQuizScore] = useState(cached?.lastQuizScore ?? null);
  const [userData, setUserData] = useState(cached?.userData ?? null);
  const [quizResults, setQuizResults] = useState(cached?.quizResults ?? []);
  const [recentTasks, setRecentTasks] = useState(cached?.recentTasks ?? []);
  const lastFetchedAt = useRef(0);
  const navigate = useNavigate();

  const fetchData = async ({ background = false } = {}) => {
    if (!background) setLoading(true);
    lastFetchedAt.current = Date.now();
    const uid = Cookies.get("uid");
    if (!uid) {
      setLoading(false);
      return;
    }

    // All four requests go out together. Quiz results used to wait for the
    // first three to settle, which cost the score tiles an extra round trip.
    const quizRequest = getQuizResults({ role: 'Level-2' }).then(
      (results) => ({ ok: true, results }),
      (error) => ({ ok: false, error })
    );

    try {
      // Fetch user profile, public plans, and private projects concurrently
      const [user, studyPlansData, privateProjectsData] = await Promise.all([
        getUser(uid),
        getStudyPlans({ published: undefined }),
        getProjects('private')
      ]);

      if (user) {
        setUserData(user);
      }

      const studyPlans = (studyPlansData || []).filter(item => !item.isTrashed);
      const privateProjects = (privateProjectsData || []).filter(item => !item.isTrashed);

      const studyPlansTasks = studyPlans.map((data) => ({
        _id: data._id || data.id,
        collection: "studyPlans",
        topic: data.title || data.name || "Untitled Project",
        createdAt: data.createdAt || data.updatedAt,
        levelOfLearning: data.levelOfLearning || "Undergraduate Student",
        ...data,
      }));

      const privateProjectsTasks = privateProjects.map((data) => ({
        _id: data._id || data.id,
        collection: "privateProjects",
        topic: data.topic || "Untitled Project",
        createdAt: data.createdAt,
        levelOfLearning: data.levelOfLearning || "Undergraduate Student",
        ...data,
      }));

      const combined = [...studyPlansTasks, ...privateProjectsTasks]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setRecentTasks(combined);
      setLoading(false); // Dismiss loading screen immediately

      // Quiz results were requested up front; pick them up here.
      const quizOutcome = await quizRequest;
      if (!quizOutcome.ok) {
        console.warn("Non-blocking error fetching dashboard quiz results:", quizOutcome.error);
        setLastQuizScore("N/A");
      } else {
        const results = quizOutcome.results;
        if (results && results.length > 0) {
          const sortedResults = results.sort((a, b) => {
            const parseDate = (val) => {
              if (!val) return 0;
              if (typeof val.toDate === 'function') return val.toDate().getTime();
              if (val.seconds !== undefined) return val.seconds * 1000;
              if (val._seconds !== undefined) return val._seconds * 1000;
              if (val instanceof Date) return val.getTime();
              const d = new Date(val);
              return isNaN(d.getTime()) ? 0 : d.getTime();
            };
            return parseDate(b.createdAt) - parseDate(a.createdAt);
          });
          setQuizResults(sortedResults);

          const last = sortedResults[0];
          const total = last.answers ? last.answers.length : 5;
          const score = last.score || 0;
          setLastQuizScore(`${Math.round((score / total) * 100)}%`);

        } else {
          setLastQuizScore("N/A");
        }
      }

    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Listen for updates
    const handleUpdate = (e) => {
      // Optimistic update if event detail is available
      if (e?.detail) {
        const { totalScore, scoreDisplay } = e.detail;
        if (totalScore !== undefined) {
          setUserData(prev => prev ? { ...prev, userPoints: totalScore } : prev);
        }
        if (scoreDisplay) {
          const [earned, total] = scoreDisplay.split('/').map(Number);
          if (!isNaN(earned) && !isNaN(total) && total > 0) {
             setLastQuizScore(`${Math.round((earned / total) * 100)}%`);
          }
        }
      }
      fetchData({ background: true });
    };

    // Refreshing on every focus meant a full batch of requests each time the
    // window was alt-tabbed back into; refresh quietly and at most once a minute.
    const handleFocus = () => {
      if (Date.now() - lastFetchedAt.current < FOCUS_REFRESH_INTERVAL) return;
      fetchData({ background: true });
    };

    window.addEventListener('quizScoreUpdated', handleUpdate);
    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('quizScoreUpdated', handleUpdate);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  // Keep the cache in step with whatever the page is showing.
  useEffect(() => {
    if (loading) return;
    dashboardCache = {
      uid: Cookies.get("uid"),
      data: { userData, recentTasks, quizResults, lastQuizScore },
    };
  }, [loading, userData, recentTasks, quizResults, lastQuizScore]);

  const stats = useMemo(() => [
    { label: "Total Points", total: userData?.userPoints || 0 },
    {
      label: "Challenges Taken",
      total: userData?.quizCount || (quizResults?.length || 0),
    },
    { label: "Last Score", total: lastQuizScore || "---" },
  ], [userData, quizResults, lastQuizScore]);

  // The page keeps its shape while data loads: the panels below stay mounted
  // (remounting them made the syllabus map refetch on every visit) and the
  // tiles carry placeholders rather than stand-in zeroes.
  const awaitingUser = loading && !userData;

  return (
    <PageShell>
      <PageBanner
        title={userData?.name ? `Welcome, ${userData.name.split(" ")[0]}!` : "Welcome!"}
        subtitle="See how you're doing and track your work in one place."
        stat={
          awaitingUser
            ? undefined
            : { value: userData?.userPoints || 0, label: "Total pts" }
        }
      />

      <section className="space-y-4">
        <SectionLabel>Your progress</SectionLabel>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {stats.map((stat) => (
            <StatCard
              key={stat.label}
              label={stat.label}
              value={stat.total}
              loading={awaitingUser}
            />
          ))}
        </div>
      </section>

      <Panel
        title="Syllabus Mind Map"
        subtitle="Upload your course syllabus — AI extracts topics and lets you create projects from them."
      >
        <SyllabusMindMap
          onProjectCreated={() => navigate("/l2dashboard/project/private-projects")}
        />
      </Panel>

      <Panel
        title="My Projects"
        subtitle="Check and track your recent work."
        action={
          <Button onClick={() => navigate("/l2dashboard/project/all-projects")}>
            All projects
          </Button>
        }
        bodyClassName="px-0 pb-0"
      >
        {loading && recentTasks.length === 0 ? (
          <div className="divide-y divide-line-soft border-t border-line-soft">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="px-6 py-5">
                <span className="skeleton-shimmer block h-4 w-2/5 bg-line-soft" />
              </div>
            ))}
          </div>
        ) : recentTasks.length === 0 ? (
          <div className="px-6 pb-6">
            <EmptyState
              title="No projects yet"
              description="Projects you create from the syllabus mind map or the projects area will appear here."
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[40rem] border-collapse text-left">
              <thead>
                <tr className="border-y border-line-soft bg-parchment text-[10px] uppercase tracking-[0.16em] text-ink-muted">
                  <th className="px-6 py-3 font-semibold">Project name</th>
                  <th className="px-6 py-3 font-semibold">Level</th>
                  <th className="px-6 py-3 font-semibold">Visibility</th>
                  <th className="px-6 py-3 text-right font-semibold">Created by</th>
                </tr>
              </thead>
              <tbody>
                {recentTasks.map((task, i) => (
                  <tr
                    key={i}
                    onClick={() =>
                      navigate(
                        task.collection === "studyPlans"
                          ? `/l2dashboard/project/all-projects/${task._id}`
                          : `/l2dashboard/project/private-projects/${task._id}`
                      )
                    }
                    className="cursor-pointer border-b border-line-soft transition-colors last:border-b-0 hover:bg-navy-wash/40"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <FaFileAlt className="flex-shrink-0 text-navy" />
                        <span className="text-sm font-semibold text-ink">{task.topic}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-ink-muted">
                      {task.levelOfLearning?.split(" ")[0] || "Standard"}
                    </td>
                    <td className="px-6 py-4">
                      <Badge tone={task.collection === "studyPlans" ? "positive" : "warning"}>
                        {task.collection === "studyPlans" ? "Public" : "Private"}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right text-sm text-ink-muted">
                      {task.name || "Scholar"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </PageShell>
  );
};

export default Dashboard;
