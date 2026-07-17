import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faPlay, 
  faTrophy, 
  faLightbulb,
  faBookOpen,
  faCube,
  faCheckCircle,
  faChevronDown,
  faChevronUp
} from "@fortawesome/free-solid-svg-icons";
import clsx from "clsx";

const TopicItem = ({ subtopic, index, attempted, projectTopic }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleStartQuiz = () => {
    const quizTopic = encodeURIComponent(subtopic.subtopic);
    const query = projectTopic ? `?projectTopic=${encodeURIComponent(projectTopic)}` : "";
    window.location.href = `/l2dashboard/quiz/${quizTopic}${query}`;
  };

  return (
    <div className="group relative bg-white border border-slate-200/60 rounded-3xl shadow-sm hover:shadow-xl hover:shadow-blue-900/5 transition-all duration-500 overflow-hidden mb-6">
      
      {/* Visual Accent */}
      <div className="absolute top-0 left-0 w-1 h-full bg-blue-600/10 group-hover:bg-blue-600 transition-colors duration-500" />

      {/* Main Card Body */}
      <div className="p-4 md:p-6 lg:p-7">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
          
          {/* Topic Info Header (Always Visible) */}
          <div 
            className="flex items-center gap-5 flex-1 min-w-0 cursor-pointer w-full lg:w-auto"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {/* Minimalist Index */}
            <div className="shrink-0 flex flex-col items-center justify-center w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 text-slate-400 group-hover:bg-blue-50 group-hover:border-blue-100 group-hover:text-blue-600 transition-all duration-500">
              <span className="text-[8px] font-black tracking-tighter opacity-70 uppercase">ST</span>
              <span className="text-lg font-black leading-none mt-0.5">{index + 1}</span>
            </div>

            <div className="flex-1 min-w-0">
               <div className="flex flex-wrap items-center gap-3">
                  <h3 className="text-xl font-bold text-slate-900 tracking-tight leading-snug">
                    {subtopic.subtopic}
                  </h3>
                  {attempted && (
                    <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100/50">
                      <FontAwesomeIcon icon={faCheckCircle} className="text-[9px]" />
                      <span className="text-[9px] font-bold uppercase tracking-wider">Mastered</span>
                    </div>
                  )}
               </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex flex-row items-center gap-3 w-full lg:w-auto lg:shrink-0">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-[10px] uppercase tracking-wider transition-all bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-100 hover:border-slate-200"
            >
              <FontAwesomeIcon icon={isExpanded ? faChevronUp : faChevronDown} className="text-[10px] opacity-60" />
              {isExpanded ? "Collapse" : "Explore"}
            </button>
            
            <button
              onClick={handleStartQuiz}
              className={clsx(
                "relative group/btn overflow-hidden flex items-center justify-center gap-3 px-6 py-2.5 rounded-xl font-bold text-[10px] uppercase tracking-wider transition-all shadow-sm active:scale-[0.98]",
                attempted 
                  ? "bg-slate-900 text-white hover:bg-black" 
                  : "bg-blue-600 text-white hover:bg-blue-500 shadow-blue-200/30"
              )}
            >
              <FontAwesomeIcon 
                icon={attempted ? faTrophy : faPlay} 
                className="text-[10px]" 
              />
              {attempted ? "Retry" : "Quiz"}
            </button>
          </div>
        </div>

        {/* Collapsible Content Area */}
        {isExpanded && (
          <div className="mt-8 pt-8 border-t border-slate-100 animate-in slide-in-from-top-4 duration-500">
            {/* Description */}
            <div className="mb-10">
              <div className="flex items-center gap-2 mb-3">
                 <div className="w-1 h-4 bg-slate-200 rounded-full" />
                 <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Contextual Framework</h4>
              </div>
              <p className="text-[15px] text-slate-500 font-medium leading-relaxed max-w-4xl">
                {subtopic.description}
              </p>
            </div>

            {/* Tactical Knowledge Nodes */}
            <div>
              <div className="flex items-center gap-3 mb-8">
                 <div className="w-1 h-5 bg-blue-600 rounded-full" />
                 <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">Tactical Knowledge Nodes</h4>
              </div>
              
              <div className="space-y-6">
                {subtopic.keyConcepts?.map((concept, idx) => (
                  <div key={idx} className="bg-slate-50/50 border border-slate-200/40 rounded-2xl p-6 lg:p-8 hover:bg-white hover:shadow-lg hover:shadow-slate-200/50 transition-all duration-300">
                    <div className="flex items-start gap-5 mb-8">
                      <div className="w-10 h-10 shrink-0 rounded-xl bg-white text-blue-600 flex items-center justify-center border border-slate-200 shadow-sm">
                        <FontAwesomeIcon icon={faCube} className="text-sm" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-lg font-bold text-slate-900 tracking-tight mb-2">
                          {concept.keyConcept}
                        </h4>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          <FontAwesomeIcon icon={faBookOpen} className="text-blue-500 text-[10px]" /> 
                          Executive Summary
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                      <div className="lg:col-span-8">
                        <p className="text-sm text-slate-600 leading-relaxed font-normal">
                          {concept.description}
                        </p>
                      </div>

                      <div className="lg:col-span-4">
                        <div className="bg-white border border-slate-100 p-5 rounded-2xl">
                          <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                            <FontAwesomeIcon icon={faLightbulb} className="text-amber-500" /> Memory Anchor
                          </h5>
                          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-center">
                            <p className="text-[11px] text-slate-700 font-bold tracking-tight leading-relaxed italic">
                               "{concept.mnemonic}"
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TopicItem;
