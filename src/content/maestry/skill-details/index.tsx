import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Skill, SkillColor, SkillStats } from "@/types/skill.types";
import { Task } from "@/types/task.types";
import { SkillHeader } from "./skill-header";
import { SkillActionsSection } from "./skill-actions-section";
import { SkillStatsSection } from "./skill-stats-section";
import { SkillTasksSection } from "./skill-tasks-section";
import { SkillFooter } from "./skill-footer";

interface SkillDetailsProps {
  skill: Skill | null;
  stats: SkillStats | null;
  tasks: Task[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateSkill: (
    id: string,
    updates: Partial<Omit<Skill, "id" | "createdAt">>
  ) => void;
  onToggleArchive: (id: string) => void;
  onRemoveSkill: (id: string) => void;
  onRemoveSkillFromTask: (taskId: string) => void;
}

export function SkillDetails({
  skill,
  stats,
  tasks,
  open,
  onOpenChange,
  onUpdateSkill,
  onToggleArchive,
  onRemoveSkill,
  onRemoveSkillFromTask
}: SkillDetailsProps) {
  const handleDelete = () => {
    if (!skill) return;
    onRemoveSkill(skill.id);
    onOpenChange(false);
  };

  const handleArchive = () => {
    if (!skill) return;
    onToggleArchive(skill.id);
  };

  const handleUpdateName = (name: string) => {
    if (!skill) return;
    onUpdateSkill(skill.id, { name });
  };

  const handleUpdateColor = (color: SkillColor) => {
    if (!skill) return;
    onUpdateSkill(skill.id, { color });
  };

  const handleUpdateImage = (image: string | null) => {
    if (!skill) return;
    onUpdateSkill(skill.id, { image });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md bg-background border-l border-white/10 text-white flex flex-col p-0">
        {skill && (
          <>
            <div className="flex-1 overflow-y-auto">
              <SkillHeader
                skill={skill}
                onUpdateName={handleUpdateName}
                onUpdateImage={handleUpdateImage}
              />

              <SkillActionsSection
                color={skill.color}
                onSetColor={handleUpdateColor}
              />

              <SkillStatsSection skill={skill} stats={stats} />

              <SkillTasksSection
                tasks={tasks}
                onRemoveSkillFromTask={onRemoveSkillFromTask}
              />
            </div>

            <SkillFooter
              createdAt={skill.createdAt}
              archived={skill.archived}
              onDelete={handleDelete}
              onToggleArchive={handleArchive}
            />
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
