import { useState, useEffect, useRef } from "react";
import { Settings, RotateCcw } from "lucide-react";
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
  const timerTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const personalizeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
                <h3 className="text-sm font-medium text-white/90">Reset Widgets</h3>
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
        </div>
        <div className="absolute top-2 right-0 mb-4 mr-20">
          <Toaster />
        </div>
      </SheetContent>
    </Sheet>
  );
}
