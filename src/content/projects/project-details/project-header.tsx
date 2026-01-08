import { useState } from "react";
import {
  Star,
  Folder,
  ChevronDown,
  Play,
  Pause,
  CheckCircle,
  Archive
} from "lucide-react";
import {
  Project,
  ProjectStatus,
  ProjectColor,
  PROJECT_COLORS
} from "@/types/project.types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface ProjectHeaderProps {
  project: Project;
  onToggleFavorite: () => void;
  onUpdateName: (name: string) => void;
  onUpdateDescription: (description: string | null) => void;
  onUpdateColor: (color: ProjectColor) => void;
  onSetStatus: (status: ProjectStatus) => void;
}

const STATUS_CONFIG: Record<
  ProjectStatus,
  { label: string; icon: React.ElementType; className: string }
> = {
  active: {
    label: "Ativo",
    icon: Play,
    className: "text-green-400"
  },
  paused: {
    label: "Pausado",
    icon: Pause,
    className: "text-yellow-400"
  },
  completed: {
    label: "Concluído",
    icon: CheckCircle,
    className: "text-blue-400"
  },
  archived: {
    label: "Arquivado",
    icon: Archive,
    className: "text-gray-400"
  }
};

const COLOR_OPTIONS: { value: ProjectColor; label: string }[] = [
  { value: "purple", label: "Roxo" },
  { value: "blue", label: "Azul" },
  { value: "green", label: "Verde" },
  { value: "orange", label: "Laranja" },
  { value: "red", label: "Vermelho" },
  { value: "pink", label: "Rosa" },
  { value: "cyan", label: "Ciano" },
  { value: "yellow", label: "Amarelo" }
];

export function ProjectHeader({
  project,
  onToggleFavorite,
  onUpdateName,
  onUpdateDescription,
  onUpdateColor,
  onSetStatus
}: ProjectHeaderProps) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(project.name);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [editedDescription, setEditedDescription] = useState(
    project.description || ""
  );

  const colors = PROJECT_COLORS[project.color];
  const statusConfig = STATUS_CONFIG[project.status];
  const StatusIcon = statusConfig.icon;

  const handleSaveName = () => {
    if (editedName.trim() && editedName !== project.name) {
      onUpdateName(editedName.trim());
    }
    setIsEditingName(false);
  };

  const handleSaveDescription = () => {
    const newDesc = editedDescription.trim() || null;
    if (newDesc !== project.description) {
      onUpdateDescription(newDesc);
    }
    setIsEditingDescription(false);
  };

  return (
    <div className="p-4 border-b border-white/10">
      <div className="flex items-start gap-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className={cn(
                "p-3 rounded-lg cursor-pointer transition-colors hover:opacity-80",
                colors.bg
              )}
            >
              <Folder className={cn("w-6 h-6", colors.text)} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {COLOR_OPTIONS.map((option) => (
              <DropdownMenuItem
                key={option.value}
                onClick={() => onUpdateColor(option.value)}
                className={cn(
                  project.color === option.value && "bg-primary/20"
                )}
              >
                <div
                  className={cn(
                    "w-3 h-3 rounded-full mr-2",
                    PROJECT_COLORS[option.value].bg
                  )}
                />
                {option.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="flex-1 min-w-0">
          {isEditingName ? (
            <input
              type="text"
              value={editedName}
              onChange={(e) => setEditedName(e.target.value)}
              onBlur={handleSaveName}
              onKeyDown={(e) => e.key === "Enter" && handleSaveName()}
              className="w-full bg-transparent text-xl font-semibold text-white border-b border-primary/50 focus:outline-none"
              autoFocus
            />
          ) : (
            <h2
              onClick={() => setIsEditingName(true)}
              className="text-xl font-semibold text-white cursor-pointer hover:text-white/80"
            >
              {project.name}
            </h2>
          )}

          {isEditingDescription ? (
            <textarea
              value={editedDescription}
              onChange={(e) => setEditedDescription(e.target.value)}
              onBlur={handleSaveDescription}
              placeholder="Adicionar descrição..."
              className="w-full mt-1 bg-transparent text-sm text-white/60 border border-white/10 rounded p-2 focus:outline-none focus:border-primary/50 resize-none"
              rows={2}
              autoFocus
            />
          ) : (
            <p
              onClick={() => setIsEditingDescription(true)}
              className="text-sm text-white/50 mt-1 cursor-pointer hover:text-white/70"
            >
              {project.description || "Clique para adicionar descrição..."}
            </p>
          )}
        </div>

        <button
          onClick={onToggleFavorite}
          className="cursor-pointer text-white/30 hover:text-[#D6B8FF] transition-colors"
        >
          <Star
            className={cn(
              "w-5 h-5",
              project.favorite && "fill-[#D6B8FF] text-[#D6B8FF]"
            )}
          />
        </button>
      </div>

      <div className="mt-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm cursor-pointer transition-colors",
                "bg-white/5 hover:bg-white/10 border border-white/10"
              )}
            >
              <StatusIcon className={cn("w-4 h-4", statusConfig.className)} />
              <span className="text-white/80">{statusConfig.label}</span>
              <ChevronDown className="w-3 h-3 text-white/40" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {(Object.keys(STATUS_CONFIG) as ProjectStatus[]).map((status) => {
              const config = STATUS_CONFIG[status];
              const Icon = config.icon;
              return (
                <DropdownMenuItem
                  key={status}
                  onClick={() => onSetStatus(status)}
                  className={cn(project.status === status && "bg-primary/20")}
                >
                  <Icon className={cn("w-4 h-4 mr-2", config.className)} />
                  {config.label}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
