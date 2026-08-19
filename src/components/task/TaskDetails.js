import clsx from "clsx";
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Loading from "../Loading";
import { ToastContainer } from "react-toastify";
import { getStudyPlanById, getQuizResults, updateStudyPlan, generateSubtopics } from "../../utils/apiServices";
import TopicItem from "./TopicItem";
import Cookies from "js-cookie";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faCheckCircle, 
  faMagicWandSparkles,
  faCompass,
  faArrowLeft,
  faTimeline,
  faPlus,
  faExclamationTriangle
} from "@fortawesome/free-solid-svg-icons";

const TaskDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(false);
  const [attemptedTopics, setAttemptedTopics] = useState(new Set());
  const [selectedTopicIndex, setSelectedTopicIndex] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTask = async () => {
      setLoading(true);
      try {
        // Fetch study plan details first to render the roadmap instantly
        const planData = await getStudyPlanById(id);
        if (planData) {
          setTask(planData);
        }
        setLoading(false); // Dismiss loading screen immediately

        // Fetch quiz results in the background to show completed checkmarks asynchronously
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
        console.error("Error fetching study plan details:", error);
        setLoading(false);
      }
    };

    fetchTask();
  }, [id]);

  const handleGenerateMoreSubtopics = async () => {
    if (!task) return;
    
    // Check permission BEFORE calling LLM
    const currentUid = Cookies.get("uid");
    if (task.uid !== currentUid) {
      setError("Unauthorized - You do not have permission to update this study plan.");
      return;
    }
    
    setIsGenerating(true);
    setError(null);
    try {
      const currentTopic = task.topics[selectedTopicIndex];
      const existingSubtopics = currentTopic.subtopics || [];
      const topicName = currentTopic.topic || currentTopic.name || currentTopic.title || currentTopic.description?.split('.')[0] || `Topic ${selectedTopicIndex + 1}`;
      const result = await generateSubtopics(topicName, existingSubtopics);
      
      if (result && Array.isArray(result) && result.length > 0) {
        const newSubtopics = result;
        const updatedTopics = [...task.topics];
        updatedTopics[selectedTopicIndex] = {
          ...updatedTopics[selectedTopicIndex],
          subtopics: [...existingSubtopics, ...newSubtopics]
        };
        
        const updatedTask = { ...task, topics: updatedTopics };
        setTask(updatedTask);
        
        // Persist to backend
        await updateStudyPlan(id, { topics: updatedTopics });
      } else {
        throw new Error("Failed to generate additional subtopics");
      }
    } catch (err) {
      console.error("Error generating subtopics:", err);
      setError(err.message || "Unable to generate more subtopics at this time. Our AI experts are currently re-calibrating.");
    } finally {
      setIsGenerating(false);
    }
  };

  return loading ? (
    <div className="min-h-screen flex items-center justify-center p-10">
      <Loading message="Architecting your learning roadmap..." fullScreen={true} />
    </div>
  ) : task ? (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-in fade-in duration-1000">
      <ToastContainer position="top-right" />
      
      {/* Navigation & Context Row */}
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={() => navigate(-1)}
          className="group inline-flex items-center gap-3 px-4 py-2 bg-white/40   border border-white text-ink-muted font-semibold text-[10px] uppercase tracking-[0.14em]  hover:shadow-xl hover:bg-white transition-all active:scale-95"
        >
          <FontAwesomeIcon icon={faArrowLeft} className="group-hover:-translate-x-1 transition-transform" />
          Back to Dashboard
        </button>
        <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-navy-wash/50 rounded-full border border-navy/15/50">
          <span className="w-1.5 h-1.5 rounded-full bg-navy-wash0 animate-pulse" />
          <span className="text-[9px] font-semibold uppercase tracking-[0.14em] text-navy">Curriculum Sync Active</span>
        </div>
      </div>

      {/* Premium Glass Header Banner */}
      <div className="relative mb-6">
        <div className="relative bg-navy  p-3 lg:p-4 text-white  overflow-hidden group border border-white/10">
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform duration-1000">
            <FontAwesomeIcon icon={faCompass} className="text-[6rem]" />
          </div>
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="inline-flex items-center gap-2 px-2 py-0.5 bg-white/10   border border-white/10 mb-2">
                 <FontAwesomeIcon icon={faMagicWandSparkles} className="text-[8px] text-blue-200" />
                 <span className="text-[8px] font-semibold uppercase tracking-[0.14em] text-blue-50">Global Roadmap</span>
              </div>
              <h1 className="text-xl lg:text-2xl font-semibold mb-0.5 tracking-tight leading-tight text-white drop-shadow-sm">
                {task.title || task.topic}
              </h1>
              <p className="text-blue-100/90 font-medium text-[10px] max-w-3xl leading-snug italic opacity-80 truncate">
                {task.introduction || "Master this subject through a tiered learning path."}
              </p>
            </div>

            <div className="flex items-center gap-4 py-1.5 px-4 bg-white/10   border border-white/10">
               <div className="flex flex-col items-center">
                  <span className="text-[8px] font-semibold uppercase tracking-[0.14em] text-blue-200/60 mb-0.5">Intensity</span>
                  <span className="text-[10px] font-semibold uppercase tracking-wider">{task.levelOfLearning?.split(' ')[0]}</span>
               </div>
               <div className="w-px h-6 bg-white/10" />
               <div className="flex flex-col items-center">
                  <span className="text-[8px] font-semibold uppercase tracking-[0.14em] text-blue-200/60 mb-0.5">Status</span>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-400">ACTIVE</span>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3-Level Hierarchy View */}
      <div className="grid lg:grid-cols-[280px_1fr] gap-10">
        
        {/* Sidebar: Curriculum Navigator */}
        <div className="w-full shrink-0">
          <div className="bg-white/40   p-6 lg:p-8   border border-white sticky top-8">
            <div className="mb-8 flex flex-col items-start gap-2 border-b border-white/40 pb-6 px-1">
               <div className="flex items-center gap-2 mb-1">
                  <FontAwesomeIcon icon={faTimeline} className="text-navy text-sm" />
                  <h2 className="text-[10px] uppercase font-semibold tracking-[0.2em] text-ink-muted">Mindmap</h2>
               </div>
               <p className="text-[9px] font-semibold text-navy bg-navy-wash px-3 py-1 rounded-full uppercase tracking-[0.14em] leading-none border border-navy/15">
                  {task.topics.length} Primary Nodes Detected
               </p>
            </div>
            
            <div className="space-y-4">
              {task.topics.map((item, index) => {
                const isSelected = selectedTopicIndex === index;
                const topicName = item.topic || item.name || item.title || `Topic ${index + 1}`;
                const isAttempted = attemptedTopics.has(topicName);
                
                return (
                  <button
                    key={index}
                    onClick={() => { setSelectedTopicIndex(index); setError(null); }}
                    className={clsx(
                      "w-full text-left p-4  transition-all duration-500 group relative border ",
                      isSelected 
                        ? "bg-white border-navy/15   text-blue-700 font-semibold translate-x-2" 
                        : "bg-parchment border-line text-ink-muted hover:bg-white hover:border-line hover:text-ink-muted font-bold"
                    )}
                  >
                    <div className="flex items-center gap-4 truncate relative z-10">
                      <div className={clsx(
                        "w-9 h-9  flex items-center justify-center text-[10px] shrink-0 font-semibold  transition-all duration-500",
                        isSelected 
                          ? "bg-navy text-white rotate-6 scale-110" 
                          : "bg-white text-ink-muted group-hover:text-navy group-hover:scale-105"
                      )}>
                        {index + 1}
                      </div>
                      <div className="min-w-0 flex-1">
                         <span className="truncate block text-xs tracking-tight">{topicName}</span>
                         <span className={clsx(
                            "text-[8px] uppercase tracking-[0.14em] opacity-60 mt-0.5 block",
                            isSelected ? "text-blue-400" : "text-ink-muted"
                         )}>Node Identification</span>
                      </div>
                    </div>
                    {isAttempted && (
                       <FontAwesomeIcon 
                          icon={faCheckCircle} 
                          className="absolute -top-1 -right-1 text-emerald-500 bg-white rounded-full text-lg z-20 " 
                       />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Roadmap Flow Footer */}
          </div>
        </div>

        {/* Main Content Area: Nodes & Sub-Architectures */}
        <div className="flex-1 min-w-0">
          {task.topics[selectedTopicIndex] && (
            <div className="space-y-10">
              {/* Topic Focus Banner */}
              <div className="bg-white  p-8 lg:p-12 border border-line   flex flex-col md:flex-row items-center justify-between gap-10 group transition-all duration-700 hover:shadow-blue-100/50">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-4">
                     <div className="w-1.5 h-6 bg-navy rounded-full" />
                     <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-navy">Description</p>
                  </div>
                  <h2 className="text-3xl font-semibold text-ink tracking-tight mb-4">
                    {task.topics[selectedTopicIndex].topic || task.topics[selectedTopicIndex].name || task.topics[selectedTopicIndex].title || `Topic ${selectedTopicIndex + 1}`}
                  </h2>
                  <p className="text-ink-muted text-sm font-medium leading-relaxed max-w-2xl">
                    {task.topics[selectedTopicIndex].description}
                  </p>
                </div>
                
                <button 
                  onClick={handleGenerateMoreSubtopics}
                  disabled={isGenerating}
                  className="group/gen relative flex items-center gap-3 px-8 py-5 bg-navy text-white  font-semibold text-[11px] uppercase tracking-[0.14em] hover:bg-navy transition-all   disabled:opacity-50 disabled:cursor-not-allowed shrink-0 active:scale-95"
                >
                  <FontAwesomeIcon icon={faPlus} className={clsx("transition-transform duration-500", isGenerating ? "animate-spin" : "group-hover/gen:rotate-90")} />
                  {isGenerating ? "Synthesizing..." : "Deepen Curriculum"}
                </button>
              </div>

              {/* Generation Animation */}
              {isGenerating && (
                <div className="bg-white  p-16 border-2 border-dashed border-navy/15   flex flex-col items-center justify-center animate-in zoom-in-95 duration-700">
                  <div className="relative mb-8">
                     <div className="absolute inset-0 bg-navy-wash0/20 rounded-full blur-2xl animate-pulse" />
                     <div className="relative w-20 h-20 bg-navy-wash rounded-full flex items-center justify-center border-4 border-blue-600/10 border-t-blue-600 animate-spin">
                        <FontAwesomeIcon icon={faMagicWandSparkles} className="text-navy text-3xl" />
                     </div>
                  </div>
                  <h4 className="text-2xl font-semibold text-ink tracking-tight text-center mb-2">Expansion in Progress</h4>
                  <p className="text-xs text-ink-muted font-bold uppercase tracking-[0.14em] text-center">Identifying auxiliary sub-concepts for this node</p>
                  
                  <div className="w-full max-w-md grid grid-cols-3 gap-3 pt-10">
                    <div className="h-1 bg-navy/40 rounded-full animate-pulse" />
                    <div className="h-1 bg-navy/30 rounded-full animate-pulse delay-75" />
                    <div className="h-1 bg-slate-200 rounded-full animate-pulse delay-150" />
                  </div>
                </div>
              )}

              {/* Error Protocol */}
              {error && (
                <div className="bg-red-50/80   p-6 border border-red-100 flex items-center gap-4 animate-in slide-in-from-top-4 duration-500">
                  <div className="w-10 h-10  bg-red-600 text-white flex items-center justify-center  ">
                    <FontAwesomeIcon icon={faExclamationTriangle} />
                  </div>
                  <div>
                    <h5 className="text-[10px] font-semibold uppercase tracking-[0.14em] text-red-600 mb-0.5">System Exception</h5>
                    <p className="text-sm text-red-800 font-bold tracking-tight">{error}</p>
                  </div>
                </div>
              )}

              {/* Sub-Architecture Modules (Level 2 → Level 3) */}
              <div className="space-y-4">
                {task.topics[selectedTopicIndex].subtopics?.length > 0 ? (
                  task.topics[selectedTopicIndex].subtopics.map((sub, idx) => (
                    <TopicItem
                      key={idx}
                      subtopic={sub}
                      index={idx}
                      attempted={attemptedTopics.has(sub.subtopic)}
                      projectTopic={task.title || task.topic}
                    />
                  ))
                ) : (
                  <div className="bg-white/40   p-24 border border-dashed border-line text-center animate-in fade-in duration-1000">
                    <div className="inline-flex h-20 w-20 items-center justify-center  bg-parchment text-ink-muted mb-8 border border-line  group-hover:rotate-12 transition-transform">
                      <FontAwesomeIcon icon={faPlus} className="text-4xl" />
                    </div>
                    <h3 className="text-xl font-semibold text-ink-muted uppercase tracking-[0.14em] mb-2">No Modules Detected</h3>
                    <p className="text-ink-muted font-medium text-sm max-w-sm mx-auto">
                       Initiate expansion to construct sub-architectures for this academic node.
                    </p>
                    <button 
                      onClick={handleGenerateMoreSubtopics}
                      className="mt-8 px-8 py-3 bg-white text-ink border border-line  font-semibold text-[10px] uppercase tracking-[0.14em] hover:bg-parchment transition-all active:scale-95 "
                    >
                       Construct Modules Now
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  ) : (
    <div className="min-h-screen flex flex-col items-center justify-center p-20">
       <div className="w-20 h-20 bg-parchment  flex items-center justify-center text-slate-200 border border-line mb-6">
          <FontAwesomeIcon icon={faExclamationTriangle} className="text-4xl" />
       </div>
       <h2 className="text-sm font-semibold text-ink-muted uppercase tracking-[0.3em]">Curriculum Missing</h2>
       <button onClick={() => navigate(-1)} className="mt-8 text-[10px] font-semibold uppercase tracking-[0.14em] text-navy hover:text-blue-700 transition-colors">
          Return to Hub
       </button>
    </div>
  );
};

export default TaskDetails;
