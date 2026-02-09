import { useState } from "react";
import {
  Folder,
  FolderKanban,
  Briefcase,
  GraduationCap,
  Code,
  Palette,
  Music,
  Camera,
  Book,
  Rocket,
  Target,
  Trophy,
  Star,
  Heart,
  Zap,
  Flame,
  Gamepad2,
  Dumbbell,
  Plane,
  Home,
  ShoppingCart,
  Lightbulb,
  Wrench,
  Users,
  type LucideIcon
} from "lucide-react";
import {
  ProjectColor,
  ProjectIcon,
  PROJECT_COLORS
} from "@/types/project.types";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";

const ICON_MAP: Record<string, LucideIcon> = {
  Folder,
  FolderKanban,
  Briefcase,
  GraduationCap,
  Code,
  Palette,
  Music,
  Camera,
  Book,
  Rocket,
  Target,
  Trophy,
  Star,
  Heart,
  Zap,
  Flame,
  Gamepad2,
  Dumbbell,
  Plane,
  Home,
  ShoppingCart,
  Lightbulb,
  Wrench,
  Users
};

const LUCIDE_ICONS = Object.keys(ICON_MAP);

const COLOR_LIST: ProjectColor[] = [
  "purple",
  "blue",
  "cyan",
  "green",
  "yellow",
  "orange",
  "red",
  "pink"
];

interface ProjectIconColorSelectorProps {
  icon: ProjectIcon;
  color: ProjectColor;
  onChangeIcon: (icon: ProjectIcon) => void;
  onChangeColor: (color: ProjectColor) => void;
  size?: "sm" | "md" | "lg";
}

export function ProjectIconColorSelector({
  icon,
  color,
  onChangeIcon,
  onChangeColor,
  size = "md"
}: ProjectIconColorSelectorProps) {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"icon" | "color">("icon");

  const colors = PROJECT_COLORS[color];

  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12"
  };

  const iconSizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6"
  };

  const renderIcon = () => {
    if (icon.type === "emoji") {
      return <span className="text-lg">{icon.value}</span>;
    }
    const IconComponent = ICON_MAP[icon.value] || Folder;
    return <IconComponent className={cn(iconSizeClasses[size], colors.text)} />;
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className={cn(
            "rounded-lg shrink-0 flex items-center justify-center transition-all hover:scale-105 cursor-pointer",
            sizeClasses[size],
            colors.bg,
            "ring-2 ring-transparent hover:ring-white/20"
          )}
          title="Change icon & color"
        >
          {renderIcon()}
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-72 p-0 bg-[#1a1d3a] border-white/10"
        align="start"
      >
        <div className="flex border-b border-white/10">
          <button
            onClick={() => setActiveTab("icon")}
            className={cn(
              "flex-1 px-4 py-2.5 text-sm font-medium transition-colors",
              activeTab === "icon"
                ? "text-white border-b-2 border-primary"
                : "text-white/50 hover:text-white/70"
            )}
          >
            Icon
          </button>
          <button
            onClick={() => setActiveTab("color")}
            className={cn(
              "flex-1 px-4 py-2.5 text-sm font-medium transition-colors",
              activeTab === "color"
                ? "text-white border-b-2 border-primary"
                : "text-white/50 hover:text-white/70"
            )}
          >
            Color
          </button>
        </div>

        <div className="p-3">
          {activeTab === "icon" && (
            <div className="grid grid-cols-6 gap-1.5">
              {LUCIDE_ICONS.map((iconName) => {
                const IconComp = ICON_MAP[iconName];
                const isSelected =
                  icon.type === "lucide" && icon.value === iconName;
                return (
                  <button
                    key={iconName}
                    onClick={() => {
                      onChangeIcon({ type: "lucide", value: iconName });
                    }}
                    className={cn(
                      "w-9 h-9 rounded-md flex items-center justify-center transition-all",
                      isSelected
                        ? "bg-primary/30 ring-2 ring-primary"
                        : "hover:bg-white/10"
                    )}
                    title={iconName}
                  >
                    <IconComp className={cn("w-4 h-4", colors.text)} />
                  </button>
                );
              })}
            </div>
          )}

          {activeTab === "color" && (
            <div className="space-y-2">
              <p className="text-xs text-white/50 mb-2">Select a color</p>
              <div className="grid grid-cols-4 gap-2">
                {COLOR_LIST.map((colorOption) => {
                  const colorConfig = PROJECT_COLORS[colorOption];
                  const isSelected = color === colorOption;
                  return (
                    <button
                      key={colorOption}
                      onClick={() => onChangeColor(colorOption)}
                      className={cn(
                        "h-10 rounded-lg flex items-center justify-center transition-all",
                        isSelected
                          ? "ring-2 ring-white ring-offset-2 ring-offset-[#1a1d3a] scale-105"
                          : "hover:scale-105"
                      )}
                      style={{ backgroundColor: colorConfig.solid }}
                      title={colorOption.charAt(0).toUpperCase() + colorOption.slice(1)}
                    />
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export function getProjectIcon(icon: ProjectIcon, className?: string) {
  if (icon.type === "emoji") {
    return <span className={className}>{icon.value}</span>;
  }
  const IconComponent = ICON_MAP[icon.value] || Folder;
  return <IconComponent className={className} />;
}

export { ICON_MAP };
