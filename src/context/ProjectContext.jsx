import React, { createContext, useContext, useState } from 'react';
import { mockProjects, mockTeamMembers } from '../dataMock/mockData';

const ProjectContext = createContext(undefined);

export function ProjectProvider({ children }) {
  const [projects, setProjects] = useState(mockProjects);
  const [teamMembers] = useState(mockTeamMembers);

  const addProject = (project) => {
    setProjects(prev => [...prev, project]);
  };

  const updateProject = (id, updates) => {
    setProjects(prev =>
      prev.map(p => (p.id === id ? { ...p, ...updates, updatedAt: new Date() } : p))
    );
  };

  const deleteProject = (id) => {
    setProjects(prev => prev.filter(p => p.id !== id));
  };

  const getProjectById = (id) => {
    return projects.find(p => p.id === id);
  };

  return (
    <ProjectContext.Provider
      value={{
        projects,
        teamMembers,
        addProject,
        updateProject,
        deleteProject,
        getProjectById,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
}

export function useProjects() {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProjects must be used within a ProjectProvider');
  }
  return context;
}
