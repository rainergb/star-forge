import { useState, useEffect } from 'react'
import { PomodoroTimer } from "@/content/pomodoro/pomodoro-timer";
import { TaskList } from "@/content/tasks/task-list";
import { TopBar } from "@/components/top-bar";
import { AppDock } from "@/content/dock/app-dock";
import { useToast } from "@/hooks/use-toast";
import { usePersonalize } from "@/hooks/use-personalize";
import { AppView } from "@/types/app.types";
import bgVideo from "@/assets/bg.mp4";

function App() {
  const { toast } = useToast();
  const { settings } = usePersonalize();
  const [currentView, setCurrentView] = useState<AppView>("pomodoro");
  const [electronVersion, setElectronVersion] =
    useState<string>("Carregando...");

  useEffect(() => {
    if (window.electronAPI) {
      console.log(electronVersion);
      setElectronVersion(window.electronAPI.getAppVersion());
    }

    toast({
      title: "System Ready",
      description: "Star Forge is ready.",
      duration: 3000
    });
  }, []);

  return (
    <div className="relative min-h-screen w-full overflow-hidden flex items-center justify-center">
      {settings.showBg && (
        <video
          autoPlay
          loop
          muted
          className="absolute top-0 left-0 w-full h-full object-cover z-0 opacity-50"
        >
          <source src={bgVideo} type="video/mp4" />
        </video>
      )}

      <TopBar />

      <div className="relative z-10 container max-w-[2000px] max-h-[2000px] w-full mx-auto p-5">
        {currentView === "pomodoro" && <PomodoroTimer />}
        {currentView === "tasks" && <TaskList />}
      </div>

      <AppDock currentView={currentView} onViewChange={setCurrentView} />
    </div>
  );
}

export default App
