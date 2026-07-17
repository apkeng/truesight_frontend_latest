import React, { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import { IoMdClose, IoMdAdd } from "react-icons/io";
import { MdUpload, MdDelete, MdOutlineAutoAwesome } from "react-icons/md";
import { FaBookOpen, FaChevronDown, FaChevronUp } from "react-icons/fa";
import clsx from "clsx";
import { uploadSyllabus, getSyllabus, deleteSyllabus, createProject } from "../utils/apiServices";

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
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md" onClick={onClose} />
        <div className="relative w-full max-w-sm bg-white rounded-[2rem] p-6 shadow-2xl z-10">
          <button
            onClick={onClose}
            className="absolute right-5 top-5 w-9 h-9 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors"
          >
            <IoMdClose />
          </button>

          <div className="mb-5">
            <div className="flex items-center gap-2 mb-1">
              <MdOutlineAutoAwesome className="text-indigo-500 text-lg" />
              <h3 className="text-base font-black text-slate-900 uppercase tracking-tight">Create Project</h3>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              Topic: <span className="text-slate-800 font-bold">{topic?.name}</span>
            </p>
          </div>

          <div className="space-y-2 mb-6">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Complexity Level</p>
            {LEVELS.map((lvl) => (
              <div
                key={lvl.id}
                onClick={() => setLevelOfLearning(lvl.id)}
                className={clsx(
                  "cursor-pointer px-4 py-2.5 rounded-xl border transition-all text-[11px] font-bold",
                  levelOfLearning === lvl.id
                    ? "border-slate-900 bg-slate-900 text-white"
                    : "border-slate-100 bg-slate-50 text-slate-700 hover:border-slate-200"
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
              "w-full h-11 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all",
              isLoading
                ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                : "bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95 shadow-lg shadow-indigo-100"
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
              "Initiate Project"
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
    <div className="bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group">
      <div className="p-4">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex-1 min-w-0">
            <h4 className="text-[12px] font-black text-slate-900 uppercase tracking-tight leading-snug truncate">
              {topic.name}
            </h4>
            {topic.description && (
              <p className="text-[10px] text-slate-500 font-medium leading-relaxed mt-0.5 line-clamp-2">
                {topic.description}
              </p>
            )}
          </div>
          <button
            onClick={() => onCreateProject(topic)}
            className="flex-shrink-0 flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-sm shadow-indigo-200 whitespace-nowrap"
          >
            <IoMdAdd className="text-sm" />
            Project
          </button>
        </div>

        {topic.subtopics && topic.subtopics.length > 0 && (
          <>
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors mt-2"
            >
              {expanded ? <FaChevronUp className="text-[8px]" /> : <FaChevronDown className="text-[8px]" />}
              {topic.subtopics.length} subtopics
            </button>

            {expanded && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {topic.subtopics.map((sub, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 bg-indigo-50 text-indigo-700 text-[9px] font-bold rounded-lg border border-indigo-100"
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
        "relative cursor-pointer border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300",
        dragOver ? "border-indigo-400 bg-indigo-50" : "border-slate-200 bg-slate-50 hover:border-indigo-300 hover:bg-indigo-50/50"
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
          "w-14 h-14 rounded-2xl flex items-center justify-center transition-colors",
          dragOver ? "bg-indigo-100 text-indigo-600" : "bg-white text-slate-400 shadow-sm"
        )}>
          {isUploading ? (
            <div className="w-6 h-6 border-2 border-indigo-300 border-t-indigo-600 rounded-full animate-spin" />
          ) : (
            <MdUpload className="text-2xl" />
          )}
        </div>
        <div>
          <p className="text-sm font-black text-slate-700 mb-0.5">
            {isUploading ? "Analysing syllabus..." : "Drop your syllabus PDF here"}
          </p>
          <p className="text-[10px] text-slate-400 font-medium">
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
          <div key={i} className="h-20 bg-slate-100 rounded-2xl animate-pulse" />
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
          <div className="flex items-start justify-between gap-4 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl border border-indigo-100">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <FaBookOpen className="text-indigo-600 text-sm" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-0.5">Current Syllabus</p>
                <h3 className="text-sm font-black text-slate-900 truncate">{syllabus.mindmap?.syllabusTitle || syllabus.filename}</h3>
                {syllabus.mindmap?.description && (
                  <p className="text-[10px] text-slate-500 font-medium leading-relaxed mt-0.5 line-clamp-2">{syllabus.mindmap.description}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={handleDelete}
                className="w-8 h-8 rounded-xl bg-red-50 hover:bg-red-100 text-red-400 hover:text-red-600 flex items-center justify-center transition-colors"
                title="Remove syllabus"
              >
                <MdDelete className="text-base" />
              </button>
            </div>
          </div>

          {/* Topic cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
            className="w-full py-2.5 rounded-xl border border-dashed border-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 hover:border-slate-300 transition-colors"
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
