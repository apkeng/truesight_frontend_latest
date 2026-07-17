import React, { useState, useEffect, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faTrophy, faStar, faClock, faGift, faRocket, faHistory, 
  faCamera, faUpload, faTimes, faChevronRight, faCircleCheck,
  faFire, faMagicWandSparkles, faHeart, faTshirt, faDragon, faChartLine, faSearch,
  faMedal, faCrown, faCheckCircle, faGraduationCap, faLaptop, faGem, faPalette, faXmark
} from "@fortawesome/free-solid-svg-icons";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Loading from "./Loading";
import RewardDetails from "./rewards/RewardDetails";
import RedemptionFlow from "./rewards/RedemptionFlow";

import { storage, auth } from "../firebase/firebase-config";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { onAuthStateChanged } from "firebase/auth";
import Cookies from "js-cookie";
import { getUser, getRewards, getRedemptions, createRedemption, updateUser } from "../utils/apiServices";

const Rewards = () => {
  const [loading, setLoading] = useState(true);
  const [availableRewards, setAvailableRewards] = useState([]);
  const [earnedRewards, setEarnedRewards] = useState([]);
  const [redeemedRewardsDetails, setRedeemedRewardsDetails] = useState([]);
  const [uploading, setUploading] = useState(false);
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
      console.log("Rewards fetched from backend API:", rewards.length);
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
      const redemptions = await getRedemptions({});
      
      // Store full redemption details for display
      const redemptionDetails = redemptions.map(redemption => ({
        id: redemption._id || redemption.id,
        ...redemption
      }));
      
      // Sort by redemption date (newest first)
      redemptionDetails.sort((a, b) => {
        const dateA = a.redeemedAt ? new Date(a.redeemedAt) : new Date(0);
        const dateB = b.redeemedAt ? new Date(b.redeemedAt) : new Date(0);
        return dateB - dateA;
      });
      setRedeemedRewardsDetails(redemptionDetails);
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
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-10 mb-20">
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
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-10 mb-20">
        <ToastContainer autoClose={3000} />
        <RedemptionFlow
          reward={selectedReward}
          specifications={selectedReward.selectedSpecs}
          userPoints={userStats.totalPoints}
          onBack={() => setView("REWARD_DETAILS")}
          onComplete={(orderData) => {
            console.log("Redemption complete:", orderData);
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
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-10 mb-4 scroll-mt-20">
        <div className="mb-8 mt-4">
          <div className="relative bg-gradient-to-br from-indigo-700 via-indigo-950 to-slate-950 rounded-3xl p-6 sm:p-8 text-white shadow-2xl overflow-hidden group border border-white/10">
            <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:scale-110 transition-transform duration-1000">
              <FontAwesomeIcon icon={faTrophy} className="text-[10rem] -rotate-12" />
            </div>
            
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex-1 min-w-0">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full border border-white/10 mb-4 backdrop-blur-md">
                   <FontAwesomeIcon icon={faMagicWandSparkles} className="text-[10px] text-indigo-300" />
                   <span className="text-[10px] font-black uppercase tracking-widest text-indigo-50">Rewards Center</span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-black mb-2 tracking-tight leading-none">Institutional Prize Vault</h1>
                <p className="text-indigo-100/70 font-medium text-xs max-w-xl leading-relaxed italic opacity-90">
                   Exchange your hard-earned mastery points for exclusive status symbols and certifications.
                </p>
              </div>
              <div className="flex items-center gap-6">
                 <div className="bg-white/10 backdrop-blur-xl px-6 py-3 rounded-2xl border border-white/10 flex flex-col items-center min-w-[100px]">
                    <span className="text-3xl font-black">{availableRewards.length}</span>
                    <span className="text-[8px] font-black uppercase tracking-widest text-indigo-200 mt-1">AVAILABLE</span>
                 </div>
                 <div className="flex items-center gap-3 px-4 py-2 bg-emerald-500/20 rounded-xl border border-emerald-500/30 backdrop-blur-md">
                    <FontAwesomeIcon icon={faFire} className="text-emerald-400 animate-pulse text-xs" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-100">VAULT ACTIVE</span>
                 </div>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Layout */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar - Category Filter */}
          <aside className="lg:w-56 flex-shrink-0">
            <div className="sticky top-24 space-y-4">
              {/* Search Bar */}
              <div className="relative group">
                <FontAwesomeIcon icon={faSearch} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-indigo-500" />
                <input
                  type="text"
                  placeholder="Search vault..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-12 pl-11 pr-4 rounded-xl border border-slate-100 bg-white text-xs font-bold shadow-sm focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all outline-none"
                />
              </div>

              {/* Categories */}
              <div className="bg-white rounded-2xl p-5 border border-slate-50 shadow-sm">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3 ml-1">Collections</h3>
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
                      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-black transition-all group ${
                        selectedCategory === cat.id 
                          ? "bg-slate-900 text-white shadow-xl shadow-slate-200 translate-x-1" 
                          : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                    >
                      <FontAwesomeIcon icon={cat.icon} className={`text-xs ${selectedCategory === cat.id ? 'text-indigo-400' : 'text-slate-300 group-hover:text-slate-400'}`} />
                      <span className="tracking-tight">{cat.name}</span>
                    </button>
                  ))}
                </nav>
              </div>

              {/* Point Balance */}
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-5 text-white shadow-md border border-slate-700/30">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400 text-lg">
                    <FontAwesomeIcon icon={faStar} />
                  </div>
                  <div>
                    <div className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Point Balance</div>
                    <div className="text-xl font-black mt-0.5 tracking-tight text-white">
                      {userStats.totalPoints.toLocaleString()} <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">Pts</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content Area */}
          <div className="flex-1 min-w-0">



            {/* Results Info */}
            <div className="mb-6 flex items-baseline gap-2 px-2">
              <span className="text-sm font-bold text-slate-400">Showing</span>
              <span className="text-sm font-black text-slate-900">{filteredRewards.length} results</span>
              {selectedCategory !== "all" && (
                <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100/50 capitalize">
                  {selectedCategory}
                </span>
              )}
            </div>

            {/* Scrollable Container for Rewards Grid */}
            <div 
              onScroll={handleScroll}
              className="max-h-[calc(100vh-320px)] lg:max-h-[660px] overflow-y-auto pr-3"
            >
              {/* Rewards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-4">
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
                      className={`group relative bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col h-[320px] justify-between cursor-pointer ${
                        !isAccessible ? 'opacity-40 grayscale pointer-events-none' : 'hover:translate-y-[-2px]'
                      }`}
                    >
                      {/* Image Header */}
                      <div className="relative h-36 bg-slate-50 overflow-hidden border-b border-slate-100">
                        {showImage ? (
                          <img
                            src={reward.imageUrl}
                            alt={reward.name}
                            className="w-full h-full object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-105"
                            onError={() => setImageErrors(prev => ({ ...prev, [reward.id]: true }))}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-50/50 via-slate-50 to-slate-100">
                            <FontAwesomeIcon 
                              icon={getIconFromString(reward.icon)} 
                              className="text-4xl text-indigo-400/30 transition-transform duration-500 group-hover:scale-110" 
                            />
                          </div>
                        )}
                        
                        {/* Floating Points Badge */}
                        <div className="absolute top-4 left-4 bg-slate-900/90 backdrop-blur-md text-white px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1 border border-white/10 shadow-sm">
                          <FontAwesomeIcon icon={faStar} className="text-amber-400 text-[10px]" />
                          <span>{reward.pointsRequired} Pts</span>
                        </div>
                        
                        {/* Floating Category Badge */}
                        <div className={`absolute top-4 right-4 ${categoryInfo.bgColor || 'bg-slate-100'} ${categoryInfo.color || 'text-slate-600'} px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border border-white/20 shadow-sm`}>
                          {categoryInfo.name || reward.category}
                        </div>

                        {/* Earned Checkmark Indicator */}
                        {isUnlocked && isAccessible && (
                          <div className="absolute bottom-3 right-3 bg-emerald-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-black shadow-lg border-2 border-white">
                            ✓
                          </div>
                        )}
                      </div>

                      {/* Content Area */}
                      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
                        <div className="space-y-1">
                          <h3 className="font-bold text-sm text-slate-800 line-clamp-2 leading-snug tracking-tight group-hover:text-indigo-600 transition-colors uppercase">
                            {reward.name}
                          </h3>
                          <p className="text-xs text-slate-400 font-medium line-clamp-2 leading-relaxed">
                            {reward.description || "Premium academic reward reserved for dedicated students."}
                          </p>
                        </div>

                        <button
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            setSelectedReward(reward);
                            setView("REWARD_DETAILS");
                          }}
                          className={`w-full py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2 border ${
                            canRedeem 
                              ? "bg-slate-900 text-white hover:bg-indigo-600 hover:border-indigo-600 shadow-md hover:shadow-indigo-100 border-slate-900" 
                              : "bg-slate-50 text-slate-400 border-slate-100 cursor-not-allowed"
                          }`}
                        >
                          {canRedeem ? (
                            <>
                              <FontAwesomeIcon icon={faMagicWandSparkles} className="text-xs" />
                              View Options
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
                <div className="py-6 text-center text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 animate-pulse">
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