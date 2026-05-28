import { DetailFooter } from "@/components/shared/detail-footer";

interface SkillFooterProps {
  createdAt: number;
  onDelete: () => void;
  onExport: () => void;
}

export function SkillFooter({
  createdAt,
  onDelete,
  onExport
}: SkillFooterProps) {
  return (
    <DetailFooter
      createdAt={createdAt}
      onDelete={onDelete}
      onExport={onExport}
      dateFormat="absolute"
      className="p-4"
    />
  );
}
