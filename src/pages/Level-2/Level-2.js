import React, { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faDashboard,
  faUser,
  faTrash,
  faStar,
  faStore,
  faTimes,
  faBars,
  faTrophy,
  faSearch,
  faHistory,
  faMagicWandSparkles,
  faUserShield,
  faCalendarAlt,
} from "@fortawesome/free-solid-svg-icons";
import { Route, Routes, useNavigate, useLocation } from "react-router-dom";
import Dashboard from "./components/Dashboard";
import Settings from "../shared/components/Settings";
import Profile from "../shared/components/Profile";
import Project from "./components/Project";
import Quiz from "./components/Quiz";
import { useAuth } from "../../contexts/AuthContext";
import Trash from "./components/Trash";
import Rewards from "../../components/Rewards";
import History from "../../components/History";
import Marketplace from "../../components/Marketplace";
import Challenges from "./components/Challenges";
import logo from "../../assets/logo_blue.png";
import TaskDetails from "../../components/task/TaskDetails";
import Events from "../Events";
import EventDetails from "../Events/EventDetails";
import Cookies from "js-cookie";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase/firebase-config";

function Level2Dashboard() {
  const [mainbar, setMainbar] = useState("Dashboard");
  const [subbar, setSubbar] = useState("All Projects");
  const [searchQuery, setSearchQuery] = useState("");
  const [userData, setUserData] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
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

      // Update the route with "/l2dashboard" in front of the selected route
      const baseRoute = "/l2dashboard";
      let route;
      if (section === "Project" && submenu) {
        route = `${baseRoute}/project/${submenu.toLowerCase().replace(/ /g, "-")}`;
      } else if (section === "Dashboard") {
        route = `${baseRoute}/dashboard`;
      } else {
        route = `${baseRoute}/${section.toLowerCase().replace(/\s+/g, "-")}`;
      }
      navigate(route); // Navigate to the updated route
      setSidebarOpen(false);
    }
    clearTimeout(timerRef.current);
  };

  useEffect(() => {
    const timer = timerRef.current;
    return () => clearTimeout(timer);
  }, []);

  // Update state when route changes
  useEffect(() => {
    parseRoute(location.pathname);
    // parseRoute is recreated every render; it only depends on the pathname listed here.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);


  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  // Parse current route and update state
  const parseRoute = (pathname) => {
    // Remove the base route prefix
    const path = pathname.replace('/l2dashboard', '');
    
    if (path === '' || path === '/') {
      navigate('/l2dashboard/dashboard');
    } else if (path === '/dashboard') {
      setMainbar('Dashboard');
      setSubbar('All Projects');
    } else if (path === '/profile') {
      setMainbar('Profile');
      setSubbar('');
    } else if (path === '/settings') {
      setMainbar('Settings');
      setSubbar('');
    } else if (path === '/rewards') {
      setMainbar('Rewards');
      setSubbar('');
    } else if (path === '/history') {
      setMainbar('History');
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
    // } else if (path === '/topics') {
    //   setMainbar('Topics');
    //   setSubbar('');
    } else if (path === '/marketplace') {
      setMainbar('Marketplace');
      setSubbar('');
    } else if (path === '/trash') {
      setMainbar('Trash');
      setSubbar('');
    } else if (path.startsWith('/project/')) {
      setMainbar('Project');
      const parts = path.split('/').filter(Boolean); // ['project', 'all-projects', 'ID']
      const type = parts[1] ? parts[1].replace(/-/g, ' ') : '';
      const formattedType = type.split(' ').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ');
      setSubbar(formattedType);
    } else if (path.startsWith('/task/')) {
      setMainbar('Dashboard');
      setSubbar('Roadmap Details');
    }
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

  const navItemClass = (active) =>
    `flex w-full items-center gap-3 px-5 py-2.5 text-left text-sm transition-colors ${
      active
        ? "bg-navy-light font-semibold text-white"
        : "text-white/55 hover:bg-white/5 hover:text-white"
    }`;

  const isProject = (name) => mainbar === "Project" && subbar === name;

  return (
    <div className="app-shell flex min-h-screen w-full bg-cream text-ink">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-ink/60 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-60 flex-col bg-ink transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-5 py-4 lg:hidden">
          <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/50">
            Menu
          </span>
          <button
            onClick={() => setSidebarOpen(false)}
            className="flex h-8 w-8 items-center justify-center text-white/60 hover:text-white"
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto no-scrollbar py-3">
          <button
            onClick={() => selectMenuOption("Dashboard")}
            className={navItemClass(mainbar === "Dashboard")}
          >
            <FontAwesomeIcon icon={faDashboard} className="w-4 text-sm" />
            <span>Dashboard</span>
          </button>

          <p className="px-5 pb-2 pt-6 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/35">
            Projects
          </p>
          {[
            { name: "All Projects", icon: faMagicWandSparkles },
            { name: "Private Projects", icon: faUserShield },
          ].map((item) => (
            <button
              key={item.name}
              onClick={() => selectMenuOption("Project", item.name)}
              className={navItemClass(isProject(item.name))}
            >
              <FontAwesomeIcon icon={item.icon} className="w-4 text-sm" />
              <span>{item.name}</span>
            </button>
          ))}

          <div className="pt-4">
            {[
              { key: "Profile", label: "Profile", icon: faUser },
              { key: "Rewards", label: "Rewards", icon: faStar },
              { key: "History", label: "Results", icon: faHistory },
              { key: "Challenges", label: "Challenges", icon: faTrophy },
              { key: "Events", label: "Events", icon: faCalendarAlt },
            ].map((item) => (
              <button
                key={item.key}
                onClick={() => selectMenuOption(item.key)}
                className={navItemClass(mainbar === item.key)}
              >
                <FontAwesomeIcon icon={item.icon} className="w-4 text-sm" />
                <span>{item.label}</span>
              </button>
            ))}

            {/* Marketplace - temporarily disabled */}
            <div
              title="Marketplace temporarily unavailable"
              className="flex w-full cursor-not-allowed items-center gap-3 px-5 py-2.5 text-sm text-white/25"
            >
              <FontAwesomeIcon icon={faStore} className="w-4 text-sm" />
              <span>Marketplace</span>
            </div>

            <button
              onClick={() => selectMenuOption("Trash")}
              className={navItemClass(mainbar === "Trash")}
            >
              <FontAwesomeIcon icon={faTrash} className="w-4 text-sm" />
              <span>Trash</span>
            </button>
          </div>
        </nav>

        {/* Search */}
        <div className="px-5 py-4">
          <div className="relative">
            <FontAwesomeIcon
              icon={faSearch}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-white/35"
            />
            <input
              type="text"
              placeholder="Search projects"
              value={searchQuery}
              onChange={handleSearch}
              className="h-9 w-full border border-white/10 bg-white/5 pl-9 pr-3 text-xs text-white outline-none transition-colors placeholder:text-white/35 focus:border-white/30"
            />
          </div>
        </div>

        {/* User */}
        <div className="flex items-center gap-3 border-t border-white/10 px-5 py-4">
          <img
            src={userData?.profileImage || logo}
            alt=""
            className="h-8 w-8 flex-shrink-0 object-cover"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold text-white">
              {userData?.name || "User"}
            </p>
            <button
              onClick={handleLogout}
              className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/45 transition-colors hover:text-white"
            >
              Log out
            </button>
          </div>
        </div>
      </aside>

      {/* Main content area */}
      <div className="flex min-h-screen w-full min-w-0 flex-col lg:pl-60">
        {/* Mobile bar - the desktop layout leads with the page banner instead */}
        <div className="flex items-center gap-3 border-b border-line bg-white px-4 py-3 lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="flex h-9 w-9 items-center justify-center border border-line text-ink"
          >
            <FontAwesomeIcon icon={faBars} />
          </button>
          <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-muted">
            {mainbar === "History" ? "Results" : mainbar}
          </span>
        </div>

        <div className="flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/profile" element={<Profile variant="level2" />} />
            <Route path="/project/*" element={<Project searchQuery={searchQuery} />} />
            <Route path="/quiz/:topic" element={<Quiz />} />
            <Route path="/rewards" element={<Rewards />} />
            <Route path="/history" element={<History />} />
            <Route path="/marketplace" element={<Marketplace />} />
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

export default Level2Dashboard;
