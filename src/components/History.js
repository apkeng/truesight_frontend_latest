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
  faHistory,
  faTrophy,
  faMagicWandSparkles,
  faChartLine
} from "@fortawesome/free-solid-svg-icons";
import Cookies from "js-cookie";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getQuizResults } from "../utils/apiServices";

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
      <ToastContainer autoClose={2000} />
      
      {/* Premium Hero Banner */}
      <div className="mb-6 mt-4">
        <div className="relative bg-gradient-to-br from-indigo-700 via-indigo-800 to-violet-900 rounded-[2rem] p-4 sm:p-6 text-white shadow-xl overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform duration-700">
            <FontAwesomeIcon icon={faHistory} className="text-[6rem]" />
          </div>
          
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-2 py-0.5 bg-white/10 rounded-full border border-white/10 mb-2 backdrop-blur-md">
                 <FontAwesomeIcon icon={faTrophy} className="text-[8px] text-indigo-200" />
                 <span className="text-[8px] font-black uppercase tracking-widest text-indigo-50">Performance Log</span>
              </div>
              <h1 className="text-lg sm:text-xl font-black mb-1 tracking-tight">Academic History</h1>
              <p className="text-indigo-100/80 font-medium text-[10px] max-w-lg leading-snug italic truncate">
                 Track your intellectual progression and analyze your growth.
              </p>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={fetchQuizResults}
                disabled={loading}
                className="bg-white px-4 py-2 rounded-xl text-slate-900 font-black text-[10px] transition-all hover:scale-105 active:scale-95 shadow-lg flex items-center gap-2"
              >
                <FontAwesomeIcon icon={faSync} className={loading ? "animate-spin" : ""} />
                <span>{loading ? "Syncing..." : "Refresh"}</span>
              </button>
              
              <div className="bg-white/10 backdrop-blur-xl px-4 py-2 rounded-xl border border-white/10 flex flex-col items-center">
                 <span className="text-lg font-black">{quizResults.length}</span>
                 <span className="text-[7px] font-black uppercase tracking-widest text-indigo-100">Assessments</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* View Filters & Summary */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-5 mb-8 animate-in fade-in slide-in-from-top-4 duration-1000">
        <div className="flex items-center gap-2.5 p-1.5 bg-white border border-slate-100 rounded-[2rem] shadow-sm">
          {[
            { id: "all", label: "Comprehensive Feed", icon: faHistory },
            { id: "perfect", label: "Excellence Record", icon: faCheckCircle },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2.5 rounded-2xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${
                activeTab === tab.id
                  ? "bg-slate-900 text-white shadow-md"
                  : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
              }`}
            >
              <FontAwesomeIcon icon={tab.icon} className="text-[10px]" />
              {tab.label}
            </button>
          ))}
        </div>
        
        <div className="flex items-center gap-6 px-6 py-3.5 bg-slate-50 border border-slate-100 rounded-[2rem] shadow-inner">
          <div className="flex flex-col items-center border-r border-slate-200 pr-6">
             <span className="text-md font-black text-slate-800 leading-none">
                {Math.round(quizResults.reduce((acc, curr) => acc + (curr.score || 0), 0) / (quizResults.length || 1))}
             </span>
             <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 mt-1">Avg Points</span>
          </div>
          <div className="flex items-center gap-2.5">
             <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-emerald-500 shadow-sm border border-slate-100 text-xs">
                <FontAwesomeIcon icon={faChartLine} />
             </div>
             <div className="flex flex-col">
                 <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 leading-none">Activity Report</span>
                 <span className="text-[9px] font-black text-emerald-600 uppercase mt-0.5">Real-time Verified</span>
             </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="py-32 flex flex-col items-center gap-6 animate-pulse">
           <div className="w-20 h-20 rounded-[2rem] bg-slate-100 border-4 border-slate-50 border-t-indigo-500 animate-spin" />
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Accessing Academic Archives...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
          {filteredResults.length > 0 ? (
            filteredResults.map((result) => {
              const totalQuestions = result.answers ? result.answers.length : 0;
              const correctAnswers = result.answers ? result.answers.filter(a => a.isCorrect).length : 0;
              const percentage = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
              const bonus = Math.floor((result.score || 0) * 0.1);
              
              return (
                <div
                  key={result.id || result._id}
                  className="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-6 md:p-8 hover:shadow-xl hover:shadow-indigo-50 transition-all duration-500 group relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                  
                  <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-11 h-11 rounded-xl bg-slate-50 flex items-center justify-center text-indigo-600 border border-slate-100 shadow-inner group-hover:scale-110 transition-transform">
                          <FontAwesomeIcon icon={faGraduationCap} className="text-lg" />
                        </div>
                        <div>
                          <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mb-0.5">Assessment Topic</p>
                          <h3 className="text-xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors tracking-tight">
                             {result.subtopic || "Institutional Evaluation"}
                          </h3>
                        </div>
                        <div className={`ml-3 px-3 py-1 rounded-xl border font-black text-xs ${getScoreBadgeColor(correctAnswers, totalQuestions)}`}>
                          {percentage}%
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-5">
                        <div className="flex items-center gap-2">
                           <FontAwesomeIcon icon={faCalendarAlt} className="text-slate-300 text-[10px]" />
                           <span className="text-[11px] font-bold text-slate-600">{new Date(result.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        </div>
                        <div className="flex items-center gap-2">
                           <FontAwesomeIcon icon={faClock} className="text-slate-300 text-[10px]" />
                           <span className="text-[11px] font-bold text-slate-600">{new Date(result.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <div className="flex items-center gap-2">
                           <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                           <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Validated Entry</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row items-stretch gap-3">
                       <div className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100 flex flex-col items-center justify-center min-w-[120px]">
                          <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Raw Accuracy</span>
                          <div className={`text-2xl font-black ${getScoreColor(correctAnswers, totalQuestions)}`}>
                            {correctAnswers}<span className="text-slate-300 text-sm">/{totalQuestions}</span>
                          </div>
                       </div>
                       
                       <div className="bg-indigo-600 rounded-2xl p-4 shadow-lg shadow-indigo-100 flex flex-col items-center justify-center min-w-[120px] text-white overflow-hidden relative group/inner">
                          <FontAwesomeIcon icon={faTrophy} className="absolute -bottom-1 -right-1 text-3xl opacity-10 group-hover/inner:rotate-12 transition-transform" />
                          <span className="text-[8px] font-black text-indigo-100/60 uppercase tracking-widest relative z-10">Reward Total</span>
                          <div className="text-2xl font-black relative z-10 flex items-baseline gap-1">
                             {result.score}
                             <span className="text-[10px] text-indigo-200">pts</span>
                          </div>
                       </div>
                    </div>
                  </div>

                  <div className="mt-8 pt-8 border-t border-slate-50 grid grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="space-y-1">
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Base Computation</p>
                      <div className="flex items-center gap-2">
                         <div className="w-5 h-5 rounded-lg bg-yellow-50 text-yellow-600 flex items-center justify-center text-[8px]">
                            <FontAwesomeIcon icon={faCoins} />
                         </div>
                         <span className="text-[11px] font-black text-slate-800">{result.score || 0} Points</span>
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Efficiency Time</p>
                      <div className="flex items-center gap-2">
                         <div className="w-5 h-5 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-[8px]">
                            <FontAwesomeIcon icon={faClock} />
                         </div>
                         <span className="text-[11px] font-black text-slate-800">{result.timeTaken || "0:45"} Duration</span>
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Streak Incentive</p>
                      <div className="flex items-center gap-2">
                         <div className="w-5 h-5 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center text-[8px]">
                            <FontAwesomeIcon icon={faFire} />
                         </div>
                         <span className="text-[11px] font-black text-slate-800">+{bonus} Points</span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Verification</p>
                      <div className="flex items-center gap-2">
                         <div className="w-5 h-5 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center text-[8px]">
                            <FontAwesomeIcon icon={faCheckCircle} />
                         </div>
                         <span className="text-[10px] font-black text-emerald-600 uppercase tracking-tighter">Authenticated</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-32 text-center bg-white rounded-[3rem] border border-slate-100 shadow-sm relative overflow-hidden group">
               <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
               <div className="relative z-10 flex flex-col items-center max-w-sm mx-auto">
                  <div className="w-20 h-20 bg-indigo-50 rounded-3xl flex items-center justify-center mb-6 text-indigo-600 transition-transform group-hover:scale-110 duration-500 shadow-inner">
                    <FontAwesomeIcon icon={faMagicWandSparkles} className="text-3xl" />
                  </div>
                  <h3 className="text-xl font-black text-slate-900 mb-2 tracking-tight">Records Empty</h3>
                  <p className="text-slate-500 font-medium text-sm mb-8 leading-relaxed">
                    {activeTab === "perfect" 
                      ? "You haven't achieved a 100% excellence record yet. Keep evaluating your skills!" 
                      : "No intellectual assessments have been recorded for this account. Initiate a project quiz to begin."}
                  </p>
               </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default History;
