import { Skill, SkillStats } from "@/types/skill.types";
import { Task } from "@/types/task.types";
import { DetailContainer, DetailContent } from "@/components/shared/detail-item";
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
  onRemoveSkill,
  onRemoveSkillFromTask
}: SkillDetailsProps) {
  const handleDelete = () => {
    if (!skill) return;
    onRemoveSkill(skill.id);
    onOpenChange(false);
  };

  const handleUpdateName = (name: string) => {
    if (!skill) return;
    onUpdateSkill(skill.id, { name });
  };

  const handleUpdateImage = (image: string | null) => {
    if (!skill) return;
    onUpdateSkill(skill.id, { image });
  };

  return (
    <DetailContainer open={open} onOpenChange={onOpenChange}>
      {skill && (
        <>
          <DetailContent>
            <SkillHeader
              skill={skill}
              onUpdateName={handleUpdateName}
              onUpdateImage={handleUpdateImage}
            />

            <SkillActionsSection />

            <SkillStatsSection skill={skill} stats={stats} />

            <SkillTasksSection
              tasks={tasks}
              onRemoveSkillFromTask={onRemoveSkillFromTask}
            />
          </DetailContent>

          <SkillFooter
            createdAt={skill.createdAt}
            onDelete={handleDelete}
          />
        </>
      )}
    </DetailContainer>
  );
}
