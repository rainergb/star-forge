import { FolderOpen } from "lucide-react";
import { useProjects } from "@/hooks/use-projects";
import { PROJECT_COLORS } from "@/types/project.types";
import { DropdownSelector } from "@/components/shared/dropdown-selector";

interface ProjectSelectorProps {
  selectedProjectId: string | null;
  onSelect: (projectId: string | null) => void;
  className?: string;
}

export function ProjectSelector({
  selectedProjectId,
  onSelect,
  className
}: ProjectSelectorProps) {
  const { projects, addProject } = useProjects();
  const activeProjects = projects.filter((p) => p.status === "active");

  // Transformar projetos para o formato esperado pelo DropdownSelector
  const items = activeProjects.map((p) => ({
    id: p.id,
    name: p.name,
    color: PROJECT_COLORS[p.color].solid
  }));

  return (
    <DropdownSelector
      items={items}
      selected={selectedProjectId}
      onSelect={onSelect}
      icon={<FolderOpen className="w-4 h-4 text-white/50" />}
      placeholder="Add to project"
      noneLabel="No project"
      emptyText="No active projects"
      createLabel="Create new project"
      onCreate={(name) => addProject(name)}
      renderItemIcon={(item) => (
        <div
          className="w-4 h-4 rounded-full"
          style={{ backgroundColor: item.color }}
        />
      )}
      className={className}
    />
  );
}
