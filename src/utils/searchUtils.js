import { useState, useEffect, useMemo } from "react";
import { rankSearchResults } from "../utils/searchUtils";

export const useProjectSearch = (projects, searchQuery) => {
  const [filteredProjects, setFilteredProjects] = useState(projects);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchQuery);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const searchProjects = useMemo(() => {
    if (!debouncedSearchTerm || debouncedSearchTerm.trim() === "") {
      return projects;
    }

    const searchTerms = debouncedSearchTerm.toLowerCase().split(" ");

    // Filter and rank projects
    const rankedProjects = projects
      .map((project) => ({
        ...project,
        searchScore: rankSearchResults(project, searchTerms),
      }))
      .filter((project) => project.searchScore > 0)
      .sort((a, b) => b.searchScore - a.searchScore);

    return rankedProjects;
  }, [projects, debouncedSearchTerm]);

  useEffect(() => {
    setFilteredProjects(searchProjects);
  }, [searchProjects]);

  return filteredProjects;
};
