import React, { useEffect, useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckCircle, faClock, faArrowLeft, faChevronDown, faChevronUp, faSearch } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import moment from "moment";
import { getQuizResults, getInstituteQuizResults } from "../../../utils/apiServices";
import SkeletonLoading from "../../../components/SkeletonLoading";
import { Badge, Button, EmptyState, Input, PageBanner, PageShell, SectionLabel, StatCard, cx } from "../../../components/ui";

/**
 * Faculty Quiz Results.
 *  - Students: one progress row per student enrolled in the faculty member's
 *    institute (expand for their recent attempts).
 *  - All attempts: every student attempt, newest first, filterable.
 *  - My attempts: the faculty member's own quizzes (the previous view).
 */

const PAGE = 50;
const formatDate = (value) => (value ? moment(value).format("MMM DD, YYYY hh:mm A") : "N/A");
const statusFor = (percent) =>
  percent === null || percent === undefined
    ? { tone: "neutral", label: "No attempts" }
    : percent >= 80
      ? { tone: "positive", label: "Excellent" }
      : percent >= 60
        ? { tone: "warning", label: "Good" }
        : { tone: "negative", label: "Needs work" };

const TABS = [
  { id: "students", label: "Students" },
  { id: "attempts", label: "All attempts" },
  { id: "mine", label: "My attempts" },
];

