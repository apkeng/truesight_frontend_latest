import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheckCircle,
  faTimesCircle,
  faClock,
  faTrophy,
  faArrowLeft,
  faChartLine,
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getQuizResults } from "../../../utils/apiServices";
import SkeletonLoading from "../../../components/SkeletonLoading";
import moment from "moment";

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
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
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
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <ToastContainer />
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <button
              onClick={() => navigate("/l1dashboard")}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors mb-4"
            >
              <FontAwesomeIcon icon={faArrowLeft} />
              <span>Back to Dashboard</span>
            </button>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
              Quiz Results
            </h1>
            <p className="text-gray-600">
              View your quiz performance and track your progress
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {Array.from({ length: 4 }).map((_, index) => (
              <SkeletonLoading key={index} type="card" count={1} />
            ))}
          </div>
        ) : quizResults.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <FontAwesomeIcon
                  icon={faTrophy}
                  className="text-2xl text-blue-600"
                />
              </div>
              <div className="text-3xl font-bold text-gray-800">
                {userStats.totalQuizzes}
              </div>
              <div className="text-sm text-gray-600">Total Quizzes</div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <FontAwesomeIcon
                  icon={faChartLine}
                  className="text-2xl text-green-600"
                />
              </div>
              <div className="text-3xl font-bold text-gray-800">
                {userStats.averageScore}
              </div>
              <div className="text-sm text-gray-600">Average Score</div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <FontAwesomeIcon
                  icon={faTrophy}
                  className="text-2xl text-yellow-600"
                />
              </div>
              <div className="text-3xl font-bold text-gray-800">
                {userStats.bestScore}
              </div>
              <div className="text-sm text-gray-600">Best Score</div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <FontAwesomeIcon
                  icon={faCheckCircle}
                  className="text-2xl text-purple-600"
                />
              </div>
              <div className="text-3xl font-bold text-gray-800">
                {userStats.totalCorrectAnswers}/{userStats.totalQuestions}
              </div>
              <div className="text-sm text-gray-600">Total Correct</div>
            </div>
          </div>
        )}

        {/* Quiz Results List */}
        {loading ? (
          <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
            <SkeletonLoading type="table" count={5} />
          </div>
        ) : quizResults.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-12 text-center">
            <FontAwesomeIcon
              icon={faTrophy}
              className="text-6xl text-gray-300 mb-4"
            />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No Quiz Results Yet
            </h3>
            <p className="text-gray-500 mb-6">
              Complete some quizzes to see your results here
            </p>
            <button
              onClick={() => navigate("/l1dashboard")}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all"
            >
              <FontAwesomeIcon icon={faArrowLeft} />
              Back to Dashboard
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Topic
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Score
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Correct Answers
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Time Taken
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {quizResults.map((result, index) => {
                    const totalQuestions = result.answers
                      ? result.answers.length
                      : 5;
                    const correctAnswers = result.answers
                      ? result.answers.filter((a) => a.isCorrect).length
                      : result.score || 0;
                    const percentage = getScorePercentage(
                      correctAnswers,
                      totalQuestions
                    );

                    return (
                      <tr
                        key={result._id || index}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {result.subtopic || "Unknown Topic"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-gray-900">
                              {result.score || 0}/{totalQuestions}
                            </span>
                            <span className="text-xs text-gray-500">
                              ({percentage}%)
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <FontAwesomeIcon
                              icon={faCheckCircle}
                              className="text-green-600"
                            />
                            <span className="text-sm text-gray-900">
                              {correctAnswers}/{totalQuestions}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <FontAwesomeIcon
                              icon={faClock}
                              className="text-gray-400"
                            />
                            <span className="text-sm text-gray-900">
                              {result.timeTaken || "N/A"}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {formatDate(result.createdAt)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              percentage >= 80
                                ? "bg-green-100 text-green-800"
                                : percentage >= 60
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {percentage >= 80
                              ? "Excellent"
                              : percentage >= 60
                              ? "Good"
                              : "Needs Improvement"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizResults;
