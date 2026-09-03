import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import clsx from "clsx";
import { MdGridView } from "react-icons/md";
import { IoMdAdd, IoMdClose } from "react-icons/io";
import SkeletonLoading, { SkeletonProjectCard } from "../../../components/SkeletonLoading";
import { toast, ToastContainer } from "react-toastify";
import Cookies from "js-cookie";
import { getPrivateProjects, createProject, deleteProject } from "../../../utils/apiServices";
import { FaList } from "react-icons/fa";
import ProjectCard from "../../../components/privateProject/ProjectCard";
import Table from "../../../components/privateProject/Table";
import { useProjectSearch } from "../../../hooks/useProjectSearch";
import { useProjectCreation } from "../../../hooks/useProjectCreation";
import PuzzleGate from "../../../components/projectCreation/PuzzleGate";
import {
  Button,
  EmptyState,
  Notification,
  NotificationViewport,
  PageBanner,
  PageShell,
  SectionLabel,
} from "../../../components/ui";
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

const AddProject = ({ open, setOpen, onCreateStart }) => {
  const [topic, setTopic] = useState("");
  const [levelOfLearning, setLevelOfLearning] = useState("");

  const resetForm = () => {
    setTopic("");
    setLevelOfLearning("");
  };

  // Creation itself now runs in the background (see useProjectCreation) —
  // this just validates, hands the payload off, and closes the modal so the
  // puzzle/dashboard gate can take over immediately.
  const handleSubmit = (e) => {
    e.preventDefault();
    const uid = Cookies.get("uid");
    if (!uid) {
      toast.error("User not authenticated.");
      return;
    }

    if (!topic || topic.trim().length < 3) {
      toast.error("Please enter a valid topic (at least 3 characters).");
      return;
    }

    setOpen(false);
    onCreateStart({
      topic: topic.trim(),
      levelOfLearning,
      autoGenerate: true
    });
    resetForm();
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
        <div className="pt-1">
           <h3 className="font-display text-xl font-bold text-ink">New project</h3>
           <p className="mt-1 text-xs text-ink-muted">
             Describe the topic and pick a complexity level — the roadmap is generated for you.
           </p>
        </div>

        <div className="space-y-6">
          <div className="space-y-2 px-1">
            <div className="flex items-center justify-between">
              <label htmlFor="topic" className="text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-muted">
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
            <label className="text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-muted">
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
            disabled={!topic || !levelOfLearning}
            className={clsx(
              "h-12 w-full text-[11px] font-semibold uppercase tracking-[0.14em] transition-colors",
              !topic || !levelOfLearning
                ? "cursor-not-allowed bg-line text-ink-muted"
                : "bg-navy text-white hover:bg-navy-dark"
            )}
          >
            Create project
          </button>
        </div>
      </form>
    </Modal>
  );
};

const PrivateProjects = ({ searchQuery }) => {
  const navigate = useNavigate();
  const location = useLocation();
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

  // Creation runs in the background behind the puzzle/dashboard gate — once
  // it settles, fold the new project into the list whether or not the user
  // stuck around to see it happen.
  const projectCreation = useProjectCreation(createProject);
  useEffect(() => {
    if (projectCreation.status === "done" && projectCreation.result) {
      handleTaskAdd(projectCreation.result);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectCreation.status, projectCreation.result]);

  const handleViewProject = (project) => {
    projectCreation.dismissGate();
    navigate(`${location.pathname}/${project._id}`);
  };

  return (
    <PageShell>
      <ToastContainer autoClose={2000} />

      <NotificationViewport>
        {projectCreation.notification && (
          <Notification
            tone={projectCreation.notification.tone}
            title={
              projectCreation.notification.tone === "positive"
                ? "Your roadmap is ready"
                : "Roadmap generation failed"
            }
            message={
              projectCreation.notification.tone === "positive"
                ? `"${projectCreation.notification.project?.topic || "Your project"}" has finished generating.`
                : projectCreation.notification.error?.message || "Please try creating your project again."
            }
            actionLabel={projectCreation.notification.tone === "positive" ? "View project" : undefined}
            onAction={() => handleViewProject(projectCreation.notification.project)}
            onDismiss={projectCreation.dismissNotification}
          />
        )}
      </NotificationViewport>

      <PageBanner
        title="Personal Workspace"
        subtitle="Confidential drafts and ongoing research. Only you can see these study plans until you publish them."
        actions={
          <Button
            variant="secondary"
            size="lg"
            onClick={() => setOpen(true)}
            disabled={projectCreation.status === "pending"}
          >
            <IoMdAdd className="text-base" /> New project
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
                      <IoMdAdd className="text-base" /> New project
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

      <AddProject open={open} setOpen={setOpen} onCreateStart={projectCreation.start} />
      <PuzzleGate
        open={projectCreation.gateOpen}
        status={projectCreation.status}
        result={projectCreation.result}
        error={projectCreation.error}
        onDismiss={projectCreation.dismissGate}
        onViewProject={handleViewProject}
      />
    </PageShell>
  );
};

export default PrivateProjects;
