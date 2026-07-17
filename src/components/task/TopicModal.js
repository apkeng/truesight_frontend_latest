import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faTimes, 
  faLightbulb, 
  faBrain, 
  faRocket, 
  faVial, 
  faBookOpen,
  faMagicWandSparkles,
  faArrowRight,
  faExclamationTriangle
} from "@fortawesome/free-solid-svg-icons";
import { generateReport } from "../../utils/apiServices";
import Loading from "../Loading";

const TopicModal = ({ topic, isOpen, onClose, handleStartQuiz, attempted, studyPlanId, onUpdate }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [detailedReport, setDetailedReport] = useState(topic.detailedReport || null);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      const subtopic = topic.subtopic || topic.topic;
      const keyConcepts = topic.keyConcepts || [];
      const result = await generateReport(subtopic, keyConcepts);
      
      if (result) {
        setDetailedReport(result);
        if (onUpdate && studyPlanId) {
          onUpdate(result);
        }
      } else {
        throw new Error("Failed to generate detailed report");
      }
    } catch (err) {
      console.error("Error generating report:", err);
      setError("Unable to generate deep dive at this time. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 md:p-10">
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" 
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-4xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-full animate-in zoom-in-95 duration-300 ring-1 ring-black/5">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white relative">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all active:scale-90"
          >
            <FontAwesomeIcon icon={faTimes} className="text-sm" />
          </button>
          
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-xl backdrop-blur-md border border-white/20">
              <FontAwesomeIcon icon={faBookOpen} />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-black leading-tight mb-1">
                {topic.subtopic || topic.topic}
              </h2>
              <p className="text-blue-100 font-medium text-xs max-w-2xl">
                {topic.description?.slice(0, 150)}{topic.description?.length > 150 ? '...' : ''}
              </p>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          
          {detailedReport ? (
            /* Detailed AI Report View */
            <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
              <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100">
                <h3 className="text-blue-900 font-black text-sm mb-2 flex items-center gap-2">
                  <FontAwesomeIcon icon={faLightbulb} /> AI DEEP DIVE OVERVIEW
                </h3>
                <p className="text-blue-800 leading-relaxed text-sm italic">
                  {detailedReport.overview}
                </p>
              </div>

              <div className="space-y-6">
                <h3 className="text-slate-900 font-black text-lg px-2">Key Concepts Analysis</h3>
                {detailedReport.keyConceptsAnalysis.map((item, idx) => (
                  <div key={idx} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                    <h4 className="text-blue-600 font-black text-lg mb-2">{item.concept}</h4>
                    <p className="text-slate-600 leading-relaxed text-sm mb-4">{item.detailedExplanation}</p>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-slate-50 rounded-xl p-4">
                        <h5 className="text-slate-900 font-bold text-[9px] uppercase tracking-widest mb-2 flex items-center gap-2">
                          <FontAwesomeIcon icon={faRocket} className="text-blue-500" /> Applications
                        </h5>
                        <ul className="space-y-2">
                          {item.realWorldApplications.map((app, i) => (
                            <li key={i} className="text-[11px] text-slate-600 flex items-start gap-2">
                              <span className="w-1 h-1 rounded-full bg-blue-400 mt-1.5 shrink-0" /> {app}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="bg-slate-50 rounded-xl p-4">
                        <h5 className="text-slate-900 font-bold text-[10px] uppercase tracking-widest mb-2 flex items-center gap-2">
                          <FontAwesomeIcon icon={faExclamationTriangle} className="text-amber-500" /> Pitfalls
                        </h5>
                        <ul className="space-y-2">
                          {item.commonMisconceptions.map((mis, i) => (
                            <li key={i} className="text-[11px] text-slate-600 flex items-start gap-2">
                              <span className="w-1 h-1 rounded-full bg-amber-400 mt-1.5 shrink-0" /> {mis}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-indigo-50/50 rounded-2xl p-6">
                  <h3 className="text-indigo-900 font-black text-sm mb-3 flex items-center gap-2">
                    <FontAwesomeIcon icon={faBrain} /> Practical Exercises
                  </h3>
                  <ul className="space-y-2 text-indigo-800 text-sm font-medium">
                    {detailedReport.practiceExercises.map((ex, i) => (
                      <li key={i} className="flex gap-2">
                        <span className="text-indigo-300 font-black shrink-0">{i+1}.</span> {ex}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-emerald-50/50 rounded-2xl p-6">
                  <h3 className="text-emerald-900 font-black text-sm mb-3 flex items-center gap-2">
                    <FontAwesomeIcon icon={faVial} /> Learning Shortcuts
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {detailedReport.keyConceptsAnalysis.flatMap(c => c.studyTips).slice(0, 8).map((tip, i) => (
                      <span key={i} className="bg-white px-2 py-1 rounded-lg border border-emerald-100 text-[9px] text-emerald-800 font-bold shadow-sm">
                        {tip}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Initial Concepts List View */
            <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-300">
              <div className="flex items-center justify-between">
                <h3 className="text-slate-900 font-black text-lg">Foundational Concepts</h3>
                {!isGenerating && (
                  <button 
                    onClick={handleGenerateReport}
                    className="flex items-center gap-1.5 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all group"
                  >
                    <FontAwesomeIcon icon={faMagicWandSparkles} className="group-hover:animate-pulse" />
                    Deep Dive
                  </button>
                )}
              </div>

              {isGenerating ? (
                <div className="py-12 flex flex-col items-center justify-center">
                  <Loading message="Distilling AI insights..." />
                  <p className="mt-3 text-[10px] text-slate-400 font-medium animate-pulse">This takes 10-15 seconds</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {topic.keyConcepts?.map((concept, idx) => (
                    <div key={idx} className="bg-slate-50 p-4 rounded-xl border border-transparent hover:border-blue-100 transition-all border-dashed">
                      <div className="flex gap-3">
                        <div className="w-6 h-6 rounded-lg bg-white flex items-center justify-center text-[10px] font-black text-blue-600 shadow-sm shrink-0">
                          {idx + 1}
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-slate-900 mb-1">
                            {concept.keyConcept || concept.concept || concept}
                          </h4>
                          <p className="text-xs text-slate-500 leading-relaxed mb-3">
                            {concept.description || concept.detailedExplanation || "Theoretical exploration of this concept."}
                          </p>
                          
                          {(concept.example || concept.mnemonic) && (
                            <div className="flex flex-col sm:flex-row gap-3 mt-2">
                              {concept.example && (
                                <div className="flex-1 bg-white p-3 rounded-lg border border-slate-50">
                                  <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest mb-0.5 block">Example</span>
                                  <p className="text-[11px] text-slate-600 font-medium">{concept.example}</p>
                                </div>
                              )}
                              {concept.mnemonic && (
                                <div className="flex-1 bg-amber-50/50 p-3 rounded-lg border border-amber-100/50">
                                  <span className="text-[8px] font-black text-amber-400 uppercase tracking-widest mb-0.5 block">Mnemonic</span>
                                  <p className="text-[11px] text-amber-700 font-bold">{concept.mnemonic}</p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-2xl border border-red-100 flex items-center gap-3 font-bold text-sm">
                  <FontAwesomeIcon icon={faExclamationTriangle} />
                  {error}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-4">
          <button 
            onClick={onClose}
            className="px-6 py-3 text-slate-500 font-black text-[10px] uppercase tracking-widest hover:text-slate-800 transition-colors"
          >
            Close
          </button>
          
          <button 
            onClick={handleStartQuiz}
            className={`flex-1 max-w-[180px] flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest text-white transition-all shadow-lg active:scale-95 ${
              attempted 
                ? "bg-gradient-to-r from-orange-500 to-amber-600" 
                : "bg-gradient-to-r from-blue-600 to-indigo-700"
            }`}
          >
            {attempted ? "Reattempt" : "Quiz"}
            <FontAwesomeIcon icon={faArrowRight} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TopicModal;
