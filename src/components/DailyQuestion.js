import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faQuestionCircle,
  faCheckCircle,
  faTimesCircle,
  faCoins,
  faSpinner,
  faStar
} from "@fortawesome/free-solid-svg-icons";
import Cookies from "js-cookie";
import { getCurrentDailyQuestion, submitDailyQuestionAnswer, getDailyQuestionAttemptStatus } from "../utils/apiServices";

const DailyQuestion = () => {
  const [question, setQuestion] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [correctAnswer, setCorrectAnswer] = useState("");
  const [coinsAwarded, setCoinsAwarded] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [hasAttempted, setHasAttempted] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [showCoins, setShowCoins] = useState(false);

  useEffect(() => {
    const uid = Cookies.get("uid");
    setIsLoggedIn(!!uid);
    fetchQuestion();
  }, []);

  const fetchQuestion = async () => {
    try {
      setLoading(true);
      const uid = Cookies.get("uid");
      
      // Fetch current question
      const questionData = await getCurrentDailyQuestion();
      setQuestion(questionData);

      // If user is logged in, check if they've already attempted
      if (uid) {
        try {
          const attemptStatus = await getDailyQuestionAttemptStatus();
          if (attemptStatus.hasAttempted) {
            setHasAttempted(true);
            setSubmitted(true);
            setIsCorrect(attemptStatus.attempt.isCorrect);
            setSelectedAnswer(attemptStatus.attempt.answer);
            setCorrectAnswer(attemptStatus.correctAnswer || attemptStatus.attempt.answer);
            setCoinsAwarded(attemptStatus.attempt.coinsAwarded || 0);
          }
        } catch (error) {
          console.error("Error checking attempt status:", error);
        }
      }
    } catch (error) {
      console.error("Error fetching daily question:", error);
      // Silently handle error - show empty state instead
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (answer) => {
    if (!submitted && !hasAttempted) {
      setSelectedAnswer(answer);
    }
  };

  const handleSubmit = async () => {
    if (!selectedAnswer) {
      return;
    }

    if (submitted || hasAttempted) {
      return;
    }

    try {
      setSubmitting(true);
      const result = await submitDailyQuestionAnswer(selectedAnswer);

      setSubmitted(true);
      setIsCorrect(result.isCorrect);
      setCorrectAnswer(result.correctAnswer);
      setCoinsAwarded(result.coinsAwarded || 0);
      setHasAttempted(result.hasAttempted);

      // Show result with animation
      setTimeout(() => {
        setShowResult(true);
        if (result.isCorrect && result.coinsAwarded > 0) {
          setTimeout(() => {
            setShowCoins(true);
          }, 300);
        }
      }, 100);
    } catch (error) {
      console.error("Error submitting answer:", error);
      setSubmitting(false);
    } finally {
      setSubmitting(false);
    }
  };


  if (loading) {
    return (
      <div className="backdrop-blur-xl bg-white/30 rounded-2xl shadow-xl border border-white/20 p-6 md:p-8 animate-fadeIn">
        <div className="flex flex-col items-center justify-center py-12 gap-4">
          <div className="relative">
            <FontAwesomeIcon icon={faSpinner} className="w-10 h-10 text-blue-600 animate-spin" />
            <div className="absolute inset-0 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
          <p className="text-gray-600 font-medium">Loading today's question...</p>
        </div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="backdrop-blur-xl bg-white/30 rounded-2xl shadow-xl border border-white/20 p-6 md:p-8 animate-fadeIn">
        <div className="text-center py-12">
          <FontAwesomeIcon icon={faQuestionCircle} className="w-16 h-16 text-gray-300 mb-4" />
          <p className="text-gray-600 font-medium">No daily question available at the moment.</p>
          <p className="text-sm text-gray-500 mt-2">Please check back later!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="backdrop-blur-xl bg-white/50 rounded-[2rem] shadow-xl border border-slate-100/80 p-5 md:p-6 hover:bg-white/60 transition-all duration-500 ease-out animate-fadeIn w-full">
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.1);
          }
        }
        @keyframes coinSpin {
          from {
            transform: rotate(0deg) scale(1);
          }
          50% {
            transform: rotate(180deg) scale(1.2);
          }
          to {
            transform: rotate(360deg) scale(1);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
        .animate-slideIn {
          animation: slideIn 0.4s ease-out;
        }
        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out;
        }
        .animate-pulse-slow {
          animation: pulse 2s ease-in-out infinite;
        }
        .animate-coinSpin {
          animation: coinSpin 0.8s ease-out;
        }
      `}</style>
      
      {/* Header */}
      <div className="flex items-center gap-3 mb-4 animate-slideIn">
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform duration-300">
          <FontAwesomeIcon icon={faQuestionCircle} className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg md:text-xl font-extrabold text-slate-800 flex items-center gap-2">
            Daily Question
            <span className="text-[10px] bg-gradient-to-r from-blue-500 to-purple-600 text-white px-2 py-0.5 rounded-full font-bold">
              NEW
            </span>
          </h3>
          <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5 font-medium">
            <FontAwesomeIcon icon={faCoins} className="w-3 h-3 text-yellow-500" />
            Earn 5 coins for correct answers!
          </p>
        </div>
      </div>

      {/* Question */}
      <div className="mb-4 animate-fadeIn">
        <div className="bg-gradient-to-r from-blue-50/50 to-indigo-50/50 rounded-xl p-3.5 mb-3 border-l-4 border-blue-500">
          <p className="text-base md:text-lg font-bold text-slate-800 leading-relaxed">
            {question.question}
          </p>
        </div>

        {/* Options (2x2 Grid on wider screens) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {question.options.map((option, index) => {
            const isSelected = selectedAnswer === option;
            const isCorrectOption = submitted && option === correctAnswer;
            const isWrongOption = submitted && isSelected && !isCorrect;

            let optionClasses = "w-full p-3 rounded-xl border-2 transition-all duration-300 text-left transform ";
            
            if (submitted || hasAttempted) {
              if (isCorrectOption) {
                optionClasses += "bg-gradient-to-r from-green-50/50 to-emerald-50/50 border-green-500 text-green-800 shadow-md scale-102";
              } else if (isWrongOption) {
                optionClasses += "bg-gradient-to-r from-red-50/50 to-rose-50/50 border-red-500 text-red-800";
              } else {
                optionClasses += "bg-gray-50/50 border-gray-300 text-gray-600 opacity-60";
              }
            } else {
              if (isSelected) {
                optionClasses += "bg-gradient-to-r from-blue-100 to-indigo-100 border-blue-500 text-blue-800 font-semibold shadow-md scale-102 hover:scale-102";
              } else {
                optionClasses += "bg-white/70 border-gray-200 text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:border-blue-400 hover:shadow-md hover:scale-102 cursor-pointer";
              }
            }

            return (
              <button
                key={index}
                onClick={() => handleAnswerSelect(option)}
                disabled={submitted || hasAttempted}
                className={`${optionClasses} ${!submitted && !hasAttempted ? 'hover:transform hover:scale-[1.01]' : ''}`}
                style={{
                  animationDelay: `${index * 0.05}s`,
                }}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                    isSelected 
                      ? "bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg scale-105" 
                      : submitted && isCorrectOption
                      ? "bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-lg"
                      : submitted && isWrongOption
                      ? "bg-gradient-to-br from-red-500 to-rose-600 text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}>
                    {String.fromCharCode(65 + index)}
                  </div>
                  <span className="flex-1 text-left text-xs md:text-sm">{option}</span>
                  {submitted && isCorrectOption && (
                    <FontAwesomeIcon 
                      icon={faCheckCircle} 
                      className="ml-auto text-green-600 text-lg animate-scaleIn" 
                    />
                  )}
                  {submitted && isWrongOption && (
                    <FontAwesomeIcon 
                      icon={faTimesCircle} 
                      className="ml-auto text-red-600 text-lg animate-scaleIn" 
                    />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Submit Button or Result */}
      {!submitted && !hasAttempted ? (
        <button
          onClick={handleSubmit}
          disabled={!selectedAnswer || submitting}
          className="w-full py-3 px-5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white rounded-xl font-bold hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transform hover:scale-[1.01] active:scale-[0.99] relative overflow-hidden group text-sm"
        >
          <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></span>
          {submitting ? (
            <>
              <FontAwesomeIcon icon={faSpinner} className="animate-spin text-base" />
              <span>Submitting...</span>
            </>
          ) : (
            <>
              <span>Submit Answer</span>
              <FontAwesomeIcon icon={faCheckCircle} className="text-xs" />
            </>
          )}
        </button>
      ) : (
        <div className={`space-y-3 ${showResult ? 'animate-slideIn' : 'opacity-0'}`}>
          {/* Result Message */}
          <div className={`p-4 rounded-xl border-2 transform transition-all duration-500 ${
            isCorrect 
              ? "bg-gradient-to-r from-green-50/50 to-emerald-50/50 border-green-500 shadow-md scale-100" 
              : "bg-gradient-to-r from-red-50/50 to-rose-50/50 border-red-500 shadow-md scale-100"
          } ${showResult ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                isCorrect 
                  ? "bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg animate-pulse-slow" 
                  : "bg-gradient-to-br from-red-500 to-rose-600 shadow-lg"
              }`}>
                <FontAwesomeIcon 
                  icon={isCorrect ? faCheckCircle : faTimesCircle} 
                  className="text-xl text-white"
                />
              </div>
              <div className="flex-1">
                <p className={`text-base font-extrabold ${isCorrect ? "text-green-800" : "text-red-800"}`}>
                  {isCorrect ? "🎉 Excellent! Correct Answer!" : "❌ Incorrect Answer"}
                </p>
                {!isCorrect && (
                  <p className="text-xs text-red-700 mt-1">
                    The correct answer is: <strong className="text-red-900">{correctAnswer}</strong>
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Coins Awarded */}
          {isCorrect && coinsAwarded > 0 && (
            <div className={`p-4 rounded-xl bg-gradient-to-r from-yellow-50/50 via-amber-50/50 to-yellow-50/50 border-2 border-yellow-400 shadow-md transform transition-all duration-500 ${
              showCoins ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-4'
            }`}>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center shadow-lg animate-coinSpin">
                    <FontAwesomeIcon icon={faCoins} className="text-lg text-white" />
                  </div>
                  <div className="absolute -top-0.5 -right-0.5">
                    <FontAwesomeIcon icon={faStar} className="text-yellow-400 text-xs animate-pulse-slow" />
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-base font-extrabold text-yellow-900 flex items-center gap-1.5">
                    <span>You earned {coinsAwarded} coins!</span>
                    <span className="text-xl">🎊</span>
                  </p>
                  <p className="text-xs text-yellow-700">
                    Coins have been added to your account
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Already Attempted Message */}
          {hasAttempted && (
            <div className="text-center p-3 rounded-xl bg-gradient-to-r from-gray-50/50 to-slate-50/50 border border-slate-200">
              <p className="text-xs text-slate-500 flex items-center justify-center gap-2 font-medium">
                <FontAwesomeIcon icon={faCheckCircle} className="text-slate-400" />
                <span>You've already attempted today's question. Come back tomorrow for a new challenge! 🌟</span>
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DailyQuestion;
