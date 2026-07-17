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
    <div className="w-full min-w-0 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-700">
      <div className="w-full overflow-x-auto no-scrollbar">
        <table className="w-full text-left border-collapse table-fixed min-w-[800px]">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100">
              <th className="w-[35%] px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Roadmap Subject</th>
              <th className="w-[20%] px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Target Persona</th>
              <th className="w-[15%] px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Established On</th>
              <th className="w-[15%] px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-center">Modules</th>
              <th className="w-[15%] px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {tasks.length > 0 ? (
              tasks.map((task, index) => (
                <tr
                  key={index}
                  className="group hover:bg-purple-50/30 transition-all duration-300"
                >
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 border border-purple-100/50 flex-shrink-0 group-hover:scale-110 transition-transform shadow-inner">
                         <FaList className="text-[14px]" />
                      </div>
                      <p className="text-sm font-black text-slate-900 group-hover:text-purple-700 transition-colors line-clamp-1 truncate max-w-sm">
                        {task?.topic}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className={clsx(
                      "inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border text-[10px] font-black uppercase tracking-widest opacity-80 truncate max-w-full",
                      PRIOTITYSTYELS[task?.levelOfLearning] || "bg-slate-50 border-slate-100 text-slate-500"
                    )}>
                      <span className="truncate">{task?.levelOfLearning}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-xs font-bold text-slate-400 truncate block">{formatDate(new Date(task?.createdAt))}</span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center justify-center gap-4 text-slate-400 font-bold text-[11px]">
                      <div className="flex items-center gap-1.5 hover:text-purple-500 transition-colors">
                        <MdAttachFile className="text-xs" />
                        <span>{task?.assets?.length || 0}</span>
                      </div>
                      <div className="flex items-center gap-1.5 hover:text-indigo-500 transition-colors">
                        <FaList className="text-[10px]" />
                        <span>{task?.topics?.length || 0}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openProjectHandler(task._id)}
                        className="px-5 py-2 bg-purple-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-purple-700 transition-all shadow-lg shadow-purple-100 active:scale-95"
                      >
                        Launch
                      </button>
                      <button
                        onClick={() => deleteClicks(task._id)}
                        className="px-5 py-2 bg-slate-50 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-slate-100 hover:border-red-100"
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
                  <p className="text-xs font-black text-slate-300 uppercase tracking-[0.3em]">No personal roadmaps identified.</p>
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
