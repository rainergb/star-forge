import { useState, useRef } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Bell, Calendar, Paperclip, X } from "lucide-react";
import { Task, TaskReminder, TaskFile } from "@/types/task.types";
import { ReminderMenu } from "../reminder-menu";
import { DateTimePickerPopover } from "@/components/ui/date-time-picker-popover";
import { TaskFilesList } from "./task-files-preview";

const ACCEPTED_FILE_TYPES = "image/jpeg,image/png,image/gif,image/webp,image/svg+xml,image/bmp,application/pdf";

interface TaskActionsSectionProps {
  task: Task;
  onSetReminder: (taskId: string, reminder: TaskReminder | null) => void;
  onSetDueDate: (taskId: string, dueDate: number | null) => void;
  onAddFile: (taskId: string, file: Omit<TaskFile, "id" | "addedAt">) => void;
  onRemoveFile: (taskId: string, fileId: string) => void;
}

export function TaskActionsSection({
  task,
  onSetReminder,
  onSetDueDate,
  onAddFile,
  onRemoveFile
}: TaskActionsSectionProps) {
  const [showReminderMenu, setShowReminderMenu] = useState(false);
  const [showDueDatePicker, setShowDueDatePicker] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatDueDate = (timestamp: number): string => {
    return format(new Date(timestamp), "EEE, d MMM, HH:mm", { locale: ptBR });
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
            {task.reminder ? task.reminder.label : "Lembrar-me"}
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
            {task.dueDate ? formatDueDate(task.dueDate) : "Adicionar data de conclusão"}
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
          <span className="text-white/70 text-sm">Adicionar arquivo</span>
        </button>
        
        <TaskFilesList
          files={task.files}
          onRemoveFile={(fileId) => onRemoveFile(task.id, fileId)}
        />
      </div>
    </div>
  );
}
