import { Sheet, SheetContent } from "@/components/ui/sheet";
import { CalendarModule } from "@/types/calendar.types";
import { OverviewCalendarView } from "./overview-calendar-view";
import { TasksWeekView } from "./tasks-week-view";
import { ProjectsCalendarView } from "./projects-calendar-view";
import { DiaryCalendarView } from "./diary-calendar-view";
import { MaestryCalendarView } from "./maestry-calendar-view";

interface ExpandedCalendarViewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDate: string;
  onSelectDate: (date: string) => void;
  activeModule: CalendarModule;
}

export function ExpandedCalendarView({
  open,
  onOpenChange,
  selectedDate,
  onSelectDate,
  activeModule
}: ExpandedCalendarViewProps) {
  const renderView = () => {
    switch (activeModule) {
      case "pomodoro":
      case "stats":
        return (
          <OverviewCalendarView
            selectedDate={selectedDate}
            onSelectDate={onSelectDate}
          />
        );
      case "tasks":
        return (
          <TasksWeekView
            selectedDate={selectedDate}
            onSelectDate={onSelectDate}
          />
        );
      case "projects":
        return (
          <ProjectsCalendarView
            selectedDate={selectedDate}
            onSelectDate={onSelectDate}
          />
        );
      case "diary":
        return (
          <DiaryCalendarView
            selectedDate={selectedDate}
            onSelectDate={onSelectDate}
          />
        );
      case "maestry":
        return (
          <MaestryCalendarView
            selectedDate={selectedDate}
            onSelectDate={onSelectDate}
          />
        );
      default:
        return (
          <OverviewCalendarView
            selectedDate={selectedDate}
            onSelectDate={onSelectDate}
          />
        );
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl lg:max-w-4xl bg-background border-l border-white/10 text-white p-0 overflow-hidden">
        {renderView()}
      </SheetContent>
    </Sheet>
  );
}
