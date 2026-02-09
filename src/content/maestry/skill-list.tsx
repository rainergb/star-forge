import { useState } from "react";
import { useSkills } from "@/hooks/use-skills";
import { useTasks } from "@/hooks/use-tasks";
import { useToast } from "@/hooks/use-toast";
import { SkillInput } from "./skill-input";
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

export function SkillList() {
  const {
    skills,
    addSkill,
    updateSkill,
    removeSkill,
    getSkillStats,
    importSkills
  } = useSkills();

  const { tasks, setSkills } = useTasks();
  const { toast } = useToast();

  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

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

      <SkillListContent
        skills={skills}
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
