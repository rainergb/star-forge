import { useState } from "react";
import { Download, LogOut } from "lucide-react";
import { useTasks } from "@/hooks/use-tasks";
import { useProjects } from "@/hooks/use-projects";
import { useSkills } from "@/hooks/use-skills";
import { useDiary } from "@/hooks/use-diary";
import { usePomodoroSessions } from "@/hooks/use-pomodoro-sessions";
import { exportAll } from "@/services/export-service";
import { DetailSection } from "@/components/shared/detail-item";
import { DataImportButton } from "@/content/auth/data-import-button";

interface ProfileActionsSectionProps {
  onLogout: () => void;
}

export function ProfileActionsSection({ onLogout }: ProfileActionsSectionProps) {
  const [confirmLogout, setConfirmLogout] = useState(false);

  const { tasks } = useTasks();
  const { projects } = useProjects();
  const { skills } = useSkills();
  const { entries } = useDiary();
  const { sessions } = usePomodoroSessions();

  const handleExportAll = () => {
    exportAll({
      tasks,
      projects,
      skills,
      diary: entries,
      pomodoro: sessions
    });
  };

  return (
    <>
      {/* Data */}
      <DetailSection>
        <DataImportButton onImportSuccess={() => {}} />
      </DetailSection>

      <DetailSection>
        <button
          onClick={handleExportAll}
          className="w-full flex items-center gap-3 px-3 py-2.5 bg-white/5 hover:bg-white/10 rounded-lg text-sm text-white/70 hover:text-white transition-colors cursor-pointer"
        >
          <Download className="w-4 h-4 text-white/40" />
          <span>Export all data</span>
          <span className="ml-auto text-xs text-white/30">Full backup</span>
        </button>
      </DetailSection>

      {/* Danger zone */}
      <DetailSection className="border-b-0">
        {!confirmLogout ? (
          <button
            onClick={() => setConfirmLogout(true)}
            className="w-full flex items-center gap-3 px-3 py-2.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/40 rounded-lg text-sm text-red-400 hover:text-red-300 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign out</span>
          </button>
        ) : (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 space-y-3">
            <p className="text-sm text-red-300">
              Are you sure you want to sign out?
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setConfirmLogout(false)}
                className="flex-1 px-3 py-1.5 text-sm text-white/60 hover:text-white/90 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={onLogout}
                className="flex-1 px-3 py-1.5 text-sm bg-red-500/80 hover:bg-red-500 text-white rounded-lg transition-colors cursor-pointer"
              >
                Sign out
              </button>
            </div>
          </div>
        )}
      </DetailSection>
    </>
  );
}
