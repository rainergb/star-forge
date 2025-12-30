import { ListTodo, Clock } from "lucide-react";
import Dock, { DockItemData } from "./dock";
import { AppView } from "@/types/app.types";

interface AppDockProps {
  currentView: AppView;
  onViewChange: (view: AppView) => void;
}

export function AppDock({ currentView, onViewChange }: AppDockProps) {
  const dockItems: DockItemData[] = [
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
    }
  ];

  return <Dock items={dockItems} />;
}
