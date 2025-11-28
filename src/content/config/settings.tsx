import { useState, useEffect } from "react";
import { Settings } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle
} from "@/components/ui/sheet";
import { Accordion } from "@/components/ui/accordion";
import { TimerConfig } from "./timer-config";
import { useConfig } from "@/hooks/use-config";
import { Toaster } from "@/components/ui/toaster";

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsModal({ open, onOpenChange }: SettingsModalProps) {
  const [openSection, setOpenSection] = useState<string | null>("timer");
  const { settings, saveSettings } = useConfig();

  const [localSettings, setLocalSettings] = useState(settings);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  useEffect(() => {
    const saveTimer = setTimeout(() => {
      if (JSON.stringify(localSettings) !== JSON.stringify(settings)) {
        saveSettings(localSettings);
      }
    }, 500);

    return () => clearTimeout(saveTimer);
  }, [localSettings, saveSettings, settings]);

  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? null : section);
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

        <div className="py-6">
          <Accordion className="w-full">
            <TimerConfig
              isOpen={openSection === "timer"}
              onToggle={() => toggleSection("timer")}
              settings={localSettings}
              onSettingsChange={setLocalSettings}
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
