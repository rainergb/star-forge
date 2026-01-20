import { PomodoroTimer } from "@/content/pomodoro/pomodoro-timer";
import { PomodoroStats } from "@/content/stats";
import { TaskList } from "@/content/tasks/task-list";
import { ProjectList } from "@/content/projects/project-list";
import { SkillList } from "@/content/maestry";
import { DiaryList } from "@/content/diary/diary-list";
import { AppView } from "@/types/app.types";

interface MainContentProps {
  currentView: AppView;
  selectedDate: string;
  taskFilterProjectId: string | null;
  onNavigateToPomodoro: () => void;
  onNavigateToTasksWithProject: (projectId: string) => void;
}

export function MainContent({
  currentView,
  selectedDate,
  taskFilterProjectId,
  onNavigateToPomodoro,
  onNavigateToTasksWithProject
}: MainContentProps) {
  return (
    <div className="relative z-10 container max-w-[2000px] max-h-[2000px] w-full mx-auto p-5">
      {currentView === "pomodoro" && <PomodoroTimer />}
      {currentView === "tasks" && (
        <TaskList
          onNavigateToPomodoro={onNavigateToPomodoro}
          initialFilterProjectId={taskFilterProjectId}
        />
      )}
      {currentView === "projects" && (
        <ProjectList onNavigateToTasks={onNavigateToTasksWithProject} />
      )}
      {currentView === "maestry" && <SkillList />}
      {currentView === "diary" && <DiaryList selectedDate={selectedDate} />}
      {currentView === "stats" && <PomodoroStats />}
    </div>
  );
}
