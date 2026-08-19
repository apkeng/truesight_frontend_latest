import React, { useEffect, useMemo, useState } from "react";
import Cookies from "js-cookie";
import { getUser, getProjects, getStudyPlans, getQuizResults } from "../../../utils/apiServices";
import { FaFileAlt } from "react-icons/fa";
import { SkeletonStatsCard } from "../../../components/SkeletonLoading";
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

const Dashboard = () => {
  const [loading, setLoading] = useState(false);
  const [lastQuizScore, setLastQuizScore] = useState(null);
  const [userData, setUserData] = useState(null);
  const [quizResults, setQuizResults] = useState([]);
  const [recentTasks, setRecentTasks] = useState([]);
  const navigate = useNavigate();

  const fetchData = async () => {
    setLoading(true);
    const uid = Cookies.get("uid");
    if (!uid) {
      setLoading(false);
      return;
    }

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

      // Fetch quiz results in the background asynchronously
      try {
        const results = await getQuizResults({ role: 'Level-2' });
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
      } catch (quizError) {
        console.warn("Non-blocking error fetching dashboard quiz results:", quizError);
        setLastQuizScore("N/A");
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
      fetchData();
    };

    window.addEventListener('quizScoreUpdated', handleUpdate);
    window.addEventListener('focus', fetchData);

    return () => {
      window.removeEventListener('quizScoreUpdated', handleUpdate);
      window.removeEventListener('focus', fetchData);
    };
  }, []);

  const stats = useMemo(() => [
    { label: "Total Points", total: userData?.userPoints || 0 },
    {
      label: "Challenges Taken",
      total: userData?.quizCount || (quizResults?.length || 0),
    },
    { label: "Last Score", total: lastQuizScore || "---" },
  ], [userData, quizResults, lastQuizScore]);

  if (loading && !userData) {
    return (
      <PageShell>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonStatsCard key={i} />
          ))}
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <PageBanner
        title={`Welcome, ${userData?.name?.split(" ")[0] || "Scholar"}!`}
        subtitle="See how you're doing and track your work in one place."
        stat={{ value: userData?.userPoints || 0, label: "Total pts" }}
      />

      <section className="space-y-4">
        <SectionLabel>Your progress</SectionLabel>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {stats.map((stat) => (
            <StatCard key={stat.label} label={stat.label} value={stat.total} />
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
        {recentTasks.length === 0 ? (
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
