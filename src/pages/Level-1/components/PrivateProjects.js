import React, { useEffect, useState } from "react";
import clsx from "clsx";
import { MdGridView } from "react-icons/md";
import { IoMdAdd, IoMdClose } from "react-icons/io";
import SkeletonLoading, { SkeletonProjectCard } from "../../../components/SkeletonLoading";
import { toast, ToastContainer } from "react-toastify";
import Cookies from "js-cookie";
import { getPrivateProjects, createProject, deleteProject } from "../../../utils/apiServices";
import { FaList, FaUserShield } from "react-icons/fa";
import ProjectCard from "../../../components/privateProject/ProjectCard";
import Table from "../../../components/privateProject/Table";
import { useProjectSearch } from "../../../hooks/useProjectSearch";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserSecret, faMagicWandSparkles } from "@fortawesome/free-solid-svg-icons";
import Pagination from "../../../components/Pagination";
import Tabs from "../../../components/Tabs";

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
        
        <div className="relative w-full max-w-md transform overflow-hidden rounded-[2rem] bg-white p-6 shadow-2xl transition-all animate-in zoom-in-95 duration-300">
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
        toast.error("Please enter a valid topic (at least 3 characters).");
        setIsLoading(false);
        return;
      }

      toast.info("Initializing project creation...");

      const savedProject = await createProject({
        topic: topic.trim(),
        levelOfLearning,
        autoGenerate: true
      });

      onTaskAdd(savedProject);
      toast.success("Project created successfully!");
      resetForm();
      setOpen(false);
    } catch (error) {
      console.error("Error in project creation:", error);
      const errorMessage = error.response?.data?.error || error.message || "Failed to create project.";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const LEVELS = [
    { id: "Primary School", label: "Primary School", desc: "Foundational concepts" },
    { id: "High School", label: "High School", desc: "Advanced core topics" },
    { id: "Undergraduate", label: "Undergraduate", desc: "Scientific research" },
    { id: "Postgraduate", label: "Postgraduate", desc: "Specialized analysis" },
  ];

  return (
    <Modal open={open} onClose={() => setOpen(false)}>
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="text-center relative pt-2">
           <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-600 mb-4 shadow-sm rotate-3 group-hover:rotate-0 transition-transform duration-500">
             <FontAwesomeIcon icon={faMagicWandSparkles} className="text-xl" />
           </div>
           <h3 className="text-xl font-black text-slate-900 tracking-tight mb-1 uppercase">Architect Roadmap</h3>
        </div>

        <div className="space-y-6">
          <div className="space-y-2 px-1">
            <div className="flex items-center justify-between">
              <label htmlFor="topic" className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
                Research Topic
              </label>
              <span className={clsx(
                "text-[9px] font-black uppercase tracking-widest",
                topic.length > 3 ? "text-slate-900" : "text-slate-300"
              )}>
                {topic.length}/100
              </span>
            </div>
            <textarea
              id="topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              rows={3}
              maxLength={100}
              placeholder="e.g. Impact of blockchain on decentralized finance..."
              className="w-full rounded-xl border-slate-200 bg-slate-50 p-4 text-[11px] font-bold text-slate-900 transition-all focus:border-slate-900 focus:ring-0 placeholder:text-slate-400 no-scrollbar resize-none outline-none shadow-inner"
              required
            />
          </div>

          <div className="space-y-3 px-1">
            <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
              Complexity Level
            </label>
            <div className="grid grid-cols-1 gap-2">
              {LEVELS.map((lvl) => (
                <div
                  key={lvl.id}
                  onClick={() => setLevelOfLearning(lvl.id)}
                  className={clsx(
                    "cursor-pointer p-3 rounded-xl border transition-all duration-300 flex flex-col justify-center",
                    levelOfLearning === lvl.id
                      ? "border-slate-900 bg-slate-900 text-white shadow-lg shadow-slate-200"
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
              "relative w-full h-12 rounded-xl font-black text-[11px] uppercase tracking-widest transition-all duration-300 shadow-xl",
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
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);
  const [selected, setSelected] = useState(0);

  const filteredTasks = useProjectSearch(tasks, searchQuery);

  const totalPages = Math.ceil(filteredTasks.length / itemsPerPage);
  const currentTasks = filteredTasks.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const uid = Cookies.get("uid");
      if (!uid) {
        toast.error("User not authenticated.");
        setLoading(false);
        return;
      }

      const fetchedTasks = await getPrivateProjects();
      const nonTrashedTasks = fetchedTasks.filter(task => !task.isTrashed);
      setTasks(nonTrashedTasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      toast.error("Failed to load tasks.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleTaskAdd = (newTask) => {
    setTasks((prevTasks) => [...prevTasks, newTask]);
  };

  const handleTaskDelete = async (taskId) => {
    try {
      await deleteProject(taskId);
      setTasks((prevTasks) => prevTasks.filter((task) => task._id !== taskId));
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
          <div className="relative bg-gradient-to-br from-indigo-700 via-purple-700 to-violet-900 rounded-[2rem] p-5 sm:p-7 text-white shadow-2xl shadow-indigo-100 overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
              <FontAwesomeIcon icon={faUserSecret} className="text-[10rem]" />
            </div>
            
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-2 px-2 py-0.5 bg-white/10 rounded-full border border-white/10 mb-3 backdrop-blur-md">
                   <FaUserShield className="text-[8px] text-indigo-200" />
                   <span className="text-[8px] font-black uppercase tracking-widest text-indigo-50">Private Research Space</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black mb-2 tracking-tight">Personal Workspace</h1>
                <p className="text-indigo-100/80 font-medium text-xs max-w-xl leading-relaxed">
                  Confidential drafts and ongoing research projects. Only you have access to these study plans until you choose to publish them.
                </p>
              </div>

              <button
                onClick={() => setOpen(true)}
                className="group/btn relative flex items-center gap-2 bg-white px-6 py-3 rounded-xl text-slate-900 font-black text-xs transition-all hover:scale-105 active:scale-95 shadow-lg shadow-black/10 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-100 to-transparent opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                <IoMdAdd className="text-lg relative z-10" />
                <span className="relative z-10">New Project</span>
              </button>
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
               <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Your Projects</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
               <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
               <span className="text-[9px] font-black uppercase tracking-widest leading-none">Protected</span>
            </div>
          </div>
        </div>

        {loading ? (
          selected !== 1 ? (
            <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-12">
              {Array.from({ length: 6 }).map((_, index) => (
                <SkeletonProjectCard key={index} />
              ))}
            </div>
          ) : (
            <div className="w-full">
              <SkeletonLoading type="table" count={5} />
            </div>
          )
        ) : (
          <>
            {selected !== 1 ? (
              <>
                {filteredTasks.length > 0 ? (
                  <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8 mb-16 animate-in fade-in slide-in-from-bottom-8 duration-700">
                    {currentTasks.map((task) => (
                      <ProjectCard
                        key={task._id}
                        task={task}
                        onTaskDelete={handleTaskDelete}
                        showDeleteButton={true}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="py-32 text-center bg-white rounded-[3rem] border border-slate-100 shadow-sm mb-16 overflow-hidden relative group">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                    <div className="relative z-10 flex flex-col items-center max-w-sm mx-auto">
                      <div className="w-20 h-20 bg-indigo-50 rounded-3xl flex items-center justify-center mb-6 text-indigo-600 transition-transform group-hover:scale-110 duration-500">
                        <FontAwesomeIcon icon={faMagicWandSparkles} className="text-3xl" />
                      </div>
                      <h3 className="text-xl font-black text-slate-900 mb-2">Blank Canvas</h3>
                      <p className="text-slate-500 font-medium text-sm mb-8 leading-relaxed">
                        {searchQuery ? "No matching projects found in your local repository." : "Your private workspace is ready for your next big research project."}
                      </p>
                      {!searchQuery && (
                        <button
                          onClick={() => setOpen(true)}
                          className="flex items-center gap-3 bg-indigo-600 px-8 py-3 rounded-2xl text-white font-black text-sm shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95"
                        >
                          <IoMdAdd className="text-xl" />
                          Start New Project
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="mb-16 animate-in fade-in slide-in-from-bottom-8 duration-700">
                <Table
                  tasks={currentTasks}
                  onTaskDelete={handleTaskDelete}
                  showDeleteButton={true}
                />
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
