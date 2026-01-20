import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, Sparkles, Clock, Zap } from "lucide-react";
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay } from "date-fns";
import { cn } from "@/lib/utils";
import { useSkills } from "@/hooks/use-skills";
import { usePomodoroSessions } from "@/hooks/use-pomodoro-sessions";
import { SKILL_COLORS, MASTERY_LEVELS } from "@/types/skill.types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";

interface MaestryCalendarViewProps {
  selectedDate: string;
  onSelectDate: (date: string) => void;
}

export function MaestryCalendarView({
  selectedDate,
  onSelectDate
}: MaestryCalendarViewProps) {
  const { skills } = useSkills();
  const { sessions } = usePomodoroSessions();

  const [currentDate, setCurrentDate] = useState(() => {
    const [year, month, day] = selectedDate.split("-").map(Number);
    return new Date(year, month - 1, day);
  });

  const weekStart = startOfWeek(currentDate);
  const weekEnd = endOfWeek(currentDate);
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const formatDateStr = (date: Date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  };

  const goToPrevWeek = () => {
    setCurrentDate(prev => new Date(prev.getTime() - 7 * 24 * 60 * 60 * 1000));
  };

  const goToNextWeek = () => {
    setCurrentDate(prev => new Date(prev.getTime() + 7 * 24 * 60 * 60 * 1000));
  };

  const goToToday = () => {
    const now = new Date();
    setCurrentDate(now);
    onSelectDate(formatDateStr(now));
  };

  // Get skills with weekly practice data
  const skillsWithData = useMemo(() => {
    const activeSkills = skills.filter(s => !s.archived);

    return activeSkills.map(skill => {
      // Get sessions for this skill
      const skillSessions = sessions.filter(s => 
        s.taskTitle?.toLowerCase().includes(skill.name.toLowerCase()) ||
        s.taskId === skill.id
      );

      // Calculate hours to mastery level
      const totalHours = skill.totalTimeSpent / 60;
      const currentLevelInfo = MASTERY_LEVELS.find(l => l.level === skill.currentLevel);
      const nextLevelInfo = MASTERY_LEVELS.find(l => l.level === (skill.currentLevel + 1) as any);
      
      const progressToNext = nextLevelInfo
        ? Math.min(100, ((totalHours - (currentLevelInfo?.minHours || 0)) / 
            ((nextLevelInfo.minHours - (currentLevelInfo?.minHours || 0)) || 1)) * 100)
        : 100;

      // Sessions by day this week
      const sessionsByDay: Record<string, typeof skillSessions> = {};
      weekDays.forEach(day => {
        const dateStr = formatDateStr(day);
        sessionsByDay[dateStr] = skillSessions.filter(s => {
          const sessionDate = new Date(s.startedAt);
          return formatDateStr(sessionDate) === dateStr && s.completed;
        });
      });

      const weekMinutes = Object.values(sessionsByDay).flat().reduce((sum, s) => sum + s.duration, 0);

      return {
        ...skill,
        totalHours,
        currentLevelInfo,
        nextLevelInfo,
        progressToNext,
        sessionsByDay,
        weekMinutes
      };
    });
  }, [skills, sessions, weekDays]);

  // Week summary
  const weekSummary = useMemo(() => {
    const totalMinutes = skillsWithData.reduce((sum, s) => sum + s.weekMinutes, 0);
    const skillsPracticed = skillsWithData.filter(s => s.weekMinutes > 0).length;
    
    return { totalMinutes, skillsPracticed };
  }, [skillsWithData]);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Maestry</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={goToPrevWeek}
              className="p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={goToToday}
              className="px-3 py-1.5 text-sm text-primary hover:bg-primary/10 rounded-lg transition-colors"
            >
              Today
            </button>
            <button
              onClick={goToNextWeek}
              className="p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Week stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/5 rounded-lg p-3">
            <div className="flex items-center gap-2 text-white/60 text-sm mb-1">
              <Clock className="w-4 h-4" />
              <span>Practice Time</span>
            </div>
            <div className="text-2xl font-bold">
              {Math.floor(weekSummary.totalMinutes / 60)}h {weekSummary.totalMinutes % 60}m
            </div>
          </div>
          <div className="bg-white/5 rounded-lg p-3">
            <div className="flex items-center gap-2 text-white/60 text-sm mb-1">
              <Sparkles className="w-4 h-4" />
              <span>Skills Practiced</span>
            </div>
            <div className="text-2xl font-bold">{weekSummary.skillsPracticed}</div>
          </div>
        </div>
      </div>

      {/* Skills list */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {skillsWithData.map(skill => {
            const colors = SKILL_COLORS[skill.color];

            return (
              <div
                key={skill.id}
                className="bg-white/5 rounded-lg overflow-hidden"
              >
                {/* Skill header */}
                <div className="p-4 flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-lg"
                    style={{ backgroundColor: `${colors.solid}20` }}
                  >
                    {skill.icon.type === "emoji" ? skill.icon.value : (
                      <Zap style={{ color: colors.solid }} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate">{skill.name}</h3>
                    <div className="flex items-center gap-2 text-xs text-white/50 mt-0.5">
                      <span style={{ color: colors.solid }}>
                        {skill.currentLevelInfo?.name}
                      </span>
                      <span>•</span>
                      <span>{skill.totalHours.toFixed(1)}h total</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium" style={{ color: colors.solid }}>
                      {skill.weekMinutes > 0 
                        ? `${Math.floor(skill.weekMinutes / 60)}h ${skill.weekMinutes % 60}m`
                        : "—"
                      }
                    </div>
                    <div className="text-xs text-white/40">this week</div>
                  </div>
                </div>

                {/* Progress to next level */}
                <div className="px-4 pb-2">
                  <div className="flex items-center justify-between text-xs text-white/40 mb-1">
                    <span>Progress to {skill.nextLevelInfo?.name || "Max"}</span>
                    <span>{Math.round(skill.progressToNext)}%</span>
                  </div>
                  <Progress 
                    value={skill.progressToNext} 
                    className="h-1.5"
                  />
                </div>

                {/* Week activity */}
                <div className="grid grid-cols-7 border-t border-white/5">
                  {weekDays.map((day, index) => {
                    const dateStr = formatDateStr(day);
                    const daySessions = skill.sessionsByDay[dateStr] || [];
                    const dayMinutes = daySessions.reduce((sum, s) => sum + s.duration, 0);
                    const isSelected = dateStr === selectedDate;
                    const isToday = isSameDay(day, new Date());
                    const hasActivity = dayMinutes > 0;

                    return (
                      <button
                        key={`${skill.id}-${dateStr}`}
                        onClick={() => onSelectDate(dateStr)}
                        className={cn(
                          "p-2 text-center border-r border-white/5 last:border-r-0 transition-colors",
                          isSelected && "bg-primary/10"
                        )}
                      >
                        <div className={cn(
                          "text-[10px] mb-1",
                          isToday ? "text-primary" : "text-white/40"
                        )}>
                          {format(day, "EEE")}
                        </div>
                        <div
                          className={cn(
                            "w-6 h-6 rounded mx-auto flex items-center justify-center text-xs",
                            hasActivity && "font-medium"
                          )}
                          style={{
                            backgroundColor: hasActivity ? `${colors.solid}30` : "transparent",
                            color: hasActivity ? colors.solid : "rgba(255,255,255,0.3)"
                          }}
                        >
                          {hasActivity ? dayMinutes : "—"}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {skillsWithData.length === 0 && (
            <div className="text-center text-white/40 py-12">
              <Sparkles className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No skills yet</p>
              <p className="text-sm mt-1">Add skills to track your mastery journey!</p>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Summary footer */}
      <div className="p-3 border-t border-white/10 bg-white/5">
        <div className="flex items-center justify-between text-sm text-white/60">
          <span>{skillsWithData.length} skills tracked</span>
          <span>
            {format(weekStart, "MMM d")} - {format(weekEnd, "MMM d")}
          </span>
        </div>
      </div>
    </div>
  );
}
