import React, { useEffect, useState } from "react";
import SkeletonLoading, { SkeletonProjectCard } from "../../../components/SkeletonLoading";
import Tabs from "../../../components/Tabs";
import { toast, ToastContainer } from "react-toastify";
import Cookies from "js-cookie";
import { getPrivateProjects, createProject, deleteProject } from "../../../utils/apiServices";
import { MdGridView, MdAdd } from "react-icons/md";
import { FaList } from "react-icons/fa";
import ProjectCard from "../../../components/privateProject/ProjectCard";
import Table from "../../../components/privateProject/Table";
import Pagination from "../../../components/Pagination";
import { useProjectSearch } from "../../../hooks/useProjectSearch";
import {
  Button,
  EmptyState,
  PageBanner,
  PageShell,
  SectionLabel,
} from "../../../components/ui";
import { IoMdClose } from "react-icons/io";
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
          className="fixed inset-0 bg-ink/50" 
          onClick={onClose}
        />
        
        <div className="relative w-full max-w-md border border-line bg-white p-6">
          <button 
            className="absolute right-4 top-4 z-[110] flex h-8 w-8 items-center justify-center border border-line text-ink-muted transition-colors hover:text-ink"
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
        <div className="pt-1">
           <h3 className="font-display text-xl font-bold text-ink">New project</h3>
           <p className="mt-1 text-xs text-ink-muted">
             Describe the topic and pick a complexity level — the roadmap is generated for you.
           </p>
        </div>

        <div className="space-y-6">
          <div className="space-y-3 px-1">
            <div className="flex items-center justify-between">
              <label htmlFor="topic" className="text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-muted">
                Research Topic
              </label>
              <span className={clsx(
                "text-[10px] font-semibold uppercase tracking-[0.14em]",
                topic.length > 3 ? "text-ink" : "text-ink-muted"
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
              className="no-scrollbar w-full resize-none border border-line bg-white p-4 text-sm text-ink outline-none transition-colors placeholder:text-ink-muted focus:border-navy"
              required
            />
          </div>

          <div className="space-y-4 px-1">
            <label className="text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-muted">
              Complexity Level
            </label>
            <div className="grid grid-cols-1 gap-2">
              {LEVELS.map((lvl) => (
                <div
                  key={lvl.id}
                  onClick={() => setLevelOfLearning(lvl.id)}
                  className={clsx(
                    "flex cursor-pointer flex-col justify-center border p-3 transition-colors",
                    levelOfLearning === lvl.id
                      ? "border-navy bg-navy text-white"
                      : "border-line bg-white hover:border-navy/40"
                  )}
                >
                  <h4 className={clsx(
                    "text-[11px] font-semibold uppercase tracking-[0.1em]",
                    levelOfLearning === lvl.id ? "text-white" : "text-ink"
                  )}>{lvl.label}</h4>
                  <p className={clsx(
                    "mt-0.5 text-[10px] leading-tight",
                    levelOfLearning === lvl.id ? "text-white/60" : "text-ink-muted"
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
              "h-12 w-full text-[11px] font-semibold uppercase tracking-[0.14em] transition-colors",
              isLoading || !topic || !levelOfLearning
                ? "cursor-not-allowed bg-line text-ink-muted"
                : "bg-navy text-white hover:bg-navy-dark"
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
                <span>Create project</span>
                
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
    <PageShell>
      <ToastContainer autoClose={2000} />

      <PageBanner
        title="Private Projects"
        subtitle="Confidential drafts and ongoing research. Only you can see these study plans until you publish them."
        actions={
          <Button variant="secondary" size="lg" onClick={() => setOpen(true)}>
            <MdAdd className="text-base" /> New project
          </Button>
        }
      />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {!loading && <Tabs tabs={TABS} setSelected={setSelected} />}
        <SectionLabel>{filteredTasks.length} projects</SectionLabel>
      </div>

      {loading ? (
        selected !== 1 ? (
          <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <SkeletonProjectCard key={index} />
            ))}
          </div>
        ) : (
          <SkeletonLoading type="table" count={5} />
        )
      ) : (
        <>
          {selected !== 1 ? (
            filteredTasks.length > 0 ? (
              <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
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
              <EmptyState
                title={searchQuery ? "No matching projects" : "Your workspace is empty"}
                description={
                  searchQuery
                    ? "Nothing in your private library matches that search."
                    : "Start a project and it will appear here, visible only to you."
                }
                action={
                  !searchQuery && (
                    <Button onClick={() => setOpen(true)}>
                      <MdAdd className="text-base" /> New project
                    </Button>
                  )
                }
              />
            )
          ) : (
            <Table
              tasks={currentTasks}
              onTaskDelete={handleTaskDelete}
              showDeleteButton={true}
            />
          )}

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            totalItems={filteredTasks.length}
            itemsPerPage={itemsPerPage}
            onItemsPerPageChange={setItemsPerPage}
          />
        </>
      )}

      <AddProject open={open} setOpen={setOpen} onTaskAdd={handleTaskAdd} />
    </PageShell>
  );
};

export default PrivateProjects;
