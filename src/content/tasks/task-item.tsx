import { useState } from "react";
import { createPortal } from "react-dom";
import { Circle, CheckCircle2, Star, CalendarCheck, CalendarDays, Calendar, Trash2, ChevronLeft } from "lucide-react";
import { Task } from "@/types/task.types";
import { Calendar as CalendarPicker } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { ptBR } from "date-fns/locale";

interface TaskItemProps {
  task: Task;
  onToggleCompleted: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onSetDueDate: (id: string, date: number | null) => void;
  onRemoveTask: (id: string) => void;
  onClick: () => void;
}

interface ContextMenuPosition {
  x: number;
  y: number;
}

export function TaskItem({ task, onToggleCompleted, onToggleFavorite, onSetDueDate, onRemoveTask, onClick }: TaskItemProps) {
  const [contextMenu, setContextMenu] = useState<ContextMenuPosition | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    task.dueDate ? new Date(task.dueDate) : undefined
  );

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ x: e.clientX, y: e.clientY });
  };

  const closeContextMenu = () => {
    setContextMenu(null);
  };

  const handleSetDueToday = () => {
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    onSetDueDate(task.id, today.getTime());
    closeContextMenu();
  };

  const handleSetDueTomorrow = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(23, 59, 59, 999);
    onSetDueDate(task.id, tomorrow.getTime());
    closeContextMenu();
  };

  const handleChooseDate = () => {
    setShowDatePicker(true);
    closeContextMenu();
  };

  const handleDateSave = () => {
    if (selectedDate) {
      onSetDueDate(task.id, selectedDate.getTime());
    }
    setShowDatePicker(false);
  };

  const handleDelete = () => {
    onRemoveTask(task.id);
    closeContextMenu();
  };

  return (
    <>
      <div
        onClick={onClick}
        onContextMenu={handleContextMenu}
        className="flex items-center justify-between px-4 py-3 bg-background/50 border border-white/10 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleCompleted(task.id);
            }}
            className="cursor-pointer text-white/70 hover:text-white transition-colors"
          >
            {task.completed ? (
              <CheckCircle2 className="w-5 h-5 text-primary" />
            ) : (
              <Circle className="w-5 h-5" />
            )}
          </button>

          <div className="flex flex-col">
            <span
              className={`text-white/90 ${
                task.completed ? "line-through text-white/50" : ""
              }`}
            >
              {task.title}
            </span>
            <span className="text-xs text-white/40">{task.category}</span>
          </div>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(task.id);
          }}
          className="cursor-pointer text-white/30 hover:text-yellow-400 transition-colors"
        >
          <Star
            className={`w-5 h-5 ${
              task.favorite ? "fill-yellow-400 text-yellow-400" : ""
            }`}
          />
        </button>
      </div>

      {/* Context Menu */}
      {contextMenu && createPortal(
        <>
          <div
            className="fixed inset-0 z-50"
            onClick={closeContextMenu}
          />
          <div
            className="fixed z-50 min-w-[200px] bg-[#2d2d2d] border border-white/10 rounded-lg shadow-xl py-1 animate-in fade-in-0 zoom-in-95"
            style={{
              left: contextMenu.x,
              top: contextMenu.y,
            }}
          >
            <button
              onClick={handleSetDueToday}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-white/90 hover:bg-white/10 transition-colors cursor-pointer"
            >
              <CalendarCheck className="w-4 h-4 text-white/60" />
              Concluir hoje
            </button>
            <button
              onClick={handleSetDueTomorrow}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-white/90 hover:bg-white/10 transition-colors cursor-pointer"
            >
              <CalendarDays className="w-4 h-4 text-white/60" />
              Concluir amanhã
            </button>
            <button
              onClick={handleChooseDate}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-white/90 hover:bg-white/10 transition-colors cursor-pointer"
            >
              <Calendar className="w-4 h-4 text-white/60" />
              Escolher uma data
            </button>
            
            <div className="my-1 border-t border-white/10" />
            
            <button
              onClick={handleDelete}
              className="w-full flex items-center justify-between px-3 py-2 text-sm text-red-400 hover:bg-white/10 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <Trash2 className="w-4 h-4" />
                Excluir tarefa
              </div>
              <span className="text-xs text-white/40">Delete</span>
            </button>
          </div>
        </>,
        document.body
      )}

      {/* Date Picker Modal */}
      {showDatePicker && createPortal(
        <>
          <div
            className="fixed inset-0 z-50 bg-black/50"
            onClick={() => setShowDatePicker(false)}
          />
          <div className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#1a1d3a] border border-white/10 rounded-lg shadow-xl overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10">
              <button
                onClick={() => setShowDatePicker(false)}
                className="text-white/50 hover:text-white cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-white/80 text-sm font-medium">Escolher data de conclusão</span>
            </div>
            
            <CalendarPicker
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              locale={ptBR}
              initialFocus
            />
              
            <div className="flex gap-2 border-t border-white/10 p-4">
              <Button
                variant="ghost"
                className="flex-1 text-white/70"
                onClick={() => setShowDatePicker(false)}
              >
                Cancelar
              </Button>
              <Button
                className="flex-1 bg-primary/80 hover:bg-primary text-white"
                onClick={handleDateSave}
                disabled={!selectedDate}
              >
                Salvar
              </Button>
            </div>
          </div>
        </>,
        document.body
      )}
    </>
  );
}
