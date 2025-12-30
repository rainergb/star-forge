import { useState } from "react";
import { Plus } from "lucide-react";
import { useTasks } from "@/hooks/use-tasks";
import { TaskItem } from "./task-item";
import { TaskDetails } from "./task-details";
import { Task } from "@/types/task.types";

export function TaskList() {
  const {
    tasks,
    addTask,
    toggleCompleted,
    toggleFavorite,
    updateTask,
    addStep,
    toggleStep,
    removeStep,
    setDueDate,
    setReminder,
    addFile,
    removeFile,
    addNote,
    updateNote,
    removeNote,
    removeTask
  } = useTasks();
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const handleAddTask = () => {
    if (newTaskTitle.trim()) {
      addTask(newTaskTitle.trim());
      setNewTaskTitle("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleAddTask();
    }
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setDetailsOpen(true);
  };

  const sortedTasks = [...tasks].sort((a, b) => {
    if (a.favorite !== b.favorite) return a.favorite ? -1 : 1;
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    return b.createdAt - a.createdAt;
  });

  const currentTask = selectedTask
    ? tasks.find((t) => t.id === selectedTask.id) || null
    : null;

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-2xl mx-auto">
      <div className="w-full flex gap-2">
        <input
          type="text"
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Add a new task..."
          className="flex-1 px-4 py-3 bg-background/50 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-primary/50 transition-colors"
        />
        <button
          onClick={handleAddTask}
          disabled={!newTaskTitle.trim()}
          className="px-4 py-3 bg-primary/20 border border-primary/30 rounded-lg text-white hover:bg-primary/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      <div className="w-full space-y-2 max-h-[60vh] overflow-y-auto pr-2">
        {sortedTasks.length === 0 ? (
          <div className="text-center text-white/40 py-8">
            No tasks yet. Add one above!
          </div>
        ) : (
          sortedTasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onToggleCompleted={toggleCompleted}
              onToggleFavorite={toggleFavorite}
              onSetDueDate={setDueDate}
              onRemoveTask={removeTask}
              onClick={() => handleTaskClick(task)}
            />
          ))
        )}
      </div>

      {tasks.length > 0 && (
        <div className="text-sm text-white/40">
          {tasks.filter((t) => t.completed).length} of {tasks.length} completed
        </div>
      )}

      <TaskDetails
        task={currentTask}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        onToggleCompleted={toggleCompleted}
        onToggleFavorite={toggleFavorite}
        onUpdateTask={updateTask}
        onAddStep={addStep}
        onToggleStep={toggleStep}
        onRemoveStep={removeStep}
        onSetDueDate={setDueDate}
        onSetReminder={setReminder}
        onAddFile={addFile}
        onRemoveFile={removeFile}
        onAddNote={addNote}
        onUpdateNote={updateNote}
        onRemoveNote={removeNote}
        onRemoveTask={removeTask}
      />
    </div>
  );
}
