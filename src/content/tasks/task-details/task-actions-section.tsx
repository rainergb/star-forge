import { useState, useRef } from "react";
import { format } from "date-fns";
import { enUS } from "date-fns/locale";
import { Bell, Calendar, Paperclip, X, Repeat } from "lucide-react";
import { Task, TaskReminder, TaskFile, RepeatType } from "@/types/task.types";
import { ReminderMenu } from "../reminder-menu";
import { DateTimePickerPopover } from "@/components/ui/date-time-picker-popover";
import { TaskFilesList } from "./task-files-preview";

const repeatOptions: { label: string; value: RepeatType }[] = [
  { label: "Daily", value: "daily" },
  { label: "Weekly", value: "weekly" },
  { label: "Monthly", value: "monthly" },
  { label: "Yearly", value: "yearly" }
];

const getRepeatLabel = (repeat: RepeatType): string => {
  if (!repeat) return "Repeat";
  const option = repeatOptions.find((o) => o.value === repeat);
  return option?.label || "Repeat";
};

const ACCEPTED_FILE_TYPES =
  "image/jpeg,image/png,image/gif,image/webp,image/svg+xml,image/bmp,application/pdf";

interface TaskActionsSectionProps {
  task: Task;
  onSetReminder: (taskId: string, reminder: TaskReminder | null) => void;
  onSetDueDate: (taskId: string, dueDate: number | null) => void;
  onSetRepeat: (taskId: string, repeat: RepeatType) => void;
  onAddFile: (taskId: string, file: Omit<TaskFile, "id" | "addedAt">) => void;
  onRemoveFile: (taskId: string, fileId: string) => void;
}

export function TaskActionsSection({
  task,
  onSetReminder,
  onSetDueDate,
  onSetRepeat,
  onAddFile,
  onRemoveFile
}: TaskActionsSectionProps) {
  const [showReminderMenu, setShowReminderMenu] = useState(false);
  const [showDueDatePicker, setShowDueDatePicker] = useState(false);
  const [showRepeatMenu, setShowRepeatMenu] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatDueDate = (timestamp: number): string => {
    return format(new Date(timestamp), "EEE, d MMM, HH:mm", { locale: enUS });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      // Create a data URL for local storage (for small files)
      const reader = new FileReader();
      reader.onload = () => {
        onAddFile(task.id, {
          name: file.name,
          url: reader.result as string
        });
      };
      reader.readAsDataURL(file);
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className="mt-4 border-t border-white/10 pt-4 space-y-1">
      {/* Reminder */}
      <div className="relative">
        <button
          onClick={() => setShowReminderMenu(!showReminderMenu)}
          className="w-full flex items-center gap-3 px-2 py-3 hover:bg-white/5 rounded-lg cursor-pointer text-left"
        >
          <Bell className="w-4 h-4 text-white/50" />
          <span className="text-white/70 text-sm">
            {task.reminder ? task.reminder.label : "Remind me"}
          </span>
          {task.reminder && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSetReminder(task.id, null);
              }}
              className="ml-auto text-white/30 hover:text-white/70"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </button>

        {showReminderMenu && (
          <ReminderMenu
            onSelect={(reminder: TaskReminder) => {
              onSetReminder(task.id, reminder);
              setShowReminderMenu(false);
            }}
            onClose={() => setShowReminderMenu(false)}
          />
        )}
      </div>

      {/* Due Date */}
      <div className="relative">
        <button
          onClick={() => setShowDueDatePicker(!showDueDatePicker)}
          className="w-full flex items-center gap-3 px-2 py-3 hover:bg-white/5 rounded-lg cursor-pointer text-left"
        >
          <Calendar className="w-4 h-4 text-white/50" />
          <span className="text-white/70 text-sm">
            {task.dueDate ? formatDueDate(task.dueDate) : "Add due date"}
          </span>
          {task.dueDate && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSetDueDate(task.id, null);
              }}
              className="ml-auto text-white/30 hover:text-white/70"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </button>

        {showDueDatePicker && (
          <DateTimePickerPopover
            title="Data de conclusão"
            initialDate={task.dueDate ? new Date(task.dueDate) : undefined}
            onSave={(date) => {
              onSetDueDate(task.id, date.getTime());
              setShowDueDatePicker(false);
            }}
            onClose={() => setShowDueDatePicker(false)}
          />
        )}
      </div>

      {/* Repeat */}
      <div className="relative">
        <button
          onClick={() => setShowRepeatMenu(!showRepeatMenu)}
          className="w-full flex items-center gap-3 px-2 py-3 hover:bg-white/5 rounded-lg cursor-pointer text-left"
        >
          <Repeat className="w-4 h-4 text-white/50" />
          <span className="text-white/70 text-sm">
            {getRepeatLabel(task.repeat)}
          </span>
          {task.repeat && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSetRepeat(task.id, null);
              }}
              className="ml-auto text-white/30 hover:text-white/70"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </button>

        {showRepeatMenu && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setShowRepeatMenu(false)}
            />
            <div className="absolute left-0 top-full mt-1 bg-[#1a1d3a] border border-white/10 rounded-lg shadow-xl z-20 overflow-hidden min-w-[180px]">
              <div className="py-1">
                {repeatOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      onSetRepeat(task.id, option.value);
                      setShowRepeatMenu(false);
                    }}
                    className={`w-full px-4 py-2 text-left text-sm transition-colors cursor-pointer ${
                      task.repeat === option.value
                        ? "text-primary bg-primary/10"
                        : "text-white/70 hover:bg-white/5"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Attachment */}
      <div>
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileSelect}
          className="hidden"
          accept={ACCEPTED_FILE_TYPES}
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full flex items-center gap-3 px-2 py-3 hover:bg-white/5 rounded-lg cursor-pointer text-left"
        >
          <Paperclip className="w-4 h-4 text-white/50" />
          <span className="text-white/70 text-sm">Add file</span>
        </button>

        <TaskFilesList
          files={task.files}
          onRemoveFile={(fileId) => onRemoveFile(task.id, fileId)}
        />
      </div>
    </div>
  );
}
