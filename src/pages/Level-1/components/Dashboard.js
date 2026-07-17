import React, { useEffect, useState } from "react";
import { 
  MdFolder,
  MdStar
} from "react-icons/md";
import { 
  FaFileAlt,
  FaUsers
} from "react-icons/fa";
import Cookies from "js-cookie";
import { getUser, getProjects, getStudyPlans } from "../../../utils/apiServices";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../../firebase/firebase-config";
import { toast } from "react-toastify";
import { SkeletonStatsCard } from "../../../components/SkeletonLoading";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const [users, setUsers] = useState([]);
  const [instituteCode, setInstituteCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [totalProjects, setTotalProjects] = useState(0);
  const [totalTasks, setTotalTasks] = useState(0);
  const [combinedTasks, setCombinedTasks] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const uid = Cookies.get("uid");
        if (!uid) {
          toast.error("User not authenticated.");
          setLoading(false);
          return;
        }

        // Fetch User profile, public plans, and private projects concurrently
        const [userData, studyPlansData, privateProjectsData] = await Promise.all([
          getUser(uid),
          getStudyPlans({ published: undefined }),
          getProjects('private')
        ]);

        let resolvedInstituteCode = "";
        if (userData) {
          resolvedInstituteCode = userData.instituteCode || "";
          setInstituteCode(resolvedInstituteCode);
        }

        const studyPlans = (studyPlansData || []).filter(item => !item.isTrashed);
        const privateProjects = (privateProjectsData || []).filter(item => !item.isTrashed);

        const studyPlansTasks = studyPlans.map((data) => ({
          _id: data._id || data.id,
          collection: "studyPlans",
          topic: data.title || data.name || "Untitled Project",
          createdAt: data.createdAt || data.updatedAt,
          levelOfLearning: data.levelOfLearning || "Undergraduate Student",
          ...data,
        }));

        const privateProjectsTasks = privateProjects.map((data) => ({
          _id: data._id || data.id,
          collection: "privateProjects",
          topic: data.topic || "Untitled Project",
          createdAt: data.createdAt,
          levelOfLearning: data.levelOfLearning || "Undergraduate Student",
          ...data,
        }));

        const combinedTasks = [...studyPlansTasks, ...privateProjectsTasks]
          .sort((a, b) => {
            const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return dateB - dateA;
          });

        setTotalTasks(combinedTasks.length);
        setCombinedTasks(combinedTasks);
        setTotalProjects(studyPlans.length + privateProjects.length);

        // Fetch Users (Student Roll) if instituteCode is resolved
        if (resolvedInstituteCode) {
          const usersRef = collection(db, "users");
          const q = query(usersRef, where("instituteCode", "==", resolvedInstituteCode));
          const querySnapshot = await getDocs(q);
          const fetchedUsers = querySnapshot.docs
            .map((doc) => {
              const data = doc.data();
              const createdAt = data.createdAt ? data.createdAt.toDate() : new Date();
              return {
                ...data,
                _id: doc.id,
                createdAt,
              };
            })
            .sort((a, b) => b.createdAt - a.createdAt);
          setUsers(fetchedUsers);
        }

      } catch (error) {
        console.error("Error loading dashboard data:", error);
        toast.error("Failed to load tasks.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const stats = [
    {
      _id: "1",
      label: "Total Students",
      total: users?.filter((u) => u.role === "Level-2")?.length || 0,
      icon: <FaUsers className="w-6 h-6" />,
      bg: "bg-blue-100",
      iconColor: "text-blue-600",
    },
    {
      _id: "2",
      label: "Total Projects",
      total: totalProjects || 0,
      icon: <MdFolder className="w-6 h-6" />,
      bg: "bg-yellow-100",
      iconColor: "text-yellow-600",
    },
    {
      _id: "3",
      label: "My Projects",
      total: totalTasks || 0,
      icon: <FaFileAlt className="w-6 h-6" />,
      bg: "bg-orange-100",
      iconColor: "text-orange-600",
    },
    {
      _id: "4",
      label: "Active Users",
      total: users.length,
      icon: <MdStar className="w-6 h-6" />,
      bg: "bg-purple-100",
      iconColor: "text-purple-600",
    },
  ];

  const Card = ({ label, count, bg, icon, iconColor }) => (
    <div className="relative group overflow-hidden bg-white/40 backdrop-blur-xl border border-white/40 rounded-3xl p-6 shadow-xl transition-all duration-500 hover:scale-[1.02] active:scale-95">
      <div className="flex items-start justify-between relative z-10">
        <div>
          <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">{label}</p>
          <h3 className="text-3xl font-black text-gray-900 leading-tight">{count}</h3>
        </div>
        <div className={`${bg} ${iconColor} w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg`}>
          {React.cloneElement(icon, { className: "w-6 h-6" })}
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full min-h-screen p-4 sm:p-6 lg:p-10">
      {/* Premium Hero Banner */}
      <div className="mb-12">
        <div className="relative bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-900 rounded-[3rem] p-8 sm:p-12 text-white shadow-2xl shadow-blue-100 overflow-hidden group">
          <div className="absolute top-0 right-0 p-16 opacity-10 group-hover:scale-110 transition-transform duration-700">
            <FaUsers className="text-[12rem]" />
          </div>
          
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-8">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full border border-white/10 mb-6 backdrop-blur-md">
                 <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                 <span className="text-[10px] font-black uppercase tracking-widest text-blue-50">Admin Center</span>
              </div>
              <h1 className="text-4xl sm:text-5xl font-black mb-4 tracking-tight">Teacher Dashboard</h1>
              <p className="text-blue-100/80 font-medium text-base max-w-xl leading-relaxed italic">
                 Oversee your academic environment, manage students, and monitor platform activity in real-time.
              </p>
            </div>

            {!loading && (
              <div className="bg-white/10 backdrop-blur-xl px-10 py-6 rounded-[2.5rem] border border-white/10 flex flex-col items-center shadow-inner">
                 <span className="text-4xl font-black">{users?.filter(u => u.role === "Level-2")?.length || 0}</span>
                 <span className="text-[10px] font-black uppercase tracking-widest text-blue-100 mt-2">Active Students</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-16 animate-in fade-in slide-in-from-bottom-8 duration-700">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <SkeletonStatsCard key={i} />)
        ) : (
          stats.map((stat, i) => (
            <Card key={i} label={stat.label} count={stat.total} bg={stat.bg} icon={stat.icon} iconColor={stat.iconColor} />
          ))
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mb-8 animate-in fade-in slide-in-from-bottom-12 duration-1000">
        <div className="lg:col-span-2 backdrop-blur-xl bg-white/40 border border-white rounded-[2.5rem] shadow-xl p-8">
          <div className="flex justify-between items-center mb-8 px-2">
            <div className="flex items-center gap-3">
              <div className="w-2 h-8 bg-blue-600 rounded-full" />
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">Student Directory</h2>
            </div>
            <button 
              onClick={() => navigate("/l1dashboard/users")} 
              className="px-6 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-600 transition-all active:scale-95"
            >
              View Full Roll
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-50">
                  <th className="pb-4 px-3 text-left">Student Information</th>
                  <th className="pb-4 px-3 text-left">Internal ID</th>
                  <th className="pb-4 px-3 text-right">Join Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50/50">
                {users.filter(u => u.role === "Level-2").slice(0, 5).map((user, i) => (
                  <tr key={i} className="group hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 text-blue-600 flex items-center justify-center text-xs font-black shadow-sm group-hover:scale-110 transition-transform">
                          {user.name?.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="flex flex-col">
                           <span className="text-sm font-black text-slate-800">{user.name}</span>
                           <span className="text-[10px] text-slate-400 font-bold">{user.email || 'No email registered'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-3">
                       <span className="text-[10px] font-black text-slate-400 font-mono tracking-wider bg-slate-50 px-2.5 py-1 rounded-lg">
                          {user._id?.substring(0, 10).toUpperCase()}
                       </span>
                    </td>
                    <td className="py-4 px-3 text-right">
                       <div className="flex flex-col items-end">
                          <span className="text-[11px] font-black text-slate-700">
                             {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '---'}
                          </span>
                          <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Enrollment</span>
                       </div>
                    </td>
                  </tr>
                ))}
                {users.filter(u => u.role === "Level-2").length === 0 && (
                  <tr>
                    <td colSpan="3" className="py-16 text-center">
                       <div className="flex flex-col items-center opacity-30">
                          <FaUsers className="text-4xl mb-3 text-slate-400" />
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No registered students found in this institute</p>
                       </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Projects Section */}
        <div className="lg:col-span-3 backdrop-blur-xl bg-white/40 border border-white rounded-[2.5rem] shadow-xl p-8">
          <div className="flex justify-between items-center mb-8 px-2">
            <div className="flex items-center gap-3">
              <div className="w-2 h-8 bg-indigo-600 rounded-full" />
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">Recent Academic Projects</h2>
            </div>
            <div className="flex items-center gap-4">
               <div className="flex items-center gap-2 px-3 py-1 bg-indigo-50 rounded-lg border border-indigo-100">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-indigo-600">Real-time Feed</span>
               </div>
               <button 
                 onClick={() => navigate("/l1dashboard/project/all-projects")} 
                 className="px-6 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-600 transition-all active:scale-95"
               >
                 View All
               </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-50">
                  <th className="pb-4 px-3 text-left">Curriculum Title</th>
                  <th className="pb-4 px-3 text-left">Lead Author</th>
                  <th className="pb-4 px-3 text-left">Target Tier</th>
                  <th className="pb-4 px-3 text-right">Created Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50/50">
                {combinedTasks.slice(0, 8).map((task, i) => (
                  <tr key={i} className="group hover:bg-indigo-50/30 transition-colors">
                    <td className="py-5 px-3">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-2xl bg-white border border-indigo-100 text-indigo-600 flex items-center justify-center shadow-sm group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                          <FaFileAlt className="text-sm" />
                        </div>
                        <div className="flex flex-col">
                           <span className="text-sm font-black text-slate-800 group-hover:text-indigo-700 transition-colors">{task.topic}</span>
                           <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{task.collection === "studyPlans" ? "Public Curriculum" : "Private Session"}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-5 px-3">
                      <div className="flex items-center gap-2">
                         <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400 border border-white">
                            {task.name?.charAt(0) || "U"}
                         </div>
                         <span className="text-xs font-bold text-slate-600">{task.name || "System Gen"}</span>
                      </div>
                    </td>
                    <td className="py-5 px-3">
                       <span className="px-3 py-1 bg-slate-50 border border-slate-100 text-[9px] font-black text-slate-500 uppercase tracking-widest rounded-lg">
                          {task.levelOfLearning}
                       </span>
                    </td>
                    <td className="py-5 px-3 text-right">
                       <div className="flex flex-col items-end">
                          <span className="text-[11px] font-black text-slate-700">
                             {task.createdAt ? new Date(task.createdAt).toLocaleDateString() : '---'}
                          </span>
                          <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest leading-none mt-1">Record Active</span>
                       </div>
                    </td>
                  </tr>
                ))}
                {combinedTasks.length === 0 && (
                  <tr>
                    <td colSpan="4" className="py-20 text-center">
                       <div className="flex flex-col items-center opacity-30">
                          <MdFolder className="text-5xl mb-4 text-slate-400" />
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No active academic projects discovered</p>
                       </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-8 flex flex-col justify-start">
          <div className="backdrop-blur-xl bg-white/40 border border-white rounded-[2.5rem] shadow-xl p-8">
            <h3 className="text-xs font-black text-slate-400 mb-8 uppercase tracking-[0.3em] text-center border-b border-slate-50 pb-4">Internal Management</h3>
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => navigate("/l1dashboard/quiz-results")}
                className="group relative h-28 bg-blue-50/50 rounded-3xl border border-blue-100 flex flex-col items-center justify-center gap-3 hover:bg-blue-600 hover:text-white transition-all duration-500 hover:-translate-y-1 active:scale-95 shadow-sm"
              >
                <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                  <MdStar className="text-xl text-blue-600" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest">Results</span>
              </button>
              <button 
                onClick={() => navigate("/l1dashboard/project/all-projects")}
                className="group relative h-28 bg-indigo-50/50 rounded-3xl border border-indigo-100 flex flex-col items-center justify-center gap-3 hover:bg-indigo-600 hover:text-white transition-all duration-500 hover:-translate-y-1 active:scale-95 shadow-sm"
              >
                <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                  <MdFolder className="text-xl text-indigo-600" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest">Curriculum</span>
              </button>
            </div>
          </div>

          <div className="backdrop-blur-xl bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-900 rounded-[2.5rem] shadow-2xl p-10 text-white relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-20 pointer-events-none group-hover:rotate-12 transition-transform duration-700">
               <MdStar className="text-6xl" />
            </div>
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full border border-white/10 mb-4 whitespace-nowrap">
                 <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                 <span className="text-[9px] font-black uppercase tracking-widest">Core Sync Active</span>
              </div>
              <h3 className="text-2xl font-black mb-2 tracking-tight">Platform Status</h3>
              <p className="text-sm text-blue-100/80 leading-relaxed font-medium italic">
                All academic modules and AI engines are operating with zero latencies.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
