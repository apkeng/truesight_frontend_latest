import React, { useEffect, useState } from "react";
import { MdGridView } from "react-icons/md";
import { IoMdAdd, IoMdClose } from "react-icons/io";
import SkeletonLoading, { SkeletonProjectCard } from "../../../components/SkeletonLoading";
import Tabs from "../../../components/Tabs";
import Pagination from "../../../components/Pagination";
import { toast, ToastContainer } from "react-toastify";
import Cookies from "js-cookie";
import { getStudyPlans, createStudyPlan, togglePublishStudyPlan } from "../../../utils/apiServices";
import TaskCard from "../../../components/task/TaskCard";
import { FaList } from "react-icons/fa";
import Table from "../../../components/task/Table";
import { useProjectSearch } from "../../../hooks/useProjectSearch";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHandsHelping, faUsersGear, faMagicWandSparkles } from "@fortawesome/free-solid-svg-icons";
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
          className="fixed inset-0 bg-navy/40  transition-opacity" 
          onClick={onClose}
        />
        
        <div className="relative w-full max-w-md transform overflow-hidden  bg-white p-8  transition-all animate-in zoom-in-95 duration-300">
          <button 
            className="absolute right-6 top-6 z-[110] flex h-10 w-10 items-center justify-center rounded-full bg-parchment text-ink-muted hover:bg-parchment hover:text-ink transition-colors cursor-pointer"
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
        toast.error("Please enter a valid topic.");
        setIsLoading(false);
        return;
      }

      toast.info("Architecting collaborative roadmap...");

      // The backend now handles validation, user profile lookup, 
      // LLM generation, and document construction for study plans.
      const savedProject = await createStudyPlan({
        topic: topic.trim(),
        levelOfLearning,
        autoGenerate: true
      });

      onTaskAdd(savedProject);
      toast.success("Collaboration roadmap initiated!");
      resetForm();
      setOpen(false);
    } catch (error) {
      console.error("Error in project creation:", error);
      const errorMessage = error.response?.data?.error || error.message || "Failed to architect roadmap.";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const LEVELS = [
    { id: "Primary School", label: "Primary", desc: "Foundational concepts" },
    { id: "High School", label: "Secondary", desc: "Advanced core topics" },
    { id: "Undergraduate Student", label: "Undergraduate", desc: "Scientific research" },
    { id: "Post Graduate", label: "Postgraduate", desc: "Specialized analysis" },
  ];

  return (
    <Modal open={open} onClose={() => setOpen(false)}>
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="text-center relative pt-4">
           <div className="inline-flex h-16 w-16 items-center justify-center  bg-parchment text-ink-muted mb-6   transition-all duration-500">
             <FontAwesomeIcon icon={faHandsHelping} className="text-2xl" />
           </div>
           <h3 className="text-2xl font-semibold text-ink tracking-tight mb-2 uppercase">Initiate Collaboration</h3>
           <p className="text-ink-muted font-bold text-[10px] px-6 leading-relaxed uppercase tracking-[0.14em]">Provide your objectives to architect a roadmap.</p>
        </div>

        <div className="space-y-6">
          <div className="space-y-3 px-1">
            <div className="flex items-center justify-between">
              <label htmlFor="topic" className="text-[10px] font-semibold uppercase tracking-[0.2em] text-ink-muted">
                Project Goal / Topic
              </label>
              <span className={clsx(
                "text-[10px] font-semibold uppercase tracking-[0.14em]",
                topic.length > 3 ? "text-ink" : "text-ink-muted"
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
              placeholder="e.g. Analysis of renewable energy policies..."
              className="w-full  border-line bg-parchment p-5 text-xs font-bold text-ink transition-all focus:border-slate-900 focus:ring-0 placeholder:text-ink-muted no-scrollbar resize-none outline-none "
              required
            />
          </div>

          <div className="space-y-4 px-1">
            <label className="text-[10px] font-semibold uppercase tracking-[0.2em] text-ink-muted">
              Complexity Level
            </label>
            <div className="grid grid-cols-1 gap-2">
              {LEVELS.map((lvl) => (
                <div
                  key={lvl.id}
                  onClick={() => setLevelOfLearning(lvl.id)}
                  className={clsx(
                    "cursor-pointer p-4  border transition-all duration-300 flex flex-col justify-center",
                    levelOfLearning === lvl.id
                      ? "border-slate-900 bg-navy text-white  "
                      : "border-line bg-parchment hover:border-line"
                  )}
                >
                  <h4 className={clsx(
                    "text-[11px] font-semibold uppercase tracking-tight",
                    levelOfLearning === lvl.id ? "text-white" : "text-ink"
                  )}>{lvl.label}</h4>
                  <p className={clsx(
                    "text-[9px] font-bold leading-tight mt-0.5",
                    levelOfLearning === lvl.id ? "text-ink-muted" : "text-ink-muted"
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
              "relative w-full h-14  font-semibold text-xs uppercase tracking-[0.14em] transition-all duration-300 ",
              isLoading || !topic || !levelOfLearning
                ? "bg-parchment text-ink-muted cursor-not-allowed "
                : "bg-navy text-white hover:scale-[1.01] active:scale-95 "
            )}
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-white/40 animate-pulse" />
                <div className="h-1.5 w-1.5 rounded-full bg-white/60 animate-pulse [animation-delay:-0.15s]" />
                <div className="h-1.5 w-1.5 rounded-full bg-white/80 animate-pulse [animation-delay:-0.3s]" />
                <span>Architecting</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <span>Initiate Collaboration</span>
                <FontAwesomeIcon icon={faMagicWandSparkles} className="text-ink-muted" />
              </div>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};

const MyCollaborations = ({ searchQuery }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);

  const filteredTasks = useProjectSearch(tasks, searchQuery);
  const totalItems = filteredTasks.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedTasks = filteredTasks.slice(startIndex, endIndex);

  useEffect(() => { setCurrentPage(1); }, [searchQuery]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const togglePublishStatus = async (taskId, currentStatus) => {
    try {
      await togglePublishStudyPlan(taskId, currentStatus);
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task._id === taskId ? { ...task, isPublished: !currentStatus } : task
        )
      );
      toast.success(`Project ${!currentStatus ? "published" : "unpublished"} successfully!`);
    } catch (error) {
      toast.error("Failed to update publish status");
    }
  };

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const fetchedTasks = await getStudyPlans({ published: undefined });
      setTasks(fetchedTasks.filter(task => !task.isTrashed));
    } catch (error) {
      toast.error("Failed to load tasks.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTasks(); }, []);

  const handleTaskAdd = (newTask) => setTasks((prev) => [...prev, newTask]);
  const handleTaskDelete = (taskId) => setTasks((prev) => prev.filter((t) => t._id !== taskId));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
      <div className="w-full">
        <ToastContainer autoClose={2000} />

        <div className="mb-8 mt-6">
          <div className="relative bg-gradient-to-br from-teal-700 via-emerald-800 to-teal-900  p-8 sm:p-10 text-white  shadow-teal-100 overflow-hidden group">
            <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:scale-110 transition-transform duration-700">
              <FontAwesomeIcon icon={faHandsHelping} className="text-[12rem]" />
            </div>
            
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full border border-white/10 mb-4 ">
                   <FontAwesomeIcon icon={faUsersGear} className="text-[10px] text-teal-200" />
                   <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-teal-50">Collaborative Workspace</span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-semibold mb-3 tracking-tight">My Collaborations</h1>
                <p className="text-teal-100/80 font-medium text-sm max-w-xl leading-relaxed">
                  Manage projects you are contributing to or leading. Synchronize research efforts and academic publications across your professional network.
                </p>
              </div>

              <button
                onClick={() => setOpen(true)}
                className="group/btn relative flex items-center gap-3 bg-white px-8 py-4  text-ink font-semibold text-sm transition-all hover:scale-105 active:scale-95  shadow-black/10 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-teal-100 to-transparent opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                <IoMdAdd className="text-xl relative z-10" />
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
          
          <div className="flex items-center gap-6 w-full md:w-auto px-6 py-2 bg-parchment border border-line  self-center md:self-auto ">
            <div className="flex flex-col items-center border-r border-line pr-6">
               <span className="text-[14px] font-semibold text-ink">{filteredTasks.length}</span>
               <span className="text-[9px] font-semibold uppercase tracking-[0.14em] text-ink-muted">Collaborations</span>
            </div>
            <div className="flex items-center gap-2 text-ink-muted">
               <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
               <span className="text-[9px] font-semibold uppercase tracking-[0.14em] leading-none">Sync Active</span>
            </div>
          </div>
        </div>
        {loading ? (
          selected !== 1 ? (
            <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-12">
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
                  {paginatedTasks.map((task) => (
                    <TaskCard key={task._id} task={task} onTaskDelete={handleTaskDelete} onTogglePublish={() => togglePublishStatus(task._id, task.isPublished)} showDeleteButton={true} />
                  ))}
                </div>
              ) : (
                <div className="py-32 text-center bg-white  border border-line  mb-16">
                   <p className="text-sm font-semibold text-ink-muted uppercase tracking-[0.3em]">{searchQuery ? "No matching collaborations found." : "No active collaborations found."}</p>
                </div>
              )
            ) : (
              <div className="mb-16 animate-in fade-in slide-in-from-bottom-8 duration-700">
                <Table tasks={paginatedTasks} onTaskDelete={handleTaskDelete} onTogglePublish={togglePublishStatus} showDeleteButton={true} />
              </div>
            )}
            
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              totalItems={totalItems}
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

export default MyCollaborations;
