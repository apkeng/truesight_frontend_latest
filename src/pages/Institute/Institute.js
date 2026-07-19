import React, { useState, useRef, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUserCircle,
  faKey,
  faSignOutAlt,
  faDashboard,
  faUser,
  faProjectDiagram,
  faStar,
  faBuilding,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";
import { Route, Routes, useNavigate } from "react-router-dom";
import Dashboard from "./components/Dashboard";
import Team from "./components/Team";
import Settings from "./components/Settings";
import Profile from "./components/Profile";
import { useAuth } from "../../contexts/AuthContext";
import InstituteDetails from "./components/InstituteDetails";
import MyCollaborations from "../shared/components/MyCollaborations";
import logo from "../../assets/logo_blue.png";
import Cookies from "js-cookie";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase/firebase-config";
import searchIcon from "../../assets/icons/header/searchbar icon.png";

function InstituteDashboard() {
  const [mainbar, setMainbar] = useState("Dashboard");
  const [searchQuery, setSearchQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [userData, setUserData] = useState(null);
  const timerRef = useRef(null);

  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout(); // AuthContext logout handles session deletion, signOut, and cookie cleanup
      navigate("/login");
    } catch (error) {
      console.error("Error signing out:", error);
      navigate("/login"); // Navigate even if logout fails
    }
  };

  const handleProfileClick = () => {
    setShowDropdown((prev) => !prev);
    if (showDropdown) {
      clearTimeout(timerRef.current);
    } else {
      timerRef.current = setTimeout(() => {
        setShowDropdown(false);
      }, 10000);
    }
  };

  const selectMenuOption = (section) => {
    if (section === "Logout") {
      logout();
    } else {
      setMainbar(section);

      const baseRoute = "/institutedashboard";
      const route = `${baseRoute}/${section.toLowerCase().replace(/ /g, "-")}`;
      navigate(route);
    }
    setShowDropdown(false);
    clearTimeout(timerRef.current);
  };


  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  // Generate breadcrumbs based on current route
  const getBreadcrumbs = () => {
    return [mainbar];
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

  return (
    <div className="min-h-screen w-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 h-screen fixed left-0 top-0 backdrop-blur-xl bg-white/30 border-r border-white/20 shadow-2xl flex flex-col">
        {/* Logo Section */}
        <div className="px-4 py-6 border-b border-white/20">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-6 h-6 rounded-lg bg-white/40 backdrop-blur-sm flex items-center justify-center border border-white/30">
              <img
                src={logo}
                alt="Company Logo"
                width={24}
                height={24}
                className="rounded-full"
              />
            </div>
            <span className="text-sm font-normal text-gray-900">COMPANY LOGO</span>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 px-4 py-4">
          <div className="space-y-1">
            {/* Dashboard */}
            <div
              onClick={() => selectMenuOption("Dashboard")}
              className={`cursor-pointer flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-300 ${
                mainbar === "Dashboard"
                  ? "bg-blue-500/20 backdrop-blur-sm text-blue-600 border border-blue-400/30 shadow-lg"
                  : "text-gray-900 hover:bg-white/40 hover:backdrop-blur-sm border border-transparent hover:border-white/30"
              }`}
            >
              <div className="w-6 h-6 flex items-center justify-center">
                <FontAwesomeIcon 
                  icon={faDashboard} 
                  className={`w-6 h-6 ${mainbar === "Dashboard" ? "text-blue-600" : "text-gray-900"}`} 
                />
              </div>
              <span className={`text-sm font-normal ${mainbar === "Dashboard" ? "text-blue-600 font-medium" : "text-gray-900"}`}>
                Dashboard
              </span>
            </div>

            {/* Team */}
            <div
              onClick={() => selectMenuOption("Team")}
              className={`cursor-pointer flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-300 ${
                mainbar === "Team"
                  ? "bg-blue-500/20 backdrop-blur-sm text-blue-600 border border-blue-400/30 shadow-lg"
                  : "text-gray-900 hover:bg-white/40 hover:backdrop-blur-sm border border-transparent hover:border-white/30"
              }`}
            >
              <div className="w-6 h-6 flex items-center justify-center">
                <FontAwesomeIcon 
                  icon={faProjectDiagram} 
                  className={`w-6 h-6 ${mainbar === "Team" ? "text-blue-600" : "text-gray-900"}`} 
                />
              </div>
              <span className={`text-sm font-normal ${mainbar === "Team" ? "text-blue-600 font-medium" : "text-gray-900"}`}>
                Team
              </span>
            </div>

            {/* Institute Details */}
            <div
              onClick={() => selectMenuOption("Institute Details")}
              className={`cursor-pointer flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-300 ${
                mainbar === "Institute Details"
                  ? "bg-blue-500/20 backdrop-blur-sm text-blue-600 border border-blue-400/30 shadow-lg"
                  : "text-gray-900 hover:bg-white/40 hover:backdrop-blur-sm border border-transparent hover:border-white/30"
              }`}
            >
              <div className="w-6 h-6 flex items-center justify-center">
                <FontAwesomeIcon 
                  icon={faBuilding} 
                  className={`w-6 h-6 ${mainbar === "Institute Details" ? "text-blue-600" : "text-gray-900"}`} 
                />
              </div>
              <span className={`text-sm font-normal ${mainbar === "Institute Details" ? "text-blue-600 font-medium" : "text-gray-900"}`}>
                Institute Details
              </span>
            </div>

            {/* Profile */}
            <div
              onClick={() => selectMenuOption("Profile")}
              className={`cursor-pointer flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-300 ${
                mainbar === "Profile"
                  ? "bg-blue-500/20 backdrop-blur-sm text-blue-600 border border-blue-400/30 shadow-lg"
                  : "text-gray-900 hover:bg-white/40 hover:backdrop-blur-sm border border-transparent hover:border-white/30"
              }`}
            >
              <div className="w-6 h-6 flex items-center justify-center">
                <FontAwesomeIcon 
                  icon={faUser} 
                  className={`w-6 h-6 ${mainbar === "Profile" ? "text-blue-600" : "text-gray-900"}`} 
                />
              </div>
              <span className={`text-sm font-normal ${mainbar === "Profile" ? "text-blue-600 font-medium" : "text-gray-900"}`}>
                Profile
              </span>
            </div>

            {/* My Collaborations */}
            <div
              onClick={() => selectMenuOption("My Collaborations")}
              className={`cursor-pointer flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-300 ${
                mainbar === "My Collaborations"
                  ? "bg-blue-500/20 backdrop-blur-sm text-blue-600 border border-blue-400/30 shadow-lg"
                  : "text-gray-900 hover:bg-white/40 hover:backdrop-blur-sm border border-transparent hover:border-white/30"
              }`}
            >
              <div className="w-6 h-6 flex items-center justify-center">
                <FontAwesomeIcon
                  icon={faUsers}
                  className={`w-6 h-6 ${mainbar === "My Collaborations" ? "text-blue-600" : "text-gray-900"}`}
                />
              </div>
              <span className={`text-sm font-normal ${mainbar === "My Collaborations" ? "text-blue-600 font-medium" : "text-gray-900"}`}>
                My Collaborations
              </span>
            </div>

            {/* Rewards */}
            <div
              onClick={() => selectMenuOption("Rewards")}
              className={`cursor-pointer flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-300 ${
                mainbar === "Rewards"
                  ? "bg-blue-500/20 backdrop-blur-sm text-blue-600 border border-blue-400/30 shadow-lg"
                  : "text-gray-900 hover:bg-white/40 hover:backdrop-blur-sm border border-transparent hover:border-white/30"
              }`}
            >
              <div className="w-6 h-6 flex items-center justify-center">
                <FontAwesomeIcon 
                  icon={faStar} 
                  className={`w-6 h-6 ${mainbar === "Rewards" ? "text-blue-600" : "text-gray-900"}`} 
                />
              </div>
              <span className={`text-sm font-normal ${mainbar === "Rewards" ? "text-blue-600 font-medium" : "text-gray-900"}`}>
                Rewards
              </span>
            </div>
          </div>
        </div>

        {/* User Profile Section at Bottom */}
        <div className="px-4 py-4 border-t border-white/20">
          <div className="flex items-center gap-2 mb-3">
            <img
              src="https://placehold.co/40x40"
              alt="User Avatar"
              width={40}
              height={40}
              className="rounded-full"
            />
            <div className="flex-1 min-w-0">
              <p className="text-base font-medium text-gray-900 truncate">
                {userData?.name || "Lav Shashank"}
              </p>
              <p className="text-sm font-normal text-gray-900 truncate">
                {userData?.email || "lavshashank431@gmail.com"}
              </p>
            </div>
          </div>
          
          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-red-600 bg-red-500/20 backdrop-blur-sm rounded-lg hover:bg-red-500/30 border border-red-400/30 hover:border-red-400/50 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            <FontAwesomeIcon icon={faSignOutAlt} className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Top Header */}
      <div className="fixed top-0 left-64 right-0 h-16 backdrop-blur-xl bg-white/30 border-b border-white/20 shadow-2xl flex items-center justify-between px-6 z-10">
        {/* Left side - Logo */}
        <div className="flex items-center">
          <img
            src={logo}
            alt="TrueSight Logo"
            width={32}
            height={32}
            className="mr-3"
          />
          <h2 className="text-lg font-bold text-gray-800">Truesight</h2>
        </div>

        {/* Middle - Breadcrumbs */}
        <div className="flex items-center space-x-2">
          {getBreadcrumbs().map((crumb, index) => (
            <div key={index} className="flex items-center">
              {index > 0 && <span className="text-gray-400 mx-2">/</span>}
              <span
                className={`text-sm ${
                  index === getBreadcrumbs().length - 1
                    ? "text-gray-800 font-medium"
                    : "text-gray-500"
                }`}
              >
                {crumb}
              </span>
            </div>
          ))}
        </div>

        {/* Right side - Search and Action Icons */}
        <div className="flex items-center space-x-4">
          {/* Search Bar */}
          <div className="relative">
            <img
              src={searchIcon}
              alt="Search"
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4"
            />
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={handleSearch}
              className="pl-10 pr-4 py-2 w-64 backdrop-blur-sm bg-white/40 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400/50 shadow-lg transition-all duration-300"
            />
          </div>

          {/* Action Icons - Removed non-functional icons */}

          {/* User Profile Dropdown */}
          <div className="relative">
            <FontAwesomeIcon
              icon={faUserCircle}
              className="w-8 h-8 text-gray-600 cursor-pointer hover:text-gray-800"
              onClick={handleProfileClick}
            />
            {showDropdown && (
              <div className="absolute right-0 w-48 mt-2 py-2 backdrop-blur-xl bg-white/40 border border-white/30 rounded-lg shadow-2xl z-20">
                <ul>
                  <li
                    onClick={() => selectMenuOption("Profile")}
                    className="flex items-center px-4 py-2 hover:bg-white/40 hover:backdrop-blur-sm cursor-pointer transition-all duration-300"
                  >
                    <FontAwesomeIcon
                      icon={faUserCircle}
                      className="text-gray-600 mr-3 w-4 h-4"
                    />
                    Profile
                  </li>
                  <li
                    onClick={() => selectMenuOption("Settings")}
                    className="flex items-center px-4 py-2 hover:bg-white/40 hover:backdrop-blur-sm cursor-pointer transition-all duration-300"
                  >
                    <FontAwesomeIcon
                      icon={faKey}
                      className="text-gray-600 mr-3 w-4 h-4"
                    />
                    Change Password
                  </li>
                  <li
                    onClick={() => selectMenuOption("Logout")}
                    className="flex items-center px-4 py-2 hover:bg-white/40 hover:backdrop-blur-sm cursor-pointer transition-all duration-300"
                  >
                    <FontAwesomeIcon
                      icon={faSignOutAlt}
                      className="text-red-500 mr-3 w-4 h-4"
                    />
                    Logout
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div className="ml-64 mt-16 flex-1 bg-gray-50 min-h-screen">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/team" element={<Team />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/institute-details" element={<InstituteDetails />} />
          <Route path="/my-collaborations" element={<MyCollaborations />} />
        </Routes>
      </div>
    </div>
  );
}

export default InstituteDashboard;
