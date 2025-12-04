import { useState, useEffect, useRef } from "react";
import { Settings } from "lucide-react";
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
import { Toaster } from "@/components/ui/toaster";

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsModal({ open, onOpenChange }: SettingsModalProps) {
  const [openSections, setOpenSections] = useState<Set<string>>(
    new Set(["timer"])
  );
  const { settings: timerSettings, saveSettings: saveTimerSettings } =
    useConfig();
  const {
    settings: personalizeSettings,
    saveSettings: savePersonalizeSettings
  } = usePersonalize();
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

        <div className="py-6 space-y-2">
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
        </div>
        <div className="absolute top-2 right-0 mb-4 mr-20">
          <Toaster />
        </div>
      </SheetContent>
    </Sheet>
  );
}
