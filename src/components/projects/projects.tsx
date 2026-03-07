"use client";

import { useProjects } from "@/hooks/useProjects";
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "../ui/button";
import { PenSquare, Trash } from "lucide-react";
import { AddEditProjectModal } from "../modals/add-edit-project.modal";
import { useConfirmDialog } from "@/hooks/confirm-dialog-provider";
import { toast } from "sonner";
import { CardHeader, CardTitle, CardDescription, CardAction } from "../ui/card";
import {
  calculateTotalDuration,
  formatDuration,
  parseDuration,
} from "@/lib/utils/time.utils";

const Projects = () => {
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const { projects, deleteProject, isLoading, error } = useProjects();

  if (isLoading) {
    return (
      <div className="h-96 flex items-center justify-center text-muted-foreground">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-96 flex items-center justify-center text-muted-foreground">
        Error loading projects
      </div>
    );
  }

  if (projects?.length === 0) {
    return (
      <div className="h-96 flex items-center justify-center text-muted-foreground">
        No projects found
      </div>
    );
  }

  const handleCreateProject = () => {
    setSelectedProject(null);
    setShowProjectModal(true);
  };

  const handleEditProject = (project: any) => {
    setSelectedProject(project);
    setShowProjectModal(true);
  };

  const confirm = useConfirmDialog();
  const handleDeleteProject = async (project: any) => {
    try {
      const ok = await confirm({
        title: "Delete project",
        description: "Are you sure you want to delete this project?",
        confirmText: "Yes",
        cancelText: "No",
      });

      if (!ok) return;
      await deleteProject(project.id);
      toast.success("Project deleted successfully");
    } catch (error) {
      toast.error("Failed to delete project");
      console.error("Failed to delete project:", error);
    }
  };

  return (
    <>
      <AddEditProjectModal
        open={showProjectModal}
        onOpenChange={setShowProjectModal}
        onSuccess={() => {
          setShowProjectModal(false);
        }}
        defaultValues={selectedProject}
      />
      <CardHeader className="px-2">
        <CardTitle>Projects</CardTitle>
        <CardDescription>Manage your projects</CardDescription>
        <CardAction>
          <Button onClick={handleCreateProject}>Create Project</Button>
        </CardAction>
      </CardHeader>
      <div className="min-h-96">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Project</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Time Entries</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projects?.map((project: any) => (
              <TableRow key={project.id}>
                <TableCell>{project.name}</TableCell>
                <TableCell>{project.type}</TableCell>
                <TableCell>
                  <span className="font-bold text-primary">
                    {formatDuration(
                      calculateTotalDuration(project?.timeEntries),
                    )}
                  </span>{" "}
                  <span className="text-xs text-muted-foreground">
                    (Total Entries: {project.timeEntries?.length})
                  </span>
                </TableCell>
                <TableCell>{project?.description}</TableCell>
                <TableCell className="text-right">
                  <div className="flex gap-2 justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditProject(project)}
                    >
                      <PenSquare className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteProject(project)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
};

export default Projects;
