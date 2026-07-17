import { useState, useEffect, useMemo } from "react";

export const useProjectSearch = (projects, searchQuery) => {
  const [filteredProjects, setFilteredProjects] = useState(projects);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchQuery);

  // Increase debounce delay to reduce processing frequency
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchQuery);
    }, 500); // Increased from 300ms to 500ms

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Pre-process projects for search
  const projectsMap = useMemo(() => {
    return projects.map((project) => ({
      ...project,
      searchableText: [
        project.topic,
        project.levelOfLearning,
        project.name,
        project.description,
        project.introduction,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase(),
    }));
  }, [projects]);

  // Optimized search function
  const searchProjects = useMemo(() => {
    if (!debouncedSearchTerm || debouncedSearchTerm.trim() === "") {
      return projects;
    }

    const searchTerms = debouncedSearchTerm.toLowerCase().trim().split(/\s+/);

    return projectsMap.filter((project) =>
      searchTerms.every((term) => project.searchableText.includes(term))
    );
  }, [projectsMap, debouncedSearchTerm, projects]);

  useEffect(() => {
    setFilteredProjects(searchProjects);
  }, [searchProjects]);

  return filteredProjects;
};
