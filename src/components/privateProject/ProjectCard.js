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
import { updateProject } from "../../utils/apiServices";

const ICONS = {
  "Undergraduate Student": <MdKeyboardDoubleArrowUp />,
  "High School": <MdKeyboardDoubleArrowUp />,
  "Primary School": <MdKeyboardDoubleArrowUp />,
  "Post Graduate": <MdKeyboardDoubleArrowUp />,
};

const ProjectCard = ({ task, onTaskDelete, showDeleteButton }) => {
  const [openDialog, setOpenDialog] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const deleteClick = () => {
    setOpenDialog(true);
  };

  const openProjectHandler = () => {
    const newPath = `${location.pathname}/${task._id}`;
    navigate(newPath);
  };

  const deleteHandler = async () => {
    try {
      await updateProject(task._id, {
        isTrashed: true,
        updatedAt: new Date().toISOString(),
      });
      toast.success("Project moved to trash");
      onTaskDelete(task._id);
      setOpenDialog(false);
    } catch (error) {
      toast.error("Error moving project to trash");
      console.error("Error updating task:", error);
      setOpenDialog(false);
    }
  };

  return (
    <div className="group flex w-full flex-col justify-between border border-line bg-white transition-colors hover:border-navy/40">
      <div className="p-5">
        <div className="mb-4 flex items-start justify-between gap-3">
          <span
            className={clsx(
              "inline-flex items-center gap-1.5 border px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em]",
              PRIOTITYSTYELS[task?.levelOfLearning] || "border-line bg-parchment text-ink-muted"
            )}
          >
            <span className="text-xs opacity-70">{ICONS[task?.levelOfLearning]}</span>
            <span>{task?.levelOfLearning}</span>
          </span>

          <span className="border border-navy/20 bg-navy-wash px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-navy">
            Private
          </span>
        </div>

        <div className="mb-4 flex items-start gap-3">
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center bg-navy text-white">
            <AiTwotoneFolderOpen className="text-base" />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="line-clamp-2 font-display text-base font-bold leading-snug text-ink">
              {task?.topic || task?.title}
            </h4>
            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-ink-muted">
              <span>Personal workspace</span>
              {task?.createdAt && (
                <span>
                  {(() => {
                    const date = task.createdAt._seconds
                      ? new Date(task.createdAt._seconds * 1000)
                      : new Date(task.createdAt);
                    return isNaN(date.getTime()) ? "Recent" : date.toLocaleDateString();
                  })()}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex flex-1 items-center justify-center gap-1.5 border border-line bg-parchment py-2">
            <MdAttachFile className="text-[11px] text-navy" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-muted">
              {task?.assets?.length || 0} Assets
            </span>
          </div>
          <div className="flex flex-1 items-center justify-center gap-1.5 border border-line bg-parchment py-2">
            <FaList className="text-[11px] text-navy" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-muted">
              {task?.topics?.length || 0} Modules
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 border-t border-line-soft p-4">
        <button
          onClick={openProjectHandler}
          className="flex h-10 flex-1 items-center justify-center gap-2 bg-navy text-[11px] font-semibold uppercase tracking-[0.14em] text-white transition-colors hover:bg-navy-dark"
        >
          Resume building
          <FaChevronRight className="text-[8px]" />
        </button>

        {showDeleteButton && (
          <button
            onClick={deleteClick}
            className="flex h-10 w-10 items-center justify-center border border-line text-ink-muted transition-colors hover:border-red-200 hover:text-red-600"
          >
            <RiDeleteBin6Line className="h-4 w-4" />
          </button>
        )}
      </div>

      <ConfirmationDialog
        open={openDialog}
        setOpen={setOpenDialog}
        onClick={deleteHandler}
        msg="Are you sure you want to move this project to trash?"
      />
    </div>
  );
};

export default ProjectCard;
