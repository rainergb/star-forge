import { ListTodo, Clock, FolderKanban, BookOpen } from "lucide-react";
import Dock, { DockItemData } from "./dock";
import { AppView } from "@/types/app.types";
import maestryIcon from "@/assets/maestry/maestry-emoji.png";

interface AppDockProps {
  currentView: AppView;
  onViewChange: (view: AppView) => void;
}

export function AppDock({ currentView, onViewChange }: AppDockProps) {
  const dockItems: DockItemData[] = [
    {
      icon: <FolderKanban className="w-6 h-6 text-white" />,
      label: "Projects",
      onClick: () => onViewChange("projects"),
      className:
        currentView === "projects" ? "bg-primary/20 border-primary/50" : ""
    },
    {
      icon: <ListTodo className="w-6 h-6 text-white" />,
      label: "Tasklist",
      onClick: () => onViewChange("tasks"),
      className:
        currentView === "tasks" ? "bg-primary/20 border-primary/50" : ""
    },
    {
      icon: <Clock className="w-6 h-6 text-white" />,
      label: "Pomodoro",
      onClick: () => onViewChange("pomodoro"),
      className:
        currentView === "pomodoro" ? "bg-primary/20 border-primary/50" : ""
    },
    {
      icon: <BookOpen className="w-6 h-6 text-white" />,
      label: "Diary",
      onClick: () => onViewChange("diary"),
      className:
        currentView === "diary" ? "bg-primary/20 border-primary/50" : ""
    },
    {
      icon: (
        <img
          src={maestryIcon}
          alt="Maestry"
          className="w-6 h-6 object-contain"
        />
      ),
      label: "Maestry",
      onClick: () => onViewChange("maestry"),
      className:
        currentView === "maestry" ? "bg-primary/20 border-primary/50" : ""
    }
  ];

  return <Dock items={dockItems} />;
}
