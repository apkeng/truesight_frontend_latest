import clsx from "clsx";
import React, { useState } from "react";
import { MdAttachFile } from "react-icons/md";
import { formatDate, PRIOTITYSTYELS } from "../../utils";
import { FaList } from "react-icons/fa";
import ConfirmationDialog from "../Dialogs";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { updateProject } from "../../utils/apiServices";

const Table = ({ tasks, onTaskDelete }) => {
  const [openDialog, setOpenDialog] = useState(false);
  const [selected, setSelected] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();

  const openProjectHandler = (id) => {
    const newPath = `${location.pathname}/${id}`;
    navigate(newPath);
  };

  const deleteHandler = async () => {
    try {
      await updateProject(selected, { isTrashed: true });
      toast.success("Project moved to trash");
      onTaskDelete(selected);
      setOpenDialog(false);
    } catch (error) {
      toast.error("Error moving project to trash");
    }
  };

  const deleteClicks = (id) => {
    setSelected(id);
    setOpenDialog(true);
  };

  return (
    <div className="w-full min-w-0 border border-line bg-white">
      <div className="w-full overflow-x-auto no-scrollbar">
        <table className="w-full text-left border-collapse table-fixed min-w-[800px]">
          <thead>
            <tr className="border-b border-line-soft bg-parchment">
              <th className="w-[35%] px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-muted">Roadmap Subject</th>
              <th className="w-[20%] px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-muted">Target Persona</th>
              <th className="w-[15%] px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-muted">Established On</th>
              <th className="w-[15%] px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-muted text-center">Modules</th>
              <th className="w-[15%] px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-muted text-right">Actions</th>
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
                        {task?.topic}
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
                    <span className="block truncate text-xs text-ink-muted">{formatDate(new Date(task?.createdAt))}</span>
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
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openProjectHandler(task._id)}
                        className="h-9 bg-navy px-4 text-[10px] font-semibold uppercase tracking-[0.14em] text-white transition-colors hover:bg-navy-dark"
                      >
                        Launch
                      </button>
                      <button
                        onClick={() => deleteClicks(task._id)}
                        className="h-9 border border-line px-4 text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-muted transition-colors hover:border-red-200 hover:text-red-600"
                      >
                        Discard
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="px-8 py-20 text-center">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-muted">No private projects yet</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <ConfirmationDialog
        open={openDialog}
        setOpen={setOpenDialog}
        onClick={deleteHandler}
        msg="Are you sure you want to discard this private project?"
      />
    </div>
  );
};

export default Table;
