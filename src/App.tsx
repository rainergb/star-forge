import { useState, useEffect } from 'react'
import { PomodoroTimer } from "@/content/pomodoro/PomodoroTimer";
import bgVideo from "@/assets/bg.mp4";

function App() {
  const [electronVersion, setElectronVersion] =
    useState<string>("Carregando...");
  console.log(electronVersion);

  useEffect(() => {
    if (window.electronAPI) {
      setElectronVersion(window.electronAPI.getAppVersion());
    }
  }, []);

  return (
    <div className="relative min-h-screen w-full overflow-hidden flex items-center justify-center">
      <video
        autoPlay
        loop
        muted
        className="absolute top-0 left-0 w-full h-full object-cover z-0 opacity-50"
      >
        <source src={bgVideo} type="video/mp4" />
      </video>

      <div className="relative z-10 container max-w-[2000px] max-h-[2000px] w-full mx-auto p-5">
        <PomodoroTimer />
      </div>
    </div>
  );
}

export default App
