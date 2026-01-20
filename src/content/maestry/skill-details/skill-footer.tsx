import { DetailFooter } from "@/components/shared/detail-footer";

interface SkillFooterProps {
  createdAt: number;
  onDelete: () => void;
}

export function SkillFooter({
  createdAt,
  onDelete
}: SkillFooterProps) {
  return (
    <DetailFooter
      createdAt={createdAt}
      onDelete={onDelete}
      dateFormat="absolute"
      className="p-4"
    />
  );
}
