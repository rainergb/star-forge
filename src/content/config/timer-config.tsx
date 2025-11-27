import { Clock } from "lucide-react";
import { AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Label } from "@/components/ui/label";
import { NumberInput } from "@/components/ui/number-input";
import { Switch } from "@/components/ui/switch";

export interface TimerSettings {
  pomodoro: number;
  shortBreak: number;
  longBreak: number;
  autoStartBreaks: boolean;
  autoStartPomodoros: boolean;
  longBreakInterval: number;
}

interface TimerConfigProps {
  isOpen: boolean;
  onToggle: () => void;
  settings: TimerSettings;
  onSettingsChange: (settings: TimerSettings) => void;
}

export function TimerConfig({ isOpen, onToggle, settings, onSettingsChange }: TimerConfigProps) {
  const updateSetting = (key: keyof TimerSettings, value: any) => {
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
          <Clock className="w-4 h-4 text-white/50" />
          <span className="uppercase tracking-wider text-xs font-bold text-white/50">Timer</span>
        </div>
      </AccordionTrigger>
      
      <AccordionContent isOpen={isOpen} className="space-y-6 pt-4">
        {/* Time (minutes) */}
        <div className="space-y-3">
          <Label className="text-white/90 font-semibold">Time (minutes)</Label>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1">
              <Label className="text-xs text-white/50">Pomodoro</Label>
              <NumberInput 
                value={settings.pomodoro} 
                onChange={(value) => updateSetting('pomodoro', value)}
                className="bg-white/5 border-white/10 focus:border-primary/50"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-white/50">Short Break</Label>
              <NumberInput 
                value={settings.shortBreak} 
                onChange={(value) => updateSetting('shortBreak', value)}
                className="bg-white/5 border-white/10 focus:border-primary/50"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-white/50">Long Break</Label>
              <NumberInput 
                value={settings.longBreak} 
                onChange={(value) => updateSetting('longBreak', value)}
                className="bg-white/5 border-white/10 focus:border-primary/50"
              />
            </div>
          </div>
        </div>

        {/* Auto Start Breaks */}
        <div className="flex items-center justify-between">
          <Label className="text-white/90">Auto Start Breaks</Label>
          <Switch 
            checked={settings.autoStartBreaks}
            onCheckedChange={(checked) => updateSetting('autoStartBreaks', checked)}
          />
        </div>

        {/* Auto Start Pomodoros */}
        <div className="flex items-center justify-between">
          <Label className="text-white/90">Auto Start Pomodoros</Label>
          <Switch 
            checked={settings.autoStartPomodoros}
            onCheckedChange={(checked) => updateSetting('autoStartPomodoros', checked)}
          />
        </div>

        {/* Long Break Interval */}
        <div className="flex items-center justify-between">
          <Label className="text-white/90">Long Break interval</Label>
          <div className="w-20">
            <NumberInput 
              value={settings.longBreakInterval} 
              onChange={(value) => updateSetting('longBreakInterval', value)}
              className="bg-white/5 border-white/10 focus:border-primary/50 text-right"
            />
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
