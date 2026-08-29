import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { 
  MdDashboard, 
  MdRedeem, 
  MdHistory, 
  MdArrowForward,
  MdEvent,
  MdCall
} from "react-icons/md";
import { FaLinkedin } from "react-icons/fa";
import Cookies from "js-cookie";
import { getUser, getRewards, getEvents } from "../utils/apiServices";
import logo from "../assets/logo_colour.png";
import Loading from "../components/Loading";
import DailyQuestion from "../components/DailyQuestion";
import RegisterModal from "../components/RegisterModal";

const getBackendImageUrl = (url) => {
  if (!url) return null;
  if (url.startsWith("http") || url.startsWith("data:")) return url;
  // Fallback BASE URL from apiClient.js logic
  const base = "http://localhost:5001"; 
  return `${base}${url.startsWith("/") ? url : `/${url}`}`;
};



const RewardCard = ({ reward }) => {
  const imageUrl = getBackendImageUrl(reward.image || reward.imageUrl);
  
  return (
    <div className="w-[280px] min-w-[280px] bg-white rounded-2xl text-slate-900 shadow-xl shadow-slate-100 hover:shadow-2xl hover:translate-y-[-4px] transition-all duration-300 flex flex-col group h-[310px] relative overflow-hidden border border-slate-100">
      {/* Top Image Section */}
      <div className="h-40 w-full relative overflow-hidden bg-slate-50 border-b border-slate-100/50 flex items-center justify-center">
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={reward.name || reward.title} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
          />
        ) : (
          <img 
            src={logo} 
            alt="Logo Placeholder" 
            className="w-24 object-contain opacity-30 group-hover:scale-105 transition-transform duration-500" 
          />
        )}
        
        {/* Points Badge overlayed */}
        <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm text-indigo-600 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider shadow-sm border border-slate-100/50">
          {reward.pointsRequired || reward.points || 0} Pts
        </div>
        
        {/* Category Badge overlayed */}
        {reward.category && (
          <div className="absolute top-3 left-3 bg-slate-900/60 backdrop-blur-sm text-white px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider">
            {reward.category}
          </div>
        )}
      </div>

      {/* Content Details */}
      <div className="p-4 flex flex-col flex-grow">
        <h4 className="font-display font-bold text-sm md:text-base text-slate-800 line-clamp-1 group-hover:text-indigo-600 transition-colors duration-300">
          {reward.name || reward.title}
        </h4>
        <p className="text-xs text-slate-400 font-medium line-clamp-3 mt-1.5 leading-relaxed">
          {reward.description}
        </p>
        
        {/* Bottom unlock status */}
        <div className="mt-auto pt-3 border-t border-slate-50 flex items-center justify-between text-[10px]">
          <span className="font-semibold text-slate-400 uppercase tracking-wider">
            Status
          </span>
          <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full uppercase tracking-wider">
            Unlockable
          </span>
        </div>
      </div>
    </div>
  );
};

