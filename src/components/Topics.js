import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faPlay, 
  faTrophy, 
  faBookOpen, 
  faChevronRight, 
  faCircleCheck, 
  faCirclePlay,
  faXmark,
  faLightbulb,
  faBrain,
  faGraduationCap,
  faLayerGroup
} from "@fortawesome/free-solid-svg-icons";
import Cookies from "js-cookie";
import { getUser, getStudyPlans, getQuizResults } from "../utils/apiServices";
import Loading from "./Loading";
import clsx from "clsx";

const Topics = () => {
  const [studyPlans, setStudyPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedSubtopic, setExpandedSubtopic] = useState(null);
  const [attemptedTopics, setAttemptedTopics] = useState(new Set());
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const uid = Cookies.get("uid");
        if (!uid) return;

        const userData = await getUser(uid);
        if (!userData || !userData.instituteCode) return;

        const plans = await getStudyPlans({ instituteCode: userData.instituteCode });
        const normalizedPlans = plans.map((plan) => ({
          id: plan._id || plan.id,
          ...plan
        }));
        setStudyPlans(normalizedPlans);
        setLoading(false); // Dismiss loading screen immediately

        // Asynchronously fetch quiz results in the background
        try {
          const quizResults = await getQuizResults({});
          const attempted = new Set();
          quizResults.forEach((result) => {
            if (result.subtopic) attempted.add(result.subtopic);
          });
          setAttemptedTopics(attempted);
        } catch (quizError) {
          console.warn("Non-blocking error fetching quiz results:", quizError);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleStartQuiz = (subtopic, projectTopic) => {
    const quizTopic = encodeURIComponent(subtopic.subtopic);
    const dashboardPath = location.pathname.startsWith('/l2dashboard') ? '/l2dashboard' : '/l1dashboard';
    const query = projectTopic ? `?projectTopic=${encodeURIComponent(projectTopic)}` : "";
    navigate(`${dashboardPath}/quiz/${quizTopic}${query}`);
  };

  if (loading) return <Loading message="Synchronizing Knowledge Matrix..." fullScreen={true} />;

  return (
    <div className="w-full min-h-screen bg-[#f8fafc] p-4 sm:p-6 lg:p-10 font-['Inter']">
      <div className="max-w-7xl mx-auto">
        
        {/* High-Impact Hero Banner */}
        <div className="mb-12">
          <div className="relative bg-gradient-to-br from-indigo-700 via-blue-800 to-slate-900 rounded-[3.5rem] p-10 sm:p-16 text-white shadow-2xl shadow-indigo-100 overflow-hidden group border border-white/10">
            <div className="absolute top-0 right-0 p-16 opacity-10 group-hover:scale-110 transition-transform duration-1000">
              <FontAwesomeIcon icon={faBrain} className="text-[18rem] -rotate-12" />
            </div>
            
            <div className="relative z-10">
              <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-white/10 rounded-full border border-white/10 mb-8 backdrop-blur-md">
                 <FontAwesomeIcon icon={faGraduationCap} className="text-xs text-indigo-300" />
                 <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-50">Academic Command Center</span>
              </div>
              <h1 className="text-5xl sm:text-7xl font-black mb-6 tracking-tight leading-none">Knowledge Grid</h1>
              <p className="text-indigo-100/70 font-medium text-lg max-w-2xl leading-relaxed italic opacity-90">
                 Explore the core intellectual architecture. Each module is synthesized to elevate your cognitive capabilities through rigorous evaluation and conceptual mastery.
              </p>
            </div>

            <div className="absolute bottom-10 right-10 flex gap-4">
               <div className="bg-white/10 backdrop-blur-xl px-8 py-4 rounded-3xl border border-white/10 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-indigo-300">
                     <FontAwesomeIcon icon={faLayerGroup} />
                  </div>
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-indigo-200 opacity-60">Active Plans</p>
                    <p className="text-lg font-black">{studyPlans.length}</p>
                  </div>
               </div>
            </div>
          </div>
        </div>

        {/* Study Plans Grid */}
        {studyPlans.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start animate-in fade-in slide-in-from-bottom-8 duration-700">
            {studyPlans.map((studyPlan, index) => (
              <div key={studyPlan.id} className="group flex flex-col bg-white/40 backdrop-blur-xl border border-white rounded-[3rem] p-8 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
                
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-5">
                    <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-blue-700 rounded-3xl flex items-center justify-center text-white shadow-xl shadow-indigo-100 group-hover:scale-110 transition-transform duration-500">
                       <span className="text-2xl font-black">{index + 1}</span>
                    </div>
                    <div>
                        <h3 className="text-2xl font-black text-slate-800 tracking-tight leading-tight uppercase">{studyPlan.title}</h3>
                        <div className="flex items-center gap-2 mt-1">
                           <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">Curriculum Phase</span>
                        </div>
                    </div>
                  </div>
                </div>

                <p className="text-slate-500 font-medium text-sm leading-relaxed mb-10 italic px-2">
                  {studyPlan.description}
                </p>

                {/* Subtopics Navigator */}
                <div className="space-y-3">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                    <FontAwesomeIcon icon={faBookOpen} /> Knowledge Nodes
                  </h4>
                  {studyPlan.subtopics && studyPlan.subtopics.map((subtopic, subIndex) => {
                    const isAttempted = attemptedTopics.has(subtopic.subtopic);
                    return (
                      <div
                        key={subtopic.id}
                        className="group/node relative flex items-center justify-between p-5 bg-white border border-slate-100 rounded-[2rem] hover:border-indigo-200 hover:bg-slate-50/50 transition-all duration-300"
                      >
                        <div className="flex items-center gap-4 flex-1 min-w-0 pr-4">
                           <div className={clsx(
                             "w-10 h-10 rounded-2xl flex items-center justify-center transition-colors",
                             isAttempted ? "bg-emerald-50 text-emerald-500" : "bg-slate-50 text-slate-400 group-hover/node:bg-indigo-50 group-hover/node:text-indigo-600"
                           )}>
                              <FontAwesomeIcon icon={isAttempted ? faCircleCheck : faCirclePlay} />
                           </div>
                           <span className="text-sm font-black text-slate-700 truncate tracking-tight">{subtopic.subtopic}</span>
                        </div>

                        <div className="flex items-center gap-2">
                           <button
                             onClick={() => setExpandedSubtopic({ ...subtopic, _projectTopic: studyPlan.title })}
                             className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 border border-transparent hover:border-indigo-100 hover:bg-white rounded-xl transition-all"
                           >
                             Intel
                           </button>
                           <button
                             onClick={() => handleStartQuiz(subtopic, studyPlan.title)}
                             className={clsx(
                               "px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-sm",
                               isAttempted 
                                 ? "bg-amber-500 text-white hover:bg-amber-600 shadow-amber-100" 
                                 : "bg-emerald-500 text-white hover:bg-emerald-600 shadow-emerald-100"
                             )}
                           >
                             {isAttempted ? "Re-evaluate" : "Initialize"}
                           </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-40 text-center bg-white/40 backdrop-blur-3xl border border-dashed border-slate-200 rounded-[4rem] animate-in zoom-in duration-700">
             <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 text-slate-200 border border-slate-100 shadow-inner">
                <FontAwesomeIcon icon={faBookOpen} className="text-4xl" />
             </div>
             <h3 className="text-xl font-black text-slate-400 uppercase tracking-widest mb-3">No Plans Synchronized</h3>
             <p className="text-slate-400 font-medium text-sm max-w-sm mx-auto italic">
                Contact your institutional director to initialize your academic curriculum grid.
             </p>
          </div>
        )}
      </div>

      {/* Premium Conceptual Modal */}
      {expandedSubtopic && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 sm:p-10">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-500" onClick={() => setExpandedSubtopic(null)} />
          
          <div className="relative w-full max-w-4xl bg-white rounded-[3.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-12 duration-500 max-h-[85vh] flex flex-col border border-white/20">
            {/* Modal Header */}
            <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-slate-50 p-8 flex items-center justify-between">
               <div className="flex items-center gap-5">
                  <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                     <FontAwesomeIcon icon={faLightbulb} className="text-xl" />
                  </div>
                  <div>
                     <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600 opacity-60">Concept Insight</span>
                     <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase">{expandedSubtopic.subtopic}</h2>
                  </div>
               </div>
               <button 
                  onClick={() => setExpandedSubtopic(null)}
                  className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all active:scale-90 flex items-center justify-center"
               >
                  <FontAwesomeIcon icon={faXmark} className="text-xl" />
               </button>
            </div>

            <div className="flex-1 overflow-y-auto p-10 no-scrollbar">
               <div className="bg-slate-50 rounded-[2.5rem] p-10 mb-10 border border-slate-100">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Module Abstract</h4>
                  <p className="text-lg font-bold text-slate-700 leading-relaxed italic">
                     {expandedSubtopic.description}
                  </p>
               </div>

               <div className="space-y-6">
                  <div className="flex items-center justify-between px-2 mb-4">
                     <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Theoretical Architecture</h4>
                     <button
                        onClick={() => handleStartQuiz(expandedSubtopic, expandedSubtopic._projectTopic)}
                        className={clsx(
                           "px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 flex items-center gap-3",
                           attemptedTopics.has(expandedSubtopic.subtopic)
                             ? "bg-amber-500 text-white shadow-xl shadow-amber-100"
                             : "bg-indigo-600 text-white shadow-xl shadow-indigo-100"
                        )}
                     >
                        <FontAwesomeIcon icon={faPlay} />
                        {attemptedTopics.has(expandedSubtopic.subtopic) ? "Re-evaluate Knowledge" : "Begin Evaluation"}
                     </button>
                  </div>

                  {expandedSubtopic.keyConcepts.map((concept, index) => (
                    <div
                      key={index}
                      className="group/concept relative bg-white border border-slate-100 rounded-[2.5rem] p-8 hover:border-indigo-200 transition-all duration-300 shadow-sm"
                    >
                      <div className="absolute -left-3 top-8 w-6 h-6 bg-slate-900 border-4 border-white rounded-full flex items-center justify-center text-[8px] text-white font-black">
                        {index + 1}
                      </div>
                      <h6 className="text-lg font-black text-slate-800 mb-3 ml-2 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">
                        {concept.concept}
                      </h6>
                      <p className="text-sm text-slate-500 font-medium leading-relaxed italic ml-2">
                        {concept.detailedExplanation}
                      </p>
                    </div>
                  ))}
               </div>
            </div>

            {/* Modal Footer Shadow Effect */}
            <div className="h-10 bg-gradient-to-t from-white to-transparent pointer-events-none sticky bottom-0" />
          </div>
        </div>
      )}
    </div>
  );
};

export default Topics;
