import clsx from "clsx";
import React, { useState } from "react";
import { MdAttachFile } from "react-icons/md";
import { PRIOTITYSTYELS } from "../../utils";
import { FaList } from "react-icons/fa";
import ConfirmationDialog from "../Dialogs";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { updateStudyPlan } from "../../utils/apiServices";

const Table = ({ tasks, onTaskDelete, onTogglePublish, showDeleteButton }) => {
  const [dialogConfig, setDialogConfig] = useState({
    open: false,
    type: "delete",
    msg: "",
    handler: () => {},
  });
  const [selected, setSelected] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();
  const isMyCollaborationsPage =
    location.pathname === "/l1dashboard/project/my-collaborations";

  const closeDialog = () => {
    setDialogConfig((prev) => ({ ...prev, open: false }));
  };

  const openProjectHandler = (id) => {
    const newPath = `${location.pathname}/${id}`;
    navigate(newPath);
  };

  const deleteHandler = async () => {
    try {
      await updateStudyPlan(selected, { isTrashed: true });
      toast.success("Project moved to trash");
      onTaskDelete(selected);
      closeDialog();
    } catch (error) {
      toast.error("Error moving project to trash");
      closeDialog();
    }
  };

  const publishHandler = async (taskId, currentStatus) => {
    try {
      await onTogglePublish(taskId, currentStatus);
      closeDialog();
    } catch (error) {
      console.error("Error toggling publish status:", error);
      closeDialog();
    }
  };

  const deleteClicks = (id) => {
    setSelected(id);
    setDialogConfig({
      open: true,
      type: "delete",
      msg: "Are you sure you want to move this project to trash?",
      handler: deleteHandler,
    });
  };

  const publishClick = (taskId, isPublished) => {
    setSelected(taskId);
    setDialogConfig({
      open: true,
      type: isPublished ? "unpublish" : "publish",
      msg: isPublished
        ? "Are you sure you want to unpublish this project? It will no longer be visible to others."
        : "Are you sure you want to publish this project? It will be visible to others in your institute.",
      handler: () => publishHandler(taskId, isPublished),
    });
  };

  return (
    <div className="w-full min-w-0 border border-line bg-white">
      <div className="w-full max-w-full overflow-x-auto">
        <table className="w-full text-left border-collapse table-fixed min-w-[800px]">
          <thead>
            <tr className="border-b border-line-soft bg-parchment">
              <th className={clsx("px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-muted", isMyCollaborationsPage ? "w-[20%]" : "w-[25%]")}>Curriculum details</th>
              <th className={clsx("px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-muted", isMyCollaborationsPage ? "w-[10%]" : "w-[12%]")}>Target persona</th>
              <th className="w-[10%] px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-muted">Lead author</th>
              <th className="w-[10%] px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-muted">Created</th>
              <th className="w-[8%] px-6 py-4 text-center text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-muted">Resources</th>
              {isMyCollaborationsPage && (
                <th className="w-[9%] px-6 py-4 text-center text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-muted">Access</th>
              )}
              <th className={clsx("px-6 py-4 text-right text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-muted", isMyCollaborationsPage ? "w-[23%]" : "w-[23%]")}>Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line-soft">
            {tasks.length > 0 ? (
              tasks.map((task, index) => (
                <tr
                  key={index}
                  className="group transition-colors hover:bg-navy-wash/40"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center bg-navy-wash text-navy">
                         <FaList className="text-[13px]" />
                      </div>
                      <p className="max-w-sm truncate text-sm font-semibold text-ink">
                        {task?.topic || task?.title}
                      </p>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <div className={clsx(
                      "inline-flex max-w-full items-center gap-1.5 border px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em]",
                      PRIOTITYSTYELS[task?.levelOfLearning] || "border-line bg-parchment text-ink-muted"
                    )}>
                      <span className="truncate">{task?.levelOfLearning}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 max-w-full">
                       <span className="truncate text-xs text-ink-muted">{task?.name || "Author"}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs text-ink-muted">
                      {task.createdAt ? new Date(task.createdAt).toLocaleDateString() : '---'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-4 text-[11px] text-ink-muted">
                      <span className="flex items-center gap-1.5">
                        <MdAttachFile className="text-xs" />
                        {task?.assets?.length || 0}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <FaList className="text-[10px]" />
                        {task?.topics?.length || 0}
                      </span>
                    </div>
                  </td>
                  {isMyCollaborationsPage && (
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => publishClick(task._id, task.isPublished)}
                        className={clsx(
                          "border px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] transition-colors",
                          task.isPublished
                            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                            : "border-line bg-parchment text-ink-muted"
                        )}
                      >
                        {task.isPublished ? "Live" : "Draft"}
                      </button>
                    </td>
                  )}
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openProjectHandler(task._id)}
                        className="h-9 bg-navy px-4 text-[10px] font-semibold uppercase tracking-[0.14em] text-white transition-colors hover:bg-navy-dark"
                      >
                        View project
                      </button>
                      
                      {showDeleteButton && (
                        <button
                          onClick={() => deleteClicks(task._id)}
                          className="h-9 border border-line px-4 text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-muted transition-colors hover:border-red-200 hover:text-red-600"
                        >
                          Archive
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={isMyCollaborationsPage ? 7 : 6}
                  className="px-8 py-20 text-center"
                >
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-muted">No records available</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
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

export default Table;
