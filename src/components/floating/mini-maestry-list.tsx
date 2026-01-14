import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { FloatingContainer } from "./floating-container";
import { SkillList } from "@/content/maestry/skill-list";
import { useSkills } from "@/hooks/use-skills";
import { useTasks } from "@/hooks/use-tasks";
import {
  Skill,
  SKILL_COLORS,
  getMasteryLevelInfo
} from "@/types/skill.types";
import { WidgetPosition } from "@/types/widget.types";
import { Sparkles, Zap, GripVertical, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface MiniMaestryListProps {
  isVisible: boolean;
  isPinned: boolean;
  position: WidgetPosition;
  onClose: () => void;
  onTogglePin: () => void;
  onPositionChange: (position: WidgetPosition) => void;
  onSelectSkill?: (skill: Skill) => void;
  stackIndex?: number;
}

interface MiniSkillItemProps {
  skill: Skill;
  tasksCount: { total: number; active: number };
  onSelect: (skill: Skill) => void;
}

function MiniSkillItem({ skill, tasksCount, onSelect }: MiniSkillItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: skill.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  };

  const colors = SKILL_COLORS[skill.color];
  const levelInfo = getMasteryLevelInfo(skill.currentLevel);
  const totalHours = Math.floor(skill.totalTimeSpent / 3600);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-2 px-2 py-1.5 rounded-lg",
        "transition-colors duration-150",
        "group cursor-pointer",
        isDragging && "opacity-50 bg-white/10",
        "hover:bg-white/5"
      )}
      onClick={() => onSelect(skill)}
    >
      <button
        {...attributes}
        {...listeners}
        className={cn(
          "touch-none cursor-grab active:cursor-grabbing",
          "text-white/30 hover:text-white/70",
          "opacity-0 group-hover:opacity-100 transition-opacity"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <GripVertical className="h-3.5 w-3.5" />
      </button>

      <div className={cn("p-1.5 rounded", colors.bg)}>
        <Zap className={cn("w-3.5 h-3.5", colors.text)} />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm text-white/90 truncate">{skill.name}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-white/40">{levelInfo.name}</span>
          <span className="text-xs text-white/30 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {totalHours}h
          </span>
          {tasksCount.active > 0 && (
            <span className="text-xs text-white/40">
              {tasksCount.active} tasks
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export function MiniMaestryList({
  isVisible,
  isPinned,
  position,
  onClose,
  onTogglePin,
  onPositionChange,
  onSelectSkill,
  stackIndex
}: MiniMaestryListProps) {
  const { activeSkills } = useSkills();
  const { tasks } = useTasks();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8
      }
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  );

  const getTaskCounts = (skillId: string) => {
    const skillTasks = tasks.filter((t) => t.skillIds.includes(skillId));
    return {
      total: skillTasks.length,
      active: skillTasks.filter((t) => !t.completed).length
    };
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      // Note: reorderSkills would need to be implemented in useSkills if needed
      // For now, skills don't have sortOrder like projects/tasks
    }
  };

  if (!isVisible) return null;

  // Render full SkillList when pinned
  if (isPinned) {
    return (
      <FloatingContainer
        title="Maestry"
        isVisible={isVisible}
        isPinned={isPinned}
        position={position}
        onClose={onClose}
        onTogglePin={onTogglePin}
        onPositionChange={onPositionChange}
        expandedClassName="w-[420px] max-h-[calc(100vh-120px)]"
        stackIndex={stackIndex}
      >
        <div className="flex-1 overflow-y-auto scrollbar-none">
          <SkillList />
        </div>
      </FloatingContainer>
    );
  }

  // Mini version when not pinned
  return (
    <FloatingContainer
      title="Maestry"
      isVisible={isVisible}
      isPinned={isPinned}
      position={position}
      onClose={onClose}
      onTogglePin={onTogglePin}
      onPositionChange={onPositionChange}
      stackIndex={stackIndex}
    >
      {activeSkills.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-white/40">
          <Sparkles className="h-8 w-8 mb-2 opacity-50" />
          <p className="text-xs">No skills tracked</p>
        </div>
      ) : (
        <div className="overflow-y-auto max-h-[340px] scrollbar-none p-2 space-y-0.5">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={activeSkills.map((s) => s.id)}
              strategy={verticalListSortingStrategy}
            >
              {activeSkills.map((skill) => (
                <MiniSkillItem
                  key={skill.id}
                  skill={skill}
                  tasksCount={getTaskCounts(skill.id)}
                  onSelect={(s) => onSelectSkill?.(s)}
                />
              ))}
            </SortableContext>
          </DndContext>
        </div>
      )}
    </FloatingContainer>
  );
}
