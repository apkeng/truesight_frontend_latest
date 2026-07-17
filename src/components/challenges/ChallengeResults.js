import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTrophy,
  faTimes,
  faClock,
  faCheckCircle,
  faTimesCircle,
  faCrown,
  faShieldHalved,
  faBolt,
  faFingerprint,
  faArrowRight,
  faCircleCheck,
  faCircleXmark,
  faHourglassEnd
} from "@fortawesome/free-solid-svg-icons";
import clsx from "clsx";

const ChallengeResults = ({ isOpen, onClose, challenge, currentUserId }) => {
  if (!isOpen || !challenge) return null;

  const isChallenger = challenge.challengerId === currentUserId;
  const myResult = isChallenger ? challenge.challengerResult : challenge.opponentResult;
  const opponentResult = isChallenger
    ? challenge.opponentResult
    : challenge.challengerResult;
  const opponentName = isChallenger ? challenge.opponentName : challenge.challengerName;
  const iWon =
    challenge.winner === "tie"
      ? null
      : (isChallenger && challenge.winner === "challenger") ||
        (!isChallenger && challenge.winner === "opponent");

  const formatTime = (timeTaken) => {
    if (!timeTaken) return "N/A";
    return timeTaken;
  };

  const getAnswerStatus = (answer) => {
    if (answer.isCorrect) {
      return { 
        icon: faCircleCheck, 
        color: "text-emerald-500", 
        border: "border-emerald-500/20",
        bg: "bg-emerald-500/5",
        label: "Correct Choice"
      };
    }
    return { 
      icon: faCircleXmark, 
      color: "text-rose-500", 
      border: "border-rose-500/20",
      bg: "bg-rose-500/5",
      label: "Answer Deviation"
    };
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="relative w-full max-w-4xl bg-white/95 backdrop-blur-2xl rounded-[3rem] shadow-[0_32px_64px_-16px_rgba(30,41,59,0.3)] border border-white/40 max-h-[90vh] flex flex-col overflow-hidden scale-in-center">
        
        {/* Dynamic Header Banner */}
        <div className={clsx(
          "px-8 py-7 text-white relative overflow-hidden transition-colors duration-700",
          challenge.winner === "tie" ? "bg-slate-800" : iWon ? "bg-indigo-600" : "bg-rose-600"
        )}>
           {/* Decorative elements */}
           <div className="absolute top-0 right-0 p-10 opacity-10 rotate-12">
              <FontAwesomeIcon icon={iWon ? faCrown : challenge.winner === "tie" ? faShieldHalved : faFingerprint} className="text-[8rem]" />
           </div>
           
           <div className="relative z-10 flex items-center justify-between">
              <div>
                 <div className="flex items-center gap-2 mb-2">
                    <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/60">Challenge Assessment</span>
                    <div className="h-px w-6 bg-white/30" />
                 </div>
                 <h2 className="text-2xl font-black tracking-tight uppercase mb-1">
                   {challenge.winner === "tie" ? "Stalemate Achieved" : iWon ? "Victory Accomplished" : "Analysis Complete"}
                 </h2>
                 <p className="text-white/70 font-bold text-xs uppercase tracking-widest flex items-center gap-2">
                   <FontAwesomeIcon icon={faShieldHalved} className="text-[10px]" />
                   Sect: {challenge.topic}
                 </p>
              </div>
              
              <button
                onClick={onClose}
                className="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all active:scale-90 border border-white/10"
              >
                <FontAwesomeIcon icon={faTimes} className="text-lg" />
              </button>
           </div>
        </div>

        {/* Actionable Comparison Strip */}
        <div className="bg-slate-50 border-b border-slate-100 px-8 py-4 flex items-center justify-center gap-10 overflow-x-auto no-scrollbar">
           <div className="flex items-center gap-4">
              <div className="text-center">
                 <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-1">Your Score</p>
                 <p className={clsx("text-xl font-black", iWon ? "text-indigo-600" : "text-slate-800")}>{myResult?.score || 0}/5</p>
              </div>
              <div className="h-8 w-px bg-slate-200" />
              <div className="text-center">
                 <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-1">Opponent Score</p>
                 <p className="text-xl font-black text-slate-400">{opponentResult?.score || 0}/5</p>
              </div>
           </div>
           
           <div className="h-10 w-px bg-slate-200 md:block hidden" />
           
           <div className="flex items-center gap-4">
              <div className="text-center">
                 <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-1">Time Expenditure</p>
                 <div className="flex items-center gap-2 justify-center">
                    <FontAwesomeIcon icon={faHourglassEnd} className="text-[9px] text-slate-300" />
                    <p className="text-[11px] font-bold text-slate-700">{formatTime(myResult?.timeTaken)}</p>
                 </div>
              </div>
           </div>

           {iWon && challenge.bonusPointsAwarded && (
             <div className="bg-amber-500/10 border border-amber-500/20 px-5 py-1.5 rounded-full flex items-center gap-2.5 ml-auto animate-pulse">
                <FontAwesomeIcon icon={faTrophy} className="text-amber-600 text-[10px]" />
                <span className="text-[9px] font-black uppercase tracking-widest text-amber-700">+{myResult?.score * 2 || 0} Prestige Units</span>
             </div>
           )}
        </div>

        {/* Detailed Logs Content */}
        <div className="px-8 py-5 overflow-y-auto flex-1 no-scrollbar space-y-4">
           <div className="flex items-center justify-between mb-1">
              <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Detailed Review</h3>
              <div className="flex items-center gap-3">
                 <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">Correct</span>
                 </div>
                 <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-rose-500" />
                    <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">Incorrect</span>
                 </div>
              </div>
           </div>

           <div className="grid grid-cols-1 gap-6 pb-6">
              {myResult?.answers && myResult.answers.length > 0 ? (
                myResult.answers.map((answer, index) => {
                  const status = getAnswerStatus(answer);
                  return (
                    <div
                      key={index}
                      className={clsx(
                        "group relative p-4 rounded-[1rem] border transition-all duration-300 hover:shadow-lg",
                        status.bg, status.border
                      )}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className={clsx("w-8 h-8 rounded-lg flex items-center justify-center text-sm shadow-sm", status.bg, "bg-white border", status.border)}>
                             <FontAwesomeIcon icon={status.icon} className={status.color} />
                          </div>
                          <div>
                             <p className={clsx("text-[8px] font-black uppercase tracking-widest mb-0.5", status.color)}>
                               {status.label}
                             </p>
                             <p className="text-[9px] font-bold text-slate-400">Query #{index + 1}</p>
                          </div>
                        </div>
                        <div className={clsx("px-2 py-0.5 rounded-full text-[7px] font-black uppercase tracking-widest", status.bg, status.color, "border", status.border)}>
                           {answer.points > 0 ? "+1.0 UNIT" : "0.0 UNIT"}
                        </div>
                      </div>
                      
                      <div className="mb-4">
                         <p className="text-sm font-black text-slate-800 leading-snug tracking-tight">
                           {answer.question}
                         </p>
                      </div>

                       <div className="grid md:grid-cols-2 gap-2">
                         <div className="p-3 bg-white border border-slate-100 rounded-lg shadow-sm">
                            <p className="text-[7px] font-black uppercase tracking-widest text-slate-400 mb-1">Your Choice</p>
                            <p className={clsx("text-xs font-bold", answer.isCorrect ? "text-emerald-600" : "text-rose-600")}>{answer.userAnswer || answer.selectedAnswer}</p>
                         </div>
                         <div className="p-3 bg-emerald-50/30 border border-emerald-100 rounded-lg">
                            <p className="text-[7px] font-black uppercase tracking-widest text-emerald-600/50 mb-1">Correct Answer</p>
                            <p className="text-xs font-bold text-emerald-700">{answer.correctAnswer}</p>
                         </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-20 text-center border-2 border-dashed border-slate-100 rounded-[3rem]">
                   <FontAwesomeIcon icon={faFingerprint} className="text-5xl text-slate-100 mb-6" />
                   <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300">No telemetry records found for this engagement session.</p>
                </div>
              )}
           </div>
        </div>

        {/* Institutional Footer */}
        <div className="px-8 py-5 bg-white border-t border-slate-100 flex items-center justify-between">
           <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-slate-900 flex items-center justify-center text-[9px] text-white">
                 TS
              </div>
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">TRUESIGHT ANALYTICS PROTOCOL</span>
           </div>
           <button
             onClick={onClose}
             className="px-8 py-3 bg-slate-900 text-white rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-black transition-all shadow-lg active:scale-95"
           >
             Archive Report
           </button>
        </div>
      </div>
    </div>
  );
};

export default ChallengeResults;
