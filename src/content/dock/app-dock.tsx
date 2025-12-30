import { ListTodo, Clock } from "lucide-react";
import Dock, { DockItemData } from "./dock";

export function AppDock() {
  const dockItems: DockItemData[] = [
    {
      icon: <ListTodo className="w-6 h-6 text-white" />,
      label: "Tasklist",
      onClick: () => {}
    },
    {
      icon: <Clock className="w-6 h-6 text-white" />,
      label: "Pomodoro",
      onClick: () => {}
    }
  ];

  return <Dock items={dockItems} />;
}
