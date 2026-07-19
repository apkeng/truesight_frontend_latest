import React, { useEffect, useMemo, useState } from "react";
import {
  MdStar,
  MdPsychology,
  MdHistory,
  MdEmojiEvents
} from "react-icons/md";
import Cookies from "js-cookie";
import { getUser, getProjects, getStudyPlans, getQuizResults } from "../../../utils/apiServices";
import { FaFileAlt } from "react-icons/fa";
import { SkeletonStatsCard } from "../../../components/SkeletonLoading";
import { useNavigate } from "react-router-dom";
import clsx from "clsx";
import SyllabusMindMap from "../../../components/SyllabusMindMap";

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
        const { score, totalScore, scoreDisplay } = e.detail;
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
    {
      label: "Total Points",
      total: userData?.userPoints || 0,
      icon: <MdStar />,
      bg: "bg-yellow-100",
      iconColor: "text-yellow-600",
    },
    {
      label: "Challenges Taken",
      total: userData?.quizCount || (quizResults?.length || 0),
      icon: <MdHistory />,
      bg: "bg-blue-100",
      iconColor: "text-blue-600",
    },
    {
      label: "Last Score",
      total: lastQuizScore || "---",
      icon: <MdPsychology />,
      bg: "bg-purple-100",
      iconColor: "text-purple-600",
    },
  ], [userData, quizResults, lastQuizScore]);

  if (loading && !userData) {
    return (
      <div className="p-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {Array.from({ length: 4 }).map((_, i) => <SkeletonStatsCard key={i} />)}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
      <div className="w-full">
        {/* Premium Student Hero Banner */}
        <div className="mb-6 mt-4 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="relative bg-gradient-to-br from-indigo-700 via-indigo-800 to-purple-900 rounded-[2rem] p-4 sm:p-6 text-white shadow-2xl shadow-indigo-100 overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform duration-700">
              <MdEmojiEvents className="text-[6rem]" />
            </div>
            
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-black mb-1 tracking-tight">Welcome, {userData?.name?.split(' ')[0] || "Scholar"}!</h1>
                <p className="text-indigo-100/80 font-medium text-[10px] max-w-xl leading-snug">
                  See how you're doing and track your work in one place.
                </p>
              </div>

               <div className="flex items-center gap-2 bg-white/10 backdrop-blur-xl px-4 py-2 rounded-xl border border-white/10">
                 <div className="flex flex-col items-center">
                    <span className="text-lg font-black text-yellow-400">{userData?.userPoints || 0}</span>
                    <span className="text-[7px] font-black uppercase tracking-widest text-indigo-200">TOTAL PTS</span>
                 </div>
              </div>
            </div>
          </div>
        </div>

        {/* Real-time Performance Pulse */}
        <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 px-1">Your Progress</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-12">
          {stats.map((stat, i) => (
            <div key={i} 
              style={{ animationDelay: `${(i + 1) * 100}ms` }}
              className="animate-in fade-in slide-in-from-bottom-4 duration-700 relative group overflow-hidden bg-white rounded-2xl p-4 shadow-sm border border-slate-100 transition-all duration-500 hover:shadow-lg hover:shadow-indigo-50 hover:-translate-y-1"
            >
              <div className="flex items-start justify-between relative z-10">
                <div>
                   <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                   <h3 className="text-2xl font-black text-slate-900 leading-tight">{stat.total}</h3>
                </div>
                <div className={`${stat.bg} ${stat.iconColor} w-10 h-10 rounded-xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-500`}>
                   {React.cloneElement(stat.icon, { className: "w-5 h-5" })}
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2">
                 <div className="flex-1 h-1 bg-slate-50 rounded-full overflow-hidden">
                    <div className="h-full bg-slate-200 w-2/3 group-hover:bg-indigo-300 transition-colors" />
                 </div>
                 <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">LIVE</span>
              </div>
            </div>
          ))}
        </div>

        {/* Syllabus Mind Map Section */}
        <div className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-5 sm:p-7">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg font-black text-slate-900">Syllabus Mind Map</h2>
                <p className="text-slate-400 text-[10px] font-medium mt-0.5">Upload your course syllabus — AI extracts topics and lets you create projects from them.</p>
              </div>
            </div>
            <SyllabusMindMap onProjectCreated={() => navigate("/l2dashboard/project/private-projects")} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="lg:col-span-12 space-y-8">
            {/* Recent Projects Table - High Fidelity */}
            <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-5 sm:p-7">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-10">
                 <div>
                    <h2 className="text-xl font-black text-slate-900 flex items-center gap-3">
                       My Projects
                    </h2>
                    <h2 className="text-slate-400 text-[10px] font-medium mt-1">Check and track your recent work.</h2>
                 </div>
                 <button 
                   onClick={() => navigate("/l2dashboard/project/all-projects")} 
                   className="px-5 py-2.5 bg-slate-900 hover:bg-indigo-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all shadow-md shadow-slate-200"
                 >
                   Explore All Projects
                 </button>
              </div>
              
              <div className="overflow-x-auto no-scrollbar">
                <table className="w-full border-separate border-spacing-y-4">
                  <thead>
                    <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                      <th className="pb-2 px-4 text-left">Project Name</th>
                      <th className="pb-2 px-4 text-left">Level</th>
                      <th className="pb-2 px-4 text-left">Status</th>
                      <th className="pb-2 px-4 text-right">Created By</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentTasks.map((task, i) => (
                      <tr 
                        key={i} 
                        className="group hover:bg-slate-50 transition-all cursor-pointer" 
                        onClick={() => navigate(task.collection === "studyPlans" ? `/l2dashboard/project/all-projects/${task._id}` : `/l2dashboard/project/private-projects/${task._id}`)}
                      >
                        <td className="py-3 px-4 bg-slate-50/50 group-hover:bg-white rounded-l-2xl border-y border-l border-transparent group-hover:border-slate-100 transition-all">
                          <div className="flex items-center gap-3">
                             <div className="w-9 h-9 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform shadow-sm text-xs">
                                <FaFileAlt />
                             </div>
                             <div className="flex flex-col">
                                <span className="text-sm font-black text-slate-800">{task.topic}</span>
                                <span className={clsx(
                                  "text-[8px] font-black uppercase tracking-widest mt-0.5",
                                  task.collection === "studyPlans" ? "text-emerald-500" : "text-amber-500"
                                )}>
                                  {task.collection === "studyPlans" ? "Public" : "Private"}
                                </span>
                             </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 bg-slate-50/50 group-hover:bg-white border-y border-transparent group-hover:border-slate-100 transition-all">
                           <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-2 py-0.5 bg-white border border-slate-100 rounded-full">
                              {task.levelOfLearning?.split(' ')[0] || "Standard"}
                           </span>
                        </td>
                        <td className="py-3 px-4 bg-slate-50/50 group-hover:bg-white border-y border-transparent group-hover:border-slate-100 transition-all">
                           <span className={clsx(
                             "text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border",
                             task.collection === "studyPlans" ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-amber-50 text-amber-600 border-amber-100"
                           )}>
                             {task.collection === "studyPlans" ? "Public" : "Private"}
                           </span>
                        </td>
                        <td className="py-3 px-4 bg-slate-50/50 group-hover:bg-white border-y border-transparent group-hover:border-slate-100 text-right transition-all">
                           <div className="flex flex-col items-end">
                              <span className="text-[10px] font-black text-slate-700">{task.name || "Scholar"}</span>
                              <span className="text-[7px] font-black text-slate-300 uppercase tracking-widest">CONTRIBUTOR</span>
                           </div>
                        </td>
                      </tr>
                    ))}
                    {recentTasks.length === 0 && (
                      <tr>
                        <td colSpan="3" className="py-20 text-center text-[10px] uppercase font-black text-slate-300 tracking-[0.3em]">No active workspace files found</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;
