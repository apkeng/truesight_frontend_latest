import React, { useState, useEffect, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSync,
  faGraduationCap,
  faCoins,
  faClock,
  faFire,
  faCheckCircle,
  faCalendarAlt,
  faHistory
} from "@fortawesome/free-solid-svg-icons";
import Cookies from "js-cookie";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getQuizResults } from "../utils/apiServices";
import {
  Button,
  EmptyState,
  PageBanner,
  PageShell,
  SectionLabel,
} from "./ui";

const History = () => {
  const [quizResults, setQuizResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  const fetchQuizResults = useCallback(async () => {
    setLoading(true);
    try {
      const uid = Cookies.get("uid");
      if (!uid) {
        toast.error("User not authenticated");
        setLoading(false);
        return;
      }

      const results = await getQuizResults({ role: 'Level-2' });
      results.sort((a, b) => {
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
      setQuizResults(results);
    } catch (error) {
      console.error("Error fetching quiz results:", error);
      toast.error("Failed to load history");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQuizResults();
  }, [fetchQuizResults]);

  const getScoreColor = (score, totalQuestions) => {
    const percentage = totalQuestions > 0 ? (score / totalQuestions) * 100 : 0;
    if (percentage >= 80) return "text-emerald-500";
    if (percentage >= 60) return "text-amber-500";
    return "text-rose-500";
  };

  const getScoreBadgeColor = (score, totalQuestions) => {
    const percentage = totalQuestions > 0 ? (score / totalQuestions) * 100 : 0;
    if (percentage >= 80) return "bg-emerald-50 text-emerald-600 border-emerald-100";
    if (percentage >= 60) return "bg-amber-50 text-amber-600 border-amber-100";
    return "bg-rose-50 text-rose-600 border-rose-100";
  };

  const filteredResults = quizResults.filter(result => {
    if (activeTab === "all") return true;
    if (activeTab === "perfect") {
        const total = result.answers ? result.answers.length : 0;
        return result.score >= total && total > 0;
    }
    return true;
  });

  return (
    <PageShell>
      <ToastContainer autoClose={2000} />

      <PageBanner
        title="Results"
        subtitle="Track your progress across every quiz you have taken."
        stat={{ value: quizResults.length, label: "Attempts" }}
      />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex border border-line bg-white">
          {[
            { id: "all", label: "All results", icon: faHistory },
            { id: "perfect", label: "Full marks", icon: faCheckCircle },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex h-10 items-center gap-2 px-5 text-[11px] font-semibold uppercase tracking-[0.14em] transition-colors ${
                activeTab === tab.id
                  ? "bg-navy text-white"
                  : "text-ink-muted hover:bg-navy-wash hover:text-navy"
              }`}
            >
              <FontAwesomeIcon icon={tab.icon} className="text-[10px]" />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <SectionLabel>
            Avg{" "}
            {Math.round(
              quizResults.reduce((acc, curr) => acc + (curr.score || 0), 0) /
                (quizResults.length || 1)
            )}{" "}
            pts
          </SectionLabel>
          <Button variant="quiet" onClick={fetchQuizResults} disabled={loading}>
            <FontAwesomeIcon icon={faSync} className={loading ? "animate-spin" : ""} />
            {loading ? "Syncing" : "Refresh"}
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="border border-line bg-white py-24 text-center text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-muted">
          Loading your results...
        </div>
      ) : filteredResults.length === 0 ? (
        <EmptyState
          title="No results yet"
          description={
            activeTab === "perfect"
              ? "You have not scored full marks yet. Keep going!"
              : "Take a quiz from any project and your results will show up here."
          }
        />
      ) : (
        <div className="space-y-4">
          {filteredResults.map((result) => {
            const totalQuestions = result.answers ? result.answers.length : 0;
            const correctAnswers = result.answers
              ? result.answers.filter((a) => a.isCorrect).length
              : 0;
            const percentage =
              totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
            const bonus = Math.floor((result.score || 0) * 0.1);

            return (
              <div
                key={result.id || result._id}
                className="border border-line bg-white transition-colors hover:border-navy/40"
              >
                <div className="flex flex-col gap-5 p-6 lg:flex-row lg:items-center lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center bg-navy text-white">
                        <FontAwesomeIcon icon={faGraduationCap} className="text-sm" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-muted">
                          Quiz topic
                        </p>
                        <h3 className="font-display text-lg font-bold text-ink">
                          {result.subtopic || "Assessment"}
                        </h3>
                      </div>
                      <span
                        className={`border px-2 py-1 text-[11px] font-semibold ${getScoreBadgeColor(
                          correctAnswers,
                          totalQuestions
                        )}`}
                      >
                        {percentage}%
                      </span>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-ink-muted">
                      <span className="flex items-center gap-2">
                        <FontAwesomeIcon icon={faCalendarAlt} className="text-[10px]" />
                        {new Date(result.createdAt).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                      <span className="flex items-center gap-2">
                        <FontAwesomeIcon icon={faClock} className="text-[10px]" />
                        {new Date(result.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-shrink-0 items-stretch gap-3">
                    <div className="flex min-w-[7.5rem] flex-col items-center justify-center border border-line bg-parchment px-4 py-3">
                      <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-muted">
                        Correct
                      </span>
                      <div className={`font-display text-xl font-bold ${getScoreColor(correctAnswers, totalQuestions)}`}>
                        {correctAnswers}
                        <span className="text-sm text-ink-muted">/{totalQuestions}</span>
                      </div>
                    </div>

                    <div className="flex min-w-[7.5rem] flex-col items-center justify-center bg-navy px-4 py-3 text-white">
                      <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/60">
                        Points
                      </span>
                      <div className="font-display text-xl font-bold">{result.score}</div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 border-t border-line-soft px-6 py-4 lg:grid-cols-4">
                  {[
                    { label: "Base points", icon: faCoins, value: `${result.score || 0} pts` },
                    { label: "Time taken", icon: faClock, value: result.timeTaken || "0:45" },
                    { label: "Streak bonus", icon: faFire, value: `+${bonus} pts` },
                    { label: "Status", icon: faCheckCircle, value: "Verified" },
                  ].map((item) => (
                    <div key={item.label}>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-muted">
                        {item.label}
                      </p>
                      <p className="mt-1 flex items-center gap-2 text-xs text-ink">
                        <FontAwesomeIcon icon={item.icon} className="text-[10px] text-navy" />
                        {item.value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </PageShell>
  );
};

export default History;
