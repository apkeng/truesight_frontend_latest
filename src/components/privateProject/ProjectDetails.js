import clsx from "clsx";
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Loading from "../Loading";
import { ToastContainer } from "react-toastify";
import { getProjectById, getQuizResults } from "../../utils/apiServices";
import TopicItem from "../task/TopicItem";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faChevronLeft,
  faKeyboard,
  faShieldHalved,
  faCircleUp,
  faCheckCircle
} from "@fortawesome/free-solid-svg-icons";

const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(false);
  const [attemptedTopics, setAttemptedTopics] = useState(new Set());
  const [selectedTopicIndex, setSelectedTopicIndex] = useState(0);

  useEffect(() => {
    const fetchTask = async () => {
      setLoading(true);
      try {
        if (!id) return;

        // Fetch private project first to render the layout instantly
        const taskData = await getProjectById(id);
        if (taskData) {
          setTask(taskData);
        }
        setLoading(false); // Dismiss loading screen immediately

        // Fetch quiz results in the background asynchronously
        try {
          const quizResults = await getQuizResults({ role: "Level-2" });
          if (quizResults && Array.isArray(quizResults)) {
            const attempted = new Set(quizResults.map(r => r.subtopic));
            setAttemptedTopics(attempted);
          }
        } catch (quizError) {
          console.warn("Non-blocking error fetching quiz results:", quizError);
        }
      } catch (error) {
        console.error("Error fetching project:", error);
        setLoading(false);
      }
    };

    fetchTask();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-20">
        <Loading message="Syncing private workspace..." fullScreen={true} />
      </div>
    );
  }

  if (!task) return (
     <div className="min-h-[60vh] flex flex-col items-center justify-center p-20">
        <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-200 border border-slate-100 mb-6">
           <FontAwesomeIcon icon={faShieldHalved} className="text-3xl" />
        </div>
        <h2 className="text-xs font-black text-slate-300 uppercase tracking-[0.2em]">Record Encrypted or Missing</h2>
        <button onClick={() => navigate(-1)} className="mt-8 px-6 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all">
           Back to Safety
        </button>
     </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-in fade-in duration-1000">
      <ToastContainer autoClose={2000} />

      {/* Navigation Layer */}
      <div className="flex items-center justify-between mb-8 group/nav">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-white/40 backdrop-blur-md border border-white text-slate-600 font-black text-[10px] uppercase tracking-widest shadow-sm hover:shadow-xl hover:bg-white transition-all active:scale-95"
        >
          <FontAwesomeIcon icon={faChevronLeft} className="group-hover/nav:-translate-x-1 transition-transform" />
          Secure Exit
        </button>
        {/* Premium Private Hero Banner */}
      <div className="relative mb-6">
        <div className="relative bg-gradient-to-br from-purple-800 via-indigo-900 to-slate-950 rounded-2xl p-3 lg:p-4 text-white shadow-xl overflow-hidden group border border-white/5">
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform duration-1000">
            <FontAwesomeIcon icon={faShieldHalved} className="text-[6rem] -rotate-12" />
          </div>
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
               <div className="inline-flex items-center gap-2 px-2 py-0.5 bg-white/10 backdrop-blur-md rounded-lg border border-white/10 mb-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
                  <span className="text-[8px] font-black uppercase tracking-widest text-purple-100">Private Repository</span>
               </div>
               <h1 className="text-xl lg:text-2xl font-black mb-0.5 truncate tracking-tight">{task.topic}</h1>
               <p className="text-indigo-100/60 font-medium text-[10px] leading-snug truncate max-w-2xl opacity-80">
                  {task.introduction || "This private curriculum was generated to provide a bespoke academic roadmap."}
               </p>
            </div>

            <div className="flex items-center gap-4 py-1.5 px-4 bg-white/10 backdrop-blur-xl rounded-xl border border-white/10">
               <div className="flex flex-col items-center">
                  <span className="text-xl font-black">{task.topics.length}</span>
                  <span className="text-[7px] font-black uppercase tracking-widest text-indigo-200/60">MODS</span>
               </div>
               <div className="w-px h-6 bg-white/10" />
               <div className="flex flex-col items-center">
                  <span className="text-xl font-black">{attemptedTopics.size}</span>
                  <span className="text-[7px] font-black uppercase tracking-widest text-indigo-200/60">DONE</span>
               </div>
            </div>
          </div>
        </div>
      </div>
      </div>

      {/* Grid Architecture */}
      <div className="grid lg:grid-cols-[320px_1fr] gap-12">
        {/* Module Navigator Sidebar */}
        <div className="w-full shrink-0">
          <div className="bg-white/40 backdrop-blur-xl rounded-[2.5rem] p-6 lg:p-8 shadow-2xl shadow-indigo-100/20 border border-white sticky top-8">
            <div className="mb-10 px-1 border-b border-white/40 pb-6 flex items-center justify-between">
               <div className="flex flex-col">
                  <div className="flex items-center gap-2 mb-1">
                     <FontAwesomeIcon icon={faCircleUp} className="text-purple-600 text-sm rotate-45" />
                     <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Knowledge Stack</h2>
                  </div>
                  <p className="text-[9px] font-black text-purple-600 uppercase tracking-widest leading-none mt-1">Curated Progress</p>
               </div>
            </div>

            <div className="space-y-4">
              {task.topics.map((topic, index) => {
                 const isSelected = selectedTopicIndex === index;
                 const isAttempted = attemptedTopics.has(topic.topic);
                 
                 return (
                  <button
                    key={index}
                    onClick={() => setSelectedTopicIndex(index)}
                    className={clsx(
                      "w-full text-left p-4 rounded-[1.5rem] transition-all duration-500 group relative border shadow-sm",
                      isSelected 
                        ? "bg-white border-purple-100 shadow-xl shadow-purple-100/40 text-purple-700 font-black translate-x-2" 
                        : "bg-slate-50 border-slate-50 text-slate-400 hover:bg-white hover:border-slate-200 hover:text-slate-600 font-bold"
                    )}
                  >
                    <div className="flex items-center gap-4 truncate relative z-10">
                      <div className={clsx(
                        "w-9 h-9 rounded-xl flex items-center justify-center text-[10px] shrink-0 font-black shadow-sm transition-all duration-500",
                        isSelected 
                          ? "bg-purple-900 text-white rotate-6 scale-110" 
                          : "bg-white text-slate-300 group-hover:text-purple-600 group-hover:scale-105"
                      )}>
                        {index + 1}
                      </div>
                      <div className="min-w-0 flex-1">
                         <span className="truncate block text-xs tracking-tight">{topic.topic || `Topic ${index + 1}`}</span>
                         <span className={clsx(
                            "text-[8px] uppercase tracking-widest opacity-60 mt-0.5 block",
                            isSelected ? "text-purple-400" : "text-slate-300"
                         )}>Identified Node</span>
                      </div>
                    </div>
                    {isAttempted && (
                       <FontAwesomeIcon 
                          icon={faCheckCircle} 
                          className="absolute -top-1 -right-1 text-emerald-500 bg-white rounded-full text-lg z-20 shadow-sm" 
                       />
                    )}
                  </button>
                 );
              })}
            </div>

          </div>
        </div>

        {/* Content Portal - Node Expansion */}
        <div className="flex-1 min-w-0 animate-in slide-in-from-right-12 duration-1000">
           <div className="mb-12 px-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div className="flex-1 min-w-0">
                 <div className="flex items-center gap-3 mb-3">
                    <div className="w-1.5 h-6 bg-purple-600 rounded-full" />
                    <h2 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                       {task.topics[selectedTopicIndex]?.topic}
                    </h2>
                 </div>
                 <p className="text-sm text-slate-500 font-medium leading-relaxed max-w-2xl italic">
                   {task.topics[selectedTopicIndex]?.description}
                 </p>
              </div>
           </div>

           <div className="space-y-6">
             {task.topics[selectedTopicIndex]?.subtopics.map((sub, idx) => (
               <TopicItem
                  key={idx}
                  index={idx}
                  subtopic={sub}
                  attempted={attemptedTopics.has(sub.subtopic)}
                  projectTopic={task.topic}
               />
             ))}
           </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetails;
