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
        return "border-amber-200 bg-amber-50 text-amber-700";
      case "accepted":
      case "in_progress":
        return "border-navy/20 bg-navy-wash text-navy";
      case "completed":
        return "border-emerald-200 bg-emerald-50 text-emerald-700";
      case "cancelled":
      case "expired":
        return "border-line bg-parchment text-ink-muted";
      default:
        return "border-line bg-parchment text-ink-muted";
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
    <div className="group relative flex flex-col border border-line bg-white transition-colors hover:border-navy/40">
      {/* Visual Indicator Line */}
      <div className={clsx(
        "absolute left-0 right-0 top-0 h-1",
        challenge.status === "completed" ? (isWinner ? "bg-emerald-500" : "bg-rose-500") : "bg-navy"
      )} />

      {/* Header Section */}
      <div className="p-5 pb-2">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
             <div className="flex h-9 w-9 items-center justify-center bg-navy text-white">
                <FontAwesomeIcon icon={challenge.matchingType === "invite" ? faUserFriends : faRandom} className="text-xs" />
             </div>
             <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-muted">
               {challenge.matchingType === "invite" ? "Direct invite" : "Random match"}
             </span>
          </div>
          <div className={clsx(
            "flex items-center gap-1.5 border px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em]",
            getStatusColor(challenge.status)
          )}>
            <FontAwesomeIcon icon={getStatusIcon(challenge.status)} />
            {challenge.status.replace("_", " ")}
          </div>
        </div>

        <h3 className="mb-1 line-clamp-2 min-h-[2.5rem] font-display text-base font-bold leading-snug text-ink">
          {challenge.topic}
        </h3>
        
        <div className="flex items-center gap-2 text-ink-muted">
           <FontAwesomeIcon icon={faShieldHalved} className="text-[10px]" />
           <span className="text-xs">Opponent: {opponentName}</span>
        </div>
      </div>

      {/* Main Body */}
      <div className="p-5 py-3 flex-1">
        {/* Results Analysis */}
        {challenge.status === "completed" ? (
          <div className="space-y-3 border border-line bg-parchment p-4">
            <div className="flex items-center justify-between">
               <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-muted">Your score</span>
               <span className="text-[10px] font-black uppercase tracking-widest text-slate-800">
                 {isChallenger ? challenge.challengerResult?.score || 0 : challenge.opponentResult?.score || 0}/5
               </span>
            </div>
            <div className="flex items-center justify-between">
               <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-muted">Their score</span>
               <span className="text-[10px] font-black uppercase tracking-widest text-slate-800">
                 {isChallenger ? challenge.opponentResult?.score || 0 : challenge.challengerResult?.score || 0}/5
               </span>
            </div>
            
            <div className="mt-2 border-t border-line pt-3">
               <div className="flex items-center gap-3">
                  <div className={clsx(
                    "flex h-8 w-8 items-center justify-center",
                    challenge.winner === "tie" ? "bg-amber-500" : isWinner ? "bg-emerald-500" : "bg-rose-500"
                  )}>
                     <FontAwesomeIcon icon={faTrophy} className="text-xs text-white" />
                  </div>
                  <span className={clsx(
                    "text-[10px] font-semibold uppercase tracking-[0.14em]",
                    challenge.winner === "tie" ? "text-amber-600" : isWinner ? "text-emerald-600" : "text-rose-600"
                  )}>
                    {challenge.winner === "tie" ? "Draw" : isWinner ? "You won" : "You lost"}
                  </span>
               </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <div className="border border-line bg-parchment p-3">
               <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-muted">Mode</p>
               <p className="text-xs text-ink">{challenge.challengeType === "real_time" ? "Real time" : "Any time"}</p>
            </div>
            <div className="border border-line bg-parchment p-3">
               <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-muted">Expires</p>
               <p className="text-xs text-ink">{formatTimeRemaining(challenge.expiresAt)}</p>
            </div>
          </div>
        )}

        {/* Live Progress */}
        {challenge.status === "in_progress" && (
          <div className="mt-6 space-y-3">
            <div className="flex justify-between text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-muted">
              <span>Progress</span>
              <span className="text-navy">
                {((challenge.challengerResult ? 1 : 0) + (challenge.opponentResult ? 1 : 0)) * 50}%
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden bg-line-soft">
              <div
                className="h-full bg-navy transition-all duration-700"
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
              className="h-10 flex-1 bg-navy text-[11px] font-semibold uppercase tracking-[0.14em] text-white transition-colors hover:bg-navy-dark"
            >
              Accept
            </button>
            <button
              onClick={onDecline}
              className="h-10 w-10 border border-line text-ink-muted transition-colors hover:border-red-200 hover:text-red-600"
            >
              <FontAwesomeIcon icon={faXmark} />
            </button>
          </>
        )}

        {canPlay() && (
          <button
            onClick={onStart}
            className="flex h-10 w-full items-center justify-center gap-2 bg-navy text-[11px] font-semibold uppercase tracking-[0.14em] text-white transition-colors hover:bg-navy-dark"
          >
            <FontAwesomeIcon icon={faPlay} className="text-[9px]" />
            Start quiz
          </button>
        )}

        {challenge.status === "completed" && (
          <button
            onClick={onViewResults}
            className="flex h-10 w-full items-center justify-center gap-2 border border-navy bg-white text-[11px] font-semibold uppercase tracking-[0.14em] text-navy transition-colors hover:bg-navy-wash"
          >
            <FontAwesomeIcon icon={faEye} className="text-[9px]" />
            View results
          </button>
        )}

        {challenge.status === "pending" && isChallenger && (
          <button
            onClick={onCancel}
            className="flex h-10 w-full items-center justify-center border border-line text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-muted transition-colors hover:border-red-200 hover:text-red-600"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
};

export default ChallengeCard;
