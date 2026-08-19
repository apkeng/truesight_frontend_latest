import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheckCircle,
  faClock,
  faArrowLeft,
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getQuizResults } from "../../../utils/apiServices";
import SkeletonLoading from "../../../components/SkeletonLoading";
import moment from "moment";
import {
  Badge,
  Button,
  EmptyState,
  PageBanner,
  PageShell,
  SectionLabel,
  StatCard,
} from "../../../components/ui";

const QuizResults = () => {
  const navigate = useNavigate();
  const [quizResults, setQuizResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userStats, setUserStats] = useState({
    totalQuizzes: 0,
    averageScore: 0,
    bestScore: 0,
    totalCorrectAnswers: 0,
    totalQuestions: 0,
  });

  useEffect(() => {
    const fetchQuizResults = async () => {
      try {
        setLoading(true);
        const uid = Cookies.get("uid");
        if (!uid) {
          toast.error("User not authenticated");
          setLoading(false);
          return;
        }

        // Fetch quiz results for Level-1 users
        const results = await getQuizResults({ role: "Level-1" });

        // Sort by creation date (newest first)
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

        // Calculate user stats
        if (results.length > 0) {
          const totalQuizzes = results.length;
          let totalScore = 0;
          let bestScore = 0;
          let totalCorrect = 0;
          let totalQuestions = 0;

          results.forEach((result) => {
            const score = result.score || 0;
            const questions = result.answers ? result.answers.length : 5;
            const correct = result.answers
              ? result.answers.filter((a) => a.isCorrect).length
              : score;

            totalScore += score;
            totalCorrect += correct;
            totalQuestions += questions;
            if (score > bestScore) {
              bestScore = score;
            }
          });

          setUserStats({
            totalQuizzes,
            averageScore: totalQuizzes > 0 ? Math.round(totalScore / totalQuizzes) : 0,
            bestScore,
            totalCorrectAnswers: totalCorrect,
            totalQuestions,
          });
        }
      } catch (error) {
        console.error("Error fetching quiz results:", error);
        toast.error("Failed to load quiz results");
      } finally {
        setLoading(false);
      }
    };

    fetchQuizResults();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return moment(dateString).format("MMM DD, YYYY hh:mm A");
  };

  const getScorePercentage = (score, total) => {
    if (total === 0) return 0;
    return Math.round((score / total) * 100);
  };

  // Skeleton loading will be shown inline

  return (
    <PageShell>
      <ToastContainer />

      <PageBanner
        title="Quiz Results"
        subtitle="View quiz performance and track progress across your institute."
        stat={{ value: userStats.totalQuizzes || 0, label: "Quizzes" }}
      />

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <SkeletonLoading key={index} type="card" count={1} />
          ))}
        </div>
      ) : (
        quizResults.length > 0 && (
          <section className="space-y-4">
            <SectionLabel>Summary</SectionLabel>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard label="Total quizzes" value={userStats.totalQuizzes} />
              <StatCard label="Average score" value={userStats.averageScore} />
              <StatCard label="Best score" value={userStats.bestScore} />
              <StatCard
                label="Total correct"
                value={`${userStats.totalCorrectAnswers}/${userStats.totalQuestions}`}
              />
            </div>
          </section>
        )
      )}

      {loading ? (
        <div className="border border-line bg-white">
          <SkeletonLoading type="table" count={5} />
        </div>
      ) : quizResults.length === 0 ? (
        <EmptyState
          title="No quiz results yet"
          description="Once quizzes are completed, the results will be listed here."
          action={
            <Button onClick={() => navigate("/l1dashboard")}>
              <FontAwesomeIcon icon={faArrowLeft} /> Back to dashboard
            </Button>
          }
        />
      ) : (
        <div className="border border-line bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[46rem] border-collapse text-left">
              <thead>
                <tr className="border-b border-line-soft bg-parchment text-[10px] uppercase tracking-[0.16em] text-ink-muted">
                  <th className="px-6 py-3 font-semibold">Topic</th>
                  <th className="px-6 py-3 font-semibold">Score</th>
                  <th className="px-6 py-3 font-semibold">Correct</th>
                  <th className="px-6 py-3 font-semibold">Time taken</th>
                  <th className="px-6 py-3 font-semibold">Date</th>
                  <th className="px-6 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {quizResults.map((result, index) => {
                  const totalQuestions = result.answers ? result.answers.length : 5;
                  const correctAnswers = result.answers
                    ? result.answers.filter((a) => a.isCorrect).length
                    : result.score || 0;
                  const percentage = getScorePercentage(correctAnswers, totalQuestions);

                  return (
                    <tr
                      key={result._id || index}
                      className="border-b border-line-soft last:border-b-0 transition-colors hover:bg-navy-wash/40"
                    >
                      <td className="px-6 py-4 text-sm font-semibold text-ink">
                        {result.subtopic || "Unknown topic"}
                      </td>
                      <td className="px-6 py-4 text-sm text-ink">
                        {result.score || 0}/{totalQuestions}
                        <span className="ml-2 text-xs text-ink-muted">({percentage}%)</span>
                      </td>
                      <td className="px-6 py-4 text-sm text-ink-muted">
                        <span className="flex items-center gap-2">
                          <FontAwesomeIcon icon={faCheckCircle} className="text-[11px] text-emerald-600" />
                          {correctAnswers}/{totalQuestions}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-ink-muted">
                        <span className="flex items-center gap-2">
                          <FontAwesomeIcon icon={faClock} className="text-[11px]" />
                          {result.timeTaken || "N/A"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-ink-muted">
                        {formatDate(result.createdAt)}
                      </td>
                      <td className="px-6 py-4">
                        <Badge
                          tone={
                            percentage >= 80
                              ? "positive"
                              : percentage >= 60
                              ? "warning"
                              : "negative"
                          }
                        >
                          {percentage >= 80
                            ? "Excellent"
                            : percentage >= 60
                            ? "Good"
                            : "Needs work"}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </PageShell>
  );
};

export default QuizResults;
