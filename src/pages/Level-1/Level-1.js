import React, { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faDashboard,
  faUser,
  faProjectDiagram,
  faTrash,
  faSearch,
  faChevronDown,
  faChevronRight,
  faStar,
  faTimes,
  faTrophy,
  faBell,
  faHistory,
  faChevronLeft,
  faMagicWandSparkles,
  faUserShield,
  faUsers,
  faBars,
  faCalendarAlt,
} from "@fortawesome/free-solid-svg-icons";
import { Route, Routes, useNavigate, useLocation } from "react-router-dom";
import Dashboard from "./components/Dashboard";
import Settings from "./components/Settings";
import Profile from "./components/Profile";
import Project from "./components/Project";
import Quiz from "./components/Quiz";
import QuizResults from "./components/QuizResults";
import Challenges from "./components/Challenges";
import { useAuth } from "../../contexts/AuthContext";
import Trash from "./components/Trash";
import History from "../../components/History";
import logo from "../../assets/logo_blue.png";
import TaskDetails from "../../components/task/TaskDetails";
import Events from "../Events";
import EventDetails from "../Events/EventDetails";
import Cookies from "js-cookie";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase/firebase-config";

function Level1Dashboard() {
  const [mainbar, setMainbar] = useState("Dashboard");
  const [subbar, setSubbar] = useState("All Projects");
  const [searchQuery, setSearchQuery] = useState("");
  const [userData, setUserData] = useState(null);
  const [projectsExpanded, setProjectsExpanded] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(true);
  const timerRef = useRef(null);

  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await logout(); // AuthContext logout handles session deletion, signOut, and cookie cleanup
      navigate("/login");
    } catch (error) {
      console.error("Error signing out:", error);
      navigate("/login"); // Navigate even if logout fails
    }
  };


  const selectMenuOption = (section, submenu) => {
    if (section === "Logout") {
      logout();
    } else {
      setMainbar(section);
      if (submenu) setSubbar(submenu);

      // Update the route with "/l1dashboard" in front of the selected route
      const baseRoute = "/l1dashboard";
      let route;
      if (section === "Project" && submenu) {
        route = `${baseRoute}/project/${submenu.toLowerCase().replace(/ /g, "-")}`;
      } else if (section === "Quiz Results") {
        route = `${baseRoute}/quiz-results`;
      } else {
        route = `${baseRoute}/${section.toLowerCase()}`;
      }
      navigate(route); // Navigate to the updated route
      setSidebarOpen(false);
    }
    clearTimeout(timerRef.current);
  };

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      const uid = Cookies.get("uid");
      if (uid) {
        try {
          const userDoc = doc(db, "users", uid);
          const docSnap = await getDoc(userDoc);
          if (docSnap.exists()) {
            setUserData(docSnap.data());
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }
    };
    fetchUserData();
  }, []);

  useEffect(() => {
    const timer = timerRef.current;
    return () => clearTimeout(timer);
  }, []);

  // Update state when route changes
  useEffect(() => {
    parseRoute(location.pathname);
  }, [location.pathname]);


  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  // Parse current route and update state
  const parseRoute = (pathname) => {
    // Remove the base route prefix
    const path = pathname.replace('/l1dashboard', '');
    
    if (path === '' || path === '/') {
      setMainbar('Dashboard');
      setSubbar('All Projects');
    } else if (path === '/dashboard') {
      setMainbar('Dashboard');
      setSubbar('All Projects');
    } else if (path === '/profile') {
      setMainbar('Profile');
      setSubbar('');
    } else if (path === '/settings') {
      setMainbar('Settings');
      setSubbar('');
    } else if (path === '/quiz-results') {
      setMainbar('Quiz Results');
      setSubbar('');
    } else if (path === '/challenges') {
      setMainbar('Challenges');
      setSubbar('');
    } else if (path === '/events') {
      setMainbar('Events');
      setSubbar('');
    } else if (path.startsWith('/events/')) {
      setMainbar('Events');
      setSubbar('Details');
      setIsCollapsed(true);
    // } else if (path === '/topics') {
    //   setMainbar('Topics');
    //   setSubbar('');
    } else if (path === '/trash') {
      setMainbar('Trash');
      setSubbar('');
    } else if (path.startsWith('/project/')) {
      setMainbar('Project');
      const projectType = path.replace('/project/', '').replace(/-/g, ' ');
      // Capitalize first letter of each word
      const formattedType = projectType.split(' ').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ');
      setSubbar(formattedType);
    }
  };

  return (
    <div className="min-h-screen max-w-[100vw] bg-[#f8fafc] flex relative overflow-x-hidden">
      {/* Background Animated Blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-200/30 rounded-full blur-[120px] animate-blob"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-200/30 rounded-full blur-[120px] animate-blob animation-delay-2000"></div>
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-indigo-200/20 rounded-full blur-[100px] animate-blob animation-delay-4000"></div>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <div className={`fixed left-4 top-4 bottom-4 rounded-[2rem] bg-white/40 backdrop-blur-xl border border-white shadow-xl flex flex-col z-50 transition-all duration-500 ease-in-out group/sidebar ${
        sidebarOpen ? 'w-64 translate-x-0' : '-translate-x-[120%] lg:translate-x-0'
      } ${
        isCollapsed ? 'lg:w-20' : 'lg:w-64'
      }`}>
        {/* Logo Section */}
        <div className="px-5 py-6 border-b border-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden whitespace-nowrap">
            <div className="relative w-10 h-10 flex-shrink-0 rounded-full bg-blue-50 flex items-center justify-center border border-blue-100 overflow-hidden">
              <img
                src={logo}
                alt="Logo"
                className="w-8 h-8 object-contain"
              />
            </div>
            <div className={`flex flex-col ${isCollapsed ? 'lg:hidden' : ''}`}>
              <span className="text-base font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Truesight</span>
              <span className="text-[10px] text-gray-500 font-bold tracking-widest uppercase">University</span>
            </div>
          </div>
          {/* Close button for mobile */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-400"
          >
            <FontAwesomeIcon icon={faTimes} className="w-4 h-4" />
          </button>
        </div>

        {/* Collapse Toggle Button - Desktop */}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden lg:flex absolute -right-3 top-1/2 -translate-y-1/2 w-7 h-7 bg-white border border-gray-100 rounded-full items-center justify-center shadow-lg z-[60] text-gray-600 hover:text-blue-600 transition-all opacity-0 group-hover/sidebar:opacity-100"
        >
          <FontAwesomeIcon icon={isCollapsed ? faChevronRight : faChevronLeft} className="text-[11px]" />
        </button>

        {/* Sidebar Search - Inline */}
        <div className={`px-4 mt-6 mb-2 transition-all duration-300 ${isCollapsed ? 'lg:opacity-0 lg:h-0 lg:pointer-events-none' : 'opacity-100'}`}>
          <div className="relative group">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500">
              <FontAwesomeIcon icon={faSearch} className="text-sm" />
            </div>
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={handleSearch}
              className="w-full bg-gray-50 border border-gray-100 rounded-xl py-2 pl-10 pr-4 text-xs focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
            />
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 px-3 py-4 overflow-y-auto no-scrollbar">
          <div className="space-y-1.5">
            {/* Dashboard */}
            <div
              onClick={() => {
                selectMenuOption("Dashboard");
              }}
              className={`group cursor-pointer flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-300 ${
                mainbar === "Dashboard"
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
                  : "text-gray-700 hover:bg-gray-50 hover:text-blue-600"
              }`}
            >
              <div className="w-5 h-5 flex items-center justify-center flex-shrink-0 text-lg">
                <FontAwesomeIcon icon={faDashboard} />
              </div>
              <span className={`text-sm font-semibold tracking-wide flex-1 ${isCollapsed ? 'lg:hidden' : ''}`}>
                Dashboard
              </span>
            </div>

            {/* Projects - Premium Expandable */}
            <div className="relative">
              <div
                onClick={() => setProjectsExpanded(!projectsExpanded)}
                className={`group cursor-pointer flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-300 ${
                  mainbar === "Project" && !projectsExpanded
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
                    : "text-slate-600 hover:bg-slate-50 hover:text-blue-600"
                }`}
              >
                <div className="w-5 h-5 flex items-center justify-center flex-shrink-0 text-lg">
                  <FontAwesomeIcon icon={faProjectDiagram} />
                </div>
                <span className={`text-sm font-semibold tracking-wide flex-1 ${isCollapsed ? 'lg:hidden' : ''}`}>Projects</span>
                <FontAwesomeIcon 
                  icon={faChevronDown} 
                  className={`text-[10px] transition-transform duration-300 ${projectsExpanded ? 'rotate-180' : ''} ${isCollapsed ? 'lg:hidden' : ''}`} 
                />
              </div>
              
              <div 
                className={`overflow-hidden transition-all duration-500 ease-in-out ${
                  isCollapsed ? 'lg:max-h-0 lg:opacity-0 lg:pointer-events-none' : ''
                } ${
                  projectsExpanded ? 'max-h-96 opacity-100 mt-1 mb-2' : 'max-h-0 opacity-0'
                }`}
              >
                <div className="flex flex-col gap-1 ml-4 pl-4 border-l-2 border-slate-100">
                  {[
                    { name: "All Projects", icon: faMagicWandSparkles },
                    { name: "My Collaborations", icon: faUsers },
                    { name: "Private Projects", icon: faUserShield }
                  ].map((item) => (
                    <div
                      key={item.name}
                      onClick={() => selectMenuOption("Project", item.name)}
                      className={`group cursor-pointer flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all ${
                        mainbar === "Project" && subbar === item.name
                          ? "bg-blue-50 text-blue-600 shadow-sm"
                          : "text-slate-500 hover:text-blue-500 hover:bg-slate-50/50"
                      }`}
                    >
                       <FontAwesomeIcon icon={item.icon} className="text-[10px] opacity-70" />
                       <span className="text-sm font-semibold whitespace-nowrap">{item.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Profile */}
            <div
              onClick={() => selectMenuOption("Profile")}
              className={`group cursor-pointer flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-300 ${
                mainbar === "Profile"
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
                  : "text-gray-700 hover:bg-gray-50 hover:text-blue-600"
              }`}
            >
              <div className="w-5 h-5 flex items-center justify-center flex-shrink-0 text-lg">
                <FontAwesomeIcon icon={faUser} />
              </div>
              <span className={`text-sm font-semibold tracking-wide flex-1 ${isCollapsed ? 'lg:hidden' : ''}`}>Profile</span>
            </div>

            {/* Quiz Results */}
            <div
              onClick={() => selectMenuOption("Quiz Results")}
              className={`group cursor-pointer flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-300 ${
                mainbar === "Quiz Results"
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
                  : "text-gray-700 hover:bg-gray-50 hover:text-blue-600"
              }`}
            >
              <div className="w-5 h-5 flex items-center justify-center flex-shrink-0 text-lg">
                <FontAwesomeIcon icon={faStar} />
              </div>
              <span className={`text-sm font-semibold tracking-wide flex-1 ${isCollapsed ? 'lg:hidden' : ''}`}>Results</span>
            </div>

            {/* Challenges */}
            <div
              onClick={() => selectMenuOption("Challenges")}
              className={`group cursor-pointer flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-300 ${
                mainbar === "Challenges"
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
                  : "text-gray-700 hover:bg-gray-50 hover:text-blue-600"
              }`}
            >
              <div className="w-5 h-5 flex items-center justify-center flex-shrink-0 text-lg">
                <FontAwesomeIcon icon={faTrophy} />
              </div>
              <span className={`text-sm font-semibold tracking-wide flex-1 ${isCollapsed ? 'lg:hidden' : ''}`}>Challenges</span>
            </div>

            {/* History */}
            <div
              onClick={() => selectMenuOption("History")}
              className={`group cursor-pointer flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-300 ${
                mainbar === "History"
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
                  : "text-gray-700 hover:bg-gray-50 hover:text-blue-600"
              }`}
            >
              <div className="w-5 h-5 flex items-center justify-center flex-shrink-0 text-lg">
                <FontAwesomeIcon icon={faHistory} />
              </div>
              <span className={`text-sm font-semibold tracking-wide flex-1 ${isCollapsed ? 'lg:hidden' : ''}`}>Results</span>
            </div>

            {/* Events */}
            <div
              onClick={() => selectMenuOption("Events")}
              className={`group cursor-pointer flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-300 ${
                mainbar === "Events"
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
                  : "text-gray-700 hover:bg-gray-50 hover:text-blue-600"
              }`}
            >
              <div className="w-5 h-5 flex items-center justify-center flex-shrink-0 text-lg">
                <FontAwesomeIcon icon={faCalendarAlt} />
              </div>
              <span className={`text-sm font-semibold tracking-wide flex-1 ${isCollapsed ? 'lg:hidden' : ''}`}>Events</span>
            </div>

            {/* Trash */}
            <div
              onClick={() => selectMenuOption("Trash")}
              className={`group cursor-pointer flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-300 ${
                mainbar === "Trash"
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
                  : "text-gray-700 hover:bg-gray-50 hover:text-blue-600"
              }`}
            >
              <div className="w-5 h-5 flex items-center justify-center flex-shrink-0 text-lg">
                <FontAwesomeIcon icon={faTrash} />
              </div>
              <span className={`text-sm font-semibold tracking-wide flex-1 ${isCollapsed ? 'lg:hidden' : ''}`}>Trash</span>
            </div>
          </div>
        </div>

        {/* User Card */}
        <div className="px-3 py-6 border-t border-gray-50">
          <div className={`p-2 rounded-2xl bg-gray-50 flex items-center gap-3 transition-all ${isCollapsed ? 'justify-center' : ''}`}>
            <div className="relative flex-shrink-0">
              <img
                src={userData?.profileImage || "https://placehold.co/40x40"}
                alt="Avatar"
                className="w-8 h-8 rounded-full border border-white shadow-sm object-cover"
              />
              <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></div>
            </div>
            <div className={`flex-1 min-w-0 ${isCollapsed ? 'lg:hidden' : ''}`}>
              <p className="text-xs font-bold text-gray-800 truncate leading-tight">{userData?.name || 'Admin'}</p>
              <button onClick={handleLogout} className="text-[10px] font-bold text-blue-500 hover:text-blue-600 underline text-left">Logout</button>
            </div>
          </div>
        </div>
      </div>



      {/* Main content area */}
      <div className={`flex-1 flex flex-col min-w-0 bg-transparent min-h-screen transition-all duration-500 ease-in-out ${isCollapsed ? 'lg:pl-28' : 'lg:pl-72'} overflow-x-auto`}>
        {/* Floating Dashboard Header */}
        <div className="sticky top-6 z-40 px-6 w-full pointer-events-none mb-8">
          <div className="bg-white/80 backdrop-blur-xl border border-white shadow-[0_8px_32px_rgba(30,41,59,0.08)] rounded-[2rem] px-6 py-3 flex items-center justify-between pointer-events-auto ring-1 ring-black/5 gap-6">
            <div className="flex items-center gap-3">
              {/* Mobile Menu Toggle */}
              <button 
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-all border border-gray-100"
              >
                <FontAwesomeIcon icon={sidebarOpen ? faTimes : faBars} />
              </button>
              <img src={logo} alt="Logo" className="h-6 w-auto hidden xs:block" />
              <div className="h-4 w-[1px] bg-gray-200 hidden xs:block"></div>
            </div>
            {/* Breadcrumbs */}
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-400 font-medium">Dashboard</span>
              <FontAwesomeIcon icon={faChevronRight} className="text-[10px] text-gray-300" />
              <span className="text-blue-600 font-bold uppercase tracking-wider">{mainbar}</span>
            </div>

            {/* Quick Navigation Pills */}
            <div className="hidden md:flex items-center gap-1 bg-gray-50 p-1 rounded-full border border-gray-100">
              <button 
                onClick={() => selectMenuOption("History")}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                  mainbar === "History" 
                    ? "bg-white text-blue-600 shadow-sm ring-1 ring-black/5" 
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Results
              </button>
              <button 
                onClick={() => selectMenuOption("Challenges")}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                  mainbar === "Challenges" 
                    ? "bg-white text-blue-600 shadow-sm ring-1 ring-black/5" 
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Challenges
              </button>
            </div>

            {/* Search Bar & Actions */}
            <div className="flex items-center gap-4">
              <div className="relative group hidden sm:block">
                <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs transition-colors group-focus-within:text-blue-500" />
                <input 
                  type="text" 
                  placeholder="Search project..." 
                  value={searchQuery}
                  onChange={handleSearch}
                  className="bg-gray-50/50 border border-transparent focus:border-blue-200 outline-none rounded-full pl-9 pr-4 py-1.5 text-xs w-48 transition-all focus:bg-white focus:shadow-sm"
                />
              </div>
              <button className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all">
                <FontAwesomeIcon icon={faBell} className="text-sm" />
              </button>
            </div>
          </div>
        </div>

        <div className="px-6 pb-12">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/project/*" element={<Project searchQuery={searchQuery} />} />
            <Route path="/quiz/:topic" element={<Quiz />} />
            <Route path="/quiz-results" element={<QuizResults />} />
            {/* <Route path="/topics" element={<Topics />} /> */}
            <Route path="/history" element={<History />} />
            <Route path="/challenges" element={<Challenges />} />
            <Route path="/events" element={<Events />} />
            <Route path="/events/:id" element={<EventDetails />} />
            <Route path="/trash" element={<Trash />} />
            <Route path="/task/:id" element={<TaskDetails />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

export default Level1Dashboard;
