import { useState } from "react";
import { Tag, X, Plus } from "lucide-react";

interface DiaryTagsSectionProps {
  tags: string[];
  onSetTags: (tags: string[]) => void;
}

export function DiaryTagsSection({ tags, onSetTags }: DiaryTagsSectionProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newTag, setNewTag] = useState("");

  const handleAddTag = () => {
    const trimmedTag = newTag.trim().toLowerCase().replace(/^#/, "");
    if (trimmedTag && !tags.includes(trimmedTag)) {
      onSetTags([...tags, trimmedTag]);
    }
    setNewTag("");
    setIsAdding(false);
  };

  const handleRemoveTag = (tagToRemove: string) => {
    onSetTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    } else if (e.key === "Escape") {
      setNewTag("");
      setIsAdding(false);
    }
  };

  return (
    <div className="px-6 py-4 border-b border-white/10">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-white/70 flex items-center gap-2">
          <Tag className="w-4 h-4" />
          Tags
        </h3>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="p-1.5 rounded-lg text-white/40 hover:text-white/70 hover:bg-white/5 transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 px-2 py-1 bg-white/5 border border-white/10 rounded-full text-xs text-white/70"
          >
            #{tag}
            <button
              onClick={() => handleRemoveTag(tag)}
              className="p-0.5 rounded-full hover:bg-white/10 text-white/40 hover:text-white/70 transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}

        {isAdding && (
          <div className="inline-flex items-center">
            <span className="text-xs text-white/40">#</span>
            <input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={handleAddTag}
              placeholder="tag name"
              className="w-24 bg-transparent text-xs text-white/90 placeholder-white/30 focus:outline-none"
              autoFocus
            />
          </div>
        )}

        {tags.length === 0 && !isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="text-xs text-white/40 hover:text-white/60 transition-colors"
          >
            + Add tags
          </button>
        )}
      </div>
    </div>
  );
}
