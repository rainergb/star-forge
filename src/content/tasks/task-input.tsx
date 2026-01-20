import { useState } from "react";
import { Calendar, Bell, Repeat, Timer, Plus, Minus } from "lucide-react";
import { TaskReminder } from "@/types/task.types";
import { DateTimePickerPopover } from "@/components/ui/date-time-picker-popover";
import { ControlledListInput } from "@/components/shared/list-input";

interface TaskInputProps {
  onAddTask: (
    title: string,
    options: {
      dueDate: number | null;
      reminder: TaskReminder | null;
      estimatedPomodoros: number | null;
    }
  ) => void;
}

const repeatOptions = [
  { label: "Daily", value: "daily" },
  { label: "Weekly", value: "weekly" },
  { label: "Monthly", value: "monthly" },
  { label: "Yearly", value: "yearly" }
];

export function TaskInput({ onAddTask }: TaskInputProps) {
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDueDate, setNewTaskDueDate] = useState<number | null>(null);
  const [newTaskReminder, setNewTaskReminder] = useState<TaskReminder | null>(
    null
  );
  const [newTaskRepeat, setNewTaskRepeat] = useState<string | null>(null);
  const [newTaskPomodoros, setNewTaskPomodoros] = useState<number | null>(null);
  const [showDueDatePicker, setShowDueDatePicker] = useState(false);
  const [showReminderPicker, setShowReminderPicker] = useState(false);
  const [showRepeatMenu, setShowRepeatMenu] = useState(false);
  const [showPomodoroInput, setShowPomodoroInput] = useState(false);

  const handleAddTask = () => {
    if (newTaskTitle.trim()) {
      onAddTask(newTaskTitle.trim(), {
        dueDate: newTaskDueDate,
        reminder: newTaskReminder,
        estimatedPomodoros: newTaskPomodoros
      });
      setNewTaskTitle("");
      setNewTaskDueDate(null);
      setNewTaskReminder(null);
      setNewTaskRepeat(null);
      setNewTaskPomodoros(null);
    }
  };

  const handleDueDateSave = (date: Date) => {
    setNewTaskDueDate(date.getTime());
    setShowDueDatePicker(false);
  };

  const handleReminderSave = (date: Date) => {
    setNewTaskReminder({ date: date.getTime(), label: "Reminder" });
    setShowReminderPicker(false);
  };

  const taskActions = (
    <div className="flex items-center gap-1">
      <button
        onClick={() => setShowDueDatePicker(!showDueDatePicker)}
        className={`p-1.5 rounded-md transition-colors cursor-pointer ${
          newTaskDueDate
            ? "text-primary bg-primary/20"
            : "text-white/40 hover:text-white/70 hover:bg-white/5"
        }`}
        title="Due date"
      >
        <Calendar className="w-4 h-4" />
      </button>
      <button
        onClick={() => setShowReminderPicker(!showReminderPicker)}
        className={`p-1.5 rounded-md transition-colors cursor-pointer ${
          newTaskReminder
            ? "text-primary bg-primary/20"
            : "text-white/40 hover:text-white/70 hover:bg-white/5"
        }`}
        title="Reminder"
      >
        <Bell className="w-4 h-4" />
      </button>
      <button
        onClick={() => setShowRepeatMenu(!showRepeatMenu)}
        className={`p-1.5 rounded-md transition-colors cursor-pointer ${
          newTaskRepeat
            ? "text-primary bg-primary/20"
            : "text-white/40 hover:text-white/70 hover:bg-white/5"
        }`}
        title="Repeat"
      >
        <Repeat className="w-4 h-4" />
      </button>
      <div className="w-px h-4 bg-white/10 mx-1" />
      <button
        onClick={() => setShowPomodoroInput(!showPomodoroInput)}
        className={`p-1.5 rounded-md transition-colors cursor-pointer flex items-center gap-1 ${
          newTaskPomodoros
            ? "text-primary bg-primary/20"
            : "text-white/40 hover:text-white/70 hover:bg-white/5"
        }`}
        title="Estimated pomodoros"
      >
        <Timer className="w-4 h-4" />
        {newTaskPomodoros && (
          <span className="text-xs">{newTaskPomodoros}</span>
        )}
      </button>
    </div>
  );

  const taskPopovers = (
    <>
      {showDueDatePicker && (
        <DateTimePickerPopover
          title="Due date"
          initialDate={newTaskDueDate ? new Date(newTaskDueDate) : undefined}
          onSave={handleDueDateSave}
          onClose={() => setShowDueDatePicker(false)}
        />
      )}

      {showReminderPicker && (
        <DateTimePickerPopover
          title="Reminder"
          initialDate={
            newTaskReminder ? new Date(newTaskReminder.date) : undefined
          }
          onSave={handleReminderSave}
          onClose={() => setShowReminderPicker(false)}
        />
      )}

      {showRepeatMenu && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowRepeatMenu(false)}
          />
          <div className="absolute right-0 top-full mt-1 bg-[#1a1d3a] border border-white/10 rounded-lg shadow-xl z-20 overflow-hidden min-w-40">
            <div className="py-1">
              {repeatOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    setNewTaskRepeat(option.value);
                    setShowRepeatMenu(false);
                  }}
                  className={`w-full px-4 py-2 text-left text-sm transition-colors cursor-pointer ${
                    newTaskRepeat === option.value
                      ? "text-primary bg-primary/10"
                      : "text-white/70 hover:bg-white/5"
                  }`}
                >
                  {option.label}
                </button>
              ))}
              {newTaskRepeat && (
                <button
                  onClick={() => {
                    setNewTaskRepeat(null);
                    setShowRepeatMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-white/5 cursor-pointer border-t border-white/10"
                >
                  Remove repeat
                </button>
              )}
            </div>
          </div>
        </>
      )}

      {showPomodoroInput && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowPomodoroInput(false)}
          />
          <div className="absolute right-0 top-full mt-1 bg-[#1a1d3a] border border-white/10 rounded-lg shadow-xl z-20 overflow-hidden p-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-white/70">Pomodoros:</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    const current = newTaskPomodoros ?? 0;
                    if (current > 1) {
                      setNewTaskPomodoros(current - 1);
                    } else {
                      setNewTaskPomodoros(null);
                    }
                  }}
                  disabled={!newTaskPomodoros}
                  className="h-7 w-7 flex items-center justify-center rounded text-white/50 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="w-8 text-center text-sm text-white/90 font-medium">
                  {newTaskPomodoros ?? "-"}
                </span>
                <button
                  onClick={() => {
                    const current = newTaskPomodoros ?? 0;
                    if (current < 99) {
                      setNewTaskPomodoros(current + 1);
                    }
                  }}
                  className="h-7 w-7 flex items-center justify-center rounded text-white/50 hover:text-white hover:bg-white/10 cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </div>
            {newTaskPomodoros && (
              <button
                onClick={() => {
                  setNewTaskPomodoros(null);
                  setShowPomodoroInput(false);
                }}
                className="w-full mt-2 px-2 py-1 text-xs text-red-400 hover:bg-white/5 rounded cursor-pointer"
              >
                Remove
              </button>
            )}
          </div>
        </>
      )}
    </>
  );

  return (
    <ControlledListInput
      value={newTaskTitle}
      onChange={setNewTaskTitle}
      onSubmit={handleAddTask}
      placeholder="Add new task..."
      actions={taskActions}
      popoverContent={taskPopovers}
    />
  );
}
