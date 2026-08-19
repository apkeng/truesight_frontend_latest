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
import { EmptyState, PageBanner, PageShell, SectionLabel } from "../../../components/ui";

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
    <PageShell>
      <ToastContainer autoClose={2000} />

      <PageBanner
        title="Institutional Projects"
        subtitle="Access and manage all published study plans within your institution."
        stat={
          !loading && searchQuery
            ? { value: filteredTasks.length, label: "Matches" }
            : undefined
        }
      />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {!loading && <Tabs tabs={TABS} setSelected={setSelected} />}
        <SectionLabel>{filteredTasks.length} projects</SectionLabel>
      </div>

      {loading ? (
        selected !== 1 ? (
          <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <SkeletonProjectCard key={index} />
            ))}
          </div>
        ) : (
          <SkeletonLoading type="table" count={5} />
        )
      ) : (
        <>
          {selected !== 1 ? (
            filteredTasks.length > 0 ? (
              <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
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
              <EmptyState
                title="No projects found"
                description="Nothing matches your search right now. Try a different term or clear the search box."
              />
            )
          ) : (
            <Table
              tasks={currentTasks}
              onTaskDelete={handleTaskDelete}
              showDeleteButton={false}
            />
          )}

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            totalItems={filteredTasks.length}
            itemsPerPage={itemsPerPage}
            onItemsPerPageChange={setItemsPerPage}
          />
        </>
      )}
    </PageShell>
  );
};

export default AllProjects;
