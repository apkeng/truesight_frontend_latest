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
    <div className="w-full min-w-0 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-700">
      <div className="w-full max-w-full overflow-x-auto no-scrollbar pb-4">
        <table className="w-full text-left border-collapse table-fixed min-w-[800px]">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100">
              <th className={clsx("px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400", isMyCollaborationsPage ? "w-[20%]" : "w-[25%]")}>Curriculum Details</th>
              <th className={clsx("px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400", isMyCollaborationsPage ? "w-[10%]" : "w-[12%]")}>Target Persona</th>
              <th className="w-[10%] px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Lead Author</th>
              <th className="w-[10%] px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Created</th>
              <th className="w-[8%] px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-center">Resources</th>
              {isMyCollaborationsPage && (
                <th className="w-[9%] px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-center">Access</th>
              )}
              <th className={clsx("px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-right", isMyCollaborationsPage ? "w-[23%]" : "w-[23%]")}>Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {tasks.length > 0 ? (
              tasks.map((task, index) => (
                <tr
                  key={index}
                  className="group hover:bg-blue-50/30 transition-all duration-300"
                >
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100/50 flex-shrink-0 group-hover:scale-110 transition-transform shadow-inner">
                         <FaList className="text-[14px]" />
                      </div>
                      <p className="text-sm font-black text-slate-900 group-hover:text-blue-700 transition-colors line-clamp-1 truncate max-w-sm">
                        {task?.topic || task?.title}
                      </p>
                    </div>
                  </td>

                  <td className="px-6 py-5">
                    <div className={clsx(
                      "inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border text-[10px] font-black uppercase tracking-widest opacity-80 max-w-full",
                      PRIOTITYSTYELS[task?.levelOfLearning] || "bg-slate-50 border-slate-100 text-slate-500"
                    )}>
                      <span className="truncate">{task?.levelOfLearning}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2 max-w-full">
                       <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400 flex-shrink-0">
                          {task?.name?.charAt(0) || "U"}
                       </div>
                       <span className="text-xs font-bold text-slate-600 truncate">{task?.name || "Author"}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex flex-col">
                       <span className="text-[11px] font-black text-slate-700">
                          {task.createdAt ? new Date(task.createdAt).toLocaleDateString() : '---'}
                       </span>
                       <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Entry</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center justify-center gap-4 text-slate-400 font-bold text-[11px]">
                      <div className="flex items-center gap-1.5 hover:text-purple-500 transition-colors">
                        <MdAttachFile className="text-xs" />
                        <span>{task?.assets?.length || 0}</span>
                      </div>
                      <div className="flex items-center gap-1.5 hover:text-emerald-500 transition-colors">
                        <FaList className="text-[10px]" />
                        <span>{task?.topics?.length || 0}</span>
                      </div>
                    </div>
                  </td>
                  {isMyCollaborationsPage && (
                    <td className="px-6 py-5 text-center">
                      <button
                        onClick={() => publishClick(task._id, task.isPublished)}
                        className={clsx(
                          "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ring-1",
                          task.isPublished 
                            ? "bg-emerald-50 text-emerald-600 ring-emerald-100" 
                            : "bg-slate-50 text-slate-400 ring-slate-100"
                        )}
                      >
                        {task.isPublished ? "Live" : "Draft"}
                      </button>
                    </td>
                  )}
                  <td className="px-8 py-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openProjectHandler(task._id)}
                        className="px-5 py-2 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 active:scale-95"
                      >
                        View Project
                      </button>
                      
                      {showDeleteButton && (
                        <button
                          onClick={() => deleteClicks(task._id)}
                          className="px-5 py-2 bg-slate-50 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-slate-100 hover:border-red-100"
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
                  <p className="text-xs font-black text-slate-300 uppercase tracking-[0.3em]">No data records available.</p>
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
