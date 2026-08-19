import React, { useState, useEffect, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTrophy, faStar, faClock, faGift,
  faMagicWandSparkles, faHeart, faTshirt, faDragon, faChartLine, faSearch,
  faMedal, faCrown, faLaptop, faGem, faPalette
} from "@fortawesome/free-solid-svg-icons";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Loading from "./Loading";
import RewardDetails from "./rewards/RewardDetails";
import RedemptionFlow from "./rewards/RedemptionFlow";

import Cookies from "js-cookie";
import { getUser, getRewards, getRedemptions } from "../utils/apiServices";
import { Badge, PageBanner, SectionLabel } from "./ui";

const Rewards = () => {
  const [loading, setLoading] = useState(true);
  const [availableRewards, setAvailableRewards] = useState([]);
  const [earnedRewards, setEarnedRewards] = useState([]);
  const [imageErrors, setImageErrors] = useState({});
  const [userStats, setUserStats] = useState({ totalPoints: 0 });
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [view, setView] = useState("VIEW_ALL"); // VIEW_ALL, REWARD_DETAILS, REDEMPTION_FLOW
  const [selectedReward, setSelectedReward] = useState(null);
  const [visibleCount, setVisibleCount] = useState(6);

  useEffect(() => {
    setVisibleCount(6);
  }, [selectedCategory, searchQuery]);

  // Fetch user points
  const fetchUserPoints = useCallback(async () => {
    setLoading(true);
    try {
      const uid = Cookies.get("uid");
      if (!uid) {
        toast.error("User not authenticated");
        setLoading(false);
        return;
      }

      const userData = await getUser(uid);
      if (userData) {
        setUserStats({ totalPoints: userData.userPoints || 0 });
      }
    } catch (error) {
      console.error("Error fetching points:", error);
      toast.error(`Failed to load points: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  // Separate effect to update earned rewards when availableRewards or totalPoints change
  useEffect(() => {
    if (availableRewards.length > 0 && userStats.totalPoints !== undefined) {
      const earned = availableRewards.filter(reward => userStats.totalPoints >= reward.pointsRequired);
      setEarnedRewards(earned);
    }
  }, [availableRewards, userStats.totalPoints]);

  // Map icon strings to FontAwesome icon objects
  const getIconFromString = (iconString) => {
    const iconMap = {
      heart: faHeart,
      dragon: faDragon,
      tshirt: faTshirt,
      "chart-line": faChartLine,
      gift: faGift,
      trophy: faTrophy,
      medal: faMedal,
      crown: faCrown,
      star: faStar,
      laptop: faLaptop,
      gem: faGem,
      palette: faPalette
    };
    return iconMap[iconString] || faGift; // Default to gift icon if not found
  };

  // Fetch available rewards from Firestore
  const generateRewards = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch rewards from backend API
      const rewardsData = await getRewards();
      
      const rewards = rewardsData
        .filter(reward => reward.accessible !== false)
        .map((data) => ({
          id: data.id || data._id, // Use numeric id or doc id
            ...data,
            icon: getIconFromString(data.icon),
          docId: data.docId || data._id || data.id // Keep doc ID for reference
        }));
        
        // Sort by points required
        rewards.sort((a, b) => a.pointsRequired - b.pointsRequired);
        
        setAvailableRewards(rewards);
    } catch (error) {
      console.error("Error fetching rewards:", error);
      toast.error("Failed to load rewards. Please try again later.");
      // Set empty array on error
      setAvailableRewards([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch redeemed rewards for this user
  const fetchRedeemedRewards = useCallback(async () => {
    try {
      const uid = Cookies.get("uid");
      if (!uid) return;

      // Fetch redemptions from backend API
      await getRedemptions({});
    } catch (error) {
      console.error("Error fetching redeemed rewards:", error);
    }
  }, []);

  useEffect(() => {
    // Initial data fetch - only run once on mount
    fetchUserPoints();
    generateRewards();
    fetchRedeemedRewards();
  }, [fetchUserPoints, generateRewards, fetchRedeemedRewards]); // Include all dependencies

  // Get category information
  const getCategoryInfo = (category) => {
    const categories = {
      all: { name: "All Categories", icon: faGift, color: "text-gray-600", bgColor: "bg-gray-100" },
      wellness: { name: "Wellness", icon: faHeart, color: "text-red-600", bgColor: "bg-red-100" },
      apparel: { name: "Apparel", icon: faTshirt, color: "text-green-600", bgColor: "bg-green-100" },
      fantasy: { name: "Fantasy", icon: faDragon, color: "text-indigo-600", bgColor: "bg-indigo-100" },
      trend: { name: "Trend", icon: faChartLine, color: "text-purple-600", bgColor: "bg-purple-100" }
    };
    return categories[category] || categories.all;
  };


  if (loading) {
    return <Loading message="Loading rewards..." />;
  }

  // Filter rewards based on category and search query
  const filteredRewards = availableRewards.filter(reward => {
    const matchesCategory = selectedCategory === "all" || reward.category === selectedCategory;
    const matchesSearch = reward.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         reward.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const paginatedRewards = filteredRewards.slice(0, visibleCount);

  const handleScroll = (e) => {
    const { scrollTop, clientHeight, scrollHeight } = e.target;
    // Load 6 more when user scrolls near the bottom of the container
    if (scrollHeight - scrollTop - clientHeight < 50) {
      if (visibleCount < filteredRewards.length) {
        setVisibleCount(prev => Math.min(prev + 6, filteredRewards.length));
      }
    }
  };

  if (view === "REWARD_DETAILS" && selectedReward) {
    return (
      <div className="mx-auto w-full max-w-6xl pb-16">
        <ToastContainer autoClose={2000} />
        <RewardDetails
          reward={selectedReward}
          userPoints={userStats.totalPoints}
          onBack={() => setView("VIEW_ALL")}
          onRedeem={(reward, specs) => {
            setSelectedReward(reward);
            // We'll store specs in a temporary state if needed, or pass them directly
            setSelectedReward({...reward, selectedSpecs: specs});
            setView("REDEMPTION_FLOW");
          }}
        />
      </div>
    );
  }

  if (view === "REDEMPTION_FLOW" && selectedReward) {
    return (
      <div className="mx-auto w-full max-w-6xl pb-16">
        <ToastContainer autoClose={3000} />
        <RedemptionFlow
          reward={selectedReward}
          specifications={selectedReward.selectedSpecs}
          userPoints={userStats.totalPoints}
          onBack={() => setView("REWARD_DETAILS")}
          onComplete={() => {
            toast.success("🎉 Reward redeemed successfully! Your order is being processed.");
            fetchUserPoints(); // Refresh points
            fetchRedeemedRewards(); // Refresh rewards
          }}
        />
      </div>
    );
  }

  return (
    <>
      <ToastContainer autoClose={2000} />
      <div className="mx-auto w-full max-w-6xl space-y-8 pb-16 scroll-mt-20">
        <PageBanner
          title="Rewards"
          subtitle="Exchange the points you have earned for the rewards available to your institute."
          stat={{ value: availableRewards.length, label: "Available" }}
        />

        {/* Dashboard Layout */}
        <div className="flex flex-col gap-6 lg:flex-row">
          {/* Sidebar - Category Filter */}
          <aside className="lg:w-56 flex-shrink-0">
            <div className="space-y-4 lg:sticky lg:top-8">
              {/* Search Bar */}
              <div className="relative group">
                <FontAwesomeIcon icon={faSearch} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-ink-muted" />
                <input
                  type="text"
                  placeholder="Search vault..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-10 w-full border border-line bg-white pl-9 pr-3 text-sm text-ink outline-none transition-colors placeholder:text-ink-muted focus:border-navy"
                />
              </div>

              {/* Categories */}
              <div className="border border-line bg-white p-5">
                <h3 className="mb-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-muted">Collections</h3>
                <nav className="space-y-1">
                  {[
                    { id: "all", name: "All Vaults", icon: faGift },
                    { id: "wellness", name: "Wellness", icon: faHeart },
                    { id: "apparel", name: "Apparel", icon: faTshirt },
                    { id: "fantasy", name: "Fantasy", icon: faDragon },
                    { id: "trend", name: "Trend", icon: faChartLine }
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`flex w-full items-center gap-3 px-4 py-2.5 text-xs font-semibold transition-colors ${
                        selectedCategory === cat.id
                          ? "bg-navy text-white"
                          : "text-ink-muted hover:bg-navy-wash hover:text-navy"
                      }`}
                    >
                      <FontAwesomeIcon icon={cat.icon} className="text-xs" />
                      <span>{cat.name}</span>
                    </button>
                  ))}
                </nav>
              </div>

              {/* Point Balance */}
              <div className="bg-ink p-5 text-white">
                <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/50">
                  Point balance
                </div>
                <div className="mt-1 font-display text-2xl font-bold">
                  {userStats.totalPoints.toLocaleString()}
                  <span className="ml-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/50">
                    pts
                  </span>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content Area */}
          <div className="flex-1 min-w-0">



            {/* Results Info */}
            <div className="mb-4 flex items-center gap-3">
              <SectionLabel>{filteredRewards.length} rewards</SectionLabel>
              {selectedCategory !== "all" && (
                <Badge tone="navy" className="capitalize">
                  {selectedCategory}
                </Badge>
              )}
            </div>

            {/* Scrollable Container for Rewards Grid */}
            <div 
              onScroll={handleScroll}
              className="max-h-[calc(100vh-320px)] lg:max-h-[660px] overflow-y-auto pr-3"
            >
              {/* Rewards Grid */}
              <div className="grid grid-cols-1 gap-4 pb-4 sm:grid-cols-2 lg:grid-cols-3">
                {paginatedRewards.map((reward) => {
                  const isEarned = userStats.totalPoints >= reward.pointsRequired;
                  const isUnlocked = earnedRewards.some(earned => earned.id === reward.id);
                  const isAccessible = reward.accessible === true;
                  const canRedeem = isAccessible && isEarned;
                  const showImage = reward.imageUrl && !imageErrors[reward.id];
                  const categoryInfo = getCategoryInfo(reward.category);
                  
                  return (
                    <div
                      key={reward.id}
                      onClick={() => {
                        setSelectedReward(reward);
                        setView("REWARD_DETAILS");
                      }}
                      className={`group relative flex h-[320px] cursor-pointer flex-col justify-between border border-line bg-white transition-colors ${
                        !isAccessible ? "pointer-events-none opacity-40 grayscale" : "hover:border-navy/40"
                      }`}
                    >
                      {/* Image Header */}
                      <div className="relative h-36 overflow-hidden border-b border-line-soft bg-parchment">
                        {showImage ? (
                          <img
                            src={reward.imageUrl}
                            alt={reward.name}
                            className="w-full h-full object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-105"
                            onError={() => setImageErrors(prev => ({ ...prev, [reward.id]: true }))}
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-parchment">
                            <FontAwesomeIcon
                              icon={getIconFromString(reward.icon)}
                              className="text-4xl text-navy/20"
                            />
                          </div>
                        )}
                        
                        {/* Floating Points Badge */}
                        <div className="absolute left-3 top-3 flex items-center gap-1 bg-navy px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-white">
                          <FontAwesomeIcon icon={faStar} className="text-[9px]" />
                          <span>{reward.pointsRequired} Pts</span>
                        </div>
                        
                        {/* Floating Category Badge */}
                        <div className="absolute right-3 top-3 border border-line bg-white px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-muted">
                          {categoryInfo.name || reward.category}
                        </div>

                        {/* Earned Checkmark Indicator */}
                        {isUnlocked && isAccessible && (
                          <div className="absolute bottom-3 right-3 flex h-7 w-7 items-center justify-center bg-emerald-600 text-sm text-white">
                            ✓
                          </div>
                        )}
                      </div>

                      {/* Content Area */}
                      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
                        <div className="space-y-1">
                          <h3 className="line-clamp-2 font-display text-sm font-bold leading-snug text-ink">
                            {reward.name}
                          </h3>
                          <p className="line-clamp-2 text-xs leading-relaxed text-ink-muted">
                            {reward.description || "Premium academic reward reserved for dedicated students."}
                          </p>
                        </div>

                        <button
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            setSelectedReward(reward);
                            setView("REWARD_DETAILS");
                          }}
                          className={`flex h-10 w-full items-center justify-center gap-2 border text-[10px] font-semibold uppercase tracking-[0.14em] transition-colors ${
                            canRedeem
                              ? "border-navy bg-navy text-white hover:bg-navy-dark"
                              : "cursor-not-allowed border-line bg-parchment text-ink-muted"
                          }`}
                        >
                          {canRedeem ? (
                            <>
                              <FontAwesomeIcon icon={faMagicWandSparkles} className="text-xs" />
                              View options
                            </>
                          ) : (
                            <>
                              <FontAwesomeIcon icon={faClock} className="text-xs opacity-60" />
                              Locked
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
              {visibleCount < filteredRewards.length && (
                <div className="py-6 text-center text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-muted">
                  Scroll to load more rewards
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Redemption Modal */}
    </>
  );
};

export default Rewards;