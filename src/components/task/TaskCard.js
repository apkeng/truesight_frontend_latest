import clsx from "clsx";
import React, { useState } from "react";
import { MdAttachFile, MdKeyboardDoubleArrowUp } from "react-icons/md";
import { PRIOTITYSTYELS } from "../../utils";
import { FaList, FaChevronRight } from "react-icons/fa";
import { AiTwotoneFolderOpen } from "react-icons/ai";
import { useLocation, useNavigate } from "react-router-dom";
import { RiDeleteBin6Line } from "react-icons/ri";
import { toast } from "react-toastify";
import ConfirmationDialog from "../Dialogs";
import { updateStudyPlan } from "../../utils/apiServices";

const ICONS = {
  "Undergraduate Student": <MdKeyboardDoubleArrowUp />,
  "High School": <MdKeyboardDoubleArrowUp />,
  "Primary School": <MdKeyboardDoubleArrowUp />,
  "Post Graduate": <MdKeyboardDoubleArrowUp />,
};

const TaskCard = ({
  task,
  onTaskDelete,
  onTogglePublish,
  showDeleteButton,
}) => {
  const [dialogConfig, setDialogConfig] = useState({
    open: false,
    type: "delete",
    msg: "",
    handler: () => {},
  });
  const navigate = useNavigate();
  const location = useLocation();
  const isMyCollaborations = location.pathname.includes("/my-collaborations");

  const closeDialog = () => {
    setDialogConfig((prev) => ({ ...prev, open: false }));
  };

  const deleteClick = () => {
    setDialogConfig({
      open: true,
      type: "delete",
      msg: "Are you sure you want to move this project to trash?",
      handler: deleteHandler,
    });
  };

  const publishClick = () => {
    setDialogConfig({
      open: true,
      type: task.isPublished ? "unpublish" : "publish",
      msg: task.isPublished
        ? "Are you sure you want to unpublish this project? It will no longer be visible to others."
        : "Are you sure you want to publish this project? It will be visible to others in your institute.",
      handler: publishHandler,
    });
  };

  const openProjectHandler = () => {
    const newPath = `${location.pathname}/${task._id}`;
    navigate(newPath);
  };

  const deleteHandler = async () => {
    try {
      await updateStudyPlan(task._id, {
        isTrashed: true,
        updatedAt: new Date().toISOString(),
      });
      toast.success("Project moved to trash");
      onTaskDelete(task._id);
      closeDialog();
    } catch (error) {
      toast.error("Error moving project to trash");
      console.error("Error updating task:", error);
      closeDialog();
    }
  };

  const publishHandler = async () => {
    try {
      await onTogglePublish(task._id, task.isPublished);
      closeDialog();
    } catch (error) {
      console.error("Error toggling publish status:", error);
      closeDialog();
    }
  };

  return (
    <div className="group relative w-full bg-white rounded-2xl p-4 border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col justify-between hover:-translate-y-1 ring-1 ring-black/5 overflow-hidden">
      {/* Decorative Background Gradient */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-50/50 to-transparent -mr-10 -mt-10 rounded-full blur-2xl group-hover:bg-blue-100/50 transition-colors duration-500" />
      
      {/* Upper Section */}
      <div className="relative">
        <div className="flex justify-between items-start mb-3">
          <div
            className={clsx(
              "flex gap-1.5 items-center text-[8px] font-black px-2 py-1 rounded-lg uppercase tracking-widest border",
              PRIOTITYSTYELS[task?.levelOfLearning] || "bg-slate-50 text-slate-500 border-slate-100"
            )}
          >
            <span className="text-xs opacity-70">{ICONS[task?.levelOfLearning]}</span>
            <span>{task?.levelOfLearning}</span>
          </div>
          
          {isMyCollaborations && (
            <div className="flex flex-col items-end">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={task.isPublished}
                  onChange={publishClick}
                />
                <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
              <span className={clsx(
                "mt-1 text-[8px] font-black uppercase tracking-widest",
                task.isPublished ? "text-blue-600" : "text-slate-400"
              )}>
                {task.isPublished ? "Live" : "Draft"}
              </span>
            </div>
          )}
        </div>

        {/* Project Title */}
        <div className="flex items-start gap-2.5 mb-4">
          <div className="p-2.5 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl shadow-md shrink-0">
            <AiTwotoneFolderOpen className="text-white text-lg" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-base font-black text-slate-900 leading-tight mb-1 group-hover:text-blue-600 transition-colors line-clamp-1">
              {task?.title || task?.topic}
            </h4>
            <div className="flex flex-wrap items-center gap-y-0.5 gap-x-2">
              {task?.name && (
                <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1 whitespace-nowrap">
                  <span className="w-1 h-1 rounded-full bg-indigo-400" />
                  {task.name}
                </p>
              )}
              {task?.createdAt && (
                <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1 whitespace-nowrap">
                  <span className="w-1 h-1 rounded-full bg-emerald-400" />
                  {new Date(task.createdAt).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="flex items-center gap-2 mb-4">
          <div className="flex-1 bg-slate-50 flex items-center justify-center gap-1.5 py-1.5 rounded-lg border border-slate-100">
            <MdAttachFile className="text-blue-500 text-[10px]" />
            <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">{task?.assets?.length || 0} Assets</span>
          </div>
          <div className="flex-1 bg-slate-50 flex items-center justify-center gap-1.5 py-1.5 rounded-lg border border-slate-100">
            <FaList className="text-indigo-500 text-[10px]" />
            <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">{task?.topics?.length || 0} Modules</span>
          </div>
        </div>

      </div>

      {/* Footer Actions */}
      <div className="flex items-center gap-3 pt-4 border-t border-slate-50">
        <button
          onClick={openProjectHandler}
          className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 text-[9px] font-black text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all duration-300 shadow-md uppercase tracking-widest active:scale-95"
        >
          Explore Roadmap
          <FaChevronRight className="text-[7px]" />
        </button>
        
        {showDeleteButton && (
          <button
            onClick={deleteClick}
            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-300 border border-transparent hover:border-red-100 active:scale-90"
          >
            <RiDeleteBin6Line className="h-4 w-4" />
          </button>
        )}
      </div>

      <ConfirmationDialog
        open={dialogConfig.open}
        setOpen={(value) =>
          setDialogConfig((prev) => ({ ...prev, open: value }))
        }
        onClick={dialogConfig.handler}
        type={dialogConfig.type}
        msg={dialogConfig.msg}
      />
    </div>
  );
};

export default TaskCard;