export default function StudentHome() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [rewards, setRewards] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    let scrollInterval;
    if (rewards.length > 0 && scrollRef.current) {
      scrollInterval = setInterval(() => {
        if (scrollRef.current) {
          const maxScroll = scrollRef.current.scrollWidth - scrollRef.current.clientWidth;
          if (scrollRef.current.scrollLeft >= maxScroll - 1) {
            scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
          } else {
            scrollRef.current.scrollBy({ left: 280 + 32, behavior: 'smooth' });
          }
        }
      }, 4000); // Auto-scroll every 4 seconds
    }
    return () => clearInterval(scrollInterval);
  }, [rewards]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const uid = Cookies.get("uid");
        
        // Parallelize rewards, events, and user profile fetching
        const promises = [getRewards(), getEvents()];
        let userPromiseIndex = -1;
        if (uid) {
          userPromiseIndex = promises.push(getUser(uid)) - 1;
        }

        const results = await Promise.allSettled(promises);

        // 1. Process rewards
        if (results[0].status === "fulfilled") {
          const fetchedRewards = results[0].value;
          let landingRewards = (fetchedRewards || []).filter(reward => reward.landingPage === true);
          if (landingRewards.length === 0) {
            // Fallback: show one reward per category
            const seen = new Set();
            landingRewards = (fetchedRewards || []).filter(reward => {
              if (!seen.has(reward.category)) {
                seen.add(reward.category);
                return true;
              }
              return false;
            });
          }
          setRewards(landingRewards);
        } else {
          console.error("Error fetching rewards:", results[0].reason);
        }

        // 2. Process events
        if (results[1].status === "fulfilled") {
          setEvents(results[1].value || []);
        } else {
          console.error("Error fetching events:", results[1].reason);
        }

        // 3. Process user profile
        if (uid && userPromiseIndex !== -1 && results[userPromiseIndex].status === "fulfilled") {
          const user = results[userPromiseIndex].value;
          if (user) {
            setUserData(user);
          }
        } else if (uid && userPromiseIndex !== -1) {
          console.error("Error fetching user data:", results[userPromiseIndex].reason);
        }

      } catch (error) {
        console.error("Error in fetchData:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleActionClick = (action) => {
    if (!userData) {
      navigate("/login");
      return;
    }
    const isL1 = userData.role === "Level-1";
    if (action.title === "Syllabus Planner") {
      navigate(isL1 ? "/l1dashboard" : "/l2dashboard");
    } else if (action.title === "Marketplace") {
      navigate(isL1 ? "/l1dashboard" : "/l2dashboard/rewards");
    } else if (action.title === "Results") {
      navigate(isL1 ? "/l1dashboard/quiz-results" : "/l2dashboard/history");
    } else if (action.title === "Industry Events") {
      navigate(isL1 ? "/l1dashboard/events" : "/l2dashboard/events");
    } else {
      navigate(action.path);
    }
  };

  const actions = [
    {
      title: "Syllabus Planner",
      desc: "Map out your study schedule, track syllabus completion, and organize key learning milestones.",
      icon: <MdDashboard />,
      path: "/l2dashboard",
      color: "text-blue-600",
      bg: "bg-blue-50/50",
      accent: "group-hover:bg-blue-600"
    },
    {
      title: "Marketplace",
      desc: "Redeem your hard-earned points for exclusive digital and physical rewards.",
      icon: <MdRedeem />,
      path: "/l2dashboard/rewards",
      color: "text-amber-600",
      bg: "bg-amber-50/50",
      accent: "group-hover:bg-amber-600"
    },
    {
      title: "Results",
      desc: "In-depth analysis of your quiz results and cognitive growth over time.",
      icon: <MdHistory />,
      path: "/l2dashboard/history",
      color: "text-emerald-600",
      bg: "bg-emerald-50/50",
      accent: "group-hover:bg-emerald-600"
    },
    {
      title: "Industry Events",
      desc: "Stay updated with live masterclasses, join webinar discussions, and explore networking opportunities.",
      icon: <MdEvent />,
      path: "/l2dashboard/events",
      color: "text-purple-600",
      bg: "bg-purple-50/50",
      accent: "group-hover:bg-purple-600"
    }
  ];

  if (loading) {
    return <Loading message="Preparing your workspace..." fullScreen={true} />;
  }

  const filteredActions = actions.filter(action => {
    if (action.title === "Marketplace" && userData?.role === "Level-1") return false;
    return true;
  });

  return (
    <div className="home-page min-h-screen bg-[#fcfcfd] flex flex-col text-slate-900 selection:bg-blue-100 selection:text-blue-900">
      {/* Background elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-50/40 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/4 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-50/40 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/4"></div>
      </div>

      {/* Modern Header Removed */}

      {/* Main Container */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-8 py-16">
        {/* Top Hero & Events Split Section */}
        <section className="mb-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch animate-fadeIn">
          {/* Left Column: Hero & Action Buttons */}
          <div className="lg:col-span-5 flex flex-col p-8 sm:p-10 bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-100/50 relative overflow-hidden group">
            {/* Background blur decorative element */}
            <div className="absolute top-0 left-0 w-64 h-64 bg-blue-100/50 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/3 pointer-events-none group-hover:scale-110 transition-transform duration-500"></div>

            {/* Header rail. Fixed height so the wordmark and the events card
                heading opposite it sit on the same line, and everything below
                starts at the same y in both columns. */}
            <div className="relative z-10 flex items-center min-h-[3.5rem] mb-8">
              <div className="flex items-center gap-3">
                <img src={logo} alt="Logo" className="w-10 h-10 object-cover rounded-full border-2 border-white shadow-md" />
                <span className="font-display text-[11px] font-bold tracking-[0.28em] text-indigo-600 uppercase">
                  Truesight
                </span>
              </div>
            </div>

            <div className="relative z-10">
              <h1 className="font-display tracking-display text-4xl sm:text-5xl font-bold text-slate-900 leading-[1.05] mb-5">
                Elevate <br />
                <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">your learning.</span>
              </h1>

              <p className="text-slate-500 text-sm leading-relaxed max-w-sm">
                Welcome to the Truesight Student Platform. Explore modules, complete challenges, track your results, and redeem rewards as you progress.
              </p>
            </div>

            {/* Buttons sit on the card floor, level with the last event row. */}
            <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full mt-auto pt-10">
              <button
                onClick={() => navigate("/login")}
                className="h-14 bg-slate-900 hover:bg-black text-white font-display font-bold text-xs uppercase tracking-[0.18em] rounded-2xl shadow-lg active:scale-95 transition-all duration-300"
              >
                Login
              </button>
              <button
                onClick={() => setShowRegisterModal(true)}
                className="h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-display font-bold text-xs uppercase tracking-[0.18em] rounded-2xl shadow-lg hover:shadow-indigo-500/20 active:scale-95 transition-all duration-300"
              >
                Register
              </button>
            </div>
          </div>

          {/* Right Column: Event Registry (Next 3 Events) */}
          <div className="lg:col-span-7 flex flex-col p-8 sm:p-10 bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-100/50">
            <div className="flex items-center justify-between gap-6 min-h-[3.5rem] mb-8">
              <div>
                <h2 className="font-display text-2xl font-bold text-slate-900 leading-tight">Upcoming Events</h2>
                <p className="text-xs font-medium text-slate-400 mt-1">Next 3 events to look out for</p>
              </div>
              <button
                onClick={() => navigate("/events")}
                className="flex-shrink-0 font-display text-[11px] font-bold uppercase tracking-[0.18em] text-indigo-600 hover:text-indigo-700 transition-colors flex items-center gap-1.5"
              >
                View All <MdArrowForward className="text-sm" />
              </button>
            </div>

            {events.length > 0 ? (
              <div className="flex flex-col gap-3">
                {events.slice(0, 3).map((event) => {
                  const start = new Date(event.dateTimeStart);
                  const formattedDate = start.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit"
                  });
                  return (
                    <div 
                      key={event.id || event._id}
                      onClick={() => navigate(`/events/${event.id || event._id}`)}
                      className="group cursor-pointer min-h-[5.25rem] p-4 bg-slate-50 hover:bg-indigo-50/50 rounded-2xl border border-slate-100 hover:border-indigo-100 flex items-center gap-4 transition-all duration-300 active:scale-[0.99]"
                    >
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0 text-white font-display font-bold text-xs shadow-sm overflow-hidden">
                        {event.bannerUrl ? (
                          <img src={event.bannerUrl} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        ) : (
                          <span>EV</span>
                        )}
                      </div>
                      {/* min-w-0 lets long titles truncate instead of pushing
                          the View pill out of its column. */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-display font-bold text-sm text-slate-800 line-clamp-2 sm:truncate group-hover:text-indigo-600 transition-colors">
                          {event.title}
                        </h4>
                        <span className="text-[11px] text-slate-400 font-medium mt-1 block truncate">
                          {formattedDate} • {event.eventType === "online" ? "💻 Online" : "📍 In-Person"}
                        </span>
                      </div>
                      <span className="flex-shrink-0 w-20 text-center font-display text-[10px] font-bold uppercase tracking-[0.18em] text-indigo-600 bg-white border border-slate-100 py-2 rounded-xl group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600 transition-all shadow-sm">
                        View
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex-1 min-h-[10rem] rounded-2xl border border-dashed border-slate-200 flex items-center justify-center text-sm font-medium text-slate-400">
                No upcoming events scheduled.
              </div>
            )}

            {/* With fewer than three events the list would leave a hole at the
                bottom of the card, so a calendar link takes up the slack. */}
            {events.length > 0 && events.length < 3 && (
              <button
                onClick={() => navigate("/events")}
                className="mt-3 flex-1 min-h-[5.25rem] w-full rounded-2xl border border-dashed border-slate-200 hover:border-indigo-200 hover:bg-indigo-50/30 flex items-center justify-center gap-2 font-display text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400 hover:text-indigo-600 transition-all duration-300"
              >
                Browse the full calendar <MdArrowForward className="text-sm" />
              </button>
            )}
          </div>
        </section>

        {/* Daily Question. Full container width so its edges line up with the
            hero and events cards directly above it. */}
        <section className="mb-24 w-full">
          <DailyQuestion />
        </section>



        {/* Rewards Section */}
        <section className="mb-24 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="mb-10">
            <h2 className="font-display text-3xl font-bold text-slate-900 tracking-display mb-3 flex items-center gap-3">
              <MdRedeem className="text-purple-600" />
              Available Rewards
            </h2>
            <div className="h-1.5 w-12 bg-purple-600 rounded-full"></div>
          </div>
          
          <div 
            ref={scrollRef}
            className="flex overflow-x-auto gap-8 no-scrollbar pb-10 -mx-8 px-8 sm:mx-0 sm:px-0 scroll-smooth"
          >
            {rewards.length > 0 ? (
              rewards.map((reward, i) => <RewardCard key={i} reward={reward} />)
            ) : (
              <div className="w-full text-center py-12 text-slate-400 italic text-sm">
                No rewards available at the moment.
              </div>
            )}
          </div>
        </section>

        {/* Overview Grid */}
        <section className="mb-24">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="font-display text-3xl font-bold text-slate-900 tracking-display mb-3">
                Explore Modules
              </h2>
              <div className="h-1.5 w-12 bg-blue-600 rounded-full"></div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredActions.map((action, i) => (
              <div 
                key={i}
                onClick={() => handleActionClick(action)}
                className="group cursor-pointer border border-slate-100 rounded-[2rem] p-10 bg-white hover:border-blue-100 hover:shadow-[0_20px_50px_rgba(30,41,59,0.08)] transition-all duration-300 flex flex-col h-full active:scale-[0.98]"
              >
                <div className={`w-16 h-16 ${action.bg} ${action.color} rounded-2xl flex items-center justify-center text-3xl mb-8 shadow-sm transition-all duration-300 group-hover:scale-110 ${action.accent} group-hover:text-white`}>
                  {action.icon}
                </div>
                <h3 className="font-display text-2xl font-bold text-slate-900 mb-4 group-hover:text-blue-600 transition-colors">
                  {action.title}
                </h3>
                <p className="text-slate-500 text-sm leading-relaxed mb-auto pb-8">
                  {action.desc}
                </p>
                <div className="font-display text-[11px] font-bold text-blue-600 uppercase tracking-[0.18em] flex items-center">
                  Access Portal <MdArrowForward className="ml-2 text-base group-hover:translate-x-2 transition-transform duration-300" />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Company Info Section */}
        <section className="group relative">
          <div className="absolute inset-0 bg-blue-600 rounded-[3rem] shadow-xl translate-y-3 scale-[0.98] blur-sm opacity-20 transition-transform duration-500 group-hover:scale-100"></div>
          <div className="relative bg-slate-900 rounded-[3rem] p-12 lg:p-16 flex flex-col lg:flex-row items-center justify-between gap-12 overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600 rounded-full blur-[120px] opacity-20 -translate-y-1/2 translate-x-1/4"></div>
            
            <div className="relative z-10 max-w-2xl text-center lg:text-left">
              <span className="font-display text-xs font-bold text-blue-500 uppercase tracking-[0.22em] block mb-3">Founder</span>
              <h2 className="font-display text-3xl lg:text-4xl font-bold text-white mb-3 leading-tight tracking-display">Yadu Aravind</h2>
              <a 
                href="https://www.linkedin.com/in/yadu-aravind-a493375a/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 text-sm font-semibold transition-colors inline-flex items-center gap-1.5 mb-6"
              >
                <FaLinkedin className="text-lg" /> LinkedIn Profile
              </a>
              
              <div className="text-slate-300 text-sm sm:text-base leading-relaxed space-y-2 mt-4">
                <p className="font-bold text-slate-400 text-xs uppercase tracking-wider">Registered Office</p>
                <p className="text-slate-300 font-medium">
                  R519, Purva Park, Jeevanahalli Main Road,<br />
                  Fraser Town, Karnataka, Bangalore,<br />
                  Bangalore North, 560005
                </p>
              </div>
            </div>
            
            <div className="relative z-10 flex flex-col items-center lg:items-end gap-3 flex-shrink-0">
              <span className="text-slate-400 text-xs sm:text-sm font-bold uppercase tracking-wider">Support Contact</span>
              <a 
                href="tel:+919746398389"
                className="px-8 py-4 sm:px-10 sm:py-5 bg-white text-slate-900 rounded-2xl font-display font-bold uppercase tracking-[0.18em] hover:bg-blue-50 transition-all duration-300 flex items-center gap-3 active:scale-95 shadow-lg text-sm sm:text-base"
              >
                <MdCall className="text-xl text-blue-600" />
                +91 97463 98389
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* Premium Footer */}
      <footer className="border-t border-slate-100 px-8 py-12 bg-white">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-3 grayscale opacity-30">
            <img src={logo} alt="Logo" className="h-6" />
            <span className="text-sm font-bold tracking-tight">TRUESIGHT</span>
          </div>
          <p className="font-display text-[10px] font-bold text-slate-400 uppercase tracking-[0.25em]">© 2026 Truesight Student Platform. All Performance Data Encrypted.</p>
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-slate-50 border border-slate-100"></div>
            <div className="w-8 h-8 rounded-full bg-slate-50 border border-slate-100"></div>
          </div>
        </div>
      </footer>
      <RegisterModal
        isOpen={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
      />
    </div>
  );
}
