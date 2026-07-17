import clsx from "clsx";
import React, { useEffect, useState, useCallback } from "react";
import {
  MdDelete,
  MdKeyboardDoubleArrowUp,
  MdOutlineRestore,
  MdRestoreFromTrash,
  MdDeleteSweep,
  MdAutoDelete
} from "react-icons/md";
import { formatDate, PRIOTITYSTYELS } from "../../../utils";
import ConfirmationDialog from "../../../components/Dialogs";
import { toast, ToastContainer } from "react-toastify";
import Cookies from "js-cookie";
import { getProjects, getStudyPlans, deleteProject, deleteStudyPlan, restoreProject, restoreStudyPlan } from "../../../utils/apiServices";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrashArrowUp, faDumpster } from "@fortawesome/free-solid-svg-icons";

const ICONS = {
  "Undergraduate Student": <MdKeyboardDoubleArrowUp />,
  "High School": <MdKeyboardDoubleArrowUp />,
  "Primary School": <MdKeyboardDoubleArrowUp />,
  "Post Graduate": <MdKeyboardDoubleArrowUp />,
};

const Trash = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [msg, setMsg] = useState(null);
  const [type, setType] = useState("delete");
  const [selected, setSelected] = useState("");
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    const uid = Cookies.get("uid");
    if (!uid) {
      toast.error("User not authenticated.");
      setLoading(false);
      return;
    }

    try {
      const [studyPlansData, privateProjectsData] = await Promise.all([
        getStudyPlans({ published: undefined }),
        getProjects('private')
      ]);

      const studyPlansTasks = studyPlansData
        .filter(item => item.isTrashed === true)
        .map((data) => ({
          _id: data._id || data.id,
          collection: "studyPlans",
          ...data,
        }));

      const privateProjectsTasks = privateProjectsData
        .filter(item => item.isTrashed === true)
        .map((data) => ({
          _id: data._id || data.id,
          collection: "privateProjects",
          ...data,
        }));

      setTasks([...studyPlansTasks, ...privateProjectsTasks]);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      toast.error("Resource recovery failed.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const deleteRestoreHandler = async () => {
    setOpenDialog(false);
    setLoading(true);

    const deleteTask = async (task) => {
      if (task.collection === "studyPlans") {
        await deleteStudyPlan(task._id, true);
      } else {
        await deleteProject(task._id, true);
      }
    };

    const restoreTask = async (task) => {
      if (task.collection === "studyPlans") {
        await restoreStudyPlan(task._id);
      } else {
        await restoreProject(task._id);
      }
    };

    try {
      if (type === "delete") {
        const task = tasks.find((t) => t._id === selected);
        if (task) {
          await deleteTask(task);
          toast.success("Identity purged permanently.");
        }
      } else if (type === "deleteAll") {
        await Promise.all(tasks.map(t => deleteTask(t)));
        toast.success("Institutional archive purged.");
      } else if (type === "restore") {
        const task = tasks.find((t) => t._id === selected);
        if (task) {
          await restoreTask(task);
          toast.success("Resource successfully recovered.");
        }
      } else if (type === "restoreAll") {
        await Promise.all(tasks.map(t => restoreTask(t)));
        toast.success("All resources successfully recovered.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Cleanup protocol error.");
    } finally {
      fetchTasks();
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
      <ToastContainer autoClose={2000} />
      
      {/* Premium Trash Hero Banner */}
      <div className="mb-6 mt-4">
        <div className="relative bg-gradient-to-br from-slate-600 via-slate-700 to-slate-900 rounded-2xl p-3 sm:p-4 text-white shadow-2xl overflow-hidden group border border-white/5">
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform duration-700">
            <FontAwesomeIcon icon={faDumpster} className="text-[6rem]" />
          </div>
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="inline-flex items-center gap-2 px-2 py-0.5 bg-white/10 rounded-full border border-white/10 mb-2 backdrop-blur-md">
                 <FontAwesomeIcon icon={faTrashArrowUp} className="text-[8px] text-slate-300" />
                 <span className="text-[8px] font-black uppercase tracking-widest text-slate-50">Disposal Chamber</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black mb-1 tracking-tight">Archival Recovery</h1>
              <p className="text-slate-400 font-medium text-[10px] max-w-xl leading-snug truncate opacity-80">
                 Restore archived plans or permanently purge them.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button 
                onClick={() => {
                  setType("restoreAll");
                  setMsg("Execute full restoration protocol?");
                  setOpenDialog(true);
                }}
                disabled={tasks.length === 0}
                className="bg-white/10 hover:bg-white text-white hover:text-slate-900 px-4 py-2 rounded-xl font-black uppercase tracking-widest text-[9px] border border-white/10 transition-all flex items-center gap-2 disabled:opacity-30"
              >
                <MdRestoreFromTrash /> Restore All
              </button>
              <button 
                onClick={() => {
                  setType("deleteAll");
                  setMsg("Execute permanent purge sequence?");
                  setOpenDialog(true);
                }}
                disabled={tasks.length === 0}
                className="bg-rose-500 hover:bg-rose-600 text-white px-4 py-2 rounded-xl font-black uppercase tracking-widest text-[9px] transition-all flex items-center gap-2 disabled:opacity-30"
              >
                <MdDeleteSweep /> Purge Cache
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-sm animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="w-full overflow-x-auto no-scrollbar">
          <table className="w-full text-left border-collapse table-fixed min-w-[800px]">
             <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                   <th className="w-[35%] px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Archived ID</th>
                   <th className="w-[20%] px-6 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Complexity Index</th>
                   <th className="w-[20%] px-6 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Archival Chronology</th>
                   <th className="w-[25%] px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-right">Emergency Actions</th>
                </tr>
             </thead>
             <tbody className="divide-y divide-slate-50">
                {loading ? (
                   Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i} className="animate-pulse">
                         <td colSpan="4" className="px-8 py-10"><div className="h-10 bg-slate-100 rounded-2xl w-full" /></td>
                      </tr>
                   ))
                ) : tasks.length > 0 ? (
                   tasks.map((task, index) => (
                      <tr key={index} className="group hover:bg-slate-50/50 transition-all duration-300">
                         <td className="px-8 py-6">
                            <div className="flex items-center gap-3">
                               <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 border border-slate-100/50 flex-shrink-0">
                                  <MdAutoDelete className="text-[14px]" />
                               </div>
                               <p className="text-sm font-black text-slate-900 truncate max-w-[200px]">{task?.topic}</p>
                            </div>
                         </td>
                         <td className="px-6 py-6">
                            <div className={clsx(
                               "inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border text-[10px] font-black uppercase tracking-widest",
                               PRIOTITYSTYELS[task?.levelOfLearning] || "bg-slate-50 border-slate-100 text-slate-500"
                            )}>
                               <span>{ICONS[task?.levelOfLearning]}</span>
                               <span className="truncate">{task?.levelOfLearning}</span>
                            </div>
                         </td>
                         <td className="px-6 py-6">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{formatDate(new Date(task?.updatedAt))}</span>
                         </td>
                         <td className="px-8 py-6 text-right">
                            <div className="flex items-center justify-end gap-2">
                               <button 
                                 onClick={() => {
                                    setSelected(task._id);
                                    setType("restore");
                                    setMsg("Initiate resource recovery protocol?");
                                    setOpenDialog(true);
                                 }}
                                 className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all shadow-sm flex items-center justify-center group/btn"
                               >
                                  <MdOutlineRestore className="text-lg group-active/btn:rotate-180 transition-transform duration-500" />
                               </button>
                               <button 
                                 onClick={() => {
                                    setSelected(task._id);
                                    setType("delete");
                                    setMsg("Confirm permanent deletion of archived data?");
                                    setOpenDialog(true);
                                 }}
                                 className="w-10 h-10 rounded-xl bg-rose-50 text-rose-500 hover:bg-rose-600 hover:text-white transition-all shadow-sm flex items-center justify-center"
                               >
                                  <MdDelete className="text-lg" />
                               </button>
                            </div>
                         </td>
                      </tr>
                   ))
                ) : (
                   <tr>
                      <td colSpan="4" className="px-8 py-32 text-center text-slate-300 font-black uppercase tracking-[0.3em] text-xs">
                         Archive repository is currently empty
                      </td>
                   </tr>
                )}
             </tbody>
          </table>
        </div>
      </div>

      <ConfirmationDialog
        open={openDialog}
        setOpen={setOpenDialog}
        msg={msg}
        onClick={deleteRestoreHandler}
      />
    </div>
  );
};

export default Trash;
