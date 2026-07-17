import React, { useEffect, useState } from "react";
import SkeletonLoading, { SkeletonProjectCard } from "../../../components/SkeletonLoading";
import Tabs from "../../../components/Tabs";
import { toast, ToastContainer } from "react-toastify";
import Cookies from "js-cookie";
import { getPrivateProjects, createProject, deleteProject } from "../../../utils/apiServices";
import { MdGridView, MdAdd } from "react-icons/md";
import { FaList, FaUserShield } from "react-icons/fa";
import ProjectCard from "../../../components/privateProject/ProjectCard";
import Table from "../../../components/privateProject/Table";
import Pagination from "../../../components/Pagination";
import { useProjectSearch } from "../../../hooks/useProjectSearch";
import { IoMdClose } from "react-icons/io";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserSecret, faMagicWandSparkles } from "@fortawesome/free-solid-svg-icons";
import clsx from "clsx";

const TABS = [
  { title: "Board View", icon: <MdGridView /> },
  { title: "List View", icon: <FaList /> },
];

const Modal = ({ open, children, onClose }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-md transition-opacity" 
          onClick={onClose}
        />
        
        <div className="relative w-full max-w-md transform overflow-hidden rounded-[2.5rem] bg-white p-8 shadow-2xl transition-all animate-in zoom-in-95 duration-300">
          <button 
            className="absolute right-6 top-6 z-[110] flex h-10 w-10 items-center justify-center rounded-full bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
            onClick={onClose}
          >
            <IoMdClose className="text-xl" />
          </button>
          {children}
        </div>
      </div>
    </div>
  );
};

