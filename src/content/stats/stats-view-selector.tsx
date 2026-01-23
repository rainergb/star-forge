import {
  BarChart3,
  CheckSquare,
  FolderKanban,
  Sparkles,
  LayoutGrid
} from "lucide-react";
import { cn } from "@/lib/utils";

export type StatsView = "general" | "pomodoro" | "tasks" | "projects" | "maestry";

interface StatsViewSelectorProps {
  currentView: StatsView;
  onViewChange: (view: StatsView) => void;
}

const VIEW_CONFIG: Record<
  StatsView,
  { label: string; icon: React.ElementType }
> = {
  general: { label: "All", icon: LayoutGrid },
  pomodoro: { label: "Pomodoro", icon: BarChart3 },
  tasks: { label: "Tasks", icon: CheckSquare },
  projects: { label: "Projects", icon: FolderKanban },
  maestry: { label: "Maestry", icon: Sparkles }
};

const VIEW_ORDER: StatsView[] = [
  "general",
  "pomodoro",
  "tasks",
  "projects",
  "maestry"
];

export function StatsViewSelector({
  currentView,
  onViewChange
}: StatsViewSelectorProps) {
  return (
    <div className="flex justify-center gap-1 p-1 bg-white/5 rounded-lg">
      {VIEW_ORDER.map((view) => {
        const config = VIEW_CONFIG[view];
        const Icon = config.icon;
        const isActive = currentView === view;

        return (
          <button
            key={view}
            onClick={() => onViewChange(view)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer",
              isActive
                ? "bg-primary text-white"
                : "text-white/50 hover:text-white/70 hover:bg-white/5"
            )}
          >
            <Icon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{config.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export function getViewIndex(view: StatsView): number {
  return VIEW_ORDER.indexOf(view);
}

export { VIEW_ORDER };
