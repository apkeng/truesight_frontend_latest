import React, { useState, useEffect, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTrophy,
  faUsers,
  faCheckCircle,
  faPlus,
  faFire,
} from "@fortawesome/free-solid-svg-icons";
import Cookies from "js-cookie";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Loading from "../../../components/Loading";
import ErrorPage from "../../../components/ErrorPage";
import { SkeletonChallengeCard } from "../../../components/SkeletonLoading";
import ChallengeCard from "../../../components/challenges/ChallengeCard";
import ChallengeForm from "../../../components/challenges/ChallengeForm";
import ChallengeResults from "../../../components/challenges/ChallengeResults";
import { getUser, getPublishedStudyPlans, getChallenges, createChallenge, acceptChallenge, declineChallenge, cancelChallenge } from "../../../utils/apiServices";

const Challenges = () => {
  const [activeTab, setActiveTab] = useState("my-challenges");
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isCreatingChallenge, setIsCreatingChallenge] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [availableTopics, setAvailableTopics] = useState([]);
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState(null);

  const fetchChallenges = useCallback(async () => {
    try {
      const uid = Cookies.get("uid");
      if (!uid) return;
      const allChallenges = await getChallenges({ role: 'both' });
      const normalizedChallenges = allChallenges.map((challenge) => ({
        id: challenge._id || challenge.id,
        ...challenge,
        createdAt: challenge.createdAt?.toDate ? challenge.createdAt.toDate() : new Date(challenge.createdAt),
        expiresAt: challenge.expiresAt ? new Date(challenge.expiresAt) : null,
        completedAt: challenge.completedAt?.toDate ? challenge.completedAt.toDate() : (challenge.completedAt ? new Date(challenge.completedAt) : null),
      }));
      setChallenges(normalizedChallenges);
      return normalizedChallenges;
    } catch (error) {
      console.error("Error fetching challenges:", error);
      throw error;
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // setLoading(true);
        const uid = Cookies.get("uid");
        if (!uid) return;
        const user = await getUser(uid);
        setUserData(user);
        await fetchChallenges();
      } catch (error) {
        console.error("Error fetching challenges:", error);
        setError(error);
        toast.error("Failed to load challenges");
        setChallenges([]);
      } finally {
        // Arena synchronization complete
      }
    };
    fetchData();
  }, [fetchChallenges]);

  // Lazy-load published study plan topics only when launching challenge creation
  const handleOpenCreateForm = async () => {
    setShowCreateForm(true);
    if (availableTopics.length === 0) {
      try {
        const plans = await getPublishedStudyPlans();
        const topics = [];
        plans.forEach((plan) => {
          if (plan.topics && Array.isArray(plan.topics)) {
            plan.topics.forEach((topic) => {
              if (topic.subtopics && Array.isArray(topic.subtopics)) {
                topic.subtopics.forEach((subtopic) => {
                  if (subtopic.subtopic) topics.push(subtopic.subtopic);
                });
              }
            });
          }
        });
        setAvailableTopics([...new Set(topics)]);
      } catch (error) {
        console.error("Error fetching topics for challenge creation:", error);
        setAvailableTopics([]);
      }
    }
  };

  const getFilteredChallenges = () => {
    const uid = Cookies.get("uid");
    if (!uid) return [];
    switch (activeTab) {
      case "my-challenges": return challenges.filter((c) => c.challengerId === uid);
      case "received": return challenges.filter((c) => c.opponentId === uid && c.status === "pending");
      case "active": return challenges.filter((c) => (c.challengerId === uid || c.opponentId === uid) && (c.status === "accepted" || c.status === "in_progress"));
      case "completed": return challenges.filter((c) => (c.challengerId === uid || c.opponentId === uid) && c.status === "completed");
      default: return [];
    }
  };

  const handleCreateChallenge = async (challengeData) => {
    try {
      setIsCreatingChallenge(true);
      const challengePayload = {
        topic: challengeData.topic,
        challengeType: challengeData.challengeType,
        matchingType: challengeData.matchingType,
        opponentId: challengeData.opponentId || null,
      };
      const newChallenge = await createChallenge(challengePayload);
      const normalizedChallenge = {
        id: newChallenge.id || newChallenge._id,
        ...newChallenge,
        createdAt: newChallenge.createdAt ? new Date(newChallenge.createdAt) : new Date(),
        expiresAt: newChallenge.expiresAt ? new Date(newChallenge.expiresAt) : null,
      };
      setChallenges([normalizedChallenge, ...challenges]);
      await fetchChallenges();
      setShowCreateForm(false);
      toast.success("Challenge issued! Battle awaiting acceptance.");
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Battle initiation failed");
    } finally {
      setIsCreatingChallenge(false);
    }
  };

  const handleAcceptChallenge = async (challengeId) => {
    try {
      const updatedChallenge = await acceptChallenge(challengeId);
      const normalizedChallenge = {
        id: updatedChallenge._id || updatedChallenge.id,
        ...updatedChallenge,
        createdAt: updatedChallenge.createdAt?.toDate ? updatedChallenge.createdAt.toDate() : new Date(updatedChallenge.createdAt),
        expiresAt: updatedChallenge.expiresAt ? new Date(updatedChallenge.expiresAt) : null,
      };
      setChallenges(challenges.map((c) => c.id === challengeId ? normalizedChallenge : c));
      toast.success("Challenge accepted! Good luck.");
    } catch (error) {
       console.error(error);
       toast.error("Failed to accept");
    }
  };

  const handleDeclineChallenge = async (challengeId) => {
    try {
      await declineChallenge(challengeId);
      setChallenges(challenges.map((c) => c.id === challengeId ? { ...c, status: "cancelled" } : c));
      toast.success("Challenge declined");
    } catch (error) {
      console.error(error);
      toast.error("Failed to decline");
    }
  };

  const handleCancelChallenge = async (challengeId) => {
    try {
      await cancelChallenge(challengeId);
      setChallenges(challenges.map((c) => c.id === challengeId ? { ...c, status: "cancelled" } : c));
      toast.success("Challenge revoked");
    } catch (error) {
      console.error(error);
      toast.error("Failed to revoke");
    }
  };

  const handleStartChallenge = (challenge) => {
    const quizTopic = encodeURIComponent(challenge.topic);
    sessionStorage.setItem('currentChallengeId', challenge.id);
    window.location.href = `/l2dashboard/quiz/${quizTopic}?challengeId=${challenge.id}`;
  };

  const tabs = [
    { id: "my-challenges", label: "My Challenges", icon: faTrophy },
    { id: "received", label: "Requests", icon: faUsers },
    { id: "active", label: "Active", icon: faFire },
    { id: "completed", label: "Finished", icon: faCheckCircle },
  ];

  if (error && challenges.length === 0) {
    return <ErrorPage title="Network Error" message="Unable to synchronize with battle arena." error={error} onRetry={() => window.location.reload()} />;
  }

  const filteredChallenges = getFilteredChallenges();

  return (
    <div className="w-full min-h-screen p-4 sm:p-6 lg:p-10 bg-slate-50">
      <ToastContainer autoClose={2000} />
      <div className="max-w-7xl mx-auto">
        {/* Premium Header - Battle Arena */}
        <div className="mb-8 mt-4">
          <div className="relative bg-gradient-to-br from-blue-700 via-indigo-800 to-slate-900 rounded-[2rem] p-5 sm:p-7 text-white shadow-xl overflow-hidden group">
            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:scale-110 transition-transform duration-1000 rotate-12">
              <FontAwesomeIcon icon={faTrophy} className="text-[10rem]" />
            </div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/20 rounded-full blur-[120px] -translate-x-1/2 translate-y-1/2" />
            
            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="max-w-xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full border border-white/10 mb-4 backdrop-blur-md">
                   <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                   <span className="text-[9px] font-black uppercase tracking-[0.25em] text-blue-50">Challenges</span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-black mb-3 tracking-tight leading-none">Show what you know</h1>
                <p className="text-blue-100/70 font-medium text-xs leading-relaxed max-w-lg">
                   Challenge your friends to a quick quiz and see who knows more! Earn points and climb the leaderboard.
                </p>
              </div>

              <div className="flex-shrink-0">
                <button
                  onClick={handleOpenCreateForm}
                  className="group relative h-14 px-8 bg-white text-slate-900 rounded-2xl font-black text-[9px] uppercase tracking-widest shadow-lg transition-all hover:scale-[1.03] active:scale-95 flex items-center gap-3 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-blue-50 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative z-10 w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center transition-transform group-hover:rotate-12">
                    <FontAwesomeIcon icon={faPlus} />
                  </div>
                  <span className="relative z-10 whitespace-nowrap">New Challenge</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation & Stats Bar */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 mb-8 animate-in fade-in slide-in-from-top-6 duration-1000">
           <div className="inline-flex bg-white/60 backdrop-blur-2xl border border-slate-200/60 p-1.5 rounded-[3rem] shadow-sm overflow-x-auto no-scrollbar">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                const count = challenges.filter(c => {
                  const uid = Cookies.get("uid");
                  if (tab.id === "my-challenges") return c.challengerId === uid;
                  if (tab.id === "received") return c.opponentId === uid && c.status === "pending";
                  if (tab.id === "active") return (c.challengerId === uid || c.opponentId === uid) && (c.status === "accepted" || c.status === "in_progress");
                  if (tab.id === "completed") return (c.challengerId === uid || c.opponentId === uid) && c.status === "completed";
                  return false;
                }).length;

                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2.5 px-5 py-2.5 rounded-2xl font-black text-[9px] uppercase tracking-widest transition-all whitespace-nowrap ${
                      isActive 
                        ? "bg-slate-900 text-white shadow-md" 
                        : "text-slate-400 hover:text-slate-700 hover:bg-slate-100/50"
                    }`}
                  >
                    <FontAwesomeIcon icon={tab.icon} className={`text-xs ${isActive ? "text-emerald-400" : ""}`} />
                    {tab.label}
                    {count > 0 && (
                      <span className={`w-5 h-5 rounded-lg flex items-center justify-center text-[9px] font-black transition-colors ${isActive ? "bg-white/15 text-white" : "bg-slate-100 text-slate-500"}`}>
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
           </div>

           <div className="flex items-center gap-6 px-6 py-4 bg-white border border-slate-100 rounded-[2rem] shadow-sm self-start xl:self-auto min-w-[120px]">
              <div className="flex flex-col pr-6">
                 <span className="text-[16px] font-black text-slate-900 leading-none mb-1">{challenges.length}</span>
                 <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Total Challenges</span>
              </div>
           </div>
        </div>

        {filteredChallenges.length === 0 && !loading ? (
          <div className="bg-white/60 backdrop-blur-3xl border border-white rounded-[3.5rem] p-32 text-center shadow-xl animate-in zoom-in duration-500">
             <div className="w-32 h-32 bg-slate-50 rounded-[3rem] flex items-center justify-center mx-auto mb-10 text-slate-200 shadow-inner">
                <FontAwesomeIcon icon={activeTab === "received" ? faUsers : faTrophy} className="text-5xl" />
             </div>
             <h3 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">No challenges found</h3>
             <p className="text-slate-500 font-medium text-lg mb-12 max-w-sm mx-auto leading-relaxed">You don't have any challenges here yet. Start a new one to begin!</p>
             {activeTab === "my-challenges" && (
                <button
                  onClick={handleOpenCreateForm}
                  className="h-20 px-12 bg-blue-600 text-white rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-2xl shadow-blue-200 hover:bg-blue-700 hover:translate-y-[-2px] transition-all"
                >
                  Start a Challenge
                </button>
             )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 animate-in fade-in slide-in-from-bottom-12 duration-1000">
            {filteredChallenges.map((challenge) => (
              <ChallengeCard
                key={challenge.id}
                challenge={challenge}
                currentUserId={Cookies.get("uid")}
                onAccept={() => handleAcceptChallenge(challenge.id)}
                onDecline={() => handleDeclineChallenge(challenge.id)}
                onCancel={() => handleCancelChallenge(challenge.id)}
                onViewResults={() => { setSelectedChallenge(challenge); setShowResults(true); }}
                onStart={() => handleStartChallenge(challenge)}
              />
            ))}
          </div>
        )}

        {showCreateForm && (
          <ChallengeForm isOpen={showCreateForm} onClose={() => setShowCreateForm(false)} onSubmit={handleCreateChallenge} availableTopics={availableTopics} userData={userData} />
        )}

        {showResults && selectedChallenge && (
          <ChallengeResults isOpen={showResults} onClose={() => { setShowResults(false); setSelectedChallenge(null); }} challenge={selectedChallenge} currentUserId={Cookies.get("uid")} />
        )}
      </div>
    </div>
  );
};

export default Challenges;