const QuizResults = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState("students");
  const [institute, setInstitute] = useState(null);
  const [mine, setMine] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [studentFilter, setStudentFilter] = useState("all");
  const [expanded, setExpanded] = useState(null);
  const [limit, setLimit] = useState(PAGE);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      const [inst, own] = await Promise.allSettled([getInstituteQuizResults(), getQuizResults({ role: "Level-1" })]);
      if (!alive) return;
      if (inst.status === "fulfilled") setInstitute(inst.value);
      else toast.error(inst.reason?.message || "Failed to load institute results");
      if (own.status === "fulfilled") {
        setMine(
          own.value
            .map((r) => {
              const total = typeof r.totalQuestions === "number" ? r.totalQuestions : r.answers ? r.answers.length : 0;
              const correct = typeof r.correctCount === "number" ? r.correctCount : r.answers ? r.answers.filter((a) => a.isCorrect).length : r.score || 0;
              return { id: r._id, subtopic: r.subtopic, correct, total, percent: total ? Math.round((correct / total) * 100) : 0, timeTaken: r.timeTaken, createdAt: r.createdAt };
            })
            .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
        );
      }
      setLoading(false);
    })();
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => setLimit(PAGE), [tab, query, studentFilter]);

  const students = useMemo(() => institute?.students || [], [institute]);
  const needle = query.trim().toLowerCase();

  const visibleStudents = useMemo(
    () => students.filter((s) => !needle || `${s.name} ${s.email || ""}`.toLowerCase().includes(needle)),
    [students, needle]
  );
  const visibleAttempts = useMemo(
    () =>
      (institute?.attempts || [])
        .filter((a) => studentFilter === "all" || a.uid === studentFilter)
        .filter((a) => !needle || `${a.studentName} ${a.subtopic}`.toLowerCase().includes(needle)),
    [institute, studentFilter, needle]
  );
  const visibleMine = useMemo(() => mine.filter((a) => !needle || (a.subtopic || "").toLowerCase().includes(needle)), [mine, needle]);

  const totals = institute?.totals || { students: 0, activeStudents: 0, attempts: 0, averagePercent: 0 };

  return (
    <PageShell>
      <ToastContainer />
      <PageBanner
        title="Quiz Results"
        subtitle={`Track the quiz progress of every student enrolled in ${institute?.institute?.name || "your institute"}.`}
        stat={{ value: totals.students, label: "Students" }}
      />

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => <SkeletonLoading key={i} type="card" count={1} />)}
        </div>
      ) : (
        <section className="space-y-4">
          <SectionLabel>Institute summary</SectionLabel>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Students enrolled" value={totals.students} />
            <StatCard label="Active students" value={totals.activeStudents} hint="At least one quiz taken" />
            <StatCard label="Quizzes taken" value={totals.attempts} />
            <StatCard label="Average score" value={`${totals.averagePercent}%`} />
          </div>
        </section>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex border border-line bg-white" role="tablist">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => setTab(t.id)}
              className={cx(
                "px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.14em] transition-colors",
                tab === t.id ? "bg-navy text-white" : "text-ink-muted hover:text-ink"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          {tab === "attempts" && (
            <select
              value={studentFilter}
              onChange={(e) => setStudentFilter(e.target.value)}
              className="h-10 border border-line bg-white px-3 text-sm text-ink outline-none focus:border-navy"
              aria-label="Filter by student"
            >
              <option value="all">All students</option>
              {students.map((s) => <option key={s.uid} value={s.uid}>{s.name}</option>)}
            </select>
          )}
          <div className="relative sm:w-72">
            <FontAwesomeIcon icon={faSearch} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-ink-muted" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={tab === "students" ? "Search students…" : tab === "attempts" ? "Search student or topic…" : "Search topic…"}
              className="pl-9"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="border border-line bg-white"><SkeletonLoading type="table" count={5} /></div>
      ) : tab === "students" ? (
        !students.length ? (
          <EmptyState
            title="No students enrolled yet"
            description="Students who register with your institute code will appear here with their quiz progress."
            action={<Button onClick={() => navigate("/l1dashboard")}><FontAwesomeIcon icon={faArrowLeft} /> Back to dashboard</Button>}
          />
        ) : (
          <div className="border border-line bg-white">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[52rem] border-collapse text-left">
                <thead>
                  <tr className="border-b border-line-soft bg-parchment text-[10px] uppercase tracking-[0.16em] text-ink-muted">
                    <th className="px-6 py-3 font-semibold">Student</th>
                    <th className="px-6 py-3 font-semibold">Quizzes</th>
                    <th className="px-6 py-3 font-semibold">Topics</th>
                    <th className="px-6 py-3 font-semibold">Average</th>
                    <th className="px-6 py-3 font-semibold">Best</th>
                    <th className="px-6 py-3 font-semibold">Full marks</th>
                    <th className="px-6 py-3 font-semibold">Last active</th>
                    <th className="px-6 py-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleStudents.map((s) => {
                    const status = statusFor(s.averagePercent);
                    const open = expanded === s.uid;
                    return (
                      <React.Fragment key={s.uid}>
                        <tr
                          className={cx("cursor-pointer border-b border-line-soft transition-colors hover:bg-navy-wash/40", open && "bg-navy-wash/40")}
                          onClick={() => setExpanded(open ? null : s.uid)}
                        >
                          <td className="px-6 py-4">
                            <p className="flex items-center gap-2 text-sm font-semibold text-ink">
                              <FontAwesomeIcon icon={open ? faChevronUp : faChevronDown} className="text-[10px] text-ink-muted" />
                              {s.name}
                            </p>
                            <p className="pl-5 text-xs text-ink-muted">{[s.email, s.educationLevel].filter(Boolean).join(" · ")}</p>
                          </td>
                          <td className="px-6 py-4 text-sm text-ink">{s.attempts}</td>
                          <td className="px-6 py-4 text-sm text-ink-muted">{s.topics}</td>
                          <td className="px-6 py-4 text-sm text-ink">{s.averagePercent === null ? "—" : `${s.averagePercent}%`}</td>
                          <td className="px-6 py-4 text-sm text-ink-muted">{s.bestPercent === null ? "—" : `${s.bestPercent}%`}</td>
                          <td className="px-6 py-4 text-sm text-ink-muted">{s.fullMarks}</td>
                          <td className="px-6 py-4 text-sm text-ink-muted">{s.lastAttemptAt ? moment(s.lastAttemptAt).fromNow() : "Never"}</td>
                          <td className="px-6 py-4"><Badge tone={status.tone}>{status.label}</Badge></td>
                        </tr>
                        {open && (
                          <tr className="border-b border-line-soft bg-parchment/60">
                            <td colSpan={8} className="px-6 py-4">
                              {s.recent.length ? (
                                <>
                                  <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-muted">Recent quizzes</p>
                                  <ul className="space-y-1.5">
                                    {s.recent.map((r, i) => (
                                      <li key={i} className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                                        <span className="font-semibold text-ink">{r.subtopic}</span>
                                        <span className="text-ink-muted">{r.correct}/{r.total} ({r.percent}%)</span>
                                        <span className="text-xs text-ink-muted">{formatDate(r.createdAt)}</span>
                                      </li>
                                    ))}
                                  </ul>
                                  {s.attempts > s.recent.length && (
                                    <button
                                      type="button"
                                      className="mt-3 text-xs font-semibold text-navy underline"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setStudentFilter(s.uid);
                                        setTab("attempts");
                                      }}
                                    >
                                      View all {s.attempts} attempts
                                    </button>
                                  )}
                                </>
                              ) : (
                                <p className="text-sm text-ink-muted">{s.name} hasn't taken any quizzes yet.</p>
                              )}
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                  {!visibleStudents.length && (
                    <tr><td colSpan={8} className="px-6 py-10 text-center text-sm text-ink-muted">No students match “{query}”.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )
      ) : (
        <AttemptsTable
          rows={tab === "attempts" ? visibleAttempts : visibleMine}
          showStudent={tab === "attempts"}
          limit={limit}
          onMore={() => setLimit(limit + PAGE)}
          emptyText={tab === "attempts" ? "No quiz attempts from your students yet." : "You haven't taken any quizzes yet."}
        />
      )}
    </PageShell>
  );
};

function AttemptsTable({ rows, showStudent, limit, onMore, emptyText }) {
  if (!rows.length) return <EmptyState title="Nothing to show" description={emptyText} />;
  return (
    <div className="border border-line bg-white">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[46rem] border-collapse text-left">
          <thead>
            <tr className="border-b border-line-soft bg-parchment text-[10px] uppercase tracking-[0.16em] text-ink-muted">
              {showStudent && <th className="px-6 py-3 font-semibold">Student</th>}
              <th className="px-6 py-3 font-semibold">Topic</th>
              <th className="px-6 py-3 font-semibold">Score</th>
              <th className="px-6 py-3 font-semibold">Correct</th>
              <th className="px-6 py-3 font-semibold">Time taken</th>
              <th className="px-6 py-3 font-semibold">Date</th>
              <th className="px-6 py-3 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.slice(0, limit).map((r) => {
              const status = statusFor(r.percent);
              return (
                <tr key={r.id} className="border-b border-line-soft last:border-b-0 transition-colors hover:bg-navy-wash/40">
                  {showStudent && <td className="px-6 py-4 text-sm font-semibold text-ink">{r.studentName}</td>}
                  <td className="px-6 py-4 text-sm font-semibold text-ink">{r.subtopic || "Unknown topic"}</td>
                  <td className="px-6 py-4 text-sm text-ink">{r.percent}%</td>
                  <td className="px-6 py-4 text-sm text-ink-muted">
                    <span className="flex items-center gap-2"><FontAwesomeIcon icon={faCheckCircle} className="text-[11px] text-emerald-600" />{r.correct}/{r.total}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-ink-muted">
                    <span className="flex items-center gap-2"><FontAwesomeIcon icon={faClock} className="text-[11px]" />{r.timeTaken || "N/A"}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-ink-muted">{formatDate(r.createdAt)}</td>
                  <td className="px-6 py-4"><Badge tone={status.tone}>{status.label}</Badge></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {rows.length > limit && (
        <div className="border-t border-line-soft p-4 text-center">
          <Button onClick={onMore}>Show more ({rows.length - limit} older)</Button>
        </div>
      )}
    </div>
  );
}

export default QuizResults;
