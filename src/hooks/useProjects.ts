import useSWR from "swr";
import { useState } from "react";
import { api } from "@/lib/api/projects";

export function useProjects() {
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const {
    data: projects,
    error,
    mutate,
  } = useSWR("/api/projects", api.getProjects);

  const createProject = async (data: any) => {
    setIsCreating(true);
    try {
      const newProject = await api.createProject(data);
      mutate([...(projects?.data || []), newProject]);
      return newProject;
    } finally {
      setIsCreating(false);
    }
  };

  const updateProject = async (id: string, data: any) => {
    setIsUpdating(true);
    try {
      const updatedProject = await api.updateProject(id, data);
      mutate(projects?.data?.map((p: any) => (p.id === id ? updatedProject : p)));
      return updatedProject;
    } finally {
      setIsUpdating(false);
    }
  };

  const deleteProject = async (id: string) => {
    setIsDeleting(true);
    try {
      await api.deleteProject(id);
      mutate(projects?.data?.filter((p: any) => p.id !== id));
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    projects: projects?.data,
    isLoading: !error && !projects,
    error,
    isCreating,
    isUpdating,
    isDeleting,
    createProject,
    updateProject,
    deleteProject,
  };
}
