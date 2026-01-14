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

const COLOR_OPTIONS: { value: ProjectColor; label: string }[] = [
  { value: "purple", label: "Purple" },
  { value: "blue", label: "Blue" },
  { value: "green", label: "Green" },
  { value: "orange", label: "Orange" },
  { value: "red", label: "Red" },
  { value: "pink", label: "Pink" },
  { value: "cyan", label: "Cyan" },
  { value: "yellow", label: "Yellow" }
];

export function ProjectActionsSection({
  status,
  color,
  onSetStatus,
  onSetColor
}: ProjectActionsSectionProps) {
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [showColorMenu, setShowColorMenu] = useState(false);

  const statusConfig = STATUS_CONFIG[status];
  const StatusIcon = statusConfig.icon;

  const selectedColorConfig = COLOR_OPTIONS.find((c) => c.value === color);

  const handleSelectStatus = (newStatus: ProjectStatus) => {
    onSetStatus(newStatus);
    setShowStatusMenu(false);
  };

  const handleSelectColor = (newColor: ProjectColor) => {
    onSetColor(newColor);
    setShowColorMenu(false);
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

      <div className="relative">
        <button
          onClick={() => setShowColorMenu(!showColorMenu)}
          className="w-full flex items-center gap-3 px-2 py-3 hover:bg-white/5 rounded-lg cursor-pointer text-left"
        >
          <div
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: PROJECT_COLORS[color].solid }}
          />
          <span className="text-white/70 text-sm">
            {selectedColorConfig?.label || "Color"}
          </span>
        </button>

        {showColorMenu && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setShowColorMenu(false)}
            />
            <div className="absolute left-0 top-full mt-1 bg-[#1a1d3a] border border-white/10 rounded-lg shadow-xl z-20 overflow-hidden min-w-[180px]">
              <div className="py-1">
                {COLOR_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleSelectColor(option.value)}
                    className={cn(
                      "w-full flex items-center gap-2 px-4 py-2 text-left text-sm transition-colors cursor-pointer",
                      color === option.value
                        ? "text-primary bg-primary/10"
                        : "text-white/70 hover:bg-white/5"
                    )}
                  >
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{
                        backgroundColor: PROJECT_COLORS[option.value].solid
                      }}
                    />
                    <span>{option.label}</span>
                    {color === option.value && (
                      <Check className="w-4 h-4 ml-auto" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