const AddProject = ({ open, setOpen, onTaskAdd }) => {
  const [topic, setTopic] = useState("");
  const [levelOfLearning, setLevelOfLearning] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const resetForm = () => {
    setTopic("");
    setLevelOfLearning("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const uid = Cookies.get("uid");
      if (!uid) {
        toast.error("User not authenticated.");
        setIsLoading(false);
        return;
      }

      if (!topic || topic.trim().length < 3) {
        toast.error("Please enter a valid research topic.");
        setIsLoading(false);
        return;
      }

      toast.info("Synthesizing private study plan...");
      setOpen(false);
      resetForm();

      const savedProject = await createProject({
        topic: topic.trim(),
        levelOfLearning,
        autoGenerate: true
      });

      onTaskAdd(savedProject);
      toast.success("Scientific roadmap generated!");
    } catch (error) {
      console.error("Error in project creation:", error);
      const errorMessage = error.response?.data?.error || error.message || "Roadmap generation failed.";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const LEVELS = [
    { id: "Primary School", label: "Primary School", desc: "Basic cognitive blocks" },
    { id: "High School", label: "High School", desc: "Analytical frameworks" },
    { id: "Undergraduate", label: "Undergraduate", desc: "Scientific methodology" },
    { id: "Postgraduate", label: "Postgraduate", desc: "Specialized synthesis" },
  ];

  return (
    <Modal open={open} onClose={() => setOpen(false)}>
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="text-center relative pt-4">
           <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-600 mb-6 shadow-sm rotate-3 group-hover:rotate-0 transition-transform duration-500">
             <FontAwesomeIcon icon={faMagicWandSparkles} className="text-2xl" />
           </div>
           <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-2 uppercase">Architect Roadmap</h3>
        </div>

        <div className="space-y-6">
          <div className="space-y-3 px-1">
            <div className="flex items-center justify-between">
              <label htmlFor="topic" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                Research Topic
              </label>
              <span className={clsx(
                "text-[10px] font-black uppercase tracking-widest",
                topic.length > 3 ? "text-slate-900" : "text-slate-300"
              )}>
                {topic.length}/120
              </span>
            </div>
            <textarea
              id="topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              rows={3}
              maxLength={120}
              placeholder="e.g. Impact of blockchain on digital identity management"
              className="w-full rounded-2xl border-slate-200 bg-slate-50 p-5 text-xs font-bold text-slate-900 transition-all focus:border-slate-900 focus:ring-0 placeholder:text-slate-400 no-scrollbar resize-none outline-none shadow-inner"
              required
            />
          </div>

          <div className="space-y-4 px-1">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
              Complexity Level
            </label>
            <div className="grid grid-cols-1 gap-2">
              {LEVELS.map((lvl) => (
                <div
                  key={lvl.id}
                  onClick={() => setLevelOfLearning(lvl.id)}
                  className={clsx(
                    "cursor-pointer p-4 rounded-xl border transition-all duration-300 flex flex-col justify-center",
                    levelOfLearning === lvl.id
                      ? "border-slate-900 bg-slate-900 text-white shadow-xl shadow-slate-200"
                      : "border-slate-100 bg-slate-50 hover:border-slate-200"
                  )}
                >
                  <h4 className={clsx(
                    "text-[11px] font-black uppercase tracking-tight",
                    levelOfLearning === lvl.id ? "text-white" : "text-slate-700"
                  )}>{lvl.label}</h4>
                  <p className={clsx(
                    "text-[9px] font-bold leading-tight mt-0.5",
                    levelOfLearning === lvl.id ? "text-slate-400" : "text-slate-400"
                  )}>{lvl.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={isLoading || !topic || !levelOfLearning}
            className={clsx(
              "relative w-full h-14 rounded-2xl font-black text-xs uppercase tracking-widest transition-all duration-300 shadow-2xl",
              isLoading || !topic || !levelOfLearning
                ? "bg-slate-100 text-slate-400 cursor-not-allowed shadow-none"
                : "bg-slate-900 text-white hover:scale-[1.01] active:scale-95 shadow-slate-200"
            )}
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-white/40 animate-pulse" />
                <div className="h-1.5 w-1.5 rounded-full bg-white/60 animate-pulse [animation-delay:-0.15s]" />
                <div className="h-1.5 w-1.5 rounded-full bg-white/80 animate-pulse [animation-delay:-0.3s]" />
                <span>Processing</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <span>Initiate Project</span>
                <FontAwesomeIcon icon={faMagicWandSparkles} className="text-slate-400" />
              </div>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};

const PrivateProjects = ({ searchQuery }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);

  const filteredTasks = useProjectSearch(tasks, searchQuery);

  const totalPages = Math.ceil(filteredTasks.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentTasks = filteredTasks.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const fetchedTasks = await getPrivateProjects();
      const sortedTasks = fetchedTasks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setTasks(sortedTasks.filter(task => !task.isTrashed));
    } catch (error) {
      toast.error("Failed to load your projects.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTasks(); }, []);

  const handleTaskAdd = (newTask) => setTasks((prev) => [newTask, ...prev]);
  const handleTaskDelete = async (taskId) => {
    try {
      await deleteProject(taskId);
      setTasks((prev) => prev.filter((t) => t._id !== taskId));
      toast.success("Project deleted successfully");
    } catch (error) {
      console.error("Error deleting project:", error);
      toast.error("Failed to delete project");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
      <div className="w-full">
        <ToastContainer autoClose={2000} />

        <div className="mb-8 mt-6">
          <div className="relative bg-gradient-to-br from-indigo-700 via-purple-700 to-violet-900 rounded-[2.5rem] p-8 sm:p-10 text-white shadow-2xl shadow-purple-100 overflow-hidden group">
            <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:scale-110 transition-transform duration-700">
              <FaUserShield className="text-[12rem]" />
            </div>
            
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6 min-w-0">
              <div className="flex-1 min-w-0">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full border border-white/10 mb-4 backdrop-blur-md">
                   <FontAwesomeIcon icon={faUserSecret} className="text-[10px] text-purple-200" />
                   <span className="text-[10px] font-black uppercase tracking-widest text-purple-50">Private Workspace</span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-black mb-3 tracking-tight truncate">Your Private Roadmap</h1>
                <p className="text-purple-100/80 font-medium text-sm max-w-xl leading-relaxed">
                   Your personalized learning space. Projects created here are exclusive to you until you decide to share them.
                </p>
              </div>

              <div className="flex flex-col items-center gap-4 flex-shrink-0">
                <button 
                  onClick={() => setOpen(true)}
                  className="bg-white text-purple-700 px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2 whitespace-nowrap min-w-[220px] justify-center"
                >
                  <MdAdd className="text-xl" /> Start New Project
                </button>
                {searchQuery && (
                  <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10">
                     <span className="text-[10px] font-black uppercase tracking-widest">{filteredTasks.length} Matches</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12 animate-in fade-in slide-in-from-top-4 duration-1000">
          {!loading && (
            <div className="w-full md:w-auto">
              <Tabs tabs={TABS} setSelected={setSelected} />
            </div>
          )}
          
          <div className="flex items-center gap-6 w-full md:w-auto px-6 py-2 bg-slate-50 border border-slate-100 rounded-3xl self-center md:self-auto shadow-inner">
            <div className="flex flex-col items-center border-r border-slate-200 pr-6">
               <span className="text-[14px] font-black text-slate-800">{filteredTasks.length}</span>
               <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Personal Records</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
               <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
               <span className="text-[9px] font-black uppercase tracking-widest leading-none">Workspace Secured</span>
            </div>
          </div>
        </div>

        {loading ? (
          selected !== 1 ? (
            <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8">
              {Array.from({ length: 6 }).map((_, i) => <SkeletonProjectCard key={i} />)}
            </div>
          ) : (
            <div className="w-full">
              <SkeletonLoading type="table" count={5} />
            </div>
          )
        ) : (
          <>
            {selected !== 1 ? (
              filteredTasks.length > 0 ? (
                <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8 mb-16 animate-in fade-in slide-in-from-bottom-8 duration-700">
                  {currentTasks.map((t) => (
                    <ProjectCard key={t._id} task={t} onTaskDelete={handleTaskDelete} showDeleteButton={true} />
                  ))}
                </div>
              ) : (
                <div className="py-32 text-center bg-white rounded-[3rem] border border-slate-100 shadow-sm mb-16">
                   <p className="text-sm font-black text-slate-300 uppercase tracking-[0.3em]">
                      {searchQuery ? "No private matches matching search" : "Your private library is empty"}
                   </p>
                </div>
              )
            ) : (
              <div className="mb-16 animate-in fade-in slide-in-from-bottom-8 duration-700">
                <Table tasks={currentTasks} onTaskDelete={handleTaskDelete} showDeleteButton={true} />
              </div>
            )}

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              totalItems={filteredTasks.length}
              itemsPerPage={itemsPerPage}
              onItemsPerPageChange={setItemsPerPage}
              className="pb-20"
            />
          </>
        )}
        <AddProject open={open} setOpen={setOpen} onTaskAdd={handleTaskAdd} />
      </div>
    </div>
  );
};

export default PrivateProjects;
