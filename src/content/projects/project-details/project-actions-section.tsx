import { useState } from "react";
import {
  Play,
  Pause,
  CheckCircle,
  Archive,
  Check
} from "lucide-react";
import {
  ProjectStatus,
  ProjectColor,
  PROJECT_COLORS
} from "@/types/project.types";
import { cn } from "@/lib/utils";
import { ColorPickerMenu, DEFAULT_COLOR_OPTIONS } from "@/components/shared/color-picker-menu";

interface ProjectActionsSectionProps {
  status: ProjectStatus;
  color: ProjectColor;
  onSetStatus: (status: ProjectStatus) => void;
  onSetColor: (color: ProjectColor) => void;
}

const STATUS_CONFIG: Record<
  ProjectStatus,
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
  },
  archived: {
    label: "Archived",
    icon: Archive,
    className: "text-gray-400"
  }
};

export function ProjectActionsSection({
  status,
  color,
  onSetStatus,
  onSetColor
}: ProjectActionsSectionProps) {
  const [showStatusMenu, setShowStatusMenu] = useState(false);

  const statusConfig = STATUS_CONFIG[status];
  const StatusIcon = statusConfig.icon;

  const handleSelectStatus = (newStatus: ProjectStatus) => {
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
                {(Object.keys(STATUS_CONFIG) as ProjectStatus[]).map(
                  (statusKey) => {
                    const config = STATUS_CONFIG[statusKey];
                    const Icon = config.icon;
                    return (
                      <button
                        key={statusKey}
                        onClick={() => handleSelectStatus(statusKey)}
                        className={cn(
                          "w-full flex items-center gap-2 px-4 py-2 text-left text-sm transition-colors cursor-pointer",
                          status === statusKey
                            ? "text-primary bg-primary/10"
                            : "text-white/70 hover:bg-white/5"
                        )}
                      >
                        <Icon className={cn("w-4 h-4", config.className)} />
                        <span>{config.label}</span>
                        {status === statusKey && (
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

      <ColorPickerMenu
        value={color}
        onChange={onSetColor}
        colors={PROJECT_COLORS}
        options={DEFAULT_COLOR_OPTIONS as unknown as { value: ProjectColor; label: string }[]}
      />
    </div>
  );
}
