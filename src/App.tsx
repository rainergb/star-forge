import { useEffect, useState } from 'react'
import { TopBar } from "@/components/top-bar";
import { AppDock } from "@/content/dock/app-dock";
import { MainContent } from "@/components/main-content";
import { FloatingWidgetsLayer } from "@/components/floating/floating-widgets-layer";
import { LoginScreen } from "@/content/auth";
import { RecoveryPasswordModal } from "@/content/auth/recovery-password-modal";
import { useToast } from "@/hooks/use-toast";
import { usePersonalize } from "@/hooks/use-personalize";
import { useFloatingWidgets } from "@/hooks/use-floating-widgets";
import { useActiveTask } from "@/hooks/use-active-task";
import { useAppNavigation } from "@/hooks/use-app-navigation";
import { useAuth } from "@/hooks/use-auth";
import {
  PomodoroProvider,
  usePomodoroContext
} from "@/context/pomodoro-context";
import {
  ActiveModuleProvider,
  useActiveModule
} from "@/context/active-module-context";
import { Task } from "@/types/task.types";
import bgVideo from "@/assets/bg.mp4";
import { ProfilePanel } from "@/content/profile/profile-panel";
import { MigrationModal } from "@/components/shared/migration-modal";
import { useMigration } from "@/hooks/use-migration";
import { useAutoStart } from "@/hooks/use-auto-start";
import { SkillToastContainer } from "@/components/skill-toast";
import { WhatsNewModal } from "@/components/whats-new-modal";
import { useWhatsNew } from "@/hooks/use-whats-new";

function AppContent() {
  const { toast } = useToast();
  const { settings } = usePersonalize();
  useAutoStart();
  const { show: showWhatsNew, entry: whatsNewEntry, dismiss: dismissWhatsNew } = useWhatsNew();
  const [profileOpen, setProfileOpen] = useState(false);
  const { showModal, status, summary, errorMsg, migrate, skip, dismiss } = useMigration();
  const { setActiveTask, clearActiveTask, activeTask } = useActiveTask();
  const { selectedDate } = useActiveModule();
  const { toggleVisibility } = useFloatingWidgets();
  const {
    timeLeft,
    isActive,
    hasStarted,
    isWorkMode,
    toggleTimer,
    formatTime
  } = usePomodoroContext();
  const {
    currentView,
    taskFilterProjectId,
    changeView,
    navigateToPomodoro,
    navigateToTasksWithProject
  } = useAppNavigation();

  useEffect(() => {
    toast({
      title: "System Ready",
      description: "Star Habit is ready.",
      duration: 3000
    });
  }, []);

  useEffect(() => {
    if (hasStarted && isWorkMode) {
      const taskName = activeTask?.title;
      document.title = taskName
        ? `${formatTime(timeLeft)} - ${taskName}`
        : `${formatTime(timeLeft)} - Star Habit`;
    } else {
      document.title = "Star Habit";
    }
  }, [timeLeft, hasStarted, isWorkMode, activeTask, formatTime]);

  const handleSelectTask = (task: Task) => {
    setActiveTask(task);
    if (isActive) {
      toggleTimer();
    }
  };

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

      <TopBar
        currentView={currentView}
        onToggleMiniTaskList={() => toggleVisibility("miniTaskList")}
        onToggleMiniPomodoro={() => toggleVisibility("miniPomodoro")}
        onToggleMusicPlayer={() => toggleVisibility("musicPlayer")}
        onToggleMiniProjectList={() => toggleVisibility("miniProjectList")}
        onToggleMiniMaestryList={() => toggleVisibility("miniMaestryList")}
        onToggleMiniCalendar={() => toggleVisibility("miniCalendar")}
        onViewStats={() => changeView("stats")}
        onOpenProfile={() => setProfileOpen(true)}
      />

      <FloatingWidgetsLayer
        currentView={currentView}
        onSelectTask={handleSelectTask}
        onClearTask={clearActiveTask}
      />

      <MainContent
        currentView={currentView}
        selectedDate={selectedDate}
        taskFilterProjectId={taskFilterProjectId}
        onNavigateToPomodoro={navigateToPomodoro}
        onNavigateToTasksWithProject={navigateToTasksWithProject}
      />

      <AppDock currentView={currentView} onViewChange={changeView} />

      <ProfilePanel open={profileOpen} onOpenChange={setProfileOpen} />

      <MigrationModal
        open={showModal}
        status={status}
        summary={summary}
        errorMsg={errorMsg}
        onMigrate={migrate}
        onSkip={skip}
        onDismiss={dismiss}
      />

      {/* Toasts gamificados de skill ao completar pomodoros */}
      <SkillToastContainer />

      {/* Modal de novidades — aparece somente após atualização */}
      <WhatsNewModal
        open={showWhatsNew}
        entry={whatsNewEntry}
        onClose={dismissWhatsNew}
      />
    </div>
  );
}

function App() {
  const { isAuthenticated, isRecoveryMode, changePassword } = useAuth();

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  return (
    <>
      <PomodoroProvider>
        <ActiveModuleProvider>
          <AppContent />
        </ActiveModuleProvider>
      </PomodoroProvider>

      {/* Modal de nova senha — aparece após clicar no link de reset */}
      {isRecoveryMode && (
        <RecoveryPasswordModal onChangePassword={changePassword} />
      )}
    </>
  );
}

export default App
