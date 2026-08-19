import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faPlay, 
  faBookOpen, 
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
          <div className="relative bg-navy  p-10 sm:p-16 text-white   overflow-hidden group border border-white/10">
            <div className="absolute top-0 right-0 p-16 opacity-10 group-hover:scale-110 transition-transform duration-1000">
              <FontAwesomeIcon icon={faBrain} className="text-[18rem] -rotate-12" />
            </div>
            
            <div className="relative z-10">
              <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-white/10 rounded-full border border-white/10 mb-8 ">
                 <FontAwesomeIcon icon={faGraduationCap} className="text-xs text-indigo-300" />
                 <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-indigo-50">Academic Command Center</span>
              </div>
              <h1 className="text-5xl sm:text-7xl font-semibold mb-6 tracking-tight leading-none">Knowledge Grid</h1>
              <p className="text-indigo-100/70 font-medium text-lg max-w-2xl leading-relaxed italic opacity-90">
                 Explore the core intellectual architecture. Each module is synthesized to elevate your cognitive capabilities through rigorous evaluation and conceptual mastery.
              </p>
            </div>

            <div className="absolute bottom-10 right-10 flex gap-4">
               <div className="bg-white/10  px-8 py-4  border border-white/10 flex items-center gap-4">
                  <div className="w-10 h-10  bg-navy-wash0/20 flex items-center justify-center text-indigo-300">
                     <FontAwesomeIcon icon={faLayerGroup} />
                  </div>
                  <div>
                    <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-indigo-200 opacity-60">Active Plans</p>
                    <p className="text-lg font-semibold">{studyPlans.length}</p>
                  </div>
               </div>
            </div>
          </div>
        </div>

        {/* Study Plans Grid */}
        {studyPlans.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start animate-in fade-in slide-in-from-bottom-8 duration-700">
            {studyPlans.map((studyPlan, index) => (
              <div key={studyPlan.id} className="group flex flex-col bg-white/40  border border-white  p-8  hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
                
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-5">
                    <div className="w-16 h-16 bg-navy  flex items-center justify-center text-white   group-hover:scale-110 transition-transform duration-500">
                       <span className="text-2xl font-semibold">{index + 1}</span>
                    </div>
                    <div>
                        <h3 className="text-2xl font-semibold text-ink tracking-tight leading-tight uppercase">{studyPlan.title}</h3>
                        <div className="flex items-center gap-2 mt-1">
                           <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-navy bg-navy-wash px-2 py-0.5 ">Curriculum Phase</span>
                        </div>
                    </div>
                  </div>
                </div>

                <p className="text-ink-muted font-medium text-sm leading-relaxed mb-10 italic px-2">
                  {studyPlan.description}
                </p>

                {/* Subtopics Navigator */}
                <div className="space-y-3">
                  <h4 className="text-[10px] font-semibold text-ink-muted uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                    <FontAwesomeIcon icon={faBookOpen} /> Knowledge Nodes
                  </h4>
                  {studyPlan.subtopics && studyPlan.subtopics.map((subtopic, subIndex) => {
                    const isAttempted = attemptedTopics.has(subtopic.subtopic);
                    return (
                      <div
                        key={subtopic.id}
                        className="group/node relative flex items-center justify-between p-5 bg-white border border-line  hover:border-navy/15 hover:bg-parchment/50 transition-all duration-300"
                      >
                        <div className="flex items-center gap-4 flex-1 min-w-0 pr-4">
                           <div className={clsx(
                             "w-10 h-10  flex items-center justify-center transition-colors",
                             isAttempted ? "bg-emerald-50 text-emerald-500" : "bg-parchment text-ink-muted group-hover/node:bg-navy-wash group-hover/node:text-navy"
                           )}>
                              <FontAwesomeIcon icon={isAttempted ? faCircleCheck : faCirclePlay} />
                           </div>
                           <span className="text-sm font-semibold text-ink truncate tracking-tight">{subtopic.subtopic}</span>
                        </div>

                        <div className="flex items-center gap-2">
                           <button
                             onClick={() => setExpandedSubtopic({ ...subtopic, _projectTopic: studyPlan.title })}
                             className="px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-muted hover:text-navy border border-transparent hover:border-navy/15 hover:bg-white  transition-all"
                           >
                             Intel
                           </button>
                           <button
                             onClick={() => handleStartQuiz(subtopic, studyPlan.title)}
                             className={clsx(
                               "px-6 py-2.5  text-[10px] font-semibold uppercase tracking-[0.14em] transition-all active:scale-95 ",
                               isAttempted 
                                 ? "bg-amber-500 text-white hover:bg-amber-600 " 
                                 : "bg-emerald-500 text-white hover:bg-emerald-600 "
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
          <div className="py-40 text-center bg-white/40  border border-dashed border-line  animate-in zoom-in duration-700">
             <div className="w-24 h-24 bg-parchment  flex items-center justify-center mx-auto mb-8 text-slate-200 border border-line ">
                <FontAwesomeIcon icon={faBookOpen} className="text-4xl" />
             </div>
             <h3 className="text-xl font-semibold text-ink-muted uppercase tracking-[0.14em] mb-3">No Plans Synchronized</h3>
             <p className="text-ink-muted font-medium text-sm max-w-sm mx-auto italic">
                Contact your institutional director to initialize your academic curriculum grid.
             </p>
          </div>
        )}
      </div>

      {/* Premium Conceptual Modal */}
      {expandedSubtopic && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 sm:p-10">
          <div className="absolute inset-0 bg-navy/60  animate-in fade-in duration-500" onClick={() => setExpandedSubtopic(null)} />
          
          <div className="relative w-full max-w-4xl bg-white   overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-12 duration-500 max-h-[85vh] flex flex-col border border-white/20">
            {/* Modal Header */}
            <div className="sticky top-0 z-20 bg-white/80  border-b border-line p-8 flex items-center justify-between">
               <div className="flex items-center gap-5">
                  <div className="w-12 h-12 bg-navy-wash  flex items-center justify-center text-navy">
                     <FontAwesomeIcon icon={faLightbulb} className="text-xl" />
                  </div>
                  <div>
                     <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-navy opacity-60">Concept Insight</span>
                     <h2 className="text-2xl font-semibold text-ink tracking-tight uppercase">{expandedSubtopic.subtopic}</h2>
                  </div>
               </div>
               <button 
                  onClick={() => setExpandedSubtopic(null)}
                  className="w-12 h-12  bg-parchment text-ink-muted hover:bg-parchment hover:text-ink-muted transition-all active:scale-90 flex items-center justify-center"
               >
                  <FontAwesomeIcon icon={faXmark} className="text-xl" />
               </button>
            </div>

            <div className="flex-1 overflow-y-auto p-10 no-scrollbar">
               <div className="bg-parchment  p-10 mb-10 border border-line">
                  <h4 className="text-[10px] font-semibold text-ink-muted uppercase tracking-[0.14em] mb-4">Module Abstract</h4>
                  <p className="text-lg font-bold text-ink leading-relaxed italic">
                     {expandedSubtopic.description}
                  </p>
               </div>

               <div className="space-y-6">
                  <div className="flex items-center justify-between px-2 mb-4">
                     <h4 className="text-[10px] font-semibold text-ink-muted uppercase tracking-[0.3em]">Theoretical Architecture</h4>
                     <button
                        onClick={() => handleStartQuiz(expandedSubtopic, expandedSubtopic._projectTopic)}
                        className={clsx(
                           "px-8 py-3  text-[10px] font-semibold uppercase tracking-[0.14em] transition-all active:scale-95 flex items-center gap-3",
                           attemptedTopics.has(expandedSubtopic.subtopic)
                             ? "bg-amber-500 text-white  "
                             : "bg-navy text-white  "
                        )}
                     >
                        <FontAwesomeIcon icon={faPlay} />
                        {attemptedTopics.has(expandedSubtopic.subtopic) ? "Re-evaluate Knowledge" : "Begin Evaluation"}
                     </button>
                  </div>

                  {expandedSubtopic.keyConcepts.map((concept, index) => (
                    <div
                      key={index}
                      className="group/concept relative bg-white border border-line  p-8 hover:border-navy/15 transition-all duration-300 "
                    >
                      <div className="absolute -left-3 top-8 w-6 h-6 bg-navy border-4 border-white rounded-full flex items-center justify-center text-[8px] text-white font-semibold">
                        {index + 1}
                      </div>
                      <h6 className="text-lg font-semibold text-ink mb-3 ml-2 group-hover:text-navy transition-colors uppercase tracking-tight">
                        {concept.concept}
                      </h6>
                      <p className="text-sm text-ink-muted font-medium leading-relaxed italic ml-2">
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
