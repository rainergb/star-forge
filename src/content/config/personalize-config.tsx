import { Palette } from "lucide-react";
import { AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export interface PersonalizeSettings {
  showBg: boolean;
  showTest: boolean;
}

interface PersonalizeConfigProps {
  isOpen: boolean;
  onToggle: () => void;
  settings: PersonalizeSettings;
  onSettingsChange: (settings: PersonalizeSettings) => void;
}

export function PersonalizeConfig({ isOpen, onToggle, settings, onSettingsChange }: PersonalizeConfigProps) {
  const updateSetting = (key: keyof PersonalizeSettings, value: boolean) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  return (
    <AccordionItem className="border-b-0">
      <AccordionTrigger
        isOpen={isOpen}
        onClick={onToggle}
        className="hover:no-underline py-2 cursor-pointer"
      >
        <div className="flex items-center gap-2 text-white/90">
          <Palette className="w-4 h-4 text-white/50" />
          <span className="uppercase tracking-wider text-xs font-bold text-white/50">
            Personalize
          </span>
        </div>
      </AccordionTrigger>

      <AccordionContent isOpen={isOpen} className="space-y-6 pt-4">
        <div className="flex items-center justify-between">
          <Label className="text-white/90">Show Background Video</Label>
          <Switch
            checked={settings.showBg}
            onCheckedChange={(checked) => updateSetting("showBg", checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label className="text-white/90">Show Test Mode Button</Label>
          <Switch
            checked={settings.showTest}
            onCheckedChange={(checked) => updateSetting("showTest", checked)}
          />
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
