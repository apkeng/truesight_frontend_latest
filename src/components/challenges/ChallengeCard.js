import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTrophy,
  faClock,
  faCheckCircle,
  faTimesCircle,
  faUserFriends,
  faRandom,
  faPlay,
  faEye,
  faHourglassHalf,
  faBolt,
  faShieldHalved,
  faFingerprint,
  faArrowRight,
  faXmark
} from "@fortawesome/free-solid-svg-icons";
import clsx from "clsx";

const ChallengeCard = ({
  challenge,
  currentUserId,
  onAccept,
  onDecline,
  onCancel,
  onViewResults,
  onStart,
}) => {
  const isChallenger = challenge.challengerId === currentUserId;
  const isOpponent = challenge.opponentId === currentUserId;
  const opponentName = isChallenger ? challenge.opponentName : challenge.challengerName;

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-amber-500/10 text-amber-600 border-amber-500/20";
      case "accepted":
      case "in_progress":
        return "bg-indigo-500/10 text-indigo-600 border-indigo-500/20";
      case "completed":
        return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
      case "cancelled":
      case "expired":
        return "bg-slate-500/10 text-slate-500 border-slate-500/20";
      default:
        return "bg-slate-500/10 text-slate-500 border-slate-500/20";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending": return faHourglassHalf;
      case "accepted":
      case "in_progress": return faBolt;
      case "completed": return faCheckCircle;
      case "cancelled":
      case "expired": return faTimesCircle;
      default: return faClock;
    }
  };

  const formatTimeRemaining = (expiresAt) => {
    if (!expiresAt) return "Permanent";
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diff = expiry - now;
    if (diff <= 0) return "Terminated";
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  const canPlay = () => {
    if (challenge.status === "completed") return false;
    if (isChallenger && challenge.status === "pending") return false;
    if (isOpponent && challenge.status === "pending") return false;
    return (
      challenge.status === "accepted" ||
      challenge.status === "in_progress" ||
      (isChallenger && challenge.status === "pending" && challenge.challengeType === "real_time")
    );
  };

  const needsResponse = () => isOpponent && challenge.status === "pending";
  const isWinner = (isChallenger && challenge.winner === "challenger") || (isOpponent && challenge.winner === "opponent");

  return (
    <div className="group relative bg-white/40 backdrop-blur-xl border border-white rounded-[2.5rem] shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 overflow-hidden flex flex-col">
      {/* Visual Indicator Line */}
      <div className={clsx(
        "absolute top-0 left-0 right-0 h-1.5",
        challenge.status === "completed" ? (isWinner ? "bg-emerald-500" : "bg-rose-500") : "bg-indigo-500"
      )} />

      {/* Header Section */}
      <div className="p-5 pb-2">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-lg">
                <FontAwesomeIcon icon={challenge.matchingType === "invite" ? faUserFriends : faRandom} className="text-xs" />
             </div>
             <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
               {challenge.matchingType === "invite" ? "Direct Engagement" : "Protocol Match"}
             </span>
          </div>
          <div className={clsx(
            "px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border flex items-center gap-1.5",
            getStatusColor(challenge.status)
          )}>
            <FontAwesomeIcon icon={getStatusIcon(challenge.status)} className="animate-pulse" />
            {challenge.status.replace("_", " ")}
          </div>
        </div>

        <h3 className="text-base font-black text-slate-800 tracking-tight leading-tight uppercase mb-1 min-h-[2rem] line-clamp-2">
          {challenge.topic}
        </h3>
        
        <div className="flex items-center gap-4 text-slate-400">
           <div className="flex items-center gap-2">
              <FontAwesomeIcon icon={faShieldHalved} className="text-[10px]" />
              <span className="text-[10px] font-bold uppercase tracking-wide">Opponent: {opponentName}</span>
           </div>
        </div>
      </div>

      {/* Main Body */}
      <div className="p-5 py-3 flex-1">
        {/* Results Analysis */}
        {challenge.status === "completed" ? (
          <div className="space-y-4 p-5 bg-slate-50/50 rounded-[2rem] border border-slate-100">
            <div className="flex items-center justify-between">
               <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Your Evaluation</span>
               <span className="text-[10px] font-black uppercase tracking-widest text-slate-800">
                 {isChallenger ? challenge.challengerResult?.score || 0 : challenge.opponentResult?.score || 0}/5
               </span>
            </div>
            <div className="flex items-center justify-between">
               <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Peer Evaluation</span>
               <span className="text-[10px] font-black uppercase tracking-widest text-slate-800">
                 {isChallenger ? challenge.opponentResult?.score || 0 : challenge.challengerResult?.score || 0}/5
               </span>
            </div>
            
            <div className="pt-3 border-t border-slate-200 mt-2">
               <div className="flex items-center gap-3">
                  <div className={clsx(
                    "w-8 h-8 rounded-lg flex items-center justify-center shadow-lg",
                    challenge.winner === "tie" ? "bg-amber-500" : isWinner ? "bg-emerald-500" : "bg-rose-500"
                  )}>
                     <FontAwesomeIcon icon={faTrophy} className="text-xs text-white" />
                  </div>
                  <span className={clsx(
                    "text-[10px] font-black uppercase tracking-widest",
                    challenge.winner === "tie" ? "text-amber-600" : isWinner ? "text-emerald-600" : "text-rose-600"
                  )}>
                    {challenge.winner === "tie" ? "Stalemate Achieved" : isWinner ? "Superior Mastery" : "Evaluation Lag"}
                  </span>
               </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
               <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Engagement</p>
               <p className="text-[10px] font-bold text-slate-700">{challenge.challengeType === "real_time" ? "Synchronous" : "Asynchronous"}</p>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
               <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Terminal</p>
               <p className="text-[10px] font-bold text-slate-700 tracking-tight">{formatTimeRemaining(challenge.expiresAt)}</p>
            </div>
          </div>
        )}

        {/* Live Progress */}
        {challenge.status === "in_progress" && (
          <div className="mt-6 space-y-3">
            <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-slate-400">
              <span>Synchronizing Status</span>
              <span className="text-indigo-600">
                {((challenge.challengerResult ? 1 : 0) + (challenge.opponentResult ? 1 : 0)) * 50}%
              </span>
            </div>
            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-600 transition-all duration-1000 shadow-[0_0_10px_rgba(79,70,229,0.5)]"
                style={{ width: `${((challenge.challengerResult ? 1 : 0) + (challenge.opponentResult ? 1 : 0)) * 50}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="p-5 pt-0 flex gap-2">
        {needsResponse() && (
          <>
            <button
              onClick={onAccept}
              className="flex-1 py-3 bg-emerald-600 text-white rounded-[1rem] font-black text-[9px] uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 active:scale-95"
            >
              Authorize
            </button>
            <button
              onClick={onDecline}
              className="px-6 py-4 bg-rose-50 text-rose-500 rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all active:scale-95"
            >
              <FontAwesomeIcon icon={faXmark} />
            </button>
          </>
        )}

        {canPlay() && (
          <button
            onClick={onStart}
            className="w-full py-4 bg-indigo-600 text-white rounded-[1rem] font-black text-[9px] uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 active:scale-95 flex items-center justify-center gap-2"
          >
            <FontAwesomeIcon icon={faPlay} className="text-[9px]" />
            Engage Topic
          </button>
        )}

        {challenge.status === "completed" && (
          <button
            onClick={onViewResults}
            className="w-full py-4 bg-slate-900 text-white rounded-[1rem] font-black text-[9px] uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-slate-100 active:scale-95 flex items-center justify-center gap-2"
          >
            <FontAwesomeIcon icon={faEye} className="text-[9px]" />
            Deep Analysis
          </button>
        )}

        {challenge.status === "pending" && isChallenger && (
          <button
            onClick={onCancel}
            className="w-full py-5 bg-slate-100 text-slate-400 rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest hover:bg-rose-50 hover:text-rose-500 transition-all active:scale-95 flex items-center justify-center gap-3"
          >
            Abort Dispatch
          </button>
        )}
      </div>
    </div>
  );
};

export default ChallengeCard;
