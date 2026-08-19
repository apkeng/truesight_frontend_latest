import React, { useEffect, useMemo, useState } from "react";
import { FaFileAlt } from "react-icons/fa";
import Cookies from "js-cookie";
import { getUser, getProjects, getStudyPlans } from "../../../utils/apiServices";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../../firebase/firebase-config";
import { toast } from "react-toastify";
import { SkeletonStatsCard } from "../../../components/SkeletonLoading";
import { useNavigate } from "react-router-dom";
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
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalProjects, setTotalProjects] = useState(0);
  const [totalTasks, setTotalTasks] = useState(0);
  const [combinedTasks, setCombinedTasks] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const uid = Cookies.get("uid");
        if (!uid) {
          toast.error("User not authenticated.");
          setLoading(false);
          return;
        }

        // Fetch User profile, public plans, and private projects concurrently
        const [userData, studyPlansData, privateProjectsData] = await Promise.all([
          getUser(uid),
          getStudyPlans({ published: undefined }),
          getProjects('private')
        ]);

        let resolvedInstituteCode = "";
        if (userData) {
          resolvedInstituteCode = userData.instituteCode || "";
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

        const combinedTasks = [...studyPlansTasks, ...privateProjectsTasks]
          .sort((a, b) => {
            const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return dateB - dateA;
          });

        setTotalTasks(combinedTasks.length);
        setCombinedTasks(combinedTasks);
        setTotalProjects(studyPlans.length + privateProjects.length);

        // Fetch Users (Student Roll) if instituteCode is resolved
        if (resolvedInstituteCode) {
          const usersRef = collection(db, "users");
          const q = query(usersRef, where("instituteCode", "==", resolvedInstituteCode));
          const querySnapshot = await getDocs(q);
          const fetchedUsers = querySnapshot.docs
            .map((doc) => {
              const data = doc.data();
              const createdAt = data.createdAt ? data.createdAt.toDate() : new Date();
              return {
                ...data,
                _id: doc.id,
                createdAt,
              };
            })
            .sort((a, b) => b.createdAt - a.createdAt);
          setUsers(fetchedUsers);
        }

      } catch (error) {
        console.error("Error loading dashboard data:", error);
        toast.error("Failed to load tasks.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const students = useMemo(
    () => users.filter((u) => u.role === "Level-2"),
    [users]
  );
  const totalStudents = students.length;

  const stats = useMemo(() => [
    { _id: "1", label: "Total Students", total: totalStudents || 0 },
    { _id: "2", label: "Total Projects", total: totalProjects || 0 },
    { _id: "3", label: "My Projects", total: totalTasks || 0 },
    { _id: "4", label: "Active Users", total: users.length },
  ], [users, totalStudents, totalProjects, totalTasks]);

  return (
    <PageShell>
      <PageBanner
        title="Teacher Dashboard"
        subtitle="Oversee your academic environment, manage students, and monitor platform activity."
        stat={!loading ? { value: totalStudents || 0, label: "Students" } : undefined}
      />

      <section className="space-y-4">
        <SectionLabel>Your overview</SectionLabel>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => <SkeletonStatsCard key={i} />)
            : stats.map((stat) => (
                <StatCard key={stat._id} label={stat.label} value={stat.total} />
              ))}
        </div>
      </section>

      <Panel
        title="Student Directory"
        subtitle="The five most recent enrolments in your institute."
        action={
          <Button variant="quiet" onClick={() => navigate("/l1dashboard/users")}>
            Full roll
          </Button>
        }
        bodyClassName="px-0 pb-0"
      >
        {totalStudents === 0 ? (
          <div className="px-6 pb-6">
            <EmptyState
              title="No students yet"
              description="Students who register with your institute code will be listed here."
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[36rem] border-collapse text-left">
              <thead>
                <tr className="border-y border-line-soft bg-parchment text-[10px] uppercase tracking-[0.16em] text-ink-muted">
                  <th className="px-6 py-3 font-semibold">Student</th>
                  <th className="px-6 py-3 font-semibold">Internal ID</th>
                  <th className="px-6 py-3 text-right font-semibold">Joined</th>
                </tr>
              </thead>
              <tbody>
                {students.slice(0, 5).map((user, i) => (
                  <tr
                    key={i}
                    className="border-b border-line-soft last:border-b-0 hover:bg-navy-wash/40"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center bg-navy-wash text-[11px] font-semibold text-navy">
                          {user.name?.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-ink">{user.name}</p>
                          <p className="truncate text-xs text-ink-muted">
                            {user.email || "No email registered"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs uppercase text-ink-muted">
                      {user._id?.substring(0, 10)}
                    </td>
                    <td className="px-6 py-4 text-right text-sm text-ink-muted">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "---"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      <Panel
        title="Recent Academic Projects"
        subtitle="The latest curricula and private sessions across your institute."
        action={
          <Button onClick={() => navigate("/l1dashboard/project/all-projects")}>
            View all
          </Button>
        }
        bodyClassName="px-0 pb-0"
      >
        {combinedTasks.length === 0 ? (
          <div className="px-6 pb-6">
            <EmptyState
              title="No projects yet"
              description="Curricula and private projects created in your institute will show up here."
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[44rem] border-collapse text-left">
              <thead>
                <tr className="border-y border-line-soft bg-parchment text-[10px] uppercase tracking-[0.16em] text-ink-muted">
                  <th className="px-6 py-3 font-semibold">Curriculum title</th>
                  <th className="px-6 py-3 font-semibold">Lead author</th>
                  <th className="px-6 py-3 font-semibold">Target tier</th>
                  <th className="px-6 py-3 text-right font-semibold">Created</th>
                </tr>
              </thead>
              <tbody>
                {combinedTasks.slice(0, 8).map((task, i) => (
                  <tr
                    key={i}
                    className="border-b border-line-soft last:border-b-0 hover:bg-navy-wash/40"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <FaFileAlt className="flex-shrink-0 text-navy" />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-ink">{task.topic}</p>
                          <p className="text-[10px] uppercase tracking-[0.16em] text-ink-muted">
                            {task.collection === "studyPlans" ? "Public curriculum" : "Private session"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-ink-muted">
                      {task.name || "System generated"}
                    </td>
                    <td className="px-6 py-4">
                      <Badge>{task.levelOfLearning}</Badge>
                    </td>
                    <td className="px-6 py-4 text-right text-sm text-ink-muted">
                      {task.createdAt ? new Date(task.createdAt).toLocaleDateString() : "---"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      <Panel title="Quick Links" subtitle="Jump straight to the areas you use most.">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <button
            onClick={() => navigate("/l1dashboard/quiz-results")}
            className="flex items-center justify-between border border-line px-5 py-4 text-left transition-colors hover:border-navy/40 hover:bg-navy-wash/40"
          >
            <span className="text-sm font-semibold text-ink">Quiz Results</span>
            <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-navy">
              Open
            </span>
          </button>
          <button
            onClick={() => navigate("/l1dashboard/project/all-projects")}
            className="flex items-center justify-between border border-line px-5 py-4 text-left transition-colors hover:border-navy/40 hover:bg-navy-wash/40"
          >
            <span className="text-sm font-semibold text-ink">Curriculum</span>
            <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-navy">
              Open
            </span>
          </button>
        </div>
      </Panel>
    </PageShell>
  );
};

export default Dashboard;
