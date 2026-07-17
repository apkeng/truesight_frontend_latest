import React from "react";
import AllProjects from "./AllProjects";
import MyCollaborations from "./MyCollaborations";
import PrivateProjects from "./PrivateProjects";
import { Route, Routes } from "react-router-dom";
import TaskDetails from "../../../components/task/TaskDetails";
import ProjectDetails from "../../../components/privateProject/ProjectDetails";

function Project({ searchQuery }) {
  return (
    <div>
      <Routes>
        <Route path="/" element={<AllProjects searchQuery={searchQuery} />} />
        <Route
          path="/all-projects"
          element={<AllProjects searchQuery={searchQuery} />}
        />
        <Route
          path="/my-collaborations"
          element={<MyCollaborations searchQuery={searchQuery} />}
        />
        <Route
          path="/private-projects"
          element={<PrivateProjects searchQuery={searchQuery} />}
        />
        <Route path="/all-projects/:id" element={<TaskDetails />} />
        <Route path="/my-collaborations/:id" element={<TaskDetails />} />
        <Route path="/private-projects/:id" element={<ProjectDetails />} />
      </Routes>
    </div>
  );
}

export default Project;
