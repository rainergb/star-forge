import { DetailFooter } from "@/components/shared/detail-footer";

interface SkillFooterProps {
  createdAt: number;
  archived: boolean;
  onDelete: () => void;
  onToggleArchive: () => void;
}

export function SkillFooter({
  createdAt,
  archived,
  onDelete,
  onToggleArchive
}: SkillFooterProps) {
  return (
    <DetailFooter
      createdAt={createdAt}
      onDelete={onDelete}
      onArchive={onToggleArchive}
      archived={archived}
      dateFormat="absolute"
      className="p-4"
    />
  );
}
