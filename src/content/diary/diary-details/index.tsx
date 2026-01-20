import { DiaryEntry, DiaryEntryType, MoodEntry, DiaryFile } from "@/types/diary.types";
import { DetailContainer, DetailContent } from "@/components/shared/detail-item";
import { DiaryHeader } from "./diary-header";
import { DiaryContentSection } from "./diary-content-section";
import { DiaryMoodSection } from "./diary-mood-section";
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
  onUpdateType: (type: DiaryEntryType) => void;
  onUpdateImage: (image: string | null) => void;
  onUpdateDate: (date: string, time: string | null) => void;
  onSetMood: (mood: MoodEntry | null) => void;
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
  onUpdateType,
  onUpdateImage,
  onUpdateDate,
  onSetMood,
  onAddFile,
  onRemoveFile,
  onLinkTask
}: DiaryDetailsProps) {
  const handleDelete = () => {
    onRemove();
    onClose();
  };

  return (
    <DetailContainer open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DetailContent>
        <DiaryHeader
          entry={entry}
          onToggleFavorite={onToggleFavorite}
          onUpdateType={onUpdateType}
          onUpdateImage={onUpdateImage}
          onUpdateDate={onUpdateDate}
        />

        <DiaryContentSection
          content={entry.content}
          onUpdateContent={onUpdateContent}
        />

        <DiaryMoodSection
          mood={entry.mood}
          onSetMood={onSetMood}
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
      </DetailContent>

      <DiaryFooter
        createdAt={entry.createdAt}
        updatedAt={entry.updatedAt}
        onDelete={handleDelete}
      />
    </DetailContainer>
  );
}

export { DiaryDetails as default };
