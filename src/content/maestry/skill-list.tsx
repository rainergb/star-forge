import { useState, useMemo } from "react";
import { useSkills } from "@/hooks/use-skills";
import { useTasks } from "@/hooks/use-tasks";
import { usePomodoroSessions } from "@/hooks/use-pomodoro-sessions";
import { useToast } from "@/hooks/use-toast";
import { SkillInput } from "./skill-input";
import { SkillListSkeleton } from "./skill-list-skeleton";
import { SkillListContent } from "./skill-list-content";
import { SkillDetails } from "./skill-details";
import { ExportButton } from "@/components/shared/export-button";
import { ImportButton } from "@/components/shared/import-button";
import {
  exportSkills,
  importFromFile,
  validateSkillsImport
} from "@/services/export-service";
import { Skill, SkillColor } from "@/types/skill.types";
import { ArrowUpDown } from "lucide-react";
import { useListLimit } from "@/hooks/use-list-limit";
import { LimitChip, applyLimit } from "@/components/shared/limit-chip";

type SkillSortKey = "default" | "level" | "xp" | "recent" | "stale";
const SKILL_SORT_LABELS: Record<SkillSortKey, string> = {
  default: "Default",
  level: "Highest level",
  xp: "Most XP",
  recent: "Recently worked",
  stale: "Least recent"
};

export function SkillList() {
  const {
    skills,
    isLoading,
    addSkill,
    updateSkill,
    removeSkill,
    getSkillStats,
    importSkills
  } = useSkills();

  const { tasks, setSkills } = useTasks();
  const { sessions } = usePomodoroSessions();
  const { toast } = useToast();

  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [sortKey, setSortKey] = useState<SkillSortKey>("default");
  const { limit, setLimit } = useListLimit("skills");

  // Map skillId → último timestamp em que a skill foi trabalhada (via pomodoro de task vinculada)
  const lastWorkedMap = useMemo(() => {
    const map = new Map<string, number>();
    sessions
      .filter((s) => s.completed && s.mode === "work" && s.taskId)
      .forEach((s) => {
        const task = tasks.find((t) => t.id === s.taskId);
        if (!task?.skillIds?.length) return;
        task.skillIds.forEach((skillId) => {
          const current = map.get(skillId) ?? 0;
          if (s.startedAt > current) map.set(skillId, s.startedAt);
        });
      });
    return map;
  }, [sessions, tasks]);

  const sortedSkills = useMemo(() => {
    if (sortKey === "default") return skills;
    return [...skills].sort((a, b) => {
      if (sortKey === "level") return b.currentLevel - a.currentLevel;
      if (sortKey === "xp") return b.totalTimeSpent - a.totalTimeSpent;
      if (sortKey === "recent") {
        // Mais recente primeiro; skills sem histórico vão pro fim
        const aT = lastWorkedMap.get(a.id) ?? 0;
        const bT = lastWorkedMap.get(b.id) ?? 0;
        return bT - aT;
      }
      if (sortKey === "stale") {
        // Há mais tempo primeiro; skills sem histórico vão pro topo (mais "stale")
        const aT = lastWorkedMap.get(a.id) ?? -Infinity;
        const bT = lastWorkedMap.get(b.id) ?? -Infinity;
        return aT - bT;
      }
      return 0;
    });
  }, [skills, sortKey, lastWorkedMap]);

  const limitedSkills = useMemo(
    () => applyLimit(sortedSkills, limit),
    [sortedSkills, limit]
  );

  const handleAddSkill = (
    name: string,
    options: {
      color: SkillColor;
      description: string | null;
    }
  ) => {
    addSkill(name, options);
  };

  const handleSkillClick = (skill: Skill) => {
    setSelectedSkill(skill);
  };

  const handleSkillDoubleClick = (skill: Skill) => {
    setSelectedSkill(skill);
    setDetailsOpen(true);
  };

  const currentSkill = selectedSkill
    ? skills.find((s) => s.id === selectedSkill.id) || null
    : null;

  const currentSkillStats = currentSkill
    ? getSkillStats(currentSkill.id)
    : null;

  const skillTasks = currentSkill
    ? tasks.filter((t) => t.skillIds.includes(currentSkill.id))
    : [];

  const handleRemoveSkillFromTask = (taskId: string) => {
    if (!currentSkill) return;
    const task = tasks.find((t) => t.id === taskId);
    if (task) {
      const newSkillIds = task.skillIds.filter((id) => id !== currentSkill.id);
      setSkills(taskId, newSkillIds);
    }
  };

  if (isLoading) return <SkillListSkeleton />;

  return (
    <div className="flex flex-col items-center gap-2 w-full max-w-2xl mx-auto">
      <div className="flex gap-2 w-full items-center">
        <SkillInput onAddSkill={handleAddSkill} />
        <ExportButton
          onExport={() => exportSkills(skills)}
          tooltip="Export skills"
        />
        <ImportButton
          onImport={async (file) => {
            const result = await importFromFile(file);
            if (result.success && result.data?.skills) {
              if (validateSkillsImport(result.data.skills)) {
                importSkills(result.data.skills);
                toast({
                  title: "Import successful",
                  description: `${result.data.skills.length} skills imported`
                });
              } else {
                toast({
                  title: "Import failed",
                  description: "Invalid skills format",
                  variant: "destructive"
                });
              }
            } else {
              toast({
                title: "Import failed",
                description: result.message,
                variant: "destructive"
              });
            }
          }}
          tooltip="Import skills"
        />
      </div>

      {/* Sort chips + limit */}
      <div className="flex items-center gap-2 w-full">
        <ArrowUpDown className="w-3.5 h-3.5 text-white/30 shrink-0" />
        {(Object.keys(SKILL_SORT_LABELS) as SkillSortKey[]).map((key) => (
          <button
            key={key}
            onClick={() => setSortKey(key)}
            className={`px-2.5 py-1 rounded-lg text-xs transition-colors cursor-pointer ${
              sortKey === key
                ? "bg-primary/20 text-primary border border-primary/30"
                : "bg-white/5 text-white/40 border border-white/10 hover:text-white/60 hover:bg-white/10"
            }`}
          >
            {SKILL_SORT_LABELS[key]}
          </button>
        ))}
        <div className="ml-auto">
          <LimitChip value={limit} onChange={setLimit} totalCount={sortedSkills.length} />
        </div>
      </div>

      <SkillListContent
        skills={limitedSkills}
        hasActiveFilter={false}
        onRemoveSkill={removeSkill}
        onSkillClick={handleSkillClick}
        onSkillDoubleClick={handleSkillDoubleClick}
      />

      <SkillDetails
        skill={currentSkill}
        stats={currentSkillStats}
        tasks={skillTasks}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        onUpdateSkill={updateSkill}
        onRemoveSkill={removeSkill}
        onRemoveSkillFromTask={handleRemoveSkillFromTask}
      />
    </div>
  );
}
