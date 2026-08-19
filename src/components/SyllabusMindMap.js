import React, { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import { IoMdClose, IoMdAdd } from "react-icons/io";
import { MdUpload, MdDelete, MdOutlineAutoAwesome } from "react-icons/md";
import { FaBookOpen, FaChevronDown, FaChevronUp } from "react-icons/fa";
import clsx from "clsx";
import { uploadSyllabus, getSyllabus, deleteSyllabus, createProject } from "../utils/apiServices";
import { Highlight } from "./ui";

const LEVELS = [
  { id: "Primary School", label: "Primary School" },
  { id: "High School", label: "High School" },
  { id: "Undergraduate", label: "Undergraduate" },
  { id: "Postgraduate", label: "Postgraduate" },
];

const CreateProjectModal = ({ topic, open, onClose, onCreated }) => {
  const [levelOfLearning, setLevelOfLearning] = useState("Undergraduate");
  const [isLoading, setIsLoading] = useState(false);

  if (!open) return null;

  const handleCreate = async () => {
    setIsLoading(true);
    try {
      const project = await createProject({
        topic: topic.name,
        levelOfLearning,
        autoGenerate: true,
      });
      toast.success("Project created successfully!");
      onCreated(project);
      onClose();
    } catch (err) {
      toast.error(err.message || "Failed to create project");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-ink/50" onClick={onClose} />
        <div className="relative z-10 w-full max-w-sm border border-line bg-white p-6">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center border border-line text-ink-muted transition-colors hover:text-ink"
          >
            <IoMdClose />
          </button>

          <div className="mb-6">
            <div className="mb-1 flex items-center gap-2">
              <MdOutlineAutoAwesome className="text-base text-navy" />
              <h3 className="font-display text-lg font-bold text-ink">Create Project</h3>
            </div>
            <p className="text-xs text-ink-muted">
              Topic: <span className="font-semibold text-ink">{topic?.name}</span>
            </p>
          </div>

          <div className="mb-6 space-y-2">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-muted">Complexity level</p>
            {LEVELS.map((lvl) => (
              <div
                key={lvl.id}
                onClick={() => setLevelOfLearning(lvl.id)}
                className={clsx(
                  "cursor-pointer border px-4 py-2.5 text-xs font-semibold transition-colors",
                  levelOfLearning === lvl.id
                    ? "border-navy bg-navy text-white"
                    : "border-line bg-white text-ink hover:border-navy/40"
                )}
              >
                {lvl.label}
              </div>
            ))}
          </div>

          <button
            onClick={handleCreate}
            disabled={isLoading}
            className={clsx(
              "h-11 w-full text-[11px] font-semibold uppercase tracking-[0.14em] transition-colors",
              isLoading
                ? "cursor-not-allowed bg-line text-ink-muted"
                : "bg-navy text-white hover:bg-navy-dark"
            )}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-white/60 animate-pulse" />
                <span className="h-1.5 w-1.5 rounded-full bg-white/80 animate-pulse [animation-delay:-0.15s]" />
                <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse [animation-delay:-0.3s]" />
                <span>Generating...</span>
              </span>
            ) : (
              "Create project"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

const TopicCard = ({ topic, onCreateProject }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="group border border-line bg-white transition-colors hover:border-navy/40">
      <div className="p-4">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex-1 min-w-0">
            <h4 className="truncate text-[12px] font-bold uppercase tracking-[0.06em] text-ink">
              {topic.name}
            </h4>
            {topic.description && (
              <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-ink-muted">
                {topic.description}
              </p>
            )}
          </div>
          <button
            onClick={() => onCreateProject(topic)}
            className="flex flex-shrink-0 items-center gap-1 whitespace-nowrap bg-navy px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-white transition-colors hover:bg-navy-dark"
          >
            <IoMdAdd className="text-sm" />
            Project
          </button>
        </div>

        {topic.subtopics && topic.subtopics.length > 0 && (
          <>
            <button
              onClick={() => setExpanded(!expanded)}
              className="mt-3 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-muted transition-colors hover:text-navy"
            >
              {expanded ? <FaChevronUp className="text-[8px]" /> : <FaChevronDown className="text-[8px]" />}
              {topic.subtopics.length} subtopics
            </button>

            {expanded && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {topic.subtopics.map((sub, i) => (
                  <span
                    key={i}
                    className="border border-navy/15 bg-navy-wash px-2.5 py-1 text-[10px] font-semibold text-navy"
                  >
                    {sub}
                  </span>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

const UploadZone = ({ onUpload, isUploading }) => {
  const [dragOver, setDragOver] = useState(false);
  const inputRef = React.useRef();

  const handleFile = (file) => {
    if (!file) return;
    if (file.type !== "application/pdf") {
      toast.error("Please upload a PDF file");
      return;
    }
    onUpload(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files[0]);
  };

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      onClick={() => !isUploading && inputRef.current?.click()}
      className={clsx(
        "relative cursor-pointer border border-dashed p-10 text-center transition-colors",
        dragOver ? "border-navy bg-navy-wash" : "border-line bg-parchment hover:border-navy/40"
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={(e) => handleFile(e.target.files[0])}
      />
      <div className="flex flex-col items-center gap-3">
        <div className={clsx(
          "flex h-12 w-12 items-center justify-center border transition-colors",
          dragOver ? "border-navy bg-white text-navy" : "border-line bg-white text-ink-muted"
        )}>
          {isUploading ? (
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-line border-t-navy" />
          ) : (
            <MdUpload className="text-2xl" />
          )}
        </div>
        <div>
          <p className="mb-1 font-display text-base font-bold text-ink">
            {isUploading ? "Analysing syllabus..." : "Drop your syllabus PDF here"}
          </p>
          <p className="text-xs text-ink-muted">
            {isUploading ? "AI is extracting topics" : "or click to browse · PDF only · max 10MB"}
          </p>
        </div>
      </div>
    </div>
  );
};

const SyllabusMindMap = ({ onProjectCreated }) => {
  const [syllabus, setSyllabus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const fetchSyllabus = useCallback(async () => {
    try {
      const data = await getSyllabus();
      setSyllabus(data);
    } catch (err) {
      console.error("Error fetching syllabus:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSyllabus();
  }, [fetchSyllabus]);

  const handleUpload = async (file) => {
    setIsUploading(true);
    try {
      toast.info("Uploading and analysing syllabus...");
      const data = await uploadSyllabus(file);
      setSyllabus(data);
      toast.success("Syllabus mind map generated!");
    } catch (err) {
      toast.error(err.message || "Failed to process syllabus");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteSyllabus();
      setSyllabus(null);
      toast.success("Syllabus removed");
    } catch (err) {
      toast.error("Failed to delete syllabus");
    }
  };

  const handleCreateProject = (topic) => {
    setSelectedTopic(topic);
    setShowModal(true);
  };

  const handleProjectCreated = (project) => {
    if (onProjectCreated) onProjectCreated(project);
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 animate-pulse border border-line bg-parchment" />
        ))}
      </div>
    );
  }

  return (
    <div>
      {!syllabus ? (
        <UploadZone onUpload={handleUpload} isUploading={isUploading} />
      ) : (
        <div className="space-y-4">
          {/* Syllabus header */}
          <Highlight
            icon={<FaBookOpen />}
            label="Current syllabus"
            title={syllabus.mindmap?.syllabusTitle || syllabus.filename}
            description={syllabus.mindmap?.description}
            action={
              <button
                onClick={handleDelete}
                className="flex h-8 w-8 items-center justify-center border border-navy/15 bg-white text-ink-muted transition-colors hover:border-red-200 hover:text-red-600"
                title="Remove syllabus"
              >
                <MdDelete className="text-base" />
              </button>
            }
          />

          {/* Topic cards */}
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {syllabus.mindmap?.topics?.map((topic) => (
              <TopicCard
                key={topic.id}
                topic={topic}
                onCreateProject={handleCreateProject}
              />
            ))}
          </div>

          {/* Re-upload */}
          <button
            onClick={() => setSyllabus(null)}
            className="w-full border border-dashed border-line py-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-muted transition-colors hover:border-navy/40 hover:text-navy"
          >
            Upload a different syllabus
          </button>
        </div>
      )}

      <CreateProjectModal
        topic={selectedTopic}
        open={showModal}
        onClose={() => setShowModal(false)}
        onCreated={handleProjectCreated}
      />
    </div>
  );
};

export default SyllabusMindMap;
