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
import ErrorPage from "../../../components/ErrorPage";
import ChallengeCard from "../../../components/challenges/ChallengeCard";
import ChallengeForm from "../../../components/challenges/ChallengeForm";
import ChallengeResults from "../../../components/challenges/ChallengeResults";
import { getUser, getStudyPlans, getChallenges, createChallenge, acceptChallenge, declineChallenge, cancelChallenge } from "../../../utils/apiServices";

const Challenges = () => {
  const [activeTab, setActiveTab] = useState("my-challenges");
  const [challenges, setChallenges] = useState([]);
  const [loading] = useState(false);
  const [, setIsCreatingChallenge] = useState(false);
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
        // Data fetch complete
      }
    };
    fetchData();
  }, [fetchChallenges]);

  // Lazy-load published study plan topics only when launching challenge creation
  const handleOpenCreateForm = async () => {
    setShowCreateForm(true);
    if (availableTopics.length === 0) {
      try {
        let instituteCode = userData?.instituteCode;
        if (!instituteCode) {
          const uid = Cookies.get("uid");
          if (uid) {
            const user = await getUser(uid);
            setUserData(user);
            instituteCode = user?.instituteCode;
          }
        }
        if (instituteCode) {
          const plans = await getStudyPlans({ instituteCode });
          const topics = [];
          plans.forEach((plan) => {
            if (plan.topics) {
              plan.topics.forEach((topic) => {
                if (topic.subtopics) {
                  topic.subtopics.forEach((subtopic) => {
                    topics.push(subtopic.subtopic);
                  });
                }
              });
            }
          });
          setAvailableTopics([...new Set(topics)]);
        }
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
      toast.success("Challenge created! Opponent notified.");
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Failed to create challenge");
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
      toast.success("Challenge accepted!");
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Failed to accept");
    }
  };

  const handleDeclineChallenge = async (challengeId) => {
    try {
      await declineChallenge(challengeId);
      setChallenges(challenges.map((c) => c.id === challengeId ? { ...c, status: "cancelled" } : c));
      toast.success("Declined");
    } catch (error) {
      console.error(error);
      toast.error("Failed to decline");
    }
  };

  const handleCancelChallenge = async (challengeId) => {
    try {
      await cancelChallenge(challengeId);
      setChallenges(challenges.map((c) => c.id === challengeId ? { ...c, status: "cancelled" } : c));
      toast.success("Cancelled");
    } catch (error) {
      console.error(error);
      toast.error("Failed to cancel");
    }
  };

  const handleStartChallenge = (challenge) => {
    const quizTopic = encodeURIComponent(challenge.topic);
    sessionStorage.setItem('currentChallengeId', challenge.id);
    window.location.href = `/l1dashboard/quiz/${quizTopic}?challengeId=${challenge.id}`;
  };

  const tabs = [
    { id: "my-challenges", label: "Dispatched", icon: faTrophy },
    { id: "received", label: "Invitations", icon: faUsers },
    { id: "active", label: "Live Battles", icon: faFire },
    { id: "completed", label: "Archive", icon: faCheckCircle },
  ];

  if (error && challenges.length === 0) {
    return <ErrorPage title="Sync Failure" message="Could not retrieve challenge database." error={error} onRetry={() => window.location.reload()} />;
  }

  const filteredChallenges = getFilteredChallenges();

  return (
    <div className="w-full min-h-screen p-4 sm:p-6 lg:p-10 bg-slate-50">
      <ToastContainer autoClose={2000} />
      <div className="max-w-7xl mx-auto">
        {/* Premium Header */}
        <div className="mb-12">
          <div className="relative bg-gradient-to-br from-indigo-700 via-indigo-800 to-purple-900 rounded-[2rem] p-4 sm:p-6 text-white shadow-xl shadow-indigo-100/50 overflow-hidden group">
            <div className="absolute top-0 right-0 p-16 opacity-10 group-hover:scale-110 transition-transform duration-700">
              <FontAwesomeIcon icon={faTrophy} className="text-[12rem]" />
            </div>
            
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full border border-white/10 mb-6 backdrop-blur-md">
                   <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                   <span className="text-[10px] font-black uppercase tracking-widest text-indigo-50">Assessment Engine</span>
                </div>
                <h1 className="text-4xl sm:text-5xl font-black mb-4 tracking-tight">Academic Challenges</h1>
                <p className="text-indigo-100/80 font-medium text-base max-w-xl leading-relaxed italic">
                   Initiate high-stakes competitions, validate student mastery, and monitor academic performance in real-time.
                </p>
              </div>

              <button
                onClick={handleOpenCreateForm}
                className="group relative h-14 px-8 bg-white text-indigo-900 rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest shadow-xl transition-all hover:scale-105 active:scale-95 flex items-center gap-3 overflow-hidden"
              >
                <div className="absolute inset-0 bg-indigo-50 opacity-0 group-hover:opacity-100 transition-opacity" />
                <FontAwesomeIcon icon={faPlus} className="relative z-10" />
                <span className="relative z-10">New Challenge</span>
              </button>
            </div>
          </div>
        </div>

        {/* Improved Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10">
           <div className="flex bg-white/60 backdrop-blur-xl border border-slate-200 p-1.5 rounded-[2.5rem] shadow-sm">
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
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-[1.5rem] font-black text-[9px] uppercase tracking-widest transition-all ${
                      isActive 
                        ? "bg-slate-900 text-white shadow-lg shadow-slate-200" 
                        : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <FontAwesomeIcon icon={tab.icon} className={isActive ? "text-indigo-400" : ""} />
                    {tab.label}
                    {count > 0 && (
                      <span className={`ml-1 w-5 h-5 rounded-full flex items-center justify-center text-[8px] ${isActive ? "bg-white/20" : "bg-slate-100"}`}>
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
           </div>
        </div>

        {/* Content Area */}
        {filteredChallenges.length === 0 && !loading ? (
          <div className="bg-white/40 backdrop-blur-xl border border-white rounded-[3rem] p-24 text-center shadow-xl">
             <div className="w-24 h-24 bg-slate-100 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 text-slate-300">
                <FontAwesomeIcon icon={activeTab === "received" ? faUsers : faTrophy} className="text-4xl" />
             </div>
             <h3 className="text-2xl font-black text-slate-800 mb-2">Zero Records Discovered</h3>
             <p className="text-slate-500 font-medium mb-10 max-w-sm mx-auto">No academic challenges are currently logged in the "{activeTab.replace('-', ' ')}" partition.</p>
             {activeTab === "my-challenges" && (
                <button
                  onClick={handleOpenCreateForm}
                  className="px-10 py-5 bg-indigo-600 text-white rounded-[2rem] font-black text-[10px] uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all"
                >
                  Initiate First Challenge
                </button>
             )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
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
