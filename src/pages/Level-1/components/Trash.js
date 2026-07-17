import clsx from "clsx";
import React, { useEffect, useState, useCallback } from "react";
import {
  MdDelete,
  MdKeyboardDoubleArrowUp,
  MdOutlineRestore,
  MdRestoreFromTrash,
  MdDeleteSweep,
  MdAutoDelete,
  MdShare,
  MdMoreVert,
} from "react-icons/md";
import { formatDate, PRIOTITYSTYELS } from "../../../utils";
import ConfirmationDialog from "../../../components/Dialogs";
import { toast, ToastContainer } from "react-toastify";
import Cookies from "js-cookie";
import { getProjects, getStudyPlans, deleteProject, deleteStudyPlan, restoreProject, restoreStudyPlan } from "../../../utils/apiServices";
import Loading from "../../../components/Loading";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrashArrowUp, faDumpster, faShareNodes } from "@fortawesome/free-solid-svg-icons";

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
          toast.success("Resource purged permanently.");
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
      toast.error("Protocol error during maintenance.");
    } finally {
      fetchTasks();
      setLoading(false);
    }
  };

  const handleShare = (task) => {
    const shareUrl = `${window.location.origin}/l1dashboard/project/${task._id}`;
    if (navigator.share) {
      navigator.share({
        title: task.topic,
        text: `Archived Project: ${task.topic}`,
        url: shareUrl,
      }).then(() => toast.success('Share signal emitted!'))
        .catch(() => {
          navigator.clipboard.writeText(shareUrl);
          toast.success('Link copied to clipboard');
        });
    } else {
      navigator.clipboard.writeText(shareUrl);
      toast.success('Link copied to clipboard');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
      <ToastContainer autoClose={2000} />
      
      {/* Premium Trash Hero Banner */}
      <div className="mb-8 mt-6">
        <div className="relative bg-gradient-to-br from-slate-700 via-slate-800 to-slate-950 rounded-[2.5rem] p-8 sm:p-10 text-white shadow-2xl overflow-hidden group">
          <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:scale-110 transition-transform duration-700">
            <FontAwesomeIcon icon={faDumpster} className="text-[12rem]" />
          </div>
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="flex-1 min-w-0">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full border border-white/10 mb-4 backdrop-blur-md">
                 <FontAwesomeIcon icon={faTrashArrowUp} className="text-[10px] text-blue-300" />
                 <span className="text-[10px] font-black uppercase tracking-widest text-blue-50">Faculty Archival Terminal</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black mb-3 tracking-tight">Institutional DISPOSAL</h1>
              <p className="text-slate-400 font-medium text-sm max-w-xl leading-relaxed">
                 Administrative control over archived curricula and project data. Restore resources for reactivation or finalize permanent archival.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
              <button 
                onClick={() => {
                  setType("restoreAll");
                  setMsg("Execute full institutional restoration protocol?");
                  setOpenDialog(true);
                }}
                disabled={tasks.length === 0}
                className="w-full sm:w-auto bg-white/10 hover:bg-white text-white hover:text-slate-900 px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] border border-white/10 shadow-xl transition-all flex items-center justify-center gap-3 disabled:opacity-30 disabled:cursor-not-allowed whitespace-nowrap"
              >
                <MdRestoreFromTrash className="text-lg" /> Restore Global
              </button>
              <button 
                onClick={() => {
                  setType("deleteAll");
                  setMsg("Finalize permanent purge sequence for all archived data?");
                  setOpenDialog(true);
                }}
                disabled={tasks.length === 0}
                className="w-full sm:w-auto bg-rose-600 hover:bg-rose-500 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-30 disabled:cursor-not-allowed whitespace-nowrap"
              >
                <MdDeleteSweep className="text-lg" /> Purge Analytics
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-sm animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="w-full overflow-x-auto no-scrollbar">
          <table className="w-full text-left border-collapse table-fixed min-w-[900px]">
             <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                   <th className="w-[40%] px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Archived Curriculum</th>
                   <th className="w-[20%] px-6 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Pedagogical Level</th>
                   <th className="w-[15%] px-6 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Archived On</th>
                   <th className="w-[25%] px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-right">Emergency Protocol</th>
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
                               <div className="min-w-0">
                                  <p className="text-sm font-black text-slate-900 truncate">{task?.topic}</p>
                                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{task?.collection === 'studyPlans' ? 'Study Plan' : 'Private Project'}</p>
                               </div>
                            </div>
                         </td>
                         <td className="px-6 py-6">
                            <div className={clsx(
                               "inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border text-[10px] font-black uppercase tracking-widest",
                               PRIOTITYSTYELS[task?.levelOfLearning] || "bg-slate-50 border-slate-100 text-slate-500"
                            )}>
                               <span className="truncate">{task?.levelOfLearning || 'Standard'}</span>
                            </div>
                         </td>
                         <td className="px-6 py-6">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{formatDate(new Date(task?.updatedAt || task?.createdAt))}</span>
                         </td>
                         <td className="px-8 py-6 text-right">
                            <div className="flex items-center justify-end gap-2">
                               <button 
                                 onClick={() => handleShare(task)}
                                 className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 hover:bg-slate-900 hover:text-white transition-all shadow-sm flex items-center justify-center"
                                 title="Share Link"
                               >
                                  <FontAwesomeIcon icon={faShareNodes} className="text-xs" />
                               </button>
                               <button 
                                 onClick={() => {
                                    setSelected(task._id);
                                    setType("restore");
                                    setMsg("Initiate pedagogical restoration protocol?");
                                    setOpenDialog(true);
                                 }}
                                 className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all shadow-sm flex items-center justify-center group/btn"
                               >
                                  <MdOutlineRestore className="text-lg group-active/btn:rotate-180 transition-transform duration-500" />
                               </button>
                               <button 
                                 onClick={() => {
                                    setSelected(task._id);
                                    setType("delete");
                                    setMsg("Confirm permanent termination of curriculum data?");
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
                         Administrative archive is currently cleared
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
