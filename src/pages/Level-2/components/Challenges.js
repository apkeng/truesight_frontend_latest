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
import {
  Button,
  EmptyState,
  PageBanner,
  PageShell,
  SectionLabel,
} from "../../../components/ui";
import { getUser, getPublishedStudyPlans, getChallenges, createChallenge, acceptChallenge, declineChallenge, cancelChallenge } from "../../../utils/apiServices";

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
    <PageShell>
      <ToastContainer autoClose={2000} />

      <PageBanner
        title="Show what you know"
        subtitle="Challenge your friends to a quick quiz and see who knows more. Earn points and climb the leaderboard."
        actions={
          <Button variant="secondary" size="lg" onClick={handleOpenCreateForm}>
            <FontAwesomeIcon icon={faPlus} /> New challenge
          </Button>
        }
      />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex overflow-x-auto no-scrollbar border border-line bg-white">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const count = challenges.filter((c) => {
              const uid = Cookies.get("uid");
              if (tab.id === "my-challenges") return c.challengerId === uid;
              if (tab.id === "received") return c.opponentId === uid && c.status === "pending";
              if (tab.id === "active")
                return (
                  (c.challengerId === uid || c.opponentId === uid) &&
                  (c.status === "accepted" || c.status === "in_progress")
                );
              if (tab.id === "completed")
                return (c.challengerId === uid || c.opponentId === uid) && c.status === "completed";
              return false;
            }).length;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex h-10 items-center gap-2 whitespace-nowrap px-5 text-[11px] font-semibold uppercase tracking-[0.14em] transition-colors ${
                  isActive
                    ? "bg-navy text-white"
                    : "text-ink-muted hover:bg-navy-wash hover:text-navy"
                }`}
              >
                <FontAwesomeIcon icon={tab.icon} className="text-xs" />
                {tab.label}
                {count > 0 && (
                  <span
                    className={`flex h-5 min-w-[1.25rem] items-center justify-center px-1 text-[10px] ${
                      isActive ? "bg-white/20 text-white" : "bg-parchment text-ink-muted"
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
        <SectionLabel>{challenges.length} challenges</SectionLabel>
      </div>

      {filteredChallenges.length === 0 && !loading ? (
        <EmptyState
          title="No challenges here yet"
          description="Nothing is logged under this tab. Start a new challenge to get going."
          action={
            activeTab === "my-challenges" && (
              <Button onClick={handleOpenCreateForm}>Start a challenge</Button>
            )
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredChallenges.map((challenge) => (
            <ChallengeCard
              key={challenge.id}
              challenge={challenge}
              currentUserId={Cookies.get("uid")}
              onAccept={() => handleAcceptChallenge(challenge.id)}
              onDecline={() => handleDeclineChallenge(challenge.id)}
              onCancel={() => handleCancelChallenge(challenge.id)}
              onViewResults={() => {
                setSelectedChallenge(challenge);
                setShowResults(true);
              }}
              onStart={() => handleStartChallenge(challenge)}
            />
          ))}
        </div>
      )}

      {showCreateForm && (
        <ChallengeForm
          isOpen={showCreateForm}
          onClose={() => setShowCreateForm(false)}
          onSubmit={handleCreateChallenge}
          availableTopics={availableTopics}
          userData={userData}
        />
      )}

      {showResults && selectedChallenge && (
        <ChallengeResults
          isOpen={showResults}
          onClose={() => {
            setShowResults(false);
            setSelectedChallenge(null);
          }}
          challenge={selectedChallenge}
          currentUserId={Cookies.get("uid")}
        />
      )}
    </PageShell>
  );
};

export default Challenges;
