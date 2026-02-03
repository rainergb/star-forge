import { useState } from "react";
import {
  Play,
  Pause,
  CheckCircle,
  Check
} from "lucide-react";
import { ProjectStatus } from "@/types/project.types";
import { cn } from "@/lib/utils";

interface ProjectActionsSectionProps {
  status: ProjectStatus;
  onSetStatus: (status: ProjectStatus) => void;
}

const STATUS_CONFIG: Record<
  Exclude<ProjectStatus, "archived">,
  { label: string; icon: React.ElementType; className: string }
> = {
  active: {
    label: "Active",
    icon: Play,
    className: "text-green-400"
  },
  paused: {
    label: "Paused",
    icon: Pause,
    className: "text-yellow-400"
  },
  completed: {
    label: "Completed",
    icon: CheckCircle,
    className: "text-blue-400"
  }
};

export function ProjectActionsSection({
  status,
  onSetStatus
}: ProjectActionsSectionProps) {
  const [showStatusMenu, setShowStatusMenu] = useState(false);

  const currentStatus = status;
  const statusConfig = STATUS_CONFIG[currentStatus];
  const StatusIcon = statusConfig.icon;

  const handleSelectStatus = (newStatus: Exclude<ProjectStatus, "archived">) => {
    onSetStatus(newStatus);
    setShowStatusMenu(false);
  };

  return (
    <div className="mt-4 border-t border-white/10 pt-4 space-y-1">
      <div className="relative">
        <button
          onClick={() => setShowStatusMenu(!showStatusMenu)}
          className="w-full flex items-center gap-3 px-2 py-3 hover:bg-white/5 rounded-lg cursor-pointer text-left"
        >
          <StatusIcon className={cn("w-4 h-4", statusConfig.className)} />
          <span className="text-white/70 text-sm">{statusConfig.label}</span>
        </button>

        {showStatusMenu && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setShowStatusMenu(false)}
            />
            <div className="absolute left-0 top-full mt-1 bg-[#1a1d3a] border border-white/10 rounded-lg shadow-xl z-20 overflow-hidden min-w-[180px]">
              <div className="py-1">
                {(Object.keys(STATUS_CONFIG) as Exclude<ProjectStatus, "archived">[]).map(
                  (statusKey) => {
                    const config = STATUS_CONFIG[statusKey];
                    const Icon = config.icon;
                    return (
                      <button
                        key={statusKey}
                        onClick={() => handleSelectStatus(statusKey)}
                        className={cn(
                          "w-full flex items-center gap-2 px-4 py-2 text-left text-sm transition-colors cursor-pointer",
                          currentStatus === statusKey
                            ? "text-primary bg-primary/10"
                            : "text-white/70 hover:bg-white/5"
                        )}
                      >
                        <Icon className={cn("w-4 h-4", config.className)} />
                        <span>{config.label}</span>
                        {currentStatus === statusKey && (
                          <Check className="w-4 h-4 ml-auto" />
                        )}
                      </button>
                    );
                  }
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
