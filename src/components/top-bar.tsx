import { useState, useEffect } from "react";
import {
  Settings,
  ListTodo,
  Timer,
  BarChart3,
  Music,
  FolderKanban,
  Calendar,
  MoreHorizontal,
  MoreVertical
} from "lucide-react";
import logo from "@/assets/logo.png";
import maestryIcon from "@/assets/maestry/maestry-emoji.png";
import { SettingsModal } from "@/content/config/settings";
import { AppView } from "@/types/app.types";

interface TopBarProps {
  currentView: AppView;
  onToggleMiniTaskList: () => void;
  onToggleMiniPomodoro: () => void;
  onToggleMusicPlayer: () => void;
  onToggleMiniProjectList: () => void;
  onToggleMiniMaestryList: () => void;
  onToggleMiniCalendar: () => void;
  onViewStats: () => void;
}

const TOPBAR_EXPANDED_KEY = "star-habit-topbar-expanded";

export function TopBar({
  currentView,
  onToggleMiniTaskList,
  onToggleMiniPomodoro,
  onToggleMusicPlayer,
  onToggleMiniProjectList,
  onToggleMiniMaestryList,
  onToggleMiniCalendar,
  onViewStats
}: TopBarProps) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(() => {
    const saved = localStorage.getItem(TOPBAR_EXPANDED_KEY);
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    localStorage.setItem(TOPBAR_EXPANDED_KEY, JSON.stringify(isExpanded));
  }, [isExpanded]);

  const toggleExpanded = () => setIsExpanded(!isExpanded);

  return (
    <div className="fixed top-0 left-0 w-full z-50 px-8 py-6  flex items-center justify-between bg-linear-to-b from-background/80 to-transparent backdrop-blur-[2px] ">
      {/* Logo */}

      <div className="flex items-center gap-3 group cursor-pointer">
        <div className="rounded-md overflow-hidden border p-2 hover:bg-primary/10">
          <img
            src={logo}
            alt="Star Habit Logo"
            className="w-6 h-6 object-contain"
          />
        </div>
        <span className="text-xl font-bold text-white tracking-wider font-sans">
          STAR HABIT
        </span>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2">
        {/* Expandable buttons container */}
        <div className="flex items-center gap-2 overflow-hidden">
          <div
            className={`flex items-center gap-2 transition-all duration-300 ease-in-out ${
              isExpanded
                ? "opacity-100 translate-x-0"
                : "opacity-0 translate-x-4 pointer-events-none w-0"
            }`}
          >
            {currentView === "pomodoro" && (
              <>
                <button
                  onClick={onToggleMiniTaskList}
                  className="cursor-pointer rounded-lg p-2.5 bg-background/50 border border-white/10 text-white/70 transition-colors hover:bg-primary/10 hover:text-white"
                  title="Tasks"
                >
                  <ListTodo className="w-4 h-4" />
                </button>
                <button
                  onClick={onToggleMiniProjectList}
                  className="cursor-pointer rounded-lg p-2.5 bg-background/50 border border-white/10 text-white/70 transition-colors hover:bg-primary/10 hover:text-white"
                  title="Projects"
                >
                  <FolderKanban className="w-4 h-4" />
                </button>
                <button
                  onClick={onToggleMiniMaestryList}
                  className="cursor-pointer rounded-lg p-2.5 bg-background/50 border border-white/10 text-white/70 transition-colors hover:bg-primary/10 hover:text-white"
                  title="Maestry"
                >
                  <img
                    src={maestryIcon}
                    alt="Maestry"
                    className="w-4 h-4 object-contain"
                  />
                </button>
              </>
            )}

            {currentView === "tasks" && (
              <button
                onClick={onToggleMiniPomodoro}
                className="cursor-pointer rounded-lg p-2.5 bg-background/50 border border-white/10 text-white/70 transition-colors hover:bg-primary/10 hover:text-white"
                title="Pomodoro"
              >
                <Timer className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={onToggleMusicPlayer}
              className="cursor-pointer rounded-lg p-2.5 bg-background/50 border border-white/10 text-white/70 transition-colors hover:bg-primary/10 hover:text-white"
              title="Music Player"
            >
              <Music className="w-4 h-4" />
            </button>

            <button
              onClick={onToggleMiniCalendar}
              className="cursor-pointer rounded-lg p-2.5 bg-background/50 border border-white/10 text-white/70 transition-colors hover:bg-primary/10 hover:text-white"
              title="Calendar"
            >
              <Calendar className="w-4 h-4" />
            </button>

            <button
              onClick={onViewStats}
              className={`cursor-pointer rounded-lg p-2.5 border border-white/10 transition-colors ${
                currentView === "stats"
                  ? "bg-primary/20 text-white border-primary/50"
                  : "bg-background/50 text-white/70 hover:bg-primary/10 hover:text-white"
              }`}
              title="Statistics"
            >
              <BarChart3 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* More button */}
        <button
          onClick={toggleExpanded}
          className="cursor-pointer rounded-lg p-2.5 bg-background/50 border border-white/10 text-white/70 transition-colors hover:bg-primary/10 hover:text-white"
          title={isExpanded ? "Collapse" : "Expand"}
        >
          {isExpanded ? (
            <MoreVertical className="w-4 h-4" />
          ) : (
            <MoreHorizontal className="w-4 h-4" />
          )}
        </button>

        <button
          onClick={() => setIsSettingsOpen(true)}
          className="cursor-pointer rounded-lg p-2.5 bg-background/50 border border-white/10 text-white/70 transition-colors hover:bg-primary/10 hover:text-white"
          title="Settings"
        >
          <Settings className="w-4 h-4" />
        </button>

        {/* User Avatar */}
        <button className="w-10 h-10 rounded-lg overflow-hidden border border-white/10 hover:border-primary/50 transition-all hover:shadow-[0_0_15px_rgba(106,48,255,0.3)]">
          <img
            src="https://github.com/shadcn.png"
            alt="User"
            className="w-full h-full object-cover"
          />
        </button>
      </div>

      <SettingsModal open={isSettingsOpen} onOpenChange={setIsSettingsOpen} />
    </div>
  );
}
