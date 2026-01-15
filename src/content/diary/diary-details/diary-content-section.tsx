import { useState } from "react";
import { Pencil, Check, X } from "lucide-react";

interface DiaryContentSectionProps {
  content: string;
  onUpdateContent: (content: string) => void;
}

export function DiaryContentSection({
  content,
  onUpdateContent
}: DiaryContentSectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(content);

  const handleSave = () => {
    if (editedContent.trim()) {
      onUpdateContent(editedContent.trim());
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedContent(content);
    setIsEditing(false);
  };

  return (
    <div className="px-6 py-4 border-b border-white/10">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-white/70">Content</h3>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="p-1.5 rounded-lg text-white/40 hover:text-white/70 hover:bg-white/5 transition-colors"
          >
            <Pencil className="w-4 h-4" />
          </button>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-2">
          <textarea
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white/90 focus:outline-none focus:border-primary/50 resize-none min-h-[100px]"
            autoFocus
          />
          <div className="flex items-center gap-2 justify-end">
            <button
              onClick={handleCancel}
              className="p-1.5 rounded-lg text-white/40 hover:text-white/70 hover:bg-white/5 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            <button
              onClick={handleSave}
              className="p-1.5 rounded-lg text-primary hover:bg-primary/10 transition-colors"
            >
              <Check className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <p className="text-sm text-white/90 whitespace-pre-wrap leading-relaxed">
          {content}
        </p>
      )}
    </div>
  );
}
