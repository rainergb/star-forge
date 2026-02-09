import { useState, useEffect, useRef } from "react";
import { Settings, RotateCcw, Download, Upload } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle
} from "@/components/ui/sheet";
import { Accordion } from "@/components/ui/accordion";
import { TimerConfig } from "./timer-config";
import { PersonalizeConfig } from "./personalize-config";
import { useConfig } from "@/hooks/use-config";
import { usePersonalize } from "@/hooks/use-personalize";
import { useFloatingWidgets } from "@/hooks/use-floating-widgets";
import { useTasks } from "@/hooks/use-tasks";
import { useProjects } from "@/hooks/use-projects";
import { useSkills } from "@/hooks/use-skills";
import { useDiary } from "@/hooks/use-diary";
import { usePomodoroSessions } from "@/hooks/use-pomodoro-sessions";
import { useToast } from "@/hooks/use-toast";
import {
  exportAll,
  importFromFile,
  validateTasksImport,
  validateProjectsImport,
  validateSkillsImport,
  validateDiaryImport,
  validatePomodoroImport
} from "@/services/export-service";
import { Toaster } from "@/components/ui/toaster";
import { Button } from "@/components/ui/button";

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsModal({ open, onOpenChange }: SettingsModalProps) {
  const [openSections, setOpenSections] = useState<Set<string>>(
    new Set(["timer", "personalize"])
  );
  const { settings: timerSettings, saveSettings: saveTimerSettings } =
    useConfig();
  const {
    settings: personalizeSettings,
    saveSettings: savePersonalizeSettings
  } = usePersonalize();
  const { resetPositions } = useFloatingWidgets();
  const { tasks, importTasks } = useTasks();
  const { projects, importProjects } = useProjects();
  const { skills, importSkills } = useSkills();
  const { entries: diaryEntries, importEntries } = useDiary();
  const { sessions: pomodoroSessions, importSessions } = usePomodoroSessions();
  const { toast } = useToast();
  const timerTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const personalizeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExportAll = () => {
    exportAll({
      tasks,
      projects,
      skills,
      diary: diaryEntries,
      pomodoro: pomodoroSessions
    });
  };

  const handleImportAll = async (file: File) => {
    const result = await importFromFile(file);
    if (!result.success) {
      toast({
        title: "Import failed",
        description: result.message,
        variant: "destructive"
      });
      return;
    }

    const data = result.data;
    let importedCount = 0;

    if (data?.tasks && validateTasksImport(data.tasks)) {
      importTasks(data.tasks);
      importedCount += data.tasks.length;
    }
    if (data?.projects && validateProjectsImport(data.projects)) {
      importProjects(data.projects);
      importedCount += data.projects.length;
    }
    if (data?.skills && validateSkillsImport(data.skills)) {
      importSkills(data.skills);
      importedCount += data.skills.length;
    }
    if (data?.diary && validateDiaryImport(data.diary)) {
      importEntries(data.diary);
      importedCount += data.diary.length;
    }
    if (data?.pomodoro && validatePomodoroImport(data.pomodoro)) {
      importSessions(data.pomodoro);
      importedCount += data.pomodoro.length;
    }

    if (importedCount > 0) {
      toast({
        title: "Import successful",
        description: `${importedCount} items imported`
      });
    } else {
      toast({
        title: "Import failed",
        description: "No valid data found in file",
        variant: "destructive"
      });
    }
  };

  const handleTimerSettingsChange = (newSettings: typeof timerSettings) => {
    if (timerTimeoutRef.current) {
      clearTimeout(timerTimeoutRef.current);
    }

    timerTimeoutRef.current = setTimeout(() => {
      saveTimerSettings(newSettings);
    }, 500);
  };

  const handlePersonalizeSettingsChange = (
    newSettings: typeof personalizeSettings
  ) => {
    if (personalizeTimeoutRef.current) {
      clearTimeout(personalizeTimeoutRef.current);
    }

    personalizeTimeoutRef.current = setTimeout(() => {
      savePersonalizeSettings(newSettings);
    }, 500);
  };

  useEffect(() => {
    return () => {
      if (timerTimeoutRef.current) {
        clearTimeout(timerTimeoutRef.current);
      }
      if (personalizeTimeoutRef.current) {
        clearTimeout(personalizeTimeoutRef.current);
      }
    };
  }, []);

  const toggleSection = (section: string) => {
    setOpenSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(section)) {
        newSet.delete(section);
      } else {
        newSet.add(section);
      }
      return newSet;
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md bg-background border-l border-white/10 text-white">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2 text-xl">
            <Settings className="w-5 h-5 text-primary" />
            Settings
          </SheetTitle>
        </SheetHeader>

        <div className="py-6 space-y-4 overflow-y-auto max-h-[calc(100vh-120px)] scrollbar-none">
          <Accordion className="w-full">
            <TimerConfig
              isOpen={openSections.has("timer")}
              onToggle={() => toggleSection("timer")}
              settings={timerSettings}
              onSettingsChange={handleTimerSettingsChange}
            />
            <PersonalizeConfig
              isOpen={openSections.has("personalize")}
              onToggle={() => toggleSection("personalize")}
              settings={personalizeSettings}
              onSettingsChange={handlePersonalizeSettingsChange}
            />
          </Accordion>

          {/* Widget Reset Section */}
          <div className="px-4 py-3 border border-white/10 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-white/90">
                  Reset Widgets
                </h3>
                <p className="text-xs text-white/50 mt-0.5">
                  Restore all floating widgets to their default positions
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={resetPositions}
                className="text-white/70 border-white/20 hover:bg-white/10"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>
            </div>
          </div>

          {/* Export All Data Section */}
          <div className="px-4 py-3 border border-white/10 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-white/90">
                  Export All Data
                </h3>
                <p className="text-xs text-white/50 mt-0.5">
                  Download all your data as a JSON file
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportAll}
                className="text-white/70 border-white/20 hover:bg-white/10"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          {/* Import All Data Section */}
          <div className="px-4 py-3 border border-white/10 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-white/90">
                  Import Data
                </h3>
                <p className="text-xs text-white/50 mt-0.5">
                  Restore data from a previously exported file
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="text-white/70 border-white/20 hover:bg-white/10"
              >
                <Upload className="w-4 h-4 mr-2" />
                Import
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt,.json"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    handleImportAll(file);
                    e.target.value = "";
                  }
                }}
              />
            </div>
          </div>

          {/* Version Footer */}
          <div className="pt-4 mt-4 border-t border-white/10">
            <p className="text-center text-xs text-white/40">
              Star Forge • Alpha 1.0
            </p>
          </div>
        </div>
        <div className="absolute top-2 right-0 mb-4 mr-20">
          <Toaster />
        </div>
      </SheetContent>
    </Sheet>
  );
}
