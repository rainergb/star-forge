import { useState } from "react";
import { useSkills } from "@/hooks/use-skills";
import { useTasks } from "@/hooks/use-tasks";
import { SkillInput } from "./skill-input";
import { SkillListContent } from "./skill-list-content";
import { SkillDetails } from "./skill-details";
import { Skill, SkillColor } from "@/types/skill.types";

export function SkillList() {
  const {
    skills,
    activeSkills,
    archivedSkills,
    addSkill,
    updateSkill,
    removeSkill,
    toggleArchive,
    getSkillStats
  } = useSkills();

  const { tasks, setSkills } = useTasks();

  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [archivedCollapsed, setArchivedCollapsed] = useState(true);

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

  return (
    <div className="flex flex-col items-center gap-2 w-full max-w-2xl mx-auto">
      <SkillInput onAddSkill={handleAddSkill} />

      <SkillListContent
        skills={skills}
        activeSkills={activeSkills}
        archivedSkills={archivedSkills}
        hasActiveFilter={false}
        archivedCollapsed={archivedCollapsed}
        onToggleArchivedCollapsed={() =>
          setArchivedCollapsed(!archivedCollapsed)
        }
        onRemoveSkill={removeSkill}
        onToggleArchive={toggleArchive}
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
        onToggleArchive={toggleArchive}
        onRemoveSkill={removeSkill}
        onRemoveSkillFromTask={handleRemoveSkillFromTask}
      />
    </div>
  );
}
