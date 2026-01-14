import { useState } from "react";
import { format } from "date-fns";
import { enUS } from "date-fns/locale";
import { Plus, Pencil, Trash2, X, Check, MessageSquare } from "lucide-react";
import { TaskNote } from "@/types/task.types";

interface NoteItemProps {
  note: TaskNote;
  onUpdate: (content: string) => void;
  onRemove: () => void;
}

function NoteItem({ note, onUpdate, onRemove }: NoteItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(note.content);

  const handleSave = () => {
    if (editContent.trim()) {
      onUpdate(editContent.trim());
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditContent(note.content);
    setIsEditing(false);
  };

  const formatDate = (timestamp: number) => {
    return format(new Date(timestamp), "d MMM, HH:mm", { locale: enUS });
  };

  if (isEditing) {
    return (
      <div className="bg-white/5 border border-white/10 rounded-lg p-3 space-y-2">
        <textarea
          value={editContent}
          onChange={(e) => setEditContent(e.target.value)}
          className="w-full min-h-[60px] bg-transparent border-none outline-none text-white/70 text-sm resize-none"
          autoFocus
        />
        <div className="flex justify-end gap-2">
          <button
            onClick={handleCancel}
            className="p-1.5 text-white/40 hover:text-white/70 hover:bg-white/5 rounded transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
          <button
            onClick={handleSave}
            className="p-1.5 text-primary hover:text-primary/80 hover:bg-primary/10 rounded transition-colors cursor-pointer"
          >
            <Check className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="group bg-white/5 border border-white/10 rounded-lg p-3">
      <p className="text-white/70 text-sm whitespace-pre-wrap">
        {note.content}
      </p>
      <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5">
        <span className="text-white/30 text-xs">
          {note.updatedAt > note.createdAt ? "Edited " : ""}
          {formatDate(note.updatedAt)}
        </span>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => setIsEditing(true)}
            className="p-1 text-white/40 hover:text-white/70 hover:bg-white/5 rounded transition-colors cursor-pointer"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onRemove}
            className="p-1 text-white/40 hover:text-red-400 hover:bg-red-400/10 rounded transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

interface TaskNotesSectionProps {
  notes: TaskNote[];
  onAddNote: (content: string) => void;
  onUpdateNote: (noteId: string, content: string) => void;
  onRemoveNote: (noteId: string) => void;
}

export function TaskNotesSection({
  notes,
  onAddNote,
  onUpdateNote,
  onRemoveNote
}: TaskNotesSectionProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newContent, setNewContent] = useState("");

  const handleAdd = () => {
    if (newContent.trim()) {
      onAddNote(newContent.trim());
      setNewContent("");
      setIsAdding(false);
    }
  };

  const handleCancel = () => {
    setNewContent("");
    setIsAdding(false);
  };

  const sortedNotes = [...(notes || [])].sort(
    (a, b) => b.createdAt - a.createdAt
  );

  return (
    <div className="mt-4 border-t border-white/10 pt-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-white/50">
          <MessageSquare className="w-4 h-4" />
          <span className="text-sm">Notes</span>
          {notes && notes.length > 0 && (
            <span className="text-xs text-white/30">({notes.length})</span>
          )}
        </div>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="p-1 text-white/40 hover:text-white/70 hover:bg-white/5 rounded transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
          </button>
        )}
      </div>

      {isAdding && (
        <div className="bg-white/5 border border-white/10 rounded-lg p-3 mb-3">
          <textarea
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            placeholder="Write your note..."
            className="w-full min-h-20 bg-transparent border-none outline-none text-white/70 text-sm placeholder-white/40 resize-none"
            autoFocus
          />
          <div className="flex justify-end gap-2 mt-2">
            <button
              onClick={handleCancel}
              className="px-3 py-1.5 text-white/50 hover:text-white/70 text-sm rounded transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleAdd}
              disabled={!newContent.trim()}
              className="px-3 py-1.5 bg-primary/80 hover:bg-primary text-white text-sm rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              Add
            </button>
          </div>
        </div>
      )}

      <div className="space-y-2 max-h-[200px] overflow-y-auto">
        {sortedNotes.length === 0 && !isAdding ? (
          <button
            onClick={() => setIsAdding(true)}
            className="w-full py-4 text-white/30 text-sm hover:text-white/50 hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
          >
            Click to add a note
          </button>
        ) : (
          sortedNotes.map((note) => (
            <NoteItem
              key={note.id}
              note={note}
              onUpdate={(content) => onUpdateNote(note.id, content)}
              onRemove={() => onRemoveNote(note.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}
