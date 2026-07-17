import React, { useEffect, useState, useCallback } from "react";
import SkeletonLoading, { SkeletonProjectCard } from "../../../components/SkeletonLoading";
import { toast, ToastContainer } from "react-toastify";
import Cookies from "js-cookie";
import { getUser, getPublishedStudyPlans } from "../../../utils/apiServices";
import TaskCard from "../../../components/task/TaskCard";
import { MdGridView } from "react-icons/md";
import { FaList } from "react-icons/fa";
import Tabs from "../../../components/Tabs";
import Table from "../../../components/task/Table";
import Pagination from "../../../components/Pagination";
import { useProjectSearch } from "../../../hooks/useProjectSearch";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagicWandSparkles, faFolderOpen } from "@fortawesome/free-solid-svg-icons";

const TABS = [
  { title: "Board View", icon: <MdGridView /> },
  { title: "List View", icon: <FaList /> },
];

const AllProjects = ({ searchQuery }) => {
  const [tasks, setTasks] = useState([]); // Use state to manage task list
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6); 

  const fetchUserInstituteCode = async (uid) => {
    try {
      const userData = await getUser(uid);
      if (userData) {
        return userData.instituteCode;
      }
      return null;
    } catch (error) {
      console.error("Error fetching user's institute code:", error);
      toast.error("Failed to fetch user details");
      return null;
    }
  };

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const uid = Cookies.get("uid");
      if (!uid) {
        toast.error("User not authenticated.");
        setLoading(false);
        return;
      }

      // Get the user's institute code first
      const userInstituteCode = await fetchUserInstituteCode(uid);

      if (!userInstituteCode) {
        toast.error("Failed to fetch institute code");
        setLoading(false);
        return;
      }

      // Fetch published study plans from backend API
      const fetchedTasks = await getPublishedStudyPlans(userInstituteCode);
      setTasks(fetchedTasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      toast.error("Failed to load tasks.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleTaskDelete = (taskId) => {
    setTasks((prevTasks) => prevTasks.filter((task) => task._id !== taskId));
  };

  // Use the search hook
  const filteredTasks = useProjectSearch(tasks, searchQuery);

  // Pagination logic
  const totalPages = Math.ceil(filteredTasks.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentTasks = filteredTasks.slice(startIndex, endIndex);

  // Reset to first page when search query changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
      <div className="w-full">
        <ToastContainer autoClose={2000} />

        {/* Premium Hero Banner */}
        <div className="mb-8 mt-6">
          <div className="relative bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-900 rounded-[2.5rem] p-8 sm:p-10 text-white shadow-2xl shadow-blue-100 overflow-hidden group">
            <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:scale-110 transition-transform duration-700">
              <FontAwesomeIcon icon={faFolderOpen} className="text-[12rem]" />
            </div>
            
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full border border-white/10 mb-4 backdrop-blur-md">
                   <FontAwesomeIcon icon={faMagicWandSparkles} className="text-[10px] text-blue-200" />
                   <span className="text-[10px] font-black uppercase tracking-widest text-blue-50">Educational Repository</span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-black mb-3 tracking-tight">Institutional Projects</h1>
                <p className="text-blue-100/80 font-medium text-sm max-w-xl leading-relaxed">
                  Access and manage all published study plans within your institution. Track intellectual property and academic progress across all research verticals.
                </p>
              </div>

              {!loading && searchQuery && (
                <div className="bg-white/10 backdrop-blur-xl px-6 py-4 rounded-3xl border border-white/10 flex flex-col items-center">
                   <span className="text-2xl font-black">{filteredTasks.length}</span>
                   <span className="text-[10px] font-black uppercase tracking-widest text-blue-100 mt-1">Results Found</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* View Controls & Summary */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12 animate-in fade-in slide-in-from-top-4 duration-1000">
          {!loading && (
            <div className="w-full md:w-auto">
              <Tabs tabs={TABS} setSelected={setSelected} />
            </div>
          )}
          
          <div className="flex items-center gap-6 w-full md:w-auto px-6 py-2 bg-slate-50 border border-slate-100 rounded-3xl self-center md:self-auto shadow-inner">
            <div className="flex flex-col items-center border-r border-slate-200 pr-6">
               <span className="text-[14px] font-black text-slate-800">{filteredTasks.length}</span>
               <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Total Records</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
               <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
               <span className="text-[9px] font-black uppercase tracking-widest leading-none">System Stable</span>
            </div>
          </div>
        </div>

        {loading ? (
          selected !== 1 ? (
            <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-12">
              {Array.from({ length: 6 }).map((_, index) => (
                <SkeletonProjectCard key={index} />
              ))}
            </div>
          ) : (
            <div className="w-full">
              <SkeletonLoading type="table" count={5} />
            </div>
          )
        ) : (
          <>
            {selected !== 1 ? (
              <>
                {filteredTasks.length > 0 ? (
                  <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8 mb-16 animate-in fade-in slide-in-from-bottom-8 duration-700">
                    {currentTasks.map((task) => (
                      <TaskCard
                        key={task._id}
                        task={task}
                        onTaskDelete={handleTaskDelete}
                        showDeleteButton={false}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="py-32 text-center bg-white rounded-[3rem] border border-slate-100 shadow-sm mb-16">
                     <p className="text-sm font-black text-slate-300 uppercase tracking-[0.3em]">No records matching your search</p>
                  </div>
                )}
              </>
            ) : (
              <div className="mb-16 animate-in fade-in slide-in-from-bottom-8 duration-700">
                <Table 
                  tasks={currentTasks} 
                  onTaskDelete={handleTaskDelete}
                  showDeleteButton={false}
                />
              </div>
            )}
            
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              totalItems={filteredTasks.length}
              itemsPerPage={itemsPerPage}
              onItemsPerPageChange={setItemsPerPage}
              className="pb-20"
            />
          </>
        )}
      </div>
    </div>
  );
};

export default AllProjects;
