import { Sheet, SheetContent } from "@/components/ui/sheet";
import { DiaryEntry, MoodEntry, DiaryFile } from "@/types/diary.types";
import { DiaryHeader } from "./diary-header";
import { DiaryContentSection } from "./diary-content-section";
import { DiaryMoodSection } from "./diary-mood-section";
import { DiaryTagsSection } from "./diary-tags-section";
import { DiaryActionsSection } from "./diary-actions-section";
import { DiaryFilesSection } from "./diary-files-section";
import { DiaryFooter } from "./diary-footer";

interface DiaryDetailsProps {
  entry: DiaryEntry;
  open: boolean;
  onClose: () => void;
  onToggleFavorite: () => void;
  onRemove: () => void;
  onUpdateContent: (content: string) => void;
  onSetMood: (mood: MoodEntry | null) => void;
  onSetTags: (tags: string[]) => void;
  onAddFile: (file: Omit<DiaryFile, "id" | "addedAt">) => void;
  onRemoveFile: (fileId: string) => void;
  onLinkTask: (taskId: string) => void;
}

export function DiaryDetails({
  entry,
  open,
  onClose,
  onToggleFavorite,
  onRemove,
  onUpdateContent,
  onSetMood,
  onSetTags,
  onAddFile,
  onRemoveFile,
  onLinkTask
}: DiaryDetailsProps) {
  const handleDelete = () => {
    onRemove();
    onClose();
  };

  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <SheetContent className="w-full sm:max-w-md bg-background border-l border-white/10 text-white flex flex-col">
        <div className="flex-1 overflow-y-auto">
          <DiaryHeader
            entry={entry}
            onToggleFavorite={onToggleFavorite}
          />

          <DiaryContentSection
            content={entry.content}
            onUpdateContent={onUpdateContent}
          />

          <DiaryMoodSection
            mood={entry.mood}
            onSetMood={onSetMood}
          />

          <DiaryTagsSection
            tags={entry.tags}
            onSetTags={onSetTags}
          />

          <DiaryFilesSection
            files={entry.files}
            onAddFile={onAddFile}
            onRemoveFile={onRemoveFile}
          />

          <DiaryActionsSection
            entry={entry}
            onLinkTask={onLinkTask}
          />
        </div>

        <DiaryFooter
          createdAt={entry.createdAt}
          updatedAt={entry.updatedAt}
          onDelete={handleDelete}
        />
      </SheetContent>
    </Sheet>
  );
}

export { DiaryDetails as default };
