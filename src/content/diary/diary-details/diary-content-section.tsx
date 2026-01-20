import { useState, useRef, useEffect, useCallback } from "react";
import { Pencil } from "lucide-react";

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
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustTextareaHeight = useCallback(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 400)}px`;
    }
  }, []);

  useEffect(() => {
    if (isEditing) {
      adjustTextareaHeight();
    }
  }, [isEditing, adjustTextareaHeight]);

  // Sync with external content changes
  useEffect(() => {
    setEditedContent(content);
  }, [content]);

  const handleSave = () => {
    const trimmed = editedContent.trim();
    if (trimmed && trimmed !== content) {
      onUpdateContent(trimmed);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Escape") {
      setEditedContent(content);
      setIsEditing(false);
    }
  };

  return (
    <div className="px-6 py-5 border-b border-white/10">
      {isEditing ? (
        <textarea
          ref={textareaRef}
          value={editedContent}
          onChange={(e) => {
            setEditedContent(e.target.value);
            adjustTextareaHeight();
          }}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-base text-white/90 focus:outline-none focus:border-primary/50 resize-none min-h-[120px] leading-relaxed scrollbar-none"
          style={{ maxHeight: "400px" }}
          autoFocus
          placeholder="Write your thoughts..."
        />
      ) : (
        <div 
          className="group relative cursor-pointer"
          onClick={() => setIsEditing(true)}
        >
          <p className="text-base text-white/90 whitespace-pre-wrap leading-relaxed pr-8">
            {content}
          </p>
          <button
            className="absolute top-0 right-0 p-1.5 rounded-lg text-white/40 opacity-0 group-hover:opacity-100 hover:text-white/70 hover:bg-white/5 transition-all cursor-pointer"
          >
            <Pencil className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
