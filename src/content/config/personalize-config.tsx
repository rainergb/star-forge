import { Palette, Volume2, VolumeX } from "lucide-react";
import {
  AccordionItem,
  AccordionTrigger,
  AccordionContent
} from "@/components/ui/accordion";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import ElasticSlider from "@/components/elastic-slider";

export interface PersonalizeSettings {
  showBg: boolean;
  showTest: boolean;
  notificationSound: boolean;
  notificationVolume: number;
}

interface PersonalizeConfigProps {
  isOpen: boolean;
  onToggle: () => void;
  settings: PersonalizeSettings;
  onSettingsChange: (settings: PersonalizeSettings) => void;
}

export function PersonalizeConfig({
  isOpen,
  onToggle,
  settings,
  onSettingsChange
}: PersonalizeConfigProps) {
  const updateSetting = <K extends keyof PersonalizeSettings>(
    key: K,
    value: PersonalizeSettings[K]
  ) => {
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

        <div className="flex items-center justify-between">
          <Label className="text-white/90">Notification Sound</Label>
          <Switch
            checked={settings.notificationSound}
            onCheckedChange={(checked) =>
              updateSetting("notificationSound", checked)
            }
          />
        </div>

        {settings.notificationSound && (
          <div className="flex items-center justify-between">
            <Label className="text-white/90">Volume</Label>
            <ElasticSlider
              defaultValue={settings.notificationVolume}
              startingValue={0}
              maxValue={100}
              isStepped={true}
              stepSize={1}
              leftIcon={<VolumeX className="w-4 h-4 text-white/50" />}
              rightIcon={<Volume2 className="w-4 h-4 text-white/50" />}
              onChange={(value) => updateSetting("notificationVolume", value)}
              className="w-40"
            />
          </div>
        )}
      </AccordionContent>
    </AccordionItem>
  );
}
